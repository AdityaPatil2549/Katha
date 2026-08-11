import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Dropdown } from '@/components/ui/Dropdown';
import { 
  Save, 
  Plus, 
  Clock, 
  Heart, 
  Star, 
  BookOpen, 
  Film, 
  Tv, 
  Youtube, 
  Video,
  X,
  ChevronDown,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useStoriesStore } from '@/store';
import type { Story, StoryCategory, StoryStatus } from '@/types/models';
import { tmdbService, type TMDBResult } from '@/services/TMDBService';
import { omdbService } from '@/services/OMDBService';
import { youtubeService, type YouTubeSearchResult } from '@/services/YouTubeService';
import { watchmodeService } from '@/services/WatchmodeService';
import { jikanService, type JikanSearchResult } from '@/services/JikanService';
import { traktService } from '@/services/TraktService';
const CATEGORIES: { value: StoryCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'anime', label: 'Anime', icon: <Star className="w-4 h-4" /> },
  { value: 'series', label: 'Series', icon: <Tv className="w-4 h-4" /> },
  { value: 'movie', label: 'Movie', icon: <Film className="w-4 h-4" /> },
  { value: 'documentary', label: 'Documentary', icon: <Video className="w-4 h-4" /> },
  { value: 'youtube', label: 'YouTube', icon: <Youtube className="w-4 h-4" /> },
];

const PLATFORMS = [
  'Netflix', 'Prime Video', 'Disney+', 'Crunchyroll', 'YouTube', 'Apple TV', 'Hotstar', 'HBO Max', 'Hulu', 'Other'
];

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
  'Animation', 'Biography', 'Crime', 'Family', 'History', 'Music', 'War', 'Western', 'Philosophy', 'Psychological'
];

const MOODS = [
  'inspired', 'emotional', 'calm', 'thoughtful', 'intense', 'dark'
];

const LIFE_PHASES = [
  'Childhood', 'Teenage Years', 'College Era', 'Early Career', 'Growth Phase', 'Transition Period', 'Established Life', 'Reflection Phase'
];

