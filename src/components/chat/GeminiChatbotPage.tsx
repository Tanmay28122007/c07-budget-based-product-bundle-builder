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
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatINR } from '../../utils/pricing';

export type ChatbotRole = 'workspace_architect' | 'rapid_checker' | 'procurement_strategist' | 'custom';
export type GeminiModel = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  model?: string;
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
    name: 'Ergonomic Workspace Architect',
    badge: 'General Tasks',
    defaultModel: 'gemini-3.8-flash',
    icon: Bot,
    description: 'Expert in human factors, spinal posture, monitor heights, eye-strain mitigation, screenbar mounting, and complete bundle ergonomics.',
    systemInstruction: 'You are an Ergonomic Workspace Architect. Guide users in building healthy, productive, high-efficiency desk setups. Explain ergonomic angles, lumbar support grades, monitor positioning, and glare prevention with clear anatomical rationale.',
    starterPrompts: [
      'Assemble an ergonomic setup for 8+ hour remote software engineering under ₹80,000.',
      'How does monitor curvature affect screenbar clamp mounting and eye focal distance?',
      'Recommend an optimal chair with 3D armrests and lumbar support within our catalogue.',
      'Check if my current monitor and desk pairing creates any tipping or overhang risk.'
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
      'Can a screenbar clamp mount on the 34-inch curved ultrawide monitor?',
      'Verify dock power delivery against 85W laptop power consumption.',
      'Which desks in the catalogue have a surface width of 120cm or wider?'
    ]
  },
  procurement_strategist: {
    name: 'Procurement & Unit Economics Analyst',
    badge: 'Complex Tasks',
    defaultModel: 'gemini-4-argon',
    icon: Brain,
    description: 'Deep financial reasoning covering landed price modeling, shipping surcharge thresholds, platform referral fees, and B2B volume pricing.',
    systemInstruction: 'You are a Senior IT Procurement & Unit Economics Strategist. Analyze landed margins, shipping fee breakpoints, tax implications, platform commission referral models, and basket economics with rigorous quantitative detail.',
    starterPrompts: [
      'Analyze the landed price breakdown and determine if we qualify for free shipping threshold.',
      'Evaluate the unit economics and platform gross margin for a ₹75,000 WFH bundle.',
      'How can we restructure items to maximize budget utilization without crossing the budget ceiling?',
      'Perform a sensitivity analysis of shipping surcharges on heavy items (desks vs chairs).'
    ]
  },
  custom: {
    name: 'Custom Persona / Prompt',
    badge: 'Configurable',
    defaultModel: 'gemini-3.8-flash',
    icon: Settings2,
    description: 'Define your own specialized chatbot persona, custom system instructions, and task parameters.',
    systemInstruction: 'You are a specialized hardware consultant for budget-conscious corporate IT equipment.',
    starterPrompts: [
      'Evaluate this setup for a junior developer onboarding package.',
      'Provide a side-by-side comparison between mechanical standing desks and fixed desks.',
      'Suggest a minimalist aesthetic bundle with clean cable management.'
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
    setActiveTab
  } = useApp();

  const [activeRole, setActiveRole] = useState<ChatbotRole>('workspace_architect');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3.8-flash');
  const [customInstruction, setCustomInstruction] = useState<string>(
    ROLE_DEFINITIONS.workspace_architect.systemInstruction
  );
  const [showSystemInstruction, setShowSystemInstruction] = useState(false);
  const [attachWorkspaceContext, setAttachWorkspaceContext] = useState(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-chat',
      role: 'assistant',
      text: `Welcome to the **Gemini Multi-Turn Hardware Chatbot**!

I can assist you across several specialized roles:
1. **Ergonomic Workspace Architect** (*gemini-3.8-flash*): Comprehensive ergonomic bundle assembly & postural design.
2. **Rapid Compatibility Checker** (*gemini-3.1-flash-lite*): Lightning-fast dimensional and port validation.
3. **Procurement & Unit Economics Analyst** (*gemini-4-argon*): Quantitative landed cost, shipping thresholds, and margin analysis.

Your active bundle context is currently **${attachWorkspaceContext ? 'synced' : 'disconnected'}**. What would you like to discuss?`,
      model: 'gemini-3.8-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // When active role changes, update default model & instruction if user hasn't heavily customized
  const handleRoleChange = (role: ChatbotRole) => {
    setActiveRole(role);
    setSelectedModel(ROLE_DEFINITIONS[role].defaultModel);
    setCustomInstruction(ROLE_DEFINITIONS[role].systemInstruction);
  };

  // Interactive Guidance Toolkit State
  const [activeToolkitTab, setActiveToolkitTab] = useState<'assembly' | 'troubleshoot' | 'catalogue' | null>('assembly');
  const [targetBudgetInput, setTargetBudgetInput] = useState<number>(budget || 75000);
  const [bundlePriority, setBundlePriority] = useState<'cost_effective' | 'ergonomic_tier1'>('ergonomic_tier1');
  const [selectedCatalogueCategory, setSelectedCatalogueCategory] = useState<string>('all');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleTriggerAssemblyGuide = () => {
    const priorityDesc = bundlePriority === 'cost_effective'
      ? 'cost-effectiveness and maximizing budget savings with reliable hardware'
      : 'highest ergonomic grade (Tier-1 lumbar support, 3D adjustable armrests, eye-level monitor height, non-glare asymmetric lighting)';
    const prompt = `Please assemble an optimal, 100% compatible product bundle for the "${fixture.activity.name}" activity with a target landed budget of ${formatINR(targetBudgetInput)}.
Goal: ${priorityDesc}.
Verify that all proposed products are in-stock, confirm that monitor clamp geometry and desk surface width clearance are satisfied, compute landed pricing with shipping & 18% GST, and provide the 1-click apply action.`;
    handleSendMessage(prompt);
  };

  const handleTriggerTroubleshoot = (violation?: any) => {
    if (violation) {
      const prompt = `Compatibility Troubleshooting:
Conflict Type: ${violation.ruleId}
Rule Details: ${violation.message}
Conflicting Hardware: "${violation.sourceProductName}" (${violation.sourceProductId}) and "${violation.targetProductName || 'setup'}" (${violation.targetProductId || ''}).
Please explain why this physical/electrical conflict exists and propose an in-stock replacement from our catalogue with a 1-click swap action.`;
      handleSendMessage(prompt);
    } else {
      const prompt = `Please perform a complete compatibility troubleshooting inspection on my current bundle (${validation.filledSlotCount} of ${validation.totalSlotCount} slots filled). Check monitor clamp safety, desk width vs monitor curvature, dock power delivery wattage vs consumption, and chair armrest clearance.`;
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
Please provide an in-depth ergonomic & procurement evaluation for this product based on our current catalogue context, including its key advantages, target user persona, and landed budget impact.`;
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
      // Build context only if enabled
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

      // Multi-turn history maintaining previous conversation turns
      const historyPayload = messages.slice(-15).map(m => ({
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
          model: selectedModel,
          role: activeRole,
          systemInstruction: customInstruction
        })
      });

      if (!res.ok) {
        throw new Error(`Chat API error (${res.status}): ${res.statusText}`);
      }

      const data = await res.json();

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || "I've analyzed your prompt.",
        model: data.model || selectedModel,
        action: data.action || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `Sorry, an error occurred while processing your request with ${selectedModel}: ${err.message}.`,
        model: selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAction = (msgId: string, action: Message['action']) => {
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
    a.download = `gemini_chat_transcript_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        text: `Chat reset. I am ready as your **${ROLE_DEFINITIONS[activeRole].name}** using **${selectedModel}**. How can I help you?`,
        model: selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Basic formatted markdown renderer
  const renderFormatted = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-bold text-stone-900 text-sm mt-3 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-bold text-stone-900 text-base mt-4 mb-1">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-stone-700 my-0.5 leading-relaxed">
            {renderInlineMarkdown(line.substring(2))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-stone-700 my-0.5 leading-relaxed">
            {renderInlineMarkdown(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }
      if (line.startsWith('---')) {
        return <hr key={idx} className="my-2 border-stone-200" />;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-stone-700 my-1 leading-relaxed">
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
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded-md bg-[#F4F1EA] font-mono text-[11px] text-[#2C3A2B] border border-[#E6E1D3]">
            {codeMatch![1]}
          </code>
        );
        remaining = remaining.substring(codeIdx + codeMatch![0].length);
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
              <Bot className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl font-bold text-[#2C3A2B] tracking-tight">
                  Gemini Chatbot
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3]">
                  Multi-Turn
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#A3B18A]/20 text-[#2C3A2B] border border-[#A3B18A]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-[#5A5A40] mt-0.5">
                Multi-turn conversational intelligence tailored for workspace configuration, rapid hardware checking, and procurement analytics.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
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
                  <span className={`font-mono px-1.5 py-0.2 rounded ${isSelected ? 'bg-[#2C3A2B] text-white font-bold' : 'bg-[#E6E1D3] text-[#5A5A40]'}`}>
                    {r.defaultModel}
                  </span>
                  <span className="text-[#8B8B7A] font-medium">{r.badge}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Configuration Bar: Model Selector, System Instruction, Context Toggle */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Model Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Model:</span>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value as GeminiModel)}
                className="px-2.5 py-1 text-xs font-mono font-semibold bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-800 cursor-pointer"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (General Tasks)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
                <option value="gemini-4-argon">gemini-4-argon (Complex Tasks)</option>
              </select>
            </div>

            {/* System Instruction View/Edit Toggle */}
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
                ₹{budget.toLocaleString('en-IN')} Budget ({validation.filledSlotCount}/{validation.totalSlotCount} Slots)
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
                Reset to Role Default
              </button>
            </div>
            <textarea
              rows={3}
              value={customInstruction}
              onChange={e => setCustomInstruction(e.target.value)}
              className="w-full text-xs font-mono p-2.5 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-800 text-stone-800"
              placeholder="Enter system instruction to direct the chatbot role and persona..."
            />
            <p className="text-[11px] text-stone-500">
              This prompt is delivered to Gemini alongside catalogue specs, landed pricing rules, and real-time compatibility matrix data.
            </p>
          </div>
        )}
      </div>

      {/* Interactive Guidance Hub: Assembly, Troubleshooting & Catalogue Explorer */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-700" />
            <h2 className="text-xs font-bold text-stone-900 tracking-tight uppercase">
              Interactive Gemini Guidance Hub
            </h2>
          </div>

          {/* Hub Tab Switcher */}
          <div className="flex items-center gap-1 bg-stone-100/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveToolkitTab(activeToolkitTab === 'assembly' ? null : 'assembly')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeToolkitTab === 'assembly'
                  ? 'bg-white text-indigo-950 font-semibold shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <PackagePlus className="w-3.5 h-3.5 text-indigo-700" />
              <span>Bundle Assembly</span>
            </button>

            <button
              onClick={() => setActiveToolkitTab(activeToolkitTab === 'troubleshoot' ? null : 'troubleshoot')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeToolkitTab === 'troubleshoot'
                  ? 'bg-white text-indigo-950 font-semibold shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${validation.compatibilityViolations.length > 0 ? 'text-amber-600' : 'text-stone-500'}`} />
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
                  ? 'bg-white text-indigo-950 font-semibold shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-700" />
              <span>Catalogue Recommendations</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Bundle Assembly Guidance */}
        {activeToolkitTab === 'assembly' && (
          <div className="pt-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-600 block">
                Target Landed Budget
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="1000"
                  min="20000"
                  max="300000"
                  value={targetBudgetInput}
                  onChange={e => setTargetBudgetInput(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold border border-[#E6E1D3] rounded-lg bg-white text-[#2C3A2B] focus:outline-hidden focus:ring-1 focus:ring-[#2C3A2B]"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                {[45000, 65000, 80000, 100000].map(amt => (
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
                <option value="ergonomic_tier1">Ergonomic Tier-1 & Spine Alignment</option>
                <option value="cost_effective">Cost-Effective Maximum Savings</option>
              </select>
              <p className="text-[10px] text-[#5A5A40] line-clamp-1">
                {bundlePriority === 'ergonomic_tier1'
                  ? '3D armrests, lumbar support, dual QHD monitor support'
                  : 'Meets activity slot requirements at the lowest landed cost'}
              </p>
            </div>

            <div className="flex flex-col justify-end h-full">
              <button
                disabled={isLoading}
                onClick={handleTriggerAssemblyGuide}
                className="w-full py-2.5 px-3 rounded-xl bg-[#2C3A2B] hover:bg-[#3A4D39] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5F5EC]" />
                <span>Ask Gemini to Assemble Bundle</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Compatibility Troubleshooting */}
        {activeToolkitTab === 'troubleshoot' && (
          <div className="pt-1 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800">
                Workspace Compatibility Diagnostics:
              </span>
              <button
                disabled={isLoading}
                onClick={() => handleTriggerTroubleshoot()}
                className="text-[11px] text-indigo-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Run Comprehensive Gemini Audit
              </button>
            </div>

            {validation.compatibilityViolations.length === 0 ? (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-950 font-medium">
                    All currently selected items satisfy physical dimensions, mounting clearance, and power rules.
                  </span>
                </div>
                <button
                  disabled={isLoading}
                  onClick={() => handleSendMessage("Are there any subtle hardware bottlenecks or future-proofing risks in my currently selected products?")}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100/50 text-emerald-900 font-semibold text-[11px] rounded-lg border border-emerald-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  Ask Gemini to Check Edge Cases
                </button>
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
                        <p className="text-rose-900 text-[11px] mt-0.5 leading-relaxed">
                          {v.message}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isLoading}
                      onClick={() => handleTriggerTroubleshoot(v)}
                      className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer self-end sm:self-center"
                    >
                      <Sparkles className="w-3 h-3 text-rose-200" />
                      <span>Troubleshoot Conflict with Gemini</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Catalogue Product Recommendations */}
        {activeToolkitTab === 'catalogue' && (
          <div className="pt-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {['all', 'desk', 'chair', 'monitor', 'laptop_stand_or_dock', 'lighting'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCatalogueCategory(cat);
                      setSelectedProductId('');
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                      selectedCatalogueCategory === cat
                        ? 'bg-[#2C3A2B] text-white font-semibold shadow-xs'
                        : 'bg-[#F5F5EC] text-[#5A5A40] hover:bg-[#F4F1EA] border border-[#E6E1D3]'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-mono text-stone-400">
                {fixture.products.filter(p => selectedCatalogueCategory === 'all' || p.category === selectedCatalogueCategory).length} items in catalogue
              </span>
            </div>

            {/* Product Selector Dropdown & Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div className="md:col-span-2">
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full p-2 text-xs border border-stone-200 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-800 cursor-pointer"
                >
                  <option value="">-- Choose a product from catalogue to evaluate --</option>
                  {fixture.products
                    .filter(p => selectedCatalogueCategory === 'all' || p.category === selectedCatalogueCategory)
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.id}] {p.name} - {formatINR(p.price)} ({p.category}) {p.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={!selectedProductId || isLoading}
                  onClick={() => {
                    const prod = fixture.products.find(p => p.id === selectedProductId);
                    if (prod) handleTriggerProductRecommendation(prod, 'evaluate');
                  }}
                  className="flex-1 py-2 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-semibold text-xs rounded-lg border border-indigo-200 shadow-2xs transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  Evaluate Item
                </button>
                <button
                  disabled={!selectedProductId || isLoading}
                  onClick={() => {
                    const prod = fixture.products.find(p => p.id === selectedProductId);
                    if (prod) handleTriggerProductRecommendation(prod, 'compat');
                  }}
                  className="flex-1 py-2 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-lg border border-stone-200 shadow-2xs transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  Verify Fit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Conversation Container */}
      <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-sm flex flex-col min-h-[560px]">
        {/* Role Quick Prompts Strip */}
        <div className="p-3 bg-[#FDFBF7] border-b border-[#E6E1D3] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-[#8B8B7A] uppercase tracking-wider shrink-0 mr-1">
            Starters:
          </span>
          {ROLE_DEFINITIONS[activeRole].starterPrompts.map((prompt, i) => (
            <button
              key={i}
              disabled={isLoading}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 px-3 py-1 text-xs font-medium rounded-full bg-white border border-[#E6E1D3] text-[#5A5A40] hover:text-[#2C3A2B] hover:border-[#8B5A2B] hover:bg-[#F4F1EA] transition-colors cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

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
                    <Bot className="w-4 h-4 text-emerald-300" />
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
                      {isUser ? 'You' : `Gemini (${msg.model || selectedModel})`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${isUser ? 'text-emerald-200' : 'text-[#8B8B7A]'}`}>
                        {msg.timestamp}
                      </span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="text-stone-400 hover:text-stone-600 transition-colors p-0.5"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className={isUser ? 'text-white' : 'text-stone-800'}>
                    {isUser ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      renderFormatted(msg.text)
                    )}
                  </div>

                  {/* Interactive Action Card if returned by Gemini */}
                  {!isUser && msg.action && (
                    <div className="mt-3 pt-3 border-t border-stone-200/80">
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

                          {msg.action.items && (
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
                                Bundle Applied to Builder Workspace
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-3.5 h-3.5" />
                                Apply Configuration to Bundle Builder
                              </>
                            )}
                          </button>
                        </div>
                      )}

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
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#2C3A2B] text-white shrink-0 flex items-center justify-center text-xs font-bold shadow-xs">
                    U
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-8 h-8 rounded-xl bg-[#2C3A2B] text-white shrink-0 flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 text-[#F5F5EC] animate-pulse" />
              </div>
              <div className="bg-white border border-[#E6E1D3] rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs flex items-center gap-2 text-[#5A5A40]">
                <span className="w-2 h-2 rounded-full bg-[#8B5A2B] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#8B5A2B] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#8B5A2B] animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs font-medium text-[#5A5A40] ml-1">
                  Gemini ({selectedModel}) is evaluating multi-turn context...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
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
                placeholder={`Ask ${ROLE_DEFINITIONS[activeRole].name} with ${selectedModel}...`}
                disabled={isLoading}
                className="w-full resize-none p-3 text-xs bg-[#F4F1EA]/70 hover:bg-[#F4F1EA] focus:bg-white border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] transition-colors placeholder:text-[#8B8B7A] text-[#2C2C1E]"
              />
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Send message to Gemini"
              className="p-3 rounded-xl bg-[#8B5A2B] hover:bg-[#743815] disabled:opacity-40 text-white shadow-xs transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[#8B8B7A] px-1 font-mono">
            <span>Press Enter to send, Shift+Enter for newline</span>
            <span>Role: {ROLE_DEFINITIONS[activeRole].name} • Model: {selectedModel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
