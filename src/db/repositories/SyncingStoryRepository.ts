import { StoryRepository } from './index';
import type { Story, StoryCategory, StoryStatus } from '@/types/models';
import { fetchAndCompressImageToBase64 } from '@/lib/imageUtils';
import { registerBackgroundSync } from '@/lib/network';

export class SyncingStoryRepository implements StoryRepository {
  private userId: string | null = null;

  constructor(
    private localRepo: StoryRepository,
    private cloudRepo: StoryRepository | null
  ) {}

  public setCloudRepo(cloudRepo: StoryRepository | null, userId?: string | null) {
    this.cloudRepo = cloudRepo;
    if (userId !== undefined) {
      this.userId = userId;
    }
  }

  // --- READS (Always Local) ---

  async findAll(): Promise<Story[]> {
    return this.localRepo.findAll();
  }

  async findById(id: string): Promise<Story | undefined> {
    return this.localRepo.findById(id);
  }

  async findByCategory(category: string): Promise<Story[]> {
    return this.localRepo.findByCategory(category);
  }

  async findByStatus(status: string): Promise<Story[]> {
    return this.localRepo.findByStatus(status);
  }

  async findFavorites(): Promise<Story[]> {
    return this.localRepo.findFavorites();
  }

  async findByTag(tag: string): Promise<Story[]> {
    return this.localRepo.findByTag(tag);
  }

  async findByMood(mood: string): Promise<Story[]> {
    return this.localRepo.findByMood(mood);
  }

  async search(query: string): Promise<Story[]> {
    return this.localRepo.search(query);
  }

  async findWatching(): Promise<Story[]> {
    return this.localRepo.findWatching();
  }

  async findCompleted(): Promise<Story[]> {
    return this.localRepo.findCompleted();
  }

  async findHighImpact(minImpact?: number): Promise<Story[]> {
    return this.localRepo.findHighImpact(minImpact);
  }

  async getTotalWatchTime(): Promise<number> {
    return this.localRepo.getTotalWatchTime();
  }

  async getAverageRating(): Promise<number> {
    return this.localRepo.getAverageRating();
  }

  async getTopCategories(limit?: number): Promise<Array<{ category: string; count: number }>> {
    return this.localRepo.getTopCategories(limit);
  }

  async getMoodDistribution(): Promise<Array<{ mood: string; count: number }>> {
    return this.localRepo.getMoodDistribution();
  }

  // --- WRITES (Local First, then Cloud) ---

  async create(storyData: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<Story> {
    const story = await this.localRepo.create(storyData);
    
    // Asynchronously fetch and compress poster to base64 for offline persistence
    if (story.posterUrl && typeof window !== 'undefined') {
      fetchAndCompressImageToBase64(story.posterUrl).then(async (base64) => {
        if (base64) {
          await this.localRepo.update(story.id, { posterBase64: base64 });
          // We don't necessarily need to sync this to cloud as it's for local offline caching,
          // but if we want to, we could. Let's just keep it local to save cloud bandwidth!
        }
      });
    }

    if (this.cloudRepo) {
      if (navigator.onLine) {
        this.cloudRepo.create({ ...storyData, id: story.id } as any).catch(async (err) => {
          console.error('Background sync create failed:', err);
          const { db } = await import('@/db/KathaDb');
          if (db.syncQueue && this.userId) {
            await db.syncQueue.add({
              id: crypto.randomUUID(),
              userId: this.userId,
              table: 'stories',
              action: 'CREATE',
              data: { ...storyData, id: story.id },
              timestamp: Date.now()
            }).then(() => registerBackgroundSync()).catch(e => console.error('Failed to queue offline sync', e));
          }
        });
      } else {
        const { db } = await import('@/db/KathaDb');
          if (db.syncQueue && this.userId) {
          await db.syncQueue.add({
            id: crypto.randomUUID(),
            userId: this.userId,
            table: 'stories',
            action: 'CREATE',
            data: { ...storyData, id: story.id },
            timestamp: Date.now()
          }).then(() => registerBackgroundSync()).catch(e => console.error('Failed to queue offline sync', e));
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
          if (db.syncQueue && this.userId) {
            await db.syncQueue.add({
              id: crypto.randomUUID(),
              userId: this.userId,
              table: 'stories',
              action: 'UPDATE',
              data: { id, updates },
              timestamp: Date.now()
            }).then(() => registerBackgroundSync()).catch(e => console.error('Failed to queue offline sync', e));
          }
        });
      } else {
        const { db } = await import('@/db/KathaDb');
        if (db.syncQueue && this.userId) {
          await db.syncQueue.add({
            id: crypto.randomUUID(),
            userId: this.userId,
            table: 'stories',
            action: 'UPDATE',
            data: { id, updates },
            timestamp: Date.now()
          }).then(() => registerBackgroundSync()).catch(e => console.error('Failed to queue offline sync', e));
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
          if (db.syncQueue && this.userId) {
            await db.syncQueue.add({
              id: crypto.randomUUID(),
              userId: this.userId,
              table: 'stories',
              action: 'DELETE',
              data: { id },
              timestamp: Date.now()
            }).then(() => registerBackgroundSync()).catch(e => console.error('Failed to queue offline sync', e));
          }
        });
      } else {
        const { db } = await import('@/db/KathaDb');
        if (db.syncQueue && this.userId) {
          await db.syncQueue.add({
            id: crypto.randomUUID(),
            userId: this.userId,
            table: 'stories',
            action: 'DELETE',
            data: { id },
            timestamp: Date.now()
          }).then(() => registerBackgroundSync()).catch(e => console.error('Failed to queue offline sync', e));
        }
      }
    }
  }

  async bulkUpsert(stories: Story[]): Promise<void> {
    await this.localRepo.bulkUpsert(stories);
    if (this.cloudRepo && navigator.onLine) {
      this.cloudRepo.bulkUpsert(stories).catch(err => {
        console.error('Background sync bulkUpsert failed:', err);
      });
    }
  }
}
