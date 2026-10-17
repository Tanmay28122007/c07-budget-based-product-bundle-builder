import React from 'react';
import {
  Plus,
  RefreshCw,
  Trash2,
  Check,
  AlertTriangle,
  AlertCircle,
  Package,
  Layers
} from 'lucide-react';
import { Product, RequiredSlot, CompatibilityViolation } from '../../types';
import { formatINR } from '../../utils/pricing';

interface RequiredSlotCardProps {
  slot: RequiredSlot;
  product: Product | null;
  onOpenSelector: () => void;
  onRemove: () => void;
  compatibilityViolations: CompatibilityViolation[];
}

export const RequiredSlotCard: React.FC<RequiredSlotCardProps> = ({
  slot,
  product,
  onOpenSelector,
  onRemove,
  compatibilityViolations
}) => {
  const isFilled = Boolean(product);
  const isInStock = product ? (product.inStock && (product.stockQuantity === undefined || product.stockQuantity > 0)) : true;

  // Filter violations involving this slot's product
  const slotViolations = product
    ? compatibilityViolations.filter(
        v => v.sourceProductId === product.id || v.targetProductId === product.id
      )
    : [];
  const hasCompatibilityError = slotViolations.length > 0;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        !isFilled
          ? 'border-dashed border-stone-300 bg-white/70 hover:border-stone-400'
          : hasCompatibilityError
          ? 'border-rose-300 bg-rose-50/20'
          : !isInStock
          ? 'border-amber-300 bg-amber-50/20'
          : 'border-stone-200/90 bg-white shadow-2xs'
      }`}
    >
      {/* Top Header of Card */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-stone-100 text-stone-600 flex items-center justify-center">
            <Layers className="w-3 h-3" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              {slot.category}
            </span>
            <span className="text-xs font-bold text-stone-900">{slot.label}</span>
          </div>
        </div>

        {/* State Badge */}
        <div>
          {isFilled ? (
            hasCompatibilityError ? (
              <span className="text-[11px] font-medium text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-600" /> Conflict
              </span>
            ) : !isInStock ? (
              <span className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" /> Out of stock
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> Ready
              </span>
            )
          ) : (
            <span className="text-[11px] font-medium text-stone-400">Required</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="py-3">
        {isFilled && product ? (
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-stone-400">{product.id} · {product.brand}</span>
                <h4 className="text-xs font-semibold text-stone-900 leading-tight mt-0.5 line-clamp-1">
                  {product.name}
                </h4>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold font-mono tabular-nums text-stone-900 block">
                  {formatINR(product.price)}
                </span>
                <span className="text-[10px] text-stone-400 block font-mono">
                  {product.weightKg}kg
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {/* Error callout if conflict */}
            {hasCompatibilityError && (
              <div className="mt-2 p-2 rounded bg-rose-50 border border-rose-200/80 text-[10px] text-rose-800 leading-snug">
                {slotViolations[0].message}
              </div>
            )}
          </div>
        ) : (
          <div className="py-3 text-center">
            <p className="text-xs text-stone-400 mb-1">{slot.description}</p>
            <p className="text-[11px] text-stone-400 font-mono">Slot empty</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
        {isFilled ? (
          <>
            <button
              onClick={onOpenSelector}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-stone-500" />
              Replace Item
            </button>
            <button
              onClick={onRemove}
              className="p-1 text-stone-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
              title="Remove item from slot"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={onOpenSelector}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/50 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Select Product
          </button>
        )}
      </div>
    </div>
  );
};
