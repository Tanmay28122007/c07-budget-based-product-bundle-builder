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

/**
 * Loads the official Razorpay Checkout SDK script dynamically
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
    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
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
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Fetches public Razorpay configuration from backend
 */
export async function getBackendPaymentConfig(): Promise<PaymentConfigResponse> {
  const fallbackKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_RAZORPAY_KEY_ID) || 'rzp_test_TpJ0WWh9K5cBbs';
  try {
    const res = await fetch('/api/payment/config');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      success: true,
      keyId: (data.keyId && data.keyId !== 'rzp_test_placeholder') ? data.keyId : fallbackKey,
      currency: data.currency || 'INR',
      isTestMode: true,
      isConfigured: true
    };
  } catch (err: any) {
    console.warn('Could not retrieve payment config from backend, using default active test key:', err.message);
    return {
      success: true,
      keyId: fallbackKey,
      currency: 'INR',
      isTestMode: true,
      isConfigured: true
    };
  }
}

/**
 * Creates an order on the backend with server-side price & stock verification
 */
export async function requestCreatePaymentOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
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

  return data;
}

/**
 * Verifies the completed Razorpay transaction on backend via HMAC SHA-256 signature
 */
export async function requestVerifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
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
 * Launches the official Razorpay Checkout modal
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
    const rzp = new (window as any).Razorpay(options);

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
