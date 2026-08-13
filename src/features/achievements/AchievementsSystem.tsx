import { useState, useEffect, useMemo } from 'react';
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
  Gem
} from 'lucide-react';
import { useStoriesStore, useMomentsStore } from '@/store';

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
  const { stories } = useStoriesStore();
  const momentsStore: any = useMomentsStore();
  const { moments, sessions = [] } = momentsStore;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlocked, setShowUnlocked] = useState(false);

  // Calculate user stats
  const userStats = useMemo(() => {
    const completedStories = stories.filter(s => s.status === 'completed').length;
    const totalMoments = moments.length;
    const totalSessions = sessions.length;
    const activeDays = new Set(sessions.map((s: any) => s.date?.toDateString?.() || '')).size;
    const uniqueGenres = new Set(stories.map(s => s.genre).filter(Boolean)).size;
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
        bg: 'from-accent-cyan/20 to-accent-primary/20',
        border: 'border-accent-cyan/50',
        text: 'text-accent-cyan',
        progress: 'bg-gradient-to-r from-accent-cyan to-accent-primary',
        glow: 'shadow-[0_0_20px_rgba(0,242,254,0.15)]'
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
              <div className="flex items-center gap-2 text-accent-cyan mb-3">
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
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative px-4 py-2 rounded-xl transition-colors duration-300 flex items-center gap-2 text-sm font-medium ${
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
                onClick={() => setShowUnlocked(!showUnlocked)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
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
                    className={`
                      relative overflow-hidden rounded-[24px] p-6 flex flex-col justify-between min-h-[220px] transition-all duration-500
                      ${isLocked 
                        ? 'glass-card border border-white/5 opacity-75 grayscale-[50%]' 
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
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${config.border} ${config.text} bg-midnight-bg/40`}>
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
                        <div className="flex justify-between text-[10px] font-bold tracking-wider uppercase text-text-muted mb-2">
                          <span>Progress</span>
                          <span className={isLocked ? 'text-text-muted' : config.text}>
                            {achievement.progress} / {achievement.requirement.value}
                          </span>
                        </div>
                        <div className="w-full bg-midnight-surface rounded-full h-1.5 overflow-hidden border border-white/5">
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
      </StaggerContainer>
    </div>
  );
}
