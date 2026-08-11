import type { Session, UUID } from '@/types/models';

export interface SessionRepository {
  // CRUD operations
  create(session: Omit<Session, 'id'>): Promise<Session>;
  update(id: UUID, updates: Partial<Session>): Promise<Session>;
  delete(id: UUID): Promise<void>;
  bulkUpsert(sessions: Session[]): Promise<void>;
  
  // Queries
  findById(id: UUID): Promise<Session | undefined>;
  findAll(): Promise<Session[]>;
  findByStory(storyId: UUID): Promise<Session[]>;
  findByDateRange(startDate: string, endDate: string): Promise<Session[]>;
  findByMood(mood: string): Promise<Session[]>;
  
  // Analytics
  getTotalWatchTime(): Promise<number>;
  getTotalSessions(): Promise<number>;
  getAverageSessionDuration(): Promise<number>;
  getMoodDistribution(): Promise<Array<{ mood: string; count: number }>>;
  getRecentSessions(limit?: number): Promise<Session[]>;
  getWatchStreak(): Promise<number>;
  getMostActiveDay(): Promise<{ date: string; duration: number } | null>;
}
