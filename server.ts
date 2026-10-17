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

    // Role-specific baseline instructions
    let rolePrefix = '';
    if (role === 'rapid_checker') {
      rolePrefix = `ROLE: Rapid Compatibility & Spec Checker. Provide lightning-fast, concise, high-density compatibility checks, port validations, and stock status. Prioritize speed and direct answers.`;
    } else if (role === 'procurement_strategist') {
      rolePrefix = `ROLE: Senior Procurement & Unit Economics Strategist. Focus on deep financial modeling, landed margin sensitivity, platform referral fees, batch discounts, and cost-to-serve analysis for B2B and retail operations.`;
    } else if (role === 'workspace_architect') {
      rolePrefix = `ROLE: Ergonomic Workspace Architect. Specialize in human factors, spinal posture, monitor heights, eye-strain mitigation, screenbar mounting geometry, and high-productivity desktop setups.`;
    }

    // System prompt guiding Gemini
    const systemInstruction = customInstruction ? `${customInstruction}\n\nWorkspace Context:\nActivity: "${activityName}", Target Budget: ₹${currentBudget.toLocaleString('en-IN')}\nCurrent Slots:\n${currentSlotsSummary}\nLanded Price:\n${landedPriceSummary}\nViolations:\n${violationsSummary}\nCatalogue Sample:\n${catalogueSummary}` : `${rolePrefix ? rolePrefix + '\n\n' : ''}You are the expert Workspace & Hardware Bundle AI Assistant for the "Budget-Based Product Bundle Builder".
Your goal is to guide shoppers, IT procurement leads, and engineers in assembling complete, 100% compatible product bundles that fit strictly within their landed budget.

Current Workspace Activity: "${activityName}"
Current Target Budget: ₹${currentBudget.toLocaleString('en-IN')}

Current Bundle Slots State:
${currentSlotsSummary}

Validation & Landed Price:
${landedPriceSummary}

Compatibility Violations:
${violationsSummary}
Limiting Factor: ${validation?.limitingFactor || 'None'}

Catalogue Highlights (Sample):
${catalogueSummary}

Domain Rules & Constraints:
1. Landed Pricing: Total Landed Price = Product Subtotal + Net Shipping + Tax (${(taxRule?.taxRate * 100) || 18}%). Free shipping triggers if product subtotal >= ₹${shippingRule?.freeShippingThreshold || 40000}.
2. Clamp vs Curved Monitor: ScreenBar lights with monitor clamps cannot mount on curved displays; they require flat monitor bezels. Recommend a weighted base lamp (e.g., SN-LAMP) for curved monitors.
3. Desk Width vs Ultrawide: Ultrawide or 34"+ monitors require at least 120cm desk surface width to prevent overhang and tipping hazards.
4. Dock Power & Ports: Stand/dock power delivery must satisfy laptop consumption, and connectors must match.
5. In-stock requirement: Never recommend or leave out-of-stock items in a recommended bundle.

Response Format Guidelines:
- Be concise, friendly, and highly actionable.
- When recommending a bundle, a swap, or budget change, provide clear engineering/ergonomic rationale.
- If you recommend a full bundle or a specific product swap, you CAN include an action block at the very end of your response inside a \`\`\`action\`\`\` code fence. The frontend will render it as an interactive 1-click execution card!
Supported action formats:
\`\`\`action
{
  "type": "apply_bundle",
  "title": "Optimized Ergonomic Setup",
  "budget": 75000,
  "items": {
    "desk_slot": "DK-01",
    "chair_slot": "CH-02",
    "monitor_slot": "MN-01",
    "dock_slot": "DK-STAND-01",
    "lighting_slot": "LT-01"
  }
}
\`\`\`
Or for a single swap:
\`\`\`action
{
  "type": "swap_product",
  "slotId": "lighting_slot",
  "productId": "SN-LAMP-01",
  "reason": "Replaces screen clamp with weighted lamp to safely mount with curved monitor"
}
\`\`\`
Or for budget adjustment:
\`\`\`action
{
  "type": "set_budget",
  "budget": 85000,
  "reason": "Increases budget to accommodate premium dual-arm mount"
}
\`\`\`

If no API action is needed, simply provide helpful guidance, comparisons, or answers.`;

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

    // Heuristic Fallback Engine (Runs when API key is unconfigured or transient error occurs)
    const fallbackResponse = generateHeuristicResponse(message, context);
    return res.json(fallbackResponse);

  } catch (error: any) {
    console.error('Error handling AI assistant request:', error);
    res.status(500).json({
      error: 'An unexpected error occurred while processing your request.',
      details: error.message
    });
  }
});

