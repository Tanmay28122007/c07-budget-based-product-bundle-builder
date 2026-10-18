import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Trash2,
  ArrowRight,
  RefreshCw,
  DollarSign,
  Package,
  Check,
  MessageSquare,
  Loader2,
  Compass,
  ShoppingCart,
  ExternalLink,
  ShoppingBag,
  Zap,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import { Product } from '../../types';
import { getProductImageUrl, getProductImageFallback } from '../../utils/imageUtils';
import { generateComprehensiveHeuristicResponse } from '../../data/websiteKnowledge';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: {
    type: 'apply_bundle' | 'swap_product' | 'set_budget' | 'navigate' | 'order_items' | 'add_to_cart' | 'checkout';
    tab?: string;
    title?: string;
    budget?: number;
    items?: Record<string, string> | Array<{ id: string; name?: string; price?: number; quantity?: number }>;
    slotId?: string;
    productId?: string;
    reason?: string;
    subtotal?: number;
    netShipping?: number;
    taxAmount?: number;
    total?: number;
  } | null;
  actionApplied?: boolean;
}

const TAB_NAMES: Record<string, string> = {
  dashboard: 'Executive Dashboard',
  builder: 'Bundle Builder',
  chat: 'Gemini AI Assistant',
  catalogue: 'Product Catalogue',
  compare: 'Compare Bundles',
  business: 'Business Insights & Strategy',
  tests: 'Automated Test Suite',
  evidence: 'Project Evidence & Scope Audit',
  settings: 'Settings & Configuration'
};

