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
  PackagePlus,
  ShieldAlert,
  Wallet,
  TrendingDown,
  FileJson,
  FileSpreadsheet,
  Check,
  ArrowRight,
  Trash2,
  Plus,
  CreditCard
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
    toggleAssistant,
    setIsCartOpen,
    initiateCheckout
  } = useApp();

  const [activeSlotForSelection, setActiveSlotForSelection] = useState<RequiredSlot | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [bundleNameInput, setBundleNameInput] = useState('');
  const [bundleNotesInput, setBundleNotesInput] = useState('');
  const [optimizerPreference, setOptimizerPreference] = useState<'lowest_cost' | 'best_value'>('lowest_cost');
  const [optimizationFeedback, setOptimizationFeedback] = useState<string | null>(null);

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
    <div className="space-y-6 animate-fade-in-up">
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
          <div className="flex items-center rounded-xl border border-[#E6E1D3] bg-white p-0.5 shadow-2xs hover:shadow-sm transition-shadow">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-lg transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Find a Valid Bundle
            </button>
          </div>

          <button
            onClick={toggleAssistant}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#8B5A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] rounded-xl shadow-2xs hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
            AI Assistant
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#2C2C1E] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl shadow-2xs hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#8B8B7A]" />
            Save Bundle
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Reset all product slots"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Optimizer Feedback Banner if present */}
      {optimizationFeedback && (
        <div className="p-3.5 rounded-xl bg-white border border-[#E6E1D3] shadow-xs flex items-start justify-between gap-3 text-xs animate-fade-in-up">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#8B5A2B] shrink-0 mt-0.5" />
            <span className="text-[#2C2C1E] leading-relaxed">{optimizationFeedback}</span>
          </div>
          <button
            onClick={() => setOptimizationFeedback(null)}
            className="text-[#8B8B7A] hover:text-[#2C2C1E] text-xs font-mono cursor-pointer hover:scale-110 transition-transform"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Budget Configuration */}
      <div className="p-5 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs hover:shadow-md transition-shadow">
        <span className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider block mb-1">
          Total Budget (₹)
        </span>

        <div className="relative w-full sm:w-1/4 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B7A] font-mono text-xs">
            ₹
          </span>
          <input
            type="number"
            min="0"
            step="1000"
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            className="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold text-[#2C3A2B] bg-[#F4F1EA]/70 focus:bg-white border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] transition-all"
          />
        </div>
      </div>

      {/* Main Layout: Required Product Slots (Left) + Sticky Budget Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Slots Grid & Context Alerts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Slot Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D3]/80">
            <div>
              <h2 className="font-serif text-base font-bold text-[#2C3A2B]">
                Required Product Slots
              </h2>
              <p className="text-xs text-[#5A5A40] mt-0.5">
                Every bundle must fill all required categories with compatible, in-stock items.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border ${
                validation.isComplete
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : validation.filledSlotCount > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-[#F4F1EA] text-[#5A5A40] border-[#E6E1D3]'
              }`}>
                {validation.filledSlotCount} of {validation.totalSlotCount} slots filled
              </span>
            </div>
          </div>

          {/* Empty State Banner (when no slots filled yet) */}
          {validation.filledSlotCount === 0 && (
            <div className="p-5 rounded-[22px] bg-[#FDFBF7] border border-dashed border-[#D6CFBF] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#2C3A2B] text-amber-200 flex items-center justify-center shrink-0 shadow-xs">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#2C3A2B]">Your Bundle is Currently Empty</h3>
                  <p className="text-xs text-[#5A5A40] mt-0.5 leading-relaxed">
                    Select items for each required slot below, or let the intelligent optimizer find the best compatible configuration within your {formatINR(budget)} budget.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRunOptimizer}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Auto-Fill Optimal Bundle
              </button>
            </div>
          )}

          {/* Over-Budget Alert Banner (when total exceeds budget) */}
          {validation.landedPrice.isOverBudget && (
            <div className="p-4 rounded-[22px] bg-rose-50 border border-rose-200 text-xs text-rose-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif font-bold text-rose-800 text-sm">
                    Over Budget by {formatINR(Math.abs(validation.landedPrice.remainingBudget))}
                  </div>
                  <p className="text-rose-700 mt-0.5 leading-relaxed">
                    Total landed cost of {formatINR(validation.landedPrice.landedPrice)} exceeds your budget limit of {formatINR(budget)}. Swap items with lower-priced alternatives or increase your budget.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRunOptimizer}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-white hover:bg-rose-100 border border-rose-300 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                Auto-Fit to Budget
              </button>
            </div>
          )}

          {/* Compatibility Violation Alert Banner */}
          {validation.compatibilityViolations.length > 0 && (
            <div className="p-4 rounded-[22px] bg-rose-50 border border-rose-200 text-xs text-rose-900 shadow-2xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-serif font-bold text-rose-800 text-sm">
                  Compatibility Matrix Conflict
                </div>
                <p className="text-rose-700 mt-0.5 leading-relaxed">
                  {validation.compatibilityViolations[0].message}
                </p>
              </div>
            </div>
          )}

          {/* Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fixture.activity.requiredSlots.map(slot => (
              <RequiredSlotCard
                key={slot.id}
                slot={slot}
                product={currentItems[slot.id]}
                onOpenSelector={() => setActiveSlotForSelection(slot)}
                onRemove={() => removeProduct(slot.id)}
                compatibilityViolations={validation.compatibilityViolations}
                availableCount={fixture.products.filter(p => p.category === slot.category).length}
              />
            ))}
          </div>

          {/* Additional Items in Bundle Cart */}
          {Object.entries(currentItems).filter(
            ([slotId, prod]) => prod !== null && !fixture.activity.requiredSlots.some(s => s.id === slotId)
          ).length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[#E6E1D3]/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8B5A2B] flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-[#8B5A2B]" />
                  <span>
                    Additional Bundle Items ({
                      Object.entries(currentItems).filter(
                        ([slotId, prod]) => prod !== null && !fixture.activity.requiredSlots.some(s => s.id === slotId)
                      ).length
                    })
                  </span>
                </span>
                <span className="text-[11px] text-[#8B8B7A]">
                  Active in bundle cart
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(currentItems)
                  .filter(([slotId, prod]) => prod !== null && !fixture.activity.requiredSlots.some(s => s.id === slotId))
                  .map(([slotId, prod]) => {
                    const prodImg = prod!.image ? prod!.image.replace('../assets/', '/assets/').replace('./assets/', '/assets/') : `/assets/${prod!.id}.png`;
                    return (
                      <div
                        key={slotId}
                        className="p-4 rounded-2xl bg-white border border-[#E6E1D3] shadow-xs hover:border-[#2C3A2B]/40 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-xl bg-[#F5F5EC] border border-[#E6E1D3] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={prodImg}
                              alt={prod!.name}
                              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#8B5A2B] bg-[#F4F1EA] px-2 py-0.5 rounded border border-[#E6E1D3]">
                              {prod!.category}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-[#2C3A2B] truncate mt-1">
                              {prod!.name}
                            </h4>
                            <span className="font-mono font-bold text-xs text-[#2C3A2B] block mt-0.5">
                              {formatINR(prod!.price)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeProduct(slotId)}
                          className="p-2 text-[#8B8B7A] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                          title="Remove item from bundle cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Add More Items to Bundle Cart Card */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-[#D6CFBF] bg-[#FDFBF7]/80 hover:bg-[#F4F1EA] hover:border-[#8B5A2B] transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#E6E1D3] text-[#8B5A2B] flex items-center justify-center shadow-xs shrink-0">
                <PackagePlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#2C3A2B]">
                  Add More Items to Your Bundle Cart
                </h4>
                <p className="text-xs text-[#5A5A40] mt-0.5">
                  Pair extra notebooks, water bottles, backpacks, mugs, or accessories into your active order.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#2C3A2B] hover:bg-[#1E281D] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Add in Cart</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('catalogue')}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] shadow-2xs transition-colors cursor-pointer text-center"
              >
                Catalogue
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Sticky Landed Pricing & Validation Summary Panel */}
        <div className="sticky top-20 space-y-4">
          <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-sm p-5 space-y-4">
            {/* Summary Header & Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D3]/80">
              <h3 className="font-serif text-sm font-bold text-[#2C3A2B]">Budget & Landed Cost</h3>
              {validation.isValid ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#A3B18A]/25 text-[#2C3A2B] border border-[#A3B18A]/50 flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#2C3A2B]" /> Valid Bundle
                </span>
              ) : validation.landedPrice.isOverBudget ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Over Budget
                </span>
              ) : validation.compatibilityViolations.length > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-rose-600" /> Conflict
                </span>
              ) : validation.filledSlotCount === 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F1EA] text-[#5A5A40] border border-[#E6E1D3]">
                  Empty Bundle
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" /> Incomplete ({validation.filledSlotCount}/{validation.totalSlotCount})
                </span>
              )}
            </div>

            {/* KPI Metric Tiles: Landed Total & Remaining Budget */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Landed Total Metric */}
              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3]">
                <span className="text-[10px] font-mono font-bold text-[#8B5A2B] uppercase tracking-wider block">
                  Landed Total
                </span>
                <div className={`text-lg sm:text-xl font-bold font-mono tabular-nums mt-0.5 ${
                  validation.landedPrice.isOverBudget ? 'text-rose-600' : 'text-[#2C3A2B]'
                }`}>
                  {formatINR(validation.landedPrice.landedPrice)}
                </div>
                <span className="text-[10px] text-[#5A5A40] block mt-0.5">
                  {validation.filledSlotCount} items + charges
                </span>
              </div>

              {/* Remaining Budget Metric */}
              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3]">
                <span className="text-[10px] font-mono font-bold text-[#8B5A2B] uppercase tracking-wider block">
                  {validation.landedPrice.isOverBudget ? 'Budget Deficit' : 'Remaining Budget'}
                </span>
                <div className={`text-lg sm:text-xl font-bold font-mono tabular-nums mt-0.5 ${
                  validation.landedPrice.isOverBudget
                    ? 'text-rose-600'
                    : validation.landedPrice.remainingBudget === 0 && validation.filledSlotCount > 0
                    ? 'text-[#2C3A2B]'
                    : 'text-emerald-700'
                }`}>
                  {validation.landedPrice.isOverBudget
                    ? `-${formatINR(Math.abs(validation.landedPrice.remainingBudget))}`
                    : `+${formatINR(validation.landedPrice.remainingBudget)}`}
                </div>
                <div className="mt-0.5">
                  {validation.landedPrice.isOverBudget ? (
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                      Exceeded
                    </span>
                  ) : validation.landedPrice.remainingBudget === 0 && validation.filledSlotCount > 0 ? (
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Exact Fit
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Within Budget
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Budget Progress Meter */}
            <div className="pt-2 border-t border-[#E6E1D3]/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#5A5A40]">Budget Allocation:</span>
                <span className="font-mono font-bold text-[#2C3A2B]">{formatINR(budget)}</span>
              </div>

              <div className="w-full h-2.5 bg-[#F4F1EA] rounded-full overflow-hidden border border-[#E6E1D3] relative shadow-inner">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    validation.landedPrice.isOverBudget
                      ? 'bg-rose-500'
                      : validation.landedPrice.budgetUtilisationPercent > 90
                      ? 'bg-amber-500'
                      : 'bg-[#2C3A2B]'
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
                    ? `${formatINR(Math.abs(validation.landedPrice.remainingBudget))} over limit`
                    : `${formatINR(validation.landedPrice.remainingBudget)} headroom`}
                </span>
              </div>
            </div>

            {/* Price Stack Breakdown */}
            <div className="pt-2 border-t border-[#E6E1D3]/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#5A5A40]">
                <span>Product Subtotal ({validation.filledSlotCount} items)</span>
                <span className="font-mono tabular-nums font-semibold text-[#2C3A2B]">
                  {formatINR(validation.landedPrice.productSubtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#5A5A40]">
                <div className="flex items-center gap-1">
                  <span>Shipping Fee</span>
                  {validation.landedPrice.shippingDiscount > 0 ? (
                    <span className="text-[10px] text-emerald-700 font-semibold">(Free Tier)</span>
                  ) : (
                    <span className="text-[10px] text-[#8B8B7A]">(Flat Rate)</span>
                  )}
                </div>
                <span className="font-mono tabular-nums font-semibold text-[#2C3A2B]">
                  {formatINR(validation.landedPrice.netShipping)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#5A5A40]">
                <div className="flex items-center gap-1">
                  <span>Taxes</span>
                  <span className="text-[10px] text-[#8B8B7A]">
                    {fixture.taxRule.taxName || (fixture.taxRule.taxRate > 0 ? `${(fixture.taxRule.taxRate * 100).toFixed(0)}% GST` : 'Tax Included')}
                  </span>
                </div>
                <span className="font-mono tabular-nums font-semibold text-[#2C3A2B]">
                  {formatINR(validation.landedPrice.taxAmount)}
                </span>
              </div>

              <div className="pt-2.5 border-t border-[#E6E1D3] flex items-center justify-between font-bold text-sm">
                <span className="font-serif text-[#2C3A2B]">Total Landed Price</span>
                <span
                  className={`font-mono tabular-nums text-base ${
                    validation.landedPrice.isOverBudget ? 'text-rose-600' : 'text-[#2C3A2B]'
                  }`}
                >
                  {formatINR(validation.landedPrice.landedPrice)}
                </span>
              </div>
            </div>

            {/* Status Narrative Callout */}
            <div className={`p-3.5 rounded-xl border text-xs ${
              validation.isValid
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : validation.landedPrice.isOverBudget
                ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                : 'bg-[#FDFBF7] border-[#E6E1D3] text-[#2C3A2B]'
            }`}>
              <div className="font-serif font-bold flex items-center gap-1.5 mb-1">
                {validation.isValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                ) : validation.landedPrice.isOverBudget ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                )}
                Bundle Status
              </div>
              <p className="text-[11px] text-[#5A5A40] leading-relaxed">
                {validation.statusMessage}
              </p>
            </div>



            {/* BUY NOW Button */}
            <div className="pt-2">
              <button
                onClick={() => initiateCheckout()}
                disabled={Object.values(currentItems).filter(Boolean).length === 0}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#2C3A2B] hover:bg-[#1E281D] shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-4 h-4 text-amber-300" />
                <span>BUY NOW — {formatINR(validation.landedPrice.landedPrice)}</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
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
