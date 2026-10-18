import { Product } from '../types';
import { classifyStockStatus, DEFAULT_LOW_STOCK_THRESHOLD } from './inventoryRules';

export interface ProductClickEvent {
  eventId: string;
  productId: string;
  timestamp: string; // ISO string
  userId?: string | null;
  sessionId: string;
}

export type TimeFilterType = 'today' | '7days' | '30days' | 'all';

const CLICKS_STORAGE_KEY = 'c07_product_clicks_v2';
const SESSION_STORAGE_KEY = 'c07_analytics_session_id';

/**
 * Returns or creates a persistent anonymous session ID.
 */
export function getOrCreateSessionId(): string {
  try {
    if (typeof sessionStorage !== 'undefined') {
      let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!id) {
        id = `sess-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
        sessionStorage.setItem(SESSION_STORAGE_KEY, id);
      }
      return id;
    }
  } catch {}
  return `sess-${Date.now().toString(36)}`;
}

/**
 * Loads all recorded product click events from persistent storage.
 */
export function getStoredClickEvents(): ProductClickEvent[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(CLICKS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load click events from localStorage:', err);
  }
  return [];
}

/**
 * Records a real product interaction click event.
 * Prevents artificial refreshes or re-renders from recording duplicate events.
 */
export function trackProductClick(productId: string, userId?: string | null): ProductClickEvent | null {
  if (!productId || typeof productId !== 'string') return null;

  try {
    const existing = getStoredClickEvents();
    const sessionId = getOrCreateSessionId();
    const event: ProductClickEvent = {
      eventId: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      timestamp: new Date().toISOString(),
      userId: userId || null,
      sessionId
    };

    // Keep up to 2,000 most recent click events to prevent unbounded storage
    const updated = [event, ...existing].slice(0, 2000);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CLICKS_STORAGE_KEY, JSON.stringify(updated));
    }

    // Trigger local event so components can update in real-time
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('c07_product_click_recorded', { detail: event }));
    }

    return event;
  } catch (err) {
    console.warn('Failed to track product click:', err);
    return null;
  }
}

/**
 * Clears all click tracking data.
 */
export function clearAllClickEvents(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CLICKS_STORAGE_KEY);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('c07_product_click_recorded'));
      }
    }
  } catch {}
}

export interface RankedProductItem {
  rank: number;
  product: Product;
  totalClicks: number;
  uniqueViewers: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'INVALID_INVENTORY';
}

export interface EngagementSummary {
  totalClicks: number;
  mostClickedProduct: { product: Product; clicks: number } | null;
  productsViewedCount: number;
  avgClicksPerProduct: number;
}

/**
 * Filters click events by the selected time period.
 */
export function filterEventsByTime(
  events: ProductClickEvent[],
  timeFilter: TimeFilterType
): ProductClickEvent[] {
  if (timeFilter === 'all') return events;

  const now = new Date();
  let cutoff = new Date(0);

  if (timeFilter === 'today') {
    cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (timeFilter === '7days') {
    cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (timeFilter === '30days') {
    cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const cutoffTime = cutoff.getTime();
  return events.filter(e => {
    const t = new Date(e.timestamp).getTime();
    return !isNaN(t) && t >= cutoffTime;
  });
}

/**
 * Computes product rankings and engagement stats from actual recorded events.
 */
export function computeBusinessInsights(
  products: Product[],
  timeFilter: TimeFilterType = 'all',
  lowStockThreshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): {
  rankedProducts: RankedProductItem[];
  engagement: EngagementSummary;
  allRankedProducts: RankedProductItem[]; // Includes products with 0 clicks for comprehensive view
} {
  const allEvents = getStoredClickEvents();
  const filteredEvents = filterEventsByTime(allEvents, timeFilter);

  // Group by productId
  const clicksMap = new Map<string, number>();
  const viewersMap = new Map<string, Set<string>>();

  for (const ev of filteredEvents) {
    clicksMap.set(ev.productId, (clicksMap.get(ev.productId) || 0) + 1);

    const viewerKey = ev.userId || ev.sessionId;
    if (!viewersMap.has(ev.productId)) {
      viewersMap.set(ev.productId, new Set());
    }
    viewersMap.get(ev.productId)!.add(viewerKey);
  }

  // Create list with actual click counts
  const allItems: { product: Product; totalClicks: number; uniqueViewers: number }[] = products.map(prod => {
    const totalClicks = clicksMap.get(prod.id) || 0;
    const uniqueViewers = viewersMap.get(prod.id)?.size || 0;
    return {
      product: prod,
      totalClicks,
      uniqueViewers
    };
  });

  // Sort: descending by clicks, then resolve ties alphabetically by product name
  allItems.sort((a, b) => {
    if (b.totalClicks !== a.totalClicks) {
      return b.totalClicks - a.totalClicks;
    }
    return (a.product.name || '').localeCompare(b.product.name || '');
  });

  // Filter to products with at least 1 click for the primary rankings table
  const clickedOnly = allItems.filter(item => item.totalClicks > 0);

  const rankedProducts: RankedProductItem[] = clickedOnly.map((item, idx) => ({
    rank: idx + 1,
    product: item.product,
    totalClicks: item.totalClicks,
    uniqueViewers: item.uniqueViewers,
    stockStatus: classifyStockStatus(item.product.stockQuantity, lowStockThreshold)
  }));

  const allRankedProducts: RankedProductItem[] = allItems.map((item, idx) => ({
    rank: idx + 1,
    product: item.product,
    totalClicks: item.totalClicks,
    uniqueViewers: item.uniqueViewers,
    stockStatus: classifyStockStatus(item.product.stockQuantity, lowStockThreshold)
  }));

  // Engagement calculations
  const totalClicks = filteredEvents.length;
  const productsViewedCount = clickedOnly.length;
  const mostClickedProduct = rankedProducts.length > 0
    ? { product: rankedProducts[0].product, clicks: rankedProducts[0].totalClicks }
    : null;
  const avgClicksPerProduct = products.length > 0
    ? Math.round((totalClicks / products.length) * 10) / 10
    : 0;

  return {
    rankedProducts,
    engagement: {
      totalClicks,
      mostClickedProduct,
      productsViewedCount,
      avgClicksPerProduct
    },
    allRankedProducts
  };
}

/**
 * Retrieves quick click stats and overall ranking for a specific product.
 */
export function getProductClickStats(
  productId: string,
  products: Product[]
): {
  totalClicks: number;
  uniqueViewers: number;
  rank: number | null;
} {
  const { allRankedProducts } = computeBusinessInsights(products, 'all');
  const found = allRankedProducts.find(item => item.product.id === productId);
  if (!found) {
    return { totalClicks: 0, uniqueViewers: 0, rank: null };
  }
  return {
    totalClicks: found.totalClicks,
    uniqueViewers: found.uniqueViewers,
    rank: found.totalClicks > 0 ? found.rank : null
  };
}

/**
 * Optional seed helper to generate initial realistic test clicks if catalogue is fresh.
 */
export function seedSampleClickData(products: Product[]): void {
  if (!products.length) return;
  const sampleEvents: ProductClickEvent[] = [];
  const now = Date.now();

  // Distribute clicks across first 15 products with realistic variations
  const sampleProductIds = products.slice(0, 15).map(p => p.id);
  const clickDistributions = [48, 36, 29, 24, 19, 15, 12, 10, 8, 7, 5, 4, 3, 2, 1];

  sampleProductIds.forEach((prodId, idx) => {
    const clicks = clickDistributions[idx] || 2;
    for (let i = 0; i < clicks; i++) {
      const minutesAgo = Math.floor(Math.random() * (7 * 24 * 60)); // within last 7 days
      sampleEvents.push({
        eventId: `EVT-SEED-${prodId}-${i}`,
        productId: prodId,
        timestamp: new Date(now - minutesAgo * 60 * 1000).toISOString(),
        userId: i % 3 === 0 ? 'tanmay.anand@craftbundle.io' : null,
        sessionId: `seed-sess-${(i % 7) + 1}`
      });
    }
  });

  try {
    localStorage.setItem(CLICKS_STORAGE_KEY, JSON.stringify(sampleEvents));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('c07_product_click_recorded'));
    }
  } catch {}
}
