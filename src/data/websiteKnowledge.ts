/**
 * Comprehensive Website Knowledge Base & AI Training Module
 * Grounding the AI Assistant with complete knowledge of the entire
 * "Budget-Based Product Bundle Builder" (C07 Challenge) web application,
 * including all 40 products, categories, pricing, pages, checkout & direct chatbot ordering.
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
  catalogue: {
    id: 'catalogue',
    title: 'Product Catalogue',
    pathDescription: 'Comprehensive inventory & technical hardware directory',
    summary: 'Displays all 60 products (P01 to P60) across 26 professional categories covering software engineering, design, marketing, finance, education, HR, students, entrepreneurs, and architecture.',
    features: [
      '60 Curated Products across 26 categories: Monitor, Tablet, Stylus, Stand, Keypad, Dock, CardReader, Storage, Colorimeter, Headset, Audio, 3DMouse, CoolingStand, PhoneStand, Lighting, DocCamera, Organizer, Printer, Mouse, Keyboard, Hub, Bottle, Mug, Notebook, Backpack, DeskMat.',
      '6-Column Backend Filter Grid: Search query, Category filter, Colour filter, Size filter, In-Stock toggle, and Sort order.',
      'Live stock status tags (In Stock with exact unit count, or Currently Out of Stock).',
      'Direct Add to Cart button, Inspect Details view, and technical spec sheets.',
      'Instant pricing in INR (₹) and landed unit costs.'
    ],
    keyComponents: ['Backend Filter Bar', 'Product Cards Grid', 'Specification Badges', 'Stock Indicators', 'Add to Cart Buttons'],
    userActions: ['Search catalogue items', 'Filter by category/colour/size/stock', 'Inspect technical specs', 'Add products to cart']
  },
  compare: {
    id: 'compare',
    title: 'Compare Builder',
    pathDescription: 'Interactive bundle configuration & comparison workspace',
    summary: 'The primary workspace where shoppers assemble their bundle slots (Mouse, Keyboard, etc.), tune budget, and inspect live landed cost breakdowns.',
    features: [
      'Slot Grid with dynamic hardware assignment (MOUSE SLOT, KEYBOARD SLOT, etc.).',
      'Target Budget Stepper & Headroom progress gauge.',
      'Live Landed Price breakdown: Product Subtotal + Net Shipping (with free shipping logic) + 18% GST.',
      'Swap or remove products with instant recalculation.',
      'Direct navigation to bundle cart and checkout.'
    ],
    keyComponents: ['Slot Cards', 'Budget Controller', 'Landed Cost Panel', 'Headroom Gauge'],
    userActions: ['Assign products to slots', 'Adjust budget', 'Inspect landed pricing', 'Remove or swap items']
  },
  cart: {
    id: 'cart',
    title: 'Bundle Cart Drawer',
    pathDescription: 'Slide-over cart drawer with live budget utilization',
    summary: 'Slide-out cart drawer showing all selected bundle items, live budget headroom progress, quantity controls, and one-click BUY NOW button.',
    features: [
      'Slide-over animation with quick accessibility from header cart badge or sidebar.',
      'Live Budget Utilization Bar (Green for headroom, Rose for over budget, Exact Fit indicator).',
      'Itemized list with thumbnails, prices, and one-click removal.',
      'Quick-add suggestions divider for empty slots.',
      'BUY NOW button with total landed price and instant order confirmation.'
    ],
    keyComponents: ['Drawer Header', 'Budget Progress Bar', 'Cart Item Cards', 'Order Summary', 'BUY NOW Button'],
    userActions: ['Review cart items', 'Remove items', 'Check remaining budget headroom', 'Click BUY NOW to place order']
  },
  checkout: {
    id: 'checkout',
    title: 'Secure Checkout & Order Placement',
    pathDescription: 'Order finalization, shipping details & payment processing',
    summary: 'Full checkout page allowing users to place orders, enter delivery details, select payment methods (UPI, Card, Netbanking, COD), inspect taxes & shipping, and download invoices.',
    features: [
      'Order Summary with line-by-line product details, unit prices, and quantities.',
      'Customer Details pre-filled from user profile (Tanmay Anand, Bangalore / Mumbai).',
      '4 Payment Gateways: UPI (GPay/PhonePe), Credit/Debit Card, Netbanking, and Cash on Delivery.',
      'Transparent Landed Cost calculation: Product Subtotal + Net Shipping (₹499 / free over ₹50,000) + 18% GST.',
      'Instant Order Confirmation with unique Order ID (#C07-ORD-XXXXXX) and PDF/CSV invoice download.'
    ],
    keyComponents: ['Order Items List', 'Customer Delivery Form', 'Payment Method Selector', 'Cost Breakdown Card', 'Place Order Button'],
    userActions: ['Fill or confirm delivery address', 'Select payment method', 'Review final landed cost', 'Place official order', 'Download invoice']
  },
  profile: {
    id: 'profile',
    title: 'Customer Profile',
    pathDescription: 'Personal identity, shipping defaults & budget preferences',
    summary: 'Displays customer avatar (TA), membership date (March 2024), default shipping address, and shopping preferences with quick demo account switching.',
    features: [
      'Customer identity card with avatar and role indicator.',
      'Shipping & Location settings (Name, Phone, Address, City, State, PIN).',
      'Shopping & Budget Defaults (Default target budget, preferred categories).',
      'Quick Switch Demo button to test customer and admin experiences.'
    ],
    keyComponents: ['Profile Header Card', 'Tab Navigation', 'Shipping Address Editor', 'Budget Defaults'],
    userActions: ['Edit contact information', 'Update shipping address', 'Change budget preferences', 'Switch demo account']
  },
  chat: {
    id: 'chat',
    title: 'Gemini AI Assistant & Shopping Bot',
    pathDescription: 'Multi-turn conversational consultant with direct ordering capabilities',
    summary: 'Conversational AI trained on the entire website capable of ordering ANY product (P01-P40), adding items to cart, adjusting budgets, and answering domain questions.',
    features: [
      'Order Anything via Chatbot: Say "Order P26" or "Buy a mechanical keyboard and mouse" to generate instant 1-click orders.',
      '3 Expert Personas: Ergonomic Workspace Architect, Rapid Compatibility Checker, Procurement & Unit Economics Strategist.',
      '1-Click Interactive Action Cards: Order Now, Add to Cart, Proceed to Checkout, Swap Product, Adjust Budget, Navigate to Any Page.',
      'Multi-model switcher: Gemini 3.8 Flash, Gemini 3.1 Flash-Lite, Gemini 4 Argon.',
      'Workspace Context Sync: Real-time awareness of cart items, target budget, and catalogue inventory.'
    ],
    keyComponents: ['Message Thread', 'Role Switcher', 'Guidance Toolkit', 'Action Cards', 'Prompt Starters'],
    userActions: ['Order any product by chat', 'Add items to cart', 'Ask for setup advice', 'Trigger 1-click action cards', 'Export chat transcript']
  },
  dashboard: {
    id: 'dashboard',
    title: 'Executive Dashboard',
    pathDescription: 'Overview & telemetry command center',
    summary: 'Displays real-time high-level KPIs, budget utilization progress gauge, compatibility status badges, and quick shortcuts.',
    features: [
      'Live KPI telemetry: Target Budget, Landed Price, Budget Utilization %, Compatibility Status, Filled Slots count.',
      'Circular progress meter for budget headroom.',
      'Quick action shortcuts to catalogue and compare builder.'
    ],
    keyComponents: ['KPI Cards', 'Budget Gauge', 'Quick Action Buttons'],
    userActions: ['View current metrics', 'Inspect budget headroom', 'Navigate to Builder']
  },
  business: {
    id: 'business',
    title: 'Business Insights & Strategy',
    pathDescription: 'MBA unit economics simulation & strategic framework',
    summary: 'Executive strategic analysis containing problem statements, deterministic landed bundles value proposition, retailer subscription fees, referral margins, and break-even basket threshold.',
    features: [
      'MBA Unit Economics: Retailer fee (₹15,000) - cost to serve (₹3,500) = ₹11,500 net contribution.',
      'Referral Commission: 3.5% on eligible basket minus ₹120 variable cost.',
      'Break-even Basket Model: Fixed monthly costs (₹85,000) / contribution per basket = ~40 baskets/month.',
      'Empirical Shopper Research Log: Participant sessions tracking time, spend, and errors.'
    ],
    keyComponents: ['Strategic Cards', 'Unit Economics Simulator', 'Shopper Research Log'],
    userActions: ['Simulate unit economics', 'Inspect break-even model', 'Review shopper research']
  },
  tests: {
    id: 'tests',
    title: 'Automated Test Suite',
    pathDescription: 'System verification & edge-case test runner',
    summary: 'Live browser-executable test suite running 22+ tests covering compatibility rules, landed price arithmetic, and edge-case scenarios.',
    features: [
      'Reference Request Tests (REF-001 to REF-006): Starter Pack, Pro Setup, Infeasible Ultra-low, Free Shipping Boundary, Heavy Surcharge.',
      'Edge-Case Scenario Tests (EDGE-001 to EDGE-006): Cheapest Products Incompatible, Curved Monitor Clamp Trap, Dock Port Discrepancy, Out-of-Stock Item Trap.',
      'Live execution with real-time pass/fail badges and latency tracking.'
    ],
    keyComponents: ['Test Runner', 'Summary Badges', 'Test Cards'],
    userActions: ['Run all tests', 'Inspect assertions', 'Verify landed price math']
  },
  evidence: {
    id: 'evidence',
    title: 'Project Evidence & Scope Audit',
    pathDescription: 'Academic engineering change documentation & audit log',
    summary: 'Documents starting state (v0.1 prototype) vs requested changes, contractual scope boundaries, verified test procedures, and mathematical proofs.',
    features: [
      'Baseline Starting State vs Final Implementation Matrix (EVD-C07-001 to 008).',
      'Contractual scope boundaries and proofs.',
      'Interactive evidence audit records.'
    ],
    keyComponents: ['Scope Matrix', 'Audit Records Table'],
    userActions: ['Review milestones', 'Inspect verification proofs']
  },
  settings: {
    id: 'settings',
    title: 'Settings & Configuration',
    pathDescription: 'Global parameters & data management',
    summary: 'Controls core platform rules including 18% GST tax rate, shipping policies (₹499 base, ₹50,000 free shipping threshold), and factory data reset.',
    features: [
      'Tax Rule Settings: GST rate (default 18%).',
      'Shipping Policy Settings: Base fee (₹499), Free shipping threshold (₹50,000), Heavy item surcharge (₹450).',
      'Factory Reset: Clear storage and reload defaults.'
    ],
    keyComponents: ['Tax Settings', 'Shipping Policy', 'Reset Data Button'],
    userActions: ['Modify tax or shipping rules', 'Restore factory default fixture']
  }
};

/**
 * Complete Catalogue of all 40 Products
 */
