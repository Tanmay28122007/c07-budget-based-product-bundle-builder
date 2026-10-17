import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Check,
  TrendingUp,
  Package,
  Layers,
  ShoppingBag,
  ArrowRight,
  Info,
  SlidersHorizontal,
  Wallet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product } from '../../types';
import { BundleRecommendation } from '../../utils/bundleRecommendations';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';

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

interface BundleAddOnsPanelProps {
  referenceBundle: BundleRecommendation | null;
  targetBudget: number;
  availableBundles: BundleRecommendation[];
  onSelectReferenceBundle: (bundle: BundleRecommendation) => void;
  onIncreaseBudget: (additionalAmount: number) => void;
}

export const BundleAddOnsPanel: React.FC<BundleAddOnsPanelProps> = ({
  referenceBundle,
  targetBudget,
  availableBundles,
  onSelectReferenceBundle,
  onIncreaseBudget
}) => {
  const {
    fixture,
    addItemToCart,
    currentItems,
    addNotification
  } = useApp();

  const [selectedAddonCategory, setSelectedAddonCategory] = useState<string>('all');
  const [addedAddonIds, setAddedAddonIds] = useState<Set<string>>(new Set());

  // Landed cost of reference bundle
  const bundleLandedCost = referenceBundle ? referenceBundle.landedPrice : 0;
  const remainingBudget = Math.max(0, targetBudget - bundleLandedCost);
  const isBudgetExceeded = bundleLandedCost > targetBudget;

  // Set of product IDs currently in the reference bundle or cart
  const bundleProductIds = useMemo(() => {
    const ids = new Set<string>();
    if (referenceBundle) {
      for (const it of referenceBundle.items) {
        ids.add(it.product.id);
      }
    }
    // Also include items already in currentItems
    for (const p of Object.values(currentItems)) {
      if (p) ids.add(p.id);
    }
    return ids;
  }, [referenceBundle, currentItems]);

  // Find all affordable add-on products from catalogue that fit within remaining budget
  const affordableAddons = useMemo(() => {
    if (remainingBudget <= 0) return [];

    let list = fixture.products.filter(p => {
      // Must be in stock
      const inStock = p.inStock && (p.stockQuantity ?? 1) > 0;
      // Must not already be in the bundle
      const notInBundle = !bundleProductIds.has(p.id);
      // Must fit in remaining budget
      const fitsInBudget = p.price <= remainingBudget;

      return inStock && notInBundle && fitsInBudget;
    });

    if (selectedAddonCategory !== 'all') {
      const cat = selectedAddonCategory.toLowerCase();
      list = list.filter(p => p.category.toLowerCase() === cat);
    }

    // Sort by price descending to show highest-value upgrades first
    list.sort((a, b) => b.price - a.price);

    return list;
  }, [fixture.products, remainingBudget, bundleProductIds, selectedAddonCategory]);

  // Unique categories of available addons
  const addonCategories = useMemo(() => {
    const all = fixture.products
      .filter(p => p.price <= remainingBudget && !bundleProductIds.has(p.id))
      .map(p => p.category);
    return Array.from(new Set(all));
  }, [fixture.products, remainingBudget, bundleProductIds]);

  const handleAddAddon = (product: Product) => {
    addItemToCart(product);
    setAddedAddonIds(prev => new Set([...prev, product.id]));
    addNotification(
      'Add-on Added to Bundle',
      `Added "${product.name}" (${formatINR(product.price)}) with your remaining budget.`,
      'success'
    );
  };

  return (
    <div className="bg-white border border-[#E6E1D3] rounded-[24px] p-6 shadow-xs space-y-6">
      {/* Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E6E1D3]/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-900 border border-emerald-300/60 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Smart Add-on Recommendations</span>
            </span>
            <span className="text-xs font-mono text-[#8B8B7A]">
              Remaining Spend Matching
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2C3A2B] mt-1">
            Add-ons & Workstation Upgrades
          </h3>
          <p className="text-xs text-[#5A5A40] mt-0.5 max-w-2xl">
            When you have money left to spend from your target budget, these compatible recommendations dynamically appear to help maximize your productivity setup.
          </p>
        </div>

        {/* Reference Bundle Selector & Financial Snapshot */}
        <div className="flex flex-wrap items-center gap-3 bg-[#FDFBF7] p-3 rounded-2xl border border-[#E6E1D3] shrink-0">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block">
              Reference Bundle
            </span>
            {availableBundles.length > 0 ? (
              <select
                value={referenceBundle?.id || ''}
                onChange={(e) => {
                  const found = availableBundles.find(b => b.id === e.target.value);
                  if (found) onSelectReferenceBundle(found);
                }}
                className="text-xs font-bold text-[#2C3A2B] bg-transparent border-0 focus:ring-0 cursor-pointer max-w-[200px] truncate"
              >
                {availableBundles.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({formatINR(b.landedPrice)})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-bold text-[#2C3A2B]">
                {referenceBundle ? referenceBundle.name : 'No Bundle Selected'}
              </span>
            )}
          </div>

          <div className="h-8 w-px bg-[#E6E1D3]" />

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block">
              Remaining Money to Spend
            </span>
            <span className={`text-base font-bold font-mono ${
              remainingBudget > 0 ? 'text-emerald-700' : 'text-[#8B8B7A]'
            }`}>
              {remainingBudget > 0 ? formatINR(remainingBudget) : '₹0 Left'}
            </span>
          </div>
        </div>
      </div>

      {/* When Budget Has Remaining Money */}
      {remainingBudget > 0 && !isBudgetExceeded ? (
        <div className="space-y-4">
          {/* Highlight Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">
                  You have {formatINR(remainingBudget)} unspent budget remaining!
                </span>
                <span className="text-emerald-800/80 block mt-0.5">
                  Showing {affordableAddons.length} compatible product upgrades that fit strictly within your remaining spend.
                </span>
              </div>
            </div>

            {/* Category filter pills */}
            {addonCategories.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedAddonCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedAddonCategory === 'all'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100/50'
                  }`}
                >
                  All ({affordableAddons.length})
                </button>
                {addonCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedAddonCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      selectedAddonCategory === cat
                        ? 'bg-emerald-800 text-white shadow-2xs'
                        : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add-ons Products Grid */}
          {affordableAddons.length === 0 ? (
            <div className="p-8 text-center bg-[#FDFBF7] border border-[#E6E1D3] rounded-2xl">
              <Info className="w-8 h-8 text-[#8B8B7A] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#2C3A2B]">
                No additional add-ons match the selected category under {formatINR(remainingBudget)}.
              </p>
              <button
                type="button"
                onClick={() => setSelectedAddonCategory('all')}
                className="mt-2 text-xs font-bold text-[#8B5A2B] hover:underline cursor-pointer"
              >
                View all affordable items
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {affordableAddons.slice(0, 8).map(product => {
                const isAdded = addedAddonIds.has(product.id);
                const moneyLeftAfter = remainingBudget - product.price;

                return (
                  <div
                    key={product.id}
                    className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Thumbnail & Category */}
                      <div className="relative w-full h-32 bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 mb-3 border border-[#E6E1D3]/50">
                        <img
                          src={getProductImageUrl(product.image, product.id)}
                          alt={product.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-2 left-2 text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3]">
                          {product.category}
                        </span>
                        <span className="absolute top-2 right-2 text-[9px] font-mono text-[#8B8B7A] px-1.5 py-0.5 rounded bg-[#FDFBF7] border border-[#E6E1D3]">
                          {product.id}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2C3A2B] line-clamp-2 leading-snug">
                        {product.name}
                      </h4>

                      {/* Headroom badge */}
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-mono font-semibold border border-emerald-200">
                        <span>{formatINR(moneyLeftAfter)} left after add</span>
                      </div>
                    </div>

                    {/* Price & Add Button */}
                    <div className="mt-4 pt-3 border-t border-[#E6E1D3]/60 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-[#8B8B7A] block">Add-on Price</span>
                        <span className="text-sm font-bold font-mono text-[#2C3A2B]">
                          {formatINR(product.price)}
                        </span>
                      </div>

                      {isAdded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-300">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Added
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddAddon(product)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* When Budget is 100% Allocated or Over */
        <div className="p-6 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                Budget 100% Allocated
              </span>
              <span className="text-xs text-[#5A5A40]">
                {formatINR(bundleLandedCost)} spent of {formatINR(targetBudget)}
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-[#2C3A2B]">
              Want to add complementary desk accessories?
            </h4>
            <p className="text-xs text-[#5A5A40]">
              Your current budget has been fully absorbed by this bundle setup. Increase your target budget to unlock high-utility add-ons like desk lamps, USB-C docks, and wireless mice.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-[#8B5A2B] mr-1">
              Quick Budget Boost:
            </span>
            <button
              type="button"
              onClick={() => onIncreaseBudget(1000)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] transition-colors cursor-pointer shadow-2xs hover:scale-102"
            >
              + ₹1,000
            </button>
            <button
              type="button"
              onClick={() => onIncreaseBudget(2500)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] transition-colors cursor-pointer shadow-2xs hover:scale-102"
            >
              + ₹2,500
            </button>
            <button
              type="button"
              onClick={() => onIncreaseBudget(5000)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] transition-colors cursor-pointer shadow-2xs hover:scale-102"
            >
              + ₹5,000
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
