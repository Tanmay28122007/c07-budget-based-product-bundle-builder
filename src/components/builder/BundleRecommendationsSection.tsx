import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  RotateCcw,
  SlidersHorizontal,
  Wallet,
  Check,
  Info,
  PackageCheck,
  Eye,
  ChevronDown,
  ChevronUp,
  Tag,
  CreditCard,
  Search,
  Filter,
  X,
  PackagePlus,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatINR } from '../../utils/pricing';
import {
  ProductRequirement,
  BundleRecommendation,
  generateBundleRecommendations,
  generateRandomDatabaseBundles
} from '../../utils/bundleRecommendations';
import { fetchFilteredBundles, BundleApiResponse } from '../../services/apiClient';
import { BundleAddOnsPanel } from './BundleAddOnsPanel';
import { getProductImageUrl } from '../../utils/imageUtils';

function getColourHex(colour?: string): string {
  if (!colour) return '#9CA3AF';
  const c = colour.toLowerCase();
  if (c.includes('blue')) return '#2563EB';
  if (c.includes('red')) return '#DC2626';
  if (c.includes('black')) return '#1E293B';
  if (c.includes('grey') || c.includes('gray')) return '#64748B';
  if (c.includes('green')) return '#16A34A';
  if (c.includes('brown')) return '#8B5A2B';
  return '#9CA3AF';
}

interface BundleRecommendationsSectionProps {
  onSelectBundle: (bundle: BundleRecommendation) => void;
  onOpenWorkspace?: () => void;
}

