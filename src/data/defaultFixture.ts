import { FixtureData, Product, RequiredSlot, ReferenceRequest } from '../types';
import fixtureJson from './fixture.json';

export function mapC07Fixture(raw: any = fixtureJson): FixtureData {
  const records = raw.records || {};
  const rawProducts = records.products || [];
  const rawSlots = records.required_slots || ['Mouse', 'Keyboard'];
  const rawRequests = records.reference_requests || [];

  const products: Product[] = rawProducts.map((p: any) => {
    const isUsbC = Array.isArray(p.compatible_with) && p.compatible_with.includes('usb-c');
    const inStock = typeof p.stock === 'number' ? p.stock > 0 : Boolean(p.inStock);
    const stockQty = typeof p.stock === 'number' ? p.stock : (p.stockQuantity ?? (inStock ? 10 : 0));
    const price = p.price_inr ?? p.price ?? 0;
    const unitCost = p.unit_cost_inr ?? p.unitCostInr ?? Math.round(price * 0.6);

    return {
      id: p.product_id || p.id,
      name: p.title || p.name,
      category: p.category,
      price: price,
      inStock: inStock,
      stockQuantity: stockQty,
      brand: p.category === 'Mouse' || p.category === 'Keyboard' || p.category === 'Hub' 
        ? 'Peripherals' 
        : p.category === 'Tshirt' || p.category === 'Backpack' 
        ? 'C07 Apparel' 
        : 'C07 Essentials',
      model: p.product_id || p.id,
      description: `${p.colour || ''} ${p.title || p.name}${p.size && p.size !== 'One' ? ' (Size: ' + p.size + ')' : ''} · Unit Cost: ₹${unitCost}`,
      weightKg: p.category === 'Monitor' ? 6.5 : p.category === 'Stand' ? 2.5 : p.category === 'Backpack' ? 1.0 : p.category === 'Keyboard' ? 0.7 : p.category === 'Mouse' ? 0.2 : 0.4,
      image: p.image,
      unitCostInr: unitCost,
      size: p.size,
      colour: p.colour,
      compatibleWith: p.compatible_with || [],
      attributes: {
        connector: isUsbC ? 'usb-c' : undefined,
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

  const requiredSlots: RequiredSlot[] = rawSlots.map((slotName: string) => ({
    id: slotName,
    label: slotName,
    category: slotName,
    description: `Required ${slotName} peripheral compatible with ${records.compatible_port || 'usb-c'}.`,
    priority: 'required'
  }));

  const referenceRequests: ReferenceRequest[] = rawRequests.map((req: any) => {
    const hasExpected = Array.isArray(req.expected_ids) && req.expected_ids.length > 0;
    return {
      id: req.id,
      title: `Reference Request ${req.id} (Budget: ₹${Number(req.budget_inr).toLocaleString('en-IN')})`,
      budget: req.budget_inr,
      activityId: 'c07-bundle',
      requiredSlotIds: req.required_slots || rawSlots,
      description: `Target budget ₹${req.budget_inr} with shipping fee ₹${req.shipping_inr} and ${req.required_port || 'usb-c'} port. Expected: ${hasExpected ? req.expected_ids.join(', ') : 'None (Infeasible)'}.`,
      expectedFeasible: hasExpected,
      expectedLandedPriceMax: req.expected_total_inr ?? undefined,
      expectedIds: req.expected_ids || [],
      requiredPort: req.required_port || 'usb-c',
      notes: `Expected Landed Total: ${req.expected_total_inr ? '₹' + req.expected_total_inr : 'Infeasible (Null)'}`
    };
  });

  return {
    version: raw.data_version ? `v${raw.data_version}-c07` : '3.2.0-c07',
    isSynthetic: true,
    activity: {
      id: raw.case_id || 'C07',
      name: 'C07 Product Bundle',
      description: 'Budget-based product bundle builder satisfying compatibility matrix and required slot constraints.',
      defaultBudget: records.budget_inr || 2200,
      requiredSlots
    },
    products,
    shippingRule: {
      baseFee: records.shipping_inr ?? 100,
      freeShippingThreshold: 999999, // Flat shipping charge in C07 benchmark
      heavyItemSurchargePerItem: 0,
      heavyThresholdKg: 999
    },
    taxRule: {
      taxRate: 0, // Benchmark total 2000 = 700 (mouse) + 1200 (keyboard) + 100 (shipping)
      taxName: 'Tax Included (0% extra)'
    },
    compatibilityRules: [
      {
        id: 'c07_port_compatibility',
        name: 'USB-C Peripheral Port Compatibility',
        categoryA: 'Mouse',
        categoryB: 'Keyboard',
        description: 'Selected peripheral devices must support the specified USB-C connection standard.',
        validatorType: 'explicit_id_block'
      }
    ],
    referenceRequests
  };
}

export const C07_DEFAULT_FIXTURE: FixtureData = mapC07Fixture(fixtureJson);
export const DEFAULT_SYNTHETIC_FIXTURE: FixtureData = C07_DEFAULT_FIXTURE;

export const WFH_SYNTHETIC_FIXTURE: FixtureData = {
  version: "1.0.0-synthetic-c07",
  isSynthetic: true,
  activity: {
    id: "wfh",
    name: "Work from Home",
    description: "Complete ergonomic home workstation with display, seating, desk, docking, input peripherals, and task lighting.",
    defaultBudget: 75000,
    requiredSlots: [
      {
        id: "desk",
        label: "Workstation Desk",
        category: "desk",
        description: "Primary work surface with appropriate width, depth, and cable clearance.",
        priority: "required"
      },
      {
        id: "chair",
        label: "Ergonomic Chair",
        category: "chair",
        description: "Posture-supporting task chair with adjustable lumbar and armrests.",
        priority: "required"
      },
      {
        id: "monitor",
        label: "Main Display",
        category: "monitor",
        description: "Productivity monitor with certified eye-care and display inputs.",
        priority: "required"
      },
      {
        id: "laptop_stand_or_dock",
        label: "Dock & Laptop Riser",
        category: "laptop_stand_or_dock",
        description: "Hub or dock providing video passthrough and power delivery.",
        priority: "required"
      },
      {
        id: "peripherals",
        label: "Keyboard & Mouse Combo",
        category: "peripherals",
        description: "Precision wireless or low-latency productivity input set.",
        priority: "required"
      },
      {
        id: "lighting",
        label: "Desk / Screen Task Light",
        category: "lighting",
        description: "Glare-free illumination for reduced eye strain during long shifts.",
        priority: "required"
      }
    ]
  },
  shippingRule: {
    baseFee: 499,
    freeShippingThreshold: 50000,
    heavyItemSurchargePerItem: 450,
    heavyThresholdKg: 15
  },
  taxRule: {
    taxRate: 0.18,
    taxName: "18% Goods & Services Tax (GST)"
  },
  compatibilityRules: [
    {
      id: "desk_width_vs_ultrawide",
      name: "Desk Width vs Ultrawide Monitor",
      categoryA: "desk",
      categoryB: "monitor",
      description: "Ultrawide monitors (>=34 inches) require a desk with width >= 120 cm to prevent overhang and structural instability.",
      validatorType: "desk_width_vs_ultrawide"
    },
    {
      id: "clamp_vs_monitor",
      name: "ScreenBar Light vs Curved Display",
      categoryA: "lighting",
      categoryB: "monitor",
      description: "ScreenBar clamp lights are incompatible with extreme curved monitors without specialized weighted base lamps.",
      validatorType: "clamp_vs_monitor"
    },
    {
      id: "chair_clearance",
      name: "Wide Executive Chair vs Compact Desk",
      categoryA: "chair",
      categoryB: "desk",
      description: "Executive chairs with wide fixed arms cannot tuck under compact desks (< 100 cm width or < 60 cm depth).",
      validatorType: "chair_clearance"
    },
    {
      id: "explicit_id_block",
      name: "Explicit Hardware Port Discrepancy",
      categoryA: "monitor",
      categoryB: "laptop_stand_or_dock",
      description: "Monitors with legacy ports cannot directly connect to port-restricted ultra-slim hubs without converters.",
      validatorType: "explicit_id_block"
    }
  ],
  products: [
    // --- DESKS ---
    {
      id: "DSK-001",
      name: "ErgoLift Dual-Motor Standing Desk (140x70cm)",
      category: "desk",
      price: 24999,
      inStock: true,
      stockQuantity: 14,
      brand: "ErgoFlex",
      model: "EL-140D",
      description: "Electric height-adjustable motorized frame with heavy-duty engineered oak top and dual grommets.",
      weightKg: 28,
      attributes: {
        deskWidthCm: 140,
        deskDepthCm: 70,
        weightCapacityKg: 100,
        ergonomicGrade: "Tier-1"
      }
    },
    {
      id: "DSK-002",
      name: "Nordic Minimalist Fixed Desk (120x60cm)",
      category: "desk",
      price: 11499,
      inStock: true,
      stockQuantity: 22,
      brand: "StudioNord",
      model: "SN-120F",
      description: "Sturdy powder-coated steel A-frame with scratch-resistant birch veneer top and cable trough.",
      weightKg: 18,
      attributes: {
        deskWidthCm: 120,
        deskDepthCm: 60,
        weightCapacityKg: 75,
        ergonomicGrade: "Tier-2"
      }
    },
    {
      id: "DSK-003",
      name: "Compact Urban Study Desk (90x50cm)",
      category: "desk",
      price: 6499,
      inStock: true,
      stockQuantity: 30,
      brand: "UrbanSpace",
      model: "US-90C",
      description: "Space-saving compact desk designed for tight studio apartments and micro-offices.",
      weightKg: 12,
      attributes: {
        deskWidthCm: 90,
        deskDepthCm: 50,
        weightCapacityKg: 40,
        ergonomicGrade: "Standard"
      }
    },
    {
      id: "DSK-004",
      name: "Vertex Pro Corner L-Desk (160x110cm)",
      category: "desk",
      price: 32999,
      inStock: false, // Out of stock example
      stockQuantity: 0,
      brand: "VertexPro",
      model: "VX-160L",
      description: "Spacious corner layout for multi-monitor setups with reinforced steel support chassis.",
      weightKg: 34,
      attributes: {
        deskWidthCm: 160,
        deskDepthCm: 110,
        weightCapacityKg: 120,
        ergonomicGrade: "Tier-1"
      }
    },

    // --- CHAIRS ---
    {
      id: "CHR-001",
      name: "AeroMesh Ergonomic Task Chair with 3D Lumbar",
      category: "chair",
      price: 14999,
      inStock: true,
      stockQuantity: 18,
      brand: "SitWell",
      model: "AM-300",
      description: "Breathable Korean mesh with self-adjusting lumbar support, tilt-lock, and 3D armrests.",
      weightKg: 16,
      attributes: {
        chairArmrest: "4d_adjustable",
        ergonomicGrade: "Tier-1"
      }
    },
    {
      id: "CHR-002",
      name: "Orthopedic High-Back Executive Leather Chair",
      category: "chair",
      price: 18999,
      inStock: true,
      stockQuantity: 8,
      brand: "PrestigeOffice",
      model: "PO-EXEC",
      description: "Plush multi-layer memory foam with wide fixed padded armrests and heavy-duty steel base.",
      weightKg: 22,
      attributes: {
        chairArmrest: "fixed",
        ergonomicGrade: "Tier-2"
      },
      notes: "Requires minimum 120cm desk due to wide fixed arm clearance."
    },
    {
      id: "CHR-003",
      name: "Basic Breathable Mid-Back Office Chair",
      category: "chair",
      price: 5999,
      inStock: true,
      stockQuantity: 45,
      brand: "UrbanSpace",
      model: "UB-CH2",
      description: "Standard pneumatic height adjustment, nylon casters, and breathable mesh back.",
      weightKg: 11,
      attributes: {
        chairArmrest: "flip_up",
        ergonomicGrade: "Standard"
      }
    },
    {
      id: "CHR-004",
      name: "Zero-Gravity Active Balancing Stool",
      category: "chair",
      price: 8499,
      inStock: false, // Out of stock example
      stockQuantity: 0,
      brand: "ActiveSpine",
      model: "AS-WOB",
      description: "Core-engaging active wobble stool designed for sit-stand transition desks.",
      weightKg: 9,
      attributes: {
        chairArmrest: "fixed",
        ergonomicGrade: "Standard"
      }
    },

    // --- MONITORS ---
    {
      id: "MON-001",
      name: "27-inch 4K UHD IPS USB-C Designer Monitor",
      category: "monitor",
      price: 26999,
      inStock: true,
      stockQuantity: 12,
      brand: "ViewMaster",
      model: "VM-274K",
      description: "3840x2160 resolution, 99% sRGB, 65W USB-C Single Cable Power Delivery, flat bezel.",
      weightKg: 6.2,
      attributes: {
        connector: "usb-c",
        monitorMountType: "integrated_stand",
        powerConsumptionWatts: 45,
        ergonomicGrade: "Tier-1"
      }
    },
    {
      id: "MON-002",
      name: "24-inch FHD IPS 100Hz Eye-Care Monitor",
      category: "monitor",
      price: 9499,
      inStock: true,
      stockQuantity: 28,
      brand: "ClearPix",
      model: "CP-24FHD",
      description: "1920x1080 resolution, HDMI & DisplayPort, Flicker-Free TUV certified, ultra-thin flat bezel.",
      weightKg: 4.1,
      attributes: {
        connector: "hdmi",
        monitorMountType: "integrated_stand",
        powerConsumptionWatts: 25,
        ergonomicGrade: "Tier-2"
      }
    },
    {
      id: "MON-003",
      name: "34-inch WQHD Curved 1500R Ultrawide Display",
      category: "monitor",
      price: 34999,
      inStock: true,
      stockQuantity: 7,
      brand: "UltraHorizon",
      model: "UH-34UW",
      description: "3440x1440 immersive curved screen with 1500R curvature, dual HDMI 2.0, DP 1.4.",
      weightKg: 8.9,
      attributes: {
        connector: "hdmi",
        monitorMountType: "integrated_stand",
        powerConsumptionWatts: 60,
        ergonomicGrade: "Tier-1"
      },
      notes: "Requires >=120cm desk width and is incompatible with screenbar clamp lights due to curvature."
    },
    {
      id: "MON-004",
      name: "Budget 21.5-inch 1080p Essential Screen (Legacy HDMI/VGA)",
      category: "monitor",
      price: 5499,
      inStock: true,
      stockQuantity: 20,
      brand: "BasicView",
      model: "BV-22",
      description: "Entry-level desktop screen with VGA and HDMI 1.4 input ports.",
      weightKg: 3.2,
      attributes: {
        connector: "hdmi",
        monitorMountType: "integrated_stand",
        powerConsumptionWatts: 18,
        ergonomicGrade: "Standard"
      },
      incompatibleProductIds: ["DCK-003"] // Incompatible with mini dock that has no HDMI
    },

    // --- DOCKS & STANDS ---
    {
      id: "DCK-001",
      name: "Thunderbolt 4 Triple-Display Pro Dock (96W PD)",
      category: "laptop_stand_or_dock",
      price: 13999,
      inStock: true,
      stockQuantity: 15,
      brand: "OmniHub",
      model: "TB4-96",
      description: "12-in-1 enterprise dock with 96W upstream charging, Dual HDMI 2.1, DP 1.4, Gigabit LAN.",
      weightKg: 0.8,
      attributes: {
        connector: "thunderbolt",
        powerDeliveryWatts: 96,
        ergonomicGrade: "Tier-1"
      }
    },
    {
      id: "DCK-002",
      name: "USB-C 7-in-1 Multiport Hub with Foldable Aluminum Stand",
      category: "laptop_stand_or_dock",
      price: 3999,
      inStock: true,
      stockQuantity: 35,
      brand: "AluMount",
      model: "AM-7HUB",
      description: "Integrated riser stand with HDMI 4K@60Hz, 3x USB-A 3.0, SD card reader, and 100W PD pass-through.",
      weightKg: 0.6,
      attributes: {
        connector: "usb-c",
        powerDeliveryWatts: 85,
        ergonomicGrade: "Tier-2"
      }
    },
    {
      id: "DCK-003",
      name: "Ultra-Portable USB-C Mini Hub (DisplayPort only, No HDMI)",
      category: "laptop_stand_or_dock",
      price: 2199,
      inStock: true,
      stockQuantity: 19,
      brand: "PocketConnect",
      model: "PC-DP",
      description: "Minimalist travel adapter with 1x DisplayPort and 2x USB-A ports (No HDMI port onboard).",
      weightKg: 0.2,
      attributes: {
        connector: "usb-c",
        powerDeliveryWatts: 45,
        ergonomicGrade: "Standard"
      },
      incompatibleProductIds: ["MON-004"] // Incompatible with MON-004
    },
    {
      id: "DCK-004",
      name: "Heavy-Duty Dual-Arm Monitor & Laptop Gas-Spring Arm",
      category: "laptop_stand_or_dock",
      price: 6999,
      inStock: true,
      stockQuantity: 14,
      brand: "FlexArm",
      model: "FA-DUAL",
      description: "Desk clamp mounting dual arm supporting VESA monitors up to 32 inches and laptop tray.",
      weightKg: 4.8,
      attributes: {
        connector: "usb-c",
        monitorMountType: "clamp",
        weightCapacityKg: 18,
        ergonomicGrade: "Tier-1"
      }
    },

    // --- PERIPHERALS ---
    {
      id: "PER-001",
      name: "Ergonomic Split Wireless Mechanical Keyboard & Vertical Mouse",
      category: "peripherals",
      price: 9999,
      inStock: true,
      stockQuantity: 16,
      brand: "NaturalType",
      model: "NT-SPLIT",
      description: "Curved split keyboard with cushioned wrist rest and 57-degree vertical ergonomic optical mouse.",
      weightKg: 1.4,
      attributes: {
        connector: "wireless",
        ergonomicGrade: "Tier-1"
      }
    },
    {
      id: "PER-002",
      name: "Silent Multi-Device Bluetooth Keyboard & Precision Mouse Combo",
      category: "peripherals",
      price: 4499,
      inStock: true,
      stockQuantity: 40,
      brand: "QuietDesk",
      model: "QD-BT2",
      description: "Low-profile scissor switches with WhisperTouch dampening and optical precision mouse.",
      weightKg: 0.9,
      attributes: {
        connector: "wireless",
        ergonomicGrade: "Tier-2"
      }
    },
    {
      id: "PER-003",
      name: "Standard Wired Spill-Resistant Keyboard & Mouse",
      category: "peripherals",
      price: 1299,
      inStock: true,
      stockQuantity: 60,
      brand: "UrbanSpace",
      model: "US-KB1",
      description: "Reliable USB plug-and-play wired keyboard with drain channels and ambidextrous mouse.",
      weightKg: 0.8,
      attributes: {
        connector: "wired",
        ergonomicGrade: "Standard"
      }
    },

    // --- LIGHTING ---
    {
      id: "LGT-001",
      name: "Asymmetric ScreenBar Monitor Light with Wireless Rotary Dial",
      category: "lighting",
      price: 5499,
      inStock: true,
      stockQuantity: 25,
      brand: "LumiBar",
      model: "LB-PRO",
      description: "Patented asymmetric optical clip mounting directly atop flat screen bezels without screen glare.",
      weightKg: 0.5,
      attributes: {
        lightMountType: "screen_clamp",
        ergonomicGrade: "Tier-1"
      },
      notes: "Incompatible with curved monitors (1500R or greater curvature)."
    },
    {
      id: "LGT-002",
      name: "Architect Gooseneck Weighted Base LED Task Lamp",
      category: "lighting",
      price: 2999,
      inStock: true,
      stockQuantity: 30,
      brand: "StudioNord",
      model: "SN-LAMP",
      description: "Heavy cast-iron weighted desk base with flexible gooseneck arm, 5 color temps, stepless dimming.",
      weightKg: 2.1,
      attributes: {
        lightMountType: "weighted_base",
        ergonomicGrade: "Tier-2"
      }
    },
    {
      id: "LGT-003",
      name: "USB Clip-On Eye-Care Ring Light",
      category: "lighting",
      price: 1199,
      inStock: true,
      stockQuantity: 50,
      brand: "GlowDesk",
      model: "GD-RING",
      description: "Universal clip-on ring light with inline controller and USB power.",
      weightKg: 0.4,
      attributes: {
        lightMountType: "screen_clamp",
        ergonomicGrade: "Standard"
      }
    }
  ],
  referenceRequests: [
    {
      id: "REF-001",
      title: "Budget Conscious WFH Starter Pack",
      budget: 35000,
      activityId: "wfh",
      requiredSlotIds: ["desk", "chair", "monitor", "laptop_stand_or_dock", "peripherals", "lighting"],
      description: "Test minimum possible bundle cost with entry-level items under tight budget constraint.",
      expectedFeasible: true,
      expectedLandedPriceMax: 35000,
      notes: "Tests whether the system selects valid in-stock budget items within ₹35,000 including tax and shipping."
    },
    {
      id: "REF-002",
      title: "Standard Professional Ergonomic Workstation",
      budget: 65000,
      activityId: "wfh",
      requiredSlotIds: ["desk", "chair", "monitor", "laptop_stand_or_dock", "peripherals", "lighting"],
      description: "Standard corporate remote stipend setup requiring Tier-2 or Tier-1 ergonomic items.",
      expectedFeasible: true,
      expectedLandedPriceMax: 65000,
      notes: "Verifies high-quality component selection with positive remaining budget buffer."
    },
    {
      id: "REF-003",
      title: "Executive Standing Desk Setup",
      budget: 95000,
      activityId: "wfh",
      requiredSlotIds: ["desk", "chair", "monitor", "laptop_stand_or_dock", "peripherals", "lighting"],
      description: "Premium motorized standing desk with 4K display and split ergonomic keyboard.",
      expectedFeasible: true,
      expectedLandedPriceMax: 95000,
      notes: "Tests premium Tier-1 components with free shipping threshold qualification."
    },
    {
      id: "REF-004",
      title: "Ultra-Constrained Student Budget (Sub-feeder)",
      budget: 15000,
      activityId: "wfh",
      requiredSlotIds: ["desk", "chair", "monitor", "laptop_stand_or_dock", "peripherals", "lighting"],
      description: "Customer budget lower than the sum of the cheapest in-stock products plus tax/shipping.",
      expectedFeasible: false,
      notes: "Must correctly report infeasible due to budget constraints, without producing a false-positive bundle."
    },
    {
      id: "REF-005",
      title: "Ultrawide Curved Display on Compact Desk (Constraint Violation)",
      budget: 80000,
      activityId: "wfh",
      requiredSlotIds: ["desk", "chair", "monitor", "laptop_stand_or_dock", "peripherals", "lighting"],
      preselectedItems: {
        desk: "DSK-003", // 90cm compact desk
        monitor: "MON-003" // 34-inch ultrawide requiring 120cm
      },
      description: "Customer attempts to pair a 34-inch ultrawide screen with a 90cm compact desk.",
      expectedFeasible: false,
      notes: "Validator must reject this combination and explain desk width rule violation."
    },
    {
      id: "REF-006",
      title: "Curved Ultrawide Screen with ScreenBar Clamp Light",
      budget: 85000,
      activityId: "wfh",
      requiredSlotIds: ["desk", "chair", "monitor", "laptop_stand_or_dock", "peripherals", "lighting"],
      preselectedItems: {
        monitor: "MON-003",
        lighting: "LGT-001"
      },
      description: "ScreenBar clamp light mounted to 1500R curved monitor without flat top mount.",
      expectedFeasible: false,
      notes: "Compatibility validator must flag physical mounting incompatibility."
    },
    {
      id: "REF-007",
      title: "Out-of-Stock Product Request (L-Desk)",
      budget: 110000,
      activityId: "wfh",
      requiredSlotIds: ["desk", "chair", "monitor", "laptop_stand_or_dock", "peripherals", "lighting"],
      preselectedItems: {
        desk: "DSK-004" // Out of stock
      },
      description: "Preselected desk has zero inventory in the warehouse.",
      expectedFeasible: false,
      notes: "Validation must mark bundle invalid due to out-of-stock item DSK-004."
    },
    {
      id: "REF-008",
      title: "Budget Boundary Shipping Threshold Test",
      budget: 29000,
      activityId: "wfh",
      requiredSlotIds: ["desk", "chair", "monitor", "laptop_stand_or_dock", "peripherals", "lighting"],
      description: "Subtotal plus GST is under ₹29,000 (₹28,903), but net shipping (+₹499) pushes final landed price to ₹29,402, making it infeasible.",
      expectedFeasible: false,
      notes: "Evaluates exact landed price calculation (subtotal + shipping + GST) against customer limit."
    },
    {
      id: "REF-009",
      title: "Port Incompatibility (VGA/HDMI Only Monitor with DP Mini Hub)",
      budget: 50000,
      activityId: "wfh",
      requiredSlotIds: ["desk", "chair", "monitor", "laptop_stand_or_dock", "peripherals", "lighting"],
      preselectedItems: {
        monitor: "MON-004",
        laptop_stand_or_dock: "DCK-003"
      },
      description: "Monitor has only legacy HDMI/VGA while the selected hub only outputs DisplayPort.",
      expectedFeasible: false,
      notes: "Explicit incompatibility rule should trigger and block bundle approval."
    },
    {
      id: "REF-010",
      title: "Feasible Replacement Restores Valid State",
      budget: 70000,
      activityId: "wfh",
      requiredSlotIds: ["desk", "chair", "monitor", "laptop_stand_or_dock", "peripherals", "lighting"],
      preselectedItems: {
        desk: "DSK-002",
        chair: "CHR-001",
        monitor: "MON-002",
        laptop_stand_or_dock: "DCK-002",
        peripherals: "PER-002",
        lighting: "LGT-002"
      },
      description: "Pre-configured combination of compatible, in-stock products with landed price under ₹70,000.",
      expectedFeasible: true,
      notes: "Demonstrates complete successful validation with zero warnings or errors."
    }
  ]
};
