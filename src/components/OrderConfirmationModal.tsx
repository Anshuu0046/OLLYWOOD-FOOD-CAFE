import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Phone, 
  ChefHat, 
  X, 
  Printer, 
  Share2, 
  Receipt, 
  FileDown, 
  Mail, 
  MessageSquare, 
  Check, 
  RefreshCw,
  ExternalLink,
  Utensils 
} from 'lucide-react';
import { OllywoodLogo } from './OllywoodLogo';
import { OrderDetails } from '../types';
import { generateWhatsAppReceiptUrl } from '../services/posService';
import { downloadBillPdf } from '../utils/billPdfGenerator';

interface OrderConfirmationModalProps {
  order: OrderDetails | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (!order) return null;

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    try {
      downloadBillPdf(order);
    } catch (err) {
      console.error('PDF download error:', err);
      // Fallback to server stream
      window.open(`/api/orders/${order.orderId}/pdf`, '_blank');
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 800);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleManualWhatsAppOpen = () => {
    // Only opened when user explicitly clicks the optional link
    const url = generateWhatsAppReceiptUrl(order);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareOrCopy = () => {
    const text = `Ollywood Food Cafe - Official Dine-In Receipt\n` +
      `Order: ${order.orderId} | KOT: #${order.kotNumber}\n` +
      `Table: ${order.tableNumber}\n` +
      `Guest: ${order.customerName} (${order.customerPhone})\n` +
      `Total: ₹${order.total}\n` +
      `Payment: ${order.paymentMethod} (${order.paymentStatus || 'Paid'})\n` +
      `Bill PDF: ${window.location.origin}/api/orders/${order.orderId}/pdf`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleResendReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setIsResending(true);
    try {
      const res = await fetch(`/api/orders/${order.orderId}/send-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      if (res.ok) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Resend failed:', err);
    } finally {
      setIsResending(false);
    }
  };

  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1A1A1A]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-[#FDFCFB] text-[#1A1A1A] w-full max-w-xl border border-[#1A1A1A] overflow-hidden my-4 shadow-2xl print:border-none print:shadow-none print:my-0 print:max-w-none">
        
        {/* Top Header - In Cafe Confirmation */}
        <div className="bg-[#1A1A1A] text-white p-5 sm:p-6 text-center relative border-b border-[#1A1A1A] print:hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-[#1b6d24] text-white text-[10px] font-mono uppercase tracking-[0.2em] px-2.5 py-1 mb-2 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Sent to Kitchen POS System
          </div>

          <h3 className="font-serif italic text-2xl sm:text-3xl font-bold">
            Order Confirmed & Relayed
          </h3>
          <p className="text-xs text-[#D1CFCA] mt-1 font-serif max-w-md mx-auto">
            Your table order has been dispatched directly to the Ollywood kitchen terminal. Preparation starts immediately.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <div className="border border-white/30 bg-white/10 px-3 py-1 font-mono text-xs text-white">
              <span className="opacity-60">Table: </span>
              <strong className="text-amber-300 font-bold">{order.tableNumber}</strong>
            </div>
            <div className="border border-white/30 bg-white/10 px-3 py-1 font-mono text-xs text-white">
              <span className="opacity-60">KOT Ticket: </span>
              <strong className="text-white font-bold">#{order.kotNumber}</strong>
            </div>
            <div className="border border-white/30 bg-white/10 px-3 py-1 font-mono text-xs text-white">
              <span className="opacity-60">Order Ref: </span>
              <strong className="text-white font-bold">{order.orderId}</strong>
            </div>
          </div>
        </div>

        {/* Live Kitchen Status Stepper */}
        <div className="p-4 sm:p-5 border-b border-[#1A1A1A] bg-[#E8E6E1]/20 print:hidden">
          <div className="flex items-center justify-between mb-3 font-mono">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/70 flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-[#1A1A1A]" />
              Kitchen Station Status
            </span>
            <span className="text-xs font-bold text-[#1b6d24] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Est. Serving: 15–20 Mins
            </span>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            {/* Step 1: Received */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 border border-[#1A1A1A] bg-[#1A1A1A] text-white flex items-center justify-center text-xs mb-1">
                ✓
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A] font-bold">POS Logged</span>
            </div>

            {/* Step 2: Preparing */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 border border-[#1A1A1A] bg-amber-400 text-[#1A1A1A] flex items-center justify-center text-xs mb-1 animate-pulse">
                <ChefHat className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A] font-bold">Kitchen Hearth</span>
            </div>

            {/* Step 3: Plated */}
            <div className="flex flex-col items-center opacity-40">
              <div className="w-7 h-7 border border-[#1A1A1A] bg-[#FDFCFB] text-[#1A1A1A] flex items-center justify-center text-xs mb-1">
                <Utensils className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A]">Plating</span>
            </div>

            {/* Step 4: Served */}
            <div className="flex flex-col items-center opacity-40">
              <div className="w-7 h-7 border border-[#1A1A1A] bg-[#FDFCFB] text-[#1A1A1A] flex items-center justify-center text-xs mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A]">Served at Table</span>
            </div>
          </div>
        </div>

        {/* ================= SOFT COPY DIGITAL RECEIPT ================= */}
        <div id="customer-soft-copy-receipt" className="p-5 sm:p-6 bg-[#FDFCFB]">
          
          {/* Printable Receipt Paper Container */}
          <div className="border-2 border-dashed border-[#1A1A1A]/40 p-4 sm:p-6 bg-[#FAF9F5] font-mono text-xs relative shadow-inner">
            
            {/* Soft copy header watermarking with Authentic Brand Logo */}
            <div className="text-center pb-4 border-b border-[#1A1A1A] space-y-1.5">
              <div className="flex items-center justify-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#1A1A1A]" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A] font-bold">
                  Official Soft Copy Receipt
                </span>
              </div>
              <div className="py-1 flex justify-center">
                <OllywoodLogo size={68} showSlogan={false} />
              </div>
              <h2 className="font-serif italic text-2xl font-bold tracking-tight text-[#1A1A1A]">
                Ollywood Food Café
              </h2>
              <p className="text-[10px] text-[#1A1A1A]/80 italic">
                "The Taste That Everybody Loves To Taste"
              </p>
              <p className="text-[10px] text-[#1A1A1A]/70 uppercase tracking-wider">
                Ayodhya Nagar, Brahmapur, Odisha 760008 • Ph: +91 90782 66680
              </p>
              <p className="text-[9px] text-[#1A1A1A]/50">
                GSTIN: 21AAAFO9481M1Z5 • FSSAI Lic: 12023034000192
              </p>
            </div>

            {/* Table & Customer Metadata Grid */}
            <div className="py-3 border-b border-[#1A1A1A]/20 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[#1A1A1A]/60 block text-[9px] uppercase">Table Number</span>
                <strong className="text-sm text-[#1A1A1A]">{order.tableNumber}</strong>
              </div>
              <div className="text-right">
                <span className="text-[#1A1A1A]/60 block text-[9px] uppercase">KOT Number</span>
                <strong className="text-sm text-[#1A1A1A]">#{order.kotNumber}</strong>
              </div>
              <div>
                <span className="text-[#1A1A1A]/60 block text-[9px] uppercase">Customer</span>
                <span className="text-[#1A1A1A] font-semibold">{order.customerName}</span>
                <span className="text-[#1A1A1A]/70 block text-[10px]">+91 {order.customerPhone}</span>
              </div>
              <div className="text-right">
                <span className="text-[#1A1A1A]/60 block text-[9px] uppercase">Date & Time</span>
                <span className="text-[#1A1A1A]">{orderDate}</span>
                <span className="text-[#1A1A1A]/70 block text-[10px]">{orderTime}</span>
              </div>
            </div>

            {/* Order Note if any */}
            {order.instructions && (
              <div className="py-2 border-b border-[#1A1A1A]/20 text-[10px] text-[#1A1A1A]/80">
                <span className="font-bold text-[#1A1A1A]">Special Prep Note: </span>
                <span>"{order.instructions}"</span>
              </div>
            )}

            {/* Itemized Plate Table */}
            <div className="py-3 space-y-2 border-b border-[#1A1A1A]">
              <div className="flex justify-between text-[10px] uppercase font-bold text-[#1A1A1A]/60 pb-1 border-b border-[#1A1A1A]/10">
                <span>Item & Portion</span>
                <span>Qty × Rate</span>
                <span>Total</span>
              </div>

              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs py-0.5">
                  <div className="flex-1 pr-2 truncate">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${item.type === 'Veg' ? 'bg-[#1b6d24]' : 'bg-[#9E2A2B]'}`} />
                    <span className="font-serif font-bold text-[#1A1A1A]">{item.name}</span>
                  </div>
                  <div className="text-[#1A1A1A]/70 text-[11px] w-20 text-center">
                    {item.quantity} × ₹{item.price}
                  </div>
                  <div className="font-bold text-[#1A1A1A] w-14 text-right">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="py-3 space-y-1 text-xs">
              <div className="flex justify-between text-[#1A1A1A]/70">
                <span>Subtotal ({order.items.reduce((s, i) => s + i.quantity, 0)} plates)</span>
                <span>₹{order.subtotal}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-[#1b6d24]">
                  <span>Table Privilege Concession</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}

              <div className="flex justify-between text-[#1A1A1A]/70">
                <span>CGST (2.5%) + SGST (2.5%)</span>
                <span>₹{order.taxes}</span>
              </div>

              <div className="flex justify-between text-[#1A1A1A]/70">
                <span>Service & Table Charges</span>
                <span className="text-[#1b6d24]">NIL</span>
              </div>

              <div className="pt-2 border-t border-[#1A1A1A] flex justify-between items-center font-bold text-sm text-[#1A1A1A]">
                <span className="font-serif italic text-base">Grand Total</span>
                <span className="text-base font-mono">₹{order.total}</span>
              </div>

              <div className="pt-1 flex justify-between items-center text-[10px] text-[#1A1A1A]/70">
                <span>Payment Mode: <strong>{order.paymentMethod}</strong></span>
                <span className={`px-2 py-0.5 border text-[9px] uppercase font-bold ${
                  order.paymentStatus === 'Paid'
                    ? 'border-[#1b6d24] text-[#1b6d24] bg-[#1b6d24]/10'
                    : 'border-amber-600 text-amber-700 bg-amber-50'
                }`}>
                  {order.paymentStatus === 'Paid' ? 'PAID' : 'PAY AT TABLE / COUNTER'}
                </span>
              </div>
            </div>

            {/* Footer QR & Verification */}
            <div className="pt-4 border-t border-[#1A1A1A] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] text-[#1A1A1A]/60 block uppercase tracking-wider">
                  POS Auto-Relay ID:
                </span>
                <span className="text-[10px] font-bold text-[#1A1A1A] block">
                  {order.orderId}
                </span>
                <span className="text-[8px] text-[#1A1A1A]/50 block">
                  Thank you for dining at Ollywood Cafe!
                </span>
              </div>

              {/* Decorative mini barcode / hash block */}
              <div className="text-right">
                <div className="inline-block p-1 bg-white border border-[#1A1A1A]">
                  <div className="w-12 h-12 bg-[#1A1A1A] flex items-center justify-center text-white text-[8px] font-mono text-center leading-tight">
                    POS<br />KOT<br />#{order.kotNumber}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Automated Receipt Notification Card */}
          <div className="mt-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-[11px] font-mono text-emerald-950 dark:text-emerald-100 space-y-2 print:hidden">
            <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/60 pb-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Automated e-Bill &amp; Tax Invoice Dispatched</span>
              </div>
              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-emerald-600 text-white font-bold rounded-xs">
                Automated
              </span>
            </div>

            <div className="space-y-1 text-[10px] text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
              <div className="flex items-start gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>WhatsApp:</strong> Sent automatically to <strong>+91 {order.customerPhone}</strong> with order summary and direct Bill PDF link.
                </span>
              </div>

              <div className="flex items-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Email:</strong> {order.customerEmail ? (
                    <span>Tax invoice &amp; Bill PDF sent to <strong>{order.customerEmail}</strong>.</span>
                  ) : (
                    <span className="italic text-neutral-600 dark:text-neutral-400">Not provided at checkout (you can enter below or download directly).</span>
                  )}
                </span>
              </div>
            </div>

            <p className="text-[9px] text-emerald-800/70 dark:text-emerald-300/70 pt-0.5">
              * The bill was sent automatically via cloud server without requiring manual WhatsApp app pop-ups.
            </p>
          </div>

          {/* Action Tools: Download Official Bill PDF, Print, Share */}
          <div className="mt-4 space-y-2.5 font-mono print:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleDownloadPdf}
                id="download-bill-pdf-btn"
                disabled={isDownloadingPdf}
                className="py-3 px-4 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-[10px] uppercase tracking-[0.2em] font-semibold border border-[#1A1A1A] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <FileDown className="w-4 h-4 text-amber-400" />
                <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Official Bill (PDF)'}</span>
              </button>

              <button
                onClick={handlePrint}
                id="print-receipt-btn"
                className="py-3 px-4 bg-[#FDFCFB] hover:bg-[#E8E6E1]/40 text-[#1A1A1A] text-[10px] uppercase tracking-[0.2em] font-semibold border border-[#1A1A1A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Physical Copy</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleShareOrCopy}
                id="share-receipt-btn"
                className="w-full py-2 px-3 bg-[#FDFCFB] hover:bg-[#E8E6E1]/20 text-[#1A1A1A] text-[10px] uppercase tracking-[0.15em] border border-[#1A1A1A]/40 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#1A1A1A]/70" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Digital Receipt Summary'}</span>
              </button>
            </div>

            {/* Optional Email delivery or re-dispatch */}
            {!order.customerEmail && (
              <form onSubmit={handleResendReceipt} className="p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="email"
                  placeholder="Enter email to receive Bill PDF..."
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full sm:flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-950 border border-neutral-400 dark:border-neutral-700 font-mono text-[#1A1A1A] dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isResending || !resendEmail.trim()}
                  className="w-full sm:w-auto px-3 py-1.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-wider font-mono hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isResending ? 'Sending...' : 'Send Bill PDF'}
                </button>
              </form>
            )}

            {resendSuccess && (
              <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 text-center">
                ✓ Official Bill PDF sent to {resendEmail}!
              </p>
            )}

            {/* Optional manual WhatsApp link for users who specifically prefer manual chat history */}
            <div className="text-center pt-1">
              <button
                onClick={handleManualWhatsAppOpen}
                className="text-[10px] font-mono text-[#1A1A1A]/60 dark:text-neutral-400 hover:text-[#1A1A1A] dark:hover:text-white inline-flex items-center gap-1 underline transition-colors cursor-pointer"
              >
                <span>Optional: Prefer opening summary directly in WhatsApp Web?</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Kitchen Live Status Note */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-950 dark:text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                <span>Kitchen Ticket KOT #{order.kotNumber} received by chefs. Food is being prepared fresh.</span>
              </div>
              <span className="font-mono text-[9px] font-bold uppercase bg-amber-600 text-white px-2 py-0.5 shrink-0 ml-2">Cooking</span>
            </div>
          </div>

          <div className="mt-3 text-center print:hidden">
            <button
              onClick={onClose}
              id="return-to-cafe-menu-btn"
              className="text-xs font-mono text-[#1A1A1A]/60 hover:text-[#1A1A1A] underline transition-colors cursor-pointer"
            >
              ← Return to Cafe Table Menu
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
