import { dbService } from '@/db/DatabaseService';

export interface FanartResult {
  name: string;
  tmdb_id: string;
  movieposter?: Array<{ url: string; likes: number }>;
  tvposter?: Array<{ url: string; likes: number }>;
  hdmovieclearart?: Array<{ url: string }>;
  hdtvclearart?: Array<{ url: string }>;
}

class FanartService {
  async getImages(id: string | number, type: 'movies' | 'tv'): Promise<FanartResult | null> {
    const cacheKey = `fanart_${type}_${id}`;
    const cached = await dbService.apiCache.get(cacheKey);
    
    if (cached && !cached.isStale) return cached.data;
    if (!navigator.onLine) return cached?.data || null;

    try {
      const res = await fetch(`/api/fanart?type=${type}&id=${id}`);
      if (!res.ok) throw new Error('Fanart proxy failed');
      const data = await res.json();
      
      await dbService.apiCache.set(cacheKey, 'fanart', data);
      return data;
    } catch (error) {
      console.warn('Fanart fetch failed:', error);
      return null;
    }
  }

  /**
   * Helper to get the most liked poster URL
   */
  getBestPoster(data: FanartResult | null, type: 'movies' | 'tv'): string | null {
    if (!data) return null;
    const posters = type === 'movies' ? data.movieposter : data.tvposter;
    if (!posters || posters.length === 0) return null;
    
    // Sort by likes, descending
    posters.sort((a, b) => b.likes - a.likes);
    return posters[0]?.url || null;
  }
}

export const fanartService = new FanartService();
