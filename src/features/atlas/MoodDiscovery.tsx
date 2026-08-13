import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Heart, Brain, Sparkles, Cloud, Sun, Moon, Zap, Target, ArrowRight, Star, Clock, BookOpen, Film, Tv, PlayCircle, FileText } from 'lucide-react';
import { atlasRepository } from '@/db/repositories/AtlasRepository';
import type { AtlasMoodMap, AtlasEntry } from '@/types/atlas';

export function MoodDiscovery() {
  const [moodMaps, setMoodMaps] = useState<AtlasMoodMap[]>([]);
  const [selectedMood, setSelectedMood] = useState<AtlasMoodMap | null>(null);
  const [moodEntries, setMoodEntries] = useState<AtlasEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMoodMaps();
  }, []);

  const loadMoodMaps = async () => {
    try {
      const moodsData = await Promise.all([
        atlasRepository.getMoodRecommendations('lost'),
        atlasRepository.getMoodRecommendations('unmotivated'),
        atlasRepository.getMoodRecommendations('discouraged'),
        atlasRepository.getMoodRecommendations('anxious'),
        atlasRepository.getMoodRecommendations('contemplative')
      ]);
      
      // Create mood map data
      const moodData: AtlasMoodMap[] = [
        {
          mood: 'lost',
          description: 'Feeling directionless, confused, or unsure about life decisions',
          emotionalGoal: 'clarity and direction',
          recommendedEntryIds: ['atlas-001', 'atlas-002']
        },
        {
          mood: 'unmotivated',
          description: 'Lacking energy, drive, or enthusiasm for life\'s challenges',
          emotionalGoal: 'inspiration and energy',
          recommendedEntryIds: ['atlas-001', 'atlas-002']
        },
        {
          mood: 'discouraged',
          description: 'Feeling down, defeated, or lacking hope',
          emotionalGoal: 'hope and resilience',
          recommendedEntryIds: ['atlas-001']
        },
        {
          mood: 'anxious',
          description: 'Feeling worried, stressed, or overwhelmed',
          emotionalGoal: 'calm and perspective',
          recommendedEntryIds: ['atlas-002']
        },
        {
          mood: 'contemplative',
          description: 'In a thoughtful, philosophical mood ready for deep thinking',
          emotionalGoal: 'intellectual stimulation',
          recommendedEntryIds: ['atlas-001', 'atlas-002']
        }
      ];
      
      setMoodMaps(moodData);
    } catch (error) {
      console.error('Failed to load mood maps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoodEntries = async (mood: AtlasMoodMap) => {
    try {
      const entries = await atlasRepository.getMoodRecommendations(mood.mood);
      setMoodEntries(entries);
      setSelectedMood(mood);
    } catch (error) {
      console.error('Failed to load mood entries:', error);
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'lost': return <Cloud className="w-6 h-6" />;
      case 'unmotivated': return <Zap className="w-6 h-6" />;
      case 'discouraged': return <Moon className="w-6 h-6" />;
      case 'anxious': return <Brain className="w-6 h-6" />;
      case 'contemplative': return <Sparkles className="w-6 h-6" />;
      default: return <Heart className="w-6 h-6" />;
    }
  };

  const getMoodTheme = (mood: string) => {
    const themes = {
      'lost': {
        gradient: 'from-blue-500/20 to-indigo-500/20',
        borderColor: 'border-blue',
        iconColor: 'text-accent-cyan',
        bgColor: 'bg-accent-cyan/10',
        title: 'Feeling Lost',
        description: 'Find your direction'
      },
      'unmotivated': {
        gradient: 'from-yellow-500/20 to-orange-500/20',
        borderColor: 'border-amber',
        iconColor: 'text-amber',
        bgColor: 'bg-amber/10',
        title: 'Feeling Unmotivated',
        description: 'Reignite your passion'
      },
      'discouraged': {
        gradient: 'from-purple-500/20 to-pink-500/20',
        borderColor: 'border-purple',
        iconColor: 'text-purple',
        bgColor: 'bg-purple/10',
        title: 'Feeling Discouraged',
        description: 'Restore your hope'
      },
      'anxious': {
        gradient: 'from-red-500/20 to-rose-500/20',
        borderColor: 'border-rose',
        iconColor: 'text-rose',
        bgColor: 'bg-rose/10',
        title: 'Feeling Anxious',
        description: 'Find calm and clarity'
      },
      'contemplative': {
        gradient: 'from-cyan-500/20 to-teal-500/20',
        borderColor: 'border-cyan',
        iconColor: 'text-cyan',
        bgColor: 'bg-cyan/10',
        title: 'Feeling Contemplative',
        description: 'Deepen your understanding'
      }
    };
    return themes[mood as keyof typeof themes] || themes['lost'];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'movie': return <Film className="w-4 h-4" />;
      case 'series': return <Tv className="w-4 h-4" />;
      case 'anime': return <PlayCircle className="w-4 h-4" />;
      case 'documentary': return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald';
      case 'medium': return 'text-amber';
      case 'heavy': return 'text-rose';
      default: return 'text-text-primary/60';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-midnight flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-accent-rose animate-pulse mb-4" />
          <p className="text-secondary">Loading Mood Discovery...</p>
        </div>
      </div>
    );
  }

  if (selectedMood) {
    const theme = getMoodTheme(selectedMood.mood);
    
    return (
      <div className="min-h-screen bg-gradient-midnight p-page">
        <div className="max-w-7xl mx-auto">
          <StaggerContainer>
          <FadeIn>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => setSelectedMood(null)}
              className="flex items-center gap-2 text-text-primary/60 hover:text-text-primary mb-4 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Moods
            </button>
            
            <div className={`surface-elevated rounded-2xl p-8 border-l-4 ${theme.borderColor}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 bg-gradient-to-br ${theme.gradient} rounded-xl`}>
                  <div className={theme.iconColor}>
                    {getMoodIcon(selectedMood.mood)}
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-2">{theme.title}</h1>
                  <p className="text-lg text-accent-primary">{theme.description}</p>
                </div>
              </div>
              
              <p className="text-text-primary/80 text-lg mb-6">{selectedMood.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-midnight-surface rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Current State</h3>
                  <p className="text-text-primary/70">{selectedMood.description}</p>
                </div>
                
                <div className="bg-midnight-surface rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Emotional Goal</h3>
                  <p className="text-text-primary/70">{selectedMood.emotionalGoal}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-text-primary/60">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{selectedMood.recommendedEntryIds.length} Curated Stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Targeted Emotional Support</span>
                </div>
              </div>
            </div>
          </motion.div>
          </FadeIn>

          <FadeIn>
          {/* Mood Entries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6">Stories for This Mood</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {moodEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="surface-elevated rounded-xl p-6 hover:surface-hover transition-all cursor-pointer"
                  onClick={() => window.open(`/atlas?entry=${entry.id}`, '_blank')}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(entry.category)}
                      <span className="text-sm text-text-primary/60 capitalize">{entry.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getDifficultyColor(entry.difficulty)}`}>
                        {entry.difficulty}
                      </span>
                      <span className="text-sm text-text-primary/60">{entry.year}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-text-primary mb-2">{entry.title}</h3>
                  <p className="text-text-primary/70 text-sm mb-4 line-clamp-3">{entry.description}</p>

                  <div className="bg-midnight-surface rounded-lg p-3 mb-4">
                    <p className="text-xs text-accent-primary mb-1">Why Watch Now:</p>
                    <p className="text-xs text-text-primary/80 line-clamp-2">{entry.whyWatch}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.impactTags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 rounded-full ${theme.bgColor} ${theme.iconColor}`}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-primary/60">
                    <div className="flex items-center gap-4">
                      {entry.runtime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{entry.runtime}m</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{entry.impactTags.length} impacts</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          </FadeIn>
          </StaggerContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-midnight p-page">
      <div className="max-w-7xl mx-auto">
        <StaggerContainer>
        {/* Header */}
        <BlurReveal>
        <div className="text-center mb-12">
          <h1 className="heading-1 text-gradient-rose mb-4">Mood-Based Discovery</h1>
          <p className="text-h3 text-secondary max-w-3xl mx-auto">
            Find the perfect story for how you're feeling right now. 
            Our mood engine matches stories to your emotional state for maximum impact.
          </p>
        </div>
        </BlurReveal>

        {/* Mood Grid */}
        <FadeIn>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {moodMaps.map((mood, index) => {
            const theme = getMoodTheme(mood.mood);
            
            return (
              <motion.div
                key={mood.mood}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                className={`surface-elevated rounded-2xl overflow-hidden hover:surface-hover transition-all cursor-pointer border-l-4 ${theme.borderColor}`}
                onClick={() => loadMoodEntries(mood)}
              >
                <div className={`p-6 bg-gradient-to-br ${theme.gradient}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 ${theme.bgColor} rounded-xl`}>
                      <div className={theme.iconColor}>
                        {getMoodIcon(mood.mood)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-text-primary mb-1">{theme.title}</h2>
                      <p className="text-sm text-accent-primary">{theme.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-primary/60" />
                  </div>
                  
                  <p className="text-text-primary/70 text-sm mb-4 line-clamp-2">{mood.description}</p>
                  
                  <div className="bg-midnight-surface/50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-primary/60">Emotional Goal:</span>
                      <span className={`text-xs font-medium ${theme.iconColor}`}>{mood.emotionalGoal}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-midnight-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-text-primary/60">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">{mood.recommendedEntryIds.length} Stories</span>
                    </div>
                    <button 
                      onClick={() => {
                        window.location.href = '/atlas'; // or use navigate if hook is available
                        alert('Filters applied to Atlas view');
                      }} 
                      className={`text-sm ${theme.iconColor} hover:opacity-80 transition-opacity`}
                    >
                      Explore Stories →
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        </FadeIn>

        {/* How It Works */}
        <FadeIn>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <div className="surface-elevated rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">How Mood Discovery Works</h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="p-4 bg-gradient-blue/20 rounded-xl mb-4 inline-block">
                  <Heart className="w-8 h-8 text-accent-cyan" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Emotional Matching</h3>
                <p className="text-text-primary/70 text-sm">
                  Stories are matched to your current emotional state for maximum relevance and impact.
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-gradient-purple/20 rounded-xl mb-4 inline-block">
                  <Brain className="w-8 h-8 text-purple" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Psychological Principles</h3>
                <p className="text-text-primary/70 text-sm">
                  Based on psychological research about how stories affect mood and emotional regulation.
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-gradient-amber/20 rounded-xl mb-4 inline-block">
                  <Target className="w-8 h-8 text-amber" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Targeted Outcomes</h3>
                <p className="text-text-primary/70 text-sm">
                  Each mood recommendation is designed to help you achieve specific emotional goals.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        </FadeIn>

        {/* Mood Tips */}
        <FadeIn>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <div className="surface-elevated rounded-2xl p-8">
            <h2 className="text-xl font-bold text-text-primary mb-6">Tips for Mood-Based Story Selection</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Sun className="w-5 h-5 text-amber mt-1" />
                <div>
                  <h3 className="text-text-primary font-medium mb-1">Start with Your Current Feeling</h3>
                  <p className="text-text-primary/70 text-sm">Be honest about how you're feeling right now for the best recommendations.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Moon className="w-5 h-5 text-accent-cyan mt-1" />
                <div>
                  <h3 className="text-text-primary font-medium mb-1">Consider Your Desired State</h3>
                  <p className="text-text-primary/70 text-sm">Think about how you want to feel after watching the story.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple mt-1" />
                <div>
                  <h3 className="text-text-primary font-medium mb-1">Trust the Process</h3>
                  <p className="text-text-primary/70 text-sm">Sometimes the best stories are ones that challenge your current mood.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-rose mt-1" />
                <div>
                  <h3 className="text-text-primary font-medium mb-1">Reflect Afterwards</h3>
                  <p className="text-text-primary/70 text-sm">Take time to process how the story made you feel and what you learned.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </FadeIn>
        </StaggerContainer>
      </div>
    </div>
  );
}
