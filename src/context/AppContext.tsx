import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  RequiredSlot,
  Activity,
  ShippingRule,
  TaxRule,
  FixtureData,
  BundleValidationResult,
  SavedBundle,
  TestExecutionResult,
  UnitEconomicsParams,
  ShopperExperimentRecord,
  ProjectEvidenceRecord,
  NegotiatedScope,
  UserProfile,
  CheckoutBundleItem,
  CheckoutBundleData
} from '../types';
export type { UserProfile, CheckoutBundleItem, CheckoutBundleData };
import { DEFAULT_SYNTHETIC_FIXTURE, C07_DEFAULT_FIXTURE, mapC07Fixture } from '../data/defaultFixture';
import { validateBundle } from '../utils/bundleValidation';
import { findValidBundle, OptimizationResult } from '../utils/bundleOptimizer';
import { runAllTests, runReferenceRequestTest, EDGE_CASE_TESTS } from '../utils/testRunner';
import { formatINR, calculateLandedPrice } from '../utils/pricing';
import {
  fetchSavedBundlesFromDb,
  upsertSavedBundleToDb,
  deleteSavedBundleFromDb,
  testSupabaseConnection,
  getSupabaseConfig
} from '../services/supabaseClient';

export type UserRole = 'customer' | 'admin' | null;

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

interface AppContextType {
  // Authentication & Role
  userRole: UserRole;
  loginAs: (role: 'customer' | 'admin') => void;
  logout: () => void;
  adminSignInRequested: boolean;
  setAdminSignInRequested: (req: boolean) => void;

  // Navigation & View
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProductId: string | null;
  openProductDetails: (productId: string) => void;
  closeProductDetails: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Fixture & Configuration
  fixture: FixtureData;
  isCustomFixture: boolean;
  loadFixtureData: (data: FixtureData) => { success: boolean; error?: string };
  resetFixtureToDefault: () => void;
  updateShippingRule: (rule: Partial<ShippingRule>) => void;
  updateTaxRule: (rule: Partial<TaxRule>) => void;

  // Current Bundle State
  currentActivity: Activity;
  budget: number;
  setBudget: (budget: number) => void;
  currentItems: Record<string, Product | null>;
  validation: BundleValidationResult;
  selectProduct: (slotId: string, product: Product) => void;
  addItemToCart: (product: Product) => void;
  removeProduct: (slotId: string) => void;
  resetBundle: () => void;
  setBundleItems: (items: Record<string, Product | null>, newBudget?: number) => void;
  optimizeBundle: (preference?: 'lowest_cost' | 'best_value') => OptimizationResult;

  // Saved & Compared Bundles
  savedBundles: SavedBundle[];
  saveCurrentBundle: (name?: string, notes?: string) => SavedBundle;
  deleteSavedBundle: (id: string) => void;
  loadSavedBundle: (bundle: SavedBundle) => void;
  comparedBundleIds: string[];
  toggleCompareBundle: (id: string) => void;

  // Test Suite
  testResults: TestExecutionResult[];
  isTesting: boolean;
  runTestSuite: (singleTestId?: string) => void;

  // Business Insights & MBA
  unitEconomics: UnitEconomicsParams;
  updateUnitEconomics: (updates: Partial<UnitEconomicsParams>) => void;
  shopperRecords: ShopperExperimentRecord[];
  updateShopperRecord: (id: string, updates: Partial<ShopperExperimentRecord>) => void;
  resetShopperRecords: () => void;

  // Project Evidence & Scope
  evidenceRecords: ProjectEvidenceRecord[];
  updateEvidenceRecord: (id: string, updates: Partial<ProjectEvidenceRecord>) => void;
  addEvidenceRecord: (record: Omit<ProjectEvidenceRecord, 'id'>) => void;
  deleteEvidenceRecord: (id: string) => void;
  negotiatedScope: NegotiatedScope;
  updateNegotiatedScope: (updates: Partial<NegotiatedScope>) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationsRead: () => void;
  clearNotifications: () => void;
  addNotification: (title: string, message: string, type?: AppNotification['type']) => void;

  // AI Assistant State & Actions
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  toggleAssistant: () => void;
  applyBundleRecommendation: (itemsMap: Record<string, string>, newBudget?: number) => void;
  swapProductById: (slotId: string, productId: string) => void;

  // Bundle Cart Drawer State & Actions
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;

  // Supabase Cloud Database
  isSupabaseConnected: boolean;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
  checkSupabaseStatus: () => Promise<void>;

  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  resetUserProfile: () => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;

  // Checkout & Payment Simulation
  checkoutData: CheckoutBundleData | null;
  setCheckoutData: (data: CheckoutBundleData | null) => void;
  initiateCheckout: (customBundle?: {
    items: { product: Product; quantity: number }[];
    bundleName?: string;
  }) => void;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Tanmay Anand',
  email: 'tanmay.anand@craftbundle.io',
  phone: '+91 98765 43210',
  roleTitle: 'Lead Bundle Architect',
  department: 'Product & Merchandising',
  bio: 'Specializing in budget-optimized workspace bundles, landed cost analytics, and AI recommendations.',
  avatarColor: '#2C3A2B',
  address: '42 Indiranagar 100ft Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560038',
  country: 'India',
  preferredCurrency: 'INR',
  defaultBudget: 75000,
  optimizationPreference: 'best_value',
  emailAlerts: true,
  aiTips: true,
  compactView: false,
  memberSince: 'March 2024'
};

