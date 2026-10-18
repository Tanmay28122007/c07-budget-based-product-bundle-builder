import { FixtureData, Product, RequiredSlot, SavedBundle } from '../types';
import { validateBundle } from '../utils/bundleValidation';

// ---------------------------------------------------------------------------
// 1. Required Slots for "Home Appliances" Activity
// ---------------------------------------------------------------------------
export const HOME_APPLIANCE_SLOTS: RequiredSlot[] = [
  {
    id: 'kitchen_cooking',
    label: 'Cooking & Meal Prep',
    category: 'Kitchen & Cooking',
    description: 'Primary high-efficiency heating or cooking appliance (Air Fryer, Induction Cooktop, Multi-Cooker, Microwave).',
    priority: 'required'
  },
  {
    id: 'cleaning_care',
    label: 'Cleaning & Fabric Care',
    category: 'Cleaning & Floorcare',
    description: 'Automated or cordless cleaning and garment sanitation appliance (Robot Vacuum, Stick Vacuum, Garment Steamer).',
    priority: 'required'
  },
  {
    id: 'air_climate',
    label: 'Air Quality & Climate',
    category: 'Air & Climate',
    description: 'Household environmental wellness (HEPA Air Purifier, Cool Mist Humidifier, Tower Fan, Dehumidifier).',
    priority: 'required'
  },
  {
    id: 'beverage_station',
    label: 'Beverage & Hydration',
    category: 'Beverage & Water',
    description: 'Dedicated beverage and pure water brewing station (Espresso Machine, Electric Kettle, Slow Juicer, UV Water Purifier).',
    priority: 'required'
  },
  {
    id: 'countertop_prep',
    label: 'Countertop & Breakfast',
    category: 'Countertop Prep',
    description: 'Quick-prep countertop appliances for daily culinary needs (Food Processor, Stand Mixer, Smart Toaster, Sandwich Grill).',
    priority: 'required'
  }
];

