import { db } from './KathaDb';
import { dbService } from './DatabaseService';
import { useSyncStore } from '@/store/syncStore';
import { useToastStore } from '@/store/toastStore';
import { checkIsOnline } from '@/lib/network';

interface SyncableRepo {
  findById: (id: string) => Promise<{ updatedAt?: string } | null>;
  create: (data: Record<string, unknown>) => Promise<unknown>;
  update: (id: string, updates: Record<string, unknown>) => Promise<unknown>;
  delete: (id: string) => Promise<unknown>;
}

function getCloudRepo(table: string): SyncableRepo | undefined {
  const map: Record<string, unknown> = {
    stories: dbService.stories,
    moments: dbService.moments,
    sessions: dbService.sessions,
    knowledge: dbService.knowledge,
    timeline: dbService.timeline,
  };
  const wrapper = map[table] as { cloudRepo?: SyncableRepo } | undefined;
  return wrapper?.cloudRepo;
}

export class SyncManager {
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  startBackgroundSync(intervalMs: number = 60000) {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => this.flushQueue(), intervalMs);
    void this.flushQueue();
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
      const currentUserId = typeof dbService !== 'undefined' && dbService?.getUserId ? dbService.getUserId() : null;
      const pendingSyncs = currentUserId
        ? await db.syncQueue.where('userId').equals(currentUserId).sortBy('timestamp')
        : (await db.syncQueue.orderBy('timestamp').toArray()).filter((item) => !item.userId);

      const extractDocId = (data: Record<string, unknown>): string | undefined =>
        typeof data?.id === 'string' ? data.id : undefined;

      useSyncStore.getState().setPendingCount(pendingSyncs.length);
      useSyncStore
        .getState()
        .setPendingIds(pendingSyncs.map((item) => extractDocId(item.data)).filter((id): id is string => Boolean(id)));

      const isActuallyOnline = await checkIsOnline();
      if (!isActuallyOnline || pendingSyncs.length === 0) {
        return;
      }

      this.isSyncing = true;
      useSyncStore.getState().setSyncing(true);

      let successCount = 0;

      for (const item of pendingSyncs) {
        try {
          const cloudRepo = getCloudRepo(item.table);
          if (!cloudRepo) continue;

          const docId = extractDocId(item.data);
          if (item.action === 'CREATE') {
            await cloudRepo.create(item.data);
          } else if (item.action === 'UPDATE' && docId) {
            const cloudDoc = await cloudRepo.findById(docId);
            if (!(cloudDoc?.updatedAt && new Date(cloudDoc.updatedAt).getTime() > item.timestamp)) {
              const updates =
                typeof item.data.updates === 'object' && item.data.updates !== null
                  ? (item.data.updates as Record<string, unknown>)
                  : {};
              await cloudRepo.update(docId, updates);
            }
          } else if (item.action === 'DELETE' && docId) {
            const cloudDoc = await cloudRepo.findById(docId);
            if (!(cloudDoc?.updatedAt && new Date(cloudDoc.updatedAt).getTime() > item.timestamp)) {
              await cloudRepo.delete(docId);
            }
          }

          await db.syncQueue.delete(item.id);
          successCount++;
        } catch (err: unknown) {
          const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: unknown }).code) : '';
          const isFatal =
            code === 'permission-denied' ||
            code === 'not-found' ||
            code === 'invalid-argument' ||
            code === 'unauthenticated';

          if (isFatal) {
            await db.syncQueue.delete(item.id);
          } else if (code === 'unavailable' || !(await checkIsOnline(true))) {
            useToastStore.getState().addToast({ type: 'error', message: 'Sync paused. You went offline.' });
            break;
          }
        }
      }

      if (successCount > 0) {
        const allAfter = await db.syncQueue.toArray();
        const remaining = allAfter.filter((item) => (!item.userId && !currentUserId) || item.userId === currentUserId);
        useSyncStore.getState().setPendingCount(remaining.length);
        useSyncStore
          .getState()
          .setPendingIds(remaining.map((item) => extractDocId(item.data)).filter((id): id is string => Boolean(id)));
        useToastStore
          .getState()
          .addToast({ type: 'success', message: `${successCount} item${successCount > 1 ? 's' : ''} synced to Katha Cloud` });
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
