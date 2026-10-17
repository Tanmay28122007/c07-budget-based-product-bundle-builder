import { Product } from '../types';
import { BundleRecommendation, ProductRequirement } from '../utils/bundleRecommendations';

export interface ProductFilters {
  search?: string;
  category?: string;
  colour?: string;
  size?: string;
  inStock?: string | boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'name' | 'id' | string;
}

export interface ProductApiResponse {
  success: boolean;
  total: number;
  filteredCount: number;
  products: Product[];
  metadata: {
    availableCategories: string[];
    availableColours: string[];
    availableSizes: string[];
    minPrice: number;
    maxPrice: number;
  };
  filtersApplied: ProductFilters;
  timestamp: string;
}

export interface BundleFilterRequest {
  requirements?: ProductRequirement[];
  budget?: number;
  exactOnly?: boolean;
  search?: string;
  category?: string;
  colour?: string;
  sort?: 'price_asc' | 'price_desc' | 'items_asc' | 'items_desc' | string;
}

export interface BundleApiResponse {
  success: boolean;
  total: number;
  filteredCount: number;
  bundles: BundleRecommendation[];
  activeRequirementsSummary: string;
  hasUnavailableProduct: boolean;
  unavailableReason?: string;
  isOverBudgetForAll: boolean;
  overBudgetReason?: string;
  filtersApplied: BundleFilterRequest;
  timestamp: string;
}

/**
 * Calls backend API to fetch filtered products based on specific user details
 */
export async function fetchFilteredProducts(filters: ProductFilters): Promise<ProductApiResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category && filters.category !== 'all') params.append('category', filters.category);
  if (filters.colour && filters.colour !== 'all') params.append('colour', filters.colour);
  if (filters.size && filters.size !== 'all') params.append('size', filters.size);
  if (filters.inStock && filters.inStock !== 'all') params.append('inStock', String(filters.inStock));
  if (typeof filters.minPrice === 'number' && filters.minPrice > 0) params.append('minPrice', String(filters.minPrice));
  if (typeof filters.maxPrice === 'number' && filters.maxPrice > 0) params.append('maxPrice', String(filters.maxPrice));
  if (filters.sort) params.append('sort', filters.sort);

  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Backend responded with status ${res.status}`);
  }
  return await res.json();
}

/**
 * Calls backend API to generate and filter bundles based on user requirements & details
 */
export async function fetchFilteredBundles(request: BundleFilterRequest): Promise<BundleApiResponse> {
  const res = await fetch('/api/bundles/filter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!res.ok) {
    throw new Error(`Backend responded with status ${res.status}`);
  }
  return await res.json();
}

/**
 * Fetches a single product by ID from the backend
 */
export async function fetchProductById(id: string): Promise<{ product: Product; compatibleProducts: Product[] } | null> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Backend responded with status ${res.status}`);
  }
  const data = await res.json();
  return data;
}

/**
 * Checks backend health
 */
export async function checkBackendHealth(): Promise<{ ok: boolean; hasApiKey?: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, hasApiKey: data.hasApiKey };
  } catch {
    return { ok: false };
  }
}