// ---------------------------------------------------------------------------
// 2. Realistic Catalog of Home Appliances Products (25 Products)
// ---------------------------------------------------------------------------
export const HOME_APPLIANCE_PRODUCTS: Product[] = [
  // Category 1: Kitchen & Cooking
  {
    id: 'HA-COOK-01',
    name: 'Smart Dual-Zone Digital Air Fryer (6.5L)',
    category: 'Kitchen & Cooking',
    brand: 'Aerocook Pro',
    model: 'AC-650D',
    price: 4999,
    unitCostInr: 2850,
    inStock: true,
    stockQuantity: 18,
    weightKg: 4.8,
    image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=600&q=80',
    description: '360° rapid cyclonic heat, dual basket sync finish, 8 preset touch modes, oil-free crisping.',
    attributes: {
      powerWatts: 1700,
      capacityLiters: 6.5,
      temperatureRange: '40°C - 200°C',
      dishwasherSafe: true,
      dimensionsCm: { width: 32, depth: 36, height: 34 }
    }
  },
  {
    id: 'HA-COOK-02',
    name: 'Instant Chef 9-in-1 Programmable Multi-Cooker (6L)',
    category: 'Kitchen & Cooking',
    brand: 'CulinaMaster',
    model: 'CM-MC60',
    price: 5799,
    unitCostInr: 3300,
    inStock: true,
    stockQuantity: 14,
    weightKg: 5.6,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    description: 'Pressure cook, slow cook, sauté, yogurt maker, sous vide, and steamer with auto-pressure release.',
    attributes: {
      powerWatts: 1000,
      capacityLiters: 6.0,
      safetyValves: 10,
      innerPot: '304 Food-grade Stainless Steel',
      dimensionsCm: { width: 34, depth: 33, height: 35 }
    }
  },
  {
    id: 'HA-COOK-03',
    name: 'Slimline Touch Induction Cooktop (2200W)',
    category: 'Kitchen & Cooking',
    brand: 'ElectraFlame',
    model: 'EF-IND22',
    price: 2699,
    unitCostInr: 1550,
    inStock: true,
    stockQuantity: 25,
    weightKg: 2.7,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    description: 'High-energy crystalline glass surface, 8 Indian cooking presets, auto-pan detection, and surge protector.',
    attributes: {
      powerWatts: 2200,
      timerMinutes: 180,
      childLock: true,
      dimensionsCm: { width: 28, depth: 36, height: 6 }
    }
  },
  {
    id: 'HA-COOK-04',
    name: 'Convection Microwave & Rotisserie Oven (28L)',
    category: 'Kitchen & Cooking',
    brand: 'ThermoBake Pro',
    model: 'TB-28ROT',
    price: 8999,
    unitCostInr: 5400,
    inStock: true,
    stockQuantity: 9,
    weightKg: 14.8,
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80',
    description: 'Bake, grill, reheat, and crisp with auto-cook menu, motorized rotisserie spit, and deodorizer cycle.',
    attributes: {
      powerWatts: 1400,
      capacityLiters: 28,
      cavityType: 'Stainless Steel Antibacterial',
      dimensionsCm: { width: 51, depth: 42, height: 31 }
    }
  },
  {
    id: 'HA-COOK-05',
    name: 'Precision Sous Vide Immersion Circulator (1100W)',
    category: 'Kitchen & Cooking',
    brand: 'GourmetLab',
    model: 'GL-SV11',
    price: 4499,
    unitCostInr: 2600,
    inStock: true,
    stockQuantity: 12,
    weightKg: 1.3,
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80',
    description: 'Restaurant-grade 0.1°C thermal accuracy, digital water-resistant display, clamp mount fits any pot.',
    attributes: {
      powerWatts: 1100,
      accuracy: '±0.1°C',
      flowRateLpm: 8,
      dimensionsCm: { width: 9, depth: 12, height: 38 }
    }
  },

  // Category 2: Cleaning & Floorcare
  {
    id: 'HA-CLN-01',
    name: 'LDS LiDAR Smart Robot Vacuum & Sonic Wet Mop',
    category: 'Cleaning & Floorcare',
    brand: 'RoboClean Sense',
    model: 'RC-9000L',
    price: 17999,
    unitCostInr: 10800,
    inStock: true,
    stockQuantity: 11,
    weightKg: 4.2,
    image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=600&q=80',
    description: '4000Pa intense suction, 360° laser room mapping, automatic carpet boost, app scheduling, virtual no-go zones.',
    attributes: {
      suctionPa: 4000,
      batteryMah: 5200,
      runtimeMinutes: 180,
      dustbinCapacityMl: 550,
      waterTankMl: 300
    }
  },
  {
    id: 'HA-CLN-02',
    name: 'Cyclone Ultra Cordless Stick Vacuum (23000Pa)',
    category: 'Cleaning & Floorcare',
    brand: 'VortexAir',
    model: 'VA-STK23',
    price: 7999,
    unitCostInr: 4600,
    inStock: true,
    stockQuantity: 16,
    weightKg: 2.2,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80',
    description: 'Brushless 350W motor, motorized LED floor brush, 5-stage HEPA filtration, transforms into handheld vac.',
    attributes: {
      motorWatts: 350,
      suctionPa: 23000,
      runtimeMinutes: 50,
      attachments: ['Crevice tool', 'Motorized mini mattress brush', '2-in-1 dusting tool']
    }
  },
  {
    id: 'HA-CLN-03',
    name: 'Pro Handheld Garment Steamer & Sanitizer (1800W)',
    category: 'Cleaning & Floorcare',
    brand: 'SteamPure',
    model: 'SP-1800G',
    price: 2499,
    unitCostInr: 1400,
    inStock: true,
    stockQuantity: 22,
    weightKg: 1.8,
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
    description: 'Heats in 25 seconds, continuous steam output 32g/min, ceramic soleplate kills 99.9% of bacteria and mites.',
    attributes: {
      powerWatts: 1800,
      waterTankCapacityMl: 320,
      steamRateGpm: 32,
      cordLengthMeters: 2.5
    }
  },
  {
    id: 'HA-CLN-04',
    name: 'Smart Countertop Dishwasher (5 Place Settings)',
    category: 'Cleaning & Floorcare',
    brand: 'AquaWash Studio',
    model: 'AW-CT05',
    price: 19499,
    unitCostInr: 12200,
    inStock: true,
    stockQuantity: 7,
    weightKg: 13.5,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    description: '70°C high-temp hygiene wash, built-in 5L water tank (no plumbing required), hot air drying cycle.',
    attributes: {
      powerWatts: 950,
      washCycles: 6,
      waterConsumptionLiters: 5,
      dimensionsCm: { width: 44, depth: 43, height: 46 }
    }
  },
  {
    id: 'HA-CLN-05',
    name: 'Ultrasonic Compact Fabric Shaver & Lint Cleanser',
    category: 'Cleaning & Floorcare',
    brand: 'PureTextile',
    model: 'PT-LNT02',
    price: 1199,
    unitCostInr: 650,
    inStock: true,
    stockQuantity: 30,
    weightKg: 0.35,
    image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80',
    description: 'Rechargeable 6-blade stainless steel honeycomb mesh, restores sweaters, blankets, and upholstery.',
    attributes: {
      batteryType: 'USB-C Rechargeable',
      rotationsPerMinute: 8500,
      runtimeHours: 2.5
    }
  },

  // Category 3: Air & Climate
  {
    id: 'HA-AIR-01',
    name: 'True HEPA 4-Stage Air Purifier with Real-time PM2.5',
    category: 'Air & Climate',
    brand: 'PureBreeze Home',
    model: 'PB-AP350',
    price: 7499,
    unitCostInr: 4300,
    inStock: true,
    stockQuantity: 15,
    weightKg: 4.6,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80',
    description: 'H13 medical-grade HEPA, activated carbon odor filter, CADR 320 m³/h, ultra-silent 24dB sleep mode.',
    attributes: {
      coverageSqFt: 420,
      cadrM3h: 320,
      filterStages: 4,
      sensorType: 'Laser Particle PM2.5'
    }
  },
  {
    id: 'HA-AIR-02',
    name: 'Ultrasonic Cool Mist Aromatherapy Humidifier (4.5L)',
    category: 'Air & Climate',
    brand: 'MistOasis',
    model: 'MO-HUM45',
    price: 1999,
    unitCostInr: 1100,
    inStock: true,
    stockQuantity: 24,
    weightKg: 1.4,
    image: 'https://images.unsplash.com/photo-1608248597359-bb583a2fc95d?auto=format&fit=crop&w=600&q=80',
    description: 'Top-fill design, 30 hours continuous mist, auto shut-off, aroma essential oil tray, ambient mood light.',
    attributes: {
      tankCapacityLiters: 4.5,
      mistOutputMlh: 280,
      noiseLevelDb: 26,
      timerHours: 12
    }
  },
  {
    id: 'HA-AIR-03',
    name: 'Bladeless Tower Air Circulator & Ionizer Fan',
    category: 'Air & Climate',
    brand: 'AeroGlide',
    model: 'AG-TWR42',
    price: 3899,
    unitCostInr: 2200,
    inStock: true,
    stockQuantity: 18,
    weightKg: 3.4,
    image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=600&q=80',
    description: '80° wide oscillation, 3 speed presets, negative ion generator for air freshening, wireless remote control.',
    attributes: {
      powerWatts: 45,
      oscillationDegrees: 80,
      heightCm: 105,
      noiseLevelDb: 35
    }
  },
  {
    id: 'HA-AIR-04',
    name: 'Compact Peltier Home Dehumidifier (1.5L Tank)',
    category: 'Air & Climate',
    brand: 'DryNest Home',
    model: 'DN-DEH15',
    price: 4799,
    unitCostInr: 2800,
    inStock: true,
    stockQuantity: 10,
    weightKg: 2.1,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    description: 'Removes up to 600ml moisture per day, auto-stops on full tank, prevents mold, mildew, and musty odors.',
    attributes: {
      dailyExtractionMl: 600,
      tankCapacityLiters: 1.5,
      powerWatts: 65,
      coverageSqFt: 220
    }
  },

  // Category 4: Beverage & Water
  {
    id: 'HA-BEV-01',
    name: 'Italian Barista 15-Bar Espresso & Steam Wand Machine',
    category: 'Beverage & Water',
    brand: 'Caffè Milano',
    model: 'CM-15BAR',
    price: 6999,
    unitCostInr: 4100,
    inStock: true,
    stockQuantity: 12,
    weightKg: 3.6,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
    description: '15-bar Italian pump pressure, commercial frothing wand, heated cup warmer plate, dual shot filter basket.',
    attributes: {
      pumpPressureBar: 15,
      powerWatts: 1350,
      waterTankLiters: 1.25,
      cupWarmer: true
    }
  },
  {
    id: 'HA-BEV-02',
    name: 'Smart Borosilicate Glass Electric Kettle (1.7L)',
    category: 'Beverage & Water',
    brand: 'AquaPure Glass',
    model: 'AP-KTL17',
    price: 1799,
    unitCostInr: 1050,
    inStock: true,
    stockQuantity: 28,
    weightKg: 1.2,
    image: 'https://images.unsplash.com/photo-1594213114663-ddf4f24cf742?auto=format&fit=crop&w=600&q=80',
    description: 'LED illumination ring, 5 temperature presets (for green tea, coffee, baby milk), 2-hour keep warm function.',
    attributes: {
      powerWatts: 1850,
      capacityLiters: 1.7,
      material: 'German Schott Borosilicate Glass',
      boilTimeMinutes: 4.5
    }
  },
  {
    id: 'HA-BEV-03',
    name: 'Cold Press Masticating Slow Juicer (55 RPM)',
    category: 'Beverage & Water',
    brand: 'VitalExtract',
    model: 'VE-SJ55',
    price: 5999,
    unitCostInr: 3500,
    inStock: true,
    stockQuantity: 13,
    weightKg: 4.1,
    image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80',
    description: 'Cold extrusion preserves 98% vitamins and enzymes, reverse anti-clog switch, whisper quiet motor.',
    attributes: {
      rpm: 55,
      powerWatts: 200,
      pulpSeparation: true,
      bpaFree: true
    }
  },
  {
    id: 'HA-BEV-04',
    name: 'Active Copper UV+RO Alkaline Water Purifier (7L)',
    category: 'Beverage & Water',
    brand: 'HydroPure Elite',
    model: 'HP-RO70',
    price: 10999,
    unitCostInr: 6800,
    inStock: true,
    stockQuantity: 8,
    weightKg: 7.8,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    description: '6-stage purification, copper infusion mineralizer, TDS controller, food grade tank with UV in-tank sterilization.',
    attributes: {
      purificationCapacityLph: 15,
      storageCapacityLiters: 7,
      tdsReductionPercentage: 95,
      stages: 6
    }
  },

  // Category 5: Countertop Prep
  {
    id: 'HA-PREP-01',
    name: 'Multi-Task Food Processor & Dough Kneader (800W)',
    category: 'Countertop Prep',
    brand: 'ChopMaster Pro',
    model: 'CMP-800',
    price: 3699,
    unitCostInr: 2150,
    inStock: true,
    stockQuantity: 17,
    weightKg: 3.3,
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80',
    description: 'Chop, slice, shred, grate, knead dough, and puree. Includes 6 stainless steel discs and safety interlock lid.',
    attributes: {
      motorWatts: 800,
      bowlCapacityLiters: 2.1,
      speedSettings: '2 Speeds + Pulse',
      bladesIncluded: 5
    }
  },
  {
    id: 'HA-PREP-02',
    name: 'Planetary Stand Mixer with Stainless Bowl (5.2L)',
    category: 'Countertop Prep',
    brand: 'BakeArtisan',
    model: 'BA-MX52',
    price: 6499,
    unitCostInr: 3900,
    inStock: true,
    stockQuantity: 10,
    weightKg: 5.9,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80',
    description: '1000W full-copper gear motor, tilt-head design, includes dough hook, wire whisk, and flat beater.',
    attributes: {
      powerWatts: 1000,
      bowlCapacityLiters: 5.2,
      speedSettings: 6,
      tiltHeadLock: true
    }
  },
  {
    id: 'HA-PREP-03',
    name: 'Non-Stick Panini Press & Belgian Waffle Maker',
    category: 'Countertop Prep',
    brand: 'GrillCraft',
    model: 'GC-WAF20',
    price: 1599,
    unitCostInr: 920,
    inStock: true,
    stockQuantity: 26,
    weightKg: 1.6,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    description: 'Interchangeable dual-sided non-stick plates, 180° flat grill opening for barbecue, indicator ready lights.',
    attributes: {
      powerWatts: 750,
      coating: 'PFOA-free Ceramic Non-stick',
      floatingHinge: true
    }
  },
  {
    id: 'HA-PREP-04',
    name: 'Artisan 4-Slice Extra-Wide Slot Smart Toaster',
    category: 'Countertop Prep',
    brand: 'ToastCraft Classic',
    model: 'TC-4SL',
    price: 2199,
    unitCostInr: 1250,
    inStock: true,
    stockQuantity: 20,
    weightKg: 1.9,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
    description: 'Dual independent browning dials, defrost, reheat, and bagel functions, removable slide-out crumb tray.',
    attributes: {
      powerWatts: 1400,
      slotWidthMm: 38,
      browningLevels: 7,
      autoCentering: true
    }
  },
  {
    id: 'HA-PREP-05',
    name: 'Smart Immersion Hand Blender Stick (600W Set)',
    category: 'Countertop Prep',
    brand: 'BlendSwift',
    model: 'BS-600SET',
    price: 1899,
    unitCostInr: 1100,
    inStock: true,
    stockQuantity: 25,
    weightKg: 1.1,
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=80',
    description: 'Titanium-cross 4-blade foot, includes 500ml chopper bowl, stainless egg whisk, and 600ml smoothie beaker.',
    attributes: {
      powerWatts: 600,
      turboMode: true,
      shaftMaterial: 'Stainless Steel',
      corded: true
    }
  },
  {
    id: 'HA-PREP-06',
    name: 'Digital Precision Kitchen Food Scale (5kg / 1g)',
    category: 'Countertop Prep',
    brand: 'WeighSmart',
    model: 'WS-5K',
    price: 999,
    unitCostInr: 520,
    inStock: true,
    stockQuantity: 35,
    weightKg: 0.45,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    description: 'Tempered glass platform, tare function, unit conversions (g, ml, oz, lb), blue backlit LCD display.',
    attributes: {
      maxWeightKg: 5,
      accuracyG: 1,
      units: ['g', 'ml', 'fl.oz', 'lb:oz'],
      battery: '2x AAA Included'
    }
  }
];

