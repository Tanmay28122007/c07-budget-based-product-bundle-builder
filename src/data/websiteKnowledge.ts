/**
 * Comprehensive Website Knowledge Base & AI Training Module
 * Grounding the AI Assistant with complete knowledge of the entire
 * "Budget-Based Product Bundle Builder" (C07 Challenge) web application.
 */

export interface WebsitePageInfo {
  id: string;
  title: string;
  pathDescription: string;
  summary: string;
  features: string[];
  keyComponents: string[];
  userActions: string[];
}

export const WEBSITE_PAGES: Record<string, WebsitePageInfo> = {
  dashboard: {
    id: 'dashboard',
    title: 'Executive Dashboard',
    pathDescription: 'Overview & telemetry command center',
    summary: 'Displays real-time high-level KPIs, budget utilization progress gauge, compatibility status badges, and quick solver shortcuts.',
    features: [
      'Live KPI telemetry: Target Budget, Landed Price, Budget Utilization %, Compatibility Status, Filled Slots count, Limiting Factor.',
      'Circular progress meter for budget headroom.',
      'Quick solver shortcuts to trigger automatic Cartestian bundle assembly.',
      'Real-time compatibility warnings banner with direct resolution triggers.',
      'Category cost distribution chart.'
    ],
    keyComponents: ['KPI Cards', 'Budget Gauge', 'Quick Action Buttons', 'Recent Validation Alerts'],
    userActions: ['View current metrics', 'Trigger Auto-Solve', 'Reset Bundle', 'Navigate to Builder']
  },
  builder: {
    id: 'builder',
    title: 'Bundle Builder',
    pathDescription: 'Interactive 6-slot hardware bundle configurator',
    summary: 'The core configuration workspace where shoppers select hardware items across 6 required slots, adjust budget, inspect landed price breakdowns in real time, and auto-solve bundles.',
    features: [
      '6 Required Slots: Workstation Desk (desk), Ergonomic Chair (chair), Main Display (monitor), Dock & Laptop Riser (laptop_stand_or_dock), Keyboard & Mouse Combo (peripherals), Desk/Screen Task Light (lighting).',
      'Interactive Product Picker drawer for each slot with spec comparisons and instant compatibility badges.',
      'Real-time Landed Price Calculation Bar: Product Subtotal + Net Shipping (with free shipping logic) + 18% GST.',
      'Target Budget Slider / Stepper (adjustable from ₹20,000 to ₹250,000+).',
      'Auto-Solve Engine: Cartesian optimizer with 3 modes (Balanced, Minimum Cost, Maximum Ergonomics) to find optimal valid configurations within budget.',
      'One-click slot clearing, swapping, and bundle reset.',
      'Visual hardware conflict indicators highlighting incompatible pairings directly on slots.'
    ],
    keyComponents: ['Slot Grid Cards', 'Landed Price Bar', 'Budget Controller', 'Auto-Solve Modal', 'Product Selection Drawer'],
    userActions: ['Select or replace products', 'Adjust target budget', 'Run Auto-Solve', 'Inspect price breakdown', 'Clear slot']
  },
  chat: {
    id: 'chat',
    title: 'Gemini AI Chat Assistant',
    pathDescription: 'Dedicated multi-turn conversational hardware consultant',
    summary: 'Full-featured AI chat environment with 3 pre-built personas, multi-model selection (Gemini 3.8 Flash, Gemini 3.1 Flash-Lite, Gemini 4 Argon), custom instruction editing, and 1-click execution cards.',
    features: [
      '3 Expert Personas: Ergonomic Workspace Architect (general tasks/ergonomics), Rapid Compatibility Checker (instant spec checks), Procurement & Unit Economics Strategist (landed costs & margins), plus Custom Persona.',
      'Multi-model switcher: gemini-3.8-flash, gemini-3.1-flash-lite, gemini-4-argon.',
      '1-Click Interactive Action Cards: Apply Recommended Bundle, Swap Incompatible Product, Adjust Budget, Navigate to Any Page.',
      'Live Workspace Context Sync toggle (attaches active bundle, products, rules, and budget to every turn).',
      'Export chat transcript as Markdown, copy response, clear conversation, and starter chips.'
    ],
    keyComponents: ['Role Selector', 'Model Switcher', 'Context Inspector', 'Interactive Action Cards', 'Prompt Starters'],
    userActions: ['Switch personas', 'Select Gemini model', 'Execute 1-click action cards', 'Inspect workspace sync', 'Export transcript']
  },
  catalogue: {
    id: 'catalogue',
    title: 'Product Catalogue',
    pathDescription: 'Hardware inventory & technical blueprint directory',
    summary: 'Comprehensive catalogue of all 24 curated hardware components with technical blueprints, dimensional specifications, pricing, stock levels, and multi-faceted filters.',
    features: [
      '24 Products across 6 Categories: Desks (4), Chairs (4), Monitors (4), Docks & Stands (4), Peripherals (3), Lighting (3).',
      'Live Stock Status: Shows real-time stock quantity, in-stock badges, and out-of-stock warnings (e.g. DSK-004, CHR-004).',
      'Multi-faceted filtering: Category tabs, In-Stock Only toggle, Price range slider, Search query.',
      'Technical specification badges: Dimensions (cm), Power Delivery (W), Monitor Mount Type, Light Mount Type, Ergonomic Grade (Tier-1, Tier-2, Standard).',
      'Hardware compatibility preview indicating potential conflicts before adding to bundle.'
    ],
    keyComponents: ['Search & Filter Bar', 'Product Cards', 'Specification Badges', 'Stock Indicators', 'Add-to-Slot Button'],
    userActions: ['Search catalogue', 'Filter by category or stock', 'Inspect dimensions & power', 'Add directly to bundle slot']
  },
  compare: {
    id: 'compare',
    title: 'Compare Bundles',
    pathDescription: 'Multi-bundle side-by-side comparative matrix',
    summary: 'Side-by-side comparative matrix evaluating preset packages against the user\'s custom active bundle across specifications, prices, taxes, shipping weights, and ergonomic ratings.',
    features: [
      '3 Preset Bundles: Budget Conscious Starter (₹35,000), Developer Productivity Pro (₹65,000), Executive Ergonomic Ultra (₹95,000).',
      'Live comparison against the user\'s current custom bundle.',
      'Metrics compared: Landed Price, Product Subtotal, Shipping Surcharges, GST 18%, Total Weight (kg), Ergonomic Score, Compatibility Guarantee.',
      '1-click "Load Preset into Builder" button to test or adopt any preset immediately.',
      'Component-by-component comparison table across all 6 slots.'
    ],
    keyComponents: ['Preset Matrix Table', 'Spec Diff Viewer', 'Price Breakdown Comparative Cards', 'Load Preset Buttons'],
    userActions: ['Compare specs across setups', 'Inspect weight & shipping differences', 'Load preset into active bundle']
  },
  business: {
    id: 'business',
    title: 'Business Insights & Strategy',
    pathDescription: 'MBA unit economics simulation & strategic framework',
    summary: 'Executive strategic analysis containing problem statements, deterministic landed bundles value proposition, retailer subscription fees, referral margins, break-even basket threshold, and empirical shopper research log.',
    features: [
      'Section A: Problem Statement (Customer assembly friction, surprise checkout shipping fees, port/mounting mismatches, out-of-stock items).',
      'Section B: Core Value Proposition ("Help shoppers build complete, compatible bundles with transparent landed pricing").',
      'Section C: Target Customer Segments (Remote corporate stipends, B2B enterprise procurement, self-funded freelancers).',
      'Unit Economics Simulator: Retailer monthly fee (₹15,000) minus cost to serve (₹3,500) = Retailer monthly contribution (₹11,500). Referral revenue per basket (3.5% on eligible basket) minus variable cost (₹120) = Referral contribution.',
      'Break-even Basket Model: Fixed monthly costs (₹85,000) / contribution per basket = Break-even order volume.',
      'Empirical Shopper Experiment Research Log: Editable table tracking participant sessions, completion time, landed spend, errors encountered, and satisfaction scores.'
    ],
    keyComponents: ['Strategic Foundations Cards', 'Interactive Unit Economics Calculator', 'Break-even Analysis Card', 'Empirical Shopper Log Table'],
    userActions: ['Simulate unit economics variables', 'View break-even basket count', 'Edit shopper research records', 'Reset experiment data']
  },
  tests: {
    id: 'tests',
    title: 'Automated Test Suite',
    pathDescription: 'System verification & edge-case test runner',
    summary: 'Live browser-executable test suite running 22+ tests covering compatibility rules, landed price arithmetic, Knapsack solver optimality, and edge-case scenarios.',
    features: [
      'Reference Request Tests (REF-001 to REF-006): Starter Pack (₹35k), Pro Ergonomic (₹65k), Executive (₹95k), Infeasible Ultra-low (₹15k), Free Shipping Boundary (₹50k), Heavy Shipping Weight.',
      'Edge-Case Scenario Tests (EDGE-001 to EDGE-006): Cheapest Products Incompatible, Curved Monitor Clamp Trap, Dock Port Discrepancy, Out-of-Stock Item Trap, Desk Overhang Tipping, Heavy Item Surcharge Precision.',
      'Live execution with real-time pass/fail badges, execution latency (ms), and step-by-step diagnostic explanations.',
      'Overall test score counter (100% pass rate target).'
    ],
    keyComponents: ['Run All Tests Button', 'Test Summary Badges', 'Reference Request Test Cards', 'Edge Case Scenario Test Cards', 'Execution Log Terminal'],
    userActions: ['Execute complete test suite', 'Inspect test procedure & assertions', 'Verify landed price math', 'Review edge case traps']
  },
  evidence: {
    id: 'evidence',
    title: 'Project Evidence & Scope Audit',
    pathDescription: 'Academic engineering change documentation & audit log',
    summary: 'Formal academic verification documenting starting state (v0.1 prototype) vs requested changes, contractual scope boundaries, verified test procedures, and mathematical proofs.',
    features: [
      'Section A: Baseline Starting State (v0.1 basic prototype with manual slots and unverified pricing).',
      'Section B: Negotiated Scope & Contractual Boundaries (Deterministic landed pricing, Cartesian compatibility solver, 18% GST precision, Gemini AI integration).',
      'Section C: Verification Evidence Matrix (EVD-C07-001 to EVD-C07-008 covering each engineering milestone).',
      'Interactive form to add, edit, or delete audit evidence entries.',
      'Status badges (Verified, In-Review, Contractually Out of Scope).'
    ],
    keyComponents: ['Scope Audit Grid', 'Baseline vs Final Comparison Cards', 'Evidence Records Table', 'Add Evidence Form'],
    userActions: ['Audit project milestones', 'Edit scope agreement', 'Add custom verification evidence record']
  },
  settings: {
    id: 'settings',
    title: 'Settings & Configuration',
    pathDescription: 'Global parameters & data management',
    summary: 'Controls core platform rules including 18% GST tax rate, shipping pricing policies, free shipping thresholds, currency formatting, and factory data reset.',
    features: [
      'Tax Rule Settings: GST rate (default 18%), Tax name customization.',
      'Shipping Policy Settings: Base shipping fee (₹499), Free shipping order threshold (₹50,000), Heavy item surcharge (₹450 per item >= 15kg).',
      'Currency & Locale settings (INR ₹ format).',
      'Factory Reset: One-click restore to synthetic fixture defaults, clearing local storage caches.'
    ],
    keyComponents: ['Tax Settings Form', 'Shipping Settings Form', 'Reset Data Button', 'System Health Indicator'],
    userActions: ['Modify tax or shipping rules', 'Restore factory default fixture', 'Test system health']
  }
};

