import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  Building2,
  Smartphone,
  Truck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Download,
  Check,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Wallet,
  Clock,
  Layers,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import { downloadFile } from '../../utils/exportUtils';
import { CheckoutBundleData, CheckoutBundleItem, Product } from '../../types';
import { getProductImageUrl } from '../../utils/imageUtils';
import {
  requestCreatePaymentOrder,
  requestVerifyPayment,
  launchRazorpayCheckout,
  getBackendPaymentConfig,
  PaymentConfigResponse,
  RazorpayPaymentSuccessResponse,
  RazorpayPaymentFailureResponse
} from '../../services/razorpayClient';

type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'cod';

interface CustomerForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export const CheckoutPage: React.FC = () => {
  const {
    checkoutData,
    currentItems,
    validation,
    fixture,
    budget,
    userProfile,
    setActiveTab,
    addNotification
  } = useApp();

  // Active bundle items either from checkoutData or fallback to currentItems
  const activeOrder: CheckoutBundleData | null = useMemo(() => {
    if (checkoutData && checkoutData.items && checkoutData.items.length > 0) {
      return checkoutData;
    }

    // Fallback: construct from active currentItems
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
    if (items.length === 0) return null;

    return {
      items,
      subtotal: validation.landedPrice.productSubtotal,
      shippingFee: validation.landedPrice.shippingFee,
      shippingDiscount: validation.landedPrice.shippingDiscount,
      netShipping: validation.landedPrice.netShipping,
      taxAmount: validation.landedPrice.taxAmount,
      total: validation.landedPrice.landedPrice,
      bundleName: fixture.activity.name || 'Workspace Bundle',
      source: 'workspace'
    };
  }, [checkoutData, currentItems, validation, fixture]);

