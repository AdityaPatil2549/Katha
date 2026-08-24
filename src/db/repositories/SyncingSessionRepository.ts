import type { Session, UUID } from '@/types/models';
import type { SessionRepository } from './SessionRepository';

export class SyncingSessionRepository implements SessionRepository {
  private userId: string | null = null;

  constructor(
    private localRepo: SessionRepository,
    private cloudRepo: SessionRepository | null
  ) {}

  setCloudRepo(repo: SessionRepository | null, userId?: string | null) {
    this.cloudRepo = repo;
    if (userId !== undefined) {
      this.userId = userId;
    }
  }

  // ALL READS ARE LOCAL ONLY (0ms latency, true offline-first)
  
  async findById(id: UUID): Promise<Session | undefined> {
    return this.localRepo.findById(id);
  }

  async findAll(): Promise<Session[]> {
    return this.localRepo.findAll();
  }

  async findByStory(storyId: UUID): Promise<Session[]> {
    return this.localRepo.findByStory(storyId);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Session[]> {
    return this.localRepo.findByDateRange(startDate, endDate);
  }

  async findByMood(mood: string): Promise<Session[]> {
    return this.localRepo.findByMood(mood);
  }

  async getTotalWatchTime(): Promise<number> {
    return this.localRepo.getTotalWatchTime();
  }

  async getTotalSessions(): Promise<number> {
    return this.localRepo.getTotalSessions();
  }

  async getAverageSessionDuration(): Promise<number> {
    return this.localRepo.getAverageSessionDuration();
  }

  async getMoodDistribution(): Promise<Array<{ mood: string; count: number }>> {
    return this.localRepo.getMoodDistribution();
  }

  async getRecentSessions(limit?: number): Promise<Session[]> {
    return this.localRepo.getRecentSessions(limit);
  }

  async getWatchStreak(): Promise<number> {
    return this.localRepo.getWatchStreak();
  }

  async getMostActiveDay(): Promise<{ date: string; duration: number } | null> {
    return this.localRepo.getMostActiveDay();
  }

  // ALL WRITES MUTATE LOCALLY FIRST, THEN QUEUE FOR SYNC
  
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
        console.error(`Background session sync failed [${action}]:`, err);
        // Phase 3: Add to Dexie syncQueue table for future retry if offline/failed
        const { db } = await import('@/db/KathaDb');
        const { registerBackgroundSync } = await import('@/lib/network');
        if (db.syncQueue && this.userId) {
          await db.syncQueue.add({
            id: crypto.randomUUID(),
            userId: this.userId,
            table: 'sessions',
            action,
            data,
            timestamp: Date.now()
          }).then(() => registerBackgroundSync()).catch(e => console.error('Failed to queue offline sync', e));
        }
      }
    };

    if (navigator.onLine) {
      // Execute in background
      executeSync();
    } else {
      // Immediately queue to outbox
      const { db } = await import('@/db/KathaDb');
      const { registerBackgroundSync } = await import('@/lib/network');
      if (db.syncQueue && this.userId) {
        await db.syncQueue.add({
          id: crypto.randomUUID(),
          userId: this.userId,
          table: 'sessions',
          action,
          data,
          timestamp: Date.now()
        }).then(() => registerBackgroundSync()).catch(e => console.error('Failed to queue offline sync', e));
      }
    }
  }

  async create(sessionData: Omit<Session, 'id'>): Promise<Session> {
    const session = await this.localRepo.create(sessionData);
    this.queueSync('CREATE', { ...sessionData, id: session.id });
    return session;
  }

  async update(id: UUID, updates: Partial<Session>): Promise<Session> {
    const session = await this.localRepo.update(id, updates);
    this.queueSync('UPDATE', { id, updates });
    return session;
  }

  async delete(id: UUID): Promise<void> {
    await this.localRepo.delete(id);
    this.queueSync('DELETE', { id });
  }

  async bulkUpsert(sessions: Session[]): Promise<void> {
    await this.localRepo.bulkUpsert(sessions);
    // Note: To prevent massive API calls, bulkUpsert is usually an initial sync operation 
    // down from the cloud. If used to push up, it would need a batch sync method.
  }
}