export const BundleRecommendationsSection: React.FC<BundleRecommendationsSectionProps> = ({
  onSelectBundle,
  onOpenWorkspace
}) => {
  const { fixture, budget: appBudget, setBudget, initiateCheckout, addNotification, setActiveTab } = useApp();

  // Search & Filter state
  const [bundleSearch, setBundleSearch] = useState<string>('');
  const [bundleCategory, setBundleCategory] = useState<string>('all');
  const [bundleSort, setBundleSort] = useState<'price_asc' | 'price_desc' | 'items_asc' | 'items_desc'>('price_asc');
  const [onlyWithinBudget, setOnlyWithinBudget] = useState<boolean>(true);

  // Requirements / Inserted Items state
  const [requirements, setRequirements] = useState<ProductRequirement[]>([]);
  const [selectedProductIdInput, setSelectedProductIdInput] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [exactOnly, setExactOnly] = useState<boolean>(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);


  // Reference bundle selected for Add-ons panel
  const [selectedReferenceBundleId, setSelectedReferenceBundleId] = useState<string | null>(null);

  // Backend connection state
  const [backendBundles, setBackendBundles] = useState<BundleRecommendation[] | null>(null);
  const [isBackendLoading, setIsBackendLoading] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'offline'>('connected');
  const [backendHasUnavailableProduct, setBackendHasUnavailableProduct] = useState<boolean>(false);
  const [backendUnavailableReason, setBackendUnavailableReason] = useState<string | undefined>(undefined);
  const [backendIsOverBudgetForAll, setBackendIsOverBudgetForAll] = useState<boolean>(false);
  const [backendOverBudgetReason, setBackendOverBudgetReason] = useState<string | undefined>(undefined);

  // Unique categories in fixture
  const availableCategories = useMemo(() => {
    return Array.from(new Set(fixture.products.map(p => p.category)));
  }, [fixture.products]);

  // Connect to backend endpoint whenever filters change
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setIsBackendLoading(true);
        const res: BundleApiResponse = await fetchFilteredBundles({
          requirements,
          budget: appBudget || undefined,
          exactOnly,
          category: bundleCategory !== 'all' ? bundleCategory : undefined,
          search: bundleSearch.trim() || undefined,
          sort: bundleSort
        });

        if (isMounted && res.success) {
          setBackendBundles(res.bundles);
          setBackendHasUnavailableProduct(Boolean(res.hasUnavailableProduct));
          setBackendUnavailableReason(res.unavailableReason);
          setBackendIsOverBudgetForAll(Boolean(res.isOverBudgetForAll));
          setBackendOverBudgetReason(res.overBudgetReason);
          setBackendStatus('connected');
          setIsBackendLoading(false);
        }
      } catch (err) {
        console.warn('Backend bundle filter fallback to local engine:', err);
        if (isMounted) {
          setBackendBundles(null);
          setBackendStatus('offline');
          setIsBackendLoading(false);
        }
      }
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [requirements, appBudget, exactOnly, bundleCategory, bundleSearch, bundleSort]);

  // Local engine fallback calculation
  const localRecommendationResult = useMemo(() => {
    const base = generateBundleRecommendations(
      fixture.products,
      requirements,
      appBudget,
      exactOnly,
      fixture.shippingRule,
      fixture.taxRule
    );

    let filtered = [...base.bundles];

    // Filter by keyword search (items, name, tagline, role, category)
    if (bundleSearch.trim()) {
      const q = bundleSearch.toLowerCase().trim();
      filtered = filtered.filter(b => {
        const name = b.name.toLowerCase();
        const tagline = b.tagline.toLowerCase();
        const explanation = b.matchExplanation.toLowerCase();
        const itemNames = b.items
          .map(it => `${it.product.name} ${it.product.id} ${it.product.category} ${it.product.colour || ''} ${it.product.brand || ''}`)
          .join(' ')
          .toLowerCase();
        return name.includes(q) || tagline.includes(q) || explanation.includes(q) || itemNames.includes(q);
      });
    }

    // Filter by category
    if (bundleCategory !== 'all') {
      const cat = bundleCategory.toLowerCase().trim();
      filtered = filtered.filter(b =>
        b.categories.some(c => c.toLowerCase() === cat) ||
        b.items.some(it => it.product.category.toLowerCase() === cat)
      );
    }

    // Filter by budget cap
    if (onlyWithinBudget && appBudget > 0) {
      filtered = filtered.filter(b => b.landedPrice <= appBudget);
    }

    // Sort bundles
    if (bundleSort === 'price_asc') {
      filtered.sort((a, b) => a.landedPrice - b.landedPrice);
    } else if (bundleSort === 'price_desc') {
      filtered.sort((a, b) => b.landedPrice - a.landedPrice);
    } else if (bundleSort === 'items_asc') {
      filtered.sort((a, b) => a.totalItemCount - b.totalItemCount);
    } else if (bundleSort === 'items_desc') {
      filtered.sort((a, b) => b.totalItemCount - a.totalItemCount);
    }

    return {
      ...base,
      bundles: filtered
    };
  }, [fixture, requirements, appBudget, exactOnly, bundleSearch, bundleCategory, onlyWithinBudget, bundleSort]);

  // Active bundles list
  const isUsingBackend = backendBundles !== null && backendStatus === 'connected';
  const rawBundles = isUsingBackend ? backendBundles : localRecommendationResult.bundles;

  // Apply client-side budget cap & search guarantee
  const bundles = useMemo(() => {
    let list = [...rawBundles];
    if (onlyWithinBudget && appBudget > 0) {
      list = list.filter(b => b.landedPrice <= appBudget);
    }
    if (bundleSearch.trim()) {
      const q = bundleSearch.toLowerCase().trim();
      list = list.filter(b => {
        const name = b.name.toLowerCase();
        const tagline = b.tagline.toLowerCase();
        const itemNames = b.items.map(it => `${it.product.name} ${it.product.id} ${it.product.category}`).join(' ').toLowerCase();
        return name.includes(q) || tagline.includes(q) || itemNames.includes(q);
      });
    }
    return list;
  }, [rawBundles, onlyWithinBudget, appBudget, bundleSearch]);

  // Reference bundle for Add-ons panel
  const referenceBundle: BundleRecommendation | null = useMemo(() => {
    if (selectedReferenceBundleId) {
      const found = bundles.find(b => b.id === selectedReferenceBundleId);
      if (found) return found;
    }
    return bundles.length > 0 ? bundles[0] : null;
  }, [bundles, selectedReferenceBundleId]);

  // Insert requirement handler
  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductIdInput) return;

    const prod = fixture.products.find(p => p.id === selectedProductIdInput);
    if (!prod) return;

    const existingIdx = requirements.findIndex(r => r.productId === prod.id);
    if (existingIdx >= 0) {
      setRequirements(prev =>
        prev.map((r, i) => (i === existingIdx ? { ...r, quantity: r.quantity + quantityInput } : r))
      );
    } else {
      setRequirements(prev => [
        ...prev,
        {
          id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: prod.id,
          title: prod.name,
          category: prod.category,
          quantity: Math.max(1, quantityInput)
        }
      ]);
    }

    setSelectedProductIdInput('');
    setQuantityInput(1);
    addNotification('Item Filter Added', `Bundles must now include ${quantityInput}x ${prod.name}`, 'info');
  };

  const handleRemoveRequirement = (id: string) => {
    setRequirements(prev => prev.filter(r => r.id !== id));
  };

  const handleResetFilters = () => {
    setBundleSearch('');
    setBundleCategory('all');
    setRequirements([]);
    setExactOnly(false);
    setSelectedProductIdInput('');
    setQuantityInput(1);
    setOnlyWithinBudget(true);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP SEARCH & BUDGET FILTER BAR                                         */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 bg-white border border-[#E6E1D3] rounded-[28px] shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-[#8B5A2B] font-mono font-bold uppercase tracking-wider">
                {bundles.length} bundles available
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3A2B] mt-1.5">
              Find or Build Your Perfect Bundle
            </h2>
            <p className="text-sm sm:text-base text-[#4A4A35] leading-relaxed mt-1">
              Filter pre-configured workstation bundles by inserting required items and setting your target budget.
            </p>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                const randomList = generateRandomDatabaseBundles(fixture.products, 25, fixture.shippingRule, fixture.taxRule, appBudget);
                setBackendBundles(randomList);
                addNotification('Bundles Shuffled', 'Loaded 25 randomized product bundles from database.', 'info');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-[#8B5A2B] bg-[#FDFBF7] hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
              <span>Shuffle 25 Bundles</span>
            </button>

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-[#5A5A40] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-[#5A5A40]" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Must-Have Product */}
        <div className="pt-1 max-w-2xl">
          <label className="text-xs font-mono uppercase tracking-wider text-[#5A5A40] font-bold block mb-2">
            Insert Must-Have Product
          </label>
          <form onSubmit={handleAddRequirement} className="flex items-center gap-2.5">
            <select
              value={selectedProductIdInput}
              onChange={(e) => setSelectedProductIdInput(e.target.value)}
              className="flex-1 py-3 px-3.5 rounded-xl text-sm bg-[#FDFBF7] border border-[#E6E1D3] text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B] shadow-2xs cursor-pointer truncate"
            >
              <option value="">+ Choose product to insert...</option>
              {fixture.products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatINR(p.price)})
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!selectedProductIdInput}
              className="px-5 py-3 rounded-xl text-sm font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] disabled:bg-[#E6E1D3] disabled:text-[#8B8B7A] disabled:cursor-not-allowed transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              Insert
            </button>
          </form>
        </div>

        {/* Active Requirements List / Filter Chips */}
        {requirements.length > 0 && (
          <div className="pt-3 border-t border-[#E6E1D3]/80 flex flex-wrap items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-[#8B5A2B] uppercase tracking-wider">
              Must Contain ({requirements.length}):
            </span>
            {requirements.map(req => {
              const prod = fixture.products.find(p => p.id === req.productId);
              return (
                <span
                  key={req.id}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs sm:text-sm font-medium shadow-2xs"
                >
                  <span className="font-bold">{req.quantity}x</span>
                  <span>{prod ? prod.name : req.productId}</span>
                  <button
                    onClick={() => handleRemoveRequirement(req.id)}
                    className="p-0.5 text-amber-700 hover:text-amber-900 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. "CREATE BUNDLE" BUTTON (Redirects to Product Catalogue) */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('catalogue')}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-[#2C3A2B] hover:bg-[#1E281D] transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-102 active:scale-98"
        >
          <PackagePlus className="w-4.5 h-4.5 text-amber-300" />
          <span>+ Create Bundle</span>
        </button>
      </div>

      {/* Results Header Count Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] shadow-2xs text-sm">
        <div className="flex items-center gap-2.5 text-[#2C2C1E]">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span className="font-bold text-sm sm:text-base">
            Showing {bundles.length} {bundles.length === 1 ? 'matching bundle' : 'matching bundles'}
          </span>
          {bundleSearch && (
            <span className="text-[#8B5A2B] font-semibold">
              for "{bundleSearch}"
            </span>
          )}
          {onlyWithinBudget && (
            <span className="text-emerald-800 font-semibold">
              under {formatINR(appBudget)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-[#4A4A35]">
            <input
              type="checkbox"
              checked={onlyWithinBudget}
              onChange={(e) => setOnlyWithinBudget(e.target.checked)}
              className="w-4 h-4 rounded text-[#2C3A2B] accent-[#2C3A2B] cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold">Filter strictly under budget</span>
          </label>

          <select
            value={bundleSort}
            onChange={(e) => setBundleSort(e.target.value as any)}
            className="py-1.5 px-3 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-[#E6E1D3] text-[#2C3A2B] focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="items_asc">Items: Fewest First</option>
            <option value="items_desc">Items: Most First</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RECOMMENDED BUNDLES GRID                                               */}
      {/* ========================================================================= */}
      {bundles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bundles.map((bundle, index) => {
            const isExpanded = expandedCardId === bundle.id;
            const isSelectedRef = referenceBundle?.id === bundle.id;
            const remaining = appBudget - bundle.landedPrice;
            const isWithin = remaining >= 0;

            return (
              <div
                key={bundle.id}
                className={`bg-white border rounded-[24px] p-5 shadow-xs transition-all flex flex-col justify-between group ${
                  isSelectedRef
                    ? 'border-emerald-500 ring-2 ring-emerald-400/20 shadow-md'
                    : 'border-[#E6E1D3] hover:border-[#8B5A2B]/40 hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Top: Number, Role Badges & Price */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-lg text-xs font-bold font-mono bg-[#2C3A2B] text-white shadow-2xs">
                          #{index + 1}
                        </span>
                        {bundle.isExactMatch && (
                          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                            Exact Match
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#E8EFE9] text-[#2C3A2B] border border-[#D0DFD2]">
                          {bundle.totalItemCount} {bundle.totalItemCount === 1 ? 'Item' : 'Items'}
                        </span>
                        {isSelectedRef && (
                          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                            Active for Add-ons
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#2C3A2B] group-hover:text-[#8B5A2B] transition-colors leading-snug">
                        {bundle.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4A4A35] leading-relaxed line-clamp-2">
                        {bundle.tagline}
                      </p>
                    </div>

                    {/* Price Block */}
                    <div className="text-right shrink-0">
                      <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#2C3A2B]">
                        {formatINR(bundle.landedPrice)}
                      </div>
                      <span className="text-xs font-semibold text-[#8B8B7A] block mt-0.5">
                        Landed Total
                      </span>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border shadow-2xs ${
                        isWithin
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {isWithin ? `+${formatINR(remaining)} left` : `-${formatINR(Math.abs(remaining))} over`}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Product Showcase Grid */}
                  <div className="p-3.5 sm:p-4 bg-[#FDFBF7] border border-[#E6E1D3] rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E6E1D3]/70 pb-2">
                      <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#8B5A2B] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Included Items ({bundle.totalItemCount}):</span>
                      </span>
                      <span className="text-xs font-medium text-[#8B8B7A]">
                        Individual Pricing
                      </span>
                    </div>

                    <div className={`grid gap-3 ${
                      bundle.items.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                    }`}>
                      {bundle.items.map((it, itemIdx) => (
                        <div
                          key={`${it.product.id}-${itemIdx}`}
                          className="bg-white rounded-xl border border-[#E6E1D3] p-3 flex items-center gap-3.5 hover:border-[#8B5A2B]/40 hover:shadow-sm transition-all group/item"
                        >
                          {/* Large, Clear Studio Photo */}
                          <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-[#FAF9F5] rounded-xl border border-[#E6E1D3]/80 p-2 flex items-center justify-center overflow-hidden">
                            <img
                              src={getProductImageUrl(it.product.image, it.product.id)}
                              alt={it.product.name}
                              className="w-full h-full object-contain mix-blend-multiply group-hover/item:scale-108 transition-transform duration-300"
                            />
                            {it.quantity > 1 && (
                              <span className="absolute top-1 right-1 px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-[#2C3A2B] text-white shadow-xs">
                                ×{it.quantity}
                              </span>
                            )}
                          </div>

                          {/* Product Details & Price */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3]">
                                {it.product.category}
                              </span>
                              <span className="text-[11px] font-mono text-[#8B8B7A]">
                                {it.product.id}
                              </span>
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-[#2C3A2B] leading-snug line-clamp-2 group-hover/item:text-[#8B5A2B] transition-colors">
                              {it.quantity > 1 ? `${it.quantity}x ` : ''}{it.product.name}
                            </h4>

                            <div className="text-xs sm:text-sm font-bold font-mono text-[#8B5A2B] pt-0.5">
                              {formatINR(it.product.price * it.quantity)}
                              {it.quantity > 1 && (
                                <span className="text-[11px] font-normal text-[#8B8B7A] ml-1">
                                  ({formatINR(it.product.price)} each)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Match Explanation Callout */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#F4F1EA]/70 border border-[#E6E1D3] text-xs sm:text-sm flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#8B5A2B] shrink-0 mt-0.5" />
                    <p className="text-[#3E3E2C] leading-relaxed">
                      {bundle.matchExplanation}
                    </p>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-[#E6E1D3]/80 space-y-2 text-xs sm:text-sm animate-in fade-in duration-200">
                      <div className="font-bold text-[#2C3A2B]">Bundle Item Specifications:</div>
                      <div className="space-y-2">
                        {bundle.items.map((it, itemIdx) => (
                          <div
                            key={`spec-${it.product.id}-${itemIdx}`}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3]"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold text-[#8B8B7A]">{it.product.id}</span>
                              <span className="font-semibold text-[#2C3A2B]">{it.quantity}x {it.product.name}</span>
                              <span className="text-xs text-[#5A5A40] bg-[#E6E1D3] px-2 py-0.5 rounded">
                                {it.product.category}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-[#2C3A2B]">
                              {formatINR(it.product.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 pt-3.5 border-t border-[#E6E1D3]/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setExpandedCardId(isExpanded ? null : bundle.id)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5A5A40] hover:text-[#2C3A2B] transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>Hide Specs</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>View Specs</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReferenceBundleId(bundle.id);
                        addNotification('Active for Add-ons', `Now showing add-on recommendations for "${bundle.name}" below.`, 'info');
                      }}
                      className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                        isSelectedRef
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-white text-[#5A5A40] border-[#E6E1D3] hover:bg-[#F4F1EA]'
                      }`}
                      title="Select this bundle to see its remaining budget and recommended add-ons below"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isSelectedRef ? 'Add-ons Selected' : 'See Add-ons'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        onSelectBundle(bundle);
                        initiateCheckout({
                          items: bundle.items,
                          bundleName: bundle.name
                        });
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#8B5A2B] hover:bg-[#6D4522] rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-102 active:scale-98 tracking-wider"
                    >
                      <CreditCard className="w-4 h-4 text-amber-300" />
                      <span>BUY NOW</span>
                    </button>

                    <button
                      onClick={() => onSelectBundle(bundle)}
                      className="inline-flex items-center gap-2 px-4.5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-102 active:scale-98 tracking-wide"
                    >
                      <PackageCheck className="w-4 h-4 text-amber-300" />
                      <span>Select Bundle</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-10 text-center bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#F4F1EA] flex items-center justify-center text-[#5A5A40]">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C3A2B]">
              No bundles match your exact search criteria
            </h3>
            <p className="text-xs text-[#5A5A40] max-w-md mx-auto mt-1">
              Try adjusting your search query, increasing your target budget, or use the custom bundle creator to assemble any combination of products.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F4F1EA] hover:bg-[#E6E1D3] text-[#2C3A2B] border border-[#E6E1D3] transition-colors cursor-pointer"
            >
              Reset Search & Filters
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('catalogue')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2C3A2B] hover:bg-[#1E281D] text-white transition-colors cursor-pointer shadow-xs"
            >
              + Create Custom Bundle Instead
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. "ADD-ONS" PANEL (Directly Below All Bundles)                           */}
      {/* ========================================================================= */}
      <BundleAddOnsPanel
        referenceBundle={referenceBundle}
        targetBudget={appBudget}
        availableBundles={bundles}
        onSelectReferenceBundle={(b) => setSelectedReferenceBundleId(b.id)}
        onIncreaseBudget={(amt) => {
          setBudget(appBudget + amt);
          addNotification('Budget Increased', `Increased target budget by ${formatINR(amt)} to unlock add-ons.`, 'success');
        }}
      />

    </div>
  );
};
