import { useSyncStore } from '@/store/syncStore';
import { syncManager } from '@/db/SyncManager';

export async function bootstrapApp() {
  // Start accurate network polling
  useSyncStore.getState().startNetworkWatcher();

  // Listen for Background Sync events triggered by the Service Worker
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'KATHA_SYNC') {
        console.log('[App] Received KATHA_SYNC message from Service Worker. Flushing queue...');
        syncManager.flushQueue();
      }
    });
  }
}
