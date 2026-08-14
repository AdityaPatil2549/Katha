import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  className?: string;
}

export function Dropdown({ value, onChange, options, className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
      }
    }
  };

  // Select focused option on Enter when open
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < options.length) {
        e.preventDefault();
        const selected = options[focusedIndex];
        if (selected) {
          onChange(selected.value);
        }
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleGlobalKeyDown);
    }
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, focusedIndex, options, onChange]);

  // Reset focus when opened
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex(o => o.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen, value, options]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`flex items-center justify-between gap-3 px-5 py-3.5 bg-midnight-surface/40 border border-midnight-border/50 rounded-xl text-primary font-medium hover:bg-midnight-surface transition-all duration-300 backdrop-blur-md shadow-sm min-w-[160px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 ${isOpen ? 'border-accent-cyan/50 bg-midnight-surface/80 ring-2 ring-accent-cyan/10 shadow-[0_0_20px_rgba(45,212,191,0.1)]' : ''} ${className}`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown className={`w-4 h-4 text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent-cyan' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 w-full min-w-max bg-midnight-bg/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-[999]"
          >
            <div 
              role="listbox" 
              className="max-h-[280px] overflow-y-auto scrollbar-hide py-2"
            >
              {options.map((option, idx) => {
                const isSelected = value === option.value;
                const isFocused = focusedIndex === idx;

                return (
                  <button
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-all duration-200 ${
                      isSelected
                        ? 'bg-accent-cyan/10 text-accent-cyan font-semibold'
                        : isFocused
                        ? 'bg-white/5 text-primary'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="w-4 h-4 text-accent-cyan" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
