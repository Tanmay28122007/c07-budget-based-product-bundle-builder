import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  Brain,
  Sliders,
  RefreshCw,
  Trash2,
  Download,
  Copy,
  Check,
  Package,
  Layers,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Settings2,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  PackagePlus,
  Search,
  Compass,
  ShoppingCart,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  Truck,
  CheckCircle,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatINR } from '../../utils/pricing';
import { getProductImageUrl, getProductImageFallback } from '../../utils/imageUtils';
import { generateComprehensiveHeuristicResponse } from '../../data/websiteKnowledge';

export type ChatbotRole = 'workspace_architect' | 'rapid_checker' | 'procurement_strategist' | 'custom';
export type GeminiModel = 'gemini-3.1-flash-lite' | 'gemini-flash-lite-latest' | 'gemini-3-flash-preview' | 'gemini-3.8-flash' | 'gemini-4-argon';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  model?: string;
  timestamp: string;
  action?: {
    type: 'apply_bundle' | 'swap_product' | 'set_budget' | 'navigate' | 'order_items' | 'add_to_cart' | 'checkout';
    tab?: string;
    title?: string;
    budget?: number;
    items?: Record<string, string> | { id: string; name?: string; price?: number; quantity?: number }[];
    slotId?: string;
    productId?: string;
    subtotal?: number;
    netShipping?: number;
    taxAmount?: number;
    total?: number;
    reason?: string;
  } | null;
  actionApplied?: boolean;
}

const TAB_NAMES: Record<string, string> = {
  catalogue: 'Product Catalogue',
  compare: 'Compare Builder',
  cart: 'Bundle Cart Drawer',
  checkout: 'Secure Checkout',
  profile: 'Customer Profile',
  chat: 'Gemini AI Assistant',
  dashboard: 'Executive Dashboard',
  business: 'Business Insights & Strategy',
  tests: 'Automated Test Suite',
  evidence: 'Project Evidence & Scope Audit',
  settings: 'Settings & Configuration'
};

const ROLE_DEFINITIONS: Record<ChatbotRole, {
  name: string;
  badge: string;
  defaultModel: GeminiModel;
  icon: typeof Bot;
  description: string;
  systemInstruction: string;
  starterPrompts: string[];
}> = {
  workspace_architect: {
    name: 'Sahay Shopping & Setup Consultant',
    badge: 'Direct Orders & Assembly',
    defaultModel: 'gemini-3.1-flash-lite',
    icon: Bot,
    description: 'Expert in ordering products, bundle assembly, human ergonomics, and complete setup recommendations across all 40 products.',
    systemInstruction: 'You are Sahay AI (सहाय AI), the master intelligent Shopping Consultant and Ordering Agent for the Budget-Based Product Bundle Builder. You can directly place orders, manage carts, compute landed costs, and recommend hardware across all 40 products (P01 to P40).',
    starterPrompts: [
      '⚡ Order P26 Ergonomic Vertical Mouse',
      '🎮 Order P27 RGB Mechanical Gaming Keyboard & P34 100W GaN Fast Charger',
      '👕 Order 2 Blue Tshirts (Size L) and 1 Insulated Travel Mug',
      '💳 Proceed to Checkout with my active bundle cart',
      'Give me an overview of the whole website and all 40 products.'
    ]
  },
  rapid_checker: {
    name: 'Rapid Compatibility & Spec Checker',
    badge: 'Fast Tasks',
    defaultModel: 'gemini-3.1-flash-lite',
    icon: Zap,
    description: 'Ultra-fast verification of hardware port compatibility, desk dimensional clearances, power delivery wattage, and current stock.',
    systemInstruction: 'You are a Rapid Hardware Spec Checker. Deliver lightning-fast, high-density, no-fluff answers verifying hardware compatibility, port types, clamp dimensions, power wattage, and stock status. Be concise and direct.',
    starterPrompts: [
      'Quick check: Are all items in my current bundle in stock and compatible?',
      'Which mice and keyboards have USB-C connectors in the catalogue?',
      'Quick order: Buy 1x USB-C Multiport Hub (P09)',
      'Check stock availability for all products in the catalogue.'
    ]
  },
  procurement_strategist: {
    name: 'Procurement & Unit Economics Analyst',
    badge: 'Complex Tasks',
    defaultModel: 'gemini-3.1-flash-lite',
    icon: Brain,
    description: 'Deep financial reasoning covering landed price modeling, shipping surcharge thresholds, platform referral fees, and B2B volume pricing.',
    systemInstruction: 'You are a Senior IT Procurement & Unit Economics Strategist. Analyze landed margins, shipping fee breakpoints, tax implications, platform commission referral models, and basket economics with rigorous quantitative detail.',
    starterPrompts: [
      'Take me to the Business Insights page and explain the MBA unit economics model.',
      'Analyze the landed price breakdown and determine if we qualify for free shipping threshold.',
      'What is the break-even basket threshold and retailer monthly contribution?',
      'Evaluate the unit economics for a ₹5,000 apparel and accessory order.'
    ]
  },
  custom: {
    name: 'Custom Persona / Prompt',
    badge: 'Configurable',
    defaultModel: 'gemini-3.1-flash-lite',
    icon: Settings2,
    description: 'Define your own specialized chatbot persona, custom system instructions, and task parameters.',
    systemInstruction: 'You are a specialized hardware consultant and ordering assistant for budget-conscious corporate IT equipment.',
    starterPrompts: [
      'Give me a complete audit of this project scope and architecture.',
      'Order the developer onboarding bundle under ₹6,000.',
      'Order 1x 4K Ultra HD Streaming Webcam (P37) and 1x Studio Microphone (P36).'
    ]
  }
};

