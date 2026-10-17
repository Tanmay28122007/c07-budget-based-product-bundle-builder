import {
  Product,
  RequiredSlot,
  ShippingRule,
  TaxRule,
  ReferenceRequest,
  TestExecutionResult
} from '../types';
import { validateBundle } from './bundleValidation';
import { findValidBundle } from './bundleOptimizer';
import { formatINR } from './pricing';

export interface EdgeCaseScenario {
  id: string;
  name: string;
  description: string;
  execute: (
    products: Product[],
    slots: RequiredSlot[],
    shippingRule: ShippingRule,
    taxRule: TaxRule
  ) => TestExecutionResult;
}

export function runReferenceRequestTest(
  ref: ReferenceRequest,
  allProducts: Product[],
  requiredSlots: RequiredSlot[],
  shippingRule: ShippingRule,
  taxRule: TaxRule
): TestExecutionResult {
  const activeSlots: RequiredSlot[] = ref.requiredSlotIds.map(slotName => {
    const existing = requiredSlots.find(s => s.id === slotName);
    return existing || {
      id: slotName,
      label: slotName,
      category: slotName,
      description: `Required ${slotName}`,
      priority: 'required' as const
    };
  });

  let actualResult = '';
  let compatibilityOutcome: TestExecutionResult['compatibilityOutcome'] = 'Compatible';
  let stockOutcome: TestExecutionResult['stockOutcome'] = 'All In-Stock';
  let passed = false;
  let landedPrice = 0;
  let explanation = '';

  if (ref.preselectedItems && Object.keys(ref.preselectedItems).length > 0) {
    // Test a specific preselected configuration
    const items: Record<string, Product | null> = {};
    for (const slot of activeSlots) {
      const prodId = ref.preselectedItems[slot.id];
      items[slot.id] = allProducts.find(p => p.id === prodId) || null;
    }

    const validation = validateBundle(items, activeSlots, ref.budget, shippingRule, taxRule);
    landedPrice = validation.landedPrice.landedPrice;

    if (validation.outOfStockSlotIds.length > 0) {
      stockOutcome = 'Out-of-Stock Item';
    }
    if (validation.compatibilityViolations.length > 0) {
      compatibilityOutcome = 'Incompatible';
    }

    const actualFeasible = validation.isValid;
    actualResult = actualFeasible ? 'Valid Bundle Formed' : `Invalid (${validation.statusMessage})`;

    passed = (actualFeasible === ref.expectedFeasible);
    if (!passed) {
      explanation = `Expected bundle validity to be ${ref.expectedFeasible ? 'VALID' : 'INVALID'}, but evaluated as ${actualFeasible ? 'VALID' : 'INVALID'}. Status: ${validation.statusMessage}`;
    } else {
      explanation = `Correctly evaluated bundle validity as ${actualFeasible ? 'VALID' : 'INVALID'}. Landed price: ${formatINR(landedPrice)} vs Budget: ${formatINR(ref.budget)}.`;
    }
  } else {
    // Run bundle search optimizer with the budget
    const optResult = findValidBundle(allProducts, activeSlots, ref.budget, shippingRule, taxRule);
    landedPrice = optResult.validation?.landedPrice.landedPrice || 0;

    const actualFeasible = optResult.success;
    actualResult = actualFeasible ? `Feasible Bundle Found (${formatINR(landedPrice)})` : `Infeasible (${optResult.reason || 'No solution'})`;

    passed = (actualFeasible === ref.expectedFeasible);
    if (actualFeasible && ref.expectedLandedPriceMax && landedPrice > ref.expectedLandedPriceMax) {
      passed = false;
    }

    if (actualFeasible && ref.expectedIds && ref.expectedIds.length > 0 && optResult.bundleItems) {
      const actualIds = Object.values(optResult.bundleItems).map(p => p.id).sort();
      const expIds = [...ref.expectedIds].sort();
      const match = expIds.every(id => actualIds.includes(id));
      if (!match) {
        passed = false;
        explanation = `Found bundle [${actualIds.join(', ')}] but expected [${expIds.join(', ')}].`;
      }
    }

    if (!passed && !explanation) {
      explanation = `Expected feasibility ${ref.expectedFeasible ? 'TRUE' : 'FALSE'}, but got ${actualFeasible ? 'TRUE' : 'FALSE'}. Detail: ${optResult.reason || 'N/A'}`;
    } else if (!explanation) {
      explanation = `Correctly determined feasibility as ${actualFeasible ? 'FEASIBLE' : 'INFEASIBLE'}. ${optResult.reason || `Evaluated ${optResult.combinationsEvaluated} combinations.`}`;
    }
  }

  return {
    testId: ref.id,
    testType: 'reference_request',
    title: ref.title,
    budget: ref.budget,
    requiredSlots: ref.requiredSlotIds,
    expectedResult: ref.expectedFeasible ? 'Valid / Feasible Bundle' : 'Invalid / Infeasible Bundle',
    actualResult,
    landedPrice,
    compatibilityOutcome,
    stockOutcome,
    passed,
    explanation,
    timestamp: new Date().toLocaleTimeString()
  };
}

