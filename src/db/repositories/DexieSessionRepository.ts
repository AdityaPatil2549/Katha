import { formatISO, eachDayOfInterval, isSameDay } from 'date-fns';
import { db } from '@/db/KathaDb';
import { uuid } from '@/utils/id';
import type { Session, UUID } from '@/types/models';
import type { SessionRepository } from './SessionRepository';

export class DexieSessionRepository implements SessionRepository {
  async create(sessionData: Omit<Session, 'id'>): Promise<Session> {
    const session: Session = {
      ...sessionData,
      id: uuid(),
    };
    
    await db.sessions.add(session);
    return session;
  }

  async update(id: UUID, updates: Partial<Session>): Promise<Session> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Session with id ${id} not found`);
    }
    
    const updated: Session = {
      ...existing,
      ...updates,
    };
    
    await db.sessions.update(id, updated);
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    // Delete related timeline events
    await db.timeline.where('refId').equals(id).delete();
    
    // Delete the session
    await db.sessions.delete(id);
  }

  async bulkUpsert(sessions: Session[]): Promise<void> {
    await db.sessions.bulkPut(sessions);
  }

  async findById(id: UUID): Promise<Session | undefined> {
    return await db.sessions.get(id);
  }

  async findAll(): Promise<Session[]> {
    return await db.sessions.orderBy('date').reverse().toArray();
  }

  async findByStory(storyId: UUID): Promise<Session[]> {
    return await db.sessions.where('storyId').equals(storyId).toArray();
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Session[]> {
    return await db.sessions
      .where('date')
      .between(startDate, endDate)
      .toArray();
  }

  async findByMood(mood: string): Promise<Session[]> {
    return await db.sessions.filter(session => session.mood === mood).toArray();
  }

  async getTotalWatchTime(): Promise<number> {
    const sessions = await this.findAll();
    return sessions.reduce((total, session) => total + session.duration, 0);
  }

  async getTotalSessions(): Promise<number> {
    return await db.sessions.count();
  }

  async getAverageSessionDuration(): Promise<number> {
    const sessions = await this.findAll();
    if (sessions.length === 0) return 0;
    
    const total = sessions.reduce((sum, session) => sum + session.duration, 0);
    return Math.round(total / sessions.length);
  }

  async getMoodDistribution(): Promise<Array<{ mood: string; count: number }>> {
    const all = await this.findAll();
    const moodCount = new Map<string, number>();
    
    all.forEach(session => {
      if (session.mood) {
        const current = moodCount.get(session.mood) || 0;
        moodCount.set(session.mood, current + 1);
      }
    });
    
    return Array.from(moodCount.entries())
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getRecentSessions(limit: number = 10): Promise<Session[]> {
    return await db.sessions.orderBy('date').reverse().limit(limit).toArray();
  }

  async getWatchStreak(): Promise<number> {
    const sessions = await this.findAll();
    if (sessions.length === 0) return 0;
    
    // Sort sessions by date
    const sortedDates = sessions
      .map(s => new Date(s.date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const sessionDate of sortedDates) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - streak);
      checkDate.setHours(0, 0, 0, 0);
      
      if (isSameDay(sessionDate, checkDate)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  async getMostActiveDay(): Promise<{ date: string; duration: number } | null> {
    const sessions = await this.findAll();
    if (sessions.length === 0) return null;
    
    // Group sessions by date
    const dailyDuration = new Map<string, number>();
    
    sessions.forEach(session => {
      const date = (session.date ? session.date.split('T')[0] : formatISO(new Date()).split('T')[0]) || '';
      const current = dailyDuration.get(date) || 0;
      dailyDuration.set(date, current + session.duration);
    });
    
    // Find the day with most watch time
    let maxDuration = 0;
    let maxDate = '';
    
    for (const [date, duration] of dailyDuration.entries()) {
      if (duration > maxDuration) {
        maxDuration = duration;
        maxDate = date;
      }
    }
    
    return maxDate ? { date: maxDate, duration: maxDuration } : null;
  }
}
