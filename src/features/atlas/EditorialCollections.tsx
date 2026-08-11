import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Clock, Users, Star, Heart, Brain, Compass, ChevronRight, Play, Film, Tv, FileText } from 'lucide-react';
import { atlasRepository } from '@/db/repositories/AtlasRepository';
import type { AtlasCollection, AtlasEntry } from '@/types/atlas';

export function EditorialCollections() {
  const [collections, setCollections] = useState<AtlasCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<AtlasCollection | null>(null);
  const [collectionEntries, setCollectionEntries] = useState<AtlasEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const collectionsData = await atlasRepository.getAllCollections();
      setCollections(collectionsData);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollectionEntries = async (collection: AtlasCollection) => {
    try {
      const entries = await atlasRepository.getCollectionEntries(collection.id);
      setCollectionEntries(entries);
      setSelectedCollection(collection);
    } catch (error) {
      console.error('Failed to load collection entries:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'movie': return <Film className="w-4 h-4" />;
      case 'series': return <Tv className="w-4 h-4" />;
      case 'anime': return <Play className="w-4 h-4" />;
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

  const getCollectionTheme = (collectionId: string) => {
    const themes = {
      'collection-001': {
        gradient: 'from-amber-500/20 to-orange-500/20',
        borderColor: 'border-amber',
        iconColor: 'text-amber',
        title: 'Life-Changing Cinema'
      },
      'collection-002': {
        gradient: 'from-purple-500/20 to-pink-500/20',
        borderColor: 'border-purple',
        iconColor: 'text-purple',
        title: 'Philosophical Depth'
      }
    };
    return themes[collectionId as keyof typeof themes] || {
      gradient: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan',
      iconColor: 'text-cyan',
      title: 'Curated Wisdom'
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-midnight flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-accent-primary animate-spin mb-4" />
          <p className="text-secondary">Loading Editorial Collections...</p>
        </div>
      </div>
    );
  }

  if (selectedCollection) {
    const theme = getCollectionTheme(selectedCollection.id);
    
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
              onClick={() => setSelectedCollection(null)}
              className="flex items-center gap-2 text-text-primary/60 hover:text-text-primary mb-4 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Collections
            </button>
            
            <div className={`surface-elevated rounded-2xl p-8 border-l-4 ${theme.borderColor}`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 bg-gradient-to-br ${theme.gradient} rounded-xl`}>
                      <Sparkles className={`w-8 h-8 ${theme.iconColor}`} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-text-primary mb-2">{selectedCollection.title}</h1>
                      <p className="text-lg text-accent-primary">{selectedCollection.subtitle}</p>
                    </div>
                  </div>
                  
                  <p className="text-text-primary/80 text-lg mb-6">{selectedCollection.description}</p>
                  
                  <div className="bg-midnight-surface rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Curator's Philosophy</h3>
                    <p className="text-text-primary/70 italic">{selectedCollection.philosophy}</p>
                  </div>
                  
                  <div className="flex items-center gap-6 text-text-primary/60">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{selectedCollection.entryIds.length} Stories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{selectedCollection.lifeStage.join(', ')}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${getDifficultyColor(selectedCollection.difficulty)}`}>
                      <Brain className="w-4 h-4" />
                      <span className="capitalize">{selectedCollection.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </FadeIn>

          <FadeIn>
          {/* Collection Entries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6">Stories in This Collection</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collectionEntries.map((entry, index) => (
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

                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.genres.slice(0, 2).map((genre, idx) => (
                      <span key={idx} className="text-xs bg-midnight-surface text-text-primary/60 px-2 py-1 rounded-full">
                        {genre}
                      </span>
                    ))}
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
          <h1 className="heading-1 text-primary mb-4">Editorial Collections</h1>
          <p className="text-h3 text-secondary max-w-3xl mx-auto">
            Carefully curated journeys through stories that shape our understanding of life, 
            philosophy, and the human experience. Each collection is a gateway to transformation.
          </p>
        </div>
        </BlurReveal>

        {/* Collections Grid */}
        <FadeIn>
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {collections.map((collection, index) => {
            const theme = getCollectionTheme(collection.id);
            
            return (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                className={`surface-elevated rounded-2xl overflow-hidden hover:surface-hover transition-all cursor-pointer border-l-4 ${theme.borderColor}`}
                onClick={() => loadCollectionEntries(collection)}
              >
                <div className={`p-8 bg-gradient-to-br ${theme.gradient}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-midnight-surface rounded-xl">
                      <Sparkles className={`w-8 h-8 ${theme.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-text-primary mb-2">{collection.title}</h2>
                      <p className="text-accent-primary">{collection.subtitle}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-text-primary/60" />
                  </div>
                  
                  <p className="text-text-primary/80 mb-6">{collection.description}</p>
                  
                  <div className="bg-midnight-surface/50 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Philosophy</h3>
                    <p className="text-text-primary/70 italic">{collection.philosophy}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-text-primary/60">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{collection.entryIds.length} Stories</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{collection.lifeStage.length} Life Stages</span>
                      </div>
                      <div className={`flex items-center gap-2 ${getDifficultyColor(collection.difficulty)}`}>
                        <Brain className="w-4 h-4" />
                        <span className="capitalize">{collection.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-midnight-border">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {collection.emotionalProfile.slice(0, 3).map((emotion, idx) => (
                        <span key={idx} className="text-xs bg-midnight-surface text-text-primary/60 px-3 py-1 rounded-full">
                          {emotion}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        window.location.href = '/atlas';
                        alert('Filters applied to Atlas view');
                      }}
                      className="text-accent-primary hover:text-accent-primary/80 transition-colors"
                    >
                      Explore Collection →
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        </FadeIn>

        {/* Additional Features */}
        <FadeIn>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <div className="surface-elevated rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Why Editorial Collections Matter</h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="p-4 bg-gradient-cyan/20 rounded-xl mb-4 inline-block">
                  <Compass className="w-8 h-8 text-cyan" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Curated Wisdom</h3>
                <p className="text-text-primary/70 text-sm">
                  Each collection is carefully selected by our editorial team to ensure maximum impact and transformation.
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-gradient-violet/20 rounded-xl mb-4 inline-block">
                  <Brain className="w-8 h-8 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Philosophical Depth</h3>
                <p className="text-text-primary/70 text-sm">
                  Stories are chosen for their ability to provoke thought and inspire meaningful life changes.
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-gradient-amber/20 rounded-xl mb-4 inline-block">
                  <Heart className="w-8 h-8 text-amber" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Life Stage Relevance</h3>
                <p className="text-text-primary/70 text-sm">
                  Collections are tailored to specific life phases and emotional needs for maximum relevance.
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
