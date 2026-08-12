import { tmdbService } from './TMDBService';

const BASE_URL = '/api/trakt';

export interface TraktTrendingItem {
  watchers: number;
  movie?: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      imdb: string;
      tmdb: number;
    };
    overview: string;
    rating: number;
  };
  show?: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      imdb: string;
      tmdb: number;
    };
    overview: string;
    rating: number;
  };
  // Katha-injected fields
  posterUrl?: string; 
}

export interface TraktRating {
  rating: number; // 0-10
  votes: number;
  distribution: Record<string, number>;
}

class TraktService {
  async getTrendingMovies(limit = 10): Promise<TraktTrendingItem[]> {
    try {
      const response = await fetch(`${BASE_URL}?path=/movies/trending&extended=full&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch trending movies');
      const data: TraktTrendingItem[] = await response.json();
      
      // Fetch posters from TMDB asynchronously in the background
      return await this.attachTmdbPosters(data, 'movie');
    } catch (e) {
      console.error('Trakt Fetch Error:', e);
      return [];
    }
  }

  async getTrendingShows(limit = 10): Promise<TraktTrendingItem[]> {
    try {
      const response = await fetch(`${BASE_URL}?path=/shows/trending&extended=full&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch trending shows');
      const data: TraktTrendingItem[] = await response.json();
      
      return await this.attachTmdbPosters(data, 'show');
    } catch (e) {
      console.error('Trakt Fetch Error:', e);
      return [];
    }
  }

  async getRatingByTmdbId(tmdbId: number, type: 'movie' | 'show'): Promise<TraktRating | null> {
    try {
      // Endpoint: /search/tmdb/:id?type=movie,show
      const searchRes = await fetch(`${BASE_URL}?path=/search/tmdb/${tmdbId}&type=${type}`);
      if (!searchRes.ok) return null;
      const searchData = await searchRes.json();
      
      if (!searchData || searchData.length === 0) return null;
      const traktId = searchData[0]?.[type]?.ids?.trakt;
      if (!traktId) return null;

      const ratingRes = await fetch(`${BASE_URL}?path=/${type}s/${traktId}/ratings`);
      if (!ratingRes.ok) return null;
      return await ratingRes.json();
    } catch (e) {
      console.error('Trakt Rating Error:', e);
      return null;
    }
  }

  // Trakt doesn't provide posters natively, so we map their TMDB ID back to TMDBService
  private async attachTmdbPosters(items: TraktTrendingItem[], type: 'movie' | 'show'): Promise<TraktTrendingItem[]> {
    const chunkArray = <T>(arr: T[], size: number): T[][] => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    const processItem = async (item: TraktTrendingItem) => {
      const entity = type === 'movie' ? item.movie : item.show;
      if (entity && entity.ids.tmdb) {
        try {
          // Find details on TMDB
          const tmdbDetails = await tmdbService.getDetails(entity.ids.tmdb, type === 'movie' ? 'movie' : 'tv');
          if (tmdbDetails && tmdbDetails.poster_path) {
            item.posterUrl = tmdbService.getImageUrl(tmdbDetails.poster_path);
          }
        } catch (e) {
          // Ignore individual fetch errors
        }
      }
      return item;
    };

    const result: TraktTrendingItem[] = [];
    const chunks = chunkArray(items, 5); // Batch size of 5 to avoid TMDB 429 errors

    for (const chunk of chunks) {
      const processedChunk = await Promise.all(chunk.map(processItem));
      result.push(...processedChunk);
    }

    return result;
  }
}

export const traktService = new TraktService();
