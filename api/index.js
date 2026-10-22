// api-server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv2 from "dotenv";
import { GoogleGenAI } from "@google/genai";

// src/data/websiteKnowledge.ts
var WEBSITE_PAGES = {
  catalogue: {
    id: "catalogue",
    title: "Product Catalogue",
    pathDescription: "Comprehensive inventory & technical hardware directory",
    summary: "Displays all 82 products (P01 to P82) across 28 categories covering Enterprise Laptops, Ultrabooks, Home Appliances, smart kitchen essentials, coffee makers, vacuum cleaners, and developer rigs.",
    features: [
      "82 Curated Products across 28 categories: Home Appliance, Laptop, Monitor, Tablet, Stylus, Stand, Keypad, Dock, CardReader, Storage, Colorimeter, Headset, Audio, 3DMouse, CoolingStand, PhoneStand, Lighting, DocCamera, Organizer, Printer, Mouse, Keyboard, Hub, Bottle, Mug, Notebook, Backpack, DeskMat.",
      "6-Column Backend Filter Grid: Search query, Category filter, Colour filter, Size filter, In-Stock toggle, and Sort order.",
      "Live stock status tags (In Stock with exact unit count, or Currently Out of Stock).",
      "Direct Add to Cart button, Inspect Details view, and technical spec sheets.",
      "Instant pricing in INR (\u20B9) and landed unit costs."
    ],
    keyComponents: ["Backend Filter Bar", "Product Cards Grid", "Specification Badges", "Stock Indicators", "Add to Cart Buttons"],
    userActions: ["Search catalogue items", "Filter by category/colour/size/stock", "Inspect technical specs", "Add products to cart"]
  },
  compare: {
    id: "compare",
    title: "Compare Builder",
    pathDescription: "Interactive bundle configuration & comparison workspace",
    summary: "The primary workspace where shoppers assemble their bundle slots (Mouse, Keyboard, etc.), tune budget, and inspect live landed cost breakdowns.",
    features: [
      "Slot Grid with dynamic hardware assignment (MOUSE SLOT, KEYBOARD SLOT, etc.).",
      "Target Budget Stepper & Headroom progress gauge.",
      "Live Landed Price breakdown: Product Subtotal + Net Shipping (with free shipping logic) + 18% GST.",
      "Swap or remove products with instant recalculation.",
      "Direct navigation to bundle cart and checkout."
    ],
    keyComponents: ["Slot Cards", "Budget Controller", "Landed Cost Panel", "Headroom Gauge"],
    userActions: ["Assign products to slots", "Adjust budget", "Inspect landed pricing", "Remove or swap items"]
  },
  cart: {
    id: "cart",
    title: "Bundle Cart Drawer",
    pathDescription: "Slide-over cart drawer with live budget utilization",
    summary: "Slide-out cart drawer showing all selected bundle items, live budget headroom progress, quantity controls, and one-click BUY NOW button.",
    features: [
      "Slide-over animation with quick accessibility from header cart badge or sidebar.",
      "Live Budget Utilization Bar (Green for headroom, Rose for over budget, Exact Fit indicator).",
      "Itemized list with thumbnails, prices, and one-click removal.",
      "Quick-add suggestions divider for empty slots.",
      "BUY NOW button with total landed price and instant order confirmation."
    ],
    keyComponents: ["Drawer Header", "Budget Progress Bar", "Cart Item Cards", "Order Summary", "BUY NOW Button"],
    userActions: ["Review cart items", "Remove items", "Check remaining budget headroom", "Click BUY NOW to place order"]
  },
  checkout: {
    id: "checkout",
    title: "Secure Checkout & Order Placement",
    pathDescription: "Order finalization, shipping details & payment processing",
    summary: "Full checkout page allowing users to place orders, enter delivery details, select payment methods (UPI, Card, Netbanking, COD), inspect taxes & shipping, and download invoices.",
    features: [
      "Order Summary with line-by-line product details, unit prices, and quantities.",
      "Customer Details pre-filled from user profile (Tanmay Anand, Bangalore / Mumbai).",
      "4 Payment Gateways: UPI (GPay/PhonePe), Credit/Debit Card, Netbanking, and Cash on Delivery.",
      "Transparent Landed Cost calculation: Product Subtotal + Net Shipping (\u20B9499 / free over \u20B950,000) + 18% GST.",
      "Instant Order Confirmation with unique Order ID (#C07-ORD-XXXXXX) and PDF/CSV invoice download."
    ],
    keyComponents: ["Order Items List", "Customer Delivery Form", "Payment Method Selector", "Cost Breakdown Card", "Place Order Button"],
    userActions: ["Fill or confirm delivery address", "Select payment method", "Review final landed cost", "Place official order", "Download invoice"]
  },
  profile: {
    id: "profile",
    title: "Customer Profile",
    pathDescription: "Personal identity, shipping defaults & budget preferences",
    summary: "Displays customer avatar (TA), membership date (March 2024), default shipping address, and shopping preferences with quick demo account switching.",
    features: [
      "Customer identity card with avatar and role indicator.",
      "Shipping & Location settings (Name, Phone, Address, City, State, PIN).",
      "Shopping & Budget Defaults (Default target budget, preferred categories).",
      "Quick Switch Demo button to test customer and admin experiences."
    ],
    keyComponents: ["Profile Header Card", "Tab Navigation", "Shipping Address Editor", "Budget Defaults"],
    userActions: ["Edit contact information", "Update shipping address", "Change budget preferences", "Switch demo account"]
  },
  chat: {
    id: "chat",
    title: "Gemini AI Assistant & Shopping Bot",
    pathDescription: "Multi-turn conversational consultant with direct ordering capabilities",
    summary: "Conversational AI trained on the entire website capable of ordering ANY product (P01-P40), adding items to cart, adjusting budgets, and answering domain questions.",
    features: [
      'Order Anything via Chatbot: Say "Order P26" or "Buy a mechanical keyboard and mouse" to generate instant 1-click orders.',
      "3 Expert Personas: Ergonomic Workspace Architect, Rapid Compatibility Checker, Procurement & Unit Economics Strategist.",
      "1-Click Interactive Action Cards: Order Now, Add to Cart, Proceed to Checkout, Swap Product, Adjust Budget, Navigate to Any Page.",
      "Multi-model switcher: Gemini 3.8 Flash, Gemini 3.1 Flash-Lite, Gemini 4 Argon.",
      "Workspace Context Sync: Real-time awareness of cart items, target budget, and catalogue inventory."
    ],
    keyComponents: ["Message Thread", "Role Switcher", "Guidance Toolkit", "Action Cards", "Prompt Starters"],
    userActions: ["Order any product by chat", "Add items to cart", "Ask for setup advice", "Trigger 1-click action cards", "Export chat transcript"]
  },
  dashboard: {
    id: "dashboard",
    title: "Executive Dashboard",
    pathDescription: "Overview & telemetry command center",
    summary: "Displays real-time high-level KPIs, budget utilization progress gauge, compatibility status badges, and quick shortcuts.",
    features: [
      "Live KPI telemetry: Target Budget, Landed Price, Budget Utilization %, Compatibility Status, Filled Slots count.",
      "Circular progress meter for budget headroom.",
      "Quick action shortcuts to catalogue and compare builder."
    ],
    keyComponents: ["KPI Cards", "Budget Gauge", "Quick Action Buttons"],
    userActions: ["View current metrics", "Inspect budget headroom", "Navigate to Builder"]
  },
  business: {
    id: "business",
    title: "Business Insights & Strategy",
    pathDescription: "MBA unit economics simulation & strategic framework",
    summary: "Executive strategic analysis containing problem statements, deterministic landed bundles value proposition, retailer subscription fees, referral margins, and break-even basket threshold.",
    features: [
      "MBA Unit Economics: Retailer fee (\u20B915,000) - cost to serve (\u20B93,500) = \u20B911,500 net contribution.",
      "Referral Commission: 3.5% on eligible basket minus \u20B9120 variable cost.",
      "Break-even Basket Model: Fixed monthly costs (\u20B985,000) / contribution per basket = ~40 baskets/month.",
      "Empirical Shopper Research Log: Participant sessions tracking time, spend, and errors."
    ],
    keyComponents: ["Strategic Cards", "Unit Economics Simulator", "Shopper Research Log"],
    userActions: ["Simulate unit economics", "Inspect break-even model", "Review shopper research"]
  },
  tests: {
    id: "tests",
    title: "Automated Test Suite",
    pathDescription: "System verification & edge-case test runner",
    summary: "Live browser-executable test suite running 22+ tests covering compatibility rules, landed price arithmetic, and edge-case scenarios.",
    features: [
      "Reference Request Tests (REF-001 to REF-006): Starter Pack, Pro Setup, Infeasible Ultra-low, Free Shipping Boundary, Heavy Surcharge.",
      "Edge-Case Scenario Tests (EDGE-001 to EDGE-006): Cheapest Products Incompatible, Curved Monitor Clamp Trap, Dock Port Discrepancy, Out-of-Stock Item Trap.",
      "Live execution with real-time pass/fail badges and latency tracking."
    ],
    keyComponents: ["Test Runner", "Summary Badges", "Test Cards"],
    userActions: ["Run all tests", "Inspect assertions", "Verify landed price math"]
  },
  evidence: {
    id: "evidence",
    title: "Project Evidence & Scope Audit",
    pathDescription: "Academic engineering change documentation & audit log",
    summary: "Documents starting state (v0.1 prototype) vs requested changes, contractual scope boundaries, verified test procedures, and mathematical proofs.",
    features: [
      "Baseline Starting State vs Final Implementation Matrix (EVD-C07-001 to 008).",
      "Contractual scope boundaries and proofs.",
      "Interactive evidence audit records."
    ],
    keyComponents: ["Scope Matrix", "Audit Records Table"],
    userActions: ["Review milestones", "Inspect verification proofs"]
  },
  settings: {
    id: "settings",
    title: "Settings & Configuration",
    pathDescription: "Global parameters & data management",
    summary: "Controls core platform rules including 18% GST tax rate, shipping policies (\u20B9499 base, \u20B950,000 free shipping threshold), and factory data reset.",
    features: [
      "Tax Rule Settings: GST rate (default 18%).",
      "Shipping Policy Settings: Base fee (\u20B9499), Free shipping threshold (\u20B950,000), Heavy item surcharge (\u20B9450).",
      "Factory Reset: Clear storage and reload defaults."
    ],
    keyComponents: ["Tax Settings", "Shipping Policy", "Reset Data Button"],
    userActions: ["Modify tax or shipping rules", "Restore factory default fixture"]
  }
};
var CATALOGUE_PRODUCTS_METADATA = [
  { id: "P01", name: "Blue Tshirt", category: "Tshirt", price: 500, colour: "Blue", size: "M", stock: 0, desc: "Cotton Blue Crewneck Tshirt" },
  { id: "P02", name: "Black Tshirt", category: "Tshirt", price: 600, colour: "Black", size: "M", stock: 15, desc: "Classic Black Cotton Tshirt" },
  { id: "P03", name: "Grey Tshirt", category: "Tshirt", price: 550, colour: "Grey", size: "L", stock: 20, desc: "Athletic Heather Grey Tshirt" },
  { id: "P04", name: "Blue Tshirt", category: "Tshirt", price: 500, colour: "Blue", size: "L", stock: 7, desc: "Cotton Blue Crewneck Tshirt" },
  { id: "P05", name: "Black Tshirt", category: "Tshirt", price: 600, colour: "Black", size: "S", stock: 12, desc: "Classic Black Cotton Tshirt" },
  { id: "P06", name: "White Tshirt", category: "Tshirt", price: 450, colour: "White", size: "M", stock: 18, desc: "Crisp White Cotton Tshirt" },
  { id: "P07", name: "Ergonomic Wireless Mouse", category: "Mouse", price: 800, colour: "Black", stock: 25, connector: "usb-c", desc: "Precision 2.4GHz USB-C Wireless Mouse" },
  { id: "P08", name: "Compact Mechanical Keyboard", category: "Keyboard", price: 1500, colour: "Black", stock: 14, connector: "usb-c", desc: "Tenkeyless Mechanical Keyboard with Red Switches" },
  { id: "P09", name: "USB-C Multiport Hub", category: "Hub", price: 1200, colour: "Space Grey", stock: 30, connector: "usb-c", desc: "4K HDMI, 3x USB 3.0, 100W PD passthrough" },
  { id: "P10", name: "Stainless Steel Water Bottle", category: "Bottle", price: 400, colour: "Silver", stock: 40, desc: "750ml Vacuum Insulated Stainless Steel" },
  { id: "P11", name: "Ceramic Coffee Mug", category: "Mug", price: 250, colour: "White", stock: 50, desc: "350ml Matte White Ceramic Coffee Mug" },
  { id: "P12", name: "Travel Tumbler Mug", category: "Mug", price: 450, colour: "Black", stock: 35, desc: "Spill-Proof Insulated Travel Mug" },
  { id: "P13", name: "Pocket Ruled Notebook", category: "Notebook", price: 150, colour: "Tan", stock: 60, desc: "A5 Hardcover Acid-free Ruled Notebook" },
  { id: "P14", name: "Everyday Commuter Backpack", category: "Backpack", price: 1800, colour: "Charcoal", stock: 16, desc: "Water-resistant 20L Laptop Backpack" },
  { id: "P15", name: "Wireless Charging Desk Pad", category: "DeskMat", price: 950, colour: "Black", stock: 22, connector: "usb-c", desc: "Extended Leatherette Desk Mat with 15W Qi Charger" },
  { id: "P16", name: "Foldable Aluminum Laptop Stand", category: "Stand", price: 850, colour: "Silver", stock: 28, desc: "Multi-angle Adjustable Laptop Stand" },
  { id: "P17", name: "Noise-Isolating Earbuds", category: "Audio", price: 1100, colour: "Black", stock: 19, connector: "usb-c", desc: "In-ear USB-C Audio Earbuds with In-line Mic" },
  { id: "P18", name: "Braided USB-C to USB-C Cable (2m)", category: "Cable", price: 350, colour: "Grey", stock: 80, connector: "usb-c", desc: "100W Power Delivery 480Mbps Sync" },
  { id: "P19", name: "Ergonomic Memory Foam Wrist Rest", category: "Accessory", price: 400, colour: "Black", stock: 32, desc: "Cooling Gel Memory Foam Keyboard Wrist Rest" },
  { id: "P20", name: "Desk Cable Organizer Clips (5-Pack)", category: "Organizer", price: 200, colour: "Black", stock: 75, desc: "Self-adhesive Silicone Cable Holders" },
  { id: "P21", name: "Full-Size Wireless Keyboard", category: "Keyboard", price: 1350, colour: "White", stock: 15, connector: "usb-c", desc: "Slim Scissor-switch Wireless Keyboard with Numpad" },
  { id: "P22", name: "Silent Bluetooth Travel Mouse", category: "Mouse", price: 650, colour: "White", stock: 26, connector: "usb-c", desc: "Ultra-thin Quiet Click Bluetooth & 2.4G Mouse" },
  { id: "P23", name: "Heavy-Duty Canvas Tote Bag", category: "Backpack", price: 350, colour: "Natural", stock: 45, desc: "Eco-friendly 100% Cotton Canvas Carryall" },
  { id: "P24", name: "Insulated Sports Water Bottle", category: "Bottle", price: 500, colour: "Matte Blue", stock: 21, desc: "1L Chug Cap Stainless Gym Bottle" },
  { id: "P25", name: "Executive Pen & Journal Set", category: "Notebook", price: 650, colour: "Midnight Blue", stock: 18, desc: "Faux-leather Debossed Journal with Rollerball Pen" },
  { id: "P26", name: "Ergonomic Wireless Vertical Mouse", category: "Mouse", price: 1450, colour: "Graphite", stock: 18, connector: "usb-c", desc: "57\xB0 natural handshake angle, 4000 DPI" },
  { id: "P27", name: "RGB Mechanical Gaming Keyboard", category: "Keyboard", price: 2400, colour: "Black", stock: 12, connector: "usb-c", desc: "Hot-swappable linear red switches, per-key RGB" },
  { id: "P28", name: "Compact 60% Wireless Keyboard", category: "Keyboard", price: 1850, colour: "White/Grey", stock: 10, connector: "usb-c", desc: "Dual-mode Bluetooth 5.1 / 2.4G, PBT keycaps" },
  { id: "P29", name: "Silent Precision Bluetooth Mouse", category: "Mouse", price: 950, colour: "Space Grey", stock: 24, connector: "usb-c", desc: "90% sound reduction, dual-device fast switch" },
  { id: "P30", name: "Aluminum Laptop Riser Stand", category: "Stand", price: 1299, colour: "Silver", stock: 20, desc: "CNC anodized ergonomic desktop elevator" },
  { id: "P31", name: "Dual Monitor Arm Desk Mount", category: "Stand", price: 2800, colour: "Matte Black", stock: 8, desc: "Gas spring 360\xB0 rotation for 17-32 inch screens" },
  { id: "P32", name: "Desk Pad Vegan Leather Blotter", category: "DeskMat", price: 650, colour: "Saddle Brown", stock: 35, desc: "800x400mm waterproof non-slip surface" },
  { id: "P33", name: "Magnetic Cable Management Organizer", category: "Organizer", price: 399, colour: "Charcoal", stock: 45, desc: "Weighted desk base with 5 magnetic collars" },
  { id: "P34", name: "USB-C 100W GaN Fast Charger", category: "Charger", price: 1899, colour: "White", stock: 22, connector: "usb-c", desc: "3x USB-C + 1x USB-A PD 3.0 ultra-compact GaN" },
  { id: "P35", name: "Active Noise Cancelling Wireless Headphones", category: "Audio", price: 4999, colour: "Midnight Black", stock: 9, connector: "usb-c", desc: "40mm drivers, 35dB hybrid ANC, 40h battery" },
  { id: "P36", name: "USB-C Studio Condenser Microphone", category: "Audio", price: 3200, colour: "Matte Black", stock: 14, connector: "usb-c", desc: "Cardioid pickup, tap-to-mute, built-in pop filter" },
  { id: "P37", name: "4K Ultra HD Streaming Webcam", category: "Webcam", price: 3600, colour: "Black", stock: 11, connector: "usb-c", desc: "4K@30fps, autofocus, dual stereo mics, privacy shutter" },
  { id: "P38", name: "ScreenBar Desk Light with Auto-Dimming", category: "Lighting", price: 2150, colour: "Space Grey", stock: 16, connector: "usb-c", desc: "Asymmetric anti-glare monitor lamp, ambient light sensor" },
  { id: "P39", name: "Insulated Ceramic Travel Mug", category: "Mug", price: 550, colour: "Sage Green", stock: 28, desc: "Double-wall vacuum with ceramic interior, 350ml" },
  { id: "P40", name: "HydroTech Thermal Vacuum Flask", category: "Bottle", price: 750, colour: "Obsidian Black", stock: 19, desc: "18/8 stainless steel, 24h cold / 12h hot, 750ml" },
  { id: "P41", name: '27" 4K UHD Designer Color-Accurate Monitor', category: "Monitor", price: 28500, colour: "Space Grey", stock: 15, connector: "usb-c", desc: "IPS 99% DCI-P3 65W PD factory-calibrated" },
  { id: "P42", name: '34" Curved WQHD Ultrawide Productivity Monitor', category: "Monitor", price: 36e3, colour: "Matte Black", stock: 12, connector: "usb-c", desc: "1500R 3440x1440 100Hz USB-C KVM hub" },
  { id: "P43", name: '15.6" Portable USB-C FHD Second Screen Monitor', category: "Monitor", price: 12999, colour: "Carbon Black", stock: 18, connector: "usb-c", desc: "Ultra-slim 1080p IPS dual USB-C + mini HDMI" },
  { id: "P44", name: "Professional Graphic Drawing Tablet with 8192-Level Pressure Stylus", category: "Tablet", price: 6499, colour: "Midnight Black", stock: 22, connector: "usb-c", desc: "10x6 inch active area, 8 express keys, battery-free pen" },
  { id: "P45", name: "Active Digital Precision Stylus Pen with Palm Rejection", category: "Stylus", price: 2200, colour: "White", stock: 35, connector: "usb-c", desc: "Tilt-sensitivity, 0 lag, magnetic attachment" },
  { id: "P46", name: "Multi-Angle Aluminum Tablet & iPad Stand", category: "Stand", price: 1150, colour: "Silver", stock: 28, desc: "Dual-hinge 360\xB0 CNC aluminum desktop holder" },
  { id: "P47", name: "Wireless Ergonomic Numeric Keypad", category: "Keypad", price: 1250, colour: "Space Grey", stock: 30, connector: "usb-c", desc: "22-key scissor-switch rechargeable numeric keypad" },
  { id: "P48", name: "Thunderbolt 4 / USB-C 12-in-1 Triple Display Docking Station", category: "Dock", price: 14500, colour: "Space Grey", stock: 14, connector: "usb-c", desc: "Dual HDMI + DP, 100W PD, Gigabit Ethernet, 4x USB" },
  { id: "P49", name: "High-Speed USB-C Multi-Card Reader & Hub (SD/microSD/CFast)", category: "CardReader", price: 1450, colour: "Silver", stock: 40, connector: "usb-c", desc: "UHS-II 312MB/s dual-slot simultaneous transfer" },
  { id: "P50", name: "1TB Rugged NVMe External Portable SSD (1050MB/s)", category: "Storage", price: 7800, colour: "Slate Blue", stock: 25, connector: "usb-c", desc: "Drop-resistant IP55 USB 3.2 Gen 2 portable SSD" },
  { id: "P51", name: "Professional Display Color Calibrator Tool", category: "Colorimeter", price: 9999, colour: "Black", stock: 10, connector: "usb-c", desc: "Hardware calibration sensor for accurate studio grading" },
  { id: "P52", name: "Pro Wireless Conference Headset with Noise-Cancelling Boom Mic", category: "Headset", price: 3499, colour: "Matte Black", stock: 24, connector: "usb-c", desc: "AI ambient noise cancelling mic, 30h talk time" },
  { id: "P53", name: "Studio Acoustic Isolation Desk Microphone Shield", category: "Audio", price: 1850, colour: "Black Foam", stock: 16, desc: "High-density sound absorbing acoustic reflex shield" },
  { id: "P54", name: "3Dconnexion SpaceNavigator 3D CAD Navigation Mouse", category: "3DMouse", price: 8900, colour: "Brushed Steel", stock: 11, connector: "usb-c", desc: "6-Degrees-of-Freedom 3D sensor for CAD & 3D modeling" },
  { id: "P55", name: "Aluminum Laptop Cooling Pad with Dual Silent Fans", category: "CoolingStand", price: 1650, colour: "Silver", stock: 32, connector: "usb-c", desc: "CNC ventilated mesh with dual 120mm whisper fans" },
  { id: "P56", name: "MagSafe Adjustable Desktop Phone & Tablet Stand", category: "PhoneStand", price: 850, colour: "Space Grey", stock: 45, desc: "Weighted base magnetic portrait/landscape swivel" },
  { id: "P57", name: "10-inch Bi-Color LED Ring Light with Desktop Tripod", category: "Lighting", price: 1599, colour: "White/Warm", stock: 27, connector: "usb-c", desc: "3200K-5600K dimmable USB ring light with phone holder" },
  { id: "P58", name: "4K Overhead USB Document Camera & Visualiser", category: "DocCamera", price: 4800, colour: "Matte Black", stock: 15, connector: "usb-c", desc: "13MP sensor, multi-joint arm for online teaching & demos" },
  { id: "P59", name: "Multi-Tier Desktop Document Organiser & Filing Tray", category: "Organizer", price: 899, colour: "Mesh Black", stock: 38, desc: "3-tier pull-out steel mesh file and folder tray" },
  { id: "P60", name: "Wireless Thermal Shipping Label Printer & Barcode Scanner Kit", category: "Printer", price: 6200, colour: "White", stock: 20, connector: "usb-c", desc: "4x6 inch direct thermal label printer with handheld 2D scanner" },
  { id: "P61", name: 'Enterprise Fleet 14" Business Ultrabook (i5/16GB/512GB)', category: "Laptop", price: 54999, colour: "Space Grey", stock: 45, connector: "usb-c", desc: '14" FHD IPS, Intel Core i5, 16GB RAM, 512GB SSD, Thunderbolt 4' },
  { id: "P62", name: 'Developer Pro 16" High-Performance Workstation Laptop (i7/32GB/1TB)', category: "Laptop", price: 89999, colour: "Matte Black", stock: 30, connector: "usb-c", desc: '16" QHD 165Hz, Intel Core i7, 32GB RAM, 1TB NVMe, Thunderbolt' },
  { id: "P63", name: 'Executive Carbon 13.3" Ultra-Slim Touchscreen Laptop (Ultra 7/16GB/512GB OLED)', category: "Laptop", price: 104999, colour: "Carbon Black", stock: 25, connector: "usb-c", desc: '13.3" 2.8K OLED Touch, Intel Core Ultra 7, 16GB RAM, 512GB SSD' },
  { id: "P64", name: 'Entry Corporate Staff 15.6" Office Productivity Laptop (i3/16GB/512GB)', category: "Laptop", price: 42999, colour: "Silver", stock: 50, connector: "usb-c", desc: '15.6" FHD Anti-Glare, Intel Core i3, 16GB RAM, 512GB SSD, Numeric Keypad' },
  { id: "P65", name: 'Creative Studio 16" RTX Workstation Laptop (i9/64GB/2TB/RTX 4070 4K)', category: "Laptop", price: 149999, colour: "Midnight Blue", stock: 18, connector: "usb-c", desc: '16" 4K Mini-LED, Intel Core i9, 64GB RAM, 2TB SSD, NVIDIA RTX 4070 8GB' },
  { id: "P66", name: 'Finance & Enterprise Secure 14" Rugged vPro Laptop (i7 vPro/32GB/1TB TPM 2.0)', category: "Laptop", price: 78999, colour: "Gunmetal Grey", stock: 35, connector: "usb-c", desc: '14" FHD Anti-Glare, Intel Core i7 vPro, 32GB RAM, 1TB SSD, Hardware TPM 2.0' },
  { id: "P67", name: "Corporate Silent Multi-Device Wireless Mouse (Bluetooth + 2.4G)", category: "Mouse", price: 1299, colour: "Matte Black", stock: 60, connector: "usb-c", desc: "Multi-device pairing, silent acoustic switches, 4000 DPI" },
  { id: "P68", name: "Enterprise Low-Profile Quiet Office Keyboard with Numeric Keypad", category: "Keyboard", price: 1799, colour: "Space Grey", stock: 55, connector: "usb-c", desc: "Full-size scissor keys, whisper-quiet membrane, dedicated numpad" },
  { id: "P69", name: "Professional Ergonomic Split Wave Wireless Keyboard & Cushioned Palm Rest", category: "Keyboard", price: 3499, colour: "Graphite", stock: 40, connector: "usb-c", desc: "Curved split wave layout, memory foam wrist pad, dual wireless" },
  { id: "P70", name: "Vertical Ergonomic Precision Laser Mouse with Thumb Rest", category: "Mouse", price: 2299, colour: "Graphite", stock: 48, connector: "usb-c", desc: "Ergonomic 57\xB0 vertical contour, precision laser tracking, thumb scroll" },
  { id: "P71", name: "100W GaN Triple-Port USB-C Corporate Fast Power Adapter", category: "Charger", price: 2499, colour: "White", stock: 50, connector: "usb-c", desc: "Compact GaN III 2x USB-C + 1x USB-A PD 3.0 ultra-safe power block" },
  { id: "P72", name: 'Magnetic Anti-Glare & Privacy Screen Filter (14" & 15.6")', category: "Stand", price: 1499, colour: "Matte Privacy", stock: 70, desc: "60\xB0 micro-louver privacy angle with magnetic snap-on for laptops" },
  { id: "P73", name: "Executive Leatherette Corporate Laptop Briefcase & Tech Folio", category: "Backpack", price: 2799, colour: "Brown", stock: 35, desc: 'Padded 15.6" laptop compartment, waterproof vegan leather' },
  { id: "P74", name: "2K QHD 60FPS Enterprise AI Auto-Framing Conference Webcam", category: "Webcam", price: 3999, colour: "Black", stock: 40, connector: "usb-c", desc: "2K QHD, Sony Starvis sensor, AI auto-framing, dual noise-cancelling mics" },
  { id: "P75", name: 'Dual-Arm Gas Spring Heavy-Duty Desk Monitor Stand (Dual up to 32")', category: "Stand", price: 4500, colour: "Matte Black", stock: 25, desc: 'Dual monitor desk clamp supporting up to 32" screens, 360\xB0 rotation' },
  { id: "P76", name: "Smart Electric Rapid-Boil Kettle (1.7L Stainless Steel)", category: "Home Appliance", price: 2199, colour: "Silver", stock: 40, desc: "1500W rapid boil, auto shut-off, food-grade 304 stainless steel" },
  { id: "P77", name: "15-Bar Compact Espresso & Cappuccino Coffee Machine", category: "Home Appliance", price: 6499, colour: "Matte Black", stock: 25, desc: "15-bar high pressure pump, milk frother steam wand, compact footprint" },
  { id: "P78", name: "Smart HEPA Air Purifier with Real-Time Air Quality Display", category: "Home Appliance", price: 7999, colour: "White", stock: 30, desc: "True HEPA H13 filtration, PM2.5 sensor, covers up to 350 sq ft" },
  { id: "P79", name: "High-Speed Nutrient Extractor Countertop Blender (1000W)", category: "Home Appliance", price: 3499, colour: "Stainless Grey", stock: 35, desc: "1000W copper motor, 6-leaf stainless blade, 2 travel cups included" },
  { id: "P80", name: "Smart Robotic Vacuum & Mop Cleaner with Auto-Docking", category: "Home Appliance", price: 18999, colour: "Piano Black", stock: 20, desc: "LiDAR laser navigation, 3000Pa suction, app control & auto charging" },
  { id: "P81", name: "Digital 4-Slice Convection Pop-Up Toaster with Browning Control", category: "Home Appliance", price: 2799, colour: "Brushed Steel", stock: 45, desc: "4-slice extra-wide slots, 7 browning settings, defrost & reheat" },
  { id: "P82", name: "Cordless Handheld Cyclonic Stick Vacuum Cleaner (22.2V)", category: "Home Appliance", price: 8499, colour: "Cobalt Blue", stock: 28, desc: "Brushless motor, 20kPa suction, 45min runtime, multi-surface brush" }
];
function buildMasterSystemPrompt(params) {
  const {
    role,
    customInstruction,
    activeTab = "dashboard",
    activityName,
    currentBudget,
    currentSlotsSummary,
    landedPriceSummary,
    violationsSummary,
    catalogueSummary,
    limitingFactor = "None"
  } = params;
  let rolePersona = "";
  if (role === "rapid_checker") {
    rolePersona = `ROLE: Rapid Compatibility & Spec Checker. Provide lightning-fast, high-density, concise answers verifying hardware compatibility, port types, clamp dimensions, power wattage, and stock status across the website.`;
  } else if (role === "procurement_strategist") {
    rolePersona = `ROLE: Senior Procurement & Unit Economics Strategist. Focus on deep financial reasoning, landed margin sensitivity, platform referral fees, break-even basket analysis, and cost-to-serve economics for B2B and retail operations.`;
  } else if (role === "workspace_architect") {
    rolePersona = `ROLE: Ergonomic Workspace Architect. Specialize in human factors, spinal posture, monitor heights, eye-strain mitigation, screenbar mounting geometry, and high-productivity desktop setups.`;
  }
  const currentPage = WEBSITE_PAGES[activeTab] || WEBSITE_PAGES.dashboard;
  const productsIndex = CATALOGUE_PRODUCTS_METADATA.map(
    (p) => `[${p.id}] ${p.name} (${p.category}) - \u20B9${p.price.toLocaleString("en-IN")}${p.stock === 0 ? " [OUT OF STOCK]" : ` [In Stock: ${p.stock}]`} - ${p.desc}`
  ).join("\n");
  return `${rolePersona ? rolePersona + "\n\n" : ""}${customInstruction ? customInstruction + "\n\n" : ""}You are Sahay AI (\u0938\u0939\u093E\u092F AI), the intelligent AI Assistant and Shopping Agent for the "Budget-Based Product Bundle Builder" web application.
You can directly recommend products, assemble bundles, calculate landed costs, and place 1-click orders.

==================================================
1. CURRENT USER & WORKSPACE STATE (FOR INTERNAL CONTEXT ONLY - DO NOT ECHO THIS BACK TO THE USER)
==================================================
- Active Page: "${currentPage.title}" (tab: "${currentPage.id}") - ${currentPage.summary}
- Current Activity: "${activityName}"
- Target Budget: \u20B9${currentBudget.toLocaleString("en-IN")}
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
8. "business" (Business Insights & Strategy): MBA unit economics simulator (Retailer \u20B915k fee, \u20B93.5k cost-to-serve, 3.5% referral commission, break-even ~40 baskets).
9. "tests" (Automated Test Suite): 22+ live browser tests (REF-001 to REF-006, EDGE-001 to EDGE-006) validating compatibility logic and pricing math.
10. "evidence" (Project Evidence & Scope Audit): Academic audit tracking baseline prototype v0.1 vs final implementation.
11. "settings" (Settings & Configuration): 18% GST tax configuration, shipping surcharge rules (\u20B9499 base, \u20B950,000 free shipping threshold), and factory reset.

==================================================
3. FULL PRODUCT INVENTORY (PRODUCTS: P01 - P82)
==================================================
${productsIndex}

==================================================
4. CORE DOMAIN RULES & FORMULAS
==================================================
1. Landed Price Formula:
   Landed Price = Product Subtotal + Net Shipping + 18% GST Tax
   - Free shipping if Product Subtotal >= \u20B950,000 (Net Shipping = \u20B90).
   - If Subtotal < \u20B950,000: Net Shipping = \u20B9499 base + (Heavy Items Count \xD7 \u20B9450) where heavy item >= 15 kg.
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
     * Explicitly showcase our enterprise laptops: [P64] Entry Corporate Staff 15.6" Laptop (\u20B942,999), [P61] Enterprise Fleet 14" Business Ultrabook (\u20B954,999), [P62] Developer Pro 16" Workstation Laptop (\u20B989,999), [P65] Creative Studio 16" RTX Workstation (\u20B91,49,999).
     * Also showcase complementary computer peripherals: [P41] 27" 4K UHD Monitor (\u20B928,500), [P43] 15.6" Portable FHD Monitor (\u20B912,999), [P67] Multi-Device Mouse (\u20B91,299), [P68] Quiet Office Keyboard (\u20B91,799), [P48] Thunderbolt 4 Dock (\u20B914,500), [P30] Aluminum Laptop Riser Stand (\u20B91,299).
     * ALWAYS format IDs in brackets like [P64], [P61], [P67] so interactive product cards render in the chat with direct "Add to Cart" and "Inspect" buttons!
     * Include an action block of type "add_to_cart" or "order_items" for the recommended computer products!
2. Determine the requested quantities.
3. Calculate subtotal, shipping (\u20B9499 or free if subtotal >= \u20B950,000), 18% GST tax, and landed total.
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
- Fully support questions and orders in English, Hindi (\u0939\u093F\u0902\u0926\u0940), and Gujarati (\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0)!`;
}
function generateComprehensiveHeuristicResponse(message, context) {
  const lowerMsg = message.toLowerCase();
  const currentBudget = context?.budget || 75e3;
  const validation = context?.validation;
  const violations = validation?.compatibilityViolations || validation?.violations || [];
  const availableProducts = context?.availableProducts && context.availableProducts.length > 0 ? context.availableProducts : CATALOGUE_PRODUCTS_METADATA;
  const isHindi = lowerMsg.includes("hindi") || lowerMsg.includes("\u0939\u093F\u0902\u0926\u0940") || lowerMsg.includes("\u092D\u093E\u0937\u093E") || /[\u0900-\u097F]/.test(message);
  const isGujarati = lowerMsg.includes("gujarati") || lowerMsg.includes("\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0") || /[\u0A80-\u0AFF]/.test(message);
  function findProduct(query) {
    const q = query.toLowerCase().trim();
    return CATALOGUE_PRODUCTS_METADATA.find(
      (p) => p.id.toLowerCase() === q || p.name.toLowerCase().includes(q) || p.category.toLowerCase() === q || p.desc.toLowerCase().includes(q)
    );
  }
  const isOrderIntent = lowerMsg.includes("order") || lowerMsg.includes("buy") || lowerMsg.includes("purchase") || lowerMsg.includes("get me") || lowerMsg.includes("i want") || lowerMsg.includes("need") || lowerMsg.includes("add to cart") || lowerMsg.includes("cart") || lowerMsg.includes("checkout") || lowerMsg.includes("lets buy") || lowerMsg.includes("let's buy") || lowerMsg.includes("lets get") || lowerMsg.includes("let's get") || lowerMsg.includes("show") || lowerMsg.includes("find") || lowerMsg.includes("looking for") || lowerMsg.includes("price of") || lowerMsg.includes("cost of") || lowerMsg.includes("laptop") || lowerMsg.includes("alptop") || lowerMsg.includes("leptop") || lowerMsg.includes("mouse") || lowerMsg.includes("mose") || lowerMsg.includes("keyboard") || lowerMsg.includes("monitor") || lowerMsg.includes("charger") || lowerMsg.includes("headphones") || lowerMsg.includes("headset") || lowerMsg.includes("tablet") || lowerMsg.includes("backpack") || lowerMsg.includes("tshirt") || lowerMsg.includes("mug") || lowerMsg.includes("bottle") || lowerMsg.includes("\u0911\u0930\u094D\u0921\u0930") || lowerMsg.includes("\u0916\u0930\u0940\u0926") || lowerMsg.includes("\u0A93\u0AB0\u0ACD\u0AA1\u0AB0");
  if (isOrderIntent) {
    const isComputerQuery = /\b(computer|computers|laptop|laptops|pc|pcs|desktop|desktops|computing|workstation|ultrabook|notebook)\b/i.test(lowerMsg);
    const idMatches = lowerMsg.match(/\bp(?:0[1-9]|[1-9][0-9])\b/gi);
    if (isComputerQuery && (!idMatches || idMatches.length === 0)) {
      return {
        reply: `### \u{1F4BB} Official Computer Systems & Workstation Hardware

Here are our premier enterprise laptops, high-performance PCs, and computing workstation peripherals available in our catalog:

#### \u{1F5A5}\uFE0F Business & High-Performance Laptops
* **[P64] Entry Corporate Staff 15.6" Office Productivity Laptop** \u2014 \u20B942,999 *(In Stock: 50)*: Intel Core i3, 16GB RAM, 512GB SSD, Anti-Glare FHD display with full numeric keypad.
* **[P61] Enterprise Fleet 14" Business Ultrabook** \u2014 \u20B954,999 *(In Stock: 45)*: Intel Core i5, 16GB RAM, 512GB SSD, Thunderbolt 4, ultra-light 1.3kg magnesium chassis.
* **[P62] Developer Pro 16" Workstation Laptop** \u2014 \u20B989,999 *(In Stock: 30)*: Intel Core i7, 32GB RAM, 1TB NVMe, QHD 165Hz display, dual Thunderbolt ports.
* **[P65] Creative Studio 16" RTX Workstation Laptop** \u2014 \u20B91,49,999 *(In Stock: 18)*: Intel Core i9, 64GB RAM, 2TB SSD, NVIDIA RTX 4070 8GB, 4K Mini-LED display.

#### \u{1F5B1}\uFE0F Computer Displays & Peripherals
* **[P41] 27" 4K UHD Designer Color-Accurate Monitor** \u2014 \u20B928,500 *(In Stock: 15)*: Factory-calibrated IPS, 99% DCI-P3 with 65W USB-C Power Delivery.
* **[P43] 15.6" Portable USB-C FHD Second Screen Monitor** \u2014 \u20B912,999 *(In Stock: 18)*: Ultra-slim 1080p IPS second monitor for dual-screen productivity.
* **[P67] Corporate Silent Multi-Device Wireless Mouse** \u2014 \u20B91,299 *(In Stock: 60)*: Bluetooth 5.2 + 2.4G dual wireless, silent clicks, 4000 DPI sensor.
* **[P68] Enterprise Low-Profile Quiet Office Keyboard** \u2014 \u20B91,799 *(In Stock: 55)*: Full-size low-profile scissor keys with dedicated numeric keypad.
* **[P48] Thunderbolt 4 / USB-C 12-in-1 Triple Display Docking Station** \u2014 \u20B914,500 *(In Stock: 14)*: Dual HDMI + DP, 100W PD charging, Gigabit Ethernet, 4x USB ports.
* **[P30] Aluminum Laptop Riser Stand** \u2014 \u20B91,299 *(In Stock: 20)*: CNC-machined anodized aluminum stand for optimal eye-level ergonomics.

\u{1F447} **Inspect, Check Specs, or Add to Cart directly below**: Click any item card to inspect or add it directly to your cart with one click!`,
        action: {
          type: "add_to_cart",
          title: "Add Recommended Computer Setup to Cart",
          items: [
            { id: "P64", name: 'Entry Corporate Staff 15.6" Office Productivity Laptop', price: 42999, quantity: 1 },
            { id: "P67", name: "Corporate Silent Multi-Device Wireless Mouse", price: 1299, quantity: 1 }
          ],
          reason: "Selected computer productivity hardware ready for cart"
        },
        model: "heuristic-website-trainer"
      };
    }
    if (lowerMsg.includes("checkout") && !lowerMsg.match(/\bp(?:0[1-9]|[1-9][0-9])\b/)) {
      if (isHindi) {
        return {
          reply: `\u0906\u092A\u0915\u093E \u091A\u0947\u0915\u0906\u0909\u091F \u0924\u0948\u092F\u093E\u0930 \u0939\u0948! \u0906\u092A \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u092A\u0947\u092E\u0947\u0902\u091F \u092A\u0947\u091C \u092A\u0930 \u091C\u093E\u0915\u0930 UPI, \u0915\u094D\u0930\u0947\u0921\u093F\u091F/\u0921\u0947\u092C\u093F\u091F \u0915\u093E\u0930\u094D\u0921 \u092F\u093E COD \u0915\u0947 \u092E\u093E\u0927\u094D\u092F\u092E \u0938\u0947 \u0905\u092A\u0928\u093E \u0911\u0930\u094D\u0921\u0930 \u092A\u0942\u0930\u093E \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964`,
          action: { type: "checkout", title: "\u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u091A\u0947\u0915\u0906\u0909\u091F \u092A\u0930 \u091C\u093E\u090F\u0902", reason: "\u0911\u0930\u094D\u0921\u0930 \u092B\u093E\u0907\u0928\u0932 \u0915\u0930\u0947\u0902" },
          model: "heuristic-website-trainer"
        };
      }
      return {
        reply: `Your checkout is ready! You can proceed to the secure checkout page to verify your items, select your delivery address, and pay via UPI, Credit/Debit Card, Netbanking, or Cash on Delivery.`,
        action: {
          type: "checkout",
          title: "Proceed to Secure Checkout",
          reason: "Review active items and complete payment"
        },
        model: "heuristic-website-trainer"
      };
    }
    const matchedProducts = [];
    if (idMatches && idMatches.length > 0) {
      for (const rawId of idMatches) {
        const uppercaseId = rawId.toUpperCase();
        const prod = CATALOGUE_PRODUCTS_METADATA.find((p) => p.id === uppercaseId);
        if (prod) {
          const regexBefore = new RegExp(`(\\d+)\\s*(?:x\\s*|of\\s*)?${rawId}`, "i");
          const regexAfter = new RegExp(`${rawId}\\s*(?:x\\s*)?(\\d+)`, "i");
          const matchBefore = lowerMsg.match(regexBefore);
          const matchAfter = lowerMsg.match(regexAfter);
          const qty = matchBefore ? parseInt(matchBefore[1], 10) : matchAfter ? parseInt(matchAfter[1], 10) : 1;
          matchedProducts.push({ product: prod, quantity: qty > 0 ? qty : 1 });
        }
      }
    } else {
      const keywordsToMatch = [
        { key: "vertical mouse", id: "P26" },
        { key: "ergonomic mouse", id: "P07" },
        { key: "silent mouse", id: "P29" },
        { key: "travel mouse", id: "P22" },
        { key: "3d mouse", id: "P54" },
        { key: "cad mouse", id: "P54" },
        { key: "mouse", id: "P07" },
        { key: "rgb keyboard", id: "P27" },
        { key: "mechanical keyboard", id: "P27" },
        { key: "60% keyboard", id: "P28" },
        { key: "compact keyboard", id: "P08" },
        { key: "full-size keyboard", id: "P21" },
        { key: "numeric keypad", id: "P47" },
        { key: "keypad", id: "P47" },
        { key: "keyboard", id: "P08" },
        { key: "drawing tablet", id: "P44" },
        { key: "graphics tablet", id: "P44" },
        { key: "tablet stand", id: "P46" },
        { key: "tablet", id: "P44" },
        { key: "stylus", id: "P45" },
        { key: "digital pen", id: "P45" },
        { key: "ultrawide monitor", id: "P42" },
        { key: "curved monitor", id: "P42" },
        { key: "color-accurate monitor", id: "P41" },
        { key: "portable monitor", id: "P43" },
        { key: "4k monitor", id: "P41" },
        { key: "monitor", id: "P41" },
        { key: "docking station", id: "P48" },
        { key: "thunderbolt dock", id: "P48" },
        { key: "card reader", id: "P49" },
        { key: "portable ssd", id: "P50" },
        { key: "external storage", id: "P50" },
        { key: "external ssd", id: "P50" },
        { key: "color calibrator", id: "P51" },
        { key: "display calibrator", id: "P51" },
        { key: "conference headset", id: "P52" },
        { key: "acoustic shield", id: "P53" },
        { key: "cooling stand", id: "P55" },
        { key: "cooling pad", id: "P55" },
        { key: "phone stand", id: "P56" },
        { key: "ring light", id: "P57" },
        { key: "document camera", id: "P58" },
        { key: "document organiser", id: "P59" },
        { key: "document organizer", id: "P59" },
        { key: "filing tray", id: "P59" },
        { key: "label printer", id: "P60" },
        { key: "barcode scanner", id: "P60" },
        { key: "thermal printer", id: "P60" },
        { key: "gan charger", id: "P34" },
        { key: "fast charger", id: "P34" },
        { key: "charger", id: "P34" },
        { key: "headphones", id: "P35" },
        { key: "headset", id: "P52" },
        { key: "microphone", id: "P36" },
        { key: "mic", id: "P36" },
        { key: "webcam", id: "P37" },
        { key: "camera", id: "P37" },
        { key: "screenbar", id: "P38" },
        { key: "desk light", id: "P38" },
        { key: "laptop cooling pad", id: "P55" },
        { key: "laptop cooling", id: "P55" },
        { key: "cooling pad", id: "P55" },
        { key: "cooling stand", id: "P55" },
        { key: "laptop backpack", id: "P19" },
        { key: "laptop bag", id: "P19" },
        { key: "laptop stand", id: "P30" },
        { key: "laptop riser", id: "P30" },
        { key: "riser stand", id: "P30" },
        { key: "laptop arm", id: "P31" },
        { key: "portable screen", id: "P43" },
        { key: "second screen", id: "P43" },
        { key: "portable monitor", id: "P43" },
        { key: "laptop cooling pad", id: "P55" },
        { key: "laptop cooling", id: "P55" },
        { key: "cooling pad", id: "P55" },
        { key: "cooling stand", id: "P55" },
        { key: "laptop backpack", id: "P19" },
        { key: "laptop bag", id: "P19" },
        { key: "laptop stand", id: "P30" },
        { key: "laptop riser", id: "P30" },
        { key: "riser stand", id: "P30" },
        { key: "laptop arm", id: "P31" },
        { key: "portable screen", id: "P43" },
        { key: "second screen", id: "P43" },
        { key: "portable monitor", id: "P43" },
        { key: "business ultrabook", id: "P61" },
        { key: "workstation laptop", id: "P62" },
        { key: "developer laptop", id: "P62" },
        { key: "executive laptop", id: "P63" },
        { key: "office laptop", id: "P64" },
        { key: "corporate laptop", id: "P64" },
        { key: "creative laptop", id: "P65" },
        { key: "rtx laptop", id: "P65" },
        { key: "laptop", id: "P61" },
        { key: "alptop", id: "P61" },
        { key: "leptop", id: "P61" },
        { key: "laptops", id: "P64" },
        { key: "alptops", id: "P64" },
        { key: "macbook", id: "P63" },
        { key: "notebook pc", id: "P61" },
        { key: "computer", id: "P61" },
        { key: "computers", id: "P64" },
        { key: "pc", id: "P61" },
        { key: "desktop", id: "P64" },
        { key: "workstation", id: "P62" },
        { key: "monitor arm", id: "P31" },
        { key: "desk mat", id: "P32" },
        { key: "leather blotter", id: "P32" },
        { key: "cable organizer", id: "P33" },
        { key: "organizer", id: "P33" },
        { key: "travel mug", id: "P39" },
        { key: "ceramic mug", id: "P11" },
        { key: "mug", id: "P39" },
        { key: "vacuum flask", id: "P40" },
        { key: "water bottle", id: "P10" },
        { key: "bottle", id: "P40" },
        { key: "backpack", id: "P14" },
        { key: "notebook", id: "P13" },
        { key: "hub", id: "P09" },
        { key: "blue tshirt", id: "P04" },
        { key: "black tshirt", id: "P02" },
        { key: "grey tshirt", id: "P03" },
        { key: "white tshirt", id: "P06" },
        { key: "tshirt", id: "P02" },
        { key: "t-shirt", id: "P02" }
      ];
      keywordsToMatch.sort((a, b) => b.key.length - a.key.length);
      let remainingText = lowerMsg;
      for (const kw of keywordsToMatch) {
        if (remainingText.includes(kw.key)) {
          const prod = CATALOGUE_PRODUCTS_METADATA.find((p) => p.id === kw.id);
          if (prod && !matchedProducts.some((m) => m.product.id === prod.id)) {
            const kwEscaped = kw.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const kwRegex = new RegExp(`(\\d+)\\s*(?:x\\s*)?(?:piece|pieces|unit|units)?\\s*(?:of\\s*)?${kwEscaped}`, "i");
            const kwMatch = remainingText.match(kwRegex);
            const qty = kwMatch ? Math.max(1, parseInt(kwMatch[1], 10)) : 1;
            matchedProducts.push({ product: prod, quantity: qty });
            remainingText = remainingText.replace(kw.key, " ");
          }
        }
      }
    }
    if (matchedProducts.length > 0) {
      const subtotal = matchedProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const isFreeShipping = subtotal >= 5e4;
      const netShipping = isFreeShipping ? 0 : 499;
      const taxAmount = Math.round((subtotal + netShipping) * 0.18 * 100) / 100;
      const totalLandedPrice = Math.round((subtotal + netShipping + taxAmount) * 100) / 100;
      const itemsDescription = matchedProducts.map(
        (it) => `- **${it.product.name}** (\`${it.product.id}\`): ${it.quantity}x @ \u20B9${it.product.price.toLocaleString("en-IN")} = \u20B9${(it.product.price * it.quantity).toLocaleString("en-IN")}`
      ).join("\n");
      const actionItems = matchedProducts.map((it) => ({
        id: it.product.id,
        name: it.product.name,
        price: it.product.price,
        quantity: it.quantity
      }));
      const outOfStockItem = matchedProducts.find((it) => it.product.stock === 0);
      if (outOfStockItem) {
        return {
          reply: `\u26A0\uFE0F **Product Out of Stock**: Product **${outOfStockItem.product.name}** (\`${outOfStockItem.product.id}\`) is currently out of stock.

Would you like me to recommend an in-stock alternative? For example, **Blue Tshirt Size L (P04)** or **Black Tshirt (P02)** are available right now.`,
          action: {
            type: "navigate",
            tab: "catalogue",
            reason: "View available in-stock items in Product Catalogue"
          },
          model: "heuristic-website-trainer"
        };
      }
      const isLaptopRelated = lowerMsg.includes("laptop") || lowerMsg.includes("alptop") || lowerMsg.includes("leptop") || lowerMsg.includes("macbook") || lowerMsg.includes("notebook");
      if (isHindi) {
        const header2 = isLaptopRelated ? `### \u{1F4BB} \u0932\u0948\u092A\u091F\u0949\u092A \u0935\u0930\u094D\u0915\u0938\u094D\u091F\u0947\u0936\u0928 \u0939\u093E\u0930\u094D\u0921\u0935\u0947\u092F\u0930 \u0924\u0948\u092F\u093E\u0930 \u0939\u0948!

\u092F\u0939\u093E\u0901 \u0939\u092E\u093E\u0930\u093E \u0936\u0940\u0930\u094D\u0937 **[P30] \u090F\u0932\u094D\u092F\u0941\u092E\u093F\u0928\u093F\u092F\u092E \u0932\u0948\u092A\u091F\u0949\u092A \u0938\u094D\u091F\u0948\u0902\u0921** (\u20B91,299) \u0914\u0930 \u0932\u0948\u092A\u091F\u0949\u092A \u090F\u0915\u094D\u0938\u0947\u0938\u0930\u0940\u091C\u093C \u0924\u0948\u092F\u093E\u0930 \u0939\u0948\u0902:

${itemsDescription}

\u{1F4A1} **\u0938\u0902\u092C\u0902\u0927\u093F\u0924 \u0932\u0948\u092A\u091F\u0949\u092A \u090F\u0915\u094D\u0938\u0947\u0938\u0930\u0940\u091C\u093C**:
* **[P55] \u0921\u0941\u0905\u0932 \u092B\u0948\u0928 \u0932\u0948\u092A\u091F\u0949\u092A \u0915\u0942\u0932\u093F\u0902\u0917 \u092A\u0948\u0921** \u2014 \u20B91,650 (\u0938\u094D\u091F\u0949\u0915: 32)
* **[P43] 15.6" \u092A\u094B\u0930\u094D\u091F\u0947\u092C\u0932 USB-C \u0938\u0947\u0915\u0902\u0921 \u0938\u094D\u0915\u094D\u0930\u0940\u0928** \u2014 \u20B912,999 (\u0938\u094D\u091F\u0949\u0915: 18)
* **[P19] \u090F\u0902\u091F\u0940-\u0925\u0947\u092B\u094D\u091F \u0932\u0948\u092A\u091F\u0949\u092A \u092C\u0948\u0915\u092A\u0948\u0915** \u2014 \u20B91,650 (\u0938\u094D\u091F\u0949\u0915: 20)

` : `### \u{1F6D2} \u0911\u0930\u094D\u0921\u0930 \u0924\u0948\u092F\u093E\u0930 \u0939\u0948!

\u092E\u0948\u0902\u0928\u0947 \u0906\u092A\u0915\u0947 \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u0928\u0941\u0930\u094B\u0927\u093F\u0924 \u0909\u0924\u094D\u092A\u093E\u0926 \u0924\u0948\u092F\u093E\u0930 \u0915\u0930 \u0932\u093F\u090F \u0939\u0948\u0902:

${itemsDescription}

`;
        return {
          reply: header2 + `**\u092A\u094D\u0930\u093E\u0907\u0938 \u092C\u094D\u0930\u0947\u0915\u0921\u093E\u0909\u0928 (Landed Cost)**:
- \u092A\u094D\u0930\u094B\u0921\u0915\u094D\u091F \u0938\u092C\u091F\u094B\u091F\u0932: \u20B9${subtotal.toLocaleString("en-IN")}
- \u0936\u093F\u092A\u093F\u0902\u0917 \u0936\u0941\u0932\u094D\u0915: ${netShipping === 0 ? "\u20B90 (\u092E\u0941\u092B\u094D\u0924 \u0936\u093F\u092A\u093F\u0902\u0917)" : `\u20B9${netShipping}`}
- 18% GST \u091F\u0948\u0915\u094D\u0938: \u20B9${taxAmount.toLocaleString("en-IN")}
- **\u0915\u0941\u0932 \u0926\u0947\u092F \u0930\u093E\u0936\u093F (Landed Total)**: \u20B9${totalLandedPrice.toLocaleString("en-IN")}

\u0921\u093F\u0932\u0940\u0935\u0930\u0940 \u092A\u0924\u093E: **\u0924\u0928\u094D\u092E\u092F \u0906\u0928\u0902\u0926 (Tanmay Anand)**, \u092C\u0948\u0902\u0917\u0932\u094B\u0930 / \u092E\u0941\u0902\u092C\u0908\u0964
\u0928\u0940\u091A\u0947 \u0926\u093F\u090F \u0917\u090F \u090F\u0915\u094D\u0936\u0928 \u0915\u093E\u0930\u094D\u0921 \u092A\u0930 **Order Now** \u092F\u093E **+ Cart** \u0926\u092C\u093E\u0915\u0930 \u0911\u0930\u094D\u0921\u0930 \u0924\u0941\u0930\u0902\u0924 \u092A\u094D\u0932\u0947\u0938 \u0915\u0930\u0947\u0902 \u092F\u093E \u0915\u093E\u0930\u094D\u091F \u092E\u0947\u0902 \u091C\u094B\u0921\u093C\u0947\u0902!`,
          action: {
            type: "order_items",
            title: `Order: ${matchedProducts.map((it) => `${it.quantity}x ${it.product.name}`).join(", ")}`,
            items: actionItems,
            subtotal,
            netShipping,
            taxAmount,
            total: totalLandedPrice,
            reason: "1-Click Direct Order via Sahay AI"
          },
          model: "heuristic-website-trainer"
        };
      }
      const header = isLaptopRelated ? `### \u{1F4BB} Laptop Workstation Gear Prepared!

Here is our premier **[P30] Aluminum Laptop Riser Stand** (\u20B91,299) along with top-rated modular laptop hardware ready for your workstation:

${itemsDescription}

\u{1F4A1} **Recommended Laptop Companions in our Catalogue**:
* **[P55] Aluminum Laptop Cooling Pad with Dual Silent Fans** \u2014 \u20B91,650 (In Stock: 32)
* **[P43] 15.6" Portable USB-C FHD Second Screen Monitor** \u2014 \u20B912,999 (In Stock: 18)
* **[P19] Professional Anti-Theft Laptop Backpack** \u2014 \u20B91,650 (In Stock: 20)
* **[P34] USB-C 100W GaN Fast Charger** \u2014 \u20B91,899 (In Stock: 22)

` : `### \u{1F6D2} Order Prepared Successfully!

I have configured your requested items for instant ordering:

${itemsDescription}

`;
      return {
        reply: header + `**Landed Cost Breakdown**:
- **Product Subtotal**: \u20B9${subtotal.toLocaleString("en-IN")}
- **Net Logistics/Shipping**: ${netShipping === 0 ? "\u20B90 (Free Shipping waiver applied!)" : `\u20B9${netShipping} standard base fee`}
- **GST (18%)**: \u20B9${taxAmount.toLocaleString("en-IN")}
- **Total Landed Price**: \u20B9${totalLandedPrice.toLocaleString("en-IN")}

\u{1F4CD} **Delivery Destination**: Tanmay Anand (Customer Profile defaults).

You can confirm and place this order right now with 1 click using the interactive action card below, or click **+ Cart** to add it to your bundle!`,
        action: {
          type: "order_items",
          title: `Order: ${matchedProducts.map((it) => `${it.quantity}x ${it.product.name}`).join(", ")}`,
          items: actionItems,
          subtotal,
          netShipping,
          taxAmount,
          total: totalLandedPrice,
          reason: "1-Click Direct Order via Sahay AI"
        },
        model: "heuristic-website-trainer"
      };
    } else {
      const defaultProd = CATALOGUE_PRODUCTS_METADATA.find((p) => p.id === "P30") || CATALOGUE_PRODUCTS_METADATA[0];
      const subtotal = defaultProd.price;
      const netShipping = 499;
      const taxAmount = Math.round((subtotal + netShipping) * 0.18 * 100) / 100;
      const totalLandedPrice = Math.round((subtotal + netShipping + taxAmount) * 100) / 100;
      return {
        reply: `### \u{1F6D2} Order & Workspace Setup Assistant

I would love to help you assemble your order! Here is our top-selling workspace hardware: **[${defaultProd.id}] ${defaultProd.name}** (\u20B9${defaultProd.price.toLocaleString("en-IN")}).

**Landed Cost Breakdown**:
- **Product Subtotal**: \u20B9${subtotal.toLocaleString("en-IN")}
- **Logistics/Shipping**: \u20B9${netShipping}
- **GST (18%)**: \u20B9${taxAmount.toLocaleString("en-IN")}
- **Total Landed Price**: \u20B9${totalLandedPrice.toLocaleString("en-IN")}

You can click **Order Now** or **+ Cart** below, or tell me which specific hardware you'd like (e.g. *"laptop stand"*, *"ergonomic mouse"*, *"mechanical keyboard"*, *"4k monitor"*).`,
        action: {
          type: "order_items",
          title: `Order: ${defaultProd.name} (${defaultProd.id})`,
          items: [{ id: defaultProd.id, name: defaultProd.name, price: defaultProd.price, quantity: 1 }],
          subtotal,
          netShipping,
          taxAmount,
          total: totalLandedPrice,
          reason: "1-Click Direct Order via Sahay AI"
        },
        model: "heuristic-website-trainer"
      };
    }
  }
  if (lowerMsg.includes("whole website") || lowerMsg.includes("all pages") || lowerMsg.includes("overview") || lowerMsg.includes("sitemap") || lowerMsg.includes("what can you do") || lowerMsg.includes("features")) {
    if (isHindi) {
      return {
        reply: `\u092F\u0939 \u0935\u0947\u092C\u0938\u093E\u0907\u091F **\u092C\u091C\u091F-\u0906\u0927\u093E\u0930\u093F\u0924 \u092A\u094D\u0930\u094B\u0921\u0915\u094D\u091F \u092C\u0902\u0921\u0932 \u092C\u093F\u0932\u094D\u0921\u0930 (C07)** \u0939\u0948\u0964 \u092F\u0939\u093E\u0901 \u0915\u0941\u0932 10 \u092E\u0941\u0916\u094D\u092F \u0905\u0928\u0941\u092D\u093E\u0917 \u0939\u0948\u0902:

1. **\u092A\u094D\u0930\u094B\u0921\u0915\u094D\u091F \u0915\u0948\u091F\u0932\u0949\u0917 (Catalogue)**: 40 \u0909\u0924\u094D\u092A\u093E\u0926 (P01-P40), 15 \u0936\u094D\u0930\u0947\u0923\u093F\u092F\u093E\u0902 \u0914\u0930 6-\u0915\u0949\u0932\u092E API \u092B\u093C\u093F\u0932\u094D\u091F\u0930\u0964
2. **\u092C\u0902\u0921\u0932 \u0924\u0941\u0932\u0928\u093E \u092C\u093F\u0932\u094D\u0921\u0930 (Compare Builder)**: 2-\u0938\u094D\u0932\u0949\u091F \u090F\u0915\u094D\u091F\u093F\u0935 \u092C\u0902\u0921\u0932, \u0939\u0947\u0921\u0930\u0941\u092E \u0915\u093E\u0909\u0902\u091F\u0930 \u0914\u0930 \u0932\u0948\u0902\u0921\u0947\u0921 \u0915\u0949\u0938\u094D\u091F\u0964
3. **\u092C\u0902\u0921\u0932 \u0915\u093E\u0930\u094D\u091F \u0921\u094D\u0930\u0949\u0935\u0930 (Cart)**: \u0938\u094D\u0932\u093E\u0907\u0921-\u0913\u0935\u0930 \u0915\u093E\u0930\u094D\u091F \u0914\u0930 'BUY NOW' \u0924\u094D\u0935\u0930\u093F\u0924 \u0911\u0930\u094D\u0921\u0930\u0964
4. **\u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u091A\u0947\u0915\u0906\u0909\u091F (Checkout)**: \u0921\u093F\u0932\u0940\u0935\u0930\u0940 \u090F\u0921\u094D\u0930\u0947\u0938, UPI/Card/COD \u092A\u0947\u092E\u0947\u0902\u091F \u0914\u0930 \u0907\u0928\u0935\u0949\u0907\u0938 \u0921\u093E\u0909\u0928\u0932\u094B\u0921\u0964
5. **\u0915\u0938\u094D\u091F\u092E\u0930 \u092A\u094D\u0930\u094B\u092B\u093E\u0907\u0932 (Profile)**: \u0924\u0928\u094D\u092E\u092F \u0906\u0928\u0902\u0926 (TA), \u0936\u093F\u092A\u093F\u0902\u0917 \u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938 \u0914\u0930 \u0921\u093F\u092B\u0949\u0932\u094D\u091F \u092C\u091C\u091F\u0964
6. **AI \u091A\u0948\u091F\u092C\u0949\u091F (Chat)**: \u091A\u0948\u091F \u0915\u0947 \u091C\u0930\u093F\u090F \u0915\u093F\u0938\u0940 \u092D\u0940 \u0909\u0924\u094D\u092A\u093E\u0926 \u0915\u093E \u0938\u0940\u0927\u093E \u0911\u0930\u094D\u0921\u0930 \u0926\u0947\u0902 \u0914\u0930 \u0938\u0939\u093E\u092F\u0924\u093E \u0932\u0947\u0902\u0964
7. **\u0921\u0948\u0936\u092C\u094B\u0930\u094D\u0921 (Dashboard)**: \u0932\u093E\u0907\u0935 KPI \u0914\u0930 \u092C\u091C\u091F \u092A\u094D\u0930\u094B\u0917\u094D\u0930\u0947\u0938\u0964
8. **\u092C\u093F\u091C\u0928\u0947\u0938 \u0907\u0928\u0938\u093E\u0907\u091F\u094D\u0938 (Business)**: MBA \u092F\u0942\u0928\u093F\u091F \u0907\u0915\u094B\u0928\u0949\u092E\u093F\u0915\u094D\u0938 \u0914\u0930 \u092C\u094D\u0930\u0947\u0915-\u0908\u0935\u0928 \u090F\u0928\u093E\u0932\u093F\u0938\u093F\u0938\u0964
9. **\u0911\u091F\u094B\u092E\u0947\u091F\u0947\u0921 \u091F\u0947\u0938\u094D\u091F \u0938\u0941\u0907\u091F (Tests)**: 22+ \u0932\u093E\u0907\u0935 \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u091F\u0947\u0938\u094D\u091F\u0964
10. **\u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u090F\u0935\u093F\u0921\u0947\u0902\u0938 (Evidence)**: \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u092E\u0948\u091F\u094D\u0930\u093F\u0915\u094D\u0938\u0964

\u0906\u092A \u0915\u094D\u092F\u093E \u0911\u0930\u094D\u0921\u0930 \u0915\u0930\u0928\u093E \u092F\u093E \u0926\u0947\u0916\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902?`,
        action: {
          type: "navigate",
          tab: "catalogue",
          reason: "Browse 40 items in Product Catalogue"
        },
        model: "heuristic-website-trainer"
      };
    }
    return {
      reply: `I am fully trained on the entire **Budget-Based Product Bundle Builder** platform! Here is an overview of all integrated modules:

1. **Product Catalogue (\`catalogue\`)**: Directory of **40 curated products** (\`P01\` to \`P40\`) across 15 categories (Tshirt, Mug, Mouse, Keyboard, Hub, Bottle, Stand, DeskMat, Charger, Audio, Webcam, Lighting) with 6-column backend API filters.
2. **Compare Builder (\`compare\`)**: 2-slot active bundle workspace (Mouse, Keyboard, etc.) with dynamic target budget, live headroom gauge, and landed cost breakdown.
3. **Bundle Cart Drawer (\`cart\`)**: Slide-over drawer with line items, budget utilization gauge, and direct **BUY NOW** checkout.
4. **Secure Checkout & Order Placement (\`checkout\`)**: Complete checkout page with delivery address prefill (Tanmay Anand), payment options (UPI, Card, Netbanking, COD), order placement (#C07-ORD-XXXXXX), and invoice export.
5. **Customer Profile (\`profile\`)**: Identity card with avatar (TA), default shipping addresses, and budget preferences.
6. **Gemini AI Assistant (\`chat\`)**: Conversational shopping consultant with **Direct Ordering Powers**\u2014ask me to order ANY product in the catalogue!
7. **Executive Dashboard (\`dashboard\`)**: Real-time KPI telemetry and shortcuts.
8. **Business Insights & Strategy (\`business\`)**: MBA unit economics simulator (Retailer \u20B915,000 fee, \u20B93,500 cost to serve, 3.5% referral fee, break-even ~40 baskets).
9. **Automated Test Suite (\`tests\`)**: 22+ live browser tests (REF-001 to REF-006, EDGE-001 to EDGE-006) validating compatibility logic and pricing math.
10. **Project Evidence & Scope Audit (\`evidence\`)**: Academic audit tracking baseline prototype v0.1 vs final implementation.
11. **Settings & Configuration (\`settings\`)**: 18% GST tax configuration, shipping surcharge rules (\u20B9499 base, \u20B950,000 free shipping threshold), and factory reset.

What would you like to explore or order?`,
      action: {
        type: "navigate",
        tab: "catalogue",
        reason: "Browse complete Product Catalogue"
      },
      model: "heuristic-website-trainer"
    };
  }
  if (lowerMsg.includes("go to") || lowerMsg.includes("navigate to") || lowerMsg.includes("open page") || lowerMsg.includes("show page") || lowerMsg.includes("show me")) {
    if (lowerMsg.includes("catalogue") || lowerMsg.includes("catalog") || lowerMsg.includes("products") || lowerMsg.includes("inventory")) {
      return {
        reply: `Opening the **Product Catalogue**. Browse all 40 products across 15 categories with technical blueprints, dimensions, wattage, and live stock levels.`,
        action: { type: "navigate", tab: "catalogue", reason: "Browse complete Product Catalogue" },
        model: "heuristic-website-trainer"
      };
    }
    if (lowerMsg.includes("cart") || lowerMsg.includes("drawer")) {
      return {
        reply: `Opening your **Bundle Cart Drawer**. Review your items, budget headroom, and click BUY NOW to place an order.`,
        action: { type: "navigate", tab: "cart", reason: "Open Bundle Cart" },
        model: "heuristic-website-trainer"
      };
    }
    if (lowerMsg.includes("checkout") || lowerMsg.includes("order")) {
      return {
        reply: `Opening the **Checkout** page. Review your order details, shipping address, and select payment methods.`,
        action: { type: "navigate", tab: "checkout", reason: "Open Checkout Page" },
        model: "heuristic-website-trainer"
      };
    }
    if (lowerMsg.includes("profile") || lowerMsg.includes("address") || lowerMsg.includes("user")) {
      return {
        reply: `Opening your **Customer Profile** (Tanmay Anand, Bangalore / Mumbai). You can manage default shipping addresses and shopping preferences here.`,
        action: { type: "navigate", tab: "profile", reason: "View Customer Profile" },
        model: "heuristic-website-trainer"
      };
    }
    if (lowerMsg.includes("compare") || lowerMsg.includes("builder")) {
      return {
        reply: `Opening the **Compare Builder**. Assemble and compare your hardware bundle with live landed pricing and budget headroom.`,
        action: { type: "navigate", tab: "compare", reason: "Open Compare Builder" },
        model: "heuristic-website-trainer"
      };
    }
    if (lowerMsg.includes("business") || lowerMsg.includes("economics") || lowerMsg.includes("mba")) {
      return {
        reply: `Opening the **Business Insights & Strategy** page. Explore our MBA unit economics model, retailer fees, and break-even simulator.`,
        action: { type: "navigate", tab: "business", reason: "View Business Insights" },
        model: "heuristic-website-trainer"
      };
    }
    if (lowerMsg.includes("test") || lowerMsg.includes("suite")) {
      return {
        reply: `Opening the **Automated Test Suite**. Run 22+ live verification tests with execution latency tracking.`,
        action: { type: "navigate", tab: "tests", reason: "Open Test Results" },
        model: "heuristic-website-trainer"
      };
    }
  }
  const isRecommendationIntent = lowerMsg.includes("recommend") || lowerMsg.includes("setup") || lowerMsg.includes("bundle") || lowerMsg.includes("build") || lowerMsg.includes("suggest") || lowerMsg.includes("assemble") || lowerMsg.includes("workstation");
  if (isRecommendationIntent) {
    const budgetMatch = lowerMsg.match(/(?:under|below|budget|for|of)?\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})\s*(?:k)?/i);
    let targetAmt = currentBudget || 75e3;
    if (budgetMatch) {
      const parsedNum = parseInt(budgetMatch[1], 10);
      targetAmt = lowerMsg.includes("k") && parsedNum < 1e3 ? parsedNum * 1e3 : parsedNum;
    }
    if (targetAmt <= 15e3) {
      const subtotal = 1450 + 1850 + 1899 + 399;
      const shipping = 499;
      const tax = Math.round((subtotal + shipping) * 0.18);
      const landed = subtotal + shipping + tax;
      return {
        reply: `Here is an essential workspace setup tailored under **\u20B9${targetAmt.toLocaleString("en-IN")}**:

1. **[P26] Ergonomic Wireless Vertical Mouse** \u2014 \u20B91,450 (In Stock: 18)
2. **[P28] Compact 60% Wireless Keyboard** \u2014 \u20B91,850 (In Stock: 15)
3. **[P34] USB-C 100W GaN Fast Charger** \u2014 \u20B91,899 (In Stock: 30)
4. **[P33] Magnetic Cable Management Organizer** \u2014 \u20B9399 (In Stock: 40)

* **Product Subtotal:** \u20B9${subtotal.toLocaleString("en-IN")}
* **Standard Shipping:** \u20B9${shipping}
* **18% GST Tax:** \u20B9${tax.toLocaleString("en-IN")}
* **Landed Total:** **\u20B9${landed.toLocaleString("en-IN")}** (Within \u20B9${targetAmt.toLocaleString("en-IN")} target!)

Click below to apply this setup directly to your builder or ask me to order any item!`,
        action: {
          type: "apply_bundle",
          title: `Budget Setup Under \u20B9${targetAmt.toLocaleString("en-IN")}`,
          budget: targetAmt,
          items: { Mouse: "P26", Keyboard: "P28", Charger: "P34", Organizer: "P33" }
        },
        model: "heuristic-website-trainer"
      };
    } else {
      const monitor = targetAmt < 6e4 ? { id: "P41", name: '27" 4K Professional Monitor', price: 28500 } : { id: "P42", name: '34" Curved WQHD Ultrawide Monitor', price: 36e3 };
      const subtotal = monitor.price + 1450 + 2499 + 1899 + 399;
      const shipping = subtotal >= 5e4 ? 0 : 499;
      const tax = Math.round((subtotal + shipping) * 0.18);
      const landed = subtotal + shipping + tax;
      return {
        reply: `Here is a high-performance WFH workstation setup curated for your target budget of **\u20B9${targetAmt.toLocaleString("en-IN")}**:

1. **[${monitor.id}] ${monitor.name}** \u2014 \u20B9${monitor.price.toLocaleString("en-IN")} (In Stock: 10)
2. **[P26] Ergonomic Wireless Vertical Mouse** \u2014 \u20B91,450 (In Stock: 18)
3. **[P27] RGB Mechanical Gaming Keyboard** \u2014 \u20B92,499 (In Stock: 12)
4. **[P34] USB-C 100W GaN Fast Charger** \u2014 \u20B91,899 (In Stock: 30)
5. **[P33] Magnetic Cable Management Organizer** \u2014 \u20B9399 (In Stock: 40)

* **Product Subtotal:** \u20B9${subtotal.toLocaleString("en-IN")}
* **Shipping Fee:** ${shipping === 0 ? "**FREE** (Order meets \u20B950,000 threshold)" : `\u20B9${shipping}`}
* **18% GST Tax:** \u20B9${tax.toLocaleString("en-IN")}
* **Total Landed Cost:** **\u20B9${landed.toLocaleString("en-IN")}**

Click below to apply this setup to your Workspace Builder!`,
        action: {
          type: "apply_bundle",
          title: `WFH Setup (${monitor.name})`,
          budget: targetAmt,
          items: { Monitor: monitor.id, Mouse: "P26", Keyboard: "P27", Charger: "P34", Organizer: "P33" }
        },
        model: "heuristic-website-trainer"
      };
    }
  }
  const categoryKeywords = [
    { label: "Laptop Gear & Accessories", triggers: ["laptop", "alptop", "leptop", "laptops", "alptops", "macbook"], ids: ["P30", "P55", "P43", "P19", "P48"] },
    { label: "Mouse / Ergonomic Mice", triggers: ["mouse", "mice", "mose"], ids: ["P26", "P29", "P07", "P22", "P54"] },
    { label: "Keyboards", triggers: ["keyboard", "keyboards", "keys"], ids: ["P27", "P28", "P08", "P21", "P47"] },
    { label: "Monitors / Displays", triggers: ["monitor", "monitors", "display", "displays", "screen", "screens"], ids: ["P41", "P42", "P43"] },
    { label: "Chargers / Power", triggers: ["charger", "chargers", "charging", "gan", "power"], ids: ["P34", "P35", "P10"] },
    { label: "Hubs / Docks", triggers: ["hub", "hubs", "dock", "docks", "multiport"], ids: ["P09", "P48", "P49"] },
    { label: "Drawing Tablets & Stylus", triggers: ["tablet", "tablets", "stylus"], ids: ["P44", "P45", "P46"] },
    { label: "Audio / Microphones / Headsets", triggers: ["audio", "microphone", "mic", "headset", "headphone", "headphones"], ids: ["P36", "P52", "P53"] },
    { label: "Webcams / Cameras", triggers: ["webcam", "webcams", "camera", "cameras"], ids: ["P37", "P38"] },
    { label: "Backpacks & Sleeves", triggers: ["backpack", "backpacks", "bag", "bags", "sleeve"], ids: ["P14", "P15", "P16"] },
    { label: "Mugs & Drinkware", triggers: ["mug", "mugs", "tumbler", "bottle", "bottles"], ids: ["P04", "P05", "P06", "P11", "P12"] },
    { label: "Apparel / T-Shirts", triggers: ["tshirt", "t-shirt", "shirt", "apparel", "hoodie"], ids: ["P01", "P02", "P03"] }
  ];
  for (const cat of categoryKeywords) {
    if (cat.triggers.some((t) => lowerMsg.includes(t))) {
      const matched = cat.ids.map((id) => CATALOGUE_PRODUCTS_METADATA.find((p) => p.id === id)).filter(Boolean);
      const topProd = matched.find((p) => p.stock > 0) || matched[0];
      const lines = matched.map((p) => `* **[${p.id}] ${p.name}** \u2014 \u20B9${p.price.toLocaleString("en-IN")} (${p.stock > 0 ? `${p.stock} in stock` : "Out of Stock"}) \u2014 ${p.desc}`);
      const subtotal = topProd ? topProd.price : 1299;
      const netShipping = subtotal >= 5e4 ? 0 : 499;
      const taxAmount = Math.round((subtotal + netShipping) * 0.18 * 100) / 100;
      const totalLandedPrice = Math.round((subtotal + netShipping + taxAmount) * 100) / 100;
      return {
        reply: `Here are our top **${cat.label.toUpperCase()}** options in the catalogue:

` + lines.join("\n") + `

I have pre-configured **[${topProd.id}] ${topProd.name}** below so you can order directly with 1 click or click **+ Cart** to add it to your bundle!`,
        action: {
          type: "order_items",
          title: `Order: ${topProd.name} (${topProd.id})`,
          items: [{ id: topProd.id, name: topProd.name, price: topProd.price, quantity: 1 }],
          subtotal,
          netShipping,
          taxAmount,
          total: totalLandedPrice,
          reason: `1-Click Direct Order for ${cat.label}`
        },
        model: "heuristic-website-trainer"
      };
    }
  }
  return {
    reply: `Hello! I am **Sahay AI (\u0938\u0939\u093E\u092F AI)**, your shopping consultant fully trained on the **Budget-Based Product Bundle Builder** platform!

Here is what you can ask me to do:

1. **Order Any Product Directly**: Tell me what you'd like to buy (e.g. *"Order P26 Ergonomic Vertical Mouse"* or *"Buy RGB Mechanical Keyboard and 100W GaN Charger"*), and I'll compute the landed cost and generate an instant 1-click order card!
2. **Browse & Compare**: Explore all 40 products (\`P01\` to \`P40\`) across 15 categories.
3. **Manage Bundle Cart & Checkout**: Add items, inspect budget headroom, or say *"Checkout my cart"* to complete purchase.

What would you like to order or explore today?`,
    action: {
      type: "navigate",
      tab: "catalogue",
      reason: "Explore 40-item Product Catalogue"
    },
    model: "heuristic-website-trainer"
  };
}

