import React, { useState, useMemo } from 'react';
import {
  Columns,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Trash2,
  Check,
  PlusCircle,
  FileSpreadsheet,
  FileJson,
  RotateCcw,
  Save,
  PackagePlus,
  ShieldAlert,
  Wallet,
  AlertCircle,
  HelpCircle,
  Layers,
  LayoutGrid,
  Eye,
  SlidersHorizontal,
  BookmarkPlus,
  CreditCard,
  RefreshCw,
  Plus,
  Package
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import { SavedBundle, RequiredSlot } from '../../types';
import { exportBundleToCSV, downloadFile } from '../../utils/exportUtils';
import { RequiredSlotCard } from '../builder/RequiredSlotCard';
import { ProductSelectorModal } from '../builder/ProductSelectorModal';
import { BundleRecommendationsSection } from '../builder/BundleRecommendationsSection';
import { BundleRecommendation } from '../../utils/bundleRecommendations';
import { Product } from '../../types';
import { getProductImageUrl } from '../../utils/imageUtils';

interface CompareBundlesPageProps {
  initialMode?: 'workspace' | 'compare' | 'recommendations';
}

export const CompareBundlesPage: React.FC<CompareBundlesPageProps> = ({ initialMode }) => {
  const {
    fixture,
    budget,
    setBudget,
    currentItems,
    validation,
    removeProduct,
    resetBundle,
    setBundleItems,
    saveCurrentBundle,
    optimizeBundle,
    savedBundles,
    loadSavedBundle,
    deleteSavedBundle,
    setActiveTab,
    toggleAssistant,
    addNotification,
    initiateCheckout,
    addItemToCart
  } = useApp();

  // Mode state: 'recommendations' for curated bundles & add-ons, 'workspace' for custom builder, 'compare' for side-by-side comparison
  const [viewMode, setViewMode] = useState<'workspace' | 'compare' | 'recommendations'>(() => {
    if (initialMode) return initialMode;
    return 'recommendations';
  });

  // Builder workspace state
  const [activeSlotForSelection, setActiveSlotForSelection] = useState<RequiredSlot | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [bundleNameInput, setBundleNameInput] = useState('');
  const [bundleNotesInput, setBundleNotesInput] = useState('');
  const [optimizerPreference, setOptimizerPreference] = useState<'lowest_cost' | 'best_value'>('lowest_cost');
  const [optimizationFeedback, setOptimizationFeedback] = useState<string | null>(null);

  // Compare mode state
  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>(() => {
    return savedBundles.slice(0, 3).map(b => b.id);
  });
  const [includeActiveInComparison, setIncludeActiveInComparison] = useState(true);

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

  const handleSnapshotActive = () => {
    const newName = `Workspace Setup #${savedBundles.length + 1}`;
    saveCurrentBundle(newName, `Snapshot taken from Compare Builder at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  const handleExportActiveCSV = () => {
    const csv = exportBundleToCSV(
      fixture.activity.name,
      fixture.activity.name,
      budget,
      currentItems,
      validation.landedPrice,
      validation.isValid
    );
    downloadFile(csv, `bundle_active_${Date.now()}.csv`, 'text/csv');
  };

  const handleExportActiveJSON = () => {
    const data = {
      bundleName: fixture.activity.name,
      activity: fixture.activity,
      budget,
      selectedItems: currentItems,
      validation,
      exportedAt: new Date().toISOString()
    };
    downloadFile(JSON.stringify(data, null, 2), `bundle_active_${Date.now()}.json`, 'application/json');
  };

  const toggleSelectBundle = (id: string) => {
    setSelectedBundleIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        if (prev.length >= 3) {
          return [...prev.slice(1), id];
        }
        return [...prev, id];
      }
    });
  };

  // Virtual active bundle snapshot for real-time live comparison
  const activeWorkspaceBundle: SavedBundle = useMemo(() => ({
    id: 'active_workspace',
    name: 'Current Workspace (Draft)',
    activityId: fixture.activity.id,
    budget,
    items: currentItems,
    validation,
    savedAt: 'Live Draft',
    notes: 'Active working configuration'
  }), [fixture.activity.id, budget, currentItems, validation]);

  const bundlesToCompare = useMemo(() => {
    const saved = savedBundles.filter(b => selectedBundleIds.includes(b.id));
    if (includeActiveInComparison && validation.filledSlotCount > 0) {
      return [activeWorkspaceBundle, ...saved];
    }
    return saved;
  }, [savedBundles, selectedBundleIds, includeActiveInComparison, validation.filledSlotCount, activeWorkspaceBundle]);

  // Dynamic slot keys present across compared bundles (replaces hardcoded mouse/keyboard slots)
  const comparisonSlotKeys = useMemo(() => {
    const keys = new Set<string>();
    bundlesToCompare.forEach(b => {
      Object.keys(b.items).forEach(k => {
        if (b.items[k]) keys.add(k);
      });
    });
    if (keys.size === 0) {
      fixture.activity.requiredSlots.forEach(s => keys.add(s.id));
    }
    return Array.from(keys);
  }, [bundlesToCompare, fixture.activity.requiredSlots]);

  // Find minimum landed price among compared bundles to highlight the best deal
  const validCompared = bundlesToCompare.filter(b => b.validation.isValid);
  const minLandedPrice = validCompared.length > 0
    ? Math.min(...validCompared.map(b => b.validation.landedPrice.landedPrice))
    : 0;

  // Selected bundle recommendation state
  const [selectedBundle, setSelectedBundle] = useState<BundleRecommendation | null>(null);
  const [selectedWorkspaceAddonCategory, setSelectedWorkspaceAddonCategory] = useState<string>('all');

  // Active products configured in current bundle
  const activeBundleProducts = useMemo(() => {
    return Object.entries(currentItems)
      .filter(([_, prod]) => prod !== null) as [string, Product][];
  }, [currentItems]);

  // Handle selecting a recommended bundle from curated recommendations
  const handleSelectRecommendedBundle = (bundle: BundleRecommendation) => {
    setSelectedBundle(bundle);
    const newItems: Record<string, Product | null> = {};

    // Populate products of this specific bundle
    bundle.items.forEach(bundleItem => {
      const prod = bundleItem.product;
      const qty = bundleItem.quantity;
      for (let i = 0; i < qty; i++) {
        const slotKey = qty > 1
          ? `${prod.category} (${i + 1})`
          : (newItems[prod.category] ? `${prod.category}_${i + 1}` : prod.category);
        newItems[slotKey] = prod;
      }
    });

    const targetBudget = bundle.budget && bundle.budget > 0
      ? bundle.budget
      : Math.max(budget, Math.ceil(bundle.landedPrice / 100) * 100);

    setBundleItems(newItems, targetBudget);

    saveCurrentBundle(
      bundle.name,
      `Selected from Dynamic Recommendations. Landed: ${formatINR(bundle.landedPrice)}. ${bundle.matchExplanation}`
    );

    setViewMode('workspace');
    addNotification(
      'Bundle Loaded into Builder',
      `Loaded "${bundle.name}" (${bundle.totalItemCount} items, landed ${formatINR(bundle.landedPrice)}) into workspace.`,
      'success'
    );
  };

  // Remaining money to spend in active workspace
  const remainingHeadroom = Math.max(0, budget - validation.landedPrice.landedPrice);
  const activeProductIds = useMemo(() => {
    return new Set(activeBundleProducts.map(([_, p]) => p.id));
  }, [activeBundleProducts]);

  const affordableAddons = useMemo(() => {
    if (remainingHeadroom <= 0) return [];
    return fixture.products
      .filter(p => {
        const inStock = p.inStock && (p.stockQuantity ?? 1) > 0;
        const notInBundle = !activeProductIds.has(p.id);
        const fitsInBudget = p.price <= remainingHeadroom;
        return inStock && notInBundle && fitsInBudget;
      })
      .sort((a, b) => b.price - a.price);
  }, [fixture.products, remainingHeadroom, activeProductIds]);

  const addonCategories = useMemo(() => {
    return ['all', ...Array.from(new Set(affordableAddons.map(p => p.category)))];
  }, [affordableAddons]);

  const displayedWorkspaceAddons = useMemo(() => {
    if (selectedWorkspaceAddonCategory === 'all') return affordableAddons.slice(0, 8);
    return affordableAddons.filter(p => p.category === selectedWorkspaceAddonCategory).slice(0, 8);
  }, [affordableAddons, selectedWorkspaceAddonCategory]);

  const handleAddAddonToWorkspace = (prod: Product) => {
    addItemToCart(prod);
    addNotification(
      'Add-On Added',
      `Added "${prod.name}" (${formatINR(prod.price)}) to bundle. Remaining budget: ${formatINR(Math.max(0, remainingHeadroom - prod.price))}.`,
      'success'
    );
  };

  // Max price for bar chart scale
  const maxLandedPrice = Math.max(
    ...bundlesToCompare.map(b => b.validation.landedPrice.landedPrice),
    budget,
    1
  );

  const handleExportComparison = () => {
    if (bundlesToCompare.length === 0) return;
    const lines = [
      'Bundle Comparison Export',
      `Activity,${fixture.activity.name}`,
      `Generated,${new Date().toLocaleString()}`,
      '',
      'Metric,' + bundlesToCompare.map(b => `"${b.name}"`).join(','),
      'Bundle ID,' + bundlesToCompare.map(b => b.id).join(','),
      'Validity Status,' + bundlesToCompare.map(b => b.validation.isValid ? 'VALID' : 'INVALID').join(','),
      'Customer Budget (INR),' + bundlesToCompare.map(b => b.budget).join(','),
      'Product Subtotal (INR),' + bundlesToCompare.map(b => b.validation.landedPrice.productSubtotal).join(','),
      'Net Shipping (INR),' + bundlesToCompare.map(b => b.validation.landedPrice.netShipping).join(','),
      'Taxes (18% GST INR),' + bundlesToCompare.map(b => b.validation.landedPrice.taxAmount).join(','),
      'Final Landed Price (INR),' + bundlesToCompare.map(b => b.validation.landedPrice.landedPrice).join(','),
      'Remaining Budget (INR),' + bundlesToCompare.map(b => b.validation.landedPrice.remainingBudget).join(','),
      'Slots Filled,' + bundlesToCompare.map(b => `${b.validation.filledSlotCount}/${b.validation.totalSlotCount}`).join(','),
      'Compatibility,' + bundlesToCompare.map(b => b.validation.isCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE').join(',')
    ];
    downloadFile(lines.join('\n'), `bundle_comparison_${Date.now()}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header */}
      <div className="pb-3 border-b border-[#E6E1D3]/70">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2C3A2B]">
          Bundles
        </h1>
        <p className="text-sm sm:text-base text-[#4A4A35] mt-1 leading-relaxed">
          Discover curated workstation bundles tailored to your budget, add smart accessories with remaining funds, or create a custom setup.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: BUNDLE WORKSPACE (All Bundle Builder Features)                     */}
      {/* ========================================================================= */}
      {viewMode === 'workspace' && (
        <div className="space-y-6">
          {/* Global Workspace Control Bar - Merged with Minimalist Budget Input */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Optimizer Dropdown & Run Button */}
              <div className="flex items-center rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] p-0.5 shadow-2xs">
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
                onClick={() => setViewMode('recommendations')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2C3A2B] bg-[#E8EFE9] hover:bg-[#D5E3D7] border border-[#C2D6C5] rounded-xl shadow-2xs transition-colors cursor-pointer"
                title="Browse 25 dynamic bundle options matching requirements"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>25 Recommendations</span>
              </button>

              <button
                onClick={toggleAssistant}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#8B5A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                AI Assistant
              </button>
            </div>

            <div className="flex items-center gap-2">
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
                className="text-stone-400 hover:text-stone-600 text-xs font-mono cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Main Layout: Configured Bundle Products (Left) + Sticky Budget Summary (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Columns: Bundle Products & Add-On Recommendations */}
            <div className="lg:col-span-2 space-y-6">
              {/* Slot Header Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D3]/80">
                <div>
                  <h2 className="font-serif text-base font-bold text-[#2C3A2B]">
                    {selectedBundle ? selectedBundle.name : 'Configured Bundle Products'}
                  </h2>
                  <p className="text-xs text-[#5A5A40] mt-0.5">
                    {selectedBundle?.matchExplanation || 'Products currently included in your active bundle. Swap or remove items, or add smart accessories below.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border bg-[#F4F1EA] text-[#2C3A2B] border-[#E6E1D3]">
                    {activeBundleProducts.length} {activeBundleProducts.length === 1 ? 'item' : 'items'} in bundle
                  </span>
                </div>
              </div>

              {/* Over-Budget Alert Banner */}
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

              {/* Main Bundle Products Grid (The actual products of the bundle) */}
              {activeBundleProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeBundleProducts.map(([slotKey, prod]) => (
                    <div
                      key={slotKey}
                      className="p-4.5 bg-white border border-[#E6E1D3] rounded-[22px] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E6E1D3]/70">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2C3A2B] text-amber-200">
                            {prod.category}
                          </span>
                          <span className="text-xs text-[#5A5A40] font-mono truncate max-w-[130px]">
                            {slotKey}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" /> In Bundle
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5 my-1">
                        <img
                          src={getProductImageUrl(prod.image, prod.id)}
                          alt={prod.name}
                          className="w-16 h-16 rounded-xl object-contain bg-[#FDFBF7] border border-[#E6E1D3] p-1.5 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif font-bold text-sm text-[#2C3A2B] truncate">{prod.name}</h4>
                          <div className="text-xs text-[#5A5A40] mt-0.5 line-clamp-1">{prod.description || `${prod.category} item`}</div>
                          <div className="text-sm font-mono font-bold text-[#2C3A2B] mt-1">
                            {formatINR(prod.price)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E6E1D3]/70 text-xs">
                        <button
                          type="button"
                          onClick={() => setActiveSlotForSelection({
                            id: slotKey,
                            label: prod.name,
                            category: prod.category,
                            description: prod.description || `${prod.category} item`,
                            priority: 'required'
                          })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] transition-colors cursor-pointer"
                          title="Swap with another product in this category"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Swap</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProduct(slotKey)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                          title="Remove from bundle"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* + Add Product Card */}
                  <div
                    onClick={() => setActiveTab('catalogue')}
                    className="p-5 border-2 border-dashed border-[#D6CFBF] hover:border-[#2C3A2B] rounded-[22px] bg-[#FDFBF7]/80 hover:bg-[#F5F5EC] flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all group min-h-[160px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E1D3] flex items-center justify-center text-[#2C3A2B] group-hover:bg-[#2C3A2B] group-hover:text-amber-200 transition-all shadow-xs">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-serif font-bold text-xs text-[#2C3A2B]">
                      + Add Product from Catalogue
                    </span>
                    <span className="text-[10px] text-[#5A5A40]">
                      Expand your bundle with additional products
                    </span>
                  </div>
                </div>
              ) : (
                /* Empty state when no items in bundle */
                <div className="p-8 text-center bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#F4F1EA] flex items-center justify-center text-[#5A5A40]">
                    <Package className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#2C3A2B]">Your Bundle is Currently Empty</h3>
                    <p className="text-xs text-[#5A5A40] mt-1 max-w-md mx-auto">
                      Select a curated bundle from the recommendations or add products from the catalogue.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('recommendations')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] transition-colors cursor-pointer shadow-xs"
                    >
                      Browse Bundles
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('catalogue')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] transition-colors cursor-pointer"
                    >
                      Browse Product Catalogue
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Add-Ons Recommendations based on remaining budget */}
              <div className="pt-4 border-t border-[#E6E1D3]/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <Sparkles className="w-3 h-3 text-emerald-700" />
                        <span>Recommended Add-Ons</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-[#2C3A2B]">
                        {remainingHeadroom > 0 ? `${formatINR(remainingHeadroom)} remaining budget` : 'Budget fully utilized'}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#2C3A2B] mt-1">
                      Recommended Products for Remaining Spend
                    </h3>
                    <p className="text-xs text-[#5A5A40]">
                      Add-on items matching your unspent budget to maximize workstation value.
                    </p>
                  </div>

                  {remainingHeadroom > 0 && addonCategories.length > 2 && (
                    <div className="flex flex-wrap items-center gap-1">
                      {addonCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedWorkspaceAddonCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                            selectedWorkspaceAddonCategory === cat
                              ? 'bg-[#2C3A2B] text-white shadow-2xs'
                              : 'bg-white text-[#5A5A40] border border-[#E6E1D3] hover:bg-[#F4F1EA]'
                          }`}
                        >
                          {cat === 'all' ? `All (${affordableAddons.length})` : cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {remainingHeadroom > 0 ? (
                  affordableAddons.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {displayedWorkspaceAddons.map(prod => (
                        <div
                          key={`addon-${prod.id}`}
                          className="p-3 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-2.5 group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getProductImageUrl(prod.image, prod.id)}
                              alt={prod.name}
                              className="w-12 h-12 rounded-xl object-contain bg-[#FDFBF7] border border-[#E6E1D3] p-1 shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#8B5A2B]">
                                {prod.category}
                              </span>
                              <h5 className="font-serif font-bold text-xs text-[#2C3A2B] truncate">{prod.name}</h5>
                              <div className="text-xs font-mono font-bold text-[#2C3A2B]">
                                {formatINR(prod.price)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E6E1D3]/60 text-[10px]">
                            <span className="text-[#8B8B7A] font-mono">
                              +{formatINR(remainingHeadroom - prod.price)} left
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddAddonToWorkspace(prod)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] transition-colors cursor-pointer shadow-2xs"
                            >
                              <Plus className="w-3 h-3 text-amber-300" />
                              <span>Add to Bundle</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] text-center text-xs text-[#5A5A40]">
                      No individual catalogue products fit within your remaining ₹{formatINR(remainingHeadroom)} spend.
                      Increase your budget at the top to unlock more add-on options!
                    </div>
                  )
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        Budget fully utilized ({formatINR(budget)})! All allocated funds are invested in this bundle.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBudget(budget + 1000);
                          addNotification('Budget Increased', 'Added ₹1,000 to unlock add-on accessories.', 'success');
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#2C3A2B] bg-white border border-[#E6E1D3] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
                      >
                        + ₹1,000 Budget
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBudget(budget + 5000);
                          addNotification('Budget Increased', 'Added ₹5,000 to unlock premium add-ons.', 'success');
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] transition-colors cursor-pointer"
                      >
                        + ₹5,000 Budget
                      </button>
                    </div>
                  </div>
                )}
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
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#2C3A2B] hover:bg-[#1E281D] shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <CreditCard className="w-4 h-4 text-amber-300" />
                    <span>BUY NOW — {formatINR(validation.landedPrice.landedPrice)}</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>

                {/* Cross-Link to Compare View */}
                <button
                  onClick={() => setViewMode('compare')}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Compare with Saved Bundles ({savedBundles.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SIDE-BY-SIDE COMPARISON (All Compare Bundles Features)             */}
      {/* ========================================================================= */}
      {viewMode === 'compare' && (
        <div className="space-y-6">
          {/* Comparison Control Toolbar */}
          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('workspace')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] rounded-xl transition-colors cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Open Workspace Editor</span>
              </button>

              <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#2C3A2B] bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl cursor-pointer hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={includeActiveInComparison}
                  onChange={e => setIncludeActiveInComparison(e.target.checked)}
                  className="rounded text-[#2C3A2B] focus:ring-[#2C3A2B]"
                />
                <span>Include Active Workspace Draft</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSnapshotActive}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C2C1E] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#5A5A40]" />
                Snapshot Workspace
              </button>

              <button
                onClick={() => initiateCheckout()}
                disabled={Object.values(currentItems).filter(Boolean).length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] rounded-xl shadow-2xs hover:shadow-md transition-all cursor-pointer hover:scale-102 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                <span>BUY NOW</span>
              </button>
            </div>
          </div>

          {/* Saved Bundles Selector Strip */}
          <div className="p-5 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#5A5A40] uppercase tracking-wider">
                Select Saved Bundles to Compare (Up to 3)
              </span>
              <span className="text-xs text-[#5A5A40] font-mono">
                {selectedBundleIds.length} of 3 selected
              </span>
            </div>

            {savedBundles.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#E6E1D3] rounded-2xl bg-[#FDFBF7] text-xs text-[#5A5A40] space-y-3">
                <p>No saved bundle records found in memory yet.</p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleSnapshotActive}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Snapshot Active Workspace Setup
                  </button>
                  <button
                    onClick={() => setViewMode('workspace')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#2C3A2B] bg-[#F5F5EC] border border-[#E6E1D3] rounded-xl hover:bg-[#F4F1EA] transition-colors cursor-pointer"
                  >
                    Go to Workspace Editor
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {savedBundles.map(bundle => {
                  const isChecked = selectedBundleIds.includes(bundle.id);
                  const isValid = bundle.validation.isValid;

                  return (
                    <div
                      key={bundle.id}
                      onClick={() => toggleSelectBundle(bundle.id)}
                      className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md ${
                        isChecked
                          ? 'border-[#2C3A2B] bg-[#F5F5EC] shadow-sm ring-2 ring-[#2C3A2B]/20'
                          : 'border-[#E6E1D3] bg-[#FDFBF7] hover:border-[#8B5A2B] hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-[#2C3A2B] line-clamp-1">
                            {bundle.name}
                          </span>
                          {isValid ? (
                            <span className="text-[10px] text-[#2C3A2B] bg-[#A3B18A]/25 border border-[#A3B18A]/40 px-1.5 py-0.5 rounded font-medium">Valid</span>
                          ) : (
                            <span className="text-[10px] text-[#C05621] bg-[#C05621]/10 border border-[#C05621]/20 px-1.5 py-0.5 rounded font-medium">Invalid</span>
                          )}
                        </div>
                        <div className="text-sm font-bold font-mono tabular-nums text-[#2C3A2B]">
                          {formatINR(bundle.validation.landedPrice.landedPrice)}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#E6E1D3] flex items-center justify-between text-[11px]">
                        <span className="text-[#5A5A40] font-mono text-[10px]">{bundle.savedAt}</span>
                        <span className={`font-semibold ${isChecked ? 'text-[#8B5A2B]' : 'text-[#5A5A40]'}`}>
                          {isChecked ? 'Comparing' : 'Click to compare'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comparison Grid & Visual Price Chart */}
          {bundlesToCompare.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[24px] border border-[#E6E1D3] text-[#5A5A40] text-xs">
              Select at least one saved bundle above, or enable "Include Active Workspace Draft" to inspect landed tradeoffs.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visual Landed Price Indicator Bar Chart */}
              <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#2C3A2B]">Final Landed Price Comparison</h3>
                    <p className="text-xs text-[#5A5A40]">
                      Visualizing total payable amount (Subtotal + Net Shipping + Taxes) across configurations.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#5A5A40] bg-[#F4F1EA] px-2.5 py-1 rounded-lg border border-[#E6E1D3]">
                    Budget Baseline: {formatINR(budget)}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {bundlesToCompare.map(b => {
                    const landed = b.validation.landedPrice.landedPrice;
                    const percentOfMax = (landed / maxLandedPrice) * 100;
                    const isBestPrice = b.validation.isValid && landed === minLandedPrice;
                    const isActiveDraft = b.id === 'active_workspace';

                    return (
                      <div key={b.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#2C3A2B]">{b.name}</span>
                            {isActiveDraft && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                Live Workspace Draft
                              </span>
                            )}
                            {isBestPrice && (
                              <span className="text-[10px] font-semibold text-[#2C3A2B] bg-[#A3B18A]/25 px-2 py-0.5 rounded-full border border-[#A3B18A]/40">
                                Lowest Landed Cost
                              </span>
                            )}
                            {!b.validation.isValid && (
                              <span className="text-[10px] text-[#C05621] bg-[#C05621]/10 px-2 py-0.5 rounded-full border border-[#C05621]/20">
                                Violates Constraints
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold tabular-nums text-[#2C3A2B]">
                            {formatINR(landed)}
                          </span>
                        </div>

                        <div className="w-full h-3 bg-[#F4F1EA] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              !b.validation.isValid
                                ? 'bg-[#C05621]'
                                : isActiveDraft
                                ? 'bg-[#8B5A2B]'
                                : isBestPrice
                                ? 'bg-[#A3B18A]'
                                : 'bg-[#2C3A2B]'
                            }`}
                            style={{ width: `${Math.min(percentOfMax, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deep Side-by-Side Comparison Matrix */}
              <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F5F5EC]/70 border-b border-[#E6E1D3] text-[11px] font-serif font-bold text-[#2C3A2B] uppercase">
                        <th className="py-3.5 px-4 w-48">Feature / Metric</th>
                        {bundlesToCompare.map(b => (
                          <th key={b.id} className="py-3.5 px-4 min-w-[220px]">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#2C3A2B]">{b.name}</span>
                              {b.id === 'active_workspace' && (
                                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#5A5A40] font-mono font-normal">
                              ID: {b.id}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E1D3]/50">
                      {/* Validity Status */}
                      <tr className="bg-[#FDFBF7]">
                        <td className="py-3 px-4 font-semibold text-[#2C3A2B]">Overall Validity</td>
                        {bundlesToCompare.map(b => (
                          <td key={b.id} className="py-3 px-4">
                            {b.validation.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[#2C3A2B] font-semibold text-xs">
                                <Check className="w-3.5 h-3.5 text-[#2C3A2B]" /> Valid Purchase Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#C05621] font-semibold text-xs">
                                <AlertTriangle className="w-3.5 h-3.5" /> Rule Non-Compliant
                              </span>
                            )}
                            <span className="text-[11px] text-[#5A5A40] block mt-0.5">
                              {b.validation.statusMessage}
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Customer Budget */}
                      <tr>
                        <td className="py-3 px-4 text-[#5A5A40]">Customer Budget</td>
                        {bundlesToCompare.map(b => (
                          <td key={b.id} className="py-3 px-4 font-mono font-medium text-[#2C3A2B]">
                            {formatINR(b.budget)}
                          </td>
                        ))}
                      </tr>

                      {/* Product Subtotal */}
                      <tr>
                        <td className="py-3 px-4 text-[#5A5A40]">Product Subtotal</td>
                        {bundlesToCompare.map(b => (
                          <td key={b.id} className="py-3 px-4 font-mono font-medium text-[#2C3A2B]">
                            {formatINR(b.validation.landedPrice.productSubtotal)}
                          </td>
                        ))}
                      </tr>

                      {/* Shipping Fee */}
                      <tr>
                        <td className="py-3 px-4 text-[#5A5A40]">Net Shipping</td>
                        {bundlesToCompare.map(b => (
                          <td key={b.id} className="py-3 px-4 font-mono text-[#2C3A2B]">
                            {formatINR(b.validation.landedPrice.netShipping)}
                            {b.validation.landedPrice.shippingDiscount > 0 && (
                              <span className="text-[10px] text-[#2C3A2B] bg-[#A3B18A]/25 border border-[#A3B18A]/40 px-1.5 py-0.5 rounded ml-1.5 font-sans font-medium">
                                Free Tier
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* Taxes */}
                      <tr>
                        <td className="py-3 px-4 text-[#5A5A40]">Taxes</td>
                        {bundlesToCompare.map(b => (
                          <td key={b.id} className="py-3 px-4 font-mono text-[#2C3A2B]">
                            {formatINR(b.validation.landedPrice.taxAmount)}
                          </td>
                        ))}
                      </tr>

                      {/* Final Landed Price */}
                      <tr className="bg-[#F5F5EC]/60 font-bold">
                        <td className="py-3.5 px-4 text-[#2C3A2B]">Final Landed Price</td>
                        {bundlesToCompare.map(b => {
                          const isBest = b.validation.isValid && b.validation.landedPrice.landedPrice === minLandedPrice;
                          return (
                            <td
                              key={b.id}
                              className="py-3.5 px-4 font-mono text-sm text-[#2C3A2B]"
                            >
                              {formatINR(b.validation.landedPrice.landedPrice)}
                              {isBest && (
                                <span className="block text-[10px] text-[#8B5A2B] font-sans font-semibold">
                                  Best Value Choice
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Remaining Budget Buffer */}
                      <tr>
                        <td className="py-3 px-4 text-[#5A5A40]">Remaining Budget Buffer</td>
                        {bundlesToCompare.map(b => (
                          <td
                            key={b.id}
                            className={`py-3 px-4 font-mono font-medium ${
                              b.validation.landedPrice.isOverBudget
                                ? 'text-[#C05621]'
                                : 'text-[#2C3A2B]'
                            }`}
                          >
                            {formatINR(b.validation.landedPrice.remainingBudget)}
                          </td>
                        ))}
                      </tr>

                      {/* Dynamic Product Breakdown for Compared Bundles */}
                      {comparisonSlotKeys.map(slotKey => (
                        <tr key={slotKey}>
                          <td className="py-3 px-4 text-[#5A5A40] font-medium capitalize">
                            {slotKey.replace(/_/g, ' ')}
                          </td>
                          {bundlesToCompare.map(b => {
                            const item = b.items[slotKey];
                            return (
                              <td key={b.id} className="py-3 px-4">
                                {item ? (
                                  <div>
                                    <span className="font-semibold text-[#2C3A2B] block line-clamp-1">
                                      {item.name}
                                    </span>
                                    <span className="text-[11px] font-mono text-[#5A5A40]">
                                      {formatINR(item.price)} · {item.id}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[#5A5A40]/60 italic">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* Action Row */}
                      <tr className="bg-[#F5F5EC]/40">
                        <td className="py-3.5 px-4 text-[#2C3A2B] font-semibold">Workspace Action</td>
                        {bundlesToCompare.map(b => (
                          <td key={b.id} className="py-3.5 px-4">
                            {b.id === 'active_workspace' ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  onClick={() => initiateCheckout()}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] shadow-2xs flex items-center gap-1 cursor-pointer hover:scale-102 transition-all"
                                >
                                  <CreditCard className="w-3 h-3 text-amber-300" />
                                  <span>BUY NOW</span>
                                </button>
                                <button
                                  onClick={() => setViewMode('workspace')}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] shadow-2xs cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={handleSnapshotActive}
                                  className="p-1.5 text-[#5A5A40] hover:text-[#2C3A2B] rounded-lg hover:bg-[#F4F1EA]"
                                  title="Save snapshot"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  onClick={() => {
                                    loadSavedBundle(b);
                                    initiateCheckout();
                                  }}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] shadow-2xs flex items-center gap-1 cursor-pointer hover:scale-102 transition-all"
                                >
                                  <CreditCard className="w-3 h-3 text-amber-300" />
                                  <span>BUY NOW</span>
                                </button>
                                <button
                                  onClick={() => loadSavedBundle(b)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] shadow-2xs cursor-pointer"
                                >
                                  Load
                                </button>
                                <button
                                  onClick={() => deleteSavedBundle(b.id)}
                                  className="p-1.5 text-[#5A5A40] hover:text-[#C05621] rounded-lg hover:bg-[#F4F1EA] cursor-pointer"
                                  title="Delete this record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: CURATED BUNDLES, SEARCH, CREATE BUNDLE & ADD-ONS */}
      {viewMode === 'recommendations' && (
        <BundleRecommendationsSection
          onSelectBundle={handleSelectRecommendedBundle}
          onOpenWorkspace={() => setViewMode('workspace')}
        />
      )}

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
