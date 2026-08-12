import { dbService } from '@/db/DatabaseService';

const BASE_URL = '/api/rawg';

export interface RawgSearchResult {
  id: number;
  name: string;
  background_image: string | null;
  released: string;
  rating: number;
  playtime: number;
  metacritic: number | null;
  genres: { id: number; name: string }[];
}

class RawgService {
  async search(query: string): Promise<RawgSearchResult[]> {
    if (!query.trim()) return [];
    
    const cacheKey = `rawg_search_${query.toLowerCase()}`;
    const cached = await dbService.apiCache.get(cacheKey);
    if (cached) return cached;

    // Respect RAWG rate limits — only on cache miss before real request.
    await new Promise(resolve => setTimeout(resolve, 350));

    try {
      
      const response = await fetch(`${BASE_URL}?path=/games&search=${encodeURIComponent(query)}&page_size=10`);
      
      if (!response.ok) throw new Error('Failed to search RAWG');
      
      const data = await response.json();
      const results = data.results || [];
      
      await dbService.apiCache.set(cacheKey, 'rawg', results);
      return results;
    } catch (error) {
      console.error('RAWG Search Error:', error);
      return [];
    }
  }
}

export const rawgService = new RawgService();
