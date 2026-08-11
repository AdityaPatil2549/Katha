import { formatISO } from 'date-fns';
import { db } from '@/db/KathaDb';
import { uuid } from '@/utils/id';
import type { TimelineEvent, UUID } from '@/types/models';
import type { TimelineRepository } from './TimelineRepository';

export class DexieTimelineRepository implements TimelineRepository {
  async create(eventData: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const event: TimelineEvent = {
      ...eventData,
      id: uuid(),
    };
    
    await db.timeline.add(event);
    return event;
  }

  async update(id: UUID, updates: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Timeline event with id ${id} not found`);
    }
    
    const updated: TimelineEvent = {
      ...existing,
      ...updates,
    };
    
    await db.timeline.update(id, updated);
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    await db.timeline.delete(id);
  }

  async bulkUpsert(events: TimelineEvent[]): Promise<void> {
    await db.timeline.bulkPut(events);
  }

  async findById(id: UUID): Promise<TimelineEvent | undefined> {
    return await db.timeline.get(id);
  }

  async findAll(): Promise<TimelineEvent[]> {
    return await db.timeline.orderBy('date').reverse().toArray();
  }

  async findByType(type: string): Promise<TimelineEvent[]> {
    return await db.timeline.where('type').equals(type).toArray();
  }

  async findByDateRange(startDate: string, endDate: string): Promise<TimelineEvent[]> {
    return await db.timeline
      .where('date')
      .between(startDate, endDate)
      .toArray();
  }

  async findByMood(mood: string): Promise<TimelineEvent[]> {
    return await db.timeline.filter(event => event.mood === mood).toArray();
  }

  async getRecentEvents(limit: number = 20): Promise<TimelineEvent[]> {
    return await db.timeline.orderBy('date').reverse().limit(limit).toArray();
  }

  async getEventsByMonth(year: number, month: number): Promise<TimelineEvent[]> {
    const startDate = formatISO(new Date(year, month - 1, 1));
    const endDate = formatISO(new Date(year, month, 0)); // Last day of the month
    
    return await this.findByDateRange(startDate, endDate);
  }

  async getOnThisDay(month: number, day: number): Promise<TimelineEvent[]> {
    const all = await this.findAll();
    return all.filter(event => {
      const date = new Date(event.date);
      return date.getMonth() + 1 === month && date.getDate() === day;
    });
  }

  async getTimelineStats(): Promise<{
    totalEvents: number;
    eventsByType: Array<{ type: string; count: number }>;
    mostActiveMonth: { year: number; month: number; count: number } | null;
  }> {
    const all = await this.findAll();
    
    // Total events
    const totalEvents = all.length;
    
    // Events by type
    const typeCount = new Map<string, number>();
    all.forEach(event => {
      const current = typeCount.get(event.type) || 0;
      typeCount.set(event.type, current + 1);
    });
    
    const eventsByType = Array.from(typeCount.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
    
    // Most active month
    const monthCount = new Map<string, number>();
    all.forEach(event => {
      const date = new Date(event.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const current = monthCount.get(monthKey) || 0;
      monthCount.set(monthKey, current + 1);
    });
    
    let mostActiveMonth = null;
    let maxCount = 0;
    
    for (const [monthKey, count] of monthCount.entries()) {
      if (count > maxCount) {
        maxCount = count;
        const [year, month] = monthKey.split('-').map(Number);
        if (year && month) {
          mostActiveMonth = { year, month, count };
        }
      }
    }
    
    return {
      totalEvents,
      eventsByType,
      mostActiveMonth,
    };
  }
}
