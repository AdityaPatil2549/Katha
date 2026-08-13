import { dbService } from '@/db/DatabaseService';

const BASE_URL = 'https://api.tvmaze.com';

export interface TVMazeResult {
  score: number;
  show: {
    id: number;
    name: string;
    type: string; // "Documentary", "Scripted", etc.
    genres: string[];
    premiered: string;
    rating: { average: number | null };
    image: { medium: string; original: string } | null;
    summary: string;
  };
}

class TVMazeService {
  async search(query: string): Promise<TVMazeResult[]> {
    if (!query.trim()) return [];
    
    const cacheKey = `tvmaze_search_${query.toLowerCase()}`;
    const cached = await dbService.apiCache.get(cacheKey);
    
    if (cached && !cached.isStale) return cached.data;
    if (!navigator.onLine) {
      if (cached) return cached.data;
      throw new Error('Offline and no cached results');
    }

    const fetchPromise = fetch(`${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('TVMaze search failed');
        const results = await res.json();
        await dbService.apiCache.set(cacheKey, 'tvmaze', results);
        return results;
      }).catch(err => {
        console.error('TVMaze Search Error:', err);
        return [];
      });

    if (cached) return cached.data;
    return fetchPromise;
  }
}

export const tvmazeService = new TVMazeService();
