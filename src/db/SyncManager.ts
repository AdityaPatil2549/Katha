import { db } from './KathaDb';
import { dbService } from './DatabaseService';
import { useSyncStore } from '@/store/syncStore';
import { useToastStore } from '@/store/toastStore';
import { checkIsOnline } from '@/lib/network';

export class SyncManager {
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Event listeners are now handled centrally in syncStore's startNetworkWatcher
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
      useSyncStore.getState().setPendingIds(pendingSyncs.map(item => item.data?.id).filter(Boolean) as string[]);
      
      const isActuallyOnline = await checkIsOnline();
      if (!isActuallyOnline) {
        return; // We update count but don't flush if truly offline
      }

      if (pendingSyncs.length === 0) {
        return;
      }
      
      this.isSyncing = true;
      useSyncStore.getState().setSyncing(true);

      console.log(`[SyncManager] Found ${pendingSyncs.length} offline mutations. Attempting to flush to cloud...`);
      let successCount = 0;

      for (const item of pendingSyncs) {
        const isStillOnline = await checkIsOnline();
        if (!isStillOnline) {
          console.warn('[SyncManager] Connection lost during flush. Aborting.');
          useToastStore.getState().addToast({ type: 'error', message: 'Sync paused. You went offline.' });
          break; // Stop if we go offline during sync
        }

        try {
          let success = false;
          
          if (item.table === 'stories') {
            const cloudRepo = (dbService.stories as any).cloudRepo;
            if (cloudRepo) {
              if (item.action === 'CREATE') await cloudRepo.create(item.data);
              if (item.action === 'UPDATE') {
                const cloudDoc = await cloudRepo.findById(item.data.id);
                if (cloudDoc && cloudDoc.updatedAt && new Date(cloudDoc.updatedAt).getTime() > item.timestamp) {
                  console.warn(`[SyncManager] LWW: Skipping obsolete update for story ${item.data.id}`);
                } else {
                  await cloudRepo.update(item.data.id, item.data.updates);
                }
              }
              if (item.action === 'DELETE') await cloudRepo.delete(item.data.id);
              success = true;
            }
          } else if (item.table === 'moments') {
            const cloudRepo = (dbService.moments as any).cloudRepo;
            if (cloudRepo) {
              if (item.action === 'CREATE') await cloudRepo.create(item.data);
              if (item.action === 'UPDATE') {
                const cloudDoc = await cloudRepo.findById(item.data.id);
                if (cloudDoc && cloudDoc.updatedAt && new Date(cloudDoc.updatedAt).getTime() > item.timestamp) {
                  console.warn(`[SyncManager] LWW: Skipping obsolete update for moment ${item.data.id}`);
                } else {
                  await cloudRepo.update(item.data.id, item.data.updates);
                }
              }
              if (item.action === 'DELETE') await cloudRepo.delete(item.data.id);
              success = true;
            }
          } else if (item.table === 'sessions') {
            const cloudRepo = (dbService.sessions as any).cloudRepo;
            if (cloudRepo) {
              if (item.action === 'CREATE') await cloudRepo.create(item.data);
              if (item.action === 'UPDATE') {
                const cloudDoc = await cloudRepo.findById(item.data.id);
                if (cloudDoc && cloudDoc.updatedAt && new Date(cloudDoc.updatedAt).getTime() > item.timestamp) {
                  console.warn(`[SyncManager] LWW: Skipping obsolete update for session ${item.data.id}`);
                } else {
                  await cloudRepo.update(item.data.id, item.data.updates);
                }
              }
              if (item.action === 'DELETE') await cloudRepo.delete(item.data.id);
              success = true;
            }
          } else if (item.table === 'knowledge') {
            const cloudRepo = (dbService.knowledge as any).cloudRepo;
            if (cloudRepo) {
              if (item.action === 'CREATE') await cloudRepo.create(item.data);
              if (item.action === 'UPDATE') {
                const cloudDoc = await cloudRepo.findById(item.data.id);
                if (cloudDoc && cloudDoc.updatedAt && new Date(cloudDoc.updatedAt).getTime() > item.timestamp) {
                  console.warn(`[SyncManager] LWW: Skipping obsolete update for knowledge ${item.data.id}`);
                } else {
                  await cloudRepo.update(item.data.id, item.data.updates);
                }
              }
              if (item.action === 'DELETE') await cloudRepo.delete(item.data.id);
              success = true;
            }
          } else if (item.table === 'timeline') {
            const cloudRepo = (dbService.timeline as any).cloudRepo;
            if (cloudRepo) {
              if (item.action === 'CREATE') await cloudRepo.create(item.data);
              if (item.action === 'UPDATE') {
                const cloudDoc = await cloudRepo.findById(item.data.id);
                // Timeline events might not have updatedAt, but we check if it exists
                if (cloudDoc && cloudDoc.updatedAt && new Date(cloudDoc.updatedAt).getTime() > item.timestamp) {
                  console.warn(`[SyncManager] LWW: Skipping obsolete update for timeline ${item.data.id}`);
                } else {
                  await cloudRepo.update(item.data.id, item.data.updates);
                }
              }
              if (item.action === 'DELETE') await cloudRepo.delete(item.data.id);
              success = true;
            }
          }

          if (success) {
            await db.syncQueue.delete(item.id!);
            successCount++;
            console.log(`[SyncManager] Successfully flushed ${item.action} for ${item.table}`);
          }
        } catch (err) {
          console.error(`[SyncManager] Failed to flush mutation ${item.id}:`, err);
        }
      }

      if (successCount > 0) {
        const remaining = await db.syncQueue.toArray();
        useSyncStore.getState().setPendingCount(remaining.length);
        useSyncStore.getState().setPendingIds(remaining.map(item => item.data?.id).filter(Boolean) as string[]);
        useToastStore.getState().addToast({ type: 'success', message: `${successCount} item${successCount > 1 ? 's' : ''} synced to Katha Cloud` });
      }

    } catch (err) {
      console.error('[SyncManager] Critical error during flush:', err);
    } finally {
      this.isSyncing = false;
      useSyncStore.getState().setSyncing(false);
    }
  }
}

export const syncManager = new SyncManager();