export const CATALOGUE_PRODUCTS_METADATA = [
  { id: 'P01', name: 'Blue Tshirt', category: 'Tshirt', price: 500, colour: 'Blue', size: 'M', stock: 0, desc: 'Cotton Blue Crewneck Tshirt' },
  { id: 'P02', name: 'Black Tshirt', category: 'Tshirt', price: 600, colour: 'Black', size: 'M', stock: 15, desc: 'Classic Black Cotton Tshirt' },
  { id: 'P03', name: 'Grey Tshirt', category: 'Tshirt', price: 550, colour: 'Grey', size: 'L', stock: 20, desc: 'Athletic Heather Grey Tshirt' },
  { id: 'P04', name: 'Blue Tshirt', category: 'Tshirt', price: 500, colour: 'Blue', size: 'L', stock: 7, desc: 'Cotton Blue Crewneck Tshirt' },
  { id: 'P05', name: 'Black Tshirt', category: 'Tshirt', price: 600, colour: 'Black', size: 'S', stock: 12, desc: 'Classic Black Cotton Tshirt' },
  { id: 'P06', name: 'White Tshirt', category: 'Tshirt', price: 450, colour: 'White', size: 'M', stock: 18, desc: 'Crisp White Cotton Tshirt' },
  { id: 'P07', name: 'Ergonomic Wireless Mouse', category: 'Mouse', price: 800, colour: 'Black', stock: 25, connector: 'usb-c', desc: 'Precision 2.4GHz USB-C Wireless Mouse' },
  { id: 'P08', name: 'Compact Mechanical Keyboard', category: 'Keyboard', price: 1500, colour: 'Black', stock: 14, connector: 'usb-c', desc: 'Tenkeyless Mechanical Keyboard with Red Switches' },
  { id: 'P09', name: 'USB-C Multiport Hub', category: 'Hub', price: 1200, colour: 'Space Grey', stock: 30, connector: 'usb-c', desc: '4K HDMI, 3x USB 3.0, 100W PD passthrough' },
  { id: 'P10', name: 'Stainless Steel Water Bottle', category: 'Bottle', price: 400, colour: 'Silver', stock: 40, desc: '750ml Vacuum Insulated Stainless Steel' },
  { id: 'P11', name: 'Ceramic Coffee Mug', category: 'Mug', price: 250, colour: 'White', stock: 50, desc: '350ml Matte White Ceramic Coffee Mug' },
  { id: 'P12', name: 'Travel Tumbler Mug', category: 'Mug', price: 450, colour: 'Black', stock: 35, desc: 'Spill-Proof Insulated Travel Mug' },
  { id: 'P13', name: 'Pocket Ruled Notebook', category: 'Notebook', price: 150, colour: 'Tan', stock: 60, desc: 'A5 Hardcover Acid-free Ruled Notebook' },
  { id: 'P14', name: 'Everyday Commuter Backpack', category: 'Backpack', price: 1800, colour: 'Charcoal', stock: 16, desc: 'Water-resistant 20L Laptop Backpack' },
  { id: 'P15', name: 'Wireless Charging Desk Pad', category: 'DeskMat', price: 950, colour: 'Black', stock: 22, connector: 'usb-c', desc: 'Extended Leatherette Desk Mat with 15W Qi Charger' },
  { id: 'P16', name: 'Foldable Aluminum Laptop Stand', category: 'Stand', price: 850, colour: 'Silver', stock: 28, desc: 'Multi-angle Adjustable Laptop Stand' },
  { id: 'P17', name: 'Noise-Isolating Earbuds', category: 'Audio', price: 1100, colour: 'Black', stock: 19, connector: 'usb-c', desc: 'In-ear USB-C Audio Earbuds with In-line Mic' },
  { id: 'P18', name: 'Braided USB-C to USB-C Cable (2m)', category: 'Cable', price: 350, colour: 'Grey', stock: 80, connector: 'usb-c', desc: '100W Power Delivery 480Mbps Sync' },
  { id: 'P19', name: 'Ergonomic Memory Foam Wrist Rest', category: 'Accessory', price: 400, colour: 'Black', stock: 32, desc: 'Cooling Gel Memory Foam Keyboard Wrist Rest' },
  { id: 'P20', name: 'Desk Cable Organizer Clips (5-Pack)', category: 'Organizer', price: 200, colour: 'Black', stock: 75, desc: 'Self-adhesive Silicone Cable Holders' },
  { id: 'P21', name: 'Full-Size Wireless Keyboard', category: 'Keyboard', price: 1350, colour: 'White', stock: 15, connector: 'usb-c', desc: 'Slim Scissor-switch Wireless Keyboard with Numpad' },
  { id: 'P22', name: 'Silent Bluetooth Travel Mouse', category: 'Mouse', price: 650, colour: 'White', stock: 26, connector: 'usb-c', desc: 'Ultra-thin Quiet Click Bluetooth & 2.4G Mouse' },
  { id: 'P23', name: 'Heavy-Duty Canvas Tote Bag', category: 'Backpack', price: 350, colour: 'Natural', stock: 45, desc: 'Eco-friendly 100% Cotton Canvas Carryall' },
  { id: 'P24', name: 'Insulated Sports Water Bottle', category: 'Bottle', price: 500, colour: 'Matte Blue', stock: 21, desc: '1L Chug Cap Stainless Gym Bottle' },
  { id: 'P25', name: 'Executive Pen & Journal Set', category: 'Notebook', price: 650, colour: 'Midnight Blue', stock: 18, desc: 'Faux-leather Debossed Journal with Rollerball Pen' },
  { id: 'P26', name: 'Ergonomic Wireless Vertical Mouse', category: 'Mouse', price: 1450, colour: 'Graphite', stock: 18, connector: 'usb-c', desc: '57° natural handshake angle, 4000 DPI' },
  { id: 'P27', name: 'RGB Mechanical Gaming Keyboard', category: 'Keyboard', price: 2400, colour: 'Black', stock: 12, connector: 'usb-c', desc: 'Hot-swappable linear red switches, per-key RGB' },
  { id: 'P28', name: 'Compact 60% Wireless Keyboard', category: 'Keyboard', price: 1850, colour: 'White/Grey', stock: 10, connector: 'usb-c', desc: 'Dual-mode Bluetooth 5.1 / 2.4G, PBT keycaps' },
  { id: 'P29', name: 'Silent Precision Bluetooth Mouse', category: 'Mouse', price: 950, colour: 'Space Grey', stock: 24, connector: 'usb-c', desc: '90% sound reduction, dual-device fast switch' },
  { id: 'P30', name: 'Aluminum Laptop Riser Stand', category: 'Stand', price: 1299, colour: 'Silver', stock: 20, desc: 'CNC anodized ergonomic desktop elevator' },
  { id: 'P31', name: 'Dual Monitor Arm Desk Mount', category: 'Stand', price: 2800, colour: 'Matte Black', stock: 8, desc: 'Gas spring 360° rotation for 17-32 inch screens' },
  { id: 'P32', name: 'Desk Pad Vegan Leather Blotter', category: 'DeskMat', price: 650, colour: 'Saddle Brown', stock: 35, desc: '800x400mm waterproof non-slip surface' },
  { id: 'P33', name: 'Magnetic Cable Management Organizer', category: 'Organizer', price: 399, colour: 'Charcoal', stock: 45, desc: 'Weighted desk base with 5 magnetic collars' },
  { id: 'P34', name: 'USB-C 100W GaN Fast Charger', category: 'Charger', price: 1899, colour: 'White', stock: 22, connector: 'usb-c', desc: '3x USB-C + 1x USB-A PD 3.0 ultra-compact GaN' },
  { id: 'P35', name: 'Active Noise Cancelling Wireless Headphones', category: 'Audio', price: 4999, colour: 'Midnight Black', stock: 9, connector: 'usb-c', desc: '40mm drivers, 35dB hybrid ANC, 40h battery' },
  { id: 'P36', name: 'USB-C Studio Condenser Microphone', category: 'Audio', price: 3200, colour: 'Matte Black', stock: 14, connector: 'usb-c', desc: 'Cardioid pickup, tap-to-mute, built-in pop filter' },
  { id: 'P37', name: '4K Ultra HD Streaming Webcam', category: 'Webcam', price: 3600, colour: 'Black', stock: 11, connector: 'usb-c', desc: '4K@30fps, autofocus, dual stereo mics, privacy shutter' },
  { id: 'P38', name: 'ScreenBar Desk Light with Auto-Dimming', category: 'Lighting', price: 2150, colour: 'Space Grey', stock: 16, connector: 'usb-c', desc: 'Asymmetric anti-glare monitor lamp, ambient light sensor' },
  { id: 'P39', name: 'Insulated Ceramic Travel Mug', category: 'Mug', price: 550, colour: 'Sage Green', stock: 28, desc: 'Double-wall vacuum with ceramic interior, 350ml' },
  { id: 'P40', name: 'HydroTech Thermal Vacuum Flask', category: 'Bottle', price: 750, colour: 'Obsidian Black', stock: 19, desc: '18/8 stainless steel, 24h cold / 12h hot, 750ml' },
  { id: 'P41', name: '27" 4K UHD Designer Color-Accurate Monitor', category: 'Monitor', price: 28500, colour: 'Space Grey', stock: 15, connector: 'usb-c', desc: 'IPS 99% DCI-P3 65W PD factory-calibrated' },
  { id: 'P42', name: '34" Curved WQHD Ultrawide Productivity Monitor', category: 'Monitor', price: 36000, colour: 'Matte Black', stock: 12, connector: 'usb-c', desc: '1500R 3440x1440 100Hz USB-C KVM hub' },
  { id: 'P43', name: '15.6" Portable USB-C FHD Second Screen Monitor', category: 'Monitor', price: 12999, colour: 'Carbon Black', stock: 18, connector: 'usb-c', desc: 'Ultra-slim 1080p IPS dual USB-C + mini HDMI' },
  { id: 'P44', name: 'Professional Graphic Drawing Tablet with 8192-Level Pressure Stylus', category: 'Tablet', price: 6499, colour: 'Midnight Black', stock: 22, connector: 'usb-c', desc: '10x6 inch active area, 8 express keys, battery-free pen' },
  { id: 'P45', name: 'Active Digital Precision Stylus Pen with Palm Rejection', category: 'Stylus', price: 2200, colour: 'White', stock: 35, connector: 'usb-c', desc: 'Tilt-sensitivity, 0 lag, magnetic attachment' },
  { id: 'P46', name: 'Multi-Angle Aluminum Tablet & iPad Stand', category: 'Stand', price: 1150, colour: 'Silver', stock: 28, desc: 'Dual-hinge 360° CNC aluminum desktop holder' },
  { id: 'P47', name: 'Wireless Ergonomic Numeric Keypad', category: 'Keypad', price: 1250, colour: 'Space Grey', stock: 30, connector: 'usb-c', desc: '22-key scissor-switch rechargeable numeric keypad' },
  { id: 'P48', name: 'Thunderbolt 4 / USB-C 12-in-1 Triple Display Docking Station', category: 'Dock', price: 14500, colour: 'Space Grey', stock: 14, connector: 'usb-c', desc: 'Dual HDMI + DP, 100W PD, Gigabit Ethernet, 4x USB' },
  { id: 'P49', name: 'High-Speed USB-C Multi-Card Reader & Hub (SD/microSD/CFast)', category: 'CardReader', price: 1450, colour: 'Silver', stock: 40, connector: 'usb-c', desc: 'UHS-II 312MB/s dual-slot simultaneous transfer' },
  { id: 'P50', name: '1TB Rugged NVMe External Portable SSD (1050MB/s)', category: 'Storage', price: 7800, colour: 'Slate Blue', stock: 25, connector: 'usb-c', desc: 'Drop-resistant IP55 USB 3.2 Gen 2 portable SSD' },
  { id: 'P51', name: 'Professional Display Color Calibrator Tool', category: 'Colorimeter', price: 9999, colour: 'Black', stock: 10, connector: 'usb-c', desc: 'Hardware calibration sensor for accurate studio grading' },
  { id: 'P52', name: 'Pro Wireless Conference Headset with Noise-Cancelling Boom Mic', category: 'Headset', price: 3499, colour: 'Matte Black', stock: 24, connector: 'usb-c', desc: 'AI ambient noise cancelling mic, 30h talk time' },
  { id: 'P53', name: 'Studio Acoustic Isolation Desk Microphone Shield', category: 'Audio', price: 1850, colour: 'Black Foam', stock: 16, desc: 'High-density sound absorbing acoustic reflex shield' },
  { id: 'P54', name: '3Dconnexion SpaceNavigator 3D CAD Navigation Mouse', category: '3DMouse', price: 8900, colour: 'Brushed Steel', stock: 11, connector: 'usb-c', desc: '6-Degrees-of-Freedom 3D sensor for CAD & 3D modeling' },
  { id: 'P55', name: 'Aluminum Laptop Cooling Pad with Dual Silent Fans', category: 'CoolingStand', price: 1650, colour: 'Silver', stock: 32, connector: 'usb-c', desc: 'CNC ventilated mesh with dual 120mm whisper fans' },
  { id: 'P56', name: 'MagSafe Adjustable Desktop Phone & Tablet Stand', category: 'PhoneStand', price: 850, colour: 'Space Grey', stock: 45, desc: 'Weighted base magnetic portrait/landscape swivel' },
  { id: 'P57', name: '10-inch Bi-Color LED Ring Light with Desktop Tripod', category: 'Lighting', price: 1599, colour: 'White/Warm', stock: 27, connector: 'usb-c', desc: '3200K-5600K dimmable USB ring light with phone holder' },
  { id: 'P58', name: '4K Overhead USB Document Camera & Visualiser', category: 'DocCamera', price: 4800, colour: 'Matte Black', stock: 15, connector: 'usb-c', desc: '13MP sensor, multi-joint arm for online teaching & demos' },
  { id: 'P59', name: 'Multi-Tier Desktop Document Organiser & Filing Tray', category: 'Organizer', price: 899, colour: 'Mesh Black', stock: 38, desc: '3-tier pull-out steel mesh file and folder tray' },
  { id: 'P60', name: 'Wireless Thermal Shipping Label Printer & Barcode Scanner Kit', category: 'Printer', price: 6200, colour: 'White', stock: 20, connector: 'usb-c', desc: '4x6 inch direct thermal label printer with handheld 2D scanner' }
];