const INITIAL_SHOPPER_RECORDS: ShopperExperimentRecord[] = [
  {
    id: "REC-P01",
    participantId: "P01",
    targetShopperCategory: "Work-from-Home Corporate Employee",
    approachDate: "Not yet recorded",
    contactOutcome: "Not yet recorded",
    taskCompletion: "Not yet recorded",
    timeTaken: "Not yet recorded",
    budgetCompliance: "Not yet recorded",
    compatibilityErrors: "Not yet recorded",
    landedPriceUnderstanding: "Not yet recorded",
    verbatimFeedback: "Not yet recorded",
    researcherObservations: "Participant slot reserved for empirical field trial.",
    improvementIdentified: "Not yet recorded"
  },
  {
    id: "REC-P02",
    participantId: "P02",
    targetShopperCategory: "Freelance Creative Designer",
    approachDate: "Not yet recorded",
    contactOutcome: "Not yet recorded",
    taskCompletion: "Not yet recorded",
    timeTaken: "Not yet recorded",
    budgetCompliance: "Not yet recorded",
    compatibilityErrors: "Not yet recorded",
    landedPriceUnderstanding: "Not yet recorded",
    verbatimFeedback: "Not yet recorded",
    researcherObservations: "Participant slot reserved for empirical field trial.",
    improvementIdentified: "Not yet recorded"
  },
  {
    id: "REC-P03",
    participantId: "P03",
    targetShopperCategory: "Remote Software Developer",
    approachDate: "Not yet recorded",
    contactOutcome: "Not yet recorded",
    taskCompletion: "Not yet recorded",
    timeTaken: "Not yet recorded",
    budgetCompliance: "Not yet recorded",
    compatibilityErrors: "Not yet recorded",
    landedPriceUnderstanding: "Not yet recorded",
    verbatimFeedback: "Not yet recorded",
    researcherObservations: "Participant slot reserved for empirical field trial.",
    improvementIdentified: "Not yet recorded"
  },
  {
    id: "REC-P04",
    participantId: "P04",
    targetShopperCategory: "College Student / Online Degree",
    approachDate: "Not yet recorded",
    contactOutcome: "Not yet recorded",
    taskCompletion: "Not yet recorded",
    timeTaken: "Not yet recorded",
    budgetCompliance: "Not yet recorded",
    compatibilityErrors: "Not yet recorded",
    landedPriceUnderstanding: "Not yet recorded",
    verbatimFeedback: "Not yet recorded",
    researcherObservations: "Participant slot reserved for empirical field trial.",
    improvementIdentified: "Not yet recorded"
  },
  {
    id: "REC-P05",
    participantId: "P05",
    targetShopperCategory: "First-Time Home Office Buyer",
    approachDate: "Not yet recorded",
    contactOutcome: "Not yet recorded",
    taskCompletion: "Not yet recorded",
    timeTaken: "Not yet recorded",
    budgetCompliance: "Not yet recorded",
    compatibilityErrors: "Not yet recorded",
    landedPriceUnderstanding: "Not yet recorded",
    verbatimFeedback: "Not yet recorded",
    researcherObservations: "Participant slot reserved for empirical field trial.",
    improvementIdentified: "Not yet recorded"
  }
];

const INITIAL_EVIDENCE_RECORDS: ProjectEvidenceRecord[] = [
  {
    id: "EV-01",
    evidenceId: "EVD-C07-001",
    featureTested: "Real-time Compatibility Engine",
    testProcedure: "Mounted asymmetric screenbar light (LGT-001) onto 34-inch curved monitor (MON-003).",
    expectedOutcome: "Engine flags physical mounting incompatibility and advises weighted lamp.",
    actualOutcome: "Immediate red alert: 'ScreenBar clamp light requires flat top bezel. Cannot mount on curved chassis.'",
    status: "Verified",
    referenceFile: "src/utils/compatibility.ts",
    notes: "Demonstrates clamp_vs_monitor rule execution in under 2ms without API calls."
  },
  {
    id: "EV-02",
    evidenceId: "EVD-C07-002",
    featureTested: "Landed Pricing Transparency",
    testProcedure: "Configured 6-item bundle with subtotal under ₹50,000 to verify 18% GST and heavy shipping calculation.",
    expectedOutcome: "Calculates ₹499 base shipping, heavy item surcharge (₹450/item > 15kg), and 18% GST.",
    actualOutcome: "Landed price broken down accurately: Subtotal + Net Shipping + GST = Final Landed Price.",
    status: "Verified",
    referenceFile: "src/utils/pricing.ts",
    notes: "Transparently displayed in sidebar and summary card."
  },
  {
    id: "EV-03",
    evidenceId: "EVD-C07-003",
    featureTested: "Find a Valid Bundle Optimization",
    testProcedure: "Triggered optimizer on budget ₹65,000 with 6 required slots and in-stock inventory.",
    expectedOutcome: "Combinatorial search returns lowest landed cost combination satisfying all constraints.",
    actualOutcome: "Found valid bundle with landed price ₹57,442, completing all 6 slots with 0 violations.",
    status: "Verified",
    referenceFile: "src/utils/bundleOptimizer.ts",
    notes: "Evaluates Cartesian combinations deterministically with zero mock stubs."
  },
  {
    id: "EV-04",
    evidenceId: "EVD-C07-004",
    featureTested: "In-Place Replacement Revalidation",
    testProcedure: "Swapped compatible chair with wide executive chair on compact desk.",
    expectedOutcome: "Entire bundle state revalidated immediately; status flipped to invalid with clearance notice.",
    actualOutcome: "Revalidation triggered: caught chair_clearance rule violation and updated landed price.",
    status: "Verified",
    referenceFile: "src/utils/bundleValidation.ts",
    notes: "Proves Rule 6 (complete bundle revalidation upon replacement)."
  }
];

