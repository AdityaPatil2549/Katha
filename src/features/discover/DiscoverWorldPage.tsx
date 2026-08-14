import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { 
  Search, 
  Brain, 
  Heart, 
  BookOpen, 
  Sparkles, 
  Clock, 
  Star, 
  Filter,
  Compass,
  Lightbulb,
  Target,
  Map,
  TrendingUp,
  Award,
  Eye,
  ChevronRight,
  Plus,
  Play,
  Users,
  Grid,
  List,
  X,
  Film
} from 'lucide-react';
import { useStoriesStore } from '@/store';
import { traktService, TraktTrendingItem } from '../../services/TraktService';
import { MediaCard } from '@/components/ui/MediaCard';


const MOOD_ENGINE_RESPONSES = {
  lost: {
    title: 'Stories for When You Feel Lost',
    description: 'Find your way back through these stories of journey, discovery, and finding your path.',
    recommendations: [
      { title: 'The Lord of the Rings', reason: 'The ultimate journey of finding your purpose' },
      { title: 'Into the Wild', reason: 'A powerful exploration of finding yourself away from society' },
      { title: 'Spirited Away', reason: 'A beautiful metaphor for finding your way in unfamiliar worlds' }
    ]
  },
  unmotivated: {
    title: 'Stories to Reignite Your Fire',
    description: 'When you need that spark to get moving again.',
    recommendations: [
      { title: 'Rocky', reason: 'The classic story of underdog determination' },
      { title: 'The Pursuit of Happyness', reason: 'Unbreakable human spirit against all odds' },
      { title: 'Whiplash', reason: 'The price of excellence and the drive to be great' }
    ]
  },
  curious: {
    title: 'Stories for the Curious Mind',
    description: 'Feed your curiosity with these mind-expanding narratives.',
    recommendations: [
      { title: 'Arrival', reason: 'Linguistics, time, and the nature of communication' },
      { title: 'Interstellar', reason: 'Physics, love, and the dimensions of human experience' },
      { title: 'The Matrix', reason: 'Question the nature of reality itself' }
    ]
  },
  emotional: {
    title: 'Stories for Emotional Release',
    description: 'Let yourself feel deeply with these emotionally resonant stories.',
    recommendations: [
      { title: 'Grave of the Fireflies', reason: 'The profound beauty and pain of love and loss' },
      { title: 'Manchester by the Sea', reason: 'Raw, honest grief and the possibility of healing' },
      { title: 'Up', reason: 'Love, loss, and adventure in the first ten minutes' }
    ]
  },
  calm: {
    title: 'Stories for Peaceful Reflection',
    description: 'Gentle stories that soothe the soul and quiet the mind.',
    recommendations: [
      { title: 'My Neighbor Totoro', reason: 'Childhood wonder and the magic of everyday life' },
      { title: 'Paterson', reason: 'Finding beauty in routine and the poetry of ordinary life' },
      { title: 'Ozu\'s Tokyo Story', reason: 'The quiet dignity of family and acceptance' }
    ]
  },
  overwhelmed: {
    title: 'Stories for When You\'re Overwhelmed',
    description: 'Simple, clear stories to help you find your center.',
    recommendations: [
      { title: 'Kiki\'s Delivery Service', reason: 'Finding confidence through simple daily work' },
      { title: 'Chef', reason: 'Returning to basics and rediscovering your passion' },
      { title: 'The Secret Life of Walter Mitty', reason: 'The courage to live the life you imagine' }
    ]
  },
  inspired: {
    title: 'Stories to Amplify Inspiration',
    description: 'When you\'re already inspired and want to ride that wave higher.',
    recommendations: [
      { title: 'Dead Poets Society', reason: 'Carpe diem - seize the day with all your heart' },
      { title: 'Good Will Hunting', reason: 'Genius, therapy, and the courage to be vulnerable' },
      { title: 'The King\'s Speech', reason: 'Finding your voice against all odds' }
    ]
  }
};

type Suggestion = { title: string; reason: string; runtime?: string; seasons?: number; episodes?: number; genre?: string; };
type DecisionCategory = { id: string; title: string; description: string; suggestions: Suggestion[]; };

