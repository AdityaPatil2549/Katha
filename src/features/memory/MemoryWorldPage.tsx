import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Dropdown } from '@/components/ui/Dropdown';
import { 
  Brain, 
  Heart, 
  Calendar, 
  Search, 
  Filter, 
  MessageSquare, 
  Eye, 
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Clock,
  Tag,
  GitBranch,
  Map,
  BookOpen,
  Sparkles,
  BarChart3,
  RefreshCw,
  X,
  Grid,
  List
} from 'lucide-react';
import { useMomentsStore, useStoriesStore } from '@/store';
import type { Moment } from '@/types/models';

export default function MemoryWorldPage() {
  const { 
    moments, 
    loading, 
    error, 
    loadMoments, 
    addMoment, 
    updateMoment, 
    deleteMoment,
    searchMoments,
    getMomentsByMood
  } = useMomentsStore();

  const { stories } = useStoriesStore();

  const [activeRealm, setActiveRealm] = useState<'timeline' | 'gallery' | 'emotional' | 'journal'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [showAddMoment, setShowAddMoment] = useState(false);
  const [memoryResurface, setMemoryResurface] = useState<Moment | null>(null);

  const [newMoment, setNewMoment] = useState<Partial<Moment>>({
    storyId: '',
    context: '',
    thoughts: '',
    mood: 'neutral',
    quote: '',
    character: ''
  });

  useEffect(() => {
    loadMoments();
    // Generate memory resurface
    generateMemoryResurface();
  }, [loadMoments]);

  const generateMemoryResurface = () => {
    if (moments.length > 0) {
      const today = new Date();
      const randomMemory = moments[Math.floor(Math.random() * moments.length)];
      setMemoryResurface(randomMemory || null);
    }
  };

  const handleAddMomentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMoment.storyId || !newMoment.context || !newMoment.thoughts) return;
    await addMoment({
      ...newMoment,
      date: new Date().toISOString()
    } as Omit<Moment, 'id'>);
    setShowAddMoment(false);
    setNewMoment({
      storyId: '',
      context: '',
      thoughts: '',
      mood: 'neutral',
      quote: '',
      character: ''
    });
  };

  const handleEditMoment = async (updates: Partial<Moment>) => {
    if (!editingMoment) return;
    await updateMoment(editingMoment.id, updates);
    setEditingMoment(null);
  };

  const handleDeleteMoment = async (momentId: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    await deleteMoment(momentId);
  };

  const handleTogglePrivacy = async (moment: Moment) => {
    await updateMoment(moment.id, { isPrivate: !moment.isPrivate });
  };

  const getFilteredMoments = () => {
    let filtered = moments;

    if (selectedMood !== 'all') {
      filtered = filtered.filter(moment => moment.mood === selectedMood);
    }

    if (showPrivateOnly) {
      filtered = filtered.filter(moment => moment.isPrivate === true);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(moment =>
        moment.quote?.toLowerCase().includes(query) ||
        moment.character?.toLowerCase().includes(query) ||
        moment.context.toLowerCase().includes(query) ||
        moment.thoughts.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUniqueMoods = () => {
    const uniqueMoods = Array.from(new Set(moments.map(m => m.mood).filter(Boolean))) as string[];
    return uniqueMoods.sort();
  };

  const getEmotionalStats = () => {
    const moodCounts = moments.reduce((acc, moment) => {
      if (moment.mood) {
        acc[moment.mood] = (acc[moment.mood] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / moments.length) * 100)
    }));
  };

  const getMomentsByYear = () => {
    const byYear = moments.reduce((acc, moment) => {
      const year = new Date(moment.date).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(moment);
      return acc;
    }, {} as Record<number, Moment[]>);

    return Object.entries(byYear)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([year, moments]) => ({ year: parseInt(year), moments }));
  };

  const filteredMoments = getFilteredMoments();
  const uniqueMoods = getUniqueMoods();
  const emotionalStats = getEmotionalStats();
  const momentsByYear = getMomentsByYear();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-midnight flex items-center justify-center">
        <div className="surface-elevated p-8 rounded-card text-center max-w-md">
          <p className="text-rose mb-4">Error: {error}</p>
          <button onClick={loadMoments} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative z-10 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 py-page">
        
        {/* Header */}
        <BlurReveal>
          <div className="text-center mb-page">
            <h1 className="heading-1 text-gradient-violet mb-tight">
              Smriti's Temple
            </h1>
            <p className="text-h3 text-quote mb-section">
              Your personal memory archive
            </p>
            <p className="text-secondary">
              Every moment captured. Every emotion preserved. Your story lives here.
            </p>
          </div>
        </BlurReveal>

        <StaggerContainer>


        {/* Memory Resurface */}
        {memoryResurface && (
          <FadeIn>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-card border-l-4 border-accent-rose mb-page glow-violet"
          >
            <div className="flex items-center gap-tight mb-4">
              <Sparkles className="w-5 h-5 text-accent-rose" />
              <h2 className="heading-3 text-primary">Memory Resurface</h2>
              <button 
                onClick={generateMemoryResurface}
                className="btn btn-ghost p-1"
                aria-label="Generate new memory"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-midnight-surface/50 p-4 rounded-card">
              <p className="text-small text-secondary mb-2">
                On this day in your story...
              </p>
              {memoryResurface.quote && (
                <blockquote className="text-quote text-quote mb-3">
                  "{memoryResurface.quote}"
                </blockquote>
              )}
              <p className="text-secondary mb-2">{memoryResurface.context}</p>
              <p className="text-small text-muted">
                {formatDate(memoryResurface.date)} • {memoryResurface.mood}
              </p>
            </div>
          </motion.div>
          </FadeIn>
        )}

        {/* Realm Navigation */}
        <FadeIn>
        <div className="glass-card rounded-card p-1.5 mb-page">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {[
              { id: 'timeline', label: 'Smriti Timeline', icon: <GitBranch className="w-4 h-4" /> },
              { id: 'gallery', label: 'Moments Gallery', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'emotional', label: 'Emotional Map', icon: <Heart className="w-4 h-4" /> },
              { id: 'journal', label: 'Life Journal', icon: <BookOpen className="w-4 h-4" /> }
            ].map((realm) => (
              <button
                key={realm.id}
                onClick={() => setActiveRealm(realm.id as any)}
                className={`relative p-3 rounded-[12px] transition-colors duration-300 flex flex-col items-center gap-2 ${
                  activeRealm === realm.id
                    ? 'text-white'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                {activeRealm === realm.id && (
                  <motion.div
                    layoutId="memory-active-tab"
                    className="absolute inset-0 bg-gradient-to-br from-accent-primary to-purple-600 rounded-[12px] shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center gap-2">
                  {realm.icon}
                  <span className="text-small font-semibold tracking-wide text-center">{realm.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        </FadeIn>

        {/* Filters and Actions */}
        <FadeIn>
        <div className="glass-card rounded-card p-4 mb-page shadow-glass">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent-primary transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search your memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-midnight-bg/40 border border-white/5 rounded-[12px] text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary/50 focus:bg-midnight-surface/60 transition-all duration-300 shadow-inner"
                />
              </div>

              {/* Mood Filter */}
              <div className="min-w-[140px]">
                <Dropdown
                  value={selectedMood}
                  onChange={setSelectedMood}
                  options={[
                    { value: 'all', label: 'All Moods' },
                    ...uniqueMoods.map(mood => ({ value: mood, label: mood }))
                  ]}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPrivateOnly(!showPrivateOnly)}
                className={`px-4 py-2 rounded-[12px] text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  showPrivateOnly 
                    ? 'border border-accent-cyan text-accent-cyan shadow-[0_0_15px_rgba(0,242,254,0.2)] bg-accent-cyan/10' 
                    : 'border border-white/10 text-text-secondary hover:text-primary hover:border-white/20 hover:bg-white/5'
                }`}
              >
                {showPrivateOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                Private Only
              </button>
              
              <button
                onClick={() => setShowAddMoment(true)}
                className="px-5 py-2 rounded-[12px] bg-gradient-to-r from-accent-primary to-purple-600 text-white text-sm font-bold tracking-wide flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Add Moment
              </button>
            </div>
          </div>
        </div>
        </FadeIn>

        {/* Realm Content */}
        <FadeIn>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRealm}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            
            {/* Smriti Timeline */}
            {activeRealm === 'timeline' && (
              <div className="space-y-page">
                <div className="flex items-center justify-between">
                  <h2 className="heading-2 text-primary flex items-center gap-tight">
                    <GitBranch className="w-5 h-5 text-accent-primary" />
                    Your Story Timeline
                  </h2>
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

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredMoments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-text-muted" />
                    <h3 className="heading-3 text-primary mb-2">Your story has just begun</h3>
                    <p className="text-secondary mb-6">
                      Start capturing your first memorable moment to build your timeline.
                    </p>
                    <button onClick={() => setShowAddMoment(true)} className="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-3">
                      <Plus className="w-4 h-4" />
                      Add Your First Moment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {momentsByYear.map(({ year, moments: yearMoments }) => (
                      <div key={year} className="space-y-4">
                        <h3 className="heading-3 text-primary flex items-center gap-tight">
                          <Calendar className="w-5 h-5 text-accent-amber" />
                          {year}
                        </h3>
                        
                        <div className="space-y-4">
                          {yearMoments.map((moment, index) => (
                            <motion.div
                              key={moment.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative"
                            >
                              {/* Timeline Line */}
                              {index < yearMoments.length - 1 && (
                                <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-midnight-divider" />
                              )}
                              
                              <div className="flex gap-6">
                                {/* Date Marker */}
                                <div className="flex flex-col items-center">
                                  <div className="w-12 h-12 rounded-full bg-gradient-violet text-text-primary flex items-center justify-center text-small font-semibold shadow-glow">
                                    {new Date(moment.date).getDate()}
                                  </div>
                                  <div className="text-small text-secondary mt-1">
                                    {new Date(moment.date).toLocaleDateString('en-US', { month: 'short' })}
                                  </div>
                                </div>

                                {/* Memory Card */}
                                <div className="flex-1 glass-card p-6 rounded-card hover:shadow-card-hover transition-all duration-normal">
                                  <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                      {moment.mood && (
                                        <span className={`chip chip-${moment.mood} chip-accent`}>
                                          {moment.mood}
                                        </span>
                                      )}
                                      {moment.isPrivate && (
                                        <span className="flex items-center gap-1 text-amber">
                                          <EyeOff className="w-3 h-3" />
                                          <span className="text-caption">Private</span>
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => setEditingMoment(moment)}
                                        className="btn btn-ghost p-2"
                                        aria-label="Edit memory"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMoment(moment.id)}
                                        className="btn btn-ghost p-2 text-rose hover:bg-rose/10"
                                        aria-label="Delete memory"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {moment.quote && (
                                    <blockquote className="text-quote text-quote mb-4 border-l-4 border-accent-cyan pl-4">
                                      "{moment.quote}"
                                    </blockquote>
                                  )}

                                  {moment.character && (
                                    <p className="text-small text-secondary mb-3">— {moment.character}</p>
                                  )}

                                  <p className="text-secondary mb-3">{moment.context}</p>
                                  <p className="text-primary mb-4">{moment.thoughts}</p>

                                  <div className="flex items-center gap-4 text-caption text-muted">
                                    {moment.timestamp && (
                                      <>
                                        <Clock className="w-3 h-3" />
                                        <span>{moment.timestamp}</span>
                                        <span>•</span>
                                      </>
                                    )}
                                    <span>{formatDate(moment.date)}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Moments Gallery */}
            {activeRealm === 'gallery' && (
              <div className="space-y-page">
                <div className="flex items-center justify-between">
                  <h2 className="heading-2 text-primary flex items-center gap-tight">
                    <MessageSquare className="w-5 h-5 text-accent-cyan" />
                    Moments Gallery
                  </h2>
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

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredMoments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-text-muted" />
                    <h3 className="heading-3 text-primary mb-2">No moments found</h3>
                    <p className="text-secondary mb-6">
                      Your memories will live here. Start capturing your first moment.
                    </p>
                    <button onClick={() => setShowAddMoment(true)} className="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-3">
                      <Plus className="w-4 h-4" />
                      Add Your First Moment
                    </button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-normal' : 'space-y-4'}>
                    {filteredMoments.map((moment, index) => (
                      <motion.div
                        key={moment.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card rounded-card overflow-hidden hover:shadow-card-hover transition-all duration-normal group"
                      >
                        <div className="p-6 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2">
                              {moment.mood && (
                                <span className={`chip chip-${moment.mood} chip-accent`}>
                                  {moment.mood}
                                </span>
                              )}
                              {moment.isPrivate && (
                                <span className="flex items-center gap-1 text-amber">
                                  <EyeOff className="w-3 h-3" />
                                  <span className="text-caption">Private</span>
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingMoment(moment)}
                                className="btn btn-ghost p-2"
                                aria-label="Edit memory"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMoment(moment.id)}
                                className="btn btn-ghost p-2 text-rose hover:bg-rose/10"
                                aria-label="Delete memory"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {moment.quote && (
                            <blockquote className="text-quote text-quote border-l-4 border-accent-cyan pl-4">
                              "{moment.quote}"
                            </blockquote>
                          )}

                          {moment.character && (
                            <p className="text-small text-secondary">— {moment.character}</p>
                          )}

                          <p className="text-secondary text-sm">{moment.context}</p>
                          <p className="text-primary">{moment.thoughts}</p>

                          <div className="text-caption text-muted">
                            {formatDate(moment.date)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Emotional Map */}
            {activeRealm === 'emotional' && (
              <div className="space-y-page">
                <h2 className="heading-2 text-primary flex items-center gap-tight">
                  <Heart className="w-5 h-5 text-accent-rose" />
                  Emotional Map
                </h2>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : moments.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-text-muted" />
                    <h3 className="heading-3 text-primary mb-2">Your emotional journey</h3>
                    <p className="text-secondary mb-6">
                      See how stories have made you feel over time.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-page">
                    {/* Emotional Distribution */}
                    <div className="glass-card p-6 rounded-card">
                      <h3 className="heading-3 text-primary mb-section">Emotional Distribution</h3>
                      <div className="space-y-3">
                        {emotionalStats.map(({ mood, count, percentage }) => (
                          <div key={mood} className="space-y-2">
                            <div className="flex justify-between text-small">
                              <span className="capitalize text-primary">{mood}</span>
                              <span className="text-secondary">{count} moments ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-midnight-border rounded-full h-2">
                              <div 
                                className={`h-full rounded-full transition-all duration-slow mood-${mood}-bg`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Emotional Insights */}
                    <div className="glass-card p-6 rounded-card">
                      <h3 className="heading-3 text-primary mb-section">Emotional Insights</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-caption text-secondary mb-1">Most Emotional Year</div>
                          <div className="text-h3 font-semibold text-primary">
                            {momentsByYear[0]?.year || 'N/A'}
                          </div>
                          <div className="text-small text-secondary">
                            {momentsByYear[0]?.moments.length || 0} moments captured
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-caption text-secondary mb-1">Dominant Mood</div>
                          <div className="text-h3 font-semibold capitalize text-primary">
                            {emotionalStats[0]?.mood || 'None'}
                          </div>
                          <div className="text-small text-secondary">
                            {emotionalStats[0]?.percentage || 0}% of all moments
                          </div>
                        </div>

                        <div>
                          <div className="text-caption text-secondary mb-1">Emotional Range</div>
                          <div className="text-h3 font-semibold text-primary">
                            {uniqueMoods.length} moods
                          </div>
                          <div className="text-small text-secondary">
                            Across {moments.length} memories
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Life Journal */}
            {activeRealm === 'journal' && (
              <div className="space-y-page">
                <h2 className="heading-2 text-primary flex items-center gap-tight">
                  <BookOpen className="w-5 h-5 text-accent-emerald" />
                  Life Journal
                </h2>

                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-text-muted" />
                  <h3 className="heading-3 text-primary mb-2">Your Life Through Stories</h3>
                  <p className="text-secondary mb-6">
                    Reflect on how stories have shaped different phases of your life.
                  </p>
                  <button onClick={() => {
                    window.location.href = '/atlas';
                  }} className="btn btn-primary">
                    Explore Atlas
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        </FadeIn>

        {/* Stats Overview */}
        <FadeIn>
        <div className="glass-card p-6 rounded-card mt-page">
          <h3 className="heading-3 text-primary mb-section flex items-center gap-tight">
            <BarChart3 className="w-5 h-5 text-accent-emerald" />
            Memory Archive Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-normal">
            <div className="text-center">
              <div className="text-h2 font-semibold text-primary">{moments.length}</div>
              <div className="text-caption text-secondary">Total Memories</div>
            </div>
            <div className="text-center">
              <div className="text-h2 font-semibold text-primary">
                {moments.filter(m => m.isPrivate).length}
              </div>
              <div className="text-caption text-secondary">Private Memories</div>
            </div>
            <div className="text-center">
              <div className="text-h2 font-semibold text-primary">{uniqueMoods.length}</div>
              <div className="text-caption text-secondary">Emotional Range</div>
            </div>
            <div className="text-center">
              <div className="text-h2 font-semibold text-primary">{momentsByYear.length}</div>
              <div className="text-caption text-secondary">Years Active</div>
            </div>
          </div>
        </div>
        </FadeIn>
        </StaggerContainer>
      </div>

      {/* Add Moment Modal */}
      <AnimatePresence>
        {showAddMoment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddMoment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-section">
                  <h2 className="heading-2 text-primary">Capture a Memory</h2>
                  <button onClick={() => setShowAddMoment(false)} className="text-secondary hover:text-primary">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleAddMomentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-small font-medium text-secondary mb-1">Select Story *</label>
                    <Dropdown
                      value={newMoment.storyId || ''}
                      onChange={(val) => setNewMoment({...newMoment, storyId: val || ''})}
                      options={[
                        { value: '', label: 'Select a story' },
                        ...stories.map(s => ({ value: s.id, label: s.title }))
                      ]}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-small font-medium text-secondary mb-1">Context / Scene *</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-midnight-bg border border-midnight-border rounded-button p-3 text-primary focus:border-accent-cyan outline-none"
                      placeholder="e.g. The final battle, or when they first met..."
                      value={newMoment.context}
                      onChange={e => setNewMoment({...newMoment, context: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-small font-medium text-secondary mb-1">Your Thoughts *</label>
                    <textarea
                      required
                      className="w-full bg-midnight-bg border border-midnight-border rounded-button p-3 text-primary focus:border-accent-cyan outline-none"
                      rows={4}
                      placeholder="Why did this moment stand out? How did it make you feel?"
                      value={newMoment.thoughts}
                      onChange={e => setNewMoment({...newMoment, thoughts: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-small font-medium text-secondary mb-1">Quote (Optional)</label>
                      <input
                        type="text"
                        className="w-full bg-midnight-bg border border-midnight-border rounded-button p-3 text-primary focus:border-accent-cyan outline-none"
                        placeholder="An unforgettable line..."
                        value={newMoment.quote}
                        onChange={e => setNewMoment({...newMoment, quote: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-small font-medium text-secondary mb-1">Character (Optional)</label>
                      <input
                        type="text"
                        className="w-full bg-midnight-bg border border-midnight-border rounded-button p-3 text-primary focus:border-accent-cyan outline-none"
                        placeholder="Who said it?"
                        value={newMoment.character}
                        onChange={e => setNewMoment({...newMoment, character: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-small font-medium text-secondary mb-1">Primary Mood</label>
                    <Dropdown
                      value={newMoment.mood || ''}
                      onChange={(val) => setNewMoment({...newMoment, mood: val || undefined})}
                      options={['neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'inspired', 'thoughtful', 'nostalgic', 'heartbroken'].map(mood => ({ value: mood, label: mood }))}
                      className="w-full capitalize"
                    />
                  </div>
                  <div className="flex justify-end gap-normal pt-4 border-t border-midnight-border">
                    <button type="button" onClick={() => setShowAddMoment(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">Save Memory</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