// src/data/fixture.json
var fixture_default = {
  case_id: "C07",
  synthetic: true,
  data_version: "v3.2",
  currency: "INR unless explicitly stated",
  missing_values: "null means unknown, never zero",
  records: {
    products: [
      {
        product_id: "P01",
        title: "Blue Tshirt",
        category: "Tshirt",
        size: "M",
        colour: "Blue",
        price_inr: 500,
        unit_cost_inr: 300,
        stock: 0,
        compatible_with: [],
        image: "../assets/P01.png"
      },
      {
        product_id: "P02",
        title: "Blue Tshirt",
        category: "Tshirt",
        size: "M",
        colour: "Blue",
        price_inr: 550,
        unit_cost_inr: 330,
        stock: 10,
        compatible_with: [],
        image: "../assets/P02.png"
      },
      {
        product_id: "P03",
        title: "Red Tshirt",
        category: "Tshirt",
        size: "M",
        colour: "Red",
        price_inr: 450,
        unit_cost_inr: 270,
        stock: 5,
        compatible_with: [],
        image: "../assets/P03.png"
      },
      {
        product_id: "P04",
        title: "Blue Tshirt",
        category: "Tshirt",
        size: "L",
        colour: "Blue",
        price_inr: 500,
        unit_cost_inr: 300,
        stock: 7,
        compatible_with: [],
        image: "../assets/P04.png"
      },
      {
        product_id: "P05",
        title: "Blue Mug",
        category: "Mug",
        size: "One",
        colour: "Blue",
        price_inr: 250,
        unit_cost_inr: 150,
        stock: 15,
        compatible_with: [],
        image: "../assets/P05.png"
      },
      {
        product_id: "P06",
        title: "Red Mug",
        category: "Mug",
        size: "One",
        colour: "Red",
        price_inr: 300,
        unit_cost_inr: 180,
        stock: 0,
        compatible_with: [],
        image: "../assets/P06.png"
      },
      {
        product_id: "P07",
        title: "Black Mouse",
        category: "Mouse",
        size: "One",
        colour: "Black",
        price_inr: 700,
        unit_cost_inr: 420,
        stock: 20,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P07.png"
      },
      {
        product_id: "P08",
        title: "Black Keyboard",
        category: "Keyboard",
        size: "One",
        colour: "Black",
        price_inr: 1200,
        unit_cost_inr: 720,
        stock: 5,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P08.png"
      },
      {
        product_id: "P09",
        title: "Grey Hub",
        category: "Hub",
        size: "One",
        colour: "Grey",
        price_inr: 900,
        unit_cost_inr: 540,
        stock: 8,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P09.png"
      },
      {
        product_id: "P10",
        title: "Green Bottle",
        category: "Bottle",
        size: "One",
        colour: "Green",
        price_inr: 450,
        unit_cost_inr: 270,
        stock: 12,
        compatible_with: [],
        image: "../assets/P10.png"
      },
      {
        product_id: "P11",
        title: "Blue Notebook",
        category: "Notebook",
        size: "One",
        colour: "Blue",
        price_inr: 200,
        unit_cost_inr: 120,
        stock: 30,
        compatible_with: [],
        image: "../assets/P11.png"
      },
      {
        product_id: "P13",
        title: "Black Hardcover Notebook",
        category: "Notebook",
        size: "A5",
        colour: "Black",
        price_inr: 250,
        unit_cost_inr: 150,
        stock: 25,
        compatible_with: [],
        image: "../assets/P13.png"
      },
      {
        product_id: "P14",
        title: "Leather Bound Journal Notebook",
        category: "Notebook",
        size: "Executive",
        colour: "Brown",
        price_inr: 350,
        unit_cost_inr: 210,
        stock: 18,
        compatible_with: [],
        image: "../assets/P14.png"
      },
      {
        product_id: "P15",
        title: "Spiral Grid Notebook",
        category: "Notebook",
        size: "A5",
        colour: "Green",
        price_inr: 220,
        unit_cost_inr: 130,
        stock: 40,
        compatible_with: [],
        image: "../assets/P15.png"
      },
      {
        product_id: "P16",
        title: "Pocket Ruled Notebook",
        category: "Notebook",
        size: "Pocket",
        colour: "Red",
        price_inr: 180,
        unit_cost_inr: 100,
        stock: 50,
        compatible_with: [],
        image: "../assets/P16.png"
      },
      {
        product_id: "P12",
        title: "Grey Backpack",
        category: "Backpack",
        size: "One",
        colour: "Grey",
        price_inr: 1500,
        unit_cost_inr: 900,
        stock: 3,
        compatible_with: [],
        image: "../assets/P12.png"
      },
      {
        product_id: "P19",
        title: "Black Slim Laptop Backpack",
        category: "Backpack",
        size: "15.6in",
        colour: "Black",
        price_inr: 1650,
        unit_cost_inr: 990,
        stock: 8,
        compatible_with: [],
        image: "../assets/P19.png"
      },
      {
        product_id: "P20",
        title: "Canvas Commuter Backpack",
        category: "Backpack",
        size: "One",
        colour: "Khaki",
        price_inr: 1350,
        unit_cost_inr: 800,
        stock: 14,
        compatible_with: [],
        image: "../assets/P20.png"
      },
      {
        product_id: "P17",
        title: "Stainless Steel Bottle",
        category: "Bottle",
        size: "750ml",
        colour: "Silver",
        price_inr: 550,
        unit_cost_inr: 320,
        stock: 15,
        compatible_with: [],
        image: "../assets/P17.png"
      },
      {
        product_id: "P18",
        title: "Matte Black Sports Bottle",
        category: "Bottle",
        size: "600ml",
        colour: "Black",
        price_inr: 420,
        unit_cost_inr: 250,
        stock: 22,
        compatible_with: [],
        image: "../assets/P18.png"
      },
      {
        product_id: "P21",
        title: "White Ceramic Coffee Mug",
        category: "Mug",
        size: "350ml",
        colour: "White",
        price_inr: 280,
        unit_cost_inr: 160,
        stock: 25,
        compatible_with: [],
        image: "../assets/P21.png"
      },
      {
        product_id: "P22",
        title: "Matte Black Travel Tumbler",
        category: "Mug",
        size: "450ml",
        colour: "Black",
        price_inr: 390,
        unit_cost_inr: 220,
        stock: 18,
        compatible_with: [],
        image: "../assets/P22.png"
      },
      {
        product_id: "P23",
        title: "Ergonomic Wireless Mouse",
        category: "Mouse",
        size: "Medium",
        colour: "White",
        price_inr: 890,
        unit_cost_inr: 500,
        stock: 12,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P23.png"
      },
      {
        product_id: "P24",
        title: "Compact Mechanical Keyboard",
        category: "Keyboard",
        size: "Tenkeyless",
        colour: "Grey",
        price_inr: 1450,
        unit_cost_inr: 850,
        stock: 8,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P24.png"
      },
      {
        product_id: "P25",
        title: "Multi-Port Aluminum Type-C Hub",
        category: "Hub",
        size: "7-in-1",
        colour: "Silver",
        price_inr: 1150,
        unit_cost_inr: 680,
        stock: 15,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P25.png"
      },
      {
        product_id: "P26",
        title: "Ergonomic Wireless Vertical Mouse",
        category: "Mouse",
        size: "One",
        colour: "Black",
        price_inr: 1450,
        unit_cost_inr: 870,
        stock: 18,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P26.png"
      },
      {
        product_id: "P27",
        title: "RGB Mechanical Gaming Keyboard",
        category: "Keyboard",
        size: "Full Size",
        colour: "Black",
        price_inr: 2400,
        unit_cost_inr: 1440,
        stock: 12,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P27.png"
      },
      {
        product_id: "P28",
        title: "Compact 60% Wireless Keyboard",
        category: "Keyboard",
        size: "Compact",
        colour: "White",
        price_inr: 1850,
        unit_cost_inr: 1100,
        stock: 10,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P28.png"
      },
      {
        product_id: "P29",
        title: "Silent Precision Bluetooth Mouse",
        category: "Mouse",
        size: "One",
        colour: "White",
        price_inr: 950,
        unit_cost_inr: 570,
        stock: 24,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P29.png"
      },
      {
        product_id: "P30",
        title: "Aluminum Laptop Riser Stand",
        category: "Stand",
        size: "Adjustable",
        colour: "Silver",
        price_inr: 1299,
        unit_cost_inr: 750,
        stock: 20,
        compatible_with: [],
        image: "../assets/P30.png"
      },
      {
        product_id: "P31",
        title: "Dual Monitor Arm Desk Mount",
        category: "Stand",
        size: "Dual 32in",
        colour: "Black",
        price_inr: 2800,
        unit_cost_inr: 1650,
        stock: 8,
        compatible_with: [],
        image: "../assets/P31.png"
      },
      {
        product_id: "P32",
        title: "Desk Pad Vegan Leather Blotter",
        category: "DeskMat",
        size: "90x40cm",
        colour: "Dark Green",
        price_inr: 650,
        unit_cost_inr: 380,
        stock: 35,
        compatible_with: [],
        image: "../assets/P32.png"
      },
      {
        product_id: "P33",
        title: "Magnetic Cable Management Organizer",
        category: "Organizer",
        size: "5-Pack",
        colour: "Black",
        price_inr: 399,
        unit_cost_inr: 200,
        stock: 45,
        compatible_with: [],
        image: "../assets/P33.png"
      },
      {
        product_id: "P34",
        title: "USB-C 100W GaN Fast Charger",
        category: "Charger",
        size: "Compact",
        colour: "White",
        price_inr: 1899,
        unit_cost_inr: 1100,
        stock: 22,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P34.png"
      },
      {
        product_id: "P35",
        title: "Active Noise Cancelling Wireless Headphones",
        category: "Audio",
        size: "Over-Ear",
        colour: "Midnight Black",
        price_inr: 4999,
        unit_cost_inr: 2900,
        stock: 9,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P35.png"
      },
      {
        product_id: "P36",
        title: "USB-C Studio Condenser Microphone",
        category: "Audio",
        size: "Desktop",
        colour: "Black",
        price_inr: 3200,
        unit_cost_inr: 1850,
        stock: 14,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P36.png"
      },
      {
        product_id: "P37",
        title: "4K Ultra HD Streaming Webcam",
        category: "Webcam",
        size: "Compact",
        colour: "Black",
        price_inr: 3600,
        unit_cost_inr: 2100,
        stock: 11,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P37.png"
      },
      {
        product_id: "P38",
        title: "ScreenBar Desk Light with Auto-Dimming",
        category: "Lighting",
        size: "45cm",
        colour: "Space Grey",
        price_inr: 2150,
        unit_cost_inr: 1250,
        stock: 16,
        compatible_with: [
          "usb-c"
        ],
        image: "../assets/P38.png"
      },
      {
        product_id: "P39",
        title: "Insulated Ceramic Travel Mug",
        category: "Mug",
        size: "350ml",
        colour: "Matte Black",
        price_inr: 550,
        unit_cost_inr: 320,
        stock: 28,
        compatible_with: [],
        image: "../assets/P39.png"
      },
      {
        product_id: "P40",
        title: "HydroTech Thermal Vacuum Flask",
        category: "Bottle",
        size: "1000ml",
        colour: "Ocean Blue",
        price_inr: 750,
        unit_cost_inr: 420,
        stock: 19,
        compatible_with: [],
        image: "../assets/P40.png"
      },
      {
        product_id: "P41",
        title: '27" 4K UHD Designer Color-Accurate Monitor',
        category: "Monitor",
        size: "27-inch",
        colour: "Space Grey",
        price_inr: 28500,
        unit_cost_inr: 18e3,
        stock: 15,
        compatible_with: ["usb-c", "hdmi", "dp"],
        image: "../assets/P41.png"
      },
      {
        product_id: "P42",
        title: '34" Curved WQHD Ultrawide Productivity Monitor',
        category: "Monitor",
        size: "34-inch",
        colour: "Matte Black",
        price_inr: 36e3,
        unit_cost_inr: 24e3,
        stock: 12,
        compatible_with: ["usb-c", "hdmi", "dp"],
        image: "../assets/P42.png"
      },
      {
        product_id: "P43",
        title: '15.6" Portable USB-C FHD Second Screen Monitor',
        category: "Monitor",
        size: "15.6-inch",
        colour: "Carbon Black",
        price_inr: 12999,
        unit_cost_inr: 8500,
        stock: 18,
        compatible_with: ["usb-c"],
        image: "../assets/P43.png"
      },
      {
        product_id: "P44",
        title: "Professional Graphic Drawing Tablet with 8192-Level Pressure Stylus",
        category: "Tablet",
        size: "10x6-inch",
        colour: "Midnight Black",
        price_inr: 6499,
        unit_cost_inr: 4200,
        stock: 22,
        compatible_with: ["usb-c"],
        image: "../assets/P44.png"
      },
      {
        product_id: "P45",
        title: "Active Digital Precision Stylus Pen with Palm Rejection",
        category: "Stylus",
        size: "Standard",
        colour: "White",
        price_inr: 2200,
        unit_cost_inr: 1300,
        stock: 35,
        compatible_with: ["usb-c"],
        image: "../assets/P45.png"
      },
      {
        product_id: "P46",
        title: "Multi-Angle Aluminum Tablet & iPad Stand",
        category: "Stand",
        size: "Universal",
        colour: "Silver",
        price_inr: 1150,
        unit_cost_inr: 650,
        stock: 28,
        compatible_with: [],
        image: "../assets/P46.png"
      },
      {
        product_id: "P47",
        title: "Wireless Ergonomic Numeric Keypad",
        category: "Keypad",
        size: "Compact",
        colour: "Space Grey",
        price_inr: 1250,
        unit_cost_inr: 720,
        stock: 30,
        compatible_with: ["usb-c"],
        image: "../assets/P47.png"
      },
      {
        product_id: "P48",
        title: "Thunderbolt 4 / USB-C 12-in-1 Triple Display Docking Station",
        category: "Dock",
        size: "Desktop",
        colour: "Space Grey",
        price_inr: 14500,
        unit_cost_inr: 9200,
        stock: 14,
        compatible_with: ["usb-c"],
        image: "../assets/P48.png"
      },
      {
        product_id: "P49",
        title: "High-Speed USB-C Multi-Card Reader & Hub (SD/microSD/CFast)",
        category: "CardReader",
        size: "Pocket",
        colour: "Silver",
        price_inr: 1450,
        unit_cost_inr: 850,
        stock: 40,
        compatible_with: ["usb-c"],
        image: "../assets/P49.png"
      },
      {
        product_id: "P50",
        title: "1TB Rugged NVMe External Portable SSD (1050MB/s)",
        category: "Storage",
        size: "1TB",
        colour: "Slate Blue",
        price_inr: 7800,
        unit_cost_inr: 5100,
        stock: 25,
        compatible_with: ["usb-c"],
        image: "../assets/P50.png"
      },
      {
        product_id: "P51",
        title: "Professional Display Color Calibrator Tool",
        category: "Colorimeter",
        size: "Compact",
        colour: "Black",
        price_inr: 9999,
        unit_cost_inr: 6500,
        stock: 10,
        compatible_with: ["usb-c"],
        image: "../assets/P51.png"
      },
      {
        product_id: "P52",
        title: "Pro Wireless Conference Headset with Noise-Cancelling Boom Mic",
        category: "Headset",
        size: "Adjustable",
        colour: "Matte Black",
        price_inr: 3499,
        unit_cost_inr: 2100,
        stock: 24,
        compatible_with: ["usb-c"],
        image: "../assets/P52.png"
      },
      {
        product_id: "P53",
        title: "Studio Acoustic Isolation Desk Microphone Shield",
        category: "Audio",
        size: "Desktop",
        colour: "Black Foam",
        price_inr: 1850,
        unit_cost_inr: 1050,
        stock: 16,
        compatible_with: [],
        image: "../assets/P53.png"
      },
      {
        product_id: "P54",
        title: "3Dconnexion SpaceNavigator 3D CAD Navigation Mouse",
        category: "3DMouse",
        size: "Weighted",
        colour: "Brushed Steel",
        price_inr: 8900,
        unit_cost_inr: 5800,
        stock: 11,
        compatible_with: ["usb-c"],
        image: "../assets/P54.png"
      },
      {
        product_id: "P55",
        title: "Aluminum Laptop Cooling Pad with Dual Silent Fans",
        category: "CoolingStand",
        size: "Up to 17-inch",
        colour: "Silver",
        price_inr: 1650,
        unit_cost_inr: 950,
        stock: 32,
        compatible_with: ["usb-c"],
        image: "../assets/P55.png"
      },
      {
        product_id: "P56",
        title: "MagSafe Adjustable Desktop Phone & Tablet Stand",
        category: "PhoneStand",
        size: "Foldable",
        colour: "Space Grey",
        price_inr: 850,
        unit_cost_inr: 450,
        stock: 45,
        compatible_with: [],
        image: "../assets/P56.png"
      },
      {
        product_id: "P57",
        title: "10-inch Bi-Color LED Ring Light with Desktop Tripod",
        category: "Lighting",
        size: "10-inch",
        colour: "White/Warm",
        price_inr: 1599,
        unit_cost_inr: 890,
        stock: 27,
        compatible_with: ["usb-c"],
        image: "../assets/P57.png"
      },
      {
        product_id: "P58",
        title: "4K Overhead USB Document Camera & Visualiser",
        category: "DocCamera",
        size: "Articulating",
        colour: "Matte Black",
        price_inr: 4800,
        unit_cost_inr: 3100,
        stock: 15,
        compatible_with: ["usb-c"],
        image: "../assets/P58.png"
      },
      {
        product_id: "P59",
        title: "Multi-Tier Desktop Document Organiser & Filing Tray",
        category: "Organizer",
        size: "3-Tier",
        colour: "Mesh Black",
        price_inr: 899,
        unit_cost_inr: 480,
        stock: 38,
        compatible_with: [],
        image: "../assets/P59.png"
      },
      {
        product_id: "P60",
        title: "Wireless Thermal Shipping Label Printer & Barcode Scanner Kit",
        category: "Printer",
        size: "Commercial",
        colour: "White",
        price_inr: 6200,
        unit_cost_inr: 3900,
        stock: 20,
        compatible_with: ["usb-c"],
        image: "../assets/P60.png"
      },
      {
        product_id: "P61",
        title: 'Enterprise Fleet 14" Business Ultrabook (i5/16GB/512GB)',
        category: "Laptop",
        size: "14-inch",
        colour: "Space Grey",
        price_inr: 54999,
        unit_cost_inr: 38e3,
        stock: 45,
        compatible_with: ["usb-c", "hdmi", "thunderbolt"],
        image: "../assets/P61.png"
      },
      {
        product_id: "P62",
        title: 'Developer Pro 16" High-Performance Workstation Laptop (i7/32GB/1TB)',
        category: "Laptop",
        size: "16-inch",
        colour: "Matte Black",
        price_inr: 89999,
        unit_cost_inr: 64e3,
        stock: 30,
        compatible_with: ["usb-c", "hdmi", "thunderbolt"],
        image: "../assets/P62.png"
      },
      {
        product_id: "P63",
        title: 'Executive Carbon 13.3" Ultra-Slim Touchscreen Laptop (Ultra 7/16GB/512GB OLED)',
        category: "Laptop",
        size: "13.3-inch",
        colour: "Carbon Black",
        price_inr: 104999,
        unit_cost_inr: 76e3,
        stock: 25,
        compatible_with: ["usb-c", "thunderbolt"],
        image: "../assets/P63.png"
      },
      {
        product_id: "P64",
        title: 'Entry Corporate Staff 15.6" Office Productivity Laptop (i3/16GB/512GB)',
        category: "Laptop",
        size: "15.6-inch",
        colour: "Silver",
        price_inr: 42999,
        unit_cost_inr: 3e4,
        stock: 50,
        compatible_with: ["usb-c", "hdmi"],
        image: "../assets/P64.png"
      },
      {
        product_id: "P65",
        title: 'Creative Studio 16" RTX Workstation Laptop (i9/64GB/2TB/RTX 4070 4K)',
        category: "Laptop",
        size: "16-inch",
        colour: "Midnight Blue",
        price_inr: 149999,
        unit_cost_inr: 108e3,
        stock: 18,
        compatible_with: ["usb-c", "hdmi", "thunderbolt"],
        image: "../assets/P65.png"
      },
      {
        product_id: "P66",
        title: 'Finance & Enterprise Secure 14" Rugged vPro Laptop (i7 vPro/32GB/1TB TPM 2.0)',
        category: "Laptop",
        size: "14-inch",
        colour: "Gunmetal Grey",
        price_inr: 78999,
        unit_cost_inr: 56e3,
        stock: 35,
        compatible_with: ["usb-c", "hdmi", "thunderbolt"],
        image: "../assets/P66.png"
      },
      {
        product_id: "P67",
        title: "Corporate Silent Multi-Device Wireless Mouse (Bluetooth + 2.4G)",
        category: "Mouse",
        size: "Ergonomic",
        colour: "Matte Black",
        price_inr: 1299,
        unit_cost_inr: 750,
        stock: 60,
        compatible_with: ["usb-c"],
        image: "../assets/P67.png"
      },
      {
        product_id: "P68",
        title: "Enterprise Low-Profile Quiet Office Keyboard with Numeric Keypad",
        category: "Keyboard",
        size: "Full Size",
        colour: "Space Grey",
        price_inr: 1799,
        unit_cost_inr: 1050,
        stock: 55,
        compatible_with: ["usb-c"],
        image: "../assets/P68.png"
      },
      {
        product_id: "P69",
        title: "Professional Ergonomic Split Wave Wireless Keyboard & Cushioned Palm Rest",
        category: "Keyboard",
        size: "Ergonomic",
        colour: "Graphite",
        price_inr: 3499,
        unit_cost_inr: 2100,
        stock: 40,
        compatible_with: ["usb-c"],
        image: "../assets/P69.png"
      },
      {
        product_id: "P70",
        title: "Vertical Ergonomic Precision Laser Mouse with Thumb Rest",
        category: "Mouse",
        size: "Vertical",
        colour: "Graphite",
        price_inr: 2299,
        unit_cost_inr: 1350,
        stock: 48,
        compatible_with: ["usb-c"],
        image: "../assets/P70.png"
      },
      {
        product_id: "P71",
        title: "100W GaN Triple-Port USB-C Corporate Fast Power Adapter",
        category: "Charger",
        size: "Compact",
        colour: "White",
        price_inr: 2499,
        unit_cost_inr: 1400,
        stock: 50,
        compatible_with: ["usb-c"],
        image: "../assets/P71.png"
      },
      {
        product_id: "P72",
        title: 'Magnetic Anti-Glare & Privacy Screen Filter (14" & 15.6")',
        category: "Stand",
        size: "Universal",
        colour: "Matte Privacy",
        price_inr: 1499,
        unit_cost_inr: 800,
        stock: 70,
        compatible_with: [],
        image: "../assets/P72.png"
      },
      {
        product_id: "P73",
        title: "Executive Leatherette Corporate Laptop Briefcase & Tech Folio",
        category: "Backpack",
        size: "15.6in",
        colour: "Brown",
        price_inr: 2799,
        unit_cost_inr: 1600,
        stock: 35,
        compatible_with: [],
        image: "../assets/P73.png"
      },
      {
        product_id: "P74",
        title: "2K QHD 60FPS Enterprise AI Auto-Framing Conference Webcam",
        category: "Webcam",
        size: "Compact",
        colour: "Black",
        price_inr: 3999,
        unit_cost_inr: 2400,
        stock: 40,
        compatible_with: ["usb-c"],
        image: "../assets/P74.png"
      },
      {
        product_id: "P75",
        title: 'Dual-Arm Gas Spring Heavy-Duty Desk Monitor Stand (Dual up to 32")',
        category: "Stand",
        size: "Dual 32in",
        colour: "Matte Black",
        price_inr: 4500,
        unit_cost_inr: 2800,
        stock: 25,
        compatible_with: [],
        image: "../assets/P75.png"
      },
      {
        product_id: "P76",
        title: "Smart Electric Rapid-Boil Kettle (1.7L Stainless Steel)",
        category: "Home Appliance",
        size: "1.7L",
        colour: "Silver",
        price_inr: 2199,
        unit_cost_inr: 1350,
        stock: 40,
        compatible_with: ["power-outlet", "ac-220v"],
        image: "../assets/P76.png"
      },
      {
        product_id: "P77",
        title: "15-Bar Compact Espresso & Cappuccino Coffee Machine",
        category: "Home Appliance",
        size: "Compact",
        colour: "Matte Black",
        price_inr: 6499,
        unit_cost_inr: 4200,
        stock: 25,
        compatible_with: ["power-outlet", "ac-220v"],
        image: "../assets/P77.png"
      },
      {
        product_id: "P78",
        title: "Smart HEPA Air Purifier with Real-Time Air Quality Display",
        category: "Home Appliance",
        size: "Medium Room",
        colour: "White",
        price_inr: 7999,
        unit_cost_inr: 5100,
        stock: 30,
        compatible_with: ["power-outlet", "ac-220v", "wifi-app"],
        image: "../assets/P78.png"
      },
      {
        product_id: "P79",
        title: "High-Speed Nutrient Extractor Countertop Blender (1000W)",
        category: "Home Appliance",
        size: "1.2L",
        colour: "Stainless Grey",
        price_inr: 3499,
        unit_cost_inr: 2200,
        stock: 35,
        compatible_with: ["power-outlet", "ac-220v"],
        image: "../assets/P79.png"
      },
      {
        product_id: "P80",
        title: "Smart Robotic Vacuum & Mop Cleaner with Auto-Docking",
        category: "Home Appliance",
        size: "Slim",
        colour: "Piano Black",
        price_inr: 18999,
        unit_cost_inr: 12500,
        stock: 20,
        compatible_with: ["power-outlet", "wifi-app", "charging-dock"],
        image: "../assets/P80.png"
      },
      {
        product_id: "P81",
        title: "Digital 4-Slice Convection Pop-Up Toaster with Browning Control",
        category: "Home Appliance",
        size: "4-Slice",
        colour: "Brushed Steel",
        price_inr: 2799,
        unit_cost_inr: 1750,
        stock: 45,
        compatible_with: ["power-outlet", "ac-220v"],
        image: "../assets/P81.png"
      },
      {
        product_id: "P82",
        title: "Cordless Handheld Cyclonic Stick Vacuum Cleaner (22.2V)",
        category: "Home Appliance",
        size: "Lightweight",
        colour: "Cobalt Blue",
        price_inr: 8499,
        unit_cost_inr: 5400,
        stock: 28,
        compatible_with: ["charging-dock", "power-outlet"],
        image: "../assets/P82.png"
      }
    ],
    required_slots: [],
    budget_inr: 2200,
    shipping_inr: 100,
    compatible_port: "usb-c",
    expected_ids: [
      "P07",
      "P08"
    ],
    expected_total_inr: 2e3,
    reference_requests: [
      {
        id: "B1",
        required_slots: [
          "Mouse",
          "Keyboard"
        ],
        budget_inr: 1999,
        shipping_inr: 100,
        required_port: "usb-c",
        expected_ids: [],
        expected_total_inr: null
      },
      {
        id: "B2",
        required_slots: [
          "Mouse",
          "Keyboard"
        ],
        budget_inr: 2e3,
        shipping_inr: 100,
        required_port: "usb-c",
        expected_ids: [
          "P07",
          "P08"
        ],
        expected_total_inr: 2e3
      },
      {
        id: "B3",
        required_slots: [
          "Mouse",
          "Keyboard"
        ],
        budget_inr: 2100,
        shipping_inr: 100,
        required_port: "usb-c",
        expected_ids: [
          "P07",
          "P08"
        ],
        expected_total_inr: 2e3
      },
      {
        id: "B4",
        required_slots: [
          "Mouse",
          "Keyboard"
        ],
        budget_inr: 2200,
        shipping_inr: 100,
        required_port: "usb-c",
        expected_ids: [
          "P07",
          "P08"
        ],
        expected_total_inr: 2e3
      },
      {
        id: "B5",
        required_slots: [
          "Mouse",
          "Keyboard"
        ],
        budget_inr: 2500,
        shipping_inr: 100,
        required_port: "usb-c",
        expected_ids: [
          "P07",
          "P08"
        ],
        expected_total_inr: 2e3
      },
      {
        id: "B6",
        required_slots: [
          "Mouse",
          "Keyboard"
        ],
        budget_inr: 1e3,
        shipping_inr: 100,
        required_port: "usb-c",
        expected_ids: [],
        expected_total_inr: null
      },
      {
        id: "B7",
        required_slots: [
          "Mouse",
          "Keyboard"
        ],
        budget_inr: 1900,
        shipping_inr: 100,
        required_port: "usb-c",
        expected_ids: [],
        expected_total_inr: null
      },
      {
        id: "B8",
        required_slots: [
          "Mouse",
          "Keyboard"
        ],
        budget_inr: 2001,
        shipping_inr: 100,
        required_port: "usb-c",
        expected_ids: [
          "P07",
          "P08"
        ],
        expected_total_inr: 2e3
      },
      {
        id: "B9",
        required_slots: [
          "Mouse",
          "Keyboard"
        ],
        budget_inr: 3e3,
        shipping_inr: 100,
        required_port: "usb-c",
        expected_ids: [
          "P07",
          "P08"
        ],
        expected_total_inr: 2e3
      },
      {
        id: "B10",
        required_slots: [
          "Mouse",
          "Keyboard"
        ],
        budget_inr: 4e3,
        shipping_inr: 100,
        required_port: "usb-c",
        expected_ids: [
          "P07",
          "P08"
        ],
        expected_total_inr: 2e3
      }
    ]
  },
  public_checks: [
    "Every bundle fills all required slots and satisfies the supplied compatibility matrix.",
    "Total stays within budget on ten reference requests, including delivery charges where defined.",
    "Replacement either preserves validity or explains why no feasible bundle exists."
  ],
  limit: "Small teaching fixture for a bounded prototype. Market demand, willingness to pay and production performance remain unproven."
};

