import React, { useState, useMemo } from 'react';
import {
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart,
  Boxes,
  Clock,
  Calendar,
  Sliders,
  Edit3,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import {
  countDistinctProducts,
  calculateTotalUnitsInStock,
  countInStockProducts,
  countOutOfStockProducts,
  countLowStockProducts,
  classifyStockStatus,
  StockStatusType
} from '../../utils/inventoryRules';
import {
  getRegisteredUsers,
  getSignInRecords,
  formatKolkataDate,
  formatKolkataTime,
  formatLastActive,
  countTodaySignIns
} from '../../utils/userActivity';
import { Product } from '../../types';

export const AdminDashboardView: React.FC = () => {
  const {
    fixture,
    setActiveTab,
    lowStockThreshold,
    setLowStockThreshold,
    updateProductStock,
    openProductDetails
  } = useApp();

  // Inventory Table Filters
  const [invSearch, setInvSearch] = useState('');
  const [invCategoryFilter, setInvCategoryFilter] = useState('all');
  const [invStatusFilter, setInvStatusFilter] = useState<'all' | StockStatusType>('all');
  const [invPage, setInvPage] = useState(1);
  const itemsPerPage = 10;

  // Stock Edit Modal in table
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editQtyInput, setEditQtyInput] = useState<string>('');
  const [editError, setEditError] = useState<string>('');
  const [editSuccess, setEditSuccess] = useState<string>('');

  // User Activity Search
  const [userSearch, setUserSearch] = useState('');

  // 1. Data Calculations from actual application catalogue
  const totalProducts = countDistinctProducts(fixture.products);
  const totalUnits = calculateTotalUnitsInStock(fixture.products);
  const inStockCount = countInStockProducts(fixture.products);
  const outOfStockCount = countOutOfStockProducts(fixture.products);
  const lowStockCount = countLowStockProducts(fixture.products, lowStockThreshold);

  // User Activity Data
  const registeredUsers = useMemo(() => getRegisteredUsers(), []);
  const signInRecords = useMemo(() => getSignInRecords(), []);
  const todaySignIns = useMemo(() => countTodaySignIns(signInRecords), [signInRecords]);

  // Categories list
  const categories = useMemo(() => {
    return Array.from(new Set(fixture.products.map(p => p.category).filter(Boolean)));
  }, [fixture.products]);

  // 2. Chart data calculations
  const categoryDistribution = useMemo(() => {
    const map = new Map<string, { count: number; units: number }>();
    for (const p of fixture.products) {
      const cat = p.category || 'Other';
      const cur = map.get(cat) || { count: 0, units: 0 };
      cur.count += 1;
      cur.units += (typeof p.stockQuantity === 'number' && p.stockQuantity > 0 ? p.stockQuantity : 0);
      map.set(cat, cur);
    }
    return Array.from(map.entries()).map(([cat, data]) => ({
      category: cat,
      count: data.count,
      units: data.units,
      percentage: totalProducts > 0 ? Math.round((data.count / totalProducts) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [fixture.products, totalProducts]);

  // 3. Filtered Inventory Table
  const filteredProducts = useMemo(() => {
    return fixture.products.filter(p => {
      // Search
      if (invSearch.trim()) {
        const q = invSearch.toLowerCase().trim();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchId = (p.id || '').toLowerCase().includes(q);
        const matchCat = (p.category || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchCat) return false;
      }

      // Category
      if (invCategoryFilter !== 'all' && p.category.toLowerCase() !== invCategoryFilter.toLowerCase()) {
        return false;
      }

      // Stock status
      const status = classifyStockStatus(p.stockQuantity, lowStockThreshold);
      if (invStatusFilter !== 'all' && status !== invStatusFilter) {
        return false;
      }

      return true;
    });
  }, [fixture.products, invSearch, invCategoryFilter, invStatusFilter, lowStockThreshold]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (invPage - 1) * itemsPerPage,
    invPage * itemsPerPage
  );

  // 4. Filtered User Activity
  const filteredUserSignIns = useMemo(() => {
    if (!userSearch.trim()) return signInRecords;
    const q = userSearch.toLowerCase().trim();
    return signInRecords.filter(r =>
      r.userName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.userId.toLowerCase().includes(q)
    );
  }, [signInRecords, userSearch]);

  const handleOpenEditStock = (prod: Product) => {
    setEditingProduct(prod);
    setEditQtyInput(String(prod.stockQuantity ?? 0));
    setEditError('');
    setEditSuccess('');
  };

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditError('');
    setEditSuccess('');

    const res = updateProductStock(editingProduct.id, Number(editQtyInput));
    if (!res.success) {
      setEditError(res.error || 'Failed to update inventory.');
    } else {
      setEditSuccess('Stock updated successfully.');
      setTimeout(() => {
        setEditingProduct(null);
      }, 700);
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* Top Banner: Admin Dashboard Header & Quick Actions */}
      <div className="p-5 rounded-3xl bg-white border border-[#E6E1D3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-xl text-[#2C3A2B]">
              Inventory Overview & Operations
            </h2>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Live Source of Truth
            </span>
          </div>
          <p className="text-xs text-[#5A5A40] mt-0.5">
            Real-time physical stock metrics, category distributions, and recorded user sign-in activity.
          </p>
        </div>

        {/* Low-stock threshold adjuster & Quick Nav */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F4F1EA] px-3 py-1.5 rounded-2xl border border-[#E6E1D3]">
            <Sliders className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span className="text-xs font-semibold text-[#2C2C1E]">Low Stock Alert:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="50"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(Number(e.target.value) || 1)}
                className="w-12 px-1.5 py-0.5 text-xs font-mono font-bold text-center bg-white border border-[#E6E1D3] rounded-lg text-[#2C3A2B]"
                title="Configurable low-stock threshold in units"
              />
              <span className="text-[11px] text-[#7A7A68]">units</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('catalogue')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Catalogue View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUMMARY KPI CARDS (6 CARDS)                                            */}
      {/* ========================================================================= */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Total Products */}
          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7A68]">Total Products</span>
              <Package className="w-4 h-4 text-[#8B8B7A]" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#2C3A2B]">
              {totalProducts}
            </div>
            <p className="text-[11px] text-[#7A7A68] mt-1 font-medium">Distinct listings</p>
          </div>

          {/* Card 2: Total Units in Stock (Distinguished physical inventory count) */}
          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7A68]">Total Units</span>
              <Boxes className="w-4 h-4 text-[#8B5A2B]" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#8B5A2B]">
              {totalUnits.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-[#7A7A68] mt-1 font-medium">Physical items in warehouse</p>
          </div>

          {/* Card 3: In-Stock Products */}
          <div className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">In Stock</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {inStockCount}
            </div>
            <p className="text-[11px] text-[#7A7A68] mt-1 font-medium">Quantity &gt; 0 units</p>
          </div>

          {/* Card 4: Out-of-Stock Products */}
          <div className="p-4 bg-white border border-rose-100 rounded-2xl shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-800">Out of Stock</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-700">
              {outOfStockCount}
            </div>
            <p className="text-[11px] text-[#7A7A68] mt-1 font-medium">0 available units</p>
          </div>

          {/* Card 5: Low-Stock Products */}
          <div className="p-4 bg-white border border-amber-100 rounded-2xl shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">Low Stock</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">
              {lowStockCount}
            </div>
            <p className="text-[11px] text-[#7A7A68] mt-1 font-medium">&le; {lowStockThreshold} units threshold</p>
          </div>

          {/* Card 6: Total Registered Users */}
          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7A68]">Registered Users</span>
              <Users className="w-4 h-4 text-[#2C3A2B]" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#2C3A2B]">
              {registeredUsers.length}
            </div>
            <p className="text-[11px] text-[#7A7A68] mt-1 font-medium">{todaySignIns} active today</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DASHBOARD CHARTS                                                       */}
      {/* ========================================================================= */}
      {totalProducts === 0 ? (
        <div className="p-8 text-center bg-white border border-[#E6E1D3] rounded-3xl text-sm text-[#7A7A68]">
          <Package className="w-8 h-8 text-[#B5B5A3] mx-auto mb-2" />
          No products found in catalogue. Please import or reset the fixture.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart 1: Product Distribution by Category */}
          <div className="p-5 bg-white border border-[#E6E1D3] rounded-3xl shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#2C3A2B]">Products by Category</h3>
                <p className="text-[11px] text-[#7A7A68]">Listing distribution across classifications</p>
              </div>
              <BarChart3 className="w-4 h-4 text-[#8B5A2B]" />
            </div>

            <div className="space-y-2.5 pt-1">
              {categoryDistribution.slice(0, 5).map(item => (
                <div key={item.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[#2C2C1E]">{item.category}</span>
                    <span className="font-mono text-[#5A5A40]">{item.count} items ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F4F1EA] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2C3A2B]"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: In-Stock vs Out-of-Stock Counts */}
          <div className="p-5 bg-white border border-[#E6E1D3] rounded-3xl shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#2C3A2B]">Stock Availability Health</h3>
                <p className="text-[11px] text-[#7A7A68]">Active inventory readiness breakdown</p>
              </div>
              <PieChart className="w-4 h-4 text-emerald-700" />
            </div>

            {/* Split bar visualization */}
            <div className="pt-2">
              <div className="w-full h-4 rounded-xl bg-[#F4F1EA] overflow-hidden flex">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${(inStockCount / totalProducts) * 100}%` }}
                  title={`In-Stock: ${inStockCount}`}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${(lowStockCount / totalProducts) * 100}%` }}
                  title={`Low-Stock: ${lowStockCount}`}
                />
                <div
                  className="h-full bg-rose-600 transition-all duration-300"
                  style={{ width: `${(outOfStockCount / totalProducts) * 100}%` }}
                  title={`Out-of-Stock: ${outOfStockCount}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#E6E1D3]">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>In Stock</span>
                  </div>
                  <div className="font-mono font-bold text-lg text-[#2C2C1E] mt-0.5">{inStockCount}</div>
                  <div className="text-[10px] text-[#7A7A68]">{Math.round((inStockCount / totalProducts) * 100)}%</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Low Stock</span>
                  </div>
                  <div className="font-mono font-bold text-lg text-[#2C2C1E] mt-0.5">{lowStockCount}</div>
                  <div className="text-[10px] text-[#7A7A68]">{Math.round((lowStockCount / totalProducts) * 100)}%</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-rose-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    <span>Out Stock</span>
                  </div>
                  <div className="font-mono font-bold text-lg text-[#2C2C1E] mt-0.5">{outOfStockCount}</div>
                  <div className="text-[10px] text-[#7A7A68]">{Math.round((outOfStockCount / totalProducts) * 100)}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 3: Inventory Units by Category */}
          <div className="p-5 bg-white border border-[#E6E1D3] rounded-3xl shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#2C3A2B]">Physical Units by Category</h3>
                <p className="text-[11px] text-[#7A7A68]">Total inventory count stored per category</p>
              </div>
              <Boxes className="w-4 h-4 text-[#8B5A2B]" />
            </div>

            <div className="space-y-2.5 pt-1">
              {categoryDistribution.slice(0, 5).map(item => {
                const unitRatio = totalUnits > 0 ? Math.round((item.units / totalUnits) * 100) : 0;
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-[#2C2C1E]">{item.category}</span>
                      <span className="font-mono font-semibold text-[#8B5A2B]">
                        {item.units.toLocaleString('en-IN')} units ({unitRatio}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#F4F1EA] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#8B5A2B]"
                        style={{ width: `${unitRatio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INVENTORY SUMMARY TABLE (Section 3)                                     */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E6E1D3] rounded-3xl shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-5 border-b border-[#E6E1D3] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FDFBF7]">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#2C3A2B]">
              Inventory Registry
            </h3>
            <p className="text-xs text-[#5A5A40] mt-0.5">
              Showing {filteredProducts.length} of {totalProducts} registered products
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B7A]" />
              <input
                type="text"
                placeholder="Search name, ID, category..."
                value={invSearch}
                onChange={e => {
                  setInvSearch(e.target.value);
                  setInvPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] text-[#2C2C1E]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={invCategoryFilter}
              onChange={e => {
                setInvCategoryFilter(e.target.value);
                setInvPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-[#E6E1D3] rounded-xl text-[#2C2C1E] focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Stock Status Filter */}
            <select
              value={invStatusFilter}
              onChange={e => {
                setInvStatusFilter(e.target.value as any);
                setInvPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-[#E6E1D3] rounded-xl text-[#2C2C1E] focus:outline-hidden"
            >
              <option value="all">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock (&le; {lowStockThreshold})</option>
              <option value="OUT_OF_STOCK">Out of Stock (0 units)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E6E1D3] text-[#5A5A40] uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Product ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Available Quantity</th>
                <th className="py-3 px-4 text-center">Stock Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1D3]/60 font-normal">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#8B8B7A]">
                    No inventory records match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map(prod => {
                  const status = classifyStockStatus(prod.stockQuantity, lowStockThreshold);
                  const isLow = status === 'LOW_STOCK';
                  const isOut = status === 'OUT_OF_STOCK';

                  return (
                    <tr key={prod.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#2C3A2B]">
                        {prod.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#2C2C1E]">
                        <button
                          onClick={() => openProductDetails(prod.id)}
                          className="hover:underline text-left cursor-pointer flex items-center gap-1 group"
                        >
                          <span>{prod.name}</span>
                          <ExternalLink className="w-3 h-3 text-[#B5B5A3] group-hover:text-[#2C3A2B]" />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-[#5A5A40]">
                        <span className="px-2 py-0.5 rounded-md bg-[#F4F1EA] text-[11px]">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#2C2C1E]">
                        {formatINR(prod.price)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={isOut ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-[#2C3A2B]'}>
                          {prod.stockQuantity ?? 0} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {status === 'IN_STOCK' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            In Stock
                          </span>
                        )}
                        {status === 'LOW_STOCK' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            Low Stock
                          </span>
                        )}
                        {status === 'OUT_OF_STOCK' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#7A7A68] text-[11px] font-mono">
                        {prod.lastUpdated ? formatLastActive(prod.lastUpdated) : 'Benchmark Default'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenEditStock(prod)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-[#8B5A2B]" />
                          <span>Update</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-3 border-t border-[#E6E1D3] flex items-center justify-between text-xs text-[#7A7A68] bg-[#FDFBF7]">
          <span>
            Page {invPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={invPage <= 1}
              onClick={() => setInvPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-[#E6E1D3] disabled:opacity-40 hover:bg-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={invPage >= totalPages}
              onClick={() => setInvPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-[#E6E1D3] disabled:opacity-40 hover:bg-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. USER SIGN-IN ACTIVITY PANEL (Section 4)                                */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E6E1D3] rounded-3xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E6E1D3] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FDFBF7]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-[#2C3A2B]">
                Recent User Sign-In Activity
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                Asia/Kolkata
              </span>
            </div>
            <p className="text-xs text-[#5A5A40] mt-0.5">
              Live chronological session log showing successful customer and administrator authentications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Summary Statistics */}
            <div className="flex items-center gap-3 text-xs bg-white px-3 py-1.5 rounded-xl border border-[#E6E1D3]">
              <div>
                <span className="text-[#7A7A68]">Total Registered:</span>{' '}
                <strong className="text-[#2C3A2B] font-mono">{registeredUsers.length}</strong>
              </div>
              <span className="text-[#E6E1D3]">|</span>
              <div>
                <span className="text-[#7A7A68]">Signed In Today:</span>{' '}
                <strong className="text-emerald-700 font-mono">{todaySignIns}</strong>
              </div>
            </div>

            {/* User Search */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B7A]" />
              <input
                type="text"
                placeholder="Find user or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] text-[#2C2C1E]"
              />
            </div>
          </div>
        </div>

        {/* User Activity Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E6E1D3] text-[#5A5A40] uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Sign-In Date</th>
                <th className="py-3 px-4">Sign-In Time</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-center">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1D3]/60 font-normal">
              {filteredUserSignIns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#8B8B7A]">
                    No sign-in records found.
                  </td>
                </tr>
              ) : (
                filteredUserSignIns.map(record => (
                  <tr key={record.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#2C3A2B]">
                      {record.userId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#2C2C1E]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#2C3A2B] text-white flex items-center justify-center text-[10px] font-bold">
                          {record.userName.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{record.userName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#5A5A40] font-mono text-[11px]">
                      {record.email}
                    </td>
                    <td className="py-3 px-4 text-[#2C2C1E]">
                      {formatKolkataDate(record.signInTimestamp)}
                    </td>
                    <td className="py-3 px-4 text-[#5A5A40] font-mono text-[11px]">
                      {formatKolkataTime(record.signInTimestamp)}
                    </td>
                    <td className="py-3 px-4 text-[#7A7A68]">
                      {formatLastActive(record.lastActiveTimestamp)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          record.accountStatus === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            record.accountStatus === 'Active' ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                        />
                        {record.accountStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Edit Modal Dialog */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#2C2C1E]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D3] shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <h3 className="font-serif font-bold text-lg text-[#2C3A2B]">
              Update Inventory Quantity
            </h3>
            <p className="text-xs text-[#5A5A40] mt-1">
              Adjust stock for <strong>{editingProduct.name}</strong> ({editingProduct.id}).
            </p>

            <form onSubmit={handleSaveStock} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C2C1E] mb-1">
                  Physical Stock Quantity (units)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={editQtyInput}
                  onChange={e => setEditQtyInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2C3A2B]"
                />
                <p className="text-[11px] text-[#7A7A68] mt-1">
                  Must be a non-negative integer. Negative or decimal values are strictly rejected.
                </p>
              </div>

              {editError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  {editSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E1D3]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-[#E6E1D3] text-xs font-medium text-[#2C2C1E] hover:bg-[#F4F1EA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2C3A2B] hover:bg-[#3A4D39] text-white text-xs font-semibold cursor-pointer shadow-xs"
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
