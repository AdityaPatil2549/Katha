import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Shield, Sparkles } from 'lucide-react';

interface OnboardingScreen {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'onboarding' | 'complete'>('splash');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const onboardingScreens: OnboardingScreen[] = [
    {
      id: 0,
      title: 'Your Stories',
      subtitle: 'Track Everything',
      description: 'Movies, anime, series, and books. Your entire entertainment universe beautifully organized in one place.',
      icon: <BookOpen className="w-8 h-8 text-white" />,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 1,
      title: 'Smriti Remembers',
      subtitle: 'Never Forget',
      description: 'Your watch history, emotional journeys, and personal ratings — preserved and analyzed forever.',
      icon: <Brain className="w-8 h-8 text-white" />,
      color: 'from-violet-500 to-purple-600'
    },
    {
      id: 2,
      title: 'Fully Yours',
      subtitle: 'Privacy First',
      description: '100% offline-first. No servers, no tracking. Your memories belong to you and only you.',
      icon: <Shield className="w-8 h-8 text-white" />,
      color: 'from-emerald-400 to-teal-500'
    }
  ];

  useEffect(() => {
    // Cinematic delay
    const timer = setTimeout(() => setIsReady(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    localStorage.setItem('katha_onboarded', 'true');
    if (onComplete) onComplete();
    else setCurrentScreen('complete');
  };

  const handleNext = () => {
    if (onboardingStep < onboardingScreens.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      handleComplete();
    }
  };

  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    if (newDirection > 0) handleNext();
    else if (onboardingStep > 0) setOnboardingStep(onboardingStep - 1);
  };

  // ─── ANIMATION VARIANTS ───
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.2, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.4 }
    }
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const slideVariants: any = {
    enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0, filter: 'blur(8px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] } },
    exit: (direction: number) => ({ x: direction < 0 ? 80 : -80, opacity: 0, filter: 'blur(8px)', transition: { duration: 0.4 } })
  };

  // ─── SPLASH SCREEN ───
  if (currentScreen === 'splash') {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#04050C]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Deep cinematic background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[100px]"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg px-6 text-center">
          
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col items-center">
            
            {/* Cinematic Logo */}
            <motion.div variants={fadeUp} className="relative mb-12">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-32 h-32 flex items-center justify-center rounded-[2rem]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-[2rem] blur-2xl" />
                <div className="relative w-full h-full p-2">
                  <img src="/icons/logo-dark.png" alt="Katha" className="w-full h-full object-contain logo-dark drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                  <img src="/icons/logo-light.png" alt="Katha" className="w-full h-full object-contain logo-light drop-shadow-[0_0_20px_rgba(0,0,0,0.2)]" />
                </div>
              </motion.div>
            </motion.div>

            {/* Typography */}
            <motion.div variants={fadeUp} className="space-y-4 mb-16">
              <h1 className="text-6xl font-bold tracking-tight text-white mb-2">Katha</h1>
              <p className="text-xs uppercase tracking-[0.4em] text-violet-400/80 font-semibold mb-6">Powered by Smriti</p>
              <p className="text-lg text-white/50 max-w-sm mx-auto font-light leading-relaxed">
                Your personal universe of stories. <br/> Remembered forever.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={fadeUp} className="w-full space-y-4 flex flex-col items-center">
              <motion.button
                onClick={() => setCurrentScreen('onboarding')}
                disabled={!isReady}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group w-full max-w-[280px] h-14 rounded-2xl flex items-center justify-center gap-3 overflow-hidden disabled:opacity-0 transition-opacity duration-1000"
              >
                <div className="absolute inset-0 bg-white text-black flex items-center justify-center gap-2 font-bold text-sm transition-transform duration-300 group-hover:scale-105">
                  Begin Journey
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-violet-500 to-cyan-500 mix-blend-overlay" />
              </motion.button>

              <button
                onClick={handleComplete}
                className="text-xs text-white/30 hover:text-white/70 transition-colors uppercase tracking-widest font-medium"
              >
                Skip Intro
              </button>
            </motion.div>

          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ─── CAROUSEL ONBOARDING ───
  const screen = onboardingScreens[onboardingStep];
  if (!screen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#04050C]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Dynamic Background matching step color */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none transition-colors duration-1000">
        <motion.div
          key={`bg-${onboardingStep}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] bg-gradient-to-br ${screen.color}`}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
        
        {/* Glassmorphic Card Container */}
        <div 
          className="w-full p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(24px)'
          }}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={onboardingStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center text-center"
            >
              {/* Icon floating */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`w-24 h-24 rounded-3xl mb-8 flex items-center justify-center bg-gradient-to-br ${screen.color} shadow-2xl relative`}
              >
                <div className="absolute inset-0 bg-white/20 rounded-3xl mix-blend-overlay" />
                {screen.icon}
              </motion.div>

              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                {screen.subtitle}
              </h2>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tight">
                {screen.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-[280px] mx-auto">
                {screen.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation & Progress */}
          <div className="mt-12 flex flex-col items-center gap-8">
            
            {/* Dots */}
            <div className="flex justify-center gap-2">
              {onboardingScreens.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === onboardingStep
                      ? `w-8 bg-gradient-to-r ${screen.color}`
                      : 'w-2 bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex w-full gap-3">
              <button
                onClick={() => paginate(-1)}
                className={`flex-1 h-12 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  onboardingStep === 0 
                    ? 'opacity-0 pointer-events-none' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                Back
              </button>
              
              <button
                onClick={() => paginate(1)}
                className={`flex-1 h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r ${screen.color} shadow-lg transition-transform hover:scale-105`}
              >
                {onboardingStep === onboardingScreens.length - 1 ? (
                  <>
                    <Sparkles className="w-4 h-4" /> Finish
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </motion.div>
  );
}
