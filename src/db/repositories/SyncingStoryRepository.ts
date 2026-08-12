import { StoryRepository } from './index';
import type { Story, StoryCategory, StoryStatus } from '@/types/models';

export class SyncingStoryRepository implements StoryRepository {
  constructor(
    private localRepo: StoryRepository,
    private cloudRepo: StoryRepository | null
  ) {}

  public setCloudRepo(cloudRepo: StoryRepository | null) {
    this.cloudRepo = cloudRepo;
  }

  // --- READS (Always Local) ---

  async findAll(): Promise<Story[]> {
    return this.localRepo.findAll();
  }

  async findById(id: string): Promise<Story | null> {
    return this.localRepo.findById(id);
  }

  async findByCategory(category: StoryCategory): Promise<Story[]> {
    return this.localRepo.findByCategory(category);
  }

  async findByStatus(status: StoryStatus): Promise<Story[]> {
    return this.localRepo.findByStatus(status);
  }

  async getFavorites(): Promise<Story[]> {
    return this.localRepo.getFavorites();
  }

  async findByMood(mood: string): Promise<Story[]> {
    return this.localRepo.findByMood(mood);
  }

  async search(query: string): Promise<Story[]> {
    return this.localRepo.search(query);
  }

  async getTotalWatchTime(): Promise<number> {
    return this.localRepo.getTotalWatchTime();
  }

  // --- WRITES (Local First, then Cloud) ---

  async create(storyData: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<Story> {
    const story = await this.localRepo.create(storyData);
    if (this.cloudRepo) {
      if (navigator.onLine) {
        this.cloudRepo.create({ ...storyData, id: story.id } as any).catch(async (err) => {
          console.error('Background sync create failed:', err);
          const { db } = await import('@/db/KathaDb');
          if (db.syncQueue) {
            await db.syncQueue.add({
              id: crypto.randomUUID(),
              table: 'stories',
              action: 'CREATE',
              data: { ...storyData, id: story.id },
              timestamp: Date.now()
            }).catch(e => console.error('Failed to queue offline sync', e));
          }
        });
      } else {
        const { db } = await import('@/db/KathaDb');
        if (db.syncQueue) {
          await db.syncQueue.add({
            id: crypto.randomUUID(),
            table: 'stories',
            action: 'CREATE',
            data: { ...storyData, id: story.id },
            timestamp: Date.now()
          }).catch(e => console.error('Failed to queue offline sync', e));
        }
      }
    }
    return story;
  }

  async update(id: string, updates: Partial<Story>): Promise<Story> {
    const updated = await this.localRepo.update(id, updates);
    if (this.cloudRepo) {
      if (navigator.onLine) {
        this.cloudRepo.update(id, updates).catch(async (err) => {
          console.error('Background sync update failed:', err);
          const { db } = await import('@/db/KathaDb');
          if (db.syncQueue) {
            await db.syncQueue.add({
              id: crypto.randomUUID(),
              table: 'stories',
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
            table: 'stories',
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
          console.error('Background sync delete failed:', err);
          const { db } = await import('@/db/KathaDb');
          if (db.syncQueue) {
            await db.syncQueue.add({
              id: crypto.randomUUID(),
              table: 'stories',
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
            table: 'stories',
            action: 'DELETE',
            data: { id },
            timestamp: Date.now()
          }).catch(e => console.error('Failed to queue offline sync', e));
        }
      }
    }
  }

  // Note: Batch import/export skips sync to avoid quota bombs. 
  // Should trigger a full-sync manually later.
  async importBatch(stories: Story[]): Promise<void> {
    await this.localRepo.importBatch(stories);
    if (this.cloudRepo && navigator.onLine) {
      this.cloudRepo.importBatch(stories).catch(err => {
        console.error('Background sync batch import failed:', err);
      });
    }
  }
}
