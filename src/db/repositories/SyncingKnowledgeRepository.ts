import type { Knowledge, UUID } from '@/types/models';
import type { KnowledgeRepository } from './KnowledgeRepository';

export class SyncingKnowledgeRepository implements KnowledgeRepository {
  constructor(
    private localRepo: KnowledgeRepository,
    private cloudRepo: KnowledgeRepository | null
  ) {}

  setCloudRepo(repo: KnowledgeRepository | null) {
    this.cloudRepo = repo;
  }

  async findById(id: UUID): Promise<Knowledge | undefined> {
    return this.localRepo.findById(id);
  }

  async findAll(): Promise<Knowledge[]> {
    return this.localRepo.findAll();
  }

  async findByStory(storyId: UUID): Promise<Knowledge[]> {
    return this.localRepo.findByStory(storyId);
  }

  async search(query: string): Promise<Knowledge[]> {
    return this.localRepo.search(query);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Knowledge[]> {
    return this.localRepo.findByDateRange(startDate, endDate);
  }

  async getTotalCount(): Promise<number> {
    return this.localRepo.getTotalCount();
  }

  async getRecentKnowledge(limit?: number): Promise<Knowledge[]> {
    return this.localRepo.getRecentKnowledge(limit);
  }

  async getTopPrinciples(limit?: number): Promise<Array<{ principle: string; count: number }>> {
    return this.localRepo.getTopPrinciples(limit);
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
        console.error(`Background knowledge sync failed [${action}]:`, err);
        const { db } = await import('@/db/KathaDb');
        if (db.syncQueue) {
          await db.syncQueue.add({
            id: crypto.randomUUID(),
            table: 'knowledge',
            action,
            data,
            timestamp: Date.now()
          }).catch(e => console.error('Failed to queue offline sync', e));
        }
      }
    };

    if (navigator.onLine) {
      executeSync();
    } else {
      const { db } = await import('@/db/KathaDb');
      if (db.syncQueue) {
        await db.syncQueue.add({
          id: crypto.randomUUID(),
          table: 'knowledge',
          action,
          data,
          timestamp: Date.now()
        }).catch(e => console.error('Failed to queue offline sync', e));
      }
    }
  }

  async create(knowledgeData: Omit<Knowledge, 'id'>): Promise<Knowledge> {
    const k = await this.localRepo.create(knowledgeData);
    this.queueSync('CREATE', { ...knowledgeData, id: k.id });
    return k;
  }

  async update(id: UUID, updates: Partial<Knowledge>): Promise<Knowledge> {
    const k = await this.localRepo.update(id, updates);
    this.queueSync('UPDATE', { id, updates });
    return k;
  }

  async delete(id: UUID): Promise<void> {
    await this.localRepo.delete(id);
    this.queueSync('DELETE', { id });
  }

  async bulkUpsert(knowledge: Knowledge[]): Promise<void> {
    await this.localRepo.bulkUpsert(knowledge);
  }
}
