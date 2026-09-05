import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';
import { CartItem, OfferCoupon } from '../types';
import { OFFERS } from '../data/menuData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  appliedCoupon: OfferCoupon | null;
  onApplyCoupon: (coupon: OfferCoupon | null) => void;
  onProceedToCheckout: (instructions: string) => void;
  onBrowseMenu: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  appliedCoupon,
  onApplyCoupon,
  onProceedToCheckout,
  onBrowseMenu,
}) => {
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon && subtotal >= (appliedCoupon.minOrder || 0)) {
    if (appliedCoupon.discountType === 'flat') {
      discountAmount = appliedCoupon.discountValue;
    } else if (appliedCoupon.discountType === 'percent') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else if (appliedCoupon.discountType === 'freebie') {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxes = Math.round(discountedSubtotal * 0.05); // 5% GST
  const grandTotal = discountedSubtotal + taxes;

  const handleApplyCouponCode = () => {
    setCouponError('');
    const codeClean = couponInput.trim().toUpperCase();
    const matched = OFFERS.find((o) => o.code.toUpperCase() === codeClean);

    if (!matched) {
      setCouponError('Unrecognized token. Valid dine-in tokens: TABLE50, FAMILY100, FESTIVE10.');
      return;
    }

    if (matched.minOrder && subtotal < matched.minOrder) {
      setCouponError(`Add items worth ₹${matched.minOrder - subtotal} more to redeem ${matched.code}.`);
      return;
    }

    onApplyCoupon(matched);
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        id="cart-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-[#1A1A1A]/70 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDFCFB] text-[#1A1A1A] shadow-2xl flex flex-col justify-between border-l border-[#1A1A1A]">
          
          {/* Header */}
          <div className="p-5 border-b border-[#1A1A1A] flex items-center justify-between bg-[#FDFCFB]">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/60 block">
                Dine-In Order Folio
              </span>
              <h2 className="font-serif italic text-2xl font-bold text-[#1A1A1A]">
                Table Selection
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono border border-[#1A1A1A] px-2 py-0.5">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} plates
              </span>
              <button
                id="close-cart-btn"
                onClick={onClose}
                className="p-1.5 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="font-serif italic text-xl font-bold text-[#1A1A1A]">
                  No Plates Selected
                </h3>
                <p className="text-xs text-[#1A1A1A]/60 mt-1 font-mono max-w-xs mx-auto">
                  Your table order folio is currently empty.
                </p>
                <button
                  id="empty-cart-browse-btn"
                  onClick={() => {
                    onClose();
                    onBrowseMenu();
                  }}
                  className="mt-6 px-6 py-2.5 bg-[#1A1A1A] text-white border border-[#1A1A1A] text-[10px] uppercase tracking-[0.2em] font-mono hover:bg-neutral-800"
                >
                  Inspect Dining Menu
                </button>
              </div>
            ) : (
              <>
                {/* Dine-In notice */}
                <div className="p-3 border border-[#1A1A1A] bg-[#E8E6E1]/30 font-mono text-xs">
                  <div className="flex items-center gap-2 text-[#1A1A1A]">
                    <span className="w-2 h-2 rounded-full bg-[#1b6d24] animate-pulse" />
                    <span><strong>In-Cafe Dining:</strong> Order directly sent to Kitchen POS & printed on KOT.</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const isVeg = item.type === 'Veg';
                    return (
                      <div
                        key={item.id}
                        id={`cart-item-row-${item.id}`}
                        className="bg-[#FDFCFB] p-3.5 border border-[#1A1A1A] flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isVeg ? 'bg-[#1b6d24]' : 'bg-[#9E2A2B]'
                              }`}
                            />
                            <h4 className="font-serif font-bold text-sm text-[#1A1A1A] truncate">
                              {item.name}
                            </h4>
                          </div>
                          <span className="text-[11px] font-mono text-[#1A1A1A]/60">
                            ₹{item.price} each
                          </span>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2 border border-[#1A1A1A] bg-[#E8E6E1]/40 px-2 py-1">
                          <button
                            id={`decrease-qty-${item.id}`}
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="text-[#1A1A1A] hover:opacity-60 transition-opacity"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold text-[#1A1A1A] w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            id={`increase-qty-${item.id}`}
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="text-[#1A1A1A] hover:opacity-60 transition-opacity"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Total per line & Remove */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-bold text-[#1A1A1A]">
                            ₹{item.price * item.quantity}
                          </span>
                          <button
                            id={`remove-item-${item.id}`}
                            onClick={() => onRemoveItem(item.id)}
                            className="text-[#1A1A1A]/40 hover:text-[#9E2A2B] p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Special Instructions */}
                <div>
                  <label htmlFor="cooking-notes" className="block text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/70 mb-1">
                    Special Kitchen Notes
                  </label>
                  <textarea
                    id="cooking-notes"
                    rows={2}
                    placeholder="e.g. Mild spice, extra mint dip, eco cutlery..."
                    value={cookingInstructions}
                    onChange={(e) => setCookingInstructions(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#FDFCFB] border border-[#1A1A1A] font-mono text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:bg-[#E8E6E1]/20"
                  />
                </div>

                {/* Promo Code Section */}
                <div className="p-3.5 border border-[#1A1A1A] bg-[#FDFCFB]">
                  <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#1A1A1A]/70">
                    <Tag className="w-3 h-3 text-[#1A1A1A]" />
                    <span>Redeem Token</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-[#E8E6E1]/60 border border-[#1A1A1A] p-2.5 font-mono">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-[#1b6d24]" />
                          <span className="text-xs font-bold text-[#1A1A1A]">
                            {appliedCoupon.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#1A1A1A]/70 block mt-0.5">
                          {appliedCoupon.description} (-₹{discountAmount})
                        </span>
                      </div>
                      <button
                        onClick={() => onApplyCoupon(null)}
                        className="text-[10px] uppercase tracking-wider text-[#9E2A2B] hover:underline"
                      >
                        Revoke
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. FLAT100"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className="flex-1 uppercase text-xs px-3 py-1.5 bg-[#FDFCFB] border border-[#1A1A1A] text-[#1A1A1A] font-mono tracking-wider focus:outline-none"
                        />
                        <button
                          onClick={handleApplyCouponCode}
                          className="px-3 py-1.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest font-mono hover:bg-neutral-800"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-[#9E2A2B]">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{couponError}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bill Breakdown */}
                <div className="p-4 border border-[#1A1A1A] bg-[#FDFCFB] space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#1A1A1A]/70">
                    <span>Folio Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#1b6d24]">
                      <span>Privilege Deduction ({appliedCoupon?.code})</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#1A1A1A]/70">
                    <span>GST & Statutory Cess (5%)</span>
                    <span>₹{taxes}</span>
                  </div>

                  <div className="flex justify-between text-[#1A1A1A]/70">
                    <span>Table Service & Air Condition</span>
                    <span className="text-[#1b6d24]">COMPLIMENTARY</span>
                  </div>

                  <div className="pt-3 border-t border-[#1A1A1A]/30 flex justify-between items-center text-sm font-bold text-[#1A1A1A]">
                    <span className="font-serif italic text-base">Net Table Total</span>
                    <span className="text-base font-mono">₹{grandTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Bar */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-[#1A1A1A] bg-[#FDFCFB] space-y-3">
              <button
                id="cart-checkout-proceed-btn"
                onClick={() => onProceedToCheckout(cookingInstructions)}
                className="w-full flex items-center justify-between bg-[#1A1A1A] hover:bg-neutral-800 text-white font-mono py-3.5 px-6 border border-[#1A1A1A] transition-all group cursor-pointer"
              >
                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-widest text-white/60 block">
                    Total Due
                  </span>
                  <span className="text-base font-bold block leading-none">
                    ₹{grandTotal}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold">
                  <span>Enter Table & Guest Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