export const DOMAIN_COMPATIBILITY_RULES = [
  {
    id: 'clamp_vs_monitor',
    name: 'ScreenBar Light vs Curved Display',
    rule: 'ScreenBar clamp lights (LGT-001, LGT-003) cannot mount on curved displays (e.g. MON-003 1500R curvature) because the clamp requires a flat monitor bezel. Curved bezels cause uneven pressure, wobbling, or panel damage. Solution: Swap to weighted base desk lamp (LGT-002 SN-LAMP).'
  },
  {
    id: 'desk_width_vs_ultrawide',
    name: 'Desk Width vs Ultrawide Monitor',
    rule: 'Ultrawide displays (34"+ such as MON-003) require a desk surface width of at least 120 cm (DSK-001 140cm or DSK-002 120cm). Compact desks (DSK-003 90cm) create monitor overhang, tipping hazards, and insufficient room for mouse pad and speakers.'
  },
  {
    id: 'chair_clearance',
    name: 'Wide Executive Chair vs Compact Desk',
    rule: 'Executive chairs with wide fixed arms (CHR-002) require at least 120 cm desk width and 60 cm depth to slide underneath. Using them with compact desks (DSK-003 90cm) prevents proper ergonomic seating posture and tucking.'
  },
  {
    id: 'explicit_id_block',
    name: 'Hardware Port / Cable Mismatch',
    rule: 'Legacy monitors with only HDMI/VGA (MON-004) cannot connect directly to ultra-portable mini docks that lack HDMI ports (DCK-003 has DisplayPort only) without converters. Dual-port docks (DCK-001, DCK-002) are required.'
  },
  {
    id: 'stock_availability',
    name: 'In-Stock Verification',
    rule: 'Out-of-stock products (e.g. DSK-004 Vertex Pro Desk, CHR-004 Active Stool) must never be recommended or left in a completed bundle, as they block checkout and fulfillment.'
  }
];

