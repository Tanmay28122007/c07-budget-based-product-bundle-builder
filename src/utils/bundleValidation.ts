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
  const hasExplicitSlots = requiredSlots.length > 0;
  const totalSlotCount = hasExplicitSlots ? requiredSlots.length : selectedProducts.length;

  const missingSlotIds: string[] = [];
  const outOfStockSlotIds: string[] = [];
  const seenProductIds = new Set<string>();
  const duplicateViolations: string[] = [];

  if (hasExplicitSlots) {
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
  }

  // Also check non-slot / dynamic selected products for stock and duplicates
  for (const [key, prod] of Object.entries(items)) {
    if (prod && (!hasExplicitSlots || !requiredSlots.some(s => s.id === key))) {
      if (!prod.inStock || (prod.stockQuantity !== undefined && prod.stockQuantity <= 0)) {
        outOfStockSlotIds.push(key);
      }
      if (seenProductIds.has(prod.id)) {
        duplicateViolations.push(`Product "${prod.name}" (${prod.id}) is added multiple times.`);
      }
      seenProductIds.add(prod.id);
    }
  }

  const filledSlotCount = hasExplicitSlots
    ? totalSlotCount - missingSlotIds.length
    : selectedProducts.length;
  const isComplete = hasExplicitSlots
    ? (missingSlotIds.length === 0 && filledSlotCount > 0)
    : selectedProducts.length > 0;
  const isInStock = outOfStockSlotIds.length === 0;

  // Compatibility checking
  const compatibilityViolations = checkCompatibility(selectedProducts);
  const isCompatible = compatibilityViolations.length === 0;

  // Pricing calculations
  const landedPrice = calculateLandedPrice(selectedProducts, budget, shippingRule, taxRule);
  const isWithinBudget = !landedPrice.isOverBudget;

  const isValid = isComplete && isInStock && isCompatible && isWithinBudget && duplicateViolations.length === 0 && selectedProducts.length > 0;

  // Determine status message and limiting factor
  let statusMessage = 'Valid bundle ready for checkout.';
  let limitingFactor: BundleValidationResult['limitingFactor'] = null;

  if (selectedProducts.length === 0) {
    statusMessage = 'Your bundle is empty. Add products from the catalogue to get started.';
    limitingFactor = null;
  } else if (duplicateViolations.length > 0) {
    statusMessage = duplicateViolations[0];
    limitingFactor = 'compatibility_constraints';
  } else if (!isInStock) {
    statusMessage = `Contains out-of-stock item (${outOfStockSlotIds.join(', ')}).`;
    limitingFactor = 'insufficient_stock';
  } else if (!isCompatible) {
    statusMessage = `Compatibility conflict: ${compatibilityViolations[0].message}`;
    limitingFactor = 'compatibility_constraints';
  } else if (landedPrice.isOverBudget) {
    statusMessage = `Bundle exceeds budget by ${formatINR(Math.abs(landedPrice.remainingBudget))}.`;
    limitingFactor = 'budget_constraints';
  } else if (!isComplete && hasExplicitSlots) {
    statusMessage = `Incomplete bundle: ${missingSlotIds.length} required slot(s) unfilled (${filledSlotCount}/${totalSlotCount}).`;
    limitingFactor = 'missing_eligible_products';
  } else {
    statusMessage = 'Valid bundle ready for checkout.';
    limitingFactor = null;
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
