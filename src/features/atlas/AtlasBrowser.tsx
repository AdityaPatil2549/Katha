import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { 
  Search, 
  Filter, 
  Book, 
  Film, 
  Tv, 
  PlayCircle, 
  FileText, 
  Clock, 
  Star, 
  Heart, 
  Brain, 
  Compass, 
  Sparkles, 
  Check, 
  X, 
  ChevronDown, 
  RotateCcw,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { atlasRepository } from '@/db/repositories/AtlasRepository';
import type { AtlasEntry, AtlasCollection, AtlasDiscoveryFilters, AtlasDataset } from '@/types/atlas';

const THEMES_LIST = [
  'hope', 
  'love', 
  'war', 
  'philosophy', 
  'growth', 
  'identity', 
  'redemption', 
  'freedom', 
  'perseverance', 
  'courage'
];

export function AtlasBrowser() {
  const [rawEntries, setRawEntries] = useState<AtlasEntry[]>([]);
  const [collections, setCollections] = useState<AtlasCollection[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AtlasEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<AtlasEntry | null>(null);
  const [filters, setFilters] = useState<AtlasDiscoveryFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'collections'>('all');
  const [showFilterDeck, setShowFilterDeck] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      let [entriesData, collectionsData] = await Promise.all([
        atlasRepository.getAllEntries(),
        atlasRepository.getAllCollections()
      ]);

      // If database is unseeded, auto-seed from bundled dataset.json so user never gets an empty void
      if (entriesData.length === 0) {
        try {
          const datasetModule = await import('@/atlas/dataset.json');
          const dataset = (datasetModule.default || datasetModule) as unknown as AtlasDataset;
          if (dataset && dataset.entries && dataset.entries.length > 0) {
            await atlasRepository.installDataset(dataset);
            [entriesData, collectionsData] = await Promise.all([
              atlasRepository.getAllEntries(),
              atlasRepository.getAllCollections()
            ]);
          }
        } catch (seedErr) {
          console.warn('Atlas auto-seed skipped:', seedErr);
        }
      }

      setRawEntries(entriesData);
      setCollections(collectionsData);
      setFilteredEntries(entriesData);
    } catch (error) {
      console.error('Failed to load Atlas data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time reactive filtering across Category, Difficulty, Themes, and Search Query
  useEffect(() => {
    if (rawEntries.length === 0) {
      setFilteredEntries([]);
      return;
    }

    let result = [...rawEntries];

    // Category filter
    if (filters.category && filters.category.length > 0) {
      result = result.filter(e => filters.category!.includes(e.category));
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      result = result.filter(e => filters.difficulty!.includes(e.difficulty));
    }

    // Themes filter
    if (filters.themes && filters.themes.length > 0) {
      result = result.filter(e => 
        filters.themes!.some(theme => 
          e.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))
        )
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.whyWatch && e.whyWatch.toLowerCase().includes(q)) ||
        e.genres.some(g => g.toLowerCase().includes(q)) ||
        e.themes.some(t => t.toLowerCase().includes(q)) ||
        e.impactTags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    setFilteredEntries(result);
  }, [filters, searchQuery, rawEntries]);

  const activeFilterCount = useMemo(() => {
    return (
      (filters.category?.length || 0) + 
      (filters.difficulty?.length || 0) + 
      (filters.themes?.length || 0) + 
      (searchQuery.trim() ? 1 : 0)
    );
  }, [filters, searchQuery]);

  const resetAllFilters = () => {
    setFilters({});
    setSearchQuery('');
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

  const toggleCategory = (category: AtlasEntry['category']) => {
    const current = filters.category || [];
    const isSelected = current.includes(category);
    setFilters({
      ...filters,
      category: isSelected ? current.filter(c => c !== category) : [...current, category]
    });
  };

  const toggleDifficulty = (difficulty: AtlasEntry['difficulty']) => {
    const current = filters.difficulty || [];
    const isSelected = current.includes(difficulty);
    setFilters({
      ...filters,
      difficulty: isSelected ? current.filter(d => d !== difficulty) : [...current, difficulty]
    });
  };

  const toggleTheme = (theme: string) => {
    const current = filters.themes || [];
    const isSelected = current.includes(theme);
    setFilters({
      ...filters,
      themes: isSelected ? current.filter(t => t !== theme) : [...current, theme]
    });
  };

  const EntryCard = ({ entry }: { entry: AtlasEntry }) => (
    <motion.div
      layout
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="surface-elevated rounded-2xl p-6 cursor-pointer border border-midnight-border/60 hover:border-accent-gold/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all group flex flex-col justify-between"
      onClick={() => setSelectedEntry(entry)}
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-midnight-surface text-accent-gold">
              {getCategoryIcon(entry.category)}
            </span>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{entry.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-midnight-surface border border-white/5 ${getDifficultyColor(entry.difficulty)}`}>
              {entry.difficulty}
            </span>
            {entry.year && <span className="text-xs text-text-muted font-medium">{entry.year}</span>}
          </div>
        </div>

        <h3 className="font-serif text-xl font-bold text-text-primary mb-2 group-hover:text-accent-gold transition-colors line-clamp-1">
          {entry.title}
        </h3>
        <p className="text-sm text-text-secondary mb-4 line-clamp-2 leading-relaxed">
          {entry.description}
        </p>

        {entry.whyWatch && (
          <div className="p-3 rounded-xl bg-midnight-surface/50 border border-white/5 mb-4">
            <span className="text-xs font-bold text-accent-gold block mb-1 uppercase tracking-wider">Philosophical Resonance</span>
            <p className="text-xs text-text-primary/80 line-clamp-2 italic">
              "{entry.whyWatch}"
            </p>
          </div>
        )}
      </div>

      <div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {entry.themes.slice(0, 3).map((theme, index) => (
            <span key={index} className="text-xs bg-accent-gold/15 text-accent-gold px-2.5 py-1 rounded-full font-medium">
              #{theme}
            </span>
          ))}
          {entry.genres.slice(0, 2).map((genre, index) => (
            <span key={index} className="text-xs bg-midnight-surface text-text-muted px-2 py-0.5 rounded-full">
              {genre}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-white/5">
          <div className="flex items-center gap-3">
            {entry.runtime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {entry.runtime}m
              </span>
            )}
          </div>
          <span className="text-accent-gold font-semibold group-hover:underline flex items-center gap-1">
            Explore Wisdom &rarr;
          </span>
        </div>
      </div>
    </motion.div>
  );

  const CollectionCard = ({ collection }: { collection: AtlasCollection }) => (
    <motion.div
      layout
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="surface-elevated rounded-2xl p-6 cursor-pointer border border-midnight-border/60 hover:border-accent-gold/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-midnight-surface border border-white/5 ${getDifficultyColor(collection.difficulty)}`}>
            {collection.difficulty}
          </span>
        </div>

        <h3 className="font-serif text-2xl font-bold text-text-primary mb-1 group-hover:text-accent-gold transition-colors">
          {collection.title}
        </h3>
        <p className="text-xs font-bold text-accent-gold uppercase tracking-wider mb-3">{collection.subtitle}</p>
        <p className="text-sm text-text-secondary mb-4 line-clamp-3 leading-relaxed">{collection.description}</p>

        {collection.philosophy && (
          <div className="p-3.5 rounded-xl bg-midnight-surface/60 border border-white/5 mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Guiding Premise</span>
            <p className="text-xs text-text-primary/90 italic">"{collection.philosophy}"</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
        <span className="font-semibold text-text-primary">{collection.entryIds.length} Curated Stories</span>
        <div className="flex gap-1.5">
          {collection.lifeStage.slice(0, 2).map((stage, index) => (
            <span key={index} className="bg-midnight-surface text-text-secondary px-2.5 py-0.5 rounded-full capitalize">
              {stage}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Compass className="w-12 h-12 text-accent-gold animate-spin mb-4 mx-auto" />
          <p className="text-text-secondary text-sm">Opening the Smriti Atlas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── World-Class Top Control Strip ── */}
      <div className="surface-elevated rounded-2xl p-4 md:p-5 border border-midnight-border shadow-soft space-y-4">
        {/* Row 1: View Tabs, Quick Search, Layout Switcher & Filter Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Main Mode Tabs */}
          <div className="flex items-center gap-1.5 bg-midnight-surface/80 p-1 rounded-xl border border-white/5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`min-h-[44px] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-accent-gold to-accent-amber text-midnight-bg shadow-glow-gold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>All Stories</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${activeTab === 'all' ? 'bg-midnight-bg/25 text-midnight-bg' : 'bg-white/10 text-text-muted'}`}>
                {filteredEntries.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('collections')}
              className={`min-h-[44px] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'collections'
                  ? 'bg-gradient-to-r from-accent-gold to-accent-amber text-midnight-bg shadow-glow-gold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Collections</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${activeTab === 'collections' ? 'bg-midnight-bg/25 text-midnight-bg' : 'bg-white/10 text-text-muted'}`}>
                {collections.length}
              </span>
            </button>
          </div>

          {/* Quick Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search philosophical masterpieces, themes, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-midnight-bg/60 border border-midnight-border rounded-xl min-h-[44px] py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-gold/60 focus:ring-1 focus:ring-accent-gold/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary rounded-full"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Action Tools: Grid/List + Filter Drawer Toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {/* View Switchers */}
            <div className="flex items-center bg-midnight-surface/80 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setView('grid')}
                title="Grid View"
                aria-label="Grid View"
                className={`w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg transition-colors ${
                  view === 'grid'
                    ? 'bg-accent-gold text-midnight-bg shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                title="List View"
                aria-label="List View"
                className={`w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg transition-colors ${
                  view === 'list'
                    ? 'bg-accent-gold text-midnight-bg shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilterDeck(!showFilterDeck)}
              aria-label="Toggle Filter Deck"
              className={`min-h-[44px] px-4 py-2 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                showFilterDeck || activeFilterCount > 0
                  ? 'border-accent-gold bg-accent-gold/15 text-accent-gold shadow-glow-gold'
                  : 'border-midnight-border bg-midnight-surface/80 text-text-secondary hover:text-text-primary hover:bg-midnight-surface'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-accent-gold text-midnight-bg flex items-center justify-center text-[10px] font-black">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showFilterDeck ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Expandable Reactive Filter Deck (Replaces the clunky vertical sidebar) ── */}
        <AnimatePresence>
          {showFilterDeck && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-white/5 pt-4 space-y-4"
            >
              {/* Category Filter Chips */}
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Media Formats</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, category: [] })}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                      !filters.category || filters.category.length === 0
                        ? 'border-accent-gold bg-accent-gold text-midnight-bg shadow-glow-gold'
                        : 'border-midnight-border/60 bg-midnight-surface/40 text-text-secondary hover:text-text-primary hover:border-midnight-border'
                    }`}
                  >
                    <span>All Media</span>
                  </button>
                  {(['movie', 'series', 'anime', 'documentary'] as const).map((cat) => {
                    const isSelected = filters.category?.includes(cat) || false;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'border-accent-gold bg-accent-gold/20 text-accent-gold shadow-glow-gold'
                            : 'border-midnight-border/60 bg-midnight-surface/40 text-text-secondary hover:text-text-primary hover:border-midnight-border'
                        }`}
                      >
                        {getCategoryIcon(cat)}
                        <span className="capitalize">{cat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-accent-gold" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Levels & Philosophical Themes */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Difficulty Chips */}
                <div className="lg:col-span-5">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Depth / Difficulty</span>
                  <div className="flex flex-wrap gap-2">
                    {(['easy', 'medium', 'heavy'] as const).map((diff) => {
                      const isSelected = filters.difficulty?.includes(diff) || false;
                      const dotColor = diff === 'easy' ? 'bg-accent-emerald' : diff === 'medium' ? 'bg-accent-amber' : 'bg-accent-rose';
                      return (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => toggleDifficulty(diff)}
                          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'border-accent-gold bg-accent-gold/20 text-accent-gold shadow-glow-gold'
                              : 'border-midnight-border/60 bg-midnight-surface/40 text-text-secondary hover:text-text-primary hover:border-midnight-border'
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                          <span className="capitalize">{diff}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-accent-gold" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Themes Horizontal Flex Cloud */}
                <div className="lg:col-span-7">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Philosophical Themes</span>
                  <div className="flex flex-wrap gap-2">
                    {THEMES_LIST.map((theme) => {
                      const isSelected = filters.themes?.includes(theme) || false;
                      return (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => toggleTheme(theme)}
                          className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-accent-gold bg-accent-gold/25 text-accent-gold font-bold shadow-glow-gold'
                              : 'border-midnight-border/50 bg-midnight-surface/30 text-text-muted hover:text-text-primary hover:border-midnight-border'
                          }`}
                        >
                          <span>#{theme}</span>
                          {isSelected && <Check className="w-3 h-3 stroke-[3] text-accent-gold" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active Filter Summary Bar */}
              {activeFilterCount > 0 && (
                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 bg-midnight-surface/40 p-3 rounded-xl">
                  <div className="text-xs text-text-secondary flex items-center gap-2">
                    <span className="font-bold text-accent-gold">{filteredEntries.length} Stories</span>
                    <span>matching active criteria</span>
                  </div>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="min-h-[44px] px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-accent-gold text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 border border-accent-gold/30 hover:border-accent-gold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Content Grid / List Display ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'all' && (
          <motion.div
            key="stories-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredEntries.length === 0 ? (
              <div className="surface-elevated rounded-2xl p-12 text-center border border-midnight-border max-w-xl mx-auto my-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-accent-gold/15 text-accent-gold flex items-center justify-center mx-auto border border-accent-gold/30">
                  <Compass className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-text-primary">
                  No Narratives Found
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  No philosophical milestones match this specific constellation of filters and search keywords.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-gold to-accent-amber text-midnight-bg text-xs font-bold uppercase tracking-wider shadow-glow-gold hover:opacity-95 transition-all inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'collections' && (
          <motion.div
            key="collections-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {collections.map((col) => (
                <CollectionCard key={col.id} collection={col} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Entry Detail Modal ── */}
      {selectedEntry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-[100]"
          onClick={() => setSelectedEntry(null)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            className="surface-elevated rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-accent-gold/30 shadow-[0_25px_80px_rgba(0,0,0,0.8)] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="p-2 rounded-lg bg-midnight-surface text-accent-gold">
                    {getCategoryIcon(selectedEntry.category)}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">{selectedEntry.category}</span>
                  {selectedEntry.year && <span className="text-xs text-text-muted">• {selectedEntry.year}</span>}
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-midnight-surface ${getDifficultyColor(selectedEntry.difficulty)}`}>
                    {selectedEntry.difficulty}
                  </span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-text-primary">{selectedEntry.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                aria-label="Close modal"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-midnight-surface hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {selectedEntry.whyWatch && (
                <div className="p-4 rounded-2xl bg-accent-gold/10 border border-accent-gold/30">
                  <h3 className="text-xs font-bold text-accent-gold uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Why Experience This Narrative
                  </h3>
                  <p className="text-sm text-text-primary/95 leading-relaxed italic">
                    "{selectedEntry.whyWatch}"
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Premise & Context</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{selectedEntry.description}</p>
              </div>

              {selectedEntry.lifeLessons && selectedEntry.lifeLessons.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Core Philosophical Insights</h3>
                  <ul className="space-y-2">
                    {selectedEntry.lifeLessons.map((lesson, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-text-primary/90 bg-midnight-surface/50 p-3 rounded-xl border border-white/5">
                        <Star className="w-4 h-4 text-accent-amber mt-0.5 shrink-0" />
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEntry.reflectionPrompts && selectedEntry.reflectionPrompts.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Contemplation Prompts</h3>
                  <ul className="space-y-2">
                    {selectedEntry.reflectionPrompts.map((prompt, index) => (
                      <li key={index} className="p-3 rounded-xl bg-midnight-surface/40 border-l-2 border-accent-gold text-xs text-text-secondary italic">
                        "{prompt}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEntry.themes && selectedEntry.themes.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Associated Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.themes.map((theme, index) => (
                      <span key={index} className="px-3 py-1 rounded-full bg-accent-gold/15 text-accent-gold text-xs font-medium border border-accent-gold/25">
                        #{theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
