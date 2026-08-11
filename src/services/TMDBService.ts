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
    
    try {
      const response = await fetch(
        `${BASE_URL}?path=/search/multi&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
      );
      
      if (!response.ok) throw new Error('Failed to search TMDB');
      
      const data = await response.json();
      return data.results.filter((result: any) => 
        result.media_type === 'movie' || result.media_type === 'tv'
      );
    } catch (error) {
      console.error('TMDB Search Error:', error);
      return [];
    }
  }

  async getDetails(id: number, type: 'movie' | 'tv'): Promise<TMDBDetails | null> {
    try {
      const response = await fetch(
        `${BASE_URL}?path=/${type}/${id}&language=en-US`
      );
      
      if (!response.ok) throw new Error(`Failed to fetch details for ${type} ${id}`);
      
      return await response.json();
    } catch (error) {
      console.error('TMDB Details Error:', error);
      return null;
    }
  }

  getImageUrl(path: string | null): string {
    if (!path) return '';
    return `${IMAGE_BASE_URL}${path}`;
  }


}

export const tmdbService = new TMDBService();
