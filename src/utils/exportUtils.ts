import { Product, TestExecutionResult, SavedBundle, LandedPriceBreakdown } from '../types';

/**
 * Initiates browser download of text data as a file.
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Converts bundle details to CSV format
 */
export function exportBundleToCSV(
  bundleName: string,
  activityName: string,
  budget: number,
  items: Record<string, Product | null>,
  landedPrice: LandedPriceBreakdown,
  isValid: boolean
): string {
  const rows: string[][] = [
    ['Bundle Summary Export', ''],
    ['Bundle Name', `"${bundleName.replace(/"/g, '""')}"`],
    ['Activity', `"${activityName.replace(/"/g, '""')}"`],
    ['Customer Budget (INR)', budget.toString()],
    ['Validity Status', isValid ? 'VALID' : 'INVALID'],
    ['', ''],
    ['Slot ID', 'Product ID', 'Product Name', 'Brand', 'Price (INR)', 'Weight (kg)', 'Stock Status'],
  ];

  for (const [slotId, product] of Object.entries(items)) {
    if (product) {
      rows.push([
        slotId,
        product.id,
        `"${product.name.replace(/"/g, '""')}"`,
        `"${product.brand.replace(/"/g, '""')}"`,
        product.price.toString(),
        product.weightKg.toString(),
        product.inStock ? 'In Stock' : 'Out of Stock'
      ]);
    } else {
      rows.push([slotId, 'EMPTY', 'No product selected', '-', '0', '0', '-']);
    }
  }

  rows.push(['', '', '', '', '', '', '']);
  rows.push(['Price Breakdown', '', '', '', '', '', '']);
  rows.push(['Product Subtotal (INR)', landedPrice.productSubtotal.toString()]);
  rows.push(['Gross Shipping (INR)', landedPrice.shippingFee.toString()]);
  rows.push(['Shipping Discount (INR)', landedPrice.shippingDiscount.toString()]);
  rows.push(['Net Shipping (INR)', landedPrice.netShipping.toString()]);
  rows.push(['Taxes (18% GST INR)', landedPrice.taxAmount.toString()]);
  rows.push(['Final Landed Price (INR)', landedPrice.landedPrice.toString()]);
  rows.push(['Remaining Budget (INR)', landedPrice.remainingBudget.toString()]);
  rows.push(['Budget Utilisation (%)', `${landedPrice.budgetUtilisationPercent}%`]);

  return rows.map(r => r.join(',')).join('\n');
}

/**
 * Converts test execution results to CSV format
 */
export function exportTestResultsToCSV(results: TestExecutionResult[]): string {
  const headers = [
    'Test ID',
    'Test Type',
    'Scenario Title',
    'Budget (INR)',
    'Required Slots',
    'Expected Result',
    'Actual Result',
    'Landed Price (INR)',
    'Compatibility',
    'Stock Status',
    'Pass/Fail',
    'Explanation',
    'Execution Time'
  ];

  const rows = results.map(r => [
    r.testId,
    r.testType,
    `"${r.title.replace(/"/g, '""')}"`,
    r.budget.toString(),
    `"${r.requiredSlots.join('; ')}"`,
    `"${r.expectedResult.replace(/"/g, '""')}"`,
    `"${r.actualResult.replace(/"/g, '""')}"`,
    r.landedPrice.toString(),
    r.compatibilityOutcome,
    r.stockOutcome,
    r.passed ? 'PASS' : 'FAIL',
    `"${r.explanation.replace(/"/g, '""')}"`,
    r.timestamp
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Converts catalogue products to CSV format
 */
export function exportCatalogueToCSV(products: Product[]): string {
  const headers = [
    'Product ID',
    'Name',
    'Category',
    'Price (INR)',
    'Brand',
    'Model',
    'In Stock',
    'Stock Qty',
    'Weight (kg)',
    'Ergonomic Grade',
    'Notes'
  ];

  const rows = products.map(p => [
    p.id,
    `"${p.name.replace(/"/g, '""')}"`,
    p.category,
    p.price.toString(),
    `"${p.brand.replace(/"/g, '""')}"`,
    `"${p.model.replace(/"/g, '""')}"`,
    p.inStock ? 'YES' : 'NO',
    p.stockQuantity.toString(),
    p.weightKg.toString(),
    p.attributes?.ergonomicGrade || 'Standard',
    `"${(p.notes || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
