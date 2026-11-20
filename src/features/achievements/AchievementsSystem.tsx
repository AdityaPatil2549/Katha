import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { TextEffect } from '@/components/ui/motion/TextEffect';
import { Magnetic } from '@/components/ui/motion/Magnetic';
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  BookOpen, 
  Heart, 
  Clock, 
  TrendingUp,
  Calendar,
  Film,
  Tv,
  Sparkles,
  Lock,
  CheckCircle,
  Crown,
  Medal,
  Gem,
  X,
  ArrowRight
} from 'lucide-react';
import { useStoriesStore, useMomentsStore, useSessionsStore } from '@/store';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'milestone' | 'engagement' | 'discovery' | 'consistency';
  requirement: {
    type: 'stories' | 'moments' | 'sessions' | 'days' | 'genres' | 'rating';
    value: number;
  };
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function AchievementsSystem() {
  const navigate = useNavigate();
  const { stories, loadStories } = useStoriesStore();
  const { moments, loadMoments } = useMomentsStore();
  const { sessions, loadSessions } = useSessionsStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlocked, setShowUnlocked] = useState(false);
  const [inspectedAchievement, setInspectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    void loadStories();
    void loadMoments();
    void loadSessions();
  }, [loadStories, loadMoments, loadSessions]);

  // Calculate user stats
  const userStats = useMemo(() => {
    const completedStories = stories.filter(s => s.status === 'completed').length;
    const totalMoments = moments.length;
    const totalSessions = sessions.length;
    const activeDays = new Set(
      sessions
        .map((s) => {
          const parsed = new Date(s.date);
          return Number.isNaN(parsed.getTime()) ? '' : parsed.toDateString();
        })
        .filter(Boolean)
    ).size;
    const uniqueGenres = new Set(
      stories.flatMap(s => (Array.isArray(s.genre) ? s.genre : s.genre ? [s.genre] : [])).filter(Boolean)
    ).size;
    const highRatedStories = stories.filter(s => s.rating && s.rating >= 8).length;
    
    return {
      completedStories,
      totalMoments,
      totalSessions,
      activeDays,
      uniqueGenres,
      highRatedStories,
      totalStories: stories.length
    };
  }, [stories, moments, sessions]);

  // Define achievements
  const achievements: Achievement[] = useMemo(() => [
    // Milestone Achievements
    {
      id: 'first_story',
      title: 'First Steps',
      description: 'Add your first story to your library',
      icon: <BookOpen className="w-5 h-5" />,
      category: 'milestone',
      requirement: { type: 'stories', value: 1 },
      unlocked: userStats.totalStories >= 1,
      progress: Math.min(userStats.totalStories, 1),
      rarity: 'common'
    },
    {
      id: 'story_collector',
      title: 'Story Collector',
      description: 'Add 25 stories to your library',
      icon: <Film className="w-5 h-5" />,
      category: 'milestone',
      requirement: { type: 'stories', value: 25 },
      unlocked: userStats.totalStories >= 25,
      progress: Math.min(userStats.totalStories, 25),
      rarity: 'common'
    },
    {
      id: 'cinephile',
      title: 'Cinephile',
      description: 'Add 100 stories to your library',
      icon: <Trophy className="w-5 h-5" />,
      category: 'milestone',
      requirement: { type: 'stories', value: 100 },
      unlocked: userStats.totalStories >= 100,
      progress: Math.min(userStats.totalStories, 100),
      rarity: 'rare'
    },
    {
      id: 'master_collector',
      title: 'Master Collector',
      description: 'Add 500 stories to your library',
      icon: <Crown className="w-5 h-5" />,
      category: 'milestone',
      requirement: { type: 'stories', value: 500 },
      unlocked: userStats.totalStories >= 500,
      progress: Math.min(userStats.totalStories, 500),
      rarity: 'epic'
    },

    // Engagement Achievements
    {
      id: 'first_moment',
      title: 'Memory Maker',
      description: 'Save your first moment',
      icon: <Heart className="w-5 h-5" />,
      category: 'engagement',
      requirement: { type: 'moments', value: 1 },
      unlocked: userStats.totalMoments >= 1,
      progress: Math.min(userStats.totalMoments, 1),
      rarity: 'common'
    },
    {
      id: 'storyteller',
      title: 'Storyteller',
      description: 'Save 50 moments',
      icon: <Star className="w-5 h-5" />,
      category: 'engagement',
      requirement: { type: 'moments', value: 50 },
      unlocked: userStats.totalMoments >= 50,
      progress: Math.min(userStats.totalMoments, 50),
      rarity: 'common'
    },
    {
      id: 'the_critic',
      title: 'The Critic',
      description: 'Save 200 moments',
      icon: <Award className="w-5 h-5" />,
      category: 'engagement',
      requirement: { type: 'moments', value: 200 },
      unlocked: userStats.totalMoments >= 200,
      progress: Math.min(userStats.totalMoments, 200),
      rarity: 'rare'
    },
    {
      id: 'archivist',
      title: 'Archivist',
      description: 'Save 500 moments',
      icon: <Medal className="w-5 h-5" />,
      category: 'engagement',
      requirement: { type: 'moments', value: 500 },
      unlocked: userStats.totalMoments >= 500,
      progress: Math.min(userStats.totalMoments, 500),
      rarity: 'epic'
    },

    // Discovery Achievements
    {
      id: 'genre_explorer',
      title: 'Genre Explorer',
      description: 'Watch stories from 5 different genres',
      icon: <Target className="w-5 h-5" />,
      category: 'discovery',
      requirement: { type: 'genres', value: 5 },
      unlocked: userStats.uniqueGenres >= 5,
      progress: Math.min(userStats.uniqueGenres, 5),
      rarity: 'common'
    },
    {
      id: 'connoisseur',
      title: 'Connoisseur',
      description: 'Watch stories from 15 different genres',
      icon: <Gem className="w-5 h-5" />,
      category: 'discovery',
      requirement: { type: 'genres', value: 15 },
      unlocked: userStats.uniqueGenres >= 15,
      progress: Math.min(userStats.uniqueGenres, 15),
      rarity: 'rare'
    },
    {
      id: 'quality_critic',
      title: 'Quality Critic',
      description: 'Rate 25 stories 8/10 or higher',
      icon: <Sparkles className="w-5 h-5" />,
      category: 'discovery',
      requirement: { type: 'rating', value: 25 },
      unlocked: userStats.highRatedStories >= 25,
      progress: Math.min(userStats.highRatedStories, 25),
      rarity: 'rare'
    },

    // Consistency Achievements
    {
      id: 'weekly_watcher',
      title: 'Weekly Watcher',
      description: 'Watch stories on 7 different days',
      icon: <Calendar className="w-5 h-5" />,
      category: 'consistency',
      requirement: { type: 'days', value: 7 },
      unlocked: userStats.activeDays >= 7,
      progress: Math.min(userStats.activeDays, 7),
      rarity: 'common'
    },
    {
      id: 'monthly_marathon',
      title: 'Monthly Marathon',
      description: 'Watch stories on 20 different days',
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'consistency',
      requirement: { type: 'days', value: 20 },
      unlocked: userStats.activeDays >= 20,
      progress: Math.min(userStats.activeDays, 20),
      rarity: 'rare'
    },
    {
      id: 'yearly_yogi',
      title: 'Yearly Yogi',
      description: 'Watch stories on 100 different days',
      icon: <Clock className="w-5 h-5" />,
      category: 'consistency',
      requirement: { type: 'days', value: 100 },
      unlocked: userStats.activeDays >= 100,
      progress: Math.min(userStats.activeDays, 100),
      rarity: 'epic'
    },
    {
      id: 'legendary_binger',
      title: 'Legendary Binger',
      description: 'Watch stories on 365 different days',
      icon: <Crown className="w-5 h-5" />,
      category: 'consistency',
      requirement: { type: 'days', value: 365 },
      unlocked: userStats.activeDays >= 365,
      progress: Math.min(userStats.activeDays, 365),
      rarity: 'legendary'
    }
  ], [userStats]);

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    if (showUnlocked) {
      filtered = filtered.filter(a => a.unlocked);
    }
    
    return filtered.sort((a, b) => {
      // Sort by unlocked status first, then by rarity
      if (a.unlocked !== b.unlocked) {
        return b.unlocked ? 1 : -1;
      }
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    });
  }, [achievements, selectedCategory, showUnlocked]);

  // Calculate stats
  const stats = useMemo(() => {
    const unlocked = achievements.filter(a => a.unlocked).length;
    const total = achievements.length;
    const byCategory = {
      milestone: achievements.filter(a => a.category === 'milestone' && a.unlocked).length,
      engagement: achievements.filter(a => a.category === 'engagement' && a.unlocked).length,
      discovery: achievements.filter(a => a.category === 'discovery' && a.unlocked).length,
      consistency: achievements.filter(a => a.category === 'consistency' && a.unlocked).length
    };
    
    return { unlocked, total, byCategory };
  }, [achievements]);

  // Get rarity visual configs
  const getRarityConfig = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary': return {
        bg: 'from-accent-amber/20 to-accent-rose/20',
        border: 'border-accent-amber/50',
        text: 'text-accent-amber',
        progress: 'bg-gradient-to-r from-accent-amber to-accent-rose',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]'
      };
      case 'epic': return {
        bg: 'from-accent-primary/20 to-accent-rose/20',
        border: 'border-accent-primary/50',
        text: 'text-accent-primary',
        progress: 'bg-gradient-to-r from-accent-primary to-accent-rose',
        glow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]'
      };
      case 'rare': return {
        bg: 'from-accent-gold/20 to-accent-primary/20',
        border: 'border-accent-gold/50',
        text: 'text-accent-gold',
        progress: 'bg-gradient-to-r from-accent-gold to-accent-primary',
        glow: 'shadow-glow-gold'
      };
      default: return {
        bg: 'from-white/10 to-white/5',
        border: 'border-white/20',
        text: 'text-primary',
        progress: 'bg-accent-primary',
        glow: 'shadow-glass'
      };
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: <Trophy className="w-4 h-4" /> },
    { id: 'milestone', label: 'Milestones', icon: <Target className="w-4 h-4" /> },
    { id: 'engagement', label: 'Engagement', icon: <Heart className="w-4 h-4" /> },
    { id: 'discovery', label: 'Discovery', icon: <Star className="w-4 h-4" /> },
    { id: 'consistency', label: 'Consistency', icon: <Calendar className="w-4 h-4" /> }
  ];

  return (
    <div className="p-page min-h-screen bg-transparent pt-24 pb-32">
      <StaggerContainer>
        {/* Cinematic Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12">
          <div>
            <TextEffect
              preset="blur"
              per="word"
              className="font-serif text-5xl md:text-7xl font-bold text-text-primary leading-none mb-4 drop-shadow-2xl flex items-center gap-4"
              delay={0.1}
            >
              Vault of Honors
            </TextEffect>
            <TextEffect
              preset="fade-in-blur"
              per="line"
              className="font-sans text-lg text-text-muted max-w-xl font-light"
              delay={0.2}
            >
              Track your milestones, legacy, and commitment to the cinematic universe.
            </TextEffect>
          </div>
        </div>

        {/* Bento Stats Overview */}
        <FadeIn delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            <div className="glass-card p-5 rounded-card shadow-glass flex flex-col justify-between border-t border-white/10 bg-midnight-bg/40">
              <div className="flex items-center gap-2 text-accent-amber mb-3">
                <Trophy className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Unlocked</span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-primary">{stats.unlocked}</div>
                <div className="text-xl font-medium text-text-muted">/ {stats.total}</div>
              </div>
              <div className="w-full bg-midnight-surface rounded-full h-1 mt-3 overflow-hidden">
                <div 
                  className="bg-accent-amber h-full" 
                  style={{ width: `${(stats.unlocked / stats.total) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="glass-card p-5 rounded-card shadow-glass flex flex-col justify-between border-t border-white/10">
              <div className="flex items-center gap-2 text-accent-emerald mb-3">
                <Target className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Milestones</span>
              </div>
              <div className="text-3xl font-bold text-primary">{stats.byCategory.milestone}</div>
            </div>
            
            <div className="glass-card p-5 rounded-card shadow-glass flex flex-col justify-between border-t border-white/10">
              <div className="flex items-center gap-2 text-accent-gold mb-3">
                <Heart className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Engagement</span>
              </div>
              <div className="text-3xl font-bold text-primary">{stats.byCategory.engagement}</div>
            </div>
            
            <div className="glass-card p-5 rounded-card shadow-glass flex flex-col justify-between border-t border-white/10">
              <div className="flex items-center gap-2 text-accent-orange mb-3">
                <Star className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Discovery</span>
              </div>
              <div className="text-3xl font-bold text-primary">{stats.byCategory.discovery}</div>
            </div>
            
            <div className="glass-card p-5 rounded-card shadow-glass flex flex-col justify-between border-t border-white/10">
              <div className="flex items-center gap-2 text-accent-primary mb-3">
                <Calendar className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Consistency</span>
              </div>
              <div className="text-3xl font-bold text-primary">{stats.byCategory.consistency}</div>
            </div>
          </div>
        </FadeIn>

        {/* Sliding Filters */}
        <FadeIn delay={0.4}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 glass-card rounded-card p-2 shadow-glass">
            <div className="flex flex-wrap gap-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`min-h-[44px] relative px-4 py-2.5 rounded-xl transition-colors duration-300 flex items-center gap-2 text-sm font-medium ${
                    selectedCategory === category.id
                      ? 'text-midnight-bg'
                      : 'text-text-secondary hover:text-primary'
                  }`}
                >
                  {selectedCategory === category.id && (
                    <motion.div
                      layoutId="achievements-active-tab"
                      className="absolute inset-0 bg-gradient-to-br from-accent-amber to-accent-rose rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {category.icon}
                    {category.label}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="h-px w-full md:w-px md:h-8 bg-white/10 mx-2" />

            <Magnetic>
              <button
                type="button"
                onClick={() => setShowUnlocked(!showUnlocked)}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  showUnlocked 
                    ? 'border border-accent-emerald text-accent-emerald shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-accent-emerald/10' 
                    : 'border border-transparent text-text-secondary hover:text-primary hover:bg-white/5'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {showUnlocked ? 'All' : 'Unlocked Only'}
              </button>
            </Magnetic>
          </div>
        </FadeIn>

        {/* Achievements Grid */}
        <FadeIn delay={0.5}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAchievements.map((achievement, index) => {
                const config = getRarityConfig(achievement.rarity);
                const isLocked = !achievement.unlocked;

                return (
                  <motion.div
                    key={achievement.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    onClick={() => setInspectedAchievement(achievement)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect ${achievement.title} criteria`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setInspectedAchievement(achievement); } }}
                    className={`
                      relative overflow-hidden rounded-[24px] p-6 flex flex-col justify-between min-h-[220px] transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]
                      ${isLocked 
                        ? 'glass-card border border-white/5 opacity-75 grayscale-[50%] hover:opacity-100 hover:grayscale-0 hover:border-accent-gold/40' 
                        : `bg-gradient-to-br ${config.bg} border-2 ${config.border} backdrop-blur-xl ${config.glow}`
                      }
                    `}
                  >
                    {/* Background Shine */}
                    {!isLocked && (
                      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
                    )}

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-2xl flex items-center justify-center shadow-inner ${
                          isLocked ? 'bg-midnight-surface border border-white/10 text-text-muted' : 'bg-midnight-bg/60 border border-white/20 text-white'
                        }`}>
                          {isLocked ? <Lock className="w-6 h-6" /> : achievement.icon}
                        </div>
                        
                        {!isLocked && (
                          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${config.border} ${config.text} bg-midnight-bg/40`}>
                            {achievement.rarity}
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4 flex-1">
                        <h3 className={`font-serif text-lg font-bold mb-1 ${isLocked ? 'text-text-secondary' : 'text-primary drop-shadow-md'}`}>
                          {achievement.title}
                        </h3>
                        <p className="text-xs text-text-muted font-light leading-relaxed">
                          {achievement.description}
                        </p>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-auto">
                        <div className="flex justify-between text-xs font-bold tracking-wider uppercase text-text-muted mb-2">
                          <span>Progress</span>
                          <span className={isLocked ? 'text-text-muted' : config.text}>
                            {achievement.progress} / {achievement.requirement.value}
                          </span>
                        </div>
                        <div className="w-full bg-midnight-surface rounded-full h-1.5 overflow-hidden border border-midnight-border">
                          <motion.div
                            className={`h-full ${isLocked ? 'bg-white/30' : config.progress}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(achievement.progress / achievement.requirement.value) * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 + (index * 0.05) }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </FadeIn>

        {filteredAchievements.length === 0 && (
          <FadeIn delay={0.2}>
            <div className="glass-card rounded-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-white/10 mt-12">
              <Trophy className="w-16 h-16 text-text-muted mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-primary mb-2">The Vault is Empty</h3>
              <p className="text-text-secondary max-w-md">
                {showUnlocked 
                  ? 'Your legacy begins now. Watch stories and log moments to unlock your first achievement.'
                  : 'No achievements found in this category.'
                }
              </p>
            </div>
          </FadeIn>
        )}

        {/* Interactive Badge Criteria Inspection Modal */}
        <AnimatePresence>
          {inspectedAchievement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-midnight-bg/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
              onClick={() => setInspectedAchievement(null)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="badge-modal-title"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-midnight-surface border border-accent-gold/30 rounded-[2rem] max-w-lg w-full p-8 shadow-elevation relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Background ambient glow */}
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-accent-gold/15 rounded-full blur-[60px] pointer-events-none" />

                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl flex items-center justify-center border ${
                      inspectedAchievement.unlocked 
                        ? 'bg-accent-gold/20 border-accent-gold/40 text-accent-gold shadow-glow-gold' 
                        : 'bg-midnight-bg/80 border-white/10 text-text-muted'
                    }`}>
                      {inspectedAchievement.unlocked ? inspectedAchievement.icon : <Lock className="w-8 h-8" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-accent-gold/15 text-accent-gold border border-accent-gold/30">
                          {inspectedAchievement.rarity}
                        </span>
                        <span className="text-xs text-text-muted uppercase tracking-wider">
                          {inspectedAchievement.category}
                        </span>
                      </div>
                      <h2 id="badge-modal-title" className="font-serif text-2xl font-bold text-primary">
                        {inspectedAchievement.title}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectedAchievement(null)}
                    className="p-2 rounded-full hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed mb-6 font-light">
                  {inspectedAchievement.description}
                </p>

                {/* Progress breakdown */}
                <div className="p-5 rounded-2xl bg-midnight-bg/60 border border-white/10 space-y-4 mb-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider font-bold">
                    <span className="text-text-muted">Target Requirement</span>
                    <span className="text-accent-gold">
                      {inspectedAchievement.requirement.value} {inspectedAchievement.requirement.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs uppercase tracking-wider font-bold">
                    <span className="text-text-muted">Current Progress</span>
                    <span className={inspectedAchievement.unlocked ? 'text-accent-emerald' : 'text-primary'}>
                      {inspectedAchievement.progress} / {inspectedAchievement.requirement.value} ({Math.round((inspectedAchievement.progress / inspectedAchievement.requirement.value) * 100)}%)
                    </span>
                  </div>

                  <div className="w-full bg-midnight-surface rounded-full h-2 overflow-hidden border border-white/10">
                    <motion.div
                      className={`h-full ${inspectedAchievement.unlocked ? 'bg-accent-emerald' : 'bg-gradient-gold'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(inspectedAchievement.progress / inspectedAchievement.requirement.value) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>

                {/* Action CTA */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-text-muted">
                    {inspectedAchievement.unlocked ? (
                      <span className="flex items-center gap-1.5 text-accent-emerald font-semibold">
                        <CheckCircle className="w-4 h-4" /> Honor Claimed in Vault
                      </span>
                    ) : (
                      <span>Complete requirement to unlock</span>
                    )}
                  </div>

                  {!inspectedAchievement.unlocked ? (
                    <button
                      onClick={() => {
                        const type = inspectedAchievement.requirement.type;
                        setInspectedAchievement(null);
                        if (type === 'stories') navigate('/library');
                        else if (type === 'moments') navigate('/journal');
                        else if (type === 'sessions' || type === 'days') navigate('/calendar');
                        else navigate('/explore');
                      }}
                      className="px-5 py-2.5 rounded-chip bg-accent-gold text-midnight-bg font-sans font-bold text-xs uppercase tracking-wider shadow-glow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setInspectedAchievement(null)}
                      className="btn btn-secondary text-xs"
                    >
                      Done
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </StaggerContainer>
    </div>
  );
}
