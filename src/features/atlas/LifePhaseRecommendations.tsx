import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Users, GraduationCap, Briefcase, Heart, Brain, Sparkles, ArrowRight, Star, Clock, BookOpen, Film, Tv, PlayCircle, FileText } from 'lucide-react';
import { atlasRepository } from '@/db/repositories/AtlasRepository';
import type { AtlasLifePhase, AtlasEntry } from '@/types/atlas';

export function LifePhaseRecommendations() {
  const [lifePhases, setLifePhases] = useState<AtlasLifePhase[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<AtlasLifePhase | null>(null);
  const [phaseEntries, setPhaseEntries] = useState<AtlasEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLifePhases();
  }, []);

  const loadLifePhases = async () => {
    try {
      const phasesData = await Promise.all([
        atlasRepository.getLifePhase('College'),
        atlasRepository.getLifePhase('Career'),
        atlasRepository.getLifePhase('Midlife'),
        atlasRepository.getLifePhase('Rebuilding')
      ]);
      
      setLifePhases(phasesData.filter(Boolean) as AtlasLifePhase[]);
    } catch (error) {
      console.error('Failed to load life phases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPhaseEntries = async (phase: AtlasLifePhase) => {
    try {
      const entries = await atlasRepository.getLifePhaseEntries(phase.phase);
      setPhaseEntries(entries);
      setSelectedPhase(phase);
    } catch (error) {
      console.error('Failed to load phase entries:', error);
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'College': return <GraduationCap className="w-6 h-6" />;
      case 'Career': return <Briefcase className="w-6 h-6" />;
      case 'Midlife': return <Heart className="w-6 h-6" />;
      case 'Rebuilding': return <Sparkles className="w-6 h-6" />;
      default: return <Users className="w-6 h-6" />;
    }
  };

  const getPhaseTheme = (phase: string) => {
    const themes = {
      'College': {
        gradient: 'from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-cyan',
        iconColor: 'text-cyan',
        bgColor: 'bg-cyan/10',
        title: 'College Years',
        description: 'Discovery, growth, and foundation building'
      },
      'Career': {
        gradient: 'from-emerald-500/20 to-green-500/20',
        borderColor: 'border-emerald',
        iconColor: 'text-emerald',
        bgColor: 'bg-emerald/10',
        title: 'Career Building',
        description: 'Professional growth and achievement'
      },
      'Midlife': {
        gradient: 'from-amber-500/20 to-orange-500/20',
        borderColor: 'border-amber',
        iconColor: 'text-amber',
        bgColor: 'bg-amber/10',
        title: 'Midlife Journey',
        description: 'Reflection, wisdom, and transition'
      },
      'Rebuilding': {
        gradient: 'from-purple-500/20 to-pink-500/20',
        borderColor: 'border-purple',
        iconColor: 'text-purple',
        bgColor: 'bg-purple/10',
        title: 'Rebuilding Phase',
        description: 'Renewal, transformation, and new beginnings'
      }
    };
    return themes[phase as keyof typeof themes] || themes['College'];
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
          <Brain className="w-12 h-12 text-accent-primary animate-spin mb-4" />
          <p className="text-secondary">Loading Life Phase Recommendations...</p>
        </div>
      </div>
    );
  }

  if (selectedPhase) {
    const theme = getPhaseTheme(selectedPhase.phase);
    
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
              onClick={() => setSelectedPhase(null)}
              className="flex items-center gap-2 text-text-primary/60 hover:text-text-primary mb-4 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Life Phases
            </button>
            
            <div className={`surface-elevated rounded-2xl p-8 border-l-4 ${theme.borderColor}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 bg-gradient-to-br ${theme.gradient} rounded-xl`}>
                  {getPhaseIcon(selectedPhase.phase)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-2">{theme.title}</h1>
                  <p className="text-lg text-accent-primary">{theme.description}</p>
                </div>
              </div>
              
              <p className="text-text-primary/80 text-lg mb-6">{selectedPhase.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-midnight-surface rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Emotional Needs</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPhase.emotionalNeeds.map((need, index) => (
                      <span key={index} className={`px-3 py-1 rounded-full text-sm ${theme.bgColor} ${theme.iconColor}`}>
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-midnight-surface rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Recommended Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPhase.recommendedThemes.map((theme, index) => (
                      <span key={index} className="px-3 py-1 rounded-full text-sm bg-gradient-cyan/20 text-cyan">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-text-primary/60">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{selectedPhase.entryIds.length} Curated Stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Personalized for Your Journey</span>
                </div>
              </div>
            </div>
          </motion.div>
          </FadeIn>

          <FadeIn>
          {/* Phase Entries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6">Stories for This Life Phase</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {phaseEntries.map((entry, index) => (
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
                    {entry.themes.slice(0, 2).map((theme, idx) => (
                      <span key={idx} className="text-xs bg-gradient-cyan/20 text-cyan px-2 py-1 rounded-full">
                        {theme}
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
          <h1 className="heading-1 text-primary mb-4">Life Phase Recommendations</h1>
          <p className="text-h3 text-secondary max-w-3xl mx-auto">
            Stories that resonate with where you are in life right now. 
            Each phase brings unique challenges and opportunities for growth.
          </p>
        </div>
        </BlurReveal>

        {/* Life Phases Grid */}
        <FadeIn>
        <div className="grid gap-8 md:grid-cols-2">
          {lifePhases.map((phase, index) => {
            const theme = getPhaseTheme(phase.phase);
            
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                className={`surface-elevated rounded-2xl overflow-hidden hover:surface-hover transition-all cursor-pointer border-l-4 ${theme.borderColor}`}
                onClick={() => loadPhaseEntries(phase)}
              >
                <div className={`p-8 bg-gradient-to-br ${theme.gradient}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 ${theme.bgColor} rounded-xl`}>
                      <div className={theme.iconColor}>
                        {getPhaseIcon(phase.phase)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-text-primary mb-2">{theme.title}</h2>
                      <p className="text-accent-primary">{theme.description}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-text-primary/60" />
                  </div>
                  
                  <p className="text-text-primary/80 mb-6">{phase.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-midnight-surface/50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Emotional Needs</h3>
                      <div className="flex flex-wrap gap-1">
                        {phase.emotionalNeeds.slice(0, 2).map((need, idx) => (
                          <span key={idx} className={`text-xs px-2 py-1 rounded-full ${theme.bgColor} ${theme.iconColor}`}>
                            {need}
                          </span>
                        ))}
                        {phase.emotionalNeeds.length > 2 && (
                          <span className="text-xs text-text-primary/60">+{phase.emotionalNeeds.length - 2} more</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-midnight-surface/50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Key Themes</h3>
                      <div className="flex flex-wrap gap-1">
                        {phase.recommendedThemes.slice(0, 2).map((theme, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded-full bg-gradient-cyan/20 text-cyan">
                            {theme}
                          </span>
                        ))}
                        {phase.recommendedThemes.length > 2 && (
                          <span className="text-xs text-text-primary/60">+{phase.recommendedThemes.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-midnight-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-text-primary/60">
                      <BookOpen className="w-4 h-4" />
                      <span>{phase.entryIds.length} Stories</span>
                    </div>
                    <button 
                      onClick={() => {
                        window.location.href = '/atlas';
                        alert('Filters applied to Atlas view');
                      }}
                      className={`text-accent-primary hover:text-accent-primary/80 transition-colors`}
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

        {/* Additional Information */}
        <FadeIn>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <div className="surface-elevated rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">How Life Phase Recommendations Work</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="p-4 bg-gradient-cyan/20 rounded-xl mb-4 inline-block">
                  <Users className="w-8 h-8 text-cyan" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Life Context</h3>
                <p className="text-text-primary/70 text-sm">
                  Stories selected based on the unique challenges and opportunities of each life stage.
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-gradient-violet/20 rounded-xl mb-4 inline-block">
                  <Heart className="w-8 h-8 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Emotional Needs</h3>
                <p className="text-text-primary/70 text-sm">
                  Content that addresses the specific emotional and psychological needs of your current phase.
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-gradient-amber/20 rounded-xl mb-4 inline-block">
                  <Brain className="w-8 h-8 text-amber" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Thematic Relevance</h3>
                <p className="text-text-primary/70 text-sm">
                  Stories with themes that resonate with your current life experiences and challenges.
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-gradient-emerald/20 rounded-xl mb-4 inline-block">
                  <Sparkles className="w-8 h-8 text-emerald" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Growth Focus</h3>
                <p className="text-text-primary/70 text-sm">
                  Curated to support personal growth and transformation during this specific life phase.
                </p>
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
