import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  ShoppingBag,
  X,
  Trash2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  Layers,
  ShieldAlert,
  Plus,
  CreditCard,
  Columns,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import { exportBundleToCSV, downloadFile } from '../../utils/exportUtils';

function getProductImageUrl(img?: string, id?: string): string {
  if (!img) return id ? `/assets/${id}.png` : '';
  if (img.startsWith('../assets/')) {
    return img.replace('../assets/', '/assets/');
  }
  if (img.startsWith('./assets/')) {
    return img.replace('./assets/', '/assets/');
  }
  return img;
}

export const BundleCartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    fixture,
    budget,
    currentItems,
    validation,
    removeProduct,
    resetBundle,
    setActiveTab
  } = useApp();

  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  const handleExportCSV = () => {
    const csv = exportBundleToCSV(
      fixture.activity.name,
      fixture.activity.name,
      budget,
      currentItems,
      validation.landedPrice,
      validation.isValid
    );
    downloadFile(csv, `bundle_cart_${Date.now()}.csv`, 'text/csv');
  };

  const filledItems = Object.entries(currentItems)
    .filter(([_, prod]) => prod !== null)
    .map(([slotId, prod]) => {
      const slotDef = fixture.activity.requiredSlots.find(
        s => s.id === slotId || s.category.toLowerCase() === slotId.toLowerCase()
      );
      return {
        slotId,
        slotLabel: slotDef?.label || prod!.category || slotId,
        slotCategory: slotDef?.category || prod!.category || '',
        product: prod!
      };
    });

  const emptyRequiredSlots = fixture.activity.requiredSlots.filter(
    slot => !currentItems[slot.id] && !filledItems.some(f => f.slotCategory.toLowerCase() === slot.category.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-[#2C2C1E]/50 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-in Drawer from Right */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="w-screen max-w-md bg-[#FDFBF7] border-l border-[#E6E1D3] shadow-2xl flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#E6E1D3] bg-[#FDFBF7] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#2C3A2B] text-white flex items-center justify-center shadow-sm shrink-0">
                    <ShoppingCart className="w-5 h-5 text-[#E6C687]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C3A2B] tracking-tight">
                        Your Bundle Cart
                      </h2>
                      <span className="w-5 h-5 rounded-full bg-[#2C3A2B] text-white text-[11px] font-mono font-bold flex items-center justify-center">
                        {filledItems.length}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#5A5A40] mt-0.5">
                      {filledItems.length} {filledItems.length === 1 ? 'item' : 'items'} in bundle cart · {fixture.activity.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#EAE5D9] rounded-lg transition-colors cursor-pointer"
                  title="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Budget Utilization Strip */}
              <div className="px-5 py-3.5 bg-[#F7F4EC] border-b border-[#E6E1D3] space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-[#4A4A35] font-medium">Budget: {formatINR(budget)}</span>
                  <div>
                    {validation.landedPrice.isOverBudget ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                        Over by {formatINR(Math.abs(validation.landedPrice.remainingBudget))}
                      </span>
                    ) : validation.landedPrice.remainingBudget === 0 && filledItems.length > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Exact Fit
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F5E9] text-[#1B5E20] border border-[#A7F3D0]">
                        +{formatINR(validation.landedPrice.remainingBudget)} Headroom
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#E5E0D5] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      validation.landedPrice.isOverBudget
                        ? 'bg-rose-500'
                        : validation.landedPrice.budgetUtilisationPercent > 90
                        ? 'bg-amber-500'
                        : 'bg-[#2C3A2B]'
                    }`}
                    style={{
                      width: `${Math.min(validation.landedPrice.budgetUtilisationPercent, 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Scrollable Content: Items List or Empty State */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {filledItems.length === 0 ? (
                  <div className="py-12 px-4 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#F4F1EA] text-[#8B8B7A] flex items-center justify-center mx-auto border border-[#E6E1D3]">
                      <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#2C3A2B]">
                        Your bundle cart is empty
                      </h3>
                      <p className="text-xs text-[#5A5A40] mt-1 max-w-xs mx-auto leading-relaxed">
                        Whenever you add products from the catalogue or build a bundle, they will automatically reflect here.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('catalogue');
                        setIsCartOpen(false);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] shadow-xs transition-all cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Browse Product Catalogue</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold text-[#8B5A2B] uppercase tracking-wider">
                        ITEMS IN BUNDLE ({filledItems.length})
                      </span>
                      <button
                        onClick={resetBundle}
                        className="text-xs text-[#5A5A40] hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
                        title="Clear all products from bundle"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear All</span>
                      </button>
                    </div>

                    {/* Loop through all filled items in currentItems */}
                    <div className="space-y-3">
                      {filledItems.map(({ slotId, slotLabel, slotCategory, product: prod }) => {
                        const hasConflict = validation.compatibilityViolations.some(
                          v => v.sourceProductId === prod.id || v.targetProductId === prod.id
                        );

                        return (
                          <div
                            key={slotId}
                            className={`p-3.5 rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group/cartitem ${
                              hasConflict
                                ? 'border-rose-300 ring-1 ring-rose-200'
                                : 'border-[#E6E1D3]'
                            }`}
                          >
                            <div className="flex items-start gap-3.5">
                              {/* Product Image */}
                              <div className="w-16 h-16 rounded-xl bg-[#F5F5ED] border border-[#E8E4DA] p-1.5 flex items-center justify-center shrink-0">
                                <img
                                  src={getProductImageUrl(prod.image, prod.id)}
                                  alt={prod.name}
                                  onError={e => {
                                    (e.currentTarget as HTMLImageElement).src = '/assets/P01.png';
                                  }}
                                  className="w-full h-full object-contain mix-blend-multiply group-hover/cartitem:scale-105 transition-transform duration-300"
                                />
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#935828] bg-[#F6EFE9] px-2 py-0.5 rounded font-mono">
                                    {(slotCategory || slotLabel).toUpperCase()}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[#2C3A2B] font-mono">
                                      {formatINR(prod.price)}
                                    </span>
                                    <button
                                      onClick={() => removeProduct(slotId)}
                                      className="text-[#8B8B7A] hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                                      title="Remove item"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                <h4 className="font-serif text-sm font-bold text-[#2C3A2B] mt-1 line-clamp-1">
                                  {prod.name}
                                </h4>

                                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#5A5A40]">
                                  <span className="font-mono text-[11px] text-[#7A7A65]">{prod.id}</span>
                                  <span className="w-2 h-2 rounded-full bg-black inline-block ml-0.5"></span>
                                  <span>{prod.colour || prod.attributes?.colour || 'Black'}</span>
                                  <span>· Size: {prod.size || prod.attributes?.size || 'One'}</span>
                                </div>

                                {hasConflict && (
                                  <div className="mt-2 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[10px] text-rose-800 flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
                                    <span>Compatibility warning</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Add Divider */}
                    <div className="pt-3 pb-1 border-t border-[#E6E1D3] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B5A2B]">
                        <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                        <span>QUICK ADD MORE ITEMS TO CART</span>
                      </div>
                      <span className="text-xs text-[#8B8B7A] font-mono">
                        {fixture.products.length - filledItems.length} in stock
                      </span>
                    </div>

                    {/* Unfilled Required Slots notice if any */}
                    {emptyRequiredSlots.length > 0 && (
                      <div className="space-y-2">
                        {emptyRequiredSlots.map(slot => (
                          <div
                            key={slot.id}
                            className="p-3 rounded-xl border border-dashed border-[#D6CFBF] bg-[#FDFBF7]/70 flex items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-[#5A5A40] text-[11px]">{slot.label}</span>
                                <span className="text-[10px] text-[#8B8B7A] font-mono">({slot.category})</span>
                              </div>
                              <span className="text-[10px] text-[#8B8B7A] block mt-0.5">Slot is currently empty</span>
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab('catalogue');
                                setIsCartOpen(false);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#2C3A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Landed Pricing Footer */}
              {filledItems.length > 0 && (
                <div className="p-4 sm:p-5 bg-white border-t border-[#E6E1D3] space-y-4 shadow-md">
                  {/* Price Stack */}
                  <div className="space-y-2 text-xs sm:text-sm text-[#5A5A40]">
                    <div className="flex items-center justify-between">
                      <span>Items Subtotal ({validation.filledSlotCount} {validation.filledSlotCount === 1 ? 'item' : 'items'})</span>
                      <span className="font-mono font-medium text-[#2C3A2B]">
                        {formatINR(validation.landedPrice.productSubtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Net Shipping</span>
                      <span className="font-mono font-medium text-[#2C3A2B]">
                        {formatINR(validation.landedPrice.netShipping)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Taxes (18% GST)</span>
                      <span className="font-mono font-medium text-[#2C3A2B]">
                        {formatINR(validation.landedPrice.taxAmount)}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-[#E6E1D3] flex items-baseline justify-between">
                      <div>
                        <span className="font-serif font-bold text-base text-[#2C3A2B] block">
                          Total Landed Cost
                        </span>
                        <span className="text-[11px] text-[#5A5A40]">
                          Final payable inclusive of taxes & logistics
                        </span>
                      </div>
                      <span className="text-lg font-mono font-bold text-[#2C3A2B]">
                        {formatINR(validation.landedPrice.landedPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex flex-col gap-2.5">
                    <button
                      onClick={() => {
                        setOrderId(`C07-ORD-${Math.floor(100000 + Math.random() * 900000)}`);
                        setShowOrderSuccessModal(true);
                      }}
                      className="w-full py-3 px-4 rounded-xl text-sm font-bold tracking-wide text-white bg-[#263325] hover:bg-[#1B261A] shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <CreditCard className="w-4 h-4 text-[#E6C687]" />
                      <span>BUY NOW — {formatINR(validation.landedPrice.landedPrice)}</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => {
                          setActiveTab('compare');
                          setIsCartOpen(false);
                        }}
                        className="py-2.5 px-3 rounded-xl text-xs font-semibold text-[#2C2C1E] bg-[#F4F1EA] hover:bg-[#EAE5D9] border border-[#E6E1D3] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Columns className="w-4 h-4 text-[#5A5A40]" />
                        <span>Compare Builder</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('catalogue');
                          setIsCartOpen(false);
                        }}
                        className="py-2.5 px-3 rounded-xl text-xs font-semibold text-[#2C2C1E] bg-[#F4F1EA] hover:bg-[#EAE5D9] border border-[#E6E1D3] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Layers className="w-4 h-4 text-[#5A5A40]" />
                        <span>Add More</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Order Success Confirmation Modal */}
      {showOrderSuccessModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOrderSuccessModal(false)}
            className="fixed inset-0 bg-[#2C2C1E]/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white rounded-2xl border border-[#E6E1D3] shadow-2xl max-w-md w-full p-6 text-center z-10 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Payment Authorized
              </span>
              <h3 className="font-serif text-xl font-bold text-[#2C3A2B] mt-2">
                Bundle Order Placed!
              </h3>
              <p className="text-xs text-[#5A5A40] mt-1">
                Order reference <span className="font-mono font-semibold text-[#2C3A2B]">{orderId}</span> has been confirmed.
              </p>
            </div>

            <div className="bg-[#FDFBF7] rounded-xl border border-[#E6E1D3] p-3 text-left space-y-2 text-xs">
              <div className="flex justify-between text-[#5A5A40]">
                <span>Bundle Name</span>
                <span className="font-semibold text-[#2C3A2B]">{fixture.activity.name}</span>
              </div>
              <div className="flex justify-between text-[#5A5A40]">
                <span>Items Ordered</span>
                <span className="font-semibold text-[#2C3A2B]">{filledItems.length} products</span>
              </div>
              <div className="flex justify-between text-[#5A5A40]">
                <span>Total Amount Paid</span>
                <span className="font-mono font-bold text-emerald-700">{formatINR(validation.landedPrice.landedPrice)}</span>
              </div>
              <div className="flex justify-between text-[#5A5A40]">
                <span>Estimated Delivery</span>
                <span className="font-medium text-[#2C3A2B]">Within 2-3 Business Days</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleExportCSV}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#2C2C1E] bg-[#F4F1EA] hover:bg-[#EAE5D9] border border-[#E6E1D3] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#5A5A40]" />
                <span>Download Order Receipt (CSV)</span>
              </button>

              <button
                onClick={() => {
                  setShowOrderSuccessModal(false);
                  setIsCartOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