export const LANDED_PRICING_FORMULA = `
Landed Price = Product Subtotal + Net Shipping + 18% GST Tax
- Product Subtotal: Sum of retail prices of all selected in-stock slot items.
- Free Shipping Threshold: If Product Subtotal >= ₹50,000, Net Shipping is ₹0.
- If Subtotal < ₹50,000: Net Shipping = Base Fee (₹499) + (Heavy Items Count × ₹450), where a heavy item is any product >= 15 kg (desks like DSK-001, DSK-002, heavy chairs like CHR-001, CHR-002).
- GST Tax: 18% applied on (Product Subtotal + Net Shipping).
- Landed Total: Product Subtotal + Net Shipping + GST.
- Budget Compliance: Landed Total must be <= Target Budget. Remaining Budget = Target Budget - Landed Total.
`;

export const MBA_UNIT_ECONOMICS = `
- Platform Revenue Model: Hybrid B2B SaaS + Affiliate Referral Commission.
- Retailer Monthly Subscription Fee: ₹15,000 per retailer.
- Retailer Monthly Cost to Serve: ₹3,500.
- Retailer Net Contribution: ₹15,000 - ₹3,500 = ₹11,500/month.
- Affiliate Referral Commission: 3.5% on eligible completed bundle basket value.
- Variable Cost Per Basket: ₹120 (server compute, API telemetry, payment verification).
- Referral Contribution Per Basket: (Basket Value × 3.5%) - ₹120. E.g., for a ₹65,000 bundle = (₹65,000 × 0.035) - ₹120 = ₹2,275 - ₹120 = ₹2,155 contribution per basket.
- Break-Even Basket Threshold: Fixed Monthly Costs (₹85,000) ÷ Contribution Per Basket (~₹2,155) ≈ 40 baskets/month.
`;

export const SOLVER_ALGORITHM = `
- Algorithm: Cartesian Product Search with Branch-and-Bound Pruning.
- Search Space: Cartesian product of all in-stock candidate items for each required slot (up to 4 desks × 4 chairs × 4 monitors × 4 docks × 3 peripherals × 3 lighting = 2,304 potential combinations).
- Pruning: Filters out out-of-stock items before cartesian expansion. Prunes any combination violating physical/electrical compatibility rules.
- Optimization Goals:
  1. Lowest Cost: Finds the valid, complete, compatible bundle with the lowest landed price.
  2. Best Value / Max Ergonomics: Maximizes Tier-1 ergonomic items and premium features while staying strictly within target budget.
  3. Balanced: Optimizes middle-tier items with optimal remaining budget buffer.
`;

/**
 * Builds the comprehensive master system prompt for Gemini
 */
