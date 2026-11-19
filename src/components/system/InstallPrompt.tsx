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
          className="fixed bottom-24 md:bottom-6 left-4 md:left-6 z-[100] w-[min(400px,calc(100vw-2rem))] rounded-2xl overflow-hidden shadow-elevation bg-midnight-surface/95 backdrop-blur-xl border border-midnight-border"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-accent-cyan/15 flex items-center justify-center border border-accent-cyan/30">
                    <Smartphone className="w-4 h-4 text-accent-cyan" />
                  </div>
                  <h3 className="font-bold text-text-primary text-base tracking-wide">Install Katha</h3>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  Add Katha to your home screen for a calmer, app-like experience and reliable offline access.
                </p>
              </div>
              <button
                type="button"
                aria-label="Dismiss install prompt"
                onClick={() => setDismissed(true)}
                className="w-8 h-8 rounded-full bg-midnight-bg/60 hover:bg-midnight-surface-hover flex items-center justify-center text-text-muted hover:text-text-primary transition-colors border border-midnight-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-text-secondary hover:text-text-primary hover:bg-midnight-surface-hover transition-colors border border-midnight-border"
              >
                Maybe Later
              </button>
              <button
                type="button"
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-sky-700 hover:bg-sky-600 transition-all shadow-lg disabled:opacity-50"
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
