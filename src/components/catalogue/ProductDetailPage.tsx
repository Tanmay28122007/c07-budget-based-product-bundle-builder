import React, { useState } from 'react';
import {
  ArrowLeft,
  Package,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  Info,
  ShoppingCart,
  Columns,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Edit3,
  TrendingUp,
  BarChart2,
  Clock,
  Layers,
  CreditCard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatINR } from '../../utils/pricing';
import { getProductImageUrl, getProductImageFallback } from '../../utils/imageUtils';
import { classifyStockStatus } from '../../utils/inventoryRules';
import { getProductClickStats } from '../../utils/analytics';
import { formatKolkataDate, formatKolkataTime } from '../../utils/userActivity';

function getColourHex(colour?: string): string {
  if (!colour) return '#9CA3AF';
  const c = colour.toLowerCase();
  if (c.includes('blue')) return '#2563EB';
  if (c.includes('red')) return '#DC2626';
  if (c.includes('black')) return '#1E293B';
  if (c.includes('grey') || c.includes('gray')) return '#64748B';
  if (c.includes('green')) return '#16A34A';
  if (c.includes('brown')) return '#8B5A2B';
  if (c.includes('silver')) return '#94A3B8';
  if (c.includes('khaki') || c.includes('tan')) return '#C3B091';
  if (c.includes('white')) return '#FFFFFF';
  return '#9CA3AF';
}

