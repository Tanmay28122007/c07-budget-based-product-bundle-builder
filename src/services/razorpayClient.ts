/**
 * Razorpay Client SDK & API Integration Service
 * 
 * Manages loading the official Razorpay Checkout SDK (checkout.js),
 * invoking Razorpay Standard Checkout modal, and communicating with
 * backend order creation and verification APIs.
 */

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayPaymentFailureResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id?: string;
      payment_id?: string;
    };
  };
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayPaymentSuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: 'upi' | 'card' | 'netbanking';
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface PaymentConfigResponse {
  success: boolean;
  keyId: string;
  currency: string;
  isTestMode: boolean;
  isConfigured: boolean;
}

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  bundleName?: string;
  userId?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  razorpayOrderId: string;
  amount: number; // in paise
  currency: string;
  totalAmountINR: number;
  keyId: string;
  error?: string;
}

export interface VerifyPaymentPayload {
  orderId?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMethod?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  alreadyPaid?: boolean;
  order?: any;
  payment?: any;
  message?: string;
  error?: string;
}

let scriptLoadPromise: Promise<boolean> | null = null;
let cachedConfig: PaymentConfigResponse | null = null;
let configPromise: Promise<PaymentConfigResponse> | null = null;

// Pre-warmed order memory cache for instant checkout
let prewarmedOrderKey: string | null = null;
let prewarmedOrderPromise: Promise<CreateOrderResponse> | null = null;
let prewarmedOrderData: CreateOrderResponse | null = null;

function computePayloadKey(payload: CreateOrderPayload): string {
  try {
    const itemsKey = (payload.items || [])
      .map(i => `${i.productId}:${i.quantity}`)
      .sort()
      .join('|');
    const custKey = `${payload.customer?.fullName || ''}:${payload.customer?.email || ''}:${payload.customer?.phone || ''}:${payload.customer?.postalCode || ''}`;
    return `${itemsKey}__${custKey}`;
  } catch {
    return '';
  }
}

