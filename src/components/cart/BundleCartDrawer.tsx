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
  Columns
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import { exportBundleToCSV, downloadFile } from '../../utils/exportUtils';
import { getProductImageUrl } from '../../utils/imageUtils';

export const BundleCartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    fixture,
    budget,
    currentItems,
    validation,
    addItemToCart,
    removeProduct,
    resetBundle,
    setActiveTab,
    initiateCheckout
  } = useApp();

  const [quickAddCategory, setQuickAddCategory] = useState<string>('all');

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


  const availableQuickAddProducts = fixture.products.filter(p => {
    if (!p.inStock) return false;
    if (quickAddCategory !== 'all' && p.category.toLowerCase() !== quickAddCategory.toLowerCase()) {
      return false;
    }
    return true;
  });

  const uniqueCategories = ['all', ...Array.from(new Set(fixture.products.map(p => p.category)))];

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
              <div className="p-4 sm:p-5 border-b border-[#E6E1D3] bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2C3A2B] text-amber-200 flex items-center justify-center shadow-xs">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-xl font-bold text-[#2C3A2B]">
                        Your Bundle Cart
                      </h2>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#2C3A2B] text-white">
                        {filledItems.length}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A5A40] mt-0.5">
                      {filledItems.length} {filledItems.length === 1 ? 'item' : 'items'} in bundle cart · {fixture.activity.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] rounded-xl transition-colors cursor-pointer"
                  title="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Budget Utilization Strip */}
              <div className="px-5 py-3.5 bg-[#F4F1EA] border-b border-[#E6E1D3] space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#5A5A40] font-semibold">Budget: {formatINR(budget)}</span>
                  <div className="flex items-center gap-1.5">
                    {validation.landedPrice.isOverBudget ? (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        Over by {formatINR(Math.abs(validation.landedPrice.remainingBudget))}
                      </span>
                    ) : validation.landedPrice.remainingBudget === 0 && filledItems.length > 0 ? (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Exact Fit
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        +{formatINR(validation.landedPrice.remainingBudget)} Headroom
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#E6E1D3] rounded-full overflow-hidden shadow-inner">
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
                      <span className="text-xs sm:text-[13px] font-bold text-[#8B5A2B] uppercase tracking-wider">
                        Items in Bundle ({filledItems.length})
                      </span>
                      <button
                        onClick={resetBundle}
                        className="text-xs text-[#5A5A40] hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
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
                            className={`p-3.5 rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:scale-[1.01] group/cartitem ${
                              hasConflict
                                ? 'border-rose-300 ring-1 ring-rose-200'
                                : 'border-[#E6E1D3] hover:border-[#2C3A2B]/60'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Product Image */}
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#F5F5EC] border border-[#E6E1D3] overflow-hidden flex items-center justify-center shrink-0">
                                <img
                                  src={getProductImageUrl(prod.image, prod.id)}
                                  alt={prod.name}
                                  onError={e => {
                                    (e.currentTarget as HTMLImageElement).src = '/assets/P01.png';
                                  }}
                                  className="w-full h-full object-contain p-1 mix-blend-multiply group-hover/cartitem:scale-110 transition-transform duration-300"
                                />
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-bold uppercase tracking-wider text-[#8B5A2B] bg-[#8B5A2B]/10 px-2 py-0.5 rounded-md">
                                    {slotLabel}
                                  </span>
                                  <span className="text-sm font-mono font-bold text-[#2C3A2B]">
                                    {formatINR(prod.price)}
                                  </span>
                                </div>

                                <h4 className="text-sm font-bold text-[#2C3A2B] line-clamp-1 mt-1">
                                  {prod.name}
                                </h4>

                                <div className="flex items-center gap-2 mt-1 text-xs text-[#5A5A40]">
                                  <span className="font-mono">{prod.id}</span>
                                  {(prod.colour || prod.attributes?.colour) && (
                                    <span className="flex items-center gap-1">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                                        style={{ backgroundColor: (prod.colour || prod.attributes?.colour || '').toLowerCase() }}
                                      />
                                      <span>{prod.colour || prod.attributes?.colour}</span>
                                    </span>
                                  )}
                                  {(prod.size || prod.attributes?.size) && (
                                    <span>· Size: {prod.size || prod.attributes?.size}</span>
                                  )}
                                </div>

                                {hasConflict && (
                                  <div className="mt-2 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-1">
                                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                    <span>Compatibility warning</span>
                                  </div>
                                )}
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeProduct(slotId)}
                                className="p-1.5 text-[#8B8B7A] hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-all cursor-pointer shrink-0 hover:scale-120 active:scale-90"
                                title="Remove from bundle cart"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>


                    {/* Quick Add More Items to Cart */}
                    <div className="mt-5 pt-4 border-t border-[#E6E1D3] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                          <span className="text-xs sm:text-[13px] font-bold text-[#8B5A2B] uppercase tracking-wider">
                            Quick Add More Items to Cart
                          </span>
                        </div>
                        <span className="text-xs text-[#8B8B7A] font-mono">
                          {availableQuickAddProducts.length} in stock
                        </span>
                      </div>

                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {uniqueCategories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setQuickAddCategory(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer ${
                              quickAddCategory === cat
                                ? 'bg-[#2C3A2B] text-white shadow-2xs'
                                : 'bg-white hover:bg-[#F4F1EA] text-[#5A5A40] border border-[#E6E1D3]'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Quick Add Grid */}
                      <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
                        {availableQuickAddProducts.map(prod => {
                          const prodImg = getProductImageUrl(prod.image, prod.id);
                          const isAlreadyInCart = Object.values(currentItems).some(item => item?.id === prod.id);

                          return (
                            <div
                              key={prod.id}
                              className="p-3 rounded-xl border border-[#E6E1D3] bg-white hover:border-[#2C3A2B]/40 hover:shadow-xs transition-all flex items-center justify-between gap-2.5 group/add"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-lg bg-[#F5F5EC] border border-[#E6E1D3] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                                  <img
                                    src={prodImg}
                                    alt={prod.name}
                                    className="w-full h-full object-contain mix-blend-multiply group-hover/add:scale-105 transition-transform"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-sm font-bold text-[#2C3A2B] truncate block">
                                    {prod.name}
                                  </h5>
                                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#8B8B7A] mt-0.5">
                                    <span className="text-[#8B5A2B] font-semibold">{prod.category}</span>
                                    <span>·</span>
                                    <span className="font-bold text-[#2C3A2B]">{formatINR(prod.price)}</span>
                                    {isAlreadyInCart && (
                                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                                        (In Cart)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => addItemToCart(prod)}
                                className="py-1.5 px-3.5 rounded-lg bg-[#2C3A2B] hover:bg-[#1E281D] text-white shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center gap-1 text-xs font-bold"
                                title={`Add ${prod.name} to cart`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Landed Pricing Footer */}
              {filledItems.length > 0 && (
                <div className="p-4 sm:p-5 bg-white border-t border-[#E6E1D3] space-y-3 shadow-md">
                  {/* Price Stack */}
                  <div className="space-y-1.5 text-sm text-[#5A5A40]">
                    <div className="flex items-center justify-between">
                      <span>Items Subtotal ({validation.filledSlotCount} items)</span>
                      <span className="font-mono font-medium text-[#2C3A2B]">
                        {formatINR(validation.landedPrice.productSubtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span>Net Shipping</span>
                        {validation.landedPrice.shippingDiscount > 0 && (
                          <span className="text-xs text-emerald-700 font-semibold">(Free Tier)</span>
                        )}
                      </div>
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

                    <div className="pt-2 border-t border-[#E6E1D3] flex items-center justify-between">
                      <div>
                        <span className="font-serif font-bold text-base text-[#2C3A2B] block">
                          Total Landed Cost
                        </span>
                        <span className="text-xs text-[#5A5A40]">
                          Final payable inclusive of taxes & logistics
                        </span>
                      </div>
                      <span className={`text-lg font-mono font-bold ${
                        validation.landedPrice.isOverBudget ? 'text-rose-600' : 'text-[#2C3A2B]'
                      }`}>
                        {formatINR(validation.landedPrice.landedPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Actions: BUY NOW Primary CTA */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        initiateCheckout();
                      }}
                      className="w-full py-3.5 px-4 rounded-xl text-sm font-bold uppercase tracking-wider text-white bg-[#2C3A2B] hover:bg-[#1E281D] shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <CreditCard className="w-4 h-4 text-amber-300" />
                      <span>BUY NOW — {formatINR(validation.landedPrice.landedPrice)}</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveTab('compare');
                          setIsCartOpen(false);
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold text-[#2C2C1E] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Columns className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span>Compare Builder</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('catalogue');
                          setIsCartOpen(false);
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold text-[#2C2C1E] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#5A5A40]" />
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
    </AnimatePresence>
  );
};