const DECISION_ENGINE_SUGGESTIONS: DecisionCategory[] = [
  {
    id: 'tonight-pick',
    title: 'Tonight\'s Watch',
    description: 'Based on your mood and available time',
    suggestions: [
      { title: 'Before Sunrise', runtime: '1h 41m', genre: 'Romance • Philosophy', reason: 'A quiet, thoughtful film about connection and time' },
      { title: 'Paterson', runtime: '1h 53m', genre: 'Drama • Poetry', reason: 'Perfect for contemplating the beauty in ordinary life' },
      { title: 'The Florida Project', runtime: '1h 51m', genre: 'Drama', reason: 'Childhood wonder seen through adult eyes' }
    ]
  },
  {
    id: 'weekend-binge',
    title: 'Weekend Binge Planner',
    description: 'Dive deep into a world for the weekend',
    suggestions: [
      { title: 'The Crown', seasons: 6, episodes: 60, reason: 'Royal drama with incredible historical depth' },
      { title: 'Breaking Bad', seasons: 5, episodes: 62, reason: 'The ultimate character transformation story' },
      { title: 'Avatar: The Last Airbender', seasons: 3, episodes: 61, reason: 'Philosophy, growth, and stunning storytelling' }
    ]
  },
  {
    id: 'short-watch',
    title: 'Under 30 Minutes',
    description: 'When you only have a little time',
    suggestions: [
      { title: 'Paperman', runtime: '7m', reason: 'Beautiful animated romance that will lift your spirits' },
      { title: 'The Present', runtime: '4m', reason: 'A powerful story about acceptance and love' },
      { title: 'Hair Love', runtime: '7m', reason: 'Heartwarming father-daughter story' }
    ]
  }
];

