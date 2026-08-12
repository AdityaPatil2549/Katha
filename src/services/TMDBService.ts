import { dbService } from '@/db/DatabaseService';

const BASE_URL = '/api/tmdb';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv';
  poster_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  vote_average: number;
}

export interface TMDBDetails {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
}

class TMDBService {

  async search(query: string): Promise<TMDBResult[]> {
    if (!query.trim()) return [];
    
    const cacheKey = `tmdb_search_${query.toLowerCase()}`;
    const cached = await dbService.apiCache.get(cacheKey);
    
    // Return cache immediately if valid
    if (cached && !cached.isStale) return cached.data;
    
    // If offline, return stale cache if we have it, else empty
    if (!navigator.onLine) {
      if (cached) return cached.data;
      throw new Error('You are offline and no cached search results exist.');
    }
    
    // Background fetch logic for SWR
    const fetchPromise = fetch(
      `${BASE_URL}?path=/search/multi&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
    ).then(async (response) => {
      if (!response.ok) throw new Error('Failed to search TMDB');
      const data = await response.json();
      const results = data.results.filter((result: any) => 
        result.media_type === 'movie' || result.media_type === 'tv'
      );
      await dbService.apiCache.set(cacheKey, 'tmdb', results);
      return results;
    }).catch(error => {
      console.error('TMDB Search Error:', error);
      return [];
    });

    // If we had stale cache, return it immediately while fetchPromise runs in background
    if (cached) return cached.data;
    
    // Otherwise, we must wait for the fetch
    return fetchPromise;
  }

  async getDetails(id: number, type: 'movie' | 'tv'): Promise<TMDBDetails | null> {
    const cacheKey = `tmdb_details_${type}_${id}`;
    const cached = await dbService.apiCache.get(cacheKey);
    
    // Return cache immediately if valid
    if (cached && !cached.isStale) return cached.data;
    
    // If offline, return stale cache if we have it, else fail
    if (!navigator.onLine) {
      if (cached) return cached.data;
      throw new Error('You are offline and no cached details exist.');
    }
    
    // Background fetch logic for SWR
    const fetchPromise = fetch(
      `${BASE_URL}?path=/${type}/${id}&language=en-US`
    ).then(async (response) => {
      if (!response.ok) throw new Error(`Failed to fetch details for ${type} ${id}`);
      const data = await response.json();
      await dbService.apiCache.set(cacheKey, 'tmdb', data);
      return data;
    }).catch(error => {
      console.error('TMDB Details Error:', error);
      return null;
    });

    // If we had stale cache, return it immediately while fetchPromise runs in background
    if (cached) return cached.data;
    
    // Otherwise, wait for fetch
    return fetchPromise;
  }

  getImageUrl(path: string | null): string {
    if (!path) return '';
    return `${IMAGE_BASE_URL}${path}`;
  }


}

export const tmdbService = new TMDBService();
