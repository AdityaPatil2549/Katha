import type { Moment, UUID } from '@/types/models';

export interface MomentRepository {
  // CRUD operations
  create(moment: Omit<Moment, 'id'>): Promise<Moment>;
  update(id: UUID, updates: Partial<Moment>): Promise<Moment>;
  delete(id: UUID): Promise<void>;
  bulkUpsert(moments: Moment[]): Promise<void>;
  
  // Queries
  findById(id: UUID): Promise<Moment | undefined>;
  findAll(): Promise<Moment[]>;
  findByStory(storyId: UUID): Promise<Moment[]>;
  findByMood(mood: string): Promise<Moment[]>;
  findByDateRange(startDate: string, endDate: string): Promise<Moment[]>;
  findPrivate(): Promise<Moment[]>;
  findPublic(): Promise<Moment[]>;
  
  // Search
  search(query: string): Promise<Moment[]>;
  
  // Analytics
  getTotalCount(): Promise<number>;
  getMoodDistribution(): Promise<Array<{ mood: string; count: number }>>;
  getRecentMoments(limit?: number): Promise<Moment[]>;
  getOnThisDay(month: number, day: number): Promise<Moment[]>;
}
