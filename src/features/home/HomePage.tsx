import { useState, useEffect } from 'react';
import { Play, Plus, Sparkles, BookOpen, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TextEffect } from '@/components/ui/motion/TextEffect';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Magnetic } from '@/components/ui/motion/Magnetic';
import { AtlasNavigation } from '@/components/atlas/AtlasNavigation';
import { useStoriesStore, useMomentsStore } from '@/store';

export function HomePage() {
  const navigate = useNavigate();
  const { stories, loadStories } = useStoriesStore();
  const { moments, loadMoments } = useMomentsStore();
  const [userName, setUserName] = useState('Explorer');

  useEffect(() => {
    loadStories();
    loadMoments();
    
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

  const featuredStory = stories.find(s => s.status === 'watching') || stories[0];

  return (
    <div className="w-full min-h-screen bg-transparent pb-24">
      
      {/* Hero Banner Section */}
      <div className="relative w-full min-h-[85vh] flex items-end pt-32 pb-24 px-6 md:px-12 lg:px-16 overflow-hidden">
        {/* Hero Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Subtle gradient to ensure text remains readable against the cosmos */}
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-bg via-midnight-bg/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight-bg/40 via-transparent to-transparent w-1/2" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl">
          <StaggerContainer>
          {featuredStory ? (
            <>
              <FadeIn className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-accent-rose/20 text-accent-rose border border-accent-rose/30 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
                  Continue Watching
                </span>
                <span className="text-text-secondary text-sm font-medium tracking-wide uppercase">{featuredStory.category}</span>
              </FadeIn>
              
              <TextEffect
                preset="blur"
                per="word"
                className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-gradient-cinematic leading-none mb-6 drop-shadow-[0_0_40px_rgba(0,242,254,0.4)] tracking-tighter"
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
                {featuredStory.notes?.split('\n')[1] || `A fantastic ${featuredStory.category} tracking your cinematic journey.`}
              </TextEffect>
              
              <FadeIn delay={0.9} className="flex items-center gap-6">
                <Magnetic>
                  <button 
                    className="bg-high-contrast text-text-high-contrast hover:bg-text-secondary px-8 py-4 rounded-xl font-bold tracking-wide transition-transform hover:scale-105 active:scale-95 flex items-center gap-3 text-lg"
                    onClick={() => navigate(`/story/${featuredStory.id}`)}
                  >
                    <Play className="w-6 h-6 fill-current" />
                    Play Now
                  </button>
                </Magnetic>
                <Magnetic>
                  <button 
                    className="bg-midnight-surface/50 backdrop-blur-md text-text-primary border border-text-primary/20 hover:bg-text-primary/10 px-8 py-4 rounded-xl font-bold tracking-wide transition-colors flex items-center gap-3 text-lg"
                    onClick={() => navigate(`/library`)}
                  >
                    <Info className="w-6 h-6" />
                    More Info
                  </button>
                </Magnetic>
              </FadeIn>
            </>
          ) : (
            <>
              <TextEffect
                preset="blur"
                per="word"
                className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-gradient-cinematic leading-none mb-6 drop-shadow-[0_0_40px_rgba(0,242,254,0.4)] tracking-tighter"
                delay={0.3}
              >
                {`Welcome, ${userName}`}
              </TextEffect>
              <TextEffect
                preset="fade-in-blur"
                per="line"
                className="font-sans text-lg md:text-xl text-text-muted max-w-2xl mb-10 leading-relaxed font-light tracking-wide"
                delay={0.6}
              >
                Your cinematic journey begins here. Start tracking your favorite movies, series, and books.
              </TextEffect>
              <FadeIn delay={0.9}>
                <Magnetic>
                  <button 
                    className="bg-high-contrast text-text-high-contrast hover:bg-text-secondary px-8 py-4 rounded-xl font-bold tracking-wide transition-transform hover:scale-105 active:scale-95 flex items-center gap-3 text-lg"
                    onClick={() => navigate(`/add-story`)}
                  >
                    <Plus className="w-6 h-6" />
                    Add Your First Story
                  </button>
                </Magnetic>
              </FadeIn>
            </>
          )}
          </StaggerContainer>
        </div>
      </div>

      {/* Swimlane Rows */}
      <div className="space-y-20 relative z-20 mt-[-5vh]">
        
        {/* Your List Row */}
        <section className="px-6 md:px-12 lg:px-16">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-sans text-2xl font-bold text-text-primary tracking-wide">My List</h2>
            <button 
              className="text-sm font-sans font-bold tracking-widest uppercase text-accent-cyan hover:text-text-primary transition-colors" 
              onClick={() => navigate('/library')}
            >
              View All
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory">
            {stories.length > 0 ? (
              stories.slice(0, 10).map((item, index) => (
                <motion.div 
                  key={item.id} 
                  layoutId={`story-card-${item.id}`}
                  initial={{ rotateY: 15, opacity: 0, scale: 0.9 }}
                  whileInView={{ rotateY: 0, opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ scale: 1.05, rotateY: -2, zIndex: 40, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  className="flex-none w-[280px] aspect-[16/9] bg-midnight-surface rounded-xl overflow-hidden cursor-pointer group snap-start relative shadow-card transition-all duration-300 hover:shadow-glow-cyan z-10 [transform-style:preserve-3d]"
                  onClick={() => navigate(`/story/${item.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-bg via-midnight-bg/40 to-transparent z-10 opacity-90 group-hover:opacity-100 transition-opacity duration-700 [transform:translateZ(10px)]" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 [transform:translateZ(30px)]">
                    <motion.div layoutId={`story-title-${item.id}`} className="font-serif text-2xl font-bold text-text-primary leading-tight mb-2 truncate">{item.title}</motion.div>
                    <div className="flex items-center gap-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                      <span className="text-accent-cyan">{item.category}</span>
                      <span>•</span>
                      <span className="text-accent-amber">{item.rating ? `${item.rating}/10` : 'No Rating'}</span>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-midnight-bg/20 backdrop-blur-sm [transform:translateZ(50px)]">
                    <div className="bg-high-contrast text-text-high-contrast rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-500 shadow-glow">
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full h-[157px] flex items-center justify-center border border-dashed border-midnight-border rounded-xl text-text-muted">
                Your list is empty. Add some stories to see them here!
              </div>
            )}
          </div>
        </section>

        {/* Moment of the Day (Marquee style row) */}
        {moments.length > 0 && moments[0] && (
          <section className="px-6 md:px-12 lg:px-16">
            <h2 className="font-sans text-2xl font-bold text-text-primary tracking-wide mb-6">Moment of the Day</h2>
            <div className="w-full bg-gradient-to-r from-accent-primary/20 via-accent-rose/10 to-transparent rounded-2xl p-1 border border-text-primary/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-cinematic opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-xl" />
              <div className="bg-midnight-surface/80 backdrop-blur-xl rounded-xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="flex-1 text-left">
                  <Sparkles className="w-8 h-8 text-accent-primary mb-6 animate-pulse-soft" />
                  <blockquote className="font-serif text-4xl md:text-5xl text-text-primary italic leading-tight mb-6 drop-shadow-md">
                    "{moments[0].quote || moments[0].context}"
                  </blockquote>
                  <div className="font-sans text-sm text-text-secondary font-bold tracking-widest uppercase">
                    — {moments[0].character || 'You'}, <span className="text-accent-rose">{stories.find(s => s.id === moments[0]?.storyId)?.title || 'Unknown'}</span>
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
