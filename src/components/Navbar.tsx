import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu as MenuIcon, X, Phone, UtensilsCrossed, Sun, Moon, Laptop } from 'lucide-react';
import { OllywoodLogo } from './OllywoodLogo';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onScrollTo: (id: string) => void;
  onOpenPos?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, onScrollTo }) => {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Journal', id: 'hero' },
    { label: 'Favourites', id: 'favourites' },
    { label: 'Menu Index', id: 'menu' },
    { label: 'Table Offers', id: 'offers' },
    { label: 'Chronicle', id: 'about' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Table Booking', id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    onScrollTo(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-[#1A1A1A] ${
        isScrolled
          ? 'bg-[#FDFCFB]/95 backdrop-blur-md py-3 shadow-xs'
          : 'bg-[#FDFCFB] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 flex items-center justify-between">
        {/* Brand Logo - Authentic Ollywood Food Café Mark */}
        <button
          id="nav-logo-btn"
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
            <OllywoodLogo size={44} showSlogan={false} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-[#1A1A1A] leading-tight font-serif">
                Ollywood
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E31E24]">
                Food Café
              </span>
            </div>
            <span className="text-[8px] uppercase tracking-[0.2em] text-[#1A1A1A]/60 font-mono">
              EST. BRAHMAPUR • ODISHA
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav id="desktop-nav-menu" className="hidden lg:flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.2em]">
          {navLinks.map((link) => (
            <button
              key={link.id}
              id={`nav-link-${link.id}`}
              onClick={() => handleNavClick(link.id)}
              className="text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:opacity-100 transition-opacity relative group py-1"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[#1A1A1A] transition-all duration-200 group-hover:w-full" />
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Direct Phone link */}
          <a
            id="nav-phone-link"
            href="tel:+919078266680"
            className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] font-semibold border border-[#1A1A1A] px-3 py-1.5 rounded-full hover:bg-[#1A1A1A] hover:text-white transition-colors"
            title="Call Ollywood Kitchen"
          >
            <Phone className="w-3 h-3" />
            <span>+91 90782 66680</span>
          </a>

          {/* Theme Mode Toggle (Light / Dark / System Auto) */}
          <ThemeToggle />

          {/* Cart Trigger */}
          <button
            id="nav-cart-btn"
            onClick={onOpenCart}
            aria-label="View Cart"
            className="relative w-9 h-9 rounded-full border border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span
                id="nav-cart-badge"
                className="absolute -top-1.5 -right-1.5 bg-[#1A1A1A] text-white text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center border border-[#FDFCFB]"
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Book Table / Order CTA */}
          <button
            id="nav-reserve-cta"
            onClick={() => handleNavClick('contact')}
            className="hidden sm:inline-flex items-center text-[11px] uppercase tracking-[0.2em] font-semibold bg-[#1A1A1A] text-white px-4 py-2 border border-[#1A1A1A] hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Reserve Table
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 border border-[#1A1A1A] text-[#1A1A1A]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden bg-[#FDFCFB] border-b border-[#1A1A1A] px-6 py-6 transition-all">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`mobile-link-${link.id}`}
                onClick={() => handleNavClick(link.id)}
                className="text-left font-serif text-lg tracking-tight text-[#1A1A1A] py-2 border-b border-[#1A1A1A]/10 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-xs font-mono text-[#1A1A1A]/40">→</span>
              </button>
            ))}
            {/* Mobile Theme Selector */}
            <div className="pt-2 pb-1 border-t border-[#1A1A1A]/10">
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block mb-2 font-semibold">
                Color Theme (System Sync)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`py-2 px-2 text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white dark:bg-white dark:text-black dark:border-white'
                      : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`py-2 px-2 text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white dark:bg-white dark:text-black dark:border-white'
                      : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark</span>
                </button>

                <button
                  onClick={() => setTheme('system')}
                  className={`py-2 px-2 text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    theme === 'system'
                      ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white dark:bg-white dark:text-black dark:border-white'
                      : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-neutral-400" />
                  <span>System</span>
                </button>
              </div>
            </div>

            <div className="pt-3 flex flex-col gap-2.5">
              <a
                href="tel:+919078266680"
                className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] border border-[#1A1A1A] py-2.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Kitchen: +91 90782 66680</span>
              </a>
              <button
                onClick={() => handleNavClick('contact')}
                className="w-full bg-[#1A1A1A] text-white py-3 font-semibold text-xs tracking-[0.2em] uppercase text-center"
              >
                Reserve a Table
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
