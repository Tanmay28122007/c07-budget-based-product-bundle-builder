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
  Plus
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
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FDFBF7] focus:bg-white border border-[#E6E1D3] rounded-xl text-[#2C3A2B] focus:outline-hidden focus:ring-1 focus:ring-[#2C3A2B]"
            />
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
        </div>
      </div>

      {/* Catalogue Table */}
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
                  <td colSpan={7} className="py-12 text-center text-xs text-[#5A5A40]">
                    No products matched the active filters or search terms.
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
                          {p.weightKg > 0 && <span>Weight: {p.weightKg}kg</span>}
                          {p.attributes.deskWidthCm && <span> · Width: {p.attributes.deskWidthCm}cm</span>}
                          {p.attributes.connector && <span> · Port: {p.attributes.connector.toUpperCase()}</span>}
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
                <div>Weight: {viewingProduct.weightKg} kg</div>
                <div>Category: {viewingProduct.category}</div>
                {viewingProduct.attributes.deskWidthCm && (
                  <div>Width: {viewingProduct.attributes.deskWidthCm} cm</div>
                )}
                {viewingProduct.attributes.connector && (
                  <div>Port: {viewingProduct.attributes.connector.toUpperCase()}</div>
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
