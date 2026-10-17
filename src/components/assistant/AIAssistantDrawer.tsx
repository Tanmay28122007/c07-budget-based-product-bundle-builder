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
  Sliders,
  DollarSign,
  Package,
  Layers,
  ChevronDown,
  Info,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: {
    type: 'apply_bundle' | 'swap_product' | 'set_budget';
    title?: string;
    budget?: number;
    items?: Record<string, string>;
    slotId?: string;
    productId?: string;
    reason?: string;
  } | null;
  actionApplied?: boolean;
}

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
    setActiveTab
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [drawerModel, setDrawerModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        text: `Hello! I am your **AI Workspace & Hardware Consultant** powered by Gemini.

I can help you:
- **Assemble complete, 100% compatible product bundles** tailored to your budget.
- **Diagnose & fix hardware conflicts** (clamp lights vs curved monitors, desk width overhangs, dock power delivery).
- **Optimize landed pricing** (product subtotal + shipping surcharge + tax).
- **Evaluate unit economics** & shopper feasibility.

Click a quick prompt below or ask me anything!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

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

  const quickPrompts = [
    {
      label: 'Build Best Bundle under ₹75k',
      prompt: 'Build me an optimal, fully compatible workspace bundle under ₹75,000 budget.'
    },
    {
      label: 'Fix Compatibility Errors',
      prompt: 'Analyze my current bundle for any hardware compatibility conflicts and fix them.'
    },
    {
      label: 'Reduce Landed Cost',
      prompt: 'My bundle cost needs reduction. Suggest alternatives to stay strictly within budget.'
    },
    {
      label: 'Explain Clamp vs Curved Rule',
      prompt: 'Why is a screenbar clamp light incompatible with a curved monitor in this system?'
    },
    {
      label: 'Analyze Unit Economics',
      prompt: 'Give me an MBA analysis of the unit economics, landed margins, and platform referral fee.'
    }
  ];

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

    try {
      // Build full context payload for the server
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

      const contextPayload = {
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

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          context: contextPayload,
          model: drawerModel
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        text: data.reply || "I've reviewed your request and workspace state.",
        action: data.action || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Failed to get AI assistant response:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        text: `I encountered an issue connecting to the AI service: ${err.message}. Please check your connection and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAction = (msgId: string, action: ChatMessage['action']) => {
    if (!action) return;

    if (action.type === 'apply_bundle' && action.items) {
      applyBundleRecommendation(action.items, action.budget);
      setActiveTab('builder');
    } else if (action.type === 'swap_product' && action.slotId && action.productId) {
      swapProductById(action.slotId, action.productId);
      setActiveTab('builder');
    } else if (action.type === 'set_budget' && action.budget) {
      setBudget(action.budget);
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
        text: 'Chat history cleared. How can I help you optimize your workspace bundle today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to format basic markdown text (bold, lists, code)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-stone-700 my-0.5 leading-relaxed">
            {renderInlineMarkdown(content)}
          </li>
        );
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="ml-4 list-decimal text-stone-700 my-0.5 leading-relaxed">
            {renderInlineMarkdown(content)}
          </li>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="text-stone-700 my-1 leading-relaxed">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (str: string) => {
    // Basic regex parser for **bold** and `code`
    const parts = [];
    let remaining = str;
    let keyIdx = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const codeMatch = remaining.match(/`([^`]+)`/);

      // Find which comes first
      const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : -1;
      const codeIdx = codeMatch ? remaining.indexOf(codeMatch[0]) : -1;

      if (boldIdx === -1 && codeIdx === -1) {
        parts.push(<span key={keyIdx++}>{remaining}</span>);
        break;
      }

      if (boldIdx !== -1 && (codeIdx === -1 || boldIdx < codeIdx)) {
        if (boldIdx > 0) {
          parts.push(<span key={keyIdx++}>{remaining.substring(0, boldIdx)}</span>);
        }
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-stone-900">
            {boldMatch![1]}
          </strong>
        );
        remaining = remaining.substring(boldIdx + boldMatch![0].length);
      } else if (codeIdx !== -1) {
        if (codeIdx > 0) {
          parts.push(<span key={keyIdx++}>{remaining.substring(0, codeIdx)}</span>);
        }
        parts.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded-md bg-stone-100 font-mono text-[11px] text-indigo-900 border border-stone-200">
            {codeMatch![1]}
          </code>
        );
        remaining = remaining.substring(codeIdx + codeMatch![0].length);
      }
    }

    return parts;
  };

  const violationCount = validation.compatibilityViolations.length;
  const isOverBudget = validation.landedPrice.isOverBudget;

  return (
    <>
      {/* Floating Bottom-Right Trigger Button */}
      {!isAssistantOpen && (
        <button
          onClick={toggleAssistant}
          aria-label="Open AI Assistant"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-900 to-indigo-800 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-indigo-700/50 group"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold tracking-tight leading-none">
              AI Assistant
            </span>
            <span className="text-[10px] text-indigo-200 font-mono mt-0.5">
              Gemini 3.8 Flash
            </span>
          </div>

          {violationCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] animate-pulse">
              {violationCount} issue{violationCount > 1 ? 's' : ''}
            </span>
          )}
        </button>
      )}

      {/* Slide-over Drawer / Modal Container */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none flex justify-end">
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-2xs pointer-events-auto lg:hidden"
            onClick={() => setIsAssistantOpen(false)}
          />

          {/* Drawer Body */}
          <aside
            className={`pointer-events-auto flex flex-col bg-white border-l border-stone-200 shadow-2xl transition-all duration-200 ease-out h-full ${
              isExpanded ? 'w-full md:w-[680px]' : 'w-full sm:w-[440px]'
            }`}
          >
            {/* Top Bar */}
            <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between bg-stone-50/90 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-stone-900 truncate">
                      Gemini Assistant
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      Live
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <select
                      value={drawerModel}
                      onChange={e => setDrawerModel(e.target.value as any)}
                      className="text-[10px] font-mono font-semibold bg-white border border-stone-200 rounded px-1.5 py-0.5 text-stone-700 cursor-pointer"
                    >
                      <option value="gemini-3.8-flash">gemini-3.8-flash</option>
                      <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                      <option value="gemini-4-argon">gemini-4-argon</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-stone-400 shrink-0">
                <button
                  onClick={() => {
                    setActiveTab('chat');
                    setIsAssistantOpen(false);
                  }}
                  title="Open dedicated full-page Gemini Chatbot"
                  className="px-2 py-1 text-[11px] font-semibold text-indigo-950 bg-indigo-100/70 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-700" />
                  <span className="hidden sm:inline">Full Chat</span>
                </button>
                <button
                  onClick={handleClearHistory}
                  title="Clear chat history"
                  className="p-1.5 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsExpanded(prev => !prev)}
                  title={isExpanded ? 'Compact drawer' : 'Expand drawer'}
                  className="hidden sm:block p-1.5 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors cursor-pointer"
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsAssistantOpen(false)}
                  title="Close assistant"
                  className="p-1.5 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Context Status Ribbon */}
            <div className="px-4 py-2 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1 text-stone-700 text-[11px]">
                  <span className="text-stone-500">Budget:</span>
                  <span className="font-mono font-semibold text-stone-900">{formatINR(budget)}</span>
                </div>
                <span className="text-stone-300">|</span>
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-stone-500">Landed:</span>
                  <span
                    className={`font-mono font-semibold ${
                      isOverBudget ? 'text-rose-600' : 'text-emerald-700'
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Feasible
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                    {validation.filledSlotCount}/{validation.totalSlotCount} Slots
                  </span>
                )}
              </div>
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-4 py-2 border-b border-stone-100 bg-stone-50/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => handleSendMessage(qp.prompt)}
                  className="shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-full bg-white border border-stone-200 text-stone-700 hover:text-indigo-950 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Chat Messages Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-indigo-900 text-white shrink-0 flex items-center justify-center shadow-xs">
                        <Bot className="w-4 h-4 text-indigo-200" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                        isUser
                          ? 'bg-indigo-900 text-white rounded-tr-xs'
                          : 'bg-stone-50 border border-stone-200/80 rounded-tl-xs'
                      }`}
                    >
                      {/* Message Content */}
                      <div className={isUser ? 'text-white' : 'text-stone-800'}>
                        {isUser ? (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        ) : (
                          renderFormattedText(msg.text)
                        )}
                      </div>

                      {/* Interactive Action Card */}
                      {!isUser && msg.action && (
                        <div className="mt-3 pt-3 border-t border-stone-200/80">
                          {msg.action.type === 'apply_bundle' && (
                            <div className="p-3 bg-white border border-indigo-200 rounded-xl shadow-xs">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5 font-semibold text-stone-900 text-[11px]">
                                  <Package className="w-3.5 h-3.5 text-indigo-700" />
                                  <span>{msg.action.title || 'Recommended Setup'}</span>
                                </div>
                                {msg.action.budget && (
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-900 font-medium border border-indigo-100">
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
                                        className="flex items-center justify-between text-[10px] text-stone-600 bg-stone-50 px-2 py-1 rounded-md"
                                      >
                                        <span className="font-medium text-stone-800">
                                          {slot?.label || slotId}:
                                        </span>
                                        <span className="font-mono text-stone-700 truncate max-w-[180px]">
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
                                className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                  msg.actionApplied
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                                    : 'bg-indigo-900 hover:bg-indigo-950 text-white shadow-xs cursor-pointer'
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
                            <div className="p-3 bg-white border border-amber-200 rounded-xl shadow-xs">
                              <div className="flex items-center gap-1.5 font-semibold text-stone-900 text-[11px] mb-1">
                                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                                <span>Suggested Product Replacement</span>
                              </div>
                              <p className="text-[11px] text-stone-600 mb-2 leading-relaxed">
                                {msg.action.reason}
                              </p>
                              {msg.action.productId && (
                                <div className="text-[10px] bg-amber-50/60 p-2 rounded-md mb-2 border border-amber-100 flex items-center justify-between">
                                  <span className="font-medium text-stone-800">
                                    Target Item:
                                  </span>
                                  <span className="font-mono text-stone-700">
                                    {fixture.products.find(p => p.id === msg.action?.productId)?.name || msg.action.productId}
                                  </span>
                                </div>
                              )}
                              <button
                                onClick={() => handleApplyAction(msg.id, msg.action)}
                                disabled={msg.actionApplied}
                                className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                  msg.actionApplied
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer'
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
                            <div className="p-3 bg-white border border-indigo-200 rounded-xl shadow-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-stone-900 text-[11px]">
                                  Adjust Target Budget
                                </span>
                                <span className="font-mono font-bold text-indigo-900 text-xs">
                                  {formatINR(msg.action.budget || 0)}
                                </span>
                              </div>
                              {msg.action.reason && (
                                <p className="text-[11px] text-stone-600 mb-2 leading-relaxed">
                                  {msg.action.reason}
                                </p>
                              )}
                              <button
                                onClick={() => handleApplyAction(msg.id, msg.action)}
                                disabled={msg.actionApplied}
                                className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                  msg.actionApplied
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                                    : 'bg-indigo-900 hover:bg-indigo-950 text-white shadow-xs cursor-pointer'
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
                        </div>
                      )}

                      {/* Timestamp */}
                      <div
                        className={`text-[9px] mt-1.5 flex justify-end ${
                          isUser ? 'text-indigo-200' : 'text-stone-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-full bg-stone-800 text-white shrink-0 flex items-center justify-center text-[10px] font-bold">
                        U
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 text-xs justify-start">
                  <div className="w-7 h-7 rounded-full bg-indigo-900 text-white shrink-0 flex items-center justify-center shadow-xs">
                    <Bot className="w-4 h-4 text-indigo-200 animate-pulse" />
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs flex items-center gap-2 text-stone-600">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-medium text-stone-500 ml-1">
                      Gemini is analyzing catalogue constraints...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-stone-200 bg-white">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-end gap-2"
              >
                <div className="relative flex-1">
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
                    placeholder="Ask Gemini to build, optimize, or fix your bundle..."
                    disabled={isLoading}
                    className="w-full resize-none p-2.5 pr-10 text-xs bg-stone-50 hover:bg-stone-100/60 focus:bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-800 transition-colors placeholder:text-stone-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  aria-label="Send message to AI assistant"
                  className="p-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 disabled:opacity-40 text-white shadow-xs transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone-400 px-1 font-mono">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>Context-Aware Gemini Assistant</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
