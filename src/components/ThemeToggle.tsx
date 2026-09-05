import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, effectiveTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      mode: 'light',
      label: 'Light',
      desc: 'Editorial Paper Theme',
      icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      mode: 'dark',
      label: 'Dark',
      desc: 'Obsidian Hearth Theme',
      icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
    },
    {
      mode: 'system',
      label: 'System',
      desc: `Auto (Currently ${effectiveTheme})`,
      icon: <Laptop className="w-3.5 h-3.5 text-neutral-400" />,
    },
  ];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="theme-mode-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full border border-neutral-800 dark:border-neutral-700 bg-transparent flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer relative"
        title={`Theme: ${theme.toUpperCase()} (Effective: ${effectiveTheme}). Click to change.`}
        aria-label="Toggle light, dark, or system theme"
      >
        {effectiveTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-amber-400 dark:text-amber-300 transition-transform rotate-0 scale-100" />
        ) : (
          <Sun className="w-4 h-4 text-amber-600 transition-transform rotate-0 scale-100" />
        )}

        {/* Small badge if set to system */}
        {theme === 'system' && (
          <span
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[8px] flex items-center justify-center font-mono font-bold ring-1 ring-white dark:ring-neutral-900"
            title="System theme tracking active"
          >
            A
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="theme-dropdown-menu"
          className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#1C1C1C] py-1.5 z-50 text-xs font-mono animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold">
            Color Theme
          </div>

          {options.map((opt) => {
            const isSelected = theme === opt.mode;
            return (
              <button
                key={opt.mode}
                id={`theme-opt-${opt.mode}`}
                onClick={() => {
                  setTheme(opt.mode);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer ${
                  isSelected
                    ? 'font-bold text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800/40'
                    : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 flex items-center justify-center">
                    {opt.icon}
                  </div>
                  <div>
                    <span className="block leading-tight text-xs font-medium">{opt.label}</span>
                    <span className="block text-[9px] text-neutral-400 leading-tight">
                      {opt.desc}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
