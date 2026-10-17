import React, { useState, useEffect } from 'react';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  UploadCloud,
  FileCode,
  HardDrive
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  seedProductsToDb,
  syncShopperRecordsToDb,
  syncEvidenceRecordsToDb,
  upsertSavedBundleToDb
} from '../../services/supabaseClient';
import { useApp } from '../../context/AppContext';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const { fixture, savedBundles, shopperRecords, evidenceRecords, addNotification } = useApp();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [latency, setLatency] = useState<number | undefined>();
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Load active config on mount or open
  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url || '');
      setAnonKey(config.anonKey || '');
      if (config.isConfigured) {
        handleTestConnection(config.url, config.anonKey);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (testUrl = url, testKey = anonKey) => {
    if (!testUrl || !testKey) {
      setStatus('error');
      setStatusMessage('Please enter both Supabase Project URL and Anon API key.');
      return;
    }

    setStatus('testing');
    setStatusMessage('Checking Supabase connection...');

    // Temporarily save to test
    saveSupabaseConfig(testUrl, testKey);

    const res = await testSupabaseConnection();
    if (res.ok) {
      setStatus('connected');
      setStatusMessage(res.message);
      setLatency(res.latencyMs);
      setAvailableTables(res.availableTables);
      addNotification('Supabase Connected', 'Successfully established connection to Supabase database.', 'success');
    } else {
      setStatus('error');
      setStatusMessage(res.message);
      setAvailableTables(res.availableTables);
    }
  };

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    handleTestConnection(url, anonKey);
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setStatus('idle');
    setStatusMessage('Supabase disconnected. System using local storage fallback.');
    setLatency(undefined);
    setAvailableTables([]);
    addNotification('Supabase Disconnected', 'Switched back to local storage.', 'info');
  };

  const handleCopySchema = () => {
    const sqlSchema = `-- ============================================================
-- Supabase Schema for Budget-Based Product Bundle Builder (C07)
-- ============================================================
create extension if not exists "uuid-ossp";

create table if not exists public.products (
  id text primary key,
  sku text,
  name text not null,
  category text not null,
  slot_type text not null,
  base_price numeric not null,
  landed_price numeric not null,
  rating numeric default 4.5,
  reviews_count integer default 0,
  in_stock boolean default true,
  stock_count integer default 100,
  lead_time_days integer default 2,
  specs jsonb default '{}'::jsonb,
  is_hero boolean default false,
  badge text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.saved_bundles (
  id text primary key,
  name text not null,
  activity_id text not null,
  budget numeric not null,
  landed_price numeric not null,
  items jsonb not null default '{}'::jsonb,
  validation jsonb default '{}'::jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.shopper_records (
  id text primary key,
  participant_id text not null,
  target_shopper_category text not null,
  approach_date text,
  contact_outcome text,
  task_completion text,
  time_taken text,
  budget_compliance text,
  compatibility_errors text,
  landed_price_understanding text,
  verbatim_feedback text,
  researcher_observations text,
  improvement_identified text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.evidence_records (
  id text primary key,
  evidence_id text not null,
  feature_tested text not null,
  test_procedure text not null,
  expected_outcome text not null,
  actual_outcome text not null,
  status text not null,
  reference_file text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;
alter table public.saved_bundles enable row level security;
alter table public.shopper_records enable row level security;
alter table public.evidence_records enable row level security;

create policy "Allow public all access on products" on public.products for all using (true);
create policy "Allow public all access on saved_bundles" on public.saved_bundles for all using (true);
create policy "Allow public all access on shopper_records" on public.shopper_records for all using (true);
create policy "Allow public all access on evidence_records" on public.evidence_records for all using (true);`;

    navigator.clipboard.writeText(sqlSchema);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleSeedAllData = async () => {
    setIsSyncing(true);
    setSyncMessage('Seeding products to Supabase...');

    try {
      // 1. Seed products
      const pRes = await seedProductsToDb(fixture.products);
      if (pRes.error) throw new Error(`Products error: ${pRes.error}`);

      // 2. Sync saved bundles
      setSyncMessage('Syncing saved bundles...');
      for (const b of savedBundles) {
        await upsertSavedBundleToDb(b);
      }

      // 3. Sync shopper records
      setSyncMessage('Syncing MBA UX field trial records...');
      await syncShopperRecordsToDb(shopperRecords);

      // 4. Sync evidence records
      setSyncMessage('Syncing project evidence audit trails...');
      await syncEvidenceRecordsToDb(evidenceRecords);

      setSyncMessage(`Synced ${fixture.products.length} products, ${savedBundles.length} bundles, and audit records!`);
      addNotification('Database Synced', `Successfully seeded ${fixture.products.length} products & bundle data to Supabase.`, 'success');
      
      // Refresh connection check
      handleTestConnection();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncMessage(`Sync failed: ${msg}`);
      addNotification('Sync Error', msg, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FDFBF7] border border-[#E6E1D3] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E6E1D3] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2C3A2B] text-emerald-300 flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#2C3A2B]">
                Supabase Database Connection
              </h2>
              <p className="text-xs text-[#5A5A40]">
                Sync products, bundles, and MBA evidence records to your cloud database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8B8B7A] hover:text-[#2C2C1E] rounded-xl hover:bg-[#F4F1EA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
              status === 'connected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : status === 'testing'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : status === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-[#F4F1EA] border-[#E6E1D3] text-[#5A5A40]'
            }`}
          >
            {status === 'connected' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : status === 'testing' ? (
              <RefreshCw className="w-5 h-5 text-amber-600 animate-spin shrink-0 mt-0.5" />
            ) : status === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <HardDrive className="w-5 h-5 text-[#8B5A2B] shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {status === 'connected'
                    ? 'Connected to Supabase'
                    : status === 'testing'
                    ? 'Testing Connection'
                    : status === 'error'
                    ? 'Connection Notice'
                    : 'Awaiting Credentials'}
                </span>
                {latency !== undefined && (
                  <span className="text-[11px] font-mono font-bold bg-white/70 px-2 py-0.5 rounded-full border border-current/20">
                    {latency}ms
                  </span>
                )}
              </div>
              <p className="text-xs mt-1 leading-relaxed">
                {statusMessage ||
                  'Enter your Supabase Project URL and Anon API key below. You can also paste them directly into your .env file as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'}
              </p>

              {availableTables.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Verified Tables:</span>
                  {availableTables.map(t => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[10px] font-mono bg-emerald-100 text-emerald-900 rounded-md border border-emerald-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Credentials Inputs */}
          <div className="space-y-4 bg-white p-5 rounded-2xl border border-[#E6E1D3]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#2C3A2B] uppercase tracking-wider flex items-center gap-1.5">
                <span>Supabase Project URL</span>
                <span className="text-rose-600">*</span>
              </label>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#8B5A2B] hover:underline flex items-center gap-1 font-medium"
              >
                <span>Find in Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] text-[#2C2C1E] font-mono"
            />

            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-bold text-[#2C3A2B] uppercase tracking-wider flex items-center gap-1.5">
                <span>Anon Public API Key</span>
                <span className="text-rose-600">*</span>
              </label>
              <span className="text-[10px] text-[#8B8B7A]">Project Settings &gt; API</span>
            </div>
            <input
              type="password"
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] text-[#2C2C1E] font-mono"
            />

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={handleSave}
                disabled={status === 'testing' || !url || !anonKey}
                className="px-4 py-2 bg-[#2C3A2B] hover:bg-[#3A4D39] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {status === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-emerald-300" />}
                <span>Save &amp; Connect</span>
              </button>

              <button
                onClick={() => handleTestConnection(url, anonKey)}
                disabled={status === 'testing' || !url || !anonKey}
                className="px-3.5 py-2 bg-[#F4F1EA] hover:bg-[#EAE5D9] text-[#2C3A2B] border border-[#E6E1D3] rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${status === 'testing' ? 'animate-spin' : ''}`} />
                <span>Test Ping</span>
              </button>

              {(url || anonKey) && (
                <button
                  onClick={handleDisconnect}
                  className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl text-xs font-medium transition-colors cursor-pointer ml-auto"
                >
                  Clear / Disconnect
                </button>
              )}
            </div>
          </div>

          {/* Database Setup & Sync Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Step 1: SQL Schema */}
            <div className="bg-white p-4 rounded-2xl border border-[#E6E1D3] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <FileCode className="w-4 h-4 text-[#8B5A2B]" />
                  <span className="text-xs font-bold text-[#2C3A2B]">1. Database Schema</span>
                </div>
                <p className="text-[11px] text-[#5A5A40] leading-relaxed">
                  Run our SQL schema in your Supabase SQL Editor to create tables for products, bundles, and logs.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#E6E1D3]/50">
                <button
                  onClick={handleCopySchema}
                  className="w-full py-2 px-3 bg-[#F4F1EA] hover:bg-[#EAE5D9] text-[#2C3A2B] border border-[#E6E1D3] rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8B5A2B]" />}
                  <span>{copiedSchema ? 'SQL Copied to Clipboard!' : 'Copy Schema SQL'}</span>
                </button>
              </div>
            </div>

            {/* Step 2: Seed / Sync Data */}
            <div className="bg-white p-4 rounded-2xl border border-[#E6E1D3] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <UploadCloud className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-[#2C3A2B]">2. Seed / Sync Data</span>
                </div>
                <p className="text-[11px] text-[#5A5A40] leading-relaxed">
                  Upload the catalog (22 products) and current bundles to your Supabase tables in one click.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-[#E6E1D3]/50">
                <button
                  onClick={handleSeedAllData}
                  disabled={status !== 'connected' || isSyncing}
                  className="w-full py-2 px-3 bg-[#2C3A2B] hover:bg-[#3A4D39] text-white rounded-xl text-xs font-medium shadow-xs disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 text-emerald-300" />}
                  <span>{isSyncing ? 'Syncing...' : 'Sync Catalog & Data'}</span>
                </button>
              </div>
            </div>
          </div>

          {syncMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-mono">
              {syncMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F4F1EA] border-t border-[#E6E1D3] flex items-center justify-between text-xs text-[#5A5A40]">
          <span>Saved bundles auto-sync to Supabase when connected</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#E6E1D3] text-[#2C3A2B] font-semibold rounded-xl hover:bg-[#EAE5D9] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
