import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dropdown } from '@/components/ui/Dropdown';
import { 
  Heart, 
  Play, 
  Pause, 
  Star, 
  Clock, 
  Calendar, 
  Tag, 
  BookOpen, 
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Share2,
  Download,
  X,
  Lightbulb,
  Copy,
  Check,
  Cloud
} from 'lucide-react';
import { useStoriesStore, useMomentsStore, useSessionsStore, useKnowledgeStore } from '@/store';
import { useSyncStore } from '@/store/syncStore';
import type { Story, Moment, Session, Knowledge } from '@/types/models';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer, staggerItemVariants } from '@/components/ui/motion/StaggerContainer';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    stories, 
    loading: storiesLoading, 
    updateStory, 
    deleteStory 
  } = useStoriesStore();
  
  const { 
    moments, 
    loading: momentsLoading, 
    addMoment, 
    updateMoment, 
    deleteMoment,
    getMomentsByStory 
  } = useMomentsStore();

  const {
    sessions,
    loadSessions,
    addSession,
    deleteSession
  } = useSessionsStore();

  const {
    knowledge,
    loadKnowledge,
    addKnowledge,
    deleteKnowledge
  } = useKnowledgeStore();

  const { pendingIds } = useSyncStore();

  const [story, setStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAddMoment, setShowAddMoment] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddKnowledge, setShowAddKnowledge] = useState(false);
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'moments' | 'sessions' | 'knowledge'>('overview');
  const [copied, setCopied] = useState(false);

  const [newMoment, setNewMoment] = useState<Partial<Moment>>({
    context: '',
    thoughts: '',
    mood: 'neutral',
    quote: '',
    character: ''
  });

  const [newSession, setNewSession] = useState<Partial<Session>>({
    duration: 30,
    mood: 'neutral',
    notes: ''
  });

  const [newKnowledge, setNewKnowledge] = useState<Partial<Knowledge>>({
    lesson: '',
    principle: '',
    reflection: ''
  });

  useEffect(() => {
    loadSessions();
    loadKnowledge();
  }, [loadSessions, loadKnowledge]);

  useEffect(() => {
    const foundStory = stories.find(s => s.id === id);
    if (foundStory) {
      setStory(foundStory);
      if (id) getMomentsByStory(id);
    }
  }, [id, stories, getMomentsByStory]);

  const handleToggleFavorite = async () => {
    if (!story) return;
    await updateStory(story.id, { favorite: !story.favorite });
  };

  const handleStatusChange = async (newStatus: Story['status']) => {
    if (!story) return;
    await updateStory(story.id, { status: newStatus });
  };

  const handleAddMoment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!story || !newMoment.context || !newMoment.thoughts) return;
    
    await addMoment({ 
      ...newMoment,
      storyId: story.id,
      date: new Date().toISOString()
    } as Omit<Moment, 'id'>);
    
    setShowAddMoment(false);
    setNewMoment({
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
    if (!confirm('Are you sure you want to delete this moment?')) return;
    await deleteMoment(momentId);
  };

  const handleDeleteStory = async () => {
    if (!story) return;
    if (!confirm('Are you sure you want to delete this story and all related data?')) return;
    await deleteStory(story.id);
    navigate('/library');
  };

  const handleAddSession = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!story || !newSession.duration) return;
    await addSession({
      ...newSession,
      storyId: story.id,
      date: new Date().toISOString(),
      notes: newSession.notes || ''
    } as Omit<Session, 'id'>);
    setShowAddSession(false);
    setNewSession({ duration: 30, mood: 'neutral', notes: '' });
  };

  const handleAddKnowledge = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!story || !newKnowledge.lesson) return;
    await addKnowledge({
      ...newKnowledge,
      storyId: story.id,
      date: new Date().toISOString()
    } as Omit<Knowledge, 'id'>);
    setShowAddKnowledge(false);
    setNewKnowledge({ lesson: '', principle: '', reflection: '' });
  };

  const handleShare = async () => {
    if (!story) return;
    const shareText = `📖 ${story.title}\n⭐ ${story.rating}/10\n🎭 ${story.genre.join(', ')}\n📺 ${story.platform}\n\nTracked with Katha`;
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, text: shareText });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    if (!story) return;
    const storyMomentsList = moments.filter(m => m.storyId === story.id);
    const storySessions = sessions.filter(s => s.storyId === story.id);
    const storyKnowledge = knowledge.filter(k => k.storyId === story.id);

    let md = `# ${story.title}\n\n`;
    md += `- **Category:** ${story.category}\n`;
    md += `- **Status:** ${story.status}\n`;
    md += `- **Rating:** ${story.rating}/10\n`;
    md += `- **Genre:** ${story.genre.join(', ')}\n`;
    md += `- **Platform:** ${story.platform}\n`;
    if (story.currentEpisode) md += `- **Progress:** Episode ${story.currentEpisode}${story.totalEpisodes ? ` / ${story.totalEpisodes}` : ''}\n`;
    md += `- **Impact Index:** ${story.impactIndex}/10\n`;
    md += `\n## Notes\n${story.notes || 'No notes.'}\n`;

    if (storyMomentsList.length > 0) {
      md += `\n## Moments (${storyMomentsList.length})\n`;
      storyMomentsList.forEach(m => {
        md += `\n### ${new Date(m.date).toLocaleDateString()}${m.mood ? ` • ${m.mood}` : ''}\n`;
        if (m.quote) md += `> "${m.quote}"${m.character ? ` — ${m.character}` : ''}\n\n`;
        md += `${m.context}\n\n${m.thoughts}\n`;
      });
    }

    if (storySessions.length > 0) {
      md += `\n## Sessions (${storySessions.length})\n`;
      storySessions.forEach(s => {
        md += `- ${new Date(s.date).toLocaleDateString()} — ${s.duration} min${s.mood ? ` • ${s.mood}` : ''}${s.notes ? ` — ${s.notes}` : ''}\n`;
      });
    }

    if (storyKnowledge.length > 0) {
      md += `\n## Knowledge & Insights (${storyKnowledge.length})\n`;
      storyKnowledge.forEach(k => {
        md += `\n**Lesson:** ${k.lesson}\n`;
        if (k.principle) md += `**Principle:** ${k.principle}\n`;
        if (k.reflection) md += `**Reflection:** ${k.reflection}\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (storiesLoading || !story) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-2 border-text-primary/20 border-t-text-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const storyMoments = moments.filter(m => m.storyId === story.id);

  return (
    <StaggerContainer 
      staggerDelay={0.1}
      className="max-w-6xl mx-auto px-6 py-16 space-y-16"
    >
      {/* Hero Section */}
      <motion.div variants={staggerItemVariants} className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20 border-b border-midnight-border/20 pb-20">
        {/* Poster */}
        <div className="w-64 sm:w-80 shrink-0">
          <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden bg-midnight-surface/20 border border-midnight-border/20 shadow-2xl relative group">
            {story.posterUrl ? (
              <img src={story.posterUrl} alt={story.title} className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-text-muted opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight-bg/90 via-midnight-bg/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 backdrop-blur-[2px]">
               <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-6 rounded-full bg-text-primary text-midnight-bg shadow-soft transform translate-y-8 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-105 active:scale-95"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
            </div>
          </div>
        </div>

        {/* Story Info */}
        <div className="flex-1 space-y-10 min-w-0 text-center lg:text-left pt-4">
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <BlurReveal duration={1.2}>
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-[5.5rem] font-medium text-text-primary leading-[1.05] tracking-tight">{story.title}</h1>
              </BlurReveal>
              <FadeIn delay={0.4} duration={0.8} distance={10} className="flex gap-4 justify-center shrink-0">
                <button
                  onClick={handleToggleFavorite}
                  className="p-4 rounded-full bg-midnight-surface/30 border border-midnight-border/50 hover:bg-midnight-surface/60 transition-colors group shadow-sm"
                  aria-label={story.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 transition-colors ${story.favorite ? 'text-accent-rose fill-current drop-shadow-md' : 'text-text-muted group-hover:text-text-primary'}`} />
                </button>
              </FadeIn>
            </div>

            <FadeIn delay={0.5} duration={0.8} className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm font-sans tracking-[0.1em] text-text-secondary uppercase">
              <div className="flex items-center gap-1.5 text-accent-cyan font-medium">
                <Star className="w-4 h-4" />
                <span>{story.rating || '—'} / 10</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-midnight-divider" />
              <span>{story.category}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-midnight-divider" />
              <span>{story.releaseYear || 'Unknown Year'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-midnight-divider" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="normal-case">{formatRuntime(story.watchTimeMinutes)}</span>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.6} duration={0.8} className="flex flex-wrap justify-center lg:justify-start gap-3">
            {story.genre.map((genre, index) => (
              <span key={index} className="px-4 py-1.5 bg-midnight-surface/40 border border-midnight-border/30 rounded-chip text-xs tracking-wider uppercase text-text-muted">
                {genre}
              </span>
            ))}
          </FadeIn>

          <FadeIn delay={0.7} duration={0.8} className="space-y-6 pt-4 border-t border-midnight-border/30">
            {/* Status Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-xs font-sans tracking-[0.2em] uppercase text-text-muted">Status</span>
              <div className="flex flex-wrap justify-center gap-3">
                {(['planning', 'watching', 'completed', 'paused'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-5 py-2 rounded-chip text-xs tracking-wider uppercase transition-all duration-300 border ${
                      story.status === status 
                        ? 'bg-text-primary text-midnight-bg border-text-primary font-medium shadow-sm' 
                        : 'bg-midnight-surface/30 text-text-muted border-midnight-border/50 hover:border-text-primary/50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            {story.totalEpisodes && story.currentEpisode && (
              <div className="space-y-3 max-w-md mx-auto lg:mx-0">
                <div className="flex justify-between text-xs font-sans tracking-[0.1em] uppercase text-text-muted">
                  <span>Progress</span>
                  <span className="font-medium text-text-primary">Ep {story.currentEpisode} <span className="text-text-muted opacity-50">/</span> {story.totalEpisodes}</span>
                </div>
                <div className="w-full bg-midnight-surface/50 border border-midnight-border/30 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(story.currentEpisode / story.totalEpisodes) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
                    className="bg-accent-cyan h-full rounded-full"
                  />
                </div>
              </div>
            )}
          </FadeIn>

          {/* Actions */}
          <FadeIn delay={0.8} duration={0.8} className="flex flex-wrap justify-center lg:justify-start gap-4 pt-6">
            <button 
              className="bg-text-primary text-midnight-bg px-6 py-3 rounded-button font-sans tracking-wide text-sm transition-transform duration-300 hover:scale-105 active:scale-95 flex items-center shadow-soft"
              onClick={() => setShowAddMoment(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Moment
            </button>
            <button 
              className="px-6 py-3 rounded-button border border-midnight-border/50 text-text-primary text-sm font-sans tracking-wide transition-colors hover:bg-midnight-surface/50 flex items-center gap-2"
              onClick={handleShare}
            >
              {copied ? <Check className="w-4 h-4 text-accent-emerald" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied' : 'Share'}
            </button>
            <button 
              className="px-6 py-3 rounded-button border border-midnight-border/50 text-text-primary text-sm font-sans tracking-wide transition-colors hover:bg-midnight-surface/50 flex items-center gap-2"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={handleDeleteStory}
              className="px-6 py-3 rounded-button border border-midnight-border/50 text-accent-rose text-sm font-sans tracking-wide transition-colors hover:bg-accent-rose/10 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </FadeIn>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div variants={staggerItemVariants} className="space-y-12">
        
        {/* Notes & Tags Section (Only show if they exist) */}
        {(story.notes || story.tags.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {story.notes && (
              <div className="bg-midnight-surface/20 rounded-[2rem] p-10 border border-midnight-border/30">
                <h2 className="font-serif text-3xl text-text-primary mb-6 flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-text-muted" />
                  Notes
                </h2>
                <p className="font-sans text-text-secondary leading-relaxed font-light whitespace-pre-wrap">{story.notes}</p>
              </div>
            )}
            
            {story.tags.length > 0 && (
              <div className="bg-midnight-surface/20 rounded-[2rem] p-10 border border-midnight-border/30">
                <h2 className="font-serif text-3xl text-text-primary mb-6 flex items-center gap-3">
                  <Tag className="w-6 h-6 text-text-muted" />
                  Themes
                </h2>
                <div className="flex flex-wrap gap-3">
                  {story.tags.map((tag, index) => (
                    <span key={index} className="px-4 py-2 bg-midnight-surface/50 border border-midnight-border/50 rounded-chip text-sm text-text-primary shadow-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="border-b border-midnight-border/30">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {(['overview', 'moments', 'sessions', 'knowledge'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-sans tracking-[0.15em] uppercase transition-colors relative whitespace-nowrap ${
                  activeTab === tab 
                    ? 'text-text-primary font-medium' 
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-[400px]"
          >
            {activeTab === 'overview' && (
              <div className="bg-midnight-surface/10 rounded-[2rem] p-10 md:p-12 border border-midnight-border/30 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xs font-sans tracking-[0.2em] uppercase text-text-muted mb-4">Details</h4>
                    <div className="space-y-6">
                      <div className="flex justify-between border-b border-midnight-border/30 pb-4">
                        <span className="text-text-secondary font-light">Impact Index</span>
                        <span className="text-text-primary font-medium">{story.impactIndex} / 10</span>
                      </div>
                      <div className="flex justify-between border-b border-midnight-border/30 pb-4">
                        <span className="text-text-secondary font-light">Life Phase</span>
                        <span className="text-text-primary font-medium">{story.lifePhase || '—'}</span>
                      </div>
                      <div className="flex justify-between border-b border-midnight-border/30 pb-4">
                        <span className="text-text-secondary font-light">Platform</span>
                        <span className="text-text-primary font-medium">{story.platform}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xs font-sans tracking-[0.2em] uppercase text-text-muted mb-4">Statistics</h4>
                    <div className="space-y-6">
                      <div className="flex justify-between border-b border-midnight-border/30 pb-4">
                        <span className="text-text-secondary font-light">Total Watch Time</span>
                        <span className="text-text-primary font-medium">{formatRuntime(story.watchTimeMinutes)}</span>
                      </div>
                      <div className="flex justify-between border-b border-midnight-border/30 pb-4">
                        <span className="text-text-secondary font-light">Moments Captured</span>
                        <span className="text-text-primary font-medium">{storyMoments.length}</span>
                      </div>
                      <div className="flex justify-between border-b border-midnight-border/30 pb-4">
                        <span className="text-text-secondary font-light">Added On</span>
                        <span className="text-text-primary font-medium">{formatDate(story.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'moments' && (
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-serif text-3xl text-text-primary mb-2">Moments</h3>
                    <p className="font-sans text-text-muted font-light">Capture the scenes that moved you.</p>
                  </div>
                  <button
                    onClick={() => setShowAddMoment(true)}
                    className="bg-text-primary text-midnight-bg px-6 py-3 rounded-button font-sans tracking-wide text-sm transition-transform duration-300 hover:scale-105 active:scale-95 flex items-center justify-center shadow-soft shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Moment
                  </button>
                </div>

                {momentsLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-2 border-text-primary/30 border-t-text-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {storyMoments.length === 0 ? (
                      <div className="text-center py-20 bg-midnight-surface/10 rounded-[2rem] border border-midnight-border/30">
                        <MessageSquare className="w-10 h-10 mx-auto mb-6 text-text-muted opacity-50" />
                        <p className="font-sans text-text-secondary font-light">No moments yet. Capture your first memorable scene!</p>
                      </div>
                    ) : (
                      storyMoments.map((moment) => (
                        <div key={moment.id} className="bg-midnight-surface/20 rounded-[2rem] p-8 md:p-10 border border-midnight-border/30 group hover:border-midnight-border/60 transition-colors duration-500 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                              {moment.quote && (
                                <blockquote className="font-serif text-2xl md:text-3xl text-text-quote italic leading-relaxed">
                                  "{moment.quote}"
                                </blockquote>
                              )}
                              {moment.character && (
                                <div className="text-sm font-sans tracking-[0.1em] uppercase text-text-secondary">
                                  — {moment.character}
                                </div>
                              )}
                              
                              <div className="space-y-4 pt-4 border-t border-midnight-border/30">
                                <p className="font-sans text-text-secondary leading-relaxed font-light"><strong className="text-text-primary font-medium mr-2">Context:</strong>{moment.context}</p>
                                <p className="font-sans text-text-primary leading-relaxed"><strong className="text-text-secondary font-medium mr-2">Thoughts:</strong>{moment.thoughts}</p>
                              </div>
                            </div>
                            
                            <div className="flex md:flex-col justify-between md:justify-start items-center md:items-end gap-6 shrink-0 border-t md:border-t-0 md:border-l border-midnight-border/30 pt-6 md:pt-0 md:pl-8">
                               <div className="flex flex-col items-start md:items-end gap-2 text-xs font-sans tracking-[0.1em] text-text-muted uppercase text-right">
                                {moment.mood && (
                                  <span className="px-3 py-1 rounded-chip border border-midnight-border/50 text-text-primary bg-midnight-surface/50">
                                    {moment.mood}
                                  </span>
                                )}
                                <span className="mt-2">{formatDate(moment.date)}</span>
                                {moment.timestamp && <span>{moment.timestamp}</span>}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingMoment(moment)}
                                  className="p-3 rounded-full hover:bg-midnight-surface/50 text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-midnight-border/50"
                                  aria-label="Edit moment"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMoment(moment.id)}
                                  className="p-3 rounded-full hover:bg-accent-rose/10 text-text-secondary hover:text-accent-rose transition-colors border border-transparent hover:border-accent-rose/20"
                                  aria-label="Delete moment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                {pendingIds.includes(moment.id) && (
                                  <div className="p-3">
                                    <Cloud className="w-4 h-4 text-accent-cyan animate-pulse" title="Pending Sync" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-serif text-3xl text-text-primary mb-2">Watch Sessions</h3>
                    <p className="font-sans text-text-muted font-light">Track your time spent in this world.</p>
                  </div>
                  <button
                    onClick={() => setShowAddSession(true)}
                    className="bg-text-primary text-midnight-bg px-6 py-3 rounded-button font-sans tracking-wide text-sm transition-transform duration-300 hover:scale-105 active:scale-95 flex items-center justify-center shadow-soft shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Session
                  </button>
                </div>

                {(() => {
                  const storySessions = sessions.filter(s => s.storyId === story.id);
                  const totalTime = storySessions.reduce((sum, s) => sum + s.duration, 0);
                  return storySessions.length === 0 ? (
                    <div className="text-center py-20 bg-midnight-surface/10 rounded-[2rem] border border-midnight-border/30">
                      <Clock className="w-10 h-10 mx-auto mb-6 text-text-muted opacity-50" />
                      <p className="font-sans text-text-secondary font-light">No sessions logged yet. Start tracking your watch time.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-midnight-surface/20 p-8 rounded-[2rem] text-center border border-midnight-border/30">
                          <div className="font-serif text-4xl text-text-primary mb-2">{storySessions.length}</div>
                          <div className="text-xs font-sans tracking-[0.2em] uppercase text-text-secondary">Sessions</div>
                        </div>
                        <div className="bg-midnight-surface/20 p-8 rounded-[2rem] text-center border border-midnight-border/30">
                          <div className="font-serif text-4xl text-text-primary mb-2">{formatRuntime(totalTime)}</div>
                          <div className="text-xs font-sans tracking-[0.2em] uppercase text-text-secondary">Total Time</div>
                        </div>
                        <div className="bg-midnight-surface/20 p-8 rounded-[2rem] text-center border border-midnight-border/30">
                          <div className="font-serif text-4xl text-text-primary mb-2">{Math.round(totalTime / storySessions.length)}m</div>
                          <div className="text-xs font-sans tracking-[0.2em] uppercase text-text-secondary">Avg Session</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {storySessions
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(session => (
                            <div key={session.id} className="bg-midnight-surface/10 p-6 rounded-[1.5rem] border border-midnight-border/30 flex items-start justify-between group hover:bg-midnight-surface/20 transition-colors">
                              <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2 text-text-primary font-medium">
                                    <Clock className="w-4 h-4 text-accent-cyan" />
                                    <span>{session.duration} min</span>
                                  </div>
                                  {session.mood && (
                                    <span className="px-3 py-1 rounded-chip text-[10px] tracking-wider uppercase border border-midnight-border/50 text-text-secondary bg-midnight-bg/50">
                                      {session.mood}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-text-secondary font-light">{formatDate(session.date)}</div>
                                {session.notes && <div className="text-sm text-text-muted font-light italic mt-2">{session.notes}</div>}
                              </div>
                              <button
                                onClick={() => { if (confirm('Delete this session?')) deleteSession(session.id); }}
                                className="p-2 text-text-muted hover:text-accent-rose transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="Delete session"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-serif text-3xl text-text-primary mb-2">Knowledge & Insights</h3>
                    <p className="font-sans text-text-muted font-light">Extract wisdom from this story.</p>
                  </div>
                  <button
                    onClick={() => setShowAddKnowledge(true)}
                    className="bg-text-primary text-midnight-bg px-6 py-3 rounded-button font-sans tracking-wide text-sm transition-transform duration-300 hover:scale-105 active:scale-95 flex items-center justify-center shadow-soft shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Insight
                  </button>
                </div>

                {(() => {
                  const storyKnowledge = knowledge.filter(k => k.storyId === story.id);
                  return storyKnowledge.length === 0 ? (
                    <div className="text-center py-20 bg-midnight-surface/10 rounded-[2rem] border border-midnight-border/30">
                      <Lightbulb className="w-10 h-10 mx-auto mb-6 text-text-muted opacity-50" />
                      <p className="font-sans text-text-secondary font-light">No insights captured yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {storyKnowledge
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(item => (
                          <div key={item.id} className="bg-midnight-surface/20 p-8 rounded-[2rem] border border-midnight-border/30 space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-emerald to-accent-cyan opacity-50" />
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex gap-4">
                                <div className="mt-1">
                                  <Lightbulb className="w-5 h-5 text-accent-amber" />
                                </div>
                                <h4 className="font-serif text-2xl text-text-primary leading-tight">{item.lesson}</h4>
                              </div>
                              <button
                                onClick={() => { if (confirm('Delete this insight?')) deleteKnowledge(item.id); }}
                                className="p-2 text-text-muted hover:text-accent-rose transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="Delete insight"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="space-y-4 pl-9">
                              {item.principle && (
                                <div className="border-l-2 border-accent-emerald/50 pl-4 py-1">
                                  <div className="text-[10px] tracking-[0.2em] uppercase text-text-muted mb-1">Principle</div>
                                  <div className="text-sm text-text-primary">{item.principle}</div>
                                </div>
                              )}
                              {item.reflection && (
                                <p className="text-sm text-text-secondary italic font-light leading-relaxed">{item.reflection}</p>
                              )}
                              <div className="text-xs font-sans tracking-wider text-text-muted pt-2">{formatDate(item.date)}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </motion.div>

      {/* Add Moment Modal */}
      <AnimatePresence>
        {showAddMoment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight-bg/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
            onClick={() => setShowAddMoment(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-midnight-surface/90 border border-midnight-border rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-midnight-border/50">
                  <h2 className="font-serif text-3xl text-text-primary">Capture a Moment</h2>
                  <button onClick={() => setShowAddMoment(false)} className="p-2 rounded-full hover:bg-midnight-surface/50 text-text-muted hover:text-text-primary transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleAddMoment} className="space-y-6">
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-3">Context / Scene *</label>
                    <textarea 
                      required
                      className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm resize-none leading-relaxed"
                      rows={2}
                      placeholder="What is happening in this moment?"
                      value={newMoment.context}
                      onChange={e => setNewMoment({...newMoment, context: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-3">Your Thoughts *</label>
                    <textarea 
                      required
                      className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm resize-none leading-relaxed"
                      rows={4}
                      placeholder="Why does this moment matter to you?"
                      value={newMoment.thoughts}
                      onChange={e => setNewMoment({...newMoment, thoughts: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-3">Quote (Optional)</label>
                      <input 
                        type="text"
                        className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary focus:border-text-primary outline-none transition-colors font-light"
                        placeholder="Memorable dialogue..."
                        value={newMoment.quote}
                        onChange={e => setNewMoment({...newMoment, quote: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-3">Character (Optional)</label>
                      <input 
                        type="text"
                        className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary focus:border-text-primary outline-none transition-colors font-light"
                        placeholder="Who said it?"
                        value={newMoment.character}
                        onChange={e => setNewMoment({...newMoment, character: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-3">Mood</label>
                    <div className="relative">
                      <Dropdown
                        value={newMoment.mood || ''}
                        onChange={(val) => setNewMoment({...newMoment, mood: val || undefined})}
                        options={['neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'anticipation', 'trust', 'inspired', 'thoughtful'].map(mood => ({ value: mood, label: mood }))}
                        className="w-full capitalize"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-8">
                    <button type="button" onClick={() => setShowAddMoment(false)} className="px-6 py-3 rounded-button border border-transparent text-text-secondary hover:text-text-primary hover:bg-midnight-surface/50 transition-colors font-sans text-sm tracking-wide">
                      Cancel
                    </button>
                    <button type="submit" className="px-8 py-3 rounded-button bg-text-primary text-midnight-bg transition-transform hover:scale-105 active:scale-95 font-sans text-sm tracking-wide shadow-soft">
                      Save Moment
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Session Modal */}
      <AnimatePresence>
        {showAddSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight-bg/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddSession(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-midnight-surface/90 border border-midnight-border rounded-[2rem] max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-midnight-border/50">
                  <h2 className="font-serif text-3xl text-text-primary">Log Watch Session</h2>
                  <button onClick={() => setShowAddSession(false)} className="p-2 rounded-full hover:bg-midnight-surface/50 text-text-muted hover:text-text-primary transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleAddSession} className="space-y-6">
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-3">Duration (minutes) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm"
                      placeholder="30"
                      value={newSession.duration}
                      onChange={e => setNewSession({...newSession, duration: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-3">Mood</label>
                    <div className="relative">
                      <Dropdown
                        value={newSession.mood || ''}
                        onChange={(val) => setNewSession({...newSession, mood: val || undefined})}
                        options={['neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'inspired', 'thoughtful'].map(mood => ({ value: mood, label: mood }))}
                        className="w-full capitalize"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-3">Notes (Optional)</label>
                    <textarea
                      className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary focus:border-text-primary outline-none transition-colors font-light resize-none"
                      rows={3}
                      placeholder="Any thoughts about this session..."
                      value={newSession.notes}
                      onChange={e => setNewSession({...newSession, notes: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-4 pt-6">
                    <button type="button" onClick={() => setShowAddSession(false)} className="px-6 py-3 rounded-button border border-transparent text-text-secondary hover:text-text-primary hover:bg-midnight-surface/50 transition-colors font-sans text-sm tracking-wide">Cancel</button>
                    <button type="submit" className="px-8 py-3 rounded-button bg-text-primary text-midnight-bg transition-transform hover:scale-105 active:scale-95 font-sans text-sm tracking-wide shadow-soft">Log Session</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Knowledge Modal */}
      <AnimatePresence>
        {showAddKnowledge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight-bg/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddKnowledge(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-midnight-surface/90 border border-midnight-border rounded-[2rem] max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-midnight-border/50">
                  <h2 className="font-serif text-3xl text-text-primary">Capture an Insight</h2>
                  <button onClick={() => setShowAddKnowledge(false)} className="p-2 rounded-full hover:bg-midnight-surface/50 text-text-muted hover:text-text-primary transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleAddKnowledge} className="space-y-6">
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-3">Lesson Learned *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm"
                      placeholder="What did this story teach you?"
                      value={newKnowledge.lesson}
                      onChange={e => setNewKnowledge({...newKnowledge, lesson: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-3">Core Principle (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-midnight-surface/20 border border-midnight-border/30 rounded-[1.25rem] text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 backdrop-blur-md transition-all font-sans text-sm"
                      placeholder="A principle you'll carry forward..."
                      value={newKnowledge.principle}
                      onChange={e => setNewKnowledge({...newKnowledge, principle: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-3">Personal Reflection (Optional)</label>
                    <textarea
                      className="w-full bg-midnight-bg/50 border border-midnight-border/50 rounded-xl p-4 text-text-primary focus:border-text-primary outline-none transition-colors font-light resize-none"
                      rows={3}
                      placeholder="How does this connect to your life?"
                      value={newKnowledge.reflection}
                      onChange={e => setNewKnowledge({...newKnowledge, reflection: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-4 pt-6">
                    <button type="button" onClick={() => setShowAddKnowledge(false)} className="px-6 py-3 rounded-button border border-transparent text-text-secondary hover:text-text-primary hover:bg-midnight-surface/50 transition-colors font-sans text-sm tracking-wide">Cancel</button>
                    <button type="submit" className="px-8 py-3 rounded-button bg-text-primary text-midnight-bg transition-transform hover:scale-105 active:scale-95 font-sans text-sm tracking-wide shadow-soft">Save Insight</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </StaggerContainer>
  );
}