export function buildMasterSystemPrompt(params: {
  role?: string;
  customInstruction?: string;
  activeTab?: string;
  activityName: string;
  currentBudget: number;
  currentSlotsSummary: string;
  landedPriceSummary: string;
  violationsSummary: string;
  catalogueSummary: string;
  limitingFactor?: string;
}): string {
  const {
    role,
    customInstruction,
    activeTab = 'dashboard',
    activityName,
    currentBudget,
    currentSlotsSummary,
    landedPriceSummary,
    violationsSummary,
    catalogueSummary,
    limitingFactor = 'None'
  } = params;

  let rolePersona = '';
  if (role === 'rapid_checker') {
    rolePersona = `ROLE: Rapid Compatibility & Spec Checker. Provide lightning-fast, high-density, concise answers verifying hardware compatibility, port types, clamp dimensions, power wattage, and stock status across the website.`;
  } else if (role === 'procurement_strategist') {
    rolePersona = `ROLE: Senior Procurement & Unit Economics Strategist. Focus on deep financial reasoning, landed margin sensitivity, platform referral fees, break-even basket analysis, and cost-to-serve economics for B2B and retail operations.`;
  } else if (role === 'workspace_architect') {
    rolePersona = `ROLE: Ergonomic Workspace Architect. Specialize in human factors, spinal posture, monitor heights, eye-strain mitigation, screenbar mounting geometry, and high-productivity desktop setups.`;
  }

  const currentPage = WEBSITE_PAGES[activeTab] || WEBSITE_PAGES.dashboard;

  return `${rolePersona ? rolePersona + '\n\n' : ''}${customInstruction ? customInstruction + '\n\n' : ''}You are the master AI Assistant for the "Budget-Based Product Bundle Builder" (C07 Challenge) web application.
You possess complete, authoritative knowledge of the ENTIRE platform, its 9 pages, all 24 hardware products, compatibility rules, pricing formulas, MBA unit economics, automated test suite, and project evidence.

==================================================
1. CURRENT USER & WORKSPACE STATE
==================================================
- Active Page on Website: "${currentPage.title}" (tab: "${currentPage.id}") - ${currentPage.summary}
- Current Activity: "${activityName}"
- Target Budget: ₹${currentBudget.toLocaleString('en-IN')}
- Limiting Factor: ${limitingFactor}

Current Bundle Slots State:
${currentSlotsSummary}

Landed Price & Budget Calculation:
${landedPriceSummary}

Compatibility Rule Violations:
${violationsSummary}

==================================================
2. COMPLETE WEBSITE ARCHITECTURE & SITEMAP
==================================================
The platform consists of 9 integrated pages accessible from the sidebar and header:
1. "dashboard" (Executive Dashboard): Real-time KPIs (Budget, Landed Price, Utilization %, Compatibility Status, Limiting Factor), circular progress meter, quick action buttons to Auto-Solve or inspect.
2. "builder" (Bundle Builder): The primary interactive 6-slot workspace (Desk, Chair, Monitor, Dock, Peripherals, Lighting), real-time Landed Price bar, budget slider/stepper (₹20k-₹250k), Cartesian Auto-Solve engine (Balanced, Lowest Cost, Best Value), and slot swapper.
3. "chat" (Gemini AI Assistant): Multi-turn AI consultant with 3 personas (Ergonomic Workspace Architect, Rapid Compatibility Checker, Procurement Strategist), multi-model switcher (Gemini 3.8 Flash, 3.1 Flash-Lite, 4 Argon), custom instruction editing, and 1-click execution cards.
4. "catalogue" (Product Catalogue): Complete directory of 24 products across all 6 categories with technical blueprints, live stock quantities, dimensions, power wattage, and filters (category, in-stock, price, search).
5. "compare" (Compare Bundles): Multi-bundle side-by-side comparative matrix (Starter Pack ₹35k, Developer Pro ₹65k, Executive Ultra ₹95k vs User's Custom Setup) comparing specs, weights, taxes, shipping, and ergonomic ratings.
6. "business" (Business Insights & Strategy): MBA strategic foundations (Section A: Problem, Section B: Deterministic Landed Bundles Value Proposition, Section C: Segments), Unit Economics simulator (Retailer ₹15,000 fee, ₹3,500 cost to serve, 3.5% referral commission, ₹120 variable cost), break-even basket threshold (~40 baskets), and empirical shopper research log.
7. "tests" (Automated Test Suite): 22+ live tests (REF-001 to REF-006, EDGE-001 to EDGE-006) verifying compatibility rules, landed price arithmetic, and Knapsack solver optimality with live execution logs.
8. "evidence" (Project Evidence & Scope Audit): Academic change documentation, baseline v0.1 prototype vs final implementation verification matrix (EVD-C07-001 to 008), contractual boundaries, and verified test procedures.
9. "settings" (Settings & Configuration): Tax rate settings (18% GST), Shipping rules (Base ₹499, Free Shipping > ₹50,000, Heavy Surcharge ₹450 for >=15kg), and factory data reset.
* Also: Global Floating / Drawer AI Assistant: Available on every screen, supports multilingual interaction (English, Hindi, Gujarati), and syncs with current workspace.

==================================================
3. CATALOGUE HIGHLIGHTS & PRODUCT INVENTORY
==================================================
${catalogueSummary}

Key Products & Categories:
- Desks: DSK-001 ErgoLift Dual-Motor Standing Desk (140x70cm, ₹24,999, 28kg), DSK-002 Nordic Minimalist Fixed Desk (120x60cm, ₹11,499, 18kg), DSK-003 Compact Urban Study Desk (90x50cm, ₹6,499, 12kg), DSK-004 Vertex Pro Corner L-Desk (160x110cm, ₹32,999 - OUT OF STOCK).
- Chairs: CHR-001 AeroMesh Ergonomic Task Chair (3D Lumbar, 4D arms, ₹14,999, 16kg), CHR-002 Orthopedic Executive Leather Chair (fixed wide arms, ₹18,999, 22kg - needs >=120cm desk), CHR-003 Basic Breathable Mid-Back Chair (₹5,999, 11kg), CHR-004 Active Stool (₹8,499 - OUT OF STOCK).
- Monitors: MON-001 27" 4K UHD IPS USB-C (65W PD, ₹26,999), MON-002 24" FHD IPS 100Hz (₹9,499), MON-003 34" WQHD Curved 1500R Ultrawide (₹34,999 - needs >=120cm desk, incompatible with clamp screenbar), MON-004 Budget 21.5" 1080p (legacy HDMI/VGA, ₹5,499 - incompatible with mini dock DCK-003).
- Docks: DCK-001 Thunderbolt 4 Triple-Display Dock (96W PD, ₹13,999), DCK-002 USB-C 7-in-1 Hub with Riser Stand (85W PD, ₹3,999), DCK-003 Ultra-Portable Mini Hub (DP only, NO HDMI, ₹2,199), DCK-004 Dual-Arm Monitor & Laptop Gas-Spring Arm (₹6,999).
- Peripherals: PER-001 Ergonomic Split Wireless Keyboard & Vertical Mouse (₹9,999), PER-002 Silent Multi-Device Bluetooth Combo (₹4,499), PER-003 Standard Wired Combo (₹1,299).
- Lighting: LGT-001 Asymmetric ScreenBar Monitor Light (clamp, flat screens only, ₹5,499), LGT-002 Architect Gooseneck Weighted Base LED Lamp (weighted base, safe for curved screens, ₹2,999), LGT-003 USB Clip-On Ring Light (clamp, ₹1,199).

==================================================
4. CORE DOMAIN RULES & FORMULAS
==================================================
1. Landed Price Formula:
   Landed Price = Product Subtotal + Net Shipping + 18% GST Tax
   - Free shipping if Product Subtotal >= ₹50,000 (Net Shipping = ₹0).
   - If Subtotal < ₹50,000: Net Shipping = ₹499 base + (Heavy Items Count × ₹450) where heavy item >= 15 kg.
   - Tax: 18% GST applied to (Subtotal + Net Shipping).
2. Hardware Compatibility:
   - Clamp Light vs Curved Monitor: ScreenBar clamps (LGT-001, LGT-003) cannot mount on curved screens (MON-003 1500R). Recommend weighted base lamp (LGT-002).
   - Desk Width vs Ultrawide: 34"+ ultrawide monitors (MON-003) require desk width >= 120 cm (DSK-001 or DSK-002).
   - Chair Clearance: Wide executive chair (CHR-002) requires >= 120 cm desk width.
   - Dock Ports: DisplayPort-only mini dock (DCK-003) cannot connect to HDMI-only legacy monitor (MON-004).
   - In-Stock Rule: Out-of-stock items (DSK-004, CHR-004) cannot be in a recommended bundle.
3. MBA Unit Economics:
   - Retailer Monthly Fee: ₹15,000 | Cost to Serve: ₹3,500 | Net Contribution: ₹11,500.
   - Affiliate Referral: 3.5% on eligible basket | Variable Cost: ₹120/basket.
   - Break-Even: Fixed Costs (₹85,000) ÷ Contribution Per Basket (~₹2,155) ≈ 40 baskets/month.
4. Auto-Solve Algorithm:
   - Cartesian product exploration with branch-and-bound pruning across 2,304 theoretical combinations.
   - Automatically eliminates out-of-stock and incompatible pairings to guarantee valid bundles within budget.

==================================================
5. INTERACTIVE 1-CLICK ACTION CARDS
==================================================
Whenever helpful, you CAN include an action block at the very end of your response inside a \`\`\`action\`\`\` code fence. The frontend will render it as an interactive 1-click execution card!

Supported Action Formats:
1. Apply Full Bundle:
\`\`\`action
{
  "type": "apply_bundle",
  "title": "Optimized Ergonomic Setup",
  "budget": 75000,
  "items": {
    "desk": "DSK-001",
    "chair": "CHR-001",
    "monitor": "MON-001",
    "laptop_stand_or_dock": "DCK-002",
    "peripherals": "PER-002",
    "lighting": "LGT-001"
  }
}
\`\`\`

2. Swap Specific Conflicting Product:
\`\`\`action
{
  "type": "swap_product",
  "slotId": "lighting",
  "productId": "LGT-002",
  "reason": "Swap to weighted base lamp to safely mount with curved monitor"
}
\`\`\`

3. Adjust Target Budget:
\`\`\`action
{
  "type": "set_budget",
  "budget": 85000,
  "reason": "Increases budget to accommodate motorized standing desk and 4K display"
}
\`\`\`

4. Direct Site Navigation (NEW!):
\`\`\`action
{
  "type": "navigate",
  "tab": "business",
  "reason": "Inspect the MBA unit economics, referral margins, and break-even simulator"
}
\`\`\`
Supported tabs for navigation: "dashboard", "builder", "chat", "catalogue", "compare", "business", "tests", "evidence", "settings".

==================================================
6. RESPONSE STYLE & MULTILINGUAL SUPPORT
==================================================
- Be clear, authoritative, friendly, and practical.
- Fully support questions in English, Hindi (हिंदी), and Gujarati (ગુજરાતી).
- You can explain features, navigate the user, diagnose errors, design custom setups, analyze economics, and explain tests!`;
}

