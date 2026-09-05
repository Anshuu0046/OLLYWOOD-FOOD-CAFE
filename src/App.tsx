import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CustomerFavourites } from './components/CustomerFavourites';
import { MenuSection } from './components/MenuSection';
import { OffersSection } from './components/OffersSection';
import { AboutSection } from './components/AboutSection';
import { GallerySection } from './components/GallerySection';
import { ContactAndReservation } from './components/ContactAndReservation';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { PosTerminalModal } from './components/PosTerminalModal';
import { StaffPinModal } from './components/StaffPinModal';
import { Toast } from './components/Toast';
import { MenuItem, CartItem, OfferCoupon, OrderDetails } from './types';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPosOpen, setIsPosOpen] = useState(false);
  const [isStaffPinOpen, setIsStaffPinOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderDetails | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<OfferCoupon | null>(null);
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Allow restaurant staff to access terminal directly with ?staff=true or #staff in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('staff') === 'true' || window.location.hash === '#staff') {
      setIsStaffPinOpen(true);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          type: item.type,
          quantity: 1,
        },
      ];
    });
    showToast(`Added "${item.name}" to cart`);
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((ci) => {
          if (ci.id === id) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (id: number) => {
    const item = cartItems.find((ci) => ci.id === id);
    setCartItems((prev) => prev.filter((ci) => ci.id !== id));
    if (item) {
      showToast(`Removed "${item.name}" from cart`);
    }
  };

  const handleApplyCoupon = (coupon: OfferCoupon | null) => {
    setAppliedCoupon(coupon);
    if (coupon) {
      showToast(`Promo code "${coupon.code}" applied!`);
    }
  };

  const handleProceedToCheckout = (instructions: string) => {
    setCookingInstructions(instructions);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: OrderDetails) => {
    setActiveOrder(order);
    setIsCheckoutOpen(false);
    setCartItems([]);
    setAppliedCoupon(null);
    setCookingInstructions('');
    showToast(`Order #${order.orderId} successfully placed!`);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -70;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFB] text-[#1A1A1A] font-serif selection:bg-[#1A1A1A] selection:text-[#FDFCFB]">
      {/* Fixed Navigation Header */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onScrollTo={scrollToSection}
      />

      {/* Main Page Sections */}
      <main className="flex-1">
        <Hero
          onExploreMenu={() => scrollToSection('menu')}
          onBookTable={() => scrollToSection('contact')}
        />

        <CustomerFavourites
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
        />

        <MenuSection
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onOpenCart={() => setIsCartOpen(true)}
        />

        <OffersSection
          onApplyCouponToCart={(coupon) => {
            handleApplyCoupon(coupon);
            setIsCartOpen(true);
          }}
        />

        <AboutSection />

        <GallerySection />

        <ContactAndReservation onShowToast={showToast} />
      </main>

      {/* Comprehensive Footer with Discreet Staff Portal Link */}
      <Footer
        onScrollTo={scrollToSection}
        onOpenStaffPortal={() => setIsStaffPinOpen(true)}
      />

      {/* Interactive Cart Slide-over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onProceedToCheckout={handleProceedToCheckout}
        onBrowseMenu={() => scrollToSection('menu')}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        instructions={cookingInstructions}
        appliedCoupon={appliedCoupon}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmation & Soft Copy Receipt Modal */}
      <OrderConfirmationModal
        order={activeOrder}
        onClose={() => setActiveOrder(null)}
      />

      {/* Protected Kitchen & Staff POS Terminal Modal (Staff Only) */}
      <PosTerminalModal
        isOpen={isPosOpen}
        onClose={() => setIsPosOpen(false)}
        onSelectOrderForReceipt={(ord) => setActiveOrder(ord)}
      />

      {/* Staff Security PIN Gate for Kitchen Terminal */}
      <StaffPinModal
        isOpen={isStaffPinOpen}
        onClose={() => setIsStaffPinOpen(false)}
        onSuccess={() => {
          setIsStaffPinOpen(false);
          setIsPosOpen(true);
        }}
      />

      {/* Toast Feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
