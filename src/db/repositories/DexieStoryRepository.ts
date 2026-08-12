import { formatISO } from 'date-fns';
import { db } from '@/db/KathaDb';
import { uuid } from '@/utils/id';
import type { Story, UUID } from '@/types/models';
import type { StoryRepository } from './StoryRepository';

export class DexieStoryRepository implements StoryRepository {
  async create(storyData: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<Story> {
    const now = formatISO(new Date());
    const story: Story = {
      ...storyData,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    
    await db.stories.add(story);
    return story;
  }

  async update(id: UUID, updates: Partial<Story>): Promise<Story> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Story with id ${id} not found`);
    }
    
    const updated: Story = {
      ...existing,
      ...updates,
      updatedAt: formatISO(new Date()),
    };
    
    await db.stories.update(id, updated);
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    await db.transaction('rw', [
      db.stories, db.moments, db.sessions, db.knowledge, db.timeline,
      db.viewingHistory, db.impactResponses, db.storyDNA,
      db.insights, db.atlasKnowledge
    ], async () => {
      // Delete related data first
      await db.moments.where('storyId').equals(id).delete();
      await db.sessions.where('storyId').equals(id).delete();
      await db.knowledge.where('storyId').equals(id).delete();
      await db.timeline.where('refId').equals(id).delete();
      
      // Cascade delete personal/wisdom data
      await db.viewingHistory.where('entryId').equals(id).delete();
      await db.impactResponses.where('entryId').equals(id).delete();
      await db.storyDNA.where('entryId').equals(id).delete();
      await db.insights.where('sourceEntryId').equals(id).delete();
      await db.atlasKnowledge.where('entryId').equals(id).delete();
      
      // Delete the story
      await db.stories.delete(id);
    });
  }

  async bulkUpsert(stories: Story[]): Promise<void> {
    await db.stories.bulkPut(stories);
  }

  async findById(id: UUID): Promise<Story | undefined> {
    return await db.stories.get(id);
  }

  async findAll(): Promise<Story[]> {
    return await db.stories.orderBy('updatedAt').reverse().toArray();
  }

  async findByCategory(category: string): Promise<Story[]> {
    return await db.stories.where('category').equals(category).toArray();
  }

  async findByStatus(status: string): Promise<Story[]> {
    return await db.stories.where('status').equals(status).toArray();
  }

  async findFavorites(): Promise<Story[]> {
    return await db.stories.filter(story => story.favorite === true).toArray();
  }

  async findByTag(tag: string): Promise<Story[]> {
    return await db.stories.filter(story => story.tags.includes(tag)).toArray();
  }

  async findByMood(mood: string): Promise<Story[]> {
    return await db.stories.filter(story => (story.moods || []).includes(mood)).toArray();
  }

  async search(query: string): Promise<Story[]> {
    const lowerQuery = query.toLowerCase();
    return await db.stories.filter(story => 
      story.title.toLowerCase().includes(lowerQuery) ||
      story.genre.some(g => g.toLowerCase().includes(lowerQuery)) ||
      (story.tags || []).some(t => t.toLowerCase().includes(lowerQuery)) ||
      (story.description || '').toLowerCase().includes(lowerQuery)
    ).toArray();
  }

  async findWatching(): Promise<Story[]> {
    return await this.findByStatus('watching');
  }

  async findCompleted(): Promise<Story[]> {
    return await this.findByStatus('completed');
  }

  async findHighImpact(minImpact: number = 7): Promise<Story[]> {
    return await db.stories.where('impactIndex').aboveOrEqual(minImpact).toArray();
  }

  async search(query: string): Promise<Story[]> {
    const lowerQuery = query.toLowerCase();
    
    return await db.stories.filter(story => 
      (story.title || '').toLowerCase().includes(lowerQuery) ||
      (story.genre || []).some(g => g.toLowerCase().includes(lowerQuery)) ||
      (story.tags || []).some(t => t.toLowerCase().includes(lowerQuery)) ||
      (story.notes || '').toLowerCase().includes(lowerQuery)
    ).limit(50).toArray();
  }

  async getTotalWatchTime(): Promise<number> {
    const stories = await this.findAll();
    return stories.reduce((total, story) => total + story.watchTimeMinutes, 0);
  }

  async getAverageRating(): Promise<number> {
    const stories = await this.findAll();
    if (stories.length === 0) return 0;
    
    const total = stories.reduce((sum, story) => sum + story.rating, 0);
    return total / stories.length;
  }

  async getTopCategories(limit: number = 5): Promise<Array<{ category: string; count: number }>> {
    const stories = await this.findAll();
    const categoryCount = new Map<string, number>();
    
    stories.forEach(story => {
      const current = categoryCount.get(story.category) || 0;
      categoryCount.set(story.category, current + 1);
    });
    
    return Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getMoodDistribution(): Promise<Array<{ mood: string; count: number }>> {
    const stories = await this.findAll();
    const moodCount = new Map<string, number>();
    
    stories.forEach(story => {
      (story.moods || []).forEach(mood => {
        const current = moodCount.get(mood) || 0;
        moodCount.set(mood, current + 1);
      });
    });
    
    return Array.from(moodCount.entries())
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  }
}
