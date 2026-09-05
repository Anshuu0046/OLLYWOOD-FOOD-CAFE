import React from 'react';
import { Phone, MapPin, Clock, ArrowUp, ShieldCheck, Lock } from 'lucide-react';
import { OllywoodLogo } from './OllywoodLogo';

interface FooterProps {
  onScrollTo: (id: string) => void;
  onOpenStaffPortal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollTo, onOpenStaffPortal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-[#1A1A1A] text-[#FDFCFB] pt-16 pb-12 border-t border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/20">
          
          {/* Column 1: Brand Info & Authentic Logo */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10 shrink-0">
                <OllywoodLogo size={60} showSlogan={false} />
              </div>
              <div>
                <span className="font-serif italic text-2xl text-white block">
                  Ollywood Food Café
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#D1CFCA] block mt-0.5">
                  Culinary Salon & Hearth • Est. 2018
                </span>
              </div>
            </div>

            <p className="text-xs text-[#D1CFCA]/80 leading-relaxed font-sans">
              "The Taste That Everybody Loves To Taste." Celebrating traditional slow-simmered dum handi biryanis, smoky tandoori kebabs, vibrant Chinese wok noodles, and creamy café shakes in Brahmapur (Berhampur), Odisha.
            </p>

            <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-[#D1CFCA]/70">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>FSSAI Certified: Lic. #12023004000128</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/50">
              Index
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#D1CFCA]">
              <li>
                <button
                  onClick={() => onScrollTo('hero')}
                  className="hover:text-white transition-colors"
                >
                  01. Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('favourites')}
                  className="hover:text-white transition-colors"
                >
                  02. Signature
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('menu')}
                  className="hover:text-white transition-colors"
                >
                  03. Gastronomy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('offers')}
                  className="hover:text-white transition-colors"
                >
                  04. Privileges
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('about')}
                  className="hover:text-white transition-colors"
                >
                  05. Heritage
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('gallery')}
                  className="hover:text-white transition-colors"
                >
                  06. Plates
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Menu Highlights */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/50">
              Signature Plates
            </h4>
            <ul className="space-y-1.5 text-xs text-[#D1CFCA]/80">
              <li>• Chicken Dum Handi Biryani</li>
              <li>• Royal Charcoal Tandoori Platter</li>
              <li>• Velvety Paneer Butter Masala</li>
              <li>• Crispy Chilli Babycorn Toss</li>
              <li>• American Sweet & Sour Chopsuey</li>
              <li>• Sizzling Cast-Iron Brownie</li>
            </ul>
          </div>

          {/* Column 4: Contact & Timings */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/50">
              Contact Waypoint
            </h4>
            <div className="space-y-2.5 text-xs text-[#D1CFCA]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                <a
                  href="https://maps.app.goo.gl/m1hVHBSrEFAkmraE8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline underline-offset-2"
                >
                  Near Axis Bank, Ayodhya Nagar, Brahmapur (Berhampur), Odisha 760008
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-white shrink-0" />
                <a href="tel:+919078266680" className="hover:text-white font-mono font-semibold">
                  +91 90782 66680
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="font-mono">Daily: 11:00 AM – 11:00 PM</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onScrollTo('contact')}
                className="w-full py-2 bg-transparent hover:bg-white hover:text-[#1A1A1A] text-white border border-white text-[10px] uppercase tracking-[0.2em] font-mono font-semibold transition-colors"
              >
                Table Booking Protocol
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright & back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
          <div className="flex flex-wrap items-center gap-4">
            <p>
              © {new Date().getFullYear()} Ollywood Food Café • All culinary archives registered.
            </p>
            {onOpenStaffPortal && (
              <button
                id="footer-staff-portal-btn"
                onClick={onOpenStaffPortal}
                className="text-[10px] text-white/30 hover:text-white/70 transition-colors flex items-center gap-1 cursor-pointer underline underline-offset-4 decoration-white/20 hover:decoration-white/60"
                title="Kitchen & Staff Portal (Passcode Required)"
              >
                <Lock className="w-2.5 h-2.5" />
                <span>Staff & Kitchen Portal</span>
              </button>
            )}
          </div>

          <button
            id="footer-back-to-top-btn"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1 border border-white/30 hover:border-white text-white/80 hover:text-white text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span>Top of Page</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

      </div>
    </footer>
  );
};
