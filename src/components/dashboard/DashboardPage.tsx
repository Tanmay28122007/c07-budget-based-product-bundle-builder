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
  return (
    <div className="space-y-8 py-2">
      {/* Admin Session Header Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E6E1D3] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2C3A2B] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-lg text-[#2C3A2B]">Admin Workspace Control</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Admin Active
              </span>
            </div>
            <p className="text-xs text-[#5A5A40]">
              Full administrative access to test execution, MBA unit economics, and landed tariff rules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loginAs('customer')}
            className="px-3 py-1.5 rounded-xl border border-[#E6E1D3] text-xs font-medium text-[#2C2C1E] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            Switch to Customer
          </button>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-xl bg-[#F4F1EA] hover:bg-[#E6E1D3] text-xs font-semibold text-[#8B5A2B] transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WORKSPACE OPERATIONS & DASHBOARD OVERVIEW (Admin Only)                    */}
      {/* ========================================================================= */}
      <div className="space-y-6 pt-2">
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#2C3A2B]">
              Workspace Overview & Inventory
            </h2>
            <p className="text-xs text-[#5A5A40] mt-0.5">
              Live validation telemetry for {fixture.activity.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => optimizeBundle('lowest_cost')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C2C1E] bg-white border border-[#E6E1D3] hover:bg-[#F4F1EA] rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
              Auto-Find Valid Setup
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Open Compare Builder
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Metric 1 */}
          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Available Products</span>
              <Package className="w-4 h-4 text-[#8B8B7A]" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-[#2C3A2B]">
              {availableProductsCount}
              <span className="text-xs font-normal text-[#8B8B7A] ml-1">/ {fixture.products.length}</span>
            </div>
            <p className="text-[11px] text-[#5A5A40] mt-1">Live in-stock catalogue</p>
          </div>

          {/* Metric 2 */}
          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Required Slots</span>
              <Layers className="w-4 h-4 text-[#8B8B7A]" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-[#2C3A2B]">
              {validation.filledSlotCount}
              <span className="text-xs font-normal text-[#8B8B7A] ml-1">/ {totalRequiredSlots} filled</span>
            </div>
            <p className="text-[11px] text-[#5A5A40] mt-1">
              {validation.isComplete ? 'All slots assigned' : `${validation.missingSlotIds.length} slots empty`}
            </p>
          </div>

          {/* Metric 3 */}
          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Valid Bundles</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-[#2C3A2B]">
              {validSavedBundlesCount}
              <span className="text-xs font-normal text-[#8B8B7A] ml-1">saved</span>
            </div>
            <p className="text-[11px] text-[#5A5A40] mt-1">Zero rule violations</p>
          </div>

          {/* Metric 4 */}
          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Avg Bundle Cost</span>
              <Coins className="w-4 h-4 text-[#8B5A2B]" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-[#2C3A2B]">
              {avgBundleCost !== null ? formatINR(avgBundleCost) : 'Pending setup'}
            </div>
            <p className="text-[11px] text-[#5A5A40] mt-1">Final landed price</p>
          </div>

          {/* Metric 5 */}
          <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-[#5A5A40] mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Compliance Rate</span>
              <TrendingUp className="w-4 h-4 text-[#8B5A2B]" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-[#2C3A2B]">
              {complianceRateStr}
            </div>
            <p className="text-[11px] text-[#5A5A40] mt-1">Rule & budget bounds</p>
          </div>
        </div>

        {/* Main Grid: Current Bundle Card + Budget Utilisation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Current Bundle Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs p-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E6E1D3]">
                <div>
                  <div className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider">
                    Active Configuration
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#2C3A2B]">
                    {fixture.activity.name} Workstation
                  </h3>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  {validation.isValid ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A3B18A]/25 text-[#2C3A2B] text-xs font-semibold border border-[#A3B18A]/50">
                      <Check className="w-3.5 h-3.5" />
                      Valid Bundle
                    </span>
                  ) : !validation.isComplete ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Incomplete ({validation.filledSlotCount}/{validation.totalSlotCount})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Constraint Violations
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Budget Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[#E6E1D3]">
                <div>
                  <span className="text-[11px] text-[#5A5A40] block">Customer Budget</span>
                  <span className="text-sm font-bold font-mono tabular-nums text-[#2C3A2B]">
                    {formatINR(budget)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#5A5A40] block">Product Subtotal</span>
                  <span className="text-sm font-semibold font-mono tabular-nums text-[#2C2C1E]">
                    {formatINR(validation.landedPrice.productSubtotal)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#5A5A40] block">Shipping & Taxes</span>
                  <span className="text-sm font-semibold font-mono tabular-nums text-[#2C2C1E]">
                    {formatINR(validation.landedPrice.netShipping + validation.landedPrice.taxAmount)}
                  </span>
                  <span className="text-[10px] text-[#8B8B7A] block font-mono">
                    Ship: {formatINR(validation.landedPrice.netShipping)} · GST: {formatINR(validation.landedPrice.taxAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#5A5A40] block">Final Landed Price</span>
                  <span
                    className={`text-sm font-bold font-mono tabular-nums ${
                      validation.landedPrice.isOverBudget ? 'text-rose-600' : 'text-[#8B5A2B]'
                    }`}
                  >
                    {formatINR(validation.landedPrice.landedPrice)}
                  </span>
                </div>
              </div>

              {/* Status Message & Limiting Factor Notice */}
              <div className="py-3">
                <div className="text-xs text-[#5A5A40] flex items-start gap-2">
                  <span className="font-semibold text-[#2C3A2B] shrink-0">Status note:</span>
                  <span className="leading-relaxed">{validation.statusMessage}</span>
                </div>
                {validation.compatibilityViolations.length > 0 && (
                  <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Compatibility conflict detected:
                    </div>
                    <p className="mt-1 leading-relaxed text-rose-700">
                      {validation.compatibilityViolations[0].message}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E6E1D3]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('compare')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    Open Compare Builder
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={resetBundle}
                    className="px-3 py-2 text-xs font-medium text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Slots
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportBundle}
                    className="px-3 py-2 text-xs font-medium text-[#2C2C1E] hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#8B8B7A]" />
                    Export Bundle CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Required Slot Status Card */}
            <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D3]">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#2C3A2B]">Required Product Slots</h3>
                  <p className="text-xs text-[#5A5A40]">
                    Current assignment and inventory status across all {fixture.activity.requiredSlots.length} categories.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('compare')}
                  className="text-xs font-bold text-[#8B5A2B] hover:underline"
                >
                  Manage in Compare Builder
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
                {fixture.activity.requiredSlots.map(slot => {
                  const prod = currentItems[slot.id];
                  const isAssigned = Boolean(prod);
                  const isInStock = prod ? (prod.inStock && (prod.stockQuantity === undefined || prod.stockQuantity > 0)) : true;

                  return (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-[#2C3A2B] uppercase tracking-wider">
                            {slot.label}
                          </span>
                          {isAssigned ? (
                            isInStock ? (
                              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Filled
                              </span>
                            ) : (
                              <span className="text-[10px] text-rose-700 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Out of stock
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] text-[#8B8B7A] font-medium">Empty</span>
                          )}
                        </div>

                        {prod ? (
                          <div className="mt-1">
                            <div className="text-xs font-medium text-[#2C2C1E] line-clamp-1">{prod.name}</div>
                            <div className="text-[11px] font-mono tabular-nums text-[#8B5A2B] font-semibold mt-0.5">
                              {formatINR(prod.price)}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 text-xs text-[#8B8B7A] italic">
                            No product selected
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#E6E1D3] flex items-center justify-end">
                        <button
                          onClick={() => setActiveTab('compare')}
                          className="text-[11px] font-bold text-[#8B5A2B] hover:text-[#743815] uppercase tracking-wider"
                        >
                          {isAssigned ? 'Replace →' : 'Select →'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Budget Utilisation & Quick Actions */}
          <div className="space-y-6">
            {/* Budget Utilisation Card */}
            <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs p-6">
              <h3 className="font-serif text-base font-bold text-[#2C3A2B] mb-1">Budget Utilisation</h3>
              <p className="text-xs text-[#5A5A40] mb-4">
                Real-time expenditure vs customer limit
              </p>

              {/* Visual Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5A5A40] font-medium">Landed Expenditure</span>
                  <span className="font-mono tabular-nums font-bold text-[#2C3A2B]">
                    {validation.landedPrice.budgetUtilisationPercent.toFixed(1)}%
                  </span>
                </div>

                <div className="w-full h-3 bg-[#F4F1EA] rounded-full overflow-hidden border border-[#E6E1D3]">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      validation.landedPrice.isOverBudget
                        ? 'bg-rose-500'
                        : validation.landedPrice.budgetUtilisationPercent > 90
                        ? 'bg-amber-500'
                        : 'bg-[#2C3A2B]'
                    }`}
                    style={{
                      width: `${Math.min(validation.landedPrice.budgetUtilisationPercent, 100)}%`
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="text-[#5A5A40]">
                    Spent: <span className="font-mono font-medium text-[#2C2C1E]">{formatINR(validation.landedPrice.landedPrice)}</span>
                  </div>
                  <div className={validation.landedPrice.isOverBudget ? 'text-rose-600 font-semibold' : 'text-[#5A5A40]'}>
                    {validation.landedPrice.isOverBudget ? 'Exceeded: ' : 'Remaining: '}
                    <span className="font-mono font-bold text-[#2C3A2B]">
                      {formatINR(Math.abs(validation.landedPrice.remainingBudget))}
                    </span>
                  </div>
                </div>
              </div>

              {validation.landedPrice.isOverBudget && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Over Budget Alert:</span> Configuration exceeds limit by {formatINR(Math.abs(validation.landedPrice.remainingBudget))}. Adjust slots or increase budget.
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs p-6">
              <h3 className="font-serif text-base font-bold text-[#2C3A2B] mb-3">Quick Actions</h3>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('compare')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#2C2C1E] hover:bg-[#F4F1EA] border border-[#E6E1D3] flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">Open Compare Builder</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8B5A2B]" />
                </button>

                <button
                  onClick={() => setActiveTab('catalogue')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#2C2C1E] hover:bg-[#F4F1EA] border border-[#E6E1D3] flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">Browse Product Catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8B5A2B]" />
                </button>

                <button
                  onClick={() => setActiveTab('compare')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#2C2C1E] hover:bg-[#F4F1EA] border border-[#E6E1D3] flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">Compare Saved Bundles</span>
                  <span className="text-[11px] font-mono text-[#8B5A2B]">{savedBundles.length} saved</span>
                </button>

                <button
                  onClick={() => {
                    runTestSuite();
                    setActiveTab('tests');
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#2C2C1E] hover:bg-[#F4F1EA] border border-[#E6E1D3] flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">Run Validation Suite</span>
                  <span className="text-[11px] font-mono text-[#2C3A2B] font-bold">20 tests</span>
                </button>

                <button
                  onClick={handleExportTests}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#2C2C1E] hover:bg-[#F4F1EA] border border-[#E6E1D3] flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">Export Test Log (CSV)</span>
                  <Download className="w-3.5 h-3.5 text-[#8B8B7A]" />
                </button>
              </div>
            </div>

            {/* Saved Bundle Records */}
            <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs p-6">
              <h3 className="font-serif text-base font-bold text-[#2C3A2B] mb-1">Saved Bundle Records</h3>
              <p className="text-xs text-[#5A5A40] mb-3">
                Locally saved setups in browser storage
              </p>

              {savedBundles.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#8B8B7A] border border-dashed border-[#E6E1D3] rounded-xl bg-[#FDFBF7]">
                  No saved bundles yet. Build and save a setup to compare later.
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {savedBundles.slice(0, 4).map(b => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-serif font-bold text-[#2C3A2B] line-clamp-1">{b.name}</div>
                        <div className="text-[10px] text-[#5A5A40] font-mono">
                          {formatINR(b.validation.landedPrice.landedPrice)} · {b.savedAt}
                        </div>
                      </div>
                      <button
                        onClick={() => loadSavedBundle(b)}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#8B5A2B] hover:bg-white rounded-lg border border-transparent hover:border-[#E6E1D3]"
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