/**
 * Intelligent Heuristic Response Engine
 * Grounded in the entire website so that even without an API key or offline,
 * the bot delivers comprehensive, context-aware answers and actionable cards.
 */
export function generateComprehensiveHeuristicResponse(message: string, context: any) {
  const lowerMsg = message.toLowerCase();
  const currentBudget = context?.budget || 75000;
  const validation = context?.validation;
  const violations = validation?.compatibilityViolations || validation?.violations || [];
  const availableProducts = context?.availableProducts || [];
  const requiredSlots = context?.requiredSlots || [];
  const activeTab = context?.activeTab || 'dashboard';

  // Detect language request
  const isHindi = lowerMsg.includes('hindi') || lowerMsg.includes('हिंदी') || lowerMsg.includes('भाषा') || /[\u0900-\u097F]/.test(message);
  const isGujarati = lowerMsg.includes('gujarati') || lowerMsg.includes('ગુજરાતી') || /[\u0A80-\u0AFF]/.test(message);

  // 1. Navigation / Whole Website Overview
  if (lowerMsg.includes('whole website') || lowerMsg.includes('all pages') || lowerMsg.includes('overview') || lowerMsg.includes('sitemap') || lowerMsg.includes('what can you do') || lowerMsg.includes('features')) {
    if (isHindi) {
      return {
        reply: `यह वेबसाइट **बजट-आधारित प्रोडक्ट बंडल बिल्डर (C07)** है। यहाँ कुल 9 मुख्य अनुभाग (मॉड्यूल्स) हैं:\n\n` +
          `1. **डैशबोर्ड (Dashboard)**: लाइव KPI, बजट उपयोग और त्वरित शॉर्टकट।\n` +
          `2. **बंडल बिल्डर (Builder)**: 6 स्लॉट (डेस्क, कुर्सी, मॉनिटर, डॉक, कीबोर्ड/माउस, लाइट) में हार्डवेयर कॉन्फ़िगर करें, लैंडेड प्राइस देखें और ऑटो-सॉल्व चलाएं।\n` +
          `3. **AI चैटबॉट (Chat)**: जेमिनी मल्टी-टर्न हार्डवेयर सलाहकार 3 विशेषज्ञ भूमिकाओं के साथ।\n` +
          `4. **प्रोडक्ट कैटलॉग (Catalogue)**: 24 हार्डवेयर उत्पादों का पूर्ण विवरण और लाइव स्टॉक।\n` +
          `5. **बंडल तुलना (Compare)**: स्टार्टर, डेवलपर प्रो और एग्जीक्यूटिव बंडलों की आमने-सामने तुलना।\n` +
          `6. **बिजनेस इनसाइट्स (Business)**: MBA यूनिट इकोनॉमिक्स, ब्रेक-ईवन बास्केट और शॉपर्स रिसर्च।\n` +
          `7. **ऑटोमेटेड टेस्ट सुइट (Tests)**: 22+ लाइव नियम और लैंडेड प्राइस टेस्ट।\n` +
          `8. **प्रोजेक्ट एविडेंस (Evidence)**: प्रोटोटाइप v0.1 बनाम अंतिम सत्यापन मैट्रिक्स।\n` +
          `9. **सेटिंग्स (Settings)**: 18% GST दर, शिपिंग नियम और डेटा रीसेट।\n\nआप किस पेज पर जाना चाहते हैं?`,
        action: {
          type: 'navigate',
          tab: 'builder',
          reason: 'Explore the 6-slot hardware Bundle Builder workspace'
        },
        model: 'heuristic-website-trainer'
      };
    }

    if (isGujarati) {
      return {
        reply: `આ વેબસાઇટ **બજેટ-આધારિત પ્રોડક્ટ બંડલ બિલ્ડર (C07)** છે. અહીં કુલ 9 મુખ્ય વિભાગો છે:\n\n` +
          `1. **ડેશબોર્ડ (Dashboard)**: લાઇવ KPI અને બજેટ પ્રોગ્રેસ.\n` +
          `2. **બંડલ બિલ્ડર (Builder)**: 6 હાર્ડવેર સ્લોટ્સ ગોઠવો અને ઑટો-સૉલ્વ ચલાવો.\n` +
          `3. **AI સહાયક (Chat)**: જેમિની મલ્ટિ-ટર્ન હાર્ડવેર કન્સલ્ટન્ટ.\n` +
          `4. **પ્રોડક્ટ કૅટેલોગ (Catalogue)**: 24 હાર્ડવેર ઉત્પાદનો અને લાઇવ સ્ટોક.\n` +
          `5. **બંડલ સરખામણી (Compare)**: પ્રીસેટ બંડલોની સરખામણી.\n` +
          `6. **બિઝનેસ ઇનસાઇટ્સ (Business)**: MBA યુનિટ ઇકોનોમિક્સ અને બ્રેક-ઇવન.\n` +
          `7. **ટેસ્ટિંગ સ્યુટ (Tests)**: 22+ લાઇવ સુસંગતતા અને પ્રાઇસિંગ ટેસ્ટ્સ.\n` +
          `8. **પ્રોજેક્ટ એવિડન્સ (Evidence)**: વેરિફિકેશન મૅટ્રિક્સ.\n` +
          `9. **સેટિંગ્સ (Settings)**: GST અને શિપિંગ નિયમો.\n\nતમે કયા પૃષ્ઠ પર જવા માંગો છો?`,
        action: {
          type: 'navigate',
          tab: 'builder',
          reason: 'વર્કસ્પેસ બંડલ બિલ્ડર ખોલો'
        },
        model: 'heuristic-website-trainer'
      };
    }

    return {
      reply: `I am fully trained on the entire **Budget-Based Product Bundle Builder** platform! Here is an overview of all 9 integrated modules:\n\n` +
        `1. **Executive Dashboard (\`dashboard\`)**: Real-time KPI telemetry (Budget, Landed Price, Utilization %, Compatibility, Limiting Factor) and quick solver shortcuts.\n` +
        `2. **Bundle Builder (\`builder\`)**: Interactive 6-slot workspace (Desk, Chair, Monitor, Dock, Peripherals, Lighting), live Landed Price calculation bar, and Cartesian Auto-Solve engine.\n` +
        `3. **Gemini AI Assistant (\`chat\`)**: Multi-turn hardware consultant with 3 specialized personas (Ergonomic Workspace Architect, Rapid Spec Checker, Procurement Strategist) and 1-click execution cards.\n` +
        `4. **Product Catalogue (\`catalogue\`)**: Full directory of 24 hardware components with specifications, weights, dimensions, and live stock tracking.\n` +
        `5. **Compare Bundles (\`compare\`)**: Side-by-side matrix comparing Starter Pack (₹35k), Developer Pro (₹65k), and Executive Ultra (₹95k) against your custom bundle.\n` +
        `6. **Business Insights & Strategy (\`business\`)**: MBA unit economics simulator (Retailer ₹15k fee, ₹3.5k cost-to-serve, 3.5% referral fee, break-even ~40 baskets) and empirical shopper research log.\n` +
        `7. **Automated Test Suite (\`tests\`)**: 22+ live browser tests (REF-001 to REF-006, EDGE-001 to EDGE-006) validating compatibility logic and pricing math.\n` +
        `8. **Project Evidence & Scope Audit (\`evidence\`)**: Academic audit tracking baseline prototype v0.1 vs final implementation, contractual scope boundaries, and verification proofs.\n` +
        `9. **Settings & Configuration (\`settings\`)**: 18% GST tax configuration, shipping surcharge rules (₹499 base, ₹50,000 free shipping threshold), and factory reset.\n\n` +
        `Where would you like to explore first?`,
      action: {
        type: 'navigate',
        tab: 'builder',
        reason: 'Open the 6-slot Bundle Builder workspace'
      },
      model: 'heuristic-website-trainer'
    };
  }

  // 2. Direct Navigation Intents
  if (lowerMsg.includes('go to') || lowerMsg.includes('navigate to') || lowerMsg.includes('open page') || lowerMsg.includes('show page') || lowerMsg.includes('show me')) {
    if (lowerMsg.includes('business') || lowerMsg.includes('economics') || lowerMsg.includes('mba') || lowerMsg.includes('strategy')) {
      return {
        reply: `Opening the **Business Insights & Strategy** page. Here you can explore our MBA unit economics simulator, retailer subscription contributions, referral fees, break-even basket forecasts, and the empirical shopper research log.`,
        action: { type: 'navigate', tab: 'business', reason: 'View Business Insights & Unit Economics' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('test') || lowerMsg.includes('suite') || lowerMsg.includes('verification')) {
      return {
        reply: `Opening the **Automated Test Suite**. Here you can run all 22+ tests in real time, validating reference requests, edge-case scenarios, and landed price mathematical precision.`,
        action: { type: 'navigate', tab: 'tests', reason: 'Run and inspect Automated Test Suite' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('catalogue') || lowerMsg.includes('catalog') || lowerMsg.includes('products') || lowerMsg.includes('inventory')) {
      return {
        reply: `Opening the **Product Catalogue**. Browse all 24 hardware components across 6 categories with technical blueprints, dimensions, wattage, and live stock levels.`,
        action: { type: 'navigate', tab: 'catalogue', reason: 'Browse complete Product Catalogue' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('compare') || lowerMsg.includes('comparison') || lowerMsg.includes('presets')) {
      return {
        reply: `Opening the **Compare Bundles** page. Review side-by-side matrices of the Starter (₹35k), Developer Pro (₹65k), and Executive (₹95k) setups against your active bundle.`,
        action: { type: 'navigate', tab: 'compare', reason: 'Inspect Side-by-Side Bundle Comparisons' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('evidence') || lowerMsg.includes('scope') || lowerMsg.includes('audit')) {
      return {
        reply: `Opening the **Project Evidence & Scope Audit** page. Review academic change documentation, baseline prototype v0.1 vs final implementation, and formal verification evidence.`,
        action: { type: 'navigate', tab: 'evidence', reason: 'Inspect Project Evidence & Scope Audit' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('setting') || lowerMsg.includes('config') || lowerMsg.includes('tax') || lowerMsg.includes('shipping fee')) {
      return {
        reply: `Opening the **Settings & Configuration** page. You can customize the 18% GST tax rate, shipping threshold policies, and restore factory defaults.`,
        action: { type: 'navigate', tab: 'settings', reason: 'Open Settings & Global Configuration' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('builder') || lowerMsg.includes('slots') || lowerMsg.includes('workspace')) {
      return {
        reply: `Navigating to the **Bundle Builder** workspace. Configure your 6 hardware slots with real-time landed price feedback and auto-solve optimization.`,
        action: { type: 'navigate', tab: 'builder', reason: 'Return to Bundle Builder' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('dashboard') || lowerMsg.includes('home') || lowerMsg.includes('kpi')) {
      return {
        reply: `Navigating to the **Executive Dashboard**. Review high-level budget metrics, compatibility alerts, and quick action shortcuts.`,
        action: { type: 'navigate', tab: 'dashboard', reason: 'View Executive Dashboard' },
        model: 'heuristic-website-trainer'
      };
    }
  }

  // 3. Business Insights & MBA Unit Economics Queries
  if (lowerMsg.includes('business') || lowerMsg.includes('unit economics') || lowerMsg.includes('mba') || lowerMsg.includes('break even') || lowerMsg.includes('break-even') || lowerMsg.includes('referral') || lowerMsg.includes('cost to serve') || lowerMsg.includes('retailer fee')) {
    return {
      reply: `### MBA Unit Economics & Strategy Overview\n\n` +
        `**1. Strategic Value Proposition**:\n` +
        `"Help shoppers build complete, compatible bundles with transparent landed pricing," solving assembly friction, hidden shipping fees, and port mismatches.\n\n` +
        `**2. Unit Economics Formulas**:\n` +
        `- **Retailer Monthly Contribution**: Retailer Monthly Fee (₹15,000) - Monthly Cost to Serve (₹3,500) = **₹11,500 net contribution** per enrolled retailer.\n` +
        `- **Affiliate Referral Revenue**: Eligible Basket Value × 3.5% referral commission.\n` +
        `- **Referral Contribution Per Basket**: Referral Revenue - Variable Cost per Basket (₹120).\n` +
        `  * E.g., On a ₹65,000 bundle: (₹65,000 × 3.5%) - ₹120 = ₹2,275 - ₹120 = **₹2,155 contribution**.\n` +
        `- **Break-Even Basket Threshold**: Fixed Monthly Costs (₹85,000) ÷ Contribution per basket (~₹2,155) = **~40 completed baskets/month**.\n\n` +
        `Would you like to open the interactive simulation calculator on the Business Insights page?`,
      action: {
        type: 'navigate',
        tab: 'business',
        reason: 'Open interactive MBA Unit Economics simulation'
      },
      model: 'heuristic-website-trainer'
    };
  }

  // 4. Automated Test Suite & Verification Queries
  if (lowerMsg.includes('test') || lowerMsg.includes('tests') || lowerMsg.includes('edge case') || lowerMsg.includes('verification') || lowerMsg.includes('benchmark')) {
    return {
      reply: `### Automated Test Suite (22+ Executable Tests)\n\n` +
        `Our test suite verifies the platform across two rigorous dimensions:\n\n` +
        `**1. Reference Request Tests (REF-001 to REF-006)**:\n` +
        `- **REF-001**: Budget Conscious Starter (₹35,000 target - confirms valid in-stock combination under tight budget).\n` +
        `- **REF-002**: Standard Professional Ergonomic Setup (₹65,000 target - confirms Tier-1/2 items with healthy budget buffer).\n` +
        `- **REF-003**: Executive Standing Desk Setup (₹95,000 target - validates motorized desk & 4K monitor pairing).\n` +
        `- **REF-004**: Infeasible Ultra-Low Budget (₹15,000 target - correctly asserts that 6 complete items cannot be formed).\n` +
        `- **REF-005**: Free Shipping Boundary Test (validates exact ₹50,000 free shipping waiver).\n` +
        `- **REF-006**: Heavy Weight Surcharge Test (validates ₹450 surcharge per item >= 15kg).\n\n` +
        `**2. Edge-Case Scenarios (EDGE-001 to EDGE-006)**:\n` +
        `- **EDGE-001**: Cheapest Products Incompatible (detects greedy failure trap).\n` +
        `- **EDGE-002**: Curved Monitor Clamp Light Trap (curved 1500R screen vs clamp screenbar).\n` +
        `- **EDGE-003**: Port Mismatch Trap (legacy monitor vs DP-only mini dock).\n` +
        `- **EDGE-004**: Out-of-Stock Trap (excludes DSK-004 and CHR-004).\n` +
        `- **EDGE-005**: Desk Tipping Overhang Trap (ultrawide monitor on 90cm desk).\n` +
        `- **EDGE-006**: Heavy Item Arithmetic Precision.\n\n` +
        `You can execute all tests live with latency tracking on the Test Results page.`,
      action: {
        type: 'navigate',
        tab: 'tests',
        reason: 'Execute and view live test results'
      },
      model: 'heuristic-website-trainer'
    };
  }

  // 5. Auto-Solve Algorithm Queries
  if (lowerMsg.includes('algorithm') || lowerMsg.includes('auto-solve') || lowerMsg.includes('autosolve') || lowerMsg.includes('how does it work') || lowerMsg.includes('knapsack') || lowerMsg.includes('cartesian')) {
    return {
      reply: `### Cartesian Auto-Solve Algorithm Explained\n\n` +
        `The bundle optimizer solves a **Multi-Choice Knapsack Problem with Physical Compatibility Constraints**:\n\n` +
        `1. **Candidate Grouping & Stock Pruning**:\n` +
        `   Products in the catalogue are grouped into the 6 required categories. Any item with \`inStock === false\` or quantity = 0 is pruned immediately (e.g., Vertex Pro Desk DSK-004, Wobble Stool CHR-004).\n\n` +
        `2. **Cartesian Product Exploration with Backtracking**:\n` +
        `   The algorithm evaluates candidate combinations (up to 2,304 potential bundle permutations) across all slots.\n\n` +
        `3. **Constraint Validation Engine**:\n` +
        `   For each bundle, it checks:\n` +
        `   - Desk width >= 120cm for ultrawide monitors (34"+).\n` +
        `   - ScreenBar clamps mount only on flat displays (no curved displays).\n` +
        `   - Port matches (HDMI/DP compatibility).\n` +
        `   - Chair armrest clearance.\n\n` +
        `4. **Landed Cost Evaluation**:\n` +
        `   Calculates Subtotal + Net Shipping (free if subtotal >= ₹50,000; else ₹499 + ₹450 per heavy item) + 18% GST. Discards any combination where Landed Price > Budget.\n\n` +
        `5. **Objective Function**:\n` +
        `   Depending on preference, it returns the **Lowest Cost** bundle or **Maximum Ergonomic Value** (maximizing Tier-1 ergonomic grades).`,
      action: {
        type: 'navigate',
        tab: 'builder',
        reason: 'Try the Auto-Solve button in Bundle Builder'
      },
      model: 'heuristic-website-trainer'
    };
  }

  // 6. Compatibility Conflict Resolution
  if (lowerMsg.includes('fix') || lowerMsg.includes('compatib') || lowerMsg.includes('error') || lowerMsg.includes('violation') || lowerMsg.includes('conflict')) {
    if (violations.length > 0) {
      const v = violations[0];
      // Check clamp vs curved monitor
      if (v.ruleId === 'clamp_vs_monitor' || lowerMsg.includes('lamp') || lowerMsg.includes('light') || lowerMsg.includes('curved')) {
        const weightedLamp = availableProducts.find(
          (p: any) => p.category === 'lighting' && (p.attributes?.lightMountType === 'weighted_base' || p.name.includes('Lamp')) && p.inStock
        ) || { id: 'LGT-002', name: 'Architect Gooseneck Weighted Base LED Task Lamp', price: 2999 };

        return {
          reply: `### Compatibility Conflict Detected: ScreenBar vs Curved Display\n\n` +
            `**Problem**: ScreenBar monitor clamp lights (LGT-001) cannot clip securely onto curved display bezels (MON-003 with 1500R curvature). The clamping angle causes uneven pressure, screen wobbling, or potential bezel cracks.\n\n` +
            `**Solution**: Swap to the **${weightedLamp.name}** (₹${weightedLamp.price.toLocaleString('en-IN')}). It features an independent weighted desktop base that illuminates the entire workspace without relying on monitor clamp mounting.\n\n` +
            `Click the button below to resolve this immediately in your builder!`,
          action: {
            type: 'swap_product',
            slotId: 'lighting',
            productId: weightedLamp.id,
            reason: `Swap to ${weightedLamp.name} to safely illuminate curved monitor setup.`
          },
          model: 'heuristic-website-trainer'
        };
      }

      // Check desk width vs ultrawide
      if (v.ruleId === 'desk_width_vs_ultrawide' || lowerMsg.includes('desk') || lowerMsg.includes('width') || lowerMsg.includes('overhang')) {
        const widerDesk = availableProducts.find(
          (p: any) => p.category === 'desk' && (p.attributes?.deskWidthCm || 0) >= 120 && p.inStock
        ) || { id: 'DSK-001', name: 'ErgoLift Dual-Motor Standing Desk (140x70cm)', price: 24999 };

        return {
          reply: `### Compatibility Conflict Detected: Desk Width vs Ultrawide Monitor\n\n` +
            `**Problem**: Ultrawide monitors (34"+) require at least 120 cm desk width. On compact 90 cm desks (DSK-003), the screen extends past the desk edges, presenting a tipping hazard.\n\n` +
            `**Solution**: Upgrade to the **${widerDesk.name}** (140 cm width). It provides ample room for peripherals, cable passthrough, and zero overhang risk.\n\n` +
            `Click below to swap to a wider desk!`,
          action: {
            type: 'swap_product',
            slotId: 'desk',
            productId: widerDesk.id,
            reason: `Upgrade to ${widerDesk.name} to accommodate 34-inch display without overhang.`
          },
          model: 'heuristic-website-trainer'
        };
      }

      return {
        reply: `You currently have **${violations.length} compatibility violation(s)**:\n\n` +
          violations.map((vio: any, i: number) => `${i + 1}. **${vio.ruleId}**: ${vio.message}`).join('\n') +
          `\n\nWould you like me to resolve these or navigate you to the Builder?`,
        action: {
          type: 'navigate',
          tab: 'builder',
          reason: 'Review and fix conflicts in Bundle Builder'
        },
        model: 'heuristic-website-trainer'
      };
    } else {
      return {
        reply: `All items currently selected in your bundle are **100% physically and electrically compatible**! There are no clamp mounting conflicts, desk overhang hazards, or hardware port mismatches.`,
        model: 'heuristic-website-trainer'
      };
    }
  }

  // 7. Budget Adjustment & Optimization
  if (lowerMsg.includes('budget') || lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('landed') || lowerMsg.includes('cheaper')) {
    if (validation?.landedPrice?.isOverBudget) {
      const overBy = validation.landedPrice.landedPrice - currentBudget;
      const targetCeiling = Math.ceil(validation.landedPrice.landedPrice / 1000) * 1000;
      return {
        reply: `### Budget Status: Over Budget by ₹${overBy.toLocaleString('en-IN')}\n\n` +
          `- **Current Landed Price**: ₹${validation.landedPrice.landedPrice.toLocaleString('en-IN')}\n` +
          `- **Current Target Budget**: ₹${currentBudget.toLocaleString('en-IN')}\n` +
          `- **Landed Breakdown**: Subtotal ₹${validation.landedPrice.productSubtotal.toLocaleString('en-IN')} + Net Shipping ₹${validation.landedPrice.netShipping} + 18% GST ₹${validation.landedPrice.taxAmount.toLocaleString('en-IN')}.\n\n` +
          `You can adjust your budget ceiling to **₹${targetCeiling.toLocaleString('en-IN')}** to accommodate your current premium selections, or ask me to find a cost-effective alternative setup.`,
        action: {
          type: 'set_budget',
          budget: targetCeiling,
          reason: `Increase budget to ₹${targetCeiling.toLocaleString('en-IN')} to cover complete landed price.`
        },
        model: 'heuristic-website-trainer'
      };
    } else {
      return {
        reply: `### Budget Status: Within Budget\n\n` +
          `- **Current Landed Price**: ₹${validation?.landedPrice?.landedPrice?.toLocaleString('en-IN') || '0'}\n` +
          `- **Target Budget**: ₹${currentBudget.toLocaleString('en-IN')}\n` +
          `- **Remaining Headroom**: ₹${validation?.landedPrice?.remainingBudget?.toLocaleString('en-IN') || currentBudget.toLocaleString('en-IN')} (${validation?.landedPrice?.budgetUtilisationPercent || 0}% utilized).\n\n` +
          `Your setup qualifies for safe checkout under your current financial cap.`,
        model: 'heuristic-website-trainer'
      };
    }
  }

  // 8. Bundle Recommendation Intent
  if (lowerMsg.includes('build') || lowerMsg.includes('recommend') || lowerMsg.includes('suggest') || lowerMsg.includes('setup') || lowerMsg.includes('bundle')) {
    const suggestedItems: Record<string, string> = {
      desk: 'DSK-001',
      chair: 'CHR-001',
      monitor: 'MON-001',
      laptop_stand_or_dock: 'DCK-002',
      peripherals: 'PER-002',
      lighting: 'LGT-001'
    };

    return {
      reply: `### Recommended Complete WFH Ergonomic Bundle\n\n` +
        `I have assembled an optimal, fully in-stock setup engineered for healthy posture and high productivity within ₹${currentBudget.toLocaleString('en-IN')}:\n\n` +
        `- **Workstation Desk**: ErgoLift Dual-Motor Standing Desk (140x70cm, ₹24,999) - motorized height adjustment with Tier-1 ergonomics.\n` +
        `- **Ergonomic Chair**: AeroMesh Task Chair with 3D Lumbar & 4D Armrests (₹14,999) - breathable mesh supporting 8+ hour shifts.\n` +
        `- **Main Display**: 27" 4K UHD IPS USB-C Monitor (₹26,999) - crisp 3840x2160 with single-cable 65W charging.\n` +
        `- **Dock & Riser**: USB-C 7-in-1 Aluminum Riser Stand (₹3,999) - 85W power delivery & 4K HDMI passthrough.\n` +
        `- **Peripherals**: Silent Multi-Device Bluetooth Combo (₹4,499) - whisper-quiet scissor keys.\n` +
        `- **Lighting**: Asymmetric ScreenBar Monitor Light (₹5,499) - zero screen glare, rotary wireless dial.\n\n` +
        `All items are 100% compatible with flat-bezel mounting and ample desk width. Click below to load this setup!`,
      action: {
        type: 'apply_bundle',
        title: 'Ergonomic Productivity Setup',
        budget: currentBudget >= 85000 ? currentBudget : 85000,
        items: suggestedItems
      },
      model: 'heuristic-website-trainer'
    };
  }

  // 9. Default Comprehensive Assistant Response
  return {
    reply: `Hello! I am your AI Consultant trained on the entire **Budget-Based Product Bundle Builder** platform.\n\n` +
      `Here is what I can do for you:\n\n` +
      `1. **Assemble & Optimize Complete Bundles**: Build valid 6-slot hardware setups matching your target budget.\n` +
      `2. **Resolve Compatibility Conflicts**: Fix curved monitor clamp mismatches, desk width overhangs, and port incompatibilities with 1-click swaps.\n` +
      `3. **Landed Pricing & Tax**: Calculate exact landed pricing including base shipping (₹499), heavy item surcharges (₹450), free shipping thresholds (₹50k), and 18% GST.\n` +
      `4. **MBA Unit Economics & Strategy**: Analyze retailer subscription revenue, referral fee margins (3.5%), and break-even basket forecasts (~40 baskets).\n` +
      `5. **Automated Testing**: Explain our 22+ tests, reference requests, and edge-case scenarios.\n` +
      `6. **Direct Navigation**: Navigate to any of our 9 platform pages (\`builder\`, \`catalogue\`, \`compare\`, \`business\`, \`tests\`, \`evidence\`, \`settings\`, \`dashboard\`).\n\n` +
      `How can I assist your workspace journey today?`,
    action: {
      type: 'navigate',
      tab: 'builder',
      reason: 'Open Bundle Builder workspace'
    },
    model: 'heuristic-website-trainer'
  };
}

