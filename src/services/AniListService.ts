import { dbService } from '@/db/DatabaseService';

const BASE_URL = 'https://graphql.anilist.co';

export interface AniListResult {
  id: number;
  title: {
    romaji: string;
    english?: string;
    native?: string;
  };
  coverImage: {
    large: string;
  };
  startDate: {
    year: number;
  };
  description: string;
  genres: string[];
  averageScore: number;
}

class AniListService {
  async search(query: string): Promise<AniListResult[]> {
    if (!query.trim()) return [];
    
    const cacheKey = `anilist_search_${query.toLowerCase()}`;
    const cached = await dbService.apiCache.get(cacheKey);
    
    if (cached && !cached.isStale) return cached.data;
    if (!navigator.onLine) {
      if (cached) return cached.data;
      throw new Error('Offline and no cached results');
    }

    const graphqlQuery = `
      query ($search: String) {
        Page(page: 1, perPage: 5) {
          media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
            startDate {
              year
            }
            description
            genres
            averageScore
          }
        }
      }
    `;

    const fetchPromise = fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { search: query }
      })
    }).then(async (res) => {
      if (!res.ok) throw new Error('AniList search failed');
      const json = await res.json();
      const results = json.data?.Page?.media || [];
      await dbService.apiCache.set(cacheKey, 'anilist', results);
      return results;
    }).catch(err => {
      console.error('AniList Search Error:', err);
      return [];
    });

    if (cached) return cached.data;
    return fetchPromise;
  }
}

export const anilistService = new AniListService();
