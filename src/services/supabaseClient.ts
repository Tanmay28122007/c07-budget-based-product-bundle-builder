import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, SavedBundle, ShopperExperimentRecord, ProjectEvidenceRecord } from '../types';

const STORAGE_KEY_URL = 'c07_supabase_url';
const STORAGE_KEY_ANON = 'c07_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'none';
}

/**
 * Get active Supabase configuration from localStorage or .env
 */
export function getSupabaseConfig(): SupabaseConfig {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const customKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) : null;

  if (customUrl && customKey) {
    return {
      url: customUrl.trim(),
      anonKey: customKey.trim(),
      isConfigured: true,
      source: 'custom'
    };
  }

  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL || typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL || '').trim();
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY || typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY || '').trim();

  if (envUrl && envKey && !envUrl.includes('your-project') && !envUrl.includes('xyzcompany')) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env'
    };
  }

  return {
    url: customUrl || envUrl || '',
    anonKey: customKey || envKey || '',
    isConfigured: false,
    source: 'none'
  };
}

/**
 * Save user credentials in browser storage
 */
export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  }
  // Invalidate cache
  cachedClient = null;
  cachedUrl = '';
  cachedKey = '';
}

/**
 * Clear custom configuration
 */
export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
  }
  cachedClient = null;
  cachedUrl = '';
  cachedKey = '';
}

/**
 * Get singleton Supabase client
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient && cachedUrl === config.url && cachedKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    cachedUrl = config.url;
    cachedKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Test Supabase connection and check table availability
 */
export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  message: string;
  latencyMs?: number;
  availableTables: string[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      message: 'Supabase URL or Anon API Key is missing. Please provide credentials.',
      availableTables: []
    };
  }

  const startTime = performance.now();
  const availableTables: string[] = [];

  try {
    // Ping tables
    const [bundlesTest, productsTest] = await Promise.all([
      client.from('saved_bundles').select('id').limit(1),
      client.from('products').select('id').limit(1)
    ]);

    const latencyMs = Math.round(performance.now() - startTime);

    if (!bundlesTest.error) availableTables.push('saved_bundles');
    if (!productsTest.error) availableTables.push('products');

    if (bundlesTest.error && productsTest.error) {
      // Check if it's connection failure or missing table schema
      if (bundlesTest.error.code === '42P01' || productsTest.error.code === '42P01') {
        return {
          ok: true,
          message: 'Connected to Supabase! Note: Database tables need to be created using schema.sql.',
          latencyMs,
          availableTables
        };
      }
      return {
        ok: false,
        message: `Connection error: ${bundlesTest.error.message || productsTest.error.message}`,
        latencyMs,
        availableTables
      };
    }

    return {
      ok: true,
      message: `Successfully connected to Supabase (${latencyMs}ms)!`,
      latencyMs,
      availableTables
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      message: `Network or host error: ${msg}`,
      availableTables: []
    };
  }
}

/**
 * Fetch Saved Bundles from Supabase
 */
export async function fetchSavedBundlesFromDb(): Promise<SavedBundle[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('saved_bundles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('Supabase fetchSavedBundles error:', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    activityId: row.activity_id,
    budget: Number(row.budget),
    items: row.items || {},
    validation: row.validation || {},
    savedAt: row.created_at,
    notes: row.notes || undefined
  })) as SavedBundle[];
}

/**
 * Upsert a Saved Bundle to Supabase
 */
export async function upsertSavedBundleToDb(bundle: SavedBundle): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not configured' };

  const { error } = await client.from('saved_bundles').upsert({
    id: bundle.id,
    name: bundle.name,
    activity_id: bundle.activityId,
    budget: bundle.budget,
    landed_price: bundle.validation?.landedPrice?.landedPrice ?? 0,
    items: bundle.items,
    validation: bundle.validation,
    notes: bundle.notes || null,
    updated_at: new Date().toISOString()
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Delete a Saved Bundle from Supabase
 */
export async function deleteSavedBundleFromDb(bundleId: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not configured' };

  const { error } = await client.from('saved_bundles').delete().eq('id', bundleId);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Seed initial catalog products to Supabase
 */
export async function seedProductsToDb(products: Product[]): Promise<{ count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { count: 0, error: 'Supabase client not configured' };

  const rows = products.map(p => ({
    id: p.id,
    sku: p.id,
    name: p.name,
    category: p.category,
    slot_type: p.category,
    base_price: p.price,
    landed_price: p.price,
    in_stock: p.inStock,
    stock_count: p.stockQuantity,
    specs: {
      brand: p.brand,
      model: p.model,
      description: p.description,
      weightKg: p.weightKg,
      attributes: p.attributes,
      incompatibleProductIds: p.incompatibleProductIds,
      notes: p.notes
    }
  }));

  const { data, error } = await client.from('products').upsert(rows, { onConflict: 'id' }).select();

  if (error) {
    return { count: 0, error: error.message };
  }
  return { count: data?.length || rows.length };
}

/**
 * Sync Shopper UX Research Records to Supabase
 */
export async function syncShopperRecordsToDb(records: ShopperExperimentRecord[]): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase not configured' };

  const rows = records.map(r => ({
    id: r.id,
    participant_id: r.participantId,
    target_shopper_category: r.targetShopperCategory,
    approach_date: r.approachDate,
    contact_outcome: r.contactOutcome,
    task_completion: r.taskCompletion,
    time_taken: r.timeTaken,
    budget_compliance: r.budgetCompliance,
    compatibility_errors: r.compatibilityErrors,
    landed_price_understanding: r.landedPriceUnderstanding,
    verbatim_feedback: r.verbatimFeedback,
    researcher_observations: r.researcherObservations,
    improvement_identified: r.improvementIdentified
  }));

  const { error } = await client.from('shopper_records').upsert(rows, { onConflict: 'id' });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Sync Evidence Records to Supabase
 */
export async function syncEvidenceRecordsToDb(records: ProjectEvidenceRecord[]): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase not configured' };

  const rows = records.map(r => ({
    id: r.id,
    evidence_id: r.evidenceId,
    feature_tested: r.featureTested,
    test_procedure: r.testProcedure,
    expected_outcome: r.expectedOutcome,
    actual_outcome: r.actualOutcome,
    status: r.status,
    reference_file: r.referenceFile,
    notes: r.notes
  }));

  const { error } = await client.from('evidence_records').upsert(rows, { onConflict: 'id' });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
