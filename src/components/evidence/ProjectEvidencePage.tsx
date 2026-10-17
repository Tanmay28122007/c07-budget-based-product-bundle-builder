import React, { useState } from 'react';
import {
  FileCode2,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProjectEvidenceRecord } from '../../types';

export const ProjectEvidencePage: React.FC = () => {
  const {
    evidenceRecords,
    updateEvidenceRecord,
    addEvidenceRecord,
    deleteEvidenceRecord,
    negotiatedScope,
    updateNegotiatedScope
  } = useApp();

  const [isEditingScope, setIsEditingScope] = useState(false);
  const [scopeForm, setScopeForm] = useState(negotiatedScope);
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [newEvidence, setNewEvidence] = useState<Omit<ProjectEvidenceRecord, 'id'>>({
    evidenceId: `EVD-C07-00${evidenceRecords.length + 1}`,
    featureTested: '',
    testProcedure: '',
    expectedOutcome: '',
    actualOutcome: '',
    status: 'Verified',
    referenceFile: 'src/utils/',
    notes: ''
  });

  const handleScopeSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNegotiatedScope(scopeForm);
    setIsEditingScope(false);
  };

  const handleAddEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidence.featureTested || !newEvidence.testProcedure) return;
    addEvidenceRecord(newEvidence);
    setShowAddEvidence(false);
    setNewEvidence({
      evidenceId: `EVD-C07-00${evidenceRecords.length + 2}`,
      featureTested: '',
      testProcedure: '',
      expectedOutcome: '',
      actualOutcome: '',
      status: 'Verified',
      referenceFile: 'src/utils/',
      notes: ''
    });
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-serif font-bold tracking-tight text-[#2C3A2B]">
          Project Engineering Evidence & Scope Audit
        </h1>
        <p className="text-xs text-[#5A5A40] mt-0.5">
          Academic engineering change documentation, contractual boundaries, and verified test procedures.
        </p>
      </div>

      {/* Section A & B: Starting State vs Requested Change */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* A. Starting State */}
        <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider">
              A · Baseline Starting State
            </span>
            <span className="text-[10px] font-mono text-[#5A5A40] bg-[#F5F5EC] border border-[#E6E1D3] px-2.5 py-0.5 rounded-full">
              v0.1 Prototype
            </span>
          </div>

          <h3 className="text-base font-serif font-bold text-[#2C3A2B]">Initial Prototype Capabilities & Limits</h3>

          <div className="space-y-2 text-xs text-[#5A5A40]">
            <div>
              <span className="font-semibold text-[#2C3A2B]">Initial Capabilities:</span>
              <ul className="list-disc list-inside mt-1 space-y-1 pl-1">
                <li>Simple manual item selector across arbitrary categories.</li>
                <li>Basic product price summation (subtotal only).</li>
                <li>Static product list without structured constraint checks.</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-[#E6E1D3]">
              <span className="font-semibold text-[#C05621]">Identified Limitations:</span>
              <ul className="list-disc list-inside mt-1 space-y-1 pl-1 text-[#C05621]">
                <li>Zero compatibility checking (allowed curved monitors with screenbars, wide chairs with narrow desks).</li>
                <li>Omitted shipping charges and GST (surprise charges at checkout).</li>
                <li>No automated optimization or budget feasibility search.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* B. Requested Change */}
        <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider">
              B · Architectural Additions
            </span>
            <span className="text-[10px] font-mono text-[#2C3A2B] bg-[#A3B18A]/25 px-2.5 py-0.5 rounded-full border border-[#A3B18A]/40">
              C07 Specification
            </span>
          </div>

          <h3 className="text-base font-serif font-bold text-[#2C3A2B]">Delivered Architectural Enhancements</h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#F5F5EC] rounded-2xl border border-[#E6E1D3] space-y-1">
              <span className="font-bold text-[#2C3A2B] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#2C3A2B]" />
                1. Real-time Compatibility Validation Engine
              </span>
              <p className="text-[#5A5A40] leading-relaxed text-[11px]">
                Validates desk overhang, armrest clearance, optical clamp bezel fit, and explicit port connections deterministically on every slot alteration.
              </p>
            </div>

            <div className="p-3.5 bg-[#A3B18A]/15 rounded-2xl border border-[#A3B18A]/40 space-y-1">
              <span className="font-bold text-[#2C3A2B] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#2C3A2B]" />
                2. Transparent Landed-Price Comparison
              </span>
              <p className="text-[#5A5A40] leading-relaxed text-[11px]">
                Integrates weight-based heavy shipping fees, free shipping thresholds, and 18% GST with side-by-side multi-bundle comparison.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section C: Negotiated Scope */}
      <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D3]">
          <div>
            <span className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider block">
              Section C · Contractual Agreement
            </span>
            <h3 className="text-base font-serif font-bold text-[#2C3A2B]">Negotiated Scope & Acceptance Criteria</h3>
          </div>

          <button
            onClick={() => {
              setScopeForm(negotiatedScope);
              setIsEditingScope(prev => !prev);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#2C3A2B] bg-[#F5F5EC] hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#5A5A40]" />
            {isEditingScope ? 'Cancel' : 'Edit Scope Terms'}
          </button>
        </div>

        {isEditingScope ? (
          <form onSubmit={handleScopeSave} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-[#2C3A2B] block mb-1">
                Stakeholder / Source of Request
              </label>
              <input
                type="text"
                value={scopeForm.stakeholder}
                onChange={e => setScopeForm({ ...scopeForm, stakeholder: e.target.value })}
                className="w-full px-3 py-2 border border-[#E6E1D3] rounded-xl bg-[#FDFBF7] text-[#2C3A2B]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#2C3A2B] block mb-1">
                  Agreed In-Scope Items
                </label>
                <textarea
                  rows={3}
                  value={scopeForm.agreedScope}
                  onChange={e => setScopeForm({ ...scopeForm, agreedScope: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E6E1D3] rounded-xl bg-[#FDFBF7] font-mono text-[11px] text-[#2C3A2B]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#2C3A2B] block mb-1">
                  Explicitly Out-of-Scope Items
                </label>
                <textarea
                  rows={3}
                  value={scopeForm.outOfScope}
                  onChange={e => setScopeForm({ ...scopeForm, outOfScope: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E6E1D3] rounded-xl bg-[#FDFBF7] font-mono text-[11px] text-[#2C3A2B]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#2C3A2B] block mb-1">
                Formal Acceptance Criteria
              </label>
              <textarea
                rows={2}
                value={scopeForm.acceptanceCriteria}
                onChange={e => setScopeForm({ ...scopeForm, acceptanceCriteria: e.target.value })}
                className="w-full px-3 py-2 border border-[#E6E1D3] rounded-xl bg-[#FDFBF7] font-mono text-[11px] text-[#2C3A2B]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingScope(false)}
                className="px-3.5 py-2 text-xs text-[#5A5A40] hover:bg-[#F4F1EA] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl shadow-xs"
              >
                Save Scope Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-[#5A5A40] uppercase font-semibold block">Stakeholder / Source:</span>
                <span className="font-medium text-[#2C3A2B]">{negotiatedScope.stakeholder}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#5A5A40] uppercase font-semibold block">Date of Agreement:</span>
                <span className="font-mono text-[#5A5A40]">{negotiatedScope.agreementDate}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#5A5A40] uppercase font-semibold block">Agreed Scope:</span>
                <p className="text-[#2C3A2B] mt-0.5 leading-relaxed bg-[#FDFBF7] p-3 rounded-xl border border-[#E6E1D3] font-mono text-[11px]">
                  {negotiatedScope.agreedScope}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-[#5A5A40] uppercase font-semibold block">Explicitly Out-of-Scope:</span>
                <p className="text-[#5A5A40] mt-0.5 leading-relaxed bg-[#FDFBF7] p-3 rounded-xl border border-[#E6E1D3] font-mono text-[11px]">
                  {negotiatedScope.outOfScope}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#5A5A40] uppercase font-semibold block">Acceptance Criteria:</span>
                <p className="text-[#2C3A2B] mt-0.5 leading-relaxed bg-[#FDFBF7] p-3 rounded-xl border border-[#E6E1D3] font-mono text-[11px]">
                  {negotiatedScope.acceptanceCriteria}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section D: Final Evidence Log */}
      <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D3]">
          <div>
            <span className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider block">
              Section D · Empirical Validation Log
            </span>
            <h3 className="text-base font-serif font-bold text-[#2C3A2B]">Verified Engineering Evidence Records</h3>
          </div>

          <button
            onClick={() => setShowAddEvidence(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Evidence Record
          </button>
        </div>

        <div className="space-y-3">
          {evidenceRecords.map(rec => (
            <div
              key={rec.id}
              className="p-4 rounded-2xl border border-[#E6E1D3] bg-[#FDFBF7] text-xs space-y-2 hover:border-[#2C3A2B]/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#E6E1D3]">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#2C3A2B]">{rec.evidenceId}</span>
                  <span className="text-[#E6E1D3]">·</span>
                  <span className="font-bold text-[#2C3A2B]">{rec.featureTested}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#5A5A40]">{rec.referenceFile}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#A3B18A]/25 border border-[#A3B18A]/40 text-[#2C3A2B] font-semibold text-[11px]">
                    <Check className="w-3 h-3 text-[#2C3A2B]" />
                    {rec.status}
                  </span>
                  <button
                    onClick={() => deleteEvidenceRecord(rec.id)}
                    className="p-1.5 text-[#5A5A40] hover:text-[#C05621] rounded-lg"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#5A5A40] block">Procedure:</span>
                  <p className="text-[#5A5A40] mt-0.5 leading-relaxed">{rec.testProcedure}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#5A5A40] block">Expected Outcome:</span>
                  <p className="text-[#5A5A40] mt-0.5 leading-relaxed">{rec.expectedOutcome}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E6E1D3] space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[#2C3A2B] block">Actual Outcome & Verification:</span>
                <p className="text-[#2C3A2B] leading-relaxed font-mono text-[11px]">{rec.actualOutcome}</p>
                {rec.notes && (
                  <p className="text-[#5A5A40] text-[10px] pt-1.5 border-t border-[#E6E1D3]">{rec.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section E: Change Summary & 30-Day Next-Step Plan */}
      <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-5">
        <div className="pb-3 border-b border-[#E6E1D3]">
          <span className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider block">
            Section E · Forward Strategy
          </span>
          <h3 className="text-base font-serif font-bold text-[#2C3A2B]">Change Summary & 30-Day Phased Execution Plan</h3>
        </div>

        {/* 30-Day Timeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Phase 1 */}
          <div className="p-4 rounded-2xl border border-[#E6E1D3] bg-[#F5F5EC] space-y-2">
            <div className="flex items-center justify-between text-[#2C3A2B]">
              <span className="text-xs font-bold font-mono">Days 1–7</span>
              <Calendar className="w-4 h-4 text-[#2C3A2B]" />
            </div>
            <h4 className="text-xs font-serif font-bold text-[#2C3A2B]">Engineering Validation</h4>
            <p className="text-[11px] text-[#5A5A40] leading-relaxed">
              Verify deterministic test runner on all 10 reference requests and 10 edge cases; eliminate any floating-point tax rounding discrepancies.
            </p>
          </div>

          {/* Phase 2 */}
          <div className="p-4 rounded-2xl border border-[#E6E1D3] bg-[#FDFBF7] space-y-2">
            <div className="flex items-center justify-between text-[#5A5A40]">
              <span className="text-xs font-bold font-mono">Days 8–14</span>
              <Calendar className="w-4 h-4 text-[#5A5A40]" />
            </div>
            <h4 className="text-xs font-serif font-bold text-[#2C3A2B]">Five-Shopper Experiment</h4>
            <p className="text-[11px] text-[#5A5A40] leading-relaxed">
              Conduct empirical think-aloud sessions across 5 target participant profiles to measure landed price comprehension and ergonomic trade-offs.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="p-4 rounded-2xl border border-[#E6E1D3] bg-[#FDFBF7] space-y-2">
            <div className="flex items-center justify-between text-[#5A5A40]">
              <span className="text-xs font-bold font-mono">Days 15–21</span>
              <Calendar className="w-4 h-4 text-[#5A5A40]" />
            </div>
            <h4 className="text-xs font-serif font-bold text-[#2C3A2B]">Retailer Interviews</h4>
            <p className="text-[11px] text-[#5A5A40] leading-relaxed">
              Interview 2 home-office furniture retailers to validate commercial fee willingness (Model 1 SaaS vs Model 2 4.5% commission).
            </p>
          </div>

          {/* Phase 4 */}
          <div className="p-4 rounded-2xl border border-[#A3B18A]/40 bg-[#A3B18A]/15 space-y-2">
            <div className="flex items-center justify-between text-[#2C3A2B]">
              <span className="text-xs font-bold font-mono">Days 22–30</span>
              <Calendar className="w-4 h-4 text-[#2C3A2B]" />
            </div>
            <h4 className="text-xs font-serif font-bold text-[#2C3A2B]">Limited Storefront Pilot</h4>
            <p className="text-[11px] text-[#5A5A40] leading-relaxed">
              Deploy embeddable bundle builder widget for 30 days under agreed merchant terms; benchmark return reduction and AOV expansion.
            </p>
          </div>
        </div>
      </div>

      {/* Add Evidence Modal */}
      {showAddEvidence && (
        <div className="fixed inset-0 z-50 bg-[#2C3A2B]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full border border-[#E6E1D3] shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-serif font-bold text-[#2C3A2B]">Record New Engineering Evidence</h3>

            <form onSubmit={handleAddEvidenceSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#2C3A2B] block mb-1">Evidence ID</label>
                  <input
                    type="text"
                    required
                    value={newEvidence.evidenceId}
                    onChange={e => setNewEvidence({ ...newEvidence, evidenceId: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E6E1D3] rounded-xl bg-[#FDFBF7] font-mono text-[#2C3A2B]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#2C3A2B] block mb-1">Feature Tested</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weight-based Shipping"
                    value={newEvidence.featureTested}
                    onChange={e => setNewEvidence({ ...newEvidence, featureTested: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E6E1D3] rounded-xl bg-[#FDFBF7] text-[#2C3A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#2C3A2B] block mb-1">Test Procedure</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Steps taken to verify feature..."
                  value={newEvidence.testProcedure}
                  onChange={e => setNewEvidence({ ...newEvidence, testProcedure: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E6E1D3] rounded-xl bg-[#FDFBF7] text-[#2C3A2B]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#2C3A2B] block mb-1">Expected Outcome</label>
                <input
                  type="text"
                  required
                  value={newEvidence.expectedOutcome}
                  onChange={e => setNewEvidence({ ...newEvidence, expectedOutcome: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E6E1D3] rounded-xl bg-[#FDFBF7] text-[#2C3A2B]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#2C3A2B] block mb-1">Actual Outcome</label>
                <input
                  type="text"
                  required
                  value={newEvidence.actualOutcome}
                  onChange={e => setNewEvidence({ ...newEvidence, actualOutcome: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E6E1D3] rounded-xl bg-[#FDFBF7] text-[#2C3A2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#2C3A2B] block mb-1">Code File Reference</label>
                  <input
                    type="text"
                    value={newEvidence.referenceFile}
                    onChange={e => setNewEvidence({ ...newEvidence, referenceFile: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E6E1D3] rounded-xl bg-[#FDFBF7] font-mono text-[#2C3A2B]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#2C3A2B] block mb-1">Status</label>
                  <select
                    value={newEvidence.status}
                    onChange={e => setNewEvidence({ ...newEvidence, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E6E1D3] rounded-xl bg-[#FDFBF7] text-[#2C3A2B]"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Flagged">Flagged</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E6E1D3]">
                <button
                  type="button"
                  onClick={() => setShowAddEvidence(false)}
                  className="px-3.5 py-2 text-xs text-[#5A5A40] hover:bg-[#F4F1EA] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl shadow-xs"
                >
                  Log Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
