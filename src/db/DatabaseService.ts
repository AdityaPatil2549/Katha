import { DexieStoryRepository } from './repositories/DexieStoryRepository';
import { DexieMomentRepository } from './repositories/DexieMomentRepository';
import { DexieSessionRepository } from './repositories/DexieSessionRepository';
import { DexieKnowledgeRepository } from './repositories/DexieKnowledgeRepository';
import { DexieTimelineRepository } from './repositories/DexieTimelineRepository';
import { FirestoreStoryRepository } from './repositories/FirestoreStoryRepository';
import { FirestoreMomentRepository } from './repositories/FirestoreMomentRepository';
import type { 
  StoryRepository, 
  MomentRepository, 
  SessionRepository, 
  KnowledgeRepository, 
  TimelineRepository 
} from './repositories';

export class DatabaseService {
  private _stories: StoryRepository;
  private _moments: MomentRepository;
  private _sessions: SessionRepository;
  private _knowledge: KnowledgeRepository;
  private _timeline: TimelineRepository;
  
  private userId: string | null = null;

  constructor() {
    this._stories = new DexieStoryRepository();
    this._moments = new DexieMomentRepository();
    this._sessions = new DexieSessionRepository();
    this._knowledge = new DexieKnowledgeRepository();
    this._timeline = new DexieTimelineRepository();
  }

  public setUserId(userId: string | null) {
    if (this.userId === userId) return;
    this.userId = userId;

    if (userId) {
      this._stories = new FirestoreStoryRepository(userId);
      this._moments = new FirestoreMomentRepository(userId);
      // Fallback to local for others until fully migrated
      this._sessions = new DexieSessionRepository();
      this._knowledge = new DexieKnowledgeRepository();
      this._timeline = new DexieTimelineRepository();
    } else {
      this._stories = new DexieStoryRepository();
      this._moments = new DexieMomentRepository();
      this._sessions = new DexieSessionRepository();
      this._knowledge = new DexieKnowledgeRepository();
      this._timeline = new DexieTimelineRepository();
    }
  }

  get stories() { return this._stories; }
  get moments() { return this._moments; }
  get sessions() { return this._sessions; }
  get knowledge() { return this._knowledge; }
  get timeline() { return this._timeline; }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      await this.stories.getTotalWatchTime(); // Just a lightweight check
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Get storage usage
  async getStorageUsage(): Promise<{
    stories: number;
    moments: number;
    sessions: number;
    knowledge: number;
    timeline: number;
    total: number;
  }> {
    const { db } = await import('@/db/KathaDb');
    
    const [stories, moments, sessions, knowledge, timeline] = await Promise.all([
      db.stories.count(),
      db.moments.count(),
      db.sessions.count(),
      db.knowledge.count(),
      db.timeline.count(),
    ]);
    
    return {
      stories,
      moments,
      sessions,
      knowledge,
      timeline,
      total: stories + moments + sessions + knowledge + timeline,
    };
  }

  // Clear all data (for reset/export purposes)
  async clearAll(): Promise<void> {
    const { db } = await import('@/db/KathaDb');
    
    await Promise.all([
      db.stories.clear(),
      db.moments.clear(),
      db.sessions.clear(),
      db.knowledge.clear(),
      db.timeline.clear(),
    ]);
  }
}

// Singleton instance
export const dbService = new DatabaseService();
