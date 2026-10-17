import React, { useState } from 'react';
import {
  Columns,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Trash2,
  Check,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import { SavedBundle } from '../../types';
import { exportBundleToCSV, downloadFile } from '../../utils/exportUtils';

export const CompareBundlesPage: React.FC = () => {
  const {
    savedBundles,
    currentItems,
    validation,
    budget,
    fixture,
    loadSavedBundle,
    deleteSavedBundle,
    saveCurrentBundle,
    setActiveTab
  } = useApp();

  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>(() => {
    return savedBundles.slice(0, 3).map(b => b.id);
  });

  const toggleSelectBundle = (id: string) => {
    setSelectedBundleIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        if (prev.length >= 3) {
          return [...prev.slice(1), id];
        }
        return [...prev, id];
      }
    });
  };

  const bundlesToCompare = savedBundles.filter(b => selectedBundleIds.includes(b.id));

  // Find minimum landed price among compared bundles to highlight the best deal
  const validCompared = bundlesToCompare.filter(b => b.validation.isValid);
  const minLandedPrice = validCompared.length > 0
    ? Math.min(...validCompared.map(b => b.validation.landedPrice.landedPrice))
    : 0;

  // Max price for bar chart scale
  const maxLandedPrice = Math.max(
    ...bundlesToCompare.map(b => b.validation.landedPrice.landedPrice),
    budget,
    1
  );

  const handleExportComparison = () => {
    if (bundlesToCompare.length === 0) return;
    const lines = [
      'Bundle Comparison Export',
      `Activity,${fixture.activity.name}`,
      `Generated,${new Date().toLocaleString()}`,
      '',
      'Metric,' + bundlesToCompare.map(b => `"${b.name}"`).join(','),
      'Bundle ID,' + bundlesToCompare.map(b => b.id).join(','),
      'Validity Status,' + bundlesToCompare.map(b => b.validation.isValid ? 'VALID' : 'INVALID').join(','),
      'Customer Budget (INR),' + bundlesToCompare.map(b => b.budget).join(','),
      'Product Subtotal (INR),' + bundlesToCompare.map(b => b.validation.landedPrice.productSubtotal).join(','),
      'Net Shipping (INR),' + bundlesToCompare.map(b => b.validation.landedPrice.netShipping).join(','),
      'Taxes (18% GST INR),' + bundlesToCompare.map(b => b.validation.landedPrice.taxAmount).join(','),
      'Final Landed Price (INR),' + bundlesToCompare.map(b => b.validation.landedPrice.landedPrice).join(','),
      'Remaining Budget (INR),' + bundlesToCompare.map(b => b.validation.landedPrice.remainingBudget).join(','),
      'Slots Filled,' + bundlesToCompare.map(b => `${b.validation.filledSlotCount}/${b.validation.totalSlotCount}`).join(','),
      'Compatibility,' + bundlesToCompare.map(b => b.validation.isCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE').join(',')
    ];
    downloadFile(lines.join('\n'), `bundle_comparison_${Date.now()}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900">
            Compare Bundles
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Evaluate final landed prices, component tradeoffs, and compatibility across setups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              saveCurrentBundle('Workspace Snapshot');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-2xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-stone-500" />
            Snapshot Active Setup
          </button>
          {bundlesToCompare.length > 0 && (
            <button
              onClick={handleExportComparison}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-stone-500" />
              Export Comparison CSV
            </button>
          )}
        </div>
      </div>

      {/* Saved Bundles Selector Strip */}
      <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Select Bundles to Compare (Up to 3)
          </span>
          <span className="text-xs text-stone-400 font-mono">
            {selectedBundleIds.length} of 3 selected
          </span>
        </div>

        {savedBundles.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-stone-200 rounded-lg text-xs text-stone-400 space-y-2">
            <p>No saved bundles currently in memory.</p>
            <button
              onClick={() => {
                saveCurrentBundle('Current Setup');
              }}
              className="px-3 py-1 text-xs font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
            >
              Save Current Workspace Setup
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {savedBundles.map(bundle => {
              const isChecked = selectedBundleIds.includes(bundle.id);
              const isValid = bundle.validation.isValid;

              return (
                <div
                  key={bundle.id}
                  onClick={() => toggleSelectBundle(bundle.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                    isChecked
                      ? 'border-indigo-800 bg-indigo-50/30 shadow-2xs'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-stone-900 line-clamp-1">
                        {bundle.name}
                      </span>
                      {isValid ? (
                        <span className="text-[10px] text-emerald-700 font-medium">Valid</span>
                      ) : (
                        <span className="text-[10px] text-rose-700 font-medium">Invalid</span>
                      )}
                    </div>
                    <div className="text-sm font-bold font-mono tabular-nums text-stone-800">
                      {formatINR(bundle.validation.landedPrice.landedPrice)}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-200/50 flex items-center justify-between text-[11px]">
                    <span className="text-stone-400 font-mono text-[10px]">{bundle.savedAt}</span>
                    <span className={`font-semibold ${isChecked ? 'text-indigo-900' : 'text-stone-500'}`}>
                      {isChecked ? 'Comparing' : 'Click to compare'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Grid & Visual Price Chart */}
      {bundlesToCompare.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-stone-200/80 text-stone-400 text-xs">
          Select at least one saved bundle above to inspect its landed breakdown.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Visual Landed Price Indicator Bar Chart */}
          <div className="p-5 bg-white border border-stone-200/80 rounded-xl shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Final Landed Price Comparison</h3>
              <p className="text-xs text-stone-500">
                Visualizing total payable amount (Subtotal + Net Shipping + 18% GST) against budget baseline.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {bundlesToCompare.map(b => {
                const landed = b.validation.landedPrice.landedPrice;
                const percentOfMax = (landed / maxLandedPrice) * 100;
                const isBestPrice = b.validation.isValid && landed === minLandedPrice;

                return (
                  <div key={b.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900">{b.name}</span>
                        {isBestPrice && (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Lowest Landed Cost
                          </span>
                        )}
                        {!b.validation.isValid && (
                          <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                            Violates Rules
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold tabular-nums text-stone-900">
                        {formatINR(landed)}
                      </span>
                    </div>

                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          !b.validation.isValid
                            ? 'bg-rose-400'
                            : isBestPrice
                            ? 'bg-emerald-600'
                            : 'bg-indigo-800'
                        }`}
                        style={{ width: `${Math.min(percentOfMax, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Side-by-Side Comparison Matrix */}
          <div className="bg-white border border-stone-200/80 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-600 uppercase">
                    <th className="py-3 px-4 w-48">Feature / Metric</th>
                    {bundlesToCompare.map(b => (
                      <th key={b.id} className="py-3 px-4 min-w-[220px]">
                        <div className="text-xs font-bold text-stone-900">{b.name}</div>
                        <div className="text-[10px] text-stone-400 font-mono font-normal">
                          ID: {b.id}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {/* Validity Status */}
                  <tr className="bg-stone-50/30">
                    <td className="py-3 px-4 font-semibold text-stone-700">Overall Validity</td>
                    {bundlesToCompare.map(b => (
                      <td key={b.id} className="py-3 px-4">
                        {b.validation.isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold text-xs">
                            <Check className="w-3.5 h-3.5" /> Valid Purchase Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-xs">
                            <AlertTriangle className="w-3.5 h-3.5" /> Rule Non-Compliant
                          </span>
                        )}
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          {b.validation.statusMessage}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Customer Budget */}
                  <tr>
                    <td className="py-3 px-4 text-stone-600">Customer Budget</td>
                    {bundlesToCompare.map(b => (
                      <td key={b.id} className="py-3 px-4 font-mono font-medium text-stone-900">
                        {formatINR(b.budget)}
                      </td>
                    ))}
                  </tr>

                  {/* Product Subtotal */}
                  <tr>
                    <td className="py-3 px-4 text-stone-600">Product Subtotal</td>
                    {bundlesToCompare.map(b => (
                      <td key={b.id} className="py-3 px-4 font-mono font-medium text-stone-800">
                        {formatINR(b.validation.landedPrice.productSubtotal)}
                      </td>
                    ))}
                  </tr>

                  {/* Shipping Fee */}
                  <tr>
                    <td className="py-3 px-4 text-stone-600">Net Shipping</td>
                    {bundlesToCompare.map(b => (
                      <td key={b.id} className="py-3 px-4 font-mono text-stone-700">
                        {formatINR(b.validation.landedPrice.netShipping)}
                        {b.validation.landedPrice.shippingDiscount > 0 && (
                          <span className="text-[10px] text-emerald-700 ml-1.5 font-sans font-medium">
                            (Free Shipping Tier)
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Taxes */}
                  <tr>
                    <td className="py-3 px-4 text-stone-600">Taxes (18% GST)</td>
                    {bundlesToCompare.map(b => (
                      <td key={b.id} className="py-3 px-4 font-mono text-stone-700">
                        {formatINR(b.validation.landedPrice.taxAmount)}
                      </td>
                    ))}
                  </tr>

                  {/* Final Landed Price */}
                  <tr className="bg-stone-50/60 font-bold">
                    <td className="py-3.5 px-4 text-stone-900">Final Landed Price</td>
                    {bundlesToCompare.map(b => {
                      const isBest = b.validation.isValid && b.validation.landedPrice.landedPrice === minLandedPrice;
                      return (
                        <td
                          key={b.id}
                          className={`py-3.5 px-4 font-mono text-sm ${
                            isBest ? 'text-emerald-800' : 'text-stone-900'
                          }`}
                        >
                          {formatINR(b.validation.landedPrice.landedPrice)}
                          {isBest && (
                            <span className="block text-[10px] text-emerald-700 font-sans font-semibold">
                              Best Value Choice
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Remaining Budget Buffer */}
                  <tr>
                    <td className="py-3 px-4 text-stone-600">Remaining Budget Buffer</td>
                    {bundlesToCompare.map(b => (
                      <td
                        key={b.id}
                        className={`py-3 px-4 font-mono font-medium ${
                          b.validation.landedPrice.isOverBudget
                            ? 'text-rose-600'
                            : 'text-stone-800'
                        }`}
                      >
                        {formatINR(b.validation.landedPrice.remainingBudget)}
                      </td>
                    ))}
                  </tr>

                  {/* Required Slots Breakdown */}
                  {fixture.activity.requiredSlots.map(slot => (
                    <tr key={slot.id}>
                      <td className="py-3 px-4 text-stone-500 font-medium">
                        {slot.label} ({slot.category})
                      </td>
                      {bundlesToCompare.map(b => {
                        const item = b.items[slot.id];
                        return (
                          <td key={b.id} className="py-3 px-4">
                            {item ? (
                              <div>
                                <span className="font-semibold text-stone-900 block line-clamp-1">
                                  {item.name}
                                </span>
                                <span className="text-[11px] font-mono text-stone-500">
                                  {formatINR(item.price)} · {item.id}
                                </span>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">Empty Slot</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Action Row */}
                  <tr className="bg-stone-50/50">
                    <td className="py-3 px-4 text-stone-600 font-semibold">Workspace Action</td>
                    {bundlesToCompare.map(b => (
                      <td key={b.id} className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadSavedBundle(b)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 shadow-2xs"
                          >
                            Load Into Builder
                          </button>
                          <button
                            onClick={() => deleteSavedBundle(b.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100"
                            title="Delete this record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