export const EDGE_CASE_TESTS: EdgeCaseScenario[] = [
  {
    id: "EDGE-001",
    name: "Cheapest Products Incompatible / Zero Stock Conflict",
    description: "Verify that naive selection of cheapest items fails when stock or compatibility constraints are violated.",
    execute: (products, slots, shippingRule, taxRule) => {
      const isC07 = products.some(p => p.id.startsWith('P0'));
      if (isC07) {
        const zeroStockItem = products.find(p => p.stockQuantity === 0) || products.find(p => p.id === 'P01');
        const items: Record<string, Product | null> = {};
        for (const slot of slots) {
          items[slot.id] = zeroStockItem || null;
        }
        const validation = validateBundle(items, slots, 100000, shippingRule, taxRule);
        const passed = !validation.isValid;
        return {
          testId: "EDGE-001",
          testType: 'edge_case',
          title: "Cheapest Products Incompatible / Zero Stock Conflict",
          budget: 100000,
          requiredSlots: slots.map(s => s.id),
          expectedResult: "Bundle marked INVALID due to constraint violation",
          actualResult: validation.isValid ? "INVALID (Allowed invalid configuration)" : "Correctly REJECTED (Constraint Error)",
          landedPrice: validation.landedPrice.landedPrice,
          compatibilityOutcome: validation.isCompatible ? 'Compatible' : 'Incompatible',
          stockOutcome: validation.isInStock ? 'All In-Stock' : 'Out-of-Stock Item',
          passed,
          explanation: passed ? "Engine correctly rejected bundle with zero-stock cheapest candidate." : "Engine erroneously allowed invalid configuration.",
          timestamp: new Date().toLocaleTimeString()
        };
      }
      const items: Record<string, Product | null> = {};
      for (const slot of slots) {
        const slotProds = products.filter(p => p.category === slot.category).sort((a, b) => a.price - b.price);
        items[slot.id] = slotProds[0] || null;
      }
      items['monitor'] = products.find(p => p.id === 'MON-004') || null;
      items['laptop_stand_or_dock'] = products.find(p => p.id === 'DCK-003') || null;
      const validation = validateBundle(items, slots, 100000, shippingRule, taxRule);
      const passed = !validation.isCompatible && !validation.isValid;
      return {
        testId: "EDGE-001",
        testType: 'edge_case',
        title: "Cheapest Products Incompatible",
        budget: 100000,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Bundle marked INVALID due to compatibility violation",
        actualResult: validation.isValid ? "INVALID (Allowed incompatible items)" : "Correctly REJECTED (Compatibility Error)",
        landedPrice: validation.landedPrice.landedPrice,
        compatibilityOutcome: validation.isCompatible ? 'Compatible' : 'Incompatible',
        stockOutcome: validation.isInStock ? 'All In-Stock' : 'Out-of-Stock Item',
        passed,
        explanation: passed ? `Engine caught compatibility conflict between ${validation.compatibilityViolations[0]?.sourceProductName} and ${validation.compatibilityViolations[0]?.targetProductName}.` : "Engine failed to catch incompatibility.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-002",
    name: "No Product In Stock for Required Slot",
    description: "Verify bundle cannot be marked valid when an entire slot has zero stock or selected item has 0 stock.",
    execute: (products, slots, shippingRule, taxRule) => {
      const items: Record<string, Product | null> = {};
      const outOfStockItem = products.find(p => !p.inStock || p.stockQuantity === 0);
      for (const slot of slots) {
        items[slot.id] = outOfStockItem || null;
      }
      const validation = validateBundle(items, slots, 100000, shippingRule, taxRule);
      const passed = !validation.isInStock && !validation.isValid;
      return {
        testId: "EDGE-002",
        testType: 'edge_case',
        title: "No Product In Stock for Required Slot",
        budget: 100000,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Bundle marked INVALID (Out of Stock)",
        actualResult: validation.isInStock ? "INVALID (Allowed out of stock item)" : "Correctly REJECTED (Stock Check Failed)",
        landedPrice: validation.landedPrice.landedPrice,
        compatibilityOutcome: validation.isCompatible ? 'Compatible' : 'Incompatible',
        stockOutcome: 'Out-of-Stock Item',
        passed,
        explanation: passed ? `Engine flagged ${outOfStockItem?.name || 'item'} as out of stock (quantity 0) and refused bundle approval.` : "Engine erroneously validated out-of-stock item.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-003",
    name: "Required Slot is Empty",
    description: "Verify bundle cannot be valid when 1 or more required slots are unassigned.",
    execute: (products, slots, shippingRule, taxRule) => {
      const items: Record<string, Product | null> = {};
      slots.forEach((s, idx) => {
        if (idx === 0) {
          items[s.id] = products.find(p => p.category === s.category && p.inStock) || null;
        } else {
          items[s.id] = null;
        }
      });
      const validation = validateBundle(items, slots, 100000, shippingRule, taxRule);
      const passed = !validation.isComplete && !validation.isValid;
      return {
        testId: "EDGE-003",
        testType: 'edge_case',
        title: "Required Slot is Empty",
        budget: 100000,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Bundle marked INCOMPLETE & INVALID",
        actualResult: validation.isComplete ? "INVALID (Treated empty slot as complete)" : `INCOMPLETE (${validation.filledSlotCount}/${validation.totalSlotCount} filled)`,
        landedPrice: validation.landedPrice.landedPrice,
        compatibilityOutcome: validation.isCompatible ? 'Compatible' : 'Incompatible',
        stockOutcome: 'All In-Stock',
        passed,
        explanation: passed ? `Engine identified unfilled required slot "${validation.missingSlotIds[0]}" and prevented completion.` : "Engine failed to enforce required slot assignment.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-004",
    name: "Duplicate Slot Assignment",
    description: "Verify that assigning the same physical product to multiple slots is caught as a duplicate error.",
    execute: (products, slots, shippingRule, taxRule) => {
      const p = products.find(item => item.inStock) || products[0];
      const items: Record<string, Product | null> = {};
      for (const slot of slots) {
        items[slot.id] = p || null;
      }
      const validation = validateBundle(items, slots, 100000, shippingRule, taxRule);
      const passed = validation.duplicateViolations.length > 0 && !validation.isValid;
      return {
        testId: "EDGE-004",
        testType: 'edge_case',
        title: "Duplicate Slot Assignment",
        budget: 100000,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Bundle REJECTED with Duplicate Slot Assignment error",
        actualResult: validation.duplicateViolations.length > 0 ? "Correctly REJECTED (Duplicate detected)" : "FAILED (Duplicate went undetected)",
        landedPrice: validation.landedPrice.landedPrice,
        compatibilityOutcome: 'Compatible',
        stockOutcome: 'All In-Stock',
        passed,
        explanation: passed ? `Engine caught duplicate assignment of ${p?.name} (${p?.id}) across slots.` : "Engine allowed duplicate assignment.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-005",
    name: "Budget Cannot Fund Minimum Feasible Bundle",
    description: "Verify that when customer budget is less than the lowest possible landed combination, search reports failure with diagnostic reason.",
    execute: (products, slots, shippingRule, taxRule) => {
      const tinyBudget = 500;
      const optResult = findValidBundle(products, slots, tinyBudget, shippingRule, taxRule);
      const passed = !optResult.success && optResult.limitingFactor === 'budget_constraints';
      return {
        testId: "EDGE-005",
        testType: 'edge_case',
        title: "Budget Cannot Fund Minimum Feasible Bundle",
        budget: tinyBudget,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Report INFEASIBLE due to budget constraints",
        actualResult: optResult.success ? "FAILED (Created bundle over budget)" : "Correctly INFEASIBLE",
        landedPrice: optResult.validation?.landedPrice.landedPrice || 0,
        compatibilityOutcome: 'Compatible',
        stockOutcome: 'All In-Stock',
        passed,
        explanation: passed ? `Engine evaluated combinations and determined minimum feasible cost exceeds budget: "${optResult.reason}"` : "Engine did not properly diagnose budget constraint as limiting factor.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-006",
    name: "Shipping Pushes Total Over Budget",
    description: "Verify that subtotal is within budget, but shipping charges push the final landed price over budget.",
    execute: (products, slots, shippingRule, taxRule) => {
      const isC07 = products.some(p => p.id.startsWith('P0'));
      if (isC07) {
        const items: Record<string, Product | null> = {
          Mouse: products.find(p => p.id === 'P07') || null,
          Keyboard: products.find(p => p.id === 'P08') || null
        };
        const targetBudget = 1950;
        const validation = validateBundle(items, slots, targetBudget, shippingRule, taxRule);
        const passed = validation.landedPrice.productSubtotal <= targetBudget &&
                       validation.landedPrice.landedPrice > targetBudget &&
                       !validation.isValid;
        return {
          testId: "EDGE-006",
          testType: 'edge_case',
          title: "Shipping Pushes Total Over Budget",
          budget: targetBudget,
          requiredSlots: slots.map(s => s.id),
          expectedResult: "Bundle marked OVER BUDGET due to shipping fee inclusion",
          actualResult: validation.isValid ? "FAILED (Ignored shipping impact)" : "Correctly OVER BUDGET",
          landedPrice: validation.landedPrice.landedPrice,
          compatibilityOutcome: 'Compatible',
          stockOutcome: 'All In-Stock',
          passed,
          explanation: passed ? `Subtotal (${formatINR(validation.landedPrice.productSubtotal)}) fits under ₹1,950 budget, but shipping (+${formatINR(validation.landedPrice.netShipping)}) brings landed price to ${formatINR(validation.landedPrice.landedPrice)}, correctly exceeding budget.` : "Calculation failed to flag over-budget caused by shipping.",
          timestamp: new Date().toLocaleTimeString()
        };
      }
      const items: Record<string, Product | null> = {
        desk: products.find(p => p.id === 'DSK-003') || null,
        chair: products.find(p => p.id === 'CHR-003') || null,
        monitor: products.find(p => p.id === 'MON-002') || null,
        laptop_stand_or_dock: products.find(p => p.id === 'DCK-002') || null,
        peripherals: products.find(p => p.id === 'PER-003') || null,
        lighting: products.find(p => p.id === 'LGT-003') || null
      };
      const targetBudget = 33800;
      const validation = validateBundle(items, slots, targetBudget, shippingRule, taxRule);
      const passed = validation.landedPrice.productSubtotal + validation.landedPrice.taxAmount <= targetBudget &&
                     validation.landedPrice.landedPrice > targetBudget &&
                     !validation.isValid;
      return {
        testId: "EDGE-006",
        testType: 'edge_case',
        title: "Shipping Pushes Total Over Budget",
        budget: targetBudget,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Bundle marked OVER BUDGET due to shipping fee inclusion",
        actualResult: validation.isValid ? "FAILED (Ignored shipping impact)" : "Correctly OVER BUDGET",
        landedPrice: validation.landedPrice.landedPrice,
        compatibilityOutcome: 'Compatible',
        stockOutcome: 'All In-Stock',
        passed,
        explanation: passed ? `Subtotal + GST fits under budget, but shipping pushes total to ${formatINR(validation.landedPrice.landedPrice)}.` : "Calculation failed to flag over-budget caused by shipping.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-007",
    name: "Zero Budget Boundary Enforcement",
    description: "Verify that zero or negative budget input strictly invalidates bundles and prevents checkout.",
    execute: (products, slots, shippingRule, taxRule) => {
      const items: Record<string, Product | null> = {};
      slots.forEach(s => {
        items[s.id] = products.find(p => p.category === s.category && p.inStock) || null;
      });
      const validation = validateBundle(items, slots, 0, shippingRule, taxRule);
      const passed = !validation.isWithinBudget && !validation.isValid;
      return {
        testId: "EDGE-007",
        testType: 'edge_case',
        title: "Zero Budget Boundary Enforcement",
        budget: 0,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Bundle marked OVER BUDGET (Budget = ₹0)",
        actualResult: validation.isValid ? "FAILED (Allowed ₹0 budget)" : "Correctly REJECTED (Zero Budget)",
        landedPrice: validation.landedPrice.landedPrice,
        compatibilityOutcome: 'Compatible',
        stockOutcome: 'All In-Stock',
        passed,
        explanation: passed ? `Engine confirmed that bundle landed price (${formatINR(validation.landedPrice.landedPrice)}) exceeds ₹0 budget limit.` : "Failed to enforce zero budget boundary.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-008",
    name: "Replacement Causes Incompatibility / Invalid State",
    description: "Verify that replacing a valid item with an invalid candidate triggers immediate revalidation failure.",
    execute: (products, slots, shippingRule, taxRule) => {
      const isC07 = products.some(p => p.id.startsWith('P0'));
      if (isC07) {
        const items: Record<string, Product | null> = {
          Mouse: products.find(p => p.id === 'P07') || null,
          Keyboard: products.find(p => p.id === 'P08') || null
        };
        const initialVal = validateBundle(items, slots, 2200, shippingRule, taxRule);
        items['Mouse'] = products.find(p => p.id === 'P01') || null;
        const replacedVal = validateBundle(items, slots, 2200, shippingRule, taxRule);
        const passed = initialVal.isValid && !replacedVal.isValid;
        return {
          testId: "EDGE-008",
          testType: 'edge_case',
          title: "Replacement Causes Invalid State",
          budget: 2200,
          requiredSlots: slots.map(s => s.id),
          expectedResult: "Replacement triggers immediate validity failure",
          actualResult: replacedVal.isValid ? "FAILED (Allowed invalid replacement)" : "Correctly REJECTED (Invalid Replacement)",
          landedPrice: replacedVal.landedPrice.landedPrice,
          compatibilityOutcome: replacedVal.isCompatible ? 'Compatible' : 'Incompatible',
          stockOutcome: replacedVal.isInStock ? 'All In-Stock' : 'Out-of-Stock Item',
          passed,
          explanation: passed ? "Replacing product with an ineligible item immediately flagged the bundle as invalid." : "Failed to catch invalid replacement.",
          timestamp: new Date().toLocaleTimeString()
        };
      }
      const items: Record<string, Product | null> = {
        desk: products.find(p => p.id === 'DSK-003') || null,
        chair: products.find(p => p.id === 'CHR-003') || null,
        monitor: products.find(p => p.id === 'MON-002') || null,
        laptop_stand_or_dock: products.find(p => p.id === 'DCK-002') || null,
        peripherals: products.find(p => p.id === 'PER-003') || null,
        lighting: products.find(p => p.id === 'LGT-003') || null
      };
      const initialValidation = validateBundle(items, slots, 100000, shippingRule, taxRule);
      items['monitor'] = products.find(p => p.id === 'MON-003') || null;
      const replacedValidation = validateBundle(items, slots, 100000, shippingRule, taxRule);
      const passed = initialValidation.isCompatible && !replacedValidation.isCompatible && !replacedValidation.isValid;
      return {
        testId: "EDGE-008",
        testType: 'edge_case',
        title: "Replacement Causes Incompatibility",
        budget: 100000,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Replacement triggers immediate compatibility failure",
        actualResult: replacedValidation.isCompatible ? "FAILED" : "Correctly REJECTED (Triggered desk width rule)",
        landedPrice: replacedValidation.landedPrice.landedPrice,
        compatibilityOutcome: replacedValidation.isCompatible ? 'Compatible' : 'Incompatible',
        stockOutcome: 'All In-Stock',
        passed,
        explanation: passed ? `Replacing monitor with MON-003 caused violation: "${replacedValidation.compatibilityViolations[0]?.message}"` : "System failed to detect incompatibility upon replacing product.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-009",
    name: "Replacement Exceeds Budget",
    description: "Verify that replacing an item that pushes total landed cost beyond budget flips validity to invalid.",
    execute: (products, slots, shippingRule, taxRule) => {
      const isC07 = products.some(p => p.id.startsWith('P0'));
      if (isC07) {
        const items: Record<string, Product | null> = {
          Mouse: products.find(p => p.id === 'P07') || null,
          Keyboard: products.find(p => p.id === 'P08') || null
        };
        const initialVal = validateBundle(items, slots, 2000, shippingRule, taxRule);
        items['Mouse'] = products.find(p => p.id === 'P12') || null;
        const replacedVal = validateBundle(items, slots, 2000, shippingRule, taxRule);
        const passed = initialVal.isWithinBudget && !replacedVal.isWithinBudget && !replacedVal.isValid;
        return {
          testId: "EDGE-009",
          testType: 'edge_case',
          title: "Replacement Exceeds Budget",
          budget: 2000,
          requiredSlots: slots.map(s => s.id),
          expectedResult: "Replacement triggers OVER BUDGET invalidation",
          actualResult: replacedVal.isWithinBudget ? "FAILED" : `Correctly OVER BUDGET (Landed: ${formatINR(replacedVal.landedPrice.landedPrice)})`,
          landedPrice: replacedVal.landedPrice.landedPrice,
          compatibilityOutcome: 'Compatible',
          stockOutcome: 'All In-Stock',
          passed,
          explanation: passed ? `Replacement escalated landed price from ${formatINR(initialVal.landedPrice.landedPrice)} to ${formatINR(replacedVal.landedPrice.landedPrice)}, correctly exceeding ₹2,000 budget.` : "Failed to revalidate budget on product replacement.",
          timestamp: new Date().toLocaleTimeString()
        };
      }
      const budget = 58000;
      const items: Record<string, Product | null> = {
        desk: products.find(p => p.id === 'DSK-002') || null,
        chair: products.find(p => p.id === 'CHR-003') || null,
        monitor: products.find(p => p.id === 'MON-002') || null,
        laptop_stand_or_dock: products.find(p => p.id === 'DCK-002') || null,
        peripherals: products.find(p => p.id === 'PER-002') || null,
        lighting: products.find(p => p.id === 'LGT-002') || null
      };
      const initialValidation = validateBundle(items, slots, budget, shippingRule, taxRule);
      items['chair'] = products.find(p => p.id === 'CHR-002') || null;
      const replacedValidation = validateBundle(items, slots, budget, shippingRule, taxRule);
      const passed = initialValidation.isWithinBudget && !replacedValidation.isWithinBudget && !replacedValidation.isValid;
      return {
        testId: "EDGE-009",
        testType: 'edge_case',
        title: "Replacement Exceeds Budget",
        budget,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Replacement triggers OVER BUDGET invalidation",
        actualResult: replacedValidation.isWithinBudget ? "FAILED" : `Correctly OVER BUDGET (Landed: ${formatINR(replacedValidation.landedPrice.landedPrice)})`,
        landedPrice: replacedValidation.landedPrice.landedPrice,
        compatibilityOutcome: 'Compatible',
        stockOutcome: 'All In-Stock',
        passed,
        explanation: passed ? `Chair upgrade to CHR-002 escalated landed price, exceeding ₹${budget}.` : "Failed to revalidate budget on replacement.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-010",
    name: "Feasible Replacement Preserves Validity",
    description: "Verify that valid bundle configuration within available budget headroom maintains full validity.",
    execute: (products, slots, shippingRule, taxRule) => {
      const isC07 = products.some(p => p.id.startsWith('P0'));
      if (isC07) {
        const items: Record<string, Product | null> = {
          Mouse: products.find(p => p.id === 'P07') || null,
          Keyboard: products.find(p => p.id === 'P08') || null
        };
        const validation = validateBundle(items, slots, 2500, shippingRule, taxRule);
        const passed = validation.isValid && validation.isWithinBudget;
        return {
          testId: "EDGE-010",
          testType: 'edge_case',
          title: "Feasible Replacement Preserves Validity",
          budget: 2500,
          requiredSlots: slots.map(s => s.id),
          expectedResult: "Bundle REMAINS VALID with updated landed price",
          actualResult: validation.isValid ? "PASSED (Preserved full validity)" : `FAILED (${validation.statusMessage})`,
          landedPrice: validation.landedPrice.landedPrice,
          compatibilityOutcome: 'Compatible',
          stockOutcome: 'All In-Stock',
          passed,
          explanation: passed ? `Valid bundle formed (Landed: ${formatINR(validation.landedPrice.landedPrice)}) with ${formatINR(validation.landedPrice.remainingBudget)} headroom remaining.` : "System failed valid configuration.",
          timestamp: new Date().toLocaleTimeString()
        };
      }
      const budget = 65000;
      const items: Record<string, Product | null> = {
        desk: products.find(p => p.id === 'DSK-002') || null,
        chair: products.find(p => p.id === 'CHR-001') || null,
        monitor: products.find(p => p.id === 'MON-002') || null,
        laptop_stand_or_dock: products.find(p => p.id === 'DCK-002') || null,
        peripherals: products.find(p => p.id === 'PER-003') || null,
        lighting: products.find(p => p.id === 'LGT-002') || null
      };
      const initialValidation = validateBundle(items, slots, budget, shippingRule, taxRule);
      items['peripherals'] = products.find(p => p.id === 'PER-002') || null;
      const replacedValidation = validateBundle(items, slots, budget, shippingRule, taxRule);
      const passed = initialValidation.isValid && replacedValidation.isValid;
      return {
        testId: "EDGE-010",
        testType: 'edge_case',
        title: "Feasible Replacement Preserves Validity",
        budget,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Bundle REMAINS VALID with updated landed price",
        actualResult: replacedValidation.isValid ? "PASSED (Preserved full validity)" : `FAILED (${replacedValidation.statusMessage})`,
        landedPrice: replacedValidation.landedPrice.landedPrice,
        compatibilityOutcome: 'Compatible',
        stockOutcome: 'All In-Stock',
        passed,
        explanation: passed ? `Successfully preserved validity with ${formatINR(replacedValidation.landedPrice.remainingBudget)} headroom.` : "Failed valid replacement.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  }
];

export function runAllTests(
  referenceRequests: ReferenceRequest[],
  allProducts: Product[],
  requiredSlots: RequiredSlot[],
  shippingRule: ShippingRule,
  taxRule: TaxRule
): TestExecutionResult[] {
  const results: TestExecutionResult[] = [];

  // Run all 10 Reference Requests
  for (const ref of referenceRequests) {
    results.push(runReferenceRequestTest(ref, allProducts, requiredSlots, shippingRule, taxRule));
  }

  // Run all 10 Edge Cases
  for (const edge of EDGE_CASE_TESTS) {
    results.push(edge.execute(allProducts, requiredSlots, shippingRule, taxRule));
  }

  return results;
}
