import type { Knowledge, UUID } from '@/types/models';

export interface KnowledgeRepository {
  // CRUD operations
  create(knowledge: Omit<Knowledge, 'id'>): Promise<Knowledge>;
  update(id: UUID, updates: Partial<Knowledge>): Promise<Knowledge>;
  delete(id: UUID): Promise<void>;
  bulkUpsert(knowledge: Knowledge[]): Promise<void>;
  
  // Queries
  findById(id: UUID): Promise<Knowledge | undefined>;
  findAll(): Promise<Knowledge[]>;
  findByStory(storyId: UUID): Promise<Knowledge[]>;
  findByDateRange(startDate: string, endDate: string): Promise<Knowledge[]>;
  
  // Search
  search(query: string): Promise<Knowledge[]>;
  
  // Analytics
  getTotalCount(): Promise<number>;
  getRecentKnowledge(limit?: number): Promise<Knowledge[]>;
  getTopPrinciples(limit?: number): Promise<Array<{ principle: string; count: number }>>;
}
