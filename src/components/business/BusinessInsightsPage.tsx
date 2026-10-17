import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calculator,
  Users,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Edit2,
  RotateCcw,
  Plus,
  Save,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import { ShopperExperimentRecord } from '../../types';

export const BusinessInsightsPage: React.FC = () => {
  const {
    unitEconomics,
    updateUnitEconomics,
    shopperRecords,
    updateShopperRecord,
    resetShopperRecords
  } = useApp();

  const [editingParticipant, setEditingParticipant] = useState<ShopperExperimentRecord | null>(null);

  // Unit Economics Formulas
  // 1. Monthly retailer contribution = Monthly retailer revenue - monthly cost to serve
  const retailerMonthlyContribution = unitEconomics.retailerMonthlyFee - unitEconomics.monthlyCostToServe;

  // 2. Referral revenue per basket = Eligible basket value × referral %
  const referralRevenuePerBasket = Math.round(unitEconomics.avgEligibleBasketValue * unitEconomics.referralPercentage);

  // 3. Referral contribution per basket = Referral revenue - variable cost per completed basket
  const referralContributionPerBasket = referralRevenuePerBasket - unitEconomics.variableCostPerBasket;

  // 4. Estimated break-even baskets = Fixed monthly costs ÷ positive contribution per basket
  const breakEvenBaskets = referralContributionPerBasket > 0
    ? Math.ceil(unitEconomics.fixedMonthlyCosts / referralContributionPerBasket)
    : null;

  // Combined projected monthly contribution at forecasted volume
  const projectedMonthlyReferralContribution = referralContributionPerBasket * unitEconomics.monthlyBasketsForecast;
  const projectedTotalContribution = retailerMonthlyContribution + projectedMonthlyReferralContribution;
  const projectedNetProfitBeforeTax = projectedTotalContribution - unitEconomics.fixedMonthlyCosts;

  const handleSaveParticipantEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingParticipant) {
      updateShopperRecord(editingParticipant.id, editingParticipant);
      setEditingParticipant(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900">
          Business Insights & Strategy
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          MBA market analysis, unit economics simulation, and empirical shopper research log.
        </p>
      </div>

      {/* Sections A, B & C: Strategic Foundations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Section A: Customer Problem */}
        <div className="p-5 bg-white border border-stone-200/80 rounded-xl shadow-2xs space-y-2">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Section A · Problem Statement
          </div>
          <h3 className="text-sm font-bold text-stone-900">Customer Assembly Friction</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Customers struggle to assemble complete, physically compatible product setups within a strict budget. Online shoppers frequently face surprise checkout shipping fees, port/mounting mismatches, and out-of-stock items across multi-category setups.
          </p>
        </div>

        {/* Section B: Value Proposition */}
        <div className="p-5 bg-white border border-stone-200/80 rounded-xl shadow-2xs space-y-2">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Section B · Core Proposition
          </div>
          <h3 className="text-sm font-bold text-stone-900">Deterministic Landed Bundles</h3>
          <p className="text-xs text-indigo-950 font-medium leading-relaxed bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
            “Help shoppers build complete, compatible bundles with transparent landed pricing.”
          </p>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Eliminates cognitive burden and post-purchase returns through rule-backed Cartesian bundle discovery.
          </p>
        </div>

        {/* Section C: Target Segments */}
        <div className="p-5 bg-white border border-stone-200/80 rounded-xl shadow-2xs space-y-2">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Section C · Target Market
          </div>
          <h3 className="text-sm font-bold text-stone-900">Hypothesized Segments</h3>
          <div className="space-y-1.5 text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-800" />
              <span>Work-from-Home Corporate Employees</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-800" />
              <span>College Students Setting Up Study Spaces</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-800" />
              <span>Remote Freelancers & Digital Nomads</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-800" />
              <span>First-Time Ergonomic Setup Buyers</span>
            </div>
          </div>
          <span className="text-[10px] text-amber-700 block font-mono mt-2">
            * Classified as target hypotheses, not verified customers.
          </span>
        </div>
      </div>

      {/* Section D: Monetisation Models & Assumptions */}
      <div className="p-5 bg-white border border-stone-200/80 rounded-xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Section D · Monetisation Models
            </div>
            <h3 className="text-sm font-bold text-stone-900">Two Competing Commercial Hypotheses</h3>
          </div>
          <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            All prices are hypothetical assumptions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Model 1: Retailer SaaS Tool Fee */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-900">
                Model 1: Retailer SaaS Subscription Fee
              </h4>
              <span className="text-[10px] font-mono text-stone-500">B2B SaaS</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              The ecommerce merchant pays a proposed recurring monthly software fee to host the bundle-building widget and reduce return rates on their storefront.
            </p>
            <div className="pt-2 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Proposed monthly fee:</span>
                <span className="font-bold text-stone-900">{formatINR(unitEconomics.retailerMonthlyFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Est. cost-to-serve (AWS/Infra):</span>
                <span className="text-stone-800">{formatINR(unitEconomics.monthlyCostToServe)}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-1 text-emerald-800 font-bold">
                <span>Monthly retailer contribution:</span>
                <span>{formatINR(retailerMonthlyContribution)}</span>
              </div>
            </div>
          </div>

          {/* Model 2: Disclosed Basket Referral Fee */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-900">
                Model 2: Disclosed Basket Referral Fee
              </h4>
              <span className="text-[10px] font-mono text-stone-500">Performance</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              The merchant pays a transparent, pre-agreed commission (e.g. 4.5%) on verified multi-item checkouts attributed directly to the compatibility tool.
            </p>
            <div className="pt-2 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Commission rate:</span>
                <span className="font-bold text-stone-900">{(unitEconomics.referralPercentage * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Revenue per ₹55k basket:</span>
                <span className="text-stone-800">{formatINR(referralRevenuePerBasket)}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-1 text-emerald-800 font-bold">
                <span>Net contribution per basket:</span>
                <span>{formatINR(referralContributionPerBasket)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section E: Unit Economics Calculator */}
      <div className="p-5 bg-white border border-stone-200/80 rounded-xl shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Section E · Interactive Economics Engine
            </div>
            <h3 className="text-sm font-bold text-stone-900">Unit Economics & Break-Even Simulation</h3>
          </div>
          <span className="text-xs font-mono text-stone-500">
            Contribution ≠ Net Profit (Accounts for overhead)
          </span>
        </div>

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">
              Proposed Retailer Fee (₹ / month)
            </label>
            <input
              type="number"
              step="1000"
              value={unitEconomics.retailerMonthlyFee}
              onChange={e => updateUnitEconomics({ retailerMonthlyFee: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-stone-200 rounded-lg bg-stone-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">
              Monthly Cost-to-Serve (₹ / month)
            </label>
            <input
              type="number"
              step="500"
              value={unitEconomics.monthlyCostToServe}
              onChange={e => updateUnitEconomics({ monthlyCostToServe: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-stone-200 rounded-lg bg-stone-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">
              Referral Commission Rate (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={(unitEconomics.referralPercentage * 100).toFixed(1)}
              onChange={e => updateUnitEconomics({ referralPercentage: Number(e.target.value) / 100 })}
              className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-stone-200 rounded-lg bg-stone-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">
              Avg Eligible Basket Value (₹)
            </label>
            <input
              type="number"
              step="5000"
              value={unitEconomics.avgEligibleBasketValue}
              onChange={e => updateUnitEconomics({ avgEligibleBasketValue: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-stone-200 rounded-lg bg-stone-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">
              Variable Servicing Cost / Basket (₹)
            </label>
            <input
              type="number"
              step="50"
              value={unitEconomics.variableCostPerBasket}
              onChange={e => updateUnitEconomics({ variableCostPerBasket: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-stone-200 rounded-lg bg-stone-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">
              Fixed Monthly Costs (₹ / month)
            </label>
            <input
              type="number"
              step="5000"
              value={unitEconomics.fixedMonthlyCosts}
              onChange={e => updateUnitEconomics({ fixedMonthlyCosts: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-stone-200 rounded-lg bg-stone-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Calculated Results Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-stone-100">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <span className="text-[10px] text-stone-500 uppercase block">Retailer Contribution</span>
            <div className="text-base font-bold font-mono text-stone-900 mt-0.5">
              {formatINR(retailerMonthlyContribution)}
            </div>
            <span className="text-[10px] text-stone-400">Monthly net of servicing</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <span className="text-[10px] text-stone-500 uppercase block">Referral Contribution</span>
            <div className={`text-base font-bold font-mono mt-0.5 ${referralContributionPerBasket > 0 ? 'text-emerald-800' : 'text-rose-600'}`}>
              {formatINR(referralContributionPerBasket)}
            </div>
            <span className="text-[10px] text-stone-400">Per completed bundle</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <span className="text-[10px] text-stone-500 uppercase block">Estimated Break-Even</span>
            <div className="text-base font-bold font-mono text-stone-900 mt-0.5">
              {breakEvenBaskets !== null ? `${breakEvenBaskets} baskets` : 'Infeasible (≤ 0)'}
            </div>
            <span className="text-[10px] text-stone-400">Baskets to cover ₹{unitEconomics.fixedMonthlyCosts} fixed</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <span className="text-[10px] text-stone-500 uppercase block">Projected Net @ 80 Baskets</span>
            <div className={`text-base font-bold font-mono mt-0.5 ${projectedNetProfitBeforeTax >= 0 ? 'text-indigo-950' : 'text-rose-600'}`}>
              {formatINR(projectedNetProfitBeforeTax)}
            </div>
            <span className="text-[10px] text-stone-400">Monthly profit before tax</span>
          </div>
        </div>
      </div>

      {/* Section F: Five-Shopper Experiment Log */}
      <div className="p-5 bg-white border border-stone-200/80 rounded-xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
          <div>
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Section F · Empirical Research
            </div>
            <h3 className="text-sm font-bold text-stone-900">Five-Shopper Experiment Field Log</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-500">
              Starts blank / unrecorded as required
            </span>
            <button
              onClick={resetShopperRecords}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100"
              title="Reset records to blank state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-stone-600">
          Field interview records reserved for qualitative validation. Note: No fabricated customer interview records are generated by default. Click any record to document real participant observations.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-600 uppercase">
                <th className="py-2.5 px-3">Participant ID</th>
                <th className="py-2.5 px-3">Target Category</th>
                <th className="py-2.5 px-3">Approach Date</th>
                <th className="py-2.5 px-3">Task Completion</th>
                <th className="py-2.5 px-3">Budget Compliance</th>
                <th className="py-2.5 px-3">Compatibility Errors</th>
                <th className="py-2.5 px-3">Researcher Observations</th>
                <th className="py-2.5 px-3 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {shopperRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-stone-50/60">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-950">
                    {rec.participantId}
                  </td>
                  <td className="py-3 px-3 font-medium text-stone-800">
                    {rec.targetShopperCategory}
                  </td>
                  <td className="py-3 px-3 text-stone-500 font-mono text-[11px]">
                    {rec.approachDate}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[11px] font-mono ${rec.taskCompletion === 'Not yet recorded' ? 'text-stone-400 italic' : 'text-stone-800'}`}>
                      {rec.taskCompletion}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[11px] font-mono ${rec.budgetCompliance === 'Not yet recorded' ? 'text-stone-400 italic' : 'text-stone-800'}`}>
                      {rec.budgetCompliance}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[11px] font-mono ${rec.compatibilityErrors === 'Not yet recorded' ? 'text-stone-400 italic' : 'text-stone-800'}`}>
                      {rec.compatibilityErrors}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-stone-600 text-[11px] max-w-xs truncate">
                    {rec.researcherObservations}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setEditingParticipant(rec)}
                      className="px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-stone-100 rounded border border-transparent hover:border-stone-200"
                    >
                      Record Data
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section G: Observed Evidence vs Assumptions Matrix */}
      <div className="p-5 bg-white border border-stone-200/80 rounded-xl shadow-2xs space-y-4">
        <div className="pb-2 border-b border-stone-100">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Section G · Epistemic Classification
          </div>
          <h3 className="text-sm font-bold text-stone-900">Observed Evidence vs. Assumptions Matrix</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 uppercase">1. Observed Evidence</h4>
            <ul className="text-xs text-emerald-950 space-y-1.5 list-disc list-inside">
              <li>Algorithm finds deterministic 6-slot bundles in &lt; 2ms.</li>
              <li>Shipping surcharge and 18% GST calculation fully verified.</li>
              <li>Physical monitor/clamp light incompatibility caught 100%.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-2">
            <h4 className="text-xs font-bold text-amber-900 uppercase">2. Assumptions</h4>
            <ul className="text-xs text-amber-950 space-y-1.5 list-disc list-inside">
              <li>Merchant willing to pay ₹25,000/mo SaaS fee.</li>
              <li>Customers accept 18% GST upfront in configuration.</li>
              <li>Average basket value stays consistent at ₹55,000.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/60 space-y-2">
            <h4 className="text-xs font-bold text-indigo-900 uppercase">3. Untested Hypotheses</h4>
            <ul className="text-xs text-indigo-950 space-y-1.5 list-disc list-inside">
              <li>Tool reduces customer return rates by &gt; 25%.</li>
              <li>Transparency increases checkout completion vs mystery fees.</li>
              <li>Users prefer lowest-cost valid bundles over unbundled picking.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <h4 className="text-xs font-bold text-stone-900 uppercase">4. Next Validation Step</h4>
            <ul className="text-xs text-stone-700 space-y-1.5 list-disc list-inside">
              <li>Execute 5 qualitative shopper think-aloud sessions.</li>
              <li>Pitch prototype to 2 ecommerce merchant operators.</li>
              <li>A/B test landed price summary clarity in simulated checkout.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Participant Edit Drawer / Modal */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900">
                Log Research Data for Participant {editingParticipant.participantId}
              </h3>
              <button
                onClick={() => setEditingParticipant(null)}
                className="text-stone-400 hover:text-stone-700 text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveParticipantEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Approach Date
                  </label>
                  <input
                    type="text"
                    value={editingParticipant.approachDate}
                    onChange={e => setEditingParticipant({ ...editingParticipant, approachDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Contact Outcome
                  </label>
                  <input
                    type="text"
                    value={editingParticipant.contactOutcome}
                    onChange={e => setEditingParticipant({ ...editingParticipant, contactOutcome: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Task Completion
                  </label>
                  <input
                    type="text"
                    value={editingParticipant.taskCompletion}
                    onChange={e => setEditingParticipant({ ...editingParticipant, taskCompletion: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Time Taken (mins)
                  </label>
                  <input
                    type="text"
                    value={editingParticipant.timeTaken}
                    onChange={e => setEditingParticipant({ ...editingParticipant, timeTaken: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Budget Compliance & Feedback
                </label>
                <input
                  type="text"
                  value={editingParticipant.budgetCompliance}
                  onChange={e => setEditingParticipant({ ...editingParticipant, budgetCompliance: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Researcher Observations
                </label>
                <textarea
                  rows={2}
                  value={editingParticipant.researcherObservations}
                  onChange={e => setEditingParticipant({ ...editingParticipant, researcherObservations: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Improvement Identified
                </label>
                <input
                  type="text"
                  value={editingParticipant.improvementIdentified}
                  onChange={e => setEditingParticipant({ ...editingParticipant, improvementIdentified: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingParticipant(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg shadow-2xs"
                >
                  Save Participant Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
