import React from 'react';
import {
  Plus,
  RefreshCw,
  Trash2,
  Check,
  AlertTriangle,
  AlertCircle,
  Layers,
  PackagePlus,
  ShieldAlert
} from 'lucide-react';
import { Product, RequiredSlot, CompatibilityViolation } from '../../types';
import { formatINR } from '../../utils/pricing';

interface RequiredSlotCardProps {
  slot: RequiredSlot;
  product: Product | null;
  onOpenSelector: () => void;
  onRemove: () => void;
  compatibilityViolations: CompatibilityViolation[];
  availableCount?: number;
}

export const RequiredSlotCard: React.FC<RequiredSlotCardProps> = ({
  slot,
  product,
  onOpenSelector,
  onRemove,
  compatibilityViolations,
  availableCount
}) => {
  const isFilled = Boolean(product);
  const stockQty = product?.stockQuantity ?? (product?.inStock ? 1 : 0);
  const isInStock = product ? (product.inStock && stockQty > 0) : true;
  const isLowStock = isInStock && stockQty > 0 && stockQty <= 5;

  // Filter violations involving this slot's product
  const slotViolations = product
    ? compatibilityViolations.filter(
        v => v.sourceProductId === product.id || v.targetProductId === product.id
      )
    : [];
  const hasCompatibilityError = slotViolations.length > 0;

  return (
    <div
      className={`rounded-[22px] border p-4.5 transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg ${
        !isFilled
          ? 'border-dashed border-[#D6CFBF] bg-[#FDFBF7]/90 hover:border-[#8B5A2B] hover:bg-[#F5F5EC]'
          : hasCompatibilityError
          ? 'border-rose-300 bg-rose-50/30 hover:border-rose-400'
          : !isInStock
          ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
          : 'border-[#E6E1D3] bg-white shadow-xs hover:border-[#A3B18A]'
      }`}
    >
      {/* Top Header of Card */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E6E1D3]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] flex items-center justify-center group-hover:bg-[#2C3A2B] group-hover:text-white transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#8B5A2B] uppercase tracking-wider block">
              {slot.category} Slot
            </span>
            <span className="font-serif text-sm font-bold text-[#2C3A2B] leading-tight">
              {slot.label}
            </span>
          </div>
        </div>

        {/* State Badge */}
        <div>
          {isFilled ? (
            hasCompatibilityError ? (
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1.5 shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Conflict
              </span>
            ) : !isInStock ? (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Out of stock
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-[#2C3A2B] bg-[#A3B18A]/25 px-2.5 py-0.5 rounded-full border border-[#A3B18A]/50 flex items-center gap-1.5 shadow-2xs">
                <Check className="w-3.5 h-3.5 text-[#2C3A2B]" /> Selected
              </span>
            )
          ) : (
            <span className="text-[10px] font-mono font-semibold text-[#8B8B7A] bg-[#F4F1EA] px-2.5 py-0.5 rounded-md border border-[#E6E1D3]">
              Required Slot
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="py-3.5">
        {isFilled && product ? (
          <div className="space-y-2.5">
            {/* Title & Price Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5A5A40]">
                  <span className="font-semibold text-[#2C3A2B]">{product.id}</span>
                  <span>·</span>
                  <span>{product.brand}</span>
                </div>
                <h4 className="text-sm font-serif font-bold text-[#2C3A2B] leading-snug mt-0.5 truncate">
                  {product.name}
                </h4>
              </div>

              {/* Price & Stock Display */}
              <div className="text-right shrink-0">
                <div className="text-base font-bold font-mono tabular-nums text-[#2C3A2B]">
                  {formatINR(product.price)}
                </div>
                <div className="mt-0.5">
                  {!isInStock ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      0 units
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {stockQty} left
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2C3A2B] bg-[#A3B18A]/20 px-2 py-0.5 rounded-full border border-[#A3B18A]/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#588157]" />
                      {stockQty} in stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Spec Badges */}
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-[#5A5A40]">
              {product.attributes.size && (
                <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#E6E1D3]">
                  Size: {product.attributes.size}
                </span>
              )}
              {product.attributes.colour && (
                <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#E6E1D3]">
                  {product.attributes.colour}
                </span>
              )}
              {product.attributes.unitCostInr && (
                <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#E6E1D3]">
                  Cost: {formatINR(product.attributes.unitCostInr)}
                </span>
              )}
              {product.attributes.connector && (
                <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#E6E1D3] uppercase">
                  Port: {product.attributes.connector}
                </span>
              )}
              {product.attributes.compatibleWith?.length ? (
                <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#E6E1D3]">
                  {product.attributes.compatibleWith.join(', ')}
                </span>
              ) : null}
              {product.weightKg > 0 && !product.attributes.size && (
                <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#E6E1D3]">
                  {product.weightKg}kg
                </span>
              )}
            </div>

            {/* Error Callout if Compatibility Conflict */}
            {hasCompatibilityError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 shadow-2xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-semibold block">Compatibility Conflict:</span>
                  <span>{slotViolations[0].message}</span>
                </div>
              </div>
            )}

            {/* Out-of-Stock Warning Callout */}
            {!isInStock && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2 shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-semibold block">Inventory Alert:</span>
                  <span>This item has zero units available. Replace it to form a valid bundle.</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty Slot State */
          <div className="py-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#F4F1EA] border border-dashed border-[#D6CFBF] mx-auto flex items-center justify-center text-[#8B8B7A] group-hover:scale-105 group-hover:border-[#8B5A2B] group-hover:text-[#8B5A2B] transition-all">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#2C3A2B]">{slot.label} Unassigned</p>
              <p className="text-[11px] text-[#5A5A40] mt-0.5 max-w-xs mx-auto line-clamp-2">
                {slot.description}
              </p>
              {availableCount !== undefined && (
                <span className="inline-block mt-1 text-[10px] font-mono text-[#8B5A2B] bg-[#F4F1EA] px-2 py-0.5 rounded-md">
                  {availableCount} available in catalogue
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-[#E6E1D3]/80 flex items-center justify-between gap-2">
        {isFilled ? (
          <>
            <button
              onClick={onOpenSelector}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2C3A2B] hover:text-white hover:bg-[#2C3A2B] bg-[#F4F1EA] border border-[#E6E1D3] rounded-xl transition-all cursor-pointer group/btn shadow-2xs"
            >
              <RefreshCw className="w-3 h-3 text-[#8B5A2B] group-hover/btn:text-white group-hover/btn:rotate-180 transition-all duration-300" />
              Swap Item
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 text-[#8B8B7A] hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              title="Remove item from slot"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onOpenSelector}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-[#2C3A2B] hover:bg-[#3A4D39] rounded-xl transition-all uppercase tracking-wider cursor-pointer shadow-xs hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Select {slot.label}
          </button>
        )}
      </div>
    </div>
  );
};