export const LANDED_PRICING_FORMULA = `
Landed Price = Product Subtotal + Net Shipping + 18% GST Tax
- Product Subtotal: Sum of retail prices of all selected in-stock items.
- Free Shipping Threshold: If Product Subtotal >= ₹50,000, Net Shipping is ₹0.
- If Subtotal < ₹50,000: Net Shipping = Base Fee (₹499) + (Heavy Items Count × ₹450), where a heavy item is any product >= 15 kg.
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

  const productsIndex = CATALOGUE_PRODUCTS_METADATA.map(
    p => `[${p.id}] ${p.name} (${p.category}) - ₹${p.price.toLocaleString('en-IN')}${p.stock === 0 ? ' [OUT OF STOCK]' : ` [In Stock: ${p.stock}]`} - ${p.desc}`
  ).join('\n');

  return `${rolePersona ? rolePersona + '\n\n' : ''}${customInstruction ? customInstruction + '\n\n' : ''}You are Sahay AI (सहाय AI), the master intelligent AI Assistant and Shopping Agent for the "Budget-Based Product Bundle Builder" (C07 Challenge) web application.
You possess complete, authoritative knowledge of the ENTIRE platform, all 40 products (P01 to P40), compatibility rules, pricing formulas, MBA unit economics, and CAN DIRECTLY TAKE ORDERS AND MANAGE CARTS!

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
2. COMPLETE SITEMAP & INTEGRATED MODULES
==================================================
1. "catalogue" (Product Catalogue): 40 curated products across 15 categories (Tshirt, Mug, Mouse, Keyboard, Hub, Bottle, Notebook, Backpack, Stand, DeskMat, Organizer, Charger, Audio, Webcam, Lighting) with live stock tracking and 6-column API filters.
2. "compare" / "builder" (Compare Builder): 2-slot active bundle configurator (Mouse, Keyboard, etc.) with real-time budget headroom and landed cost breakdown.
3. "cart" (Bundle Cart Drawer): Slide-over drawer with line items, budget utilization gauge, and direct BUY NOW instant order placement.
4. "checkout" (Secure Checkout & Order Placement): Full order confirmation page where customers review their order items, enter shipping & delivery details, choose payment method (UPI, Credit/Debit Card, Netbanking, COD), inspect taxes & shipping fees, place orders with order ID (#C07-ORD-XXXXXX), and download official invoices.
5. "profile" (Customer Profile): Customer identity card (Tanmay Anand / TA), shipping addresses, shopping & budget defaults, role quick-switch.
6. "chat" (Gemini AI Assistant & Shopping Agent): Conversational consultant with DIRECT ORDERING POWERS.
7. "dashboard" (Executive Dashboard): Real-time KPI telemetry and shortcuts.
8. "business" (Business Insights & Strategy): MBA unit economics simulator (Retailer ₹15k fee, ₹3.5k cost-to-serve, 3.5% referral commission, break-even ~40 baskets).
9. "tests" (Automated Test Suite): 22+ live browser tests (REF-001 to REF-006, EDGE-001 to EDGE-006) validating compatibility logic and pricing math.
10. "evidence" (Project Evidence & Scope Audit): Academic audit tracking baseline prototype v0.1 vs final implementation.
11. "settings" (Settings & Configuration): 18% GST tax configuration, shipping surcharge rules (₹499 base, ₹50,000 free shipping threshold), and factory reset.

==================================================
3. FULL PRODUCT INVENTORY (40 PRODUCTS: P01 - P40)
==================================================
${productsIndex}

==================================================
4. CORE DOMAIN RULES & FORMULAS
==================================================
1. Landed Price Formula:
   Landed Price = Product Subtotal + Net Shipping + 18% GST Tax
   - Free shipping if Product Subtotal >= ₹50,000 (Net Shipping = ₹0).
   - If Subtotal < ₹50,000: Net Shipping = ₹499 base + (Heavy Items Count × ₹450) where heavy item >= 15 kg.
   - Tax: 18% GST applied to (Subtotal + Net Shipping).
2. Hardware Compatibility:
   - ScreenBar lights (P38) require flat monitor bezels.
   - Peripherals (P07, P08, P26, P27, P28, P29, P34, P35, P36, P37, P38) use USB-C connectivity.
   - Out-of-stock items (such as P01 Blue Tshirt Size M) cannot be ordered or bundled.

==================================================
5. DIRECT ORDERING & INTERACTIVE ACTION CARDS
==================================================
YOU CAN ORDER ANY PRODUCT DIRECTLY FOR THE USER!
Whenever a user wants to order, buy, purchase, or add to cart (e.g. "order P26", "buy the RGB keyboard and 100W GaN charger", "order 2 blue tshirts", "checkout now"):
1. Identify the products by their IDs (P01-P40) or names.
2. Determine the requested quantities.
3. Calculate subtotal, shipping (₹499 or free if subtotal >= ₹50,000), 18% GST tax, and landed total.
4. Output a clear, cheerful order confirmation breakdown in the response.
5. INCLUDE AN ACTION CODE BLOCK AT THE VERY END in a \`\`\`action\`\`\` block!

Supported Action Formats:

1. Direct Order Action:
\`\`\`action
{
  "type": "order_items",
  "title": "Order Ergonomic Wireless Vertical Mouse (P26)",
  "items": [
    { "id": "P26", "name": "Ergonomic Wireless Vertical Mouse", "price": 1450, "quantity": 1 }
  ],
  "subtotal": 1450,
  "netShipping": 499,
  "taxAmount": 350.82,
  "total": 2299.82,
  "reason": "Direct one-click order placement via Sahay AI"
}
\`\`\`

2. Add to Bundle Cart:
\`\`\`action
{
  "type": "add_to_cart",
  "title": "Add RGB Mechanical Gaming Keyboard to Cart",
  "items": [
    { "id": "P27", "name": "RGB Mechanical Gaming Keyboard", "price": 2400, "quantity": 1 }
  ],
  "reason": "Added to your active bundle cart"
}
\`\`\`

3. Proceed to Checkout:
\`\`\`action
{
  "type": "checkout",
  "title": "Proceed to Secure Checkout",
  "reason": "Review items and complete payment"
}
\`\`\`

4. Apply Full Bundle:
\`\`\`action
{
  "type": "apply_bundle",
  "title": "High-Efficiency Developer Setup",
  "budget": 10000,
  "items": {
    "Mouse": "P26",
    "Keyboard": "P27",
    "Charger": "P34"
  }
}
\`\`\`

5. Direct Site Navigation:
\`\`\`action
{
  "type": "navigate",
  "tab": "catalogue",
  "reason": "Browse complete 40-item product inventory"
}
\`\`\`
Supported tabs for navigation: "catalogue", "compare", "cart", "checkout", "profile", "dashboard", "business", "tests", "evidence", "settings", "chat".

==================================================
6. RESPONSE STYLE & MULTILINGUAL SUPPORT
==================================================
- Be enthusiastic, accurate, and deeply helpful.
- For orders, explicitly list each item name, product ID, quantity, unit price, subtotal, shipping, 18% GST, and landed total.
- Mention that delivery will be addressed to the active customer profile (Tanmay Anand).
- Fully support questions and orders in English, Hindi (हिंदी), and Gujarati (ગુજરાતી)!`;
}

