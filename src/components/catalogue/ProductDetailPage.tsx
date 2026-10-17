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
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatINR } from '../../utils/pricing';

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

function getColourHex(colour?: string): string {
  if (!colour) return '#9CA3AF';
  const c = colour.toLowerCase();
  if (c.includes('blue')) return '#2563EB';
  if (c.includes('red')) return '#DC2626';
  if (c.includes('black')) return '#1E293B';
  if (c.includes('grey') || c.includes('gray')) return '#64748B';
  if (c.includes('green')) return '#16A34A';
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
    removeProduct,
    toggleCart,
    setActiveTab
  } = useApp();

  const [activeThumbnail, setActiveThumbnail] = useState<'primary' | 'angle' | 'spec'>('primary');
  const [copiedLink, setCopiedLink] = useState(false);
  const [imgError, setImgError] = useState(false);

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

  // Related products (from same category or other catalogue items)
  const relatedProducts = fixture.products
    .filter(p => p.id !== product.id)
    .sort((a, b) => (a.category === product.category ? -1 : 1))
    .slice(0, 4);

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
                onError={() => setImgError(true)}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
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

          {/* Interactive Thumbnails Selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveThumbnail('primary')}
              className={`flex-1 p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 bg-white ${
                activeThumbnail === 'primary'
                  ? 'border-[#2C3A2B] ring-2 ring-[#2C3A2B]/15 shadow-xs'
                  : 'border-[#E6E1D3] hover:border-[#8B8B7A]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#FDFBF7] p-1 flex items-center justify-center shrink-0">
                <img src={imgSrc} alt="Primary" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-[#2C3A2B] truncate">Primary Shot</div>
                <div className="text-[10px] text-[#8B8B7A]">Studio angle</div>
              </div>
            </button>

            <button
              onClick={() => setActiveThumbnail('angle')}
              className={`flex-1 p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 bg-white ${
                activeThumbnail === 'angle'
                  ? 'border-[#2C3A2B] ring-2 ring-[#2C3A2B]/15 shadow-xs'
                  : 'border-[#E6E1D3] hover:border-[#8B8B7A]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#F5F5EC] p-1 flex items-center justify-center shrink-0 text-[#8B8B7A]">
                <Package className="w-6 h-6 text-[#8B5A2B]" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-[#2C3A2B] truncate">Specs & Scale</div>
                <div className="text-[10px] text-[#8B8B7A]">Dimensions</div>
              </div>
            </button>

            <button
              onClick={() => setActiveThumbnail('spec')}
              className={`flex-1 p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 bg-white ${
                activeThumbnail === 'spec'
                  ? 'border-[#2C3A2B] ring-2 ring-[#2C3A2B]/15 shadow-xs'
                  : 'border-[#E6E1D3] hover:border-[#8B8B7A]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#E8EEDD] p-1 flex items-center justify-center shrink-0 text-[#2C3A2B]">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-[#2C3A2B] truncate">Verified</div>
                <div className="text-[10px] text-[#8B8B7A]">Quality tested</div>
              </div>
            </button>
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
                <span className="text-[#5A5A40]">Inventory:</span>
                {product.inStock ? (
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                    {product.stockQuantity} units available
                  </span>
                ) : (
                  <span className="font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[11px]">
                    Out of Stock
                  </span>
                )}
              </div>
              <span className="text-[#8B8B7A] text-[11px]">
                Shipping & Tax rules apply at checkout
              </span>
            </div>
          </div>

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

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => bundleSlotKey && removeProduct(bundleSlotKey)}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs hover:shadow-xs active:scale-[0.99]"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Remove from Bundle</span>
                  </button>

                  <button
                    onClick={toggleCart}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer bg-[#2C3A2B] hover:bg-[#1E281D] text-white shadow-xs hover:shadow-md active:scale-[0.99]"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>View in Cart</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <button
                  disabled={!product.inStock}
                  onClick={() => selectProduct(product.category, product)}
                  className={`flex-1 py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    product.inStock
                      ? 'bg-[#2C3A2B] hover:bg-[#1E281D] text-white shadow-md hover:shadow-lg active:scale-[0.99]'
                      : 'bg-[#F4F1EA] text-[#8B8B7A] cursor-not-allowed border border-[#E6E1D3]'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{product.inStock ? `Add to ${product.category} Slot` : 'Out of Stock'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('compare')}
                  className="py-3.5 px-5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer bg-white hover:bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] shadow-xs"
                >
                  <Columns className="w-4 h-4 text-[#8B5A2B]" />
                  <span>Compare Builder</span>
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

      {/* 3. Comprehensive Specifications & Compatibility Rules Card */}
      <div className="bg-white rounded-3xl border border-[#E6E1D3] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2C3A2B]">
            Full Technical Specifications & Verification
          </h2>
          <p className="text-xs text-[#5A5A40] mt-1">
            Engineered to fulfill all operational benchmarks and slot compatibility matrix requirements.
          </p>
        </div>

        {/* Compatibility Advisory if any */}
        {product.notes && (
          <div className="p-4 rounded-2xl bg-[#FEF9C3] border border-[#F4E1A1] text-xs text-[#713F12] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#854D0E] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Compatibility Note:</span>
              <p className="mt-0.5 leading-relaxed">{product.notes}</p>
            </div>
          </div>
        )}

        {/* Incompatible Products Warning if any */}
        {product.incompatibleProductIds && product.incompatibleProductIds.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#FFF5F5] border border-[#FED7D7] text-xs text-[#9B2C2C] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#C53030] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Incompatibility Constraint:</span>
              <p className="mt-0.5 leading-relaxed">
                This item cannot be bundled simultaneously with product IDs: <strong className="font-mono">{product.incompatibleProductIds.join(', ')}</strong>. The bundle optimizer automatically enforces this rule.
              </p>
            </div>
          </div>
        )}

        {/* Detailed Table Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-2">
            <div className="flex justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3]">
              <span className="text-[#8B8B7A] font-sans font-medium">Product ID</span>
              <span className="font-bold text-[#2C3A2B]">{product.id}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3]">
              <span className="text-[#8B8B7A] font-sans font-medium">Category Slot</span>
              <span className="font-bold text-[#2C3A2B]">{product.category}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3]">
              <span className="text-[#8B8B7A] font-sans font-medium">Brand & Manufacturer</span>
              <span className="font-bold text-[#2C3A2B]">{product.brand}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3]">
              <span className="text-[#8B8B7A] font-sans font-medium">Model Designation</span>
              <span className="font-bold text-[#2C3A2B]">{product.model}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3]">
              <span className="text-[#8B8B7A] font-sans font-medium">Colour Code</span>
              <span className="font-bold text-[#2C3A2B]">{product.attributes.colour || 'Standard'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3]">
              <span className="text-[#8B8B7A] font-sans font-medium">Size Configuration</span>
              <span className="font-bold text-[#2C3A2B]">{product.attributes.size || 'Standard'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3]">
              <span className="text-[#8B8B7A] font-sans font-medium">Connector / Port</span>
              <span className="font-bold text-[#2C3A2B]">{product.attributes.connector ? product.attributes.connector.toUpperCase() : 'N/A'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3]">
              <span className="text-[#8B8B7A] font-sans font-medium">Unit Cost (Wholesale)</span>
              <span className="font-bold text-[#2C3A2B]">{product.attributes.unitCostInr ? formatINR(product.attributes.unitCostInr) : 'N/A'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3]">
              <span className="text-[#8B8B7A] font-sans font-medium">Weight</span>
              <span className="font-bold text-[#2C3A2B]">{product.weightKg ? `${product.weightKg} kg` : 'Standard'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#E6E1D3]">
              <span className="text-[#8B8B7A] font-sans font-medium">Direct Compatibility</span>
              <span className="font-bold text-[#2C3A2B]">
                {product.attributes.compatibleWith?.length ? product.attributes.compatibleWith.join(', ') : 'Universal'}
              </span>
            </div>
          </div>
        </div>

        {/* Description Text */}
        <div className="pt-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8B7A] block font-semibold mb-2">
            Detailed Overview & Design Purpose
          </span>
          <p className="text-sm text-[#4A4A35] leading-relaxed bg-[#FDFBF7] p-5 rounded-2xl border border-[#E6E1D3]">
            {product.description || `${product.name} is an enterprise-grade component designed to ensure seamless ergonomics, durability, and compatibility across modern office and workstation setups.`}
          </p>
        </div>
      </div>

      {/* 4. Related Products in Catalogue */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2C3A2B]">
                Explore More from C07 Essentials
              </h3>
              <p className="text-xs text-[#5A5A40]">
                Complementary items designed to pair seamlessly in your bundle.
              </p>
            </div>
            <button
              onClick={closeProductDetails}
              className="text-xs font-semibold text-[#8B5A2B] hover:text-[#5C3A1B] flex items-center gap-1 cursor-pointer"
            >
              <span>View All 12 Products</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map(rp => {
              const rpImg = getProductImageUrl(rp.image, rp.id);
              const isRpInBundle = Object.values(currentItems).some(item => item?.id === rp.id);
              return (
                <div
                  key={rp.id}
                  onClick={() => openProductDetails(rp.id)}
                  className="bg-white rounded-2xl border border-[#E6E1D3] p-4 hover:border-[#2C3A2B] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-3">
                    <div className="aspect-square bg-[#FDFBF7] rounded-xl p-3 flex items-center justify-center border border-[#E6E1D3]/60 relative overflow-hidden">
                      <img
                        src={rpImg}
                        alt={rp.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 left-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/90 text-[#5A5A40] border border-[#E6E1D3]">
                        {rp.id}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#8B5A2B] font-bold block">
                        {rp.category}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#2C3A2B] group-hover:text-[#8B5A2B] transition-colors truncate mt-0.5">
                        {rp.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E6E1D3]/60">
                    <span className="font-mono font-bold text-sm text-[#2C3A2B]">
                      {formatINR(rp.price)}
                    </span>
                    <span className="text-[11px] font-semibold text-[#8B5A2B] group-hover:underline flex items-center gap-0.5">
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
