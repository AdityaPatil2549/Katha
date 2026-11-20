import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  Film,
  Download,
  Database
} from 'lucide-react';
import { useStoriesStore, useKnowledgeStore } from '@/store';
import { useToastStore } from '@/store/toastStore';
import { traktService, TraktTrendingItem } from '../../services/TraktService';
import { MediaCard } from '@/components/ui/MediaCard';

import { AtlasBrowser } from '@/features/atlas/AtlasBrowser';
import { LifePhaseRecommendations } from '@/features/atlas/LifePhaseRecommendations';
import { DecisionEngine } from '@/features/atlas/DecisionEngine';
import { WisdomDashboard } from '@/features/atlas/WisdomDashboard';


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

type ActiveSection = 'atlas' | 'life-phases' | 'decision' | 'trending' | 'wisdom';

export default function DiscoverWorldPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as ActiveSection | null;
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    tabParam && ['atlas', 'life-phases', 'decision', 'trending', 'wisdom'].includes(tabParam)
      ? tabParam
      : 'atlas'
  );

  useEffect(() => {
    if (tabParam && ['atlas', 'life-phases', 'decision', 'trending', 'wisdom'].includes(tabParam)) {
      setActiveSection(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (sectionId: ActiveSection) => {
    setActiveSection(sectionId);
    setSearchParams({ tab: sectionId });
  };

  const [selectedMood, setSelectedMood] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const addToast = useToastStore((s) => s.addToast);
  const { knowledge, loadKnowledge } = useKnowledgeStore();

  const [trendingMovies, setTrendingMovies] = useState<TraktTrendingItem[]>([]);
  const [trendingShows, setTrendingShows] = useState<TraktTrendingItem[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  useEffect(() => {
    void loadKnowledge();
  }, [loadKnowledge]);

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
    handleTabChange('trending');
  };

  const handleDecisionSelect = (decisionId: string) => {
    setSelectedDecision(decisionId);
    handleTabChange('decision');
  };

  return (
    <div className="min-h-screen bg-transparent relative z-10 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 py-page">
        
        <StaggerContainer>
        {/* Header */}
        <BlurReveal>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/25 text-accent-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>Smriti Atlas & Wisdom Engine</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary tracking-tight mb-3">
            Explore the Universe of Wisdom
          </h1>
          <p className="font-sans text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Curated philosophical masterpieces, life-crisis narratives, decision engines, and global trends designed to transform your perspective.
          </p>
        </div>
        </BlurReveal>

        {/* Section Navigation Tabs */}
        <FadeIn>
        <div className="glass-card rounded-2xl p-1.5 mb-8 shadow-card border border-midnight-border">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
            {([
              { id: 'atlas', label: 'Curated Atlas', desc: '50+ Masterpieces', icon: <Compass className="w-4 h-4" /> },
              { id: 'life-phases', label: 'Life Phases', desc: 'Crisis & Growth', icon: <Users className="w-4 h-4" /> },
              { id: 'decision', label: 'Decision Engine', desc: 'What to Watch', icon: <Target className="w-4 h-4" /> },
              { id: 'trending', label: 'Global Trends', desc: 'Trakt Hits & Moods', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'wisdom', label: 'Wisdom Vault', desc: 'Quotes & Insights', icon: <Lightbulb className="w-4 h-4" /> }
            ] as const).map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleTabChange(section.id)}
                  className={`relative min-h-[48px] p-3 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-1 group ${
                    isActive
                      ? 'text-midnight-bg font-bold shadow-glow-gold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-midnight-surface-hover'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="explore-active-tab"
                      className="absolute inset-0 bg-gradient-to-r from-accent-gold to-accent-amber rounded-xl shadow-glow-gold"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-midnight-bg font-bold' : 'group-hover:text-text-primary'}`}>
                    {section.icon}
                    <span className="text-xs sm:text-sm font-bold tracking-wide">{section.label}</span>
                  </span>
                  <span className={`relative z-10 text-xs font-semibold hidden sm:inline ${isActive ? 'text-midnight-bg/80' : 'text-text-muted group-hover:text-text-secondary'}`}>
                    {section.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        </FadeIn>

        {/* Section Content */}
        <FadeIn>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {/* 1. Curated Atlas Tab */}
            {activeSection === 'atlas' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-midnight-surface/80 border border-midnight-border backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent-primary/15 text-accent-primary">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary">Curated Starter Pack: 50+ Masterpieces</h3>
                      <p className="text-xs text-text-secondary">Install philosophical milestones across cinema, anime, series, and books into your local vault with 1 click.</p>
                    </div>
                  </div>
                  <Link 
                    to="/atlas-installer" 
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-accent-primary text-high-contrast font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Open Installer</span>
                  </Link>
                </div>
                <AtlasBrowser />
              </div>
            )}

            {/* 2. Life Phase Recommendations Tab */}
            {activeSection === 'life-phases' && (
              <div className="space-y-6">
                <LifePhaseRecommendations />
              </div>
            )}

            {/* 3. Decision Engine Tab */}
            {activeSection === 'decision' && (
              <div className="space-y-6">
                <DecisionEngine />
              </div>
            )}

            {/* 4. Global Trends & Moods Tab */}
            {activeSection === 'trending' && (
              <div className="space-y-8">
                {/* Quick Mood Selector */}
                <div className="glass-card p-5 rounded-2xl border border-midnight-border shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-accent-primary" />
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">How are you feeling right now?</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => handleMoodSelect(mood)}
                        className={`min-h-[44px] px-4 py-2 inline-flex items-center justify-center rounded-full text-xs font-medium capitalize transition-all ${
                          selectedMood === mood
                            ? 'bg-accent-primary text-high-contrast shadow-sm'
                            : 'bg-midnight-surface/80 border border-midnight-border text-text-secondary hover:text-text-primary hover:bg-midnight-surface-hover'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood Response Banner */}
                {selectedMood && MOOD_ENGINE_RESPONSES[selectedMood as keyof typeof MOOD_ENGINE_RESPONSES] && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 rounded-2xl border-l-4 border-accent-rose shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-accent-rose" />
                      <h3 className="text-lg font-bold text-text-primary">
                        {MOOD_ENGINE_RESPONSES[selectedMood as keyof typeof MOOD_ENGINE_RESPONSES].title}
                      </h3>
                    </div>
                    <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                      {MOOD_ENGINE_RESPONSES[selectedMood as keyof typeof MOOD_ENGINE_RESPONSES].description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {MOOD_ENGINE_RESPONSES[selectedMood as keyof typeof MOOD_ENGINE_RESPONSES].recommendations.map((rec, index) => (
                        <div key={index} className="p-4 rounded-xl bg-midnight-surface border border-midnight-border flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-text-primary text-sm mb-1">{rec.title}</h4>
                            <p className="text-xs text-text-secondary italic mb-3">{rec.reason}</p>
                          </div>
                          <button
                            type="button"
                            className="min-h-[44px] w-full py-2.5 px-3 rounded-lg bg-accent-primary/15 text-accent-primary hover:bg-accent-primary hover:text-high-contrast text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center"
                            onClick={async () => {
                              await useStoriesStore.getState().addStory({
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
                              addToast({ type: 'success', message: `Added "${rec.title}" to your library.` });
                            }}
                          >
                            Add to Library
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Trending Movies & Shows */}
                <div className="space-y-6">
                  {isLoadingTrending ? (
                    <div className="flex justify-center py-12">
                      <span className="text-accent-primary animate-pulse text-sm font-medium">Fetching global trends...</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-accent-primary" />
                          <span>Trending Movies</span>
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                          {trendingMovies.map((item, index) => (
                            <MediaCard
                              key={item.movie?.ids?.trakt || index}
                              id={item.movie?.ids?.tmdb || item.movie?.ids?.imdb || ''}
                              title={item.movie?.title || ''}
                              year={item.movie?.year}
                              type="movie"
                              posterUrl={item.posterUrl}
                              watchers={item.watchers}
                              onClick={async () => {
                                await useStoriesStore.getState().addStory({
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
                                addToast({ type: 'success', message: `Added "${item.movie?.title || 'Movie'}" to your library.` });
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-accent-primary" />
                          <span>Trending Series</span>
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                          {trendingShows.map((item, index) => (
                            <MediaCard
                              key={item.show?.ids?.trakt || index}
                              id={item.show?.ids?.tmdb || item.show?.ids?.imdb || ''}
                              title={item.show?.title || ''}
                              year={item.show?.year}
                              type="show"
                              posterUrl={item.posterUrl}
                              watchers={item.watchers}
                              onClick={async () => {
                                await useStoriesStore.getState().addStory({
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
                                addToast({ type: 'success', message: `Added "${item.show?.title || 'Show'}" to your library.` });
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 5. Wisdom Dashboard Tab */}
            {activeSection === 'wisdom' && (
              <div className="space-y-6">
                <WisdomDashboard />
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
