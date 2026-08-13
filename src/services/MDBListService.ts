import { dbService } from '@/db/DatabaseService';

export interface MDBListRating {
  source: string; // "imdb", "tmdb", "metacritic", "letterboxd", "trakt", "tomatoes"
  value: number;
  score: number;
  votes: number;
}

export interface MDBListResult {
  title: string;
  year: number;
  description: string;
  ratings: MDBListRating[];
  response?: string | boolean;
  error?: string;
}

class MDBListService {
  /**
   * Fetches rich aggregated ratings for a given TMDB id or IMDB id.
   */
  async getRatings(id: string | number): Promise<MDBListResult | null> {
    const cacheKey = `mdblist_${id}`;
    const cached = await dbService.apiCache.get(cacheKey);
    
    if (cached && !cached.isStale) return cached.data;
    if (!navigator.onLine) return cached?.data || null;

    try {
      // Pass the ID to the edge proxy. The proxy handles determining if it's IMDB (tt...) or TMDB.
      const res = await fetch(`/api/mdblist?id=${id}`);
      if (!res.ok) throw new Error(`MDBList proxy failed with status ${res.status}`);
      
      const data = await res.json();
      
      if (data.response === 'False' || data.error) {
        throw new Error(data.error || 'MDBList not found');
      }

      await dbService.apiCache.set(cacheKey, 'mdblist', data);
      return data;
    } catch (error) {
      console.warn('MDBList fetch failed:', error);
      return null;
    }
  }
}

export const mdblistService = new MDBListService();
