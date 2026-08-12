import { dbService } from '@/db/DatabaseService';

const BASE_URL = '/api/youtube';

export interface YouTubeSearchResult {
  id: string; // Video ID
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface YouTubeVideoDetails extends YouTubeSearchResult {
  durationMinutes: number;
  viewCount: string;
}

class YouTubeService {
  async search(query: string): Promise<YouTubeSearchResult[]> {
    if (!query.trim()) return [];
    
    const cacheKey = `youtube_search_${query.toLowerCase()}`;
    const cached = await dbService.apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${BASE_URL}?path=/search&part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10`
      );
      
      if (!response.ok) throw new Error('Failed to search YouTube');
      
      const data = await response.json();
      const results = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt
      }));
      
      await dbService.apiCache.set(cacheKey, 'youtube', results);
      return results;
    } catch (error) {
      console.error('YouTube Search Error:', error);
      return [];
    }
  }

  async getVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null> {
    if (!videoId) return null;
    
    const cacheKey = `youtube_details_${videoId}`;
    const cached = await dbService.apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${BASE_URL}?path=/videos&part=snippet,contentDetails,statistics&id=${videoId}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch YouTube details');
      
      const data = await response.json();
      if (!data.items || data.items.length === 0) return null;
      
      const item = data.items[0];
      
      const details = {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        durationMinutes: this.parseYouTubeDuration(item.contentDetails.duration),
        viewCount: item.statistics?.viewCount || '0'
      };
      
      await dbService.apiCache.set(cacheKey, 'youtube', details);
      return details;
    } catch (error) {
      console.error('YouTube Details Error:', error);
      return null;
    }
  }

  private parseYouTubeDuration(duration: string): number {
    // Format: PT#H#M#S
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    // Round up if seconds > 30
    let totalMinutes = (hours * 60) + minutes;
    if (seconds > 30) totalMinutes += 1;
    
    return totalMinutes;
  }


}

export const youtubeService = new YouTubeService();