export const AIAssistantDrawer: React.FC = () => {
  const {
    isAssistantOpen,
    setIsAssistantOpen,
    toggleAssistant,
    fixture,
    budget,
    setBudget,
    currentItems,
    validation,
    applyBundleRecommendation,
    swapProductById,
    addItemToCart,
    openProductDetails,
    activeTab,
    setActiveTab,
    setIsCartOpen,
    addNotification
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'gu'>('en');
  const [addedProductIds, setAddedProductIds] = useState<Record<string, boolean>>({});

  // Direct order success confirmation modal
  const [orderSuccessModal, setOrderSuccessModal] = useState<{
    orderId: string;
    items: { id: string; name: string; price: number; quantity: number }[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  } | null>(null);

  const handleAddProductToCart = (product: Product) => {
    addItemToCart(product);
    setAddedProductIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedProductIds(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const getProductsMentioned = (text: string): Product[] => {
    const matches = text.match(/\bP(?:0[1-9]|[1-5][0-9]|60)\b/gi);
    if (!matches) return [];
    const uniqueIds = Array.from(new Set(matches.map(m => m.toUpperCase())));
    return uniqueIds
      .map(id => fixture.products.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p));
  };
  const drawerModel = 'gemini-flash-lite-latest';

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: `Welcome to **Sahay AI**! 

I am your intelligent Workspace & Hardware Bundle Consultant.

Choose your preferred language below or ask me anything to assemble, optimize, or troubleshoot your workstation setup:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAssistantOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isAssistantOpen, messages]);

  const handleLanguageSelect = (langKey: 'en' | 'hi' | 'gu') => {
    setSelectedLang(langKey);
    const langNames = { en: 'English', hi: 'Hindi (हिंदी)', gu: 'Gujarati (ગુજરાતી)' };
    const confirmTexts = {
      en: 'Language set to English. How can I assist with your workspace setup today?',
      hi: 'भाषा सफलतापूर्वक हिंदी में सेट कर दी गई है। आज मैं आपके वर्कस्पेस बंडल के लिए क्या सहायता कर सकता हूँ?',
      gu: 'ભાષા સફળતાપૂર્વક ગુજરાતીમાં સેટ થઈ ગઈ છે. આજે હું તમારા વર્કસ્પેસ બંડલ માટે કેવી રીતે મદદ કરી શકું?'
    };

    setMessages(prev => [
      ...prev,
      {
        id: `msg-lang-user-${Date.now()}`,
        role: 'user',
        text: `Selected language: ${langNames[langKey]}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: `msg-lang-bot-${Date.now()}`,
        role: 'assistant',
        text: confirmTexts[langKey],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    let promptWithLanguage = text;
    let contextPayload: any = null;

    try {
      const activeLangName = selectedLang === 'hi' ? 'Hindi' : selectedLang === 'gu' ? 'Gujarati' : 'English';
      promptWithLanguage = selectedLang !== 'en' ? `[Please respond in ${activeLangName}]: ${text}` : text;

      // Build context payload for the server
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

      const historyPayload = messages.slice(-6).map(m => ({
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
            message: promptWithLanguage,
            history: historyPayload,
            context: contextPayload,
            model: drawerModel,
            role: 'workspace_architect'
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
        data = generateComprehensiveHeuristicResponse(promptWithLanguage, contextPayload);
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        text: data?.reply || "I've analyzed your workspace requirements and current configuration.",
        action: (data?.action as any) || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('Network exception during AI fetch, activating local intelligence fallback:', err);
      // Seamlessly answer using the local knowledge engine rather than breaking the UI
      const localData = generateComprehensiveHeuristicResponse(promptWithLanguage, contextPayload);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        text: localData?.reply || `I've analyzed your configuration. What would you like to build or optimize next?`,
        action: (localData?.action as any) || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAction = (msgId: string, action: ChatMessage['action']) => {
    if (!action) return;

    if (action.type === 'apply_bundle' && action.items && !Array.isArray(action.items)) {
      applyBundleRecommendation(action.items as Record<string, string>, action.budget);
      setActiveTab('compare');
    } else if (action.type === 'swap_product' && action.slotId && action.productId) {
      swapProductById(action.slotId, action.productId);
      setActiveTab('compare');
    } else if (action.type === 'set_budget' && action.budget) {
      setBudget(action.budget);
    } else if (action.type === 'navigate' && action.tab) {
      setActiveTab(action.tab as any);
    } else if (action.type === 'order_items') {
      const itemsList = Array.isArray(action.items) ? action.items : [];
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

        const qty = it.quantity || 1;
        for (let i = 0; i < qty; i++) {
          addItemToCart(prod);
        }
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
        shipping: action.netShipping ?? 0,
        tax: action.taxAmount || 0,
        total: action.total || 0
      });

      addNotification(
        'Direct Order Confirmed',
        `Order ${newOrderId} placed successfully for ${formatINR(action.total || 0)}.`,
        'success'
      );
    } else if (action.type === 'add_to_cart') {
      const itemsList = Array.isArray(action.items) ? action.items : [];
      itemsList.forEach((it: any) => {
        const prod = fixture.products.find(p => p.id === it.id);
        if (prod) {
          const qty = it.quantity || 1;
          for (let i = 0; i < qty; i++) {
            addItemToCart(prod);
          }
        }
      });
      setIsCartOpen(true);
      addNotification(
        'Added to Cart',
        `${itemsList.length} item(s) added to your bundle cart.`,
        'success'
      );
    } else if (action.type === 'checkout') {
      setIsCartOpen(true);
    }

    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, actionApplied: true } : m))
    );
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-reset',
        role: 'assistant',
        text: selectedLang === 'hi'
          ? 'बातचीत का इतिहास साफ़ कर दिया गया है। मैं आपके लिए क्या सहायता कर सकता हूँ?'
          : selectedLang === 'gu'
          ? 'વાતચીતનો ઇતિહાસ સાફ કરવામાં આવ્યો છે. હું તમને કેવી રીતે મદદ કરી શકું?'
          : 'Chat history cleared. How can I help you optimize your workspace bundle today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to format rich markdown text (headings, bullet lists, numbered lists, dividers, pills, badges, product images)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trimStart();
      const indent = line.length - trimmed.length;

      // Headings
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-serif font-bold text-[#2C3A2B] text-sm sm:text-base mt-3 mb-1">
            {renderInlineMarkdown(trimmed.replace('### ', ''))}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-serif font-bold text-[#2C3A2B] text-base sm:text-lg mt-3.5 mb-1.5">
            {renderInlineMarkdown(trimmed.replace('## ', ''))}
          </h3>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={idx} className="font-serif font-bold text-[#2C3A2B] text-lg sm:text-xl mt-4 mb-2">
            {renderInlineMarkdown(trimmed.replace('# ', ''))}
          </h2>
        );
      }

      // Horizontal Rule / Divider
      if (trimmed === '---' || trimmed.startsWith('---')) {
        return <hr key={idx} className="my-3 border-[#E6E1D3]" />;
      }

      // Bullet points (handles *, -, • and any leading indentation)
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const content = trimmed.substring(2);
        const prodMatch = content.match(/\b(?:\[)?(P(?:0[1-9]|[1-5][0-9]|60))(?:\])?\b/i);
        const bulletProduct = prodMatch
          ? fixture.products.find(p => p.id.toUpperCase() === prodMatch[1].toUpperCase())
          : null;

        return (
          <div
            key={idx}
            className={`flex items-start gap-2.5 my-1.5 text-stone-800 ${
              indent >= 2 ? 'ml-6 text-xs sm:text-[13px] text-stone-600' : 'ml-0.5 text-sm'
            }`}
          >
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
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A2B] mt-2.5 shrink-0" />
            )}
            <div className="flex-1 leading-relaxed">
              {renderInlineMarkdown(content)}
            </div>
          </div>
        );
      }

      // Numbered lists (e.g., "1. ", "4. ")
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        // Detect if this numbered item mentions a product ID (e.g. P07, [P07], etc.)
        const prodIdMatch = numMatch[2].match(/\b(?:\[)?(P(?:0[1-9]|[1-5][0-9]|60))(?:\])?\b/i);
        const itemProduct = prodIdMatch
          ? fixture.products.find(p => p.id.toUpperCase() === prodIdMatch[1].toUpperCase())
          : null;

        return (
          <div key={idx} className={`my-2.5 text-stone-900 ${indent >= 2 ? 'ml-6' : 'ml-0'}`}>
            <div className="flex items-start gap-2.5">
              <span className="font-mono font-bold text-xs text-[#8B5A2B] bg-[#F4F1EA] w-6 h-6 flex items-center justify-center rounded-lg shrink-0 border border-[#E6E1D3] mt-0.5 shadow-2xs">
                {numMatch[1]}
              </span>
              {itemProduct && (
                <div
                  onClick={() => openProductDetails(itemProduct.id)}
                  className="w-11 h-11 rounded-xl bg-white border border-[#E6E1D3] flex items-center justify-center p-1 shrink-0 overflow-hidden cursor-pointer hover:border-[#8B5A2B] hover:shadow-xs transition-all hover:scale-105"
                  title={`View ${itemProduct.name} specs`}
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
              <div className="flex-1 leading-relaxed text-[15px] font-semibold text-stone-900">
                {renderInlineMarkdown(numMatch[2])}
              </div>
            </div>
          </div>
        );
      }

      // Empty line / paragraph break
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Regular paragraph
      return (
        <p key={idx} className="text-stone-800 my-1 leading-relaxed text-[15px] font-normal">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (str: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = str;
    let keyIdx = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const codeMatch = remaining.match(/`([^`]+)`/);
      const prodMatch = remaining.match(/\[(P(?:0[1-9]|[1-5][0-9]|60))\]|\b(P(?:0[1-9]|[1-5][0-9]|60))\b/i);
      const hwMatch = remaining.match(/\b([A-Z]{3}-\d{3})\b/);

      const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : -1;
      const codeIdx = codeMatch ? remaining.indexOf(codeMatch[0]) : -1;
      const prodIdx = prodMatch ? remaining.indexOf(prodMatch[0]) : -1;
      const hwIdx = hwMatch ? remaining.indexOf(hwMatch[0]) : -1;

      const candidates = [
        { type: 'bold', idx: boldIdx, match: boldMatch },
        { type: 'code', idx: codeIdx, match: codeMatch },
        { type: 'prod', idx: prodIdx, match: prodMatch },
        { type: 'hw', idx: hwIdx, match: hwMatch }
      ].filter(c => c.idx !== -1).sort((a, b) => a.idx - b.idx);

      if (candidates.length === 0) {
        parts.push(<span key={keyIdx++}>{remaining}</span>);
        break;
      }

      const earliest = candidates[0];
      if (earliest.idx > 0) {
        parts.push(<span key={keyIdx++}>{remaining.substring(0, earliest.idx)}</span>);
      }

      if (earliest.type === 'bold') {
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-stone-900">
            {earliest.match![1]}
          </strong>
        );
        remaining = remaining.substring(earliest.idx + earliest.match![0].length);
      } else if (earliest.type === 'code') {
        parts.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded-md bg-[#F4F1EA] font-mono text-xs text-[#8B5A2B] border border-[#E6E1D3]">
            {earliest.match![1]}
          </code>
        );
        remaining = remaining.substring(earliest.idx + earliest.match![0].length);
      } else if (earliest.type === 'prod') {
        const prodId = (earliest.match![1] || earliest.match![2]).toUpperCase();
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
        remaining = remaining.substring(earliest.idx + earliest.match![0].length);
      } else if (earliest.type === 'hw') {
        parts.push(
          <span key={keyIdx++} className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded-md bg-[#F4F1EA] font-mono font-semibold text-xs text-[#2C3A2B] border border-[#E6E1D3]">
            {earliest.match![1]}
          </span>
        );
        remaining = remaining.substring(earliest.idx + earliest.match![0].length);
      }
    }

    return parts;
  };

  const violationCount = validation.compatibilityViolations.length;
  const isOverBudget = validation.landedPrice.isOverBudget;

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right */}
      <button
        onClick={toggleAssistant}
        aria-label="Toggle Sahay AI Assistant"
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none flex items-center justify-center gap-2 cursor-pointer border-2 border-white/50"
        style={{
          background: 'linear-gradient(135deg, #2C3A2B 0%, #1B281B 100%)',
          color: 'white',
          boxShadow: '0 10px 30px rgba(44, 58, 43, 0.4)'
        }}
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-emerald-300" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white" />
        </div>

        {violationCount > 0 && (
          <span className="absolute -top-1.5 -left-1.5 px-2 py-0.5 rounded-full bg-[#D46A43] text-white font-bold text-[10px] shadow-sm animate-pulse">
            {violationCount}
          </span>
        )}
      </button>

      {/* Animated Floating Chat Modal */}
      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340, mass: 0.85 }}
            className={`fixed bottom-24 right-4 sm:right-6 bg-[#FDFBF7] rounded-3xl shadow-2xl flex flex-col z-50 border border-[#E6E1D3] overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'w-[95vw] sm:w-[720px] h-[85vh] max-h-[820px]'
                : 'w-[94vw] sm:w-[500px] h-[640px] max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div className="bg-white/95 backdrop-blur-md px-4 py-3.5 flex items-center justify-between shadow-xs z-10 border-b border-[#E6E1D3]">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#2C3A2B] text-emerald-300 shadow-xs shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#2C2C1E] truncate">
                    Sahay AI
                  </h3>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0">

                {/* Clear chat */}
                <button
                  onClick={handleClearHistory}
                  title="Clear conversation"
                  className="p-1.5 hover:bg-[#F4F1EA] text-[#8A8A88] rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Expand / Minimize */}
                <button
                  onClick={() => setIsExpanded(prev => !prev)}
                  title={isExpanded ? 'Collapse' : 'Expand'}
                  className="hidden sm:block p-1.5 hover:bg-[#F4F1EA] text-[#8A8A88] rounded-lg transition-colors cursor-pointer"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsAssistantOpen(false)}
                  className="p-1.5 hover:bg-[#F4F1EA] text-[#8A8A88] rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Context Status Ribbon */}
            <div className="px-4 py-2 bg-[#F4F1EA] border-b border-[#E6E1D3] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1 text-[#5A5A40] text-[11px]">
                  <span>Budget:</span>
                  <span className="font-mono font-semibold text-[#2C3A2B]">{formatINR(budget)}</span>
                </div>
                <span className="text-[#E6E1D3]">|</span>
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-[#5A5A40]">Landed:</span>
                  <span
                    className={`font-mono font-semibold ${
                      isOverBudget ? 'text-rose-600' : 'text-[#2C3A2B]'
                    }`}
                  >
                    {formatINR(validation.landedPrice.landedPrice)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {violationCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {violationCount} Conflict{violationCount > 1 ? 's' : ''}
                  </span>
                ) : validation.isComplete ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#A3B18A]/30 text-[#2C3A2B] border border-[#A3B18A]/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#2C3A2B]" />
                    Feasible
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-[#5A5A40] border border-[#E6E1D3]">
                    {validation.filledSlotCount}/{validation.totalSlotCount} Slots
                  </span>
                )}
              </div>
            </div>


            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto w-full p-4 space-y-4" style={{ backgroundColor: '#FDFBF7' }}>
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[92%] p-4 text-sm shadow-xs ${
                        isUser
                          ? 'bg-[#2C3A2B] text-white rounded-t-2xl rounded-bl-2xl whitespace-pre-wrap'
                          : 'bg-white border border-[#E6E1D3] text-[#2C2C1E] rounded-t-2xl rounded-br-2xl'
                      }`}
                    >
                      {/* Message Text */}
                      {isUser ? (
                        <p className="leading-relaxed whitespace-pre-wrap text-[15px]">{msg.text}</p>
                      ) : (
                        <div className="space-y-1.5 text-[15px]">{renderFormattedText(msg.text)}</div>
                      )}

                      {/* Visual Product Recommendation Cards */}
                      {!isUser && (() => {
                        const mentionedProds = getProductsMentioned(msg.text);
                        if (mentionedProds.length === 0) return null;
                        return (
                          <div className="mt-3.5 pt-3 border-t border-[#E6E1D3]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[13px] font-bold text-[#2C3A2B] flex items-center gap-1.5 tracking-tight">
                                <Package className="w-3.5 h-3.5 text-[#8B5A2B]" />
                                Products Mentioned ({mentionedProds.length})
                              </span>
                              <span className="text-[11px] text-[#8A8A88]">Click to inspect or add</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {mentionedProds.map(prod => (
                                <div
                                  key={prod.id}
                                  className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3] hover:border-[#8B5A2B] hover:shadow-xs transition-all flex items-center gap-2.5 group"
                                >
                                  <div
                                    onClick={() => openProductDetails(prod.id)}
                                    className="w-13 h-13 rounded-lg bg-white border border-[#E6E1D3] flex items-center justify-center p-1 shrink-0 overflow-hidden cursor-pointer group-hover:scale-105 transition-transform"
                                    title={`View ${prod.name}`}
                                  >
                                    <img
                                      src={getProductImageUrl(prod.image, prod.id)}
                                      alt={prod.name}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        e.currentTarget.src = getProductImageFallback(e.currentTarget.src);
                                      }}
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8A8A88]">
                                      <span className="font-bold text-[#8B5A2B]">{prod.id}</span>
                                      <span>•</span>
                                      <span className="truncate">{prod.category}</span>
                                    </div>
                                    <h5
                                      onClick={() => openProductDetails(prod.id)}
                                      className="font-semibold text-xs sm:text-[13px] text-[#2C2C1E] truncate cursor-pointer group-hover:text-[#8B5A2B] transition-colors"
                                      title={prod.name}
                                    >
                                      {prod.name}
                                    </h5>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="font-mono font-bold text-xs sm:text-[13px] text-[#2C3A2B]">
                                        {formatINR(prod.price)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAddProductToCart(prod)}
                                        disabled={!prod.inStock}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
                                          addedProductIds[prod.id]
                                            ? 'bg-emerald-600 text-white'
                                            : prod.inStock
                                            ? 'bg-[#2C3A2B] hover:bg-[#1B281B] text-white'
                                            : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                                        }`}
                                      >
                                        {addedProductIds[prod.id] ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            Added
                                          </>
                                        ) : (
                                          <>
                                            <ShoppingCart className="w-3 h-3 text-amber-200" />
                                            Add
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Action Cards */}
                      {!isUser && msg.action && (
                        <div className="mt-3 pt-3 border-t border-[#E6E1D3]">
                          {msg.action.type === 'apply_bundle' && (
                            <div className="p-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl shadow-xs">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5 font-bold text-[#2C3A2B] text-xs sm:text-[13px]">
                                  <Package className="w-3.5 h-3.5 text-[#8B5A2B]" />
                                  <span>{msg.action.title || 'Recommended Bundle'}</span>
                                </div>
                                {msg.action.budget && (
                                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-[#F4F1EA] text-[#8B5A2B] font-medium border border-[#E6E1D3]">
                                    Target: {formatINR(msg.action.budget)}
                                  </span>
                                )}
                              </div>

                              {msg.action.items && (
                                <div className="space-y-1 mb-2.5">
                                  {Object.entries(msg.action.items).map(([slotId, prodId]) => {
                                    const prod = fixture.products.find(p => p.id === prodId);
                                    const slot = fixture.activity.requiredSlots.find(s => s.id === slotId);
                                    return (
                                      <div
                                        key={slotId}
                                        className="flex items-center justify-between text-[11px] text-[#5A5A40] bg-white border border-[#E6E1D3]/60 px-2 py-1 rounded-md"
                                      >
                                        <span className="font-medium text-[#2C3A2B]">
                                          {slot?.label || slotId}:
                                        </span>
                                        <span className="font-mono text-[#5A5A40] truncate max-w-[180px]">
                                          {prod?.name || prodId} ({prod ? formatINR(prod.price) : ''})
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              <button
                                onClick={() => handleApplyAction(msg.id, msg.action)}
                                disabled={msg.actionApplied}
                                className={`w-full py-2 px-3 rounded-xl text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                  msg.actionApplied
                                    ? 'bg-[#A3B18A]/30 text-[#2C3A2B] border border-[#A3B18A] cursor-default'
                                    : 'bg-[#2C3A2B] hover:bg-[#1B281B] text-white shadow-xs cursor-pointer'
                                }`}
                              >
                                {msg.actionApplied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    Bundle Applied to Workspace
                                  </>
                                ) : (
                                  <>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                    Apply Bundle to Builder
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {msg.action.type === 'swap_product' && (
                            <div className="p-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl shadow-xs">
                              <div className="flex items-center gap-1.5 font-bold text-[#2C3A2B] text-xs sm:text-[13px] mb-1">
                                <RefreshCw className="w-3.5 h-3.5 text-[#8B5A2B]" />
                                <span>Suggested Product Replacement</span>
                              </div>
                              <p className="text-xs text-[#5A5A40] mb-2 leading-relaxed">
                                {msg.action.reason}
                              </p>
                              {msg.action.productId && (
                                <div className="text-xs bg-white p-2 rounded-md mb-2 border border-[#E6E1D3] flex items-center justify-between">
                                  <span className="font-medium text-[#2C3A2B]">
                                    Target Item:
                                  </span>
                                  <span className="font-mono text-[#5A5A40]">
                                    {fixture.products.find(p => p.id === msg.action?.productId)?.name || msg.action.productId}
                                  </span>
                                </div>
                              )}
                              <button
                                onClick={() => handleApplyAction(msg.id, msg.action)}
                                disabled={msg.actionApplied}
                                className={`w-full py-2 px-3 rounded-xl text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                  msg.actionApplied
                                    ? 'bg-[#A3B18A]/30 text-[#2C3A2B] border border-[#A3B18A] cursor-default'
                                    : 'bg-[#D46A43] hover:bg-[#b05534] text-white shadow-xs cursor-pointer'
                                }`}
                              >
                                {msg.actionApplied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    Replacement Swapped
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Swap Product in Slot
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {msg.action.type === 'set_budget' && (
                            <div className="p-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl shadow-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-[#2C3A2B] text-xs sm:text-[13px]">
                                  Adjust Target Budget
                                </span>
                                <span className="font-mono font-bold text-[#8B5A2B] text-xs sm:text-[13px]">
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
                                className={`w-full py-2 px-3 rounded-xl text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                  msg.actionApplied
                                    ? 'bg-[#A3B18A]/30 text-[#2C3A2B] border border-[#A3B18A] cursor-default'
                                    : 'bg-[#8B5A2B] hover:bg-[#743815] text-white shadow-xs cursor-pointer'
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
                                    Update Budget to {formatINR(msg.action.budget || 0)}
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                          {msg.action.type === 'navigate' && (
                            <div className="p-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl shadow-xs">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5 font-bold text-[#2C3A2B] text-xs sm:text-[13px]">
                                  <Compass className="w-3.5 h-3.5 text-[#8B5A2B]" />
                                  <span>Navigate to {msg.action.tab ? (TAB_NAMES[msg.action.tab] || msg.action.tab) : 'Workspace'}</span>
                                </div>
                                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-[#F4F1EA] text-[#5A5A40] border border-[#E6E1D3]">
                                  /{msg.action.tab}
                                </span>
                              </div>
                              {msg.action.reason && (
                                <p className="text-xs text-[#5A5A40] mb-2.5 leading-relaxed">
                                  {msg.action.reason}
                                </p>
                              )}
                              <button
                                onClick={() => handleApplyAction(msg.id, msg.action)}
                                disabled={msg.actionApplied}
                                className={`w-full py-2 px-3 rounded-xl text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                  msg.actionApplied
                                    ? 'bg-[#A3B18A]/30 text-[#2C3A2B] border border-[#A3B18A] cursor-default'
                                    : 'bg-[#2C3A2B] hover:bg-[#1B281B] text-white shadow-xs cursor-pointer'
                                }`}
                              >
                                {msg.actionApplied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    Navigated
                                  </>
                                ) : (
                                  <>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                    Open {msg.action.tab ? (TAB_NAMES[msg.action.tab] || msg.action.tab) : 'Page'}
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {msg.action.type === 'order_items' && (
                            <div className="p-3 bg-white border-2 border-emerald-600/30 rounded-xl shadow-xs space-y-2.5">
                              <div className="flex items-center justify-between pb-1.5 border-b border-[#E6E1D3]">
                                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-[13px] text-[#2C3A2B]">
                                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>{msg.action.title || 'Direct Order Prepared'}</span>
                                </div>
                                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {formatINR(msg.action.total || 0)}
                                </span>
                              </div>

                              {/* Items list */}
                              {Array.isArray(msg.action.items) && msg.action.items.length > 0 && (
                                <div className="space-y-1.5">
                                  {msg.action.items.map((it: any, i: number) => {
                                    const prod = fixture.products.find(p => p.id === it.id);
                                    return (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between p-1.5 rounded-lg bg-[#FDFBF7] border border-[#E6E1D3]"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-7 h-7 rounded-md bg-white border border-[#E6E1D3] overflow-hidden flex items-center justify-center shrink-0">
                                            <img
                                              src={getProductImageUrl(prod?.image, it.id)}
                                              alt={it.name || it.id}
                                              className="w-full h-full object-contain"
                                              onError={e => {
                                                (e.currentTarget as HTMLElement).style.display = 'none';
                                              }}
                                            />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="font-semibold text-[11px] text-[#2C3A2B] truncate">{it.name || it.id}</div>
                                            <div className="text-[10px] text-[#5A5A40]">
                                              Qty: {it.quantity || 1} · {formatINR(it.price || prod?.price || 0)}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="font-mono font-bold text-xs text-[#2C3A2B] shrink-0 pl-2">
                                          {formatINR((it.price || prod?.price || 0) * (it.quantity || 1))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Cost Breakdown */}
                              <div className="p-2 rounded-lg bg-[#F7F4EC] text-[10px] space-y-0.5">
                                <div className="flex justify-between text-[#5A5A40]">
                                  <span>Subtotal</span>
                                  <span className="font-mono">{formatINR(msg.action.subtotal || 0)}</span>
                                </div>
                                <div className="flex justify-between text-[#5A5A40]">
                                  <span>Shipping</span>
                                  <span className="font-mono">{(msg.action.netShipping ?? 499) === 0 ? 'FREE' : formatINR(msg.action.netShipping ?? 499)}</span>
                                </div>
                                <div className="flex justify-between text-[#5A5A40]">
                                  <span>GST (18%)</span>
                                  <span className="font-mono">{formatINR(msg.action.taxAmount || 0)}</span>
                                </div>
                                <div className="pt-1 border-t border-[#E6E1D3] flex justify-between font-bold text-[11px] text-[#2C3A2B]">
                                  <span>Landed Total</span>
                                  <span className="font-mono text-xs">{formatINR(msg.action.total || 0)}</span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                <button
                                  onClick={() => handleApplyAction(msg.id, msg.action)}
                                  disabled={msg.actionApplied}
                                  className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                    msg.actionApplied
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                                      : 'bg-[#263325] hover:bg-[#1B261A] text-white shadow-2xs'
                                  }`}
                                >
                                  {msg.actionApplied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                                      <span>Booked</span>
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                                      <span>Order Now</span>
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
                                  className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5 text-[#5A5A40]" />
                                  <span>+ Cart</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`text-[11px] mt-1.5 flex justify-end ${
                          isUser ? 'text-emerald-200' : 'text-[#8A8A88]'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#E6E1D3] px-3.5 py-2.5 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5 text-[#5A5A40]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A2B] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A2B] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A2B] animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Input Area */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="bg-white p-3.5 border-t border-[#E6E1D3] flex items-center space-x-2.5"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder={
                  selectedLang === 'hi'
                    ? 'अपना संदेश लिखें (जैसे: बजट अनुकूल बंडल बनाएं)...'
                    : selectedLang === 'gu'
                    ? 'તમારો સંદેશ લખો (જેમ કે: બજેટ અનુકૂળ બંડલ બનાવો)...'
                    : 'Ask Sahay AI to build, optimize, or fix your bundle...'
                }
                disabled={isLoading}
                className="flex-1 bg-[#F4F1EA] border-none rounded-full px-4 py-3 text-sm focus:ring-1 focus:ring-[#2C3A2B] outline-none placeholder-[#8A8A88] text-[#2C2C1E]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 bg-[#2C3A2B] text-white rounded-full hover:bg-[#1B281B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setOrderSuccessModal(null);
                  setActiveTab('compare');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#263325] hover:bg-[#1B261A] shadow-md transition-colors cursor-pointer"
              >
                View in Workspace Builder →
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
    </>
  );
};

export { AIAssistantDrawer as FloatingChat };
