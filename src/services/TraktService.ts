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

export const FALLBACK_TRENDING_MOVIES: TraktTrendingItem[] = [
  {
    watchers: 1420,
    movie: {
      title: 'Dune: Part Two',
      year: 2024,
      ids: { trakt: 602330, slug: 'dune-part-two-2024', imdb: 'tt15239678', tmdb: 693134 },
      overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
      rating: 8.6,
    },
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'
  },
  {
    watchers: 1280,
    movie: {
      title: 'Oppenheimer',
      year: 2023,
      ids: { trakt: 618525, slug: 'oppenheimer-2023', imdb: 'tt15398776', tmdb: 872585 },
      overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
      rating: 8.4,
    },
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg'
  },
  {
    watchers: 950,
    movie: {
      title: 'Interstellar',
      year: 2014,
      ids: { trakt: 117860, slug: 'interstellar-2014', imdb: 'tt0816692', tmdb: 157336 },
      overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',
      rating: 8.7,
    },
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
  },
  {
    watchers: 890,
    movie: {
      title: 'Spirited Away',
      year: 2001,
      ids: { trakt: 562, slug: 'spirited-away-2001', imdb: 'tt0245429', tmdb: 129 },
      overview: 'A 10-year-old girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.',
      rating: 8.6,
    },
    posterUrl: 'https://image.tmdb.org/t/p/w500/393mhwp6KYda7O72rOpkK2o6Zdp.jpg'
  },
  {
    watchers: 820,
    movie: {
      title: 'Past Lives',
      year: 2023,
      ids: { trakt: 746817, slug: 'past-lives-2023', imdb: 'tt13238346', tmdb: 666277 },
      overview: 'Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Nora’s family emigrates from South Korea.',
      rating: 8.1,
    },
    posterUrl: 'https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg'
  }
];

export const FALLBACK_TRENDING_SHOWS: TraktTrendingItem[] = [
  {
    watchers: 1350,
    show: {
      title: 'Severance',
      year: 2022,
      ids: { trakt: 154747, slug: 'severance', imdb: 'tt11280740', tmdb: 95396 },
      overview: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.',
      rating: 8.7,
    },
    posterUrl: 'https://image.tmdb.org/t/p/w500/b7w1VvF94yO3hF1Hk8z0LgG0qK.jpg'
  },
  {
    watchers: 1200,
    show: {
      title: 'Shōgun',
      year: 2024,
      ids: { trakt: 139198, slug: 'shogun-2024', imdb: 'tt2788316', tmdb: 126308 },
      overview: 'When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power.',
      rating: 8.8,
    },
    posterUrl: 'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg'
  },
  {
    watchers: 990,
    show: {
      title: 'Vinland Saga',
      year: 2019,
      ids: { trakt: 139556, slug: 'vinland-saga', imdb: 'tt10233448', tmdb: 88719 },
      overview: 'Thorfinn pursues a journey with his father’s killer in order to take revenge and end that life in a duel as an honorable warrior.',
      rating: 8.8,
    },
    posterUrl: 'https://image.tmdb.org/t/p/w500/ve72VxNqjGM69UmK1N85R4tqgP2.jpg'
  },
  {
    watchers: 870,
    show: {
      title: 'Succession',
      year: 2018,
      ids: { trakt: 126839, slug: 'succession', imdb: 'tt7660850', tmdb: 76331 },
      overview: 'The Roy family is known for controlling the biggest media and entertainment company in the world.',
      rating: 8.9,
    },
    posterUrl: 'https://image.tmdb.org/t/p/w500/7tbBEb9pP4t17H5oW24H6qJbA7v.jpg'
  }
];

class TraktService {
  async getTrendingMovies(limit = 10): Promise<TraktTrendingItem[]> {
    try {
      const response = await fetch(`${BASE_URL}?path=/movies/trending&extended=full&limit=${limit}`);
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        return FALLBACK_TRENDING_MOVIES.slice(0, limit);
      }
      const data: TraktTrendingItem[] = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        return FALLBACK_TRENDING_MOVIES.slice(0, limit);
      }
      
      // Fetch posters from TMDB asynchronously in the background
      return await this.attachTmdbPosters(data, 'movie');
    } catch (e) {
      console.warn('Trakt API unavailable, using offline curated trends:', e);
      return FALLBACK_TRENDING_MOVIES.slice(0, limit);
    }
  }

  async getTrendingShows(limit = 10): Promise<TraktTrendingItem[]> {
    try {
      const response = await fetch(`${BASE_URL}?path=/shows/trending&extended=full&limit=${limit}`);
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        return FALLBACK_TRENDING_SHOWS.slice(0, limit);
      }
      const data: TraktTrendingItem[] = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        return FALLBACK_TRENDING_SHOWS.slice(0, limit);
      }
      
      return await this.attachTmdbPosters(data, 'show');
    } catch (e) {
      console.warn('Trakt API unavailable, using offline curated trends:', e);
      return FALLBACK_TRENDING_SHOWS.slice(0, limit);
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