export default function AddStoryPage() {
  const navigate = useNavigate();
  const { addStory } = useStoriesStore();

  const [formData, setFormData] = useState({
    title: '',
    category: '' as StoryCategory,
    status: 'planning' as StoryStatus,
    platform: '',
    genre: [] as string[],
    tags: [] as string[],
    rating: 0,
    releaseYear: undefined as number | undefined,
    posterUrl: '',
    posterBlurhash: '',
    watchTimeMinutes: 0,
    currentEpisode: undefined as number | undefined,
    totalEpisodes: undefined as number | undefined,
    currentSeason: undefined as number | undefined,
    totalSeasons: undefined as number | undefined,
    notes: '',
    moods: [] as string[],
    lifePhase: '',
    favorite: false,
    impactIndex: 5,
  });

  const [customPlatform, setCustomPlatform] = useState('');
  const [customGenre, setCustomGenre] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [showPlatformOther, setShowPlatformOther] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // API Integration States
  const [searchPlatform, setSearchPlatform] = useState<'tmdb' | 'youtube' | 'jikan'>('tmdb');
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<TMDBResult[]>([]);
  const [youtubeResults, setYoutubeResults] = useState<YouTubeSearchResult[]>([]);
  const [jikanResults, setJikanResults] = useState<JikanSearchResult[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [showApiDropdown, setShowApiDropdown] = useState(false);

  useEffect(() => {
    const searchApi = async () => {
      if (!apiSearchQuery.trim()) {
        setTmdbResults([]);
        setYoutubeResults([]);
        setJikanResults([]);
        setShowApiDropdown(false);
        return;
      }
      setIsSearchingApi(true);
      setShowApiDropdown(true);

      if (searchPlatform === 'tmdb') {
        const results = await tmdbService.search(apiSearchQuery);
        setTmdbResults(results);
      } else if (searchPlatform === 'youtube') {
        const results = await youtubeService.search(apiSearchQuery);
        setYoutubeResults(results);
      } else if (searchPlatform === 'jikan') {
        const results = await jikanService.search(apiSearchQuery);
        setJikanResults(results);
      }
      
      setIsSearchingApi(false);
    };

    const debounce = setTimeout(searchApi, 500);
    return () => clearTimeout(debounce);
  }, [apiSearchQuery, searchPlatform]);

  const handleTmdbSelect = async (result: TMDBResult) => {
    setShowApiDropdown(false);
    setIsSearchingApi(true);
    
    try {
      const details = await tmdbService.getDetails(result.id, result.media_type);
      if (details) {
        let category: StoryCategory = result.media_type === 'tv' ? 'series' : 'movie';
        if (details.genres.some(g => g.name.toLowerCase() === 'animation') && 
            (details.genres.some(g => g.name.toLowerCase() === 'action') || details.genres.some(g => g.name.toLowerCase() === 'sci-fi') || details.genres.some(g => g.name.toLowerCase() === 'fantasy'))) {
          category = 'anime';
        }

        const releaseYear = details.release_date ? parseInt((details.release_date.split('-')[0]) || '') : 
                           details.first_air_date ? parseInt((details.first_air_date.split('-')[0]) || '') : undefined;
                           
        const mappedGenres = details.genres.map(g => g.name).filter(g => GENRES.includes(g));


        let omdbNotes = '';
        let finalRating = details.vote_average ? Math.round(details.vote_average) : 0;
        try {
          const title = details.title || details.name || '';
          if (title) {
             const omdbData = await omdbService.getByTitle(title, releaseYear?.toString());
             if (omdbData) {
               const ratingsString = omdbService.formatRatingsString(omdbData);
               if (ratingsString) {
                 omdbNotes = `[Critical Ratings]\n${ratingsString}\n\n`;
               }
               if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
                 finalRating = Math.round(parseFloat(omdbData.imdbRating));
               }
             }
          }
        } catch (e) {
          console.error("OMDB API Error:", e);
        }

        try {
          const type = result.media_type === 'tv' ? 'show' : 'movie';
          const traktRating = await traktService.getRatingByTmdbId(result.id, type);
          if (traktRating && traktRating.rating) {
            const traktScore = `${Math.round(traktRating.rating * 10)}%`;
            if (omdbNotes) {
              omdbNotes = omdbNotes.replace('\n\n', `\nTrakt Community: ${traktScore} (${traktRating.votes.toLocaleString()} votes)\n\n`);
            } else {
              omdbNotes = `[Critical Ratings]\nTrakt Community: ${traktScore} (${traktRating.votes.toLocaleString()} votes)\n\n`;
            }
          }
        } catch (e) {
          console.error("Trakt API Error:", e);
        }

        let watchmodeNotes = '';
        let watchmodePlatform = '';
        try {
          const type = result.media_type === 'tv' ? 'tv' : 'movie';
          const sources = await watchmodeService.getSourcesByTmdbId(result.id, type);
          const processed = watchmodeService.processSources(sources);
          watchmodePlatform = processed.primaryPlatform;
          watchmodeNotes = processed.allSourcesText;
        } catch (e) {
          console.error("Watchmode API Error:", e);
        }

        const tmdbSynopsis = details.overview ? `[TMDB Synopsis]\n${details.overview}\n\n` : '';

        setFormData(prev => ({
          ...prev,
          title: details.title || details.name || prev.title,
          category,
          platform: watchmodePlatform || prev.platform,
          releaseYear: releaseYear || prev.releaseYear,
          posterUrl: tmdbService.getImageUrl(details.poster_path),
          genre: mappedGenres.length > 0 ? mappedGenres : prev.genre,
          notes: `${watchmodeNotes}${omdbNotes}${tmdbSynopsis}${prev.notes}`,
          totalEpisodes: details.number_of_episodes || prev.totalEpisodes,
          totalSeasons: details.number_of_seasons || prev.totalSeasons,
          rating: finalRating || prev.rating,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingApi(false);
      setApiSearchQuery('');
    }
  };

  const handleYoutubeSelect = async (result: YouTubeSearchResult) => {
    setShowApiDropdown(false);
    setIsSearchingApi(true);
    
    try {
      const details = await youtubeService.getVideoDetails(result.id);
      if (details) {


        setFormData(prev => ({
          ...prev,
          title: details.title || prev.title,
          category: 'youtube',
          platform: 'YouTube',
          releaseYear: details.publishedAt ? parseInt((details.publishedAt.split('-')[0]) || '') : prev.releaseYear,
          posterUrl: details.thumbnailUrl,
          notes: details.description ? `[YouTube Description]\nChannel: ${details.channelTitle}\nViews: ${Number(details.viewCount).toLocaleString()}\n\n${details.description}\n\n${prev.notes}` : prev.notes,
          watchTimeMinutes: details.durationMinutes || prev.watchTimeMinutes,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingApi(false);
      setApiSearchQuery('');
    }
  };

  const handleJikanSelect = async (result: JikanSearchResult) => {
    setShowApiDropdown(false);
    setIsSearchingApi(true);
    
    try {

      
      const mappedGenres = result.genres?.map(g => g.name).filter(g => GENRES.includes(g)) || [];
      const studios = result.studios?.map(s => s.name).join(', ') || '';
      
      let jikanNotes = '';
      if (studios) jikanNotes += `Studio: ${studios}\n`;
      if (result.score) jikanNotes += `MyAnimeList Score: ${result.score}/10\n`;
      if (result.title_japanese) jikanNotes += `Japanese Title: ${result.title_japanese}\n`;
      
      if (jikanNotes) jikanNotes = `[Anime Details]\n${jikanNotes}\n\n`;
      const synopsis = result.synopsis ? `[Synopsis]\n${result.synopsis}\n\n` : '';

      setFormData(prev => ({
        ...prev,
        title: result.title_english || result.title || prev.title,
        category: 'anime',
        releaseYear: result.year || (result.title ? undefined : prev.releaseYear),
        posterUrl: result.images?.jpg?.large_image_url || result.images?.jpg?.image_url || '',
        genre: mappedGenres.length > 0 ? mappedGenres : prev.genre,
        notes: `${jikanNotes}${synopsis}${prev.notes}`,
        totalEpisodes: result.episodes || prev.totalEpisodes,
        rating: result.score ? Math.round(result.score) : prev.rating,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingApi(false);
      setApiSearchQuery('');
    }
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const draft = { ...formData };
      localStorage.setItem('katha_story_draft', JSON.stringify(draft));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('katha_story_draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setFormData(parsedDraft);
      } catch (e) {
        // Ignore invalid draft
      }
    }
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (category: StoryCategory) => {
    setFormData(prev => ({ 
      ...prev, 
      category,
      // Reset progress fields when category changes
      currentEpisode: undefined,
      totalEpisodes: undefined,
      currentSeason: undefined,
      totalSeasons: undefined,
    }));
  };

  const handlePlatformChange = (platform: string) => {
    if (platform === 'Other') {
      setShowPlatformOther(true);
      setFormData(prev => ({ ...prev, platform: '' }));
    } else {
      setShowPlatformOther(false);
      setFormData(prev => ({ ...prev, platform }));
    }
  };

  const addGenre = (genre: string) => {
    if (genre && !formData.genre.includes(genre)) {
      setFormData(prev => ({ ...prev, genre: [...prev.genre, genre] }));
    }
    setCustomGenre('');
  };

  const removeGenre = (genre: string) => {
    setFormData(prev => ({ ...prev, genre: prev.genre.filter(g => g !== genre) }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setCustomTag('');
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const toggleMood = (mood: string) => {
    setFormData(prev => ({
      ...prev,
      moods: prev.moods.includes(mood)
        ? prev.moods.filter(m => m !== mood)
        : [...prev.moods, mood]
    }));
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would compress and convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          posterUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.category) return 'Category is required';
    if (!formData.platform.trim()) return 'Platform is required';
    
    if (formData.currentEpisode && formData.totalEpisodes) {
      if (formData.currentEpisode > formData.totalEpisodes) {
        return 'Current episode cannot be greater than total episodes';
      }
    }
    
    if (formData.currentSeason && formData.totalSeasons) {
      if (formData.currentSeason > formData.totalSeasons) {
        return 'Current season cannot be greater than total seasons';
      }
    }
    
    return null;
  };

  const handleSubmit = async (action: 'save' | 'saveAndSession' | 'saveAndMoment') => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const storyData = {
        ...formData,
        platform: showPlatformOther ? customPlatform : formData.platform,
        watchTimeMinutes: formData.category === 'movie' ? formData.watchTimeMinutes : 0,
      };

      await addStory(storyData);
      
      // Clear draft
      localStorage.removeItem('katha_story_draft');
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        
        if (action === 'saveAndSession') {
          // Navigate to add session
          navigate('/library');
        } else if (action === 'saveAndMoment') {
          // Navigate to add moment
          navigate('/memory');
        } else {
          navigate('/library');
        }
      }, 1500);
    } catch (error) {
      alert('Failed to save story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSeriesOrAnime = formData.category === 'series' || formData.category === 'anime';
  const isWatching = formData.status === 'watching';

  return (
    <div className="min-h-screen bg-transparent py-page relative z-10 pointer-events-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-page glass-card p-8 rounded-3xl text-center">
          <BlurReveal>
            <h1 className="heading-1 text-primary mb-tight">Add a New Story</h1>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <p className="text-secondary">
              Every story matters. Smriti will remember it for you.
            </p>
          </BlurReveal>
          {draftSaved && (
            <FadeIn>
              <div className="mt-2 text-small text-accent-cyan">
                Draft saved automatically
              </div>
            </FadeIn>
          )}
        </div>

        <StaggerContainer>
        <form className="space-y-page" onSubmit={(e) => { e.preventDefault(); handleSubmit('save'); }}>
          
          {/* SECTION 1: STORY BASICS */}
          <FadeIn>
          <section className="glass-card p-8 md:p-12 space-y-section">
            <h2 className="heading-2 text-primary flex items-center justify-between">
              Story Basics
              {isSearchingApi && <span className="text-small text-accent-cyan animate-pulse">Fetching details...</span>}
            </h2>

            {/* API Search */}
            <div className="relative z-50 bg-midnight-bg/50 p-4 rounded-xl border border-text-primary/5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-small font-medium text-secondary">
                  Smart Auto-fill
                </label>
                <div className="flex bg-midnight-surface rounded-lg p-1 border border-text-primary/5">
                  <button
                    type="button"
                    onClick={() => { setSearchPlatform('tmdb'); setApiSearchQuery(''); }}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${searchPlatform === 'tmdb' ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-muted hover:text-secondary'}`}
                  >
                    Movies/TV
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchPlatform('youtube'); setApiSearchQuery(''); }}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${searchPlatform === 'youtube' ? 'bg-rose/20 text-rose' : 'text-muted hover:text-secondary'}`}
                  >
                    YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchPlatform('jikan'); setApiSearchQuery(''); }}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${searchPlatform === 'jikan' ? 'bg-purple/20 text-purple' : 'text-muted hover:text-secondary'}`}
                  >
                    Anime
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  {searchPlatform === 'tmdb' ? <Film className="w-4 h-4 text-muted" /> : searchPlatform === 'youtube' ? <Youtube className="w-4 h-4 text-muted" /> : <Star className="w-4 h-4 text-muted" />}
                </div>
                <input
                  type="text"
                  value={apiSearchQuery}
                  onChange={(e) => setApiSearchQuery(e.target.value)}
                  onFocus={() => { if(tmdbResults.length > 0 || youtubeResults.length > 0 || jikanResults.length > 0) setShowApiDropdown(true); }}
                  className="w-full pl-10 pr-4 py-3 bg-midnight-surface border border-accent-cyan/30 rounded-button text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                  placeholder={searchPlatform === 'tmdb' ? "Search movies and series..." : searchPlatform === 'youtube' ? "Search YouTube videos..." : "Search anime..."}
                />
              </div>

              {/* API Dropdown */}
              <AnimatePresence>
                {showApiDropdown && ((searchPlatform === 'tmdb' && tmdbResults.length > 0) || (searchPlatform === 'youtube' && youtubeResults.length > 0) || (searchPlatform === 'jikan' && jikanResults.length > 0)) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-midnight-surface border border-midnight-border rounded-lg shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
                  >
                    {searchPlatform === 'tmdb' && tmdbResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => handleTmdbSelect(result)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-text-primary/5 transition-colors text-left border-b border-text-primary/5 last:border-0"
                      >
                        {result.poster_path ? (
                          <img 
                            src={tmdbService.getImageUrl(result.poster_path)} 
                            alt={result.title || result.name} 
                            className="w-10 h-14 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-midnight-border rounded flex items-center justify-center">
                            <Film className="w-4 h-4 text-muted" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-primary font-medium truncate">{result.title || result.name}</h4>
                          <p className="text-small text-secondary flex items-center gap-2">
                            <span className="uppercase text-[10px] bg-text-primary/10 px-1.5 py-0.5 rounded">{result.media_type}</span>
                            <span>{(result.release_date || result.first_air_date || '').split('-')[0]}</span>
                          </p>
                        </div>
                      </button>
                    ))}

                    {searchPlatform === 'youtube' && youtubeResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => handleYoutubeSelect(result)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-text-primary/5 transition-colors text-left border-b border-text-primary/5 last:border-0"
                      >
                        {result.thumbnailUrl ? (
                          <img 
                            src={result.thumbnailUrl} 
                            alt={result.title} 
                            className="w-16 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-midnight-border rounded flex items-center justify-center">
                            <Youtube className="w-4 h-4 text-muted" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-primary font-medium truncate">{result.title}</h4>
                          <p className="text-small text-secondary flex items-center gap-2">
                            <span className="text-[10px] text-muted truncate max-w-[120px]">{result.channelTitle}</span>
                            <span>•</span>
                            <span className="text-xs">{(result.publishedAt || '').split('-')[0]}</span>
                          </p>
                        </div>
                      </button>
                    ))}

                    {searchPlatform === 'jikan' && jikanResults.map((result) => (
                      <button
                        key={result.mal_id}
                        type="button"
                        onClick={() => handleJikanSelect(result)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-text-primary/5 transition-colors text-left border-b border-text-primary/5 last:border-0"
                      >
                        {result.images?.jpg?.image_url ? (
                          <img 
                            src={result.images.jpg.image_url} 
                            alt={result.title} 
                            className="w-10 h-14 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-midnight-border rounded flex items-center justify-center">
                            <Star className="w-4 h-4 text-muted" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-primary font-medium truncate">{result.title_english || result.title}</h4>
                          <p className="text-small text-secondary flex items-center gap-2">
                            <span className="uppercase text-[10px] bg-purple/20 text-purple px-1.5 py-0.5 rounded">{result.type}</span>
                            <span className="text-xs">{result.year || 'Unknown Year'}</span>
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Title */}
            <div>
              <label className="block text-small font-medium text-secondary mb-tight">
                Story Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-midnight-surface border border-midnight-border rounded-button text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                placeholder="Enter the story title..."
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-small font-medium text-secondary mb-tight">
                Category *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-normal">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`p-4 rounded-card border-2 transition-all duration-fast ${
                      formData.category === cat.value
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                        : 'border-midnight-border bg-midnight-surface text-text-secondary hover:border-midnight-divider'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-tight">
                      {cat.icon}
                      <span className="text-small font-medium">{cat.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-small font-medium text-secondary mb-tight">
                Platform *
              </label>
              <div className="relative">
                <Dropdown
                  value={showPlatformOther ? 'Other' : formData.platform}
                  onChange={handlePlatformChange}
                  options={[
                    { value: '', label: 'Select platform...' },
                    ...PLATFORMS.map(platform => ({ value: platform, label: platform })),
                    { value: 'Other', label: 'Other' }
                  ]}
                  className="w-full"
                />
              </div>
              
              {showPlatformOther && (
                <input
                  type="text"
                  value={customPlatform}
                  onChange={(e) => setCustomPlatform(e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-midnight-surface border border-midnight-border rounded-button text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
                  placeholder="Enter custom platform name..."
                />
              )}
            </div>
          </section>
          </FadeIn>

          {/* SECTION 2: STATUS & INTENT */}
          <FadeIn>
          <section className="glass-card p-8 md:p-12 space-y-section">
            <h2 className="heading-2 text-primary">Status & Intent</h2>
            
            {/* Status */}
            <div>
              <label className="block text-small font-medium text-secondary mb-tight">
                Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-normal">
                {[
                  { value: 'planning', label: 'Planned', color: 'amber' },
                  { value: 'watching', label: 'Watching', color: 'cyan' },
                  { value: 'completed', label: 'Completed', color: 'emerald' },
                  { value: 'paused', label: 'On Hold', color: 'violet' }
                ].map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => handleInputChange('status', status.value)}
                    className={`p-3 rounded-card border-2 transition-all duration-fast ${
                      formData.status === status.value
                        ? `border-accent-${status.color} bg-accent-${status.color}/10 text-accent-${status.color}`
                        : 'border-midnight-border bg-midnight-surface text-text-secondary hover:border-midnight-divider'
                    }`}
                  >
                    <span className="text-small font-medium">{status.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Progress Fields */}
            {formData.status === 'planning' && (
              <div>
                <label className="block text-small font-medium text-secondary mb-tight">
                  Priority
                </label>
                <div className="flex gap-normal">
                  {[
                    { value: 'low', label: 'Low', color: 'muted' },
                    { value: 'medium', label: 'Medium', color: 'amber' },
                    { value: 'high', label: 'High', color: 'rose' }
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      className={`px-4 py-2 rounded-chip border transition-all duration-fast ${
                        formData.impactIndex === (priority.value === 'low' ? 3 : priority.value === 'medium' ? 5 : 8)
                          ? `border-accent-${priority.color} bg-accent-${priority.color}/10 text-accent-${priority.color}`
                          : 'border-midnight-border bg-midnight-surface text-text-secondary'
                      }`}
                      onClick={() => handleInputChange('impactIndex', priority.value === 'low' ? 3 : priority.value === 'medium' ? 5 : 8)}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isWatching && isSeriesOrAnime && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-normal">
                <div>
                  <label className="block text-small font-medium text-secondary mb-tight">
                    Total Seasons
                  </label>
                  <input
                    type="number"
                    value={formData.totalSeasons || ''}
                    onChange={(e) => handleInputChange('totalSeasons', parseInt(e.target.value) || undefined)}
                    className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-small font-medium text-secondary mb-tight">
                    Current Season
                  </label>
                  <input
                    type="number"
                    value={formData.currentSeason || ''}
                    onChange={(e) => handleInputChange('currentSeason', parseInt(e.target.value) || undefined)}
                    className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-small font-medium text-secondary mb-tight">
                    Episodes/Season
                  </label>
                  <input
                    type="number"
                    value={formData.totalEpisodes || ''}
                    onChange={(e) => handleInputChange('totalEpisodes', parseInt(e.target.value) || undefined)}
                    className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-small font-medium text-secondary mb-tight">
                    Current Episode
                  </label>
                  <input
                    type="number"
                    value={formData.currentEpisode || ''}
                    onChange={(e) => handleInputChange('currentEpisode', parseInt(e.target.value) || undefined)}
                    className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {isWatching && formData.category === 'movie' && (
              <div className="grid grid-cols-2 gap-normal">
                <div>
                  <label className="block text-small font-medium text-secondary mb-tight">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.watchTimeMinutes || ''}
                    onChange={(e) => handleInputChange('watchTimeMinutes', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-small font-medium text-secondary mb-tight">
                    Watched so far (optional)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm"
                    placeholder="0"
                    aria-label="Watched so far in minutes"
                  />
                </div>
              </div>
            )}

            {isWatching && (
              <div>
                <label className="block text-small font-medium text-secondary mb-tight">
                  Experience So Far
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm resize-none leading-relaxed"
                  rows={3}
                  placeholder="How is it going so far?"
                  maxLength={500}
                />
                <div className="text-right text-caption text-muted mt-1">
                  {formData.notes.length}/500
                </div>
              </div>
            )}
          </section>
          </FadeIn>

          {/* SECTION 3: VISUAL IDENTITY */}
          <FadeIn>
          <section className="glass-card p-8 md:p-12 space-y-section">
            <h2 className="heading-2 text-primary">Visual Identity</h2>
            
            <div>
              <label className="block text-small font-medium text-secondary mb-tight">
                Poster Image
              </label>
              <div className="flex items-center gap-normal">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-midnight-border rounded-card p-8 text-center hover:border-midnight-divider transition-colors">
                    {formData.posterUrl ? (
                      <div className="relative">
                        <img 
                          src={formData.posterUrl} 
                          alt="Poster preview" 
                          className="max-h-48 mx-auto rounded-card shadow-card"
                        />
                        <button
                          type="button"
                          onClick={() => handleInputChange('posterUrl', '')}
                          className="absolute top-2 right-2 p-2 bg-midnight-bg/80 rounded-full text-rose hover:bg-midnight-bg"
                          aria-label="Remove poster"
                          title="Remove poster image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon className="w-12 h-12 text-text-muted mx-auto mb-tight" />
                        <p className="text-small text-text-muted mb-normal">
                          Drag & drop or click to upload
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterUpload}
                          className="hidden"
                          id="poster-upload"
                        />
                        <label
                          htmlFor="poster-upload"
                          className="btn btn-secondary cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
          </FadeIn>

          {/* SECTION 4: GENRE & TAGS */}
          <FadeIn>
          <section className="glass-card p-8 md:p-12 space-y-section">
            <h2 className="heading-2 text-primary">Genre & Tags</h2>
            
            {/* Genre */}
            <div>
              <label className="block text-small font-medium text-secondary mb-tight">
                Genre
              </label>
              <div className="flex flex-wrap gap-tight mb-normal">
                {formData.genre.map((genre) => (
                  <span key={genre} className="chip chip-violet chip-accent">
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeGenre(genre)}
                      className="ml-2 hover:text-text-primary"
                      aria-label={`Remove ${genre} genre`}
                      title={`Remove ${genre} genre`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-normal">
                <Dropdown
                  value={customGenre}
                  onChange={setCustomGenre}
                  options={[
                    { value: '', label: 'Select genre...' },
                    ...GENRES.filter(g => !formData.genre.includes(g)).map(genre => ({ value: genre, label: genre }))
                  ]}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => addGenre(customGenre)}
                  disabled={!customGenre}
                  className="btn btn-secondary"
                  aria-label="Add selected genre"
                  title="Add genre to story"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-small font-medium text-secondary mb-tight">
                Tags
              </label>
              <div className="flex flex-wrap gap-tight mb-normal">
                {formData.tags.map((tag) => (
                  <span key={tag} className="chip chip-cyan chip-accent">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-text-primary"
                      aria-label={`Remove ${tag} tag`}
                      title={`Remove ${tag} tag`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-normal">
                <input
                  id="tag-input"
                  name="tag"
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(customTag))}
                  className="flex-1 px-3 py-2 bg-midnight-surface border border-midnight-border rounded-button text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
                  placeholder="Add a tag..."
                  aria-label="Enter tag name"
                />
                <button
                  type="button"
                  onClick={() => addTag(customTag)}
                  disabled={!customTag}
                  className="btn btn-secondary"
                  aria-label="Add tag"
                  title="Add tag to story"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
          </FadeIn>

          {/* SECTION 5: REFLECTION */}
          <FadeIn>
          <section className="glass-card p-8 md:p-12 space-y-section">
            <h2 className="heading-2 text-primary">Reflection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-normal">
              <div>
                <label className="block text-small font-medium text-secondary mb-tight">
                  Rating (0-10)
                </label>
                <div className="flex items-center gap-tight">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={formData.rating}
                    onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-small font-medium text-primary w-12 text-center">
                    {formData.rating}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-small font-medium text-secondary mb-tight">
                  Release Year
                </label>
                <input
                  type="number"
                  value={formData.releaseYear || ''}
                  onChange={(e) => handleInputChange('releaseYear', parseInt(e.target.value) || undefined)}
                  className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm"
                  placeholder="2024"
                  min="1900"
                  max={new Date().getFullYear() + 5}
                />
              </div>
            </div>

            <div>
              <label className="block text-small font-medium text-secondary mb-tight">
                Why does this story matter to you?
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm resize-none leading-relaxed"
                rows={4}
                placeholder="This story matters because..."
              />
            </div>

            {/* Moods */}
            <div>
              <label className="block text-small font-medium text-secondary mb-tight">
                How does this story make you feel?
              </label>
              <div className="flex flex-wrap gap-tight">
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`px-3 py-1 rounded-chip text-small capitalize transition-all duration-fast ${
                      formData.moods.includes(mood)
                        ? `chip chip-${mood} chip-accent`
                        : 'chip'
                    }`}
                    aria-label={`Toggle ${mood} mood`}
                    aria-pressed={formData.moods.includes(mood)}
                    title={`Click to ${formData.moods.includes(mood) ? 'remove' : 'add'} ${mood} mood`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Life Phase */}
            <div>
              <label className="block text-small font-medium text-secondary mb-tight">
                Life Phase
              </label>
              <Dropdown
                value={formData.lifePhase}
                onChange={(val) => handleInputChange('lifePhase', val)}
                options={[
                  { value: '', label: 'Select life phase...' },
                  ...LIFE_PHASES.map(phase => ({ value: phase, label: phase }))
                ]}
                className="w-full"
              />
            </div>
          </section>
          </FadeIn>

          {/* SECTION 6: ACTIONS */}
          <FadeIn>
          <section className="surface-elevated p-section">
            <div className="flex flex-col sm:flex-row gap-normal justify-between">
              <button
                type="button"
                onClick={() => navigate('/library')}
                className="btn btn-ghost px-4 py-2"
              >
                Discard Changes
              </button>
              
              <div className="flex flex-col sm:flex-row gap-normal">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex items-center justify-center px-5 py-2.5"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Story'}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSubmit('saveAndSession')}
                  disabled={isSubmitting}
                  className="btn btn-secondary flex items-center justify-center px-4 py-2.5"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Save + Add Session
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSubmit('saveAndMoment')}
                  disabled={isSubmitting}
                  className="btn btn-secondary flex items-center justify-center px-4 py-2.5"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Save + Add Moment
                </button>
              </div>
            </div>
          </section>
          </FadeIn>
        </form>
        </StaggerContainer>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="surface-elevated p-8 max-w-md mx-4 text-center"
              >
                <div className="w-16 h-16 bg-accent-emerald rounded-full flex items-center justify-center mx-auto mb-4">
                  <Save className="w-8 h-8 text-text-primary" />
                </div>
                <h3 className="heading-2 text-primary mb-2">Story Saved</h3>
                <p className="text-secondary">
                  Your story has been added to your library. Smriti will remember it forever.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