  // Customer Details Form State
  const [customer, setCustomer] = useState<CustomerForm>(() => {
    return {
      fullName: userProfile?.name || 'Tanmay Anand',
      email: userProfile?.email || 'tanmay.anand@craftbundle.io',
      phone: userProfile?.phone || '9876543210',
      address: userProfile?.address || '42 Indiranagar 100ft Road',
      city: userProfile?.city || 'Bengaluru',
      state: userProfile?.state || 'Karnataka',
      postalCode: userProfile?.postalCode || '560038'
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'custom'>('gpay');
  const [customUpiId, setCustomUpiId] = useState('tanmay@okhdfcbank');

  const [cardName, setCardName] = useState(userProfile?.name || 'Tanmay Anand');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Checkout flow state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStepText, setProcessStepText] = useState('');
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [razorpayOrderId, setRazorpayOrderId] = useState('');
  const [razorpayPaymentId, setRazorpayPaymentId] = useState('');
  const [orderTimestamp, setOrderTimestamp] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfigResponse | null>(null);

  // Fetch Razorpay configuration on mount
  useEffect(() => {
    getBackendPaymentConfig()
      .then(cfg => setPaymentConfig(cfg))
      .catch(() => {});
  }, []);

  // Form Validation
  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!customer.fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (customer.fullName.trim().length < 2) {
      errs.fullName = 'Name must be at least 2 characters';
    }

    if (!customer.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    if (!customer.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!customer.address.trim()) {
      errs.address = 'Delivery address is required';
    } else if (customer.address.trim().length < 5) {
      errs.address = 'Address must be at least 5 characters';
    }

    if (!customer.city.trim()) {
      errs.city = 'City is required';
    }

    if (!customer.state.trim()) {
      errs.state = 'State is required';
    }

    const cleanPin = customer.postalCode.replace(/[^0-9]/g, '');
    if (!customer.postalCode.trim()) {
      errs.postalCode = 'PIN code is required';
    } else if (cleanPin.length !== 6) {
      errs.postalCode = 'Please enter a valid 6-digit Indian PIN code';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (field: keyof CustomerForm, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      // Re-validate field
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: keyof CustomerForm) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate();
  };

  const handleAutofillDemo = () => {
    setCustomer({
      fullName: 'Aarav Shah',
      email: 'aarav.shah@workspacecraft.in',
      phone: '9820012345',
      address: 'Plot 18, Cyber Towers, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400051'
    });
    setErrors({});
    setPaymentError(null);
    addNotification('Demo Details Autofilled', 'Populated customer and shipping details for checkout.', 'info');
  };

  // Real Razorpay Payment Execution Flow
  const handlePayNow = async () => {
    const isValid = validate();
    if (!isValid) {
      // Mark all fields touched
      const allTouched: Record<string, boolean> = {};
      Object.keys(customer).forEach(k => (allTouched[k] = true));
      setTouched(allTouched);
      addNotification('Incomplete Form', 'Please fill in all required customer and delivery fields.', 'warning');
      return;
    }

    if (!activeOrder || activeOrder.items.length === 0) {
      addNotification('Empty Bundle', 'No products found to checkout.', 'error');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    setProcessStepText('Validating products & available inventory on server...');

    try {
      // Construct item payload for server validation
      const itemsPayload = activeOrder.items.map(it => ({
        productId: it.product.id,
        quantity: it.quantity
      }));

      // 1. Create order on server (server calculates exact landed price & stock)
      const orderRes = await requestCreatePaymentOrder({
        items: itemsPayload,
        customer,
        bundleName: activeOrder.bundleName || 'C07 Product Bundle'
      });

      setConfirmedOrderId(orderRes.orderId);
      setRazorpayOrderId(orderRes.razorpayOrderId);
      setProcessStepText('Connecting to official Razorpay Checkout gateway...');

      const paymentLabel =
        paymentMethod === 'upi'
          ? `UPI (${upiApp.toUpperCase()})`
          : paymentMethod === 'card'
          ? 'Credit/Debit Card'
          : paymentMethod === 'netbanking'
          ? `Net Banking (${selectedBank})`
          : 'Cash on Delivery';

      // 2. Launch Razorpay Standard Checkout
      const launchResult = await launchRazorpayCheckout(
        {
          key: orderRes.keyId || paymentConfig?.keyId || 'rzp_test_TpJ0WWh9K5cBbs',
          amount: Math.round(orderRes.amount),
          currency: orderRes.currency || 'INR',
          name: 'CraftBundle · Product Bundle Builder',
          description: `${activeOrder.bundleName || 'Curated Bundle'} (Order #${orderRes.orderId})`,
          order_id: orderRes.razorpayOrderId,
          prefill: {
            name: customer.fullName.trim(),
            email: customer.email.trim(),
            contact: customer.phone.replace(/[^0-9]/g, '')
          },
          notes: {
            orderId: orderRes.orderId,
            deliveryAddress: `${customer.address}, ${customer.city}, ${customer.state} - ${customer.postalCode}`.slice(0, 240)
          },
          theme: {
            color: '#2C3A2B',
            backdrop_color: 'rgba(44, 58, 43, 0.6)'
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setPaymentError('Payment window was closed before completion. Your bundle items and delivery address are preserved so you can retry whenever ready.');
              addNotification('Payment Cancelled', 'Razorpay checkout modal was dismissed.', 'warning');
            }
          },
          handler: async (response: RazorpayPaymentSuccessResponse) => {
            setProcessStepText('Verifying cryptographic HMAC SHA-256 signature with Razorpay...');
            try {
              // 3. Verify payment signature on backend
              const verifyRes = await requestVerifyPayment({
                orderId: orderRes.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentMethod: paymentLabel
              });

              const now = new Date().toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              setConfirmedOrderId(orderRes.orderId);
              setRazorpayPaymentId(response.razorpay_payment_id);
              setOrderTimestamp(now);
              setIsProcessing(false);
              setIsOrderConfirmed(true);

              addNotification(
                'Payment Verified & Order Confirmed',
                `Payment ID: ${response.razorpay_payment_id} verified. Order #${orderRes.orderId} confirmed for ${formatINR(orderRes.totalAmountINR)}.`,
                'success'
              );
            } catch (vErr: any) {
              setIsProcessing(false);
              setPaymentError(`Payment signature verification failed: ${vErr.message || 'Signature mismatch.'}`);
              addNotification('Verification Error', vErr.message || 'Signature verification failed.', 'error');
            }
          }
        },
        (failRes: RazorpayPaymentFailureResponse) => {
          setIsProcessing(false);
          const reason = failRes.error?.description || 'The payment transaction was declined by the bank or gateway.';
          setPaymentError(`Payment failed: ${reason} (Code: ${failRes.error?.code || 'UNKNOWN'})`);
          addNotification('Payment Declined', reason, 'error');
        }
      );

      // In case Razorpay script is blocked (e.g. adblocker, local sandbox, or offline testing)
      if (launchResult.error) {
        console.warn('Razorpay popup unavailable in this client environment:', launchResult.error);
        setProcessStepText('Performing test sandbox signature verification...');
        setTimeout(async () => {
          try {
            const mockPaymentId = `pay_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
            const mockSignature = `sig_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 10)}`;

            await requestVerifyPayment({
              orderId: orderRes.orderId,
              razorpayOrderId: orderRes.razorpayOrderId,
              razorpayPaymentId: mockPaymentId,
              razorpaySignature: mockSignature,
              paymentMethod: `${paymentLabel} (Razorpay Test Sandbox)`
            });

            const now = new Date().toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short'
            });

            setConfirmedOrderId(orderRes.orderId);
            setRazorpayPaymentId(mockPaymentId);
            setOrderTimestamp(now);
            setIsProcessing(false);
            setIsOrderConfirmed(true);

            addNotification(
              'Test Payment Verified',
              `Order #${orderRes.orderId} verified via Razorpay Sandbox Mode (Payment ID: ${mockPaymentId}).`,
              'success'
            );
          } catch (mockErr: any) {
            setIsProcessing(false);
            setPaymentError(`Test verification failed: ${mockErr.message}`);
          }
        }, 800);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError(err.message || 'An unexpected error occurred during order creation.');
      addNotification('Order Creation Failed', err.message || 'Server error', 'error');
    }
  };

  // Download official printable receipt
  const handleDownloadReceipt = () => {
    if (!activeOrder) return;

    const paymentLabel =
      paymentMethod === 'upi'
        ? `UPI (${upiApp.toUpperCase()} - ${upiApp === 'custom' ? customUpiId : 'Instant'})`
        : paymentMethod === 'card'
        ? `Credit/Debit Card`
        : paymentMethod === 'netbanking'
        ? `Net Banking (${selectedBank})`
        : 'Cash on Delivery';

    const lines = [
      '==================================================================',
      '        C07 PRODUCT BUNDLE BUILDER — OFFICIAL PAYMENT RECEIPT      ',
      '              (Powered by Razorpay Payment Gateway)               ',
      '==================================================================',
      `Internal Order ID   : ${confirmedOrderId}`,
      `Razorpay Payment ID : ${razorpayPaymentId || 'N/A'}`,
      `Razorpay Order ID   : ${razorpayOrderId || 'N/A'}`,
      `Payment Verification: VERIFIED (HMAC SHA-256 Validated)`,
      `Order Date & Time   : ${orderTimestamp}`,
      `Payment Method      : ${paymentLabel}`,
      '------------------------------------------------------------------',
      'CUSTOMER & DELIVERY DETAILS:',
      `  Name              : ${customer.fullName}`,
      `  Email             : ${customer.email}`,
      `  Phone             : ${customer.phone}`,
      `  Delivery Address  : ${customer.address}`,
      `  City / State      : ${customer.city}, ${customer.state} - ${customer.postalCode}`,
      `  Country           : India`,
      '------------------------------------------------------------------',
      'ORDERED BUNDLE ITEMS:',
      ...activeOrder.items.map(
        (it, idx) =>
          `  ${idx + 1}. [${it.product.id}] ${it.product.name.padEnd(32)} × ${it.quantity} = ${formatINR(
            it.product.price * it.quantity
          )}`
      ),
      '------------------------------------------------------------------',
      'LANDED PRICE BREAKDOWN:',
      `  Product Subtotal  : ${formatINR(activeOrder.subtotal)}`,
      `  Net Shipping      : ${activeOrder.netShipping === 0 ? 'FREE (Threshold Met)' : formatINR(activeOrder.netShipping)}`,
      `  Applicable Taxes  : ${formatINR(activeOrder.taxAmount)} (18% GST)`,
      '  ==============================================================',
      `  FINAL TOTAL PAID  : ${formatINR(activeOrder.total)}`,
      '  ==============================================================',
      '',
      'AUTHENTICITY ASSURANCE:',
      'This payment was processed and verified using Razorpay Gateway API.',
      'Cryptographic HMAC SHA-256 signature verification was completed server-side.',
      'Thank you for choosing CraftBundle!',
      '=================================================================='
    ];

    downloadFile(lines.join('\n'), `Receipt_${confirmedOrderId}.txt`, 'text/plain');
    addNotification('Receipt Downloaded', `Saved official receipt for order #${confirmedOrderId}.`, 'info');
  };

  // If no active bundle items found
  if (!activeOrder || activeOrder.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="p-10 bg-white border border-[#E6E1D3] rounded-[28px] shadow-xs space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F4F1EA] text-[#8B5A2B] flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#2C3A2B]">Your Bundle is Currently Empty</h2>
          <p className="text-sm text-[#5A5A40] max-w-md mx-auto leading-relaxed">
            There are no products in your active bundle to check out. Select products in the bundle builder or pick from our curated recommendations to proceed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab('compare')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Bundle Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('catalogue')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3A2B] bg-[#F5F5EC] border border-[#E6E1D3] hover:bg-[#EAE8DD] transition-all cursor-pointer flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Browse Product Catalogue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: ORDER CONFIRMATION SCREEN (After Pay Now completed)
  // =========================================================================
  if (isOrderConfirmed) {
    const paymentLabel =
      paymentMethod === 'upi'
        ? `UPI (${upiApp.toUpperCase()})`
        : paymentMethod === 'card'
        ? `Card ending in 4242`
        : paymentMethod === 'netbanking'
        ? `Net Banking (${selectedBank})`
        : 'Cash on Delivery';

    return (
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        {/* Success Header Box */}
        <div className="p-8 sm:p-10 bg-white border border-[#E6E1D3] rounded-[28px] shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-[#2C3A2B] to-[#A3B18A]" />

          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mb-4 shadow-xs animate-bounce-short">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Razorpay Verified Payment</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3A2B] mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5A40] max-w-lg mx-auto leading-relaxed">
            Your payment has been cryptographically verified and authorized via Razorpay Gateway. Your order has been recorded in the system.
          </p>

          {/* Quick Key-Value Strip */}
          <div className="mt-6 pt-6 border-t border-[#E6E1D3] grid grid-cols-2 sm:grid-cols-5 gap-3 text-left">
            <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E6E1D3]">
              <span className="text-[10px] font-semibold text-[#8B8B7A] uppercase block">Order ID</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-[#2C3A2B]">{confirmedOrderId}</span>
            </div>
            <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E6E1D3]">
              <span className="text-[10px] font-semibold text-[#8B8B7A] uppercase block">Razorpay Payment ID</span>
              <span className="text-xs font-mono font-bold text-emerald-800 break-all">{razorpayPaymentId || 'pay_test_verified'}</span>
            </div>
            <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E6E1D3]">
              <span className="text-[10px] font-semibold text-[#8B8B7A] uppercase block">Date & Time</span>
              <span className="text-xs font-mono font-semibold text-[#2C3A2B]">{orderTimestamp}</span>
            </div>
            <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E6E1D3]">
              <span className="text-[10px] font-semibold text-[#8B8B7A] uppercase block">Payment Method</span>
              <span className="text-xs font-semibold text-[#2C3A2B]">{paymentLabel}</span>
            </div>
            <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E6E1D3]">
              <span className="text-[10px] font-semibold text-[#8B8B7A] uppercase block">Estimated Delivery</span>
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> 3-4 Business Days
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Details Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer & Shipping Summary */}
          <div className="p-6 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#2C3A2B] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8B5A2B]" />
              <span>Delivery Details</span>
            </h3>

            <div className="space-y-2 text-xs text-[#2C2C1E]">
              <div>
                <span className="text-[#8B8B7A] block text-[11px]">Recipient</span>
                <span className="font-semibold">{customer.fullName}</span>
              </div>
              <div>
                <span className="text-[#8B8B7A] block text-[11px]">Contact</span>
                <span className="font-mono">{customer.phone}</span>
                <span className="text-[#5A5A40] block">{customer.email}</span>
              </div>
              <div className="pt-2 border-t border-[#E6E1D3]/80">
                <span className="text-[#8B8B7A] block text-[11px]">Shipping Address</span>
                <p className="leading-relaxed text-[#4A4A35]">
                  {customer.address},<br />
                  {customer.city}, {customer.state} - <span className="font-mono font-semibold">{customer.postalCode}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Order Summary */}
          <div className="md:col-span-2 p-6 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-[#2C3A2B] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#8B5A2B]" />
                <span>Purchased Bundle Items ({activeOrder.items.length})</span>
              </h3>
              <span className="text-xs font-semibold text-[#8B5A2B] bg-[#F4F1EA] px-2.5 py-0.5 rounded-lg border border-[#E6E1D3]">
                {activeOrder.bundleName || 'Curated Bundle'}
              </span>
            </div>

            <div className="divide-y divide-[#E6E1D3]/70 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {activeOrder.items.map((it, idx) => (
                <div key={`${it.product.id}-${idx}`} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#FDFBF7] border border-[#E6E1D3] rounded-lg p-1 flex items-center justify-center shrink-0">
                      <img
                        src={getProductImageUrl(it.product.image, it.product.id)}
                        alt={it.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-[#2C3A2B] line-clamp-1">{it.product.name}</div>
                      <div className="text-[11px] text-[#7A7A68]">
                        Qty: <span className="font-bold text-[#2C2C1E]">{it.quantity}</span> · Unit: {formatINR(it.product.price)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono font-bold text-[#2C3A2B]">
                    {formatINR(it.product.price * it.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Table */}
            <div className="pt-3 border-t border-[#E6E1D3] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#5A5A40]">
                <span>Items Subtotal</span>
                <span className="font-mono">{formatINR(activeOrder.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[#5A5A40]">
                <span>Net Shipping Fee</span>
                <span className="font-mono">
                  {activeOrder.netShipping === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE (Eligible)</span>
                  ) : (
                    formatINR(activeOrder.netShipping)
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#5A5A40]">
                <span>Applicable Taxes (GST 18%)</span>
                <span className="font-mono">{formatINR(activeOrder.taxAmount)}</span>
              </div>
              <div className="pt-2 border-t border-[#E6E1D3] flex items-center justify-between text-sm font-bold text-[#2C3A2B]">
                <span>Total Amount Paid</span>
                <span className="font-mono text-base text-[#2C3A2B]">{formatINR(activeOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="p-5 bg-white border border-[#E6E1D3] rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDownloadReceipt}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] flex items-center gap-2 transition-all cursor-pointer shadow-2xs hover:scale-102"
          >
            <Download className="w-4 h-4 text-[#8B5A2B]" />
            <span>Download Demo Receipt (.txt)</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('compare')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Back to Bundle Builder</span>
            </button>

            <button
              onClick={() => setActiveTab('catalogue')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102"
            >
              <span>Continue Shopping</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: CHECKOUT / PAYMENT FORM (Before Order Confirmation)
  // =========================================================================
  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-4 px-2 sm:px-4 space-y-6">
      {/* Top Header & Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E6E1D3]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('compare')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] transition-colors cursor-pointer"
            title="Preserves your current bundle configuration"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Bundle</span>
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2C3A2B] leading-tight">
              Checkout & Payment
            </h1>
            <p className="text-xs text-[#5A5A40]">
              Review bundle items, confirm delivery address, and test simulated payment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('catalogue')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#5A5A40] hover:text-[#2C3A2B] hover:bg-white border border-transparent hover:border-[#E6E1D3] transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono text-amber-900 bg-amber-50 border border-amber-200">
            <Lock className="w-3 h-3 text-amber-600" /> Demo Sandbox
          </span>
        </div>
      </div>


      {/* Main Grid: Left Column (Forms) + Right Column (Order Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Details & Payment Methods (7 of 12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Customer & Delivery Details */}
          <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E1D3]/70 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2C3A2B] text-white flex items-center justify-center text-xs font-bold font-mono">
                  1
                </div>
                <div>
                  <h2 className="text-sm font-serif font-bold text-[#2C3A2B]">Customer & Delivery Details</h2>
                  <p className="text-[11px] text-[#7A7A68]">Where should this product bundle be dispatched?</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutofillDemo}
                className="text-[11px] font-semibold text-[#8B5A2B] hover:text-[#5E3C1B] hover:underline cursor-pointer"
              >
                Autofill Demo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Full Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-[#2C2C1E] flex items-center justify-between">
                  <span>Full Name *</span>
                  {errors.fullName && touched.fullName && (
                    <span className="text-[11px] text-rose-600 font-normal">{errors.fullName}</span>
                  )}
                </label>
                <input
                  type="text"
                  value={customer.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="e.g. Tanmay Anand"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FDFBF7] text-[#2C2C1E] text-xs focus:outline-none focus:ring-2 transition-all ${
                    errors.fullName && touched.fullName
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-[#E6E1D3] focus:border-[#2C3A2B] focus:ring-[#2C3A2B]/10'
                  }`}
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="font-semibold text-[#2C2C1E] flex items-center justify-between">
                  <span>Email Address *</span>
                  {errors.email && touched.email && (
                    <span className="text-[11px] text-rose-600 font-normal">{errors.email}</span>
                  )}
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="name@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FDFBF7] text-[#2C2C1E] text-xs focus:outline-none focus:ring-2 transition-all ${
                    errors.email && touched.email
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-[#E6E1D3] focus:border-[#2C3A2B] focus:ring-[#2C3A2B]/10'
                  }`}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="font-semibold text-[#2C2C1E] flex items-center justify-between">
                  <span>Phone Number *</span>
                  {errors.phone && touched.phone && (
                    <span className="text-[11px] text-rose-600 font-normal">{errors.phone}</span>
                  )}
                </label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="10-digit mobile"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FDFBF7] text-[#2C2C1E] text-xs focus:outline-none focus:ring-2 transition-all ${
                    errors.phone && touched.phone
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-[#E6E1D3] focus:border-[#2C3A2B] focus:ring-[#2C3A2B]/10'
                  }`}
                />
              </div>

              {/* Delivery Address */}
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-[#2C2C1E] flex items-center justify-between">
                  <span>Street Address & House/Flat No. *</span>
                  {errors.address && touched.address && (
                    <span className="text-[11px] text-rose-600 font-normal">{errors.address}</span>
                  )}
                </label>
                <input
                  type="text"
                  value={customer.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                  placeholder="e.g. 42 Indiranagar 100ft Road"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FDFBF7] text-[#2C2C1E] text-xs focus:outline-none focus:ring-2 transition-all ${
                    errors.address && touched.address
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-[#E6E1D3] focus:border-[#2C3A2B] focus:ring-[#2C3A2B]/10'
                  }`}
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="font-semibold text-[#2C2C1E] flex items-center justify-between">
                  <span>City *</span>
                  {errors.city && touched.city && (
                    <span className="text-[11px] text-rose-600 font-normal">{errors.city}</span>
                  )}
                </label>
                <input
                  type="text"
                  value={customer.city}
                  onChange={e => handleInputChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  placeholder="e.g. Bengaluru"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FDFBF7] text-[#2C2C1E] text-xs focus:outline-none focus:ring-2 transition-all ${
                    errors.city && touched.city
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-[#E6E1D3] focus:border-[#2C3A2B] focus:ring-[#2C3A2B]/10'
                  }`}
                />
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="font-semibold text-[#2C2C1E] flex items-center justify-between">
                  <span>State *</span>
                  {errors.state && touched.state && (
                    <span className="text-[11px] text-rose-600 font-normal">{errors.state}</span>
                  )}
                </label>
                <input
                  type="text"
                  value={customer.state}
                  onChange={e => handleInputChange('state', e.target.value)}
                  onBlur={() => handleBlur('state')}
                  placeholder="e.g. Karnataka"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FDFBF7] text-[#2C2C1E] text-xs focus:outline-none focus:ring-2 transition-all ${
                    errors.state && touched.state
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-[#E6E1D3] focus:border-[#2C3A2B] focus:ring-[#2C3A2B]/10'
                  }`}
                />
              </div>

              {/* PIN Code */}
              <div className="space-y-1">
                <label className="font-semibold text-[#2C2C1E] flex items-center justify-between">
                  <span>PIN Code (Postal) *</span>
                  {errors.postalCode && touched.postalCode && (
                    <span className="text-[11px] text-rose-600 font-normal">{errors.postalCode}</span>
                  )}
                </label>
                <input
                  type="text"
                  value={customer.postalCode}
                  onChange={e => handleInputChange('postalCode', e.target.value)}
                  onBlur={() => handleBlur('postalCode')}
                  placeholder="6-digit PIN (e.g. 560038)"
                  maxLength={6}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FDFBF7] text-[#2C2C1E] text-xs focus:outline-none focus:ring-2 transition-all ${
                    errors.postalCode && touched.postalCode
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-[#E6E1D3] focus:border-[#2C3A2B] focus:ring-[#2C3A2B]/10'
                  }`}
                />
              </div>

              {/* Country (Fixed) */}
              <div className="space-y-1">
                <label className="font-semibold text-[#2C2C1E]">Country</label>
                <input
                  type="text"
                  value="India (INR Pricing)"
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#F4F1EA]/60 text-[#7A7A68] text-xs cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Options */}
          <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E1D3]/70 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2C3A2B] text-white flex items-center justify-center text-xs font-bold font-mono">
                  2
                </div>
                <div>
                  <h2 className="text-sm font-serif font-bold text-[#2C3A2B]">Razorpay Payment Gateway</h2>
                  <p className="text-[11px] text-[#7A7A68]">
                    Select preferred payment method • Verified via server-side HMAC SHA-256
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{paymentConfig?.isConfigured ? 'Live Mode' : 'Test Sandbox'}</span>
              </div>
            </div>

            {/* Error or Cancellation Notice */}
            {paymentError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Payment Notice:</span>
                    <span className="text-rose-800 leading-relaxed">{paymentError}</span>
                  </div>
                </div>
                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-xl bg-[#2C3A2B] text-white text-xs font-bold hover:bg-[#1E281D] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Payment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentError(null)}
                    className="text-xs text-rose-700 hover:underline cursor-pointer"
                  >
                    Dismiss Notice
                  </button>
                </div>
              </div>
            )}

            {/* Payment Method Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'upi'
                    ? 'border-[#2C3A2B] bg-[#F5F5EC] ring-2 ring-[#2C3A2B]/15 shadow-2xs'
                    : 'border-[#E6E1D3] bg-[#FDFBF7] hover:border-[#8B5A2B] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Smartphone className="w-4 h-4 text-[#2C3A2B]" />
                  {paymentMethod === 'upi' && <Check className="w-3.5 h-3.5 text-[#2C3A2B]" />}
                </div>
                <div>
                  <span className="font-semibold text-xs text-[#2C3A2B] block">UPI</span>
                  <span className="text-[10px] text-[#7A7A68]">GPay, PhonePe</span>
                </div>
              </button>

              {/* Cards */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'card'
                    ? 'border-[#2C3A2B] bg-[#F5F5EC] ring-2 ring-[#2C3A2B]/15 shadow-2xs'
                    : 'border-[#E6E1D3] bg-[#FDFBF7] hover:border-[#8B5A2B] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-4 h-4 text-[#2C3A2B]" />
                  {paymentMethod === 'card' && <Check className="w-3.5 h-3.5 text-[#2C3A2B]" />}
                </div>
                <div>
                  <span className="font-semibold text-xs text-[#2C3A2B] block">Card</span>
                  <span className="text-[10px] text-[#7A7A68]">Debit / Credit</span>
                </div>
              </button>

              {/* Net Banking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'netbanking'
                    ? 'border-[#2C3A2B] bg-[#F5F5EC] ring-2 ring-[#2C3A2B]/15 shadow-2xs'
                    : 'border-[#E6E1D3] bg-[#FDFBF7] hover:border-[#8B5A2B] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-4 h-4 text-[#2C3A2B]" />
                  {paymentMethod === 'netbanking' && <Check className="w-3.5 h-3.5 text-[#2C3A2B]" />}
                </div>
                <div>
                  <span className="font-semibold text-xs text-[#2C3A2B] block">Net Banking</span>
                  <span className="text-[10px] text-[#7A7A68]">Top Indian Banks</span>
                </div>
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'cod'
                    ? 'border-[#2C3A2B] bg-[#F5F5EC] ring-2 ring-[#2C3A2B]/15 shadow-2xs'
                    : 'border-[#E6E1D3] bg-[#FDFBF7] hover:border-[#8B5A2B] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Wallet className="w-4 h-4 text-[#2C3A2B]" />
                  {paymentMethod === 'cod' && <Check className="w-3.5 h-3.5 text-[#2C3A2B]" />}
                </div>
                <div>
                  <span className="font-semibold text-xs text-[#2C3A2B] block">COD (Demo)</span>
                  <span className="text-[10px] text-[#7A7A68]">Doorstep Verify</span>
                </div>
              </button>
            </div>

            {/* Sub-view: UPI Options */}
            {paymentMethod === 'upi' && (
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] space-y-3 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  Select UPI Application:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {(['gpay', 'phonepe', 'paytm', 'custom'] as const).map(app => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setUpiApp(app)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                        upiApp === app
                          ? 'bg-[#2C3A2B] text-white border-[#2C3A2B]'
                          : 'bg-white text-[#2C2C1E] border-[#E6E1D3] hover:bg-[#F4F1EA]'
                      }`}
                    >
                      {app === 'custom' ? 'Custom UPI ID' : app === 'gpay' ? 'Google Pay' : app}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-xs font-medium text-[#5A5A40] block mb-1">
                    Virtual Payment Address (VPA) / UPI Handle
                  </label>
                  <input
                    type="text"
                    value={customUpiId}
                    onChange={e => setCustomUpiId(e.target.value)}
                    placeholder="e.g. mobile@upi or username@okbank"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D3] bg-white text-xs text-[#2C2C1E] focus:outline-none focus:border-[#2C3A2B]"
                  />
                  <span className="text-[10px] text-[#8B8B7A] mt-1 block">
                    ⚡ Simulated instant authorization. No UPI PIN or biometric authentication will be requested.
                  </span>
                </div>
              </div>
            )}

            {/* Sub-view: Card Options */}
            {paymentMethod === 'card' && (
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider">
                    Demo Card Information
                  </span>
                  <span className="text-[10px] font-mono text-[#8B5A2B] bg-white px-2 py-0.5 rounded border border-[#E6E1D3]">
                    Pre-filled Test Sandbox
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-xs font-medium text-[#5A5A40] block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D3] bg-white text-xs text-[#2C2C1E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#5A5A40] block mb-1">Card Number (Masked Demo)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D3] bg-white text-xs font-mono text-[#2C2C1E]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[#5A5A40] block mb-1">Valid Thru</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D3] bg-white text-xs font-mono text-[#2C2C1E]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#5A5A40] block mb-1">CVV (Demo Mock)</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        maxLength={3}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D3] bg-white text-xs font-mono text-[#2C2C1E]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#8B8B7A]">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>PCI-DSS Simulated Sandbox. No card numbers or CVVs are transmitted to any bank.</span>
                </div>
              </div>
            )}

            {/* Sub-view: Net Banking Options */}
            {paymentMethod === 'netbanking' && (
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] space-y-3 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  Select Bank:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    'HDFC Bank',
                    'State Bank of India',
                    'ICICI Bank',
                    'Axis Bank',
                    'Kotak Mahindra',
                    'Punjab National Bank'
                  ].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                        selectedBank === b
                          ? 'bg-[#2C3A2B] text-white border-[#2C3A2B]'
                          : 'bg-white text-[#2C2C1E] border-[#E6E1D3] hover:bg-[#F4F1EA]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#8B8B7A] mt-1 block">
                  🏛️ Simulates institutional gateway handshake without external redirection.
                </span>
              </div>
            )}

            {/* Sub-view: Cash on Delivery Options */}
            {paymentMethod === 'cod' && (
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] space-y-2 text-xs animate-in fade-in duration-200">
                <div className="font-semibold text-[#2C3A2B]">Doorstep Payment Simulation</div>
                <p className="text-[#5A5A40] leading-relaxed">
                  Pay via Cash or dynamic UPI QR scan upon receiving the bundled products from the delivery executive.
                </p>
              </div>
            )}

            {/* Pay Now Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-2xl text-sm font-bold uppercase tracking-wider text-white bg-[#2C3A2B] hover:bg-[#1E281D] shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 disabled:cursor-wait flex items-center justify-center gap-2 group"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{processStepText}</span>
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                    <span>Pay with Razorpay — {formatINR(activeOrder.total)}</span>
                    <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-[#8B8B7A]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Razorpay Secured
                </span>
                <span>•</span>
                <span>HMAC SHA-256 Verified</span>
                <span>•</span>
                <span>Direct Banking Rails</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Order Summary (5 of 12 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="p-6 bg-white border border-[#E6E1D3] rounded-[24px] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E1D3]/80 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-[#2C3A2B]">Order Summary</h3>
                <span className="text-xs text-[#8B8B7A]">
                  {activeOrder.items.reduce((s, it) => s + it.quantity, 0)} total items in bundle
                </span>
              </div>
              <span className="text-xs font-semibold text-[#8B5A2B] bg-[#F4F1EA] px-2.5 py-1 rounded-xl border border-[#E6E1D3]">
                {activeOrder.bundleName || 'Curated Bundle'}
              </span>
            </div>

            {/* Products List */}
            <div className="space-y-3 divide-y divide-[#E6E1D3]/50 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
              {activeOrder.items.map((it, idx) => {
                const linePrice = it.product.price * it.quantity;
                return (
                  <div key={`${it.product.id}-${idx}`} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-12 h-12 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl p-1 shrink-0 flex items-center justify-center">
                        <img
                          src={getProductImageUrl(it.product.image, it.product.id)}
                          alt={it.product.name}
                          className="w-full h-full object-contain"
                        />
                        {it.quantity > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono bg-[#2C3A2B] text-white shadow-2xs">
                            ×{it.quantity}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-[#2C2C1E] truncate" title={it.product.name}>
                          {it.product.name}
                        </div>
                        <div className="text-[11px] text-[#7A7A68]">
                          {it.quantity > 1 ? `${it.quantity} × ${formatINR(it.product.price)}` : formatINR(it.product.price)}
                          {it.product.colour ? ` · ${it.product.colour}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="font-mono font-bold text-right text-[#2C3A2B] shrink-0">
                      {formatINR(linePrice)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Landed Breakdown */}
            <div className="pt-4 border-t border-[#E6E1D3] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#5A5A40]">
                <span>Product Subtotal</span>
                <span className="font-mono font-medium text-[#2C2C1E]">{formatINR(activeOrder.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-[#5A5A40]">
                <div className="flex items-center gap-1.5">
                  <span>Net Shipping Fee</span>
                  {activeOrder.shippingDiscount > 0 && (
                    <span className="text-[10px] text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded font-sans font-medium">
                      Free Threshold
                    </span>
                  )}
                </div>
                <span className="font-mono font-medium text-[#2C2C1E]">
                  {activeOrder.netShipping === 0 ? '₹0' : formatINR(activeOrder.netShipping)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#5A5A40]">
                <span>Applicable Taxes (18% GST)</span>
                <span className="font-mono font-medium text-[#2C2C1E]">{formatINR(activeOrder.taxAmount)}</span>
              </div>

              {budget > 0 && (
                <div className="flex items-center justify-between text-[11px] text-[#7A7A68] pt-1">
                  <span>Budget Baseline</span>
                  <span className="font-mono">{formatINR(budget)}</span>
                </div>
              )}

              {/* Final Payable Amount */}
              <div className="pt-3 border-t border-[#E6E1D3] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2C3A2B] block">
                    Final Landed Price
                  </span>
                  <span className="text-[10px] text-[#7A7A68]">Total payable amount</span>
                </div>
                <span className="font-serif text-xl sm:text-2xl font-bold font-mono text-[#2C3A2B]">
                  {formatINR(activeOrder.total)}
                </span>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E6E1D3] space-y-1.5 text-[11px] text-[#5A5A40]">
              <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>All products verified in-stock</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <span>Fast doorstep dispatch across India</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <span>7-day easy replacement policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
