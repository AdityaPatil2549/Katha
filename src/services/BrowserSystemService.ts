import type { SystemInfo, SystemService } from './SystemService';

export class BrowserSystemService implements SystemService {
  async getSystemInfo(): Promise<SystemInfo> {
    const info: SystemInfo = {
      isOnline: navigator.onLine,
      isPWAInstalled: this.isPWAInstalled(),
    };

    // Get storage quota
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = (estimate.usage || 0) / 1024 / 1024; // Convert to MB
        const quota = (estimate.quota || 0) / 1024 / 1024; // Convert to MB
        
        info.storageQuota = {
          used,
          quota,
          percentage: quota > 0 ? (used / quota) * 100 : 0,
        };
      } catch (error) {
        console.warn('Failed to get storage quota:', error);
      }
    }

    // Get connection info
    if ('connection' in navigator) {
      const connection = (navigator as unknown as { connection: any }).connection;
      info.connection = {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
      };
    }

    return info;
  }

  async requestPersistentStorage(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const isPersistent = await navigator.storage.persist();
        return isPersistent;
      } catch (error) {
        console.warn('Failed to request persistent storage:', error);
        return false;
      }
    }
    return false;
  }

  async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(name => !name.startsWith('workbox'))
            .map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {
        console.warn('Failed to clear cache:', error);
      }
    }
  }

  async checkServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        return !!registration.active;
      } catch (error) {
        console.warn('Service worker not ready:', error);
        return false;
      }
    }
    return false;
  }

  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private isPWAInstalled(): boolean {
    // Check if running in standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ||
      document.referrer.includes('android-app://');
    
    return isStandalone;
  }
}

// Singleton instance
export const systemService = new BrowserSystemService();
