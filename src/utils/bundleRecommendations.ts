import { Product, ShippingRule, TaxRule } from '../types';
import { formatINR } from './pricing';

export interface ProductRequirement {
  id: string;
  productId?: string;
  title?: string;
  category?: string;
  colour?: string;
  size?: string;
  quantity: number;
}

export interface BundleItem {
  product: Product;
  quantity: number;
}

export interface BundleRecommendation {
  id: string;
  name: string;
  tagline: string;
  items: BundleItem[];
  totalItemCount: number;
  itemSubtotal: number;
  shippingFee: number;
  taxAmount: number;
  landedPrice: number;
  budget?: number;
  remainingBudget?: number;
  isWithinBudget: boolean;
  matchExplanation: string;
  isPredefined: boolean;
  isExactMatch: boolean;
  categories: string[];
}

export interface RecommendationResult {
  bundles: BundleRecommendation[];
  totalGenerated: number;
  hasUnavailableProduct: boolean;
  unavailableReason?: string;
  isOverBudgetForAll: boolean;
  overBudgetReason?: string;
  activeRequirementsSummary: string;
}

/**
 * Creates 10 predefined, distinct, valid baseline bundles using actual products from fixture.json.
 * Uses varied bundle sizes (from 2 items up to 6 items) and diverse combinations.
 * All products used have stock > 0 in fixture.json.
 */
