import { dbService } from '@/db/DatabaseService';

const BASE_URL = 'https://kitsu.io/api/edge';

export interface KitsuResult {
  id: string;
  type: string;
  attributes: {
    createdAt: string;
    synopsis: string;
    titles: {
      en?: string;
      en_jp?: string;
      ja_jp?: string;
    };
    canonicalTitle: string;
    averageRating: string;
    startDate: string;
    posterImage: {
      tiny: string;
      small: string;
      medium: string;
      large: string;
      original: string;
    };
  };
}

class KitsuService {
  async search(query: string): Promise<KitsuResult[]> {
    if (!query.trim()) return [];
    
    const cacheKey = `kitsu_search_${query.toLowerCase()}`;
    const cached = await dbService.apiCache.get(cacheKey);
    
    if (cached && !cached.isStale) return cached.data;
    if (!navigator.onLine) {
      if (cached) return cached.data;
      throw new Error('Offline and no cached results');
    }

    const fetchPromise = fetch(`${BASE_URL}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=5`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Kitsu search failed');
        const json = await res.json();
        const results = json.data || [];
        await dbService.apiCache.set(cacheKey, 'kitsu', results);
        return results;
      }).catch(err => {
        console.error('Kitsu Search Error:', err);
        return [];
      });

    if (cached) return cached.data;
    return fetchPromise;
  }
}

export const kitsuService = new KitsuService();
