import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { geminiService } from '@/services/GeminiService';
import { useStoriesStore, useMomentsStore, useSessionsStore, useKnowledgeStore } from '@/store';

interface SpotifyWrappedProps {
  onClose: () => void;
}

export function SpotifyWrapped({ onClose }: SpotifyWrappedProps) {
  const { stories } = useStoriesStore();
  const { moments } = useMomentsStore();
  const { sessions } = useSessionsStore();
  const { knowledge } = useKnowledgeStore();
  
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const userData = {
          stories: stories.map(s => ({ title: s.title, category: s.category })),
          moments: moments.map(m => m.mood),
          knowledge: knowledge.map(k => k.lesson),
          sessions: sessions.map(s => s.duration)
        };
        const result = await geminiService.synthesizeMemory(userData);
        
        if (result) {
          // Split by double newlines into distinct paragraphs
          const paragraphs = result.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
          setSlides(paragraphs);
        } else {
          setSlides([
            "Your cinematic journey is vast.",
            "But the neural engine needs more data to synthesize a full memory.",
            "Continue tracking your stories."
          ]);
        }
      } catch (error) {
        setSlides(["An error occurred while synthesizing your memory. Please try again."]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMemory();
  }, [stories, moments, knowledge, sessions]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl overflow-hidden"
      >
        {/* Animated Background Gradients & Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-r from-purple-900/40 to-indigo-600/40 blur-[120px]"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-r from-rose-900/30 to-amber-600/30 blur-[100px]"
          />
          
          {/* Floating Particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_10px_#fff]"
              initial={{ 
                left: `${Math.random() * 100}vw`, 
                top: `${Math.random() * 100}vh`,
                opacity: Math.random() * 0.5 + 0.1
              }}
              animate={{ 
                top: [`${Math.random() * 100}vh`, `${Math.random() * 100}vh`],
                opacity: [null, Math.random() * 0.8 + 0.2, Math.random() * 0.5 + 0.1]
              }}
              transition={{
                duration: Math.random() * 15 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-50 p-4 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 z-10"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-rose-500/20 flex items-center justify-center animate-pulse border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <Sparkles className="w-10 h-10 text-purple-300 drop-shadow-md" />
              </div>
              <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-purple-400 animate-spin" />
            </div>
            <p className="text-xl font-serif text-white/80 tracking-wide">Synthesizing Memory...</p>
          </motion.div>
        ) : (
          <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center">
            
            {/* Progress Bars */}
            <div className="absolute top-[-10vh] w-full flex gap-2 px-8">
              {slides.map((_, idx) => (
                <div key={idx} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: idx < currentSlide ? "100%" : idx === currentSlide ? "100%" : "0%" }}
                    transition={idx === currentSlide ? { duration: 10, ease: "linear" } : { duration: 0 }}
                    onAnimationComplete={() => {
                      if (idx === currentSlide && currentSlide < slides.length - 1) {
                        nextSlide();
                      }
                    }}
                    className="h-full bg-gradient-to-r from-purple-400 to-rose-400"
                  />
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="text-center"
              >
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-tight mb-8 drop-shadow-lg flex flex-wrap justify-center gap-x-3 md:gap-x-5 gap-y-2">
                  {(slides[currentSlide] || '').split(' ').map((word, i) => (
                    <motion.span
                      key={`${currentSlide}-${i}`}
                      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                      transition={{ 
                        duration: 0.8, 
                        delay: i * 0.12,
                        ease: [0.22, 1, 0.36, 1] 
                      }}
                      className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60 inline-block"
                    >
                      {word}
                    </motion.span>
                  ))}
                </h2>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation Controls */}
            <div className="absolute bottom-[-15vh] flex items-center justify-between w-full px-8">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-0 transition-all duration-300"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextSlide}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-rose-600 text-white font-bold tracking-widest uppercase flex items-center gap-3 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300"
              >
                {currentSlide === slides.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
