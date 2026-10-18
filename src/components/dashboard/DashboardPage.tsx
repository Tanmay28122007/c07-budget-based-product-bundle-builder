import React, { useState } from 'react';
import {
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  Coins,
  TrendingUp,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Download,
  AlertTriangle,
  Check,
  ShieldCheck,
  UserCheck,
  Building2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  X,
  LogOut,
  Wallet
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import { exportBundleToCSV, exportTestResultsToCSV, downloadFile } from '../../utils/exportUtils';
import { SignInDashboard } from './SignInDashboard';
import { AdminDashboardView } from './AdminDashboardView';

export const DashboardPage: React.FC = () => {
  const {
    fixture,
    budget,
    currentItems,
    validation,
    savedBundles,
    testResults,
    setActiveTab,
    runTestSuite,
    resetBundle,
    optimizeBundle,
    loadSavedBundle,
    userRole,
    loginAs,
    logout,
    adminSignInRequested,
    setAdminSignInRequested,
    userProfile
  } = useApp();


  // Metrics computation from real loaded datasets
  const availableProductsCount = fixture.products.filter(
    p => p.inStock && (p.stockQuantity === undefined || p.stockQuantity > 0)
  ).length;

  const totalRequiredSlots = fixture.activity.requiredSlots.length;

  const validSavedBundlesCount = savedBundles.filter(b => b.validation.isValid).length;

  // Average cost of valid saved bundles or current bundle
  const validBundlesList = savedBundles.filter(b => b.validation.isValid);
  const avgBundleCost = validBundlesList.length > 0
    ? Math.round(validBundlesList.reduce((acc, b) => acc + b.validation.landedPrice.landedPrice, 0) / validBundlesList.length)
    : (validation.isValid ? validation.landedPrice.landedPrice : null);

  // Budget compliance rate from test suite results if executed, else from saved bundles
  let complianceRateStr = 'Not yet measured';
  if (testResults.length > 0) {
    const passedCount = testResults.filter(t => t.passed).length;
    const rate = Math.round((passedCount / testResults.length) * 100);
    complianceRateStr = `${rate}% (${passedCount}/${testResults.length} tests)`;
  } else if (savedBundles.length > 0) {
    const rate = Math.round((validSavedBundlesCount / savedBundles.length) * 100);
    complianceRateStr = `${rate}% (${validSavedBundlesCount}/${savedBundles.length} saved)`;
  }

  const handleExportBundle = () => {
    const csv = exportBundleToCSV(
      'Active Workspace Bundle',
      fixture.activity.name,
      budget,
      currentItems,
      validation.landedPrice,
      validation.isValid
    );
    downloadFile(csv, `bundle_export_${Date.now()}.csv`, 'text/csv');
  };

  const handleExportTests = () => {
    if (testResults.length === 0) {
      runTestSuite();
    }
    const csv = exportTestResultsToCSV(testResults);
    downloadFile(csv, `test_results_${Date.now()}.csv`, 'text/csv');
  };

  // 1. If not authenticated, render the Sign In Dashboard on the front/first page!
  if (!userRole) {
    return <SignInDashboard />;
  }

  // 2. If authenticated as Customer, render the Customer Workspace Dashboard & Hub!
  if (userRole === 'customer') {
    return (
      <div className="space-y-8 py-2 animate-fade-in">
        {/* Customer Session Header Bar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E6E1D3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#2C3A2B] text-white flex items-center justify-center shadow-xs font-bold font-serif text-lg shrink-0">
              {userProfile.name ? userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'TA'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-xl text-[#2C3A2B]">
                  Welcome back, {userProfile.name}
                </h2>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Customer Active
                </span>
              </div>
              <p className="text-xs text-[#5A5A40] mt-0.5">
                {userProfile.roleTitle} • Target Budget: {formatINR(budget)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-[#F4F1EA] hover:bg-rose-50 text-xs font-semibold text-[#8B5A2B] hover:text-rose-700 border border-[#E6E1D3] hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Customer KPI Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Bundle Slots</span>
              <Layers className="w-4 h-4 text-[#8B8B7A]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#2C3A2B]">
              {validation.filledSlotCount}
              <span className="text-xs font-normal text-[#8B8B7A] ml-1">/ {fixture.activity.requiredSlots.length} filled</span>
            </div>
            <p className="text-[11px] text-[#5A5A40] mt-1">
              {validation.isComplete ? 'All slots assigned' : `${validation.missingSlotIds.length} slots empty`}
            </p>
          </div>

          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Landed Price</span>
              <Wallet className="w-4 h-4 text-[#8B5A2B]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#2C3A2B]">
              {formatINR(validation.landedPrice.landedPrice)}
            </div>
            <p className="text-[11px] text-[#5A5A40] mt-1">Subtotal + GST + Shipping</p>
          </div>

          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Budget Balance</span>
              <Coins className="w-4 h-4 text-emerald-700" />
            </div>
            <div className={`text-xl sm:text-2xl font-bold font-mono ${
              validation.landedPrice.landedPrice <= budget ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {formatINR(Math.max(0, budget - validation.landedPrice.landedPrice))}
            </div>
            <p className="text-[11px] text-[#5A5A40] mt-1">
              {validation.landedPrice.landedPrice <= budget ? 'Within target budget' : 'Over budget'}
            </p>
          </div>

          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Saved Bundles</span>
              <CheckCircle2 className="w-4 h-4 text-[#2C3A2B]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#2C3A2B]">
              {savedBundles.length}
              <span className="text-xs font-normal text-[#8B8B7A] ml-1">configurations</span>
            </div>
            <p className="text-[11px] text-[#5A5A40] mt-1">Ready for comparison</p>
          </div>
        </div>

        {/* Customer Fast Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 bg-white border border-[#E6E1D3] rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#2C3A2B] text-white flex items-center justify-center mb-4 shadow-xs">
                <Package className="w-6 h-6 text-amber-200" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#2C3A2B]">Continue Custom Bundle</h3>
              <p className="text-xs text-[#5A5A40] mt-1.5 leading-relaxed">
                Open the interactive workspace to select or swap desk, chair, screenbar, and monitor products.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('compare')}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-[#2C3A2B] hover:bg-[#1E281D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
            >
              <span>Open Workstation Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 bg-white border border-[#E6E1D3] rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] flex items-center justify-center mb-4 shadow-2xs">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#2C3A2B]">Browse Product Catalogue</h3>
              <p className="text-xs text-[#5A5A40] mt-1.5 leading-relaxed">
                Explore all {fixture.products.length} hardware products with live specs, physical dimensions, and stock levels.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('catalogue')}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-[#F4F1EA] hover:bg-[#E6E1D3] text-[#2C2C1E] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>Explore Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 bg-white border border-[#E6E1D3] rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#8B5A2B]/10 text-[#8B5A2B] border border-[#8B5A2B]/20 flex items-center justify-center mb-4 shadow-2xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#2C3A2B]">Auto-Find Valid Setup</h3>
              <p className="text-xs text-[#5A5A40] mt-1.5 leading-relaxed">
                Let the combinatorial optimizer scan all combinations to build the lowest landed-cost setup within budget.
              </p>
            </div>
            <button
              onClick={() => optimizeBundle('lowest_cost')}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-[#8B5A2B] hover:bg-[#724822] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Optimize My Bundle</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin view
  return <AdminDashboardView />;
};
