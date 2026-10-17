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
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: {
    type: 'apply_bundle' | 'swap_product' | 'set_budget' | 'navigate';
    tab?: string;
    title?: string;
    budget?: number;
    items?: Record<string, string>;
    slotId?: string;
    productId?: string;
    reason?: string;
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
    activeTab,
    setActiveTab
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'gu'>('en');
  const drawerModel = 'gemini-3.8-flash';

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

    try {
      const activeLangName = selectedLang === 'hi' ? 'Hindi' : selectedLang === 'gu' ? 'Gujarati' : 'English';
      const promptWithLanguage = `[SYSTEM: Selected Language = ${activeLangName}]\nPlease respond in ${activeLangName}.\n${text}`;

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

      const contextPayload = {
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

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptWithLanguage,
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
        text: data.reply || "I've analyzed your workspace requirements and current configuration.",
        action: data.action || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Failed to get AI assistant response:', err);
      const fallbackReplies: Record<'en' | 'hi' | 'gu', string> = {
        en: `I encountered an issue connecting to the AI service (${err.message}). You can still use the bundle builder tools or retry in a moment.`,
        hi: `AI सेवा से कनेक्ट करने में समस्या आई (${err.message})। कृपया कुछ क्षणों बाद पुनः प्रयास करें।`,
        gu: `AI સેવા સાથે કનેક્ટ કરવામાં સમસ્યા આવી (${err.message})। કૃપા કરીને થોડીવાર પછી ફરી પ્રયાસ કરો.`
      };

      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        text: fallbackReplies[selectedLang],
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
      setActiveTab('compare');
    } else if (action.type === 'swap_product' && action.slotId && action.productId) {
      swapProductById(action.slotId, action.productId);
      setActiveTab('compare');
    } else if (action.type === 'set_budget' && action.budget) {
      setBudget(action.budget);
    } else if (action.type === 'navigate' && action.tab) {
      setActiveTab(action.tab as any);
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

  // Helper to format rich markdown text (headings, bullet lists, numbered lists, dividers, pills, badges)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trimStart();
      const indent = line.length - trimmed.length;

      // Headings
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-serif font-bold text-[#2C3A2B] text-xs sm:text-sm mt-3 mb-1">
            {renderInlineMarkdown(trimmed.replace('### ', ''))}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-serif font-bold text-[#2C3A2B] text-sm sm:text-base mt-3.5 mb-1.5">
            {renderInlineMarkdown(trimmed.replace('## ', ''))}
          </h3>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={idx} className="font-serif font-bold text-[#2C3A2B] text-base mt-4 mb-2">
            {renderInlineMarkdown(trimmed.replace('# ', ''))}
          </h2>
        );
      }

      // Horizontal Rule / Divider
      if (trimmed === '---' || trimmed.startsWith('---')) {
        return <hr key={idx} className="my-2.5 border-[#E6E1D3]" />;
      }

      // Bullet points (handles *, -, • and any leading indentation)
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const content = trimmed.substring(2);
        return (
          <div
            key={idx}
            className={`flex items-start gap-2 my-1 text-stone-800 ${
              indent >= 2 ? 'ml-5 text-[11px]' : 'ml-1'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A2B] mt-1.5 shrink-0" />
            <div className="flex-1 leading-relaxed">
              {renderInlineMarkdown(content)}
            </div>
          </div>
        );
      }

      // Numbered lists (e.g., "1. ", "4. ")
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <div key={idx} className={`flex items-start gap-2 my-1.5 text-stone-800 ${indent >= 2 ? 'ml-5' : 'ml-0'}`}>
            <span className="font-mono font-bold text-[10px] text-[#8B5A2B] bg-[#F4F1EA] px-1.5 py-0.5 rounded-md shrink-0 border border-[#E6E1D3]">
              {numMatch[1]}
            </span>
            <div className="flex-1 leading-relaxed font-medium">
              {renderInlineMarkdown(numMatch[2])}
            </div>
          </div>
        );
      }

      // Empty line / paragraph break
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
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
    const parts: React.ReactNode[] = [];
    let remaining = str;
    let keyIdx = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const codeMatch = remaining.match(/`([^`]+)`/);
      const hwMatch = remaining.match(/\b([A-Z]{3}-\d{3})\b/);

      const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : -1;
      const codeIdx = codeMatch ? remaining.indexOf(codeMatch[0]) : -1;
      const hwIdx = hwMatch ? remaining.indexOf(hwMatch[0]) : -1;

      const candidates = [
        { type: 'bold', idx: boldIdx, match: boldMatch },
        { type: 'code', idx: codeIdx, match: codeMatch },
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
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded-md bg-[#F4F1EA] font-mono text-[11px] text-[#8B5A2B] border border-[#E6E1D3]">
            {earliest.match![1]}
          </code>
        );
        remaining = remaining.substring(earliest.idx + earliest.match![0].length);
      } else if (earliest.type === 'hw') {
        parts.push(
          <span key={keyIdx++} className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded-md bg-[#F4F1EA] font-mono font-semibold text-[10px] text-[#2C3A2B] border border-[#E6E1D3]">
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
                ? 'w-[95vw] sm:w-[680px] h-[82vh] max-h-[780px]'
                : 'w-[94vw] sm:w-[440px] h-[580px] max-h-[82vh]'
            }`}
          >
            {/* Header */}
            <div className="bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-xs z-10 border-b border-[#E6E1D3]">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#2C3A2B] text-emerald-300 shadow-xs shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif font-bold text-xs sm:text-sm text-[#2C2C1E] truncate">
                      Sahay AI
                    </h3>
                  </div>
                  <p className="text-[10px] text-[#8A8A88] truncate">Hardware Feasibility & Optimization</p>
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
                      className={`max-w-[88%] p-3 text-xs shadow-xs ${
                        isUser
                          ? 'bg-[#2C3A2B] text-white rounded-t-2xl rounded-bl-2xl whitespace-pre-wrap'
                          : 'bg-white border border-[#E6E1D3] text-[#2C2C1E] rounded-t-2xl rounded-br-2xl'
                      }`}
                    >
                      {/* Message Text */}
                      {isUser ? (
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="space-y-0.5">{renderFormattedText(msg.text)}</div>
                      )}

                      {/* Action Cards */}
                      {!isUser && msg.action && (
                        <div className="mt-3 pt-3 border-t border-[#E6E1D3]">
                          {msg.action.type === 'apply_bundle' && (
                            <div className="p-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl shadow-xs">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5 font-bold text-[#2C3A2B] text-[11px]">
                                  <Package className="w-3.5 h-3.5 text-[#8B5A2B]" />
                                  <span>{msg.action.title || 'Recommended Bundle'}</span>
                                </div>
                                {msg.action.budget && (
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-[#F4F1EA] text-[#8B5A2B] font-medium border border-[#E6E1D3]">
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
                                        className="flex items-center justify-between text-[10px] text-[#5A5A40] bg-white border border-[#E6E1D3]/60 px-2 py-1 rounded-md"
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
                                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
                              <div className="flex items-center gap-1.5 font-bold text-[#2C3A2B] text-[11px] mb-1">
                                <RefreshCw className="w-3.5 h-3.5 text-[#8B5A2B]" />
                                <span>Suggested Product Replacement</span>
                              </div>
                              <p className="text-[11px] text-[#5A5A40] mb-2 leading-relaxed">
                                {msg.action.reason}
                              </p>
                              {msg.action.productId && (
                                <div className="text-[10px] bg-white p-2 rounded-md mb-2 border border-[#E6E1D3] flex items-center justify-between">
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
                                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
                                <span className="font-bold text-[#2C3A2B] text-[11px]">
                                  Adjust Target Budget
                                </span>
                                <span className="font-mono font-bold text-[#8B5A2B] text-xs">
                                  {formatINR(msg.action.budget || 0)}
                                </span>
                              </div>
                              {msg.action.reason && (
                                <p className="text-[11px] text-[#5A5A40] mb-2 leading-relaxed">
                                  {msg.action.reason}
                                </p>
                              )}
                              <button
                                onClick={() => handleApplyAction(msg.id, msg.action)}
                                disabled={msg.actionApplied}
                                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
                                <div className="flex items-center gap-1.5 font-bold text-[#2C3A2B] text-[11px]">
                                  <Compass className="w-3.5 h-3.5 text-[#8B5A2B]" />
                                  <span>Navigate to {msg.action.tab ? (TAB_NAMES[msg.action.tab] || msg.action.tab) : 'Workspace'}</span>
                                </div>
                                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-md bg-[#F4F1EA] text-[#5A5A40] border border-[#E6E1D3]">
                                  /{msg.action.tab}
                                </span>
                              </div>
                              {msg.action.reason && (
                                <p className="text-[11px] text-[#5A5A40] mb-2 leading-relaxed">
                                  {msg.action.reason}
                                </p>
                              )}
                              <button
                                onClick={() => handleApplyAction(msg.id, msg.action)}
                                disabled={msg.actionApplied}
                                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
                        </div>
                      )}

                      <div
                        className={`text-[9px] mt-1.5 flex justify-end ${
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

            {/* Whole Website Starter Prompt Chips */}
            <div className="px-3 py-2 bg-[#FAF8F5] border-t border-[#E6E1D3]/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                type="button"
                onClick={() => handleSendMessage('Give me a complete overview of the whole website and its 9 pages.')}
                className="px-2.5 py-1 rounded-full bg-white border border-[#E6E1D3] text-[#2C3A2B] hover:border-[#8B5A2B] hover:bg-[#F5F5EC] shrink-0 transition-colors shadow-2xs font-medium cursor-pointer"
              >
                🌐 Whole Website Overview
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Explain the MBA unit economics, referral margins, and break-even basket threshold.')}
                className="px-2.5 py-1 rounded-full bg-white border border-[#E6E1D3] text-[#2C3A2B] hover:border-[#8B5A2B] hover:bg-[#F5F5EC] shrink-0 transition-colors shadow-2xs font-medium cursor-pointer"
              >
                📊 MBA Economics
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('How does the Cartesian Auto-Solve algorithm work under the hood?')}
                className="px-2.5 py-1 rounded-full bg-white border border-[#E6E1D3] text-[#2C3A2B] hover:border-[#8B5A2B] hover:bg-[#F5F5EC] shrink-0 transition-colors shadow-2xs font-medium cursor-pointer"
              >
                ⚡ Auto-Solve Logic
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('What edge cases and tests are verified in the Automated Test Suite?')}
                className="px-2.5 py-1 rounded-full bg-white border border-[#E6E1D3] text-[#2C3A2B] hover:border-[#8B5A2B] hover:bg-[#F5F5EC] shrink-0 transition-colors shadow-2xs font-medium cursor-pointer"
              >
                🧪 Test Suite
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Check my current bundle for any hardware compatibility conflicts and fix them.')}
                className="px-2.5 py-1 rounded-full bg-white border border-[#E6E1D3] text-[#2C3A2B] hover:border-[#8B5A2B] hover:bg-[#F5F5EC] shrink-0 transition-colors shadow-2xs font-medium cursor-pointer"
              >
                🔧 Fix Conflicts
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Compare the Starter Pack, Developer Pro, and Executive Ultra presets.')}
                className="px-2.5 py-1 rounded-full bg-white border border-[#E6E1D3] text-[#2C3A2B] hover:border-[#8B5A2B] hover:bg-[#F5F5EC] shrink-0 transition-colors shadow-2xs font-medium cursor-pointer"
              >
                ⚖️ Compare Presets
              </button>
            </div>

            {/* Input Area */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="bg-white p-3 border-t border-[#E6E1D3] flex items-center space-x-2"
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
                className="flex-1 bg-[#F4F1EA] border-none rounded-full px-4 py-2.5 text-xs focus:ring-1 focus:ring-[#2C3A2B] outline-none placeholder-[#8A8A88] text-[#2C2C1E]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 bg-[#2C3A2B] text-white rounded-full hover:bg-[#1B281B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { AIAssistantDrawer as FloatingChat };
