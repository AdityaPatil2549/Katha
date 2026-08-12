import { MomentRepository } from './index';
import type { StoryMoment } from '@/types/models';

export class SyncingMomentRepository implements MomentRepository {
  constructor(
    private localRepo: MomentRepository,
    private cloudRepo: MomentRepository | null
  ) {}

  public setCloudRepo(cloudRepo: MomentRepository | null) {
    this.cloudRepo = cloudRepo;
  }

  // --- READS (Always Local) ---

  async findAll(): Promise<StoryMoment[]> {
    return this.localRepo.findAll();
  }

  async findByStoryId(storyId: string): Promise<StoryMoment[]> {
    return this.localRepo.findByStoryId(storyId);
  }

  async findById(id: string): Promise<StoryMoment | null> {
    return this.localRepo.findById(id);
  }

  // --- WRITES (Local First, then Cloud) ---

  async create(momentData: Omit<StoryMoment, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoryMoment> {
    const moment = await this.localRepo.create(momentData);
    if (this.cloudRepo) {
      if (navigator.onLine) {
        this.cloudRepo.create({ ...momentData, id: moment.id } as any).catch(async (err) => {
          console.error('Background moment sync create failed:', err);
          const { db } = await import('@/db/KathaDb');
          if (db.syncQueue) {
            await db.syncQueue.add({
              id: crypto.randomUUID(),
              table: 'moments',
              action: 'CREATE',
              data: { ...momentData, id: moment.id },
              timestamp: Date.now()
            }).catch(e => console.error('Failed to queue offline sync', e));
          }
        });
      } else {
        const { db } = await import('@/db/KathaDb');
        if (db.syncQueue) {
          await db.syncQueue.add({
            id: crypto.randomUUID(),
            table: 'moments',
            action: 'CREATE',
            data: { ...momentData, id: moment.id },
            timestamp: Date.now()
          }).catch(e => console.error('Failed to queue offline sync', e));
        }
      }
    }
    return moment;
  }

  async update(id: string, updates: Partial<StoryMoment>): Promise<StoryMoment> {
    const updated = await this.localRepo.update(id, updates);
    if (this.cloudRepo) {
      if (navigator.onLine) {
        this.cloudRepo.update(id, updates).catch(async (err) => {
          console.error('Background moment sync update failed:', err);
          const { db } = await import('@/db/KathaDb');
          if (db.syncQueue) {
            await db.syncQueue.add({
              id: crypto.randomUUID(),
              table: 'moments',
              action: 'UPDATE',
              data: { id, updates },
              timestamp: Date.now()
            }).catch(e => console.error('Failed to queue offline sync', e));
          }
        });
      } else {
        const { db } = await import('@/db/KathaDb');
        if (db.syncQueue) {
          await db.syncQueue.add({
            id: crypto.randomUUID(),
            table: 'moments',
            action: 'UPDATE',
            data: { id, updates },
            timestamp: Date.now()
          }).catch(e => console.error('Failed to queue offline sync', e));
        }
      }
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.localRepo.delete(id);
    if (this.cloudRepo) {
      if (navigator.onLine) {
        this.cloudRepo.delete(id).catch(async (err) => {
          console.error('Background moment sync delete failed:', err);
          const { db } = await import('@/db/KathaDb');
          if (db.syncQueue) {
            await db.syncQueue.add({
              id: crypto.randomUUID(),
              table: 'moments',
              action: 'DELETE',
              data: { id },
              timestamp: Date.now()
            }).catch(e => console.error('Failed to queue offline sync', e));
          }
        });
      } else {
        const { db } = await import('@/db/KathaDb');
        if (db.syncQueue) {
          await db.syncQueue.add({
            id: crypto.randomUUID(),
            table: 'moments',
            action: 'DELETE',
            data: { id },
            timestamp: Date.now()
          }).catch(e => console.error('Failed to queue offline sync', e));
        }
      }
    }
  }

  async deleteByStoryId(storyId: string): Promise<void> {
    await this.localRepo.deleteByStoryId(storyId);
    if (this.cloudRepo && navigator.onLine) {
      this.cloudRepo.deleteByStoryId(storyId).catch(err => {
        console.error('Background sync deleteByStoryId failed:', err);
      });
    }
  }

  async importBatch(moments: StoryMoment[]): Promise<void> {
    await this.localRepo.importBatch(moments);
    if (this.cloudRepo && navigator.onLine) {
      this.cloudRepo.importBatch(moments).catch(err => {
        console.error('Background sync batch import failed:', err);
      });
    }
  }
}
