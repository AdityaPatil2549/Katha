import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Brain, BookOpen, Heart, Target, TrendingUp, Calendar, Clock, Star, Quote, Lightbulb, Users, Download, Search, Plus, Filter } from 'lucide-react';
import { wisdomRepository } from '@/db/repositories/WisdomRepository';
import { personalRepository } from '@/db/repositories/PersonalRepository';
import type { PersonalWisdom, PersonalInsight, PersonalPrinciple, PersonalQuote } from '@/types/knowledge';

import { DataEntryModal, EntryType } from '@/components/modals/DataEntryModal';

export function WisdomDashboard() {
  const [wisdom, setWisdom] = useState<PersonalWisdom | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'principles' | 'quotes' | 'stories' | 'lessons'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<EntryType>('insight');

  useEffect(() => {
    loadWisdomData();
  }, []);

  const loadWisdomData = async () => {
    try {
      const [wisdomData, statsData] = await Promise.all([
        wisdomRepository.getWisdom(),
        wisdomRepository.getWisdomStats()
      ]);
      
      setWisdom(wisdomData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load wisdom data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await wisdomRepository.searchWisdom(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const exportWisdom = async (format: 'json' | 'markdown') => {
    try {
      const blob = await wisdomRepository.exportWisdom(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal-wisdom.${format === 'json' ? 'json' : 'md'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleSaveEntry = async (data: any) => {
    try {
      // Mock saving to DB
      console.log('Saved entry:', modalType, data);
      alert(`${modalType} saved successfully!`);
      // Reload wisdom data
      loadWisdomData();
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-midnight flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-accent-primary animate-spin mb-4" />
          <p className="text-secondary">Loading Wisdom Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-page relative z-10 pointer-events-auto">
      <div className="max-w-7xl mx-auto">
        <StaggerContainer>
        {/* Header */}
        <BlurReveal>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-page gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-violet rounded-xl shadow-elevation">
              <Brain className="w-8 h-8 text-text-primary" />
            </div>
            <div>
              <h1 className="heading-1 text-primary">Wisdom Dashboard</h1>
              <p className="text-secondary">Your personal knowledge and legacy</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search wisdom..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 glass-card rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-primary w-full md:w-64"
              />
            </div>
            <button
              onClick={() => exportWisdom('markdown')}
              className="btn btn-secondary flex items-center gap-2 flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
        </BlurReveal>

        <FadeIn>
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="surface-interactive rounded-xl p-4 mb-6 hover:shadow-glow-cyan"
            >
              <h3 className="text-text-primary font-medium mb-3">Search Results</h3>
              <div className="space-y-2">
                {searchResults.slice(0, 5).map((result, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 surface-hover rounded-lg">
                    <div className="w-2 h-2 bg-accent-primary rounded-full" />
                    <div className="flex-1">
                      <p className="text-text-primary text-sm">
                        {result.type === 'insight' && result.title}
                        {result.type === 'principle' && result.name}
                        {result.type === 'quote' && result.content.substring(0, 50) + '...'}
                        {result.type === 'story' && result.title}
                        {result.type === 'lifeLesson' && result.title}
                      </p>
                      <p className="text-text-primary/60 text-xs capitalize">{result.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          >
            <div className="surface-interactive rounded-xl p-4 hover:shadow-glow-amber">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber" />
                <span className="text-text-primary/60 text-sm">Insights</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalInsights}</p>
            </div>
            
            <div className="surface-interactive rounded-xl p-4 hover:shadow-glow-emerald">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-emerald" />
                <span className="text-text-primary/60 text-sm">Principles</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalPrinciples}</p>
            </div>
            
            <div className="surface-interactive rounded-xl p-4 hover:shadow-glow-cyan">
              <div className="flex items-center gap-2 mb-2">
                <Quote className="w-4 h-4 text-cyan" />
                <span className="text-text-primary/60 text-sm">Quotes</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalQuotes}</p>
            </div>
            
            <div className="surface-interactive rounded-xl p-4 hover:shadow-[0_0_40px_rgba(138,43,226,0.4)]">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-purple" />
                <span className="text-text-primary/60 text-sm">Stories</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalStories}</p>
            </div>
            
            <div className="surface-interactive rounded-xl p-4 hover:shadow-glow-rose">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-rose" />
                <span className="text-text-primary/60 text-sm">Lessons</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalLifeLessons}</p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-midnight-border">
          {[
            { id: 'overview', label: 'Overview', icon: Brain },
            { id: 'insights', label: 'Insights', icon: Lightbulb },
            { id: 'principles', label: 'Principles', icon: Target },
            { id: 'quotes', label: 'Quotes', icon: Quote },
            { id: 'stories', label: 'Stories', icon: BookOpen },
            { id: 'lessons', label: 'Life Lessons', icon: Heart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-accent-primary text-accent-primary'
                  : 'border-transparent text-text-primary/60 hover:text-text-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && wisdom && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Personal Philosophy */}
              {wisdom.personalPhilosophy && (
                <div className="surface-interactive rounded-xl p-6 hover:shadow-[0_0_40px_rgba(138,43,226,0.2)]">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple" />
                    Personal Philosophy
                  </h3>
                  <h4 className="text-xl font-medium text-text-primary mb-2">{wisdom.personalPhilosophy.title}</h4>
                  <p className="text-text-primary/70 mb-4">{wisdom.personalPhilosophy.description}</p>
                  
                  {wisdom.personalPhilosophy.coreBeliefs.length > 0 && (
                    <div>
                      <h5 className="text-text-primary font-medium mb-2">Core Beliefs</h5>
                      <div className="space-y-2">
                        {wisdom.personalPhilosophy.coreBeliefs.map((belief, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-accent-primary rounded-full" />
                            <span className="text-text-primary/80">{belief.statement}</span>
                            <span className="text-text-primary/60 text-sm">({belief.confidence}/10)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Activity */}
              {stats && stats.recentActivity.length > 0 && (
                <div className="surface-interactive rounded-xl p-6 hover:shadow-[0_0_40px_rgba(0,242,254,0.2)]">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {stats.recentActivity.slice(0, 5).map((activity: any, index: any) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent-primary rounded-full" />
                        <div className="flex-1">
                          <p className="text-text-primary text-sm">{activity.title}</p>
                          <p className="text-text-primary/60 text-xs">
                            {activity.type} • {activity.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && wisdom && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber" />
                    Personal Insights
                  </h3>
                  <button onClick={() => { setModalType('insight'); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Insight
                  </button>
                </div>
                
                {wisdom.insights.length > 0 ? (
                  <div className="space-y-4">
                    {wisdom.insights.map((insight) => (
                      <div key={insight.id} className="border-l-4 border-amber/50 pl-4">
                        <h4 className="text-text-primary font-medium mb-2">{insight.title}</h4>
                        <p className="text-text-primary/70 mb-3">{insight.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-amber capitalize">{insight.category}</span>
                          <span className="text-text-primary/60">Depth: {insight.depth}/10</span>
                          <span className="text-text-primary/60">Relevance: {insight.currentRelevance}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 text-text-primary/20 mx-auto mb-4" />
                    <p className="text-text-primary/60">No insights yet. Start adding your personal insights!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Principles Tab */}
          {activeTab === 'principles' && wisdom && (
            <motion.div
              key="principles"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald" />
                    Personal Principles
                  </h3>
                  <button onClick={() => { setModalType('principle'); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Principle
                  </button>
                </div>
                
                {wisdom.principles.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {wisdom.principles.map((principle) => (
                      <div key={principle.id} className="surface-hover rounded-lg p-4">
                        <h4 className="text-text-primary font-medium mb-2">{principle.name}</h4>
                        <p className="text-text-primary/70 text-sm mb-3">{principle.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-emerald capitalize">{principle.category}</span>
                          <span className="text-text-primary/60">Importance: {principle.importance}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-text-primary/20 mx-auto mb-4" />
                    <p className="text-text-primary/60">No principles yet. Define your guiding principles!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Quotes Tab */}
          {activeTab === 'quotes' && wisdom && (
            <motion.div
              key="quotes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Quote className="w-5 h-5 text-cyan" />
                    Meaningful Quotes
                  </h3>
                  <button onClick={() => { setModalType('quote'); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Quote
                  </button>
                </div>
                
                {wisdom.quotes.length > 0 ? (
                  <div className="space-y-4">
                    {wisdom.quotes.map((quote) => (
                      <div key={quote.id} className="border-l-4 border-cyan/50 pl-4">
                        <blockquote className="text-text-primary text-lg mb-2">"{quote.content}"</blockquote>
                        <p className="text-text-primary/60 mb-2">— {quote.attribution}</p>
                        {quote.personalMeaning && (
                          <p className="text-text-primary/70 text-sm italic">{quote.personalMeaning}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm mt-2">
                          <span className="text-cyan">{quote.category}</span>
                          <span className="text-text-primary/60">Resonance: {quote.resonance}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Quote className="w-12 h-12 text-text-primary/20 mx-auto mb-4" />
                    <p className="text-text-primary/60">No quotes yet. Start collecting meaningful quotes!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Stories Tab */}
          {activeTab === 'stories' && wisdom && (
            <motion.div
              key="stories"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple" />
                    Personal Stories
                  </h3>
                  <button onClick={() => { setModalType('story'); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Story
                  </button>
                </div>
                
                {wisdom.stories && wisdom.stories.id ? (
                  <div className="space-y-4">
                    <div className="surface-hover rounded-lg p-4">
                      <h4 className="text-text-primary font-medium mb-2">{wisdom.stories.title}</h4>
                      <p className="text-text-primary/70 text-sm mb-3 line-clamp-3">{wisdom.stories.narrative}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-purple capitalize">{wisdom.stories.genre}</span>
                        <span className="text-text-primary/60">Sharing: {wisdom.stories.sharingLevel}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-text-primary/20 mx-auto mb-4" />
                    <p className="text-text-primary/60">No stories yet. Start documenting your journey!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Life Lessons Tab */}
          {activeTab === 'lessons' && wisdom && (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose" />
                    Life Lessons
                  </h3>
                  <button onClick={() => { setModalType('lesson'); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Lesson
                  </button>
                </div>
                
                {wisdom.lifeLessons.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {wisdom.lifeLessons.map((lesson) => (
                      <div key={lesson.id} className="surface-hover rounded-lg p-4">
                        <h4 className="text-text-primary font-medium mb-2">{lesson.title}</h4>
                        <p className="text-text-primary/70 text-sm mb-3">{lesson.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-rose">{lesson.category}</span>
                          <span className="text-text-primary/60">Value: {lesson.value}/10</span>
                          <span className="text-text-primary/60">Difficulty: {lesson.difficulty}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-text-primary/20 mx-auto mb-4" />
                    <p className="text-text-primary/60">No life lessons yet. Document what you've learned!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </FadeIn>
        </StaggerContainer>
      </div>

      <DataEntryModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSubmit={handleSaveEntry}
        type={modalType} 
      />
    </div>
  );
}
