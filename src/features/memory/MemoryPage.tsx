import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, Calendar, Tag, Heart, Clock, Sparkles } from 'lucide-react';
import { useMomentsStore, useStoriesStore } from '@/store';
import { useEffect } from 'react';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { Dropdown } from '@/components/ui/Dropdown';

export function MemoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterMood, setFilterMood] = useState('all');

  const { moments, loadMoments } = useMomentsStore();
  const { stories, loadStories } = useStoriesStore();

  useEffect(() => {
    loadMoments();
    loadStories();
  }, [loadMoments, loadStories]);

  const filteredMoments = moments.filter(moment => {
    const matchesSearch = (moment.quote || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         moment.storyId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = filterMood === 'all' || moment.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  const uniqueMoods = Array.from(new Set(moments.map(m => m.mood).filter(Boolean))) as string[];

  const staggerItemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 80, damping: 20 }
    }
  } as const;

  return (
    <div className="min-h-screen bg-gradient-midnight">
      <div className="max-w-7xl mx-auto p-6 md:p-10 pt-24 pb-32">
        <FadeIn delay={0.1} duration={0.8} distance={30} className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-midnight-surface/30 border border-midnight-border/50 text-accent-rose text-sm font-sans tracking-widest uppercase mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span>Reminiscence</span>
          </div>
          <h1 className="text-[4rem] font-serif text-text-primary mb-4 leading-none tracking-tight">Memory World</h1>
          <p className="text-xl text-text-secondary font-light max-w-2xl leading-relaxed">
            Your collection of meaningful moments. A digital pensieve of thoughts, quotes, and emotions.
          </p>
        </FadeIn>

        {/* Search and Filters */}
        <FadeIn delay={0.2} duration={0.8} className="mb-12">
          <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center p-6 bg-midnight-surface/10 border border-midnight-border/30 rounded-[2rem] backdrop-blur-md shadow-sm">
            <div className="flex-1 w-full max-w-2xl relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-rose transition-colors duration-500" />
              <input
                type="text"
                placeholder="Search your memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.5rem] text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-rose/40 focus:ring-1 focus:ring-accent-rose/20 transition-all duration-500 font-sans text-lg backdrop-blur-md shadow-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <Dropdown
                value={filterMood}
                onChange={setFilterMood}
                options={[
                  { value: 'all', label: 'All Moods' },
                  ...uniqueMoods.map(mood => ({ value: mood, label: mood }))
                ]}
                className="capitalize"
              />

              <div className="flex gap-2 bg-midnight-surface/20 p-1.5 rounded-[1.25rem] border border-midnight-border/30 backdrop-blur-md shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-midnight-surface shadow-soft text-text-primary' : 'text-text-muted hover:text-text-primary hover:bg-midnight-surface/50'}`}
                  aria-label="Grid view"
                  title="Switch to grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-midnight-surface shadow-soft text-text-primary' : 'text-text-muted hover:text-text-primary hover:bg-midnight-surface/50'}`}
                  aria-label="List view"
                  title="Switch to list view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.3} duration={0.8} className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-midnight-surface/10 border border-midnight-border/30 rounded-[2rem] backdrop-blur-md shadow-sm flex flex-col items-center justify-center group hover:bg-midnight-surface/20 transition-colors">
              <div className="text-[3rem] font-serif font-light text-text-primary mb-2 group-hover:scale-105 transition-transform duration-500">{moments.length}</div>
              <div className="text-sm font-sans tracking-widest uppercase text-text-secondary">Total Moments</div>
            </div>
            <div className="p-8 bg-midnight-surface/10 border border-midnight-border/30 rounded-[2rem] backdrop-blur-md shadow-sm flex flex-col items-center justify-center group hover:bg-midnight-surface/20 transition-colors">
              <div className="text-[3rem] font-serif font-light text-text-primary mb-2 group-hover:scale-105 transition-transform duration-500">
                {new Set(moments.map(m => m.storyId)).size}
              </div>
              <div className="text-sm font-sans tracking-widest uppercase text-text-secondary">Stories Captured</div>
            </div>
            <div className="p-8 bg-midnight-surface/10 border border-midnight-border/30 rounded-[2rem] backdrop-blur-md shadow-sm flex flex-col items-center justify-center group hover:bg-midnight-surface/20 transition-colors">
              <div className="text-[3rem] font-serif font-light text-text-primary mb-2 group-hover:scale-105 transition-transform duration-500">{uniqueMoods.length}</div>
              <div className="text-sm font-sans tracking-widest uppercase text-text-secondary">Emotional States</div>
            </div>
          </div>
        </FadeIn>

        {/* Moments Grid/List */}
        <StaggerContainer 
          staggerDelay={0.08}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6 max-w-4xl mx-auto'}
        >
          {filteredMoments.map((moment) => {
            const storyTitle = stories.find(s => s.id === moment.storyId)?.title || 'Unknown Story';
            return (
            <motion.div
              key={moment.id}
              variants={staggerItemVariants}
              whileHover={{ y: -4 }}
              className="bg-midnight-surface/20 border border-midnight-border/40 rounded-[2rem] p-8 shadow-sm hover:shadow-soft hover:bg-midnight-surface/40 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-rose/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 pr-4">
                    <h3 className="font-serif text-2xl text-text-primary mb-2 line-clamp-1 group-hover:text-accent-rose transition-colors">{storyTitle}</h3>
                    <div className="flex items-center gap-2 text-xs font-sans tracking-widest uppercase text-text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(moment.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {moment.mood && (
                    <span className="px-3 py-1 bg-midnight-bg/80 border border-midnight-border/50 rounded-chip text-xs font-sans tracking-wider uppercase text-text-primary shadow-sm backdrop-blur-sm">
                      {moment.mood}
                    </span>
                  )}
                </div>
                
                {moment.quote && (
                  <blockquote className="border-l-[3px] border-accent-rose/50 pl-5 mb-6">
                    <p className="text-xl font-serif italic text-text-primary/90 leading-relaxed group-hover:text-text-primary transition-colors">"{moment.quote}"</p>
                    {moment.character && <cite className="block mt-3 text-sm font-sans tracking-wide text-text-secondary/70">— {moment.character}</cite>}
                  </blockquote>
                )}
                
                {moment.context && (
                  <div className="mb-4 bg-midnight-bg/30 p-4 rounded-2xl border border-midnight-border/30">
                    <p className="text-sm font-sans text-text-secondary leading-relaxed">
                      <span className="text-text-primary font-medium tracking-wide uppercase text-[10px] block mb-1 opacity-70">Context</span>
                      {moment.context}
                    </p>
                  </div>
                )}
                
                {moment.thoughts && (
                  <div className="mb-4">
                    <p className="text-sm font-sans text-text-secondary leading-relaxed">
                      <span className="text-text-primary font-medium tracking-wide uppercase text-[10px] block mb-1 opacity-70">Thoughts</span>
                      {moment.thoughts}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
            );
          })}
        </StaggerContainer>

        {/* Empty State */}
        {!filteredMoments.length && (
          <FadeIn delay={0.2} duration={0.8} distance={20} className="text-center py-24 max-w-xl mx-auto flex flex-col items-center">
            <div className="w-24 h-24 mx-auto mb-10 rounded-[2rem] border border-midnight-border/30 bg-midnight-surface/20 flex items-center justify-center shadow-soft relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-rose/10 to-accent-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Search className="w-10 h-10 text-text-muted opacity-50 group-hover:text-accent-rose transition-colors duration-500 relative z-10" />
            </div>
            <h3 className="font-serif text-4xl text-text-primary mb-4 italic tracking-wide">No Memories Yet</h3>
            <p className="font-sans text-lg text-text-secondary leading-relaxed font-light">
              {searchTerm || filterMood !== 'all'
                ? 'Your filters returned no moments. Try adjusting them or clear your search.'
                : 'Your memory world is empty. Start capturing moments from your stories to see them here.'}
            </p>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
