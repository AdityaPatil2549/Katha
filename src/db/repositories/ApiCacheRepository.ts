import { db } from '../KathaDb';
import type { ApiCacheEntry } from '@/types/models';

const CACHE_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export class ApiCacheRepository {
  
  async get(id: string, staleThresholdMs = 24 * 60 * 60 * 1000): Promise<{ data: any; isStale: boolean } | null> {
    try {
      const entry = await db.apiCache.get(id);
      if (!entry) return null;
      
      const age = Date.now() - entry.timestamp;

      // Hard expiration (Delete and return null)
      if (age > CACHE_EXPIRATION_MS) {
        await this.delete(id);
        return null;
      }
      
      // Stale-While-Revalidate (Return data, but flag for background refetch)
      const isStale = age > staleThresholdMs;
      
      return { data: entry.data, isStale };
    } catch (error) {
      console.error('Failed to get from ApiCache:', error);
      return null;
    }
  }

  async set(id: string, service: string, data: any): Promise<void> {
    try {
      await db.apiCache.put({
        id,
        service,
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to set ApiCache:', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.apiCache.delete(id);
    } catch (error) {
      console.error('Failed to delete from ApiCache:', error);
    }
  }

  async clearExpired(): Promise<void> {
    try {
      const threshold = Date.now() - CACHE_EXPIRATION_MS;
      await db.apiCache.where('timestamp').below(threshold).delete();
    } catch (error) {
      console.error('Failed to clear expired ApiCache:', error);
    }
  }
}