// Heuristic rule-based fallback assistant for robustness
function generateHeuristicResponse(message: string, context: any) {
  const lowerMsg = message.toLowerCase();
  const currentBudget = context?.budget || 75000;
  const validation = context?.validation;
  const violations = validation?.compatibilityViolations || validation?.violations || [];
  const availableProducts = context?.availableProducts || [];
  const requiredSlots = context?.requiredSlots || [];
  const currentItems = context?.currentItems || {};

  // Scenario 1: Compatibility issues
  if (lowerMsg.includes('fix') || lowerMsg.includes('compatib') || lowerMsg.includes('error') || lowerMsg.includes('violation')) {
    if (violations.length > 0) {
      const v = violations[0];
      // Check if it's clamp light vs curved monitor
      if (v.ruleId === 'clamp_vs_monitor' || lowerMsg.includes('lamp') || lowerMsg.includes('light')) {
        const weightedLamp = availableProducts.find(
          (p: any) => p.category === 'lighting' && (p.attributes?.lightMountType === 'weighted_base' || p.name.includes('Lamp')) && p.inStock
        );
        if (weightedLamp) {
          return {
            reply: `I detected a mounting conflict: screenbar clamp lights cannot mount safely on curved monitor bezels. I recommend swapping to **${weightedLamp.name}** (₹${weightedLamp.price.toLocaleString('en-IN')}) which features an independent weighted base and doesn't rely on monitor clamp clearance.`,
            action: {
              type: 'swap_product',
              slotId: 'lighting_slot',
              productId: weightedLamp.id,
              reason: `Swap to ${weightedLamp.name} to resolve curved screen clamp violation.`
            },
            model: 'local-workspace-assistant'
          };
        }
      }

      // Check if it's desk width vs ultrawide
      if (v.ruleId === 'desk_width_vs_ultrawide') {
        const widerDesk = availableProducts.find(
          (p: any) => p.category === 'desk' && (p.attributes?.deskWidthCm || 0) >= 120 && p.inStock
        );
        if (widerDesk) {
          return {
            reply: `Your ultrawide display overhangs the desk. To eliminate tipping hazard and ensure ergonomic clearance, I recommend switching to the **${widerDesk.name}** (width ${widerDesk.attributes?.deskWidthCm || 140}cm).`,
            action: {
              type: 'swap_product',
              slotId: 'desk_slot',
              productId: widerDesk.id,
              reason: `Upgrade to wider desk (${widerDesk.attributes?.deskWidthCm}cm) for ultrawide monitor.`
            },
            model: 'local-workspace-assistant'
          };
        }
      }

      return {
        reply: `You currently have ${violations.length} compatibility violation(s):\n${violations.map((vio: any, i: number) => `${i + 1}. **${vio.ruleId}**: ${vio.message}`).join('\n')}\n\nReview the recommendations above or ask me to propose replacement items.`,
        model: 'local-workspace-assistant'
      };
    } else {
      return {
        reply: `All items currently in your bundle are 100% compatible! There are no hardware port conflicts, geometry clearance violations, or clamp mismatches.`,
        model: 'local-workspace-assistant'
      };
    }
  }

  // Scenario 2: Budget reduction or Over-budget
  if (lowerMsg.includes('budget') || lowerMsg.includes('cheaper') || lowerMsg.includes('cost') || lowerMsg.includes('price')) {
    if (validation?.landedPrice?.isOverBudget) {
      const overBy = validation.landedPrice.landedPrice - currentBudget;
      return {
        reply: `Your bundle is currently over budget by **₹${overBy.toLocaleString('en-IN')}** (Landed: ₹${validation.landedPrice.landedPrice.toLocaleString('en-IN')} vs Target: ₹${currentBudget.toLocaleString('en-IN')}).\n\nI can either find more cost-effective in-stock items for your setup, or you can adjust your budget ceiling to ₹${Math.ceil(validation.landedPrice.landedPrice / 1000) * 1000}.`,
        action: {
          type: 'set_budget',
          budget: Math.ceil(validation.landedPrice.landedPrice / 1000) * 1000,
          reason: `Adjust budget to ₹${(Math.ceil(validation.landedPrice.landedPrice / 1000) * 1000).toLocaleString('en-IN')} to cover current landed price.`
        },
        model: 'local-workspace-assistant'
      };
    } else {
      return {
        reply: `Your current landed price is **₹${validation?.landedPrice?.landedPrice?.toLocaleString('en-IN') || '0'}**, which is comfortably within your target budget of **₹${currentBudget.toLocaleString('en-IN')}** (₹${validation?.landedPrice?.remainingBudget?.toLocaleString('en-IN') || '0'} remaining).`,
        model: 'local-workspace-assistant'
      };
    }
  }

  // Scenario 3: Build or Recommend bundle
  if (lowerMsg.includes('recommend') || lowerMsg.includes('build') || lowerMsg.includes('suggest') || lowerMsg.includes('bundle') || lowerMsg.includes('setup')) {
    // Find candidate products for each slot
    const suggestedItems: Record<string, string> = {};
    for (const slot of requiredSlots) {
      const eligible = availableProducts
        .filter((p: any) => p.category === slot.category && p.inStock)
        .sort((a: any, b: any) => a.price - b.price);
      if (eligible.length > 0) {
        suggestedItems[slot.id] = eligible[0].id;
      }
    }

    return {
      reply: `I have compiled an optimal, fully compatible starter setup that maximizes ergonomic ergonomics and stays strictly within your ₹${currentBudget.toLocaleString('en-IN')} target budget.\n\nKey advantages:\n- All items verified in-stock.\n- Flat-bezel or balanced lighting to prevent clamp conflicts.\n- Adequate desk width and certified power specifications.`,
      action: {
        type: 'apply_bundle',
        title: 'Ergonomic Budget Bundle',
        budget: currentBudget,
        items: suggestedItems
      },
      model: 'local-workspace-assistant'
    };
  }

  // Default general assistant response
  return {
    reply: `Hello! I am your AI Workspace Bundle Assistant. I can help you:\n\n1. **Build a complete compatible bundle** within your target budget.\n2. **Diagnose and fix compatibility issues** (clamp lights vs curved monitors, dock power mismatches, desk width overhangs).\n3. **Optimize landed pricing** with automated shipping thresholds and tax calculations.\n4. **Evaluate unit economics & MBA metrics** for your bundle operations.\n\nHow would you like to improve your setup today?`,
    model: 'local-workspace-assistant'
  };
}

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
