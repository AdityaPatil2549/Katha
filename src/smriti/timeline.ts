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
    
    // Collect all IDs needed for bulk fetching
    const watchIds = new Set<string>();
    const momentIds = new Set<string>();
    const knowledgeIds = new Set<string>();
    
    events.forEach(event => {
      switch (event.type) {
        case 'watch':
        case 'finish':
        case 'rewatch':
          watchIds.add(event.refId);
          break;
        case 'moment':
          momentIds.add(event.refId);
          break;
        case 'knowledge':
          knowledgeIds.add(event.refId);
          break;
      }
    });

    // Bulk fetch primary details
    const [stories, moments, knowledge] = await Promise.all([
      db.stories.where('id').anyOf([...watchIds]).toArray(),
      db.moments.where('id').anyOf([...momentIds]).toArray(),
      db.knowledge.where('id').anyOf([...knowledgeIds]).toArray(),
    ]);

    // Create lookup maps for fast O(1) matching
    const storyMap = new Map(stories.map(s => [s.id, s]));
    const momentMap = new Map(moments.map(m => [m.id, m]));
    const knowledgeMap = new Map(knowledge.map(k => [k.id, k]));

    // Now, we need the stories for the moments and knowledge!
    // Since we only know them after fetching, we do a second pass for those parent stories.
    const parentStoryIds = new Set<string>();
    moments.forEach(m => parentStoryIds.add(m.storyId));
    knowledge.forEach(k => parentStoryIds.add(k.storyId));
    
    const parentStories = await db.stories.where('id').anyOf([...parentStoryIds]).toArray();
    const parentStoryMap = new Map(parentStories.map(s => [s.id, s]));

    // Reconstruct the array without N+1 loops
    return events.map(event => {
      let details = null;
      
      switch (event.type) {
        case 'watch':
        case 'finish':
        case 'rewatch':
          details = storyMap.get(event.refId) || null;
          break;
        case 'moment': {
          const moment = momentMap.get(event.refId);
          if (moment) {
            details = { ...moment, story: parentStoryMap.get(moment.storyId) || null };
          }
          break;
        }
        case 'knowledge': {
          const know = knowledgeMap.get(event.refId);
          if (know) {
            details = { ...know, story: parentStoryMap.get(know.storyId) || null };
          }
          break;
        }
      }
      
      return {
        ...event,
        details,
        formattedDate: formatDateTime(event.date),
      };
    });
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
