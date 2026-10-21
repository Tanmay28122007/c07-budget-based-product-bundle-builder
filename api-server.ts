import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt to load .env safely in dev/local environments
try {
  dotenv.config({ path: path.join(__dirname, '.env') });
} catch {
  // Ignore in environments where .env is not present (e.g. Vercel)
}

function getGeminiApiKey(): string {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  try {
    const key = dotenv.config({ path: path.join(__dirname, '.env') }).parsed?.GEMINI_API_KEY;
    if (key) return key;
  } catch {}
  return "";
}

const app = express();

// Restore original URL if rewritten by Vercel serverless router
app.use((req, res, next) => {
  // If request arrived via Vercel rewrite parameter (?__subpath=...), restore req.url
  if (req.query && typeof req.query.__subpath === 'string') {
    const rawSubpath = req.query.__subpath;
    const subpath = rawSubpath.startsWith('/') ? rawSubpath : `/${rawSubpath}`;
    delete req.query.__subpath;
    const searchParams = new URLSearchParams(req.query as Record<string, string>).toString();
    req.url = `/api${subpath}${searchParams ? `?${searchParams}` : ''}`;
  } else if (req.url === '/api' || req.url === '/' || req.url === '/api/') {
    // Only restore from forwarded URI if req.url was flattened and forwarded URI has a subpath
    const forwarded = (req.headers['x-forwarded-uri'] || req.headers['x-original-url']) as string | undefined;
    if (forwarded && typeof forwarded === 'string' && forwarded !== '/api' && forwarded !== '/' && forwarded !== '/api/') {
      req.url = forwarded;
    }
  }
  next();
});

// Enable CORS for same-origin and development requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Safely parse JSON body: skip if already parsed by Vercel serverless runtime
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    return next();
  }
  express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    }
  })(req, res, next);
});

import { buildMasterSystemPrompt, generateComprehensiveHeuristicResponse } from './src/data/websiteKnowledge.ts';
import { mapC07Fixture } from './src/data/defaultFixture.ts';
import { generateBundleRecommendations, getPredefinedBaselineBundles } from './src/utils/bundleRecommendations.ts';
import {
  getRazorpayConfig,
  initiatePaymentOrder,
  verifyAndConfirmPayment,
  processRazorpayWebhook,
  getOrderById,
  getAllOrders
} from './src/server/paymentService.ts';

const defaultFixture = mapC07Fixture();

// Helper to filter products on backend
function filterProductsList(products: any[], filters: {
  search?: string;
  category?: string;
  colour?: string;
  size?: string;
  inStock?: string | boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}) {
  let list = [...products];

  // Category filter
  if (filters.category && filters.category !== 'all') {
    const targetCat = filters.category.toLowerCase().trim();
    list = list.filter(p => (p.category || '').toLowerCase() === targetCat);
  }

  // Colour filter
  if (filters.colour && filters.colour !== 'all') {
    const targetColour = filters.colour.toLowerCase().trim();
    list = list.filter(p => (p.colour || '').toLowerCase().includes(targetColour));
  }

  // Size filter
  if (filters.size && filters.size !== 'all') {
    const targetSize = filters.size.toLowerCase().trim();
    list = list.filter(p => (p.size || '').toLowerCase() === targetSize);
  }

  // InStock filter
  if (filters.inStock === 'in_stock' || filters.inStock === 'true' || filters.inStock === true) {
    list = list.filter(p => Boolean(p.inStock) && (p.stockQuantity ?? 1) > 0);
  } else if (filters.inStock === 'out_of_stock' || filters.inStock === 'false' || filters.inStock === false) {
    list = list.filter(p => !p.inStock || (p.stockQuantity ?? 0) <= 0);
  }

  // Min price
  if (typeof filters.minPrice === 'number' && !isNaN(filters.minPrice) && filters.minPrice > 0) {
    list = list.filter(p => p.price >= filters.minPrice!);
  }

  // Max price
  if (typeof filters.maxPrice === 'number' && !isNaN(filters.maxPrice) && filters.maxPrice > 0) {
    list = list.filter(p => p.price <= filters.maxPrice!);
  }

  // Keyword Search
  if (filters.search && typeof filters.search === 'string' && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(p => {
      const name = (p.name || '').toLowerCase();
      const id = (p.id || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const col = (p.colour || '').toLowerCase();
      const sz = (p.size || '').toLowerCase();
      return (
        name.includes(q) ||
        id.includes(q) ||
        cat.includes(q) ||
        brand.includes(q) ||
        desc.includes(q) ||
        col.includes(q) ||
        sz.includes(q)
      );
    });
  }

  // Sorting
  const sort = filters.sort || 'price_asc';
  list.sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
    return (a.id || '').localeCompare(b.id || '');
  });

  return list;
}

