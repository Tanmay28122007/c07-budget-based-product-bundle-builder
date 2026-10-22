/**
 * Razorpay Payment Gateway Service
 * 
 * Provides server-side order creation, cryptographic HMAC SHA-256 signature
 * verification, webhook event handling, inventory deduction, and order persistence.
 * 
 * Reference implementation adapted from technosmarter/razorpay-payment-gateway-integration-in-php
 * for Node.js / Express / TypeScript architecture.
 */

import crypto from 'crypto';
import dotenv from 'dotenv';
try {
  dotenv.config();
} catch {}
import { mapC07Fixture } from '../data/defaultFixture';
import { Product, ShippingRule, TaxRule } from '../types';

// Load fixture data as source of truth for products and pricing rules
const fixture = mapC07Fixture();

export function getServiceProduct(id: string): Product | undefined {
  return fixture.products.find(p => p.id.toLowerCase() === id.toLowerCase());
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderRecord {
  id: string; // e.g., C07-ORD-123456
  userId?: string;
  customer: CustomerDetails;
  items: Array<{
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    image?: string;
  }>;
  subtotal: number;
  netShipping: number;
  taxAmount: number;
  totalAmount: number; // in INR
  amountInPaise: number; // for Razorpay
  currency: string; // 'INR'
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string; // e.g., C07-PAY-123456
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'captured' | 'failed';
  signatureVerified: boolean;
  paymentMethod?: string;
  errorDetails?: any;
  createdAt: string;
  updatedAt: string;
}

// In-Memory Order & Payment Store (persists for lifetime of node process)
const ordersStore = new Map<string, OrderRecord>();
const paymentsStore = new Map<string, PaymentRecord>();

// Webhook idempotency tracker (prevents duplicate processing of repeated webhooks)
const processedWebhookEvents = new Set<string>();

/**
 * Returns active Razorpay configuration
 */
export function getRazorpayConfig() {
  const keyId = (
    process.env.RAZORPAY_KEY_ID ||
    process.env.VITE_RAZORPAY_KEY_ID ||
    'rzp_test_TpJ0WWh9K5cBbs'
  ).trim();
  const keySecret = (
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.VITE_RAZORPAY_KEY_SECRET ||
    'b3tYXwpWQkpPT0sKcaiZmJ8K'
  ).trim();
  const webhookSecret = (
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    process.env.VITE_RAZORPAY_WEBHOOK_SECRET ||
    'testWebhookSecretXxXxXx'
  ).trim();
  const isConfigured = Boolean(
    keyId &&
    keySecret &&
    !keyId.includes('your_key_id') &&
    keyId !== 'rzp_test_placeholder'
  );

  return {
    keyId: isConfigured ? keyId : 'rzp_test_TpJ0WWh9K5cBbs',
    keySecret,
    webhookSecret,
    isConfigured: true,
    currency: 'INR',
    isTestMode: keyId.startsWith('rzp_test_')
  };
}

/**
 * Validates products and computes server-calculated landed price
 * Never trusts prices supplied by the client
 */
export function validateAndCalculateOrder(items: OrderItemInput[], shippingRule?: ShippingRule, taxRule?: TaxRule) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item.');
  }

  const sRule = shippingRule || fixture.shippingRule;
  const tRule = taxRule || fixture.taxRule;

  let productSubtotal = 0;
  let heavyItemCount = 0;
  const resolvedItems: OrderRecord['items'] = [];

  for (const item of items) {
    if (!item.productId || typeof item.productId !== 'string') {
      throw new Error('Invalid product identifier provided.');
    }

    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
      throw new Error(`Invalid quantity ${item.quantity} for product ${item.productId}. Must be between 1 and 50.`);
    }

    // Lookup product in trusted server catalog
    const product = fixture.products.find(p => p.id.toLowerCase() === item.productId.toLowerCase());
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

  // Calculate Net Shipping
  let baseShipping = 0;
  if (productSubtotal > 0) {
    if (productSubtotal >= (sRule.freeShippingThreshold || 50000)) {
      baseShipping = 0;
    } else {
      baseShipping = sRule.baseFee ?? 100;
    }
  }

  const heavySurcharge = heavyItemCount * (sRule.heavyItemSurchargePerItem || 0);
  const netShipping = baseShipping + heavySurcharge;

  // Calculate Tax (e.g., 18% GST or 0% when tax is included)
  const taxRate = typeof tRule.taxRate === 'number' ? tRule.taxRate : 0.18;
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

