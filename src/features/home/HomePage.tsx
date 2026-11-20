import { useState, useEffect } from 'react';
import { Plus, Sparkles, BookOpen, Info, Calendar, Book, Send, Flame, Compass, Users, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TextEffect } from '@/components/ui/motion/TextEffect';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Magnetic } from '@/components/ui/motion/Magnetic';
import { Tilt } from '@/components/ui/motion/Tilt';
import { GlowEffect } from '@/components/ui/motion/GlowEffect';
import { TextShimmer } from '@/components/ui/motion/TextShimmer';
import { AtlasNavigation } from '@/components/atlas/AtlasNavigation';
import { useStoriesStore, useMomentsStore } from '@/store';
import { personalRepository } from '@/db/repositories/PersonalRepository';
import { useToastStore } from '@/store/toastStore';

export function HomePage() {
  const navigate = useNavigate();
  const { stories, loadStories, loading } = useStoriesStore();
  const { moments, loadMoments } = useMomentsStore();
  const [userName, setUserName] = useState('Explorer');
  const [quickReflection, setQuickReflection] = useState('');
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [journalCount, setJournalCount] = useState(0);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    loadStories();
    loadMoments();
    personalRepository.getAllJournalEntries().then(entries => {
      setJournalCount(entries.length);
    }).catch(() => {});
    
    const updateName = () => {
      const storedName = localStorage.getItem('katha_username');
      if (storedName) {
        setUserName(storedName);
      }
    };
    
    updateName();
    window.addEventListener('katha_user_updated', updateName);
    return () => window.removeEventListener('katha_user_updated', updateName);
  }, [loadStories, loadMoments]);

  const handleSaveQuickReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReflection.trim()) return;
    setIsSavingReflection(true);
    try {
      await personalRepository.addJournalEntry(quickReflection.trim(), ['Quick Reflection', 'Home']);
      setQuickReflection('');
      setJournalCount(prev => prev + 1);
      addToast({ type: 'success', message: 'Reflection recorded in your Journal vault.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to record reflection.' });
    } finally {
      setIsSavingReflection(false);
    }
  };

  const featuredStory = stories.find(s => s.status === 'watching') || stories[0];

  return (
    <div className="w-full min-h-screen bg-transparent pb-32 md:pb-24">
      
      {/* Hero Banner Section */}
      <div className="relative w-full min-h-[85vh] flex items-end pt-32 pb-24 px-6 md:px-12 lg:px-16 overflow-hidden">
        {/* Hero Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Subtle gradient to ensure text remains readable against the cosmos */}
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-bg via-midnight-bg/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight-bg/40 via-transparent to-transparent w-1/2" />
        </div>

        {/* Hero Content */}
        <div className={`relative z-10 ${featuredStory ? 'max-w-4xl' : 'w-full max-w-6xl mx-auto flex flex-col items-center justify-center'}`}>
          <StaggerContainer>
          {featuredStory ? (
            <>
              <FadeIn className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-accent-rose/20 text-accent-rose border border-accent-rose/30 rounded-full text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                  Continue Watching
                </span>
                <span className="text-text-secondary text-sm font-medium tracking-wide uppercase">{featuredStory.category}</span>
              </FadeIn>
              
              <TextEffect
                preset="blur"
                per="word"
                className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gradient-cinematic leading-none mb-6 drop-shadow-[0_0_40px_rgba(0,242,254,0.25)] tracking-tighter"
                delay={0.3}
              >
                {featuredStory.title}
              </TextEffect>
              
              <TextEffect
                preset="fade-in-blur"
                per="line"
                className="font-sans text-lg md:text-xl text-text-muted max-w-2xl mb-10 leading-relaxed font-light"
                delay={0.2}
              >
                {featuredStory.notes
                  ?.split('\n')
                  .map((line) => line.replace(/\[.*?\]/g, '').trim())
                  .find((line) => line.length > 0) ||
                  `A curated ${featuredStory.category} in your personal story archive.`}
              </TextEffect>
              
              <FadeIn delay={0.9} className="flex flex-wrap items-center gap-4 sm:gap-6">
                <Magnetic>
                  <div className="relative">
                    <GlowEffect
                      colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
                      mode="colorShift"
                      blur="soft"
                      duration={3}
                      scale={1.1}
                    />
                    <button 
                      className="bg-high-contrast text-text-high-contrast hover:opacity-90 px-8 py-4 rounded-xl font-bold tracking-wide transition-transform hover:scale-105 active:scale-95 flex items-center gap-3 text-lg relative z-10"
                      onClick={() => navigate(`/story/${featuredStory.id}`)}
                    >
                      <BookOpen className="w-5 h-5" />
                      Open Story
                    </button>
                  </div>
                </Magnetic>
                <Magnetic>
                  <button 
                    className="bg-midnight-surface/60 backdrop-blur-md text-text-primary border border-midnight-border hover:bg-midnight-surface-hover px-8 py-4 rounded-xl font-bold tracking-wide transition-colors flex items-center gap-3 text-lg"
                    onClick={() => navigate(`/library`)}
                  >
                    <Info className="w-5 h-5" />
                    My Library
                  </button>
                </Magnetic>
              </FadeIn>
            </>
          ) : (
            <div className="flex flex-col items-center text-center mt-12 mb-8">
              <FadeIn className="mb-10">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-midnight-surface/60 border border-accent-cyan/30 backdrop-blur-xl shadow-glow-cyan">
                  <Sparkles className="w-4 h-4 text-accent-cyan animate-pulse" />
                  <span className="text-xs font-sans font-bold tracking-[0.2em] text-accent-cyan uppercase">Your Journey Begins</span>
                </div>
              </FadeIn>
              
              <TextEffect
                preset="blur"
                per="word"
                className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-8xl xl:text-9xl font-bold text-text-primary leading-none mb-8 tracking-tighter drop-shadow-2xl"
                delay={0.3}
              >
                {`Welcome, ${userName}`}
              </TextEffect>
              
              <TextEffect
                preset="fade-in-blur"
                per="line"
                className="font-sans text-lg sm:text-xl md:text-2xl text-text-muted max-w-3xl mb-14 leading-relaxed font-light tracking-wide mx-auto"
                delay={0.6}
              >
                The canvas is blank. Start curating your personal universe by adding your favorite movies, series, games, and books.
              </TextEffect>
              
              <FadeIn delay={0.9} className="flex flex-col sm:flex-row items-center gap-6">
                <Magnetic>
                  <div className="relative">
                    <GlowEffect
                      colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
                      mode="colorShift"
                      blur="soft"
                      duration={3}
                      scale={1.1}
                    />
                    <button 
                      className="bg-sky-700 hover:bg-sky-600 text-white px-10 py-5 rounded-[2rem] font-bold tracking-wide transition-all hover:scale-105 hover:shadow-glow-cyan active:scale-95 flex items-center gap-3 text-lg relative overflow-hidden group z-10"
                      onClick={() => navigate(`/add-story`)}
                    >
                      <Plus className="w-6 h-6 relative z-10" />
                      <span className="relative z-10">Add Your First Story</span>
                    </button>
                  </div>
                </Magnetic>
              </FadeIn>
            </div>
          )}
          </StaggerContainer>
        </div>
      </div>

      {/* Swimlane Rows */}
      <div className="space-y-16 relative z-20 mt-4">
        
        {/* Habit & Reflection Section */}
        <section className="px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Reflection Card */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-midnight-border shadow-card relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-accent-primary" />
                  <h3 className="font-sans text-base font-bold text-text-primary">Daily Reflection</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/journal')}
                  className="min-h-[44px] px-3.5 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/25 hover:bg-accent-primary/20 text-xs font-bold uppercase tracking-wider text-accent-primary transition-all duration-300 flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                  aria-label="Open Full Journal"
                >
                  <span>Open Full Journal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-text-secondary mb-3">Capture a lingering thought, dialogue revelation, or perspective shift from what you experienced today.</p>
              <form onSubmit={handleSaveQuickReflection} className="flex gap-2">
                <input
                  type="text"
                  value={quickReflection}
                  onChange={(e) => setQuickReflection(e.target.value)}
                  placeholder="What idea changed you today? (e.g. 'I have no enemies...')"
                  className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-midnight-bg/60 border border-midnight-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSavingReflection || !quickReflection.trim()}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-accent-primary text-high-contrast font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Record</span>
                </button>
              </form>
            </div>

            {/* Habit & Streak Dock */}
            <div className="glass-card p-6 rounded-2xl border border-midnight-border shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-accent-amber animate-pulse" />
                  <h3 className="font-sans text-base font-bold text-text-primary">Vault Milestones</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/calendar')}
                  className="min-h-[44px] px-3.5 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/25 hover:bg-accent-primary/20 text-xs font-bold uppercase tracking-wider text-accent-primary transition-all duration-300 flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                  aria-label="View Activity Calendar"
                >
                  <span>Calendar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 py-2 text-center">
                <div className="p-2.5 rounded-xl bg-midnight-surface/60 border border-midnight-border/50">
                  <div className="font-serif text-2xl font-bold text-text-primary">{stories.length}</div>
                  <div className="text-xs text-text-muted uppercase font-semibold tracking-wider">Stories</div>
                </div>
                <div className="p-2.5 rounded-xl bg-midnight-surface/60 border border-midnight-border/50">
                  <div className="font-serif text-2xl font-bold text-text-primary">{moments.length}</div>
                  <div className="text-xs text-text-muted uppercase font-semibold tracking-wider">Moments</div>
                </div>
                <div className="p-2.5 rounded-xl bg-midnight-surface/60 border border-midnight-border/50">
                  <div className="font-serif text-2xl font-bold text-text-primary">{journalCount}</div>
                  <div className="text-xs text-text-muted uppercase font-semibold tracking-wider">Reflections</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-text-secondary border-t border-midnight-border/40 mt-2">
                <span>Current Watch Streak</span>
                <span className="font-bold text-accent-amber flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{stories.length > 0 ? 'Active' : 'Start Today'}</span>
                </span>
              </div>
            </div>

          </div>
        </section>
        
        {/* Your List Row */}
        <section className="px-6 md:px-12 lg:px-16">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-sans text-2xl font-bold text-text-primary tracking-wide">My List</h2>
            <button 
              type="button"
              className="min-h-[44px] px-3.5 py-2 inline-flex items-center rounded-lg text-sm font-sans font-bold tracking-widest uppercase text-accent-gold hover:text-text-primary hover:bg-white/5 transition-colors" 
              onClick={() => navigate('/library')}
            >
              View All
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory">
            {loading ? (
              <div className="w-full h-[157px] flex items-center justify-center border border-dashed border-midnight-border/50 rounded-xl">
                <TextShimmer className="text-text-muted font-sans font-medium tracking-wide" duration={1.5}>
                  Loading your stories...
                </TextShimmer>
              </div>
            ) : stories.length > 0 ? (
              stories.slice(0, 10).map((item, index) => (
                <motion.div 
                  key={item.id} 
                  layoutId={`story-card-${item.id}`}
                  initial={{ rotateY: 15, opacity: 0, scale: 0.9 }}
                  whileInView={{ rotateY: 0, opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ scale: 1.05, rotateY: -2, zIndex: 40, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  className="flex-none w-[280px] aspect-[16/9] bg-midnight-surface border border-midnight-border rounded-xl overflow-hidden cursor-pointer group snap-start relative shadow-card transition-all duration-300 hover:shadow-glow-gold z-10 [transform-style:preserve-3d]"
                  onClick={() => navigate(`/story/${item.id}`)}
                >
                  <Tilt rotationFactor={8} isRevese>
                    {item.posterUrl && (
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-bg via-midnight-bg/55 to-transparent z-10 opacity-95 group-hover:opacity-100 transition-opacity duration-700 [transform:translateZ(10px)]" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 [transform:translateZ(30px)]">
                      <motion.div layoutId={`story-title-${item.id}`} className="font-serif text-2xl font-bold text-text-primary leading-tight mb-2 truncate">{item.title}</motion.div>
                      <div className="flex items-center gap-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                        <span className="text-accent-gold">{item.category}</span>
                        <span>•</span>
                        <span className="text-accent-amber">{item.rating ? `${item.rating}/10` : 'No Rating'}</span>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-midnight-bg/25 backdrop-blur-sm [transform:translateZ(50px)]">
                      <div className="bg-high-contrast text-text-high-contrast rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-500 shadow-glow">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </div>
                  </Tilt>
                </motion.div>
              ))
            ) : (
              <div className="w-full rounded-2xl p-8 border border-accent-gold/25 bg-gradient-to-br from-midnight-surface/90 via-midnight-surface/50 to-midnight-bg/90 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-card">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Begin Your Odyssey</span>
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-text-primary">Your Narrative Vault is Waiting</h3>
                  <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
                    Seed your library with 50+ curated philosophical masterpieces, life-crisis narratives, and timeless classics, or log your first personal story.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate('/explore?tab=atlas')}
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-accent-gold text-midnight-bg font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all duration-300 shadow-glow-gold flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Install Masterpieces</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/add-story')}
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-midnight-surface/80 border border-midnight-border hover:border-accent-gold/50 text-text-primary font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Story</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Moment of the Day (Marquee style row) */}
        {moments.length > 0 && moments[0] && (
          <section className="px-6 md:px-12 lg:px-16">
            <h2 className="font-sans text-2xl font-bold text-text-primary tracking-wide mb-6">Moment of the Day</h2>
            <div className="w-full bg-gradient-to-r from-accent-gold/20 via-accent-gold/5 to-transparent rounded-2xl p-1 border border-text-primary/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-xl" />
              <div className="bg-midnight-surface/80 backdrop-blur-xl rounded-xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="flex-1 text-left">
                  <Sparkles className="w-8 h-8 text-accent-gold mb-6 animate-pulse-soft" />
                  <blockquote className="font-serif text-4xl md:text-5xl text-text-primary italic leading-tight mb-6 drop-shadow-md">
                    "{moments[0].quote || moments[0].context}"
                  </blockquote>
                  <div className="font-sans text-sm text-text-secondary font-bold tracking-widest uppercase">
                    — {moments[0].character || 'You'}, <span className="text-accent-gold">{stories.find(s => s.id === moments[0]?.storyId)?.title || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Atlas Section Row */}
        <section className="px-6 md:px-12 lg:px-16 pt-10">
          <h2 className="font-sans text-2xl font-bold text-text-primary tracking-wide mb-6">Explore the Atlas</h2>
          <AtlasNavigation />
        </section>

      </div>
    </div>
  );
}

export default HomePage;
