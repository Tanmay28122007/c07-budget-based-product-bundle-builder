import React from 'react';
import {
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  Coins,
  TrendingUp,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Download,
  AlertTriangle,
  Check,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import { exportBundleToCSV, exportTestResultsToCSV, downloadFile } from '../../utils/exportUtils';

export const DashboardPage: React.FC = () => {
  const {
    fixture,
    budget,
    currentItems,
    validation,
    savedBundles,
    testResults,
    setActiveTab,
    runTestSuite,
    resetBundle,
    optimizeBundle,
    loadSavedBundle
  } = useApp();

  // Metrics computation from real loaded datasets
  const availableProductsCount = fixture.products.filter(
    p => p.inStock && (p.stockQuantity === undefined || p.stockQuantity > 0)
  ).length;

  const totalRequiredSlots = fixture.activity.requiredSlots.length;

  const validSavedBundlesCount = savedBundles.filter(b => b.validation.isValid).length;

  // Average cost of valid saved bundles or current bundle
  const validBundlesList = savedBundles.filter(b => b.validation.isValid);
  const avgBundleCost = validBundlesList.length > 0
    ? Math.round(validBundlesList.reduce((acc, b) => acc + b.validation.landedPrice.landedPrice, 0) / validBundlesList.length)
    : (validation.isValid ? validation.landedPrice.landedPrice : null);

  // Budget compliance rate from test suite results if executed, else from saved bundles
  let complianceRateStr = 'Not yet measured';
  if (testResults.length > 0) {
    const passedCount = testResults.filter(t => t.passed).length;
    const rate = Math.round((passedCount / testResults.length) * 100);
    complianceRateStr = `${rate}% (${passedCount}/${testResults.length} tests)`;
  } else if (savedBundles.length > 0) {
    const rate = Math.round((validSavedBundlesCount / savedBundles.length) * 100);
    complianceRateStr = `${rate}% (${validSavedBundlesCount}/${savedBundles.length} saved)`;
  }

  const handleExportBundle = () => {
    const csv = exportBundleToCSV(
      'Active Workspace Bundle',
      fixture.activity.name,
      budget,
      currentItems,
      validation.landedPrice,
      validation.isValid
    );
    downloadFile(csv, `bundle_export_${Date.now()}.csv`, 'text/csv');
  };

  const handleExportTests = () => {
    if (testResults.length === 0) {
      runTestSuite();
    }
    const csv = exportTestResultsToCSV(testResults);
    downloadFile(csv, `test_results_${Date.now()}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Contextual Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900">
            Bundle Builder Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage product bundles, validate compatibility, and optimise spending.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => optimizeBundle('lowest_cost')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
            Auto-Find Valid Setup
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg shadow-xs transition-colors"
          >
            Continue Building
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Metric 1: Available Products */}
        <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Available Products</span>
            <Package className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-stone-900">
            {availableProductsCount}
            <span className="text-xs font-normal text-stone-400 ml-1">/ {fixture.products.length} in stock</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Live active inventory</p>
        </div>

        {/* Metric 2: Required Slots */}
        <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Required Slots</span>
            <Layers className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-stone-900">
            {validation.filledSlotCount}
            <span className="text-xs font-normal text-stone-400 ml-1">/ {totalRequiredSlots} filled</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {validation.isComplete ? 'All slots assigned' : `${validation.missingSlotIds.length} slots empty`}
          </p>
        </div>

        {/* Metric 3: Valid Bundles */}
        <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Valid Bundles</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-stone-900">
            {validSavedBundlesCount}
            <span className="text-xs font-normal text-stone-400 ml-1">saved</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Zero rule violations</p>
        </div>

        {/* Metric 4: Average Bundle Cost */}
        <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Avg Bundle Cost</span>
            <Coins className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-stone-900">
            {avgBundleCost !== null ? formatINR(avgBundleCost) : 'Not yet measured'}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Final landed price</p>
        </div>

        {/* Metric 5: Budget Compliance Rate */}
        <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Compliance Rate</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-stone-900">
            {complianceRateStr}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Rule & budget bounds</p>
        </div>
      </div>

      {/* Main Grid: Current Bundle Card + Budget Utilisation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Current Bundle Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-stone-200/80 rounded-xl shadow-2xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
              <div>
                <div className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Active Configuration
                </div>
                <h2 className="text-base font-bold text-stone-900">
                  {fixture.activity.name} Workstation
                </h2>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {validation.isValid ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/70">
                    <Check className="w-3.5 h-3.5" />
                    Valid Bundle
                  </span>
                ) : !validation.isComplete ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200/70">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Incomplete ({validation.filledSlotCount}/{validation.totalSlotCount})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200/70">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Constraint Violations
                  </span>
                )}
              </div>
            </div>

            {/* Price & Budget Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-stone-100">
              <div>
                <span className="text-[11px] text-stone-500 block">Customer Budget</span>
                <span className="text-sm font-bold font-mono tabular-nums text-stone-900">
                  {formatINR(budget)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block">Product Subtotal</span>
                <span className="text-sm font-semibold font-mono tabular-nums text-stone-800">
                  {formatINR(validation.landedPrice.productSubtotal)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block">Shipping & Taxes</span>
                <span className="text-sm font-semibold font-mono tabular-nums text-stone-800">
                  {formatINR(validation.landedPrice.netShipping + validation.landedPrice.taxAmount)}
                </span>
                <span className="text-[10px] text-stone-400 block font-mono">
                  Ship: {formatINR(validation.landedPrice.netShipping)} · GST: {formatINR(validation.landedPrice.taxAmount)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block">Final Landed Price</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    validation.landedPrice.isOverBudget ? 'text-rose-600' : 'text-indigo-950'
                  }`}
                >
                  {formatINR(validation.landedPrice.landedPrice)}
                </span>
              </div>
            </div>

            {/* Status Message & Limiting Factor Notice */}
            <div className="py-3">
              <div className="text-xs text-stone-600 flex items-start gap-2">
                <span className="font-semibold text-stone-800 shrink-0">Status note:</span>
                <span className="leading-relaxed">{validation.statusMessage}</span>
              </div>
              {validation.compatibilityViolations.length > 0 && (
                <div className="mt-2 p-3 rounded-lg bg-rose-50 border border-rose-200/70 text-xs text-rose-800">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Compatibility conflict detected:
                  </div>
                  <p className="mt-1 leading-relaxed text-rose-700">
                    {validation.compatibilityViolations[0].message}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('builder')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  Continue Building
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetBundle}
                  className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Slots
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportBundle}
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-stone-500" />
                  Export Bundle CSV
                </button>
              </div>
            </div>
          </div>

          {/* Section C: Required Slot Status Card */}
          <div className="bg-white border border-stone-200/80 rounded-xl shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Required Product Slots</h3>
                <p className="text-xs text-stone-500">
                  Current assignment and inventory availability across all {fixture.activity.requiredSlots.length} categories.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('builder')}
                className="text-xs font-medium text-indigo-700 hover:underline"
              >
                Manage in Builder
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
              {fixture.activity.requiredSlots.map(slot => {
                const prod = currentItems[slot.id];
                const isAssigned = Boolean(prod);
                const isInStock = prod ? (prod.inStock && (prod.stockQuantity === undefined || prod.stockQuantity > 0)) : true;

                return (
                  <div
                    key={slot.id}
                    className="p-3 rounded-lg border border-stone-200/80 bg-stone-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                          {slot.label}
                        </span>
                        {isAssigned ? (
                          isInStock ? (
                            <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" /> Filled
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-700 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Out of stock
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-stone-400 font-medium">Empty</span>
                        )}
                      </div>

                      {prod ? (
                        <div className="mt-1">
                          <div className="text-xs font-medium text-stone-900 line-clamp-1">{prod.name}</div>
                          <div className="text-[11px] font-mono tabular-nums text-stone-600 mt-0.5">
                            {formatINR(prod.price)}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-stone-400 italic">
                          No product selected
                        </div>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-end">
                      <button
                        onClick={() => setActiveTab('builder')}
                        className="text-[11px] font-medium text-indigo-700 hover:text-indigo-900"
                      >
                        {isAssigned ? 'Replace' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Budget Utilisation & Quick Actions */}
        <div className="space-y-6">
          {/* Section B: Budget Utilisation Card */}
          <div className="bg-white border border-stone-200/80 rounded-xl shadow-2xs p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Budget Utilisation</h3>
            <p className="text-xs text-stone-500 mb-4">
              Real-time expenditure vs customer limit
            </p>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Landed Expenditure</span>
                <span className="font-mono tabular-nums font-semibold text-stone-900">
                  {validation.landedPrice.budgetUtilisationPercent.toFixed(1)}%
                </span>
              </div>

              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    validation.landedPrice.isOverBudget
                      ? 'bg-rose-500'
                      : validation.landedPrice.budgetUtilisationPercent > 90
                      ? 'bg-amber-500'
                      : 'bg-indigo-700'
                  }`}
                  style={{
                    width: `${Math.min(validation.landedPrice.budgetUtilisationPercent, 100)}%`
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="text-stone-500">
                  Spent: <span className="font-mono font-medium text-stone-800">{formatINR(validation.landedPrice.landedPrice)}</span>
                </div>
                <div className={validation.landedPrice.isOverBudget ? 'text-rose-600 font-semibold' : 'text-stone-600'}>
                  {validation.landedPrice.isOverBudget ? 'Exceeded by: ' : 'Remaining: '}
                  <span className="font-mono font-medium">
                    {formatINR(Math.abs(validation.landedPrice.remainingBudget))}
                  </span>
                </div>
              </div>
            </div>

            {validation.landedPrice.isOverBudget && (
              <div className="mt-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Over Budget Alert:</span> The selected configuration exceeds the specified limit by {formatINR(Math.abs(validation.landedPrice.remainingBudget))}. Adjust slots or increase budget.
                </div>
              </div>
            )}
          </div>

          {/* Section E: Quick Actions */}
          <div className="bg-white border border-stone-200/80 rounded-xl shadow-2xs p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-3">Quick Actions</h3>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('builder')}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 border border-stone-200/80 flex items-center justify-between"
              >
                <span>Open Bundle Builder</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                onClick={() => setActiveTab('catalogue')}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 border border-stone-200/80 flex items-center justify-between"
              >
                <span>Browse Product Catalogue</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                onClick={() => setActiveTab('compare')}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 border border-stone-200/80 flex items-center justify-between"
              >
                <span>Compare Saved Bundles</span>
                <span className="text-[11px] font-mono text-stone-400">{savedBundles.length} saved</span>
              </button>

              <button
                onClick={() => {
                  runTestSuite();
                  setActiveTab('tests');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 border border-stone-200/80 flex items-center justify-between"
              >
                <span>Run Validation Suite</span>
                <span className="text-[11px] font-mono text-indigo-700 font-semibold">20 tests</span>
              </button>

              <button
                onClick={handleExportTests}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 border border-stone-200/80 flex items-center justify-between"
              >
                <span>Export Test Log (CSV)</span>
                <Download className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>

          {/* Section D: Recent Bundle Activity */}
          <div className="bg-white border border-stone-200/80 rounded-xl shadow-2xs p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Saved Bundle Records</h3>
            <p className="text-xs text-stone-500 mb-3">
              Locally saved setups in browser storage
            </p>

            {savedBundles.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-400 border border-dashed border-stone-200 rounded-lg">
                No saved bundles yet. Build and save a setup to compare later.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {savedBundles.slice(0, 4).map(b => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg border border-stone-200/70 bg-stone-50/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-stone-900 line-clamp-1">{b.name}</div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        {formatINR(b.validation.landedPrice.landedPrice)} · {b.savedAt}
                      </div>
                    </div>
                    <button
                      onClick={() => loadSavedBundle(b)}
                      className="px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-white rounded border border-transparent hover:border-stone-200"
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
