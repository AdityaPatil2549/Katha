import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Sparkles } from 'lucide-react';

export function PwaUpdatePrompt() {
  const [show, setShow] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      setShow(true);
    },
    onOfflineReady() {}
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setShow(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await updateServiceWorker(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[100] w-[min(400px,calc(100vw-3rem))] rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(20,22,35,0.95), rgba(10,11,18,0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 30px rgba(139,92,246,0.15)'
          }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="font-bold text-white text-base tracking-wide">Update Available</h3>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                  A fresh version of Katha is ready. Updating takes just a second and your data stays safe on-device.
                </p>
              </div>
              <button
                onClick={() => setShow(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShow(false)}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              >
                Not Now
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg hover:shadow-violet-500/25 border border-white/10"
              >
                {isUpdating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {isUpdating ? 'Updating...' : 'Update Katha'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