export default function DiscoverWorldPage() {
  const [activeSection, setActiveSection] = useState<'trending' | 'mood' | 'decision' | 'knowledge'>('trending');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [trendingMovies, setTrendingMovies] = useState<TraktTrendingItem[]>([]);
  const [trendingShows, setTrendingShows] = useState<TraktTrendingItem[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoadingTrending(true);
      try {
        const [movies, shows] = await Promise.all([
          traktService.getTrendingMovies(20),
          traktService.getTrendingShows(20)
        ]);
        setTrendingMovies(movies);
        setTrendingShows(shows);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const moods = Object.keys(MOOD_ENGINE_RESPONSES);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setActiveSection('mood');
  };

  const handleDecisionSelect = (decisionId: string) => {
    setSelectedDecision(decisionId);
    setActiveSection('decision');
  };

  const getCoverGradient = (color: string) => {
    const gradients = {
      violet: 'from-violet-600 to-purple-800',
      cyan: 'from-cyan-600 to-blue-800',
      rose: 'from-rose-600 to-pink-800',
      emerald: 'from-emerald-600 to-green-800',
      amber: 'from-amber-600 to-orange-800'
    };
    return gradients[color as keyof typeof gradients] || 'from-slate-600 to-slate-800';
  };

  return (
    <div className="min-h-screen bg-transparent relative z-10 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 py-page">
        
        <StaggerContainer>
        {/* Header */}
        <BlurReveal>
        <div className="text-center mb-page">
          <h1 className="heading-1 text-gradient-cyan mb-tight">
            Smriti Atlas
          </h1>
          <p className="text-h3 text-quote mb-section">
            Your wisdom discovery engine
          </p>
          <p className="text-secondary max-w-2xl mx-auto">
            Curated collections, mood-based recommendations, and decision-making tools. 
            This isn't entertainment—it's education through stories.
          </p>
        </div>
        </BlurReveal>

        {/* Section Navigation */}
        <FadeIn>
        <div className="glass-card rounded-card p-1.5 mb-page">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {[
              { id: 'trending', label: 'Trending', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'mood', label: 'Mood Engine', icon: <Heart className="w-4 h-4" /> },
              { id: 'decision', label: 'Decision Engine', icon: <Target className="w-4 h-4" /> },
              { id: 'knowledge', label: 'Knowledge Vault', icon: <Lightbulb className="w-4 h-4" /> }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`relative p-3 rounded-[12px] transition-colors duration-300 flex flex-col items-center gap-2 ${
                  activeSection === section.id
                    ? 'text-midnight-bg'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                {activeSection === section.id && (
                  <motion.div
                    layoutId="discover-active-tab"
                    className="absolute inset-0 bg-gradient-to-br from-accent-cyan to-blue-400 rounded-[12px] shadow-[0_0_20px_rgba(0,242,254,0.3)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center gap-2">
                  {section.icon}
                  <span className="text-small font-semibold tracking-wide text-center">{section.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        </FadeIn>

        {/* Quick Mood Selector */}
        <FadeIn>
        <div className="glass-card p-4 rounded-card mb-page">
          <div className="flex items-center gap-tight mb-4">
            <Brain className="w-5 h-5 text-accent-primary" />
            <h3 className="heading-3 text-primary">How are you feeling today?</h3>
          </div>
          <div className="flex flex-wrap gap-tight">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className={`px-4 py-2 rounded-chip text-small capitalize transition-all duration-fast ${
                  selectedMood === mood
                    ? `chip chip-${mood} chip-accent`
                    : 'chip hover:scale-105'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
        </FadeIn>

        {/* Section Content */}
        <FadeIn>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            
            {/* Trakt Trending */}
            {activeSection === 'trending' && (
              <div className="space-y-page">
                {isLoadingTrending ? (
                  <div className="flex justify-center py-page">
                    <span className="text-accent-cyan animate-pulse">Fetching global trends from Trakt...</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-section">
                      <h2 className="heading-2 text-primary flex items-center gap-tight">
                        <TrendingUp className="w-5 h-5 text-accent-cyan" />
                        Trending Movies
                      </h2>
                      <div className="flex gap-normal overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                        {trendingMovies.map((item, index) => (
                          <MediaCard
                            key={item.movie?.ids?.trakt || index}
                            id={item.movie?.ids?.tmdb || item.movie?.ids?.imdb || ''}
                            title={item.movie?.title || ''}
                            year={item.movie?.year}
                            type="movie"
                            posterUrl={item.posterUrl}
                            watchers={item.watchers}
                            onClick={() => {
                              useStoriesStore.getState().addStory({
                                title: item.movie?.title || '',
                                category: 'movie',
                                status: 'planning',
                                rating: item.movie?.rating ? Math.round(item.movie.rating * 10) : 0,
                                favorite: false,
                                genre: [],
                                tags: ['Trakt Trending'],
                                moods: [],
                                notes: item.movie?.overview ? `[Synopsis]\n${item.movie.overview}` : '',
                                posterUrl: item.posterUrl,
                                releaseYear: item.movie?.year,
                                platform: '',
                                watchTimeMinutes: 0,
                                impactIndex: 0
                              });
                              alert(`Added ${item.movie?.title} to your library!`);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-section">
                      <h2 className="heading-2 text-primary flex items-center gap-tight">
                        <TrendingUp className="w-5 h-5 text-accent-cyan" />
                        Trending Shows
                      </h2>
                      <div className="flex gap-normal overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                        {trendingShows.map((item, index) => (
                          <MediaCard
                            key={item.show?.ids?.trakt || index}
                            id={item.show?.ids?.tmdb || item.show?.ids?.imdb || ''}
                            title={item.show?.title || ''}
                            year={item.show?.year}
                            type="show"
                            posterUrl={item.posterUrl}
                            watchers={item.watchers}
                            onClick={() => {
                              useStoriesStore.getState().addStory({
                                title: item.show?.title || '',
                                category: 'series',
                                status: 'planning',
                                rating: item.show?.rating ? Math.round(item.show.rating * 10) : 0,
                                favorite: false,
                                genre: [],
                                tags: ['Trakt Trending'],
                                moods: [],
                                notes: item.show?.overview ? `[Synopsis]\n${item.show.overview}` : '',
                                posterUrl: item.posterUrl,
                                releaseYear: item.show?.year,
                                platform: '',
                                watchTimeMinutes: 0,
                                impactIndex: 0
                              });
                              alert(`Added ${item.show?.title} to your library!`);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mood Engine */}
            {activeSection === 'mood' && (
              <div className="space-y-page">
                {selectedMood && MOOD_ENGINE_RESPONSES[selectedMood as keyof typeof MOOD_ENGINE_RESPONSES] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 rounded-card border-l-4 border-accent-rose"
                  >
                    <div className="flex items-center gap-tight mb-4">
                      <Heart className="w-5 h-5 text-accent-rose" />
                      <h2 className="heading-2 text-primary">
                        {MOOD_ENGINE_RESPONSES[selectedMood as keyof typeof MOOD_ENGINE_RESPONSES].title}
                      </h2>
                    </div>
                    
                    <p className="text-secondary mb-6">
                      {MOOD_ENGINE_RESPONSES[selectedMood as keyof typeof MOOD_ENGINE_RESPONSES].description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-normal">
                      {MOOD_ENGINE_RESPONSES[selectedMood as keyof typeof MOOD_ENGINE_RESPONSES].recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="glass-card p-4 rounded-card"
                        >
                          <h4 className="font-semibold text-primary mb-2">{rec.title}</h4>
                          <p className="text-small text-secondary italic mb-3">{rec.reason}</p>
                          <button 
                            className="btn btn-primary w-full text-small"
                            onClick={() => {
                              useStoriesStore.getState().addStory({
                                title: rec.title,
                                category: 'movie',
                                status: 'planning',
                                rating: 0,
                                favorite: false,
                                genre: [],
                                tags: ['Mood Engine'],
                                moods: [selectedMood],
                                notes: rec.reason,
                                platform: '',
                                watchTimeMinutes: 0,
                                impactIndex: 0
                              });
                              alert(`Added ${rec.title} to your library!`);
                            }}
                          >
                            Add to Library
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {!selectedMood && (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-text-muted" />
                    <h3 className="heading-3 text-primary mb-2">Choose Your Mood</h3>
                    <p className="text-secondary">
                      Select how you're feeling above to get personalized story recommendations.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Decision Engine */}
            {activeSection === 'decision' && (
              <div className="space-y-page">
                <div className="flex items-center gap-tight mb-section">
                  <Target className="w-5 h-5 text-accent-amber" />
                  <h2 className="heading-2 text-primary">Decision Fatigue Killer</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-page">
                  {DECISION_ENGINE_SUGGESTIONS.map((category) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card rounded-card p-6"
                    >
                      <h3 className="heading-3 text-primary mb-2">{category.title}</h3>
                      <p className="text-small text-secondary mb-4">{category.description}</p>
                      
                      <div className="space-y-3">
                        {category.suggestions.map((suggestion, index) => (
                          <div key={index} className="glass-card p-3 rounded-card">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-primary text-small">{suggestion.title}</h4>
                                <p className="text-caption text-secondary">
                                  {suggestion.runtime || `${suggestion.seasons} seasons`}
                                  {' • '}
                                  {suggestion.genre || ''}
                                </p>
                                <p className="text-small text-secondary mt-1 italic">{suggestion.reason}</p>
                              </div>
                              <button 
                                className="btn btn-primary p-2" 
                                title="Add to library"
                                onClick={() => {
                                  useStoriesStore.getState().addStory({
                                    title: suggestion.title,
                                    category: suggestion.seasons ? 'series' : 'movie',
                                    status: 'planning',
                                    rating: 0,
                                    favorite: false,
                                    genre: suggestion.genre ? suggestion.genre.split(' • ') : [],
                                    tags: ['Decision Engine', category.title],
                                    moods: [],
                                    notes: suggestion.reason,
                                    platform: '',
                                    watchTimeMinutes: 0,
                                    impactIndex: 0
                                  });
                                  alert(`Added ${suggestion.title} to your library!`);
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge Vault */}
            {activeSection === 'knowledge' && (
              <div className="space-y-page">
                <div className="flex items-center gap-tight mb-section">
                  <Lightbulb className="w-5 h-5 text-accent-emerald" />
                  <h2 className="heading-2 text-primary">Knowledge Vault</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-page">
                  <motion.div className="glass-card rounded-card p-6">
                    <h3 className="heading-3 text-primary mb-4">Life Lessons from Cinema</h3>
                    <div className="space-y-3">
                      <div className="border-l-4 border-accent-emerald pl-4">
                        <h4 className="font-medium text-primary">The Power of Choice</h4>
                        <p className="text-small text-secondary">From: The Matrix, Sliding Doors, Forrest Gump</p>
                        <p className="text-secondary mt-1">Every decision creates a new timeline of possibilities.</p>
                      </div>
                      <div className="border-l-4 border-accent-emerald pl-4">
                        <h4 className="font-medium text-primary">Love Transcends Time</h4>
                        <p className="text-small text-secondary">From: Interstellar, The Time Traveler's Wife</p>
                        <p className="text-secondary mt-1">Connection exists beyond the constraints of linear time.</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="glass-card rounded-card p-6">
                    <h3 className="heading-3 text-primary mb-4">Principles Archive</h3>
                    <div className="space-y-3">
                      <div className="border-l-4 border-accent-primary pl-4">
                        <h4 className="font-medium text-primary">Compassion Over Revenge</h4>
                        <p className="text-small text-secondary">Source: Vinland Saga</p>
                        <p className="text-secondary mt-1">True strength lies in ending cycles of violence.</p>
                      </div>
                      <div className="border-l-4 border-accent-primary pl-4">
                        <h4 className="font-medium text-primary">Face Your Fear</h4>
                        <p className="text-small text-secondary">Source: Many Hero Stories</p>
                        <p className="text-secondary mt-1">Growth happens at the edge of your comfort zone.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-accent-emerald" />
                  <p className="text-secondary">
                    More wisdom extracted from stories every time you add a new moment to your collection.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        </FadeIn>
        </StaggerContainer>
      </div>
    </div>
  );
}
