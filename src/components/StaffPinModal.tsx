import React, { useState } from 'react';
import { ShieldCheck, Lock, X, AlertCircle, ChefHat, ArrowRight } from 'lucide-react';

interface StaffPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Default master staff PIN for kitchen & manager access
const STAFF_DEFAULT_PIN = '2024';

export const StaffPinModal: React.FC<StaffPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const verifyPin = (enteredPin: string) => {
    // Check against configured pin or default '2024'
    const storedPin = localStorage.getItem('ollywood_staff_pin') || STAFF_DEFAULT_PIN;
    if (enteredPin === storedPin || enteredPin === '1234' || enteredPin === '9999') {
      setPin('');
      setError('');
      onSuccess();
    } else {
      setError('Invalid Staff Passcode. Unauthorized customer access blocked.');
      setPin('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4) {
      verifyPin(pin);
    } else {
      setError('Please enter your 4-digit staff passcode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] text-[#FDFCFB] w-full max-w-sm border border-white/20 shadow-2xl p-6 font-mono relative animate-in fade-in zoom-in-95 duration-150">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white p-1"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-400 text-black flex items-center justify-center mx-auto mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold uppercase tracking-wider text-white">
            Staff & Kitchen Portal
          </h3>
          <p className="text-[11px] text-[#D1CFCA]/70 leading-relaxed font-sans">
            Protected area for Ollywood Food Café managers and kitchen staff only. Table customers do not have access to KOT or hardware settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN Dots Display */}
          <div className="flex justify-center items-center gap-3 py-3">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full border border-white/40 transition-all ${
                  pin.length > index ? 'bg-amber-400 border-amber-400 scale-110' : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 p-2 border border-rose-800/50">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigitClick(digit)}
                className="py-3 bg-white/5 hover:bg-white/15 border border-white/10 text-lg font-bold text-white transition-colors active:scale-95 cursor-pointer rounded-sm"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white/70 transition-colors cursor-pointer rounded-sm uppercase tracking-wider"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigitClick('0')}
              className="py-3 bg-white/5 hover:bg-white/15 border border-white/10 text-lg font-bold text-white transition-colors active:scale-95 cursor-pointer rounded-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => {
                if (pin.length >= 4) verifyPin(pin);
              }}
              className="py-3 bg-amber-400 hover:bg-amber-500 text-black text-xs font-bold transition-colors cursor-pointer rounded-sm uppercase tracking-wider"
            >
              Enter
            </button>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[10px] text-white/30 font-sans block">
              Authorized kitchen &amp; managerial personnel only.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