/**
 * Loads the official Razorpay Checkout SDK script dynamically and eagerly
 */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  // If already loaded on the page
  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise(resolve => {
    // If window.Razorpay appears at any point, resolve immediately
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag already exists in the document
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      // Check immediately and poll quickly in case load event already fired
      let checkCount = 0;
      const interval = setInterval(() => {
        if ((window as any).Razorpay) {
          clearInterval(interval);
          resolve(true);
        } else if (++checkCount > 40) { // max 1 second
          clearInterval(interval);
          resolve(Boolean((window as any).Razorpay));
        }
      }, 25);

      existingScript.addEventListener('load', () => {
        clearInterval(interval);
        resolve(true);
      }, { once: true });

      existingScript.addEventListener('error', () => {
        clearInterval(interval);
        resolve(false);
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.warn('Failed to load official Razorpay checkout.js script.');
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

// Eagerly trigger script loading in browser immediately
if (typeof window !== 'undefined') {
  loadRazorpayCheckoutScript().catch(() => {});
}

/**
 * Fetches public Razorpay configuration from backend with persistent caching
 */
export async function getBackendPaymentConfig(): Promise<PaymentConfigResponse> {
  if (cachedConfig) {
    return cachedConfig;
  }
  if (configPromise) {
    return configPromise;
  }

  const fallbackKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_RAZORPAY_KEY_ID) || 'rzp_test_TpJ0WWh9K5cBbs';
  
  configPromise = (async () => {
    try {
      const res = await fetch('/api/payment/config');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const cfg: PaymentConfigResponse = {
        success: true,
        keyId: (data.keyId && data.keyId !== 'rzp_test_placeholder') ? data.keyId : fallbackKey,
        currency: data.currency || 'INR',
        isTestMode: true,
        isConfigured: true
      };
      cachedConfig = cfg;
      return cfg;
    } catch (err: any) {
      console.warn('Could not retrieve payment config from backend, using default active test key:', err.message);
      const fallbackCfg: PaymentConfigResponse = {
        success: true,
        keyId: fallbackKey,
        currency: 'INR',
        isTestMode: true,
        isConfigured: true
      };
      cachedConfig = fallbackCfg;
      return fallbackCfg;
    } finally {
      configPromise = null;
    }
  })();

  return configPromise;
}

/**
 * Pre-warms / pre-creates a Razorpay order in the background while the user is on the checkout page
 * so that clicking "Pay" opens Razorpay with zero network latency.
 */
export function prewarmPaymentOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  const key = computePayloadKey(payload);
  if (!key) {
    return requestCreatePaymentOrder(payload);
  }

  if (prewarmedOrderKey === key && prewarmedOrderData) {
    return Promise.resolve(prewarmedOrderData);
  }

  if (prewarmedOrderKey === key && prewarmedOrderPromise) {
    return prewarmedOrderPromise;
  }

  prewarmedOrderKey = key;
  prewarmedOrderData = null;

  prewarmedOrderPromise = requestCreatePaymentOrder(payload)
    .then(data => {
      prewarmedOrderData = data;
      return data;
    })
    .catch(err => {
      if (prewarmedOrderKey === key) {
        prewarmedOrderKey = null;
        prewarmedOrderPromise = null;
      }
      throw err;
    });

  return prewarmedOrderPromise;
}

/**
 * Creates an order on the backend with server-side price & stock verification
 */
export async function requestCreatePaymentOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  const key = computePayloadKey(payload);

  // Return cached prewarmed order if it matches the current request
  if (key && prewarmedOrderKey === key && prewarmedOrderData) {
    return prewarmedOrderData;
  }

  if (key && prewarmedOrderKey === key && prewarmedOrderPromise) {
    return prewarmedOrderPromise;
  }

  const res = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    const rawText = await res.text().catch(() => '');
    throw new Error(`Server returned error ${res.status}: ${rawText.slice(0, 120) || res.statusText}`);
  }

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create payment order on server.');
  }

  if (key) {
    prewarmedOrderKey = key;
    prewarmedOrderData = data;
  }

  return data;
}

/**
 * Verifies the completed Razorpay transaction on backend via HMAC SHA-256 signature
 */
export async function requestVerifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
  // Clear prewarmed cache on successful payment submission
  prewarmedOrderKey = null;
  prewarmedOrderData = null;
  prewarmedOrderPromise = null;

  const res = await fetch('/api/payment/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    const rawText = await res.text().catch(() => '');
    throw new Error(`Server returned error ${res.status}: ${rawText.slice(0, 120) || res.statusText}`);
  }

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Payment verification failed on server.');
  }

  return data;
}

/**
 * Launches the official Razorpay Checkout modal with optimized instantaneous startup
 */
export async function launchRazorpayCheckout(
  options: RazorpayCheckoutOptions,
  onFailed?: (errorResponse: RazorpayPaymentFailureResponse) => void
): Promise<{ instance?: any; error?: string }> {
  const isLoaded = await loadRazorpayCheckoutScript();

  if (!isLoaded || !(window as any).Razorpay) {
    return {
      error: 'Razorpay Checkout script could not be loaded. Please check your network connection or test mode configuration.'
    };
  }

  try {
    // Fast-path options: disable animation to eliminate CSS delay and configure instant modal open
    const fastOptions = {
      ...options,
      modal: {
        animation: false,
        backdropclose: false,
        escape: true,
        handleback: true,
        ...(options.modal || {})
      }
    };

    const rzp = new (window as any).Razorpay(fastOptions);

    if (onFailed) {
      rzp.on('payment.failed', (response: RazorpayPaymentFailureResponse) => {
        onFailed(response);
      });
    }

    rzp.open();
    return { instance: rzp };
  } catch (err: any) {
    console.error('Error invoking Razorpay instance:', err);
    return { error: err.message };
  }
}
