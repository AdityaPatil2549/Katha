const BASE_URL = '/api/omdb';

export interface OMDBDetails {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: {
    Source: string;
    Value: string;
  }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  totalSeasons?: string;
  Response: string;
}

class OMDBService {
  async getByImdbId(imdbId: string): Promise<OMDBDetails | null> {
    if (!imdbId) return null;
    try {
      const response = await fetch(`${BASE_URL}?i=${imdbId}`);
      if (!response.ok) throw new Error('Failed to fetch OMDB data');
      const data = await response.json();
      if (data.Response === 'False') return null;
      return data;
    } catch (error) {
      console.error('OMDB Fetch Error:', error);
      return null;
    }
  }

  async getByTitle(title: string, year?: string): Promise<OMDBDetails | null> {
    if (!title) return null;
    try {
      let url = `${BASE_URL}?t=${encodeURIComponent(title)}`;
      if (year) {
        url += `&y=${year}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch OMDB data');
      const data = await response.json();
      if (data.Response === 'False') return null;
      return data;
    } catch (error) {
      console.error('OMDB Fetch Error:', error);
      return null;
    }
  }

  formatRatingsString(details: OMDBDetails): string {
    if (!details.Ratings || details.Ratings.length === 0) return '';
    return details.Ratings.map(r => `${r.Source}: ${r.Value}`).join(' | ');
  }
}

export const omdbService = new OMDBService();
