import { Product } from '../types';

export type StockStatusType = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'INVALID_INVENTORY';

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

/**
 * Validates a numerical stock quantity.
 * Rules:
 * - Must be a non-negative integer.
 * - Rejects negative quantities.
 * - Rejects null, undefined, non-numeric, or empty input.
 */
export function validateStockQuantity(val: unknown): {
  isValid: boolean;
  error?: string;
  parsedQuantity?: number;
} {
  if (val === null || val === undefined || val === '') {
    return { isValid: false, error: 'Stock quantity cannot be empty.' };
  }

  const num = typeof val === 'number' ? val : Number(val);

  if (isNaN(num)) {
    return { isValid: false, error: 'Stock quantity must be a valid number.' };
  }

  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Stock quantity must be a whole integer.' };
  }

  if (num < 0) {
    return { isValid: false, error: 'Stock quantity cannot be negative.' };
  }

  return { isValid: true, parsedQuantity: num };
}

/**
 * Classifies inventory stock status based on business rules:
 * Rule 1: quantity > threshold -> IN_STOCK
 * Rule 2: quantity === 0 -> OUT_OF_STOCK
 * Rule 3: quantity > 0 && quantity <= threshold -> LOW_STOCK
 * Rule 4: invalid/negative/non-numeric -> INVALID_INVENTORY
 */
export function classifyStockStatus(
  quantity: unknown,
  threshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): StockStatusType {
  const validation = validateStockQuantity(quantity);
  if (!validation.isValid || validation.parsedQuantity === undefined) {
    return 'INVALID_INVENTORY';
  }

  const qty = validation.parsedQuantity;
  if (qty === 0) {
    return 'OUT_OF_STOCK';
  }
  if (qty <= threshold) {
    return 'LOW_STOCK';
  }
  return 'IN_STOCK';
}

/**
 * Counts the number of distinct registered products.
 */
export function countDistinctProducts(products: Product[]): number {
  if (!Array.isArray(products)) return 0;
  return products.length;
}

/**
 * Calculates the sum of available units across all valid products.
 */
export function calculateTotalUnitsInStock(products: Product[]): number {
  if (!Array.isArray(products)) return 0;
  return products.reduce((acc, p) => {
    const qty = typeof p.stockQuantity === 'number' && !isNaN(p.stockQuantity) && p.stockQuantity > 0
      ? p.stockQuantity
      : 0;
    return acc + qty;
  }, 0);
}

/**
 * Counts products with quantity > 0.
 */
export function countInStockProducts(products: Product[]): number {
  if (!Array.isArray(products)) return 0;
  return products.filter(p => typeof p.stockQuantity === 'number' && p.stockQuantity > 0).length;
}

/**
 * Counts products with quantity === 0.
 */
export function countOutOfStockProducts(products: Product[]): number {
  if (!Array.isArray(products)) return 0;
  return products.filter(p => typeof p.stockQuantity === 'number' && p.stockQuantity === 0).length;
}

/**
 * Counts products with quantity > 0 and <= threshold.
 */
export function countLowStockProducts(
  products: Product[],
  threshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): number {
  if (!Array.isArray(products)) return 0;
  return products.filter(p => {
    return typeof p.stockQuantity === 'number' && p.stockQuantity > 0 && p.stockQuantity <= threshold;
  }).length;
}

/**
 * Counts invalid inventory records.
 */
export function countInvalidInventory(products: Product[]): number {
  if (!Array.isArray(products)) return 0;
  return products.filter(p => !validateStockQuantity(p.stockQuantity).isValid).length;
}

/**
 * Aggregates all KPI metrics from actual catalogue data.
 */
export function calculateInventoryMetrics(
  products: Product[],
  threshold: number = DEFAULT_LOW_STOCK_THRESHOLD
) {
  return {
    totalProducts: countDistinctProducts(products),
    totalUnitsInStock: calculateTotalUnitsInStock(products),
    inStockProducts: countInStockProducts(products),
    lowStockProducts: countLowStockProducts(products, threshold),
    outOfStockProducts: countOutOfStockProducts(products),
    invalidInventoryProducts: countInvalidInventory(products)
  };
}

// ============================================================================
// TEST SUITE INTERFACES & RUNNER FOR INVENTORY AVAILABILITY
// ============================================================================

export type InventoryTestType =
  | 'ALL_PRODUCTS'
  | 'SELECTED_PRODUCT'
  | 'BY_CATEGORY'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK';

export interface InventoryTestItemResult {
  testId: string;
  productId: string;
  productName: string;
  category: string;
  inventoryQuantity: number;
  expectedStatus: StockStatusType;
  actualStatus: StockStatusType;
  testResult: 'PASS' | 'FAIL';
  errorMessage: string | null;
  executionTimestamp: string;
}

export interface InventoryTestSummary {
  totalTested: number;
  passed: number;
  failed: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  invalidInventory: number;
  executionTimeMs: number;
  overallStatus: 'PASS' | 'FAIL';
}

export interface InventoryTestRun {
  testRunId: string;
  testType: InventoryTestType;
  filterParam?: string;
  threshold: number;
  executedAt: string;
  summary: InventoryTestSummary;
  results: InventoryTestItemResult[];
}

/**
 * Runs an inventory availability test on product records according to business rules.
 */
