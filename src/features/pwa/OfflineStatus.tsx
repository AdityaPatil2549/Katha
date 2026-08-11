import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Download, Cloud, Check, AlertTriangle, RefreshCw } from 'lucide-react';

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [cacheStatus, setCacheStatus] = useState({
    stories: true,
    images: true,
    data: true
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && showOfflineBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber/90 backdrop-blur-sm border-b border-amber/30"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-amber" />
                <div>
                  <div className="font-medium text-amber">You're offline</div>
                  <div className="text-small text-amber/80">
                    Katha works offline - your data is safe and accessible
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowOfflineBanner(false)}
                className="btn btn-ghost p-2 text-amber hover:bg-amber/20"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className={`surface-elevated p-3 rounded-full shadow-soft flex items-center gap-2 ${
          isOnline ? 'bg-emerald/10 border border-emerald/30' : 'bg-amber/10 border border-amber/30'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-emerald" />
              <span className="text-small text-emerald">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-amber" />
              <span className="text-small text-amber">Offline</span>
            </>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
}
