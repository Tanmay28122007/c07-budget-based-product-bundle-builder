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
  LayoutGrid,
  List,
  Check,
  PackageSearch,
  RotateCcw,
  Trash2
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
    removeProduct,
    setActiveTab,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<'price_asc' | 'price_desc' | 'name' | 'id'>('price_asc');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
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

          {/* View Mode: Amazon Listings (Stacked) vs Table */}
          <div className="flex items-center gap-1 bg-[#FDFBF7] p-1 rounded-xl border border-[#E6E1D3] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#2C3A2B] shadow-2xs border border-[#E6E1D3]'
                  : 'text-[#8B8B7A] hover:text-[#2C2C1E]'
              }`}
              title="Amazon-style vertical listings"
            >
              <List className="w-3.5 h-3.5" />
              <span>Amazon Listings</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#2C3A2B] shadow-2xs border border-[#E6E1D3]'
                  : 'text-[#8B8B7A] hover:text-[#2C2C1E]'
              }`}
              title="Table View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Catalogue Content: Amazon-Style Vertical Listings or Table */}
      {viewMode === 'list' ? (
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
                    className={`bg-white border rounded-[24px] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-stretch gap-6 relative group ${
                      isInCurrentBundle
                        ? 'border-[#2C3A2B] ring-2 ring-[#2C3A2B]/15 bg-[#FDFBF7]'
                        : 'border-[#E6E1D3] hover:border-[#8B5A2B]/40'
                    }`}
                  >
                    {/* 1. LEFT SECTION: Main Product Image & Thumbnail */}
                    <div className="w-full md:w-56 lg:w-64 shrink-0 flex flex-col items-center">
                      {/* Main Image Box */}
                      <div className="w-full aspect-square bg-[#FDFBF7] rounded-2xl border border-[#E6E1D3] p-4 flex items-center justify-center relative overflow-hidden group/img">
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

                        {/* Quick View Button */}
                        <button
                          onClick={() => setViewingProduct(p)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 backdrop-blur-xs text-[#5A5A40] hover:text-[#2C2C1E] border border-[#E6E1D3] shadow-xs opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                          title="Quick inspect"
                          aria-label="Quick inspect"
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
                          <span className="font-mono text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3]">
                            {p.category.replace(/_/g, ' ')}
                          </span>
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
                          onClick={() => setViewingProduct(p)}
                          className="font-serif font-bold text-[#2C3A2B] text-lg sm:text-xl leading-snug group-hover:text-[#8B5A2B] transition-colors cursor-pointer"
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
                          onClick={() => setViewingProduct(p)}
                          className="inline-flex items-center gap-1.5 text-xs text-[#8B5A2B] hover:text-[#5C3A1B] font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Technical Sheet & Specifications</span>
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
                              selectProduct(p.category, p);
                            }}
                            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              p.inStock
                                ? 'bg-[#2C3A2B] hover:bg-[#1E281D] text-white shadow-xs hover:shadow-md active:scale-[0.99]'
                                : 'bg-[#F4F1EA] text-[#8B8B7A] cursor-not-allowed border border-[#E6E1D3]'
                            }`}
                            title={p.inStock ? 'Add product to bundle slot' : 'Cannot add out-of-stock item'}
                          >
                            <Plus className="w-4 h-4" />
                            <span>{p.inStock ? 'Add to Slot' : 'Out of Stock'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => setViewingProduct(p)}
                          className="w-full py-1.5 px-3 text-[11px] font-medium text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] rounded-xl border border-[#E6E1D3] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Details</span>
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
      ) : (
        /* Catalogue Table */
        <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5F5EC]/70 border-b border-[#E6E1D3] text-[11px] font-serif font-bold text-[#2C3A2B] uppercase tracking-wider">
                  <th className="py-3 px-4">Photo</th>
                  <th className="py-3 px-4">Product ID</th>
                  <th className="py-3 px-4">Item Name & Brand</th>
                  <th className="py-3 px-4">Category Slot</th>
                  <th className="py-3 px-4 text-right">Price (INR)</th>
                  <th className="py-3 px-4">Inventory</th>
                  <th className="py-3 px-4">Key Compatibility Attributes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D3]/50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="w-10 h-10 rounded-xl bg-[#F4F1EA] text-[#8B8B7A] mx-auto flex items-center justify-center mb-2">
                        <PackageSearch className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-xs text-[#2C3A2B] mb-1">No products matched the active filters</p>
                      <button
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] rounded-xl transition-colors cursor-pointer shadow-2xs mt-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#8B5A2B]" />
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const bundleSlotKey = Object.entries(currentItems).find(([_, item]) => item?.id === p.id)?.[0];
                    const isInCurrentBundle = Boolean(bundleSlotKey);
                    const imgSrc = getProductImageUrl(p.image, p.id);
                    const hasImgError = imgErrors[p.id];

                    return (
                      <tr key={p.id} className="hover:bg-[#FDFBF7] transition-colors">
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 rounded-lg bg-[#FDFBF7] border border-[#E6E1D3] p-1 flex items-center justify-center overflow-hidden shrink-0">
                            {hasImgError ? (
                              <Package className="w-4 h-4 text-[#8B8B7A]" />
                            ) : (
                              <img
                                src={imgSrc}
                                alt=""
                                onError={() => setImgErrors(prev => ({ ...prev, [p.id]: true }))}
                                className="w-full h-full object-contain mix-blend-multiply"
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-[#5A5A40]">
                          {p.id}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#2C3A2B] leading-tight">{p.name}</div>
                          <div className="text-[11px] text-[#5A5A40] font-mono mt-0.5">
                            {p.brand} {p.model ? `· ${p.model}` : ''}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[#2C3A2B] bg-[#F4F1EA] border border-[#E6E1D3] px-2 py-0.5 rounded text-[11px]">
                            {p.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-[#2C3A2B]">
                          {formatINR(p.price)}
                        </td>

                        <td className="py-3.5 px-4">
                          {p.inStock ? (
                            <div className="flex items-center gap-1.5 text-[#2C3A2B] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A3B18A]" />
                              <span>{p.stockQuantity} units</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[#C05621] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C05621]" />
                              <span>Out of Stock</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-[#5A5A40]">
                          <div className="space-y-0.5 font-mono">
                            {p.attributes.size && <span>Size: {p.attributes.size}</span>}
                            {p.attributes.colour && <span> · Colour: {p.attributes.colour}</span>}
                            {p.attributes.unitCostInr && <span> · Cost: {formatINR(p.attributes.unitCostInr)}</span>}
                            {p.attributes.connector && <span> · Port: {p.attributes.connector.toUpperCase()}</span>}
                            {p.attributes.compatibleWith?.length ? (
                              <span> · Comp: {p.attributes.compatibleWith.join(', ')}</span>
                            ) : null}
                            {p.weightKg > 0 && !p.attributes.size && <span> · Weight: {p.weightKg}kg</span>}
                            {p.attributes.deskWidthCm && <span> · Width: {p.attributes.deskWidthCm}cm</span>}
                            {p.attributes.ergonomicGrade && <span> · {p.attributes.ergonomicGrade}</span>}
                            {p.incompatibleProductIds?.length ? (
                              <span className="block text-[#C05621] font-sans text-[10px]">
                                Blocks: {p.incompatibleProductIds.join(', ')}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingProduct(p)}
                              className="p-1.5 text-[#5A5A40] hover:text-[#2C3A2B] hover:bg-[#F4F1EA] rounded-lg transition-colors"
                              title="View full specs"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {isInCurrentBundle ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-[#2C3A2B] px-2 py-0.5 bg-[#A3B18A]/20 border border-[#A3B18A]/40 rounded-lg">
                                  In Bundle {bundleSlotKey ? `(${bundleSlotKey})` : ''}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => bundleSlotKey && removeProduct(bundleSlotKey)}
                                  className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                  title="Remove from bundle"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled={!p.inStock}
                                onClick={() => {
                                  selectProduct(p.category, p);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                  p.inStock
                                    ? 'bg-[#2C3A2B] hover:bg-[#3A4D39] text-white shadow-xs'
                                    : 'bg-[#F4F1EA] text-[#5A5A40]/50 cursor-not-allowed border border-[#E6E1D3]'
                                }`}
                              >
                                Add to Slot
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[#E6E1D3] bg-[#F5F5EC]/50 flex items-center justify-between text-xs text-[#5A5A40]">
            <span>
              Showing {filteredProducts.length} of {fixture.products.length} products
            </span>
            <span className="font-mono text-[11px]">
              Source of Truth: {isCustomFixture ? 'Loaded JSON' : 'Synthetic Data Engine'}
            </span>
          </div>
        </div>
      )}

      {/* Product Detail Modal / Technical Sheet */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-[#2C3A2B]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-2xl w-full border border-[#E6E1D3] shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#8B5A2B] uppercase tracking-wider font-semibold">
                  {viewingProduct.id} · {viewingProduct.category}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#2C3A2B] mt-0.5">
                  {viewingProduct.name}
                </h3>
                <div className="text-xs text-[#5A5A40] font-mono mt-0.5">
                  Brand: {viewingProduct.brand} | Model: {viewingProduct.model}
                </div>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="p-1 rounded-lg text-[#5A5A40] hover:text-[#2C3A2B] hover:bg-[#F4F1EA] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Modal Image Box */}
              <div className="sm:col-span-1 aspect-square bg-[#FDFBF7] rounded-xl border border-[#E6E1D3] p-3 flex items-center justify-center">
                {imgErrors[viewingProduct.id] ? (
                  <Package className="w-12 h-12 text-[#8B8B7A]" />
                ) : (
                  <img
                    src={getProductImageUrl(viewingProduct.image, viewingProduct.id)}
                    alt={viewingProduct.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                )}
              </div>

              {/* Modal Details */}
              <div className="sm:col-span-2 space-y-3">
                <div className="p-3 bg-[#F5F5EC] rounded-xl border border-[#E6E1D3] space-y-1">
                  <span className="text-[10px] text-[#5A5A40] font-semibold uppercase tracking-wider">
                    Pricing & Stock
                  </span>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono font-bold text-[#2C3A2B] text-lg">
                      {formatINR(viewingProduct.price)}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        viewingProduct.inStock ? 'text-[#1E3A1E]' : 'text-[#991B1B]'
                      }`}
                    >
                      {viewingProduct.inStock
                        ? `${viewingProduct.stockQuantity} Units In Stock`
                        : 'Out of Stock'}
                    </span>
                  </div>
                  {viewingProduct.attributes.unitCostInr && (
                    <div className="text-[11px] font-mono text-[#5A5A40] pt-0.5">
                      Product Unit Cost: {formatINR(viewingProduct.attributes.unitCostInr)}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-[#5A5A40] font-semibold uppercase tracking-wider block mb-1">
                    Description
                  </span>
                  <p className="text-xs text-[#5A5A40] leading-relaxed">
                    {viewingProduct.description}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#5A5A40] font-semibold uppercase tracking-wider block mb-1">
                Compatibility & Specifications
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#FDFBF7] p-3.5 rounded-xl border border-[#E6E1D3] text-[#2C3A2B]">
                <div>Category: {viewingProduct.category}</div>
                {viewingProduct.attributes.size && <div>Size: {viewingProduct.attributes.size}</div>}
                {viewingProduct.attributes.colour && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/20"
                      style={{ backgroundColor: getColourHex(viewingProduct.attributes.colour) }}
                    />
                    <span>Colour: {viewingProduct.attributes.colour}</span>
                  </div>
                )}
                {viewingProduct.attributes.unitCostInr && (
                  <div>Unit Cost: {formatINR(viewingProduct.attributes.unitCostInr)}</div>
                )}
                {viewingProduct.attributes.connector && (
                  <div>Port: {viewingProduct.attributes.connector.toUpperCase()}</div>
                )}
                {viewingProduct.attributes.compatibleWith?.length ? (
                  <div>Compatibility: {viewingProduct.attributes.compatibleWith.join(', ')}</div>
                ) : null}
                {viewingProduct.weightKg > 0 && !viewingProduct.attributes.size && (
                  <div>Weight: {viewingProduct.weightKg} kg</div>
                )}
              </div>
            </div>

            {viewingProduct.notes && (
              <div className="p-3 rounded-xl bg-[#FEF9C3] border border-[#F4E1A1] text-xs text-[#713F12]">
                <span className="font-semibold">Compatibility Note:</span> {viewingProduct.notes}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E6E1D3]">
              <button
                onClick={() => setViewingProduct(null)}
                className="px-3.5 py-2 text-xs text-[#5A5A40] hover:bg-[#F4F1EA] rounded-xl font-medium cursor-pointer"
              >
                Close
              </button>
              {(() => {
                const modalSlotKey = Object.entries(currentItems).find(([_, item]) => item?.id === viewingProduct.id)?.[0];
                if (modalSlotKey) {
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        removeProduct(modalSlotKey);
                        setViewingProduct(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Remove from Bundle</span>
                    </button>
                  );
                }
                if (viewingProduct.inStock) {
                  return (
                    <button
                      onClick={() => {
                        selectProduct(viewingProduct.category, viewingProduct);
                        setViewingProduct(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl shadow-xs cursor-pointer"
                    >
                      Assign to Slot
                    </button>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