/**
 * Intelligent Heuristic Response Engine
 * Grounded in the entire website so that even without an API key or offline,
 * the bot delivers comprehensive, context-aware answers, orders, and actionable cards.
 */
export function generateComprehensiveHeuristicResponse(message: string, context: any) {
  const lowerMsg = message.toLowerCase();
  const currentBudget = context?.budget || 75000;
  const validation = context?.validation;
  const violations = validation?.compatibilityViolations || validation?.violations || [];
  const availableProducts = (context?.availableProducts && context.availableProducts.length > 0)
    ? context.availableProducts
    : CATALOGUE_PRODUCTS_METADATA;

  // Detect language request
  const isHindi = lowerMsg.includes('hindi') || lowerMsg.includes('हिंदी') || lowerMsg.includes('भाषा') || /[\u0900-\u097F]/.test(message);
  const isGujarati = lowerMsg.includes('gujarati') || lowerMsg.includes('ગુજરાતી') || /[\u0A80-\u0AFF]/.test(message);

  // Helper to find product from metadata or context
  function findProduct(query: string) {
    const q = query.toLowerCase().trim();
    return CATALOGUE_PRODUCTS_METADATA.find(p =>
      p.id.toLowerCase() === q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase() === q ||
      p.desc.toLowerCase().includes(q)
    );
  }

  // =========================================================================
  // 1. ORDERING INTENTS (Order, Buy, Purchase, Add to Cart, Checkout)
  // =========================================================================
  const isOrderIntent =
    lowerMsg.includes('order') ||
    lowerMsg.includes('buy') ||
    lowerMsg.includes('purchase') ||
    lowerMsg.includes('get me') ||
    lowerMsg.includes('i want to buy') ||
    lowerMsg.includes('add to cart') ||
    lowerMsg.includes('checkout') ||
    lowerMsg.includes('ऑर्डर') ||
    lowerMsg.includes('खरीद') ||
    lowerMsg.includes('ઓર્ડર');

  if (isOrderIntent) {
    // Check if it's a general checkout request
    if (lowerMsg.includes('checkout') && !lowerMsg.match(/\bp(?:0[1-9]|[1-3][0-9]|40)\b/)) {
      if (isHindi) {
        return {
          reply: `आपका चेकआउट तैयार है! आप सुरक्षित पेमेंट पेज पर जाकर UPI, क्रेडिट/डेबिट कार्ड या COD के माध्यम से अपना ऑर्डर पूरा कर सकते हैं।`,
          action: { type: 'checkout', title: 'सुरक्षित चेकआउट पर जाएं', reason: 'ऑर्डर फाइनल करें' },
          model: 'heuristic-website-trainer'
        };
      }
      return {
        reply: `Your checkout is ready! You can proceed to the secure checkout page to verify your items, select your delivery address, and pay via UPI, Credit/Debit Card, Netbanking, or Cash on Delivery.`,
        action: {
          type: 'checkout',
          title: 'Proceed to Secure Checkout',
          reason: 'Review active items and complete payment'
        },
        model: 'heuristic-website-trainer'
      };
    }

    // Extract product IDs (P01 to P60)
    const idMatches = lowerMsg.match(/\bp(?:0[1-9]|[1-5][0-9]|60)\b/gi);
    const matchedProducts: { product: typeof CATALOGUE_PRODUCTS_METADATA[0]; quantity: number }[] = [];

    if (idMatches && idMatches.length > 0) {
      for (const rawId of idMatches) {
        const uppercaseId = rawId.toUpperCase();
        const prod = CATALOGUE_PRODUCTS_METADATA.find(p => p.id === uppercaseId);
        if (prod) {
          // Check for nearby quantity numbers like "2 P26" or "P26 x2"
          const regexBefore = new RegExp(`(\\d+)\\s*(?:x\\s*|of\\s*)?${rawId}`, 'i');
          const regexAfter = new RegExp(`${rawId}\\s*(?:x\\s*)?(\\d+)`, 'i');
          const matchBefore = lowerMsg.match(regexBefore);
          const matchAfter = lowerMsg.match(regexAfter);
          const qty = matchBefore ? parseInt(matchBefore[1], 10) : matchAfter ? parseInt(matchAfter[1], 10) : 1;
          matchedProducts.push({ product: prod, quantity: qty > 0 ? qty : 1 });
        }
      }
    } else {
      // Natural language product matching
      const keywordsToMatch = [
        { key: 'vertical mouse', id: 'P26' },
        { key: 'ergonomic mouse', id: 'P07' },
        { key: 'silent mouse', id: 'P29' },
        { key: 'travel mouse', id: 'P22' },
        { key: '3d mouse', id: 'P54' },
        { key: 'cad mouse', id: 'P54' },
        { key: 'mouse', id: 'P07' },
        { key: 'rgb keyboard', id: 'P27' },
        { key: 'mechanical keyboard', id: 'P27' },
        { key: '60% keyboard', id: 'P28' },
        { key: 'compact keyboard', id: 'P08' },
        { key: 'full-size keyboard', id: 'P21' },
        { key: 'numeric keypad', id: 'P47' },
        { key: 'keypad', id: 'P47' },
        { key: 'keyboard', id: 'P08' },
        { key: 'drawing tablet', id: 'P44' },
        { key: 'graphics tablet', id: 'P44' },
        { key: 'tablet stand', id: 'P46' },
        { key: 'tablet', id: 'P44' },
        { key: 'stylus', id: 'P45' },
        { key: 'digital pen', id: 'P45' },
        { key: 'ultrawide monitor', id: 'P42' },
        { key: 'curved monitor', id: 'P42' },
        { key: 'color-accurate monitor', id: 'P41' },
        { key: 'portable monitor', id: 'P43' },
        { key: '4k monitor', id: 'P41' },
        { key: 'monitor', id: 'P41' },
        { key: 'docking station', id: 'P48' },
        { key: 'thunderbolt dock', id: 'P48' },
        { key: 'card reader', id: 'P49' },
        { key: 'portable ssd', id: 'P50' },
        { key: 'external storage', id: 'P50' },
        { key: 'external ssd', id: 'P50' },
        { key: 'color calibrator', id: 'P51' },
        { key: 'display calibrator', id: 'P51' },
        { key: 'conference headset', id: 'P52' },
        { key: 'acoustic shield', id: 'P53' },
        { key: 'cooling stand', id: 'P55' },
        { key: 'cooling pad', id: 'P55' },
        { key: 'phone stand', id: 'P56' },
        { key: 'ring light', id: 'P57' },
        { key: 'document camera', id: 'P58' },
        { key: 'document organiser', id: 'P59' },
        { key: 'document organizer', id: 'P59' },
        { key: 'filing tray', id: 'P59' },
        { key: 'label printer', id: 'P60' },
        { key: 'barcode scanner', id: 'P60' },
        { key: 'thermal printer', id: 'P60' },
        { key: 'gan charger', id: 'P34' },
        { key: 'fast charger', id: 'P34' },
        { key: 'charger', id: 'P34' },
        { key: 'headphones', id: 'P35' },
        { key: 'headset', id: 'P52' },
        { key: 'microphone', id: 'P36' },
        { key: 'mic', id: 'P36' },
        { key: 'webcam', id: 'P37' },
        { key: 'camera', id: 'P37' },
        { key: 'screenbar', id: 'P38' },
        { key: 'desk light', id: 'P38' },
        { key: 'laptop stand', id: 'P30' },
        { key: 'riser stand', id: 'P30' },
        { key: 'monitor arm', id: 'P31' },
        { key: 'desk mat', id: 'P32' },
        { key: 'leather blotter', id: 'P32' },
        { key: 'cable organizer', id: 'P33' },
        { key: 'organizer', id: 'P33' },
        { key: 'travel mug', id: 'P39' },
        { key: 'ceramic mug', id: 'P11' },
        { key: 'mug', id: 'P39' },
        { key: 'vacuum flask', id: 'P40' },
        { key: 'water bottle', id: 'P10' },
        { key: 'bottle', id: 'P40' },
        { key: 'backpack', id: 'P14' },
        { key: 'notebook', id: 'P13' },
        { key: 'hub', id: 'P09' },
        { key: 'blue tshirt', id: 'P04' },
        { key: 'black tshirt', id: 'P02' },
        { key: 'grey tshirt', id: 'P03' },
        { key: 'white tshirt', id: 'P06' },
        { key: 'tshirt', id: 'P02' },
        { key: 't-shirt', id: 'P02' }
      ];

      keywordsToMatch.sort((a, b) => b.key.length - a.key.length);
      let remainingText = lowerMsg;

      for (const kw of keywordsToMatch) {
        if (remainingText.includes(kw.key)) {
          const prod = CATALOGUE_PRODUCTS_METADATA.find(p => p.id === kw.id);
          if (prod && !matchedProducts.some(m => m.product.id === prod.id)) {
            // Check for quantity specifically associated with this item, e.g. "2 tshirts" or "1x keyboard"
            const kwEscaped = kw.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const kwRegex = new RegExp(`(\\d+)\\s*(?:x\\s*)?(?:piece|pieces|unit|units)?\\s*(?:of\\s*)?${kwEscaped}`, 'i');
            const kwMatch = remainingText.match(kwRegex);
            const qty = kwMatch ? Math.max(1, parseInt(kwMatch[1], 10)) : 1;
            matchedProducts.push({ product: prod, quantity: qty });
            // Erase the matched keyword from remainingText so generic sub-keywords don't re-match
            remainingText = remainingText.replace(kw.key, ' ');
          }
        }
      }
    }

    if (matchedProducts.length > 0) {
      // Calculate Landed Cost
      const subtotal = matchedProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const isFreeShipping = subtotal >= 50000;
      const netShipping = isFreeShipping ? 0 : 499;
      const taxAmount = Math.round((subtotal + netShipping) * 0.18 * 100) / 100;
      const totalLandedPrice = Math.round((subtotal + netShipping + taxAmount) * 100) / 100;

      const itemsDescription = matchedProducts.map(
        it => `- **${it.product.name}** (\`${it.product.id}\`): ${it.quantity}x @ ₹${it.product.price.toLocaleString('en-IN')} = ₹${(it.product.price * it.quantity).toLocaleString('en-IN')}`
      ).join('\n');

      const actionItems = matchedProducts.map(it => ({
        id: it.product.id,
        name: it.product.name,
        price: it.product.price,
        quantity: it.quantity
      }));

      // Check if any product is out of stock
      const outOfStockItem = matchedProducts.find(it => it.product.stock === 0);
      if (outOfStockItem) {
        return {
          reply: `⚠️ **Product Out of Stock**: Product **${outOfStockItem.product.name}** (\`${outOfStockItem.product.id}\`) is currently out of stock.\n\n` +
            `Would you like me to recommend an in-stock alternative? For example, **Blue Tshirt Size L (P04)** or **Black Tshirt (P02)** are available right now.`,
          action: {
            type: 'navigate',
            tab: 'catalogue',
            reason: 'View available in-stock items in Product Catalogue'
          },
          model: 'heuristic-website-trainer'
        };
      }

      if (isHindi) {
        return {
          reply: `### 🛒 ऑर्डर तैयार है!\n\n` +
            `मैंने आपके द्वारा अनुरोधित उत्पाद तैयार कर लिए हैं:\n\n` +
            `${itemsDescription}\n\n` +
            `**प्राइस ब्रेकडाउन (Landed Cost)**:\n` +
            `- प्रोडक्ट सबटोटल: ₹${subtotal.toLocaleString('en-IN')}\n` +
            `- शिपिंग शुल्क: ${netShipping === 0 ? '₹0 (मुफ्त शिपिंग)' : `₹${netShipping}`}\n` +
            `- 18% GST टैक्स: ₹${taxAmount.toLocaleString('en-IN')}\n` +
            `- **कुल देय राशि (Landed Total)**: ₹${totalLandedPrice.toLocaleString('en-IN')}\n\n` +
            `डिलीवरी पता: **तन्मय आनंद (Tanmay Anand)**, बैंगलोर / मुंबई।\n` +
            `नीचे दिए गए बटन पर क्लिक करके ऑर्डर तुरंत प्लेस करें या कार्ट में जोड़ें!`,
          action: {
            type: 'order_items',
            title: `Order: ${matchedProducts.map(it => `${it.quantity}x ${it.product.name}`).join(', ')}`,
            items: actionItems,
            subtotal,
            netShipping,
            taxAmount,
            total: totalLandedPrice,
            reason: '1-Click Direct Order via Sahay AI'
          },
          model: 'heuristic-website-trainer'
        };
      }

      return {
        reply: `### 🛒 Order Prepared Successfully!\n\n` +
          `I have configured your requested items for instant ordering:\n\n` +
          `${itemsDescription}\n\n` +
          `**Landed Cost Breakdown**:\n` +
          `- **Product Subtotal**: ₹${subtotal.toLocaleString('en-IN')}\n` +
          `- **Net Logistics/Shipping**: ${netShipping === 0 ? '₹0 (Free Shipping waiver applied!)' : `₹${netShipping} standard base fee`}\n` +
          `- **GST (18%)**: ₹${taxAmount.toLocaleString('en-IN')}\n` +
          `- **Total Landed Price**: ₹${totalLandedPrice.toLocaleString('en-IN')}\n\n` +
          `📍 **Delivery Destination**: Tanmay Anand (Customer Profile defaults).\n\n` +
          `You can confirm and place this order right now with 1 click using the interactive action card below!`,
        action: {
          type: 'order_items',
          title: `Order: ${matchedProducts.map(it => `${it.quantity}x ${it.product.name}`).join(', ')}`,
          items: actionItems,
          subtotal,
          netShipping,
          taxAmount,
          total: totalLandedPrice,
          reason: '1-Click Direct Order via Sahay AI'
        },
        model: 'heuristic-website-trainer'
      };
    }
  }

  // =========================================================================
  // 2. Navigation / Whole Website Overview
  // =========================================================================
  if (lowerMsg.includes('whole website') || lowerMsg.includes('all pages') || lowerMsg.includes('overview') || lowerMsg.includes('sitemap') || lowerMsg.includes('what can you do') || lowerMsg.includes('features')) {
    if (isHindi) {
      return {
        reply: `यह वेबसाइट **बजट-आधारित प्रोडक्ट बंडल बिल्डर (C07)** है। यहाँ कुल 10 मुख्य अनुभाग हैं:\n\n` +
          `1. **प्रोडक्ट कैटलॉग (Catalogue)**: 40 उत्पाद (P01-P40), 15 श्रेणियां और 6-कॉलम API फ़िल्टर।\n` +
          `2. **बंडल तुलना बिल्डर (Compare Builder)**: 2-स्लॉट एक्टिव बंडल, हेडरुम काउंटर और लैंडेड कॉस्ट।\n` +
          `3. **बंडल कार्ट ड्रॉवर (Cart)**: स्लाइड-ओवर कार्ट और 'BUY NOW' त्वरित ऑर्डर।\n` +
          `4. **सुरक्षित चेकआउट (Checkout)**: डिलीवरी एड्रेस, UPI/Card/COD पेमेंट और इनवॉइस डाउनलोड।\n` +
          `5. **कस्टमर प्रोफाइल (Profile)**: तन्मय आनंद (TA), शिपिंग सेटिंग्स और डिफॉल्ट बजट।\n` +
          `6. **AI चैटबॉट (Chat)**: चैट के जरिए किसी भी उत्पाद का सीधा ऑर्डर दें और सहायता लें।\n` +
          `7. **डैशबोर्ड (Dashboard)**: लाइव KPI और बजट प्रोग्रेस।\n` +
          `8. **बिजनेस इनसाइट्स (Business)**: MBA यूनिट इकोनॉमिक्स और ब्रेक-ईवन एनालिसिस।\n` +
          `9. **ऑटोमेटेड टेस्ट सुइट (Tests)**: 22+ लाइव सत्यापन टेस्ट।\n` +
          `10. **प्रोजेक्ट एविडेंस (Evidence)**: सत्यापन मैट्रिक्स।\n\nआप क्या ऑर्डर करना या देखना चाहते हैं?`,
        action: {
          type: 'navigate',
          tab: 'catalogue',
          reason: 'Browse 40 items in Product Catalogue'
        },
        model: 'heuristic-website-trainer'
      };
    }

    return {
      reply: `I am fully trained on the entire **Budget-Based Product Bundle Builder** platform! Here is an overview of all integrated modules:\n\n` +
        `1. **Product Catalogue (\`catalogue\`)**: Directory of **40 curated products** (\`P01\` to \`P40\`) across 15 categories (Tshirt, Mug, Mouse, Keyboard, Hub, Bottle, Stand, DeskMat, Charger, Audio, Webcam, Lighting) with 6-column backend API filters.\n` +
        `2. **Compare Builder (\`compare\`)**: 2-slot active bundle workspace (Mouse, Keyboard, etc.) with dynamic target budget, live headroom gauge, and landed cost breakdown.\n` +
        `3. **Bundle Cart Drawer (\`cart\`)**: Slide-over drawer with line items, budget utilization gauge, and direct **BUY NOW** checkout.\n` +
        `4. **Secure Checkout & Order Placement (\`checkout\`)**: Complete checkout page with delivery address prefill (Tanmay Anand), payment options (UPI, Card, Netbanking, COD), order placement (#C07-ORD-XXXXXX), and invoice export.\n` +
        `5. **Customer Profile (\`profile\`)**: Identity card with avatar (TA), default shipping addresses, and budget preferences.\n` +
        `6. **Gemini AI Assistant (\`chat\`)**: Conversational shopping consultant with **Direct Ordering Powers**—ask me to order ANY product in the catalogue!\n` +
        `7. **Executive Dashboard (\`dashboard\`)**: Real-time KPI telemetry and shortcuts.\n` +
        `8. **Business Insights & Strategy (\`business\`)**: MBA unit economics simulator (Retailer ₹15,000 fee, ₹3,500 cost to serve, 3.5% referral fee, break-even ~40 baskets).\n` +
        `9. **Automated Test Suite (\`tests\`)**: 22+ live browser tests (REF-001 to REF-006, EDGE-001 to EDGE-006) validating compatibility logic and pricing math.\n` +
        `10. **Project Evidence & Scope Audit (\`evidence\`)**: Academic audit tracking baseline prototype v0.1 vs final implementation.\n` +
        `11. **Settings & Configuration (\`settings\`)**: 18% GST tax configuration, shipping surcharge rules (₹499 base, ₹50,000 free shipping threshold), and factory reset.\n\n` +
        `What would you like to explore or order?`,
      action: {
        type: 'navigate',
        tab: 'catalogue',
        reason: 'Browse complete Product Catalogue'
      },
      model: 'heuristic-website-trainer'
    };
  }

  // =========================================================================
  // 3. Direct Navigation Intents
  // =========================================================================
  if (lowerMsg.includes('go to') || lowerMsg.includes('navigate to') || lowerMsg.includes('open page') || lowerMsg.includes('show page') || lowerMsg.includes('show me')) {
    if (lowerMsg.includes('catalogue') || lowerMsg.includes('catalog') || lowerMsg.includes('products') || lowerMsg.includes('inventory')) {
      return {
        reply: `Opening the **Product Catalogue**. Browse all 40 products across 15 categories with technical blueprints, dimensions, wattage, and live stock levels.`,
        action: { type: 'navigate', tab: 'catalogue', reason: 'Browse complete Product Catalogue' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('cart') || lowerMsg.includes('drawer')) {
      return {
        reply: `Opening your **Bundle Cart Drawer**. Review your items, budget headroom, and click BUY NOW to place an order.`,
        action: { type: 'navigate', tab: 'cart', reason: 'Open Bundle Cart' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('checkout') || lowerMsg.includes('order')) {
      return {
        reply: `Opening the **Checkout** page. Review your order details, shipping address, and select payment methods.`,
        action: { type: 'navigate', tab: 'checkout', reason: 'Open Checkout Page' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('profile') || lowerMsg.includes('address') || lowerMsg.includes('user')) {
      return {
        reply: `Opening your **Customer Profile** (Tanmay Anand, Bangalore / Mumbai). You can manage default shipping addresses and shopping preferences here.`,
        action: { type: 'navigate', tab: 'profile', reason: 'View Customer Profile' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('compare') || lowerMsg.includes('builder')) {
      return {
        reply: `Opening the **Compare Builder**. Assemble and compare your hardware bundle with live landed pricing and budget headroom.`,
        action: { type: 'navigate', tab: 'compare', reason: 'Open Compare Builder' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('business') || lowerMsg.includes('economics') || lowerMsg.includes('mba')) {
      return {
        reply: `Opening the **Business Insights & Strategy** page. Explore our MBA unit economics model, retailer fees, and break-even simulator.`,
        action: { type: 'navigate', tab: 'business', reason: 'View Business Insights' },
        model: 'heuristic-website-trainer'
      };
    }
    if (lowerMsg.includes('test') || lowerMsg.includes('suite')) {
      return {
        reply: `Opening the **Automated Test Suite**. Run 22+ live verification tests with execution latency tracking.`,
        action: { type: 'navigate', tab: 'tests', reason: 'Open Test Results' },
        model: 'heuristic-website-trainer'
      };
    }
  }

  // =========================================================================
  // 4. Default Assistant Response with Quick Order Suggestions
  // =========================================================================
  return {
    reply: `Hello! I am **Sahay AI (सहाय AI)**, your shopping consultant fully trained on the **Budget-Based Product Bundle Builder** platform!\n\n` +
      `Here is what you can ask me to do:\n\n` +
      `1. **Order Any Product Directly**: Tell me what you'd like to buy (e.g. *"Order P26 Ergonomic Vertical Mouse"* or *"Buy RGB Mechanical Keyboard and 100W GaN Charger"*), and I'll compute the landed cost and generate an instant 1-click order card!\n` +
      `2. **Browse & Compare**: Explore all 40 products (\`P01\` to \`P40\`) across 15 categories.\n` +
      `3. **Manage Bundle Cart & Checkout**: Add items, inspect budget headroom, or say *"Checkout my cart"* to complete purchase.\n\n` +
      `What would you like to order or explore today?`,
    action: {
      type: 'navigate',
      tab: 'catalogue',
      reason: 'Explore 40-item Product Catalogue'
    },
    model: 'heuristic-website-trainer'
  };
}
