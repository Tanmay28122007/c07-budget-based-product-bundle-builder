import { useState, useMemo } from 'react';
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
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatINR } from '../../utils/pricing';
import {
  ProductRequirement,
  BundleRecommendation,
  generateBundleRecommendations
} from '../../utils/bundleRecommendations';

function getProductImageUrl(img?: string, id?: string): string {
  if (!img) return id ? `/assets/${id}.png` : '';
  if (img.startsWith('../assets/')) {
    return img.replace('../assets/', '/assets/');
  }
  if (img.startsWith('./assets/')) {
    return img.replace('./assets/', '/assets/');
  }
  return img;
}

interface BundleRecommendationsSectionProps {
  onSelectBundle: (bundle: BundleRecommendation) => void;
}

export const BundleRecommendationsSection: React.FC<BundleRecommendationsSectionProps> = ({
  onSelectBundle
}) => {
  const { fixture, budget: appBudget } = useApp();

  // Requirements state
  const [requirements, setRequirements] = useState<ProductRequirement[]>([]);
  const [selectedProductIdInput, setSelectedProductIdInput] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [exactOnly, setExactOnly] = useState<boolean>(false);
  const [budgetConstraint, setBudgetConstraint] = useState<number | null>(appBudget || null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Quick preset buttons for instant test verification
  const handleApplyPreset = (presetType: 'test1' | 'test2' | 'test3' | 'test4' | 'test5' | 'reset') => {
    switch (presetType) {
      case 'test1':
        // Case 1: Blue Mug + Red Mug (P05 in stock, P06 out of stock -> 0 bundles)
        setRequirements([
          { id: 'req-1', productId: 'P05', quantity: 1 },
          { id: 'req-2', productId: 'P06', quantity: 1 }
        ]);
        setExactOnly(false);
        setBudgetConstraint(null);
        break;

      case 'test2':
        // Case 2: Specific product with quantity > 1 (2x Blue Mug P05)
        setRequirements([
          { id: 'req-1', productId: 'P05', quantity: 2 }
        ]);
        setExactOnly(false);
        setBudgetConstraint(null);
        break;

      case 'test3':
        // Case 3: User specifies a budget (P07 + P08 with budget ₹2,000)
        setRequirements([
          { id: 'req-1', productId: 'P07', quantity: 1 },
          { id: 'req-2', productId: 'P08', quantity: 1 }
        ]);
        setExactOnly(false);
        setBudgetConstraint(2000);
        break;

      case 'test4':
        // Case 4: User requests an unavailable product (P01 Blue Tshirt M, stock 0)
        setRequirements([
          { id: 'req-1', productId: 'P01', quantity: 1 }
        ]);
        setExactOnly(false);
        setBudgetConstraint(null);
        break;

      case 'test5':
        // Case 5: Fewer than 10 valid bundles exist (2x Blue Mug P05 with budget ₹1,200)
        setRequirements([
          { id: 'req-1', productId: 'P05', quantity: 2 }
        ]);
        setExactOnly(false);
        setBudgetConstraint(1200);
        break;

      case 'reset':
        // Clears requirements and restores 10 baseline bundles
        setRequirements([]);
        setExactOnly(false);
        setBudgetConstraint(null);
        setSelectedProductIdInput('');
        setQuantityInput(1);
        break;
    }
  };

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductIdInput) return;

    const prod = fixture.products.find(p => p.id === selectedProductIdInput);
    if (!prod) return;

    const existingIdx = requirements.findIndex(r => r.productId === prod.id);
    if (existingIdx >= 0) {
      // Increment quantity
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
          colour: prod.colour,
          size: prod.size,
          quantity: Math.max(1, quantityInput)
        }
      ]);
    }

    setSelectedProductIdInput('');
    setQuantityInput(1);
  };

  const handleRemoveRequirement = (id: string) => {
    setRequirements(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateRequirementQty = (id: string, delta: number) => {
    setRequirements(prev =>
      prev
        .map(r => {
          if (r.id === id) {
            const newQty = r.quantity + delta;
            return newQty > 0 ? { ...r, quantity: newQty } : null;
          }
          return r;
        })
        .filter((r): r is ProductRequirement => r !== null)
    );
  };

  // Generate dynamic recommendations based on active requirements & constraints
  const recommendationResult = useMemo(() => {
    return generateBundleRecommendations(
      fixture.products,
      requirements,
      budgetConstraint,
      exactOnly,
      fixture.shippingRule,
      fixture.taxRule
    );
  }, [fixture, requirements, budgetConstraint, exactOnly]);

  const { bundles, hasUnavailableProduct, unavailableReason, isOverBudgetForAll, overBudgetReason } =
    recommendationResult;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. HEADER & INTRO BANNER                                                  */}
      {/* ========================================================================= */}
      <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#2C3A2B]/10 text-[#2C3A2B] border border-[#2C3A2B]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#2C3A2B]" />
              <span>Dynamic Bundle Recommendation Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2C3A2B] tracking-tight">
              Dynamic Product Bundle Recommendations
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed max-w-3xl">
              Specify your required products, quantities, or budget to receive up to 20 distinct, validated,
              and compatible bundle options generated dynamically from the official C07 catalogue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleApplyPreset('reset')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5A5A40] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Reset all filters to view 20 predefined baseline bundles"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to 20 Baselines</span>
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* QUICK VERIFICATION PRESETS (1-Click Test Buttons)                       */}
        {/* ======================================================================= */}
        <div className="mt-5 pt-4 border-t border-[#E6E1D3]/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#8B5A2B] uppercase tracking-wider flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3 h-3" /> Quick Test Cases:
            </span>

            <button
              onClick={() => handleApplyPreset('test1')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#FDFBF7] hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] transition-all hover:scale-102 cursor-pointer shadow-2xs"
              title="Test 1: User requests 1x Blue Mug + 1x Red Mug (Red Mug is out-of-stock)"
            >
              <span className="font-bold text-amber-800">Test 1:</span> Blue Mug + Red Mug
            </button>

            <button
              onClick={() => handleApplyPreset('test2')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#FDFBF7] hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] transition-all hover:scale-102 cursor-pointer shadow-2xs"
              title="Test 2: Specific product with quantity > 1 (2x Blue Mug)"
            >
              <span className="font-bold text-emerald-800">Test 2:</span> 2x Blue Mug
            </button>

            <button
              onClick={() => handleApplyPreset('test3')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#FDFBF7] hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] transition-all hover:scale-102 cursor-pointer shadow-2xs"
              title="Test 3: Mouse + Keyboard within ₹2,000 Budget"
            >
              <span className="font-bold text-indigo-800">Test 3:</span> Budget ₹2,000 (P07+P08)
            </button>

            <button
              onClick={() => handleApplyPreset('test4')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#FDFBF7] hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] transition-all hover:scale-102 cursor-pointer shadow-2xs"
              title="Test 4: Request unavailable product (P01 Blue Tshirt M, stock 0)"
            >
              <span className="font-bold text-rose-800">Test 4:</span> Unavailable Product (P01)
            </button>

            <button
              onClick={() => handleApplyPreset('test5')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#FDFBF7] hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] transition-all hover:scale-102 cursor-pointer shadow-2xs"
              title="Test 5: Combination with fewer than 10 valid bundles (2x Blue Mug + Budget ₹1,200)"
            >
              <span className="font-bold text-purple-800">Test 5:</span> Fewer than 10 Bundles
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE REQUIREMENT BUILDER BAR                                    */}
      {/* ========================================================================= */}
      <div className="p-5 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          {/* Add Product Form */}
          <form onSubmit={handleAddRequirement} className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-bold text-[#8B5A2B] uppercase tracking-wider mb-1">
                Select Required Product
              </label>
              <select
                value={selectedProductIdInput}
                onChange={e => setSelectedProductIdInput(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium text-[#2C2C1E] bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] cursor-pointer"
              >
                <option value="">-- Choose product to require --</option>
                {fixture.products.map(p => {
                  const isOos = !p.inStock || (p.stockQuantity !== undefined && p.stockQuantity <= 0);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.name} ({p.colour || 'Standard'}{p.size && p.size !== 'One' ? `, Size ${p.size}` : ''}) · {formatINR(p.price)} {isOos ? '· [OUT OF STOCK]' : `(${p.stockQuantity} in stock)`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-[#8B5A2B] uppercase tracking-wider mb-1">
                Quantity
              </label>
              <div className="flex items-center rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantityInput(q => Math.max(1, q - 1))}
                  className="px-2.5 py-2 text-xs font-bold text-[#5A5A40] hover:bg-[#E6E1D3] transition-colors cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={quantityInput}
                  onChange={e => setQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center text-xs font-bold font-mono text-[#2C2C1E] bg-transparent focus:outline-hidden py-2"
                />
                <button
                  type="button"
                  onClick={() => setQuantityInput(q => q + 1)}
                  className="px-2.5 py-2 text-xs font-bold text-[#5A5A40] hover:bg-[#E6E1D3] transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={!selectedProductIdInput}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] disabled:bg-stone-300 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </form>

          {/* Budget Limit & Exact Only Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-3 lg:pt-0 lg:border-l lg:border-[#E6E1D3]/80 lg:pl-4">
            <div>
              <label className="block text-[11px] font-bold text-[#8B5A2B] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Wallet className="w-3 h-3 text-[#8B5A2B]" /> Target Budget
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8B8B7A] font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Optional limit"
                  min="0"
                  step="500"
                  value={budgetConstraint ?? ''}
                  onChange={e => setBudgetConstraint(e.target.value ? Number(e.target.value) : null)}
                  className="w-32 pl-6 pr-2.5 py-2 text-xs font-bold font-mono text-[#2C2C1E] bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B]"
                />
              </div>
            </div>

            <div className="pt-4 sm:pt-0">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={exactOnly}
                  onChange={e => setExactOnly(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-[#E6E1D3] text-[#2C3A2B] focus:ring-0 cursor-pointer accent-[#2C3A2B]"
                />
                <span className="text-xs font-semibold text-[#2C2C1E]">
                  Exact products only
                </span>
              </label>
              <span className="text-[10px] text-[#5A5A40] block pl-6">
                No complementary items added
              </span>
            </div>
          </div>
        </div>

        {/* Active Requirements List Chips */}
        {requirements.length > 0 && (
          <div className="pt-3 border-t border-[#E6E1D3]/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#8B5A2B] uppercase tracking-wider">
                Active Requirements ({requirements.length}):
              </span>

              {requirements.map(req => {
                const prod = fixture.products.find(p => p.id === req.productId);
                const isOos = !prod || !prod.inStock || (prod.stockQuantity !== undefined && prod.stockQuantity <= 0);

                return (
                  <div
                    key={req.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs shadow-2xs transition-all ${
                      isOos
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-[#FDFBF7] border-[#E6E1D3] text-[#2C2C1E]'
                    }`}
                  >
                    {prod && (
                      <img
                        src={getProductImageUrl(prod.image, prod.id)}
                        alt={prod.name}
                        className="w-5 h-5 rounded-md object-contain bg-white border border-[#E6E1D3]"
                      />
                    )}
                    <span className="font-bold">{req.quantity}x</span>
                    <span className="font-medium">
                      {prod ? `${prod.colour || ''} ${prod.name}` : req.productId}
                    </span>
                    <span className="font-mono text-[11px] text-[#8B5A2B]">
                      {prod ? formatINR(prod.price * req.quantity) : ''}
                    </span>

                    {/* Stepper */}
                    <div className="flex items-center ml-1 gap-1">
                      <button
                        onClick={() => handleUpdateRequirementQty(req.id, -1)}
                        className="w-4 h-4 flex items-center justify-center rounded-sm bg-[#E6E1D3] hover:bg-[#D6CFBF] text-[#2C2C1E] font-bold text-[10px] cursor-pointer"
                        title="Decrease quantity"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleUpdateRequirementQty(req.id, 1)}
                        className="w-4 h-4 flex items-center justify-center rounded-sm bg-[#E6E1D3] hover:bg-[#D6CFBF] text-[#2C2C1E] font-bold text-[10px] cursor-pointer"
                        title="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveRequirement(req.id)}
                        className="ml-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. VALIDATION ALERTS & STATUS EXPLANATION                                 */}
      {/* ========================================================================= */}
      {hasUnavailableProduct && (
        <div className="p-4 rounded-[22px] bg-rose-50 border border-rose-200 shadow-2xs flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-serif text-sm font-bold text-rose-900">
              Unavailable Product in Requirements
            </h4>
            <p className="text-xs text-rose-800 leading-relaxed">
              {unavailableReason}
            </p>
            <p className="text-[11px] text-rose-700 italic">
              Requirement matching rule: Every recommended bundle must include the required products. Since the requested item is out of stock in active inventory, zero valid bundles can be formed.
            </p>
          </div>
        </div>
      )}

      {isOverBudgetForAll && !hasUnavailableProduct && (
        <div className="p-4 rounded-[22px] bg-amber-50 border border-amber-200 shadow-2xs flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-serif text-sm font-bold text-amber-900">
              No Bundles Within Specified Budget
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {overBudgetReason || `No valid bundles could satisfy all constraints within ${formatINR(budgetConstraint || 0)}.`}
            </p>
            <p className="text-[11px] text-amber-700">
              Try increasing your target budget or removing higher-priced required products.
            </p>
          </div>
        </div>
      )}

      {/* Results Count Banner */}
      {!hasUnavailableProduct && !isOverBudgetForAll && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] shadow-2xs text-xs">
          <div className="flex items-center gap-2 text-[#2C2C1E]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">
              Showing {bundles.length} {bundles.length === 1 ? 'valid bundle' : 'distinct valid bundles'}
            </span>
            {bundles.length < 10 && (
              <span className="text-[#8B5A2B] font-medium">
                (All valid combinations meeting your exact requirements and constraints)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[#5A5A40]">
            <span>Shipping: Flat {formatINR(fixture.shippingRule.baseFee ?? 100)}</span>
            <span>•</span>
            <span>Tax: Included</span>
            {budgetConstraint && (
              <>
                <span>•</span>
                <span className="font-mono font-bold text-[#2C3A2B]">
                  Budget Cap: {formatINR(budgetConstraint)}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RECOMMENDATION CARDS (Grid of Up to 10 Distinct Valid Bundles)          */}
      {/* ========================================================================= */}
      {bundles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bundles.map((bundle, index) => {
            const isExpanded = expandedCardId === bundle.id;

            return (
              <div
                key={bundle.id}
                className="bg-white border border-[#E6E1D3] rounded-[24px] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Card Header: Bundle Number, Badges & Price */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono bg-[#2C3A2B] text-white">
                          #{index + 1}
                        </span>
                        {bundle.isExactMatch && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            Exact Match
                          </span>
                        )}
                        {bundle.isPredefined && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4F1EA] text-[#5A5A40] border border-[#E6E1D3]">
                            Predefined
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8EFE9] text-[#2C3A2B]">
                          {bundle.totalItemCount} {bundle.totalItemCount === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C3A2B] group-hover:text-[#8B5A2B] transition-colors leading-snug">
                        {bundle.name}
                      </h3>
                      <p className="text-xs text-[#5A5A40] leading-relaxed line-clamp-2">
                        {bundle.tagline}
                      </p>
                    </div>

                    {/* Price Block */}
                    <div className="text-right shrink-0">
                      <div className="text-xl sm:text-2xl font-bold font-mono text-[#2C3A2B]">
                        {formatINR(bundle.landedPrice)}
                      </div>
                      <span className="text-[10px] font-medium text-[#8B8B7A] block">
                        Landed Total (incl. ₹{bundle.shippingFee} shipping)
                      </span>
                      {bundle.remainingBudget !== undefined && (
                        <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {bundle.remainingBudget >= 0
                            ? `+${formatINR(bundle.remainingBudget)} left`
                            : `-${formatINR(Math.abs(bundle.remainingBudget))} over`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Thumbnails Strip */}
                  <div className="p-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-2xl">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {bundle.items.map((it, itemIdx) => (
                        <div
                          key={`${it.product.id}-${itemIdx}`}
                          className="relative shrink-0 w-14 h-14 bg-white rounded-xl border border-[#E6E1D3] p-1 flex items-center justify-center group/thumb"
                          title={`${it.quantity}x ${it.product.name} (${formatINR(it.product.price)})`}
                        >
                          <img
                            src={getProductImageUrl(it.product.image, it.product.id)}
                            alt={it.product.name}
                            className="w-full h-full object-contain"
                          />
                          {it.quantity > 1 && (
                            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono bg-[#2C3A2B] text-white shadow-2xs">
                              ×{it.quantity}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Included Items Text List */}
                    <div className="mt-2 text-xs text-[#4A4A35] flex flex-wrap items-center gap-x-2 gap-y-1">
                      {bundle.items.map((it, itemIdx) => (
                        <span key={`txt-${it.product.id}-${itemIdx}`} className="inline-flex items-center gap-1">
                          <span className="font-semibold text-[#2C3A2B]">
                            {it.quantity > 1 ? `${it.quantity}x ` : ''}{it.product.name}
                          </span>
                          <span className="text-[#8B5A2B] font-mono text-[11px]">
                            ({formatINR(it.product.price * it.quantity)})
                          </span>
                          {itemIdx < bundle.items.length - 1 && <span className="text-[#D6CFBF]">•</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Match Explanation Callout */}
                  <div className="p-3 rounded-xl bg-[#F4F1EA]/60 border border-[#E6E1D3]/80 text-xs flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#8B5A2B] shrink-0 mt-0.5" />
                    <p className="text-[#4A4A35] leading-relaxed">
                      {bundle.matchExplanation}
                    </p>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-[#E6E1D3]/80 space-y-2 text-xs animate-in fade-in duration-200">
                      <div className="font-bold text-[#2C3A2B] text-xs">Bundle Item Specifications:</div>
                      <div className="space-y-1.5">
                        {bundle.items.map((it, idx) => (
                          <div
                            key={`spec-${it.product.id}-${idx}`}
                            className="flex items-center justify-between p-2 rounded-lg bg-[#FDFBF7] border border-[#E6E1D3] text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#8B5A2B]">{it.product.id}</span>
                              <span className="font-medium text-[#2C2C1E]">{it.product.name}</span>
                              <span className="text-[#7A7A68]">
                                ({it.product.category}{it.product.colour ? ` · ${it.product.colour}` : ''})
                              </span>
                            </div>
                            <div className="font-mono text-[#2C2C1E] font-semibold">
                              {it.quantity} × {formatINR(it.product.price)} = {formatINR(it.product.price * it.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs text-[#5A5A40]">
                        <span>Item Subtotal: {formatINR(bundle.itemSubtotal)}</span>
                        <span>Shipping: {formatINR(bundle.shippingFee)}</span>
                        <span className="font-bold font-mono text-[#2C3A2B]">
                          Total Landed: {formatINR(bundle.landedPrice)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions: View Details & Select Bundle */}
                <div className="mt-4 pt-3 border-t border-[#E6E1D3]/80 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setExpandedCardId(isExpanded ? null : bundle.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#5A5A40] hover:text-[#2C2C1E] transition-colors cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Hide Specs</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>View Specs</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onSelectBundle(bundle)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-102 active:scale-98"
                  >
                    <PackageCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Select Bundle</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
