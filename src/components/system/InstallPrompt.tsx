import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  const canShow = useMemo(() => {
    return Boolean(event) && !dismissed;
  }, [event, dismissed]);

  const handleInstall = async () => {
    if (!event) return;
    setIsInstalling(true);
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === 'accepted') {
      setDismissed(true);
    }
    setIsInstalling(false);
  };

  return (
    <AnimatePresence>
      {canShow && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-6 z-[100] w-[min(400px,calc(100vw-3rem))] rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(20,22,35,0.95), rgba(10,11,18,0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 30px rgba(34,211,238,0.15)'
          }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-white text-base tracking-wide">Install Katha</h3>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                  Add Katha to your home screen for a calmer, app-like experience and reliable offline access.
                </p>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDismissed(true)}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              >
                Maybe Later
              </button>
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/25 border border-white/10"
              >
                {isInstalling ? (
                  <Download className="w-4 h-4 animate-bounce" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isInstalling ? 'Installing...' : 'Install App'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