// src/data/defaultFixture.ts
function mapC07Fixture(raw = fixture_default) {
  const records = raw.records || {};
  const rawProducts = records.products || [];
  const rawRequests = records.reference_requests || [];
  const rawSlots = Array.isArray(records.required_slots) && records.required_slots.length > 0 ? records.required_slots : Array.isArray(rawRequests) && rawRequests[0]?.required_slots?.length > 0 ? rawRequests[0].required_slots : ["Mouse", "Keyboard"];
  const products = rawProducts.map((p) => {
    const isUsbC = Array.isArray(p.compatible_with) && p.compatible_with.includes("usb-c");
    const inStock = typeof p.stock === "number" ? p.stock > 0 : Boolean(p.inStock);
    const stockQty = typeof p.stock === "number" ? p.stock : p.stockQuantity ?? (inStock ? 10 : 0);
    const price = p.price_inr ?? p.price ?? 0;
    const unitCost = p.unit_cost_inr ?? p.unitCostInr ?? Math.round(price * 0.6);
    return {
      id: p.product_id || p.id,
      name: p.title || p.name,
      category: p.category,
      price,
      inStock,
      stockQuantity: stockQty,
      brand: p.category === "Mouse" || p.category === "Keyboard" || p.category === "Hub" ? "Peripherals" : p.category === "Laptop" ? "Enterprise Computing" : p.category === "Home Appliance" ? "Smart Home & Living" : p.category === "Tshirt" || p.category === "Backpack" ? "C07 Apparel" : "C07 Essentials",
      model: p.product_id || p.id,
      description: `${p.colour || ""} ${p.title || p.name}${p.size && p.size !== "One" ? " (Size: " + p.size + ")" : ""} \xB7 Unit Cost: \u20B9${unitCost}`,
      weightKg: p.category === "Laptop" ? 1.5 : p.category === "Monitor" ? 6.5 : p.category === "Home Appliance" ? 2.2 : p.category === "Stand" ? 2.5 : p.category === "Backpack" ? 1 : p.category === "Keyboard" ? 0.7 : p.category === "Mouse" ? 0.2 : 0.4,
      image: p.image,
      unitCostInr: unitCost,
      size: p.size,
      colour: p.colour,
      compatibleWith: p.compatible_with || [],
      attributes: {
        connector: isUsbC ? "usb-c" : void 0,
        size: p.size,
        colour: p.colour,
        unitCostInr: unitCost,
        image: p.image,
        compatibleWith: p.compatible_with || [],
        rawStock: p.stock
      },
      incompatibleProductIds: []
    };
  });
  const requiredSlots = rawSlots.map((slotName) => ({
    id: slotName,
    label: slotName,
    category: slotName,
    description: `Required ${slotName} peripheral compatible with ${records.compatible_port || "usb-c"}.`,
    priority: "required"
  }));
  const referenceRequests = rawRequests.map((req) => {
    const hasExpected = Array.isArray(req.expected_ids) && req.expected_ids.length > 0;
    return {
      id: req.id,
      title: `Reference Request ${req.id} (Budget: \u20B9${Number(req.budget_inr).toLocaleString("en-IN")})`,
      budget: req.budget_inr,
      activityId: "c07-bundle",
      requiredSlotIds: req.required_slots || (rawSlots.length > 0 ? rawSlots : ["Mouse", "Keyboard"]),
      description: `Target budget \u20B9${req.budget_inr} with shipping fee \u20B9${req.shipping_inr} and ${req.required_port || "usb-c"} port. Expected: ${hasExpected ? req.expected_ids.join(", ") : "None (Infeasible)"}.`,
      expectedFeasible: hasExpected,
      expectedLandedPriceMax: req.expected_total_inr ?? void 0,
      expectedIds: req.expected_ids || [],
      requiredPort: req.required_port || "usb-c",
      notes: `Expected Landed Total: ${req.expected_total_inr ? "\u20B9" + req.expected_total_inr : "Infeasible (Null)"}`
    };
  });
  return {
    version: raw.data_version ? `v${raw.data_version}-c07` : "3.2.0-c07",
    isSynthetic: true,
    activity: {
      id: raw.case_id || "C07",
      name: "C07 Product Bundle",
      description: "Budget-based product bundle builder satisfying compatibility matrix and required slot constraints.",
      defaultBudget: records.budget_inr || 2200,
      requiredSlots
    },
    products,
    shippingRule: {
      baseFee: records.shipping_inr ?? 100,
      freeShippingThreshold: 999999,
      // Flat shipping charge in C07 benchmark
      heavyItemSurchargePerItem: 0,
      heavyThresholdKg: 999
    },
    taxRule: {
      taxRate: 0,
      // Benchmark total 2000 = 700 (mouse) + 1200 (keyboard) + 100 (shipping)
      taxName: "Tax Included (0% extra)"
    },
    compatibilityRules: [
      {
        id: "c07_port_compatibility",
        name: "USB-C Peripheral Port Compatibility",
        categoryA: "Mouse",
        categoryB: "Keyboard",
        description: "Selected peripheral devices must support the specified USB-C connection standard.",
        validatorType: "explicit_id_block"
      }
    ],
    referenceRequests
  };
}
var C07_DEFAULT_FIXTURE = mapC07Fixture(fixture_default);

