const BASE_URL = '/api/watchmode';

export interface WatchmodeSource {
  source_id: number;
  name: string;
  type: string; // 'sub', 'rent', 'buy', 'free'
  region: string;
  ios_url: string;
  android_url: string;
  web_url: string;
  format: string;
  price: number;
  seasons: number;
  episodes: number;
}

class WatchmodeService {
  /**
   * Gets streaming sources by TMDB ID
   * @param tmdbId The TMDB ID
   * @param type 'movie' or 'tv'
   */
  async getSourcesByTmdbId(tmdbId: string | number, type: 'movie' | 'tv'): Promise<WatchmodeSource[]> {
    if (!tmdbId) return [];
    
    try {
      const typeStr = type === 'movie' ? 'movie' : 'tv';
      // Watchmode requires the ID to be prefixed with 'tmdb_' or similar, or they have a title search endpoint.
      // The Title Details endpoint: /title/tmdb_{type}_{id}/details/
      const endpoint = `${BASE_URL}?path=/title/tmdb_${typeStr}-${tmdbId}/sources/&regions=US`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
         // Watchmode might return 404 for tmdb_type-id if not found, we just return empty
         return [];
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) return [];
      
      return data;
    } catch (error) {
      console.error('Watchmode Fetch Error:', error);
      return [];
    }
  }

  /**
   * Filters and formats sources to find the best platform and a list of all flatrate platforms.
   */
  processSources(sources: WatchmodeSource[]): { primaryPlatform: string; allSourcesText: string } {
    if (!sources || sources.length === 0) {
      return { primaryPlatform: '', allSourcesText: '' };
    }

    // Deduplicate by name
    const uniqueSourcesMap = new Map<string, WatchmodeSource>();
    sources.forEach(s => {
      // Prioritize 'sub' (flatrate) over 'buy'/'rent'
      if (!uniqueSourcesMap.has(s.name) || s.type === 'sub') {
        uniqueSourcesMap.set(s.name, s);
      }
    });

    const uniqueSources = Array.from(uniqueSourcesMap.values());
    
    // Find subscription (sub) sources
    const subSources = uniqueSources.filter(s => s.type === 'sub');
    const freeSources = uniqueSources.filter(s => s.type === 'free');
    
    // Pick the primary platform (prioritize subs, then free)
    let primaryPlatform = '';
    if (subSources.length > 0) {
      primaryPlatform = subSources[0]?.name || '';
    } else if (freeSources.length > 0) {
      primaryPlatform = freeSources[0]?.name || '';
    } else if (uniqueSources.length > 0) {
       // fallback to buy/rent if absolutely nothing else
      primaryPlatform = uniqueSources[0]?.name || '';
    }

    // Format notes text
    let notesText = '';
    if (subSources.length > 0) {
      notesText += `Streaming: ${subSources.map(s => s.name).join(', ')}\n`;
    }
    if (freeSources.length > 0) {
      notesText += `Free: ${freeSources.map(s => s.name).join(', ')}\n`;
    }

    const buyRent = uniqueSources.filter(s => s.type === 'buy' || s.type === 'rent');
    if (buyRent.length > 0) {
      notesText += `Buy/Rent: ${buyRent.map(s => s.name).join(', ')}\n`;
    }

    return {
      primaryPlatform,
      allSourcesText: notesText ? `[Where to Watch]\n${notesText.trim()}\n\n` : ''
    };
  }
}

export const watchmodeService = new WatchmodeService();
