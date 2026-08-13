import { tmdbService, type TMDBDetails } from './TMDBService';
import { omdbService, type OMDBDetails } from './OMDBService';
import { youtubeService } from './YouTubeService';
import { jikanService } from './JikanService';
import { rawgService } from './RawgService';
import { anilistService } from './AniListService';
import { tvmazeService } from './TVMazeService';
import { kitsuService } from './KitsuService';

// ─── Unified search result shape ─────────────────────────────────────────────
export interface KathaSearchResult {
  id: string | number;
  title: string;
  posterUrl: string;
  releaseYear: string | null;
  mediaType: 'movie' | 'tv' | 'anime' | 'game' | 'youtube';
  overview: string;
  source: 'tmdb' | 'jikan' | 'rawg' | 'youtube';
  extra?: Record<string, unknown>;
}

// ─── Rich aggregated media object ────────────────────────────────────────────
export interface KathaMediaObject {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'anime' | 'game' | 'youtube' | 'book';
  posterUrl: string | null;
  overview: string;
  releaseYear: number | null;
  genres: string[];
  ratings: {
    tmdb?: number;
    imdb?: string;
    rottenTomatoes?: string;
    metacritic?: string;
  };
  trailerUrl?: string;
  rawDetails: {
    tmdb?: TMDBDetails;
    omdb?: OMDBDetails;
  };
}

class MediaService {

  /**
   * Unified search across TMDB (movies/tv), Jikan (anime), RAWG (games),
   * and YouTube. YouTube is only searched when explicitly requested —
   * never when category === 'all', to preserve API quota.
   */
  async search(
    query: string,
    category: 'movie' | 'tv' | 'anime' | 'game' | 'youtube' | 'all' = 'all'
  ): Promise<KathaSearchResult[]> {
    if (!query.trim()) return [];

    const results: KathaSearchResult[] = [];

    try {
      if (category === 'movie' || category === 'tv' || category === 'all') {
        const tmdbRes = await tmdbService.search(query);
        results.push(
          ...tmdbRes.map(item => ({
            id: item.id,
            title: item.title ?? item.name ?? '',
            posterUrl: tmdbService.getImageUrl(item.poster_path),
            releaseYear: (item.release_date ?? item.first_air_date)?.split('-')[0] ?? null,
            mediaType: (item.media_type ?? category) as KathaSearchResult['mediaType'],
            overview: item.overview,
            source: 'tmdb' as const,
          }))
        );
      }

      if (category === 'anime' || category === 'all') {
        const jikanRes = await jikanService.search(query);
        results.push(
          ...jikanRes.map(item => ({
            id: item.mal_id,
            title: item.title_english ?? item.title,
            posterUrl: item.images?.jpg?.large_image_url ?? '',
            releaseYear: item.year?.toString() ?? null,
            mediaType: 'anime' as const,
            overview: item.synopsis ?? '',
            source: 'jikan' as const,
          }))
        );
      }

      if (category === 'game' || category === 'all') {
        const rawgRes = await rawgService.search(query);
        results.push(
          ...rawgRes.map(item => ({
            id: item.id,
            title: item.name,
            posterUrl: item.background_image ?? '',
            releaseYear: item.released?.split('-')[0] ?? null,
            mediaType: 'game' as const,
            overview: 'Video Game',
            source: 'rawg' as const,
          }))
        );
      }

      // YouTube is only searched when explicitly selected — never in 'all' mode.
      if (category === 'youtube') {
        const ytRes = await youtubeService.search(query);
        results.push(
          ...ytRes.map(item => ({
            id: item.id,
            title: item.title,
            posterUrl: item.thumbnailUrl,
            releaseYear: item.publishedAt?.split('-')[0] ?? null,
            mediaType: 'youtube' as const,
            overview: item.description,
            source: 'youtube' as const,
            extra: { channel: item.channelTitle },
          }))
        );
      }

      return results;
    } catch (error) {
      console.error('MediaService Search Error:', error);
      return results; // Return partial results on error
    }
  }

