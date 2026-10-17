export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  brand: string;
  model: string;
  description: string;
  weightKg: number;
  image?: string;
  unitCostInr?: number;
  size?: string;
  colour?: string;
  compatibleWith?: string[];
  attributes: {
    connector?: 'usb-c' | 'thunderbolt' | 'hdmi' | 'wireless' | 'wired';
    deskWidthCm?: number;
    deskDepthCm?: number;
    weightCapacityKg?: number;
    monitorMountType?: 'clamp' | 'integrated_stand' | 'vesa';
    powerDeliveryWatts?: number;
    powerConsumptionWatts?: number;
    osCompatibility?: ('macos' | 'windows' | 'linux')[];
    chairArmrest?: '4d_adjustable' | 'fixed' | 'flip_up';
    chairSeatHeightCm?: { min: number; max: number };
    lightMountType?: 'screen_clamp' | 'weighted_base';
    ergonomicGrade?: 'Tier-1' | 'Tier-2' | 'Standard';
    size?: string;
    colour?: string;
    compatibleWith?: string[];
    unitCostInr?: number;
    image?: string;
    [key: string]: any;
  };
  incompatibleProductIds?: string[];
  notes?: string;
}

export interface RequiredSlot {
  id: string;
  label: string;
  category: string;
  description: string;
  priority: 'required' | 'optional';
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  defaultBudget: number;
  requiredSlots: RequiredSlot[];
}

export interface ShippingRule {
  baseFee: number;
  freeShippingThreshold: number;
  heavyItemSurchargePerItem: number;
  heavyThresholdKg: number;
}

export interface TaxRule {
  taxRate: number; // e.g., 0.18 for 18% GST
  taxName: string;
}

export interface CompatibilityRuleDefinition {
  id: string;
  name: string;
  categoryA: string;
  categoryB: string;
  description: string;
  validatorType: 'clamp_vs_monitor' | 'dock_power' | 'desk_width_vs_ultrawide' | 'chair_clearance' | 'explicit_id_block';
}

export interface CompatibilityViolation {
  severity: 'error' | 'warning';
  sourceProductId: string;
  sourceProductName: string;
  targetProductId?: string;
  targetProductName?: string;
  ruleId: string;
  message: string;
}

export interface LandedPriceBreakdown {
  productSubtotal: number;
  shippingFee: number;
  shippingDiscount: number;
  netShipping: number;
  taxAmount: number;
  landedPrice: number;
  budget: number;
  remainingBudget: number;
  budgetUtilisationPercent: number;
  isOverBudget: boolean;
  heavyItemCount: number;
}

export interface BundleValidationResult {
  isValid: boolean;
  isComplete: boolean;
  isInStock: boolean;
  isCompatible: boolean;
  isWithinBudget: boolean;
  filledSlotCount: number;
  totalSlotCount: number;
  missingSlotIds: string[];
  outOfStockSlotIds: string[];
  duplicateViolations: string[];
  compatibilityViolations: CompatibilityViolation[];
  landedPrice: LandedPriceBreakdown;
  statusMessage: string;
  limitingFactor?: 'insufficient_stock' | 'compatibility_constraints' | 'missing_eligible_products' | 'budget_constraints' | null;
}

export interface ReferenceRequest {
  id: string;
  title: string;
  budget: number;
  activityId: string;
  requiredSlotIds: string[];
  preselectedItems?: Record<string, string>; // slotId -> productId
  description: string;
  expectedFeasible: boolean;
  expectedLandedPriceMax?: number;
  expectedIds?: string[];
  requiredPort?: string;
  notes: string;
}

export interface TestExecutionResult {
  testId: string;
  testType: 'reference_request' | 'edge_case';
  title: string;
  budget: number;
  requiredSlots: string[];
  expectedResult: string;
  actualResult: string;
  landedPrice: number;
  compatibilityOutcome: 'Compatible' | 'Incompatible' | 'Not Evaluated';
  stockOutcome: 'All In-Stock' | 'Out-of-Stock Item' | 'Not Evaluated';
  passed: boolean;
  explanation: string;
  timestamp: string;
}

export interface SavedBundle {
  id: string;
  name: string;
  activityId: string;
  budget: number;
  items: Record<string, Product | null>;
  validation: BundleValidationResult;
  savedAt: string;
  notes?: string;
}

export interface FixtureData {
  version: string;
  isSynthetic: boolean;
  activity: Activity;
  products: Product[];
  shippingRule: ShippingRule;
  taxRule: TaxRule;
  compatibilityRules: CompatibilityRuleDefinition[];
  referenceRequests: ReferenceRequest[];
}

export interface UnitEconomicsParams {
  retailerMonthlyFee: number;
  monthlyCostToServe: number;
  referralPercentage: number;
  avgEligibleBasketValue: number;
  variableCostPerBasket: number;
  fixedMonthlyCosts: number;
  monthlyBasketsForecast: number;
}

export interface ShopperExperimentRecord {
  id: string;
  participantId: string;
  targetShopperCategory: string;
  approachDate: string;
  contactOutcome: string;
  taskCompletion: string;
  timeTaken: string;
  budgetCompliance: string;
  compatibilityErrors: string;
  landedPriceUnderstanding: string;
  verbatimFeedback: string;
  researcherObservations: string;
  improvementIdentified: string;
}

export interface ProjectEvidenceRecord {
  id: string;
  evidenceId: string;
  featureTested: string;
  testProcedure: string;
  expectedOutcome: string;
  actualOutcome: string;
  status: 'Verified' | 'Pending' | 'Flagged';
  referenceFile: string;
  notes: string;
}

export interface NegotiatedScope {
  stakeholder: string;
  requestedFunctionality: string;
  agreedScope: string;
  outOfScope: string;
  agreementDate: string;
  acceptanceCriteria: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  roleTitle: string;
  department: string;
  bio: string;
  avatarColor: string;
  avatarUrl?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  preferredCurrency: string;
  defaultBudget: number;
  optimizationPreference: 'lowest_cost' | 'best_value';
  emailAlerts: boolean;
  aiTips: boolean;
  compactView: boolean;
  memberSince?: string;
}

export interface CheckoutBundleItem {
  product: Product;
  quantity: number;
}

export interface CheckoutBundleData {
  items: CheckoutBundleItem[];
  subtotal: number;
  shippingFee: number;
  shippingDiscount: number;
  netShipping: number;
  taxAmount: number;
  total: number;
  bundleName?: string;
  source?: 'workspace' | 'cart' | 'recommendation' | 'saved';
}