// Cached basic auth header
let cachedAuthKey = '';
let cachedAuthHeader = '';

function getAuthHeader(keyId: string, keySecret: string): string {
  const combo = `${keyId}:${keySecret}`;
  if (cachedAuthKey === combo && cachedAuthHeader) {
    return cachedAuthHeader;
  }
  cachedAuthKey = combo;
  cachedAuthHeader = 'Basic ' + Buffer.from(combo).toString('base64');
  return cachedAuthHeader;
}

// Active pending orders cache: map of payload hash -> { orderData, orderId, timestamp }
const pendingOrderCache = new Map<string, { orderData: any; orderId: string; timestamp: number }>();

/**
 * Creates an order on Razorpay API or generates a sandbox test order
 */
export async function createRazorpayOrder(params: {
  amountInPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string }> {
  const config = getRazorpayConfig();

  if (config.isConfigured) {
    const authHeader = getAuthHeader(config.keyId, config.keySecret);
    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          amount: params.amountInPaise,
          currency: params.currency || 'INR',
          receipt: params.receipt,
          notes: params.notes || {}
        }),
        signal: AbortSignal.timeout(7000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Razorpay API error response:', errorData);
        throw new Error(errorData?.error?.description || `Razorpay order creation failed with status ${response.status}`);
      }

      const orderData = await response.json();
      return {
        id: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency
      };
    } catch (err: any) {
      console.error(`Razorpay official order creation failed:`, err.message);
      throw new Error(`Razorpay gateway order creation failed: ${err.message}`);
    }
  }

  // Local Test Sandbox Fallback (only when Razorpay credentials are not configured)
  const testOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
  return {
    id: testOrderId,
    amount: params.amountInPaise,
    currency: params.currency || 'INR'
  };
}

function sanitizeInputString(str: string, maxLen = 250): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * Initiates an order and stores it in pending state
 */
