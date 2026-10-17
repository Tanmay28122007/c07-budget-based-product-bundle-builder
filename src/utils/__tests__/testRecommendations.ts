import { DEFAULT_SYNTHETIC_FIXTURE } from '../../data/defaultFixture';
import { generateBundleRecommendations, getPredefinedBaselineBundles } from '../bundleRecommendations';

const fixture = DEFAULT_SYNTHETIC_FIXTURE;
const products = fixture.products;
const shippingRule = fixture.shippingRule;
const taxRule = fixture.taxRule;

console.log('====================================================');
console.log('TEST 0: Baseline 10 Predefined Bundles (No Requirements)');
console.log('====================================================');
const baseline = getPredefinedBaselineBundles(products, shippingRule, taxRule);
console.log(`Generated ${baseline.length} baseline bundles.`);
baseline.forEach((b, idx) => {
  console.log(`[Bundle ${idx + 1}] "${b.name}" | Items: ${b.totalItemCount} | Landed: ₹${b.landedPrice} | Products: ${b.items.map(i => `${i.quantity}x ${i.product.name} (${i.product.id})`).join(', ')}`);
});

console.log('\n====================================================');
console.log('TEST CASE 1: User requests one blue mug and one red mug');
console.log('====================================================');
const res1 = generateBundleRecommendations(
  products,
  [
    { id: '1', category: 'Mug', colour: 'Blue', quantity: 1 },
    { id: '2', category: 'Mug', colour: 'Red', quantity: 1 }
  ],
  undefined,
  false,
  shippingRule,
  taxRule
);
console.log(`Result: Bundles count = ${res1.bundles.length}`);
console.log(`Has unavailable product: ${res1.hasUnavailableProduct}`);
console.log(`Unavailable reason: ${res1.unavailableReason}`);

console.log('\n====================================================');
console.log('TEST CASE 2: User requests specific product with qty > 1 (2x Blue Mug)');
console.log('====================================================');
const res2 = generateBundleRecommendations(
  products,
  [
    { id: '1', productId: 'P05', quantity: 2 }
  ],
  undefined,
  false,
  shippingRule,
  taxRule
);
console.log(`Result: Bundles count = ${res2.bundles.length}`);
res2.bundles.forEach((b, idx) => {
  const p05Count = b.items.find(i => i.product.id === 'P05')?.quantity || 0;
  console.log(`[Bundle ${idx + 1}] "${b.name}" | Items: ${b.totalItemCount} (P05 qty: ${p05Count}) | Landed: ₹${b.landedPrice} | Match: ${b.matchExplanation}`);
});

console.log('\n====================================================');
console.log('TEST CASE 3: User specifies a budget (₹2000 for Mouse & Keyboard)');
console.log('====================================================');
const res3 = generateBundleRecommendations(
  products,
  [
    { id: '1', productId: 'P07', quantity: 1 },
    { id: '2', productId: 'P08', quantity: 1 }
  ],
  2000,
  false,
  shippingRule,
  taxRule
);
console.log(`Result: Bundles count = ${res3.bundles.length}`);
res3.bundles.forEach((b, idx) => {
  console.log(`[Bundle ${idx + 1}] "${b.name}" | Landed: ₹${b.landedPrice} (Budget: ₹${b.budget}, Remaining: ₹${b.remainingBudget}) | Within budget: ${b.isWithinBudget}`);
});

console.log('\n====================================================');
console.log('TEST CASE 4: User requests an unavailable product (P01 Blue Tshirt M, stock 0)');
console.log('====================================================');
const res4 = generateBundleRecommendations(
  products,
  [
    { id: '1', productId: 'P01', quantity: 1 }
  ],
  undefined,
  false,
  shippingRule,
  taxRule
);
console.log(`Result: Bundles count = ${res4.bundles.length}`);
console.log(`Has unavailable product: ${res4.hasUnavailableProduct}`);
console.log(`Unavailable reason: ${res4.unavailableReason}`);

console.log('\n====================================================');
console.log('TEST CASE 5: User requests combination with fewer than 10 valid bundles (2x Blue Mug + Budget ₹1200)');
console.log('====================================================');
const res5 = generateBundleRecommendations(
  products,
  [
    { id: '1', productId: 'P05', quantity: 2 }
  ],
  1200,
  false,
  shippingRule,
  taxRule
);
console.log(`Result: Bundles count = ${res5.bundles.length} (fewer than 10 valid bundles exist within ₹1200)`);
res5.bundles.forEach((b, idx) => {
  console.log(`[Bundle ${idx + 1}] "${b.name}" | Landed: ₹${b.landedPrice} (Remaining: ₹${b.remainingBudget}) | Products: ${b.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}`);
});