export const GeminiChatbotPage: React.FC = () => {
  const {
    fixture,
    budget,
    setBudget,
    currentItems,
    validation,
    applyBundleRecommendation,
    swapProductById,
    addItemToCart,
    openProductDetails,
    initiateCheckout,
    isCartOpen,
    setIsCartOpen,
    addNotification,
    userProfile,
    activeTab,
    setActiveTab
  } = useApp();

  const [activeRole, setActiveRole] = useState<ChatbotRole>('workspace_architect');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3.1-flash-lite');
  const [customInstruction, setCustomInstruction] = useState<string>(
    ROLE_DEFINITIONS.workspace_architect.systemInstruction
  );
  const [showSystemInstruction, setShowSystemInstruction] = useState(false);
  const [attachWorkspaceContext, setAttachWorkspaceContext] = useState(true);

  // Instant order confirmation modal
  const [orderSuccessModal, setOrderSuccessModal] = useState<{
    orderId: string;
    items: { id: string; name: string; price: number; quantity: number }[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  } | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-chat',
      role: 'assistant',
      text: `👋 Welcome to **Sahay AI (सहाय AI)**, your intelligent shopping assistant!

✨ **You can order products directly through chat or configure your workspace setup:**
• *"Order P26 Ergonomic Vertical Mouse"*
• *"Buy RGB Mechanical Gaming Keyboard and 100W GaN Fast Charger"*
• *"Order 2 Blue Tshirts (Size L) and 1 Insulated Travel Mug"*
• *"Checkout my active bundle cart"*

What would you like to order or configure today?`,
      model: 'gemini-3.1-flash-lite',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleRoleChange = (role: ChatbotRole) => {
    setActiveRole(role);
    setSelectedModel(ROLE_DEFINITIONS[role].defaultModel);
    setCustomInstruction(ROLE_DEFINITIONS[role].systemInstruction);
  };

  // Interactive Guidance Toolkit State
  const [activeToolkitTab, setActiveToolkitTab] = useState<'order' | 'assembly' | 'troubleshoot' | 'catalogue' | null>('order');
  const [targetBudgetInput, setTargetBudgetInput] = useState<number>(budget || 75000);
  const [bundlePriority, setBundlePriority] = useState<'cost_effective' | 'ergonomic_tier1'>('ergonomic_tier1');
  const [selectedCatalogueCategory, setSelectedCatalogueCategory] = useState<string>('all');
  const [selectedProductId, setSelectedProductId] = useState<string>('P26');
  const [orderQuantity, setOrderQuantity] = useState<number>(1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleTriggerQuickOrder = () => {
    const prod = fixture.products.find(p => p.id === selectedProductId) || fixture.products[0];
    if (!prod) return;
    const prompt = `Please order ${orderQuantity}x "${prod.name}" (ID: ${prod.id}, Price: ${formatINR(prod.price)}). Calculate the landed cost and prepare the 1-click order card.`;
    handleSendMessage(prompt);
  };

  const handleTriggerAssemblyGuide = () => {
    const priorityDesc = bundlePriority === 'cost_effective'
      ? 'cost-effectiveness and maximizing budget savings with reliable hardware'
      : 'highest ergonomic grade (Tier-1 lumbar support, 3D adjustable armrests, eye-level monitor height, non-glare asymmetric lighting)';
    const prompt = `Please assemble an optimal, 100% compatible product bundle for the "${fixture.activity.name}" activity with a target landed budget of ${formatINR(targetBudgetInput)}.
Goal: ${priorityDesc}.
Verify that all proposed products are in-stock, confirm compatibility, compute landed pricing with shipping & 18% GST, and provide the 1-click apply action.`;
    handleSendMessage(prompt);
  };

  const handleTriggerTroubleshoot = (violation?: any) => {
    if (violation) {
      const prompt = `Compatibility Troubleshooting:
Conflict Type: ${violation.ruleId}
Rule Details: ${violation.message}
Conflicting Hardware: "${violation.sourceProductName}" (${violation.sourceProductId}) and "${violation.targetProductName || 'setup'}" (${violation.targetProductId || ''}).
Please explain why this conflict exists and propose an in-stock replacement from our catalogue with a 1-click swap action.`;
      handleSendMessage(prompt);
    } else {
      const prompt = `Please perform a complete compatibility troubleshooting inspection on my current bundle (${validation.filledSlotCount} of ${validation.totalSlotCount} slots filled). Check physical clearance, port compatibility, and stock availability.`;
      handleSendMessage(prompt);
    }
  };

  const handleTriggerProductRecommendation = (prod: Product, mode: 'evaluate' | 'compat') => {
    if (mode === 'compat') {
      const prompt = `Hardware Compatibility Verification:
Candidate Item: "${prod.name}" (ID: ${prod.id}, Category: ${prod.category}, Price: ${formatINR(prod.price)}).
Attributes: ${JSON.stringify(prod.attributes || {})}.
Is this product physically, dimensionally, and electrically compatible with my current bundle? Explain any potential bottlenecks or confirmation of safe fit.`;
      handleSendMessage(prompt);
    } else {
      const prompt = `Product Recommendation Analysis:
Product: "${prod.name}" (ID: ${prod.id}, Category: ${prod.category}, Price: ${formatINR(prod.price)}).
Description: ${prod.description}.
Specs: ${JSON.stringify(prod.attributes || {})}.
Please provide an in-depth evaluation for this product based on our current catalogue context, including its key advantages, target user persona, and landed budget impact.`;
      handleSendMessage(prompt);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const text = (textOverride || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textOverride) setInputMessage('');
    setIsLoading(true);

    try {
      let contextPayload = null;
      if (attachWorkspaceContext) {
        const currentItemsSummary: Record<string, any> = {};
        for (const [slotId, prod] of Object.entries(currentItems)) {
          if (prod) {
            currentItemsSummary[slotId] = {
              id: prod.id,
              name: prod.name,
              price: prod.price,
              category: prod.category,
              inStock: prod.inStock,
              stockQuantity: prod.stockQuantity,
              attributes: prod.attributes
            };
          } else {
            currentItemsSummary[slotId] = null;
          }
        }

        const availableProductsSummary = fixture.products.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          inStock: p.inStock,
          stockQuantity: p.stockQuantity,
          attributes: p.attributes,
          incompatibleProductIds: p.incompatibleProductIds
        }));

        contextPayload = {
          activeTab,
          activityName: fixture.activity.name,
          budget,
          requiredSlots: fixture.activity.requiredSlots,
          currentItems: currentItemsSummary,
          validation: {
            isValid: validation.isValid,
            isWithinBudget: validation.isWithinBudget,
            isCompatible: validation.isCompatible,
            isInStock: validation.isInStock,
            isComplete: validation.isComplete,
            violations: validation.compatibilityViolations,
            limitingFactor: validation.limitingFactor,
            landedPrice: validation.landedPrice
          },
          availableProducts: availableProductsSummary,
          shippingRule: fixture.shippingRule,
          taxRule: fixture.taxRule
        };
      }

      const historyPayload = messages.slice(-15).map(m => ({
        role: m.role,
        text: m.text
      }));

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 18000);

      let res: Response;
      try {
        res = await fetch('/api/ai/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: historyPayload,
            context: contextPayload,
            model: selectedModel,
            role: activeRole,
            systemInstruction: customInstruction
          }),
          signal: abortController.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }

      let data: any = null;
      if (res && res.ok) {
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.warn('Failed to parse AI response JSON:', jsonErr);
        }
      }

      // If server returned non-200 (e.g. 500 on Vercel) or empty, fall back to offline intelligence engine
      if (!data || !data.reply) {
        console.warn('API returned non-200 or missing reply. Using robust client-side reasoning engine.');
        data = generateComprehensiveHeuristicResponse(text, contextPayload);
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data?.reply || "I've analyzed your prompt.",
        model: data?.model || selectedModel,
        action: data?.action || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.warn('Network exception during AI chat fetch, activating local intelligence fallback:', err);
      const localData = generateComprehensiveHeuristicResponse(text, contextPayload);
      const botMessage: Message = {
        id: `bot-${Date.now()}-fallback`,
        role: 'assistant',
        text: localData?.reply || `I've analyzed your configuration. What would you like to build or optimize next?`,
        model: localData?.model || 'heuristic-engine',
        action: localData?.action || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAction = (msgId: string, action: Message['action']) => {
    if (!action) return;

    if (action.type === 'order_items') {
      const itemsList = Array.isArray(action.items) ? action.items : [];
      const checkoutItems: { product: Product; quantity: number }[] = [];

      itemsList.forEach((it: any) => {
        const prod = fixture.products.find(p => p.id === it.id) || {
          id: it.id,
          name: it.name || it.id,
          price: it.price || 0,
          category: 'Peripherals',
          inStock: true,
          stockQuantity: 10,
          brand: 'C07 Essentials',
          model: it.id,
          description: it.name || it.id,
          weightKg: 0.5,
          unitCostInr: Math.round((it.price || 0) * 0.6),
          attributes: {},
          incompatibleProductIds: []
        } as Product;

        checkoutItems.push({ product: prod, quantity: it.quantity || 1 });
        addItemToCart(prod);
      });

      const newOrderId = `C07-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      setOrderSuccessModal({
        orderId: newOrderId,
        items: itemsList.map((it: any) => ({
          id: it.id,
          name: it.name || it.id,
          price: it.price || 0,
          quantity: it.quantity || 1
        })),
        subtotal: action.subtotal || 0,
        shipping: action.netShipping ?? 499,
        tax: action.taxAmount || 0,
        total: action.total || 0
      });

      initiateCheckout({
        items: checkoutItems,
        bundleName: action.title || 'Chatbot Direct Order'
      });

      addNotification("Order Booked!", `Order #${newOrderId} confirmed via Sahay AI.`, 'success');
    } else if (action.type === 'add_to_cart') {
      const itemsList = Array.isArray(action.items) ? action.items : [];
      if (itemsList.length > 0) {
        itemsList.forEach((it: any) => {
          const prod = fixture.products.find(p => p.id === it.id);
          if (prod) addItemToCart(prod);
        });
      } else if (action.productId) {
        const prod = fixture.products.find(p => p.id === action.productId);
        if (prod) addItemToCart(prod);
      }
      setIsCartOpen(true);
      addNotification("Added to Cart", action.title || 'Product added to bundle cart.', 'success');
    } else if (action.type === 'checkout') {
      initiateCheckout();
      setActiveTab('checkout');
    } else if (action.type === 'apply_bundle' && action.items && !Array.isArray(action.items)) {
      applyBundleRecommendation(action.items, action.budget);
      setActiveTab('compare');
    } else if (action.type === 'swap_product' && action.slotId && action.productId) {
      swapProductById(action.slotId, action.productId);
      setActiveTab('compare');
    } else if (action.type === 'set_budget' && action.budget) {
      setBudget(action.budget);
    } else if (action.type === 'navigate' && action.tab) {
      if (action.tab === 'cart') {
        setIsCartOpen(true);
      } else {
        setActiveTab(action.tab as any);
      }
    }

    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, actionApplied: true } : m))
    );
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportMarkdown = () => {
    const transcript = messages.map(m => {
      const author = m.role === 'user' ? '### User' : `### Gemini (${m.model || selectedModel})`;
      return `${author} - *${m.timestamp}*\n\n${m.text}\n\n---\n`;
    }).join('\n');

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sahay_chat_transcript_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        text: `Chat reset. I am ready as your **${ROLE_DEFINITIONS[activeRole].name}**. Tell me what you'd like to order or inspect!`,
        model: selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const renderFormatted = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-bold text-[#2C3A2B] text-sm sm:text-base mt-3 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-bold text-[#2C3A2B] text-base sm:text-lg mt-4 mb-1.5">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.substring(2);
        const prodMatch = content.match(/\b(?:\[)?(P(?:0[1-9]|[1-5][0-9]|60))(?:\])?\b/i);
        const bulletProduct = prodMatch
          ? fixture.products.find(p => p.id.toUpperCase() === prodMatch[1].toUpperCase())
          : null;

        return (
          <div key={idx} className="flex items-start gap-2.5 my-1.5 text-stone-800 text-sm">
            {bulletProduct ? (
              <div
                onClick={() => openProductDetails(bulletProduct.id)}
                className="w-9 h-9 rounded-lg bg-white border border-[#E6E1D3] flex items-center justify-center p-0.5 shrink-0 overflow-hidden cursor-pointer hover:border-[#8B5A2B] shadow-2xs transition-all hover:scale-105"
                title={`View ${bulletProduct.name}`}
              >
                <img
                  src={getProductImageUrl(bulletProduct.image, bulletProduct.id)}
                  alt={bulletProduct.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = getProductImageFallback(e.currentTarget.src);
                  }}
                />
              </div>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A2B] mt-2 shrink-0" />
            )}
            <div className="flex-1 leading-relaxed">
              {renderInlineMarkdown(content)}
            </div>
          </div>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, '');
        const prodMatch = content.match(/\b(?:\[)?(P(?:0[1-9]|[1-5][0-9]|60))(?:\])?\b/i);
        const itemProduct = prodMatch
          ? fixture.products.find(p => p.id.toUpperCase() === prodMatch[1].toUpperCase())
          : null;

        return (
          <div key={idx} className="flex items-start gap-2.5 my-2.5">
            <span className="font-mono font-bold text-xs text-[#8B5A2B] bg-[#F4F1EA] w-6 h-6 flex items-center justify-center rounded-lg shrink-0 border border-[#E6E1D3] mt-0.5 shadow-2xs">
              {line.match(/^\d+/)?.[0]}
            </span>
            {itemProduct && (
              <div
                onClick={() => openProductDetails(itemProduct.id)}
                className="w-11 h-11 rounded-xl bg-white border border-[#E6E1D3] flex items-center justify-center p-1 shrink-0 overflow-hidden cursor-pointer hover:border-[#8B5A2B] hover:shadow-xs transition-all hover:scale-105"
                title={`View ${itemProduct.name}`}
              >
                <img
                  src={getProductImageUrl(itemProduct.image, itemProduct.id)}
                  alt={itemProduct.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = getProductImageFallback(e.currentTarget.src);
                  }}
                />
              </div>
            )}
            <div className="flex-1 leading-relaxed text-sm font-semibold text-stone-900">
              {renderInlineMarkdown(content)}
            </div>
          </div>
        );
      }
      if (line.startsWith('---')) {
        return <hr key={idx} className="my-3 border-[#E6E1D3]" />;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-[#3A3A2C] my-1 leading-relaxed text-sm">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (str: string) => {
    const parts = [];
    let remaining = str;
    let keyIdx = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const codeMatch = remaining.match(/`([^`]+)`/);
      const prodMatch = remaining.match(/\[(P(?:0[1-9]|[1-5][0-9]|60))\]|\b(P(?:0[1-9]|[1-5][0-9]|60))\b/i);

      const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : -1;
      const codeIdx = codeMatch ? remaining.indexOf(codeMatch[0]) : -1;
      const prodIdx = prodMatch ? remaining.indexOf(prodMatch[0]) : -1;

      if (boldIdx === -1 && codeIdx === -1 && prodIdx === -1) {
        parts.push(<span key={keyIdx++}>{remaining}</span>);
        break;
      }

      if (boldIdx !== -1 && (codeIdx === -1 || boldIdx < codeIdx) && (prodIdx === -1 || boldIdx < prodIdx)) {
        if (boldIdx > 0) {
          parts.push(<span key={keyIdx++}>{remaining.substring(0, boldIdx)}</span>);
        }
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-[#2C3A2B]">
            {boldMatch![1]}
          </strong>
        );
        remaining = remaining.substring(boldIdx + boldMatch![0].length);
      } else if (codeIdx !== -1 && (prodIdx === -1 || codeIdx < prodIdx)) {
        if (codeIdx > 0) {
          parts.push(<span key={keyIdx++}>{remaining.substring(0, codeIdx)}</span>);
        }
        parts.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded-md bg-[#F4F1EA] font-mono text-xs text-[#2C3A2B] border border-[#E6E1D3]">
            {codeMatch![1]}
          </code>
        );
        remaining = remaining.substring(codeIdx + codeMatch![0].length);
      } else if (prodIdx !== -1) {
        if (prodIdx > 0) {
          parts.push(<span key={keyIdx++}>{remaining.substring(0, prodIdx)}</span>);
        }
        const prodId = (prodMatch![1] || prodMatch![2]).toUpperCase();
        const product = fixture.products.find(p => p.id === prodId);
        parts.push(
          <span
            key={keyIdx++}
            onClick={() => product && openProductDetails(product.id)}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-[#F4F1EA] hover:bg-[#EAE5D9] text-[#2C3A2B] border border-[#E6E1D3] font-mono font-bold text-xs cursor-pointer shadow-2xs transition-colors"
            title={product ? `${product.name} (Click for specs)` : prodId}
          >
            {product && (
              <img
                src={getProductImageUrl(product.image, product.id)}
                alt=""
                className="w-3.5 h-3.5 rounded object-contain shrink-0"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <span>{prodId}</span>
          </span>
        );
        remaining = remaining.substring(prodIdx + prodMatch![0].length);
      }
    }
    return parts;
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-white border border-[#E6E1D3] rounded-[24px] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#2C3A2B] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <Bot className="w-5 h-5 text-[#E6C687]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl font-bold text-[#2C3A2B] tracking-tight">
                  Sahay AI (सहाय AI) — Shopping & Setup Agent
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Sparkles className="w-2.5 h-2.5" />
                  Order Anything via Chat
                </span>
              </div>
              <p className="text-xs text-[#5A5A40] mt-1 leading-relaxed">
                Trained on the complete platform & all 40 products. Place orders, calculate landed prices, and configure bundles through multi-turn conversation.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                initiateCheckout();
                setActiveTab('checkout');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#1E281D] rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Open secure checkout page"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#E6C687]" />
              <span>Checkout</span>
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C2C1E] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="Open Bundle Cart drawer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Cart ({validation.filledSlotCount})</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C2C1E] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="Export chat transcript as Markdown"
            >
              <Download className="w-3.5 h-3.5 text-[#8B8B7A]" />
              <span>Export</span>
            </button>
            <button
              onClick={handleClearChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C2C1E] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="Clear chat history"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#8B8B7A]" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Role Selector Strip */}
        <div className="mt-5 pt-4 border-t border-[#E6E1D3] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {(Object.keys(ROLE_DEFINITIONS) as ChatbotRole[]).map(roleKey => {
            const r = ROLE_DEFINITIONS[roleKey];
            const Icon = r.icon;
            const isSelected = activeRole === roleKey;
            return (
              <button
                key={roleKey}
                onClick={() => handleRoleChange(roleKey)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FDFBF7] border-[#2C3A2B] ring-1 ring-[#2C3A2B] shadow-2xs'
                    : 'bg-[#F4F1EA]/60 border-[#E6E1D3] hover:bg-[#F4F1EA]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#2C3A2B]">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#8B5A2B]' : 'text-[#8B8B7A]'}`} />
                    <span className="truncate">{r.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="text-[#8B8B7A] font-medium">{r.badge}</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-white text-[#5A5A40] border border-[#E6E1D3]">
                    {r.defaultModel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Configuration Bar: Model Selector, System Instruction, Context Toggle */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 font-medium">
              <Brain className="w-3.5 h-3.5 text-[#2C3A2B]" />
              <span className="text-[11px] text-[#5A5A40]">Model:</span>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value as GeminiModel)}
                className="bg-transparent text-xs font-semibold text-[#2C3A2B] focus:outline-none cursor-pointer"
              >
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast & Responsive)</option>
                <option value="gemini-flash-lite-latest">gemini-flash-lite-latest (Ultra Low Latency)</option>
                <option value="gemini-3-flash-preview">gemini-3-flash-preview (High Accuracy)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (Standard)</option>
                <option value="gemini-4-argon">gemini-4-argon (Analytical)</option>
              </select>
            </div>

            <button
              onClick={() => setShowSystemInstruction(prev => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-stone-500" />
              <span>Role System Instruction</span>
              {showSystemInstruction ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>
          </div>

          {/* Context Sync Toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={attachWorkspaceContext}
                onChange={e => setAttachWorkspaceContext(e.target.checked)}
                className="rounded border-[#E6E1D3] text-[#2C3A2B] focus:ring-[#2C3A2B] h-3.5 w-3.5"
              />
              <span className="text-[#5A5A40] font-medium text-xs">
                Sync Workspace Context
              </span>
            </label>
            {attachWorkspaceContext && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#A3B18A]/25 text-[#2C3A2B] border border-[#A3B18A]/40">
                ₹{budget.toLocaleString('en-IN')} Budget ({validation.filledSlotCount} items in cart)
              </span>
            )}
          </div>
        </div>

        {/* Collapsible System Instruction Editor */}
        {showSystemInstruction && (
          <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-700" />
                <span>Active Role System Instruction</span>
              </div>
              <button
                onClick={() => setCustomInstruction(ROLE_DEFINITIONS[activeRole].systemInstruction)}
                className="text-[11px] text-indigo-700 hover:underline flex items-center gap-1 font-normal cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Default
              </button>
            </div>
            <textarea
              rows={3}
              value={customInstruction}
              onChange={e => setCustomInstruction(e.target.value)}
              className="w-full text-xs font-mono p-2 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
            />
          </div>
        )}
      </div>

      {/* Interactive Guidance Toolkit Strip */}
      <div className="bg-[#FDFBF7] border border-[#E6E1D3] rounded-[24px] p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E1D3] pb-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
            <span className="font-semibold text-[#2C3A2B]">Quick Action & Ordering Toolkit:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveToolkitTab(activeToolkitTab === 'order' ? null : 'order')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeToolkitTab === 'order'
                  ? 'bg-[#2C3A2B] text-white font-semibold shadow-2xs'
                  : 'text-[#5A5A40] hover:text-[#2C2C1E]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#E6C687]" />
              <span>⚡ Order Any Item</span>
            </button>

            <button
              onClick={() => setActiveToolkitTab(activeToolkitTab === 'assembly' ? null : 'assembly')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeToolkitTab === 'assembly'
                  ? 'bg-white text-[#2C3A2B] font-semibold shadow-2xs'
                  : 'text-[#5A5A40] hover:text-[#2C2C1E]'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#8B5A2B]" />
              <span>Bundle Assembly</span>
            </button>

            <button
              onClick={() => setActiveToolkitTab(activeToolkitTab === 'troubleshoot' ? null : 'troubleshoot')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeToolkitTab === 'troubleshoot'
                  ? 'bg-white text-[#2C3A2B] font-semibold shadow-2xs'
                  : 'text-[#5A5A40] hover:text-[#2C2C1E]'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${validation.compatibilityViolations.length > 0 ? 'text-amber-600' : 'text-[#8B8B7A]'}`} />
              <span>Compatibility</span>
              {validation.compatibilityViolations.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-bold">
                  {validation.compatibilityViolations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveToolkitTab(activeToolkitTab === 'catalogue' ? null : 'catalogue')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeToolkitTab === 'catalogue'
                  ? 'bg-white text-[#2C3A2B] font-semibold shadow-2xs'
                  : 'text-[#5A5A40] hover:text-[#2C2C1E]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#8B5A2B]" />
              <span>Catalogue</span>
            </button>
          </div>
        </div>

        {/* Tab 0: Direct Quick Order */}
        {activeToolkitTab === 'order' && (
          <div className="pt-1 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-6 space-y-1">
              <label className="text-[11px] font-semibold text-[#2C3A2B] block">
                Select Any Product from Catalogue (40 Items)
              </label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-medium border border-[#E6E1D3] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#2C3A2B] bg-white text-[#2C3A2B] cursor-pointer"
              >
                {fixture.products.map(p => (
                  <option key={p.id} value={p.id} disabled={!p.inStock}>
                    [{p.id}] {p.name} — {formatINR(p.price)} ({p.category}) {!p.inStock ? '[OUT OF STOCK]' : `(${p.stockQuantity ?? 10} in stock)`}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-semibold text-[#2C3A2B] block">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={orderQuantity}
                onChange={e => setOrderQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold border border-[#E6E1D3] rounded-lg bg-white text-[#2C3A2B] text-center"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-2 pt-4 sm:pt-0">
              <button
                disabled={isLoading}
                onClick={handleTriggerQuickOrder}
                className="flex-1 py-2 px-3 rounded-xl bg-[#2C3A2B] hover:bg-[#1E281D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E6C687]" />
                <span>Order via AI</span>
              </button>
              <button
                onClick={() => {
                  const prod = fixture.products.find(p => p.id === selectedProductId);
                  if (prod) {
                    for (let i = 0; i < orderQuantity; i++) {
                      addItemToCart(prod);
                    }
                    setIsCartOpen(true);
                  }
                }}
                className="py-2 px-3 rounded-xl bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] text-xs font-semibold flex items-center justify-center gap-1 shadow-2xs cursor-pointer transition-colors"
                title="Add directly to cart"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Cart</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Bundle Assembly Guidance */}
        {activeToolkitTab === 'assembly' && (
          <div className="pt-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#2C3A2B] block">
                Target Landed Budget
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="1000"
                  min="2000"
                  max="300000"
                  value={targetBudgetInput}
                  onChange={e => setTargetBudgetInput(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold border border-[#E6E1D3] rounded-lg bg-white text-[#2C3A2B] focus:outline-hidden focus:ring-1 focus:ring-[#2C3A2B]"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                {[5000, 10000, 25000, 50000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setTargetBudgetInput(amt)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F5EC] hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] cursor-pointer"
                  >
                    ₹{(amt / 1000)}k
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#2C3A2B] block">
                Assembly Strategy
              </label>
              <select
                value={bundlePriority}
                onChange={e => setBundlePriority(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs font-medium border border-[#E6E1D3] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#2C3A2B] bg-white text-[#2C3A2B] cursor-pointer"
              >
                <option value="ergonomic_tier1">High-Efficiency Ergonomic Setup</option>
                <option value="cost_effective">Cost-Effective Maximum Savings</option>
              </select>
            </div>

            <div className="flex flex-col justify-end h-full">
              <button
                disabled={isLoading}
                onClick={handleTriggerAssemblyGuide}
                className="w-full py-2.5 px-3 rounded-xl bg-[#2C3A2B] hover:bg-[#3A4D39] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5F5EC]" />
                <span>Ask Gemini to Assemble</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Compatibility Troubleshooting */}
        {activeToolkitTab === 'troubleshoot' && (
          <div className="pt-1 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2C3A2B]">
                Workspace Compatibility Diagnostics:
              </span>
              <button
                disabled={isLoading}
                onClick={() => handleTriggerTroubleshoot()}
                className="text-[11px] text-[#8B5A2B] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Run Comprehensive Audit
              </button>
            </div>

            {validation.compatibilityViolations.length === 0 ? (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-950 font-medium">
                    All currently selected items satisfy physical dimensions and port rules.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {validation.compatibilityViolations.map((v, i) => (
                  <div
                    key={i}
                    className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-rose-950 font-mono text-[11px]">
                          [{v.ruleId.toUpperCase()}]
                        </div>
                        <p className="text-rose-900 mt-0.5">{v.message}</p>
                      </div>
                    </div>
                    <button
                      disabled={isLoading}
                      onClick={() => handleTriggerTroubleshoot(v)}
                      className="px-3 py-1.5 bg-white hover:bg-rose-100/50 text-rose-900 font-semibold text-xs rounded-lg border border-rose-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                    >
                      Resolve with Gemini
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Catalogue Item Evaluation */}
        {activeToolkitTab === 'catalogue' && (
          <div className="pt-1 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#2C3A2B] block">
                Choose Item to Inspect
              </label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-medium border border-[#E6E1D3] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#2C3A2B] bg-white text-[#2C3A2B] cursor-pointer"
              >
                {fixture.products.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.id}] {p.name} — {formatINR(p.price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-4 md:pt-0">
              <button
                disabled={!selectedProductId || isLoading}
                onClick={() => {
                  const prod = fixture.products.find(p => p.id === selectedProductId);
                  if (prod) handleTriggerProductRecommendation(prod, 'evaluate');
                }}
                className="flex-1 py-2 px-2.5 bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] font-semibold text-xs rounded-lg border border-[#E6E1D3] shadow-2xs transition-colors cursor-pointer"
              >
                Evaluate Item
              </button>
              <button
                disabled={!selectedProductId || isLoading}
                onClick={() => {
                  const prod = fixture.products.find(p => p.id === selectedProductId);
                  if (prod) handleTriggerProductRecommendation(prod, 'compat');
                }}
                className="flex-1 py-2 px-2.5 bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] font-semibold text-xs rounded-lg border border-[#E6E1D3] shadow-2xs transition-colors cursor-pointer"
              >
                Verify Fit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Conversation Container */}
      <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-sm flex flex-col min-h-[560px]">

        {/* Scrollable Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 max-h-[520px]">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#2C3A2B] text-white shrink-0 flex items-center justify-center shadow-xs">
                    <Bot className="w-4 h-4 text-[#E6C687]" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-2xs ${
                    isUser
                      ? 'bg-[#2C3A2B] text-white rounded-tr-xs'
                      : 'bg-[#FDFBF7] border border-[#E6E1D3] rounded-tl-xs'
                  }`}
                >
                  {/* Message Meta Header */}
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-current/10">
                    <span className={`font-semibold text-[11px] ${isUser ? 'text-emerald-200' : 'text-[#8B5A2B]'}`}>
                      {isUser ? 'You' : 'Sahay AI (सहाय AI)'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${isUser ? 'text-emerald-200' : 'text-[#8B8B7A]'}`}>
                        {msg.timestamp}
                      </span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="text-stone-400 hover:text-stone-600 transition-colors p-0.5 cursor-pointer"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className={isUser ? 'text-white text-sm' : 'text-[#2C2C1E] text-sm'}>
                    {isUser ? (
                      <p className="leading-relaxed whitespace-pre-wrap text-sm">{msg.text}</p>
                    ) : (
                      <div className="space-y-1.5 text-sm">{renderFormatted(msg.text)}</div>
                    )}
                  </div>

                  {/* Interactive Action Card if returned by Gemini */}
                  {!isUser && msg.action && (
                    <div className="mt-3 pt-3 border-t border-[#E6E1D3]">

                      {/* 1. DIRECT ORDER ACTION CARD */}
                      {msg.action.type === 'order_items' && (
                        <div className="p-4 bg-white border-2 border-emerald-600/30 rounded-2xl shadow-sm space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D3]">
                            <div className="flex items-center gap-2 font-bold text-sm text-[#2C3A2B]">
                              <ShoppingBag className="w-4 h-4 text-emerald-700" />
                              <span>{msg.action.title || 'Direct Order Prepared'}</span>
                            </div>
                            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Landed Total: {formatINR(msg.action.total || 0)}
                            </span>
                          </div>

                          {/* Line Items List */}
                          {Array.isArray(msg.action.items) && msg.action.items.length > 0 && (
                            <div className="space-y-1.5">
                              {msg.action.items.map((it: any, i: number) => {
                                const prod = fixture.products.find(p => p.id === it.id);
                                return (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between p-2 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3]"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-lg bg-white border border-[#E6E1D3] overflow-hidden flex items-center justify-center shrink-0">
                                        <img
                                          src={getProductImageUrl(prod?.image, it.id)}
                                          alt={it.name || it.id}
                                          className="w-full h-full object-contain"
                                          onError={e => {
                                            (e.currentTarget as HTMLElement).style.display = 'none';
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <div className="font-semibold text-xs text-[#2C3A2B]">{it.name || it.id}</div>
                                        <div className="text-[10px] text-[#5A5A40]">
                                          Qty: {it.quantity || 1} · Unit: {formatINR(it.price || prod?.price || 0)}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="font-mono font-bold text-xs text-[#2C3A2B]">
                                      {formatINR((it.price || prod?.price || 0) * (it.quantity || 1))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Landed Pricing Mini Breakdown */}
                          <div className="p-2.5 rounded-xl bg-[#F7F4EC] text-[11px] space-y-1">
                            <div className="flex justify-between text-[#5A5A40]">
                              <span>Subtotal</span>
                              <span className="font-mono font-medium">{formatINR(msg.action.subtotal || 0)}</span>
                            </div>
                            <div className="flex justify-between text-[#5A5A40]">
                              <span>Net Shipping & Logistics</span>
                              <span className="font-mono font-medium">
                                {(msg.action.netShipping ?? 499) === 0 ? 'FREE' : formatINR(msg.action.netShipping ?? 499)}
                              </span>
                            </div>
                            <div className="flex justify-between text-[#5A5A40]">
                              <span>GST Tax (18%)</span>
                              <span className="font-mono font-medium">{formatINR(msg.action.taxAmount || 0)}</span>
                            </div>
                            <div className="pt-1 border-t border-[#E6E1D3] flex justify-between font-bold text-xs text-[#2C3A2B]">
                              <span>Final Landed Price</span>
                              <span className="font-mono text-sm text-[#2C3A2B]">{formatINR(msg.action.total || 0)}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleApplyAction(msg.id, msg.action)}
                              disabled={msg.actionApplied}
                              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                                msg.actionApplied
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                                  : 'bg-[#263325] hover:bg-[#1B261A] text-white active:scale-[0.99]'
                              }`}
                            >
                              {msg.actionApplied ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-700" />
                                  <span>Order Booked & Confirmed</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 text-[#E6C687]" />
                                  <span>⚡ Place Order Now ({formatINR(msg.action.total || 0)})</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                handleApplyAction(msg.id, {
                                  type: 'add_to_cart',
                                  items: msg.action?.items as any,
                                  title: msg.action?.title
                                });
                              }}
                              className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                            >
                              <ShoppingCart className="w-4 h-4 text-[#5A5A40]" />
                              <span>Add to Cart & Open</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. ADD TO CART ACTION CARD */}
                      {msg.action.type === 'add_to_cart' && (
                        <div className="p-3.5 bg-white border border-[#E6E1D3] rounded-2xl shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-xs text-[#2C3A2B]">
                              <ShoppingCart className="w-4 h-4 text-[#8B5A2B]" />
                              <span>{msg.action.title || 'Add Items to Cart'}</span>
                            </div>
                          </div>
                          {msg.action.reason && (
                            <p className="text-xs text-[#5A5A40] leading-relaxed">{msg.action.reason}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApplyAction(msg.id, msg.action)}
                              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#2C3A2B] hover:bg-[#1E281D] text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 text-[#E6C687]" />
                              <span>Add to Bundle Cart</span>
                            </button>
                            <button
                              onClick={() => setIsCartOpen(true)}
                              className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#F4F1EA] hover:bg-[#EAE5D9] text-[#2C3A2B] border border-[#E6E1D3] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>Open Cart Drawer</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 3. CHECKOUT ACTION CARD */}
                      {msg.action.type === 'checkout' && (
                        <div className="p-3.5 bg-white border border-[#E6E1D3] rounded-2xl shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-xs text-[#2C3A2B]">
                              <CreditCard className="w-4 h-4 text-[#8B5A2B]" />
                              <span>{msg.action.title || 'Proceed to Secure Checkout'}</span>
                            </div>
                          </div>
                          <p className="text-xs text-[#5A5A40]">
                            Verify your delivery address, select payment method (UPI, Card, COD), and confirm order.
                          </p>
                          <button
                            onClick={() => handleApplyAction(msg.id, msg.action)}
                            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-[#263325] hover:bg-[#1B261A] text-white flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-[#E6C687]" />
                            <span>Open Checkout Page →</span>
                          </button>
                        </div>
                      )}

                      {/* 4. APPLY FULL BUNDLE CARD */}
                      {msg.action.type === 'apply_bundle' && (
                        <div className="p-3.5 bg-white border border-[#E6E1D3] rounded-2xl shadow-xs">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 font-semibold text-[#2C3A2B] text-xs">
                              <Package className="w-4 h-4 text-[#8B5A2B]" />
                              <span>{msg.action.title || 'Recommended Bundle'}</span>
                            </div>
                            {msg.action.budget && (
                              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#F5F5EC] text-[#2C3A2B] font-semibold border border-[#E6E1D3]">
                                Target: {formatINR(msg.action.budget)}
                              </span>
                            )}
                          </div>

                          {msg.action.items && !Array.isArray(msg.action.items) && (
                            <div className="space-y-1.5 mb-3">
                              {Object.entries(msg.action.items).map(([slotId, prodId]) => {
                                const prod = fixture.products.find(p => p.id === prodId);
                                const slot = fixture.activity.requiredSlots.find(s => s.id === slotId);
                                return (
                                  <div
                                    key={slotId}
                                    className="flex items-center justify-between text-xs text-[#5A5A40] bg-[#FDFBF7] px-2.5 py-1.5 rounded-xl border border-[#E6E1D3]"
                                  >
                                    <span className="font-medium text-[#2C3A2B]">
                                      {slot?.label || slotId}:
                                    </span>
                                    <span className="font-mono text-[#5A5A40] font-medium">
                                      {prod?.name || prodId} {prod ? `(${formatINR(prod.price)})` : ''}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <button
                            onClick={() => handleApplyAction(msg.id, msg.action)}
                            disabled={msg.actionApplied}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              msg.actionApplied
                                ? 'bg-[#A3B18A]/25 text-[#2C3A2B] border border-[#A3B18A]/40 cursor-default'
                                : 'bg-[#2C3A2B] hover:bg-[#3A4D39] text-white shadow-xs cursor-pointer'
                            }`}
                          >
                            {msg.actionApplied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Bundle Applied to Compare Builder
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-3.5 h-3.5" />
                                Load Configuration into Compare Builder
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* 5. SWAP PRODUCT CARD */}
                      {msg.action.type === 'swap_product' && (
                        <div className="p-3 bg-white border border-[#F4E1A1] rounded-2xl shadow-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-[#2C3A2B] text-xs mb-1">
                            <RefreshCw className="w-3.5 h-3.5 text-[#8B5A2B]" />
                            <span>Actionable Product Replacement</span>
                          </div>
                          <p className="text-xs text-[#5A5A40] mb-2 leading-relaxed">
                            {msg.action.reason}
                          </p>
                          <button
                            onClick={() => handleApplyAction(msg.id, msg.action)}
                            disabled={msg.actionApplied}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              msg.actionApplied
                                ? 'bg-[#A3B18A]/25 text-[#2C3A2B] border border-[#A3B18A]/40 cursor-default'
                                : 'bg-[#8B5A2B] hover:bg-[#743815] text-white shadow-xs cursor-pointer'
                            }`}
                          >
                            {msg.actionApplied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Product Swapped in Slot
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3.5 h-3.5" />
                                Execute Swap in Builder Workspace
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* 6. SET BUDGET CARD */}
                      {msg.action.type === 'set_budget' && (
                        <div className="p-3 bg-white border border-[#E6E1D3] rounded-2xl shadow-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-[#2C3A2B] text-xs">
                              Update Customer Budget
                            </span>
                            <span className="font-mono font-bold text-[#2C3A2B] text-xs">
                              {formatINR(msg.action.budget || 0)}
                            </span>
                          </div>
                          {msg.action.reason && (
                            <p className="text-xs text-[#5A5A40] mb-2 leading-relaxed">
                              {msg.action.reason}
                            </p>
                          )}
                          <button
                            onClick={() => handleApplyAction(msg.id, msg.action)}
                            disabled={msg.actionApplied}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              msg.actionApplied
                                ? 'bg-[#A3B18A]/25 text-[#2C3A2B] border border-[#A3B18A]/40 cursor-default'
                                : 'bg-[#2C3A2B] hover:bg-[#3A4D39] text-white shadow-xs cursor-pointer'
                            }`}
                          >
                            {msg.actionApplied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Budget Updated
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-3.5 h-3.5" />
                                Set Budget to {formatINR(msg.action.budget || 0)}
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* 7. NAVIGATION CARD */}
                      {msg.action.type === 'navigate' && (
                        <div className="p-3.5 bg-white border border-[#E6E1D3] rounded-2xl shadow-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-[#2C3A2B] text-xs flex items-center gap-1.5">
                              <Compass className="w-4 h-4 text-[#8B5A2B]" />
                              Navigate to {msg.action.tab ? (TAB_NAMES[msg.action.tab] || msg.action.tab) : 'Workspace'}
                            </span>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#F5F5EC] text-[#5A5A40] border border-[#E6E1D3]">
                              /{msg.action.tab}
                            </span>
                          </div>
                          {msg.action.reason && (
                            <p className="text-xs text-[#5A5A40] mb-2 leading-relaxed">
                              {msg.action.reason}
                            </p>
                          )}
                          <button
                            onClick={() => handleApplyAction(msg.id, msg.action)}
                            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[#2C3A2B] hover:bg-[#1E281D] text-white flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            Open {msg.action.tab ? (TAB_NAMES[msg.action.tab] || msg.action.tab) : 'Page'}
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#2C3A2B] text-white shrink-0 flex items-center justify-center text-xs font-bold shadow-xs">
                    TA
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-8 h-8 rounded-xl bg-[#2C3A2B] text-white shrink-0 flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 text-[#E6C687] animate-pulse" />
              </div>
              <div className="bg-white border border-[#E6E1D3] rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs flex items-center gap-1.5 text-[#5A5A40]">
                <span className="w-2 h-2 rounded-full bg-[#8B5A2B] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#8B5A2B] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#8B5A2B] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium text-[#5A5A40] ml-1">Sahay AI is processing your request...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Order Starter Chips */}
        <div className="px-4 py-2 border-t border-[#E6E1D3] bg-[#FDFBF7] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-[#8B8B7A] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[#8B5A2B]" /> Quick Order:
          </span>
          {ROLE_DEFINITIONS[activeRole].starterPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] shadow-2xs shrink-0 transition-colors cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#E6E1D3] bg-white rounded-b-[24px]">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2.5"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={2}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask Sahay AI to order any product, add to cart, or assemble setup... (e.g. "Order P26" or "Buy mechanical keyboard")`}
                disabled={isLoading}
                className="w-full resize-none p-3 text-xs bg-[#F4F1EA]/70 hover:bg-[#F4F1EA] focus:bg-white border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] transition-colors placeholder:text-[#8B8B7A] text-[#2C2C1E]"
              />
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Send message to Sahay AI"
              className="p-3 rounded-xl bg-[#2C3A2B] hover:bg-[#1E281D] disabled:opacity-40 text-white shadow-xs transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-[#E6C687]" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[#8B8B7A] px-1 font-mono">
            <span>Press Enter to send, Shift+Enter for newline · Direct Orders Active</span>
            <span>Role: {ROLE_DEFINITIONS[activeRole].name}</span>
          </div>
        </div>
      </div>

      {/* Order Success Confirmation Modal */}
      {orderSuccessModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setOrderSuccessModal(null)}
            className="fixed inset-0 bg-[#2C2C1E]/60 backdrop-blur-xs"
          />

          <div className="relative bg-white rounded-2xl border border-[#E6E1D3] shadow-2xl max-w-md w-full p-6 text-center z-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#5A5A40] border border-[#E6E1D3]">
                {orderSuccessModal.orderId}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#2C3A2B] mt-2">
                Order Booked via Sahay AI!
              </h3>
              <p className="text-xs text-[#5A5A40] mt-1 leading-relaxed">
                Your order has been recorded and loaded into your active checkout session.
              </p>
            </div>

            {/* Itemized summary */}
            <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3] text-left text-xs space-y-2">
              <div className="font-semibold text-[#2C3A2B] text-[11px] uppercase tracking-wider border-b border-[#E6E1D3] pb-1">
                Order Items:
              </div>
              {orderSuccessModal.items.map((it, i) => (
                <div key={i} className="flex justify-between text-[#4A4A35]">
                  <span>{it.quantity}x {it.name} ({it.id})</span>
                  <span className="font-mono font-semibold">{formatINR(it.price * it.quantity)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#E6E1D3] flex justify-between font-bold text-xs text-[#2C3A2B]">
                <span>Total Landed Amount</span>
                <span className="font-mono text-sm text-[#2C3A2B]">{formatINR(orderSuccessModal.total)}</span>
              </div>
            </div>

            <div className="text-[11px] text-[#5A5A40] bg-[#F7F4EC] p-2.5 rounded-xl border border-[#E6E1D3]">
              📍 Delivering to: <strong className="text-[#2C3A2B]">{userProfile?.name || 'Tanmay Anand'}</strong>, Bangalore / Mumbai.
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setOrderSuccessModal(null);
                  setActiveTab('checkout');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#263325] hover:bg-[#1B261A] shadow-md transition-colors cursor-pointer"
              >
                Proceed to Checkout & Invoices →
              </button>

              <button
                onClick={() => {
                  setOrderSuccessModal(null);
                  setIsCartOpen(true);
                }}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-[#2C2C1E] bg-[#F4F1EA] hover:bg-[#EAE5D9] border border-[#E6E1D3] transition-colors cursor-pointer"
              >
                View in Bundle Cart Drawer
              </button>

              <button
                onClick={() => setOrderSuccessModal(null)}
                className="text-xs text-[#8B8B7A] hover:text-[#2C2C1E] cursor-pointer pt-1"
              >
                Close & Continue Chatting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