  /**
   * Fetches rich, aggregated details for a media item.
   * For movie/tv: TMDB primary + OMDB ratings + YouTube trailer (concurrent).
   * For anime: Jikan search-by-title (best available match).
   * For game: RAWG search-by-title (best available match).
   *
   * Note: anime and game branches currently fall back to a title-search since
   * Jikan and RAWG have separate ID-lookup endpoints not yet wired up.
   */
  async getRichMediaDetails(
    idOrTitle: string | number,
    type: 'movie' | 'tv' | 'anime' | 'game'
  ): Promise<KathaMediaObject | null> {

    let title = '';
    let releaseYear: number | null = null;
    let posterUrl: string | null = null;
    let overview = '';
    let genres: string[] = [];
    let tmdbDetails: TMDBDetails | undefined;
    const ratings: KathaMediaObject['ratings'] = {};

    // ── 1. Fetch primary metadata ─────────────────────────────────────────────
    if (type === 'movie' || type === 'tv') {
      const tmdbId = typeof idOrTitle === 'string' ? parseInt(idOrTitle, 10) : idOrTitle;
      
      // TV/Documentary Fallback Chain: TMDB -> TVMaze
      try {
        tmdbDetails = (await tmdbService.getDetails(tmdbId, type)) ?? undefined;
      } catch (e) {
        console.warn('TMDB failed, checking TVMaze fallback...');
      }
      
      if (tmdbDetails) {
        const dateStr = tmdbDetails.release_date ?? tmdbDetails.first_air_date ?? '';
        releaseYear = dateStr ? parseInt(dateStr.split('-')[0]!, 10) : null;
        title = tmdbDetails.title ?? tmdbDetails.name ?? '';
        posterUrl = tmdbService.getImageUrl(tmdbDetails.poster_path);
        overview = tmdbDetails.overview;
        genres = tmdbDetails.genres.map(g => g.name);
        ratings.tmdb = tmdbDetails.vote_average;
      } else if (type === 'tv') {
        // Fallback to TVMaze
        const tvmazeRes = await tvmazeService.search(idOrTitle.toString());
        if (!tvmazeRes.length) return null;
        const show = tvmazeRes[0]!.show;
        
        title = show.name;
        releaseYear = show.premiered ? parseInt(show.premiered.split('-')[0]!, 10) : null;
        posterUrl = show.image?.original ?? show.image?.medium ?? null;
        overview = show.summary?.replace(/<[^>]+>/g, '') ?? ''; // strip html
        genres = show.genres ?? [];
        ratings.tmdb = show.rating?.average ?? undefined; // store under tmdb for compatibility
      } else {
        return null;
      }

    } else if (type === 'anime') {
      // Anime Fallback Chain: Jikan -> AniList -> Kitsu
      let animeFound = false;
      const searchStr = idOrTitle.toString();

      try {
        const res = await jikanService.search(searchStr);
        if (res.length > 0) {
          const anime = res[0]!;
          title = anime.title_english ?? anime.title;
          releaseYear = anime.year ?? null;
          posterUrl = anime.images?.jpg?.large_image_url ?? '';
          overview = anime.synopsis ?? '';
          genres = anime.genres?.map(g => g.name) ?? [];
          ratings.tmdb = anime.score;
          animeFound = true;
        }
      } catch (e) {
        console.warn('Jikan failed, falling back to AniList...');
      }

      if (!animeFound) {
        try {
          const res = await anilistService.search(searchStr);
          if (res.length > 0) {
            const anime = res[0]!;
            title = anime.title.english ?? anime.title.romaji;
            releaseYear = anime.startDate?.year ?? null;
            posterUrl = anime.coverImage?.large ?? '';
            overview = anime.description?.replace(/<[^>]+>/g, '') ?? '';
            genres = anime.genres ?? [];
            ratings.tmdb = anime.averageScore ? anime.averageScore / 10 : undefined;
            animeFound = true;
          }
        } catch (e) {
          console.warn('AniList failed, falling back to Kitsu...');
        }
      }

      if (!animeFound) {
        const res = await kitsuService.search(searchStr);
        if (res.length > 0) {
          const anime = res[0]!;
          title = anime.attributes.titles.en ?? anime.attributes.canonicalTitle;
          releaseYear = anime.attributes.startDate ? parseInt(anime.attributes.startDate.split('-')[0]!, 10) : null;
          posterUrl = anime.attributes.posterImage?.original ?? anime.attributes.posterImage?.large ?? '';
          overview = anime.attributes.synopsis ?? '';
          genres = []; // Kitsu doesn't return genres in the edge search payload natively without includes
          ratings.tmdb = anime.attributes.averageRating ? parseFloat(anime.attributes.averageRating) / 10 : undefined;
          animeFound = true;
        }
      }

      if (!animeFound) return null;

    } else if (type === 'game') {
      // Falls back to title search — best available without a dedicated ID endpoint.
      const res = await rawgService.search(idOrTitle.toString());
      if (!res.length) return null;
      const game = res[0]!;

      title = game.name;
      releaseYear = game.released ? parseInt(game.released.split('-')[0]!, 10) : null;
      posterUrl = game.background_image ?? '';
      overview = 'Video Game';
      genres = game.genres?.map(g => g.name) ?? [];
      ratings.metacritic = game.metacritic?.toString();
    }

    // ── 2. Concurrently enrich with OMDB ratings + YouTube trailer ────────────
    const [omdbDetails, youtubeResults] = await Promise.all([
      omdbService.getByTitle(title, releaseYear?.toString()),
      youtubeService.search(`${title} ${releaseYear ?? ''} official trailer`),
    ]);

    if (omdbDetails?.Ratings) {
      for (const r of omdbDetails.Ratings) {
        if (r.Source === 'Internet Movie Database') ratings.imdb = r.Value;
        if (r.Source === 'Rotten Tomatoes') ratings.rottenTomatoes = r.Value;
        if (r.Source === 'Metacritic') ratings.metacritic = r.Value;
      }
    }

    const trailerUrl = youtubeResults[0]?.id
      ? `https://www.youtube.com/watch?v=${youtubeResults[0].id}`
      : undefined;

    return {
      id: `${type}_${idOrTitle}`,
      title,
      type,
      posterUrl,
      overview,
      releaseYear,
      genres,
      ratings,
      trailerUrl,
      rawDetails: {
        tmdb: tmdbDetails,
        omdb: omdbDetails ?? undefined,
      },
    };
  }
}

export const mediaService = new MediaService();
