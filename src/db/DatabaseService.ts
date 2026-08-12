import { DexieStoryRepository } from './repositories/DexieStoryRepository';
import { DexieMomentRepository } from './repositories/DexieMomentRepository';
import { DexieSessionRepository } from './repositories/DexieSessionRepository';
import { DexieKnowledgeRepository } from './repositories/DexieKnowledgeRepository';
import { DexieTimelineRepository } from './repositories/DexieTimelineRepository';
import { ApiCacheRepository } from './repositories/ApiCacheRepository';
import { FirestoreStoryRepository } from './repositories/FirestoreStoryRepository';
import { FirestoreMomentRepository } from './repositories/FirestoreMomentRepository';
import { FirestoreSessionRepository } from './repositories/FirestoreSessionRepository';
import { FirestoreKnowledgeRepository } from './repositories/FirestoreKnowledgeRepository';
import { FirestoreTimelineRepository } from './repositories/FirestoreTimelineRepository';
import { SyncingStoryRepository } from './repositories/SyncingStoryRepository';
import { SyncingMomentRepository } from './repositories/SyncingMomentRepository';
import { SyncingSessionRepository } from './repositories/SyncingSessionRepository';
import { SyncingKnowledgeRepository } from './repositories/SyncingKnowledgeRepository';
import { SyncingTimelineRepository } from './repositories/SyncingTimelineRepository';
import { syncManager } from './SyncManager';
import { db } from '@/lib/firebase';
import type { 
  StoryRepository, 
  MomentRepository, 
  SessionRepository, 
  KnowledgeRepository, 
  TimelineRepository 
} from './repositories';

export class DatabaseService {
  private _stories: SyncingStoryRepository;
  private _moments: SyncingMomentRepository;
  private _sessions: SessionRepository;
  private _knowledge: KnowledgeRepository;
  private _timeline: TimelineRepository;
  private _apiCache: ApiCacheRepository;
  
  private userId: string | null = null;

  constructor() {
    this._stories = new SyncingStoryRepository(new DexieStoryRepository(), null);
    this._moments = new SyncingMomentRepository(new DexieMomentRepository(), null);
    this._sessions = new SyncingSessionRepository(new DexieSessionRepository(), null);
    this._knowledge = new SyncingKnowledgeRepository(new DexieKnowledgeRepository(), null);
    this._timeline = new SyncingTimelineRepository(new DexieTimelineRepository(), null);
    
    this._apiCache = new ApiCacheRepository();

    // Start background sync queue processor
    if (typeof window !== 'undefined') {
      syncManager.startBackgroundSync();
    }

    // Proactively remove expired API cache entries on every app start.
    this._apiCache.clearExpired().catch(err =>
      console.warn('ApiCache cleanup failed:', err)
    );
  }

  public setUserId(userId: string | null) {
    if (this.userId === userId) return;
    this.userId = userId;

    if (userId && db) {
      // Connect Cloud Repositories to the Syncing Repositories
      this._stories.setCloudRepo(new FirestoreStoryRepository(userId));
      this._moments.setCloudRepo(new FirestoreMomentRepository(userId));
      (this._sessions as SyncingSessionRepository).setCloudRepo(new FirestoreSessionRepository(userId));
      (this._knowledge as SyncingKnowledgeRepository).setCloudRepo(new FirestoreKnowledgeRepository(userId));
      (this._timeline as SyncingTimelineRepository).setCloudRepo(new FirestoreTimelineRepository(userId));
    } else {
      // Disconnect Cloud Repositories
      this._stories.setCloudRepo(null);
      this._moments.setCloudRepo(null);
      (this._sessions as SyncingSessionRepository).setCloudRepo(null);
      (this._knowledge as SyncingKnowledgeRepository).setCloudRepo(null);
      (this._timeline as SyncingTimelineRepository).setCloudRepo(null);
    }
  }

  get stories() { return this._stories; }
  get moments() { return this._moments; }
  get sessions() { return this._sessions; }
  get knowledge() { return this._knowledge; }
  get timeline() { return this._timeline; }
  get apiCache() { return this._apiCache; }

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