// ---------------------------------------------------------------------------
// 3. Shipping & Tax Rules for Home Appliances
// ---------------------------------------------------------------------------
export const HOME_APPLIANCE_SHIPPING = {
  baseFee: 399,
  freeShippingThreshold: 20000,
  heavyItemSurchargePerItem: 350,
  heavyThresholdKg: 10
};

export const HOME_APPLIANCE_TAX = {
  taxRate: 0.18,
  taxName: '18% GST (Home Electronics & Appliances)'
};

// ---------------------------------------------------------------------------
// 4. Complete Home Appliances Fixture Data
// ---------------------------------------------------------------------------
export const HOME_APPLIANCES_FIXTURE: FixtureData = {
  version: '2.0.0-home-appliances',
  isSynthetic: true,
  activity: {
    id: 'home-appliances',
    name: 'Home Appliances',
    description: 'Curated bundles for modern household needs: cooking, automated floorcare, air wellness, hydration, and countertop preparation.',
    defaultBudget: 35000,
    requiredSlots: HOME_APPLIANCE_SLOTS
  },
  products: HOME_APPLIANCE_PRODUCTS,
  shippingRule: HOME_APPLIANCE_SHIPPING,
  taxRule: HOME_APPLIANCE_TAX,
  compatibilityRules: [
    {
      id: 'high_wattage_safety',
      name: 'Simultaneous Heavy Circuit Load Safety Check',
      categoryA: 'Kitchen & Cooking',
      categoryB: 'Countertop Prep',
      description: 'Air Fryer and Stand Mixer paired together should utilize independent kitchen 16A wall outlets.',
      validatorType: 'explicit_id_block'
    }
  ],
  referenceRequests: [
    {
      id: 'HA-REQ-01',
      title: 'Compact Apartment Budget Essentials (Budget: ₹18,000)',
      budget: 18000,
      activityId: 'home-appliances',
      requiredSlotIds: ['kitchen_cooking', 'cleaning_care', 'air_climate', 'beverage_station', 'countertop_prep'],
      description: 'Affordable modern setup with induction, steamer, humidifier, glass kettle, and sandwich press.',
      expectedFeasible: true,
      expectedIds: ['HA-COOK-03', 'HA-CLN-03', 'HA-AIR-02', 'HA-BEV-02', 'HA-PREP-03']
    },
    {
      id: 'HA-REQ-02',
      title: 'Smart Automated Living Suite (Budget: ₹45,000)',
      budget: 45000,
      activityId: 'home-appliances',
      requiredSlotIds: ['kitchen_cooking', 'cleaning_care', 'air_climate', 'beverage_station', 'countertop_prep'],
      description: 'LDS Robot vacuum, air fryer, HEPA purifier, espresso machine, and smart food processor.',
      expectedFeasible: true,
      expectedIds: ['HA-COOK-01', 'HA-CLN-01', 'HA-AIR-01', 'HA-BEV-01', 'HA-PREP-01']
    }
  ]
};

