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
    summary: 'Displays all 82 products (P01 to P82) across 28 categories covering Enterprise Laptops, Ultrabooks, Home Appliances, smart kitchen essentials, coffee makers, vacuum cleaners, and developer rigs.',
    features: [
      '82 Curated Products across 28 categories: Home Appliance, Laptop, Monitor, Tablet, Stylus, Stand, Keypad, Dock, CardReader, Storage, Colorimeter, Headset, Audio, 3DMouse, CoolingStand, PhoneStand, Lighting, DocCamera, Organizer, Printer, Mouse, Keyboard, Hub, Bottle, Mug, Notebook, Backpack, DeskMat.',
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
  { id: 'P60', name: 'Wireless Thermal Shipping Label Printer & Barcode Scanner Kit', category: 'Printer', price: 6200, colour: 'White', stock: 20, connector: 'usb-c', desc: '4x6 inch direct thermal label printer with handheld 2D scanner' },
  { id: 'P61', name: 'Enterprise Fleet 14" Business Ultrabook (i5/16GB/512GB)', category: 'Laptop', price: 54999, colour: 'Space Grey', stock: 45, connector: 'usb-c', desc: '14" FHD IPS, Intel Core i5, 16GB RAM, 512GB SSD, Thunderbolt 4' },
  { id: 'P62', name: 'Developer Pro 16" High-Performance Workstation Laptop (i7/32GB/1TB)', category: 'Laptop', price: 89999, colour: 'Matte Black', stock: 30, connector: 'usb-c', desc: '16" QHD 165Hz, Intel Core i7, 32GB RAM, 1TB NVMe, Thunderbolt' },
  { id: 'P63', name: 'Executive Carbon 13.3" Ultra-Slim Touchscreen Laptop (Ultra 7/16GB/512GB OLED)', category: 'Laptop', price: 104999, colour: 'Carbon Black', stock: 25, connector: 'usb-c', desc: '13.3" 2.8K OLED Touch, Intel Core Ultra 7, 16GB RAM, 512GB SSD' },
  { id: 'P64', name: 'Entry Corporate Staff 15.6" Office Productivity Laptop (i3/16GB/512GB)', category: 'Laptop', price: 42999, colour: 'Silver', stock: 50, connector: 'usb-c', desc: '15.6" FHD Anti-Glare, Intel Core i3, 16GB RAM, 512GB SSD, Numeric Keypad' },
  { id: 'P65', name: 'Creative Studio 16" RTX Workstation Laptop (i9/64GB/2TB/RTX 4070 4K)', category: 'Laptop', price: 149999, colour: 'Midnight Blue', stock: 18, connector: 'usb-c', desc: '16" 4K Mini-LED, Intel Core i9, 64GB RAM, 2TB SSD, NVIDIA RTX 4070 8GB' },
  { id: 'P66', name: 'Finance & Enterprise Secure 14" Rugged vPro Laptop (i7 vPro/32GB/1TB TPM 2.0)', category: 'Laptop', price: 78999, colour: 'Gunmetal Grey', stock: 35, connector: 'usb-c', desc: '14" FHD Anti-Glare, Intel Core i7 vPro, 32GB RAM, 1TB SSD, Hardware TPM 2.0' },
  { id: 'P67', name: 'Corporate Silent Multi-Device Wireless Mouse (Bluetooth + 2.4G)', category: 'Mouse', price: 1299, colour: 'Matte Black', stock: 60, connector: 'usb-c', desc: 'Multi-device pairing, silent acoustic switches, 4000 DPI' },
  { id: 'P68', name: 'Enterprise Low-Profile Quiet Office Keyboard with Numeric Keypad', category: 'Keyboard', price: 1799, colour: 'Space Grey', stock: 55, connector: 'usb-c', desc: 'Full-size scissor keys, whisper-quiet membrane, dedicated numpad' },
  { id: 'P69', name: 'Professional Ergonomic Split Wave Wireless Keyboard & Cushioned Palm Rest', category: 'Keyboard', price: 3499, colour: 'Graphite', stock: 40, connector: 'usb-c', desc: 'Curved split wave layout, memory foam wrist pad, dual wireless' },
  { id: 'P70', name: 'Vertical Ergonomic Precision Laser Mouse with Thumb Rest', category: 'Mouse', price: 2299, colour: 'Graphite', stock: 48, connector: 'usb-c', desc: 'Ergonomic 57° vertical contour, precision laser tracking, thumb scroll' },
  { id: 'P71', name: '100W GaN Triple-Port USB-C Corporate Fast Power Adapter', category: 'Charger', price: 2499, colour: 'White', stock: 50, connector: 'usb-c', desc: 'Compact GaN III 2x USB-C + 1x USB-A PD 3.0 ultra-safe power block' },
  { id: 'P72', name: 'Magnetic Anti-Glare & Privacy Screen Filter (14" & 15.6")', category: 'Stand', price: 1499, colour: 'Matte Privacy', stock: 70, desc: '60° micro-louver privacy angle with magnetic snap-on for laptops' },
  { id: 'P73', name: 'Executive Leatherette Corporate Laptop Briefcase & Tech Folio', category: 'Backpack', price: 2799, colour: 'Brown', stock: 35, desc: 'Padded 15.6" laptop compartment, waterproof vegan leather' },
  { id: 'P74', name: '2K QHD 60FPS Enterprise AI Auto-Framing Conference Webcam', category: 'Webcam', price: 3999, colour: 'Black', stock: 40, connector: 'usb-c', desc: '2K QHD, Sony Starvis sensor, AI auto-framing, dual noise-cancelling mics' },
  { id: 'P75', name: 'Dual-Arm Gas Spring Heavy-Duty Desk Monitor Stand (Dual up to 32")', category: 'Stand', price: 4500, colour: 'Matte Black', stock: 25, desc: 'Dual monitor desk clamp supporting up to 32" screens, 360° rotation' },
  { id: 'P76', name: 'Smart Electric Rapid-Boil Kettle (1.7L Stainless Steel)', category: 'Home Appliance', price: 2199, colour: 'Silver', stock: 40, desc: '1500W rapid boil, auto shut-off, food-grade 304 stainless steel' },
  { id: 'P77', name: '15-Bar Compact Espresso & Cappuccino Coffee Machine', category: 'Home Appliance', price: 6499, colour: 'Matte Black', stock: 25, desc: '15-bar high pressure pump, milk frother steam wand, compact footprint' },
  { id: 'P78', name: 'Smart HEPA Air Purifier with Real-Time Air Quality Display', category: 'Home Appliance', price: 7999, colour: 'White', stock: 30, desc: 'True HEPA H13 filtration, PM2.5 sensor, covers up to 350 sq ft' },
  { id: 'P79', name: 'High-Speed Nutrient Extractor Countertop Blender (1000W)', category: 'Home Appliance', price: 3499, colour: 'Stainless Grey', stock: 35, desc: '1000W copper motor, 6-leaf stainless blade, 2 travel cups included' },
  { id: 'P80', name: 'Smart Robotic Vacuum & Mop Cleaner with Auto-Docking', category: 'Home Appliance', price: 18999, colour: 'Piano Black', stock: 20, desc: 'LiDAR laser navigation, 3000Pa suction, app control & auto charging' },
  { id: 'P81', name: 'Digital 4-Slice Convection Pop-Up Toaster with Browning Control', category: 'Home Appliance', price: 2799, colour: 'Brushed Steel', stock: 45, desc: '4-slice extra-wide slots, 7 browning settings, defrost & reheat' },
  { id: 'P82', name: 'Cordless Handheld Cyclonic Stick Vacuum Cleaner (22.2V)', category: 'Home Appliance', price: 8499, colour: 'Cobalt Blue', stock: 28, desc: 'Brushless motor, 20kPa suction, 45min runtime, multi-surface brush' }
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

  return `${rolePersona ? rolePersona + '\n\n' : ''}${customInstruction ? customInstruction + '\n\n' : ''}You are Sahay AI (सहाय AI), the intelligent AI Assistant and Shopping Agent for the "Budget-Based Product Bundle Builder" web application.
You can directly recommend products, assemble bundles, calculate landed costs, and place 1-click orders.

==================================================
1. CURRENT USER & WORKSPACE STATE (FOR INTERNAL CONTEXT ONLY - DO NOT ECHO THIS BACK TO THE USER)
==================================================
- Active Page: "${currentPage.title}" (tab: "${currentPage.id}") - ${currentPage.summary}
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
3. FULL PRODUCT INVENTORY (PRODUCTS: P01 - P82)
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
   - Peripherals (P07, P08, P26, P27, P28, P29, P34, P35, P36, P37, P38, P67, P68, P69, P70, P71, P74) use USB-C connectivity.
   - Out-of-stock items (such as P01 Blue Tshirt Size M) cannot be ordered or bundled.

==================================================
5. DIRECT ORDERING & INTERACTIVE ACTION CARDS
==================================================
YOU CAN ORDER ANY PRODUCT DIRECTLY FOR THE USER!
Whenever a user wants to order, buy, purchase, show, find, or add to cart (e.g. "order P26", "computer product", "show me computer products", "buy a laptop", "PC", "desktop", "buy the RGB keyboard and 100W GaN charger", "order 2 blue tshirts", "checkout now"):
1. Identify the products by their IDs (P01-P82) or names.
   - Note on Computer & Laptop queries: If the user asks about a computer, computer products, laptop, PC, desktop, or workstation (e.g. "computer product", "show me computer products", "buy a laptop", "PC", "desktop"):
     * Explicitly showcase our enterprise laptops: [P64] Entry Corporate Staff 15.6" Laptop (₹42,999), [P61] Enterprise Fleet 14" Business Ultrabook (₹54,999), [P62] Developer Pro 16" Workstation Laptop (₹89,999), [P65] Creative Studio 16" RTX Workstation (₹1,49,999).
     * Also showcase complementary computer peripherals: [P41] 27" 4K UHD Monitor (₹28,500), [P43] 15.6" Portable FHD Monitor (₹12,999), [P67] Multi-Device Mouse (₹1,299), [P68] Quiet Office Keyboard (₹1,799), [P48] Thunderbolt 4 Dock (₹14,500), [P30] Aluminum Laptop Riser Stand (₹1,299).
     * ALWAYS format IDs in brackets like [P64], [P61], [P67] so interactive product cards render in the chat with direct "Add to Cart" and "Inspect" buttons!
     * Include an action block of type "add_to_cart" or "order_items" for the recommended computer products!
2. Determine the requested quantities.
3. Calculate subtotal, shipping (₹499 or free if subtotal >= ₹50,000), 18% GST tax, and landed total.
4. Output a clear, cheerful order confirmation breakdown in the response.
5. MANDATORY: ALWAYS INCLUDE AN ACTION CODE BLOCK AT THE VERY END in a \`\`\`action\`\`\` block so the interactive card with "Order Now" and "+ Cart" buttons renders in the UI!

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
6. RESPONSE STYLE & STRICT PROHIBITIONS
==================================================
- CRITICAL: NEVER recite system capabilities or echo user workspace state as an opening introduction!
  * FORBIDDEN: Do NOT say "I have complete knowledge of our entire catalog of 40 curated products...", "As an AI with knowledge of...", or similar introductory filler.
  * FORBIDDEN: Do NOT say "Right now, you are on the Compare Builder workspace with a target budget of...", or regurgitate the user's budget and headroom, unless they explicitly asked "What is my current budget status?".
- Jump straight into answering the user's question, suggestion, or order request directly and concisely.
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
    lowerMsg.includes('i want') ||
    lowerMsg.includes('need') ||
    lowerMsg.includes('add to cart') ||
    lowerMsg.includes('cart') ||
    lowerMsg.includes('checkout') ||
    lowerMsg.includes('lets buy') ||
    lowerMsg.includes("let's buy") ||
    lowerMsg.includes('lets get') ||
    lowerMsg.includes("let's get") ||
    lowerMsg.includes('show') ||
    lowerMsg.includes('find') ||
    lowerMsg.includes('looking for') ||
    lowerMsg.includes('price of') ||
    lowerMsg.includes('cost of') ||
    lowerMsg.includes('laptop') ||
    lowerMsg.includes('alptop') ||
    lowerMsg.includes('leptop') ||
    lowerMsg.includes('mouse') ||
    lowerMsg.includes('mose') ||
    lowerMsg.includes('keyboard') ||
    lowerMsg.includes('monitor') ||
    lowerMsg.includes('charger') ||
    lowerMsg.includes('headphones') ||
    lowerMsg.includes('headset') ||
    lowerMsg.includes('tablet') ||
    lowerMsg.includes('backpack') ||
    lowerMsg.includes('tshirt') ||
    lowerMsg.includes('mug') ||
    lowerMsg.includes('bottle') ||
    lowerMsg.includes('ऑर्डर') ||
    lowerMsg.includes('खरीद') ||
    lowerMsg.includes('ઓર્ડર');

  if (isOrderIntent) {
    // Check for Computer / Laptop query intent
    const isComputerQuery = /\b(computer|computers|laptop|laptops|pc|pcs|desktop|desktops|computing|workstation|ultrabook|notebook)\b/i.test(lowerMsg);

    // Extract product IDs (P01 to P99)
    const idMatches = lowerMsg.match(/\bp(?:0[1-9]|[1-9][0-9])\b/gi);

    if (isComputerQuery && (!idMatches || idMatches.length === 0)) {
      return {
        reply: `### 💻 Official Computer Systems & Workstation Hardware\n\n` +
          `Here are our premier enterprise laptops, high-performance PCs, and computing workstation peripherals available in our catalog:\n\n` +
          `#### 🖥️ Business & High-Performance Laptops\n` +
          `* **[P64] Entry Corporate Staff 15.6" Office Productivity Laptop** — ₹42,999 *(In Stock: 50)*: Intel Core i3, 16GB RAM, 512GB SSD, Anti-Glare FHD display with full numeric keypad.\n` +
          `* **[P61] Enterprise Fleet 14" Business Ultrabook** — ₹54,999 *(In Stock: 45)*: Intel Core i5, 16GB RAM, 512GB SSD, Thunderbolt 4, ultra-light 1.3kg magnesium chassis.\n` +
          `* **[P62] Developer Pro 16" Workstation Laptop** — ₹89,999 *(In Stock: 30)*: Intel Core i7, 32GB RAM, 1TB NVMe, QHD 165Hz display, dual Thunderbolt ports.\n` +
          `* **[P65] Creative Studio 16" RTX Workstation Laptop** — ₹1,49,999 *(In Stock: 18)*: Intel Core i9, 64GB RAM, 2TB SSD, NVIDIA RTX 4070 8GB, 4K Mini-LED display.\n\n` +
          `#### 🖱️ Computer Displays & Peripherals\n` +
          `* **[P41] 27" 4K UHD Designer Color-Accurate Monitor** — ₹28,500 *(In Stock: 15)*: Factory-calibrated IPS, 99% DCI-P3 with 65W USB-C Power Delivery.\n` +
          `* **[P43] 15.6" Portable USB-C FHD Second Screen Monitor** — ₹12,999 *(In Stock: 18)*: Ultra-slim 1080p IPS second monitor for dual-screen productivity.\n` +
          `* **[P67] Corporate Silent Multi-Device Wireless Mouse** — ₹1,299 *(In Stock: 60)*: Bluetooth 5.2 + 2.4G dual wireless, silent clicks, 4000 DPI sensor.\n` +
          `* **[P68] Enterprise Low-Profile Quiet Office Keyboard** — ₹1,799 *(In Stock: 55)*: Full-size low-profile scissor keys with dedicated numeric keypad.\n` +
          `* **[P48] Thunderbolt 4 / USB-C 12-in-1 Triple Display Docking Station** — ₹14,500 *(In Stock: 14)*: Dual HDMI + DP, 100W PD charging, Gigabit Ethernet, 4x USB ports.\n` +
          `* **[P30] Aluminum Laptop Riser Stand** — ₹1,299 *(In Stock: 20)*: CNC-machined anodized aluminum stand for optimal eye-level ergonomics.\n\n` +
          `👇 **Inspect, Check Specs, or Add to Cart directly below**: Click any item card to inspect or add it directly to your cart with one click!`,
        action: {
          type: 'add_to_cart',
          title: 'Add Recommended Computer Setup to Cart',
          items: [
            { id: 'P64', name: 'Entry Corporate Staff 15.6" Office Productivity Laptop', price: 42999, quantity: 1 },
            { id: 'P67', name: 'Corporate Silent Multi-Device Wireless Mouse', price: 1299, quantity: 1 }
          ],
          reason: 'Selected computer productivity hardware ready for cart'
        },
        model: 'heuristic-website-trainer'
      };
    }

    // Check if it's a general checkout request
    if (lowerMsg.includes('checkout') && !lowerMsg.match(/\bp(?:0[1-9]|[1-9][0-9])\b/)) {
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
        { key: 'laptop cooling pad', id: 'P55' },
        { key: 'laptop cooling', id: 'P55' },
        { key: 'cooling pad', id: 'P55' },
        { key: 'cooling stand', id: 'P55' },
        { key: 'laptop backpack', id: 'P19' },
        { key: 'laptop bag', id: 'P19' },
        { key: 'laptop stand', id: 'P30' },
        { key: 'laptop riser', id: 'P30' },
        { key: 'riser stand', id: 'P30' },
        { key: 'laptop arm', id: 'P31' },
        { key: 'portable screen', id: 'P43' },
        { key: 'second screen', id: 'P43' },
        { key: 'portable monitor', id: 'P43' },
        { key: 'laptop cooling pad', id: 'P55' },
        { key: 'laptop cooling', id: 'P55' },
        { key: 'cooling pad', id: 'P55' },
        { key: 'cooling stand', id: 'P55' },
        { key: 'laptop backpack', id: 'P19' },
        { key: 'laptop bag', id: 'P19' },
        { key: 'laptop stand', id: 'P30' },
        { key: 'laptop riser', id: 'P30' },
        { key: 'riser stand', id: 'P30' },
        { key: 'laptop arm', id: 'P31' },
        { key: 'portable screen', id: 'P43' },
        { key: 'second screen', id: 'P43' },
        { key: 'portable monitor', id: 'P43' },
        { key: 'business ultrabook', id: 'P61' },
        { key: 'workstation laptop', id: 'P62' },
        { key: 'developer laptop', id: 'P62' },
        { key: 'executive laptop', id: 'P63' },
        { key: 'office laptop', id: 'P64' },
        { key: 'corporate laptop', id: 'P64' },
        { key: 'creative laptop', id: 'P65' },
        { key: 'rtx laptop', id: 'P65' },
        { key: 'laptop', id: 'P61' },
        { key: 'alptop', id: 'P61' },
        { key: 'leptop', id: 'P61' },
        { key: 'laptops', id: 'P64' },
        { key: 'alptops', id: 'P64' },
        { key: 'macbook', id: 'P63' },
        { key: 'notebook pc', id: 'P61' },
        { key: 'computer', id: 'P61' },
        { key: 'computers', id: 'P64' },
        { key: 'pc', id: 'P61' },
        { key: 'desktop', id: 'P64' },
        { key: 'workstation', id: 'P62' },
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

      const isLaptopRelated =
        lowerMsg.includes('laptop') ||
        lowerMsg.includes('alptop') ||
        lowerMsg.includes('leptop') ||
        lowerMsg.includes('macbook') ||
        lowerMsg.includes('notebook');

      if (isHindi) {
        const header = isLaptopRelated
          ? `### 💻 लैपटॉप वर्कस्टेशन हार्डवेयर तैयार है!\n\n` +
            `यहाँ हमारा शीर्ष **[P30] एल्युमिनियम लैपटॉप स्टैंड** (₹1,299) और लैपटॉप एक्सेसरीज़ तैयार हैं:\n\n` +
            `${itemsDescription}\n\n` +
            `💡 **संबंधित लैपटॉप एक्सेसरीज़**:\n` +
            `* **[P55] डुअल फैन लैपटॉप कूलिंग पैड** — ₹1,650 (स्टॉक: 32)\n` +
            `* **[P43] 15.6" पोर्टेबल USB-C सेकंड स्क्रीन** — ₹12,999 (स्टॉक: 18)\n` +
            `* **[P19] एंटी-थेफ्ट लैपटॉप बैकपैक** — ₹1,650 (स्टॉक: 20)\n\n`
          : `### 🛒 ऑर्डर तैयार है!\n\nमैंने आपके द्वारा अनुरोधित उत्पाद तैयार कर लिए हैं:\n\n${itemsDescription}\n\n`;

        return {
          reply: header +
            `**प्राइस ब्रेकडाउन (Landed Cost)**:\n` +
            `- प्रोडक्ट सबटोटल: ₹${subtotal.toLocaleString('en-IN')}\n` +
            `- शिपिंग शुल्क: ${netShipping === 0 ? '₹0 (मुफ्त शिपिंग)' : `₹${netShipping}`}\n` +
            `- 18% GST टैक्स: ₹${taxAmount.toLocaleString('en-IN')}\n` +
            `- **कुल देय राशि (Landed Total)**: ₹${totalLandedPrice.toLocaleString('en-IN')}\n\n` +
            `डिलीवरी पता: **तन्मय आनंद (Tanmay Anand)**, बैंगलोर / मुंबई।\n` +
            `नीचे दिए गए एक्शन कार्ड पर **Order Now** या **+ Cart** दबाकर ऑर्डर तुरंत प्लेस करें या कार्ट में जोड़ें!`,
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

      const header = isLaptopRelated
        ? `### 💻 Laptop Workstation Gear Prepared!\n\n` +
          `Here is our premier **[P30] Aluminum Laptop Riser Stand** (₹1,299) along with top-rated modular laptop hardware ready for your workstation:\n\n` +
          `${itemsDescription}\n\n` +
          `💡 **Recommended Laptop Companions in our Catalogue**:\n` +
          `* **[P55] Aluminum Laptop Cooling Pad with Dual Silent Fans** — ₹1,650 (In Stock: 32)\n` +
          `* **[P43] 15.6" Portable USB-C FHD Second Screen Monitor** — ₹12,999 (In Stock: 18)\n` +
          `* **[P19] Professional Anti-Theft Laptop Backpack** — ₹1,650 (In Stock: 20)\n` +
          `* **[P34] USB-C 100W GaN Fast Charger** — ₹1,899 (In Stock: 22)\n\n`
        : `### 🛒 Order Prepared Successfully!\n\nI have configured your requested items for instant ordering:\n\n${itemsDescription}\n\n`;

      return {
        reply: header +
          `**Landed Cost Breakdown**:\n` +
          `- **Product Subtotal**: ₹${subtotal.toLocaleString('en-IN')}\n` +
          `- **Net Logistics/Shipping**: ${netShipping === 0 ? '₹0 (Free Shipping waiver applied!)' : `₹${netShipping} standard base fee`}\n` +
          `- **GST (18%)**: ₹${taxAmount.toLocaleString('en-IN')}\n` +
          `- **Total Landed Price**: ₹${totalLandedPrice.toLocaleString('en-IN')}\n\n` +
          `📍 **Delivery Destination**: Tanmay Anand (Customer Profile defaults).\n\n` +
          `You can confirm and place this order right now with 1 click using the interactive action card below, or click **+ Cart** to add it to your bundle!`,
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
    } else {
      // User wanted to order/buy, but did not specify an exact product ID or recognized keyword
      const defaultProd = CATALOGUE_PRODUCTS_METADATA.find(p => p.id === 'P30') || CATALOGUE_PRODUCTS_METADATA[0];
      const subtotal = defaultProd.price;
      const netShipping = 499;
      const taxAmount = Math.round((subtotal + netShipping) * 0.18 * 100) / 100;
      const totalLandedPrice = Math.round((subtotal + netShipping + taxAmount) * 100) / 100;

      return {
        reply: `### 🛒 Order & Workspace Setup Assistant\n\n` +
          `I would love to help you assemble your order! Here is our top-selling workspace hardware: **[${defaultProd.id}] ${defaultProd.name}** (₹${defaultProd.price.toLocaleString('en-IN')}).\n\n` +
          `**Landed Cost Breakdown**:\n` +
          `- **Product Subtotal**: ₹${subtotal.toLocaleString('en-IN')}\n` +
          `- **Logistics/Shipping**: ₹${netShipping}\n` +
          `- **GST (18%)**: ₹${taxAmount.toLocaleString('en-IN')}\n` +
          `- **Total Landed Price**: ₹${totalLandedPrice.toLocaleString('en-IN')}\n\n` +
          `You can click **Order Now** or **+ Cart** below, or tell me which specific hardware you'd like (e.g. *"laptop stand"*, *"ergonomic mouse"*, *"mechanical keyboard"*, *"4k monitor"*).`,
        action: {
          type: 'order_items',
          title: `Order: ${defaultProd.name} (${defaultProd.id})`,
          items: [{ id: defaultProd.id, name: defaultProd.name, price: defaultProd.price, quantity: 1 }],
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
  // 3.5. Setup Recommendation & Bundle Assembly Intents
  // =========================================================================
  const isRecommendationIntent =
    lowerMsg.includes('recommend') ||
    lowerMsg.includes('setup') ||
    lowerMsg.includes('bundle') ||
    lowerMsg.includes('build') ||
    lowerMsg.includes('suggest') ||
    lowerMsg.includes('assemble') ||
    lowerMsg.includes('workstation');

  if (isRecommendationIntent) {
    const budgetMatch = lowerMsg.match(/(?:under|below|budget|for|of)?\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})\s*(?:k)?/i);
    let targetAmt = currentBudget || 75000;
    if (budgetMatch) {
      const parsedNum = parseInt(budgetMatch[1], 10);
      targetAmt = lowerMsg.includes('k') && parsedNum < 1000 ? parsedNum * 1000 : parsedNum;
    }

    if (targetAmt <= 15000) {
      const subtotal = 1450 + 1850 + 1899 + 399;
      const shipping = 499;
      const tax = Math.round((subtotal + shipping) * 0.18);
      const landed = subtotal + shipping + tax;
      return {
        reply: `Here is an essential workspace setup tailored under **₹${targetAmt.toLocaleString('en-IN')}**:\n\n` +
          `1. **[P26] Ergonomic Wireless Vertical Mouse** — ₹1,450 (In Stock: 18)\n` +
          `2. **[P28] Compact 60% Wireless Keyboard** — ₹1,850 (In Stock: 15)\n` +
          `3. **[P34] USB-C 100W GaN Fast Charger** — ₹1,899 (In Stock: 30)\n` +
          `4. **[P33] Magnetic Cable Management Organizer** — ₹399 (In Stock: 40)\n\n` +
          `* **Product Subtotal:** ₹${subtotal.toLocaleString('en-IN')}\n` +
          `* **Standard Shipping:** ₹${shipping}\n` +
          `* **18% GST Tax:** ₹${tax.toLocaleString('en-IN')}\n` +
          `* **Landed Total:** **₹${landed.toLocaleString('en-IN')}** (Within ₹${targetAmt.toLocaleString('en-IN')} target!)\n\n` +
          `Click below to apply this setup directly to your builder or ask me to order any item!`,
        action: {
          type: 'apply_bundle',
          title: `Budget Setup Under ₹${targetAmt.toLocaleString('en-IN')}`,
          budget: targetAmt,
          items: { Mouse: 'P26', Keyboard: 'P28', Charger: 'P34', Organizer: 'P33' }
        },
        model: 'heuristic-website-trainer'
      };
    } else {
      const monitor = targetAmt < 60000 ? { id: 'P41', name: '27" 4K Professional Monitor', price: 28500 } : { id: 'P42', name: '34" Curved WQHD Ultrawide Monitor', price: 36000 };
      const subtotal = monitor.price + 1450 + 2499 + 1899 + 399;
      const shipping = subtotal >= 50000 ? 0 : 499;
      const tax = Math.round((subtotal + shipping) * 0.18);
      const landed = subtotal + shipping + tax;

      return {
        reply: `Here is a high-performance WFH workstation setup curated for your target budget of **₹${targetAmt.toLocaleString('en-IN')}**:\n\n` +
          `1. **[${monitor.id}] ${monitor.name}** — ₹${monitor.price.toLocaleString('en-IN')} (In Stock: 10)\n` +
          `2. **[P26] Ergonomic Wireless Vertical Mouse** — ₹1,450 (In Stock: 18)\n` +
          `3. **[P27] RGB Mechanical Gaming Keyboard** — ₹2,499 (In Stock: 12)\n` +
          `4. **[P34] USB-C 100W GaN Fast Charger** — ₹1,899 (In Stock: 30)\n` +
          `5. **[P33] Magnetic Cable Management Organizer** — ₹399 (In Stock: 40)\n\n` +
          `* **Product Subtotal:** ₹${subtotal.toLocaleString('en-IN')}\n` +
          `* **Shipping Fee:** ${shipping === 0 ? '**FREE** (Order meets ₹50,000 threshold)' : `₹${shipping}`}\n` +
          `* **18% GST Tax:** ₹${tax.toLocaleString('en-IN')}\n` +
          `* **Total Landed Cost:** **₹${landed.toLocaleString('en-IN')}**\n\n` +
          `Click below to apply this setup to your Workspace Builder!`,
        action: {
          type: 'apply_bundle',
          title: `WFH Setup (${monitor.name})`,
          budget: targetAmt,
          items: { Monitor: monitor.id, Mouse: 'P26', Keyboard: 'P27', Charger: 'P34', Organizer: 'P33' }
        },
        model: 'heuristic-website-trainer'
      };
    }
  }

  // =========================================================================
  // 3.6. Category Search & Inquiries (supports singulars, plurals, synonyms)
  // =========================================================================
  const categoryKeywords: Array<{ label: string; triggers: string[]; ids: string[] }> = [
    { label: 'Laptop Gear & Accessories', triggers: ['laptop', 'alptop', 'leptop', 'laptops', 'alptops', 'macbook'], ids: ['P30', 'P55', 'P43', 'P19', 'P48'] },
    { label: 'Mouse / Ergonomic Mice', triggers: ['mouse', 'mice', 'mose'], ids: ['P26', 'P29', 'P07', 'P22', 'P54'] },
    { label: 'Keyboards', triggers: ['keyboard', 'keyboards', 'keys'], ids: ['P27', 'P28', 'P08', 'P21', 'P47'] },
    { label: 'Monitors / Displays', triggers: ['monitor', 'monitors', 'display', 'displays', 'screen', 'screens'], ids: ['P41', 'P42', 'P43'] },
    { label: 'Chargers / Power', triggers: ['charger', 'chargers', 'charging', 'gan', 'power'], ids: ['P34', 'P35', 'P10'] },
    { label: 'Hubs / Docks', triggers: ['hub', 'hubs', 'dock', 'docks', 'multiport'], ids: ['P09', 'P48', 'P49'] },
    { label: 'Drawing Tablets & Stylus', triggers: ['tablet', 'tablets', 'stylus'], ids: ['P44', 'P45', 'P46'] },
    { label: 'Audio / Microphones / Headsets', triggers: ['audio', 'microphone', 'mic', 'headset', 'headphone', 'headphones'], ids: ['P36', 'P52', 'P53'] },
    { label: 'Webcams / Cameras', triggers: ['webcam', 'webcams', 'camera', 'cameras'], ids: ['P37', 'P38'] },
    { label: 'Backpacks & Sleeves', triggers: ['backpack', 'backpacks', 'bag', 'bags', 'sleeve'], ids: ['P14', 'P15', 'P16'] },
    { label: 'Mugs & Drinkware', triggers: ['mug', 'mugs', 'tumbler', 'bottle', 'bottles'], ids: ['P04', 'P05', 'P06', 'P11', 'P12'] },
    { label: 'Apparel / T-Shirts', triggers: ['tshirt', 't-shirt', 'shirt', 'apparel', 'hoodie'], ids: ['P01', 'P02', 'P03'] }
  ];

  for (const cat of categoryKeywords) {
    if (cat.triggers.some(t => lowerMsg.includes(t))) {
      const matched = cat.ids.map(id => CATALOGUE_PRODUCTS_METADATA.find(p => p.id === id)).filter(Boolean) as any[];
      const topProd = matched.find(p => p.stock > 0) || matched[0];
      const lines = matched.map((p: any) => `* **[${p.id}] ${p.name}** — ₹${p.price.toLocaleString('en-IN')} (${p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}) — ${p.desc}`);

      const subtotal = topProd ? topProd.price : 1299;
      const netShipping = subtotal >= 50000 ? 0 : 499;
      const taxAmount = Math.round((subtotal + netShipping) * 0.18 * 100) / 100;
      const totalLandedPrice = Math.round((subtotal + netShipping + taxAmount) * 100) / 100;

      return {
        reply: `Here are our top **${cat.label.toUpperCase()}** options in the catalogue:\n\n` +
          lines.join('\n') +
          `\n\nI have pre-configured **[${topProd.id}] ${topProd.name}** below so you can order directly with 1 click or click **+ Cart** to add it to your bundle!`,
        action: {
          type: 'order_items',
          title: `Order: ${topProd.name} (${topProd.id})`,
          items: [{ id: topProd.id, name: topProd.name, price: topProd.price, quantity: 1 }],
          subtotal,
          netShipping,
          taxAmount,
          total: totalLandedPrice,
          reason: `1-Click Direct Order for ${cat.label}`
        },
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
