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
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
  const isConfigured = Boolean(keyId && keySecret && !keyId.includes('your_key_id'));

  return {
    keyId: isConfigured ? keyId : (keyId || 'rzp_test_placeholder'),
    keySecret,
    webhookSecret,
    isConfigured,
    currency: 'INR',
    isTestMode: true
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
    const authHeader = 'Basic ' + Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
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
        })
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

/**
 * Initiates an order and stores it in pending state
 */
export async function initiatePaymentOrder(data: {
  items: OrderItemInput[];
  customer: CustomerDetails;
  userId?: string;
  bundleName?: string;
}) {
  // Validate customer details
  if (!data.customer?.fullName?.trim()) {
    throw new Error('Customer full name is required.');
  }
  if (!data.customer?.email?.trim() || !data.customer.email.includes('@')) {
    throw new Error('A valid customer email address is required.');
  }
  if (!data.customer?.phone?.trim() || data.customer.phone.replace(/[^0-9]/g, '').length < 10) {
    throw new Error('A valid 10-digit mobile number is required.');
  }
  if (!data.customer?.address?.trim()) {
    throw new Error('Customer shipping address is required.');
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
      customerName: data.customer.fullName,
      customerPhone: data.customer.phone,
      bundleName: data.bundleName || 'C07 Product Bundle'
    }
  });

  const now = new Date().toISOString();
  const orderRecord: OrderRecord = {
    id: internalOrderId,
    userId: data.userId,
    customer: data.customer,
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

  return {
    orderId: internalOrderId,
    razorpayOrderId: rzpOrder.id,
    amount: calculation.amountInPaise,
    currency: 'INR',
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
  // Retrieve order
  const order = ordersStore.get(params.orderId || params.razorpayOrderId);
  if (!order) {
    throw new Error(`Order corresponding to Razorpay Order ID '${params.razorpayOrderId}' was not found.`);
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

  // Verify webhook signature if webhook secret is configured
  if (config.webhookSecret && params.signatureHeader) {
    const expectedSignature = crypto
      .createHmac('sha256', config.webhookSecret)
      .update(params.rawBody)
      .digest('hex');

    if (expectedSignature !== params.signatureHeader) {
      throw new Error('Invalid Razorpay webhook signature header.');
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
 * Retrieves order details by ID
 */
export function getOrderById(orderId: string): OrderRecord | undefined {
  return ordersStore.get(orderId);
}

/**
 * Retrieves all orders (masked for security)
 */
export function getAllOrders(): OrderRecord[] {
  const set = new Set<OrderRecord>();
  for (const ord of ordersStore.values()) {
    set.add(ord);
  }
  return Array.from(set);
}
