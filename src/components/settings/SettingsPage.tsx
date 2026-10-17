import React, { useState } from 'react';
import {
  Upload,
  Download,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  FileCode,
  Settings,
  Shield,
  Layers,
  Save,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import { downloadFile } from '../../utils/exportUtils';
import { FixtureData } from '../../types';

export const SettingsPage: React.FC = () => {
  const {
    fixture,
    isCustomFixture,
    loadFixtureData,
    resetFixtureToDefault,
    updateShippingRule,
    updateTaxRule
  } = useApp();

  const [jsonInput, setJsonInput] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadSuccess, setLoadSuccess] = useState<string | null>(null);

  // Local state for shipping & tax rules
  const [baseFee, setBaseFee] = useState(fixture.shippingRule.baseFee);
  const [freeThreshold, setFreeThreshold] = useState(fixture.shippingRule.freeShippingThreshold);
  const [heavySurcharge, setHeavySurcharge] = useState(fixture.shippingRule.heavyItemSurchargePerItem);
  const [heavyWeightThreshold, setHeavyWeightThreshold] = useState(fixture.shippingRule.heavyThresholdKg);
  const [taxPercent, setTaxPercent] = useState(fixture.taxRule.taxRate * 100);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const res = loadFixtureData(parsed);
        if (res.success) {
          setLoadSuccess(`Loaded fixture successfully from file "${file.name}".`);
          setLoadError(null);
        } else {
          setLoadError(res.error || 'Failed to validate fixture schema.');
          setLoadSuccess(null);
        }
      } catch (err: any) {
        setLoadError(`Malformed JSON syntax: ${err.message}`);
        setLoadSuccess(null);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonInput.trim()) return;

    try {
      const parsed = JSON.parse(jsonInput);
      const res = loadFixtureData(parsed);
      if (res.success) {
        setLoadSuccess('Loaded fixture successfully from pasted JSON text.');
        setLoadError(null);
        setJsonInput('');
      } else {
        setLoadError(res.error || 'Failed to validate fixture schema.');
        setLoadSuccess(null);
      }
    } catch (err: any) {
      setLoadError(`Malformed JSON syntax: ${err.message}`);
      setLoadSuccess(null);
    }
  };

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    updateShippingRule({
      baseFee: Number(baseFee),
      freeShippingThreshold: Number(freeThreshold),
      heavyItemSurchargePerItem: Number(heavySurcharge),
      heavyThresholdKg: Number(heavyWeightThreshold)
    });
    updateTaxRule({
      taxRate: Number(taxPercent) / 100
    });
    setLoadSuccess('Updated business rules: Landed price calculations refreshed.');
  };

  const handleDownloadActiveFixture = () => {
    downloadFile(
      JSON.stringify(fixture, null, 2),
      `c07_fixture_${isCustomFixture ? 'custom' : 'synthetic'}.json`,
      'application/json'
    );
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900">
          Fixture Integration & Rule Configuration
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Load assignment JSON files, inspect data schemas, and customize business rules.
        </p>
      </div>

      {/* Fixture Source Status Banner */}
      <div className="p-4 bg-white border border-stone-200/80 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-900">Active Source of Truth:</span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded font-semibold ${
                isCustomFixture
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {isCustomFixture ? 'Custom Imported Fixture' : 'Synthetic Preview Fixture (C07)'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {isCustomFixture
              ? `Loaded version ${fixture.version || '1.0'}: ${fixture.products.length} products and ${fixture.activity.requiredSlots.length} required slots.`
              : 'The official Starter_Data/C07/fixture.json was not present in the runtime. Running in synthetic baseline demo mode with all required business rules active.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadActiveFixture}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            Download Active JSON
          </button>
          {isCustomFixture && (
            <button
              onClick={resetFixtureToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Synthetic
            </button>
          )}
        </div>
      </div>

      {/* Notifications if any */}
      {loadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{loadSuccess}</span>
          </div>
          <button onClick={() => setLoadSuccess(null)} className="font-mono text-xs">
            Dismiss
          </button>
        </div>
      )}

      {loadError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={() => setLoadError(null)} className="font-mono text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Two-Column Setup: File Upload / Paste (Left) + Configurable Business Rules (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Import Interface */}
        <div className="space-y-4">
          <div className="p-5 bg-white border border-stone-200/80 rounded-xl shadow-2xs space-y-4">
            <div className="pb-2 border-b border-stone-100">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Fixture Ingestion
              </span>
              <h3 className="text-sm font-bold text-stone-900">
                Load Official `Starter_Data/C07/fixture.json`
              </h3>
            </div>

            {/* Option 1: File Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 block">
                Option A: Upload JSON File
              </label>
              <div className="border-2 border-dashed border-stone-200 hover:border-indigo-800 rounded-xl p-5 text-center transition-colors">
                <Upload className="w-6 h-6 text-stone-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-xs font-semibold text-indigo-900 hover:underline">
                    Browse files
                  </span>
                  <span className="text-xs text-stone-500"> or drag and drop fixture.json</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-stone-400 font-mono mt-1">
                  Expected schema: activity, products[], shippingRule, taxRule, referenceRequests[]
                </p>
              </div>
            </div>

            {/* Option 2: Paste JSON */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <label className="text-xs font-semibold text-stone-700 block">
                Option B: Paste JSON Payload
              </label>
              <form onSubmit={handlePasteSubmit} className="space-y-2">
                <textarea
                  rows={5}
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  placeholder="Paste JSON fixture contents here..."
                  className="w-full p-2.5 text-xs font-mono border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-800"
                />
                <button
                  type="submit"
                  disabled={!jsonInput.trim()}
                  className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 disabled:opacity-40 rounded-lg transition-colors shadow-2xs"
                >
                  Parse & Ingest Fixture
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Configurable Business Rules */}
        <div className="space-y-4">
          <div className="p-5 bg-white border border-stone-200/80 rounded-xl shadow-2xs space-y-4">
            <div className="pb-2 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Deterministic Parameters
                </span>
                <h3 className="text-sm font-bold text-stone-900">
                  Configurable Business Rules & Tariffs
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-400">Rule 4 & 5</span>
            </div>

            <form onSubmit={handleSaveRules} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Base Shipping Flat Fee (₹)
                </label>
                <input
                  type="number"
                  value={baseFee}
                  onChange={e => setBaseFee(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg font-mono bg-stone-50"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Charged on bundles where subtotal is below the free shipping threshold.
                </span>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Free Shipping Minimum Threshold (₹)
                </label>
                <input
                  type="number"
                  value={freeThreshold}
                  onChange={e => setFreeThreshold(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg font-mono bg-stone-50"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Subtotals at or above this amount waive the base shipping charge.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Heavy Item Surcharge (₹ / item)
                  </label>
                  <input
                    type="number"
                    value={heavySurcharge}
                    onChange={e => setHeavySurcharge(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg font-mono bg-stone-50"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Heavy Item Weight Threshold (kg)
                  </label>
                  <input
                    type="number"
                    value={heavyWeightThreshold}
                    onChange={e => setHeavyWeightThreshold(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg font-mono bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={taxPercent}
                  onChange={e => setTaxPercent(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg font-mono bg-stone-50"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Standard Goods & Services Tax (GST) calculated directly on product subtotal.
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg shadow-2xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Rule Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Schema Inspector */}
      <div className="p-5 bg-white border border-stone-200/80 rounded-xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Data Inspector
            </span>
            <h3 className="text-sm font-bold text-stone-900">
              Loaded Schema Breakdown ({fixture.activity.name})
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-500">
            {fixture.products.length} Products · {fixture.activity.requiredSlots.length} Slots · {fixture.referenceRequests.length} Reference Requests
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/60">
            <span className="font-bold text-stone-800 block mb-1">Required Slots:</span>
            <ul className="space-y-1 font-mono text-[11px] text-stone-600">
              {fixture.activity.requiredSlots.map(s => (
                <li key={s.id}>• {s.label} ({s.id})</li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/60">
            <span className="font-bold text-stone-800 block mb-1">Active Shipping Rule:</span>
            <div className="space-y-1 font-mono text-[11px] text-stone-600">
              <div>Base Fee: {formatINR(fixture.shippingRule.baseFee)}</div>
              <div>Free Threshold: {formatINR(fixture.shippingRule.freeShippingThreshold)}</div>
              <div>Heavy Surcharge: {formatINR(fixture.shippingRule.heavyItemSurchargePerItem)} (&gt;{fixture.shippingRule.heavyThresholdKg}kg)</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/60">
            <span className="font-bold text-stone-800 block mb-1">Active Tax Rule:</span>
            <div className="space-y-1 font-mono text-[11px] text-stone-600">
              <div>Tax Rate: {(fixture.taxRule.taxRate * 100).toFixed(0)}%</div>
              <div>Name: {fixture.taxRule.taxName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
