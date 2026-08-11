import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Shield, ChevronRight } from 'lucide-react';

interface OnboardingScreen {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
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
      description: 'Track movies, anime, series, documentaries, and more. Your personal library awaits.',
      icon: <BookOpen className="w-8 h-8" />
    },
    {
      id: 1,
      title: 'Smriti Remembers',
      subtitle: 'Never Forget',
      description: 'Your watch history, ratings, notes, and emotional journey — always remembered.',
      icon: <Brain className="w-8 h-8" />
    },
    {
      id: 2,
      title: 'Fully Yours',
      subtitle: 'Privacy First',
      description: 'Offline. Private. Secure. Your data never leaves your device.',
      icon: <Shield className="w-8 h-8" />
    }
  ];

  useEffect(() => {
    // Simulate loading time for premium feel
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnterLibrary = () => {
    localStorage.setItem('katha_onboarded', 'true');
    if (onComplete) {
      onComplete();
    } else {
      setCurrentScreen('complete');
    }
  };

  const handleSkipIntro = () => {
    localStorage.setItem('katha_onboarded', 'true');
    if (onComplete) {
      onComplete();
    } else {
      setCurrentScreen('complete');
    }
  };

  const handleNext = () => {
    if (onboardingStep < onboardingScreens.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      handleEnterLibrary();
    }
  };

  const handlePrevious = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const handleStartOnboarding = () => {
    setCurrentScreen('onboarding');
  };

  // Animation variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeIn' }
    }
  };

  const logoVariants: any = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2
      }
    }
  };

  const textVariants: any = {
    hidden: { 
      opacity: 0,
      y: 30
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6,
        ease: 'easeOut',
        delay: 0.6
      }
    }
  };

  const buttonVariants: any = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5,
        ease: 'easeOut',
        delay: 0.8
      }
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    if (newDirection > 0) {
      handleNext();
    } else {
      handlePrevious();
    }
  };

  // Splash Screen
  if (currentScreen === 'splash') {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-md mx-auto px-6">
          {/* Logo */}
          <motion.div
            className="relative"
            variants={logoVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="w-24 h-24 mx-auto relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
              
              {/* Logo Container */}
              <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-violet-500/20 flex items-center justify-center shadow-2xl">
                <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                  K
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <h1 className="text-5xl font-bold text-text-primary">
              Katha
            </h1>
            
            <p className="text-xl text-violet-300 font-light">
              Powered by Smriti
            </p>
            
            <p className="text-lg text-slate-300">
              Your personal library of stories.
            </p>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              Track every movie, series, anime, documentary, and experience.
              All your stories. Remembered forever.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <button
              onClick={handleStartOnboarding}
              disabled={!isReady}
              className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 to-pink-600 text-text-primary font-semibold rounded-xl hover:from-violet-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              Enter Your Library
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={handleSkipIntro}
              className="w-full py-3 px-6 text-slate-400 hover:text-text-primary transition-colors duration-200 text-sm"
            >
              Skip Intro
            </button>
          </motion.div>

          {/* Footer */}
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="pt-8 text-xs text-slate-500 space-y-1"
          >
            <p>Privacy-first. Fully offline.</p>
            <p>Your data stays with you.</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Onboarding Screens
  if (currentScreen === 'onboarding') {
    const screen = onboardingScreens[onboardingStep];
    
    if (!screen) return null;
    
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center relative overflow-hidden"
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={onboardingStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="text-center space-y-8"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-600 to-pink-600 rounded-2xl flex items-center justify-center text-text-primary shadow-xl"
              >
                {screen.icon}
              </motion.div>

              {/* Content */}
              <div className="space-y-4">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-text-primary"
                >
                  {screen.title}
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-violet-300 font-light"
                >
                  {screen.subtitle}
                </motion.p>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-300 leading-relaxed"
                >
                  {screen.description}
                </motion.p>
              </div>

              {/* Progress Indicators */}
              <div className="flex justify-center gap-2">
                {onboardingScreens.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === onboardingStep
                        ? 'w-8 bg-gradient-to-r from-violet-600 to-pink-600'
                        : 'w-2 bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                {onboardingStep > 0 && (
                  <button
                    onClick={() => paginate(-1)}
                    className="flex-1 py-3 px-6 text-slate-400 hover:text-text-primary transition-colors duration-200"
                  >
                    Previous
                  </button>
                )}
                
                <button
                  onClick={() => paginate(1)}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-violet-600 to-pink-600 text-text-primary font-semibold rounded-xl hover:from-violet-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-violet-500/25 flex items-center justify-center gap-2"
                >
                  {onboardingStep === onboardingScreens.length - 1 ? 'Start My Journey' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

        {/* Skip Option */}
        <button
          onClick={handleSkipIntro}
          className="absolute top-8 right-8 z-50 text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium"
        >
          Skip
        </button>
      </motion.div>
    );
  }

  // Complete - This will trigger app load
  return null;
}
