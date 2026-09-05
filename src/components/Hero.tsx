import React from 'react';
import { ArrowRight, Utensils, Star, ShieldCheck, Clock } from 'lucide-react';
import { OllywoodLogo } from './OllywoodLogo';
import { HERO_IMAGE } from '../data/menuData';

interface HeroProps {
  onExploreMenu: () => void;
  onBookTable: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMenu, onBookTable }) => {
  return (
    <section id="hero" className="pt-16 sm:pt-20 border-b border-[#1A1A1A] bg-[#FDFCFB]">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px] lg:min-h-[700px]">
        
        {/* Left Column - Editorial Text & Action */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#1A1A1A] p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-mono text-[#1A1A1A]">
                In Focus / Gastronomy 2024
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] bg-[#1A1A1A] text-white px-2 py-0.5 font-mono">
                Vol. 01
              </span>
            </div>

            {/* Official Brand Identity Block */}
            <div className="flex items-center gap-3.5 py-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 drop-shadow-xs">
                <OllywoodLogo size={64} showSlogan={false} />
              </div>
              <div className="border-l border-[#1A1A1A]/20 pl-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-bold font-serif text-[#1A1A1A] leading-none">
                    Ollywood
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E31E24]">
                    Food Café
                  </span>
                </div>
                <span className="text-[10px] italic text-[#1A1A1A]/75 block font-serif mt-0.5">
                  "The Taste That Everybody Loves To Taste"
                </span>
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif italic tracking-tight leading-[0.92] text-[#1A1A1A]">
              The <br />
              <span className="not-italic font-serif">Handi</span> <br />
              Heritage
            </h1>

            <p className="text-base sm:text-lg leading-relaxed mt-8 sm:mt-10 opacity-80 max-w-[360px] text-[#1A1A1A]">
              An artisanal kitchen dedicated to slow-steamed dum biryanis, scorching tandoor clay platters, and wok-fired Indo-Chinese plates seasoned with hand-pounded royal spices.
            </p>
          </div>

          {/* Editorial Interactive CTA and Bottom Status */}
          <div className="pt-10">
            <div className="flex flex-wrap items-center gap-6">
              <button
                id="hero-explore-thesis-btn"
                onClick={onExploreMenu}
                className="flex items-center gap-4 group focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full border border-[#1A1A1A] flex items-center justify-center group-hover:bg-[#1A1A1A] group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                  Explore Full Menu
                </span>
              </button>

              <button
                id="hero-reserve-thesis-btn"
                onClick={onBookTable}
                className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:opacity-60 transition-opacity ml-auto"
              >
                Reserve Table →
              </button>
            </div>

            {/* Hairline Editorial Metadata Bar */}
            <div className="border-t border-[#1A1A1A] pt-6 mt-10 grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 block font-mono">
                  Origin
                </span>
                <a
                  href="https://maps.app.goo.gl/m1hVHBSrEFAkmraE8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold uppercase tracking-wider block mt-1 hover:text-[#9E2A2B] transition-colors"
                  title="View on Google Maps"
                >
                  Brahmapur ↗
                </a>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 block font-mono">
                  Freshness
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider block mt-1 text-[#1A1A1A]">
                  100% Raw Spices
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 block font-mono">
                  Rating
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider block mt-1 font-serif">
                  4.9 ★ / 5.0
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Architectural Lithographic Plate Container */}
        <div className="lg:col-span-7 bg-[#E8E6E1] relative overflow-hidden flex flex-col justify-between p-8 sm:p-12 lg:p-14">
          {/* Radial Dot Pattern from Design HTML */}
          <div className="absolute inset-0 opacity-25 editorial-dot-pattern pointer-events-none" />

          {/* Top Tagline Row */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#1A1A1A]/70">
              Figure 01 / Artisanal Clay Pot
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/70">
              Live Wood Ember
            </span>
          </div>

          {/* Architectural Image Frame with Corner Brackets */}
          <div className="w-full aspect-4/3 sm:aspect-16/10 bg-[#D1CFCA] border border-[#1A1A1A] flex items-center justify-center relative mb-8 my-auto group">
            {/* Architectural corner marks */}
            <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-16 sm:w-24 h-16 sm:h-24 border-t border-l border-[#1A1A1A] pointer-events-none" />
            <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-16 sm:w-24 h-16 sm:h-24 border-b border-r border-[#1A1A1A] pointer-events-none" />

            {/* Rotated Lithographic Label */}
            <div className="hidden sm:block text-[10px] uppercase tracking-[0.4em] transform -rotate-90 origin-center absolute -left-16 text-[#1A1A1A] font-mono pointer-events-none">
              Gastronomic Study
            </div>

            {/* Food Photograph */}
            <div className="w-full h-full overflow-hidden relative">
              <img
                src={HERO_IMAGE}
                alt="Ollywood Signature Handi Biryani"
                className="w-full h-full object-cover object-center transform group-hover:scale-103 transition-transform duration-700"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <div className="absolute inset-0 bg-[#1A1A1A]/10 pointer-events-none" />
            </div>
          </div>

          {/* Bottom Editorial Caption Bar */}
          <div className="flex justify-between items-end relative z-10 pt-4 border-t border-[#1A1A1A]/30">
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">
                Royal Dum Handi Biryani
              </h3>
              <p className="text-[11px] sm:text-xs opacity-70 italic font-serif text-[#1A1A1A]">
                Slow-simmered basmati, saffron infusion, hand-crafted raita & salan
              </p>
            </div>

            <div className="text-right">
              <div className="text-5xl sm:text-6xl font-serif leading-none text-[#1A1A1A]">
                01
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] mt-1 font-mono opacity-60">
                Plate
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

