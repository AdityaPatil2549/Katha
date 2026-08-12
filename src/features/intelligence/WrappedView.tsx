import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Compass, Clock, Lightbulb, Play, Pause, ChevronRight } from 'lucide-react';

interface WrappedViewProps {
  insights: any;
  onClose: () => void;
}

export default function WrappedView({ insights, onClose }: WrappedViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const SLIDE_DURATION = 8000; // 8 seconds per slide

  const slides = [
    {
      id: 'intro',
      render: () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 1, bounce: 0.5 }}
            className="w-32 h-32 rounded-full bg-gradient-to-tr from-accent-primary to-purple-500 shadow-[0_0_50px_rgba(139,92,246,0.5)] flex items-center justify-center mb-4"
          >
            <Compass className="w-16 h-16 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 leading-tight"
          >
            Your Katha<br/>Wrapped
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-secondary max-w-sm mx-auto"
          >
            A cinematic look back at the stories that shaped you.
          </motion.p>
        </div>
      )
    },
    {
      id: 'emotional',
      render: () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-20 h-20 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
          >
            <Heart className="w-10 h-10 text-rose-400" />
          </motion.div>
          
          <div className="space-y-4">
            <motion.h2 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white"
            >
              Your dominant mood was
            </motion.h2>
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
              className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500 capitalize leading-tight pb-2"
            >
              {insights.emotionalJourney.dominantMood}
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-md mx-auto"
          >
            <p className="text-lg text-white/90">
              You showed a <span className="font-bold text-rose-400">+{insights.emotionalJourney.emotionalGrowth.growth}%</span> growth in emotional awareness, gravitating towards stories that challenged your perspectives.
            </p>
          </motion.div>
        </div>
      )
    },
    {
      id: 'taste',
      render: () => {
        const topGenre = insights.tasteEvolution.genres.reduce((prev: any, current: any) => (prev.current > current.current) ? prev : current);
        
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8">
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ type: "spring", duration: 1.5 }}
              className="w-20 h-20 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
            >
              <Compass className="w-10 h-10 text-cyan-400" />
            </motion.div>
            
            <div className="space-y-4">
              <motion.h2 
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white"
              >
                You couldn't get enough of
              </motion.h2>
              <motion.div 
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 capitalize"
              >
                {topGenre.genre}
              </motion.div>
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-md mx-auto w-full"
            >
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Sophistication Index</h3>
              <div className="h-4 bg-black/50 rounded-full border border-white/5 relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${insights.tasteEvolution.sophisticationScore}%` }}
                  transition={{ delay: 1, duration: 1.5, type: "spring" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                />
              </div>
              <div className="mt-2 text-right font-bold text-cyan-300">
                {insights.tasteEvolution.sophisticationScore}/100
              </div>
            </motion.div>
          </div>
        );
      }
    },
    {
      id: 'patterns',
      render: () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
          >
            <Clock className="w-10 h-10 text-purple-400" />
          </motion.div>
          
          <div className="space-y-4">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white"
            >
              Your prime time was
            </motion.h2>
            <motion.div 
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
              className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
            >
              {insights.lifePatterns.viewingHabits.peakTime}
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto"
          >
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-5">
              <div className="text-sm font-bold text-text-muted uppercase mb-1">Consistency</div>
              <div className="text-3xl font-bold text-white">{(insights.lifePatterns.viewingHabits.consistency * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-5">
              <div className="text-sm font-bold text-text-muted uppercase mb-1">Binge Rate</div>
              <div className="text-3xl font-bold text-white">{(insights.lifePatterns.viewingHabits.bingeTendency * 100).toFixed(0)}%</div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 'wisdom',
      render: () => {
        const topLesson = insights.wisdomExtraction.topLessons[0];
        
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            >
              <Lightbulb className="w-10 h-10 text-amber-400" />
            </motion.div>
            
            <div className="space-y-6">
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white/70"
              >
                The biggest lesson you learned:
              </motion.h2>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-5xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400 leading-tight"
              >
                "{topLesson.lesson}"
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-lg text-secondary"
              >
                From <span className="text-white font-bold">{topLesson.stories.join(', ')}</span>
              </motion.p>
            </div>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              onClick={onClose}
              className="mt-8 px-8 py-4 bg-white text-black font-bold rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
            >
              Keep Exploring
            </motion.button>
          </div>
        );
      }
    }
  ];

  useEffect(() => {
    let timer: any;
    let progressTimer: any;

    if (isPlaying && currentSlide < slides.length - 1) {
      setProgress(0);
      
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100;
          return prev + (100 / (SLIDE_DURATION / 50));
        });
      }, 50);

      timer = setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
      }, SLIDE_DURATION);
    } else if (currentSlide === slides.length - 1) {
      setProgress(100);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [currentSlide, isPlaying, slides.length]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
      setProgress(0);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setProgress(0);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col"
    >
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 w-full p-4 flex gap-2 z-50">
        {slides.map((_, idx) => (
          <div key={idx} className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-75 ease-linear"
              style={{ 
                width: idx < currentSlide ? '100%' : idx === currentSlide ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute top-8 right-6 z-50 flex items-center gap-4">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* Dynamic Background */}
        <div className="absolute inset-0 opacity-30">
          <motion.div 
            animate={{ 
              background: [
                'radial-gradient(circle at 0% 0%, #4f46e5 0%, transparent 50%)',
                'radial-gradient(circle at 100% 100%, #e11d48 0%, transparent 50%)',
                'radial-gradient(circle at 0% 100%, #0891b2 0%, transparent 50%)',
                'radial-gradient(circle at 100% 0%, #10b981 0%, transparent 50%)',
              ][currentSlide % 4]
            }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative z-10"
          >
            {slides[currentSlide]?.render()}
          </motion.div>
        </AnimatePresence>

        {/* Tap areas for navigation */}
        <div 
          className="absolute inset-y-0 left-0 w-1/3 z-40 cursor-pointer"
          onClick={prevSlide}
        />
        <div 
          className="absolute inset-y-0 right-0 w-1/3 z-40 cursor-pointer"
          onClick={nextSlide}
        />
      </div>
    </motion.div>
  );
}
