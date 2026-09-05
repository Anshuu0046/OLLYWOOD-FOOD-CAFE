import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, Star, Utensils } from 'lucide-react';
import { MenuItem, CartItem } from '../types';
import { MENU_ITEMS, CATEGORIES } from '../data/menuData';

interface MenuSectionProps {
  cartItems: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onOpenCart: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ cartItems, onAddToCart, onOpenCart }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'Veg' | 'Non-Veg'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesDietary = dietaryFilter === 'ALL' || item.type === dietaryFilter;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesDietary && matchesSearch;
    });
  }, [activeCategory, dietaryFilter, searchQuery]);

  const getCartQuantity = (id: number) => {
    const item = cartItems.find((ci) => ci.id === id);
    return item ? item.quantity : 0;
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section id="menu" className="py-16 md:py-24 bg-[#FDFCFB] border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#1A1A1A]/30">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-mono block">
              Menu Index / 2024
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl text-[#1A1A1A] tracking-tight">
              Curated Dining Menu
            </h2>
            <p className="text-sm text-[#1A1A1A]/70 leading-relaxed pt-1">
              A comprehensive culinary archive ranging from traditional earthen pot dum biryanis to charcoal tandoor platters and wok specialities.
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-right font-mono">
            <span className="text-3xl font-serif text-[#1A1A1A]">03</span>
            <span className="text-[10px] uppercase tracking-[0.2em] block opacity-50">Archive</span>
          </div>
        </div>

        {/* Search & Dietary Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="menu-search-input"
              type="text"
              placeholder="Search index (e.g. Biryani, Hakka, Paneer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FDFCFB] border border-[#1A1A1A] text-xs sm:text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:bg-[#E8E6E1]/20 font-mono transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest font-mono text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Veg / Non-Veg Filters */}
          <div className="flex items-center gap-2 self-start sm:self-auto border border-[#1A1A1A] p-1 bg-[#FDFCFB]">
            <button
              id="dietary-filter-all"
              onClick={() => setDietaryFilter('ALL')}
              className={`px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-mono transition-all ${
                dietaryFilter === 'ALL'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#1A1A1A] hover:bg-[#E8E6E1]'
              }`}
            >
              All Items
            </button>
            <button
              id="dietary-filter-veg"
              onClick={() => setDietaryFilter('Veg')}
              className={`px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-mono flex items-center gap-1.5 transition-all ${
                dietaryFilter === 'Veg'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#1A1A1A] hover:bg-[#E8E6E1]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1b6d24]" />
              <span>Veg Only</span>
            </button>
            <button
              id="dietary-filter-nonveg"
              onClick={() => setDietaryFilter('Non-Veg')}
              className={`px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-mono flex items-center gap-1.5 transition-all ${
                dietaryFilter === 'Non-Veg'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#1A1A1A] hover:bg-[#E8E6E1]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E2A2B]" />
              <span>Non-Veg</span>
            </button>
          </div>
        </div>

        {/* Category Tabs Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar scroll-smooth">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              id={`cat-btn-${category.id}`}
              onClick={() => setActiveCategory(category.id)}
              className={`whitespace-nowrap px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-mono border border-[#1A1A1A] transition-all shrink-0 ${
                activeCategory === category.id
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-[#FDFCFB] text-[#1A1A1A] hover:bg-[#E8E6E1]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Dish Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[#FDFCFB] border border-dashed border-[#1A1A1A] p-8">
            <Utensils className="w-8 h-8 text-[#1A1A1A]/40 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">No records located</h3>
            <p className="text-xs text-[#1A1A1A]/60 mt-1 font-mono">Adjust search query or filter criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDietaryFilter('ALL');
                setActiveCategory('all');
              }}
              className="mt-4 px-4 py-2 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.2em] font-mono"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const qty = getCartQuantity(item.id);
              const isVeg = item.type === 'Veg';

              return (
                <div
                  key={item.id}
                  id={`menu-item-card-${item.id}`}
                  className="bg-[#FDFCFB] border border-[#1A1A1A] p-6 hover:bg-[#E8E6E1]/20 transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Veg indicator & Rating */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isVeg ? 'bg-[#1b6d24]' : 'bg-[#9E2A2B]'
                          }`}
                        />
                        <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/70">
                          {item.type} • {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-mono text-[#1A1A1A]">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Dish Title */}
                    <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-xs text-[#1A1A1A]/70 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Bottom Row: Price and Add button */}
                  <div className="mt-6 pt-4 border-t border-[#1A1A1A]/20 flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold font-mono text-[#1A1A1A]">
                        ₹{item.price}
                      </span>
                    </div>

                    <button
                      id={`add-menu-btn-${item.id}`}
                      onClick={() => onAddToCart(item)}
                      className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-1.5 border border-[#1A1A1A] transition-all active:scale-95 ${
                        qty > 0
                          ? 'bg-[#1A1A1A] text-white'
                          : 'bg-transparent text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
                      }`}
                    >
                      {qty > 0 ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Added ({qty})</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Add to Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Cart Bar (Sticky when items present) */}
        {totalCartCount > 0 && (
          <div className="sticky bottom-6 mt-8 z-40">
            <div className="bg-[#1A1A1A] text-[#FDFCFB] p-4 max-w-xl mx-auto flex items-center justify-between border border-[#1A1A1A] shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-white/40 bg-white text-[#1A1A1A] flex items-center justify-center font-mono font-bold text-xs">
                  {totalCartCount}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    {totalCartCount} {totalCartCount === 1 ? 'Plate Selected' : 'Plates Selected'}
                  </span>
                  <span className="text-[10px] font-mono opacity-70 block">
                    Dine-In Table Order • Kitchen POS Auto-Sync
                  </span>
                </div>
              </div>

              <button
                id="menu-view-cart-btn"
                onClick={onOpenCart}
                className="bg-[#FDFCFB] hover:bg-neutral-200 text-[#1A1A1A] text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2 transition-colors"
              >
                Review Order →
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
