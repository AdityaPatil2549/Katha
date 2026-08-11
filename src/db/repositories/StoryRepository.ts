import type { Story, UUID } from '@/types/models';

export interface StoryRepository {
  // CRUD operations
  create(story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<Story>;
  update(id: UUID, updates: Partial<Story>): Promise<Story>;
  delete(id: UUID): Promise<void>;
  bulkUpsert(stories: Story[]): Promise<void>;
  
  // Queries
  findById(id: UUID): Promise<Story | undefined>;
  findAll(): Promise<Story[]>;
  findByCategory(category: string): Promise<Story[]>;
  findByStatus(status: string): Promise<Story[]>;
  findFavorites(): Promise<Story[]>;
  findByTag(tag: string): Promise<Story[]>;
  findByMood(mood: string): Promise<Story[]>;
  
  // Specialized queries
  findWatching(): Promise<Story[]>;
  findCompleted(): Promise<Story[]>;
  findHighImpact(minImpact?: number): Promise<Story[]>;
  search(query: string): Promise<Story[]>;
  
  // Analytics
  getTotalWatchTime(): Promise<number>;
  getAverageRating(): Promise<number>;
  getTopCategories(limit?: number): Promise<Array<{ category: string; count: number }>>;
  getMoodDistribution(): Promise<Array<{ mood: string; count: number }>>;
}
