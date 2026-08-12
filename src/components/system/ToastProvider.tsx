import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

// Global reference for non-React files
type ToastFunction = (message: string, type?: ToastType) => void;
export const globalToast: { current: ToastFunction | null } = { current: null };
export const toast = (message: string, type?: ToastType) => {
  if (globalToast.current) {
    globalToast.current(message, type);
  } else {
    console.warn('Toast called before ToastProvider was mounted:', message);
  }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Set global reference
  React.useEffect(() => {
    globalToast.current = addToast;
    return () => {
      globalToast.current = null;
    };
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`
                pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-[1.25rem] shadow-glass backdrop-blur-xl border
                ${toast.type === 'success' ? 'bg-accent-emerald/10 border-accent-emerald/30' : ''}
                ${toast.type === 'error' ? 'bg-accent-rose/10 border-accent-rose/30' : ''}
                ${toast.type === 'info' ? 'bg-midnight-surface/80 border-midnight-border/50' : ''}
              `}
            >
              <div className="shrink-0">
                {toast.type === 'success' && <Check className="w-5 h-5 text-accent-emerald" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-accent-rose" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-accent-cyan" />}
              </div>
              
              <p className="font-sans text-sm tracking-wide text-text-primary pr-6">
                {toast.message}
              </p>

              <button
                onClick={() => removeToast(toast.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
