import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import { exportTestResultsToCSV, downloadFile } from '../../utils/exportUtils';
import { TestExecutionResult } from '../../types';

export const TestResultsPage: React.FC = () => {
  const {
    testResults,
    isTesting,
    runTestSuite,
    fixture,
    isCustomFixture
  } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'reference' | 'edge_cases'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');

  // Summary counts
  const totalTests = 20; // 10 Reference Requests + 10 Edge Cases
  const executedCount = testResults.length;
  const passedCount = testResults.filter(t => t.passed).length;
  const failedCount = testResults.filter(t => !t.passed).length;
  const notRunCount = Math.max(0, totalTests - executedCount);
  const passRate = executedCount > 0 ? Math.round((passedCount / executedCount) * 100) : 0;

  // Filtered results
  const displayedResults = testResults.filter(t => {
    if (activeTabFilter === 'reference' && t.testType !== 'reference_request') return false;
    if (activeTabFilter === 'edge_cases' && t.testType !== 'edge_case') return false;
    if (statusFilter === 'passed' && !t.passed) return false;
    if (statusFilter === 'failed' && t.passed) return false;
    return true;
  });

  const handleExportCSV = () => {
    if (testResults.length === 0) runTestSuite();
    const csv = exportTestResultsToCSV(testResults);
    downloadFile(csv, `c07_test_execution_${Date.now()}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    if (testResults.length === 0) runTestSuite();
    downloadFile(JSON.stringify(testResults, null, 2), `c07_test_execution_${Date.now()}.json`, 'application/json');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              Engineering Validation Suite
            </h1>
            {!isCustomFixture && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                Synthetic Baseline
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Deterministic verification of 10 reference requests and 10 engineering edge cases.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={isTesting}
            onClick={() => runTestSuite()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
          >
            {isTesting ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            {executedCount === 0 ? 'Run All 20 Tests' : 'Re-run All Tests'}
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-stone-500" />
            Export CSV
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-2xs transition-colors"
          >
            <FileJson className="w-3.5 h-3.5 text-stone-500" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
            Total Scenarios
          </span>
          <div className="text-xl font-bold font-mono tabular-nums text-stone-900">
            {totalTests}
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">10 Ref + 10 Edge</p>
        </div>

        <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider block mb-1">
            Passed Tests
          </span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-800">
            {passedCount}
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">Deterministic match</p>
        </div>

        <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-rose-700 uppercase tracking-wider block mb-1">
            Failed Tests
          </span>
          <div className="text-xl font-bold font-mono tabular-nums text-rose-800">
            {failedCount}
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">Non-matching outcomes</p>
        </div>

        <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
            Pending / Not Run
          </span>
          <div className="text-xl font-bold font-mono tabular-nums text-stone-600">
            {notRunCount}
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">Unexecuted</p>
        </div>

        <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-indigo-900 uppercase tracking-wider block mb-1">
            Pass Rate
          </span>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-950">
            {executedCount > 0 ? `${passRate}%` : 'Not run'}
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">{executedCount} of {totalTests} executed</p>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div className="p-3 bg-white border border-stone-200/80 rounded-xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTabFilter === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Tests ({testResults.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('reference')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTabFilter === 'reference'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            10 Reference Requests
          </button>
          <button
            onClick={() => setActiveTabFilter('edge_cases')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTabFilter === 'edge_cases'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            10 Edge Cases
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-500">Status filter:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-800 focus:outline-hidden"
          >
            <option value="all">All Outcomes</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Test Execution Table */}
      <div className="bg-white border border-stone-200/80 rounded-xl shadow-2xs overflow-hidden">
        {displayedResults.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400 space-y-3">
            <p>
              {testResults.length === 0
                ? 'No tests have been executed yet in this session.'
                : 'No tests match the current filter.'}
            </p>
            {testResults.length === 0 && (
              <button
                onClick={() => runTestSuite()}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-900 rounded-lg shadow-2xs hover:bg-indigo-800"
              >
                Execute Validation Suite Now
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Test ID</th>
                  <th className="py-3 px-4">Scenario & Type</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Expected vs Actual</th>
                  <th className="py-3 px-4">Calculated Landed</th>
                  <th className="py-3 px-4">Compatibility</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4 text-right">Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {displayedResults.map(t => (
                  <tr key={t.testId} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-700">
                      {t.testId}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-stone-900 leading-tight">
                        {t.title}
                      </div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">
                        {t.testType === 'reference_request' ? 'Reference Request' : 'Edge Case Rule'}
                      </div>
                      <div className="text-[11px] text-stone-600 mt-1 leading-snug">
                        {t.explanation}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums text-stone-800">
                      {formatINR(t.budget)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px] text-stone-500">
                        <span className="font-semibold text-stone-700">Exp:</span> {t.expectedResult}
                      </div>
                      <div className="text-[11px] font-semibold text-stone-900 mt-0.5">
                        <span className="font-normal text-stone-500">Act:</span> {t.actualResult}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-stone-900">
                      {t.landedPrice > 0 ? formatINR(t.landedPrice) : '-'}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          t.compatibilityOutcome === 'Compatible'
                            ? 'bg-emerald-50 text-emerald-800'
                            : t.compatibilityOutcome === 'Incompatible'
                            ? 'bg-rose-50 text-rose-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {t.compatibilityOutcome}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          t.stockOutcome === 'All In-Stock'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {t.stockOutcome}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {t.passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100/70 text-emerald-900 font-bold text-xs">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-bold text-xs">
                          <XCircle className="w-3.5 h-3.5 text-rose-700" />
                          FAIL
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => runTestSuite(t.testId)}
                        className="p-1 text-stone-400 hover:text-indigo-900 hover:bg-stone-100 rounded transition-colors"
                        title="Re-run this individual test"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3 border-t border-stone-200/80 bg-stone-50/50 flex items-center justify-between text-xs text-stone-500">
          <span>
            {displayedResults.length} test records listed · Real-time programmatic validation
          </span>
          <span className="font-mono text-[11px]">
            No hardcoded results · Pure TypeScript execution
          </span>
        </div>
      </div>
    </div>
  );
};
