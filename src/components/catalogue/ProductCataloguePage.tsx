import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
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
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatINR } from '../../utils/pricing';
import { exportCatalogueToCSV, downloadFile } from '../../utils/exportUtils';

export const ProductCataloguePage: React.FC = () => {
  const {
    fixture,
    isCustomFixture,
    currentItems,
    selectProduct,
    setActiveTab
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<'price_asc' | 'price_desc' | 'name' | 'id'>('price_asc');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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
        // Search term
        if (!search) return true;
        const q = search.toLowerCase();
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
  }, [fixture.products, selectedCategory, selectedStockStatus, search, sortField]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedStockStatus('all');
    setSortField('price_asc');
  };

  const handleExportCatalogueCSV = () => {
    const csv = exportCatalogueToCSV(fixture.products);
    downloadFile(csv, `catalogue_export_${Date.now()}.csv`, 'text/csv');
  };

  const handleExportCatalogueJSON = () => {
    downloadFile(
      JSON.stringify(fixture.products, null, 2),
      `catalogue_export_${Date.now()}.json`,
      'application/json'
    );
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#5A5A40]" />
            Import JSON Fixture
          </button>
          <button
            onClick={handleExportCatalogueCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#5A5A40]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="p-4 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5A40]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, name, brand, or specifications..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#FDFBF7] focus:bg-white border border-[#E6E1D3] rounded-xl text-[#2C3A2B] focus:outline-hidden focus:ring-1 focus:ring-[#2C3A2B]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B8B7A] hover:text-[#2C2C1E] p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

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

          {/* View Mode: Boxes (Side by side) vs Table */}
          <div className="flex items-center gap-1 bg-[#FDFBF7] p-1 rounded-xl border border-[#E6E1D3]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#2C3A2B] shadow-2xs border border-[#E6E1D3]'
                  : 'text-[#8B8B7A] hover:text-[#2C2C1E]'
              }`}
              title="Boxes View (Side by side)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Boxes</span>
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
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Catalogue Content: Boxes Side-by-Side (Grid) or Table */}
      {viewMode === 'grid' ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map(p => {
                const isInCurrentBundle = Object.values(currentItems).some(item => item?.id === p.id);

                return (
                  <div
                    key={p.id}
                    className={`bg-white border rounded-[24px] p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group hover:-translate-y-1.5 ${
                      isInCurrentBundle
                        ? 'border-[#2C3A2B] ring-2 ring-[#2C3A2B]/15 bg-[#FDFBF7]'
                        : 'border-[#E6E1D3] hover:border-[#8B5A2B]/50'
                    }`}
                  >
                    <div>
                      {/* Top Header of the Box */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3]">
                          {p.category.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-[#8B8B7A]">
                          {p.id}
                        </span>
                      </div>

                      {/* Brand & Model */}
                      <div className="text-[11px] font-mono text-[#5A5A40] mb-1">
                        {p.brand} {p.model ? `· ${p.model}` : ''}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-serif font-bold text-[#2C3A2B] text-base leading-snug group-hover:text-[#8B5A2B] transition-colors line-clamp-2 min-h-[2.75rem]">
                        {p.name}
                      </h3>

                      {/* Price & Stock */}
                      <div className="flex items-baseline justify-between gap-2 mt-3 pt-3 border-t border-[#E6E1D3]/70">
                        <div className="font-mono text-xl font-bold text-[#2C3A2B] tabular-nums">
                          {formatINR(p.price)}
                        </div>
                        {p.inStock ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2C3A2B] bg-[#A3B18A]/15 px-2.5 py-0.5 rounded-full border border-[#A3B18A]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#588157]" />
                            <span>{p.stockQuantity} units</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#C05621] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C05621]" />
                            <span>Out of Stock</span>
                          </div>
                        )}
                      </div>

                      {/* Key Attributes Badges */}
                      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-[#5A5A40]">
                        {p.attributes.size && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E6E1D3]">
                            Size: {p.attributes.size}
                          </span>
                        )}
                        {p.attributes.colour && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E6E1D3]">
                            {p.attributes.colour}
                          </span>
                        )}
                        {p.attributes.unitCostInr && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E6E1D3]">
                            Cost: {formatINR(p.attributes.unitCostInr)}
                          </span>
                        )}
                        {p.attributes.connector && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E6E1D3] uppercase">
                            {p.attributes.connector}
                          </span>
                        )}
                        {p.attributes.compatibleWith?.length ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E6E1D3]">
                            {p.attributes.compatibleWith.join(', ')}
                          </span>
                        ) : null}
                        {p.weightKg > 0 && !p.attributes.size && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E6E1D3]">
                            {p.weightKg} kg
                          </span>
                        )}
                        {p.attributes.deskWidthCm && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E6E1D3]">
                            Width: {p.attributes.deskWidthCm}cm
                          </span>
                        )}
                        {p.attributes.ergonomicGrade && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E6E1D3]">
                            {p.attributes.ergonomicGrade}
                          </span>
                        )}
                        {p.attributes.powerDeliveryWatts && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E6E1D3]">
                            {p.attributes.powerDeliveryWatts}W PD
                          </span>
                        )}
                      </div>

                      {/* Blocks / Incompatibility warnings */}
                      {p.incompatibleProductIds && p.incompatibleProductIds.length > 0 && (
                        <div className="mt-2.5 text-[10px] font-sans text-[#C05621] bg-rose-50/70 border border-rose-200/60 rounded-xl px-2.5 py-1 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#C05621]" />
                          <span className="truncate">Blocks: {p.incompatibleProductIds.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 pt-3 border-t border-[#E6E1D3]/70 flex items-center gap-2">
                      <button
                        onClick={() => setViewingProduct(p)}
                        className="p-2 text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] rounded-xl border border-[#E6E1D3] transition-colors cursor-pointer"
                        title="Inspect specifications"
                        aria-label="Inspect specifications"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isInCurrentBundle ? (
                        <div className="flex-1 py-2 px-3 rounded-xl bg-[#2C3A2B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 text-amber-200" />
                          <span>In Bundle</span>
                        </div>
                      ) : (
                        <button
                          disabled={!p.inStock}
                          onClick={() => {
                            selectProduct(p.category, p);
                            setActiveTab('builder');
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            p.inStock
                              ? 'bg-[#2C3A2B] hover:bg-[#1E281D] text-white shadow-xs hover:shadow-md'
                              : 'bg-[#F4F1EA] text-[#8B8B7A] cursor-not-allowed border border-[#E6E1D3]'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Slot</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grid View Count Bar */}
          <div className="p-4 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs flex items-center justify-between text-xs text-[#5A5A40]">
            <span>
              Showing {filteredProducts.length} of {fixture.products.length} products
            </span>
            <span className="font-mono text-[11px]">
              Source of Truth: {isCustomFixture ? 'Loaded JSON' : 'Synthetic Data Engine'}
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
                    <td colSpan={7} className="py-12 text-center">
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
                    const isInCurrentBundle = Object.values(currentItems).some(item => item?.id === p.id);

                    return (
                      <tr key={p.id} className="hover:bg-[#FDFBF7] transition-colors">
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
                              <span className="text-[11px] font-semibold text-[#2C3A2B] px-2.5 py-1 bg-[#A3B18A]/20 border border-[#A3B18A]/40 rounded-lg">
                                In Bundle
                              </span>
                            ) : (
                              <button
                                disabled={!p.inStock}
                                onClick={() => {
                                  selectProduct(p.category, p);
                                  setActiveTab('builder');
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

      {/* Product Detail Modal / Drawer */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-[#2C3A2B]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full border border-[#E6E1D3] shadow-2xl overflow-hidden p-6 space-y-4">
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
                className="p-1 rounded-lg text-[#5A5A40] hover:text-[#2C3A2B] hover:bg-[#F4F1EA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#F5F5EC] rounded-xl border border-[#E6E1D3] space-y-1">
              <span className="text-[11px] text-[#5A5A40] font-semibold uppercase">Pricing & Stock</span>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono font-bold text-[#2C3A2B] text-base">
                  {formatINR(viewingProduct.price)}
                </span>
                <span className={`text-xs font-semibold ${viewingProduct.inStock ? 'text-[#2C3A2B]' : 'text-[#C05621]'}`}>
                  {viewingProduct.inStock ? `${viewingProduct.stockQuantity} Units In Stock` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[#5A5A40] font-semibold uppercase block mb-1">
                Description
              </span>
              <p className="text-xs text-[#5A5A40] leading-relaxed">
                {viewingProduct.description}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-[#5A5A40] font-semibold uppercase block mb-1">
                Compatibility Specifications
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#FDFBF7] p-3.5 rounded-xl border border-[#E6E1D3] text-[#2C3A2B]">
                <div>Category: {viewingProduct.category}</div>
                {viewingProduct.attributes.size && <div>Size: {viewingProduct.attributes.size}</div>}
                {viewingProduct.attributes.colour && <div>Colour: {viewingProduct.attributes.colour}</div>}
                {viewingProduct.attributes.unitCostInr && <div>Unit Cost: {formatINR(viewingProduct.attributes.unitCostInr)}</div>}
                {viewingProduct.attributes.connector && (
                  <div>Port: {viewingProduct.attributes.connector.toUpperCase()}</div>
                )}
                {viewingProduct.attributes.compatibleWith?.length ? (
                  <div>Compatibility: {viewingProduct.attributes.compatibleWith.join(', ')}</div>
                ) : null}
                {viewingProduct.weightKg > 0 && !viewingProduct.attributes.size && (
                  <div>Weight: {viewingProduct.weightKg} kg</div>
                )}
                {viewingProduct.attributes.deskWidthCm && (
                  <div>Width: {viewingProduct.attributes.deskWidthCm} cm</div>
                )}
                {viewingProduct.attributes.ergonomicGrade && (
                  <div>Grade: {viewingProduct.attributes.ergonomicGrade}</div>
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
                className="px-3.5 py-2 text-xs text-[#5A5A40] hover:bg-[#F4F1EA] rounded-xl font-medium"
              >
                Close
              </button>
              {viewingProduct.inStock && (
                <button
                  onClick={() => {
                    selectProduct(viewingProduct.category, viewingProduct);
                    setViewingProduct(null);
                    setActiveTab('builder');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl shadow-xs"
                >
                  Assign to Slot in Builder
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
