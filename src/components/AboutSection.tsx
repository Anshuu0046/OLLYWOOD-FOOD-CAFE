import React from 'react';
import { ChefHat, HeartHandshake, Sparkles, UtensilsCrossed, Award, Users } from 'lucide-react';
import { ABOUT_IMAGE } from '../data/menuData';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-[#FDFCFB] border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#1A1A1A]/30">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-mono block">
              Chronicle & Philosophy / 2024
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl text-[#1A1A1A] tracking-tight">
              Our Culinary Heritage
            </h2>
            <p className="text-sm text-[#1A1A1A]/70 leading-relaxed pt-1">
              A dedication to ancient slow-steaming traditions, hand-selected spices, and generous Odishan hospitality.
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-right font-mono">
            <span className="text-3xl font-serif text-[#1A1A1A]">05</span>
            <span className="text-[10px] uppercase tracking-[0.2em] block opacity-50">Chronicle</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Storytelling Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-4">
              <p className="text-sm sm:text-base text-[#1A1A1A]/80 leading-relaxed">
                Founded with an ethos to honor authentic royal dum recipes and high-heat Asian wokcraft, <strong>Ollywood Food Café</strong> stands as a landmark for discerning food patrons in Brahmapur (Berhampur).
              </p>

              <p className="text-sm sm:text-base text-[#1A1A1A]/80 leading-relaxed">
                Every handi is sealed with kneaded dough and slowly steamed over charcoal coals. Our spice masalas are hand-pounded daily from whole cinnamon, black cardamom, and Kashmiri chilies. No pre-cooked gravies; only honest artisanal cooking.
              </p>
            </div>

            {/* Chef Quote Card */}
            <div className="p-6 bg-[#E8E6E1]/40 border border-[#1A1A1A] relative">
              <p className="font-serif italic text-base sm:text-lg text-[#1A1A1A] leading-relaxed">
                “Good food is not merely cooking with heat; it is an art of patience, reverence for unadulterated produce, and devotion poured into every single handi.”
              </p>
              <div className="mt-4 pt-3 border-t border-[#1A1A1A]/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] block">
                    Chef Rajesh & Brigade
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-[#1A1A1A]/60">
                    Master of Dum Handi Cuisine
                  </span>
                </div>
                <Award className="w-5 h-5 text-[#1A1A1A]" />
              </div>
            </div>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="border border-[#1A1A1A] p-4 bg-[#FDFCFB]">
                <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/60 mb-1">
                  Purity
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Daily Fresh Stock</h4>
                <p className="text-[11px] text-[#1A1A1A]/70 mt-1">Never frozen or pre-mixed</p>
              </div>

              <div className="border border-[#1A1A1A] p-4 bg-[#FDFCFB]">
                <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/60 mb-1">
                  Safety
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Certified Hygiene</h4>
                <p className="text-[11px] text-[#1A1A1A]/70 mt-1">Open-concept live kitchen</p>
              </div>

              <div className="border border-[#1A1A1A] p-4 bg-[#FDFCFB]">
                <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/60 mb-1">
                  Space
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Bespoke Dining</h4>
                <p className="text-[11px] text-[#1A1A1A]/70 mt-1">Booths for intimate gatherings</p>
              </div>

              <div className="border border-[#1A1A1A] p-4 bg-[#FDFCFB]">
                <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/60 mb-1">
                  Beverage
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Artisanal Shakes</h4>
                <p className="text-[11px] text-[#1A1A1A]/70 mt-1">Slow churned thick milkshakes</p>
              </div>
            </div>

          </div>

          {/* Right Column: Restaurant Interior Visual Card with Architectural Frame */}
          <div className="lg:col-span-6 relative">
            <div className="relative border border-[#1A1A1A] bg-[#D1CFCA] p-3 group">
              {/* Corner marks */}
              <div className="absolute -top-3 -left-3 w-16 h-16 border-t border-l border-[#1A1A1A] pointer-events-none" />
              <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b border-r border-[#1A1A1A] pointer-events-none" />

              <div className="relative overflow-hidden aspect-4/3 sm:aspect-16/11 bg-[#E8E6E1]">
                <img
                  src={ABOUT_IMAGE}
                  alt="Ollywood Food Café Interior Ambience"
                  className="w-full h-full object-cover object-center transform group-hover:scale-103 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#1A1A1A]/20 pointer-events-none" />
              </div>

              <div className="pt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-[#1A1A1A]">
                <span>Interior Study / Brahmapur</span>
                <span>Plate 05.B</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
