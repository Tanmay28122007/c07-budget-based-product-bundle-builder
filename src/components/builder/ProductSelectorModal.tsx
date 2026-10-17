import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  AlertTriangle,
  ArrowUpDown,
  ShieldAlert,
  Info,
  PackageCheck
} from 'lucide-react';
import { Product, RequiredSlot } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';
import { checkCandidateCompatibility } from '../../utils/compatibility';

interface ProductSelectorModalProps {
  slot: RequiredSlot;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  slot,
  isOpen,
  onClose
}) => {
  const { fixture, currentItems, selectProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'availability'>('price_asc');
  const [showOnlyCompatible, setShowOnlyCompatible] = useState(false);

  const currentlySelected = currentItems[slot.id];

  // Filter products for this slot category
  const productsForSlot = useMemo(() => {
    return fixture.products.filter(p => p.category === slot.category);
  }, [fixture.products, slot.category]);

  // Evaluate candidate compatibility & eligibility for each product
  const evaluatedProducts = useMemo(() => {
    return productsForSlot.map(product => {
      const inStock = product.inStock && (product.stockQuantity === undefined || product.stockQuantity > 0);
      const { isCompatible, reasons } = checkCandidateCompatibility(product, currentItems, slot.id);

      // Check if product is already assigned to a DIFFERENT slot (duplicate slot violation)
      const assignedToOtherSlot = Object.entries(currentItems).find(
        ([sId, p]) => sId !== slot.id && p?.id === product.id
      );

      const isEligible = inStock && isCompatible && !assignedToOtherSlot;

      return {
        product,
        inStock,
        isCompatible,
        incompatibilityReasons: reasons,
        assignedToOtherSlot: assignedToOtherSlot ? assignedToOtherSlot[0] : null,
        isEligible
      };
    });
  }, [productsForSlot, currentItems, slot.id]);

  // Apply search, filters, and sorting
  const filteredAndSortedProducts = useMemo(() => {
    return evaluatedProducts
      .filter(({ product, isCompatible }) => {
        if (showOnlyCompatible && !isCompatible) return false;
        if (!searchTerm) return true;
        const query = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.id.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') {
          return a.product.price - b.product.price;
        } else if (sortBy === 'price_desc') {
          return b.product.price - a.product.price;
        } else {
          // Availability sort: In-stock first, then higher stock count
          if (a.inStock === b.inStock) {
            return (b.product.stockQuantity || 0) - (a.product.stockQuantity || 0);
          }
          return a.inStock ? -1 : 1;
        }
      });
  }, [evaluatedProducts, searchTerm, sortBy, showOnlyCompatible]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2C2C1E]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-[24px] max-w-3xl w-full border border-[#E6E1D3] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6E1D3] flex items-center justify-between bg-[#FDFBF7]">
          <div>
            <div className="text-[11px] font-semibold text-[#8B5A2B] uppercase tracking-wider">
              Select Product for Slot
            </div>
            <h2 className="font-serif text-lg font-bold text-[#2C3A2B]">
              {slot.label} ({slot.category})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8B8B7A] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search, Filter & Sort Bar */}
        <div className="p-4 border-b border-[#E6E1D3] bg-white space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B7A]" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by product name, model, spec..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F4F1EA]/70 focus:bg-white border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] text-[#2C2C1E]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[#5A5A40] bg-[#F4F1EA] border border-[#E6E1D3] px-3 py-1.5 rounded-xl">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs text-[#2C3A2B] font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="availability">Availability First</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 text-xs text-[#5A5A40] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOnlyCompatible}
                  onChange={e => setShowOnlyCompatible(e.target.checked)}
                  className="rounded text-[#2C3A2B] focus:ring-[#2C3A2B]"
                />
                <span>Compatible Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B8B7A] bg-[#FDFBF7] rounded-xl border border-dashed border-[#E6E1D3]">
              No products found matching your current filter criteria.
            </div>
          ) : (
            filteredAndSortedProducts.map(
              ({
                product,
                inStock,
                isCompatible,
                incompatibilityReasons,
                assignedToOtherSlot,
                isEligible
              }) => {
                const isSelected = currentlySelected?.id === product.id;

                return (
                  <div
                    key={product.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 ${
                      isSelected
                        ? 'border-[#2C3A2B] bg-[#A3B18A]/10 shadow-sm ring-2 ring-[#2C3A2B]/20'
                        : isEligible
                        ? 'border-[#E6E1D3] hover:border-[#8B5A2B] hover:-translate-y-1.5 hover:shadow-lg bg-white'
                        : 'border-[#E6E1D3] bg-[#F4F1EA]/60 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-[#8B8B7A]">
                            {product.id}
                          </span>
                          <span className="text-[#E6E1D3]">·</span>
                          <span className="text-[11px] font-semibold text-[#8B5A2B] uppercase">
                            {product.brand}
                          </span>
                        </div>

                        <h3 className="font-serif text-sm font-bold text-[#2C3A2B] mt-0.5">
                          {product.name}
                        </h3>

                        <p className="text-xs text-[#5A5A40] mt-1 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Specs & Attributes List */}
                        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#5A5A40] font-mono">
                          {product.attributes.size && <span>Size: {product.attributes.size}</span>}
                          {product.attributes.colour && <span>Colour: {product.attributes.colour}</span>}
                          {product.attributes.unitCostInr && <span>Unit Cost: {formatINR(product.attributes.unitCostInr)}</span>}
                          {product.attributes.connector && (
                            <span>Port: {product.attributes.connector.toUpperCase()}</span>
                          )}
                          {product.attributes.compatibleWith?.length ? (
                            <span>Interface: {product.attributes.compatibleWith.join(', ')}</span>
                          ) : null}
                          {product.weightKg > 0 && !product.attributes.size && <span>Weight: {product.weightKg}kg</span>}
                          {product.attributes.deskWidthCm && (
                            <span>Width: {product.attributes.deskWidthCm}cm</span>
                          )}
                          {product.attributes.ergonomicGrade && (
                            <span>Grade: {product.attributes.ergonomicGrade}</span>
                          )}
                        </div>

                        {/* Status Badges / Incompatibility notices */}
                        <div className="mt-3 space-y-1">
                          {!inStock && (
                            <div className="text-[11px] text-rose-700 font-medium flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              Out of stock (0 units remaining in warehouse).
                            </div>
                          )}

                          {assignedToOtherSlot && (
                            <div className="text-[11px] text-amber-700 font-medium flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              Already assigned to slot "{assignedToOtherSlot}". Duplicate slots prohibited.
                            </div>
                          )}

                          {!isCompatible && (
                            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 space-y-1">
                              <div className="font-semibold flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                                Compatibility Conflict:
                              </div>
                              {incompatibilityReasons.map((reason, idx) => (
                                <p key={idx} className="leading-relaxed">
                                  {reason}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Price & Select Button */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6E1D3]">
                        <div className="text-right">
                          <div className="text-base font-bold font-mono tabular-nums text-[#8B5A2B]">
                            {formatINR(product.price)}
                          </div>
                          <div className="text-[10px] text-[#8B8B7A]">
                            {inStock ? `${product.stockQuantity} in stock` : 'Unavailable'}
                          </div>
                        </div>

                        <button
                          disabled={!isEligible}
                          onClick={() => {
                            selectProduct(slot.id, product);
                            onClose();
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#2C3A2B] text-white shadow-2xs'
                              : isEligible
                              ? 'bg-[#8B5A2B] hover:bg-[#743815] text-white shadow-2xs'
                              : 'bg-[#F4F1EA] text-[#8B8B7A] cursor-not-allowed border border-[#E6E1D3]'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Selected
                            </>
                          ) : isEligible ? (
                            'Select Product'
                          ) : (
                            'Ineligible'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E6E1D3] bg-[#FDFBF7] flex items-center justify-between text-xs text-[#5A5A40]">
          <span>
            Showing {filteredAndSortedProducts.length} of {productsForSlot.length} available items
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-[#E6E1D3] text-[#2C2C1E] hover:bg-[#F4F1EA] font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
