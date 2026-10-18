import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCw,
  Download,
  FileSpreadsheet,
  FileJson,
  ShieldCheck,
  Filter,
  Check,
  Clock,
  Search,
  History,
  Layers,
  ArrowRight,
  ChevronRight,
  Eye,
  AlertCircle,
  SlidersHorizontal,
  RefreshCw,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import {
  InventoryTestType,
  InventoryTestRun,
  runInventoryAvailabilityTest,
  generateInventoryTestCSV,
  generateInventoryTestJSON
} from '../../utils/inventoryRules';
import { exportTestResultsToCSV, downloadFile } from '../../utils/exportUtils';
import { formatKolkataDate, formatKolkataTime } from '../../utils/userActivity';
import { Product } from '../../types';

export const TestResultsPage: React.FC = () => {
  const {
    fixture,
    isCustomFixture,
    lowStockThreshold,
    inventoryTestHistory,
    activeTestRun,
    setActiveTestRun,
    runInventoryTest,
    clearInventoryTestHistory,
    testResults,
    isTesting,
    runTestSuite
  } = useApp();

  // Primary mode: 'inventory_testing' (Section 7 & 8) vs 'legacy_suite' (20 reference tests)
  const [activeSuite, setActiveSuite] = useState<'inventory_testing' | 'legacy_suite'>('inventory_testing');

  // Test configuration states
  const [selectedTestType, setSelectedTestType] = useState<InventoryTestType>('ALL_PRODUCTS');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customThreshold, setCustomThreshold] = useState<number>(lowStockThreshold);
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);

  // Result table filters
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [verdictFilter, setVerdictFilter] = useState<'all' | 'PASS' | 'FAIL'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Export feedback toast
  const [exportNotification, setExportNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Auto-clear notification after 4s
  useEffect(() => {
    if (exportNotification) {
      const t = setTimeout(() => setExportNotification(null), 4000);
      return () => clearTimeout(t);
    }
  }, [exportNotification]);

  // Categories and products for test configuration dropdowns
  const categories = useMemo(() => {
    return Array.from(new Set(fixture.products.map(p => p.category)));
  }, [fixture.products]);

  // Initialize selected product and category if empty
  useEffect(() => {
    if (!selectedProductId && fixture.products.length > 0) {
      setSelectedProductId(fixture.products[0].id);
    }
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [fixture.products, categories, selectedProductId, selectedCategory]);

  // Execute test handler
  const handleExecuteInventoryTest = (options?: { injectInvalidRecord?: boolean }) => {
    setIsRunningTest(true);

    setTimeout(() => {
      let filterParam: string | undefined = undefined;
      if (selectedTestType === 'SELECTED_PRODUCT') filterParam = selectedProductId;
      if (selectedTestType === 'BY_CATEGORY') filterParam = selectedCategory;

      let productsToTest = [...fixture.products];

      // Option to inject a simulated invalid record to demonstrate Rule 4 testing
      if (options?.injectInvalidRecord) {
        const dummyInvalidProduct: Product = {
          id: 'TEST-ERR-INV-01',
          name: 'Faulty Stock Sensor Device',
          brand: 'MockLab',
          model: 'FLT-01',
          category: 'Accessories',
          price: 1999,
          stockQuantity: -2, // Intentionally invalid negative quantity
          inStock: true,
          weightKg: 0.5,
          description: 'Simulated record with illegal negative inventory quantity (-2).',
          attributes: {}
        };
        productsToTest = [dummyInvalidProduct, ...productsToTest];
      }

      const run = runInventoryAvailabilityTest(
        productsToTest,
        selectedTestType,
        filterParam,
        customThreshold
      );

      // Update active run and save to context
      setActiveTestRun(run);
      // Persist to history
      try {
        const existing = typeof localStorage !== 'undefined'
          ? JSON.parse(localStorage.getItem('c07_inventory_test_history_v2') || '[]')
          : [];
        const updated = [run, ...existing].slice(0, 50);
        localStorage.setItem('c07_inventory_test_history_v2', JSON.stringify(updated));
      } catch {}

      setIsRunningTest(false);
      setExportNotification({
        type: 'success',
        message: `Inventory test run ${run.testRunId} completed with verdict: ${run.summary.overallStatus}. Tested ${run.summary.totalTested} items.`
      });
    }, 250);
  };

  // CSV Export handler conforming to Section 8
  const handleExportCSV = (targetRun?: InventoryTestRun | null) => {
    const run = targetRun || activeTestRun;
    if (!run) {
      setExportNotification({
        type: 'error',
        message: 'No inventory test run has been executed yet. Please run a test first before exporting.'
      });
      return;
    }

    if (!run.results || run.results.length === 0) {
      setExportNotification({
        type: 'error',
        message: 'The selected test run contains no records to export.'
      });
      return;
    }

    try {
      const csvContent = generateInventoryTestCSV(run);
      const dateStr = new Date(run.executedAt).toISOString().split('T')[0];
      const filename = `inventory_test_results_${dateStr}.csv`;
      downloadFile(csvContent, filename, 'text/csv');

      setExportNotification({
        type: 'success',
        message: `Exported ${run.results.length} test records to ${filename}.`
      });
    } catch (err: any) {
      setExportNotification({
        type: 'error',
        message: `Failed to export CSV: ${err?.message || 'Unknown error'}`
      });
    }
  };

  // JSON Export handler conforming to Section 8
  const handleExportJSON = (targetRun?: InventoryTestRun | null) => {
    const run = targetRun || activeTestRun;
    if (!run) {
      setExportNotification({
        type: 'error',
        message: 'No inventory test run has been executed yet. Please run a test first before exporting.'
      });
      return;
    }

    if (!run.results || run.results.length === 0) {
      setExportNotification({
        type: 'error',
        message: 'The selected test run contains no records to export.'
      });
      return;
    }

    try {
      const jsonContent = generateInventoryTestJSON(run);
      const dateStr = new Date(run.executedAt).toISOString().split('T')[0];
      const filename = `inventory_test_results_${dateStr}.json`;
      downloadFile(jsonContent, filename, 'application/json');

      setExportNotification({
        type: 'success',
        message: `Exported valid JSON test report to ${filename}.`
      });
    } catch (err: any) {
      setExportNotification({
        type: 'error',
        message: `Failed to export JSON: ${err?.message || 'Unknown error'}`
      });
    }
  };

  // Filtered results for the active test run table
  const displayedInventoryResults = useMemo(() => {
    if (!activeTestRun) return [];
    return activeTestRun.results.filter(item => {
      if (verdictFilter !== 'all' && item.testResult !== verdictFilter) return false;
      if (statusFilter !== 'all' && item.expectedStatus !== statusFilter) return false;
      if (searchFilter) {
        const q = searchFilter.toLowerCase().trim();
        return (
          item.productName.toLowerCase().includes(q) ||
          item.productId.toLowerCase().includes(q) ||
          item.testId.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeTestRun, verdictFilter, statusFilter, searchFilter]);

  // Legacy suite stats
  const totalLegacyTests = 20;
  const executedLegacyCount = testResults.length;
  const passedLegacyCount = testResults.filter(t => t.passed).length;
  const failedLegacyCount = testResults.filter(t => !t.passed).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Suite Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#2C3A2B]">
              Inventory Availability Testing & Test Results
            </h1>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#F5F5EC] text-[#5A5A40] border border-[#E6E1D3]">
              Section 7 & 8 Audit Engine
            </span>
          </div>
          <p className="text-xs text-[#5A5A40] mt-0.5">
            Deterministic verification of inventory quantities, stock status classifications, and consistency rules.
          </p>
        </div>

        {/* Suite Tab Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-[#F5F5EC] p-1 rounded-xl border border-[#E6E1D3] flex items-center gap-1">
            <button
              onClick={() => setActiveSuite('inventory_testing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSuite === 'inventory_testing'
                  ? 'bg-white text-[#2C3A2B] shadow-2xs'
                  : 'text-[#8B8B7A] hover:text-[#2C3A2B]'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Inventory Availability Tests</span>
            </button>
            <button
              onClick={() => setActiveSuite('legacy_suite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSuite === 'legacy_suite'
                  ? 'bg-white text-[#2C3A2B] shadow-2xs'
                  : 'text-[#8B8B7A] hover:text-[#2C3A2B]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Benchmark Suite (20 Scenarios)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Notification Toast */}
      {exportNotification && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between transition-all animate-fadeIn ${
            exportNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {exportNotification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{exportNotification.message}</span>
          </div>
          <button
            onClick={() => setExportNotification(null)}
            className="text-[11px] font-semibold underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 7 & 8: INVENTORY AVAILABILITY TESTING SUITE */}
      {activeSuite === 'inventory_testing' ? (
        <div className="space-y-6">
          {/* A. Test Configuration Card */}
          <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E1D3]/70 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#8B5A2B]" />
                <h2 className="text-sm font-bold text-[#2C3A2B] uppercase tracking-wider">
                  Run Inventory Test
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#5A5A40] bg-[#FDFBF7] px-2.5 py-0.5 rounded-full border border-[#E6E1D3]">
                Catalogue: {fixture.products.length} Products
              </span>
            </div>

            {/* Test Configuration Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Option Selector */}
              <div className="md:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-[#2C3A2B] block">
                  Select Test Scope
                </label>
                <select
                  value={selectedTestType}
                  onChange={e => setSelectedTestType(e.target.value as InventoryTestType)}
                  className="w-full bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl px-3 py-2 text-xs text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B]"
                >
                  <option value="ALL_PRODUCTS">1. Test All Products (Complete Catalogue)</option>
                  <option value="SELECTED_PRODUCT">2. Test a Selected Product</option>
                  <option value="BY_CATEGORY">3. Test by Category</option>
                  <option value="LOW_STOCK">4. Test Low-Stock Products Only</option>
                  <option value="OUT_OF_STOCK">5. Test Out-of-Stock Products Only</option>
                </select>
                <p className="text-[11px] text-[#8B8B7A]">
                  Executes deterministic stock availability rules against latest saved inventory data.
                </p>
              </div>

              {/* Dynamic Parameter: Product or Category picker */}
              {selectedTestType === 'SELECTED_PRODUCT' && (
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-[#2C3A2B] block">
                    Choose Product to Test
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl px-3 py-2 text-xs text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B]"
                  >
                    {fixture.products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.name} ({p.stockQuantity} units)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedTestType === 'BY_CATEGORY' && (
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-[#2C3A2B] block">
                    Choose Category to Test
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl px-3 py-2 text-xs text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B]"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Threshold parameter */}
              <div
                className={`${
                  selectedTestType === 'SELECTED_PRODUCT' || selectedTestType === 'BY_CATEGORY'
                    ? 'md:col-span-3'
                    : 'md:col-span-3'
                } space-y-1.5`}
              >
                <label className="text-xs font-semibold text-[#2C3A2B] block">
                  Low-Stock Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customThreshold}
                  onChange={e => setCustomThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl px-3 py-2 text-xs font-mono text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B]"
                />
                <span className="text-[10px] text-[#8B8B7A] block">
                  Classifies products with stock ≤ threshold as LOW_STOCK.
                </span>
              </div>

              {/* Action Buttons */}
              <div
                className={`${
                  selectedTestType === 'SELECTED_PRODUCT' || selectedTestType === 'BY_CATEGORY'
                    ? 'md:col-span-12'
                    : 'md:col-span-4'
                } flex flex-wrap items-end justify-start gap-2.5 pt-2 md:pt-0`}
              >
                <button
                  disabled={isRunningTest}
                  onClick={() => handleExecuteInventoryTest()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#2C3A2B] hover:bg-[#1E281D] text-white shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isRunningTest ? (
                    <RotateCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-current text-white" />
                  )}
                  <span>Run Inventory Test</span>
                </button>

                {/* Simulation button for Rule 4 (Invalid Inventory) */}
                <button
                  type="button"
                  onClick={() => handleExecuteInventoryTest({ injectInvalidRecord: true })}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Injects a record with negative inventory (-2 units) to test Rule 4 failure reporting"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Simulate Invalid (-2 Qty) Test</span>
                </button>
              </div>
            </div>
          </div>

          {/* D. Test Summary KPI Cards */}
          {activeTestRun && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-[#2C3A2B]">
                    Test Execution Summary: {activeTestRun.testRunId}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      activeTestRun.summary.overallStatus === 'PASS'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    OVERALL: {activeTestRun.summary.overallStatus}
                  </span>
                </div>

                {/* Section 8: Export CSV and Export JSON Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportCSV()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                    title="Export current test run as CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => handleExportJSON()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                    title="Export current test run as structured JSON"
                  >
                    <FileJson className="w-3.5 h-3.5 text-blue-700" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {/* 9 Metrics Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {/* 1. Total Records Tested */}
                <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block font-semibold">
                    Total Records Tested
                  </span>
                  <div className="text-2xl font-bold font-mono text-[#2C3A2B] mt-1">
                    {activeTestRun.summary.totalTested}
                  </div>
                  <span className="text-[11px] text-[#5A5A40]">Scope: {activeTestRun.testType}</span>
                </div>

                {/* 2. Passed Tests */}
                <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 block font-semibold">
                    Passed Tests
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                    {activeTestRun.summary.passed}
                  </div>
                  <span className="text-[11px] text-emerald-800">
                    {Math.round((activeTestRun.summary.passed / Math.max(1, activeTestRun.summary.totalTested)) * 100)}% pass rate
                  </span>
                </div>

                {/* 3. Failed Tests */}
                <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-800 block font-semibold">
                    Failed Tests
                  </span>
                  <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
                    {activeTestRun.summary.failed}
                  </div>
                  <span className="text-[11px] text-rose-800">Validation / Consistency</span>
                </div>

                {/* 4. In-Stock Products */}
                <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A5A40] block font-semibold">
                    In-Stock (&gt;{activeTestRun.threshold})
                  </span>
                  <div className="text-2xl font-bold font-mono text-[#2C3A2B] mt-1">
                    {activeTestRun.summary.inStock}
                  </div>
                  <span className="text-[11px] text-[#5A5A40]">Rule 1: IN_STOCK</span>
                </div>

                {/* 5. Low-Stock Products */}
                <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 block font-semibold">
                    Low-Stock (≤{activeTestRun.threshold})
                  </span>
                  <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
                    {activeTestRun.summary.lowStock}
                  </div>
                  <span className="text-[11px] text-amber-800">Rule 3: LOW_STOCK</span>
                </div>

                {/* 6. Out-of-Stock Products */}
                <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A5A40] block font-semibold">
                    Out-of-Stock (=0)
                  </span>
                  <div className="text-2xl font-bold font-mono text-[#2C3A2B] mt-1">
                    {activeTestRun.summary.outOfStock}
                  </div>
                  <span className="text-[11px] text-[#5A5A40]">Rule 2: Correct ID passes</span>
                </div>

                {/* 7. Invalid Inventory Records */}
                <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-800 block font-semibold">
                    Invalid Records
                  </span>
                  <div className="text-2xl font-bold font-mono text-purple-700 mt-1">
                    {activeTestRun.summary.invalidInventory}
                  </div>
                  <span className="text-[11px] text-purple-800">Rule 4: Rejected / Negative</span>
                </div>

                {/* 8. Test Execution Time */}
                <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block font-semibold">
                    Execution Time
                  </span>
                  <div className="text-2xl font-bold font-mono text-[#2C3A2B] mt-1">
                    {activeTestRun.summary.executionTimeMs} ms
                  </div>
                  <span className="text-[11px] text-[#5A5A40]">High-speed engine</span>
                </div>

                {/* 9. Overall Status */}
                <div className="p-4 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block font-semibold">
                    Overall Test Status
                  </span>
                  <div
                    className={`text-2xl font-bold font-mono mt-1 ${
                      activeTestRun.summary.overallStatus === 'PASS'
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {activeTestRun.summary.overallStatus}
                  </div>
                  <span className="text-[11px] text-[#5A5A40]">
                    {formatKolkataTime(activeTestRun.executedAt)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* C. Test Results Table */}
          {activeTestRun && (
            <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs overflow-hidden space-y-4">
              {/* Table Filter Controls */}
              <div className="p-4 bg-[#FDFBF7] border-b border-[#E6E1D3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B7A]" />
                  <input
                    type="text"
                    placeholder="Filter by product name, ID, or test ID..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    className="w-full bg-white border border-[#E6E1D3] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#5A5A40]">Verdict:</span>
                    <select
                      value={verdictFilter}
                      onChange={e => setVerdictFilter(e.target.value as any)}
                      className="bg-white border border-[#E6E1D3] rounded-lg px-2.5 py-1 text-xs text-[#2C3A2B] focus:outline-none"
                    >
                      <option value="all">All Verdicts</option>
                      <option value="PASS">PASS Only</option>
                      <option value="FAIL">FAIL Only</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#5A5A40]">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="bg-white border border-[#E6E1D3] rounded-lg px-2.5 py-1 text-xs text-[#2C3A2B] focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="IN_STOCK">IN_STOCK</option>
                      <option value="LOW_STOCK">LOW_STOCK</option>
                      <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                      <option value="INVALID_INVENTORY">INVALID_INVENTORY</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Data */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F5EC]/70 text-[#5A5A40] font-mono uppercase text-[10px] tracking-wider border-b border-[#E6E1D3]">
                    <tr>
                      <th className="py-3 px-3">Test ID</th>
                      <th className="py-3 px-3">Product ID</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3 text-center">Inventory Quantity</th>
                      <th className="py-3 px-3 text-center">Expected Status</th>
                      <th className="py-3 px-3 text-center">Actual Status</th>
                      <th className="py-3 px-3 text-center">Test Result</th>
                      <th className="py-3 px-4">Error Message</th>
                      <th className="py-3 px-3">Timestamp (IST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1D3]/70 text-[#2C3A2B]">
                    {displayedInventoryResults.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-10 text-center text-[#8B8B7A]">
                          No records match the current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      displayedInventoryResults.map(item => {
                        const isPass = item.testResult === 'PASS';
                        return (
                          <tr
                            key={item.testId}
                            className={`hover:bg-[#FDFBF7] transition-colors ${
                              !isPass ? 'bg-rose-50/40' : ''
                            }`}
                          >
                            <td className="py-3 px-3 font-mono font-bold text-[#5A5A40]">
                              {item.testId}
                            </td>
                            <td className="py-3 px-3 font-mono text-[#8B5A2B] font-semibold">
                              {item.productId}
                            </td>
                            <td className="py-3 px-4 font-semibold text-[#2C3A2B]">
                              {item.productName}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-[#5A5A40]">
                              {item.category}
                            </td>
                            <td className="py-3 px-3 font-mono text-center font-bold text-sm">
                              {item.inventoryQuantity}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-[11px]">
                              <span
                                className={`px-2 py-0.5 rounded-md ${
                                  item.expectedStatus === 'IN_STOCK'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : item.expectedStatus === 'LOW_STOCK'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : item.expectedStatus === 'OUT_OF_STOCK'
                                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                    : 'bg-purple-50 text-purple-800 border border-purple-200'
                                }`}
                              >
                                {item.expectedStatus}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-[11px]">
                              <span
                                className={`px-2 py-0.5 rounded-md ${
                                  item.actualStatus === 'IN_STOCK'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : item.actualStatus === 'LOW_STOCK'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : item.actualStatus === 'OUT_OF_STOCK'
                                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                    : 'bg-purple-50 text-purple-800 border border-purple-200'
                                }`}
                              >
                                {item.actualStatus}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {isPass ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px]">
                                  <Check className="w-3 h-3 text-emerald-700" />
                                  PASS
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-bold text-[11px]">
                                  <XCircle className="w-3 h-3 text-rose-700" />
                                  FAIL
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-[11px] max-w-[220px]">
                              {item.errorMessage ? (
                                <span className="text-rose-700 font-medium">
                                  {item.errorMessage}
                                </span>
                              ) : (
                                <span className="text-[#8B8B7A] font-mono">None (Deterministic match)</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-[10px] text-[#5A5A40] whitespace-nowrap">
                              {formatKolkataDate(item.executionTimestamp)} {formatKolkataTime(item.executionTimestamp)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-4 bg-[#FDFBF7] border-t border-[#E6E1D3] flex items-center justify-between text-xs text-[#5A5A40]">
                <span>
                  Showing {displayedInventoryResults.length} of {activeTestRun.results.length} tested records
                </span>
                <span className="font-mono text-[11px]">
                  Execution Engine: Deterministic TypeScript Rules
                </span>
              </div>
            </div>
          )}

          {/* E. Test History Panel */}
          <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E1D3]/70 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#8B5A2B]" />
                <h3 className="font-serif font-bold text-base text-[#2C3A2B]">
                  Test Execution History ({inventoryTestHistory.length} Runs Recorded)
                </h3>
              </div>

              {inventoryTestHistory.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear test history?')) {
                      clearInventoryTestHistory();
                    }
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            {inventoryTestHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8B8B7A]">
                No historical test runs recorded yet. Run a test to begin recording immutable test reports.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FDFBF7] text-[#5A5A40] font-mono uppercase text-[10px] tracking-wider border-b border-[#E6E1D3]">
                    <tr>
                      <th className="py-2.5 px-3">Test Run ID</th>
                      <th className="py-2.5 px-3">Execution Date & Time (IST)</th>
                      <th className="py-2.5 px-3">Test Type</th>
                      <th className="py-2.5 px-3 text-center">Products Tested</th>
                      <th className="py-2.5 px-3 text-center">Passed</th>
                      <th className="py-2.5 px-3 text-center">Failed</th>
                      <th className="py-2.5 px-3 text-center">Overall Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1D3]/70">
                    {inventoryTestHistory.map(run => {
                      const isCurrent = activeTestRun?.testRunId === run.testRunId;
                      return (
                        <tr
                          key={run.testRunId}
                          className={`hover:bg-[#FDFBF7] transition-colors ${
                            isCurrent ? 'bg-[#F5F5EC]/60' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold text-[#8B5A2B]">
                            {run.testRunId}
                            {isCurrent && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#2C3A2B] text-white">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-[#5A5A40]">
                            {formatKolkataDate(run.executedAt)} at {formatKolkataTime(run.executedAt)}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-[#2C3A2B]">
                            {run.testType}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-semibold">
                            {run.summary.totalTested}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-emerald-700 font-semibold">
                            {run.summary.passed}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-rose-700 font-semibold">
                            {run.summary.failed}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                run.summary.overallStatus === 'PASS'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}
                            >
                              {run.summary.overallStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setActiveTestRun(run)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F5F5EC] hover:bg-[#E6E1D3] text-[#2C3A2B] transition-colors cursor-pointer"
                                title="Inspect this historical test report"
                              >
                                View Results
                              </button>
                              <button
                                onClick={() => handleExportCSV(run)}
                                className="p-1 rounded-lg hover:bg-[#F5F5EC] text-emerald-700 cursor-pointer"
                                title="Export CSV for this run"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleExportJSON(run)}
                                className="p-1 rounded-lg hover:bg-[#F5F5EC] text-blue-700 cursor-pointer"
                                title="Export JSON for this run"
                              >
                                <FileJson className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SECONDARY TAB: 20 PRE-EXISTING BENCHMARK & EDGE CASE TESTS */
        <div className="space-y-6">
          <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E1D3]/70 pb-3">
              <div>
                <h2 className="font-serif font-bold text-base text-[#2C3A2B]">
                  Engineering Validation Suite (20 Scenarios)
                </h2>
                <p className="text-xs text-[#5A5A40]">
                  10 Customer Reference Requests + 10 Business Edge Cases
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={isTesting}
                  onClick={() => runTestSuite()}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{executedLegacyCount === 0 ? 'Run All 20 Scenarios' : 'Re-run Scenarios'}</span>
                </button>
              </div>
            </div>

            {/* Legacy KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E6E1D3]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block font-semibold">
                  Total Scenarios
                </span>
                <span className="font-mono text-2xl font-bold text-[#2C3A2B] mt-1 block">
                  {totalLegacyTests}
                </span>
              </div>
              <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E6E1D3]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 block font-semibold">
                  Passed Scenarios
                </span>
                <span className="font-mono text-2xl font-bold text-emerald-700 mt-1 block">
                  {passedLegacyCount}
                </span>
              </div>
              <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E6E1D3]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-800 block font-semibold">
                  Failed Scenarios
                </span>
                <span className="font-mono text-2xl font-bold text-rose-700 mt-1 block">
                  {failedLegacyCount}
                </span>
              </div>
              <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E6E1D3]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B5A2B] block font-semibold">
                  Pass Rate
                </span>
                <span className="font-mono text-2xl font-bold text-[#8B5A2B] mt-1 block">
                  {executedLegacyCount > 0
                    ? `${Math.round((passedLegacyCount / executedLegacyCount) * 100)}%`
                    : 'Not run'}
                </span>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto border border-[#E6E1D3] rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5EC] text-[#5A5A40] font-mono uppercase text-[10px] tracking-wider border-b border-[#E6E1D3]">
                  <tr>
                    <th className="py-2.5 px-3">Test ID</th>
                    <th className="py-2.5 px-4">Scenario & Type</th>
                    <th className="py-2.5 px-3">Budget</th>
                    <th className="py-2.5 px-4">Expected vs Actual</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 px-3 text-right">Run</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D3]/70">
                  {testResults.map(t => (
                    <tr key={t.testId} className="hover:bg-[#FDFBF7]">
                      <td className="py-3 px-3 font-mono font-bold text-[#5A5A40]">{t.testId}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2C3A2B]">{t.title}</div>
                        <div className="text-[10px] text-[#8B5A2B] uppercase font-mono mt-0.5">
                          {t.testType}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">{formatINR(t.budget)}</td>
                      <td className="py-3 px-4 text-[11px]">
                        <div><strong className="text-[#2C3A2B]">Exp:</strong> {t.expectedResult}</div>
                        <div><strong className="text-[#5A5A40]">Act:</strong> {t.actualResult}</div>
                      </td>
                      <td className="py-3 px-3">
                        {t.passed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            PASS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                            FAIL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => runTestSuite(t.testId)}
                          className="p-1 rounded hover:bg-[#F5F5EC] text-[#5A5A40] cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