export const ProductDetailPage: React.FC = () => {
  const {
    fixture,
    selectedProductId,
    openProductDetails,
    closeProductDetails,
    currentItems,
    selectProduct,
    addItemToCart,
    removeProduct,
    toggleCart,
    setActiveTab,
    initiateCheckout,
    userRole,
    lowStockThreshold,
    updateProductStock
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [editStockInput, setEditStockInput] = useState('');
  const [editStockError, setEditStockError] = useState<string | null>(null);
  const [editStockSuccess, setEditStockSuccess] = useState<string | null>(null);

  // Find product from fixture or fallback to first product
  const product: Product | undefined = fixture.products.find(p => p.id === selectedProductId) || fixture.products[0];

  if (!product) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-[#E6E1D3]">
        <Package className="w-16 h-16 text-[#8B8B7A] mb-4" />
        <h2 className="font-serif text-2xl font-bold text-[#2C3A2B] mb-2">Product Not Found</h2>
        <p className="text-sm text-[#5A5A40] mb-6">The product you are looking for does not exist in the active catalogue.</p>
        <button
          onClick={closeProductDetails}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2C3A2B] text-white font-semibold text-sm hover:bg-[#1E281D] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Catalogue</span>
        </button>
      </div>
    );
  }

  // Check if item is already in active bundle
  const bundleSlotEntry = Object.entries(currentItems).find(([_, item]) => item?.id === product.id);
  const isInBundle = !!bundleSlotEntry;
  const bundleSlotKey = bundleSlotEntry?.[0];

  // All products belonging to the SAME product category/type (e.g. Notebooks)
  const categoryProducts = fixture.products.filter(
    p => p.category.toLowerCase() === product.category.toLowerCase()
  );

  // Other products from the SAME product category/type only (excluding the currently viewed item)
  const sameCategoryProducts = categoryProducts.filter(p => p.id !== product.id);

  const isAdmin = userRole === 'admin';
  const stockStatus = classifyStockStatus(product.stockQuantity, lowStockThreshold);
  const clickStats = getProductClickStats(product.id, fixture.products);

  const imgSrc = getProductImageUrl(product.image, product.id);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}#product-${product.id}`;
      navigator.clipboard?.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* 1. Top Navigation & Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E1D3]">
        <div className="flex items-center gap-3">
          <button
            onClick={closeProductDetails}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Catalogue</span>
          </button>

          {/* Breadcrumb Path */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs text-[#8B8B7A]">
            <button
              onClick={closeProductDetails}
              className="hover:text-[#2C3A2B] transition-colors cursor-pointer"
            >
              Catalogue
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#C4C4B5]" />
            <span className="font-medium text-[#5A5A40]">{product.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C4C4B5]" />
            <span className="font-semibold text-[#2C3A2B] truncate max-w-xs">{product.name}</span>
          </nav>
        </div>

        {/* Right Action Utilities */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5A5A40] hover:text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Copy share link for this product"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={toggleCart}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#2C3A2B] bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Open bundle cart"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>Cart</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Section: Studio Photo on Left, Details & Actions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* LEFT COLUMN: Gallery & Hero Photograph */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square bg-[#FDFBF7] rounded-[32px] border border-[#E6E1D3] p-8 sm:p-12 flex items-center justify-center overflow-hidden shadow-xs group">
            {/* Ambient Backlight */}
            <div className="absolute inset-0 bg-radial from-[#F5F5EC]/60 to-transparent pointer-events-none" />

            {/* In-Stock Floating Badge */}
            <div className="absolute top-5 left-5 z-10">
              {product.inStock ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A1E] bg-[#E8EEDD]/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#D0DEC0] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#3B7A3B]" />
                  <span>In Stock ({product.stockQuantity} units)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#991B1B] bg-[#FEE2E2]/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#FECACA] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            {/* Product ID Tag Overlay */}
            <div className="absolute top-5 right-5 z-10">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#8B5A2B] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E6E1D3] shadow-2xs">
                {product.id}
              </span>
            </div>

            {/* Main Product Image */}
            {imgError ? (
              <Package className="w-32 h-32 text-[#8B8B7A]" />
            ) : (
              <img
                src={imgSrc}
                alt={product.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = getProductImageFallback(target.src);
                  if (fallback !== target.src) {
                    target.src = fallback;
                  } else {
                    setImgError(true);
                  }
                }}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                loading="eager"
                decoding="async"
              />
            )}

            {/* Asset Quality Tag */}
            <div className="absolute bottom-4 left-4 z-10">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[#5A5A40] border border-[#E6E1D3] flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#8B5A2B]" />
                <span>C07 Benchmark Asset · {product.id}</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Information & Slot Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5A2B] bg-[#F4F1EA] px-2.5 py-1 rounded-md border border-[#E6E1D3]">
                {product.category.toUpperCase()} SLOT
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5A5A40] bg-white px-2.5 py-1 rounded-md border border-[#E6E1D3]">
                ID: {product.id}
              </span>
              {isInBundle && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  In Bundle ({bundleSlotKey})
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3A2B] tracking-tight">
              {product.name}
            </h1>

            <div className="text-xs text-[#5A5A40] flex items-center gap-3">
              <span>Brand: <strong className="text-[#2C3A2B]">{product.brand}</strong></span>
              <span className="text-[#D0DEC0]">|</span>
              <span>Model: <strong className="text-[#2C3A2B]">{product.model}</strong></span>
              <span className="text-[#D0DEC0]">|</span>
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <span>★★★★★</span>
                <span className="text-[#5A5A40]">(Enterprise Verified)</span>
              </span>
            </div>
          </div>

          {/* Pricing & Economics Card */}
          <div className="bg-white rounded-3xl border border-[#E6E1D3] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block font-semibold">
                  Catalogue Retail Price
                </span>
                <div className="font-mono text-3xl sm:text-4xl font-bold text-[#2C3A2B] tracking-tight tabular-nums mt-0.5">
                  {formatINR(product.price)}
                </div>
              </div>

              {product.attributes.unitCostInr && (
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block font-semibold">
                    Product Cost (Wholesale)
                  </span>
                  <div className="font-mono text-lg font-bold text-[#5A5A40] tabular-nums mt-0.5">
                    {formatINR(product.attributes.unitCostInr)}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                    Margin: {formatINR(product.price - product.attributes.unitCostInr)} ({Math.round(((product.price - product.attributes.unitCostInr) / product.price) * 100)}%)
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E6E1D3]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#5A5A40]">Stock Status:</span>
                {stockStatus === 'IN_STOCK' ? (
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px] inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>In Stock ({product.stockQuantity} units)</span>
                  </span>
                ) : stockStatus === 'LOW_STOCK' ? (
                  <span className="font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-[11px] inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span>Low Stock ({product.stockQuantity} units ≤ {lowStockThreshold})</span>
                  </span>
                ) : (
                  <span className="font-semibold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 text-[11px] inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    <span>Out of Stock</span>
                  </span>
                )}
              </div>
              <span className="text-[#8B8B7A] text-[11px]">
                Threshold: <strong>{lowStockThreshold} units</strong>
              </span>
            </div>
          </div>

          {/* Inventory Analytics & Live Engagement Card */}
          <div className="bg-white rounded-3xl border border-[#E6E1D3] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E1D3]/70 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#8B5A2B]" />
                <span className="text-xs font-bold text-[#2C3A2B] uppercase tracking-wider">
                  Inventory & Engagement Profile
                </span>
              </div>
              {product.lastUpdated && (
                <div className="flex items-center gap-1 text-[11px] text-[#5A5A40] font-mono">
                  <Clock className="w-3 h-3 text-[#8B8B7A]" />
                  <span>Updated: {formatKolkataDate(product.lastUpdated)} {formatKolkataTime(product.lastUpdated)}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block">
                  Available Units
                </span>
                <span className="font-mono text-xl font-bold text-[#2C3A2B] mt-0.5 block">
                  {product.stockQuantity}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block">
                  Low Stock Threshold
                </span>
                <span className="font-mono text-xl font-bold text-[#8B5A2B] mt-0.5 block">
                  {lowStockThreshold}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block">
                  Total Clicks
                </span>
                <span className="font-mono text-xl font-bold text-blue-700 mt-0.5 block flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{clickStats.totalClicks}</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block">
                  Popularity Rank
                </span>
                <span className="font-mono text-xl font-bold text-[#2C3A2B] mt-0.5 block">
                  {clickStats.rank ? `#${clickStats.rank}` : 'Unranked'}
                </span>
              </div>
            </div>

            {/* Admin Stock Management Drawer */}
            {isAdmin && (
              <div className="pt-3 border-t border-[#E6E1D3] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2C3A2B]">
                    <Edit3 className="w-3.5 h-3.5 text-[#8B5A2B]" />
                    <span>Administrator Stock Adjustment</span>
                  </div>
                  {!isEditingStock && (
                    <button
                      onClick={() => {
                        setEditStockInput(String(product.stockQuantity));
                        setIsEditingStock(true);
                        setEditStockError(null);
                        setEditStockSuccess(null);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2C3A2B] text-white hover:bg-[#1E281D] transition-colors cursor-pointer"
                    >
                      Update Inventory
                    </button>
                  )}
                </div>

                {isEditingStock && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const res = updateProductStock(product.id, editStockInput);
                      if (!res.success) {
                        setEditStockError(res.error || 'Failed to update stock quantity.');
                        setEditStockSuccess(null);
                      } else {
                        setEditStockSuccess(`Inventory successfully updated to ${editStockInput} units.`);
                        setEditStockError(null);
                        setTimeout(() => setIsEditingStock(false), 1200);
                      }
                    }}
                    className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="flex-1 w-full space-y-1">
                        <label className="text-[11px] font-semibold text-[#5A5A40]">
                          New Physical Stock Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          value={editStockInput}
                          onChange={(e) => {
                            setEditStockInput(e.target.value);
                            setEditStockError(null);
                            setEditStockSuccess(null);
                          }}
                          placeholder="e.g. 10"
                          className="w-full bg-white border border-[#E6E1D3] rounded-xl px-3 py-1.5 text-xs font-mono text-[#2C3A2B] focus:outline-none focus:border-[#2C3A2B]"
                        />
                      </div>
                      <div className="flex items-center gap-2 self-end w-full sm:w-auto pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => setIsEditingStock(false)}
                          className="px-3 py-1.5 rounded-xl border border-[#E6E1D3] bg-white text-[#5A5A40] hover:bg-[#F4F1EA] text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-xl bg-[#2C3A2B] hover:bg-[#1E281D] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    {editStockError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{editStockError}</span>
                      </div>
                    )}

                    {editStockSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span>{editStockSuccess}</span>
                      </div>
                    )}
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="p-4 bg-white rounded-2xl border border-[#E6E1D3]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block font-semibold mb-1">
                Description
              </span>
              <p className="text-xs text-[#4A4A35] leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Compatibility Note if any */}
          {product.notes && (
            <div className="p-3.5 rounded-2xl bg-[#FEF9C3] border border-[#F4E1A1] text-xs text-[#713F12] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#854D0E] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Compatibility Note: </span>
                <span>{product.notes}</span>
              </div>
            </div>
          )}

          {/* Quick Specifications Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {product.attributes.colour && (
              <div className="p-3 bg-white rounded-2xl border border-[#E6E1D3]">
                <span className="text-[9px] uppercase font-mono text-[#8B8B7A] block font-semibold">Colour</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs"
                    style={{ backgroundColor: getColourHex(product.attributes.colour) }}
                  />
                  <span className="text-xs font-bold text-[#2C3A2B]">{product.attributes.colour}</span>
                </div>
              </div>
            )}

            {product.attributes.size && (
              <div className="p-3 bg-white rounded-2xl border border-[#E6E1D3]">
                <span className="text-[9px] uppercase font-mono text-[#8B8B7A] block font-semibold">Size</span>
                <span className="text-xs font-bold text-[#2C3A2B] block mt-1">{product.attributes.size}</span>
              </div>
            )}

            {product.attributes.connector && (
              <div className="p-3 bg-white rounded-2xl border border-[#E6E1D3]">
                <span className="text-[9px] uppercase font-mono text-[#8B8B7A] block font-semibold">Port Connection</span>
                <span className="text-xs font-bold text-[#2C3A2B] block mt-1">{product.attributes.connector.toUpperCase()}</span>
              </div>
            )}

            {product.weightKg > 0 && (
              <div className="p-3 bg-white rounded-2xl border border-[#E6E1D3]">
                <span className="text-[9px] uppercase font-mono text-[#8B8B7A] block font-semibold">Unit Weight</span>
                <span className="text-xs font-bold text-[#2C3A2B] block mt-1">{product.weightKg} kg</span>
              </div>
            )}

            {product.attributes.deskWidthCm && (
              <div className="p-3 bg-white rounded-2xl border border-[#E6E1D3]">
                <span className="text-[9px] uppercase font-mono text-[#8B8B7A] block font-semibold">Desk Width</span>
                <span className="text-xs font-bold text-[#2C3A2B] block mt-1">{product.attributes.deskWidthCm} cm</span>
              </div>
            )}

            {product.attributes.ergonomicGrade && (
              <div className="p-3 bg-white rounded-2xl border border-[#E6E1D3]">
                <span className="text-[9px] uppercase font-mono text-[#8B8B7A] block font-semibold">Ergonomics</span>
                <span className="text-xs font-bold text-[#2C3A2B] block mt-1">{product.attributes.ergonomicGrade}</span>
              </div>
            )}
          </div>

          {/* Available Category Variations & Types */}
          {categoryProducts.length > 1 && (
            <div className="bg-white rounded-2xl border border-[#E6E1D3] p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B5A2B] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  <span>Available {product.category} Variations & Types</span>
                </span>
                <span className="text-[10px] font-mono text-[#8B8B7A] bg-[#F4F1EA] px-2 py-0.5 rounded-full border border-[#E6E1D3]">
                  {categoryProducts.length} options
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categoryProducts.map(variant => {
                  const isCurrent = variant.id === product.id;
                  const varImg = getProductImageUrl(variant.image, variant.id);
                  const isVarInBundle = Object.values(currentItems).some(item => item?.id === variant.id);

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => openProductDetails(variant.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl text-left border transition-all cursor-pointer group/var ${
                        isCurrent
                          ? 'bg-[#E8EEDD] border-[#2C3A2B] ring-2 ring-[#2C3A2B]/20 shadow-xs'
                          : 'bg-[#FDFBF7] hover:bg-white border-[#E6E1D3] hover:border-[#8B5A2B]/60 hover:shadow-2xs'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-[#E6E1D3] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={varImg}
                          alt={variant.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover/var:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {variant.colour && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: getColourHex(variant.colour) }}
                            />
                          )}
                          <span className="text-xs font-bold text-[#2C3A2B] truncate block">
                            {variant.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono mt-0.5">
                          <span className="text-[#8B8B7A]">
                            {variant.id} · {variant.size || variant.attributes?.size || 'Standard'}
                          </span>
                          <span className="font-bold text-[#2C3A2B]">{formatINR(variant.price)}</span>
                        </div>
                      </div>
                      {isCurrent ? (
                        <Check className="w-4 h-4 text-[#2C3A2B] shrink-0" />
                      ) : isVarInBundle ? (
                        <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                          Bundle
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bundle Slot Actions */}
          <div className="space-y-3 pt-2">
            {isInBundle ? (
              <div className="p-4 rounded-2xl bg-[#E8EEDD] border border-[#D0DEC0] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#1E3A1E]">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>This product is selected in your active bundle</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase bg-white/80 px-2 py-0.5 rounded border border-[#D0DEC0]">
                    Slot: {bundleSlotKey}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bundleSlotKey && removeProduct(bundleSlotKey)}
                    className="flex-1 py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs hover:shadow-xs active:scale-[0.99]"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Remove</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addItemToCart(product)}
                    className="flex-1 py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] shadow-2xs hover:shadow-xs active:scale-[0.99]"
                    title="Add another unit of this product to your bundle cart"
                  >
                    <Plus className="w-4 h-4 text-[#8B5A2B]" />
                    <span>Add Another</span>
                  </button>

                  <button
                    onClick={toggleCart}
                    className="flex-1 py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-[#2C3A2B] hover:bg-[#1E281D] text-white shadow-xs hover:shadow-md active:scale-[0.99]"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>View Cart</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <button
                  disabled={!product.inStock}
                  onClick={() => addItemToCart(product)}
                  className={`flex-1 py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    product.inStock
                      ? 'bg-[#2C3A2B] hover:bg-[#1E281D] text-white shadow-md hover:shadow-lg active:scale-[0.99]'
                      : 'bg-[#F4F1EA] text-[#8B8B7A] cursor-not-allowed border border-[#E6E1D3]'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{product.inStock ? `Add to Cart` : 'Out of Stock'}</span>
                </button>

                <button
                  disabled={!product.inStock}
                  onClick={() => {
                    initiateCheckout({
                      items: [{ product, quantity: 1 }],
                      bundleName: product.name
                    });
                  }}
                  className={`flex-1 py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    product.inStock
                      ? 'bg-[#8B5A2B] hover:bg-[#724822] text-white shadow-md hover:shadow-lg active:scale-[0.99]'
                      : 'bg-[#F4F1EA] text-[#8B8B7A] cursor-not-allowed border border-[#E6E1D3]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-200" />
                  <span>Buy Now</span>
                </button>

                <button
                  onClick={() => setActiveTab('compare')}
                  className="py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] shadow-xs"
                >
                  <Columns className="w-4 h-4 text-[#8B5A2B]" />
                  <span>Compare</span>
                </button>
              </div>
            )}
          </div>

          {/* Guarantees & Features */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E6E1D3]/80 text-[11px] text-[#5A5A40]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8B5A2B] shrink-0" />
              <span>Optimized Bundle Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8B5A2B] shrink-0" />
              <span>C07 Certified Compatibility</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#8B5A2B] shrink-0" />
              <span>Free Bundle Rebalancing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exclusively Show Products of the Same Selected Category / Type */}
      <div className="space-y-5 pt-8 border-t border-[#E6E1D3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5A2B] bg-[#F4F1EA] px-2.5 py-0.5 rounded-full border border-[#E6E1D3]">
                Category: {product.category}
              </span>
              <span className="text-xs font-mono text-[#8B8B7A]">
                {sameCategoryProducts.length} other option{sameCategoryProducts.length === 1 ? '' : 's'}
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#2C3A2B] mt-1.5">
              Other {product.category}s in Catalogue
            </h3>
            <p className="text-xs text-[#5A5A40]">
              Showing exclusively other {product.category.toLowerCase()} varieties and editions available for your bundle.
            </p>
          </div>

          <button
            onClick={closeProductDetails}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F4F1EA] border border-[#E6E1D3] text-xs font-semibold text-[#8B5A2B] hover:text-[#5C3A1B] transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <span>Back to All Categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sameCategoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sameCategoryProducts.map(rp => {
              const rpImg = getProductImageUrl(rp.image, rp.id);
              const isRpInBundle = Object.values(currentItems).some(item => item?.id === rp.id);
              return (
                <div
                  key={rp.id}
                  onClick={() => openProductDetails(rp.id)}
                  className="bg-white rounded-2xl border border-[#E6E1D3] p-4 hover:border-[#2C3A2B] hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-3">
                    <div className="aspect-square bg-[#FDFBF7] rounded-xl p-3 flex items-center justify-center border border-[#E6E1D3]/60 relative overflow-hidden">
                      <img
                        src={rpImg}
                        alt={rp.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/90 text-[#5A5A40] border border-[#E6E1D3]">
                        {rp.id}
                      </span>
                      {rp.attributes?.colour && (
                        <span
                          className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: getColourHex(rp.attributes.colour) }}
                          title={rp.attributes.colour}
                        />
                      )}
                      {isRpInBundle && (
                        <span className="absolute top-2 right-2 text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          In Bundle
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#8B5A2B] font-bold block">
                        {rp.category} {rp.attributes?.size ? `· ${rp.attributes.size}` : ''}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#2C3A2B] group-hover:text-[#8B5A2B] transition-colors truncate mt-0.5">
                        {rp.name}
                      </h4>
                      <p className="text-[11px] text-[#7A7A6A] line-clamp-1 mt-1">
                        {rp.description || `${rp.colour} ${rp.category}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E6E1D3]/60">
                    <div>
                      <span className="font-mono font-bold text-sm text-[#2C3A2B] block">
                        {formatINR(rp.price)}
                      </span>
                      {rp.inStock ? (
                        <span className="text-[10px] text-emerald-700 font-semibold">In Stock</span>
                      ) : (
                        <span className="text-[10px] text-rose-600 font-semibold">Out of Stock</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rp.inStock && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItemToCart(rp);
                          }}
                          className="text-[11px] font-bold text-white bg-[#2C3A2B] hover:bg-[#1E281D] px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95"
                          title={`Add ${rp.name} to bundle cart`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      )}
                      <span className="text-xs font-bold text-[#8B5A2B] group-hover:text-[#2C3A2B] flex items-center gap-0.5 bg-[#F4F1EA] group-hover:bg-[#E8EEDD] px-2.5 py-1 rounded-lg border border-[#E6E1D3] transition-colors">
                        <span>View</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E6E1D3] space-y-2">
            <p className="font-serif font-bold text-base text-[#2C3A2B]">
              Only 1 {product.category} currently available
            </p>
            <p className="text-xs text-[#5A5A40]">
              You are currently viewing the only {product.category.toLowerCase()} option in the catalogue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
