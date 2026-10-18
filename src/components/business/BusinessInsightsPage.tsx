import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  Sparkles,
  BarChart2,
  Calendar,
  Filter,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Trash2,
  ExternalLink,
  ChevronRight,
  Calculator,
  DollarSign,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import {
  computeBusinessInsights,
  TimeFilterType,
  seedSampleClickData,
  clearAllClickEvents,
  RankedProductItem
} from '../../utils/analytics';
import { Product } from '../../types';
import { getProductImageUrl } from '../../utils/imageUtils';

export const BusinessInsightsPage: React.FC = () => {
  const {
    fixture,
    lowStockThreshold,
    openProductDetails,
    unitEconomics,
    updateUnitEconomics,
    shopperRecords,
    updateShopperRecord
  } = useApp();

  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [activeViewTab, setActiveViewTab] = useState<'clicks' | 'economics'>('clicks');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen to product click events in real-time
  useEffect(() => {
    const handleEvent = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener('c07_product_click_recorded', handleEvent);
    return () => window.removeEventListener('c07_product_click_recorded', handleEvent);
  }, []);

  // Compute live analytics from actual recorded clicks
  const { rankedProducts, engagement, allRankedProducts } = useMemo(() => {
    return computeBusinessInsights(fixture.products, timeFilter, lowStockThreshold);
  }, [fixture.products, timeFilter, lowStockThreshold, refreshTrigger]);

  // Categories list
  const categories = useMemo(() => {
    return Array.from(new Set(fixture.products.map(p => p.category).filter(Boolean)));
  }, [fixture.products]);

  // Table filtering
  const displayedRankings = useMemo(() => {
    return rankedProducts.filter(item => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (item.product.name || '').toLowerCase().includes(q);
        const matchId = (item.product.id || '').toLowerCase().includes(q);
        const matchCat = (item.product.category || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchCat) return false;
      }
      if (categoryFilter !== 'all' && item.product.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [rankedProducts, searchQuery, categoryFilter]);

  const handleSeedSampleClicks = () => {
    seedSampleClickData(fixture.products);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleClearClicks = () => {
    if (window.confirm('Are you sure you want to clear all recorded product clicks?')) {
      clearAllClickEvents();
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Unit Economics Formulas (Preserved MBA Strategic section)
  const retailerMonthlyContribution = unitEconomics.retailerMonthlyFee - unitEconomics.monthlyCostToServe;
  const referralRevenuePerBasket = Math.round(unitEconomics.avgEligibleBasketValue * unitEconomics.referralPercentage);
  const referralContributionPerBasket = referralRevenuePerBasket - unitEconomics.variableCostPerBasket;
  const breakEvenBaskets = referralContributionPerBasket > 0
    ? Math.ceil(unitEconomics.fixedMonthlyCosts / referralContributionPerBasket)
    : null;
  const projectedMonthlyReferralContribution = referralContributionPerBasket * unitEconomics.monthlyBasketsForecast;
  const projectedTotalContribution = retailerMonthlyContribution + projectedMonthlyReferralContribution;
  const projectedNetProfitBeforeTax = projectedTotalContribution - unitEconomics.fixedMonthlyCosts;

  return (
    <div className="space-y-8 py-2">
      {/* Top Header & Section Switcher */}
      <div className="p-5 rounded-3xl bg-white border border-[#E6E1D3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-xl text-[#2C3A2B]">
              Business Insights & Product Analytics
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Live Click Stream
            </span>
          </div>
          <p className="text-xs text-[#5A5A40] mt-0.5">
            Identify customer demand patterns, monitor engagement velocity, and rank catalogue interest.
          </p>
        </div>

        {/* View Switcher: Click Analytics vs MBA Economics */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F1EA] rounded-2xl border border-[#E6E1D3]">
          <button
            onClick={() => setActiveViewTab('clicks')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeViewTab === 'clicks'
                ? 'bg-[#2C3A2B] text-white shadow-xs'
                : 'text-[#5A5A40] hover:text-[#2C2C1E]'
            }`}
          >
            Product Clicks & Rankings
          </button>
          <button
            onClick={() => setActiveViewTab('economics')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeViewTab === 'economics'
                ? 'bg-[#2C3A2B] text-white shadow-xs'
                : 'text-[#5A5A40] hover:text-[#2C2C1E]'
            }`}
          >
            Unit Economics (MBA)
          </button>
        </div>
      </div>

      {activeViewTab === 'clicks' && (
        <>
          {/* ========================================================================= */}
          {/* 1. TIME FILTERS & ACTION CONTROLS                                         */}
          {/* ========================================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E6E1D3] shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8B5A2B] uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Time Period:
              </span>
              <div className="flex items-center gap-1 bg-[#F4F1EA] p-1 rounded-xl border border-[#E6E1D3]">
                {(['today', '7days', '30days', 'all'] as TimeFilterType[]).map(tf => {
                  const label = tf === 'today' ? 'Today' : tf === '7days' ? 'Last 7 Days' : tf === '30days' ? 'Last 30 Days' : 'All Time';
                  const active = timeFilter === tf;
                  return (
                    <button
                      key={tf}
                      onClick={() => setTimeFilter(tf)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        active
                          ? 'bg-[#2C3A2B] text-white shadow-2xs'
                          : 'text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-white/60'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Analytics Operations */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedSampleClicks}
                title="Seed sample interaction traffic to test ranking behaviors immediately"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C2C1E] bg-[#F4F1EA] hover:bg-[#E6E1D3] rounded-xl border border-[#E6E1D3] transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <span>Simulate Sample Traffic</span>
              </button>

              {engagement.totalClicks > 0 && (
                <button
                  onClick={handleClearClicks}
                  title="Clear all recorded product click events"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Clear Clicks</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. PRODUCT ENGAGEMENT CARDS                                               */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Total Product Clicks */}
            <div className="p-5 bg-white border border-[#E6E1D3] rounded-3xl shadow-xs">
              <div className="flex items-center justify-between text-[#5A5A40] mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7A68]">Total Clicks</span>
                <MousePointerClick className="w-4 h-4 text-[#8B5A2B]" />
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-[#2C3A2B]">
                {engagement.totalClicks.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-[#7A7A68] mt-1 font-medium">Customer interactions recorded</p>
            </div>

            {/* Card 2: Most Clicked Product */}
            <div className="p-5 bg-white border border-[#E6E1D3] rounded-3xl shadow-xs">
              <div className="flex items-center justify-between text-[#5A5A40] mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7A68]">Most Clicked</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              {engagement.mostClickedProduct ? (
                <div>
                  <div className="text-lg font-serif font-bold text-[#2C3A2B] truncate" title={engagement.mostClickedProduct.product.name}>
                    {engagement.mostClickedProduct.product.name}
                  </div>
                  <p className="text-[11px] text-[#8B5A2B] mt-1 font-mono font-bold">
                    {engagement.mostClickedProduct.clicks} clicks ({engagement.mostClickedProduct.product.category})
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-serif font-bold text-[#8B8B7A] italic">No clicks yet</div>
                  <p className="text-[11px] text-[#7A7A68] mt-1">Awaiting shopper traffic</p>
                </div>
              )}
            </div>

            {/* Card 3: Number of Products Viewed */}
            <div className="p-5 bg-white border border-[#E6E1D3] rounded-3xl shadow-xs">
              <div className="flex items-center justify-between text-[#5A5A40] mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7A68]">Products Viewed</span>
                <Eye className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-emerald-700">
                {engagement.productsViewedCount}
                <span className="text-xs font-normal text-[#8B8B7A] ml-1.5 font-sans">
                  / {fixture.products.length}
                </span>
              </div>
              <p className="text-[11px] text-[#7A7A68] mt-1 font-medium">Unique products inspected</p>
            </div>

            {/* Card 4: Average Clicks per Product */}
            <div className="p-5 bg-white border border-[#E6E1D3] rounded-3xl shadow-xs">
              <div className="flex items-center justify-between text-[#5A5A40] mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7A68]">Avg Clicks / Product</span>
                <BarChart2 className="w-4 h-4 text-[#8B5A2B]" />
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-[#8B5A2B]">
                {engagement.avgClicksPerProduct}
              </div>
              <p className="text-[11px] text-[#7A7A68] mt-1 font-medium">Mean catalogue attention</p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. PRODUCT RANKING TABLE                                                  */}
          {/* ========================================================================= */}
          <div className="bg-white border border-[#E6E1D3] rounded-3xl shadow-xs overflow-hidden">
            {/* Table Header Filter Bar */}
            <div className="p-5 border-b border-[#E6E1D3] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FDFBF7]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C3A2B]">
                  Product Popularity Rankings
                </h3>
                <p className="text-xs text-[#5A5A40] mt-0.5">
                  Ordered by descending click velocity; ties resolved alphabetically.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative min-w-[220px]">
                  <input
                    type="text"
                    placeholder="Search product name or ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-3.5 pr-3 py-2 text-sm bg-white border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] text-[#2C2C1E]"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-[#E6E1D3] rounded-xl text-[#2C2C1E] focus:outline-hidden"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#E6E1D3] text-[#5A5A40] uppercase tracking-wider font-bold text-xs">
                  <tr>
                    <th className="py-3.5 px-4 text-center w-14">Rank</th>
                    <th className="py-3.5 px-4 w-14 text-center">Image</th>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Product ID</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-right">Price</th>
                    <th className="py-3.5 px-4 text-right">Stock</th>
                    <th className="py-3.5 px-4 text-right">Total Clicks</th>
                    <th className="py-3.5 px-4 text-right">Unique Viewers</th>
                    <th className="py-3.5 px-4 text-center">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D3]/60 font-normal">
                  {displayedRankings.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-sm text-[#8B8B7A]">
                        <MousePointerClick className="w-8 h-8 text-[#B5B5A3] mx-auto mb-2" />
                        <div className="font-semibold text-base text-[#2C2C1E] mb-1">
                          No product clicks recorded for this period
                        </div>
                        <p className="max-w-md mx-auto text-sm text-[#7A7A68]">
                          Interactions in the customer catalogue, workspace builder, or product modals will automatically appear here.
                        </p>
                        <button
                          onClick={handleSeedSampleClicks}
                          className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2C3A2B] text-white text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-200" />
                          <span>Simulate Sample Clicks</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    displayedRankings.map(item => {
                      const isTop3 = item.rank <= 3;
                      const status = item.stockStatus;
                      return (
                        <tr key={item.product.id} className="hover:bg-[#FDFBF7] transition-colors">
                          {/* Rank badge */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-xs font-bold ${
                                item.rank === 1
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : item.rank === 2
                                  ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                  : item.rank === 3
                                  ? 'bg-amber-50 text-[#8B5A2B] border border-amber-200'
                                  : 'text-[#5A5A40]'
                              }`}
                            >
                              {item.rank}
                            </span>
                          </td>

                          {/* Product Image */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="w-12 h-12 rounded-xl bg-[#F4F1EA] border border-[#E6E1D3] overflow-hidden flex items-center justify-center p-1.5 mx-auto">
                              <img
                                src={getProductImageUrl(item.product.image, item.product.id)}
                                alt={item.product.name}
                                onError={e => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </td>

                          {/* Product Name */}
                          <td className="py-3.5 px-4 font-semibold text-sm text-[#2C2C1E]">
                            <button
                              onClick={() => openProductDetails(item.product.id)}
                              className="hover:underline text-left cursor-pointer flex items-center gap-1.5 group"
                            >
                              <span className="line-clamp-1">{item.product.name}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-[#B5B5A3] group-hover:text-[#2C3A2B]" />
                            </button>
                          </td>

                          {/* Product ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#8B5A2B]">
                            {item.product.id}
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 text-xs font-mono text-[#5A5A40]">
                            <span className="px-2.5 py-1 rounded-md bg-[#F4F1EA] text-xs">
                              {item.product.category}
                            </span>
                          </td>

                          {/* Product Price */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-sm sm:text-base text-[#2C2C1E]">
                            {formatINR(item.product.price)}
                          </td>

                          {/* Stock Quantity */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-sm sm:text-base">
                            <span
                              className={
                                status === 'OUT_OF_STOCK'
                                  ? 'text-rose-700'
                                  : status === 'LOW_STOCK'
                                  ? 'text-amber-700'
                                  : 'text-[#2C3A2B]'
                              }
                            >
                              {item.product.stockQuantity ?? 0}
                            </span>
                          </td>

                          {/* Total Clicks */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-[#2C3A2B] text-base">
                            {item.totalClicks}
                          </td>

                          {/* Unique Viewers */}
                          <td className="py-3.5 px-4 text-right font-mono text-sm text-[#5A5A40]">
                            {item.uniqueViewers}
                          </td>

                          {/* Stock Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            {status === 'IN_STOCK' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                In Stock
                              </span>
                            )}
                            {status === 'LOW_STOCK' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                Low Stock
                              </span>
                            )}
                            {status === 'OUT_OF_STOCK' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                Out of Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. MBA STRATEGY & UNIT ECONOMICS TAB (Preserved from prior work)           */}
      {/* ========================================================================= */}
      {activeViewTab === 'economics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-white border border-[#E6E1D3] rounded-3xl shadow-xs space-y-2">
              <div className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider">
                Section A · Problem Statement
              </div>
              <h3 className="text-base font-serif font-bold text-[#2C3A2B]">Assembly Friction</h3>
              <p className="text-xs text-[#5A5A40] leading-relaxed">
                Customers struggle to assemble complete, physically compatible product setups within a strict budget. Online shoppers frequently face surprise checkout shipping fees and port mismatches.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E6E1D3] rounded-3xl shadow-xs space-y-2">
              <div className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider">
                Section B · Core Proposition
              </div>
              <h3 className="text-base font-serif font-bold text-[#2C3A2B]">Deterministic Landed Bundles</h3>
              <p className="text-xs text-[#2C3A2B] font-medium leading-relaxed bg-[#F5F5EC] p-3 rounded-xl border border-[#E6E1D3]">
                “Help shoppers build complete, compatible bundles with transparent landed pricing.”
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E6E1D3] rounded-3xl shadow-xs space-y-2">
              <div className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider">
                Section C · Target Segments
              </div>
              <h3 className="text-base font-serif font-bold text-[#2C3A2B]">Market Focus</h3>
              <p className="text-xs text-[#5A5A40] leading-relaxed">
                Work-from-home professionals, software engineers, and university students seeking guaranteed compatibility within predefined expense budgets.
              </p>
            </div>
          </div>

          {/* Unit Economics Simulation Cards */}
          <div className="p-6 bg-white border border-[#E6E1D3] rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E1D3] pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-[#2C3A2B]">
                  Unit Economics Simulation (INR)
                </h3>
                <p className="text-xs text-[#5A5A40]">Calculated monthly forecast & contribution</p>
              </div>
              <Calculator className="w-5 h-5 text-[#8B5A2B]" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3]">
                <span className="text-[11px] text-[#7A7A68] block">Retailer Monthly Fee</span>
                <span className="text-lg font-bold font-mono text-[#2C3A2B]">{formatINR(unitEconomics.retailerMonthlyFee)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3]">
                <span className="text-[11px] text-[#7A7A68] block">Referral Rate</span>
                <span className="text-lg font-bold font-mono text-[#8B5A2B]">{(unitEconomics.referralPercentage * 100).toFixed(1)}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3]">
                <span className="text-[11px] text-[#7A7A68] block">Break-Even Baskets</span>
                <span className="text-lg font-bold font-mono text-emerald-700">{breakEvenBaskets ?? '—'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3]">
                <span className="text-[11px] text-[#7A7A68] block">Projected Monthly Contribution</span>
                <span className="text-lg font-bold font-mono text-[#2C3A2B]">{formatINR(projectedTotalContribution)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