// Health check endpoint
app.get(['/api/health', '/health'], (_req, res) => {
  const apiKey = getGeminiApiKey();
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString()
  });
});

// Sanitizer to strip repetitive intro preambles
function cleanAssistantReply(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let cleaned = text;
  // Remove robotic "I have complete knowledge of our entire catalog..." block
  cleaned = cleaned.replace(/I have complete knowledge of our entire catalog[\s\S]*?unit economics\.[\r\n]*/gi, '');
  cleaned = cleaned.replace(/I have complete knowledge of our entire catalog[^\n]*\n*/gi, '');
  // Remove robotic "Right now, you are on the ... workspace/page with a target budget of..." block
  cleaned = cleaned.replace(/Right now, you are on the [\s\S]*?budget headroom\)\.[\r\n]*/gi, '');
  cleaned = cleaned.replace(/Right now, you are on the [^\n]*budget of[^\n]*\n*/gi, '');
  return cleaned.trim();
}

// AI Assistant Chat & Recommendation API
app.post(['/api/ai/assistant', '/ai/assistant'], async (req, res) => {
  try {
    const { message, history = [], context, model: requestedModel, role, systemInstruction: customInstruction } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A valid message string is required.' });
    }

    const apiKey = getGeminiApiKey();

    const supportedModels = [
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3-flash-preview',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-4-argon'
    ];

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

    const allProducts = (availableProducts && availableProducts.length > 0) ? availableProducts : defaultFixture.products;
    const catalogueSummary = allProducts.map((p: any) => {
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

        // Prioritize gemini-flash-lite-latest for ultra-fast, reliable sub-second AI responses
        const candidateModels: string[] = ['gemini-flash-lite-latest'];
        if (requestedModel && supportedModels.includes(requestedModel) && requestedModel !== 'gemini-flash-lite-latest') {
          candidateModels.push(requestedModel);
        }
        if (!candidateModels.includes('gemini-3.1-flash-lite')) {
          candidateModels.push('gemini-3.1-flash-lite');
        }

        for (const modelToTry of candidateModels) {
          try {
            const generatePromise = ai.models.generateContent({
              model: modelToTry,
              contents: formattedContents,
              config: {
                systemInstruction,
                temperature: modelToTry.includes('lite') ? 0.3 : 0.7
              }
            });

            // 5.5s timeout per model so execution stays responsive and under serverless limits
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout waiting for model ${modelToTry}`)), 5500)
            );

            const response = await Promise.race([generatePromise, timeoutPromise]);
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

            if (!actionData) {
              try {
                const heuristicFallback = generateComprehensiveHeuristicResponse(message, context);
                if (heuristicFallback?.action && (heuristicFallback.action.type === 'order_items' || heuristicFallback.action.type === 'add_to_cart')) {
                  actionData = heuristicFallback.action;
                }
              } catch (e) {
                // Ignore fallback extraction error
              }
            }

            cleanedReply = cleanAssistantReply(cleanedReply);

            return res.json({
              reply: cleanedReply,
              action: actionData,
              model: modelToTry
            });
          } catch (modelError: any) {
            console.warn(`Model ${modelToTry} attempt failed: ${modelError?.status || modelError?.message}. Cascading to next candidate...`);
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini client initialization failed, falling back to local heuristic reasoning engine:', geminiError?.message || geminiError);
      }
    }

    // Heuristic Fallback Engine Grounded in the Entire Website (instant response)
    const fallbackResponse = generateComprehensiveHeuristicResponse(message, context);
    if (fallbackResponse && fallbackResponse.reply) {
      fallbackResponse.reply = cleanAssistantReply(fallbackResponse.reply);
    }
    return res.json(fallbackResponse);

  } catch (error: any) {
    console.error('Error handling AI assistant request:', error);
    res.status(500).json({
      error: 'An unexpected error occurred while processing your request.',
      details: error.message
    });
  }
});

// ============================================================================
// BACKEND API: Product Query & Filtering (Supports specific user inputs)
// ============================================================================
app.get(['/api/products', '/products'], (req, res) => {
  try {
    const filters = {
      search: typeof req.query.search === 'string' ? req.query.search : (typeof req.query.q === 'string' ? req.query.q : undefined),
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      colour: typeof req.query.colour === 'string' ? req.query.colour : undefined,
      size: typeof req.query.size === 'string' ? req.query.size : undefined,
      inStock: typeof req.query.inStock === 'string' ? req.query.inStock : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
    };

    const filtered = filterProductsList(defaultFixture.products, filters);
    const availableCategories = Array.from(new Set(defaultFixture.products.map(p => p.category).filter(Boolean)));
    const availableColours = Array.from(new Set(defaultFixture.products.map(p => p.colour).filter(Boolean)));
    const availableSizes = Array.from(new Set(defaultFixture.products.map(p => p.size).filter(Boolean)));
    const prices = defaultFixture.products.map(p => p.price);

    res.json({
      success: true,
      total: defaultFixture.products.length,
      filteredCount: filtered.length,
      products: filtered,
      metadata: {
        availableCategories,
        availableColours,
        availableSizes,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices)
      },
      filtersApplied: filters,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/products/filter', '/products/filter'], (req, res) => {
  try {
    const filters = req.body || {};
    const filtered = filterProductsList(defaultFixture.products, filters);
    const availableCategories = Array.from(new Set(defaultFixture.products.map(p => p.category).filter(Boolean)));
    const availableColours = Array.from(new Set(defaultFixture.products.map(p => p.colour).filter(Boolean)));
    const availableSizes = Array.from(new Set(defaultFixture.products.map(p => p.size).filter(Boolean)));
    const prices = defaultFixture.products.map(p => p.price);

    res.json({
      success: true,
      total: defaultFixture.products.length,
      filteredCount: filtered.length,
      products: filtered,
      metadata: {
        availableCategories,
        availableColours,
        availableSizes,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices)
      },
      filtersApplied: filters,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get(['/api/products/:id', '/products/:id'], (req, res) => {
  const prod = defaultFixture.products.find(p => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (!prod) {
    return res.status(404).json({ success: false, error: `Product '${req.params.id}' not found.` });
  }
  const compatible = defaultFixture.products.filter(p =>
    Array.isArray(prod.compatibleWith) && prod.compatibleWith.includes(p.id)
  );
  res.json({
    success: true,
    product: prod,
    compatibleProducts: compatible
  });
});

// ============================================================================
// BACKEND API: Bundle Generation & Filtering (Supports specific user details)
// ============================================================================
app.post(['/api/bundles/filter', '/bundles/filter'], (req, res) => {
  try {
    const {
      requirements = [],
      budget,
      exactOnly = false,
      search,
      category,
      colour,
      sort
    } = req.body || {};

    // Generate dynamic bundles matching the user's specific product/attribute requirements
    const result = generateBundleRecommendations(
      defaultFixture.products,
      requirements,
      budget,
      exactOnly,
      defaultFixture.shippingRule,
      defaultFixture.taxRule,
      100
    );

    let bundles = result.bundles;

    // Filter by keyword search if provided
    if (search && typeof search === 'string' && search.trim()) {
      let q = search.toLowerCase().trim();
      if (q.includes('coperat') || q.includes('coporat')) {
        q = 'corporate';
      }
      if (q.includes('appliance') || q.includes('applience') || q.includes('apliance')) {
        q = 'appliance';
      }
      bundles = bundles.filter(b => {
        const name = b.name.toLowerCase();
        const tagline = b.tagline.toLowerCase();
        const explanation = b.matchExplanation.toLowerCase();
        const itemNames = b.items.map(it => `${it.product.name} ${it.product.category} ${it.product.colour || ''}`).join(' ').toLowerCase();
        return name.includes(q) || tagline.includes(q) || explanation.includes(q) || itemNames.includes(q);
      });
    }

    // Filter by category if provided
    if (category && category !== 'all') {
      const cat = category.toLowerCase().trim();
      bundles = bundles.filter(b =>
        b.categories.some(c => c.toLowerCase() === cat) ||
        b.items.some(it => it.product.category.toLowerCase() === cat)
      );
    }

    // Filter by colour if provided
    if (colour && colour !== 'all') {
      const col = colour.toLowerCase().trim();
      bundles = bundles.filter(b =>
        b.items.some(it => (it.product.colour || '').toLowerCase().includes(col))
      );
    }

    // Sort bundles
    if (sort === 'price_asc') {
      bundles.sort((a, b) => a.landedPrice - b.landedPrice);
    } else if (sort === 'price_desc') {
      bundles.sort((a, b) => b.landedPrice - a.landedPrice);
    } else if (sort === 'items_asc') {
      bundles.sort((a, b) => a.totalItemCount - b.totalItemCount);
    } else if (sort === 'items_desc') {
      bundles.sort((a, b) => b.totalItemCount - a.totalItemCount);
    }

    res.json({
      success: true,
      total: result.bundles.length,
      filteredCount: bundles.length,
      bundles,
      activeRequirementsSummary: result.activeRequirementsSummary,
      hasUnavailableProduct: result.hasUnavailableProduct,
      unavailableReason: result.unavailableReason,
      isOverBudgetForAll: result.isOverBudgetForAll,
      overBudgetReason: result.overBudgetReason,
      filtersApplied: { requirements, budget, exactOnly, search, category, colour, sort },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get(['/api/bundles', '/bundles'], (req, res) => {
  try {
    const budgetParam = req.query.budget ? Number(req.query.budget) : undefined;
    const baseline = getPredefinedBaselineBundles(
      defaultFixture.products,
      defaultFixture.shippingRule,
      defaultFixture.taxRule,
      budgetParam
    );
    res.json({
      success: true,
      total: baseline.length,
      bundles: baseline,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// BACKEND API: Razorpay Payment Gateway Endpoints
// ============================================================================

// Public payment configuration (never exposes secret keys)
app.get(['/api/payment/config', '/payment/config'], (_req, res) => {
  try {
    const config = getRazorpayConfig();
    res.json({
      success: true,
      keyId: config.keyId,
      currency: config.currency,
      isTestMode: config.isTestMode,
      isConfigured: config.isConfigured
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create Order: Validates items, prices, stock, and creates order
app.post(['/api/payment/create-order', '/payment/create-order'], async (req, res) => {
  try {
    const { items, customer, userId, bundleName } = req.body || {};
    if (!items || !customer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: items and customer details are required.'
      });
    }

    const orderData = await initiatePaymentOrder({
      items,
      customer,
      userId,
      bundleName
    });

    res.json({
      success: true,
      ...orderData
    });
  } catch (err: any) {
    console.error('Error creating payment order:', err.message);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

// Verify Payment: HMAC SHA-256 signature verification & status update
app.post(['/api/payment/verify', '/payment/verify'], (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod } = req.body || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        error: 'Incomplete payment payload: razorpayOrderId, razorpayPaymentId, and razorpaySignature are required.'
      });
    }

    const result = verifyAndConfirmPayment({
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod
    });

    res.json(result);
  } catch (err: any) {
    console.error('Payment verification error:', err.message);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

// Webhook endpoint: handles external asynchronous payment notifications
app.post(['/api/payment/webhook', '/payment/webhook'], (req, res) => {
  try {
    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    const rawBody = (req as any).rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const event = req.body;

    const result = processRazorpayWebhook({
      rawBody,
      signatureHeader: signature,
      event
    });

    res.json({
      status: 'ok',
      ...result
    });
  } catch (err: any) {
    console.error('Webhook processing error:', err.message);
    res.status(400).json({
      status: 'error',
      error: err.message
    });
  }
});

// Get Order Details by internal or Razorpay order ID
app.get(['/api/payment/order/:id', '/payment/order/:id'], (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: `Order '${req.params.id}' not found.` });
  }
  res.json({ success: true, order });
});

// Get All Orders for administrative audit
app.get(['/api/payment/orders', '/payment/orders'], (_req, res) => {
  const orders = getAllOrders();
  res.json({
    success: true,
    total: orders.length,
    orders
  });
});

// Fallback root handler in case Vercel rewrote request to /api or /api/
app.all(['/api', '/api/'], (req, res, next) => {
  if (req.method === 'POST') {
    if (req.body && (req.body.items || req.body.bundleName)) {
      req.url = '/api/payment/create-order';
      return (app as any)._router.handle(req, res, next);
    }
    if (req.body && (req.body.razorpayPaymentId || req.body.razorpaySignature)) {
      req.url = '/api/payment/verify';
      return (app as any)._router.handle(req, res, next);
    }
    if (req.headers['x-razorpay-signature'] || (req.body && req.body.event)) {
      req.url = '/api/payment/webhook';
      return (app as any)._router.handle(req, res, next);
    }
    if (req.body && req.body.message) {
      req.url = '/api/ai/assistant';
      return (app as any)._router.handle(req, res, next);
    }
    if (req.body && (req.body.requirements || req.body.budget)) {
      req.url = '/api/bundles/filter';
      return (app as any)._router.handle(req, res, next);
    }
    if (req.body && (req.body.category || req.body.filters || req.body.search)) {
      req.url = '/api/products/filter';
      return (app as any)._router.handle(req, res, next);
    }
  }

  if (req.method === 'GET') {
    if (req.query && (req.query.search || req.query.category || req.query.colour || req.query.sort)) {
      req.url = '/api/products';
      return (app as any)._router.handle(req, res, next);
    }
    if (req.query && req.query.budget) {
      req.url = '/api/bundles';
      return (app as any)._router.handle(req, res, next);
    }

    return res.json({
      status: 'ok',
      hasApiKey: Boolean(getGeminiApiKey()),
      razorpayConfigured: true,
      message: 'Budget-Based Product Bundle Builder API Service',
      timestamp: new Date().toISOString()
    });
  }
  next();
});

export default app;
export { app };
