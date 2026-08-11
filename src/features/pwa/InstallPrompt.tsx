import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Zap, Shield } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    const dismissedAt = localStorage.getItem('katha-install-dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      return Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000;
    }
    return false;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 5 seconds if not dismissed
      const timer = setTimeout(() => {
        if (!dismissed) {
          setShowInstallPrompt(true);
        }
      }, 5000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDismissed(true);
    // Don't show again for 7 days
    localStorage.setItem('katha-install-dismissed', Date.now().toString());
  };

  const handleShowPrompt = () => {
    if (deferredPrompt && !dismissed) {
      setShowInstallPrompt(true);
    }
  };

  return (
    <>
      {/* Install Button (always available if PWA is installable) */}
      {deferredPrompt && !showInstallPrompt && (
        <button
          onClick={handleShowPrompt}
          className="fixed bottom-4 left-4 z-40 btn btn-primary flex items-center gap-2 shadow-lg"
        >
          <Download className="w-4 h-4" />
          Install Katha
        </button>
      )}

      {/* Install Prompt Banner */}
      <AnimatePresence>
        {showInstallPrompt && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-midnight border-t border-midnight-border shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-start gap-4">
                {/* App Icon */}
                <div className="w-16 h-16 bg-gradient-violet rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-text-primary">K</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="heading-3 text-primary mb-2">Install Katha</h3>
                  <p className="text-secondary mb-4">
                    Install Katha on your device for the best experience. Works offline, faster access, 
                    and a native app feel.
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-normal mb-4">
                    <div className="flex items-center gap-2 text-small text-secondary">
                      <Zap className="w-4 h-4 text-accent-cyan" />
                      <span>Lightning Fast</span>
                    </div>
                    <div className="flex items-center gap-2 text-small text-secondary">
                      <Shield className="w-4 h-4 text-accent-emerald" />
                      <span>100% Private</span>
                    </div>
                    <div className="flex items-center gap-2 text-small text-secondary">
                      <Smartphone className="w-4 h-4 text-accent-primary" />
                      <span>Works Offline</span>
                    </div>
                    <div className="flex items-center gap-2 text-small text-secondary">
                      <Monitor className="w-4 h-4 text-accent-amber" />
                      <span>Cross Platform</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleInstall}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Install App
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="btn btn-ghost flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Not Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
