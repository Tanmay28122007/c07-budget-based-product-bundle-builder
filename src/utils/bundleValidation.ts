import { Product, RequiredSlot, ShippingRule, TaxRule, BundleValidationResult } from '../types';
import { checkCompatibility } from './compatibility';
import { calculateLandedPrice, formatINR } from './pricing';

export function validateBundle(
  items: Record<string, Product | null>,
  requiredSlots: RequiredSlot[],
  budget: number,
  shippingRule: ShippingRule,
  taxRule: TaxRule
): BundleValidationResult {
  const selectedProducts = Object.values(items).filter((p): p is Product => Boolean(p));
  const totalSlotCount = requiredSlots.length;

  const missingSlotIds: string[] = [];
  const outOfStockSlotIds: string[] = [];
  const seenProductIds = new Set<string>();
  const duplicateViolations: string[] = [];

  for (const slot of requiredSlots) {
    const prod = items[slot.id];
    if (!prod) {
      missingSlotIds.push(slot.id);
    } else {
      if (!prod.inStock || (prod.stockQuantity !== undefined && prod.stockQuantity <= 0)) {
        outOfStockSlotIds.push(slot.id);
      }
      if (seenProductIds.has(prod.id)) {
        duplicateViolations.push(`Product "${prod.name}" (${prod.id}) is assigned to multiple slots.`);
      }
      seenProductIds.add(prod.id);
    }
  }

  const filledSlotCount = totalSlotCount - missingSlotIds.length;
  const isComplete = missingSlotIds.length === 0;
  const isInStock = outOfStockSlotIds.length === 0;

  // Compatibility checking
  const compatibilityViolations = checkCompatibility(selectedProducts);
  const isCompatible = compatibilityViolations.length === 0;

  // Pricing calculations
  const landedPrice = calculateLandedPrice(selectedProducts, budget, shippingRule, taxRule);
  const isWithinBudget = !landedPrice.isOverBudget;

  const isValid = isComplete && isInStock && isCompatible && isWithinBudget && duplicateViolations.length === 0;

  // Determine status message and limiting factor
  let statusMessage = 'Valid bundle ready for checkout.';
  let limitingFactor: BundleValidationResult['limitingFactor'] = null;

  if (duplicateViolations.length > 0) {
    statusMessage = duplicateViolations[0];
    limitingFactor = 'compatibility_constraints';
  } else if (!isInStock) {
    statusMessage = `Contains out-of-stock item in ${outOfStockSlotIds.length} slot(s).`;
    limitingFactor = 'insufficient_stock';
  } else if (!isCompatible) {
    statusMessage = `Compatibility conflict: ${compatibilityViolations[0].message}`;
    limitingFactor = 'compatibility_constraints';
  } else if (!isComplete && landedPrice.isOverBudget) {
    statusMessage = `Incomplete bundle (${filledSlotCount}/${totalSlotCount} slots) and already exceeds budget by ${formatINR(Math.abs(landedPrice.remainingBudget))}.`;
    limitingFactor = 'budget_constraints';
  } else if (!isComplete) {
    statusMessage = `Incomplete bundle: ${missingSlotIds.length} required slot(s) unfilled (${filledSlotCount}/${totalSlotCount}).`;
    limitingFactor = 'missing_eligible_products';
  } else if (landedPrice.isOverBudget) {
    statusMessage = `Complete bundle exceeds budget by ${formatINR(Math.abs(landedPrice.remainingBudget))}.`;
    limitingFactor = 'budget_constraints';
  }

  return {
    isValid,
    isComplete,
    isInStock,
    isCompatible,
    isWithinBudget,
    filledSlotCount,
    totalSlotCount,
    missingSlotIds,
    outOfStockSlotIds,
    duplicateViolations,
    compatibilityViolations,
    landedPrice,
    statusMessage,
    limitingFactor
  };
}
