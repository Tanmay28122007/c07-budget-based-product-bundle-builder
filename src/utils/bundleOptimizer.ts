import { Product, RequiredSlot, ShippingRule, TaxRule, BundleValidationResult } from '../types';
import { validateBundle } from './bundleValidation';
import { formatINR } from './pricing';
import { getPredefinedBaselineBundles } from './bundleRecommendations';

export interface OptimizationResult {
  success: boolean;
  bundleItems: Record<string, Product> | null;
  validation: BundleValidationResult | null;
  reason?: string;
  limitingFactor?: 'insufficient_stock' | 'compatibility_constraints' | 'missing_eligible_products' | 'budget_constraints';
  combinationsEvaluated: number;
  feasibleCount: number;
}

/**
 * Searches the available catalogue to find a valid bundle that fills every required slot,
 * uses only in-stock items, satisfies all compatibility constraints, and fits within the budget.
 */
export function findValidBundle(
  allProducts: Product[],
  requiredSlots: RequiredSlot[],
  budget: number,
  shippingRule: ShippingRule,
  taxRule: TaxRule,
  preference: 'lowest_cost' | 'best_value' = 'lowest_cost'
): OptimizationResult {
  // If there are no hardcoded required slots, find the best compatible combination of items
  if (requiredSlots.length === 0) {
    const predefined = getPredefinedBaselineBundles(allProducts, shippingRule, taxRule, budget);
    const validPredefined = predefined.filter(b => b.isWithinBudget && b.items.every(it => it.product.inStock));

    if (validPredefined.length > 0) {
      const chosen = preference === 'lowest_cost'
        ? [...validPredefined].sort((a, b) => a.landedPrice - b.landedPrice)[0]
        : [...validPredefined].sort((a, b) => b.landedPrice - a.landedPrice)[0];

      const bundleItems: Record<string, Product> = {};
      for (const item of chosen.items) {
        for (let i = 0; i < item.quantity; i++) {
          const key = item.quantity > 1 ? `${item.product.category} (${i + 1})` : item.product.category;
          bundleItems[key] = item.product;
        }
      }
      const val = validateBundle(bundleItems, requiredSlots, budget, shippingRule, taxRule);
      return {
        success: true,
        bundleItems,
        validation: val,
        combinationsEvaluated: predefined.length,
        feasibleCount: validPredefined.length
      };
    }

    // Fallback: build bundle from affordable in-stock catalogue items
    const inStock = allProducts.filter(p => p.inStock && (p.stockQuantity === undefined || p.stockQuantity > 0));
    const sorted = [...inStock].sort((a, b) => preference === 'lowest_cost' ? a.price - b.price : b.price - a.price);
    const selected: Record<string, Product> = {};

    for (const p of sorted) {
      const candidate = { ...selected, [p.category]: p };
      const testVal = validateBundle(candidate, requiredSlots, budget, shippingRule, taxRule);
      if (testVal.isValid && testVal.isWithinBudget) {
        selected[p.category] = p;
      }
    }

    if (Object.keys(selected).length > 0) {
      const val = validateBundle(selected, requiredSlots, budget, shippingRule, taxRule);
      return {
        success: true,
        bundleItems: selected,
        validation: val,
        combinationsEvaluated: sorted.length,
        feasibleCount: 1
      };
    }

    return {
      success: false,
      bundleItems: null,
      validation: null,
      reason: `No configuration satisfies constraints within the current budget of ${formatINR(budget)}.`,
      limitingFactor: 'budget_constraints',
      combinationsEvaluated: 0,
      feasibleCount: 0
    };
  }
  // 1. Group candidate products by slot category and filter in-stock
  const slotCandidates: Record<string, Product[]> = {};

  for (const slot of requiredSlots) {
    const eligible = allProducts.filter(
      p => p.category === slot.category && p.inStock && (p.stockQuantity === undefined || p.stockQuantity > 0)
    );

    if (eligible.length === 0) {
      return {
        success: false,
        bundleItems: null,
        validation: null,
        reason: `No in-stock products are available for required slot "${slot.label}" (${slot.category}).`,
        limitingFactor: 'insufficient_stock',
        combinationsEvaluated: 0,
        feasibleCount: 0
      };
    }

    // Sort by price: low to high for lowest_cost, high to low for best_value
    slotCandidates[slot.id] = [...eligible].sort((a, b) => {
      if (preference === 'lowest_cost') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  }

  // 2. Cartesian product search across slot candidates
  const slotIds = requiredSlots.map(s => s.id);
  let combinationsEvaluated = 0;
  const feasibleBundles: { items: Record<string, Product>; validation: BundleValidationResult }[] = [];
  let lowestCostBundle: { items: Record<string, Product>; validation: BundleValidationResult } | null = null;
  let minLandedPriceSeen = Infinity;
  let encounteredCompatibilityIssue = false;

  function backtrack(index: number, current: Record<string, Product>) {
    if (index === slotIds.length) {
      combinationsEvaluated++;
      const validation = validateBundle(current, requiredSlots, budget, shippingRule, taxRule);

      if (validation.compatibilityViolations.length > 0) {
        encounteredCompatibilityIssue = true;
      }

      if (validation.isValid) {
        feasibleBundles.push({ items: { ...current }, validation });
      }

      if (validation.isComplete && validation.isInStock && validation.isCompatible) {
        if (validation.landedPrice.landedPrice < minLandedPriceSeen) {
          minLandedPriceSeen = validation.landedPrice.landedPrice;
          lowestCostBundle = { items: { ...current }, validation };
        }
      }
      return;
    }

    const slotId = slotIds[index];
    const candidates = slotCandidates[slotId];

    for (const candidate of candidates) {
      current[slotId] = candidate;
      backtrack(index + 1, current);
      delete current[slotId];
    }
  }

  backtrack(0, {});

  // 3. Evaluate outcome
  if (feasibleBundles.length > 0) {
    // Pick the chosen bundle based on preference
    feasibleBundles.sort((a, b) => {
      if (preference === 'lowest_cost') {
        return a.validation.landedPrice.landedPrice - b.validation.landedPrice.landedPrice;
      } else {
        return b.validation.landedPrice.landedPrice - a.validation.landedPrice.landedPrice;
      }
    });

    const chosen = feasibleBundles[0];
    return {
      success: true,
      bundleItems: chosen.items,
      validation: chosen.validation,
      combinationsEvaluated,
      feasibleCount: feasibleBundles.length
    };
  }

  // If no feasible bundle was found, identify the precise limiting factor
  if (lowestCostBundle !== null && minLandedPriceSeen > budget) {
    return {
      success: false,
      bundleItems: null,
      validation: (lowestCostBundle as any).validation,
      reason: `No combination of products fits within the budget of ${formatINR(budget)}. The lowest possible compatible bundle landed cost is ${formatINR(minLandedPriceSeen)} (including shipping and taxes).`,
      limitingFactor: 'budget_constraints',
      combinationsEvaluated,
      feasibleCount: 0
    };
  }

  if (encounteredCompatibilityIssue) {
    return {
      success: false,
      bundleItems: null,
      validation: null,
      reason: `Available products in the required categories have conflicting physical or mounting compatibility constraints.`,
      limitingFactor: 'compatibility_constraints',
      combinationsEvaluated,
      feasibleCount: 0
    };
  }

  return {
    success: false,
    bundleItems: null,
    validation: null,
    reason: `Could not assemble a valid bundle within the specified parameters.`,
    limitingFactor: 'missing_eligible_products',
    combinationsEvaluated,
    feasibleCount: 0
  };
}
