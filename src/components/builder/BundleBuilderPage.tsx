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

  const budgetPresets = [35000, 55000, 75000, 95000, 120000];

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
      'Work from Home Setup',
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
      bundleName: 'Work from Home Setup',
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
          <h1 className="text-xl font-bold tracking-tight text-stone-900">
            Build a Bundle
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Assemble a complete set of compatible products within a fixed budget.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-stone-200 bg-white p-0.5 shadow-2xs">
            <select
              value={optimizerPreference}
              onChange={e => setOptimizerPreference(e.target.value as any)}
              className="text-xs text-stone-600 bg-transparent px-2 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="lowest_cost">Lowest Cost</option>
              <option value="best_value">Best Value</option>
            </select>
            <button
              onClick={handleRunOptimizer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 rounded-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Find a Valid Bundle
            </button>
          </div>

          <button
            onClick={toggleAssistant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
            AI Assistant
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-stone-500" />
            Save Bundle
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
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
        <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
            Step 1: Activity Context
          </span>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-stone-900">{fixture.activity.name}</div>
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                {fixture.activity.description}
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-stone-100 text-stone-700 font-medium shrink-0">
              {fixture.activity.requiredSlots.length} Slots
            </span>
          </div>
        </div>

        {/* Step 2: Budget Input */}
        <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
            Step 2: Total Budget (₹)
          </span>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-mono text-xs">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-1.5 text-sm font-mono font-bold text-stone-900 bg-stone-50 focus:bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-800"
              />
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {budgetPresets.map(preset => (
                <button
                  key={preset}
                  onClick={() => setBudget(preset)}
                  className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors shrink-0 ${
                    budget === preset
                      ? 'bg-indigo-900 text-white border-indigo-900 font-semibold'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
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

              <div className="pt-2.5 border-t border-stone-200 flex items-center justify-between font-bold text-sm">
                <span className="text-stone-900">Final Landed Price</span>
                <span
                  className={`font-mono tabular-nums ${
                    validation.landedPrice.isOverBudget ? 'text-rose-600' : 'text-indigo-950'
                  }`}
                >
                  {formatINR(validation.landedPrice.landedPrice)}
                </span>
              </div>
            </div>

            {/* Budget Progress Meter */}
            <div className="pt-2 border-t border-stone-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500">Customer Budget:</span>
                <span className="font-mono font-semibold text-stone-900">{formatINR(budget)}</span>
              </div>

              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    validation.landedPrice.isOverBudget
                      ? 'bg-rose-500'
                      : validation.landedPrice.budgetUtilisationPercent > 90
                      ? 'bg-amber-500'
                      : 'bg-indigo-800'
                  }`}
                  style={{
                    width: `${Math.min(validation.landedPrice.budgetUtilisationPercent, 100)}%`
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>{validation.landedPrice.budgetUtilisationPercent.toFixed(1)}% utilised</span>
                <span className={validation.landedPrice.isOverBudget ? 'text-rose-600 font-semibold' : 'text-emerald-700 font-medium'}>
                  {validation.landedPrice.isOverBudget
                    ? `Over by ${formatINR(Math.abs(validation.landedPrice.remainingBudget))}`
                    : `${formatINR(validation.landedPrice.remainingBudget)} remaining`}
                </span>
              </div>
            </div>

            {/* Status Narrative Callout */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
              <div className="font-semibold text-stone-800 flex items-center gap-1.5 mb-1">
                {validation.isValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
                Verification Status
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {validation.statusMessage}
              </p>
            </div>

            {/* AI Assistant Context Helper */}
            {(!validation.isValid || validation.compatibilityViolations.length > 0) && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/90 to-purple-50/60 border border-indigo-200/80 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-950 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Need AI Optimization?</span>
                  </div>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">
                    Gemini
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 mb-2 leading-relaxed">
                  Let Gemini diagnose your configuration conflicts and automatically assemble an optimal, compatible setup.
                </p>
                <button
                  onClick={toggleAssistant}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-900 hover:bg-indigo-950 text-white flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
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
                className="flex-1 py-1.5 px-2 text-xs font-medium text-stone-700 hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-stone-500" />
                CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="flex-1 py-1.5 px-2 text-xs font-medium text-stone-700 hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <FileJson className="w-3.5 h-3.5 text-stone-500" />
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
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-stone-900">Save Bundle Setup</h3>
            <p className="text-xs text-stone-500">
              Save this bundle configuration to your browser storage for comparison and audit trails.
            </p>

            <form onSubmit={handleSaveSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Bundle Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Budget Ergonomic WFH Setup"
                  value={bundleNameInput}
                  onChange={e => setBundleNameInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-800"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Notes / Rationales (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Selected for Tier-1 lumbar support and dual-screen compatibility."
                  value={bundleNotesInput}
                  onChange={e => setBundleNotesInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg shadow-2xs"
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
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-stone-200 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-stone-900">Reset Current Workspace?</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              This will clear all selected products from the slots. You can reload previously saved bundles at any time.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetBundle();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
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
