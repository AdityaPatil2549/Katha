import { formatISO } from 'date-fns';
import { db } from '@/db/KathaDb';
import { uuid } from '@/utils/id';
import type { Moment, UUID } from '@/types/models';
import type { MomentRepository } from './MomentRepository';

export class DexieMomentRepository implements MomentRepository {
  async create(momentData: Omit<Moment, 'id'>): Promise<Moment> {
    const moment: Moment = {
      ...momentData,
      id: uuid(),
    };
    
    await db.moments.add(moment);
    return moment;
  }

  async update(id: UUID, updates: Partial<Moment>): Promise<Moment> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Moment with id ${id} not found`);
    }
    
    const updated: Moment = {
      ...existing,
      ...updates,
    };
    
    await db.moments.update(id, updated);
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    await db.transaction('rw', [db.moments, db.timeline], async () => {
      // Delete related timeline events
      await db.timeline.where('refId').equals(id).delete();
      
      // Delete the moment
      await db.moments.delete(id);
    });
  }

  async bulkUpsert(moments: Moment[]): Promise<void> {
    await db.moments.bulkPut(moments);
  }

  async findById(id: UUID): Promise<Moment | undefined> {
    return await db.moments.get(id);
  }

  async findAll(): Promise<Moment[]> {
    return await db.moments.orderBy('date').reverse().toArray();
  }

  async findByStory(storyId: UUID): Promise<Moment[]> {
    return await db.moments.where('storyId').equals(storyId).toArray();
  }

  async findByMood(mood: string): Promise<Moment[]> {
    return await db.moments.where('mood').equals(mood).toArray();
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Moment[]> {
    return await db.moments
      .where('date')
      .between(startDate, endDate)
      .toArray();
  }

  async findPrivate(): Promise<Moment[]> {
    return await db.moments.orderBy('date').reverse().filter(m => m.isPrivate === true).limit(100).toArray();
  }

  async findPublic(): Promise<Moment[]> {
    return await db.moments.orderBy('date').reverse().filter(m => m.isPrivate === false).limit(100).toArray();
  }

  async search(query: string): Promise<Moment[]> {
    const lowerQuery = query.toLowerCase();
    
    return await db.moments.orderBy('date').reverse().filter(moment => 
      (moment.quote?.toLowerCase().includes(lowerQuery) || false) ||
      (moment.character?.toLowerCase().includes(lowerQuery) || false) ||
      moment.context.toLowerCase().includes(lowerQuery) ||
      moment.thoughts.toLowerCase().includes(lowerQuery)
    ).limit(50).toArray();
  }

  async getTotalCount(): Promise<number> {
    return await db.moments.count();
  }

  async getMoodDistribution(): Promise<Array<{ mood: string; count: number }>> {
    const all = await this.findAll();
    const moodCount = new Map<string, number>();
    
    all.forEach(moment => {
      if (moment.mood) {
        const current = moodCount.get(moment.mood) || 0;
        moodCount.set(moment.mood, current + 1);
      }
    });
    
    return Array.from(moodCount.entries())
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getRecentMoments(limit: number = 10): Promise<Moment[]> {
    return await db.moments.orderBy('date').reverse().limit(limit).toArray();
  }

  async getOnThisDay(month: number, day: number): Promise<Moment[]> {
    const all = await this.findAll();
    return all.filter(moment => {
      const date = new Date(moment.date);
      return date.getMonth() + 1 === month && date.getDate() === day;
    });
  }
}
