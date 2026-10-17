import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Save,
  Download,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PackageCheck,
  FileJson,
  FileSpreadsheet,
  Check,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RequiredSlot } from '../../types';
import { formatINR } from '../../utils/pricing';
import { exportBundleToCSV, downloadFile } from '../../utils/exportUtils';
import { RequiredSlotCard } from './RequiredSlotCard';
import { ProductSelectorModal } from './ProductSelectorModal';

export const BundleBuilderPage: React.FC = () => {
  const {
    fixture,
    budget,
    setBudget,
    currentItems,
    validation,
    removeProduct,
    resetBundle,
    saveCurrentBundle,
    optimizeBundle,
    setActiveTab,
    toggleAssistant
  } = useApp();

  const [activeSlotForSelection, setActiveSlotForSelection] = useState<RequiredSlot | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [bundleNameInput, setBundleNameInput] = useState('');
  const [bundleNotesInput, setBundleNotesInput] = useState('');
  const [optimizerPreference, setOptimizerPreference] = useState<'lowest_cost' | 'best_value'>('lowest_cost');
  const [optimizationFeedback, setOptimizationFeedback] = useState<string | null>(null);

  const budgetPresets = fixture.activity.defaultBudget <= 10000 
    ? [1000, 1999, 2000, 2200, 3000]
    : [35000, 55000, 75000, 95000, 120000];

  const handleRunOptimizer = () => {
    const res = optimizeBundle(optimizerPreference);
    if (res.success) {
      setOptimizationFeedback(
        `Successfully assembled a valid bundle with landed cost ${formatINR(res.validation?.landedPrice.landedPrice || 0)} after evaluating ${res.combinationsEvaluated} combinations.`
      );
    } else {
      setOptimizationFeedback(
        `Infeasible: ${res.reason || 'No configuration satisfies constraints within the current budget.'}`
      );
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCurrentBundle(bundleNameInput.trim() || undefined, bundleNotesInput.trim() || undefined);
    setShowSaveModal(false);
    setBundleNameInput('');
    setBundleNotesInput('');
  };

  const handleExportCSV = () => {
    const csv = exportBundleToCSV(
      fixture.activity.name,
      fixture.activity.name,
      budget,
      currentItems,
      validation.landedPrice,
      validation.isValid
    );
    downloadFile(csv, `bundle_${Date.now()}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const data = {
      bundleName: fixture.activity.name,
      activity: fixture.activity,
      budget,
      selectedItems: currentItems,
      validation,
      exportedAt: new Date().toISOString()
    };
    downloadFile(JSON.stringify(data, null, 2), `bundle_${Date.now()}.json`, 'application/json');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#2C3A2B]">
            Build a Bundle
          </h1>
          <p className="text-xs text-[#5A5A40] mt-0.5">
            Assemble a complete set of compatible products within a fixed budget.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-[#E6E1D3] bg-white p-0.5 shadow-2xs">
            <select
              value={optimizerPreference}
              onChange={e => setOptimizerPreference(e.target.value as any)}
              className="text-xs text-[#2C2C1E] bg-transparent px-2.5 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="lowest_cost">Lowest Cost</option>
              <option value="best_value">Best Value</option>
            </select>
            <button
              onClick={handleRunOptimizer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Find a Valid Bundle
            </button>
          </div>

          <button
            onClick={toggleAssistant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#8B5A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
            AI Assistant
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C2C1E] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#8B8B7A]" />
            Save Bundle
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] rounded-xl transition-colors cursor-pointer"
            title="Reset all product slots"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Optimizer Feedback Banner if present */}
      {optimizationFeedback && (
        <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <span className="text-stone-700 leading-relaxed">{optimizationFeedback}</span>
          </div>
          <button
            onClick={() => setOptimizationFeedback(null)}
            className="text-stone-400 hover:text-stone-600 text-xs font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step 1 & Step 2 Configuration Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1: Activity Selector */}
        <div className="p-5 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider block mb-1">
            Step 1: Activity Context
          </span>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif text-base font-bold text-[#2C3A2B]">{fixture.activity.name}</div>
              <p className="text-xs text-[#5A5A40] mt-0.5 line-clamp-1">
                {fixture.activity.description}
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#F4F1EA] text-[#2C3A2B] font-semibold border border-[#E6E1D3] shrink-0">
              {fixture.activity.requiredSlots.length} Slots
            </span>
          </div>
        </div>

        {/* Step 2: Budget Input */}
        <div className="p-5 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider block mb-1">
            Step 2: Total Budget (₹)
          </span>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B7A] font-mono text-xs">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-1.5 text-sm font-mono font-bold text-[#2C3A2B] bg-[#F4F1EA]/70 focus:bg-white border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B]"
              />
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {budgetPresets.map(preset => (
                <button
                  key={preset}
                  onClick={() => setBudget(preset)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-colors shrink-0 cursor-pointer ${
                    budget === preset
                      ? 'bg-[#2C3A2B] text-white border-[#2C3A2B] font-semibold'
                      : 'bg-[#F4F1EA] hover:bg-[#E6E1D3] text-[#5A5A40] border-[#E6E1D3]'
                  }`}
                >
                  ₹{(preset / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Required Product Slots (Left) + Sticky Budget Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Slots Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-stone-200/80">
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Step 3: Required Product Slots
              </h2>
              <p className="text-xs text-stone-500">
                Each required category must be filled with a compatible, in-stock item.
              </p>
            </div>
            <span className="text-xs font-mono text-stone-500">
              {validation.filledSlotCount} of {validation.totalSlotCount} slots filled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fixture.activity.requiredSlots.map(slot => (
              <RequiredSlotCard
                key={slot.id}
                slot={slot}
                product={currentItems[slot.id]}
                onOpenSelector={() => setActiveSlotForSelection(slot)}
                onRemove={() => removeProduct(slot.id)}
                compatibilityViolations={validation.compatibilityViolations}
              />
            ))}
          </div>
        </div>

        {/* Right 1 Column: Sticky Landed Pricing & Validation Summary Panel */}
        <div className="sticky top-20 space-y-4">
          <div className="bg-white border border-stone-200/90 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900">Budget Summary</h3>
              {/* Overall Validity State Tag */}
              {validation.isValid ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Valid Setup
                </span>
              ) : !validation.isComplete ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                  Incomplete
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                  Invalid
                </span>
              )}
            </div>

            {/* Price Stack Calculation */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Product Subtotal ({validation.filledSlotCount} items)</span>
                <span className="font-mono tabular-nums font-medium text-stone-900">
                  {formatINR(validation.landedPrice.productSubtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <div className="flex items-center gap-1">
                  <span>Shipping Fee</span>
                  {validation.landedPrice.shippingDiscount > 0 && (
                    <span className="text-[10px] text-emerald-700 font-medium">Free Tier</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono tabular-nums font-medium text-stone-900">
                    {formatINR(validation.landedPrice.netShipping)}
                  </span>
                  {validation.landedPrice.heavyItemCount > 0 && (
                    <span className="text-[10px] text-stone-400 block font-mono">
                      (incl. {validation.landedPrice.heavyItemCount} heavy items)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <div className="flex items-center gap-1">
                  <span>Taxes (18% GST)</span>
                  <span className="text-[10px] text-stone-400">Standard rate</span>
                </div>
                <span className="font-mono tabular-nums font-medium text-stone-900">
                  {formatINR(validation.landedPrice.taxAmount)}
                </span>
              </div>

              <div className="pt-2.5 border-t border-[#E6E1D3] flex items-center justify-between font-bold text-sm">
                <span className="font-serif text-[#2C3A2B]">Final Landed Price</span>
                <span
                  className={`font-mono tabular-nums ${
                    validation.landedPrice.isOverBudget ? 'text-rose-600' : 'text-[#8B5A2B]'
                  }`}
                >
                  {formatINR(validation.landedPrice.landedPrice)}
                </span>
              </div>
            </div>

            {/* Budget Progress Meter */}
            <div className="pt-2 border-t border-[#E6E1D3] space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#5A5A40]">Customer Budget:</span>
                <span className="font-mono font-bold text-[#2C3A2B]">{formatINR(budget)}</span>
              </div>

              <div className="w-full h-2.5 bg-[#F4F1EA] rounded-full overflow-hidden border border-[#E6E1D3] relative shadow-inner">
                <div
                  className={`h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full relative overflow-hidden ${
                    validation.landedPrice.isOverBudget
                      ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                      : validation.landedPrice.budgetUtilisationPercent > 90
                      ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'bg-gradient-to-r from-[#2C3A2B] to-[#496148] shadow-[0_0_12px_rgba(44,58,43,0.3)]'
                  }`}
                  style={{
                    width: `${Math.min(validation.landedPrice.budgetUtilisationPercent, 100)}%`
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#5A5A40]">
                <span>{validation.landedPrice.budgetUtilisationPercent.toFixed(1)}% utilised</span>
                <span className={validation.landedPrice.isOverBudget ? 'text-rose-600 font-semibold' : 'text-emerald-700 font-medium'}>
                  {validation.landedPrice.isOverBudget
                    ? `Over by ${formatINR(Math.abs(validation.landedPrice.remainingBudget))}`
                    : `${formatINR(validation.landedPrice.remainingBudget)} remaining`}
                </span>
              </div>
            </div>

            {/* Status Narrative Callout */}
            <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3] text-xs">
              <div className="font-serif font-bold text-[#2C3A2B] flex items-center gap-1.5 mb-1">
                {validation.isValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
                Verification Status
              </div>
              <p className="text-[11px] text-[#5A5A40] leading-relaxed">
                {validation.statusMessage}
              </p>
            </div>

            {/* AI Assistant Context Helper */}
            {(!validation.isValid || validation.compatibilityViolations.length > 0) && (
              <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] text-xs shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-serif font-bold text-[#2C3A2B] text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                    <span>Need AI Optimization?</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[#8B5A2B]/15 text-[#8B5A2B] font-bold">
                    Gemini
                  </span>
                </div>
                <p className="text-[11px] text-[#5A5A40] mb-2 leading-relaxed">
                  Let Gemini diagnose your configuration conflicts and automatically assemble an optimal, compatible setup.
                </p>
                <button
                  onClick={toggleAssistant}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[#8B5A2B] hover:bg-[#743815] text-white flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Resolve with AI Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Export Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex-1 py-1.5 px-2 text-xs font-medium text-[#2C2C1E] hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#8B8B7A]" />
                CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="flex-1 py-1.5 px-2 text-xs font-medium text-[#2C2C1E] hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5 text-[#8B8B7A]" />
                JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      {activeSlotForSelection && (
        <ProductSelectorModal
          slot={activeSlotForSelection}
          isOpen={Boolean(activeSlotForSelection)}
          onClose={() => setActiveSlotForSelection(null)}
        />
      )}

      {/* Save Bundle Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-[#2C2C1E]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full border border-[#E6E1D3] p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#2C3A2B]">Save Bundle Setup</h3>
            <p className="text-xs text-[#5A5A40]">
              Save this bundle configuration to your browser storage for comparison and audit trails.
            </p>

            <form onSubmit={handleSaveSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#2C3A2B] block mb-1">
                  Bundle Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Budget Ergonomic WFH Setup"
                  value={bundleNameInput}
                  onChange={e => setBundleNameInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E6E1D3] bg-[#F4F1EA]/60 focus:bg-white rounded-xl focus:outline-hidden focus:border-[#2C3A2B] text-[#2C2C1E]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#2C3A2B] block mb-1">
                  Notes / Rationales (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Selected for Tier-1 lumbar support and dual-screen compatibility."
                  value={bundleNotesInput}
                  onChange={e => setBundleNotesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E6E1D3] bg-[#F4F1EA]/60 focus:bg-white rounded-xl focus:outline-hidden focus:border-[#2C3A2B] text-[#2C2C1E]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-3.5 py-1.5 text-xs text-[#5A5A40] hover:bg-[#F4F1EA] rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#8B5A2B] hover:bg-[#743815] rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-[#2C2C1E]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full border border-[#E6E1D3] p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-base font-bold text-[#2C3A2B]">Reset Current Workspace?</h3>
            <p className="text-xs text-[#5A5A40] leading-relaxed">
              This will clear all selected products from the slots. You can reload previously saved bundles at any time.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs text-[#5A5A40] hover:bg-[#F4F1EA] rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetBundle();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs cursor-pointer"
              >
                Clear All Slots
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
