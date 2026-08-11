import { db } from '@/db/KathaDb';
import type { TimelineEvent, Story, Moment, Session, Knowledge } from '@/types/models';
import { formatDateTime } from '@/utils/formatters';

export class TimelineEngine {
  static async addEvent(event: Omit<TimelineEvent, 'id'>): Promise<void> {
    await db.timeline.add({
      ...event,
      id: crypto.randomUUID(),
    });
  }

  static async getTimeline(limit?: number): Promise<TimelineEvent[]> {
    let query = db.timeline.orderBy('date').reverse();
    if (limit) {
      query = query.limit(limit);
    }
    return await query.toArray();
  }

  static async getTimelineByType(type: TimelineEvent['type']): Promise<TimelineEvent[]> {
    return await db.timeline.where('type').equals(type).toArray();
  }

  static async getTimelineForStory(storyId: string): Promise<TimelineEvent[]> {
    return await db.timeline.where('refId').equals(storyId).toArray();
  }

  static async getTimelineByDateRange(startDate: string, endDate: string): Promise<TimelineEvent[]> {
    return await db.timeline
      .where('date')
      .between(startDate, endDate)
      .toArray();
  }

  static async createWatchEvent(storyId: string, mood?: string): Promise<void> {
    await this.addEvent({
      type: 'watch',
      refId: storyId,
      date: new Date().toISOString(),
      mood,
    });
  }

  static async createFinishEvent(storyId: string, mood?: string): Promise<void> {
    await this.addEvent({
      type: 'finish',
      refId: storyId,
      date: new Date().toISOString(),
      mood,
    });
  }

  static async createRewatchEvent(storyId: string, mood?: string): Promise<void> {
    await this.addEvent({
      type: 'rewatch',
      refId: storyId,
      date: new Date().toISOString(),
      mood,
    });
  }

  static async createMomentEvent(momentId: string, mood?: string): Promise<void> {
    await this.addEvent({
      type: 'moment',
      refId: momentId,
      date: new Date().toISOString(),
      mood,
    });
  }

  static async createKnowledgeEvent(knowledgeId: string, mood?: string): Promise<void> {
    await this.addEvent({
      type: 'knowledge',
      refId: knowledgeId,
      date: new Date().toISOString(),
      mood,
    });
  }

  static async getTimelineWithDetails(): Promise<any[]> {
    const events = await this.getTimeline();
    const enrichedEvents = [];

    for (const event of events) {
      let details = null;
      
      switch (event.type) {
        case 'watch':
        case 'finish':
        case 'rewatch':
          details = await db.stories.get(event.refId);
          break;
        case 'moment':
          details = await db.moments.get(event.refId);
          if (details) {
            const story = await db.stories.get(details.storyId);
            details = { ...details, story };
          }
          break;
        case 'knowledge':
          details = await db.knowledge.get(event.refId);
          if (details) {
            const story = await db.stories.get(details.storyId);
            details = { ...details, story };
          }
          break;
      }
      
      enrichedEvents.push({
        ...event,
        details,
        formattedDate: formatDateTime(event.date),
      });
    }
    
    return enrichedEvents;
  }

  static async getTimelineStats(): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByMood: Record<string, number>;
    recentActivity: any[];
  }> {
    const events = await this.getTimeline();
    const eventsByType: Record<string, number> = {};
    const eventsByMood: Record<string, number> = {};
    
    events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      if (event.mood) {
        eventsByMood[event.mood] = (eventsByMood[event.mood] || 0) + 1;
      }
    });
    
    const recentActivity = await this.getTimeline(10);
    
    return {
      totalEvents: events.length,
      eventsByType,
      eventsByMood,
      recentActivity,
    };
  }
}
