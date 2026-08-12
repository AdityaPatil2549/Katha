import { dbService } from '@/db/DatabaseService';

const BASE_URL = '/api/jikan';

export interface JikanSearchResult {
  mal_id: number;
  title: string;
  title_english: string;
  title_japanese: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  type: string;
  episodes: number;
  status: string;
  score: number;
  year: number;
  synopsis: string;
  genres: { name: string }[];
  studios: { name: string }[];
}

class JikanService {
  async search(query: string): Promise<JikanSearchResult[]> {
    if (!query.trim()) return [];
    
    const cacheKey = `jikan_search_${query.toLowerCase()}`;
    const cached = await dbService.apiCache.get(cacheKey);
    if (cached) return cached;

    // Respect Jikan rate limit (3 req/s) — only on cache miss before real request.
    await new Promise(resolve => setTimeout(resolve, 350));

    try {
      
      const response = await fetch(`${BASE_URL}?path=/anime&q=${encodeURIComponent(query)}&limit=10`);
      
      if (!response.ok) throw new Error('Failed to search Jikan');
      
      const data = await response.json();
      const results = data.data || [];
      
      await dbService.apiCache.set(cacheKey, 'jikan', results);
      return results;
    } catch (error) {
      console.error('Jikan Search Error:', error);
      return [];
    }
  }


}

export const jikanService = new JikanService();
