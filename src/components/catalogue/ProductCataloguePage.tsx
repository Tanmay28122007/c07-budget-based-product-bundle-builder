import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Package,
  Eye,
  X,
  ExternalLink,
  Plus,
  Check,
  PackageSearch,
  RotateCcw,
  Trash2,
  ChevronRight,
  Info
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
  return '#9CA3AF';
}

export const ProductCataloguePage: React.FC = () => {
  const {
    fixture,
    isCustomFixture,
    currentItems,
    selectProduct,
    addItemToCart,
    removeProduct,
    setActiveTab,
    openProductDetails,
    searchQuery,
    setSearchQuery,
    setIsCartOpen
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<'price_asc' | 'price_desc' | 'name' | 'id'>('price_asc');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Extract unique categories from fixture products
  const categories = useMemo(() => {
    const set = new Set(fixture.products.map(p => p.category));
    return Array.from(set);
  }, [fixture.products]);

  // Filtering and sorting
  const filteredProducts = useMemo(() => {
    return fixture.products
      .filter(p => {
        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        // Stock filter
        if (selectedStockStatus === 'in_stock' && !p.inStock) return false;
        if (selectedStockStatus === 'out_of_stock' && p.inStock) return false;
        // Search term (using single top navigation search bar)
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortField === 'price_asc') return a.price - b.price;
        if (sortField === 'price_desc') return b.price - a.price;
        if (sortField === 'name') return a.name.localeCompare(b.name);
        return a.id.localeCompare(b.id);
      });
  }, [fixture.products, selectedCategory, selectedStockStatus, searchQuery, sortField]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStockStatus('all');
    setSortField('price_asc');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#2C3A2B]">
              Product Catalogue
            </h1>
            {!isCustomFixture && (
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#F5F5EC] text-[#5A5A40] border border-[#E6E1D3]">
                Synthetic Preview Data
              </span>
            )}
          </div>
          <p className="text-xs text-[#5A5A40] mt-0.5">
            Verified inventory database for {fixture.activity.name} activity.
          </p>
        </div>
      </div>

      {/* Filters Strip (Single clean row without redundant second search bar) */}
      <div className="p-4 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#5A5A40] font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-xs bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl px-3 py-2 text-[#2C3A2B] focus:outline-hidden"
              >
                <option value="all">All Categories ({fixture.products.length})</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#5A5A40] font-medium">Availability:</span>
              <select
                value={selectedStockStatus}
                onChange={e => setSelectedStockStatus(e.target.value)}
                className="text-xs bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl px-3 py-2 text-[#2C3A2B] focus:outline-hidden"
              >
                <option value="all">All Items</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock Only</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#5A5A40] font-medium">Sort:</span>
              <select
                value={sortField}
                onChange={e => setSortField(e.target.value as any)}
                className="text-xs bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl px-3 py-2 text-[#2C3A2B] focus:outline-hidden"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
                <option value="id">Product ID</option>
              </select>
            </div>

            {/* Active search filter tag from top search bar */}
            {searchQuery && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] rounded-xl text-xs font-mono">
                <span className="text-[#8B8B7A]">Search:</span>
                <span className="font-semibold text-[#8B5A2B]">"{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 text-[#8B8B7A] hover:text-rose-600 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Catalogue Content: Amazon-Style Vertical Listings */}
      <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-[#E6E1D3] rounded-[24px] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] text-[#8B8B7A] mx-auto flex items-center justify-center">
                <PackageSearch className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#2C3A2B]">No Matching Products Found</h3>
              <p className="text-xs text-[#5A5A40] max-w-sm mx-auto">
                No products match your search or active category/stock filters. Try adjusting your search term or reset all filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#8B5A2B]" />
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map(p => {
                const bundleSlotKey = Object.entries(currentItems).find(([_, item]) => item?.id === p.id)?.[0];
                const isInCurrentBundle = Boolean(bundleSlotKey);
                const imgSrc = getProductImageUrl(p.image, p.id);
                const hasImgError = imgErrors[p.id];

                return (
                  <div
                    key={p.id}
                    id={`product-${p.id}`}
                    className={`bg-white border rounded-[24px] p-5 sm:p-6 shadow-xs hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.008] transition-all duration-300 flex flex-col md:flex-row items-stretch gap-6 relative group ${
                      isInCurrentBundle
                        ? 'border-[#2C3A2B] ring-2 ring-[#2C3A2B]/15 bg-[#FDFBF7]'
                        : 'border-[#E6E1D3] hover:border-[#8B5A2B]/60'
                    }`}
                  >
                    {/* 1. LEFT SECTION: Main Product Image & Thumbnail */}
                    <div className="w-full md:w-56 lg:w-64 shrink-0 flex flex-col items-center">
                      {/* Main Image Box */}
                      <div
                        onClick={() => openProductDetails(p.id)}
                        className="w-full aspect-square bg-[#FDFBF7] rounded-2xl border border-[#E6E1D3] p-4 flex items-center justify-center relative overflow-hidden group/img transition-all group-hover:border-[#8B5A2B]/30 cursor-pointer"
                        title="Click to view full product details"
                      >
                        {hasImgError ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#F4F1EA] rounded-xl text-[#5A5A40]">
                            <Package className="w-10 h-10 text-[#8B8B7A] mb-2" />
                            <span className="font-serif font-bold text-xs text-[#2C3A2B] line-clamp-2">
                              {p.name}
                            </span>
                            <span className="font-mono text-[10px] text-[#8B8B7A] mt-1">{p.id}</span>
                          </div>
                        ) : (
                          <img
                            src={imgSrc}
                            alt={p.name}
                            onError={() => setImgErrors(prev => ({ ...prev, [p.id]: true }))}
                            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover/img:scale-105"
                            loading="lazy"
                          />
                        )}

                        {/* Quick Inspect Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openProductDetails(p.id);
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg border shadow-xs transition-all cursor-pointer bg-white/90 backdrop-blur-xs text-[#5A5A40] hover:text-[#2C2C1E] border-[#E6E1D3] opacity-0 group-hover/img:opacity-100"
                          title="Inspect product details on new page"
                          aria-label="Inspect details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Out of Stock Overlay Ribbon */}
                        {!p.inStock && (
                          <div className="absolute inset-x-0 bottom-0 py-1 bg-rose-600/90 text-white text-[10px] font-bold uppercase tracking-wider text-center backdrop-blur-xs">
                            Out of Stock
                          </div>
                        )}
                      </div>

                      {/* Thumbnail presentation */}
                      <div className="w-full flex items-center gap-2 mt-3 px-1">
                        <div
                          className="w-11 h-11 rounded-lg border-2 border-[#2C3A2B] p-0.5 bg-white shadow-2xs overflow-hidden shrink-0 cursor-default"
                          title={`${p.name} - Primary Photo`}
                        >
                          {hasImgError ? (
                            <div className="w-full h-full bg-[#F4F1EA] flex items-center justify-center">
                              <Package className="w-4 h-4 text-[#8B8B7A]" />
                            </div>
                          ) : (
                            <img
                              src={imgSrc}
                              alt=""
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          )}
                        </div>
                        <div className="flex flex-col text-[11px] leading-tight">
                          <span className="font-mono text-[10px] font-semibold text-[#2C3A2B]">
                            Primary Photo
                          </span>
                          <span className="text-[10px] text-[#8B8B7A]">Studio shot</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. MIDDLE SECTION: Category, ID, Name, Available Specifications */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-2.5">
                        {/* Category Pill & Product ID */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory(p.category);
                            }}
                            className="font-mono text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F1EA] hover:bg-[#E8EEDD] text-[#8B5A2B] hover:text-[#2C3A2B] border border-[#E6E1D3] transition-colors cursor-pointer"
                            title={`Filter catalogue to show only ${p.category}s`}
                          >
                            {p.category.replace(/_/g, ' ')}
                          </button>
                          <span className="font-mono text-xs font-semibold text-[#8B8B7A] px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E6E1D3]">
                            ID: {p.id}
                          </span>
                          {isInCurrentBundle && (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" />
                                In Current Bundle {bundleSlotKey ? `(${bundleSlotKey})` : ''}
                              </span>
                              <button
                                type="button"
                                onClick={() => bundleSlotKey && removeProduct(bundleSlotKey)}
                                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                                title="Remove from bundle"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Product Name */}
                        <h3
                          onClick={() => openProductDetails(p.id)}
                          className="font-serif font-bold text-[#2C3A2B] text-lg sm:text-xl leading-snug hover:text-[#8B5A2B] transition-colors cursor-pointer"
                        >
                          {p.name}
                        </h3>

                        {/* Dataset Specifications */}
                        <div className="pt-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] font-semibold block mb-1.5">
                            Product Specifications
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Colour with Swatch Dot */}
                            {p.attributes.colour && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FDFBF7] border border-[#E6E1D3] text-xs font-mono text-[#2C3A2B]">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/20 shadow-2xs shrink-0"
                                  style={{ backgroundColor: getColourHex(p.attributes.colour) }}
                                />
                                <span className="text-[#8B8B7A]">Colour:</span>
                                <span className="font-semibold">{p.attributes.colour}</span>
                              </div>
                            )}

                            {/* Size */}
                            {p.attributes.size && (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FDFBF7] border border-[#E6E1D3] text-xs font-mono text-[#2C3A2B]">
                                <span className="text-[#8B8B7A]">Size:</span>
                                <span className="font-semibold">{p.attributes.size}</span>
                              </div>
                            )}

                            {/* Port / Connector */}
                            {p.attributes.connector && (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FDFBF7] border border-[#E6E1D3] text-xs font-mono text-[#2C3A2B]">
                                <span className="text-[#8B8B7A]">Port:</span>
                                <span className="font-semibold uppercase">{p.attributes.connector}</span>
                              </div>
                            )}

                            {/* Compatible With */}
                            {p.attributes.compatibleWith?.length ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FDFBF7] border border-[#E6E1D3] text-xs font-mono text-[#2C3A2B]">
                                <span className="text-[#8B8B7A]">Compatible:</span>
                                <span className="font-semibold">{p.attributes.compatibleWith.join(', ')}</span>
                              </div>
                            ) : null}

                            {/* Weight */}
                            {p.weightKg > 0 && !p.attributes.size && (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FDFBF7] border border-[#E6E1D3] text-xs font-mono text-[#2C3A2B]">
                                <span className="text-[#8B8B7A]">Weight:</span>
                                <span className="font-semibold">{p.weightKg} kg</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Authentic Description */}
                        {p.description && (
                          <p className="text-xs text-[#5A5A40] leading-relaxed pt-1 line-clamp-2">
                            {p.description}
                          </p>
                        )}

                        {/* Incompatible Product IDs */}
                        {p.incompatibleProductIds && p.incompatibleProductIds.length > 0 && (
                          <div className="mt-2 text-xs font-sans text-[#C05621] bg-rose-50/70 border border-rose-200/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-[#C05621]" />
                            <span>Incompatible with: {p.incompatibleProductIds.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {/* Technical Sheet Link */}
                      <div className="pt-3 mt-2 border-t border-[#E6E1D3]/50">
                        <button
                          onClick={() => openProductDetails(p.id)}
                          className="inline-flex items-center gap-1.5 text-xs text-[#8B5A2B] hover:text-[#5C3A1B] font-semibold transition-colors cursor-pointer group/link"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Technical Sheet & Specifications</span>
                          <ChevronRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
                        </button>
                      </div>
                    </div>

                    {/* 3. RIGHT SECTION: Price, Stock Status, Product Cost, and Add/Remove Button */}
                    <div className="w-full md:w-56 lg:w-64 shrink-0 flex flex-col justify-between p-4 sm:p-5 bg-[#FDFBF7] md:bg-transparent rounded-2xl md:rounded-none border border-[#E6E1D3] md:border-0 md:border-l md:border-[#E6E1D3]/80 md:pl-6 space-y-4">
                      {/* Price & Stock Status */}
                      <div className="space-y-3">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] font-semibold">
                            Catalogue Price
                          </div>
                          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#2C3A2B] tracking-tight tabular-nums mt-0.5">
                            {formatINR(p.price)}
                          </div>
                          {/* Product Cost if available */}
                          {p.attributes.unitCostInr && (
                            <div className="text-[11px] font-mono text-[#5A5A40] flex items-center gap-1.5 mt-1">
                              <span className="text-[#8B8B7A]">Product Cost:</span>
                              <span className="font-semibold text-[#2C3A2B]">
                                {formatINR(p.attributes.unitCostInr)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Stock Availability Pill */}
                        <div>
                          {p.inStock ? (
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A1E] bg-[#E8EEDD] px-3 py-1 rounded-full border border-[#D0DEC0]">
                              <span className="w-2 h-2 rounded-full bg-[#3B7A3B]" />
                              <span>In Stock ({p.stockQuantity} units)</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#991B1B] bg-[#FEE2E2] px-3 py-1 rounded-full border border-[#FECACA]">
                              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                              <span>Currently Out of Stock</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Add to Slot OR Remove from Bundle */}
                      <div className="space-y-2 pt-2">
                        {isInCurrentBundle ? (
                          <div className="space-y-2">
                            <div className="w-full py-1.5 px-3 rounded-xl bg-[#E8EEDD] border border-[#D0DEC0] text-[#1E3A1E] text-xs font-semibold flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>In Bundle</span>
                              </span>
                              {bundleSlotKey && (
                                <span className="text-[10px] font-mono text-[#588157] uppercase font-bold px-1.5 py-0.5 rounded bg-white/80 border border-[#D0DEC0]">
                                  {bundleSlotKey}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => bundleSlotKey && removeProduct(bundleSlotKey)}
                              className="w-full py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 shadow-2xs hover:shadow-xs active:scale-[0.99]"
                              title="Remove this product from bundle slot"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Remove from Bundle</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={!p.inStock}
                            onClick={() => {
                              addItemToCart(p);
                              setIsCartOpen(true);
                            }}
                            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              p.inStock
                                ? 'bg-[#2C3A2B] hover:bg-[#1E281D] text-white shadow-xs hover:shadow-xl hover:scale-[1.03] active:scale-[0.96]'
                                : 'bg-[#F4F1EA] text-[#8B8B7A] cursor-not-allowed border border-[#E6E1D3]'
                            }`}
                            title={p.inStock ? 'Add product to bundle cart' : 'Cannot add out-of-stock item'}
                          >
                            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                            <span>{p.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => openProductDetails(p.id)}
                          className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl border text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] border-[#E6E1D3] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs hover:scale-102 active:scale-98 group/btn"
                          title="Open product specifications and details on new page"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#8B5A2B]" />
                          <span>Inspect Details</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#8B8B7A] transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View Footer Count Bar */}
          <div className="p-4 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs flex items-center justify-between text-xs text-[#5A5A40]">
            <span>
              Showing {filteredProducts.length} of {fixture.products.length} products
            </span>
            <span className="font-mono text-[11px]">
              Source of Truth: {isCustomFixture ? 'Loaded JSON' : 'fixture.json (Benchmark)'}
            </span>
          </div>
        </div>
    </div>
  );
};
