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
  const activeSlots = requiredSlots.filter(s => ref.requiredSlotIds.includes(s.id));

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
    if (!passed) {
      explanation = `Expected feasibility ${ref.expectedFeasible ? 'TRUE' : 'FALSE'}, but got ${actualFeasible ? 'TRUE' : 'FALSE'}. Detail: ${optResult.reason || 'N/A'}`;
    } else {
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
    name: "Cheapest Products Incompatible",
    description: "Verify that naive greedy selection of the cheapest products across slots fails when they violate hardware compatibility rules.",
    execute: (products, slots, shippingRule, taxRule) => {
      // Pick cheapest items per slot
      const items: Record<string, Product | null> = {};
      for (const slot of slots) {
        const slotProds = products.filter(p => p.category === slot.category).sort((a, b) => a.price - b.price);
        items[slot.id] = slotProds[0] || null;
      }
      // Compact desk DSK-003 with ultrawide or monitor MON-004 + DCK-003 (DisplayPort only)
      // If we force DSK-003 and MON-004 + DCK-003
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
        explanation: passed
          ? `Engine caught compatibility conflict between ${validation.compatibilityViolations[0]?.sourceProductName} and ${validation.compatibilityViolations[0]?.targetProductName}.`
          : "Engine failed to catch incompatibility between selected budget items.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-002",
    name: "No Product In Stock for Required Slot",
    description: "Verify bundle cannot be marked valid when an entire slot has zero stock or selected item has 0 stock.",
    execute: (products, slots, shippingRule, taxRule) => {
      const items: Record<string, Product | null> = {
        desk: products.find(p => p.id === 'DSK-004') || null, // Out of stock
        chair: products.find(p => p.id === 'CHR-001') || null,
        monitor: products.find(p => p.id === 'MON-002') || null,
        laptop_stand_or_dock: products.find(p => p.id === 'DCK-002') || null,
        peripherals: products.find(p => p.id === 'PER-002') || null,
        lighting: products.find(p => p.id === 'LGT-002') || null
      };

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
        explanation: passed
          ? `Engine flagged DSK-004 as out of stock (quantity 0) and refused bundle approval.`
          : "Engine erroneously validated an out-of-stock item.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-003",
    name: "Required Slot is Empty",
    description: "Verify bundle cannot be valid when 1 or more required slots are unassigned.",
    execute: (products, slots, shippingRule, taxRule) => {
      const items: Record<string, Product | null> = {
        desk: products.find(p => p.id === 'DSK-002') || null,
        chair: products.find(p => p.id === 'CHR-001') || null,
        monitor: products.find(p => p.id === 'MON-002') || null,
        laptop_stand_or_dock: products.find(p => p.id === 'DCK-002') || null,
        peripherals: products.find(p => p.id === 'PER-002') || null,
        lighting: null // Empty slot
      };

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
        explanation: passed
          ? `Engine identified unfilled required slot "lighting" and prevented completion.`
          : "Engine failed to enforce required slot assignment.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-004",
    name: "Duplicate Slot Assignment",
    description: "Verify that assigning the same physical product to multiple slots is caught as a duplicate error.",
    execute: (products, slots, shippingRule, taxRule) => {
      const p = products.find(item => item.id === 'DCK-002');
      const items: Record<string, Product | null> = {
        desk: products.find(item => item.id === 'DSK-002') || null,
        chair: products.find(item => item.id === 'CHR-001') || null,
        monitor: products.find(item => item.id === 'MON-002') || null,
        laptop_stand_or_dock: p || null,
        peripherals: p || null, // Duplicate assignment!
        lighting: products.find(item => item.id === 'LGT-002') || null
      };

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
        explanation: passed
          ? `Engine caught duplicate assignment of ${p?.name} (${p?.id}) across slots.`
          : "Engine allowed duplicate assignment across distinct slots.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-005",
    name: "Budget Cannot Fund Minimum Feasible Bundle",
    description: "Verify that when customer budget is less than the lowest possible landed combination, search reports failure with diagnostic reason.",
    execute: (products, slots, shippingRule, taxRule) => {
      const tinyBudget = 10000; // Impossible for all 6 slots
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
        explanation: passed
          ? `Engine evaluated combinations and determined minimum feasible cost exceeds budget: "${optResult.reason}"`
          : "Engine did not properly diagnose budget constraint as limiting factor.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-006",
    name: "Shipping Pushes Total Over Budget",
    description: "Verify that subtotal is within budget, but shipping charges push the final landed price over budget.",
    execute: (products, slots, shippingRule, taxRule) => {
      // Pick items where subtotal <= budget, but subtotal + shipping > budget (assuming no tax for isolation or fixed)
      const items: Record<string, Product | null> = {
        desk: products.find(p => p.id === 'DSK-003') || null, // 6499
        chair: products.find(p => p.id === 'CHR-003') || null, // 5999
        monitor: products.find(p => p.id === 'MON-002') || null, // 9499
        laptop_stand_or_dock: products.find(p => p.id === 'DCK-002') || null, // 3999
        peripherals: products.find(p => p.id === 'PER-003') || null, // 1299
        lighting: products.find(p => p.id === 'LGT-003') || null // 1199
      };
      // subtotal = 6499 + 5999 + 9499 + 3999 + 1299 + 1199 = 28494
      // Tax (18%) = 5129
      // Heavy shipping = 499 base + 0 (items < 15kg except none > 15kg) = 499
      // Landed = 28494 + 5129 + 499 = 34122
      // Let's set budget = 33800: subtotal + tax = 33623 (< 33800), but + shipping 499 = 34122 (> 33800)
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
        explanation: passed
          ? `Subtotal (${formatINR(validation.landedPrice.productSubtotal)}) + GST is ₹33,623, but shipping (+${formatINR(validation.landedPrice.netShipping)}) pushes total to ${formatINR(validation.landedPrice.landedPrice)}, violating ₹${targetBudget} budget.`
          : "Calculation failed to flag over-budget caused by shipping.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-007",
    name: "Tax Pushes Total Over Budget",
    description: "Verify that subtotal + shipping is within budget, but the 18% GST pushes the final landed price over budget.",
    execute: (products, slots, shippingRule, taxRule) => {
      const items: Record<string, Product | null> = {
        desk: products.find(p => p.id === 'DSK-002') || null, // 11499
        chair: products.find(p => p.id === 'CHR-001') || null, // 14999
        monitor: products.find(p => p.id === 'MON-002') || null, // 9499
        laptop_stand_or_dock: products.find(p => p.id === 'DCK-002') || null, // 3999
        peripherals: products.find(p => p.id === 'PER-002') || null, // 4499
        lighting: products.find(p => p.id === 'LGT-002') || null // 2999
      };
      // subtotal = 47494
      // shipping = 499 base + heavy (desk 18kg = 450, chair 16kg = 450) = 1399
      // subtotal + shipping = 48893
      // tax (18%) = 8549
      // total = 57442
      // Set budget = 50000: subtotal + shipping (48893) <= 50000, but with tax 57442 > 50000
      const targetBudget = 50000;
      const validation = validateBundle(items, slots, targetBudget, shippingRule, taxRule);
      const passed = validation.landedPrice.productSubtotal + validation.landedPrice.netShipping <= targetBudget &&
                     validation.landedPrice.landedPrice > targetBudget &&
                     !validation.isValid;

      return {
        testId: "EDGE-007",
        testType: 'edge_case',
        title: "Tax Pushes Total Over Budget",
        budget: targetBudget,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Bundle marked OVER BUDGET due to mandatory GST inclusion",
        actualResult: validation.isValid ? "FAILED (Omitted tax in budget limit)" : "Correctly OVER BUDGET",
        landedPrice: validation.landedPrice.landedPrice,
        compatibilityOutcome: 'Compatible',
        stockOutcome: 'All In-Stock',
        passed,
        explanation: passed
          ? `Subtotal + Shipping (${formatINR(validation.landedPrice.productSubtotal + validation.landedPrice.netShipping)}) fit under ₹50,000, but 18% GST (${formatINR(validation.landedPrice.taxAmount)}) pushes landed price to ${formatINR(validation.landedPrice.landedPrice)}.`
          : "Tax did not trigger over-budget state as expected.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-008",
    name: "Replacement Causes Incompatibility",
    description: "Verify that replacing a compatible monitor with an ultrawide causes real-time incompatibility against an already-selected compact desk.",
    execute: (products, slots, shippingRule, taxRule) => {
      // Start with compact desk DSK-003 and standard monitor MON-002
      const items: Record<string, Product | null> = {
        desk: products.find(p => p.id === 'DSK-003') || null,
        chair: products.find(p => p.id === 'CHR-003') || null,
        monitor: products.find(p => p.id === 'MON-002') || null,
        laptop_stand_or_dock: products.find(p => p.id === 'DCK-002') || null,
        peripherals: products.find(p => p.id === 'PER-003') || null,
        lighting: products.find(p => p.id === 'LGT-003') || null
      };

      const initialValidation = validateBundle(items, slots, 100000, shippingRule, taxRule);
      const initiallyCompatible = initialValidation.isCompatible;

      // Now replace MON-002 with MON-003 (34-inch ultrawide on 90cm compact desk)
      items['monitor'] = products.find(p => p.id === 'MON-003') || null;
      const replacedValidation = validateBundle(items, slots, 100000, shippingRule, taxRule);

      const passed = initiallyCompatible && !replacedValidation.isCompatible && !replacedValidation.isValid;

      return {
        testId: "EDGE-008",
        testType: 'edge_case',
        title: "Replacement Causes Incompatibility",
        budget: 100000,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Replacement triggers immediate compatibility failure",
        actualResult: replacedValidation.isCompatible ? "FAILED (Did not detect incompatibility)" : "Correctly REJECTED (Triggered desk width rule)",
        landedPrice: replacedValidation.landedPrice.landedPrice,
        compatibilityOutcome: replacedValidation.isCompatible ? 'Compatible' : 'Incompatible',
        stockOutcome: 'All In-Stock',
        passed,
        explanation: passed
          ? `Replacing monitor with MON-003 caused violation: "${replacedValidation.compatibilityViolations[0]?.message}"`
          : "System failed to detect incompatibility upon replacing product.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-009",
    name: "Replacement Exceeds Budget",
    description: "Verify that replacing a mid-tier chair with an executive chair that pushes total landed cost beyond budget flips validity to invalid.",
    execute: (products, slots, shippingRule, taxRule) => {
      const budget = 58000;
      const items: Record<string, Product | null> = {
        desk: products.find(p => p.id === 'DSK-002') || null, // 11499
        chair: products.find(p => p.id === 'CHR-003') || null, // 5999
        monitor: products.find(p => p.id === 'MON-002') || null, // 9499
        laptop_stand_or_dock: products.find(p => p.id === 'DCK-002') || null, // 3999
        peripherals: products.find(p => p.id === 'PER-002') || null, // 4499
        lighting: products.find(p => p.id === 'LGT-002') || null // 2999
      };

      const initialValidation = validateBundle(items, slots, budget, shippingRule, taxRule);
      const initiallyWithinBudget = initialValidation.isWithinBudget;

      // Replace CHR-003 (5999) with CHR-002 (18999, +13,000 difference)
      items['chair'] = products.find(p => p.id === 'CHR-002') || null;
      const replacedValidation = validateBundle(items, slots, budget, shippingRule, taxRule);

      const passed = initiallyWithinBudget && !replacedValidation.isWithinBudget && !replacedValidation.isValid;

      return {
        testId: "EDGE-009",
        testType: 'edge_case',
        title: "Replacement Exceeds Budget",
        budget,
        requiredSlots: slots.map(s => s.id),
        expectedResult: "Replacement triggers OVER BUDGET invalidation",
        actualResult: replacedValidation.isWithinBudget ? "FAILED (Did not flag over budget)" : `Correctly OVER BUDGET (Landed: ${formatINR(replacedValidation.landedPrice.landedPrice)})`,
        landedPrice: replacedValidation.landedPrice.landedPrice,
        compatibilityOutcome: 'Compatible',
        stockOutcome: 'All In-Stock',
        passed,
        explanation: passed
          ? `Chair upgrade to CHR-002 escalated landed price from ${formatINR(initialValidation.landedPrice.landedPrice)} to ${formatINR(replacedValidation.landedPrice.landedPrice)}, exceeding ₹${budget}.`
          : "System failed to revalidate budget on product replacement.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  },
  {
    id: "EDGE-010",
    name: "Feasible Replacement Preserves Validity",
    description: "Verify that replacing a standard keyboard with a premium silent keyboard within available budget headroom maintains full validity.",
    execute: (products, slots, shippingRule, taxRule) => {
      const budget = 65000;
      const items: Record<string, Product | null> = {
        desk: products.find(p => p.id === 'DSK-002') || null,
        chair: products.find(p => p.id === 'CHR-001') || null,
        monitor: products.find(p => p.id === 'MON-002') || null,
        laptop_stand_or_dock: products.find(p => p.id === 'DCK-002') || null,
        peripherals: products.find(p => p.id === 'PER-003') || null, // 1299
        lighting: products.find(p => p.id === 'LGT-002') || null
      };

      const initialValidation = validateBundle(items, slots, budget, shippingRule, taxRule);

      // Replace PER-003 (1299) with PER-002 (4499)
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
        explanation: passed
          ? `Successfully replaced peripherals with PER-002; new landed price is ${formatINR(replacedValidation.landedPrice.landedPrice)} with ${formatINR(replacedValidation.landedPrice.remainingBudget)} headroom remaining.`
          : "System incorrectly failed valid replacement.",
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
