import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      id="app-toast"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1A1A1A] text-[#FDFCFB] px-5 py-3 border border-[#FDFCFB]/40 shadow-2xl font-mono text-xs max-w-md w-11/12 sm:w-auto"
    >
      <CheckCircle2 className="w-4 h-4 text-[#FDFCFB] shrink-0" />
      <span className="text-xs uppercase tracking-wider">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto text-white/60 hover:text-white p-1"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