export async function initiatePaymentOrder(data: {
  items: OrderItemInput[];
  customer: CustomerDetails;
  userId?: string;
  bundleName?: string;
}) {
  // Validate and sanitize customer details
  const fullName = sanitizeInputString(data.customer?.fullName || '', 100);
  const email = sanitizeInputString(data.customer?.email || '', 120).toLowerCase();
  const phone = (data.customer?.phone || '').replace(/[^0-9]/g, '').slice(0, 15);
  const address = sanitizeInputString(data.customer?.address || '', 300);
  const city = sanitizeInputString(data.customer?.city || '', 80);
  const state = sanitizeInputString(data.customer?.state || '', 80);
  const postalCode = sanitizeInputString(data.customer?.postalCode || '', 20);

  if (!fullName) {
    throw new Error('Customer full name is required.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new Error('A valid customer email address is required.');
  }
  if (!phone || phone.length < 10) {
    throw new Error('A valid 10-digit mobile number is required.');
  }
  if (!address) {
    throw new Error('Customer shipping address is required.');
  }

  const sanitizedCustomer: CustomerDetails = {
    fullName,
    email,
    phone,
    address,
    city,
    state,
    postalCode
  };

  // Check for existing active pending order for this customer + item combination to eliminate redundant gateway calls
  const itemsKey = (data.items || [])
    .map(i => `${i.productId}:${i.quantity}`)
    .sort()
    .join('|');
  const cacheKey = `${email}:${phone}__${itemsKey}`;

  const cached = pendingOrderCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < 5 * 60 * 1000)) {
    const existingRecord = ordersStore.get(cached.orderId);
    if (existingRecord && existingRecord.status === 'pending') {
      return cached.orderData;
    }
  }

  // Validate items & calculate trusted server pricing
  const calculation = validateAndCalculateOrder(data.items);

  // Generate internal unique order ID
  const internalOrderId = `C07-ORD-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

  // Create Razorpay Order
  const rzpOrder = await createRazorpayOrder({
    amountInPaise: calculation.amountInPaise,
    currency: 'INR',
    receipt: internalOrderId,
    notes: {
      orderId: internalOrderId,
      customerName: sanitizedCustomer.fullName,
      customerPhone: sanitizedCustomer.phone,
      bundleName: data.bundleName || 'C07 Product Bundle'
    }
  });

  const now = new Date().toISOString();
  const orderRecord: OrderRecord = {
    id: internalOrderId,
    userId: data.userId,
    customer: sanitizedCustomer,
    items: calculation.resolvedItems,
    subtotal: calculation.productSubtotal,
    netShipping: calculation.netShipping,
    taxAmount: calculation.taxAmount,
    totalAmount: calculation.totalAmount,
    amountInPaise: calculation.amountInPaise,
    currency: 'INR',
    status: 'pending',
    razorpayOrderId: rzpOrder.id,
    createdAt: now,
    updatedAt: now
  };

  ordersStore.set(internalOrderId, orderRecord);
  ordersStore.set(rzpOrder.id, orderRecord); // also index by razorpayOrderId for rapid lookup

  const config = getRazorpayConfig();

  const orderResult = {
    orderId: internalOrderId,
    razorpayOrderId: rzpOrder.id,
    amount: calculation.amountInPaise,
    currency: 'INR',
    totalAmountINR: calculation.totalAmount,
    keyId: config.keyId,
    customer: sanitizedCustomer,
    calculation: {
      subtotal: calculation.productSubtotal,
      netShipping: calculation.netShipping,
      taxAmount: calculation.taxAmount,
      totalAmount: calculation.totalAmount
    }
  };

  pendingOrderCache.set(cacheKey, {
    orderData: orderResult,
    orderId: internalOrderId,
    timestamp: Date.now()
  });

  return orderResult;
}

/**
 * Server-Side Cryptographic Signature Verification
 * Uses HMAC SHA-256 according to official Razorpay documentation
 */
export function verifyRazorpaySignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  keySecret?: string;
}): boolean {
  const secret = params.keySecret || getRazorpayConfig().keySecret;

  if (secret) {
    const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Secure timing-safe string comparison
    try {
      const a = Buffer.from(generatedSignature, 'utf8');
      const b = Buffer.from(params.razorpaySignature, 'utf8');
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  // Test mode sandbox verification:
  // If running with test mock order and test credentials, verify format
  if (
    params.razorpayOrderId.startsWith('order_') &&
    params.razorpayPaymentId.startsWith('pay_') &&
    typeof params.razorpaySignature === 'string' &&
    params.razorpaySignature.length >= 10
  ) {
    return true;
  }

  return false;
}

/**
 * Confirms payment, marks order paid, updates payment record,
 * and updates inventory in memory
 */
export function verifyAndConfirmPayment(params: {
  orderId?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMethod?: string;
}) {
  // Retrieve order (supports serverless environments where container memory is ephemeral)
  let order = ordersStore.get(params.orderId || params.razorpayOrderId);
  if (!order) {
    // Verify cryptographic signature directly
    const isSigValid = verifyRazorpaySignature({
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      razorpaySignature: params.razorpaySignature
    });

    if (!isSigValid) {
      throw new Error(`Cryptographic signature verification failed for Razorpay Order ID '${params.razorpayOrderId}'.`);
    }

    const now = new Date().toISOString();
    const resolvedId = params.orderId || `C07-ORD-${params.razorpayOrderId.replace(/^order_/, '')}`;
    order = {
      id: resolvedId,
      customer: {
        fullName: 'Customer',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: ''
      },
      items: [],
      subtotal: 0,
      netShipping: 0,
      taxAmount: 0,
      totalAmount: 0,
      amountInPaise: 0,
      currency: 'INR',
      status: 'pending',
      razorpayOrderId: params.razorpayOrderId,
      createdAt: now,
      updatedAt: now
    };
    ordersStore.set(resolvedId, order);
    ordersStore.set(params.razorpayOrderId, order);
  }

  // Prevent duplicate processing
  if (order.status === 'paid') {
    return {
      success: true,
      alreadyPaid: true,
      order,
      message: 'Order has already been verified and paid.'
    };
  }

  // Verify HMAC SHA-256 signature
  const isSignatureValid = verifyRazorpaySignature({
    razorpayOrderId: params.razorpayOrderId,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature
  });

  const now = new Date().toISOString();

  // Create payment audit record
  const paymentRecord: PaymentRecord = {
    id: `C07-PAY-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`,
    orderId: order.id,
    razorpayOrderId: params.razorpayOrderId,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature,
    amount: order.totalAmount,
    currency: order.currency,
    status: isSignatureValid ? 'captured' : 'failed',
    signatureVerified: isSignatureValid,
    paymentMethod: params.paymentMethod || 'Razorpay Checkout',
    createdAt: now,
    updatedAt: now
  };
  paymentsStore.set(paymentRecord.id, paymentRecord);
  paymentsStore.set(params.razorpayPaymentId, paymentRecord);

  if (!isSignatureValid) {
    order.status = 'failed';
    order.failureReason = 'Cryptographic signature mismatch during verification.';
    order.updatedAt = now;
    throw new Error('Payment signature verification failed. The transaction payload was invalid or tampered with.');
  }

  // Mark order paid
  order.status = 'paid';
  order.razorpayPaymentId = params.razorpayPaymentId;
  order.paymentMethod = params.paymentMethod || 'Razorpay Verified';
  order.updatedAt = now;

  // Deduct inventory stock for purchased products
  for (const item of order.items) {
    const prod = fixture.products.find(p => p.id === item.productId);
    if (prod && typeof prod.stockQuantity === 'number') {
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
    message: 'Payment successfully verified and order marked as paid.'
  };
}

/**
 * Handles incoming Razorpay Webhooks
 */
export function processRazorpayWebhook(params: {
  rawBody: string;
  signatureHeader?: string;
  event: any;
}) {
  const config = getRazorpayConfig();

  // Verify webhook signature if webhook secret is configured and signature header provided
  if (config.webhookSecret && params.signatureHeader) {
    const expectedSignature = crypto
      .createHmac('sha256', config.webhookSecret)
      .update(params.rawBody)
      .digest('hex');

    try {
      const a = Buffer.from(expectedSignature, 'utf8');
      const b = Buffer.from(params.signatureHeader, 'utf8');
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        throw new Error('Invalid Razorpay webhook signature header.');
      }
    } catch (err: any) {
      throw new Error(err.message || 'Invalid Razorpay webhook signature header.');
    }
  }

  const eventPayload = params.event;
  const eventId = eventPayload?.event_id || eventPayload?.payload?.payment?.entity?.id || `evt_${Date.now()}`;

  // Idempotency check: prevent duplicate processing of repeated deliveries
  if (processedWebhookEvents.has(eventId)) {
    return {
      received: true,
      duplicate: true,
      message: 'Event has already been processed idempotently.'
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
      const now = new Date().toISOString();
      if (eventType === 'payment.captured' || eventType === 'order.paid') {
        if (order.status !== 'paid') {
          order.status = 'paid';
          order.razorpayPaymentId = razorpayPaymentId || order.razorpayPaymentId;
          order.updatedAt = now;
        }
      } else if (eventType === 'payment.failed') {
        if (order.status !== 'paid') {
          order.status = 'failed';
          order.failureReason = paymentEntity?.error_description || 'Payment failed via webhook.';
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

/**
 * Mask PII helper for secure public display
 */
export function maskOrderPII(order: OrderRecord): OrderRecord {
  const c = order.customer;
  const emailParts = (c.email || '').split('@');
  const maskedEmail =
    emailParts.length === 2 && emailParts[0].length > 1
      ? `${emailParts[0][0]}***@${emailParts[1]}`
      : '***@***.com';
  const phoneDigits = (c.phone || '').replace(/[^0-9]/g, '');
  const maskedPhone = phoneDigits.length >= 4 ? `******${phoneDigits.slice(-4)}` : '******';
  const maskedAddress = c.address ? `${c.address.slice(0, 4)}***, Protected Delivery Address` : '***';
  const nameParts = (c.fullName || '').trim().split(/\s+/);
  const maskedName = nameParts.map(p => (p.length > 1 ? `${p[0]}***` : p)).join(' ');

  return {
    ...order,
    customer: {
      ...c,
      fullName: maskedName || 'Customer',
      email: maskedEmail,
      phone: maskedPhone,
      address: maskedAddress
    }
  };
}

/**
 * Retrieves order details by ID (safely masks PII unless unmask requested)
 */
export function getOrderById(orderId: string, maskPII = true): OrderRecord | undefined {
  const ord = ordersStore.get(orderId);
  if (!ord) return undefined;
  return maskPII ? maskOrderPII(ord) : ord;
}

/**
 * Retrieves all orders (safely masks PII by default to prevent data exfiltration)
 */
export function getAllOrders(maskPII = true): OrderRecord[] {
  const set = new Set<OrderRecord>();
  for (const ord of ordersStore.values()) {
    set.add(maskPII ? maskOrderPII(ord) : ord);
  }
  return Array.from(set);
}
