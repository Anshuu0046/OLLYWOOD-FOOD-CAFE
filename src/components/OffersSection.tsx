import React, { useState } from 'react';
import { Tag, Copy, Check, ArrowRight } from 'lucide-react';
import { OFFERS } from '../data/menuData';
import { OfferCoupon } from '../types';

interface OffersSectionProps {
  onApplyCouponToCart: (coupon: OfferCoupon) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({ onApplyCouponToCart }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section id="offers" className="py-16 md:py-24 bg-[#FDFCFB] border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#1A1A1A]/30">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-mono block">
              Vouchers & Privileges / 2024
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl text-[#1A1A1A] tracking-tight">
              Curated Privileges
            </h2>
            <p className="text-sm text-[#1A1A1A]/70 leading-relaxed pt-1">
              Apply verified culinary tokens directly during checkout for festive deductions and bespoke dining compliments.
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-right font-mono">
            <span className="text-3xl font-serif text-[#1A1A1A]">04</span>
            <span className="text-[10px] uppercase tracking-[0.2em] block opacity-50">Privilege</span>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {OFFERS.map((offer) => {
            const isCopied = copiedCode === offer.code;

            return (
              <div
                key={offer.code}
                id={`offer-card-${offer.code}`}
                className="bg-[#FDFCFB] border border-[#1A1A1A] p-6 flex flex-col justify-between relative group hover:shadow-xs transition-all"
              >
                {/* Architectural corner marks */}
                <div className="absolute top-0 right-0 bg-[#1A1A1A] text-white text-[9px] font-mono uppercase tracking-widest px-3 py-1">
                  {offer.tag}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4 pt-2">
                    <div className="w-8 h-8 rounded-full border border-[#1A1A1A] flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                        {offer.title}
                      </h3>
                      {offer.minOrder && (
                        <span className="text-[10px] font-mono text-[#1A1A1A]/60 block">
                          Threshold: ₹{offer.minOrder}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#1A1A1A]/70 leading-relaxed mb-6">
                    {offer.description}
                  </p>
                </div>

                {/* Voucher Code Box */}
                <div className="pt-4 border-t border-[#1A1A1A]/20 space-y-3">
                  <div className="flex items-center justify-between bg-[#E8E6E1]/50 px-3.5 py-2 border border-[#1A1A1A]">
                    <span className="font-mono text-xs font-bold tracking-widest text-[#1A1A1A]">
                      {offer.code}
                    </span>
                    <button
                      onClick={() => handleCopy(offer.code)}
                      className="text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A] hover:opacity-60 flex items-center gap-1 transition-opacity"
                      title="Copy code to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#1b6d24]" />
                          <span className="text-[#1b6d24]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => onApplyCouponToCart(offer)}
                    className="w-full py-2.5 px-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.2em] font-semibold border border-[#1A1A1A] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Apply Privilege</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
