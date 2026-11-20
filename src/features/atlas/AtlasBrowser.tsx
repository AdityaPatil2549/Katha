import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Search, Filter, Book, Film, Tv, PlayCircle, FileText, Clock, Star, Heart, Brain, Compass, Sparkles, Check } from 'lucide-react';
import { atlasRepository } from '@/db/repositories/AtlasRepository';
import type { AtlasEntry, AtlasCollection, AtlasDiscoveryFilters, AtlasSearchResult } from '@/types/atlas';

export function AtlasBrowser() {
  const [entries, setEntries] = useState<AtlasEntry[]>([]);
  const [collections, setCollections] = useState<AtlasCollection[]>([]);
  const [searchResults, setSearchResults] = useState<AtlasSearchResult[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<AtlasEntry | null>(null);
  const [filters, setFilters] = useState<AtlasDiscoveryFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'collections' | 'search'>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadData = async () => {
    try {
      const [entriesData, collectionsData] = await Promise.all([
        atlasRepository.getAllEntries(),
        atlasRepository.getAllCollections()
      ]);
      setEntries(entriesData);
      setCollections(collectionsData);
    } catch (error) {
      console.error('Failed to load Atlas data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    try {
      const results = await atlasRepository.searchEntries(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const applyFilters = async () => {
    try {
      const filteredEntries = await atlasRepository.getEntriesByFilters(filters);
      setEntries(filteredEntries);
    } catch (error) {
      console.error('Filter failed:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'movie': return <Film className="w-4 h-4" />;
      case 'series': return <Tv className="w-4 h-4" />;
      case 'anime': return <PlayCircle className="w-4 h-4" />;
      case 'documentary': return <FileText className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-accent-emerald';
      case 'medium': return 'text-accent-amber';
      case 'heavy': return 'text-accent-rose';
      default: return 'text-text-primary/60';
    }
  };

  const EntryCard = ({ entry, searchResult }: { entry: AtlasEntry; searchResult?: AtlasSearchResult }) => (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      className="surface-elevated rounded-xl p-6 cursor-pointer hover:bg-midnight-surface-hover transition-all"
      onClick={() => setSelectedEntry(entry)}
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
          {entry.year && <span className="text-sm text-text-primary/60">{entry.year}</span>}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2">{entry.title}</h3>
      
      {searchResult && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-accent-amber" />
            <span className="text-sm text-accent-amber">Relevance: {searchResult.relevanceScore}%</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {searchResult.matchReasons.map((reason, index) => (
              <span key={index} className="text-xs bg-accent-primary/20 text-accent-primary px-2 py-1 rounded-full">
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-text-primary/70 text-sm mb-4 line-clamp-3">{entry.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {entry.genres.slice(0, 3).map((genre, index) => (
          <span key={index} className="text-xs bg-midnight-surface text-text-primary/60 px-2 py-1 rounded-full">
            {genre}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {entry.themes.slice(0, 2).map((theme, index) => (
          <span key={index} className="text-xs bg-accent-cyan/15 text-accent-cyan px-2 py-1 rounded-full">
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
          {entry.seasons && (
            <div className="flex items-center gap-1">
              <Tv className="w-3 h-3" />
              <span>{entry.seasons} seasons</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          <span>{entry.impactTags.length} impacts</span>
        </div>
      </div>
    </motion.div>
  );

  const CollectionCard = ({ collection }: { collection: AtlasCollection }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="surface-elevated rounded-xl p-6 cursor-pointer hover:bg-midnight-surface-hover transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <Sparkles className="w-6 h-6 text-accent-amber" />
        <span className={`text-sm font-medium ${getDifficultyColor(collection.difficulty)}`}>
          {collection.difficulty}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2">{collection.title}</h3>
      <p className="text-sm text-accent-primary mb-3">{collection.subtitle}</p>
      <p className="text-text-primary/70 text-sm mb-4 line-clamp-2">{collection.description}</p>

      <div className="mb-4">
        <p className="text-xs text-text-primary/60 mb-2">Philosophy:</p>
        <p className="text-sm text-text-primary/80 italic">{collection.philosophy}</p>
      </div>

      <div className="flex items-center justify-between text-xs text-text-primary/60">
        <span>{collection.entryIds.length} stories</span>
        <div className="flex gap-1">
          {collection.lifeStage.slice(0, 2).map((stage, index) => (
            <span key={index} className="bg-midnight-surface px-2 py-1 rounded-full">
              {stage}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const FilterPanel = () => (
    <div className="surface-elevated rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-accent-primary" />
        <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary/80 mb-2">Category</label>
        <div className="space-y-2">
          {(['movie', 'series', 'anime', 'documentary'] as const).map((category) => {
            const isSelected = filters.category?.includes(category) || false;
            return (
              <button
                key={category}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                aria-label={`Filter by ${category}`}
                onClick={() => {
                  const current = filters.category || [];
                  setFilters({
                    ...filters,
                    category: isSelected
                      ? current.filter(c => c !== category)
                      : [...current, category as AtlasEntry['category']]
                  });
                }}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  isSelected
                    ? 'border-accent-gold bg-accent-gold/15 text-accent-gold shadow-glow-gold'
                    : 'border-midnight-border/60 bg-midnight-surface/40 text-text-secondary hover:text-text-primary hover:border-midnight-border hover:bg-midnight-surface/70'
                }`}
              >
                <span className="capitalize text-sm font-medium tracking-normal">{category}</span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  isSelected
                    ? 'bg-accent-gold border-accent-gold text-midnight-bg'
                    : 'border-white/20 bg-white/5'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary/80 mb-2">Difficulty</label>
        <div className="space-y-2">
          {(['easy', 'medium', 'heavy'] as const).map((difficulty) => {
            const isSelected = filters.difficulty?.includes(difficulty) || false;
            return (
              <button
                key={difficulty}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                aria-label={`Filter by ${difficulty} difficulty`}
                onClick={() => {
                  const current = filters.difficulty || [];
                  setFilters({
                    ...filters,
                    difficulty: isSelected
                      ? current.filter(d => d !== difficulty)
                      : [...current, difficulty as AtlasEntry['difficulty']]
                  });
                }}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  isSelected
                    ? 'border-accent-gold bg-accent-gold/15 text-accent-gold shadow-glow-gold'
                    : 'border-midnight-border/60 bg-midnight-surface/40 text-text-secondary hover:text-text-primary hover:border-midnight-border hover:bg-midnight-surface/70'
                }`}
              >
                <span className="capitalize text-sm font-medium tracking-normal">{difficulty}</span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  isSelected
                    ? 'bg-accent-gold border-accent-gold text-midnight-bg'
                    : 'border-white/20 bg-white/5'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary/80 mb-2">Themes</label>
        <div className="space-y-2">
          {['hope', 'love', 'war', 'philosophy', 'growth'].map((theme) => {
            const isSelected = filters.themes?.includes(theme) || false;
            return (
              <button
                key={theme}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                aria-label={`Filter by ${theme} theme`}
                onClick={() => {
                  const current = filters.themes || [];
                  setFilters({
                    ...filters,
                    themes: isSelected
                      ? current.filter(t => t !== theme)
                      : [...current, theme]
                  });
                }}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  isSelected
                    ? 'border-accent-gold bg-accent-gold/15 text-accent-gold shadow-glow-gold'
                    : 'border-midnight-border/60 bg-midnight-surface/40 text-text-secondary hover:text-text-primary hover:border-midnight-border hover:bg-midnight-surface/70'
                }`}
              >
                <span className="capitalize text-sm font-medium tracking-normal">{theme}</span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  isSelected
                    ? 'bg-accent-gold border-accent-gold text-midnight-bg'
                    : 'border-white/20 bg-white/5'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={applyFilters}
        className="btn btn-primary w-full min-h-[44px] py-3 text-sm font-bold"
      >
        Apply Filters
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-midnight flex items-center justify-center">
        <div className="text-center">
          <Compass className="w-12 h-12 text-accent-primary animate-spin mb-4" />
          <p className="text-secondary">Loading Smriti Atlas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-midnight p-page">
      <div className="max-w-7xl mx-auto">
        <BlurReveal>
        <div className="mb-page text-center">
          <h1 className="heading-1 text-gradient-amber mb-tight">Smriti Atlas</h1>
          <p className="text-h3 text-quote">Discover stories that transform your life</p>
        </div>
        </BlurReveal>

        <StaggerContainer>
        <div className="flex flex-col lg:flex-row gap-page">
          <FadeIn className="flex-1">
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'all'
                      ? 'bg-accent-primary text-white'
                      : 'surface-elevated text-text-primary/60 hover:text-text-primary'
                  }`}
                >
                  All Stories ({entries.length})
                </button>
                <button
                  onClick={() => setActiveTab('collections')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'collections'
                      ? 'bg-accent-primary text-white'
                      : 'surface-elevated text-text-primary/60 hover:text-text-primary'
                  }`}
                >
                  Collections ({collections.length})
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'search'
                      ? 'bg-accent-primary text-white'
                      : 'surface-elevated text-text-primary/60 hover:text-text-primary'
                  }`}
                >
                  Search
                </button>
              </div>

              {activeTab === 'search' && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-primary/40" />
                  <input
                    type="text"
                    placeholder="Search stories, themes, or impact tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 surface-elevated rounded-xl text-text-primary placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>
              )}
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('grid')}
                  title="Grid view"
                  aria-label="Switch to grid view"
                  className={`w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg transition-colors ${
                    view === 'grid'
                      ? 'bg-accent-primary text-white'
                      : 'surface-elevated text-text-primary/60 hover:text-text-primary'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  title="List view"
                  aria-label="Switch to list view"
                  className={`w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg transition-colors ${
                    view === 'list'
                      ? 'bg-accent-primary text-white'
                      : 'surface-elevated text-text-primary/60 hover:text-text-primary'
                  }`}
                >
                  <Book className="w-4 h-4" />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'all' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`grid gap-6 ${
                    view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                  }`}
                >
                  {entries.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} />
                  ))}
                </motion.div>
              )}

              {activeTab === 'collections' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                >
                  {collections.map((collection) => (
                    <CollectionCard key={collection.id} collection={collection} />
                  ))}
                </motion.div>
              )}

              {activeTab === 'search' && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`grid gap-6 ${
                    view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                  }`}
                >
                  {searchResults.map((result) => (
                    <EntryCard key={result.entry.id} entry={result.entry} searchResult={result} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </FadeIn>

          <FadeIn className="w-full lg:w-80">
            <FilterPanel />
          </FadeIn>
        </div>
        </StaggerContainer>
      </div>

      {selectedEntry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedEntry(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="surface-elevated rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">{selectedEntry.title}</h2>
                <div className="flex items-center gap-4 text-text-primary/60">
                  <span className="capitalize">{selectedEntry.category}</span>
                  <span>{selectedEntry.year}</span>
                  <span className={`font-medium ${getDifficultyColor(selectedEntry.difficulty)}`}>
                    {selectedEntry.difficulty}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-text-primary/60 hover:text-text-primary"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Why Watch This</h3>
                <p className="text-text-primary/80">{selectedEntry.whyWatch}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Description</h3>
                <p className="text-text-primary/80">{selectedEntry.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Life Lessons</h3>
                <ul className="space-y-2">
                  {selectedEntry.lifeLessons.map((lesson, index) => (
                    <li key={index} className="flex items-start gap-2 text-text-primary/80">
                      <Star className="w-4 h-4 text-accent-amber mt-0.5 flex-shrink-0" />
                      <span>{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Best Watched When</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.bestWatchedWhen.map((when, index) => (
                    <span key={index} className="bg-accent-primary/20 text-accent-primary px-3 py-1 rounded-full text-sm">
                      {when}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Reflection Prompts</h3>
                <ul className="space-y-2">
                  {selectedEntry.reflectionPrompts.map((prompt, index) => (
                    <li key={index} className="text-text-primary/80 italic">
                      {prompt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
