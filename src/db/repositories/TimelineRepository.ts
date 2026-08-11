import type { TimelineEvent, UUID } from '@/types/models';

export interface TimelineRepository {
  // CRUD operations
  create(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent>;
  update(id: UUID, updates: Partial<TimelineEvent>): Promise<TimelineEvent>;
  delete(id: UUID): Promise<void>;
  bulkUpsert(events: TimelineEvent[]): Promise<void>;
  
  // Queries
  findById(id: UUID): Promise<TimelineEvent | undefined>;
  findAll(): Promise<TimelineEvent[]>;
  findByType(type: string): Promise<TimelineEvent[]>;
  findByDateRange(startDate: string, endDate: string): Promise<TimelineEvent[]>;
  findByMood(mood: string): Promise<TimelineEvent[]>;
  
  // Timeline specific
  getRecentEvents(limit?: number): Promise<TimelineEvent[]>;
  getEventsByMonth(year: number, month: number): Promise<TimelineEvent[]>;
  getOnThisDay(month: number, day: number): Promise<TimelineEvent[]>;
  getTimelineStats(): Promise<{
    totalEvents: number;
    eventsByType: Array<{ type: string; count: number }>;
    mostActiveMonth: { year: number; month: number; count: number } | null;
  }>;
}
