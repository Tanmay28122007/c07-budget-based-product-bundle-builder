import React from 'react';
import {
  Plus,
  RefreshCw,
  Trash2,
  Check,
  AlertTriangle,
  AlertCircle,
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
      className={`rounded-2xl border p-4 transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg ${
        !isFilled
          ? 'border-dashed border-[#E6E1D3] bg-[#FDFBF7]/80 hover:border-[#8B5A2B] hover:bg-[#F5F5EC]'
          : hasCompatibilityError
          ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400 hover:shadow-rose-100'
          : !isInStock
          ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400 hover:shadow-amber-100'
          : 'border-[#E6E1D3] bg-white shadow-xs hover:border-[#8B5A2B]/50'
      }`}
    >
      {/* Top Header of Card */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E6E1D3]/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#8B8B7A] uppercase tracking-wider block">
              {slot.category}
            </span>
            <span className="font-serif text-sm font-bold text-[#2C3A2B]">{slot.label}</span>
          </div>
        </div>

        {/* State Badge */}
        <div>
          {isFilled ? (
            hasCompatibilityError ? (
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-600" /> Conflict
              </span>
            ) : !isInStock ? (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" /> Out of stock
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-[#2C3A2B] bg-[#A3B18A]/25 px-2 py-0.5 rounded-full border border-[#A3B18A]/50 flex items-center gap-1">
                <Check className="w-3 h-3 text-[#2C3A2B]" /> Ready
              </span>
            )
          ) : (
            <span className="text-[10px] font-mono text-[#8B8B7A] bg-[#F4F1EA] px-2 py-0.5 rounded-md border border-[#E6E1D3]">
              Required
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="py-3">
        {isFilled && product ? (
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-[#8B8B7A]">{product.id} · {product.brand}</span>
                <h4 className="text-xs font-semibold text-[#2C2C1E] leading-tight mt-0.5 line-clamp-1">
                  {product.name}
                </h4>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold font-mono tabular-nums text-[#8B5A2B] block">
                  {formatINR(product.price)}
                </span>
                <span className="text-[10px] text-[#8B8B7A] block font-mono">
                  {product.weightKg}kg
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#5A5A40] mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {/* Error callout if conflict */}
            {hasCompatibilityError && (
              <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[10px] text-rose-800 leading-snug">
                {slotViolations[0].message}
              </div>
            )}
          </div>
        ) : (
          <div className="py-3 text-center">
            <p className="text-xs text-[#5A5A40] mb-1">{slot.description}</p>
            <p className="text-[11px] text-[#8B8B7A] font-mono">Slot empty</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-[#E6E1D3]/80 flex items-center justify-between gap-2">
        {isFilled ? (
          <>
            <button
              onClick={onOpenSelector}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#2C2C1E] hover:text-[#2C3A2B] hover:bg-[#F4F1EA] rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-[#8B5A2B]" />
              Replace Item
            </button>
            <button
              onClick={onRemove}
              className="p-1 text-[#8B8B7A] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              title="Remove item from slot"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={onOpenSelector}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#8B5A2B] bg-[#F4F1EA] hover:bg-[#E6E1D3] border border-[#E6E1D3] rounded-xl transition-all uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Select Product
          </button>
        )}
      </div>
    </div>
  );
};
