import { db } from './KathaDb';
import { dbService } from './DatabaseService';
import { useSyncStore } from '@/store/syncStore';

export class SyncManager {
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Attempt sync when coming back online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        useSyncStore.getState().setOnlineStatus(true);
        this.flushQueue();
      });
      window.addEventListener('offline', () => {
        useSyncStore.getState().setOnlineStatus(false);
      });
    }
  }

  startBackgroundSync(intervalMs: number = 60000) {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => this.flushQueue(), intervalMs);
    // Initial attempt
    this.flushQueue();
  }

  stopBackgroundSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async flushQueue() {
    if (this.isSyncing) return;
    
    try {
      const pendingSyncs = await db.syncQueue.orderBy('timestamp').toArray();
      useSyncStore.getState().setPendingCount(pendingSyncs.length);
      
      if (!navigator.onLine) {
        return; // We update count but don't flush if offline
      }

      if (pendingSyncs.length === 0) {
        return;
      }
      
      this.isSyncing = true;
      useSyncStore.getState().setSyncing(true);

      console.log(`[SyncManager] Found ${pendingSyncs.length} offline mutations. Attempting to flush to cloud...`);

      for (const item of pendingSyncs) {
        if (!navigator.onLine) {
          console.warn('[SyncManager] Connection lost during flush. Aborting.');
          break; // Stop if we go offline during sync
        }

        try {
          // Route the mutation to the correct cloud repository manually or via the DB Service
          // For safety, we access the underlying cloud repos through the DatabaseService 
          // (assuming they expose them or we do it via raw Firestore commands if needed)
          
          let success = false;
          
          // Using explicit routing based on table name
          if (item.table === 'stories') {
            const cloudRepo = (dbService.stories as any).cloudRepo;
            if (cloudRepo) {
              if (item.action === 'CREATE') await cloudRepo.create(item.data);
              if (item.action === 'UPDATE') await cloudRepo.update(item.data.id, item.data.updates);
              if (item.action === 'DELETE') await cloudRepo.delete(item.data.id);
              success = true;
            }
          } else if (item.table === 'moments') {
            const cloudRepo = (dbService.moments as any).cloudRepo;
            if (cloudRepo) {
              if (item.action === 'CREATE') await cloudRepo.create(item.data);
              if (item.action === 'UPDATE') await cloudRepo.update(item.data.id, item.data.updates);
              if (item.action === 'DELETE') await cloudRepo.delete(item.data.id);
              success = true;
            }
          } else if (item.table === 'sessions') {
            const cloudRepo = (dbService.sessions as any).cloudRepo;
            if (cloudRepo) {
              if (item.action === 'CREATE') await cloudRepo.create(item.data);
              if (item.action === 'UPDATE') await cloudRepo.update(item.data.id, item.data.updates);
              if (item.action === 'DELETE') await cloudRepo.delete(item.data.id);
              success = true;
            }
          } else if (item.table === 'knowledge') {
            const cloudRepo = (dbService.knowledge as any).cloudRepo;
            if (cloudRepo) {
              if (item.action === 'CREATE') await cloudRepo.create(item.data);
              if (item.action === 'UPDATE') await cloudRepo.update(item.data.id, item.data.updates);
              if (item.action === 'DELETE') await cloudRepo.delete(item.data.id);
              success = true;
            }
          } else if (item.table === 'timeline') {
            const cloudRepo = (dbService.timeline as any).cloudRepo;
            if (cloudRepo) {
              if (item.action === 'CREATE') await cloudRepo.create(item.data);
              if (item.action === 'UPDATE') await cloudRepo.update(item.data.id, item.data.updates);
              if (item.action === 'DELETE') await cloudRepo.delete(item.data.id);
              success = true;
            }
          }

          if (success) {
            // Remove from queue upon success
            await db.syncQueue.delete(item.id);
            // Update UI count
            useSyncStore.getState().setPendingCount(await db.syncQueue.count());
            console.log(`[SyncManager] Successfully flushed ${item.action} for ${item.table}`);
          }
        } catch (err) {
          console.error(`[SyncManager] Failed to flush mutation ${item.id}:`, err);
          // If it's an unrecoverable error (e.g. invalid document), we might want to delete it eventually
          // but for now we leave it in the queue to try again later.
        }
      }
    } catch (err) {
      console.error('[SyncManager] Critical error during flush:', err);
    } finally {
      this.isSyncing = false;
      useSyncStore.getState().setSyncing(false);
    }
  }
}

// Singleton instance
export const syncManager = new SyncManager();
