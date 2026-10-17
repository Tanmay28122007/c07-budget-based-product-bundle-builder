import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

import { buildMasterSystemPrompt, generateComprehensiveHeuristicResponse } from './src/data/websiteKnowledge.ts';

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// AI Assistant Chat & Recommendation API
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { message, history = [], context, model: requestedModel, role, systemInstruction: customInstruction } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A valid message string is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Model selection based on user instructions:
    // - 'gemini-4-argon' for particularly complex tasks
    // - 'gemini-3.8-flash' for general tasks (default)
    // - 'gemini-3.1-flash-lite' for tasks that should happen fast
    const allowedModels = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    const activeModel = allowedModels.includes(requestedModel) ? requestedModel : 'gemini-3.8-flash';

    // Build context summary for the AI
    const activityName = context?.activityName || 'Work from Home Setup';
    const currentBudget = context?.budget ?? 75000;
    const requiredSlots = context?.requiredSlots || [];
    const currentItems = context?.currentItems || {};
    const validation = context?.validation;
    const availableProducts = context?.availableProducts || [];
    const shippingRule = context?.shippingRule;
    const taxRule = context?.taxRule;

    const currentSlotsSummary = requiredSlots.map((slot: any) => {
      const selected = currentItems[slot.id];
      if (selected) {
        return `- Slot "${slot.label}" (${slot.id}, category: ${slot.category}): Selected [${selected.id}] "${selected.name}" @ ₹${selected.price.toLocaleString('en-IN')}${selected.inStock === false ? ' (OUT OF STOCK!)' : ''}`;
      }
      return `- Slot "${slot.label}" (${slot.id}, category: ${slot.category}): [EMPTY / NOT SELECTED]`;
    }).join('\n');

    const violationsSummary = validation?.violations?.length
      ? validation.violations.map((v: any, i: number) => `${i + 1}. [${v.severity.toUpperCase()}] ${v.message}`).join('\n')
      : 'None (bundle satisfies all evaluated compatibility rules).';

    const landedPriceSummary = validation?.landedPrice ? `
- Product Subtotal: ₹${validation.landedPrice.productSubtotal?.toLocaleString('en-IN')}
- Net Shipping: ₹${validation.landedPrice.netShipping?.toLocaleString('en-IN')} (Base: ₹${shippingRule?.baseFee}, Heavy Surcharge: ₹${shippingRule?.heavyItemSurchargePerItem} x ${validation.landedPrice.heavyItemCount || 0}, Free Shipping Threshold: ₹${shippingRule?.freeShippingThreshold?.toLocaleString('en-IN')})
- Tax (${(taxRule?.taxRate * 100) || 18}%): ₹${validation.landedPrice.taxAmount?.toLocaleString('en-IN')}
- Total Landed Price: ₹${validation.landedPrice.landedPrice?.toLocaleString('en-IN')}
- Target Budget: ₹${currentBudget?.toLocaleString('en-IN')}
- Remaining / Difference: ₹${(currentBudget - (validation.landedPrice.landedPrice || 0))?.toLocaleString('en-IN')} (${validation.landedPrice.isOverBudget ? 'OVER BUDGET' : 'WITHIN BUDGET'})
` : 'Not computed yet.';

    const catalogueSummary = availableProducts.slice(0, 35).map((p: any) => {
      const attrs = p.attributes ? Object.entries(p.attributes).map(([k, v]) => `${k}:${typeof v === 'object' ? JSON.stringify(v) : v}`).join(', ') : '';
      return `[${p.id}] ${p.name} | Cat: ${p.category} | ₹${p.price} | Stock: ${p.inStock ? 'In-Stock (' + (p.stockQuantity ?? 'available') + ')' : 'OUT OF STOCK'}${attrs ? ' | Attrs: ' + attrs : ''}`;
    }).join('\n');

    // Build system instruction trained on the whole website
    const systemInstruction = buildMasterSystemPrompt({
      role,
      customInstruction,
      activeTab: context?.activeTab || 'dashboard',
      activityName,
      currentBudget,
      currentSlotsSummary,
      landedPriceSummary,
      violationsSummary,
      catalogueSummary,
      limitingFactor: validation?.limitingFactor
    });

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'bundle-builder'
            }
          }
        });

        // Format multi-turn conversation history for Gemini (maintaining multi-turn context)
        const formattedContents: any[] = [];
        for (const item of history.slice(-20)) {
          formattedContents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.text }]
          });
        }
        // Current user message
        formattedContents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
          model: activeModel,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: activeModel === 'gemini-3.1-flash-lite' ? 0.3 : 0.7
          }
        });

        const replyText = response.text || "I've analyzed your workspace bundle.";
        
        // Extract any action block
        const actionMatch = replyText.match(/```action\s*([\s\S]*?)\s*```/);
        let actionData = null;
        let cleanedReply = replyText;

        if (actionMatch) {
          try {
            actionData = JSON.parse(actionMatch[1]);
            cleanedReply = replyText.replace(/```action\s*[\s\S]*?\s*```/, '').trim();
          } catch (e) {
            console.error('Failed to parse action json:', e);
          }
        }

        return res.json({
          reply: cleanedReply,
          action: actionData,
          model: activeModel
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to local heuristic reasoning engine:', geminiError?.message || geminiError);
        // Fall through to heuristic response below
      }
    }

    // Heuristic Fallback Engine Grounded in the Entire Website
    const fallbackResponse = generateComprehensiveHeuristicResponse(message, context);
    return res.json(fallbackResponse);

  } catch (error: any) {
    console.error('Error handling AI assistant request:', error);
    res.status(500).json({
      error: 'An unexpected error occurred while processing your request.',
      details: error.message
    });
  }
});

// Dev vs Production static handling
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT} (and http://127.0.0.1:${PORT}) [mode: ${isProduction ? 'production' : 'development'}]`);
  });
}

startServer();
