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
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#2C3A2B]">
              Engineering Validation Suite
            </h1>
            {!isCustomFixture && (
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#F5F5EC] text-[#5A5A40] border border-[#E6E1D3]">
                Synthetic Baseline
              </span>
            )}
          </div>
          <p className="text-xs text-[#5A5A40] mt-0.5">
            Deterministic verification of 10 reference requests and 10 engineering edge cases.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={isTesting}
            onClick={() => runTestSuite()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] disabled:opacity-50 rounded-xl shadow-xs transition-colors"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#5A5A40]" />
            Export CSV
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors"
          >
            <FileJson className="w-3.5 h-3.5 text-[#5A5A40]" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-5 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs">
          <span className="text-[11px] font-semibold text-[#5A5A40] uppercase tracking-wider block mb-1">
            Total Scenarios
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#2C3A2B]">
            {totalTests}
          </div>
          <p className="text-[11px] text-[#5A5A40] mt-0.5">10 Ref + 10 Edge</p>
        </div>

        <div className="p-5 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs">
          <span className="text-[11px] font-semibold text-[#2C3A2B] uppercase tracking-wider block mb-1">
            Passed Tests
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#2C3A2B]">
            {passedCount}
          </div>
          <p className="text-[11px] text-[#5A5A40] mt-0.5">Deterministic match</p>
        </div>

        <div className="p-5 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs">
          <span className="text-[11px] font-semibold text-[#C05621] uppercase tracking-wider block mb-1">
            Failed Tests
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#C05621]">
            {failedCount}
          </div>
          <p className="text-[11px] text-[#5A5A40] mt-0.5">Non-matching outcomes</p>
        </div>

        <div className="p-5 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs">
          <span className="text-[11px] font-semibold text-[#5A5A40] uppercase tracking-wider block mb-1">
            Pending / Not Run
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#5A5A40]">
            {notRunCount}
          </div>
          <p className="text-[11px] text-[#5A5A40] mt-0.5">Unexecuted</p>
        </div>

        <div className="p-5 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider block mb-1">
            Pass Rate
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#8B5A2B]">
            {executedCount > 0 ? `${passRate}%` : 'Not run'}
          </div>
          <p className="text-[11px] text-[#5A5A40] mt-0.5">{executedCount} of {totalTests} executed</p>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div className="p-4 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F5EC] border border-[#E6E1D3] rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors ${
              activeTabFilter === 'all'
                ? 'bg-[#2C3A2B] text-white shadow-xs'
                : 'text-[#5A5A40] hover:text-[#2C3A2B]'
            }`}
          >
            All Tests ({testResults.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('reference')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors ${
              activeTabFilter === 'reference'
                ? 'bg-[#2C3A2B] text-white shadow-xs'
                : 'text-[#5A5A40] hover:text-[#2C3A2B]'
            }`}
          >
            10 Reference Requests
          </button>
          <button
            onClick={() => setActiveTabFilter('edge_cases')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors ${
              activeTabFilter === 'edge_cases'
                ? 'bg-[#2C3A2B] text-white shadow-xs'
                : 'text-[#5A5A40] hover:text-[#2C3A2B]'
            }`}
          >
            10 Edge Cases
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#5A5A40]">Status filter:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl px-3 py-1.5 text-xs text-[#2C3A2B] focus:outline-hidden"
          >
            <option value="all">All Outcomes</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Test Execution Table */}
      <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs overflow-hidden">
        {displayedResults.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#5A5A40] space-y-3">
            <p>
              {testResults.length === 0
                ? 'No tests have been executed yet in this session.'
                : 'No tests match the current filter.'}
            </p>
            {testResults.length === 0 && (
              <button
                onClick={() => runTestSuite()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2C3A2B] rounded-xl shadow-xs hover:bg-[#3A4D39]"
              >
                Execute Validation Suite Now
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5F5EC]/70 border-b border-[#E6E1D3] text-[11px] font-serif font-bold text-[#2C3A2B] uppercase tracking-wider">
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
              <tbody className="divide-y divide-[#E6E1D3]/50">
                {displayedResults.map(t => (
                  <tr key={t.testId} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#5A5A40]">
                      {t.testId}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-[#2C3A2B] leading-tight">
                        {t.title}
                      </div>
                      <div className="text-[10px] text-[#8B5A2B] uppercase tracking-wider font-semibold mt-0.5">
                        {t.testType === 'reference_request' ? 'Reference Request' : 'Edge Case Rule'}
                      </div>
                      <div className="text-[11px] text-[#5A5A40] mt-1 leading-snug">
                        {t.explanation}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono tabular-nums text-[#2C3A2B]">
                      {formatINR(t.budget)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-[#5A5A40]">
                        <span className="font-semibold text-[#2C3A2B]">Exp:</span> {t.expectedResult}
                      </div>
                      <div className="text-[11px] font-semibold text-[#2C3A2B] mt-0.5">
                        <span className="font-normal text-[#5A5A40]">Act:</span> {t.actualResult}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-[#2C3A2B]">
                      {t.landedPrice > 0 ? formatINR(t.landedPrice) : '-'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                          t.compatibilityOutcome === 'Compatible'
                            ? 'bg-[#A3B18A]/25 text-[#2C3A2B] border border-[#A3B18A]/40'
                            : t.compatibilityOutcome === 'Incompatible'
                            ? 'bg-[#C05621]/15 text-[#C05621] border border-[#C05621]/30'
                            : 'bg-[#F4F1EA] text-[#5A5A40] border border-[#E6E1D3]'
                        }`}
                      >
                        {t.compatibilityOutcome}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                          t.stockOutcome === 'All In-Stock'
                            ? 'bg-[#A3B18A]/25 text-[#2C3A2B] border border-[#A3B18A]/40'
                            : 'bg-[#FEF9C3] text-[#713F12] border border-[#F4E1A1]'
                        }`}
                      >
                        {t.stockOutcome}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {t.passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#A3B18A]/25 text-[#2C3A2B] border border-[#A3B18A]/40 font-bold text-xs">
                          <Check className="w-3.5 h-3.5 text-[#2C3A2B]" />
                          PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#C05621]/15 text-[#C05621] border border-[#C05621]/30 font-bold text-xs">
                          <XCircle className="w-3.5 h-3.5 text-[#C05621]" />
                          FAIL
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => runTestSuite(t.testId)}
                        className="p-1.5 text-[#5A5A40] hover:text-[#2C3A2B] hover:bg-[#F4F1EA] rounded-lg transition-colors"
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

        <div className="p-4 border-t border-[#E6E1D3] bg-[#F5F5EC]/50 flex items-center justify-between text-xs text-[#5A5A40]">
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