// src/utils/pricing.ts
function formatINR(amount) {
  if (isNaN(amount) || amount === null || amount === void 0) return "\u20B90";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

// src/utils/bundleRecommendations.ts
function getPredefinedBaselineBundles(products, shippingRule, taxRule, budget) {
  const byId = (id) => products.find((p) => p.id === id);
  const p02 = byId("P02");
  const p03 = byId("P03");
  const p04 = byId("P04");
  const p05 = byId("P05");
  const p07 = byId("P07");
  const p08 = byId("P08");
  const p09 = byId("P09");
  const p10 = byId("P10");
  const p11 = byId("P11");
  const p12 = byId("P12");
  const p13 = byId("P13");
  const p14 = byId("P14");
  const p15 = byId("P15");
  const p16 = byId("P16");
  const p17 = byId("P17");
  const p18 = byId("P18");
  const p19 = byId("P19");
  const p20 = byId("P20");
  const p21 = byId("P21");
  const p22 = byId("P22");
  const p23 = byId("P23");
  const p24 = byId("P24");
  const p25 = byId("P25");
  const p41 = byId("P41");
  const p42 = byId("P42");
  const p43 = byId("P43");
  const p44 = byId("P44");
  const p48 = byId("P48");
  const p50 = byId("P50");
  const p51 = byId("P51");
  const p52 = byId("P52");
  const p54 = byId("P54");
  const p55 = byId("P55");
  const p61 = byId("P61");
  const p62 = byId("P62");
  const p63 = byId("P63");
  const p64 = byId("P64");
  const p65 = byId("P65");
  const p66 = byId("P66");
  const p67 = byId("P67");
  const p68 = byId("P68");
  const p69 = byId("P69");
  const p70 = byId("P70");
  const p71 = byId("P71");
  const p72 = byId("P72");
  const p73 = byId("P73");
  const p74 = byId("P74");
  const p75 = byId("P75");
  const p76 = byId("P76");
  const p77 = byId("P77");
  const p78 = byId("P78");
  const p79 = byId("P79");
  const p80 = byId("P80");
  const p81 = byId("P81");
  const p82 = byId("P82");
  const rawConfigs = [
    {
      id: "home-app-1",
      name: "Home Appliances Morning Breakfast Duo",
      tagline: "Complete morning kitchen breakfast duo with rapid-boil 1.7L stainless kettle and 4-slice digital toaster",
      items: [
        { product: p76, quantity: 1 },
        { product: p81, quantity: 1 }
      ],
      matchExplanation: "Morning kitchen essentials pairing rapid-boil 1.7L electric kettle with 4-slice precision toaster for quick family breakfasts."
    },
    {
      id: "home-app-2",
      name: "Home Appliances Cafe & Barista Beverage Suite",
      tagline: "Premium home cafe experience pairing 15-bar espresso machine, precision rapid kettle, and ceramic mug",
      items: [
        { product: p77, quantity: 1 },
        { product: p76, quantity: 1 },
        { product: p21, quantity: 1 }
      ],
      matchExplanation: "Barista-grade home cafe station featuring 15-bar espresso & cappuccino maker, rapid boiling kettle, and ceramic coffee mug."
    },
    {
      id: "home-app-3",
      name: "Home Appliances Clean & Pure Living Automation Suite",
      tagline: "Autonomous home wellness set combining intelligent HEPA air purifier with smart auto-docking robotic vacuum",
      items: [
        { product: p78, quantity: 1 },
        { product: p80, quantity: 1 }
      ],
      matchExplanation: "Automated home wellness setup combining smart HEPA room air purifier with autonomous floor vacuum and mop robot."
    },
    {
      id: "home-app-4",
      name: "Home Appliances Kitchen Chef Quick Prep Duo",
      tagline: "Quick countertop kitchen prep duo featuring 1000W high-speed nutrient blender paired with durable ceramic mug",
      items: [
        { product: p79, quantity: 1 },
        { product: p05, quantity: 1 }
      ],
      matchExplanation: "Healthy living kitchen starter duo pairing a 1000W high-speed smoothie extractor blender with an everyday mug."
    },
    {
      id: "corp-set-1",
      name: "Corporate Laptop & Fast Charger Power Duo",
      tagline: 'High-mobility corporate package pairing 14" Business Ultrabook with 100W GaN fast power adapter',
      items: [
        { product: p61, quantity: 1 },
        { product: p71, quantity: 1 }
      ],
      matchExplanation: 'Corporate mobility set pairing high-performance 14" fleet ultrabook with triple-port 100W GaN fast charger.'
    },
    {
      id: "corp-set-2",
      name: "Corporate Mug & Power Adapter Essentials",
      tagline: "Everyday corporate desk ceramic mug combined with 100W GaN multi-port fast power adapter",
      items: [
        { product: p21, quantity: 1 },
        { product: p71, quantity: 1 }
      ],
      matchExplanation: "Everyday corporate desktop essential pairing premium desk drinkware with 100W multi-device fast power delivery."
    },
    {
      id: "corp-set-3",
      name: "Corporate Fleet Laptop, Mouse & Keyboard Suite",
      tagline: 'Standard corporate fleet onboarding suite with 14" ultrabook, silent wireless mouse, and low-profile keyboard',
      items: [
        { product: p61, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p68, quantity: 1 }
      ],
      matchExplanation: "Complete corporate IT onboarding workstation providing day-one business computing and silent desktop peripherals."
    },
    {
      id: "corp-set-4",
      name: "Corporate Desk Hydration & Power Essentials",
      tagline: "Budget-friendly corporate desk setup featuring beverage mug, hardcover journal, and 100W GaN charger",
      items: [
        { product: p05, quantity: 1 },
        { product: p71, quantity: 1 },
        { product: p13, quantity: 1 }
      ],
      matchExplanation: "Corporate office desktop bundle under \u20B93,500 budget with caffeine mug, executive notebook, and fast charging."
    },
    {
      id: "corp-set-5",
      name: "Corporate Executive Laptop, Charger & Briefcase Suite",
      tagline: "Executive mobility package combining 990g carbon ultrabook, 100W GaN charger, and luxury leatherette folio",
      items: [
        { product: p63, quantity: 1 },
        { product: p71, quantity: 1 },
        { product: p73, quantity: 1 }
      ],
      matchExplanation: "Turnkey C-level business travel suite with ultra-light carbon laptop, rapid charger, and carrying briefcase."
    },
    {
      id: "base-1",
      name: "Core Desk Essentials",
      tagline: "Dual USB-C benchmark peripherals for clean, tactile desktop productivity",
      items: [
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 }
      ],
      matchExplanation: "Official C07 benchmark baseline setup featuring USB-C Black Mouse and Black Keyboard."
    },
    {
      id: "base-2",
      name: "Study & Hydration Duo",
      tagline: "Compact everyday desk pair with matching blue ceramic mug and lined notebook",
      items: [
        { product: p05, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: "Everyday budget study pairing with high-utility desk stationery and warm drinkware."
    },
    {
      id: "base-3",
      name: "Campus Commuter Kit",
      tagline: "Durable travel backpack equipped with eco hydration bottle and notebook",
      items: [
        { product: p12, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: "Mobility combo matching heavy-duty backpack with daily hydration and note-taking essentials."
    },
    {
      id: "base-4",
      name: "Full USB-C Productivity Trio",
      tagline: "Complete input and expansion suite with precision mouse, keyboard, and multiport hub",
      items: [
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 },
        { product: p09, quantity: 1 }
      ],
      matchExplanation: "Advanced 3-peripheral workstation setup fully certified for USB-C connectivity."
    },
    {
      id: "base-5",
      name: "Casual Red Studio Pack",
      tagline: "Comfortable red apparel combined with desktop beverage mug and creative journal",
      items: [
        { product: p03, quantity: 1 },
        { product: p05, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: "Creative workwear bundle combining breathable red tee with daily desktop accessories."
    },
    {
      id: "base-6",
      name: "Tech Minimalist Quad",
      tagline: "Balanced peripheral and daily hydration kit for organized workstations",
      items: [
        { product: p07, quantity: 1 },
        { product: p09, quantity: 1 },
        { product: p05, quantity: 1 },
        { product: p10, quantity: 1 }
      ],
      matchExplanation: "4-item hybrid bundle balancing USB-C peripherals, desk beverage, and eco hydration."
    },
    {
      id: "base-7",
      name: "Developer Blue Studio Trio",
      tagline: "Color-coordinated blue aesthetic featuring comfortable tee, desktop mouse, and mug",
      items: [
        { product: p02, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p05, quantity: 1 }
      ],
      matchExplanation: "Color-matched blue aesthetic combining daily apparel, input device, and ceramic mug."
    },
    {
      id: "base-8",
      name: "Active Professional Five",
      tagline: "Broad 5-piece kit spanning apparel, hydration, notes, drinkware, and transit backpack",
      items: [
        { product: p04, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 },
        { product: p05, quantity: 1 },
        { product: p12, quantity: 1 }
      ],
      matchExplanation: "Comprehensive 5-item lifestyle package with L-size apparel, hydration, notes, and carry backpack."
    },
    {
      id: "base-9",
      name: "Executive Power Workstation",
      tagline: "Heavy-duty 5-piece setup featuring dual USB-C peripherals, multiport hub, bottle, and notebook",
      items: [
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 },
        { product: p09, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: "Premium 5-piece professional workstation package with complete peripheral connectivity and notes."
    },
    {
      id: "base-10",
      name: "Ultimate C07 All-Rounder Suite",
      tagline: "Flagship 6-item complete package across apparel, tech peripherals, hydration, and carry gear",
      items: [
        { product: p02, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 },
        { product: p05, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p12, quantity: 1 }
      ],
      matchExplanation: "The ultimate 6-category ensemble showcasing the maximum variety of active in-stock fixture products."
    },
    {
      id: "base-11",
      name: "Hydration & Note-Taking Minimalist",
      tagline: "Ultra-compact eco wellness duo pairing reusable green bottle with lined blue notebook",
      items: [
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: "Clean dual-item wellness and desk companion pairing for daily note-taking and hydration."
    },
    {
      id: "base-12",
      name: "Creative Writer's Desk Trio",
      tagline: "Balanced desk companion set featuring ceramic tea mug, green bottle, and ideas journal",
      items: [
        { product: p05, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: "Non-electronic desktop combo providing complete hydration, caffeine, and note-taking."
    },
    {
      id: "base-13",
      name: "Urban Digital Nomad Pack",
      tagline: "Mobile power tech kit combining rugged backpack with precision mouse and multiport expansion hub",
      items: [
        { product: p12, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p09, quantity: 1 }
      ],
      matchExplanation: "High-mobility connectivity pack for working on the go from cafes and co-working spaces."
    },
    {
      id: "base-14",
      name: "Casual Red Gamer Starter Kit",
      tagline: "Comfortable red apparel matched with core USB-C gaming peripherals and beverage mug",
      items: [
        { product: p03, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 },
        { product: p05, quantity: 1 }
      ],
      matchExplanation: "Enthusiast starter set pairing dual input peripherals with breathable red cotton apparel and mug."
    },
    {
      id: "base-15",
      name: "Commuter Tech & Stationery Quad",
      tagline: "All-in-one travel setup with weather-resistant backpack, mouse, hydration, and notebook",
      items: [
        { product: p12, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: "Versatile 4-category transit package covering input, storage, hydration, and writing."
    },
    {
      id: "base-16",
      name: "Modern Blue Apparel & Peripherals Quad",
      tagline: "Unified blue-accented workstation pack with cotton tee, dual peripherals, and notebook",
      items: [
        { product: p02, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: "Professional 4-item desktop and apparel combination featuring tactile inputs and stationery."
    },
    {
      id: "base-17",
      name: "Compact Expansion & Lifestyle Trio",
      tagline: "Comfort-fit L-size tee with high-speed multiport hub and morning ceramic mug",
      items: [
        { product: p04, quantity: 1 },
        { product: p09, quantity: 1 },
        { product: p05, quantity: 1 }
      ],
      matchExplanation: "Affordable 3-piece setup combining connectivity hardware with lifestyle essentials."
    },
    {
      id: "base-18",
      name: "Road Warrior Full Commute Suite",
      tagline: "Complete travel ensemble with backpack, hub, change of apparel, bottle, and journal",
      items: [
        { product: p12, quantity: 1 },
        { product: p09, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p03, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: "Comprehensive 5-piece nomad ensemble with multi-port connectivity and travel utility."
    },
    {
      id: "base-19",
      name: "Student All-Day Desk Essentials",
      tagline: "Pure non-electronic campus kit featuring apparel, dual hydration/drinkware, and notebook",
      items: [
        { product: p04, quantity: 1 },
        { product: p05, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: "Sub-\u20B91,500 4-item everyday student essentials bundle with zero tech complexity."
    },
    {
      id: "base-20",
      name: "Grand Master Productivity & Travel Suite",
      tagline: "The premier full-equipment workstation and commute powerhouse with all tech and carry gear",
      items: [
        { product: p12, quantity: 1 },
        { product: p08, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p09, quantity: 1 },
        { product: p10, quantity: 1 },
        { product: p11, quantity: 1 }
      ],
      matchExplanation: "Flagship 6-item heavy productivity bundle covering the entire peripheral suite, transit, and desk accessories."
    },
    {
      id: "base-21",
      name: "Mechanical Pro Wireless Workstation",
      tagline: "Precision wireless ergonomic input pair with multi-port aluminum expansion hub",
      items: [
        { product: p23, quantity: 1 },
        { product: p24, quantity: 1 },
        { product: p25, quantity: 1 }
      ],
      matchExplanation: "Next-gen wireless productivity setup with ergonomic clicker, compact mechanical keyboard, and Type-C hub."
    },
    {
      id: "base-22",
      name: "Executive Leather & Steel Hydration Duo",
      tagline: "Refined workspace set with leather-bound notebook and insulated stainless steel bottle",
      items: [
        { product: p14, quantity: 1 },
        { product: p17, quantity: 1 },
        { product: p21, quantity: 1 }
      ],
      matchExplanation: "Executive desk companion bundle matching premium leather notebook with steel flask and ceramic mug."
    },
    {
      id: "base-23",
      name: "All-Black Stealth Commute Ensemble",
      tagline: "Sleek black urban setup with slim laptop pack, sports bottle, matte tumbler, and notebook",
      items: [
        { product: p19, quantity: 1 },
        { product: p18, quantity: 1 },
        { product: p22, quantity: 1 },
        { product: p13, quantity: 1 }
      ],
      matchExplanation: "Color-unified stealth black transit package with slim laptop bag, matte hydration gear, and hardcover notebook."
    },
    {
      id: "base-24",
      name: "Creative Studio Sketch & Apparel Trio",
      tagline: "Grid notebook pairing with blue cotton tee and minimalist white ceramic coffee mug",
      items: [
        { product: p15, quantity: 1 },
        { product: p16, quantity: 1 },
        { product: p02, quantity: 1 },
        { product: p21, quantity: 1 }
      ],
      matchExplanation: "Creative design ideation bundle with dual spiral and pocket sketchbooks, ceramic mug, and cotton tee."
    },
    {
      id: "base-25",
      name: "Canvas Commuter & Aluminum Tech Hub",
      tagline: "Durable canvas backpack equipped with aluminum Type-C dock and stainless steel bottle",
      items: [
        { product: p20, quantity: 1 },
        { product: p25, quantity: 1 },
        { product: p17, quantity: 1 },
        { product: p13, quantity: 1 }
      ],
      matchExplanation: "Robust everyday traveler kit featuring canvas commuter bag, multi-port aluminum hub, flask, and notebook."
    },
    {
      id: "base-corp-1",
      name: "Corporate Standard Fleet Onboarding Suite",
      tagline: 'Core enterprise IT deployment combining 14" Business Ultrabook with quiet tactile peripherals',
      items: [
        { product: p61, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p68, quantity: 1 }
      ],
      matchExplanation: "The corporate standard: complete fleet laptop with dedicated low-noise wireless mouse and full-sized office keyboard for day-one productivity."
    },
    {
      id: "base-corp-2",
      name: "Developer Pro Full-Stack Workstation",
      tagline: 'Heavy-duty developer suite with 16" high-performance workstation, mechanical typing, and expansion dock',
      items: [
        { product: p62, quantity: 1 },
        { product: p24, quantity: 1 },
        { product: p23, quantity: 1 },
        { product: p25, quantity: 1 }
      ],
      matchExplanation: "Engineered for software engineers and DevOps: fast i7/32GB laptop with mechanical feedback keyboard, precision wireless mouse, and multi-display hub."
    },
    {
      id: "base-corp-3",
      name: "Executive C-Suite Carbon Command Setup",
      tagline: "Ultra-premium executive mobility with 990g OLED ultrabook, posture-aligned peripherals, and leather folio",
      items: [
        { product: p63, quantity: 1 },
        { product: p70, quantity: 1 },
        { product: p69, quantity: 1 },
        { product: p73, quantity: 1 }
      ],
      matchExplanation: "Flagship executive deployment pairing featherlight OLED carbon touchscreen laptop with top-tier ergonomic wave inputs and luxury carrying case."
    },
    {
      id: "base-corp-4",
      name: "Corporate Budget Staff Productivity Trio",
      tagline: 'Cost-optimized corporate fleet pack featuring 15.6" FHD anti-glare laptop with USB-C peripherals',
      items: [
        { product: p64, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 }
      ],
      matchExplanation: 'High-value corporate procurement bundle equipping operational staff with a durable 15.6" business laptop, USB-C mouse, and keyboard under budget.'
    },
    {
      id: "base-corp-5",
      name: "Finance & Enterprise Secure Workstation",
      tagline: "Compliance-ready corporate station with hardware TPM 2.0 vPro laptop, privacy filter, and full accounting keyboard",
      items: [
        { product: p66, quantity: 1 },
        { product: p68, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p72, quantity: 1 }
      ],
      matchExplanation: "Designed for audit, finance, and banking operations: hardware-encrypted laptop with dedicated 10-key numeric pad keyboard, silent mouse, and confidentiality privacy screen."
    },
    {
      id: "base-corp-6",
      name: "Creative Director & CAD Workstation Suite",
      tagline: "Max-spec enterprise engineering and design powerhouse with i9 RTX laptop, 4K monitor, and articulated mount",
      items: [
        { product: p65, quantity: 1 },
        { product: p70, quantity: 1 },
        { product: p24, quantity: 1 },
        { product: p41, quantity: 1 },
        { product: p75, quantity: 1 }
      ],
      matchExplanation: "Complete creative production suite featuring discrete GPU laptop, color-accurate 4K external display, mechanical typing, and heavy-duty gas spring arm."
    },
    {
      id: "base-corp-7",
      name: "Hybrid Remote Worker Complete Suite",
      tagline: "All-in-one corporate remote setup with business laptop, video conference hardware, ergonomic stand, and peripherals",
      items: [
        { product: p61, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p68, quantity: 1 },
        { product: p74, quantity: 1 },
        { product: p52, quantity: 1 },
        { product: p55, quantity: 1 }
      ],
      matchExplanation: 'Zero-compromise home office package providing the employee with a 14" ultrabook, dual inputs, crystal-clear 2K webcam, noise-cancelling boom mic headset, and thermal cooling stand.'
    },
    {
      id: "base-corp-8",
      name: "Enterprise Dual-Screen Mobile Office",
      tagline: "Dual-display mobile powerhouse for traveling consultants and corporate leaders",
      items: [
        { product: p61, quantity: 1 },
        { product: p43, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p68, quantity: 1 }
      ],
      matchExplanation: 'Instantly doubles screen real estate anywhere: combines 14" ultrabook with a lightweight FHD USB-C secondary monitor and matched low-profile peripherals.'
    },
    {
      id: "base-corp-9",
      name: "Corporate Hot-Desking Mobility Pack",
      tagline: 'Agile hot-desking setup with 15.6" business laptop, ultra-compact GaN fast power, and protective transit pack',
      items: [
        { product: p64, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p71, quantity: 1 },
        { product: p19, quantity: 1 }
      ],
      matchExplanation: "Equips agile office staff to transition smoothly between desk pods and conference rooms with multi-device fast charging and slim carry gear."
    },
    {
      id: "base-corp-10",
      name: "Executive Presentations & Video Command Rig",
      tagline: "High-impact leadership conferencing setup with carbon OLED laptop, AI auto-framing webcam, and boom mic",
      items: [
        { product: p63, quantity: 1 },
        { product: p74, quantity: 1 },
        { product: p52, quantity: 1 },
        { product: p67, quantity: 1 }
      ],
      matchExplanation: "Optimized for board meetings and investor presentations: combines ultra-slim OLED laptop with AI auto-tracking 2K camera and broadcast-grade headset."
    },
    {
      id: "base-corp-11",
      name: "Cloud Architect & DevOps Power Command Rig",
      tagline: 'The ultimate 5-piece enterprise command center with 32GB RAM laptop, 34" curved display, and 12-port dock',
      items: [
        { product: p62, quantity: 1 },
        { product: p42, quantity: 1 },
        { product: p48, quantity: 1 },
        { product: p69, quantity: 1 },
        { product: p70, quantity: 1 }
      ],
      matchExplanation: "Maximum productivity configuration for senior engineers: drives panoramic code and terminal workspaces via single-cable Thunderbolt 4 docking."
    },
    {
      id: "base-corp-12",
      name: "Field Sales & Client Solutions Travel Kit",
      tagline: "Professional client-facing travel suite with sleek business ultrabook, luxury folio, and rapid charger",
      items: [
        { product: p61, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p73, quantity: 1 },
        { product: p71, quantity: 1 }
      ],
      matchExplanation: 'Tailored for client visits and business trips: lightweight 14" ultrabook with silent clicker, executive leatherette transit bag, and all-day fast power adapter.'
    },
    {
      id: "base-corp-13",
      name: "Corporate Call Center & Support Operations Station",
      tagline: "High-endurance customer operations suite with dedicated laptop, noise-cancelling boom headset, and quiet inputs",
      items: [
        { product: p64, quantity: 1 },
        { product: p68, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p52, quantity: 1 }
      ],
      matchExplanation: "Designed for intensive support and sales operations: durable laptop paired with noise-isolating boom mic headset and silent typing peripherals."
    },
    {
      id: "base-corp-14",
      name: "Modern Corporate Ergonomic Fleet Suite",
      tagline: "RSI-prevention corporate workspace featuring ergonomic wave keyboard, vertical laser mouse, and angled riser",
      items: [
        { product: p61, quantity: 1 },
        { product: p70, quantity: 1 },
        { product: p69, quantity: 1 },
        { product: p55, quantity: 1 }
      ],
      matchExplanation: "Approved for corporate ergonomic wellness programs: corrects wrist and neck posture with split cushioned keyboard, vertical thumb-rest mouse, and cooling riser."
    },
    {
      id: "base-corp-15",
      name: "Enterprise Data & Analytics Fast Station",
      tagline: "High-bandwidth data engineering kit with 1050MB/s NVMe storage, 32GB laptop, and multi-port connectivity",
      items: [
        { product: p62, quantity: 1 },
        { product: p50, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p68, quantity: 1 },
        { product: p25, quantity: 1 }
      ],
      matchExplanation: "Supports heavy ETL and machine learning workloads with ultra-fast portable storage, developer workstation laptop, and expanded peripheral ports."
    },
    {
      id: "base-corp-16",
      name: "Secure Banking & Legal Audit Station",
      tagline: "Protected corporate compliance setup with vPro hardware protection, screen privacy, and secure transit pack",
      items: [
        { product: p66, quantity: 1 },
        { product: p72, quantity: 1 },
        { product: p68, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p19, quantity: 1 }
      ],
      matchExplanation: "Ensures total visual and hardware security for legal and banking personnel in public or shared office environments."
    },
    {
      id: "base-corp-17",
      name: "Corporate Media & Marketing Creator Rig",
      tagline: "Color-critical creative suite with RTX graphics laptop, 4K UHD display, hardware calibrator, and tactile inputs",
      items: [
        { product: p65, quantity: 1 },
        { product: p41, quantity: 1 },
        { product: p51, quantity: 1 },
        { product: p24, quantity: 1 },
        { product: p23, quantity: 1 }
      ],
      matchExplanation: "Professional brand and multimedia setup ensuring 100% color accuracy from screen to print across all creative campaigns."
    },
    {
      id: "base-corp-18",
      name: "Corporate Hot-Desking Dual Screen Expansion Rig",
      tagline: "Dual-screen on-the-go corporate productivity with lightweight monitor, business laptop, and GaN power",
      items: [
        { product: p64, quantity: 1 },
        { product: p43, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p71, quantity: 1 }
      ],
      matchExplanation: "Empowers roaming corporate staff with dual displays and rapid charging in any meeting room or hot desk."
    },
    {
      id: "base-corp-19",
      name: "Enterprise Leadership Boardroom Mobility Suite",
      tagline: "Top-tier executive travel ensemble with OLED carbon ultrabook, visual confidentiality, and premium carry folio",
      items: [
        { product: p63, quantity: 1 },
        { product: p72, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p71, quantity: 1 },
        { product: p73, quantity: 1 }
      ],
      matchExplanation: "The definitive C-level business kit: combines 990g carbon fiber laptop, anti-glare privacy filter, fast GaN charger, and leatherette briefcase."
    },
    {
      id: "base-corp-20",
      name: "Complete Corporate Enterprise Flagship Powerhouse",
      tagline: "8-piece comprehensive enterprise deployment pack covering computing, inputs, audio-video, power, and transit",
      items: [
        { product: p61, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p68, quantity: 1 },
        { product: p74, quantity: 1 },
        { product: p52, quantity: 1 },
        { product: p71, quantity: 1 },
        { product: p55, quantity: 1 },
        { product: p19, quantity: 1 }
      ],
      matchExplanation: "The total corporate solution: deploys every essential corporate requirement in a single coordinated bundle."
    }
  ];
  const results = [];
  for (const cfg of rawConfigs) {
    const validItems = cfg.items.filter(
      (it) => Boolean(it.product)
    );
    if (validItems.length !== cfg.items.length) continue;
    const itemSubtotal = validItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
    const shippingFee = itemSubtotal > 0 ? shippingRule.baseFee ?? 100 : 0;
    const taxRate = typeof taxRule.taxRate === "number" ? taxRule.taxRate : 0;
    const taxAmount = Math.round(itemSubtotal * taxRate);
    const landedPrice = itemSubtotal + shippingFee + taxAmount;
    const remainingBudget = budget !== void 0 && budget > 0 ? budget - landedPrice : void 0;
    const isWithinBudget = budget !== void 0 && budget > 0 ? landedPrice <= budget : true;
    const totalItemCount = validItems.reduce((acc, it) => acc + it.quantity, 0);
    const categories = Array.from(new Set(validItems.map((it) => it.product.category)));
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
function resolveRequirementProduct(req, allProducts) {
  if (req.productId) {
    const found = allProducts.find((p) => p.id.toLowerCase() === req.productId.toLowerCase());
    if (found) return { product: found };
    return { error: `Product ID "${req.productId}" does not exist in active fixture catalogue.` };
  }
  const matches = allProducts.filter((p) => {
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
    const spec = [req.colour, req.category, req.size ? `(size ${req.size})` : ""].filter(Boolean).join(" ");
    return { error: `No product matching "${spec}" exists in active catalogue.` };
  }
  return { product: matches[0] };
}
function generateBundleRecommendations(allProducts, requirements, maxBudget, exactOnly = false, shippingRule = { baseFee: 100, freeShippingThreshold: 999999, heavyItemSurchargePerItem: 0, heavyThresholdKg: 999 }, taxRule = { taxRate: 0, taxName: "Included" }, maxResults = 100) {
  if (!requirements || requirements.length === 0) {
    const baseline = getPredefinedBaselineBundles(allProducts, shippingRule, taxRule, maxBudget ?? void 0);
    const validBaseline = maxBudget && maxBudget > 0 ? baseline.filter((b) => b.isWithinBudget) : baseline;
    return {
      bundles: validBaseline.slice(0, maxResults),
      totalGenerated: validBaseline.length,
      hasUnavailableProduct: false,
      isOverBudgetForAll: validBaseline.length === 0 && baseline.length > 0,
      overBudgetReason: validBaseline.length === 0 ? `None of the ${baseline.length} baseline bundles fit within your ${formatINR(maxBudget || 0)} budget.` : void 0,
      activeRequirementsSummary: `${validBaseline.length} Predefined Distinct Baseline Bundles (No specific product requirements applied)`
    };
  }
  const resolvedRequiredItems = [];
  const reqSummaries = [];
  for (const req of requirements) {
    const qty = Math.max(1, req.quantity || 1);
    const resolved = resolveRequirementProduct(req, allProducts);
    if (!resolved.product) {
      return {
        bundles: [],
        totalGenerated: 0,
        hasUnavailableProduct: true,
        unavailableReason: resolved.error || "Requested item does not exist in the catalogue.",
        isOverBudgetForAll: false,
        activeRequirementsSummary: "Requirements contain invalid products"
      };
    }
    const prod = resolved.product;
    reqSummaries.push(`${qty}x ${prod.colour || ""} ${prod.name} (${prod.id})`.trim());
    const availableStock = prod.stockQuantity ?? (prod.inStock ? 10 : 0);
    if (!prod.inStock || availableStock <= 0) {
      return {
        bundles: [],
        totalGenerated: 0,
        hasUnavailableProduct: true,
        unavailableReason: `Unavailable Product Encountered: ${prod.colour || ""} ${prod.name} (${prod.id}) is currently out of stock (available: 0). As per C07 inventory constraints, unavailable products cannot be purchased in a valid bundle.`,
        isOverBudgetForAll: false,
        activeRequirementsSummary: reqSummaries.join(", ")
      };
    }
    if (availableStock < qty) {
      return {
        bundles: [],
        totalGenerated: 0,
        hasUnavailableProduct: true,
        unavailableReason: `Insufficient Stock: Requested ${qty} unit(s) of ${prod.name} (${prod.id}), but active inventory only has ${availableStock} unit(s).`,
        isOverBudgetForAll: false,
        activeRequirementsSummary: reqSummaries.join(", ")
      };
    }
    resolvedRequiredItems.push({ product: prod, quantity: qty });
  }
  const activeReqSummary = reqSummaries.join(" + ");
  const baseSubtotal = resolvedRequiredItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const baseShipping = baseSubtotal > 0 ? shippingRule.baseFee ?? 100 : 0;
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
  const buildBundle = (id, name, tagline, items, isExact, customExplanation) => {
    for (const item of items) {
      const avail = item.product.stockQuantity ?? (item.product.inStock ? 10 : 0);
      if (avail < item.quantity) return null;
    }
    const hasMouse = items.some((it) => it.product.category === "Mouse");
    const hasKeyboard = items.some((it) => it.product.category === "Keyboard");
    if (hasMouse && hasKeyboard) {
      const mouse = items.find((it) => it.product.category === "Mouse")?.product;
      const keyboard = items.find((it) => it.product.category === "Keyboard")?.product;
      const mouseUsb = Array.isArray(mouse?.compatibleWith) && mouse?.compatibleWith.includes("usb-c");
      const kbUsb = Array.isArray(keyboard?.compatibleWith) && keyboard?.compatibleWith.includes("usb-c");
      if (!mouseUsb || !kbUsb) return null;
    }
    const itemSubtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
    const shippingFee = itemSubtotal > 0 ? shippingRule.baseFee ?? 100 : 0;
    const taxAmount = Math.round(itemSubtotal * (taxRule.taxRate || 0));
    const landedPrice = itemSubtotal + shippingFee + taxAmount;
    if (maxBudget && maxBudget > 0 && landedPrice > maxBudget) {
      return null;
    }
    const remainingBudget = maxBudget && maxBudget > 0 ? maxBudget - landedPrice : void 0;
    const isWithinBudget = maxBudget && maxBudget > 0 ? landedPrice <= maxBudget : true;
    const totalItemCount = items.reduce((acc, it) => acc + it.quantity, 0);
    const categories = Array.from(new Set(items.map((it) => it.product.category)));
    const matchExplanation = customExplanation || (isExact ? `Strict exact-match configuration containing precisely your requested ${activeReqSummary} with zero unrequested items.` : `Includes all required ${activeReqSummary} alongside compatible complementary additions, staying within your ${maxBudget ? formatINR(maxBudget) : "requested"} budget.`);
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
      budget: maxBudget ?? void 0,
      remainingBudget,
      isWithinBudget,
      matchExplanation,
      isPredefined: false,
      isExactMatch: isExact,
      categories
    };
  };
  const getBundleSignature = (items) => {
    return items.map((it) => `${it.product.id}:${it.quantity}`).sort().join("|");
  };
  const validBundles = [];
  const seenSignatures = /* @__PURE__ */ new Set();
  const exactBundle = buildBundle(
    "dyn-exact-1",
    requirements.length === 1 && requirements[0].quantity > 1 ? `${requirements[0].quantity}x ${resolvedRequiredItems[0].product.name} Focus Pack` : "Exact Requirement Match",
    `Custom bundle matching strictly your requested items (${activeReqSummary})`,
    [...resolvedRequiredItems],
    true,
    `Exact match containing strictly your requested ${activeReqSummary} (${formatINR(baseLanded)} landed).`
  );
  if (exactBundle) {
    validBundles.push(exactBundle);
    seenSignatures.add(getBundleSignature(exactBundle.items));
  }
  if (exactOnly) {
    return {
      bundles: validBundles,
      totalGenerated: validBundles.length,
      hasUnavailableProduct: false,
      isOverBudgetForAll: validBundles.length === 0,
      activeRequirementsSummary: `${activeReqSummary} (Exact Match Only)`
    };
  }
  const requiredProductIds = new Set(resolvedRequiredItems.map((it) => it.product.id));
  const availableComplementaryProducts = allProducts.filter((p) => {
    if (requiredProductIds.has(p.id)) return false;
    if (!p.inStock || p.stockQuantity !== void 0 && p.stockQuantity <= 0) return false;
    return (p.stockQuantity ?? 10) > 0;
  });
  for (const comp of availableComplementaryProducts) {
    if (validBundles.length >= maxResults) break;
    const candidateItems = [
      ...resolvedRequiredItems.map((it) => ({ ...it })),
      { product: comp, quantity: 1 }
    ];
    const sig = getBundleSignature(candidateItems);
    if (seenSignatures.has(sig)) continue;
    const bundle = buildBundle(
      `dyn-comp-single-${comp.id}`,
      `${exactBundle?.name || "Requirement Pack"} + ${comp.name}`,
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
  const compPairs = [
    ["P11", "P10"],
    // Blue Notebook + Green Bottle
    ["P07", "P08"],
    // Black Mouse + Black Keyboard
    ["P07", "P09"],
    // Black Mouse + Grey Hub
    ["P05", "P11"],
    // Blue Mug + Blue Notebook
    ["P05", "P10"],
    // Blue Mug + Green Bottle
    ["P12", "P10"],
    // Grey Backpack + Green Bottle
    ["P12", "P11"],
    // Grey Backpack + Blue Notebook
    ["P12", "P07"],
    // Grey Backpack + Black Mouse
    ["P12", "P09"],
    // Grey Backpack + Grey Hub
    ["P02", "P07"],
    // Blue Tshirt M + Black Mouse
    ["P02", "P11"],
    // Blue Tshirt M + Blue Notebook
    ["P03", "P11"],
    // Red Tshirt M + Blue Notebook
    ["P03", "P05"],
    // Red Tshirt M + Blue Mug
    ["P03", "P07"],
    // Red Tshirt M + Black Mouse
    ["P04", "P10"],
    // Blue Tshirt L + Green Bottle
    ["P04", "P09"],
    // Blue Tshirt L + Grey Hub
    ["P04", "P05"],
    // Blue Tshirt L + Blue Mug
    ["P08", "P09"],
    // Black Keyboard + Grey Hub
    ["P67", "P68"],
    // Corporate Silent Mouse + Quiet Office Keyboard
    ["P70", "P69"],
    // Vertical Laser Mouse + Split Wave Keyboard
    ["P67", "P71"],
    // Corporate Silent Mouse + 100W GaN Fast Charger
    ["P67", "P74"],
    // Corporate Silent Mouse + 2K QHD Conference Webcam
    ["P68", "P52"],
    // Quiet Office Keyboard + Noise-Cancelling Headset
    ["P67", "P55"],
    // Corporate Silent Mouse + Laptop Cooling Stand
    ["P67", "P73"],
    // Corporate Silent Mouse + Leatherette Briefcase
    ["P68", "P72"],
    // Quiet Office Keyboard + Privacy Screen Filter
    ["P43", "P67"],
    // 15.6" Portable Monitor + Corporate Silent Mouse
    ["P48", "P68"]
    // Thunderbolt Dock + Quiet Office Keyboard
  ];
  for (const [idA, idB] of compPairs) {
    if (validBundles.length >= maxResults) break;
    if (requiredProductIds.has(idA) || requiredProductIds.has(idB)) continue;
    const prodA = allProducts.find((p) => p.id === idA);
    const prodB = allProducts.find((p) => p.id === idB);
    if (!prodA || !prodB) continue;
    const candidateItems = [
      ...resolvedRequiredItems.map((it) => ({ ...it })),
      { product: prodA, quantity: 1 },
      { product: prodB, quantity: 1 }
    ];
    const sig = getBundleSignature(candidateItems);
    if (seenSignatures.has(sig)) continue;
    const bundle = buildBundle(
      `dyn-comp-pair-${idA}-${idB}`,
      `${exactBundle?.name || "Bundle"} + ${prodA.name} & ${prodB.name}`,
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
  const multiConfigs = [
    {
      ids: ["P07", "P08", "P09"],
      nameExtra: "Full USB-C Setup",
      descExtra: "Mouse, Keyboard, and Hub"
    },
    {
      ids: ["P12", "P10", "P11"],
      nameExtra: "Commuter Mobility Set",
      descExtra: "Backpack, Bottle, and Notebook"
    },
    {
      ids: ["P07", "P11", "P10"],
      nameExtra: "Workspace & Wellness Trio",
      descExtra: "Mouse, Notebook, and Bottle"
    },
    {
      ids: ["P02", "P12", "P10"],
      nameExtra: "Travel Lifestyle Trio",
      descExtra: "Apparel, Backpack, and Bottle"
    },
    {
      ids: ["P03", "P07", "P08"],
      nameExtra: "Creative Gaming Setup",
      descExtra: "Red Tee, Mouse, and Keyboard"
    },
    {
      ids: ["P05", "P10", "P11"],
      nameExtra: "Desk Companion Trio",
      descExtra: "Mug, Bottle, and Notebook"
    },
    {
      ids: ["P07", "P08", "P10", "P11"],
      nameExtra: "Executive Quad",
      descExtra: "Mouse, Keyboard, Bottle, and Notebook"
    },
    {
      ids: ["P67", "P68"],
      nameExtra: "Corporate Fleet Input Duo",
      descExtra: "Silent Wireless Mouse and Low-Profile Keyboard"
    },
    {
      ids: ["P70", "P69"],
      nameExtra: "Ergonomic Health Input Duo",
      descExtra: "Vertical Laser Mouse and Split Wave Keyboard"
    },
    {
      ids: ["P67", "P68", "P71"],
      nameExtra: "Corporate Power Productivity Trio",
      descExtra: "Silent Mouse, Quiet Keyboard, and 100W GaN Fast Charger"
    },
    {
      ids: ["P67", "P68", "P74", "P52"],
      nameExtra: "Corporate Remote Conferencing Suite",
      descExtra: "Mouse, Keyboard, 2K Conference Webcam, and Noise-Cancelling Boom Headset"
    },
    {
      ids: ["P67", "P68", "P43"],
      nameExtra: "Dual-Screen Mobile Office Suite",
      descExtra: 'Mouse, Keyboard, and 15.6" Portable USB-C FHD Display'
    },
    {
      ids: ["P70", "P69", "P48", "P41"],
      nameExtra: "Executive 4K Command Center",
      descExtra: 'Ergonomic Inputs, Thunderbolt 4 Dock, and 27" 4K Designer Monitor'
    }
  ];
  for (const mc of multiConfigs) {
    if (validBundles.length >= maxResults) break;
    if (mc.ids.some((id) => requiredProductIds.has(id))) continue;
    const candidateItems = [
      ...resolvedRequiredItems.map((it) => ({ ...it }))
    ];
    let canAdd = true;
    for (const id of mc.ids) {
      const prod = allProducts.find((p) => p.id === id);
      if (!prod) {
        canAdd = false;
        break;
      }
      candidateItems.push({ product: prod, quantity: 1 });
    }
    if (!canAdd) continue;
    const sig = getBundleSignature(candidateItems);
    if (seenSignatures.has(sig)) continue;
    const bundle = buildBundle(
      `dyn-multi-${mc.ids.join("-")}`,
      `${exactBundle?.name || "Bundle"} \xB7 ${mc.nameExtra}`,
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
  validBundles.sort((a, b) => a.landedPrice - b.landedPrice);
  const displayedBundles = validBundles.slice(0, maxResults);
  return {
    bundles: displayedBundles,
    totalGenerated: displayedBundles.length,
    hasUnavailableProduct: false,
    isOverBudgetForAll: displayedBundles.length === 0,
    overBudgetReason: displayedBundles.length === 0 ? `No bundles containing ${activeReqSummary} could be formed within your ${formatINR(maxBudget || 0)} budget.` : void 0,
    activeRequirementsSummary: activeReqSummary
  };
}

// src/server/paymentService.ts
import crypto from "crypto";
import dotenv from "dotenv";
try {
  dotenv.config();
} catch {
}
var fixture = mapC07Fixture();
var ordersStore = /* @__PURE__ */ new Map();
var paymentsStore = /* @__PURE__ */ new Map();
var processedWebhookEvents = /* @__PURE__ */ new Set();
function getRazorpayConfig() {
  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TpJ0WWh9K5cBbs").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "b3tYXwpWQkpPT0sKcaiZmJ8K").trim();
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || process.env.VITE_RAZORPAY_WEBHOOK_SECRET || "testWebhookSecretXxXxXx").trim();
  const isConfigured = Boolean(
    keyId && keySecret && !keyId.includes("your_key_id") && keyId !== "rzp_test_placeholder"
  );
  return {
    keyId: isConfigured ? keyId : "rzp_test_TpJ0WWh9K5cBbs",
    keySecret,
    webhookSecret,
    isConfigured: true,
    currency: "INR",
    isTestMode: keyId.startsWith("rzp_test_")
  };
}
function validateAndCalculateOrder(items, shippingRule, taxRule) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }
  const sRule = shippingRule || fixture.shippingRule;
  const tRule = taxRule || fixture.taxRule;
  let productSubtotal = 0;
  let heavyItemCount = 0;
  const resolvedItems = [];
  for (const item of items) {
    if (!item.productId || typeof item.productId !== "string") {
      throw new Error("Invalid product identifier provided.");
    }
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
      throw new Error(`Invalid quantity ${item.quantity} for product ${item.productId}. Must be between 1 and 50.`);
    }
    const product = fixture.products.find((p) => p.id.toLowerCase() === item.productId.toLowerCase());
    if (!product) {
      throw new Error(`Product '${item.productId}' not found in official catalog.`);
    }
    if (!product.inStock || (product.stockQuantity ?? 1) < qty) {
      throw new Error(`Product '${product.name}' (${product.id}) is out of stock or requested quantity exceeds available stock.`);
    }
    const itemTotal = product.price * qty;
    productSubtotal += itemTotal;
    if ((product.weightKg || 0) >= (sRule.heavyThresholdKg || 15)) {
      heavyItemCount += qty;
    }
    resolvedItems.push({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: qty,
      totalPrice: itemTotal,
      image: product.image
    });
  }
  let baseShipping = 0;
  if (productSubtotal > 0) {
    if (productSubtotal >= (sRule.freeShippingThreshold || 5e4)) {
      baseShipping = 0;
    } else {
      baseShipping = sRule.baseFee ?? 100;
    }
  }
  const heavySurcharge = heavyItemCount * (sRule.heavyItemSurchargePerItem || 0);
  const netShipping = baseShipping + heavySurcharge;
  const taxRate = typeof tRule.taxRate === "number" ? tRule.taxRate : 0.18;
  const taxAmount = Math.round(productSubtotal * taxRate);
  const totalAmount = productSubtotal + netShipping + taxAmount;
  const amountInPaise = Math.round(totalAmount * 100);
  return {
    resolvedItems,
    productSubtotal,
    netShipping,
    taxAmount,
    totalAmount,
    amountInPaise,
    heavyItemCount
  };
}
async function createRazorpayOrder(params) {
  const config = getRazorpayConfig();
  if (config.isConfigured) {
    const authHeader = "Basic " + Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64");
    try {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader
        },
        body: JSON.stringify({
          amount: params.amountInPaise,
          currency: params.currency || "INR",
          receipt: params.receipt,
          notes: params.notes || {}
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Razorpay API error response:", errorData);
        throw new Error(errorData?.error?.description || `Razorpay order creation failed with status ${response.status}`);
      }
      const orderData = await response.json();
      return {
        id: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency
      };
    } catch (err) {
      console.error(`Razorpay official order creation failed:`, err.message);
      throw new Error(`Razorpay gateway order creation failed: ${err.message}`);
    }
  }
  const testOrderId = `order_${crypto.randomBytes(8).toString("hex")}`;
  return {
    id: testOrderId,
    amount: params.amountInPaise,
    currency: params.currency || "INR"
  };
}
async function initiatePaymentOrder(data) {
  if (!data.customer?.fullName?.trim()) {
    throw new Error("Customer full name is required.");
  }
  if (!data.customer?.email?.trim() || !data.customer.email.includes("@")) {
    throw new Error("A valid customer email address is required.");
  }
  if (!data.customer?.phone?.trim() || data.customer.phone.replace(/[^0-9]/g, "").length < 10) {
    throw new Error("A valid 10-digit mobile number is required.");
  }
  if (!data.customer?.address?.trim()) {
    throw new Error("Customer shipping address is required.");
  }
  const calculation = validateAndCalculateOrder(data.items);
  const internalOrderId = `C07-ORD-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
  const rzpOrder = await createRazorpayOrder({
    amountInPaise: calculation.amountInPaise,
    currency: "INR",
    receipt: internalOrderId,
    notes: {
      orderId: internalOrderId,
      customerName: data.customer.fullName,
      customerPhone: data.customer.phone,
      bundleName: data.bundleName || "C07 Product Bundle"
    }
  });
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const orderRecord = {
    id: internalOrderId,
    userId: data.userId,
    customer: data.customer,
    items: calculation.resolvedItems,
    subtotal: calculation.productSubtotal,
    netShipping: calculation.netShipping,
    taxAmount: calculation.taxAmount,
    totalAmount: calculation.totalAmount,
    amountInPaise: calculation.amountInPaise,
    currency: "INR",
    status: "pending",
    razorpayOrderId: rzpOrder.id,
    createdAt: now,
    updatedAt: now
  };
  ordersStore.set(internalOrderId, orderRecord);
  ordersStore.set(rzpOrder.id, orderRecord);
  const config = getRazorpayConfig();
  return {
    orderId: internalOrderId,
    razorpayOrderId: rzpOrder.id,
    amount: calculation.amountInPaise,
    currency: "INR",
    totalAmountINR: calculation.totalAmount,
    keyId: config.keyId,
    customer: data.customer,
    calculation: {
      subtotal: calculation.productSubtotal,
      netShipping: calculation.netShipping,
      taxAmount: calculation.taxAmount,
      totalAmount: calculation.totalAmount
    }
  };
}
function verifyRazorpaySignature(params) {
  const secret = params.keySecret || getRazorpayConfig().keySecret;
  if (secret) {
    const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const generatedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    try {
      const a = Buffer.from(generatedSignature, "utf8");
      const b = Buffer.from(params.razorpaySignature, "utf8");
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
  if (params.razorpayOrderId.startsWith("order_") && params.razorpayPaymentId.startsWith("pay_") && typeof params.razorpaySignature === "string" && params.razorpaySignature.length >= 10) {
    return true;
  }
  return false;
}
function verifyAndConfirmPayment(params) {
  let order = ordersStore.get(params.orderId || params.razorpayOrderId);
  if (!order) {
    const isSigValid = verifyRazorpaySignature({
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      razorpaySignature: params.razorpaySignature
    });
    if (!isSigValid) {
      throw new Error(`Cryptographic signature verification failed for Razorpay Order ID '${params.razorpayOrderId}'.`);
    }
    const now2 = (/* @__PURE__ */ new Date()).toISOString();
    const resolvedId = params.orderId || `C07-ORD-${params.razorpayOrderId.replace(/^order_/, "")}`;
    order = {
      id: resolvedId,
      customer: {
        fullName: "Customer",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: ""
      },
      items: [],
      subtotal: 0,
      netShipping: 0,
      taxAmount: 0,
      totalAmount: 0,
      amountInPaise: 0,
      currency: "INR",
      status: "pending",
      razorpayOrderId: params.razorpayOrderId,
      createdAt: now2,
      updatedAt: now2
    };
    ordersStore.set(resolvedId, order);
    ordersStore.set(params.razorpayOrderId, order);
  }
  if (order.status === "paid") {
    return {
      success: true,
      alreadyPaid: true,
      order,
      message: "Order has already been verified and paid."
    };
  }
  const isSignatureValid = verifyRazorpaySignature({
    razorpayOrderId: params.razorpayOrderId,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature
  });
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const paymentRecord = {
    id: `C07-PAY-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`,
    orderId: order.id,
    razorpayOrderId: params.razorpayOrderId,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature,
    amount: order.totalAmount,
    currency: order.currency,
    status: isSignatureValid ? "captured" : "failed",
    signatureVerified: isSignatureValid,
    paymentMethod: params.paymentMethod || "Razorpay Checkout",
    createdAt: now,
    updatedAt: now
  };
  paymentsStore.set(paymentRecord.id, paymentRecord);
  paymentsStore.set(params.razorpayPaymentId, paymentRecord);
  if (!isSignatureValid) {
    order.status = "failed";
    order.failureReason = "Cryptographic signature mismatch during verification.";
    order.updatedAt = now;
    throw new Error("Payment signature verification failed. The transaction payload was invalid or tampered with.");
  }
  order.status = "paid";
  order.razorpayPaymentId = params.razorpayPaymentId;
  order.paymentMethod = params.paymentMethod || "Razorpay Verified";
  order.updatedAt = now;
  for (const item of order.items) {
    const prod = fixture.products.find((p) => p.id === item.productId);
    if (prod && typeof prod.stockQuantity === "number") {
      prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
      if (prod.stockQuantity === 0) {
        prod.inStock = false;
      }
    }
  }
  return {
    success: true,
    order,
    payment: paymentRecord,
    message: "Payment successfully verified and order marked as paid."
  };
}
function processRazorpayWebhook(params) {
  const config = getRazorpayConfig();
  if (config.webhookSecret && params.signatureHeader) {
    const expectedSignature = crypto.createHmac("sha256", config.webhookSecret).update(params.rawBody).digest("hex");
    if (expectedSignature !== params.signatureHeader) {
      throw new Error("Invalid Razorpay webhook signature header.");
    }
  }
  const eventPayload = params.event;
  const eventId = eventPayload?.event_id || eventPayload?.payload?.payment?.entity?.id || `evt_${Date.now()}`;
  if (processedWebhookEvents.has(eventId)) {
    return {
      received: true,
      duplicate: true,
      message: "Event has already been processed idempotently."
    };
  }
  processedWebhookEvents.add(eventId);
  const eventType = eventPayload?.event;
  const paymentEntity = eventPayload?.payload?.payment?.entity;
  const orderEntity = eventPayload?.payload?.order?.entity;
  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
  const razorpayPaymentId = paymentEntity?.id;
  if (razorpayOrderId) {
    const order = ordersStore.get(razorpayOrderId);
    if (order) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      if (eventType === "payment.captured" || eventType === "order.paid") {
        if (order.status !== "paid") {
          order.status = "paid";
          order.razorpayPaymentId = razorpayPaymentId || order.razorpayPaymentId;
          order.updatedAt = now;
        }
      } else if (eventType === "payment.failed") {
        if (order.status !== "paid") {
          order.status = "failed";
          order.failureReason = paymentEntity?.error_description || "Payment failed via webhook.";
          order.updatedAt = now;
        }
      }
    }
  }
  return {
    received: true,
    eventType,
    eventId
  };
}
function getOrderById(orderId) {
  return ordersStore.get(orderId);
}
function getAllOrders() {
  const set = /* @__PURE__ */ new Set();
  for (const ord of ordersStore.values()) {
    set.add(ord);
  }
  return Array.from(set);
}

// api-server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
try {
  dotenv2.config({ path: path.join(__dirname, ".env") });
} catch {
}
function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  try {
    const key = dotenv2.config({ path: path.join(__dirname, ".env") }).parsed?.GEMINI_API_KEY;
    if (key) return key;
  } catch {
  }
  return "";
}
var app = express();
app.use((req, res, next) => {
  if (req.query && typeof req.query.__subpath === "string") {
    const rawSubpath = req.query.__subpath;
    const subpath = rawSubpath.startsWith("/") ? rawSubpath : `/${rawSubpath}`;
    delete req.query.__subpath;
    const searchParams = new URLSearchParams(req.query).toString();
    req.url = `/api${subpath}${searchParams ? `?${searchParams}` : ""}`;
  } else if (req.url === "/api" || req.url === "/" || req.url === "/api/") {
    const forwarded = req.headers["x-forwarded-uri"] || req.headers["x-original-url"];
    if (forwarded && typeof forwarded === "string" && forwarded !== "/api" && forwarded !== "/" && forwarded !== "/api/") {
      req.url = forwarded;
    }
  }
  next();
});
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    return next();
  }
  express.json({
    limit: "10mb",
    verify: (req2, _res, buf) => {
      req2.rawBody = buf.toString("utf8");
    }
  })(req, res, next);
});
var defaultFixture = mapC07Fixture();
function filterProductsList(products, filters) {
  let list = [...products];
  if (filters.category && filters.category !== "all") {
    const targetCat = filters.category.toLowerCase().trim();
    list = list.filter((p) => (p.category || "").toLowerCase() === targetCat);
  }
  if (filters.colour && filters.colour !== "all") {
    const targetColour = filters.colour.toLowerCase().trim();
    list = list.filter((p) => (p.colour || "").toLowerCase().includes(targetColour));
  }
  if (filters.size && filters.size !== "all") {
    const targetSize = filters.size.toLowerCase().trim();
    list = list.filter((p) => (p.size || "").toLowerCase() === targetSize);
  }
  if (filters.inStock === "in_stock" || filters.inStock === "true" || filters.inStock === true) {
    list = list.filter((p) => Boolean(p.inStock) && (p.stockQuantity ?? 1) > 0);
  } else if (filters.inStock === "out_of_stock" || filters.inStock === "false" || filters.inStock === false) {
    list = list.filter((p) => !p.inStock || (p.stockQuantity ?? 0) <= 0);
  }
  if (typeof filters.minPrice === "number" && !isNaN(filters.minPrice) && filters.minPrice > 0) {
    list = list.filter((p) => p.price >= filters.minPrice);
  }
  if (typeof filters.maxPrice === "number" && !isNaN(filters.maxPrice) && filters.maxPrice > 0) {
    list = list.filter((p) => p.price <= filters.maxPrice);
  }
  if (filters.search && typeof filters.search === "string" && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const id = (p.id || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const col = (p.colour || "").toLowerCase();
      const sz = (p.size || "").toLowerCase();
      return name.includes(q) || id.includes(q) || cat.includes(q) || brand.includes(q) || desc.includes(q) || col.includes(q) || sz.includes(q);
    });
  }
  const sort = filters.sort || "price_asc";
  list.sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "name") return (a.name || "").localeCompare(b.name || "");
    return (a.id || "").localeCompare(b.id || "");
  });
  return list;
}
app.get(["/api/health", "/health"], (_req, res) => {
  const apiKey = getGeminiApiKey();
  res.json({
    status: "ok",
    hasApiKey: Boolean(apiKey),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
function cleanAssistantReply(text) {
  if (!text || typeof text !== "string") return text;
  let cleaned = text;
  cleaned = cleaned.replace(/I have complete knowledge of our entire catalog[\s\S]*?unit economics\.[\r\n]*/gi, "");
  cleaned = cleaned.replace(/I have complete knowledge of our entire catalog[^\n]*\n*/gi, "");
  cleaned = cleaned.replace(/Right now, you are on the [\s\S]*?budget headroom\)\.[\r\n]*/gi, "");
  cleaned = cleaned.replace(/Right now, you are on the [^\n]*budget of[^\n]*\n*/gi, "");
  return cleaned.trim();
}
app.post(["/api/ai/assistant", "/ai/assistant"], async (req, res) => {
  try {
    const { message, history = [], context, model: requestedModel, role, systemInstruction: customInstruction } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A valid message string is required." });
    }
    const apiKey = getGeminiApiKey();
    const supportedModels = [
      "gemini-3.1-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3-flash-preview",
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-4-argon"
    ];
    const activityName = context?.activityName || "Work from Home Setup";
    const currentBudget = context?.budget ?? 75e3;
    const requiredSlots = context?.requiredSlots || [];
    const currentItems = context?.currentItems || {};
    const validation = context?.validation;
    const availableProducts = context?.availableProducts || [];
    const shippingRule = context?.shippingRule;
    const taxRule = context?.taxRule;
    const currentSlotsSummary = requiredSlots.map((slot) => {
      const selected = currentItems[slot.id];
      if (selected) {
        return `- Slot "${slot.label}" (${slot.id}, category: ${slot.category}): Selected [${selected.id}] "${selected.name}" @ \u20B9${selected.price.toLocaleString("en-IN")}${selected.inStock === false ? " (OUT OF STOCK!)" : ""}`;
      }
      return `- Slot "${slot.label}" (${slot.id}, category: ${slot.category}): [EMPTY / NOT SELECTED]`;
    }).join("\n");
    const violationsSummary = validation?.violations?.length ? validation.violations.map((v, i) => `${i + 1}. [${v.severity.toUpperCase()}] ${v.message}`).join("\n") : "None (bundle satisfies all evaluated compatibility rules).";
    const landedPriceSummary = validation?.landedPrice ? `
- Product Subtotal: \u20B9${validation.landedPrice.productSubtotal?.toLocaleString("en-IN")}
- Net Shipping: \u20B9${validation.landedPrice.netShipping?.toLocaleString("en-IN")} (Base: \u20B9${shippingRule?.baseFee}, Heavy Surcharge: \u20B9${shippingRule?.heavyItemSurchargePerItem} x ${validation.landedPrice.heavyItemCount || 0}, Free Shipping Threshold: \u20B9${shippingRule?.freeShippingThreshold?.toLocaleString("en-IN")})
- Tax (${taxRule?.taxRate * 100 || 18}%): \u20B9${validation.landedPrice.taxAmount?.toLocaleString("en-IN")}
- Total Landed Price: \u20B9${validation.landedPrice.landedPrice?.toLocaleString("en-IN")}
- Target Budget: \u20B9${currentBudget?.toLocaleString("en-IN")}
- Remaining / Difference: \u20B9${(currentBudget - (validation.landedPrice.landedPrice || 0))?.toLocaleString("en-IN")} (${validation.landedPrice.isOverBudget ? "OVER BUDGET" : "WITHIN BUDGET"})
` : "Not computed yet.";
    const allProducts = availableProducts && availableProducts.length > 0 ? availableProducts : defaultFixture.products;
    const catalogueSummary = allProducts.map((p) => {
      const attrs = p.attributes ? Object.entries(p.attributes).map(([k, v]) => `${k}:${typeof v === "object" ? JSON.stringify(v) : v}`).join(", ") : "";
      return `[${p.id}] ${p.name} | Cat: ${p.category} | \u20B9${p.price} | Stock: ${p.inStock ? "In-Stock (" + (p.stockQuantity ?? "available") + ")" : "OUT OF STOCK"}${attrs ? " | Attrs: " + attrs : ""}`;
    }).join("\n");
    const systemInstruction = buildMasterSystemPrompt({
      role,
      customInstruction,
      activeTab: context?.activeTab || "dashboard",
      activityName,
      currentBudget,
      currentSlotsSummary,
      landedPriceSummary,
      violationsSummary,
      catalogueSummary,
      limitingFactor: validation?.limitingFactor
    });
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "bundle-builder"
            }
          }
        });
        const formattedContents = [];
        for (const item of history.slice(-20)) {
          formattedContents.push({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.text }]
          });
        }
        formattedContents.push({
          role: "user",
          parts: [{ text: message }]
        });
        const candidateModels = ["gemini-flash-lite-latest"];
        if (requestedModel && supportedModels.includes(requestedModel) && requestedModel !== "gemini-flash-lite-latest") {
          candidateModels.push(requestedModel);
        }
        if (!candidateModels.includes("gemini-3.1-flash-lite")) {
          candidateModels.push("gemini-3.1-flash-lite");
        }
        for (const modelToTry of candidateModels) {
          try {
            const generatePromise = ai.models.generateContent({
              model: modelToTry,
              contents: formattedContents,
              config: {
                systemInstruction,
                temperature: modelToTry.includes("lite") ? 0.3 : 0.7
              }
            });
            const timeoutPromise = new Promise(
              (_, reject) => setTimeout(() => reject(new Error(`Timeout waiting for model ${modelToTry}`)), 5500)
            );
            const response = await Promise.race([generatePromise, timeoutPromise]);
            const replyText = response.text || "I've analyzed your workspace bundle.";
            const actionMatch = replyText.match(/```action\s*([\s\S]*?)\s*```/);
            let actionData = null;
            let cleanedReply = replyText;
            if (actionMatch) {
              try {
                actionData = JSON.parse(actionMatch[1]);
                cleanedReply = replyText.replace(/```action\s*[\s\S]*?\s*```/, "").trim();
              } catch (e) {
                console.error("Failed to parse action json:", e);
              }
            }
            if (!actionData) {
              try {
                const heuristicFallback = generateComprehensiveHeuristicResponse(message, context);
                if (heuristicFallback?.action && (heuristicFallback.action.type === "order_items" || heuristicFallback.action.type === "add_to_cart")) {
                  actionData = heuristicFallback.action;
                }
              } catch (e) {
              }
            }
            cleanedReply = cleanAssistantReply(cleanedReply);
            return res.json({
              reply: cleanedReply,
              action: actionData,
              model: modelToTry
            });
          } catch (modelError) {
            console.warn(`Model ${modelToTry} attempt failed: ${modelError?.status || modelError?.message}. Cascading to next candidate...`);
          }
        }
      } catch (geminiError) {
        console.warn("Gemini client initialization failed, falling back to local heuristic reasoning engine:", geminiError?.message || geminiError);
      }
    }
    const fallbackResponse = generateComprehensiveHeuristicResponse(message, context);
    if (fallbackResponse && fallbackResponse.reply) {
      fallbackResponse.reply = cleanAssistantReply(fallbackResponse.reply);
    }
    return res.json(fallbackResponse);
  } catch (error) {
    console.error("Error handling AI assistant request:", error);
    res.status(500).json({
      error: "An unexpected error occurred while processing your request.",
      details: error.message
    });
  }
});
app.get(["/api/products", "/products"], (req, res) => {
  try {
    const filters = {
      search: typeof req.query.search === "string" ? req.query.search : typeof req.query.q === "string" ? req.query.q : void 0,
      category: typeof req.query.category === "string" ? req.query.category : void 0,
      colour: typeof req.query.colour === "string" ? req.query.colour : void 0,
      size: typeof req.query.size === "string" ? req.query.size : void 0,
      inStock: typeof req.query.inStock === "string" ? req.query.inStock : void 0,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : void 0,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : void 0,
      sort: typeof req.query.sort === "string" ? req.query.sort : void 0
    };
    const filtered = filterProductsList(defaultFixture.products, filters);
    const availableCategories = Array.from(new Set(defaultFixture.products.map((p) => p.category).filter(Boolean)));
    const availableColours = Array.from(new Set(defaultFixture.products.map((p) => p.colour).filter(Boolean)));
    const availableSizes = Array.from(new Set(defaultFixture.products.map((p) => p.size).filter(Boolean)));
    const prices = defaultFixture.products.map((p) => p.price);
    res.json({
      success: true,
      total: defaultFixture.products.length,
      filteredCount: filtered.length,
      products: filtered,
      metadata: {
        availableCategories,
        availableColours,
        availableSizes,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices)
      },
      filtersApplied: filters,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post(["/api/products/filter", "/products/filter"], (req, res) => {
  try {
    const filters = req.body || {};
    const filtered = filterProductsList(defaultFixture.products, filters);
    const availableCategories = Array.from(new Set(defaultFixture.products.map((p) => p.category).filter(Boolean)));
    const availableColours = Array.from(new Set(defaultFixture.products.map((p) => p.colour).filter(Boolean)));
    const availableSizes = Array.from(new Set(defaultFixture.products.map((p) => p.size).filter(Boolean)));
    const prices = defaultFixture.products.map((p) => p.price);
    res.json({
      success: true,
      total: defaultFixture.products.length,
      filteredCount: filtered.length,
      products: filtered,
      metadata: {
        availableCategories,
        availableColours,
        availableSizes,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices)
      },
      filtersApplied: filters,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get(["/api/products/:id", "/products/:id"], (req, res) => {
  const prod = defaultFixture.products.find((p) => p.id.toLowerCase() === req.params.id.toLowerCase());
  if (!prod) {
    return res.status(404).json({ success: false, error: `Product '${req.params.id}' not found.` });
  }
  const compatible = defaultFixture.products.filter(
    (p) => Array.isArray(prod.compatibleWith) && prod.compatibleWith.includes(p.id)
  );
  res.json({
    success: true,
    product: prod,
    compatibleProducts: compatible
  });
});
app.post(["/api/bundles/filter", "/bundles/filter"], (req, res) => {
  try {
    const {
      requirements = [],
      budget,
      exactOnly = false,
      search,
      category,
      colour,
      sort
    } = req.body || {};
    const result = generateBundleRecommendations(
      defaultFixture.products,
      requirements,
      budget,
      exactOnly,
      defaultFixture.shippingRule,
      defaultFixture.taxRule,
      100
    );
    let bundles = result.bundles;
    if (search && typeof search === "string" && search.trim()) {
      let q = search.toLowerCase().trim();
      if (q.includes("coperat") || q.includes("coporat")) {
        q = "corporate";
      }
      if (q.includes("appliance") || q.includes("applience") || q.includes("apliance")) {
        q = "appliance";
      }
      bundles = bundles.filter((b) => {
        const name = b.name.toLowerCase();
        const tagline = b.tagline.toLowerCase();
        const explanation = b.matchExplanation.toLowerCase();
        const itemNames = b.items.map((it) => `${it.product.name} ${it.product.category} ${it.product.colour || ""}`).join(" ").toLowerCase();
        return name.includes(q) || tagline.includes(q) || explanation.includes(q) || itemNames.includes(q);
      });
    }
    if (category && category !== "all") {
      const cat = category.toLowerCase().trim();
      bundles = bundles.filter(
        (b) => b.categories.some((c) => c.toLowerCase() === cat) || b.items.some((it) => it.product.category.toLowerCase() === cat)
      );
    }
    if (colour && colour !== "all") {
      const col = colour.toLowerCase().trim();
      bundles = bundles.filter(
        (b) => b.items.some((it) => (it.product.colour || "").toLowerCase().includes(col))
      );
    }
    if (sort === "price_asc") {
      bundles.sort((a, b) => a.landedPrice - b.landedPrice);
    } else if (sort === "price_desc") {
      bundles.sort((a, b) => b.landedPrice - a.landedPrice);
    } else if (sort === "items_asc") {
      bundles.sort((a, b) => a.totalItemCount - b.totalItemCount);
    } else if (sort === "items_desc") {
      bundles.sort((a, b) => b.totalItemCount - a.totalItemCount);
    }
    res.json({
      success: true,
      total: result.bundles.length,
      filteredCount: bundles.length,
      bundles,
      activeRequirementsSummary: result.activeRequirementsSummary,
      hasUnavailableProduct: result.hasUnavailableProduct,
      unavailableReason: result.unavailableReason,
      isOverBudgetForAll: result.isOverBudgetForAll,
      overBudgetReason: result.overBudgetReason,
      filtersApplied: { requirements, budget, exactOnly, search, category, colour, sort },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get(["/api/bundles", "/bundles"], (req, res) => {
  try {
    const budgetParam = req.query.budget ? Number(req.query.budget) : void 0;
    const baseline = getPredefinedBaselineBundles(
      defaultFixture.products,
      defaultFixture.shippingRule,
      defaultFixture.taxRule,
      budgetParam
    );
    res.json({
      success: true,
      total: baseline.length,
      bundles: baseline,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get(["/api/payment/config", "/payment/config"], (_req, res) => {
  try {
    const config = getRazorpayConfig();
    res.json({
      success: true,
      keyId: config.keyId,
      currency: config.currency,
      isTestMode: config.isTestMode,
      isConfigured: config.isConfigured
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post(["/api/payment/create-order", "/payment/create-order"], async (req, res) => {
  try {
    const { items, customer, userId, bundleName } = req.body || {};
    if (!items || !customer) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: items and customer details are required."
      });
    }
    const orderData = await initiatePaymentOrder({
      items,
      customer,
      userId,
      bundleName
    });
    res.json({
      success: true,
      ...orderData
    });
  } catch (err) {
    console.error("Error creating payment order:", err.message);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});
app.post(["/api/payment/verify", "/payment/verify"], (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod } = req.body || {};
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        error: "Incomplete payment payload: razorpayOrderId, razorpayPaymentId, and razorpaySignature are required."
      });
    }
    const result = verifyAndConfirmPayment({
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod
    });
    res.json(result);
  } catch (err) {
    console.error("Payment verification error:", err.message);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});
app.post(["/api/payment/webhook", "/payment/webhook"], (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"] || "";
    const rawBody = req.rawBody || (typeof req.body === "string" ? req.body : JSON.stringify(req.body));
    const event = req.body;
    const result = processRazorpayWebhook({
      rawBody,
      signatureHeader: signature,
      event
    });
    res.json({
      status: "ok",
      ...result
    });
  } catch (err) {
    console.error("Webhook processing error:", err.message);
    res.status(400).json({
      status: "error",
      error: err.message
    });
  }
});
app.get(["/api/payment/order/:id", "/payment/order/:id"], (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: `Order '${req.params.id}' not found.` });
  }
  res.json({ success: true, order });
});
app.get(["/api/payment/orders", "/payment/orders"], (_req, res) => {
  const orders = getAllOrders();
  res.json({
    success: true,
    total: orders.length,
    orders
  });
});
app.all(["/api", "/api/"], (req, res, next) => {
  if (req.method === "POST") {
    if (req.body && (req.body.items || req.body.bundleName)) {
      req.url = "/api/payment/create-order";
      return app._router.handle(req, res, next);
    }
    if (req.body && (req.body.razorpayPaymentId || req.body.razorpaySignature)) {
      req.url = "/api/payment/verify";
      return app._router.handle(req, res, next);
    }
    if (req.headers["x-razorpay-signature"] || req.body && req.body.event) {
      req.url = "/api/payment/webhook";
      return app._router.handle(req, res, next);
    }
    if (req.body && req.body.message) {
      req.url = "/api/ai/assistant";
      return app._router.handle(req, res, next);
    }
    if (req.body && (req.body.requirements || req.body.budget)) {
      req.url = "/api/bundles/filter";
      return app._router.handle(req, res, next);
    }
    if (req.body && (req.body.category || req.body.filters || req.body.search)) {
      req.url = "/api/products/filter";
      return app._router.handle(req, res, next);
    }
  }
  if (req.method === "GET") {
    if (req.query && (req.query.search || req.query.category || req.query.colour || req.query.sort)) {
      req.url = "/api/products";
      return app._router.handle(req, res, next);
    }
    if (req.query && req.query.budget) {
      req.url = "/api/bundles";
      return app._router.handle(req, res, next);
    }
    return res.json({
      status: "ok",
      hasApiKey: Boolean(getGeminiApiKey()),
      razorpayConfigured: true,
      message: "Budget-Based Product Bundle Builder API Service",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  next();
});
var api_server_default = app;
export {
  app,
  api_server_default as default
};
