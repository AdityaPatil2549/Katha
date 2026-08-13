import { MomentRepository } from './index';
import type { Moment, UUID } from '@/types/models';

export class SyncingMomentRepository implements MomentRepository {
  constructor(
    private localRepo: MomentRepository,
    private cloudRepo: MomentRepository | null
  ) {}

  public setCloudRepo(cloudRepo: MomentRepository | null) {
    this.cloudRepo = cloudRepo;
  }

  // --- READS (Always Local) ---

  async findAll(): Promise<Moment[]> {
    return this.localRepo.findAll();
  }

  async findByStory(storyId: string): Promise<Moment[]> {
    return this.localRepo.findByStory(storyId);
  }

  async findById(id: string): Promise<Moment | undefined> {
    return this.localRepo.findById(id);
  }

  async findByMood(mood: string): Promise<Moment[]> {
    return this.localRepo.findByMood(mood);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Moment[]> {
    return this.localRepo.findByDateRange(startDate, endDate);
  }

  async findPrivate(): Promise<Moment[]> {
    return this.localRepo.findPrivate();
  }

  async findPublic(): Promise<Moment[]> {
    return this.localRepo.findPublic();
  }

  async search(query: string): Promise<Moment[]> {
    return this.localRepo.search(query);
  }

  async getTotalCount(): Promise<number> {
    return this.localRepo.getTotalCount();
  }

  async getMoodDistribution(): Promise<Array<{ mood: string; count: number }>> {
    return this.localRepo.getMoodDistribution();
  }

  async getRecentMoments(limit?: number): Promise<Moment[]> {
    return this.localRepo.getRecentMoments(limit);
  }

  async getOnThisDay(month: number, day: number): Promise<Moment[]> {
    return this.localRepo.getOnThisDay(month, day);
  }

  // --- WRITES (Local First, then Cloud) ---

  async create(momentData: Omit<Moment, 'id'>): Promise<Moment> {
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

  async update(id: string, updates: Partial<Moment>): Promise<Moment> {
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

  async bulkUpsert(moments: Moment[]): Promise<void> {
    await this.localRepo.bulkUpsert(moments);
    if (this.cloudRepo && navigator.onLine) {
      this.cloudRepo.bulkUpsert(moments).catch(err => {
        console.error('Background sync batch import failed:', err);
      });
    }
  }
}
