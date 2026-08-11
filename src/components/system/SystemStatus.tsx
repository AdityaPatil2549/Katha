import { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, HardDrive, Cloud, AlertCircle } from 'lucide-react';

export interface SystemStatusProps {
  className?: string;
}

export function SystemStatus({ className = '' }: SystemStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageQuota, setStorageQuota] = useState<{ used: number; quota: number } | null>(null);
  const [dbHealth, setDbHealth] = useState<'healthy' | 'error' | 'checking'>('checking');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Check storage quota
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        setStorageQuota({
          used: (estimate.usage || 0) / 1024 / 1024, // MB
          quota: (estimate.quota || 0) / 1024 / 1024 // MB
        });
      });
    }

    // Check database health
    const checkDbHealth = async () => {
      try {
        const { dbService } = await import('@/db/DatabaseService');
        const healthy = await dbService.isHealthy();
        setDbHealth(healthy ? 'healthy' : 'error');
      } catch (error) {
        setDbHealth('error');
      }
    };

    checkDbHealth();
  }, []);

  const formatStorage = (mb: number) => {
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  return (
    <div className={`surface-card rounded-lg p-4 space-y-3 ${className}`}>
      <h3 className="text-body font-semibold text-primary">System Status</h3>
      
      {/* Network Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-emerald" />
          ) : (
            <WifiOff className="w-4 h-4 text-rose" />
          )}
          <span className="text-small text-secondary">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald' : 'bg-rose'}`} />
      </div>

      {/* Database Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dbHealth === 'healthy' ? (
            <Database className="w-4 h-4 text-emerald" />
          ) : dbHealth === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose" />
          ) : (
            <div className="w-4 h-4 border-2 border-muted border-t-cyan rounded-full animate-spin" />
          )}
          <span className="text-small text-secondary">
            Database {dbHealth === 'healthy' ? 'Ready' : dbHealth === 'error' ? 'Error' : 'Checking...'}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${
          dbHealth === 'healthy' ? 'bg-emerald' : 
          dbHealth === 'error' ? 'bg-rose' : 'bg-cyan'
        }`} />
      </div>

      {/* Storage Status */}
      {storageQuota && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-secondary" />
              <span className="text-small text-secondary">Storage</span>
            </div>
            <span className="text-caption text-muted">
              {formatStorage(storageQuota.used)} / {formatStorage(storageQuota.quota)}
            </span>
          </div>
          
          <div className="w-full bg-midnight-border rounded-full h-1">
            <div 
              className="bg-gradient-cyan h-full rounded-full transition-all duration-slow"
              style={{ width: `${Math.min((storageQuota.used / storageQuota.quota) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* PWA Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-secondary" />
          <span className="text-small text-secondary">PWA Ready</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald" />
      </div>
    </div>
  );
}
