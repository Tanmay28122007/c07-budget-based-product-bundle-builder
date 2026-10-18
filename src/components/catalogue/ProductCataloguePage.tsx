import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Package,
  Eye,
  X,
  Plus,
  Check,
  PackageSearch,
  RotateCcw,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Info,
  SlidersHorizontal,
  Sparkles,
  LayoutList,
  LayoutGrid,
  Edit3,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatINR } from '../../utils/pricing';
import { fetchFilteredProducts } from '../../services/apiClient';
import { getProductImageUrl, getProductImageFallback } from '../../utils/imageUtils';
import { classifyStockStatus } from '../../utils/inventoryRules';
import { getStoredClickEvents } from '../../utils/analytics';
import { formatKolkataDate, formatKolkataTime } from '../../utils/userActivity';

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

export const ProductCataloguePage: React.FC = () => {
  const {
    fixture,
    isCustomFixture,
    currentItems,
    addItemToCart,
    removeProduct,
    openProductDetails,
    searchQuery,
    setSearchQuery,
    setIsCartOpen,
    userRole,
    lowStockThreshold,
    updateProductStock
  } = useApp();

  const isAdmin = userRole === 'admin';

  // View mode: default to table for admin, cards for customer
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(isAdmin ? 'table' : 'cards');

  // Specific filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedColour, setSelectedColour] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all'); // all, in_stock, low_stock, out_of_stock
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortField, setSortField] = useState<'name' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc' | 'most_clicked'>('name');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Stock edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newStockQty, setNewStockQty] = useState<string>('');
  const [stockEditError, setStockEditError] = useState<string | null>(null);
  const [stockEditSuccess, setStockEditSuccess] = useState<string | null>(null);

  // Click tracking counts map for sorting and badges
  const [clickCountMap, setClickCountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const refreshClicks = () => {
      const events = getStoredClickEvents();
      const map: Record<string, number> = {};
      events.forEach(e => {
        map[e.productId] = (map[e.productId] || 0) + 1;
      });
      setClickCountMap(map);
    };

    refreshClicks();
    if (typeof window !== 'undefined') {
      window.addEventListener('c07_product_click_recorded', refreshClicks);
      return () => window.removeEventListener('c07_product_click_recorded', refreshClicks);
    }
  }, []);

  // Extract unique categories, colours, and sizes from active products
  const categories = useMemo(() => {
    return Array.from(new Set(fixture.products.map(p => p.category)));
  }, [fixture.products]);

  const colours = useMemo(() => {
    return Array.from(new Set(fixture.products.map(p => p.colour).filter(Boolean))) as string[];
  }, [fixture.products]);

  const sizes = useMemo(() => {
    return Array.from(new Set(fixture.products.map(p => p.size).filter(Boolean))) as string[];
  }, [fixture.products]);

  // Client-side filtering & sorting using consistent single-source-of-truth inventory rules
  const filteredProducts = useMemo(() => {
    return fixture.products
      .filter(p => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (selectedColour !== 'all' && p.colour !== selectedColour) return false;
        if (selectedSize !== 'all' && p.size !== selectedSize) return false;

        const status = classifyStockStatus(p.stockQuantity, lowStockThreshold);
        if (selectedStockStatus === 'in_stock' && (status !== 'IN_STOCK' && status !== 'LOW_STOCK')) return false;
        if (selectedStockStatus === 'low_stock' && status !== 'LOW_STOCK') return false;
        if (selectedStockStatus === 'out_of_stock' && status !== 'OUT_OF_STOCK') return false;

        if (minPrice && p.price < Number(minPrice)) return false;
        if (maxPrice && p.price > Number(maxPrice)) return false;

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortField === 'name') return a.name.localeCompare(b.name);
        if (sortField === 'price_asc') return a.price - b.price;
        if (sortField === 'price_desc') return b.price - a.price;
        if (sortField === 'stock_asc') return a.stockQuantity - b.stockQuantity;
        if (sortField === 'stock_desc') return b.stockQuantity - a.stockQuantity;
        if (sortField === 'most_clicked') {
          const clicksA = clickCountMap[a.id] || 0;
          const clicksB = clickCountMap[b.id] || 0;
          if (clicksB !== clicksA) return clicksB - clicksA;
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [
    fixture.products,
    selectedCategory,
    selectedColour,
    selectedSize,
    selectedStockStatus,
    minPrice,
    maxPrice,
    searchQuery,
    sortField,
    lowStockThreshold,
    clickCountMap
  ]);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedStockStatus, searchQuery, minPrice, maxPrice, sortField]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedColour('all');
    setSelectedSize('all');
    setSelectedStockStatus('all');
    setMinPrice('');
    setMaxPrice('');
    setSortField('name');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedColour !== 'all' ||
    selectedSize !== 'all' ||
    selectedStockStatus !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    Boolean(searchQuery);

  const openStockModal = (product: Product) => {
    setEditingProduct(product);
    setNewStockQty(String(product.stockQuantity));
    setStockEditError(null);
    setStockEditSuccess(null);
  };

  const handleStockUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const res = updateProductStock(editingProduct.id, newStockQty);
    if (!res.success) {
      setStockEditError(res.error || 'Failed to update stock quantity.');
      setStockEditSuccess(null);
    } else {
      setStockEditSuccess(`Successfully updated ${editingProduct.name} stock to ${newStockQty} units.`);
      setStockEditError(null);
      setTimeout(() => {
        setEditingProduct(null);
      }, 1100);
    }
  };

  const renderStockBadge = (stockQty: number) => {
    const status = classifyStockStatus(stockQty, lowStockThreshold);
    if (status === 'IN_STOCK') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>In Stock</span>
        </span>
      );
    }
    if (status === 'LOW_STOCK') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          <span>Low Stock (≤{lowStockThreshold})</span>
        </span>
      );
    }
    if (status === 'OUT_OF_STOCK') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          <span>Out of Stock</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
        <span>Invalid Inventory</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#2C3A2B]">
              Product Catalogue
            </h1>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#F5F5EC] text-[#5A5A40] border border-[#E6E1D3]">
              {fixture.products.length} Products Registered
            </span>
            {isAdmin && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#2C3A2B] text-white">
                Admin Management Mode
              </span>
            )}
          </div>
          <p className="text-xs text-[#5A5A40] mt-0.5">
            Complete inventory listings with verified stock status, descriptions, and audit actions.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-[#F5F5EC] p-1 rounded-xl border border-[#E6E1D3] flex items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#2C3A2B] shadow-2xs'
                  : 'text-[#8B8B7A] hover:text-[#2C3A2B]'
              }`}
              title="Table View (Comprehensive tabular details)"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-[#2C3A2B] shadow-2xs'
                  : 'text-[#8B8B7A] hover:text-[#2C3A2B]'
              }`}
              title="Card View (Visual listings & slot management)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="p-5 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6E1D3]/70 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#8B5A2B]" />
            <span className="text-xs font-bold text-[#2C3A2B] uppercase tracking-wider">
              Search & Filter Catalogue
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          {/* 1. Search Query */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-[#5A5A40]">Search Product Name / ID</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B7A]" />
              <input
                type="text"
                placeholder="Search by name, ID, brand..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#2C3A2B] placeholder:text-[#8B8B7A] focus:outline-none focus:border-[#2C3A2B]"
              />
            </div>
          </div>

          {/* 2. Category Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#5A5A40]">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl px-2.5 py-1.5 text-xs text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B]"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Stock Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#5A5A40]">Stock Status</label>
            <select
              value={selectedStockStatus}
              onChange={e => setSelectedStockStatus(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl px-2.5 py-1.5 text-xs text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B]"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (&gt; 0)</option>
              <option value="low_stock">Low Stock (1 to {lowStockThreshold})</option>
              <option value="out_of_stock">Out of Stock (= 0)</option>
            </select>
          </div>

          {/* 4. Sort By */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-semibold text-[#5A5A40]">Sort Order</label>
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as any)}
              className="w-full bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl px-2.5 py-1.5 text-xs text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B]"
            >
              <option value="name">Sort by Product Name (A to Z)</option>
              <option value="price_asc">Sort by Price: Low to High</option>
              <option value="price_desc">Sort by Price: High to Low</option>
              <option value="stock_asc">Sort by Available Stock: Low to High</option>
              <option value="stock_desc">Sort by Available Stock: High to Low</option>
              <option value="most_clicked">Sort by Most Clicked (Analytics)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-[#E6E1D3]/60 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B7A]">
              Active Filters:
            </span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3]">
                <span>Category: <strong>{selectedCategory}</strong></span>
                <button onClick={() => setSelectedCategory('all')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedStockStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3]">
                <span>Status: <strong>{selectedStockStatus.replace('_', ' ')}</strong></span>
                <button onClick={() => setSelectedStockStatus('all')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3]">
                <span>Keyword: <strong>"{searchQuery}"</strong></span>
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Content: Table View vs Cards View */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FDFBF7] text-[#5A5A40] border-b border-[#E6E1D3] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Product Image</th>
                  <th className="py-3 px-3">Product ID</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3 text-center">Available Qty</th>
                  <th className="py-3 px-3 text-center">Stock Status</th>
                  <th className="py-3 px-3">Last Updated</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D3]/70 text-[#2C3A2B]">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#8B8B7A]">
                      <PackageSearch className="w-10 h-10 mx-auto mb-2 text-[#8B8B7A]" />
                      <p className="font-semibold text-sm text-[#2C3A2B]">No products match the selected criteria.</p>
                      <p className="text-xs text-[#5A5A40] mt-1">Try adjusting your search query or reset active filters.</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5F5EC] hover:bg-[#E6E1D3] text-xs font-semibold text-[#2C3A2B] transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Filters</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map(prod => {
                    const imgSrc = getProductImageUrl(prod.image, prod.id);
                    const clicks = clickCountMap[prod.id] || 0;
                    const dateFormatted = prod.lastUpdated
                      ? formatKolkataDate(prod.lastUpdated)
                      : 'Benchmark Baseline';
                    const timeFormatted = prod.lastUpdated
                      ? formatKolkataTime(prod.lastUpdated)
                      : '';

                    return (
                      <tr key={prod.id} className="hover:bg-[#FDFBF7] transition-colors">
                        {/* Product Image */}
                        <td className="py-3 px-4">
                          <div
                            onClick={() => openProductDetails(prod.id)}
                            className="w-12 h-12 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3] p-1 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#2C3A2B] transition-all"
                            title="Click to view full specifications"
                          >
                            {imgErrors[prod.id] ? (
                              <Package className="w-6 h-6 text-[#8B8B7A]" />
                            ) : (
                              <img
                                src={imgSrc}
                                alt={prod.name}
                                onError={e => {
                                  const target = e.currentTarget;
                                  const fallback = getProductImageFallback(target.src);
                                  if (fallback !== target.src) {
                                    target.src = fallback;
                                  } else {
                                    setImgErrors(prev => ({ ...prev, [prod.id]: true }));
                                  }
                                }}
                                className="w-full h-full object-contain mix-blend-multiply"
                                loading="lazy"
                              />
                            )}
                          </div>
                        </td>

                        {/* Product ID */}
                        <td className="py-3 px-3 font-mono font-semibold text-[#8B5A2B]">
                          {prod.id}
                        </td>

                        {/* Product Name */}
                        <td className="py-3 px-4 font-semibold text-[#2C3A2B] max-w-[200px]">
                          <button
                            onClick={() => openProductDetails(prod.id)}
                            className="text-left hover:text-[#8B5A2B] transition-colors font-medium truncate block max-w-full"
                            title={prod.name}
                          >
                            {prod.name}
                          </button>
                          {clicks > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#5A5A40] mt-0.5">
                              <TrendingUp className="w-2.5 h-2.5 text-blue-600" />
                              <span>{clicks} clicks recorded</span>
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 font-mono text-[11px] text-[#5A5A40]">
                          <span className="px-2 py-0.5 rounded-md bg-[#F5F5EC] border border-[#E6E1D3]">
                            {prod.category}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4 text-[#5A5A40] text-[11px] max-w-[240px]">
                          <p className="line-clamp-2 leading-relaxed" title={prod.description}>
                            {prod.description || 'Verified benchmark product listing.'}
                          </p>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#2C3A2B]">
                          {formatINR(prod.price)}
                        </td>

                        {/* Available Quantity */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-sm text-[#2C3A2B]">
                          {prod.stockQuantity}
                        </td>

                        {/* Stock Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {renderStockBadge(prod.stockQuantity)}
                        </td>

                        {/* Last Updated */}
                        <td className="py-3 px-3 text-[11px] text-[#5A5A40] whitespace-nowrap font-mono">
                          <div>{dateFormatted}</div>
                          {timeFormatted && <div className="text-[10px] text-[#8B8B7A]">{timeFormatted}</div>}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openProductDetails(prod.id)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F5F5EC] hover:bg-[#E6E1D3] text-[#2C3A2B] border border-[#E6E1D3] transition-colors flex items-center gap-1 cursor-pointer"
                              title="View Full Product Details"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Details</span>
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => openStockModal(prod)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2C3A2B] hover:bg-[#1E281D] text-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Update Inventory Stock Quantity"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Stock</span>
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

          {/* Pagination & Footer */}
          <div className="p-4 bg-[#FDFBF7] border-t border-[#E6E1D3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5A5A40]">
            <div>
              Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} filtered products
              (Total Catalogue: {fixture.products.length})
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-2.5 py-1 rounded-lg border border-[#E6E1D3] bg-white text-[#2C3A2B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F5EC] transition-colors flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1 px-2 font-mono text-xs">
                  <span className="font-bold text-[#2C3A2B]">{currentPage}</span>
                  <span className="text-[#8B8B7A]">/</span>
                  <span>{totalPages}</span>
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2.5 py-1 rounded-lg border border-[#E6E1D3] bg-white text-[#2C3A2B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F5EC] transition-colors flex items-center gap-1 font-semibold"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Cards View (Preserves slot interaction and Amazon-style layout) */
        <div className="space-y-4">
          {paginatedProducts.length === 0 ? (
            <div className="bg-white border border-[#E6E1D3] rounded-[24px] p-12 text-center space-y-3">
              <PackageSearch className="w-12 h-12 rounded-2xl bg-[#F4F1EA] text-[#8B8B7A] mx-auto p-2" />
              <h3 className="font-serif text-base font-bold text-[#2C3A2B]">No Matching Products Found</h3>
              <p className="text-xs text-[#5A5A40] max-w-sm mx-auto">
                No products match your search or active filters. Try adjusting your search term or reset all filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#8B5A2B]" />
                Reset All Filters
              </button>
            </div>
          ) : (
            paginatedProducts.map(p => {
              const bundleSlotKey = Object.entries(currentItems).find(([_, item]) => item?.id === p.id)?.[0];
              const isInCurrentBundle = Boolean(bundleSlotKey);
              const imgSrc = getProductImageUrl(p.image, p.id);
              const hasImgError = imgErrors[p.id];
              const clicks = clickCountMap[p.id] || 0;

              return (
                <div
                  key={p.id}
                  id={`product-${p.id}`}
                  className={`bg-white border rounded-[24px] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-stretch gap-6 relative group ${
                    isInCurrentBundle
                      ? 'border-[#2C3A2B] ring-2 ring-[#2C3A2B]/15 bg-[#FDFBF7]'
                      : 'border-[#E6E1D3]'
                  }`}
                >
                  {/* Left: Product Image */}
                  <div className="w-full md:w-52 shrink-0 flex flex-col items-center">
                    <div
                      onClick={() => openProductDetails(p.id)}
                      className="w-full aspect-square bg-[#FDFBF7] rounded-2xl border border-[#E6E1D3] p-4 flex items-center justify-center relative overflow-hidden cursor-pointer"
                      title="Click to view product details"
                    >
                      {hasImgError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#F4F1EA] rounded-xl text-[#5A5A40]">
                          <Package className="w-8 h-8 text-[#8B8B7A] mb-1" />
                          <span className="font-serif font-bold text-xs text-[#2C3A2B] line-clamp-2">
                            {p.name}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={imgSrc}
                          alt={p.name}
                          onError={e => {
                            const target = e.currentTarget;
                            const fallback = getProductImageFallback(target.src);
                            if (fallback !== target.src) {
                              target.src = fallback;
                            } else {
                              setImgErrors(prev => ({ ...prev, [p.id]: true }));
                            }
                          }}
                          className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3]">
                          {p.category.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#8B8B7A] px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E6E1D3]">
                          ID: {p.id}
                        </span>
                        {renderStockBadge(p.stockQuantity)}
                        {clicks > 0 && (
                          <span className="text-[10px] font-mono text-[#5A5A40] flex items-center gap-1 bg-[#F5F5EC] px-2 py-0.5 rounded-md border border-[#E6E1D3]">
                            <TrendingUp className="w-3 h-3 text-blue-600" />
                            <span>{clicks} clicks</span>
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => openProductDetails(p.id)}
                        className="font-serif font-bold text-[#2C3A2B] text-lg hover:text-[#8B5A2B] transition-colors cursor-pointer"
                      >
                        {p.name}
                      </h3>

                      <p className="text-xs text-[#5A5A40] line-clamp-2 leading-relaxed">
                        {p.description || 'High quality workstation essential.'}
                      </p>

                      {p.attributes && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-[#5A5A40]">
                          {p.attributes.colour && (
                            <span className="px-2 py-0.5 rounded bg-[#FDFBF7] border border-[#E6E1D3]">
                              Colour: <strong>{p.attributes.colour}</strong>
                            </span>
                          )}
                          {p.attributes.size && (
                            <span className="px-2 py-0.5 rounded bg-[#FDFBF7] border border-[#E6E1D3]">
                              Size: <strong>{p.attributes.size}</strong>
                            </span>
                          )}
                          {p.attributes.connector && (
                            <span className="px-2 py-0.5 rounded bg-[#FDFBF7] border border-[#E6E1D3]">
                              Port: <strong>{p.attributes.connector.toUpperCase()}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E6E1D3]/50 flex items-center gap-2">
                      <button
                        onClick={() => openProductDetails(p.id)}
                        className="text-xs text-[#8B5A2B] hover:text-[#5C3A1B] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Full Product Details & Compatibility</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Price & Actions */}
                  <div className="w-full md:w-56 shrink-0 flex flex-col justify-between p-4 bg-[#FDFBF7] rounded-2xl border border-[#E6E1D3] space-y-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] font-semibold">
                        Catalogue Price
                      </div>
                      <div className="font-mono text-2xl font-bold text-[#2C3A2B] tracking-tight mt-0.5">
                        {formatINR(p.price)}
                      </div>
                      <div className="text-[11px] font-mono text-[#5A5A40] mt-1">
                        Stock: <strong>{p.stockQuantity} units</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {isAdmin ? (
                        <>
                          <button
                            onClick={() => openStockModal(p)}
                            className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#2C3A2B] hover:bg-[#1E281D] text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Update Stock</span>
                          </button>
                          <button
                            onClick={() => openProductDetails(p.id)}
                            className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-[#E6E1D3] bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#8B5A2B]" />
                            <span>View Details</span>
                          </button>
                        </>
                      ) : (
                        <>
                          {isInCurrentBundle ? (
                            <button
                              onClick={() => bundleSlotKey && removeProduct(bundleSlotKey)}
                              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove from Bundle</span>
                            </button>
                          ) : (
                            <button
                              disabled={p.stockQuantity <= 0}
                              onClick={() => {
                                addItemToCart(p);
                                setIsCartOpen(true);
                              }}
                              className={`w-full py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                p.stockQuantity > 0
                                  ? 'bg-[#2C3A2B] hover:bg-[#1E281D] text-white shadow-2xs'
                                  : 'bg-[#F4F1EA] text-[#8B8B7A] cursor-not-allowed border border-[#E6E1D3]'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{p.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => openProductDetails(p.id)}
                            className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-[#E6E1D3] bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#8B5A2B]" />
                            <span>Details</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Cards View Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs flex items-center justify-between text-xs text-[#5A5A40]">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} items
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 rounded-lg border border-[#E6E1D3] bg-white text-[#2C3A2B] disabled:opacity-40 font-semibold"
                >
                  Prev
                </button>
                <span className="font-mono px-2">{currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1 rounded-lg border border-[#E6E1D3] bg-white text-[#2C3A2B] disabled:opacity-40 font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Update Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#E6E1D3] shadow-2xl max-w-md w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E6E1D3] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#F5F5EC] text-[#2C3A2B]">
                  <Edit3 className="w-5 h-5 text-[#8B5A2B]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2C3A2B]">Update Stock Quantity</h3>
                  <p className="text-xs text-[#5A5A40]">Authorised Inventory Stock Management</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg hover:bg-[#F5F5EC] text-[#8B8B7A] hover:text-[#2C3A2B] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#8B5A2B] font-bold">{editingProduct.id}</span>
                <span className="font-mono text-[11px] text-[#5A5A40]">{editingProduct.category}</span>
              </div>
              <div className="font-semibold text-sm text-[#2C3A2B]">{editingProduct.name}</div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E6E1D3]/70 font-mono text-[11px] text-[#5A5A40]">
                <span>Current Stock: <strong>{editingProduct.stockQuantity} units</strong></span>
                <span>Threshold: <strong>{lowStockThreshold} units</strong></span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleStockUpdateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2C3A2B]">
                  New Available Quantity (Physical Units)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={newStockQty}
                  onChange={e => {
                    setNewStockQty(e.target.value);
                    setStockEditError(null);
                    setStockEditSuccess(null);
                  }}
                  placeholder="e.g. 15"
                  className="w-full bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl px-3.5 py-2.5 font-mono text-sm text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B]"
                />
                <p className="text-[11px] text-[#8B8B7A]">
                  Must be a valid non-negative integer (0 or greater). Negative or non-numeric values are rejected.
                </p>
              </div>

              {stockEditError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{stockEditError}</span>
                </div>
              )}

              {stockEditSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{stockEditSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E1D3]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E6E1D3] hover:bg-[#F5F5EC] text-[#5A5A40] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2C3A2B] hover:bg-[#1E281D] text-white transition-colors cursor-pointer shadow-xs"
                >
                  Save Stock Quantity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