export function runInventoryAvailabilityTest(
  products: Product[],
  testType: InventoryTestType = 'ALL_PRODUCTS',
  filterParam?: string,
  threshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): InventoryTestRun {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();
  const testRunId = `RUN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  // 1. Filter products to test based on selection
  let targetProducts: Product[] = [...products];

  if (testType === 'SELECTED_PRODUCT' && filterParam) {
    targetProducts = targetProducts.filter(p => p.id === filterParam);
  } else if (testType === 'BY_CATEGORY' && filterParam) {
    targetProducts = targetProducts.filter(
      p => (p.category || '').toLowerCase() === filterParam.toLowerCase()
    );
  } else if (testType === 'LOW_STOCK') {
    targetProducts = targetProducts.filter(p => {
      const qty = p.stockQuantity ?? 0;
      return qty > 0 && qty <= threshold;
    });
  } else if (testType === 'OUT_OF_STOCK') {
    targetProducts = targetProducts.filter(p => (p.stockQuantity ?? 0) === 0);
  }

  // 2. Execute business rule validation for each record
  const results: InventoryTestItemResult[] = targetProducts.map((prod, index) => {
    const testId = `T-${testRunId}-${String(index + 1).padStart(3, '0')}`;
    const qty = prod.stockQuantity;
    const validation = validateStockQuantity(qty);

    let expectedStatus: StockStatusType;
    let actualStatus: StockStatusType;
    let testResult: 'PASS' | 'FAIL' = 'PASS';
    let errorMessage: string | null = null;

    if (!validation.isValid) {
      expectedStatus = 'INVALID_INVENTORY';
      actualStatus = 'INVALID_INVENTORY';
      testResult = 'FAIL';
      errorMessage = `Invalid quantity (${qty}): ${validation.error || 'Must be a non-negative integer'}`;
    } else {
      const validQty = validation.parsedQuantity!;
      expectedStatus = classifyStockStatus(validQty, threshold);

      // Determine actual reported status from the product record
      if (prod.inStock === false && validQty > 0) {
        actualStatus = 'OUT_OF_STOCK';
        testResult = 'FAIL';
        errorMessage = `Consistency failure: Quantity is ${validQty} but product is flagged as out of stock (inStock=false).`;
      } else if (prod.inStock === true && validQty === 0) {
        actualStatus = 'IN_STOCK';
        testResult = 'FAIL';
        errorMessage = `Consistency failure: Quantity is 0 but product is flagged as in stock (inStock=true).`;
      } else {
        actualStatus = expectedStatus;
        testResult = 'PASS';
        errorMessage = null;
      }
    }

    return {
      testId,
      productId: prod.id,
      productName: prod.name,
      category: prod.category || 'Uncategorized',
      inventoryQuantity: typeof qty === 'number' ? qty : -1,
      expectedStatus,
      actualStatus,
      testResult,
      errorMessage,
      executionTimestamp: timestamp
    };
  });

  const endTime = performance.now();
  const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

  // 3. Compute Summary
  const totalTested = results.length;
  const passed = results.filter(r => r.testResult === 'PASS').length;
  const failed = results.filter(r => r.testResult === 'FAIL').length;
  const inStock = results.filter(r => r.expectedStatus === 'IN_STOCK').length;
  const lowStock = results.filter(r => r.expectedStatus === 'LOW_STOCK').length;
  const outOfStock = results.filter(r => r.expectedStatus === 'OUT_OF_STOCK').length;
  const invalidInventory = results.filter(r => r.expectedStatus === 'INVALID_INVENTORY').length;

  // Overall test status is PASS only when all tested records pass
  const overallStatus = (totalTested > 0 && failed === 0) ? 'PASS' : (totalTested === 0 ? 'PASS' : 'FAIL');

  return {
    testRunId,
    testType,
    filterParam,
    threshold,
    executedAt: timestamp,
    summary: {
      totalTested,
      passed,
      failed,
      inStock,
      lowStock,
      outOfStock,
      invalidInventory,
      executionTimeMs,
      overallStatus
    },
    results
  };
}

/**
 * Generates CSV content conforming to Section 8:
 * test_id,product_id,product_name,category,inventory_quantity,expected_status,actual_status,test_result,error_message,execution_timestamp
 */
export function generateInventoryTestCSV(testRun: InventoryTestRun): string {
  const headers = [
    'test_id',
    'product_id',
    'product_name',
    'category',
    'inventory_quantity',
    'expected_status',
    'actual_status',
    'test_result',
    'error_message',
    'execution_timestamp'
  ];

  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = testRun.results.map(r => [
    escapeCSV(r.testId),
    escapeCSV(r.productId),
    escapeCSV(r.productName),
    escapeCSV(r.category),
    escapeCSV(r.inventoryQuantity),
    escapeCSV(r.expectedStatus),
    escapeCSV(r.actualStatus),
    escapeCSV(r.testResult),
    escapeCSV(r.errorMessage || ''),
    escapeCSV(r.executionTimestamp)
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates formatted JSON conforming to Section 8 requirements.
 */
export function generateInventoryTestJSON(testRun: InventoryTestRun): string {
  const exportPayload = {
    test_run_id: testRun.testRunId,
    test_type: testRun.testType,
    executed_at: testRun.executedAt,
    summary: {
      total_tested: testRun.summary.totalTested,
      passed: testRun.summary.passed,
      failed: testRun.summary.failed,
      in_stock: testRun.summary.inStock,
      low_stock: testRun.summary.lowStock,
      out_of_stock: testRun.summary.outOfStock,
      invalid_inventory: testRun.summary.invalidInventory,
      execution_time_ms: testRun.summary.executionTimeMs,
      overall_status: testRun.summary.overallStatus
    },
    results: testRun.results.map(r => ({
      test_id: r.testId,
      product_id: r.productId,
      product_name: r.productName,
      category: r.category,
      inventory_quantity: r.inventoryQuantity,
      expected_status: r.expectedStatus,
      actual_status: r.actualStatus,
      test_result: r.testResult,
      error_message: r.errorMessage,
      execution_timestamp: r.executionTimestamp
    }))
  };

  return JSON.stringify(exportPayload, null, 2);
}