// ---------------------------------------------------------------------------
// 5. Generator for Random & Varied Home Appliance Bundles
// ---------------------------------------------------------------------------
function findProduct(id: string): Product {
  const p = HOME_APPLIANCE_PRODUCTS.find(item => item.id === id);
  if (!p) throw new Error(`Product not found: ${id}`);
  return p;
}

export function createHomeBundleObject(
  name: string,
  budget: number,
  slotIdsToProductIds: Record<string, string>,
  notes: string = ''
): SavedBundle {
  const items: Record<string, Product | null> = {};
  for (const [slotId, prodId] of Object.entries(slotIdsToProductIds)) {
    items[slotId] = findProduct(prodId);
  }

  const validation = validateBundle(
    items,
    HOME_APPLIANCE_SLOTS,
    budget,
    HOME_APPLIANCE_SHIPPING,
    HOME_APPLIANCE_TAX
  );

  return {
    id: `BND-HA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    name,
    activityId: 'home-appliances',
    budget,
    items,
    validation,
    savedAt: new Date().toLocaleString(),
    notes
  };
}

// ---------------------------------------------------------------------------
// 6. Extensive Catalog of Pre-Built Home Appliances Bundles (12 Bundles)
// ---------------------------------------------------------------------------
export const INITIAL_HOME_APPLIANCE_BUNDLES: SavedBundle[] = [
  createHomeBundleObject(
    'Home Appliances - Smart Living Master Bundle',
    42000,
    {
      kitchen_cooking: 'HA-COOK-01', // Smart Dual-Zone Air Fryer (₹4,999)
      cleaning_care: 'HA-CLN-01',   // LDS LiDAR Robot Vacuum (₹17,999)
      air_climate: 'HA-AIR-01',     // True HEPA Air Purifier (₹7,499)
      beverage_station: 'HA-BEV-02',// Smart Glass Kettle (₹1,799)
      countertop_prep: 'HA-PREP-03' // Panini & Waffle Press (₹1,599)
    },
    'Flagship automated home bundle featuring robotic floor cleaning and healthy air frying.'
  ),
  createHomeBundleObject(
    'Home Appliances - Gourmet Kitchen & Culinary Pack',
    32000,
    {
      kitchen_cooking: 'HA-COOK-02', // Multi-Cooker (₹5,799)
      cleaning_care: 'HA-CLN-02',   // Cyclone Stick Vac (₹7,999)
      air_climate: 'HA-AIR-03',     // Bladeless Tower Fan (₹3,899)
      beverage_station: 'HA-BEV-01',// 15-Bar Espresso Machine (₹6,999)
      countertop_prep: 'HA-PREP-02' // Planetary Stand Mixer (₹6,499)
    },
    'Tailored for home chefs and bakers with high-torque mixing and barista espresso.'
  ),
  createHomeBundleObject(
    'Home Appliances - Compact Apartment Budget Suite',
    16000,
    {
      kitchen_cooking: 'HA-COOK-03', // Induction Cooktop (₹2,699)
      cleaning_care: 'HA-CLN-03',   // Garment Steamer (₹2,499)
      air_climate: 'HA-AIR-02',     // Cool Mist Humidifier (₹1,999)
      beverage_station: 'HA-BEV-02',// Electric Glass Kettle (₹1,799)
      countertop_prep: 'HA-PREP-04' // 4-Slice Smart Toaster (₹2,199)
    },
    'Ultra-affordable, space-efficient setup for starter studios and compact apartments.'
  ),
  createHomeBundleObject(
    'Home Appliances - Eco-Clean & Healthy Air Station',
    30000,
    {
      kitchen_cooking: 'HA-COOK-01', // Air Fryer (₹4,999)
      cleaning_care: 'HA-CLN-02',   // Stick Vac (₹7,999)
      air_climate: 'HA-AIR-01',     // HEPA Purifier (₹7,499)
      beverage_station: 'HA-BEV-03',// Slow Juicer (₹5,999)
      countertop_prep: 'HA-PREP-05' // Immersion Blender (₹1,899)
    },
    'Centered around air purification, clean-eating cold press juices, and HEPA vacuuming.'
  ),
  createHomeBundleObject(
    'Home Appliances - Quick Breakfast & Artisan Coffee Bar',
    20000,
    {
      kitchen_cooking: 'HA-COOK-03', // Induction Cooktop (₹2,699)
      cleaning_care: 'HA-CLN-03',   // Garment Steamer (₹2,499)
      air_climate: 'HA-AIR-03',     // Tower Fan (₹3,899)
      beverage_station: 'HA-BEV-01',// Espresso Machine (₹6,999)
      countertop_prep: 'HA-PREP-04' // 4-Slice Toaster (₹2,199)
    },
    'The ultimate morning routine station with Italian espresso, warm toast, and rapid steam.'
  ),
  createHomeBundleObject(
    'Home Appliances - Complete Family Banquet Pack',
    35000,
    {
      kitchen_cooking: 'HA-COOK-04', // Convection Microwave (₹8,999)
      cleaning_care: 'HA-CLN-02',   // Stick Vac (₹7,999)
      air_climate: 'HA-AIR-01',     // HEPA Air Purifier (₹7,499)
      beverage_station: 'HA-BEV-02',// Electric Glass Kettle (₹1,799)
      countertop_prep: 'HA-PREP-01' // Food Processor (₹3,699)
    },
    'High-capacity appliances designed for family feasts, rotisserie baking, and spotless floors.'
  ),
  createHomeBundleObject(
    'Home Appliances - Pure Water & Clean Air Wellness Pack',
    34000,
    {
      kitchen_cooking: 'HA-COOK-01', // Air Fryer (₹4,999)
      cleaning_care: 'HA-CLN-03',   // Garment Steamer (₹2,499)
      air_climate: 'HA-AIR-01',     // HEPA Purifier (₹7,499)
      beverage_station: 'HA-BEV-04',// UV+RO Water Purifier (₹10,999)
      countertop_prep: 'HA-PREP-06' // Food Scale (₹999)
    },
    'Dedicated health and wellness sanctuary with 6-stage water purification and medical-grade air filtration.'
  ),
  createHomeBundleObject(
    'Home Appliances - Deluxe Automated Housekeeper Suite',
    55000,
    {
      kitchen_cooking: 'HA-COOK-04', // Convection Oven (₹8,999)
      cleaning_care: 'HA-CLN-04',   // Smart Dishwasher (₹19,499)
      air_climate: 'HA-AIR-01',     // HEPA Purifier (₹7,499)
      beverage_station: 'HA-BEV-04',// RO Purifier (₹10,999)
      countertop_prep: 'HA-PREP-02' // Stand Mixer (₹6,499)
    },
    'Premium hands-free convenience with countertop dishwasher, robotic tech, and pure water.'
  ),
  createHomeBundleObject(
    'Home Appliances - Daily Culinary & Fabric Care Trio',
    21000,
    {
      kitchen_cooking: 'HA-COOK-02', // Multi-Cooker (₹5,799)
      cleaning_care: 'HA-CLN-02',   // Stick Vac (₹7,999)
      air_climate: 'HA-AIR-02',     // Humidifier (₹1,999)
      beverage_station: 'HA-BEV-02',// Electric Kettle (₹1,799)
      countertop_prep: 'HA-PREP-03' // Sandwich Press (₹1,599)
    },
    'Dependable everyday appliances for cooking savory dishes, crisping paninis, and cleaning floors.'
  ),
  createHomeBundleObject(
    'Home Appliances - Minimalist Low-Energy Studio Pack',
    14500,
    {
      kitchen_cooking: 'HA-COOK-03', // Induction (₹2,699)
      cleaning_care: 'HA-CLN-05',   // Lint Cleanser (₹1,199)
      air_climate: 'HA-AIR-03',     // Tower Fan (₹3,899)
      beverage_station: 'HA-BEV-02',// Glass Kettle (₹1,799)
      countertop_prep: 'HA-PREP-05' // Immersion Blender (₹1,899)
    },
    'Sub-₹15,000 bundle curated for low power draw and essential compact living.'
  ),
  createHomeBundleObject(
    'Home Appliances - Master Sous-Vide & Barista Lounge',
    26000,
    {
      kitchen_cooking: 'HA-COOK-05', // Sous Vide Circulator (₹4,499)
      cleaning_care: 'HA-CLN-03',   // Garment Steamer (₹2,499)
      air_climate: 'HA-AIR-04',     // Dehumidifier (₹4,799)
      beverage_station: 'HA-BEV-01',// 15-Bar Espresso Machine (₹6,999)
      countertop_prep: 'HA-PREP-06' // Food Scale (₹999)
    },
    'Precision culinary cooking, controlled humidity, and artisanal handcrafted espresso.'
  ),
  createHomeBundleObject(
    'Home Appliances - Ultimate Kitchenette & Baking Studio',
    29000,
    {
      kitchen_cooking: 'HA-COOK-01', // Air Fryer (₹4,999)
      cleaning_care: 'HA-CLN-02',   // Stick Vac (₹7,999)
      air_climate: 'HA-AIR-03',     // Tower Fan (₹3,899)
      beverage_station: 'HA-BEV-03',// Slow Juicer (₹5,999)
      countertop_prep: 'HA-PREP-02' // Stand Mixer (₹6,499)
    },
    'All the tools for baking, juicing, and frying with fast cleanup.'
  )
];

// ---------------------------------------------------------------------------
// 7. Dynamic Random Bundle Generator for "Home Appliances"
// ---------------------------------------------------------------------------
export function generateRandomHomeApplianceBundle(customBudget?: number, customName?: string): SavedBundle {
  // Category product pools
  const cookingProds = HOME_APPLIANCE_PRODUCTS.filter(p => p.category === 'Kitchen & Cooking' && p.inStock);
  const cleaningProds = HOME_APPLIANCE_PRODUCTS.filter(p => p.category === 'Cleaning & Floorcare' && p.inStock);
  const airProds = HOME_APPLIANCE_PRODUCTS.filter(p => p.category === 'Air & Climate' && p.inStock);
  const bevProds = HOME_APPLIANCE_PRODUCTS.filter(p => p.category === 'Beverage & Water' && p.inStock);
  const prepProds = HOME_APPLIANCE_PRODUCTS.filter(p => p.category === 'Countertop Prep' && p.inStock);

  // Pick random product from each pool
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const selectedCooking = pick(cookingProds);
  const selectedCleaning = pick(cleaningProds);
  const selectedAir = pick(airProds);
  const selectedBev = pick(bevProds);
  const selectedPrep = pick(prepProds);

  const rawSum = selectedCooking.price + selectedCleaning.price + selectedAir.price + selectedBev.price + selectedPrep.price;
  const estimatedLanded = Math.round(rawSum * 1.18 + (rawSum > HOME_APPLIANCE_SHIPPING.freeShippingThreshold ? 0 : HOME_APPLIANCE_SHIPPING.baseFee));
  const assignedBudget = customBudget || Math.max(estimatedLanded + 2000, 20000);

  const adjectives = ['Smart', 'Modern', 'Eco-Clean', 'Deluxe', 'Essential', 'Artisan', 'Compact', 'Urban', 'Pro', 'Cozy', 'Chef-Grade', 'Automated'];
  const themes = ['Home Setup', 'Appliances Suite', 'Living Pack', 'Housekeeper Set', 'Kitchen Station', 'Comfort Bundle'];
  const randomTitle = customName || `Home Appliances - ${pick(adjectives)} ${pick(themes)} (#${Math.floor(Math.random() * 899 + 100)})`;

  return createHomeBundleObject(
    randomTitle,
    assignedBudget,
    {
      kitchen_cooking: selectedCooking.id,
      cleaning_care: selectedCleaning.id,
      air_climate: selectedAir.id,
      beverage_station: selectedBev.id,
      countertop_prep: selectedPrep.id
    },
    `Randomly assembled home appliances combination with total base price of ₹${rawSum.toLocaleString('en-IN')}.`
  );
}
