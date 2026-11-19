import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';

export interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md
        transition-all duration-300 animate-slide-up
        ${isOnline 
          ? 'bg-accent-emerald/15 border border-accent-emerald/30 text-accent-emerald' 
          : 'bg-accent-rose/15 border border-accent-rose/30 text-accent-rose'
        }
        ${className}
      `}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-small font-medium">Back Online</span>
          <Cloud className="w-4 h-4" />
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-small font-medium">Offline Mode</span>
          <CloudOff className="w-4 h-4" />
        </>
      )}
    </div>
  );
}
