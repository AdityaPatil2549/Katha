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
  Image as ImageIcon,
  CloudOff,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { useStoriesStore } from '@/store';
import { useSyncStore } from '@/store/syncStore';
import type { Story, StoryCategory, StoryStatus } from '@/types/models';
import { mediaService } from '@/services/MediaService';
import { youtubeService } from '@/services/YouTubeService';
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
  const { isOnline } = useSyncStore();

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

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.title.trim()) return 'Title is required';
      if (!formData.category) return 'Category is required';
      if (!formData.platform.trim()) return 'Platform is required';
    }
    if (step === 2) {
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
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      alert(error);
      return;
    }
    setSlideDirection('left');
    setCurrentStep(prev => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSlideDirection('right');
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? 30 : -30,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: 'left' | 'right') => ({
      zIndex: 0,
      x: direction === 'left' ? -30 : 30,
      opacity: 0
    })
  };


  // API Integration States
  const [searchPlatform, setSearchPlatform] = useState<'movie' | 'tv' | 'anime' | 'game' | 'youtube' | 'all'>('movie');
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [showApiDropdown, setShowApiDropdown] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const searchApi = async () => {
      if (!apiSearchQuery.trim() || !isOnline) {
        setSearchResults([]);
        setShowApiDropdown(false);
        return;
      }
      setIsSearchingApi(true);
      setShowApiDropdown(true);
      setApiError(null);

      try {
        const results = await mediaService.search(apiSearchQuery, searchPlatform);
        setSearchResults(results);
      } catch (err) {
        setApiError('Failed to fetch results. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearchingApi(false);
      }
    };

    const debounce = setTimeout(searchApi, 500);
    return () => clearTimeout(debounce);
  }, [apiSearchQuery, searchPlatform, isOnline]);

  const handleResultSelect = async (result: any) => {
    setShowApiDropdown(false);
    setIsSearchingApi(true);
    
    try {
      if (result.source === 'youtube') {
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
      } else {
        const type = result.mediaType === 'tv' ? 'tv' : result.mediaType === 'movie' ? 'movie' : result.mediaType === 'anime' ? 'anime' : 'game';
        const richDetails = await mediaService.getRichMediaDetails(result.id, type);
        
        if (richDetails) {
          let category: StoryCategory = richDetails.type === 'tv' ? 'series' : richDetails.type === 'movie' ? 'movie' : richDetails.type === 'anime' ? 'anime' : 'game';
          
          let notes = '';
          if (richDetails.ratings.metacritic) notes += `Metacritic: ${richDetails.ratings.metacritic}\n`;
          if (richDetails.ratings.rottenTomatoes) notes += `Rotten Tomatoes: ${richDetails.ratings.rottenTomatoes}\n`;
          if (richDetails.ratings.imdb) notes += `IMDB: ${richDetails.ratings.imdb}\n`;
          if (richDetails.trailerUrl) notes += `Trailer: ${richDetails.trailerUrl}\n`;
          if (notes) notes = `[Rich Metadata]\n${notes}\n\n`;
          if (richDetails.overview) notes += `[Synopsis]\n${richDetails.overview}\n\n`;
          
          let finalRating = richDetails.ratings.tmdb ? Math.round(richDetails.ratings.tmdb) : 0;
          if (!finalRating && richDetails.ratings.imdb && richDetails.ratings.imdb !== 'N/A') {
            finalRating = Math.round(parseFloat(richDetails.ratings.imdb));
          }

          setFormData(prev => ({
            ...prev,
            title: richDetails.title || prev.title,
            category,
            platform: prev.platform, // Could be auto-filled by watchmode later if added to MediaService
            releaseYear: richDetails.releaseYear || prev.releaseYear,
            posterUrl: richDetails.posterUrl || prev.posterUrl,
            genre: richDetails.genres.length > 0 ? richDetails.genres.filter(g => GENRES.includes(g)) : prev.genre,
            notes: `${notes}${prev.notes}`,
            rating: finalRating || prev.rating,
          }));
        }
      }
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
      if (error instanceof Error) {
        alert(error.message); // Will display the specific duplicate error
      } else {
        alert('Failed to save story. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSeriesOrAnime = formData.category === 'series' || formData.category === 'anime';
  const isWatching = formData.status === 'watching';

  return (
    <div className="min-h-screen bg-transparent py-page relative z-10 pointer-events-auto overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Header & Stepper */}
        <div className="mb-8 relative z-50">
          <div className="glass-card p-6 md:p-8 rounded-3xl text-center relative overflow-hidden">
            {/* Background ambient light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-32 bg-accent-cyan/10 blur-[80px] rounded-full pointer-events-none" />
            
            <BlurReveal>
              <h1 className="heading-1 text-primary mb-2 relative z-10">Add a New Story</h1>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <p className="text-secondary relative z-10">
                {currentStep === 1 && "Let's start with the essentials."}
                {currentStep === 2 && "How are you progressing with this?"}
                {currentStep === 3 && "Add some visual identity."}
                {currentStep === 4 && "Why does this story matter to you?"}
              </p>
            </BlurReveal>
            
            {draftSaved && (
              <FadeIn className="absolute top-4 right-6">
                <div className="text-[11px] font-medium text-accent-cyan px-2.5 py-1 bg-accent-cyan/10 rounded-full border border-accent-cyan/20">
                  Draft saved
                </div>
              </FadeIn>
            )}

            {/* Stepper */}
            <div className="flex items-center justify-center gap-1 mt-8 relative z-10">
              {[1, 2, 3, 4].map((step, idx) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 shadow-sm ${
                    currentStep === step 
                      ? 'bg-accent-cyan text-midnight-bg scale-110 shadow-[0_0_20px_rgba(45,212,191,0.4)]' :
                    currentStep > step 
                      ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30' :
                      'bg-midnight-surface text-text-muted border border-midnight-border/50'
                  }`}>
                    {currentStep > step ? <Check className="w-5 h-5" /> : step}
                  </div>
                  {idx < 3 && (
                    <div className={`w-8 md:w-16 h-1 rounded-full mx-2 transition-all duration-500 ${
                      currentStep > step ? 'bg-accent-cyan/40 shadow-[0_0_10px_rgba(45,212,191,0.2)]' : 'bg-midnight-border/50'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wizard Form Area */}
        <form className="relative min-h-[500px]" onSubmit={(e) => { e.preventDefault(); }}>
          <AnimatePresence mode="wait" custom={slideDirection} initial={false}>
            
            {/* STEP 1: ESSENTIALS */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-0 left-0 w-full"
              >
                <section className="glass-card p-6 md:p-8 space-y-section">
                  <h2 className="heading-2 text-primary flex items-center justify-between">
                    The Essentials
                    {isSearchingApi && <span className="text-small text-accent-cyan animate-pulse">Fetching details...</span>}
                  </h2>

                  {/* API Search */}
                  <div className="relative z-50 bg-midnight-bg/50 p-5 rounded-2xl border border-text-primary/5 shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                      <label className="text-sm font-semibold text-secondary uppercase tracking-wider">
                        Smart Auto-fill
                      </label>
                      <div className="flex bg-midnight-surface rounded-lg p-1 border border-text-primary/5 shadow-sm overflow-x-auto hide-scrollbar">
                        <button
                          type="button"
                          onClick={() => { setSearchPlatform('movie'); setApiSearchQuery(''); }}
                          className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${searchPlatform === 'movie' ? 'bg-accent-cyan/20 text-accent-cyan font-medium' : 'text-muted hover:text-secondary'}`}
                        >
                          Movies
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSearchPlatform('tv'); setApiSearchQuery(''); }}
                          className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${searchPlatform === 'tv' ? 'bg-accent-cyan/20 text-accent-cyan font-medium' : 'text-muted hover:text-secondary'}`}
                        >
                          TV
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSearchPlatform('anime'); setApiSearchQuery(''); }}
                          className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${searchPlatform === 'anime' ? 'bg-purple/20 text-purple font-medium' : 'text-muted hover:text-secondary'}`}
                        >
                          Anime
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSearchPlatform('game'); setApiSearchQuery(''); }}
                          className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${searchPlatform === 'game' ? 'bg-emerald/20 text-emerald font-medium' : 'text-muted hover:text-secondary'}`}
                        >
                          Games
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSearchPlatform('youtube'); setApiSearchQuery(''); }}
                          className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${searchPlatform === 'youtube' ? 'bg-rose/20 text-rose font-medium' : 'text-muted hover:text-secondary'}`}
                        >
                          YouTube
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        {searchPlatform === 'movie' || searchPlatform === 'tv' ? <Film className="w-5 h-5 text-muted" /> : searchPlatform === 'youtube' ? <Youtube className="w-5 h-5 text-muted" /> : searchPlatform === 'game' ? <Video className="w-5 h-5 text-muted" /> : <Star className="w-5 h-5 text-muted" />}
                      </div>
                      <input
                        type="text"
                        value={apiSearchQuery}
                        onChange={(e) => setApiSearchQuery(e.target.value)}
                        onFocus={() => { if(searchResults.length > 0) setShowApiDropdown(true); }}
                        disabled={!isOnline}
                        className="w-full pl-12 pr-4 py-4 bg-midnight-surface border border-accent-cyan/30 rounded-xl text-primary text-base placeholder-text-muted/60 focus:outline-none focus:border-accent-cyan focus:ring-4 focus:ring-accent-cyan/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        placeholder={!isOnline ? "Smart Search Disabled (Offline Mode)" : `Search ${searchPlatform} database...`}
                      />
                    </div>

                    {/* API Dropdown */}
                    <AnimatePresence>
                      {showApiDropdown && (apiSearchQuery.trim() !== '') && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          className="absolute top-full left-0 w-full mt-3 bg-midnight-surface border border-midnight-border rounded-xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto z-[60]"
                        >
                          {isSearchingApi ? (
                            <div className="p-6 text-center text-sm text-text-muted">Searching the database...</div>
                          ) : apiError ? (
                            <div className="p-6 text-center text-sm text-accent-rose bg-accent-rose/5">{apiError}</div>
                          ) : searchResults.length === 0 ? (
                            <div className="p-6 text-center text-sm text-text-muted">No results found for "{apiSearchQuery}"</div>
                          ) : (
                            searchResults.map((result, idx) => (
                              <button
                                key={`${result.id}-${idx}`}
                                type="button"
                                onClick={() => handleResultSelect(result)}
                                className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 group"
                            >
                              {result.posterUrl ? (
                                <img 
                                  src={result.posterUrl} 
                                  alt={result.title} 
                                  className="w-12 h-16 object-cover rounded-md shadow-sm group-hover:shadow-md transition-shadow"
                                />
                              ) : (
                                <div className="w-12 h-16 bg-midnight-bg border border-midnight-border rounded-md flex items-center justify-center">
                                  <Film className="w-5 h-5 text-muted" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-primary font-semibold truncate text-base mb-1">{result.title}</h4>
                                <p className="text-xs text-secondary flex items-center gap-2">
                                  <span className="uppercase font-semibold tracking-wider text-[10px] bg-white/10 px-2 py-0.5 rounded text-text-primary">{result.mediaType}</span>
                                  <span>{result.releaseYear}</span>
                                </p>
                              </div>
                            </button>
                          )))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      Story Title <span className="text-accent-rose">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-5 py-4 bg-midnight-surface/50 border border-midnight-border rounded-xl text-primary text-lg placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all"
                      placeholder="Enter the exact title..."
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-3">
                      Category <span className="text-accent-rose">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => handleCategoryChange(cat.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            formData.category === cat.value
                              ? 'border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_4px_20px_rgba(99,102,241,0.2)]'
                              : 'border-midnight-border/50 bg-midnight-surface/50 text-text-secondary hover:border-midnight-divider hover:bg-midnight-surface'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            {cat.icon}
                            <span className="text-sm font-medium">{cat.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Platform */}
                  <div className="pb-4">
                    <label className="block text-sm font-semibold text-secondary mb-3">
                      Platform <span className="text-accent-rose">*</span>
                    </label>
                    <div className="relative z-[45]">
                      <Dropdown
                        value={showPlatformOther ? 'Other' : formData.platform}
                        onChange={handlePlatformChange}
                        options={[
                          { value: '', label: 'Select platform...' },
                          ...PLATFORMS.map(platform => ({ value: platform, label: platform })),
                          { value: 'Other', label: 'Other' }
                        ]}
                        className="w-full py-4 text-base bg-midnight-surface/50"
                      />
                    </div>
                    
                    {showPlatformOther && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                        <input
                          type="text"
                          value={customPlatform}
                          onChange={(e) => setCustomPlatform(e.target.value)}
                          className="w-full px-5 py-4 bg-midnight-surface border border-midnight-border rounded-xl text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
                          placeholder="Enter custom platform name..."
                        />
                      </motion.div>
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {/* STEP 2: PROGRESS & DETAILS */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-0 left-0 w-full"
              >
                <section className="glass-card p-6 md:p-8 space-y-section">
                  <h2 className="heading-2 text-primary">Progress & Details</h2>
                  
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-3">
                      Current Status
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            formData.status === status.value
                              ? `border-accent-${status.color} bg-accent-${status.color}/10 text-accent-${status.color} shadow-[0_4px_20px_var(--tw-shadow-color)] shadow-accent-${status.color}/20`
                              : 'border-midnight-border/50 bg-midnight-surface/50 text-text-secondary hover:border-midnight-divider hover:bg-midnight-surface'
                          }`}
                        >
                          <span className="text-sm font-semibold">{status.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  {formData.status === 'planning' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-sm font-semibold text-secondary mb-3 mt-6">
                        Priority Level
                      </label>
                      <div className="flex gap-3">
                        {[
                          { value: 'low', label: 'Low Priority', color: 'muted' },
                          { value: 'medium', label: 'Medium', color: 'amber' },
                          { value: 'high', label: 'High Priority', color: 'rose' }
                        ].map((priority) => (
                          <button
                            key={priority.value}
                            type="button"
                            className={`flex-1 py-3 rounded-xl border transition-all duration-300 font-medium text-sm ${
                              formData.impactIndex === (priority.value === 'low' ? 3 : priority.value === 'medium' ? 5 : 8)
                                ? `border-accent-${priority.color} bg-accent-${priority.color}/10 text-accent-${priority.color}`
                                : 'border-midnight-border/50 bg-midnight-surface/50 text-text-secondary hover:bg-midnight-surface'
                            }`}
                            onClick={() => handleInputChange('impactIndex', priority.value === 'low' ? 3 : priority.value === 'medium' ? 5 : 8)}
                          >
                            {priority.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* TV Progress */}
                  {isWatching && isSeriesOrAnime && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div>
                        <label className="block text-xs font-semibold text-secondary mb-2">Total Seasons</label>
                        <input
                          type="number"
                          value={formData.totalSeasons || ''}
                          onChange={(e) => handleInputChange('totalSeasons', parseInt(e.target.value) || undefined)}
                          className="w-full px-4 py-3 bg-midnight-surface/50 border border-midnight-border rounded-xl text-primary text-center focus:outline-none focus:border-accent-cyan"
                          placeholder="-"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-secondary mb-2">Current Season</label>
                        <input
                          type="number"
                          value={formData.currentSeason || ''}
                          onChange={(e) => handleInputChange('currentSeason', parseInt(e.target.value) || undefined)}
                          className="w-full px-4 py-3 bg-midnight-surface/50 border border-midnight-border rounded-xl text-primary text-center focus:outline-none focus:border-accent-cyan"
                          placeholder="-"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-secondary mb-2">Episodes/Season</label>
                        <input
                          type="number"
                          value={formData.totalEpisodes || ''}
                          onChange={(e) => handleInputChange('totalEpisodes', parseInt(e.target.value) || undefined)}
                          className="w-full px-4 py-3 bg-midnight-surface/50 border border-midnight-border rounded-xl text-primary text-center focus:outline-none focus:border-accent-cyan"
                          placeholder="-"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-secondary mb-2">Current Episode</label>
                        <input
                          type="number"
                          value={formData.currentEpisode || ''}
                          onChange={(e) => handleInputChange('currentEpisode', parseInt(e.target.value) || undefined)}
                          className="w-full px-4 py-3 bg-midnight-surface/50 border border-midnight-border rounded-xl text-primary text-center focus:outline-none focus:border-accent-cyan"
                          placeholder="-"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Movie Progress */}
                  {isWatching && formData.category === 'movie' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4 mt-6">
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          value={formData.watchTimeMinutes || ''}
                          onChange={(e) => handleInputChange('watchTimeMinutes', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-midnight-surface/50 border border-midnight-border rounded-xl text-primary focus:outline-none focus:border-accent-cyan"
                          placeholder="120"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">Watched so far</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 bg-midnight-surface/50 border border-midnight-border rounded-xl text-primary focus:outline-none focus:border-accent-cyan"
                          placeholder="0"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Release Year */}
                  <div className="pb-2">
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      Release Year
                    </label>
                    <input
                      type="number"
                      value={formData.releaseYear || ''}
                      onChange={(e) => handleInputChange('releaseYear', parseInt(e.target.value) || undefined)}
                      className="w-full max-w-xs px-5 py-4 bg-midnight-surface/50 border border-midnight-border rounded-xl text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan transition-all"
                      placeholder="e.g. 2024"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                    />
                  </div>
                </section>
              </motion.div>
            )}

            {/* STEP 3: VISUALS & TAGS */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-0 left-0 w-full"
              >
                <section className="glass-card p-6 md:p-8 space-y-section">
                  <h2 className="heading-2 text-primary">Visuals & Tags</h2>
                  
                  {/* Poster Image */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-3">
                      Cover / Poster Image
                    </label>
                    <div className="border-2 border-dashed border-midnight-border/60 bg-midnight-surface/30 rounded-2xl p-8 text-center hover:border-midnight-divider transition-all duration-300">
                      {formData.posterUrl ? (
                        <div className="relative inline-block group">
                          <img 
                            src={formData.posterUrl} 
                            alt="Poster preview" 
                            className="max-h-64 mx-auto rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:scale-[1.02] transition-transform duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleInputChange('posterUrl', '')}
                            className="absolute -top-3 -right-3 p-2 bg-midnight-bg rounded-full text-rose border border-rose/20 shadow-lg hover:bg-rose hover:text-white transition-colors"
                            aria-label="Remove poster"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-4">
                          <div className="w-16 h-16 bg-midnight-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-midnight-border/50">
                            <ImageIcon className="w-8 h-8 text-text-muted" />
                          </div>
                          <p className="text-sm text-text-muted mb-4 font-medium">
                            Drag & drop an image, or click to browse
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
                            className="btn btn-secondary cursor-pointer rounded-xl px-6 py-3"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-3">
                      Genres
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <AnimatePresence>
                        {formData.genre.map((genre) => (
                          <motion.span 
                            key={genre} 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="px-3 py-1.5 rounded-lg bg-violet/10 text-violet border border-violet/20 flex items-center text-sm font-medium"
                          >
                            {genre}
                            <button
                              type="button"
                              onClick={() => removeGenre(genre)}
                              className="ml-2 p-0.5 rounded-full hover:bg-violet/20 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                    <div className="flex gap-3 relative z-[40]">
                      <Dropdown
                        value={customGenre}
                        onChange={setCustomGenre}
                        options={[
                          { value: '', label: 'Select genre...' },
                          ...GENRES.filter(g => !formData.genre.includes(g)).map(genre => ({ value: genre, label: genre }))
                        ]}
                        className="flex-1 py-3 bg-midnight-surface/50"
                      />
                      <button
                        type="button"
                        onClick={() => addGenre(customGenre)}
                        disabled={!customGenre}
                        className="btn btn-secondary rounded-xl px-6"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="pb-4">
                    <label className="block text-sm font-semibold text-secondary mb-3">
                      Custom Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <AnimatePresence>
                        {formData.tags.map((tag) => (
                          <motion.span 
                            key={tag} 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="px-3 py-1.5 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 flex items-center text-sm font-medium"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 p-0.5 rounded-full hover:bg-accent-cyan/20 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                    <div className="flex gap-3 relative z-30">
                      <input
                        id="tag-input"
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(customTag))}
                        className="flex-1 px-5 py-3 bg-midnight-surface/50 border border-midnight-border rounded-xl text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan transition-all"
                        placeholder="Type a tag and press enter..."
                      />
                      <button
                        type="button"
                        onClick={() => addTag(customTag)}
                        disabled={!customTag}
                        className="btn btn-secondary rounded-xl px-4"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {/* STEP 4: VIBE & REFLECTION */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-0 left-0 w-full"
              >
                <section className="glass-card p-6 md:p-8 space-y-section">
                  <h2 className="heading-2 text-primary">Vibe & Reflection</h2>
                  
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-4 flex justify-between">
                      <span>Rating</span>
                      <span className="text-accent-primary font-bold text-lg">{formData.rating} / 10</span>
                    </label>
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={formData.rating}
                        onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                        className="w-full accent-accent-primary cursor-pointer h-2 bg-midnight-border rounded-lg appearance-none"
                      />
                    </div>
                  </div>

                  {/* Moods */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-3">
                      How does this story make you feel?
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {MOODS.map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => toggleMood(mood)}
                          className={`px-4 py-2 rounded-xl text-sm capitalize transition-all duration-300 border-2 font-medium ${
                            formData.moods.includes(mood)
                              ? `border-accent-${mood === 'dark' ? 'violet' : mood === 'calm' ? 'emerald' : mood === 'intense' ? 'rose' : 'cyan'} bg-accent-${mood === 'dark' ? 'violet' : mood === 'calm' ? 'emerald' : mood === 'intense' ? 'rose' : 'cyan'}/10 text-accent-${mood === 'dark' ? 'violet' : mood === 'calm' ? 'emerald' : mood === 'intense' ? 'rose' : 'cyan'}`
                              : 'border-midnight-border/50 bg-midnight-surface/50 text-text-secondary hover:bg-midnight-surface'
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Life Phase */}
                  <div className="relative z-30">
                    <label className="block text-sm font-semibold text-secondary mb-3">
                      Associated Life Phase
                    </label>
                    <Dropdown
                      value={formData.lifePhase}
                      onChange={(val) => handleInputChange('lifePhase', val)}
                      options={[
                        { value: '', label: 'Select a life phase...' },
                        ...LIFE_PHASES.map(phase => ({ value: phase, label: phase }))
                      ]}
                      className="w-full py-4 text-base bg-midnight-surface/50"
                    />
                  </div>

                  {/* Reflection */}
                  <div className="pb-2">
                    <label className="block text-sm font-semibold text-secondary mb-3">
                      Why does this story matter to you?
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-5 py-4 bg-midnight-surface/50 border border-midnight-border rounded-xl text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-cyan/40 focus:ring-2 focus:ring-accent-cyan/20 transition-all font-sans text-base resize-none leading-relaxed shadow-inner"
                      rows={5}
                      placeholder="This story connects with me because..."
                    />
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Wizard Navigation */}
        <div className="mt-8 mb-20 md:mb-12 relative z-50">
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border-t border-white/5">
            <button
              type="button"
              onClick={currentStep === 1 ? () => navigate('/library') : handleBack}
              className="btn btn-ghost px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-white/5"
            >
              {currentStep === 1 ? 'Cancel' : <><ChevronLeft className="w-5 h-5" /> Back</>}
            </button>
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary px-8 py-3 rounded-xl flex items-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:scale-105 transition-transform"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit('saveAndSession')}
                  disabled={isSubmitting}
                  className="btn btn-secondary px-4 py-3 rounded-xl flex items-center gap-2 hidden md:flex"
                >
                  <Clock className="w-4 h-4" /> Save + Session
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('save')}
                  disabled={isSubmitting}
                  className="btn btn-primary px-8 py-3 rounded-xl flex items-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:scale-105 transition-transform"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? 'Saving...' : 'Save Story'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="surface-elevated p-10 rounded-3xl max-w-md mx-4 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10"
              >
                <div className="w-20 h-20 bg-accent-emerald/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Save className="w-10 h-10 text-accent-emerald" />
                </div>
                <h3 className="heading-2 text-primary mb-3">Story Saved</h3>
                <p className="text-secondary text-lg">
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
