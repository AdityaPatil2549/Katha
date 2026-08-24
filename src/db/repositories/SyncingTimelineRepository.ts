import type { TimelineEvent, UUID } from '@/types/models';
import type { TimelineRepository } from './TimelineRepository';

export class SyncingTimelineRepository implements TimelineRepository {
  private userId: string | null = null;

  constructor(
    private localRepo: TimelineRepository,
    private cloudRepo: TimelineRepository | null
  ) {}

  setCloudRepo(repo: TimelineRepository | null, userId?: string | null) {
    this.cloudRepo = repo;
    if (userId !== undefined) {
      this.userId = userId;
    }
  }

  async findById(id: UUID): Promise<TimelineEvent | undefined> {
    return this.localRepo.findById(id);
  }

  async findAll(): Promise<TimelineEvent[]> {
    return this.localRepo.findAll();
  }

  async findByType(type: string): Promise<TimelineEvent[]> {
    return this.localRepo.findByType(type);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<TimelineEvent[]> {
    return this.localRepo.findByDateRange(startDate, endDate);
  }

  async findByMood(mood: string): Promise<TimelineEvent[]> {
    return this.localRepo.findByMood(mood);
  }

  async getRecentEvents(limit?: number): Promise<TimelineEvent[]> {
    return this.localRepo.getRecentEvents(limit);
  }

  async getEventsByMonth(year: number, month: number): Promise<TimelineEvent[]> {
    return this.localRepo.getEventsByMonth(year, month);
  }

  async getOnThisDay(month: number, day: number): Promise<TimelineEvent[]> {
    return this.localRepo.getOnThisDay(month, day);
  }

  async getTimelineStats(): Promise<{
    totalEvents: number;
    eventsByType: Array<{ type: string; count: number }>;
    mostActiveMonth: { year: number; month: number; count: number } | null;
  }> {
    return this.localRepo.getTimelineStats();
  }

  private async queueSync(action: 'CREATE' | 'UPDATE' | 'DELETE', data: any) {
    if (!this.cloudRepo) return;
    
    const executeSync = async () => {
      try {
        switch (action) {
          case 'CREATE':
            await this.cloudRepo!.create(data as any);
            break;
          case 'UPDATE':
            await this.cloudRepo!.update(data.id, data.updates);
            break;
          case 'DELETE':
            await this.cloudRepo!.delete(data.id);
            break;
        }
      } catch (err) {
        console.error(`Background timeline sync failed [${action}]:`, err);
        const { db } = await import('@/db/KathaDb');
        const { registerBackgroundSync } = await import('@/lib/network');
        if (db.syncQueue && this.userId) {
          await db.syncQueue.add({
            id: crypto.randomUUID(),
            userId: this.userId,
            table: 'timeline',
            action,
            data,
            timestamp: Date.now()
          }).then(() => registerBackgroundSync()).catch(e => console.error('Failed to queue offline sync', e));
        }
      }
    };

    if (navigator.onLine) {
      executeSync();
    } else {
      const { db } = await import('@/db/KathaDb');
      const { registerBackgroundSync } = await import('@/lib/network');
      if (db.syncQueue && this.userId) {
        await db.syncQueue.add({
          id: crypto.randomUUID(),
          userId: this.userId,
          table: 'timeline',
          action,
          data,
          timestamp: Date.now()
        }).then(() => registerBackgroundSync()).catch(e => console.error('Failed to queue offline sync', e));
      }
    }
  }

  async create(eventData: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const e = await this.localRepo.create(eventData);
    this.queueSync('CREATE', { ...eventData, id: e.id });
    return e;
  }

  async update(id: UUID, updates: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const e = await this.localRepo.update(id, updates);
    this.queueSync('UPDATE', { id, updates });
    return e;
  }

  async delete(id: UUID): Promise<void> {
    await this.localRepo.delete(id);
    this.queueSync('DELETE', { id });
  }

  async bulkUpsert(events: TimelineEvent[]): Promise<void> {
    await this.localRepo.bulkUpsert(events);
  }
}
