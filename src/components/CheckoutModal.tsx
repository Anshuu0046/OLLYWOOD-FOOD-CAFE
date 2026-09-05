import React, { useState } from 'react';
import { X, Phone, User, Mail, CreditCard, Banknote, ShieldCheck, Check, Sparkles, ReceiptText } from 'lucide-react';
import { CartItem, OfferCoupon, OrderDetails } from '../types';
import { addPosOrder, getNextKotNumber } from '../services/posService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  instructions: string;
  appliedCoupon: OfferCoupon | null;
  onOrderSuccess: (order: OrderDetails) => void;
}

const COMMON_TABLES = [
  'Hall T-01',
  'Hall T-02',
  'Hall T-03',
  'Hall T-04',
  'Hall T-05',
  'Hall T-06',
  'AC Cabin 01',
  'Rooftop 01',
  'Family Lounge 01',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  instructions,
  appliedCoupon,
  onOrderSuccess,
}) => {
  const [tableNumber, setTableNumber] = useState('Hall T-01');
  const [customTable, setCustomTable] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card' | 'Pay at Cashier Desk'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon && subtotal >= (appliedCoupon.minOrder || 0)) {
    if (appliedCoupon.discountType === 'flat') {
      discountAmount = appliedCoupon.discountValue;
    } else if (appliedCoupon.discountType === 'percent') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxes = Math.round(discountedSubtotal * 0.05);
  const total = discountedSubtotal + taxes;

  const effectiveTable = customTable.trim() ? customTable.trim() : tableNumber;

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!effectiveTable) errors.table = 'Please specify your table number';
    if (!name.trim() || name.trim().length < 2) errors.name = 'Please enter guest name (minimum 2 letters)';
    
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Enter valid 10-digit mobile number (starts with 6, 7, 8, or 9)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const kotNumber = getNextKotNumber();
      const orderId = `OW-${Math.floor(10000 + Math.random() * 90000)}`;
      
      const newOrder: OrderDetails = {
        orderId,
        kotNumber,
        tableNumber: effectiveTable,
        customerName: name.trim(),
        customerPhone: phone.trim().replace(/\D/g, ''),
        customerEmail: email.trim() || undefined,
        paymentMethod,
        paymentStatus: paymentMethod === 'UPI' || paymentMethod === 'Card' ? 'Paid' : 'Unpaid',
        instructions: instructions.trim() || undefined,
        items: [...cartItems],
        subtotal,
        discount: discountAmount,
        taxes,
        total,
        status: 'Received',
        createdAt: new Date().toISOString(),
        isDineIn: true,
      };

      // Automatically send to POS system & backend server
      const created = await addPosOrder(newOrder);

      setIsSubmitting(false);
      onOrderSuccess(created);
    } catch (err) {
      console.error('Order submission error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFCFB] text-[#1A1A1A] w-full max-w-xl border border-[#1A1A1A] overflow-hidden my-6 shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-5 bg-[#FDFCFB] border-b border-[#1A1A1A] flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] font-mono text-[#1A1A1A]/60 block flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1b6d24] animate-ping" />
              In-Cafe Dine-In Terminal
            </span>
            <h3 className="font-serif italic text-2xl font-bold text-[#1A1A1A]">
              Place Order for Table
            </h3>
          </div>
          <button
            id="close-checkout-modal-btn"
            onClick={onClose}
            className="p-1.5 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
          
          {/* Table Selection */}
          <div className="p-4 border border-[#1A1A1A] bg-[#E8E6E1]/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-[#1A1A1A]">
                1. Select Table Number *
              </label>
              <span className="text-[10px] font-mono text-[#1b6d24] font-bold">
                Assigned: {effectiveTable}
              </span>
            </div>

            {/* Quick table selector buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 font-mono">
              {COMMON_TABLES.map((tbl) => {
                const isSelected = tableNumber === tbl && !customTable;
                return (
                  <button
                    key={tbl}
                    type="button"
                    onClick={() => {
                      setTableNumber(tbl);
                      setCustomTable('');
                    }}
                    className={`py-2 px-1.5 text-xs text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white font-bold shadow-sm'
                        : 'border-[#1A1A1A]/30 bg-[#FDFCFB] text-[#1A1A1A] hover:border-[#1A1A1A]'
                    }`}
                  >
                    {tbl}
                  </button>
                );
              })}
            </div>

            {/* Custom table / booth input */}
            <div className="pt-1">
              <input
                id="custom-table-input"
                type="text"
                placeholder="Or enter custom table (e.g. Table 12, Booth B, Terrace 03)..."
                value={customTable}
                onChange={(e) => setCustomTable(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FDFCFB] border border-[#1A1A1A]/40 font-mono text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
              {formErrors.table && <p className="text-[10px] font-mono text-[#9E2A2B] mt-1">{formErrors.table}</p>}
            </div>
          </div>

          {/* Customer Particulars */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/70">
              2. Guest Contact & Receipt Info
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="customer-name-input"
                    type="text"
                    required
                    placeholder="e.g. Soumya Ranjan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[#FDFCFB] border border-[#1A1A1A] font-mono focus:outline-none focus:bg-[#E8E6E1]/20"
                  />
                </div>
                {formErrors.name && <p className="text-[10px] font-mono text-[#9E2A2B] mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1">
                  WhatsApp Number (10 digits) *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="customer-phone-input"
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9437123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[#FDFCFB] border border-[#1A1A1A] font-mono focus:outline-none focus:bg-[#E8E6E1]/20"
                  />
                </div>
                {formErrors.phone && <p className="text-[10px] font-mono text-[#9E2A2B] mt-1">{formErrors.phone}</p>}
                <p className="text-[9px] font-mono text-[#1A1A1A]/50 mt-1">
                  E-bill &amp; PDF link sent here automatically (no manual popup)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1">
                Email for Tax Invoice &amp; Bill PDF (Optional)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="customer-email-input"
                  type="email"
                  placeholder="soumya@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#FDFCFB] border border-[#1A1A1A] font-mono focus:outline-none focus:bg-[#E8E6E1]/20"
                />
              </div>
              <p className="text-[9px] font-mono text-[#1A1A1A]/50 mt-1">
                Official Bill PDF will be emailed directly to your inbox
              </p>
            </div>

            {/* Automated Dispatch Guarantee Banner */}
            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 text-[10px] font-mono text-[#1A1A1A] dark:text-neutral-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
              <span>
                <strong>Automated Delivery:</strong> Bill PDF &amp; order receipt dispatch in the background — no manual WhatsApp popups required.
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2 pt-1">
            <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/70">
              3. Payment Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <button
                type="button"
                id="pay-method-upi"
                onClick={() => setPaymentMethod('UPI')}
                className={`py-2 px-2 border text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'UPI'
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                    : 'border-[#1A1A1A]/30 bg-[#FDFCFB] text-[#1A1A1A] hover:border-[#1A1A1A]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px]">UPI / QR</span>
              </button>

              <button
                type="button"
                id="pay-method-cash"
                onClick={() => setPaymentMethod('Cash')}
                className={`py-2 px-2 border text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'Cash'
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                    : 'border-[#1A1A1A]/30 bg-[#FDFCFB] text-[#1A1A1A] hover:border-[#1A1A1A]'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span className="text-[10px]">Cash at Table</span>
              </button>

              <button
                type="button"
                id="pay-method-card"
                onClick={() => setPaymentMethod('Card')}
                className={`py-2 px-2 border text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'Card'
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                    : 'border-[#1A1A1A]/30 bg-[#FDFCFB] text-[#1A1A1A] hover:border-[#1A1A1A]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px]">Card POS</span>
              </button>

              <button
                type="button"
                id="pay-method-counter"
                onClick={() => setPaymentMethod('Pay at Cashier Desk')}
                className={`py-2 px-2 border text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'Pay at Cashier Desk'
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                    : 'border-[#1A1A1A]/30 bg-[#FDFCFB] text-[#1A1A1A] hover:border-[#1A1A1A]'
                }`}
              >
                <ReceiptText className="w-4 h-4" />
                <span className="text-[10px]">Cashier Counter</span>
              </button>
            </div>
          </div>

          {/* POS Auto-Sync Banner */}
          <div className="p-3 border border-[#1A1A1A] bg-[#1A1A1A] text-[#FDFCFB] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-white/70 block">Kitchen POS Relay</span>
                <span className="font-bold text-xs">Auto-Prints KOT & Alerts Station</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-white/60 block">Table Bill</span>
              <span className="text-sm font-bold text-amber-300">₹{total}</span>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex gap-3 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#FDFCFB] border border-[#1A1A1A] text-[#1A1A1A] text-[10px] uppercase tracking-[0.2em] hover:bg-[#E8E6E1]/40 transition-colors cursor-pointer"
            >
              Back to Table
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="confirm-place-order-btn"
              className="flex-2 py-3 bg-[#1A1A1A] text-white border border-[#1A1A1A] text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Transmitting to POS...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Send Order to POS (₹{total})</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
