import { Product, ShippingRule, TaxRule, LandedPriceBreakdown } from '../types';

/**
 * Formats a numeric value into the Indian Rupee (INR) format (e.g., ₹24,999)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculates the complete transparent landed price breakdown for a bundle.
 */
export function calculateLandedPrice(
  selectedProducts: (Product | null | undefined)[],
  budget: number,
  shippingRule: ShippingRule,
  taxRule: TaxRule
): LandedPriceBreakdown {
  const validProducts = selectedProducts.filter((p): p is Product => Boolean(p));

  const productSubtotal = validProducts.reduce((sum, p) => sum + (p.price || 0), 0);

  // Heavy items calculation
  const heavyItemCount = validProducts.filter(
    p => (p.weightKg || 0) >= (shippingRule.heavyThresholdKg || 15)
  ).length;

  let baseShipping = 0;
  let shippingDiscount = 0;

  if (productSubtotal > 0) {
    if (productSubtotal >= shippingRule.freeShippingThreshold) {
      baseShipping = 0;
      shippingDiscount = shippingRule.baseFee;
    } else {
      baseShipping = shippingRule.baseFee;
      shippingDiscount = 0;
    }
  }

  const heavySurcharge = heavyItemCount * (shippingRule.heavyItemSurchargePerItem || 0);
  const netShipping = productSubtotal > 0 ? baseShipping + heavySurcharge : 0;
  const shippingFee = productSubtotal > 0 ? (shippingRule.baseFee + heavySurcharge) : 0;

  // Tax calculation (e.g. 18% GST on product subtotal)
  const taxAmount = Math.round(productSubtotal * (taxRule.taxRate || 0.18));

  const landedPrice = productSubtotal + netShipping + taxAmount;
  const remainingBudget = budget - landedPrice;
  const budgetUtilisationPercent = budget > 0 ? Math.min(Math.round((landedPrice / budget) * 1000) / 10, 999) : 0;
  const isOverBudget = landedPrice > budget;

  return {
    productSubtotal,
    shippingFee,
    shippingDiscount,
    netShipping,
    taxAmount,
    landedPrice,
    budget,
    remainingBudget,
    budgetUtilisationPercent,
    isOverBudget,
    heavyItemCount
  };
}
