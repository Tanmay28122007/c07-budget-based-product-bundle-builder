import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  Plus,
  Trash2,
  Package,
  Layers,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  CreditCard,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
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

function getColourHex(colour?: string): string {
  if (!colour) return '#9CA3AF';
  const c = colour.toLowerCase();
  if (c.includes('blue')) return '#2563EB';
  if (c.includes('red')) return '#DC2626';
  if (c.includes('black')) return '#1E293B';
  if (c.includes('grey') || c.includes('gray')) return '#64748B';
  if (c.includes('green')) return '#16A34A';
  if (c.includes('brown')) return '#8B5A2B';
  if (c.includes('silver')) return '#94A3B8';
  if (c.includes('khaki') || c.includes('tan')) return '#C3B091';
  if (c.includes('white')) return '#FFFFFF';
  return '#9CA3AF';
}

interface CreateBundleCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWorkspace?: () => void;
}

export const CreateBundleCatalogModal: React.FC<CreateBundleCatalogModalProps> = ({
  isOpen,
  onClose,
  onOpenWorkspace
}) => {
  const {
    fixture,
    currentItems,
    addItemToCart,
    removeProduct,
    resetBundle,
    budget,
    validation,
    initiateCheckout,
    addNotification
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name'>('price_asc');

  // Categories list
  const categories = useMemo(() => {
    return Array.from(new Set(fixture.products.map(p => p.category)));
  }, [fixture.products]);

  // Items currently inside bundle
  const activeBundleEntries = useMemo(() => {
    return Object.entries(currentItems).filter(([_, p]) => p !== null) as [string, Product][];
  }, [currentItems]);

  const addedProductIds = useMemo(() => {
    return new Set(activeBundleEntries.map(([_, p]) => p.id));
  }, [activeBundleEntries]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...fixture.products];

    if (onlyInStock) {
      list = list.filter(p => p.inStock && (p.stockQuantity ?? 1) > 0);
    }

    if (selectedCategory !== 'all') {
      const cat = selectedCategory.toLowerCase();
      list = list.filter(p => p.category.toLowerCase() === cat);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [fixture.products, onlyInStock, selectedCategory, searchQuery, sortBy]);

  if (!isOpen) return null;

  const remainingBudget = validation.landedPrice.remainingBudget;
  const isBudgetExceeded = remainingBudget < 0;
  const landedPrice = validation.landedPrice.landedPrice;
  const budgetPercentage = budget > 0 ? Math.min(100, Math.round((landedPrice / budget) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2C2C1E]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#FDFBF7] border border-[#E6E1D3] rounded-[28px] shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#E6E1D3] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#2C3A2B] text-amber-200">
                Custom Bundle Creator
              </span>
              <span className="text-xs text-[#8B8B7A] font-mono">
                {activeBundleEntries.length} items selected
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2C3A2B] mt-1">
              Select Products to Assemble Your Bundle
            </h2>
            <p className="text-xs text-[#5A5A40]">
              Browse the complete 60-item catalogue. Click "+ Add to Bundle" on any item to build your customized setup.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#5A5A40] hover:text-[#2C3A2B] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            aria-label="Close custom bundle builder"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Bundle Assembly Bar */}
        <div className="p-4 sm:p-5 bg-[#F4F1EA]/80 border-b border-[#E6E1D3] shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Live Financials */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block">
                  Landed Price
                </span>
                <span className="text-lg sm:text-xl font-bold font-mono text-[#2C3A2B]">
                  {formatINR(landedPrice)}
                </span>
              </div>

              <div className="hidden sm:block h-8 w-px bg-[#E6E1D3]" />

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block">
                  Target Budget
                </span>
                <span className="text-lg sm:text-xl font-bold font-mono text-[#5A5A40]">
                  {formatINR(budget)}
                </span>
              </div>

              <div className="hidden sm:block h-8 w-px bg-[#E6E1D3]" />

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block">
                  Budget Balance
                </span>
                <span className={`text-lg sm:text-xl font-bold font-mono ${
                  isBudgetExceeded ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {isBudgetExceeded ? `+${formatINR(Math.abs(remainingBudget))} Over` : `${formatINR(remainingBudget)} Left`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-32 hidden md:block">
                <div className="h-2 w-full bg-[#E6E1D3] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isBudgetExceeded ? 'bg-rose-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, budgetPercentage)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-[#8B8B7A] mt-0.5 block">
                  {budgetPercentage}% of budget
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {activeBundleEntries.length > 0 && (
                <button
                  type="button"
                  onClick={resetBundle}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              {onOpenWorkspace && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWorkspace();
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View in Workspace</span>
                </button>
              )}

              <button
                type="button"
                disabled={activeBundleEntries.length === 0}
                onClick={() => {
                  onClose();
                  initiateCheckout();
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs ${
                  activeBundleEntries.length > 0
                    ? 'bg-[#2C3A2B] hover:bg-[#1E281D] text-white cursor-pointer hover:scale-102 active:scale-98'
                    : 'bg-[#E6E1D3] text-[#8B8B7A] cursor-not-allowed'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Buy Now ({formatINR(landedPrice)})</span>
              </button>
            </div>
          </div>

          {/* Quick Active Items Chips */}
          {activeBundleEntries.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#E6E1D3]/60">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] font-semibold">
                In Bundle:
              </span>
              {activeBundleEntries.map(([slotKey, prod]) => (
                <div
                  key={slotKey}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E6E1D3] text-xs font-medium text-[#2C3A2B] shadow-2xs"
                >
                  <img
                    src={getProductImageUrl(prod.image, prod.id)}
                    alt=""
                    className="w-4 h-4 object-contain rounded"
                  />
                  <span className="font-semibold truncate max-w-[140px]">{prod.name}</span>
                  <span className="font-mono text-[10px] text-[#8B5A2B]">({formatINR(prod.price)})</span>
                  <button
                    type="button"
                    onClick={() => removeProduct(slotKey)}
                    className="p-0.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                    title={`Remove ${prod.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E6E1D3] flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8B7A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, ID, or specification..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-[#FDFBF7] border border-[#E6E1D3] text-[#2C3A2B] placeholder:text-[#8B8B7A] focus:outline-none focus:border-[#2C3A2B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B8B7A] hover:text-[#2C3A2B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-[#FDFBF7] border border-[#E6E1D3] text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B] cursor-pointer"
            >
              <option value="all">All Categories ({fixture.products.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-[#FDFBF7] border border-[#E6E1D3] text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B] cursor-pointer"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Product Name (A-Z)</option>
            </select>

            {/* In-Stock Toggle */}
            <button
              type="button"
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                onlyInStock
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-[#FDFBF7] text-[#5A5A40] border-[#E6E1D3]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>In-Stock Only</span>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FDFBF7]">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-[#5A5A40] max-w-md mx-auto">
              <Package className="w-12 h-12 mx-auto text-[#8B8B7A] stroke-[1.5] mb-3" />
              <h3 className="font-serif font-bold text-lg text-[#2C3A2B]">No products found</h3>
              <p className="text-xs text-[#8B8B7A] mt-1">
                Try adjusting your search query or reset category filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setOnlyInStock(false);
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#2C3A2B] text-white cursor-pointer hover:bg-[#1E281D]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isAdded = addedProductIds.has(product.id);
                const matchingSlot = activeBundleEntries.find(([_, p]) => p.id === product.id);

                return (
                  <div
                    key={product.id}
                    className={`p-4 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between ${
                      isAdded
                        ? 'border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs'
                        : 'border-[#E6E1D3] hover:border-[#8B5A2B]/40 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Image & Header */}
                      <div className="relative w-full h-36 bg-[#F8F7F4] rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3 border border-[#E6E1D3]/50">
                        <img
                          src={getProductImageUrl(product.image, product.id)}
                          alt={product.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                        <span className="absolute top-2 left-2 text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#8B5A2B] border border-[#E6E1D3] shadow-2xs">
                          {product.category}
                        </span>
                        <span className="absolute top-2 right-2 text-[10px] font-mono text-[#8B8B7A] px-1.5 py-0.5 rounded bg-white/90 border border-[#E6E1D3]">
                          {product.id}
                        </span>
                      </div>

                      {/* Title & Specs */}
                      <h4 className="font-serif font-bold text-sm text-[#2C3A2B] leading-snug line-clamp-2">
                        {product.name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {product.attributes.colour && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#5A5A40] px-1.5 py-0.5 rounded bg-[#F4F1EA] border border-[#E6E1D3]">
                            <span
                              className="w-2 h-2 rounded-full border border-black/20"
                              style={{ backgroundColor: getColourHex(product.attributes.colour) }}
                            />
                            {product.attributes.colour}
                          </span>
                        )}
                        {product.attributes.size && (
                          <span className="text-[10px] font-mono text-[#5A5A40] px-1.5 py-0.5 rounded bg-[#F4F1EA] border border-[#E6E1D3]">
                            {product.attributes.size}
                          </span>
                        )}
                        {product.attributes.connector && (
                          <span className="text-[10px] font-mono uppercase text-[#5A5A40] px-1.5 py-0.5 rounded bg-[#F4F1EA] border border-[#E6E1D3]">
                            {product.attributes.connector}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Add/Remove button */}
                    <div className="mt-4 pt-3 border-t border-[#E6E1D3]/60 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#8B8B7A] block leading-tight">Price</span>
                        <span className="text-base font-bold font-mono text-[#2C3A2B]">
                          {formatINR(product.price)}
                        </span>
                      </div>

                      {isAdded ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Added
                          </span>
                          <button
                            type="button"
                            onClick={() => matchingSlot && removeProduct(matchingSlot[0])}
                            className="p-1 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                            title="Remove from bundle"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!product.inStock}
                          onClick={() => {
                            addItemToCart(product);
                            addNotification(
                              'Product Added to Bundle',
                              `Added "${product.name}" (${formatINR(product.price)}) to custom bundle.`,
                              'success'
                            );
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                            product.inStock
                              ? 'bg-[#2C3A2B] hover:bg-[#1E281D] text-white shadow-2xs hover:scale-102 active:scale-98'
                              : 'bg-[#F4F1EA] text-[#8B8B7A] cursor-not-allowed border border-[#E6E1D3]'
                          }`}
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

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E6E1D3] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#5A5A40]">
            Showing <strong className="text-[#2C3A2B]">{filteredProducts.length}</strong> products available in catalogue.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] cursor-pointer transition-colors shadow-xs"
          >
            Done Assembling
          </button>
        </div>
      </div>
    </div>
  );
};
