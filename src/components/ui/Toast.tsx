import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useToastStore, type Toast } from '@/store/toastStore';

const toastConfig = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-accent-emerald" />,
    bg: 'bg-accent-emerald/10 border-accent-emerald/20',
    text: 'text-accent-emerald',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-accent-rose" />,
    bg: 'bg-accent-rose/10 border-accent-rose/20',
    text: 'text-accent-rose',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-accent-amber" />,
    bg: 'bg-accent-amber/10 border-accent-amber/20',
    text: 'text-accent-amber',
  },
  info: {
    icon: <Info className="w-5 h-5 text-accent-cyan" />,
    bg: 'bg-accent-cyan/10 border-accent-cyan/20',
    text: 'text-accent-cyan',
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((state) => state.removeToast);
  const config = toastConfig[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 px-4 py-3 rounded-card border backdrop-blur-md shadow-glow-sm ${config.bg}`}
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <p className={`text-small font-medium ${config.text}`}>{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-auto p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className={`w-4 h-4 ${config.text}`} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