export function getPredefinedBaselineBundles(
  products: Product[],
  shippingRule: ShippingRule,
  taxRule: TaxRule,
  budget?: number
): BundleRecommendation[] {
  const byId = (id: string): Product | undefined => products.find(p => p.id === id);

  const p02 = byId('P02'); // Blue Tshirt M (₹550, stock 10)
  const p03 = byId('P03'); // Red Tshirt M (₹450, stock 5)
  const p04 = byId('P04'); // Blue Tshirt L (₹500, stock 7)
  const p05 = byId('P05'); // Blue Mug (₹250, stock 15)
  const p07 = byId('P07'); // Black Mouse (₹700, stock 20)
  const p08 = byId('P08'); // Black Keyboard (₹1200, stock 5)
  const p09 = byId('P09'); // Grey Hub (₹900, stock 8)
  const p10 = byId('P10'); // Green Bottle (₹450, stock 12)
  const p11 = byId('P11'); // Blue Notebook (₹200, stock 30)
  const p12 = byId('P12'); // Grey Backpack (₹1500, stock 3)

  const rawConfigs = [
    {
      id: 'base-1',
      name: 'Core Desk Essentials',
      tagline: 'Dual USB-C benchmark peripherals for clean, tactile desktop productivity',
      items: [
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 }
      ],
      matchExplanation: 'Official C07 benchmark baseline setup featuring USB-C Black Mouse and Black Keyboard.'
    },
    {
      id: 'base-2',
      name: 'Study & Hydration Duo',
      tagline: 'Compact everyday desk pair with matching blue ceramic mug and lined notebook',
      items: [
        { product: p05, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: 'Everyday budget study pairing with high-utility desk stationery and warm drinkware.'
    },
    {
      id: 'base-3',
      name: 'Campus Commuter Kit',
      tagline: 'Durable travel backpack equipped with eco hydration bottle and notebook',
      items: [
        { product: p12, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: 'Mobility combo matching heavy-duty backpack with daily hydration and note-taking essentials.'
    },
    {
      id: 'base-4',
      name: 'Full USB-C Productivity Trio',
      tagline: 'Complete input and expansion suite with precision mouse, keyboard, and multiport hub',
      items: [
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 },
        { product: p09, quantity: 1 }
      ],
      matchExplanation: 'Advanced 3-peripheral workstation setup fully certified for USB-C connectivity.'
    },
    {
      id: 'base-5',
      name: 'Casual Red Studio Pack',
      tagline: 'Comfortable red apparel combined with desktop beverage mug and creative journal',
      items: [
        { product: p03, quantity: 1 },
        { product: p05, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: 'Creative workwear bundle combining breathable red tee with daily desktop accessories.'
    },
    {
      id: 'base-6',
      name: 'Tech Minimalist Quad',
      tagline: 'Balanced peripheral and daily hydration kit for organized workstations',
      items: [
        { product: p07, quantity: 1 },
        { product: p09, quantity: 1 },
        { product: p05, quantity: 1 },
        { product: p10, quantity: 1 }
      ],
      matchExplanation: '4-item hybrid bundle balancing USB-C peripherals, desk beverage, and eco hydration.'
    },
    {
      id: 'base-7',
      name: 'Developer Blue Studio Trio',
      tagline: 'Color-coordinated blue aesthetic featuring comfortable tee, desktop mouse, and mug',
      items: [
        { product: p02, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p05, quantity: 1 }
      ],
      matchExplanation: 'Color-matched blue aesthetic combining daily apparel, input device, and ceramic mug.'
    },
    {
      id: 'base-8',
      name: 'Active Professional Five',
      tagline: 'Broad 5-piece kit spanning apparel, hydration, notes, drinkware, and transit backpack',
      items: [
        { product: p04, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 },
        { product: p05, quantity: 1 },
        { product: p12, quantity: 1 }
      ],
      matchExplanation: 'Comprehensive 5-item lifestyle package with L-size apparel, hydration, notes, and carry backpack.'
    },
    {
      id: 'base-9',
      name: 'Executive Power Workstation',
      tagline: 'Heavy-duty 5-piece setup featuring dual USB-C peripherals, multiport hub, bottle, and notebook',
      items: [
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 },
        { product: p09, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: 'Premium 5-piece professional workstation package with complete peripheral connectivity and notes.'
    },
    {
      id: 'base-10',
      name: 'Ultimate C07 All-Rounder Suite',
      tagline: 'Flagship 6-item complete package across apparel, tech peripherals, hydration, and carry gear',
      items: [
        { product: p02, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 },
        { product: p05, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p12, quantity: 1 }
      ],
      matchExplanation: 'The ultimate 6-category ensemble showcasing the maximum variety of active in-stock fixture products.'
    },
    {
      id: 'base-11',
      name: 'Hydration & Note-Taking Minimalist',
      tagline: 'Ultra-compact eco wellness duo pairing reusable green bottle with lined blue notebook',
      items: [
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: 'Clean dual-item wellness and desk companion pairing for daily note-taking and hydration.'
    },
    {
      id: 'base-12',
      name: "Creative Writer's Desk Trio",
      tagline: 'Balanced desk companion set featuring ceramic tea mug, green bottle, and ideas journal',
      items: [
        { product: p05, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: 'Non-electronic desktop combo providing complete hydration, caffeine, and note-taking.'
    },
    {
      id: 'base-13',
      name: 'Urban Digital Nomad Pack',
      tagline: 'Mobile power tech kit combining rugged backpack with precision mouse and multiport expansion hub',
      items: [
        { product: p12, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p09, quantity: 1 }
      ],
      matchExplanation: 'High-mobility connectivity pack for working on the go from cafes and co-working spaces.'
    },
    {
      id: 'base-14',
      name: 'Casual Red Gamer Starter Kit',
      tagline: 'Comfortable red apparel matched with core USB-C gaming peripherals and beverage mug',
      items: [
        { product: p03, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 },
        { product: p05, quantity: 1 }
      ],
      matchExplanation: 'Enthusiast starter set pairing dual input peripherals with breathable red cotton apparel and mug.'
    },
    {
      id: 'base-15',
      name: 'Commuter Tech & Stationery Quad',
      tagline: 'All-in-one travel setup with weather-resistant backpack, mouse, hydration, and notebook',
      items: [
        { product: p12, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: 'Versatile 4-category transit package covering input, storage, hydration, and writing.'
    },
    {
      id: 'base-16',
      name: 'Modern Blue Apparel & Peripherals Quad',
      tagline: 'Unified blue-accented workstation pack with cotton tee, dual peripherals, and notebook',
      items: [
        { product: p02, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: 'Professional 4-item desktop and apparel combination featuring tactile inputs and stationery.'
    },
    {
      id: 'base-17',
      name: 'Compact Expansion & Lifestyle Trio',
      tagline: 'Comfort-fit L-size tee with high-speed multiport hub and morning ceramic mug',
      items: [
        { product: p04, quantity: 1 },
        { product: p09, quantity: 1 },
        { product: p05, quantity: 1 }
      ],
      matchExplanation: 'Affordable 3-piece setup combining connectivity hardware with lifestyle essentials.'
    },
    {
      id: 'base-18',
      name: 'Road Warrior Full Commute Suite',
      tagline: 'Complete travel ensemble with backpack, hub, change of apparel, bottle, and journal',
      items: [
        { product: p12, quantity: 1 },
        { product: p09, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p03, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: 'Comprehensive 5-piece nomad ensemble with multi-port connectivity and travel utility.'
    },
    {
      id: 'base-19',
      name: 'Student All-Day Desk Essentials',
      tagline: 'Pure non-electronic campus kit featuring apparel, dual hydration/drinkware, and notebook',
      items: [
        { product: p04, quantity: 1 },
        { product: p05, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: 'Sub-₹1,500 4-item everyday student essentials bundle with zero tech complexity.'
    },
    {
      id: 'base-20',
      name: 'Grand Master Productivity & Travel Suite',
      tagline: 'The premier full-equipment workstation and commute powerhouse with all tech and carry gear',
      items: [
        { product: p12, quantity: 1 },
        { product: p08, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p09, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: 'Flagship 6-item heavy productivity bundle covering the entire peripheral suite, transit, and desk accessories.'
    }
  ];

  const results: BundleRecommendation[] = [];

  for (const cfg of rawConfigs) {
    const validItems: BundleItem[] = cfg.items.filter(
      (it): it is { product: Product; quantity: number } => Boolean(it.product)
    );

    if (validItems.length !== cfg.items.length) continue;

    const itemSubtotal = validItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
    const shippingFee = itemSubtotal > 0 ? (shippingRule.baseFee ?? 100) : 0;
    const taxRate = typeof taxRule.taxRate === 'number' ? taxRule.taxRate : 0;
    const taxAmount = Math.round(itemSubtotal * taxRate);
    const landedPrice = itemSubtotal + shippingFee + taxAmount;
    const remainingBudget = budget !== undefined && budget > 0 ? budget - landedPrice : undefined;
    const isWithinBudget = budget !== undefined && budget > 0 ? landedPrice <= budget : true;

    const totalItemCount = validItems.reduce((acc, it) => acc + it.quantity, 0);
    const categories = Array.from(new Set(validItems.map(it => it.product.category)));

    results.push({
      id: cfg.id,
      name: cfg.name,
      tagline: cfg.tagline,
      items: validItems,
      totalItemCount,
      itemSubtotal,
      shippingFee,
      taxAmount,
      landedPrice,
      budget,
      remainingBudget,
      isWithinBudget,
      matchExplanation: cfg.matchExplanation,
      isPredefined: true,
      isExactMatch: false,
      categories
    });
  }

  return results;
}

/**
 * Finds matching products in fixture based on requirement criteria.
 */
export function resolveRequirementProduct(
  req: ProductRequirement,
  allProducts: Product[]
): { product?: Product; error?: string } {
  if (req.productId) {
    const found = allProducts.find(p => p.id.toLowerCase() === req.productId!.toLowerCase());
    if (found) return { product: found };
    return { error: `Product ID "${req.productId}" does not exist in active fixture catalogue.` };
  }

  // Match by attributes (category, colour, size)
  const matches = allProducts.filter(p => {
    let match = true;
    if (req.category && p.category.toLowerCase() !== req.category.toLowerCase()) {
      match = false;
    }
    if (req.colour && (!p.colour || p.colour.toLowerCase() !== req.colour.toLowerCase())) {
      match = false;
    }
    if (req.size && (!p.size || p.size.toLowerCase() !== req.size.toLowerCase())) {
      match = false;
    }
    return match;
  });

  if (matches.length === 0) {
    const spec = [req.colour, req.category, req.size ? `(size ${req.size})` : ''].filter(Boolean).join(' ');
    return { error: `No product matching "${spec}" exists in active catalogue.` };
  }

  return { product: matches[0] };
}

/**
 * Generates and validates up to 10 distinct dynamic product bundle recommendations
 * based on user-specified product requirements, quantities, budget limit, and exact-only constraint.
 */
export function generateBundleRecommendations(
  allProducts: Product[],
  requirements: ProductRequirement[],
  maxBudget?: number | null,
  exactOnly: boolean = false,
  shippingRule: ShippingRule = { baseFee: 100, freeShippingThreshold: 999999, heavyItemSurchargePerItem: 0, heavyThresholdKg: 999 },
  taxRule: TaxRule = { taxRate: 0, taxName: 'Included' },
  maxResults: number = 20
): RecommendationResult {
  // If no requirements specified, return predefined baseline bundles filtered by budget
  if (!requirements || requirements.length === 0) {
    const baseline = getPredefinedBaselineBundles(allProducts, shippingRule, taxRule, maxBudget ?? undefined);
    const validBaseline = maxBudget && maxBudget > 0 
      ? baseline.filter(b => b.isWithinBudget) 
      : baseline;

    return {
      bundles: validBaseline.slice(0, maxResults),
      totalGenerated: validBaseline.length,
      hasUnavailableProduct: false,
      isOverBudgetForAll: validBaseline.length === 0 && baseline.length > 0,
      overBudgetReason: validBaseline.length === 0 
        ? `None of the ${baseline.length} baseline bundles fit within your ${formatINR(maxBudget || 0)} budget.` 
        : undefined,
      activeRequirementsSummary: `${validBaseline.length} Predefined Distinct Baseline Bundles (No specific product requirements applied)`
    };
  }

  // 1. Resolve and validate all required items
  const resolvedRequiredItems: BundleItem[] = [];
  const reqSummaries: string[] = [];

  for (const req of requirements) {
    const qty = Math.max(1, req.quantity || 1);
    const resolved = resolveRequirementProduct(req, allProducts);

    if (!resolved.product) {
      return {
        bundles: [],
        totalGenerated: 0,
        hasUnavailableProduct: true,
        unavailableReason: resolved.error || 'Requested item does not exist in the catalogue.',
        isOverBudgetForAll: false,
        activeRequirementsSummary: 'Requirements contain invalid products'
      };
    }

    const prod = resolved.product;
    reqSummaries.push(`${qty}x ${prod.colour || ''} ${prod.name} (${prod.id})`.trim());

    // Check availability
    const availableStock = prod.stockQuantity ?? (prod.inStock ? 10 : 0);
    if (!prod.inStock || availableStock <= 0) {
      return {
        bundles: [],
        totalGenerated: 0,
        hasUnavailableProduct: true,
        unavailableReason: `Unavailable Product Encountered: ${prod.colour || ''} ${prod.name} (${prod.id}) is currently out of stock (available: 0). As per C07 inventory constraints, unavailable products cannot be purchased in a valid bundle.`,
        isOverBudgetForAll: false,
        activeRequirementsSummary: reqSummaries.join(', ')
      };
    }

    if (availableStock < qty) {
      return {
        bundles: [],
        totalGenerated: 0,
        hasUnavailableProduct: true,
        unavailableReason: `Insufficient Stock: Requested ${qty} unit(s) of ${prod.name} (${prod.id}), but active inventory only has ${availableStock} unit(s).`,
        isOverBudgetForAll: false,
        activeRequirementsSummary: reqSummaries.join(', ')
      };
    }

    resolvedRequiredItems.push({ product: prod, quantity: qty });
  }

  const activeReqSummary = reqSummaries.join(' + ');

  // Calculate base required items cost
  const baseSubtotal = resolvedRequiredItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const baseShipping = baseSubtotal > 0 ? (shippingRule.baseFee ?? 100) : 0;
  const baseTax = Math.round(baseSubtotal * (taxRule.taxRate || 0));
  const baseLanded = baseSubtotal + baseShipping + baseTax;

  if (maxBudget && maxBudget > 0 && baseLanded > maxBudget) {
    return {
      bundles: [],
      totalGenerated: 0,
      hasUnavailableProduct: false,
      isOverBudgetForAll: true,
      overBudgetReason: `Budget Exceeded: The required items alone cost ${formatINR(baseLanded)} landed (${formatINR(baseSubtotal)} items + ${formatINR(baseShipping)} shipping), which exceeds your budget limit of ${formatINR(maxBudget)}.`,
      activeRequirementsSummary: activeReqSummary
    };
  }

  // Helper to construct a validated recommendation bundle
  const buildBundle = (
    id: string,
    name: string,
    tagline: string,
    items: BundleItem[],
    isExact: boolean,
    customExplanation?: string
  ): BundleRecommendation | null => {
    // Check total stock for each product in items
    for (const item of items) {
      const avail = item.product.stockQuantity ?? (item.product.inStock ? 10 : 0);
      if (avail < item.quantity) return null;
    }

    // Check peripheral USB-C port compatibility
    const hasMouse = items.some(it => it.product.category === 'Mouse');
    const hasKeyboard = items.some(it => it.product.category === 'Keyboard');
    if (hasMouse && hasKeyboard) {
      const mouse = items.find(it => it.product.category === 'Mouse')?.product;
      const keyboard = items.find(it => it.product.category === 'Keyboard')?.product;
      const mouseUsb = Array.isArray(mouse?.compatibleWith) && mouse?.compatibleWith.includes('usb-c');
      const kbUsb = Array.isArray(keyboard?.compatibleWith) && keyboard?.compatibleWith.includes('usb-c');
      if (!mouseUsb || !kbUsb) return null;
    }

    const itemSubtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
    const shippingFee = itemSubtotal > 0 ? (shippingRule.baseFee ?? 100) : 0;
    const taxAmount = Math.round(itemSubtotal * (taxRule.taxRate || 0));
    const landedPrice = itemSubtotal + shippingFee + taxAmount;

    if (maxBudget && maxBudget > 0 && landedPrice > maxBudget) {
      return null;
    }

    const remainingBudget = maxBudget && maxBudget > 0 ? maxBudget - landedPrice : undefined;
    const isWithinBudget = maxBudget && maxBudget > 0 ? landedPrice <= maxBudget : true;
    const totalItemCount = items.reduce((acc, it) => acc + it.quantity, 0);
    const categories = Array.from(new Set(items.map(it => it.product.category)));

    const matchExplanation = customExplanation || (
      isExact
        ? `Strict exact-match configuration containing precisely your requested ${activeReqSummary} with zero unrequested items.`
        : `Includes all required ${activeReqSummary} alongside compatible complementary additions, staying within your ${maxBudget ? formatINR(maxBudget) : 'requested'} budget.`
    );

    return {
      id,
      name,
      tagline,
      items,
      totalItemCount,
      itemSubtotal,
      shippingFee,
      taxAmount,
      landedPrice,
      budget: maxBudget ?? undefined,
      remainingBudget,
      isWithinBudget,
      matchExplanation,
      isPredefined: false,
      isExactMatch: isExact,
      categories
    };
  };

  // Helper for bundle uniqueness
  const getBundleSignature = (items: BundleItem[]): string => {
    return items
      .map(it => `${it.product.id}:${it.quantity}`)
      .sort()
      .join('|');
  };

  const validBundles: BundleRecommendation[] = [];
  const seenSignatures = new Set<string>();

  // Bundle 1: Exact required items only
  const exactBundle = buildBundle(
    'dyn-exact-1',
    requirements.length === 1 && requirements[0].quantity > 1
      ? `${requirements[0].quantity}x ${resolvedRequiredItems[0].product.name} Focus Pack`
      : 'Exact Requirement Match',
    `Custom bundle matching strictly your requested items (${activeReqSummary})`,
    [...resolvedRequiredItems],
    true,
    `Exact match containing strictly your requested ${activeReqSummary} (${formatINR(baseLanded)} landed).`
  );

  if (exactBundle) {
    validBundles.push(exactBundle);
    seenSignatures.add(getBundleSignature(exactBundle.items));
  }

  // If user specified exact products only, return only the exact bundle
  if (exactOnly) {
    return {
      bundles: validBundles,
      totalGenerated: validBundles.length,
      hasUnavailableProduct: false,
      isOverBudgetForAll: validBundles.length === 0,
      activeRequirementsSummary: `${activeReqSummary} (Exact Match Only)`
    };
  }

  // Complementary candidates pool: in-stock products NOT already in the required items list
  const requiredProductIds = new Set(resolvedRequiredItems.map(it => it.product.id));
  const availableComplementaryProducts = allProducts.filter(p => {
    if (requiredProductIds.has(p.id)) return false;
    if (!p.inStock || (p.stockQuantity !== undefined && p.stockQuantity <= 0)) return false;
    return (p.stockQuantity ?? 10) > 0;
  });

  // Strategy 1: Add single complementary items from available pool
  for (const comp of availableComplementaryProducts) {
    if (validBundles.length >= maxResults) break;

    const candidateItems: BundleItem[] = [
      ...resolvedRequiredItems.map(it => ({ ...it })),
      { product: comp, quantity: 1 }
    ];

    const sig = getBundleSignature(candidateItems);
    if (seenSignatures.has(sig)) continue;

    const bundle = buildBundle(
      `dyn-comp-single-${comp.id}`,
      `${exactBundle?.name || 'Requirement Pack'} + ${comp.name}`,
      `Enhances your requested ${activeReqSummary} with complementary ${comp.name} (${comp.category})`,
      candidateItems,
      false,
      `Includes all requested ${activeReqSummary}. Added 1x ${comp.name} (${formatINR(comp.price)}) for enhanced utility.`
    );

    if (bundle) {
      validBundles.push(bundle);
      seenSignatures.add(sig);
    }
  }

  // Strategy 2: Add complementary pairs (peripherals, stationery, lifestyle)
  const compPairs: [string, string][] = [
    ['P11', 'P10'], // Blue Notebook + Green Bottle
    ['P07', 'P08'], // Black Mouse + Black Keyboard
    ['P07', 'P09'], // Black Mouse + Grey Hub
    ['P05', 'P11'], // Blue Mug + Blue Notebook
    ['P05', 'P10'], // Blue Mug + Green Bottle
    ['P12', 'P10'], // Grey Backpack + Green Bottle
    ['P12', 'P11'], // Grey Backpack + Blue Notebook
    ['P12', 'P07'], // Grey Backpack + Black Mouse
    ['P12', 'P09'], // Grey Backpack + Grey Hub
    ['P02', 'P07'], // Blue Tshirt M + Black Mouse
    ['P02', 'P11'], // Blue Tshirt M + Blue Notebook
    ['P03', 'P11'], // Red Tshirt M + Blue Notebook
    ['P03', 'P05'], // Red Tshirt M + Blue Mug
    ['P03', 'P07'], // Red Tshirt M + Black Mouse
    ['P04', 'P10'], // Blue Tshirt L + Green Bottle
    ['P04', 'P09'], // Blue Tshirt L + Grey Hub
    ['P04', 'P05'], // Blue Tshirt L + Blue Mug
    ['P08', 'P09']  // Black Keyboard + Grey Hub
  ];

  for (const [idA, idB] of compPairs) {
    if (validBundles.length >= maxResults) break;
    if (requiredProductIds.has(idA) || requiredProductIds.has(idB)) continue;

    const prodA = allProducts.find(p => p.id === idA);
    const prodB = allProducts.find(p => p.id === idB);
    if (!prodA || !prodB) continue;

    const candidateItems: BundleItem[] = [
      ...resolvedRequiredItems.map(it => ({ ...it })),
      { product: prodA, quantity: 1 },
      { product: prodB, quantity: 1 }
    ];

    const sig = getBundleSignature(candidateItems);
    if (seenSignatures.has(sig)) continue;

    const bundle = buildBundle(
      `dyn-comp-pair-${idA}-${idB}`,
      `${exactBundle?.name || 'Bundle'} + ${prodA.name} & ${prodB.name}`,
      `Expands your requirements with a dual complementary pairing of ${prodA.name} and ${prodB.name}`,
      candidateItems,
      false,
      `Includes all requested ${activeReqSummary}. Augmented with ${prodA.name} and ${prodB.name} within budget constraints.`
    );

    if (bundle) {
      validBundles.push(bundle);
      seenSignatures.add(sig);
    }
  }

  // Strategy 3: Multi-item lifestyle / workstation sets if slots still under maxResults
  const multiConfigs = [
    {
      ids: ['P07', 'P08', 'P09'],
      nameExtra: 'Full USB-C Setup',
      descExtra: 'Mouse, Keyboard, and Hub'
    },
    {
      ids: ['P12', 'P10', 'P11'],
      nameExtra: 'Commuter Mobility Set',
      descExtra: 'Backpack, Bottle, and Notebook'
    },
    {
      ids: ['P07', 'P11', 'P10'],
      nameExtra: 'Workspace & Wellness Trio',
      descExtra: 'Mouse, Notebook, and Bottle'
    },
    {
      ids: ['P02', 'P12', 'P10'],
      nameExtra: 'Travel Lifestyle Trio',
      descExtra: 'Apparel, Backpack, and Bottle'
    },
    {
      ids: ['P03', 'P07', 'P08'],
      nameExtra: 'Creative Gaming Setup',
      descExtra: 'Red Tee, Mouse, and Keyboard'
    },
    {
      ids: ['P05', 'P10', 'P11'],
      nameExtra: 'Desk Companion Trio',
      descExtra: 'Mug, Bottle, and Notebook'
    },
    {
      ids: ['P07', 'P08', 'P10', 'P11'],
      nameExtra: 'Executive Quad',
      descExtra: 'Mouse, Keyboard, Bottle, and Notebook'
    }
  ];

  for (const mc of multiConfigs) {
    if (validBundles.length >= maxResults) break;
    if (mc.ids.some(id => requiredProductIds.has(id))) continue;

    const candidateItems: BundleItem[] = [
      ...resolvedRequiredItems.map(it => ({ ...it }))
    ];

    let canAdd = true;
    for (const id of mc.ids) {
      const prod = allProducts.find(p => p.id === id);
      if (!prod) { canAdd = false; break; }
      candidateItems.push({ product: prod, quantity: 1 });
    }

    if (!canAdd) continue;

    const sig = getBundleSignature(candidateItems);
    if (seenSignatures.has(sig)) continue;

    const bundle = buildBundle(
      `dyn-multi-${mc.ids.join('-')}`,
      `${exactBundle?.name || 'Bundle'} · ${mc.nameExtra}`,
      `Comprehensive bundle featuring ${activeReqSummary} plus ${mc.descExtra}`,
      candidateItems,
      false,
      `Fully satisfies requested ${activeReqSummary}. Enhanced with ${mc.descExtra} into a complete ensemble.`
    );

    if (bundle) {
      validBundles.push(bundle);
      seenSignatures.add(sig);
    }
  }

  // Sort valid bundles by landed price ascending for predictable budget ordering
  validBundles.sort((a, b) => a.landedPrice - b.landedPrice);

  const displayedBundles = validBundles.slice(0, maxResults);

  return {
    bundles: displayedBundles,
    totalGenerated: displayedBundles.length,
    hasUnavailableProduct: false,
    isOverBudgetForAll: displayedBundles.length === 0,
    overBudgetReason: displayedBundles.length === 0 
      ? `No bundles containing ${activeReqSummary} could be formed within your ${formatINR(maxBudget || 0)} budget.` 
      : undefined,
    activeRequirementsSummary: activeReqSummary
  };
}
