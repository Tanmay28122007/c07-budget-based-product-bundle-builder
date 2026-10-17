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
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[#2C3A2B]">
            Compare Bundles
          </h1>
          <p className="text-xs text-[#5A5A40] mt-0.5">
            Evaluate final landed prices, component tradeoffs, and compatibility across setups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              saveCurrentBundle('Workspace Snapshot');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#5A5A40]" />
            Snapshot Active Setup
          </button>
          {bundlesToCompare.length > 0 && (
            <button
              onClick={handleExportComparison}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#5A5A40]" />
              Export Comparison CSV
            </button>
          )}
        </div>
      </div>

      {/* Saved Bundles Selector Strip */}
      <div className="p-5 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-[#5A5A40] uppercase tracking-wider">
            Select Bundles to Compare (Up to 3)
          </span>
          <span className="text-xs text-[#5A5A40] font-mono">
            {selectedBundleIds.length} of 3 selected
          </span>
        </div>

        {savedBundles.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#E6E1D3] rounded-2xl bg-[#FDFBF7] text-xs text-[#5A5A40] space-y-2">
            <p>No saved bundles currently in memory.</p>
            <button
              onClick={() => {
                saveCurrentBundle('Current Setup');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#2C3A2B] bg-[#F5F5EC] border border-[#E6E1D3] rounded-xl hover:bg-[#F4F1EA]"
            >
              Save Current Workspace Setup
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {savedBundles.map(bundle => {
              const isChecked = selectedBundleIds.includes(bundle.id);
              const isValid = bundle.validation.isValid;

              return (
                <div
                  key={bundle.id}
                  onClick={() => toggleSelectBundle(bundle.id)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                    isChecked
                      ? 'border-[#2C3A2B] bg-[#F5F5EC] shadow-2xs'
                      : 'border-[#E6E1D3] bg-[#FDFBF7] hover:bg-[#F4F1EA]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-[#2C3A2B] line-clamp-1">
                        {bundle.name}
                      </span>
                      {isValid ? (
                        <span className="text-[10px] text-[#2C3A2B] bg-[#A3B18A]/25 border border-[#A3B18A]/40 px-1.5 py-0.5 rounded font-medium">Valid</span>
                      ) : (
                        <span className="text-[10px] text-[#C05621] bg-[#C05621]/10 border border-[#C05621]/20 px-1.5 py-0.5 rounded font-medium">Invalid</span>
                      )}
                    </div>
                    <div className="text-sm font-bold font-mono tabular-nums text-[#2C3A2B]">
                      {formatINR(bundle.validation.landedPrice.landedPrice)}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E6E1D3] flex items-center justify-between text-[11px]">
                    <span className="text-[#5A5A40] font-mono text-[10px]">{bundle.savedAt}</span>
                    <span className={`font-semibold ${isChecked ? 'text-[#8B5A2B]' : 'text-[#5A5A40]'}`}>
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
        <div className="p-12 text-center bg-white rounded-[24px] border border-[#E6E1D3] text-[#5A5A40] text-xs">
          Select at least one saved bundle above to inspect its landed breakdown.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Visual Landed Price Indicator Bar Chart */}
          <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-serif font-bold text-[#2C3A2B]">Final Landed Price Comparison</h3>
              <p className="text-xs text-[#5A5A40]">
                Visualizing total payable amount (Subtotal + Net Shipping + 18% GST) against budget baseline.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {bundlesToCompare.map(b => {
                const landed = b.validation.landedPrice.landedPrice;
                const percentOfMax = (landed / maxLandedPrice) * 100;
                const isBestPrice = b.validation.isValid && landed === minLandedPrice;

                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2C3A2B]">{b.name}</span>
                        {isBestPrice && (
                          <span className="text-[10px] font-semibold text-[#2C3A2B] bg-[#A3B18A]/25 px-2 py-0.5 rounded-full border border-[#A3B18A]/40">
                            Lowest Landed Cost
                          </span>
                        )}
                        {!b.validation.isValid && (
                          <span className="text-[10px] text-[#C05621] bg-[#C05621]/10 px-2 py-0.5 rounded-full border border-[#C05621]/20">
                            Violates Rules
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold tabular-nums text-[#2C3A2B]">
                        {formatINR(landed)}
                      </span>
                    </div>

                    <div className="w-full h-3 bg-[#F4F1EA] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          !b.validation.isValid
                            ? 'bg-[#C05621]'
                            : isBestPrice
                            ? 'bg-[#A3B18A]'
                            : 'bg-[#2C3A2B]'
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
          <div className="bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5F5EC]/70 border-b border-[#E6E1D3] text-[11px] font-serif font-bold text-[#2C3A2B] uppercase">
                    <th className="py-3.5 px-4 w-48">Feature / Metric</th>
                    {bundlesToCompare.map(b => (
                      <th key={b.id} className="py-3.5 px-4 min-w-[220px]">
                        <div className="text-xs font-bold text-[#2C3A2B]">{b.name}</div>
                        <div className="text-[10px] text-[#5A5A40] font-mono font-normal">
                          ID: {b.id}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D3]/50">
                  {/* Validity Status */}
                  <tr className="bg-[#FDFBF7]">
                    <td className="py-3 px-4 font-semibold text-[#2C3A2B]">Overall Validity</td>
                    {bundlesToCompare.map(b => (
                      <td key={b.id} className="py-3 px-4">
                        {b.validation.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[#2C3A2B] font-semibold text-xs">
                            <Check className="w-3.5 h-3.5 text-[#2C3A2B]" /> Valid Purchase Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#C05621] font-semibold text-xs">
                            <AlertTriangle className="w-3.5 h-3.5" /> Rule Non-Compliant
                          </span>
                        )}
                        <span className="text-[11px] text-[#5A5A40] block mt-0.5">
                          {b.validation.statusMessage}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Customer Budget */}
                  <tr>
                    <td className="py-3 px-4 text-[#5A5A40]">Customer Budget</td>
                    {bundlesToCompare.map(b => (
                      <td key={b.id} className="py-3 px-4 font-mono font-medium text-[#2C3A2B]">
                        {formatINR(b.budget)}
                      </td>
                    ))}
                  </tr>

                  {/* Product Subtotal */}
                  <tr>
                    <td className="py-3 px-4 text-[#5A5A40]">Product Subtotal</td>
                    {bundlesToCompare.map(b => (
                      <td key={b.id} className="py-3 px-4 font-mono font-medium text-[#2C3A2B]">
                        {formatINR(b.validation.landedPrice.productSubtotal)}
                      </td>
                    ))}
                  </tr>

                  {/* Shipping Fee */}
                  <tr>
                    <td className="py-3 px-4 text-[#5A5A40]">Net Shipping</td>
                    {bundlesToCompare.map(b => (
                      <td key={b.id} className="py-3 px-4 font-mono text-[#2C3A2B]">
                        {formatINR(b.validation.landedPrice.netShipping)}
                        {b.validation.landedPrice.shippingDiscount > 0 && (
                          <span className="text-[10px] text-[#2C3A2B] bg-[#A3B18A]/25 border border-[#A3B18A]/40 px-1.5 py-0.5 rounded ml-1.5 font-sans font-medium">
                            Free Shipping Tier
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Taxes */}
                  <tr>
                    <td className="py-3 px-4 text-[#5A5A40]">Taxes (18% GST)</td>
                    {bundlesToCompare.map(b => (
                      <td key={b.id} className="py-3 px-4 font-mono text-[#2C3A2B]">
                        {formatINR(b.validation.landedPrice.taxAmount)}
                      </td>
                    ))}
                  </tr>

                  {/* Final Landed Price */}
                  <tr className="bg-[#F5F5EC]/60 font-bold">
                    <td className="py-3.5 px-4 text-[#2C3A2B]">Final Landed Price</td>
                    {bundlesToCompare.map(b => {
                      const isBest = b.validation.isValid && b.validation.landedPrice.landedPrice === minLandedPrice;
                      return (
                        <td
                          key={b.id}
                          className={`py-3.5 px-4 font-mono text-sm ${
                            isBest ? 'text-[#2C3A2B]' : 'text-[#2C3A2B]'
                          }`}
                        >
                          {formatINR(b.validation.landedPrice.landedPrice)}
                          {isBest && (
                            <span className="block text-[10px] text-[#8B5A2B] font-sans font-semibold">
                              Best Value Choice
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Remaining Budget Buffer */}
                  <tr>
                    <td className="py-3 px-4 text-[#5A5A40]">Remaining Budget Buffer</td>
                    {bundlesToCompare.map(b => (
                      <td
                        key={b.id}
                        className={`py-3 px-4 font-mono font-medium ${
                          b.validation.landedPrice.isOverBudget
                            ? 'text-[#C05621]'
                            : 'text-[#2C3A2B]'
                        }`}
                      >
                        {formatINR(b.validation.landedPrice.remainingBudget)}
                      </td>
                    ))}
                  </tr>

                  {/* Required Slots Breakdown */}
                  {fixture.activity.requiredSlots.map(slot => (
                    <tr key={slot.id}>
                      <td className="py-3 px-4 text-[#5A5A40] font-medium">
                        {slot.label} ({slot.category})
                      </td>
                      {bundlesToCompare.map(b => {
                        const item = b.items[slot.id];
                        return (
                          <td key={b.id} className="py-3 px-4">
                            {item ? (
                              <div>
                                <span className="font-semibold text-[#2C3A2B] block line-clamp-1">
                                  {item.name}
                                </span>
                                <span className="text-[11px] font-mono text-[#5A5A40]">
                                  {formatINR(item.price)} · {item.id}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#5A5A40]/60 italic">Empty Slot</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Action Row */}
                  <tr className="bg-[#F5F5EC]/40">
                    <td className="py-3.5 px-4 text-[#2C3A2B] font-semibold">Workspace Action</td>
                    {bundlesToCompare.map(b => (
                      <td key={b.id} className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadSavedBundle(b)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] shadow-2xs"
                          >
                            Load Into Builder
                          </button>
                          <button
                            onClick={() => deleteSavedBundle(b.id)}
                            className="p-1.5 text-[#5A5A40] hover:text-[#C05621] rounded-lg hover:bg-[#F4F1EA]"
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
