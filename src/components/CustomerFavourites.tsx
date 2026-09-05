import React from 'react';
import { Star, Plus, Check } from 'lucide-react';
import { MenuItem, CartItem } from '../types';
import { CUSTOMER_FAVORITES } from '../data/menuData';

interface CustomerFavouritesProps {
  cartItems: CartItem[];
  onAddToCart: (item: MenuItem) => void;
}

export const CustomerFavourites: React.FC<CustomerFavouritesProps> = ({ cartItems, onAddToCart }) => {
  const getCartQuantity = (id: number) => {
    const item = cartItems.find((ci) => ci.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <section id="favourites" className="py-16 md:py-24 bg-[#FDFCFB] border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#1A1A1A]/30">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-mono block">
              Curated Selection / 2024
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl text-[#1A1A1A] tracking-tight">
              Customer Favourites
            </h2>
            <p className="text-sm text-[#1A1A1A]/70 leading-relaxed pt-1">
              Time-tested signatures celebrated across Brahmapur for artisanal clay-pot simmering, wok fires, and heritage spice blends.
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-right font-mono">
            <span className="text-3xl font-serif text-[#1A1A1A]">02</span>
            <span className="text-[10px] uppercase tracking-[0.2em] block opacity-50">Catalog</span>
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {CUSTOMER_FAVORITES.map((dish, idx) => {
            const qty = getCartQuantity(dish.id);
            const isVeg = dish.type === 'Veg';

            return (
              <div
                key={dish.id}
                id={`favourite-dish-${dish.id}`}
                className="bg-[#FDFCFB] border border-[#1A1A1A] flex flex-col group relative transition-all duration-300 hover:shadow-xs"
              >
                {/* Image Container with Architectural Hairline Border */}
                <div className="relative aspect-4/3 overflow-hidden bg-[#E8E6E1] border-b border-[#1A1A1A]">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  
                  {/* Subtle dark tint */}
                  <div className="absolute inset-0 bg-[#1A1A1A]/10 pointer-events-none" />

                  {/* Veg / Non-Veg Minimalist Editorial Tag */}
                  <div className="absolute top-3 left-3 bg-[#FDFCFB] border border-[#1A1A1A] px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] font-mono text-[#1A1A1A] flex items-center gap-1.5 shadow-xs">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isVeg ? 'bg-[#1b6d24]' : 'bg-[#9E2A2B]'
                      }`}
                    />
                    <span>{dish.type}</span>
                  </div>

                  {/* Catalog Index Tag */}
                  <div className="absolute top-3 right-3 bg-[#FDFCFB] border border-[#1A1A1A] px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-[#1A1A1A]">
                    No. 0{idx + 1}
                  </div>

                  {/* Rating Tag */}
                  <div className="absolute bottom-3 right-3 bg-[#1A1A1A] text-white px-2 py-0.5 text-[10px] font-mono flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{dish.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/60">
                        {dish.category}
                      </span>
                      <span className="text-base font-bold font-mono text-[#1A1A1A]">
                        ₹{dish.price}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mt-2 group-hover:underline decoration-1 underline-offset-4">
                      {dish.name}
                    </h3>
                    <p className="mt-2 text-xs text-[#1A1A1A]/70 line-clamp-2 leading-relaxed">
                      {dish.desc}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-6 pt-4 border-t border-[#1A1A1A]/20 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-mono opacity-50">
                      Cooked Fresh
                    </span>

                    <button
                      id={`add-favourite-btn-${dish.id}`}
                      onClick={() => onAddToCart(dish)}
                      className={`inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold px-4 py-2 border border-[#1A1A1A] transition-all active:scale-95 ${
                        qty > 0
                          ? 'bg-[#1A1A1A] text-white'
                          : 'bg-transparent text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
                      }`}
                    >
                      {qty > 0 ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added ({qty})</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