const INITIAL_SCOPE: NegotiatedScope = {
  stakeholder: "Academic Project Supervisor / Industry Client Advisory",
  requestedFunctionality: "Extend baseline catalog picker into an automated Budget-Based Product Bundle Builder with engineering compatibility validation and transparent landed-price comparison.",
  agreedScope: "1. Work from Home activity slot modeling; 2. Combinatorial optimizer finding feasible bundles; 3. Explicit compatibility matrix; 4. Landed price breakdown (subtotal, shipping, GST); 5. Bundle comparison dashboard; 6. 10 reference requests + 10 edge case tests; 7. MBA business insights with unit economics and blank 5-shopper research log.",
  outOfScope: "Live payment gateways, third-party authentication backends, and multi-currency foreign exchange.",
  agreementDate: "2026-10-12",
  acceptanceCriteria: "1. Deterministic validation running in browser; 2. Accurate INR landed price math; 3. Zero false-positive bundles; 4. CSV/JSON export; 5. Tested against 10 reference requests and 10 edge cases."
};

const INITIAL_UNIT_ECONOMICS: UnitEconomicsParams = {
  retailerMonthlyFee: 25000,
  monthlyCostToServe: 4500,
  referralPercentage: 0.045, // 4.5%
  avgEligibleBasketValue: 55000,
  variableCostPerBasket: 350,
  fixedMonthlyCosts: 45000,
  monthlyBasketsForecast: 80
};

function parseProductHash(hash: string): string | null {
  const clean = hash.replace('#', '').trim();
  if (clean.startsWith('product-') && clean !== 'product-detail') {
    return clean.replace('product-', '');
  }
  if (clean.startsWith('product/')) {
    return clean.replace('product/', '');
  }
  return null;
}

const VALID_TABS = [
  'landing',
  'dashboard',
  'builder',
  'chat',
  'catalogue',
  'compare',
  'tests',
  'business',
  'evidence',
  'settings',
  'product-detail',
  'profile',
  'checkout'
];

