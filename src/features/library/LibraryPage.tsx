import { useState, useEffect, useCallback } from 'react';
import { 
  LayoutGrid as Grid, 
  List, 
  Heart, 
  Search,
  Star,
  Clock,
  BookOpen,
  Play,
  Check,
  Pause,
  Filter,
  Cloud
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStoriesStore } from '@/store';
import { useSyncStore } from '@/store/syncStore';
import { useNavigate } from 'react-router-dom';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer, staggerItemVariants } from '@/components/ui/motion/StaggerContainer';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { Dropdown } from '@/components/ui/Dropdown';

export default function LibraryPage() {
  const navigate = useNavigate();
  const { 
    stories, 
    loading, 
    error, 
    loadStories, 
    searchStories, 
    filterByCategory, 
    filterByStatus, 
    getFavorites,
    getWatching,
    getCompleted
  } = useStoriesStore();

  const { pendingIds } = useSyncStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title' | 'rating' | 'impactIndex'>('updatedAt');

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchStories(searchQuery);
      } else {
        applyFilters();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedStatus]);

  const applyFilters = useCallback(() => {
    if (selectedCategory === 'all' && selectedStatus === 'all') {
      loadStories();
    } else if (selectedCategory !== 'all') {
      filterByCategory(selectedCategory);
    } else if (selectedStatus !== 'all') {
      filterByStatus(selectedStatus);
    }
  }, [selectedCategory, selectedStatus, loadStories, filterByCategory, filterByStatus]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedStatus('all');
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setSelectedCategory('all');
  }, []);

  const getFilteredAndSortedStories = useCallback(() => {
    let filtered = stories;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(story => story.category === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(story => story.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(query) ||
        story.genre.some(g => g.toLowerCase().includes(query)) ||
        story.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'rating': return b.rating - a.rating;
        case 'impactIndex': return b.impactIndex - a.impactIndex;
        case 'updatedAt':
        default: return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [stories, selectedCategory, selectedStatus, searchQuery, sortBy]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'watching': return <Play className="w-3 h-3" />;
      case 'completed': return <Check className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching': return 'text-accent-cyan';
      case 'completed': return 'text-accent-emerald';
      case 'paused': return 'text-accent-amber';
      default: return 'text-text-muted';
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const filteredStories = useCallback(() => getFilteredAndSortedStories(), [getFilteredAndSortedStories]);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-midnight-surface rounded-[2rem] p-12 text-center border border-midnight-border shadow-soft">
          <p className="text-accent-rose text-lg mb-6 font-sans">Error: {error}</p>
          <button onClick={loadStories} className="px-8 py-3 bg-text-primary text-midnight-bg rounded-button font-medium transition-all hover:scale-105 active:scale-95 shadow-soft">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-midnight-border/30 pb-8">
        <div className="space-y-4">
          <BlurReveal duration={1}>
            <h1 className="font-serif text-5xl lg:text-7xl text-text-primary italic tracking-wide leading-none">
              Library
            </h1>
          </BlurReveal>
          <FadeIn delay={0.3} duration={0.8} distance={10}>
            <p className="font-sans text-text-muted tracking-[0.2em] uppercase text-xs border-l border-accent-primary/30 pl-3">
              Your Collected Stories
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Filters and Search */}
      <FadeIn delay={0.4} duration={0.8} className="space-y-8">
        <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center">
          {/* Search */}
          <div className="flex-1 w-full max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-cyan transition-colors duration-500" />
              <input
                type="text"
                placeholder="Search your stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.5rem] text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 transition-all duration-500 font-sans text-lg backdrop-blur-md shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Category Filter */}
            <Dropdown
              value={selectedCategory}
              onChange={handleCategoryChange}
              options={[
                { label: 'All Categories', value: 'all' },
                { label: 'Anime', value: 'anime' },
                { label: 'Series', value: 'series' },
                { label: 'Movie', value: 'movie' },
                { label: 'Documentary', value: 'documentary' },
                { label: 'YouTube', value: 'youtube' },
              ]}
            />

            {/* Status Filter */}
            <Dropdown
              value={selectedStatus}
              onChange={handleStatusChange}
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Planning', value: 'planning' },
                { label: 'Watching', value: 'watching' },
                { label: 'Completed', value: 'completed' },
                { label: 'Paused', value: 'paused' },
              ]}
            />

            {/* Sort */}
            <Dropdown
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              options={[
                { label: 'Recently Updated', value: 'updatedAt' },
                { label: 'Title', value: 'title' },
                { label: 'Highest Rated', value: 'rating' },
                { label: 'Highest Impact', value: 'impactIndex' },
              ]}
            />

            {/* View Mode */}
            <div className="flex gap-2 bg-midnight-surface/20 p-1.5 rounded-chip border border-midnight-border/50 backdrop-blur-md">
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
                className={`p-2.5 rounded-full transition-all duration-500 ease-out ${viewMode === 'grid' ? 'bg-text-primary text-midnight-bg shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List View"
                className={`p-2.5 rounded-full transition-all duration-500 ease-out ${viewMode === 'list' ? 'bg-text-primary text-midnight-bg shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <button onClick={getFavorites} aria-label="Filter by Favorites" className="group flex items-center gap-3 px-6 py-2.5 rounded-chip border border-midnight-border/50 text-sm text-text-secondary hover:text-text-primary hover:border-text-primary transition-all duration-300">
            <Heart className="w-4 h-4 group-hover:text-accent-rose transition-colors" />
            Favorites
          </button>
          <button onClick={getWatching} aria-label="Filter by Watching" className="group flex items-center gap-3 px-6 py-2.5 rounded-chip border border-midnight-border/50 text-sm text-text-secondary hover:text-text-primary hover:border-text-primary transition-all duration-300">
            <Play className="w-4 h-4 group-hover:text-accent-cyan transition-colors" />
            Watching
          </button>
          <button onClick={getCompleted} aria-label="Filter by Completed" className="group flex items-center gap-3 px-6 py-2.5 rounded-chip border border-midnight-border/50 text-sm text-text-secondary hover:text-text-primary hover:border-text-primary transition-all duration-300">
            <Check className="w-4 h-4 group-hover:text-accent-emerald transition-colors" />
            Completed
          </button>
        </div>
      </FadeIn>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-32">
          <div className="w-10 h-10 border-2 border-text-primary/20 border-t-text-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Stories Grid/List */}
      {!loading && (
        <StaggerContainer 
          staggerDelay={0.08}
          className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-16' : 'space-y-6 max-w-5xl'}
        >
          {filteredStories().map((story) => (
            <motion.div 
              key={story.id} 
              variants={staggerItemVariants}
              whileHover={viewMode === 'list' ? { x: 4 } : { y: -8 }}
              className={`cursor-pointer group ${viewMode === 'list' ? 'bg-midnight-surface/10 border border-midnight-border/30 rounded-[2rem] overflow-hidden hover:bg-midnight-surface/30 transition-colors duration-500 hover:border-midnight-border/60' : ''}`}
              onClick={() => navigate(`/story/${story.id}`)}
            >
              {viewMode === 'grid' ? (
                <div className="space-y-5">
                  <div className="aspect-[2/3] bg-midnight-surface/30 rounded-[2rem] relative overflow-hidden border border-midnight-border/30 shadow-card transition-shadow duration-500 group-hover:shadow-soft">
                    {story.posterUrl ? (
                      <img src={story.posterUrl} alt={story.title} className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted bg-midnight-surface/50">
                        <BookOpen className="w-10 h-10 opacity-20" />
                      </div>
                    )}
                    
                    {/* Dark gradient overlay for icons */}
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-bg/60 via-transparent to-midnight-bg/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
                      {story.favorite && <Heart className="w-5 h-5 text-accent-rose fill-current drop-shadow-md" />}
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-midnight-bg/80 backdrop-blur-md shadow-sm ${getStatusColor(story.status)}`}>
                        {getStatusIcon(story.status)}
                      </div>
                    </div>
                    {pendingIds.includes(story.id) && (
                      <div className="absolute top-4 left-4 z-10 p-2 bg-midnight-bg/80 backdrop-blur-md rounded-full border border-midnight-border/50 shadow-sm">
                      <div title="Pending Sync">
                        <Cloud className="w-4 h-4 text-accent-cyan animate-pulse" />
                      </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Story Info (Grid) */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-medium text-text-primary leading-tight line-clamp-1">{story.title}</h3>
                    <div className="flex items-center justify-between font-sans text-[10px] text-text-secondary tracking-[0.15em] uppercase">
                      <span>{story.category}</span>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-accent-cyan" />
                        <span>{story.rating || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-8 p-6 sm:p-8 items-start sm:items-center">
                  <div className="w-24 h-36 shrink-0 bg-midnight-surface/50 rounded-[1.5rem] overflow-hidden border border-midnight-border/30 relative shadow-sm group-hover:shadow-soft transition-shadow duration-500">
                    {story.posterUrl ? (
                      <img src={story.posterUrl} alt={story.title} className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-text-muted opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-3xl font-medium text-text-primary truncate">{story.title}</h3>
                      {pendingIds.includes(story.id) && (
                      <div title="Pending Sync">
                        <Cloud className="w-5 h-5 text-accent-cyan animate-pulse shrink-0" />
                      </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-sans tracking-[0.1em] text-text-secondary uppercase">
                      <span className="text-text-primary/70">{story.category}</span>
                      <span className="w-1 h-1 rounded-full bg-midnight-divider" />
                      <span>{story.releaseYear || '—'}</span>
                      <span className="w-1 h-1 rounded-full bg-midnight-divider" />
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="normal-case tracking-wide">{formatRuntime(story.watchTimeMinutes)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-6 sm:gap-4 shrink-0 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                    {story.favorite && <Heart className="w-5 h-5 text-accent-rose fill-current" />}
                    <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-chip bg-midnight-surface/50 border border-midnight-border/30 ${getStatusColor(story.status)}`}>
                      {getStatusIcon(story.status)}
                      <span className="capitalize tracking-wide font-medium">{story.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </StaggerContainer>
      )}

      {/* Empty State */}
      {!loading && filteredStories().length === 0 && (
        <FadeIn delay={0.2} duration={0.8} distance={20} className="text-center py-32 max-w-xl mx-auto flex flex-col items-center">
          <div className="w-24 h-24 mx-auto mb-10 rounded-[2rem] border border-midnight-border/30 bg-midnight-surface/20 flex items-center justify-center shadow-soft relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 to-accent-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Search className="w-10 h-10 text-text-muted opacity-50 group-hover:text-accent-cyan transition-colors duration-500 relative z-10" />
          </div>
          <h3 className="font-serif text-4xl text-text-primary mb-4 italic tracking-wide">Nothing Found</h3>
          <p className="font-sans text-lg text-text-secondary leading-relaxed font-light mb-10">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Your filters returned no stories. Try adjusting them or clear your search.'
              : 'Your library is a blank canvas. Begin your collection by adding a new story.'}
          </p>
          {!(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => navigate('/add-story')}
              className="px-8 py-3.5 rounded-[1.25rem] bg-text-primary text-midnight-bg font-sans text-sm tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-soft hover:shadow-glow-cyan"
            >
              Add Your First Story
            </button>
          )}
        </FadeIn>
      )}
    </div>
  );
}
