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
  const p13 = byId('P13'); // Black Hardcover Notebook (₹250, stock 25)
  const p14 = byId('P14'); // Leather Bound Journal Notebook (₹350, stock 18)
  const p15 = byId('P15'); // Spiral Grid Notebook (₹220, stock 40)
  const p16 = byId('P16'); // Pocket Ruled Notebook (₹180, stock 50)
  const p17 = byId('P17'); // Stainless Steel Bottle (₹550, stock 15)
  const p18 = byId('P18'); // Matte Black Sports Bottle (₹420, stock 22)
  const p19 = byId('P19'); // Black Slim Laptop Backpack (₹1650, stock 8)
  const p20 = byId('P20'); // Canvas Commuter Backpack (₹1350, stock 14)
  const p21 = byId('P21'); // White Ceramic Coffee Mug (₹280, stock 25)
  const p22 = byId('P22'); // Matte Black Travel Tumbler (₹390, stock 18)
  const p23 = byId('P23'); // Ergonomic Wireless Mouse (₹890, stock 12)
  const p24 = byId('P24'); // Compact Mechanical Keyboard (₹1450, stock 8)
  const p25 = byId('P25'); // Multi-Port Aluminum Type-C Hub (₹1150, stock 15)
  const p41 = byId('P41'); // 27" 4K Designer Monitor (₹28500, stock 15)
  const p42 = byId('P42'); // 34" Curved WQHD Monitor (₹36000, stock 12)
  const p43 = byId('P43'); // 15.6" Portable USB-C FHD Monitor (₹12999, stock 18)
  const p44 = byId('P44'); // Graphic Drawing Tablet (₹6499, stock 22)
  const p48 = byId('P48'); // Thunderbolt 4 12-in-1 Triple Display Dock (₹14500, stock 14)
  const p50 = byId('P50'); // 1TB Rugged NVMe SSD (₹7800, stock 25)
  const p51 = byId('P51'); // Professional Color Calibrator (₹9999, stock 10)
  const p52 = byId('P52'); // Pro Wireless Conference Headset (₹3499, stock 24)
  const p54 = byId('P54'); // 3Dconnexion SpaceNavigator (₹8900, stock 11)
  const p55 = byId('P55'); // Aluminum Laptop Cooling Pad (₹1650, stock 32)
  const p61 = byId('P61'); // Enterprise Fleet 14" Business Ultrabook (₹54999, stock 45)
  const p62 = byId('P62'); // Developer Pro 16" Workstation Laptop (₹89999, stock 30)
  const p63 = byId('P63'); // Executive Carbon 13.3" Ultra-Slim Laptop (₹104999, stock 25)
  const p64 = byId('P64'); // Entry Corporate Staff 15.6" Laptop (₹42999, stock 50)
  const p65 = byId('P65'); // Creative Studio 16" RTX Workstation Laptop (₹149999, stock 18)
  const p66 = byId('P66'); // Finance & Enterprise Secure 14" vPro Laptop (₹78999, stock 35)
  const p67 = byId('P67'); // Corporate Silent Multi-Device Wireless Mouse (₹1299, stock 60)
  const p68 = byId('P68'); // Enterprise Low-Profile Quiet Office Keyboard (₹1799, stock 55)
  const p69 = byId('P69'); // Professional Ergonomic Split Wave Keyboard (₹3499, stock 40)
  const p70 = byId('P70'); // Vertical Ergonomic Precision Laser Mouse (₹2299, stock 48)
  const p71 = byId('P71'); // 100W GaN Triple-Port USB-C Fast Charger (₹2499, stock 50)
  const p72 = byId('P72'); // Magnetic Anti-Glare & Privacy Screen Filter (₹1499, stock 70)
  const p73 = byId('P73'); // Executive Leatherette Laptop Briefcase (₹2799, stock 35)
  const p74 = byId('P74'); // 2K QHD Conference Webcam (₹3999, stock 40)
  const p75 = byId('P75'); // Dual-Arm Desk Monitor Stand (₹4500, stock 25)
  const p76 = byId('P76'); // Smart Electric Rapid-Boil Kettle (₹2199, stock 40)
  const p77 = byId('P77'); // 15-Bar Compact Espresso & Cappuccino Coffee Machine (₹6499, stock 25)
  const p78 = byId('P78'); // Smart HEPA Air Purifier (₹7999, stock 30)
  const p79 = byId('P79'); // High-Speed Nutrient Extractor Blender (₹3499, stock 35)
  const p80 = byId('P80'); // Smart Robotic Vacuum & Mop Cleaner (₹18999, stock 20)
  const p81 = byId('P81'); // Digital 4-Slice Convection Pop-Up Toaster (₹2799, stock 45)
  const p82 = byId('P82'); // Cordless Handheld Cyclonic Stick Vacuum Cleaner (₹8499, stock 28)

  const rawConfigs = [
    {
      id: 'home-app-1',
      name: 'Home Appliances Morning Breakfast Duo',
      tagline: 'Complete morning kitchen breakfast duo with rapid-boil 1.7L stainless kettle and 4-slice digital toaster',
      items: [
        { product: p76, quantity: 1 },
        { product: p81, quantity: 1 }
      ],
      matchExplanation: 'Morning kitchen essentials pairing rapid-boil 1.7L electric kettle with 4-slice precision toaster for quick family breakfasts.'
    },
    {
      id: 'home-app-2',
      name: 'Home Appliances Cafe & Barista Beverage Suite',
      tagline: 'Premium home cafe experience pairing 15-bar espresso machine, precision rapid kettle, and ceramic mug',
      items: [
        { product: p77, quantity: 1 },
        { product: p76, quantity: 1 },
        { product: p21, quantity: 1 }
      ],
      matchExplanation: 'Barista-grade home cafe station featuring 15-bar espresso & cappuccino maker, rapid boiling kettle, and ceramic coffee mug.'
    },
    {
      id: 'home-app-3',
      name: 'Home Appliances Clean & Pure Living Automation Suite',
      tagline: 'Autonomous home wellness set combining intelligent HEPA air purifier with smart auto-docking robotic vacuum',
      items: [
        { product: p78, quantity: 1 },
        { product: p80, quantity: 1 }
      ],
      matchExplanation: 'Automated home wellness setup combining smart HEPA room air purifier with autonomous floor vacuum and mop robot.'
    },
    {
      id: 'home-app-4',
      name: 'Home Appliances Kitchen Chef Quick Prep Duo',
      tagline: 'Quick countertop kitchen prep duo featuring 1000W high-speed nutrient blender paired with durable ceramic mug',
      items: [
        { product: p79, quantity: 1 },
        { product: p05, quantity: 1 }
      ],
      matchExplanation: 'Healthy living kitchen starter duo pairing a 1000W high-speed smoothie extractor blender with an everyday mug.'
    },
    {
      id: 'corp-set-1',
      name: 'Corporate Laptop & Fast Charger Power Duo',
      tagline: 'High-mobility corporate package pairing 14" Business Ultrabook with 100W GaN fast power adapter',
      items: [
        { product: p61, quantity: 1 },
        { product: p71, quantity: 1 }
      ],
      matchExplanation: 'Corporate mobility set pairing high-performance 14" fleet ultrabook with triple-port 100W GaN fast charger.'
    },
    {
      id: 'corp-set-2',
      name: 'Corporate Mug & Power Adapter Essentials',
      tagline: 'Everyday corporate desk ceramic mug combined with 100W GaN multi-port fast power adapter',
      items: [
        { product: p21, quantity: 1 },
        { product: p71, quantity: 1 }
      ],
      matchExplanation: 'Everyday corporate desktop essential pairing premium desk drinkware with 100W multi-device fast power delivery.'
    },
    {
      id: 'corp-set-3',
      name: 'Corporate Fleet Laptop, Mouse & Keyboard Suite',
      tagline: 'Standard corporate fleet onboarding suite with 14" ultrabook, silent wireless mouse, and low-profile keyboard',
      items: [
        { product: p61, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p68, quantity: 1 }
      ],
      matchExplanation: 'Complete corporate IT onboarding workstation providing day-one business computing and silent desktop peripherals.'
    },
    {
      id: 'corp-set-4',
      name: 'Corporate Desk Hydration & Power Essentials',
      tagline: 'Budget-friendly corporate desk setup featuring beverage mug, hardcover journal, and 100W GaN charger',
      items: [
        { product: p05, quantity: 1 },
        { product: p71, quantity: 1 },
        { product: p13, quantity: 1 }
      ],
      matchExplanation: 'Corporate office desktop bundle under ₹3,500 budget with caffeine mug, executive notebook, and fast charging.'
    },
    {
      id: 'corp-set-5',
      name: 'Corporate Executive Laptop, Charger & Briefcase Suite',
      tagline: 'Executive mobility package combining 990g carbon ultrabook, 100W GaN charger, and luxury leatherette folio',
      items: [
        { product: p63, quantity: 1 },
        { product: p71, quantity: 1 },
        { product: p73, quantity: 1 }
      ],
      matchExplanation: 'Turnkey C-level business travel suite with ultra-light carbon laptop, rapid charger, and carrying briefcase.'
    },
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
    },
    {
      id: 'base-21',
      name: 'Mechanical Pro Wireless Workstation',
      tagline: 'Precision wireless ergonomic input pair with multi-port aluminum expansion hub',
      items: [
        { product: p23, quantity: 1 },
        { product: p24, quantity: 1 },
        { product: p25, quantity: 1 }
      ],
      matchExplanation: 'Next-gen wireless productivity setup with ergonomic clicker, compact mechanical keyboard, and Type-C hub.'
    },
    {
      id: 'base-22',
      name: 'Executive Leather & Steel Hydration Duo',
      tagline: 'Refined workspace set with leather-bound notebook and insulated stainless steel bottle',
      items: [
        { product: p14, quantity: 1 },
        { product: p17, quantity: 1 },
        { product: p21, quantity: 1 }
      ],
      matchExplanation: 'Executive desk companion bundle matching premium leather notebook with steel flask and ceramic mug.'
    },
    {
      id: 'base-23',
      name: 'All-Black Stealth Commute Ensemble',
      tagline: 'Sleek black urban setup with slim laptop pack, sports bottle, matte tumbler, and notebook',
      items: [
        { product: p19, quantity: 1 },
        { product: p18, quantity: 1 },
        { product: p22, quantity: 1 },
        { product: p13, quantity: 1 }
      ],
      matchExplanation: 'Color-unified stealth black transit package with slim laptop bag, matte hydration gear, and hardcover notebook.'
    },
    {
      id: 'base-24',
      name: 'Creative Studio Sketch & Apparel Trio',
      tagline: 'Grid notebook pairing with blue cotton tee and minimalist white ceramic coffee mug',
      items: [
        { product: p15, quantity: 1 },
        { product: p16, quantity: 1 },
        { product: p02, quantity: 1 },
        { product: p21, quantity: 1 }
      ],
      matchExplanation: 'Creative design ideation bundle with dual spiral and pocket sketchbooks, ceramic mug, and cotton tee.'
    },
    {
      id: 'base-25',
      name: 'Canvas Commuter & Aluminum Tech Hub',
      tagline: 'Durable canvas backpack equipped with aluminum Type-C dock and stainless steel bottle',
      items: [
        { product: p20, quantity: 1 },
        { product: p25, quantity: 1 },
        { product: p17, quantity: 1 },
        { product: p13, quantity: 1 }
      ],
      matchExplanation: 'Robust everyday traveler kit featuring canvas commuter bag, multi-port aluminum hub, flask, and notebook.'
    },
    {
      id: 'base-corp-1',
      name: 'Corporate Standard Fleet Onboarding Suite',
      tagline: 'Core enterprise IT deployment combining 14" Business Ultrabook with quiet tactile peripherals',
      items: [
        { product: p61, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p68, quantity: 1 }
      ],
      matchExplanation: 'The corporate standard: complete fleet laptop with dedicated low-noise wireless mouse and full-sized office keyboard for day-one productivity.'
    },
    {
      id: 'base-corp-2',
      name: 'Developer Pro Full-Stack Workstation',
      tagline: 'Heavy-duty developer suite with 16" high-performance workstation, mechanical typing, and expansion dock',
      items: [
        { product: p62, quantity: 1 },
        { product: p24, quantity: 1 },
        { product: p23, quantity: 1 },
        { product: p25, quantity: 1 }
      ],
      matchExplanation: 'Engineered for software engineers and DevOps: fast i7/32GB laptop with mechanical feedback keyboard, precision wireless mouse, and multi-display hub.'
    },
    {
      id: 'base-corp-3',
      name: 'Executive C-Suite Carbon Command Setup',
      tagline: 'Ultra-premium executive mobility with 990g OLED ultrabook, posture-aligned peripherals, and leather folio',
      items: [
        { product: p63, quantity: 1 },
        { product: p70, quantity: 1 },
        { product: p69, quantity: 1 },
        { product: p73, quantity: 1 }
      ],
      matchExplanation: 'Flagship executive deployment pairing featherlight OLED carbon touchscreen laptop with top-tier ergonomic wave inputs and luxury carrying case.'
    },
    {
      id: 'base-corp-4',
      name: 'Corporate Budget Staff Productivity Trio',
      tagline: 'Cost-optimized corporate fleet pack featuring 15.6" FHD anti-glare laptop with USB-C peripherals',
      items: [
        { product: p64, quantity: 1 },
        { product: p07, quantity: 1 },
        { product: p08, quantity: 1 }
      ],
      matchExplanation: 'High-value corporate procurement bundle equipping operational staff with a durable 15.6" business laptop, USB-C mouse, and keyboard under budget.'
    },
    {
      id: 'base-corp-5',
      name: 'Finance & Enterprise Secure Workstation',
      tagline: 'Compliance-ready corporate station with hardware TPM 2.0 vPro laptop, privacy filter, and full accounting keyboard',
      items: [
        { product: p66, quantity: 1 },
        { product: p68, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p72, quantity: 1 }
      ],
      matchExplanation: 'Designed for audit, finance, and banking operations: hardware-encrypted laptop with dedicated 10-key numeric pad keyboard, silent mouse, and confidentiality privacy screen.'
    },
    {
      id: 'base-corp-6',
      name: 'Creative Director & CAD Workstation Suite',
      tagline: 'Max-spec enterprise engineering and design powerhouse with i9 RTX laptop, 4K monitor, and articulated mount',
      items: [
        { product: p65, quantity: 1 },
        { product: p70, quantity: 1 },
        { product: p24, quantity: 1 },
        { product: p41, quantity: 1 },
        { product: p75, quantity: 1 }
      ],
      matchExplanation: 'Complete creative production suite featuring discrete GPU laptop, color-accurate 4K external display, mechanical typing, and heavy-duty gas spring arm.'
    },
    {
      id: 'base-corp-7',
      name: 'Hybrid Remote Worker Complete Suite',
      tagline: 'All-in-one corporate remote setup with business laptop, video conference hardware, ergonomic stand, and peripherals',
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
      id: 'base-corp-8',
      name: 'Enterprise Dual-Screen Mobile Office',
      tagline: 'Dual-display mobile powerhouse for traveling consultants and corporate leaders',
      items: [
        { product: p61, quantity: 1 },
        { product: p43, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p68, quantity: 1 }
      ],
      matchExplanation: 'Instantly doubles screen real estate anywhere: combines 14" ultrabook with a lightweight FHD USB-C secondary monitor and matched low-profile peripherals.'
    },
    {
      id: 'base-corp-9',
      name: 'Corporate Hot-Desking Mobility Pack',
      tagline: 'Agile hot-desking setup with 15.6" business laptop, ultra-compact GaN fast power, and protective transit pack',
      items: [
        { product: p64, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p71, quantity: 1 },
        { product: p19, quantity: 1 }
      ],
      matchExplanation: 'Equips agile office staff to transition smoothly between desk pods and conference rooms with multi-device fast charging and slim carry gear.'
    },
    {
      id: 'base-corp-10',
      name: 'Executive Presentations & Video Command Rig',
      tagline: 'High-impact leadership conferencing setup with carbon OLED laptop, AI auto-framing webcam, and boom mic',
      items: [
        { product: p63, quantity: 1 },
        { product: p74, quantity: 1 },
        { product: p52, quantity: 1 },
        { product: p67, quantity: 1 }
      ],
      matchExplanation: 'Optimized for board meetings and investor presentations: combines ultra-slim OLED laptop with AI auto-tracking 2K camera and broadcast-grade headset.'
    },
    {
      id: 'base-corp-11',
      name: 'Cloud Architect & DevOps Power Command Rig',
      tagline: 'The ultimate 5-piece enterprise command center with 32GB RAM laptop, 34" curved display, and 12-port dock',
      items: [
        { product: p62, quantity: 1 },
        { product: p42, quantity: 1 },
        { product: p48, quantity: 1 },
        { product: p69, quantity: 1 },
        { product: p70, quantity: 1 }
      ],
      matchExplanation: 'Maximum productivity configuration for senior engineers: drives panoramic code and terminal workspaces via single-cable Thunderbolt 4 docking.'
    },
    {
      id: 'base-corp-12',
      name: 'Field Sales & Client Solutions Travel Kit',
      tagline: 'Professional client-facing travel suite with sleek business ultrabook, luxury folio, and rapid charger',
      items: [
        { product: p61, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p73, quantity: 1 },
        { product: p71, quantity: 1 }
      ],
      matchExplanation: 'Tailored for client visits and business trips: lightweight 14" ultrabook with silent clicker, executive leatherette transit bag, and all-day fast power adapter.'
    },
    {
      id: 'base-corp-13',
      name: 'Corporate Call Center & Support Operations Station',
      tagline: 'High-endurance customer operations suite with dedicated laptop, noise-cancelling boom headset, and quiet inputs',
      items: [
        { product: p64, quantity: 1 },
        { product: p68, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p52, quantity: 1 }
      ],
      matchExplanation: 'Designed for intensive support and sales operations: durable laptop paired with noise-isolating boom mic headset and silent typing peripherals.'
    },
    {
      id: 'base-corp-14',
      name: 'Modern Corporate Ergonomic Fleet Suite',
      tagline: 'RSI-prevention corporate workspace featuring ergonomic wave keyboard, vertical laser mouse, and angled riser',
      items: [
        { product: p61, quantity: 1 },
        { product: p70, quantity: 1 },
        { product: p69, quantity: 1 },
        { product: p55, quantity: 1 }
      ],
      matchExplanation: 'Approved for corporate ergonomic wellness programs: corrects wrist and neck posture with split cushioned keyboard, vertical thumb-rest mouse, and cooling riser.'
    },
    {
      id: 'base-corp-15',
      name: 'Enterprise Data & Analytics Fast Station',
      tagline: 'High-bandwidth data engineering kit with 1050MB/s NVMe storage, 32GB laptop, and multi-port connectivity',
      items: [
        { product: p62, quantity: 1 },
        { product: p50, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p68, quantity: 1 },
        { product: p25, quantity: 1 }
      ],
      matchExplanation: 'Supports heavy ETL and machine learning workloads with ultra-fast portable storage, developer workstation laptop, and expanded peripheral ports.'
    },
    {
      id: 'base-corp-16',
      name: 'Secure Banking & Legal Audit Station',
      tagline: 'Protected corporate compliance setup with vPro hardware protection, screen privacy, and secure transit pack',
      items: [
        { product: p66, quantity: 1 },
        { product: p72, quantity: 1 },
        { product: p68, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p19, quantity: 1 }
      ],
      matchExplanation: 'Ensures total visual and hardware security for legal and banking personnel in public or shared office environments.'
    },
    {
      id: 'base-corp-17',
      name: 'Corporate Media & Marketing Creator Rig',
      tagline: 'Color-critical creative suite with RTX graphics laptop, 4K UHD display, hardware calibrator, and tactile inputs',
      items: [
        { product: p65, quantity: 1 },
        { product: p41, quantity: 1 },
        { product: p51, quantity: 1 },
        { product: p24, quantity: 1 },
        { product: p23, quantity: 1 }
      ],
      matchExplanation: 'Professional brand and multimedia setup ensuring 100% color accuracy from screen to print across all creative campaigns.'
    },
    {
      id: 'base-corp-18',
      name: 'Corporate Hot-Desking Dual Screen Expansion Rig',
      tagline: 'Dual-screen on-the-go corporate productivity with lightweight monitor, business laptop, and GaN power',
      items: [
        { product: p64, quantity: 1 },
        { product: p43, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p71, quantity: 1 }
      ],
      matchExplanation: 'Empowers roaming corporate staff with dual displays and rapid charging in any meeting room or hot desk.'
    },
    {
      id: 'base-corp-19',
      name: 'Enterprise Leadership Boardroom Mobility Suite',
      tagline: 'Top-tier executive travel ensemble with OLED carbon ultrabook, visual confidentiality, and premium carry folio',
      items: [
        { product: p63, quantity: 1 },
        { product: p72, quantity: 1 },
        { product: p67, quantity: 1 },
        { product: p71, quantity: 1 },
        { product: p73, quantity: 1 }
      ],
      matchExplanation: 'The definitive C-level business kit: combines 990g carbon fiber laptop, anti-glare privacy filter, fast GaN charger, and leatherette briefcase.'
    },
    {
      id: 'base-corp-20',
      name: 'Complete Corporate Enterprise Flagship Powerhouse',
      tagline: '8-piece comprehensive enterprise deployment pack covering computing, inputs, audio-video, power, and transit',
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
      matchExplanation: 'The total corporate solution: deploys every essential corporate requirement in a single coordinated bundle.'
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
  maxResults: number = 100
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
    ['P08', 'P09'], // Black Keyboard + Grey Hub
    ['P67', 'P68'], // Corporate Silent Mouse + Quiet Office Keyboard
    ['P70', 'P69'], // Vertical Laser Mouse + Split Wave Keyboard
    ['P67', 'P71'], // Corporate Silent Mouse + 100W GaN Fast Charger
    ['P67', 'P74'], // Corporate Silent Mouse + 2K QHD Conference Webcam
    ['P68', 'P52'], // Quiet Office Keyboard + Noise-Cancelling Headset
    ['P67', 'P55'], // Corporate Silent Mouse + Laptop Cooling Stand
    ['P67', 'P73'], // Corporate Silent Mouse + Leatherette Briefcase
    ['P68', 'P72'], // Quiet Office Keyboard + Privacy Screen Filter
    ['P43', 'P67'], // 15.6" Portable Monitor + Corporate Silent Mouse
    ['P48', 'P68']  // Thunderbolt Dock + Quiet Office Keyboard
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
    },
    {
      ids: ['P67', 'P68'],
      nameExtra: 'Corporate Fleet Input Duo',
      descExtra: 'Silent Wireless Mouse and Low-Profile Keyboard'
    },
    {
      ids: ['P70', 'P69'],
      nameExtra: 'Ergonomic Health Input Duo',
      descExtra: 'Vertical Laser Mouse and Split Wave Keyboard'
    },
    {
      ids: ['P67', 'P68', 'P71'],
      nameExtra: 'Corporate Power Productivity Trio',
      descExtra: 'Silent Mouse, Quiet Keyboard, and 100W GaN Fast Charger'
    },
    {
      ids: ['P67', 'P68', 'P74', 'P52'],
      nameExtra: 'Corporate Remote Conferencing Suite',
      descExtra: 'Mouse, Keyboard, 2K Conference Webcam, and Noise-Cancelling Boom Headset'
    },
    {
      ids: ['P67', 'P68', 'P43'],
      nameExtra: 'Dual-Screen Mobile Office Suite',
      descExtra: 'Mouse, Keyboard, and 15.6" Portable USB-C FHD Display'
    },
    {
      ids: ['P70', 'P69', 'P48', 'P41'],
      nameExtra: 'Executive 4K Command Center',
      descExtra: 'Ergonomic Inputs, Thunderbolt 4 Dock, and 27" 4K Designer Monitor'
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

/**
 * Generates 20 to 25 random valid bundles from in-stock database products.
 * Uses diverse categories (Mouse, Keyboard, Hub, Bottle, Notebook, Mug, Tshirt, Backpack).
 */
export function generateRandomDatabaseBundles(
  allProducts: Product[],
  count: number = 25,
  shippingRule: ShippingRule = { baseFee: 100, freeShippingThreshold: 999999, heavyItemSurchargePerItem: 0, heavyThresholdKg: 999 },
  taxRule: TaxRule = { taxRate: 0, taxName: 'Included' },
  maxBudget?: number | null
): BundleRecommendation[] {
  const inStockProducts = allProducts.filter(p => p.inStock && (p.stockQuantity ?? 10) > 0);
  if (inStockProducts.length < 2) return [];

  const adjectives = [
    'Dynamic', 'Modern', 'Essential', 'Smart', 'Urban', 'Pro', 'Elite', 'Campus', 'Studio', 'Everyday',
    'Tactile', 'Minimalist', 'Creative', 'Executive', 'Compact', 'Express', 'All-Rounder', 'Prime', 'Apex', 'NextGen',
    'Active', 'Signature', 'Velocity', 'Nomad', 'Focus'
  ];

  const nouns = [
    'Ensemble', 'Kit', 'Bundle', 'Pack', 'Suite', 'Duo', 'Trio', 'Quad', 'Collection', 'Combo',
    'Set', 'Gear', 'Station', 'Setup', 'Essentials', 'Pair', 'Package', 'Array', 'Synergy', 'Edition',
    'Cruiser', 'Explorer', 'Companion', 'Palette', 'Assortment'
  ];

  const seenSignatures = new Set<string>();
  const bundles: BundleRecommendation[] = [];

  // Deterministic seeded pseudorandom to produce varied yet valid combinations
  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const getBundleSignature = (items: BundleItem[]): string => {
    return items.map(it => `${it.product.id}:${it.quantity}`).sort().join('|');
  };

  // Group by categories
  const byCat = new Map<string, Product[]>();
  for (const p of inStockProducts) {
    const list = byCat.get(p.category) || [];
    list.push(p);
    byCat.set(p.category, list);
  }
  const availableCats = Array.from(byCat.keys());

  for (let attempt = 0; attempt < 300 && bundles.length < count; attempt++) {
    // Choose bundle size between 2 and 4 items
    const bundleSize = 2 + Math.floor(pseudoRandom() * 3);
    const chosenCategories: string[] = [];
    const pool = [...availableCats];
    while (chosenCategories.length < bundleSize && pool.length > 0) {
      const idx = Math.floor(pseudoRandom() * pool.length);
      chosenCategories.push(pool.splice(idx, 1)[0]);
    }

    const items: BundleItem[] = [];
    let validCompatibility = true;

    for (const cat of chosenCategories) {
      const catProducts = byCat.get(cat) || [];
      if (catProducts.length === 0) continue;
      const pick = catProducts[Math.floor(pseudoRandom() * catProducts.length)];
      items.push({ product: pick, quantity: 1 });
    }

    // Peripheral USB-C port compatibility check
    const hasMouse = items.some(it => it.product.category === 'Mouse');
    const hasKeyboard = items.some(it => it.product.category === 'Keyboard');
    if (hasMouse && hasKeyboard) {
      const mouse = items.find(it => it.product.category === 'Mouse')?.product;
      const keyboard = items.find(it => it.product.category === 'Keyboard')?.product;
      const mouseUsb = Array.isArray(mouse?.compatibleWith) && mouse?.compatibleWith.includes('usb-c');
      const kbUsb = Array.isArray(keyboard?.compatibleWith) && keyboard?.compatibleWith.includes('usb-c');
      if (!mouseUsb || !kbUsb) validCompatibility = false;
    }

    if (!validCompatibility || items.length < 2) continue;

    const sig = getBundleSignature(items);
    if (seenSignatures.has(sig)) continue;

    const itemSubtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
    const shippingFee = itemSubtotal > 0 ? (shippingRule.baseFee ?? 100) : 0;
    const taxAmount = Math.round(itemSubtotal * (taxRule.taxRate || 0));
    const landedPrice = itemSubtotal + shippingFee + taxAmount;

    if (maxBudget && maxBudget > 0 && landedPrice > maxBudget) continue;

    const bIndex = bundles.length;
    const adj = adjectives[bIndex % adjectives.length];
    const noun = nouns[bIndex % nouns.length];
    const name = `${adj} ${noun} #${bIndex + 1}`;
    const categories = Array.from(new Set(items.map(it => it.product.category)));

    bundles.push({
      id: `rnd-${bIndex + 1}`,
      name,
      tagline: `Curated random database selection of ${items.map(it => it.product.name).join(', ')}`,
      items,
      totalItemCount: items.length,
      itemSubtotal,
      shippingFee,
      taxAmount,
      landedPrice,
      budget: maxBudget ?? undefined,
      remainingBudget: maxBudget && maxBudget > 0 ? maxBudget - landedPrice : undefined,
      isWithinBudget: maxBudget && maxBudget > 0 ? landedPrice <= maxBudget : true,
      matchExplanation: `Algorithmic random bundle composed from active database products: ${items.map(it => `${it.product.name} (₹${it.product.price})`).join(' + ')}.`,
      isPredefined: false,
      isExactMatch: false,
      categories
    });

    seenSignatures.add(sig);
  }

  // If seeded random didn't fill to count, pad with baseline bundles
  if (bundles.length < count) {
    const baseline = getPredefinedBaselineBundles(allProducts, shippingRule, taxRule, maxBudget ?? undefined);
    for (const b of baseline) {
      if (bundles.length >= count) break;
      const sig = getBundleSignature(b.items);
      if (!seenSignatures.has(sig)) {
        bundles.push(b);
        seenSignatures.add(sig);
      }
    }
  }

  return bundles.slice(0, count);
}