const getInitialTab = (): string => {
  try {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '').trim();
      if (parseProductHash(window.location.hash)) return 'product-detail';
      if (hash === 'builder' || hash === 'landing') return 'catalogue';
      if (VALID_TABS.includes(hash) && hash !== 'landing') return hash;
    }
    if (typeof localStorage !== 'undefined') {
      const savedTab = localStorage.getItem('c07_active_tab_v1');
      if (savedTab === 'builder' || savedTab === 'landing') return 'catalogue';
      if (savedTab && VALID_TABS.includes(savedTab) && savedTab !== 'landing') return savedTab;
    }
  } catch (e) {
    console.warn('Could not read active tab from storage:', e);
  }
  return 'catalogue';
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.hash) {
        const prod = parseProductHash(window.location.hash);
        if (prod) return prod;
      }
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('c07_selected_product_v1');
      }
    } catch {}
    return null;
  });

  const setActiveTab = (tab: string) => {
    if (!VALID_TABS.includes(tab)) return;
    setActiveTabState(tab);
    if (tab !== 'product-detail') {
      setSelectedProductId(null);
    }
    try {
      localStorage.setItem('c07_active_tab_v1', tab);
      if (typeof window !== 'undefined' && window.location.hash.replace('#', '') !== tab) {
        window.history.replaceState(null, '', `#${tab}`);
      }
    } catch {}
  };

  const openProductDetails = (productId: string) => {
    setSelectedProductId(productId);
    setActiveTabState('product-detail');
    try {
      localStorage.setItem('c07_active_tab_v1', 'product-detail');
      localStorage.setItem('c07_selected_product_v1', productId);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `#product-${productId}`);
      }
    } catch {}
  };

  const closeProductDetails = () => {
    setSelectedProductId(null);
    setActiveTabState('catalogue');
    try {
      localStorage.setItem('c07_active_tab_v1', 'catalogue');
      localStorage.removeItem('c07_selected_product_v1');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '#catalogue');
      }
    } catch {}
  };

  // Keep activeTab in sync with browser back/forward and URL hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      const prodId = parseProductHash(window.location.hash);
      if (prodId) {
        setSelectedProductId(prodId);
        setActiveTabState('product-detail');
        try {
          localStorage.setItem('c07_active_tab_v1', 'product-detail');
          localStorage.setItem('c07_selected_product_v1', prodId);
        } catch {}
        return;
      }
      if (hash === 'product-detail') {
        setActiveTabState('product-detail');
        return;
      }
      if (VALID_TABS.includes(hash) && hash !== activeTab) {
        setSelectedProductId(null);
        setActiveTabState(hash);
        try {
          localStorage.setItem('c07_active_tab_v1', hash);
        } catch {}
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // Keep URL hash and localStorage in sync on initial mount and activeTab updates
  useEffect(() => {
    if (activeTab && VALID_TABS.includes(activeTab)) {
      try {
        if (activeTab === 'product-detail' && selectedProductId) {
          const expectedHash = `#product-${selectedProductId}`;
          if (window.location.hash !== expectedHash) {
            window.history.replaceState(null, '', expectedHash);
          }
        } else if (window.location.hash.replace('#', '') !== activeTab) {
          window.history.replaceState(null, '', `#${activeTab}`);
        }
        localStorage.setItem('c07_active_tab_v1', activeTab);
      } catch {}
    }
  }, [activeTab, selectedProductId]);

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authentication & Role State
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.replace('#', '').trim();
        if (hash === 'admin') return 'admin';
        if (hash === 'customer') return 'customer';
      }
      const saved = sessionStorage.getItem('c07_user_role_v1') || localStorage.getItem('c07_user_role_v1');
      if (saved === 'customer' || saved === 'admin') return saved as UserRole;
    } catch (e) {
      console.warn('Could not read user role from storage:', e);
    }
    return 'customer';
  });
  const [adminSignInRequested, setAdminSignInRequested] = useState<boolean>(false);

  // Fixture State
  const [fixture, setFixture] = useState<FixtureData>(() => {
    try {
      const saved = localStorage.getItem('c07_fixture_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.products?.length && parsed?.activity) {
          if (parsed.products.length < C07_DEFAULT_FIXTURE.products.length) {
            return C07_DEFAULT_FIXTURE;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse saved fixture from storage:', e);
    }
    return C07_DEFAULT_FIXTURE;
  });

  // Guard against stale cached fixtures with fewer products than C07_DEFAULT_FIXTURE
  useEffect(() => {
    if (fixture.products.length < C07_DEFAULT_FIXTURE.products.length) {
      setFixture(C07_DEFAULT_FIXTURE);
      try {
        localStorage.removeItem('c07_fixture_v2');
      } catch {}
    }
  }, [fixture.products.length]);

  const isCustomFixture = !fixture.isSynthetic;

  // Bundle State
  const [budget, setBudgetState] = useState<number>(() => {
    const saved = localStorage.getItem('c07_budget_v2');
    return saved ? Number(saved) : 5000;
  });

  const [currentItems, setCurrentItems] = useState<Record<string, Product | null>>(() => {
    try {
      const saved = localStorage.getItem('c07_current_items_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Verify slots match currently loaded fixture
        const hasMatchingSlots = fixture.activity.requiredSlots.every(s => s.id in parsed);
        if (hasMatchingSlots) return parsed;
      }
    } catch (e) {
      console.warn('Could not load saved current items:', e);
    }
    // Initialize with default benchmark items if available (P07 Mouse & P08 Keyboard)
    const initial: Record<string, Product | null> = {};
    for (const slot of fixture.activity.requiredSlots) {
      initial[slot.id] = null;
    }
    const p07 = fixture.products.find(p => p.id === 'P07');
    const p08 = fixture.products.find(p => p.id === 'P08');
    if (p07 && initial['Mouse'] !== undefined) initial['Mouse'] = p07;
    if (p08 && initial['Keyboard'] !== undefined) initial['Keyboard'] = p08;
    return initial;
  });

  // Saved Bundles
  const [savedBundles, setSavedBundles] = useState<SavedBundle[]>(() => {
    try {
      const saved = localStorage.getItem('c07_saved_bundles_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load saved bundles:', e);
    }
    return [];
  });

  // Comparison State
  const [comparedBundleIds, setComparedBundleIds] = useState<string[]>([]);

  // Testing Suite State
  const [testResults, setTestResults] = useState<TestExecutionResult[]>(() => {
    try {
      const saved = localStorage.getItem('c07_test_results_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load test results:', e);
    }
    return [];
  });
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Business Insights State
  const [unitEconomics, setUnitEconomics] = useState<UnitEconomicsParams>(() => {
    try {
      const saved = localStorage.getItem('c07_unit_economics_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load unit economics:', e);
    }
    return INITIAL_UNIT_ECONOMICS;
  });

  const [shopperRecords, setShopperRecords] = useState<ShopperExperimentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('c07_shopper_records_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load shopper records:', e);
    }
    return INITIAL_SHOPPER_RECORDS;
  });

  // Project Evidence State
  const [evidenceRecords, setEvidenceRecords] = useState<ProjectEvidenceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('c07_evidence_records_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load evidence records:', e);
    }
    return INITIAL_EVIDENCE_RECORDS;
  });

  const [negotiatedScope, setNegotiatedScope] = useState<NegotiatedScope>(() => {
    try {
      const saved = localStorage.getItem('c07_negotiated_scope_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load negotiated scope:', e);
    }
    return INITIAL_SCOPE;
  });

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "notif-1",
      title: "C07 Validation Engine Ready",
      message: "Loaded Work from Home activity slots and deterministic compatibility matrix.",
      type: "info",
      timestamp: "Just now",
      read: false
    }
  ]);

  // AI Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const toggleAssistant = () => setIsAssistantOpen(prev => !prev);

  // Cart Drawer State
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  // Supabase Database State
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('c07_user_profile_v1');
      if (saved) {
        return { ...DEFAULT_USER_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read user profile from storage:', e);
    }
    return DEFAULT_USER_PROFILE;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('c07_user_profile_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
    addNotification('Profile Updated', 'Your profile details and preferences were saved successfully.', 'success');
  };

  const resetUserProfile = () => {
    setUserProfile(DEFAULT_USER_PROFILE);
    try {
      localStorage.setItem('c07_user_profile_v1', JSON.stringify(DEFAULT_USER_PROFILE));
    } catch {}
    addNotification('Profile Reset', 'Profile details restored to defaults.', 'info');
  };

  const checkSupabaseStatus = async () => {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      setIsSupabaseConnected(false);
      return;
    }
    const res = await testSupabaseConnection();
    setIsSupabaseConnected(res.ok);
    if (res.ok) {
      try {
        const dbBundles = await fetchSavedBundlesFromDb();
        if (dbBundles && dbBundles.length > 0) {
          setSavedBundles(prev => {
            const existingIds = new Set(prev.map(b => b.id));
            const newBundles = dbBundles.filter(b => !existingIds.has(b.id));
            return [...prev, ...newBundles];
          });
        }
      } catch (err) {
        console.warn('Supabase auto-hydration notice:', err);
      }
    }
  };

  useEffect(() => {
    checkSupabaseStatus();
  }, []);

  // Persist important data
  useEffect(() => {
    try {
      localStorage.setItem('c07_budget_v2', budget.toString());
      localStorage.setItem('c07_current_items_v2', JSON.stringify(currentItems));
      localStorage.setItem('c07_saved_bundles_v1', JSON.stringify(savedBundles));
      localStorage.setItem('c07_test_results_v1', JSON.stringify(testResults));
      localStorage.setItem('c07_unit_economics_v1', JSON.stringify(unitEconomics));
      localStorage.setItem('c07_shopper_records_v1', JSON.stringify(shopperRecords));
      localStorage.setItem('c07_evidence_records_v1', JSON.stringify(evidenceRecords));
      localStorage.setItem('c07_negotiated_scope_v1', JSON.stringify(negotiatedScope));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }, [budget, currentItems, savedBundles, testResults, unitEconomics, shopperRecords, evidenceRecords, negotiatedScope]);

  // Reactive bundle validation
  const validation = useMemo(() => {
    return validateBundle(
      currentItems,
      fixture.activity.requiredSlots,
      budget,
      fixture.shippingRule,
      fixture.taxRule
    );
  }, [currentItems, fixture, budget]);

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'info') => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const loginAs = (role: 'customer' | 'admin') => {
    setUserRole(role);
    setAdminSignInRequested(false);
    try {
      sessionStorage.setItem('c07_user_role_v1', role);
      localStorage.setItem('c07_user_role_v1', role);
    } catch {}
    if (role === 'customer') {
      setActiveTab('catalogue');
      addNotification('Logged in as Customer', 'Welcome! You can now assemble custom product bundles within your budget.', 'success');
    } else {
      setActiveTab('dashboard');
      addNotification('Logged in as Administrator', 'Welcome! Full access to business insights, test suites, and configurations.', 'info');
    }
  };

  const logout = () => {
    setUserRole('customer');
    try {
      sessionStorage.removeItem('c07_user_role_v1');
      localStorage.removeItem('c07_user_role_v1');
    } catch {}
    setAdminSignInRequested(false);
    setActiveTab('catalogue');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '#catalogue');
    }
    addNotification('Session Reset', 'You have reset your workspace session to customer mode.', 'info');
  };

  const setBudget = (val: number) => {
    const safeVal = Math.max(0, isNaN(val) ? 0 : val);
    setBudgetState(safeVal);
  };

  const selectProduct = (slotId: string, product: Product) => {
    setCurrentItems(prev => {
      const next = { ...prev, [slotId]: product };
      return next;
    });
    addNotification("Product Selected", `Assigned "${product.name}" to ${slotId.toUpperCase()} slot.`, 'info');
  };

  const addItemToCart = (product: Product) => {
    // 1. Check if an empty required slot exists for this product's category
    const matchingEmptyRequiredSlot = fixture.activity.requiredSlots.find(
      s => (s.id === product.category || s.category.toLowerCase() === product.category.toLowerCase()) && !currentItems[s.id]
    );

    let targetSlot = matchingEmptyRequiredSlot ? matchingEmptyRequiredSlot.id : null;

    if (!targetSlot) {
      if (!currentItems[product.category]) {
        targetSlot = product.category;
      } else {
        // Generate an available unique slot identifier for subsequent items
        let index = 1;
        while (currentItems[`${product.category}_${index}`]) {
          index++;
        }
        targetSlot = `${product.category}_${index}`;
      }
    }

    setCurrentItems(prev => ({
      ...prev,
      [targetSlot!]: product
    }));
    addNotification("Added to Cart", `Added "${product.name}" (${formatINR(product.price)}) to bundle cart.`, 'success');
  };

  const removeProduct = (slotId: string) => {
    const current = currentItems[slotId];
    setCurrentItems(prev => {
      const next = { ...prev };
      if (fixture.activity.requiredSlots.some(s => s.id === slotId)) {
        next[slotId] = null;
      } else {
        delete next[slotId];
      }
      return next;
    });
    if (current) {
      addNotification("Product Removed", `Removed "${current.name}" from ${slotId.toUpperCase()} slot.`, 'warning');
    }
  };

  const resetBundle = () => {
    const emptyItems: Record<string, Product | null> = {};
    for (const slot of fixture.activity.requiredSlots) {
      emptyItems[slot.id] = null;
    }
    setCurrentItems(emptyItems);
    addNotification("Bundle Reset", "Cleared all selected products from slots.", 'info');
  };

  const setBundleItems = (items: Record<string, Product | null>, newBudget?: number) => {
    if (newBudget && newBudget > 0) {
      setBudget(newBudget);
    }
    setCurrentItems(items);
  };

  const applyBundleRecommendation = (itemsMap: Record<string, string>, newBudget?: number) => {
    if (newBudget && newBudget > 0) {
      setBudget(newBudget);
    }
    setCurrentItems(prev => {
      const next = { ...prev };
      for (const [slotId, productId] of Object.entries(itemsMap)) {
        const prod = fixture.products.find(p => p.id === productId);
        if (prod) {
          next[slotId] = prod;
        }
      }
      return next;
    });
    addNotification("AI Bundle Applied", "Workspace slots updated with AI recommended configuration.", 'success');
  };

  const swapProductById = (slotId: string, productId: string) => {
    const prod = fixture.products.find(p => p.id === productId);
    if (prod) {
      selectProduct(slotId, prod);
    } else {
      addNotification("Product Not Found", `Product ID ${productId} was not found in the catalogue.`, 'error');
    }
  };

  const optimizeBundle = (preference: 'lowest_cost' | 'best_value' = 'lowest_cost'): OptimizationResult => {
    const result = findValidBundle(
      fixture.products,
      fixture.activity.requiredSlots,
      budget,
      fixture.shippingRule,
      fixture.taxRule,
      preference
    );

    if (result.success && result.bundleItems) {
      setCurrentItems(result.bundleItems);
      addNotification(
        "Feasible Bundle Found",
        `Assembled complete compatible bundle with landed cost ${formatINR(result.validation?.landedPrice.landedPrice || 0)}.`,
        'success'
      );
    } else {
      addNotification(
        "Optimization Unsuccessful",
        result.reason || "No combination satisfied all constraints within budget.",
        'error'
      );
    }

    return result;
  };

  const saveCurrentBundle = (name?: string, notes?: string): SavedBundle => {
    const newBundle: SavedBundle = {
      id: `BND-${Date.now().toString(36).toUpperCase()}`,
      name: name || `WFH Setup (${new Date().toLocaleDateString()})`,
      activityId: fixture.activity.id,
      budget,
      items: { ...currentItems },
      validation: { ...validation },
      savedAt: new Date().toLocaleString(),
      notes
    };

    setSavedBundles(prev => [newBundle, ...prev]);

    if (isSupabaseConnected) {
      upsertSavedBundleToDb(newBundle).catch(err => {
        console.warn('Supabase bundle sync warning:', err);
      });
    }

    addNotification(
      "Bundle Saved",
      `Saved "${newBundle.name}" to comparisons library${isSupabaseConnected ? ' & Supabase cloud' : ''}.`,
      'success'
    );
    return newBundle;
  };

  const deleteSavedBundle = (id: string) => {
    setSavedBundles(prev => prev.filter(b => b.id !== id));
    setComparedBundleIds(prev => prev.filter(bId => bId !== id));

    if (isSupabaseConnected) {
      deleteSavedBundleFromDb(id).catch(err => {
        console.warn('Supabase delete warning:', err);
      });
    }

    addNotification("Bundle Deleted", "Removed saved bundle record.", 'info');
  };

  const loadSavedBundle = (bundle: SavedBundle) => {
    setBudget(bundle.budget);
    setCurrentItems({ ...bundle.items });
    addNotification("Bundle Loaded", `Restored "${bundle.name}" into workspace.`, 'info');
    setActiveTab('catalogue');
  };

  const toggleCompareBundle = (id: string) => {
    setComparedBundleIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        if (prev.length >= 4) {
          addNotification("Comparison Limit", "You can compare up to 4 bundles simultaneously.", 'warning');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const runTestSuite = (singleTestId?: string) => {
    setIsTesting(true);
    setTimeout(() => {
      try {
        if (singleTestId) {
          const ref = fixture.referenceRequests.find(r => r.id === singleTestId);
          if (ref) {
            const singleRes = runReferenceRequestTest(
              ref,
              fixture.products,
              fixture.activity.requiredSlots,
              fixture.shippingRule,
              fixture.taxRule
            );
            setTestResults(prev => {
              const filtered = prev.filter(t => t.testId !== singleTestId);
              return [...filtered, singleRes];
            });
            addNotification(
              `Test ${singleTestId} Finished`,
              `Result: ${singleRes.passed ? 'PASSED' : 'FAILED'} - ${singleRes.actualResult}`,
              singleRes.passed ? 'success' : 'error'
            );
          } else {
            const edge = EDGE_CASE_TESTS.find(e => e.id === singleTestId);
            if (edge) {
              const edgeRes = edge.execute(
                fixture.products,
                fixture.activity.requiredSlots,
                fixture.shippingRule,
                fixture.taxRule
              );
              setTestResults(prev => {
                const filtered = prev.filter(t => t.testId !== singleTestId);
                return [...filtered, edgeRes];
              });
              addNotification(
                `Test ${singleTestId} Finished`,
                `Result: ${edgeRes.passed ? 'PASSED' : 'FAILED'} - ${edgeRes.actualResult}`,
                edgeRes.passed ? 'success' : 'error'
              );
            }
          }
        } else {
          const allRes = runAllTests(
            fixture.referenceRequests,
            fixture.products,
            fixture.activity.requiredSlots,
            fixture.shippingRule,
            fixture.taxRule
          );
          setTestResults(allRes);
          const passCount = allRes.filter(r => r.passed).length;
          addNotification(
            "Test Suite Complete",
            `Executed ${allRes.length} tests: ${passCount} passed, ${allRes.length - passCount} failed.`,
            passCount === allRes.length ? 'success' : 'warning'
          );
        }
      } catch (err: any) {
        addNotification("Test Execution Error", err?.message || "Failed running test suite.", 'error');
      } finally {
        setIsTesting(false);
      }
    }, 250);
  };

  const loadFixtureData = (data: any): { success: boolean; error?: string } => {
    try {
      let targetFixture: FixtureData;
      if (data?.records?.products || data?.case_id) {
        targetFixture = mapC07Fixture(data);
      } else if (data?.activity && Array.isArray(data?.products)) {
        targetFixture = data as FixtureData;
      } else {
        return { success: false, error: "Invalid fixture format: missing records.products or activity schema." };
      }

      if (!Array.isArray(targetFixture.activity.requiredSlots) || targetFixture.activity.requiredSlots.length === 0) {
        return { success: false, error: "Invalid fixture: activity must have at least one required slot." };
      }

      setFixture(targetFixture);
      localStorage.setItem('c07_fixture_v2', JSON.stringify(targetFixture));

      // Reset current items to match new slots
      const emptyItems: Record<string, Product | null> = {};
      for (const slot of targetFixture.activity.requiredSlots) {
        emptyItems[slot.id] = null;
      }
      setCurrentItems(emptyItems);
      if (targetFixture.activity.defaultBudget) {
        setBudget(targetFixture.activity.defaultBudget);
      }

      addNotification("Fixture Loaded", `Successfully loaded ${targetFixture.products.length} products and ${targetFixture.activity.requiredSlots.length} slots.`, 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed parsing fixture." };
    }
  };

  const resetFixtureToDefault = () => {
    setFixture(DEFAULT_SYNTHETIC_FIXTURE);
    localStorage.removeItem('c07_fixture_v2');
    localStorage.removeItem('c07_fixture_v1');
    localStorage.removeItem('c07_budget_v2');
    localStorage.removeItem('c07_budget_v1');
    localStorage.removeItem('c07_current_items_v2');
    localStorage.removeItem('c07_current_items_v1');
    const emptyItems: Record<string, Product | null> = {};
    for (const slot of DEFAULT_SYNTHETIC_FIXTURE.activity.requiredSlots) {
      emptyItems[slot.id] = null;
    }
    setCurrentItems(emptyItems);
    setBudget(DEFAULT_SYNTHETIC_FIXTURE.activity.defaultBudget);
    addNotification("Fixture Reset", "Restored default C07 benchmark dataset (fixture.json).", 'info');
  };

  const updateShippingRule = (rule: Partial<ShippingRule>) => {
    setFixture(prev => ({
      ...prev,
      shippingRule: { ...prev.shippingRule, ...rule }
    }));
    addNotification("Shipping Rule Updated", "Recalculated bundle landed shipping parameters.", 'info');
  };

  const updateTaxRule = (rule: Partial<TaxRule>) => {
    setFixture(prev => ({
      ...prev,
      taxRule: { ...prev.taxRule, ...rule }
    }));
    addNotification("Tax Rule Updated", "Recalculated bundle landed tax rate.", 'info');
  };

  const updateShopperRecord = (id: string, updates: Partial<ShopperExperimentRecord>) => {
    setShopperRecords(prev => prev.map(rec => rec.id === id ? { ...rec, ...updates } : rec));
    addNotification("Experiment Updated", `Saved notes for participant record ${id}.`, 'info');
  };

  const resetShopperRecords = () => {
    setShopperRecords(INITIAL_SHOPPER_RECORDS);
    addNotification("Experiment Reset", "Restored 5 blank participant records as required.", 'info');
  };

  const updateEvidenceRecord = (id: string, updates: Partial<ProjectEvidenceRecord>) => {
    setEvidenceRecords(prev => prev.map(rec => rec.id === id ? { ...rec, ...updates } : rec));
  };

  const addEvidenceRecord = (record: Omit<ProjectEvidenceRecord, 'id'>) => {
    const newRec: ProjectEvidenceRecord = {
      ...record,
      id: `EV-${Date.now().toString(36)}`
    };
    setEvidenceRecords(prev => [newRec, ...prev]);
    addNotification("Evidence Logged", `Added evidence log "${record.evidenceId}".`, 'success');
  };

  const deleteEvidenceRecord = (id: string) => {
    setEvidenceRecords(prev => prev.filter(r => r.id !== id));
  };

  const updateNegotiatedScope = (updates: Partial<NegotiatedScope>) => {
    setNegotiatedScope(prev => ({ ...prev, ...updates }));
    addNotification("Scope Updated", "Saved negotiated scope specifications.", 'info');
  };

  const updateUnitEconomics = (updates: Partial<UnitEconomicsParams>) => {
    setUnitEconomics(prev => ({ ...prev, ...updates }));
  };

  // Checkout & Payment Simulation State
  const [checkoutData, setCheckoutData] = useState<CheckoutBundleData | null>(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('c07_checkout_data_v1');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  const initiateCheckout = (customBundle?: {
    items: { product: Product; quantity: number }[];
    bundleName?: string;
  }) => {
    let orderData: CheckoutBundleData;

    if (customBundle && customBundle.items.length > 0) {
      const validItems = customBundle.items.filter(it => it.quantity > 0);
      const expandedProducts: Product[] = [];
      validItems.forEach(it => {
        for (let i = 0; i < it.quantity; i++) {
          expandedProducts.push(it.product);
        }
      });
      const breakdown = calculateLandedPrice(expandedProducts, budget, fixture.shippingRule, fixture.taxRule);

      orderData = {
        items: validItems,
        subtotal: breakdown.productSubtotal,
        shippingFee: breakdown.shippingFee,
        shippingDiscount: breakdown.shippingDiscount,
        netShipping: breakdown.netShipping,
        taxAmount: breakdown.taxAmount,
        total: breakdown.landedPrice,
        bundleName: customBundle.bundleName || 'Selected Bundle',
        source: 'recommendation'
      };
    } else {
      const map = new Map<string, { product: Product; quantity: number }>();
      Object.values(currentItems).forEach(p => {
        if (!p) return;
        const existing = map.get(p.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          map.set(p.id, { product: p, quantity: 1 });
        }
      });
      const items = Array.from(map.values());
      const breakdown = validation.landedPrice;

      orderData = {
        items,
        subtotal: breakdown.productSubtotal,
        shippingFee: breakdown.shippingFee,
        shippingDiscount: breakdown.shippingDiscount,
        netShipping: breakdown.netShipping,
        taxAmount: breakdown.taxAmount,
        total: breakdown.landedPrice,
        bundleName: fixture.activity.name || 'Workspace Bundle',
        source: 'workspace'
      };
    }

    try {
      localStorage.setItem('c07_checkout_data_v1', JSON.stringify(orderData));
    } catch {}

    setCheckoutData(orderData);
    setActiveTab('checkout');
  };

  useEffect(() => {
    if (checkoutData) {
      try {
        localStorage.setItem('c07_checkout_data_v1', JSON.stringify(checkoutData));
      } catch {}
    }
  }, [checkoutData]);

  return (
    <AppContext.Provider
      value={{
        checkoutData,
        setCheckoutData,
        initiateCheckout,

        userRole,
        loginAs,
        logout,
        adminSignInRequested,
        setAdminSignInRequested,

        activeTab,
        setActiveTab,
        selectedProductId,
        openProductDetails,
        closeProductDetails,
        searchQuery,
        setSearchQuery,

        fixture,
        isCustomFixture,
        loadFixtureData,
        resetFixtureToDefault,
        updateShippingRule,
        updateTaxRule,

        currentActivity: fixture.activity,
        budget,
        setBudget,
        currentItems,
        validation,
        selectProduct,
        addItemToCart,
        removeProduct,
        resetBundle,
        setBundleItems,
        optimizeBundle,

        savedBundles,
        saveCurrentBundle,
        deleteSavedBundle,
        loadSavedBundle,
        comparedBundleIds,
        toggleCompareBundle,

        testResults,
        isTesting,
        runTestSuite,

        unitEconomics,
        updateUnitEconomics,
        shopperRecords,
        updateShopperRecord,
        resetShopperRecords,

        evidenceRecords,
        updateEvidenceRecord,
        addEvidenceRecord,
        deleteEvidenceRecord,
        negotiatedScope,
        updateNegotiatedScope,

        notifications,
        markNotificationsRead,
        clearNotifications,
        addNotification,

        isAssistantOpen,
        setIsAssistantOpen,
        toggleAssistant,
        applyBundleRecommendation,
        swapProductById,

        isCartOpen,
        setIsCartOpen,
        toggleCart,

        isSupabaseConnected,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        checkSupabaseStatus,

        userProfile,
        updateUserProfile,
        resetUserProfile,
        isProfileModalOpen,
        setIsProfileModalOpen,
        openProfileModal,
        closeProfileModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
