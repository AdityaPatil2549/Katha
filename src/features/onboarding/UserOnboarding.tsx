import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Brain, Heart, Target, BookOpen, Users, Compass,
  ArrowRight, ArrowLeft, Check, X, Play, Settings, HelpCircle,
  Lightbulb, Shield, User, Zap, Star, Film, TrendingUp,
} from 'lucide-react';

const steps = [
  {
    id: 'welcome',
    num: '01',
    title: 'Welcome to Katha',
    subtitle: 'Your personal universe of stories & memories',
    icon: <Brain className="w-10 h-10 text-white" />,
    color: 'from-violet-600 to-purple-700',
    glow: 'rgba(139,92,246,0.8)',
    accent: '#8B5CF6',
    features: [
      { icon: <Lightbulb className="w-4 h-4 text-amber-400" />, label: 'Discover', desc: 'Find stories curated to your taste and mood', border: 'border-l-amber-400', glow: 'rgba(251, 191, 36, 0.2)' },
      { icon: <Brain className="w-4 h-4 text-violet-400" />, label: 'Remember', desc: 'Build a living archive of your story life', border: 'border-l-violet-400', glow: 'rgba(139, 92, 246, 0.2)' },
      { icon: <Zap className="w-4 h-4 text-emerald-400" />, label: 'Grow', desc: 'Turn entertainment into lifelong wisdom', border: 'border-l-emerald-400', glow: 'rgba(52, 211, 153, 0.2)' },
    ],
  },
  {
    id: 'profile',
    num: '02',
    title: 'Make it Yours',
    subtitle: 'A name helps us personalize your experience',
    icon: <User className="w-10 h-10 text-white" />,
    color: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6,182,212,0.8)',
    accent: '#22D3EE',
  },
  {
    id: 'atlas',
    num: '03',
    title: 'The Smriti Atlas',
    subtitle: 'Curated collections for every mood & life phase',
    icon: <Compass className="w-10 h-10 text-white" />,
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.8)',
    accent: '#10B981',
    features: [
      { icon: <BookOpen className="w-4 h-4 text-cyan-400" />, label: 'Editorial Collections', desc: 'Hand-picked stories for specific themes', border: 'border-l-cyan-400', glow: 'rgba(34, 211, 238, 0.2)' },
      { icon: <Users className="w-4 h-4 text-emerald-400" />, label: 'Life Phase Picks', desc: 'Stories matched to where you are in life', border: 'border-l-emerald-400', glow: 'rgba(16, 185, 129, 0.2)' },
      { icon: <Target className="w-4 h-4 text-amber-400" />, label: 'Decision Engine', desc: 'AI recommendations based on your needs', border: 'border-l-amber-400', glow: 'rgba(251, 191, 36, 0.2)' },
    ],
  },
  {
    id: 'intelligence',
    num: '04',
    title: 'Smriti Intelligence',
    subtitle: 'Your AI companion that learns and grows with you',
    icon: <Sparkles className="w-10 h-10 text-white" />,
    color: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.8)',
    accent: '#FB7185',
    features: [
      { icon: <TrendingUp className="w-4 h-4 text-rose-400" />, label: 'Emotional Tracking', desc: 'Understand your patterns through stories', border: 'border-l-rose-400', glow: 'rgba(251, 113, 133, 0.2)' },
      { icon: <Star className="w-4 h-4 text-amber-400" />, label: 'Wisdom Dashboard', desc: 'Collect insights and life lessons', border: 'border-l-amber-400', glow: 'rgba(251, 191, 36, 0.2)' },
      { icon: <Brain className="w-4 h-4 text-violet-400" />, label: 'Smriti Engine', desc: 'Deep AI-powered personal intelligence', border: 'border-l-violet-400', glow: 'rgba(139, 92, 246, 0.2)' },
    ],
  },
  {
    id: 'start',
    num: '05',
    title: 'Quick Start',
    subtitle: 'Three steps to your first great story',
    icon: <Play className="w-10 h-10 text-white" />,
    color: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.8)',
    accent: '#F59E0B',
  },
  {
    id: 'done',
    num: '06',
    title: "You're All Set!",
    subtitle: 'Your story journey begins right now',
    icon: <Heart className="w-10 h-10 text-white" />,
    color: 'from-pink-500 to-rose-600',
    glow: 'rgba(236,72,153,0.8)',
    accent: '#EC4899',
  },
];

export function UserOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const done = localStorage.getItem('smriti-onboarding-completed');
    if (done === 'true') setIsVisible(false);
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const handleComplete = () => {
    localStorage.setItem('smriti-onboarding-completed', 'true');
    if (username.trim()) {
      localStorage.setItem('katha_username', username.trim());
      window.dispatchEvent(new Event('katha_user_updated'));
    }
    setIsVisible(false);
  };

  if (!isVisible) return <></>;

  const step = steps[currentStep];
  if (!step) return null;
  const isLast = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        style={{ background: 'rgba(4,5,12,0.85)', backdropFilter: 'blur(32px)' }}
      >
        {/* Cinematic ambient background */}
        <div
          className="absolute top-1/2 left-1/4 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none -translate-y-1/2 transition-colors duration-1000"
          style={{ background: `radial-gradient(circle, ${step.glow.replace('0.8','0.15')}, transparent 70%)` }}
        />

        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[860px] h-[90vh] max-h-[640px] flex rounded-[2rem] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(20,22,35,0.95), rgba(10,11,18,0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: `0 40px 100px -20px rgba(0,0,0,0.8), 0 0 40px ${step.glow.replace('0.8','0.15')}`,
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* ─── LEFT PANEL ─── */}
          <div className="relative w-[240px] flex-shrink-0 flex flex-col items-center justify-between py-12 px-6 overflow-hidden bg-black/40">
            {/* Left panel subtle cinematic gradient */}
            <motion.div
              key={`bg-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
              style={{
                background: `linear-gradient(160deg, ${step.glow.replace('0.8','0.2')} 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute inset-y-0 right-0 w-[1px]"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.1) 80%, transparent)' }}
            />

            {/* App logo */}
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-16 h-16 relative group flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="/icons/logo-dark.png" alt="Katha" className="w-full h-full object-contain logo-dark drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                <img src="/icons/logo-light.png" alt="Katha" className="w-full h-full object-contain logo-light drop-shadow-[0_0_15px_rgba(0,0,0,0.1)]" />
              </div>
              <span className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">Katha</span>
            </div>

            {/* Center: large step icon */}
            <div className="relative flex flex-col items-center gap-6 mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`icon-${currentStep}`}
                  initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                  className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${step.color} flex items-center justify-center relative group`}
                  style={{ 
                    boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3), 0 10px 40px ${step.glow.replace('0.8','0.4')}`,
                  }}
                >
                  <div className="absolute inset-0 rounded-[2rem] bg-white/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
                  {step.icon}
                </motion.div>
              </AnimatePresence>

              {/* Ghost step number */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`num-${currentStep}`}
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  className="text-7xl font-black tabular-nums leading-none select-none relative"
                >
                  <span 
                    className="absolute inset-0 blur-md"
                    style={{ color: step.accent, opacity: 0.3 }}
                  >
                    {step.num}
                  </span>
                  <span
                    style={{
                      WebkitTextStroke: `1.5px ${step.accent}80`,
                      color: 'transparent',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {step.num}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Vertical step dots */}
            <div className="relative flex flex-col items-center gap-3">
              {steps.map((s, i) => (
                <motion.button
                  key={s.id}
                  onClick={() => setCurrentStep(i)}
                  animate={{
                    height: i === currentStep ? 28 : 8,
                    opacity: i <= currentStep ? 1 : 0.2,
                  }}
                  className="w-1.5 rounded-full transition-colors relative"
                  style={{
                    background: i <= currentStep ? step.accent : 'rgba(255,255,255,0.4)',
                    boxShadow: i === currentStep ? `0 0 12px ${step.glow}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ─── RIGHT PANEL ─── */}
          <div className="flex-1 flex flex-col h-full min-h-0 bg-gradient-to-b from-white/[0.02] to-transparent relative">
            
            {/* Ambient top glow */}
            <motion.div 
              className="absolute top-0 inset-x-0 h-32 opacity-20 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at top, ${step.glow.replace('0.8','0.5')}, transparent 70%)` }}
            />

            {/* Top bar */}
            <div className="flex items-center justify-between px-10 pt-8 pb-2 relative z-10 flex-shrink-0">
              <div className="text-white/30 text-xs font-semibold tracking-widest uppercase">Step {currentStep + 1} of {steps.length}</div>
              <button
                onClick={handleComplete}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gradient accent line */}
            <div className="px-10 relative z-10 flex-shrink-0">
              <motion.div
                key={`line-${currentStep}`}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`w-full h-[1px] rounded-full bg-gradient-to-r ${step.color} origin-left relative`}
              >
                <motion.div 
                  initial={{ left: 0, opacity: 1 }}
                  animate={{ left: '100%', opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute top-1/2 -translate-y-1/2 w-8 h-[2px] bg-white blur-[2px]" 
                />
              </motion.div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto px-10 py-8 relative z-10 scrollbar-hide min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="min-h-full flex flex-col"
                >
                  {/* Title */}
                  <div className="mb-8 flex-shrink-0">
                    <h2 className="font-serif italic tracking-wide text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-3 drop-shadow-md">
                      {step.title}
                    </h2>
                    <p className="text-white/50 text-sm font-medium">{step.subtitle}</p>
                  </div>

                  {/* Step-specific content */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <StepContent
                      stepId={step.id}
                      step={step}
                      username={username}
                      setUsername={setUsername}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-10 pb-8 pt-6 flex flex-shrink-0 items-center justify-between border-t border-white/5 relative z-10 bg-black/20">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    currentStep === 0
                      ? 'text-white/10 cursor-not-allowed'
                      : 'text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                {/* Skip Tour Button for Highlights (steps 2 & 3) */}
                {(currentStep === 2 || currentStep === 3) && (
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    Skip Tour
                  </button>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (isLast) handleComplete();
                  else setCurrentStep(currentStep + 1);
                }}
                className={`relative group flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-sm text-white overflow-hidden transition-all duration-300`}
                style={{ boxShadow: `0 10px 30px ${step.glow.replace('0.8','0.3')}` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${step.color} transition-transform duration-300 group-hover:scale-105`} />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />
                
                <span className="relative z-10 flex items-center gap-2">
                  {isLast ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Begin My Journey
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Step content components ──────────────────────────────────────────
function StepContent({
  stepId,
  step,
  username,
  setUsername,
}: {
  stepId: string;
  step: (typeof steps)[0];
  username: string;
  setUsername: (v: string) => void;
}) {
  if (stepId === 'profile') {
    return (
      <div className="flex flex-col items-center justify-center h-full pb-10">
        <div className="w-full max-w-sm">
          <div className="relative group">
            {/* Input Glow Effect */}
            <div 
              className="absolute -inset-0.5 rounded-3xl blur-md opacity-20 group-hover:opacity-50 transition duration-500"
              style={{ background: `linear-gradient(to right, ${step.accent}, transparent)` }}
            />
            
            <div className="relative bg-[#0d0f1a] rounded-3xl p-1.5 border border-white/10"
              style={{ boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}
            >
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  const val = e.target.value;
                  setUsername(val);
                  if (val.trim()) {
                    localStorage.setItem('katha_username', val.trim());
                    window.dispatchEvent(new Event('katha_user_updated'));
                  }
                }}
                placeholder="Your name..."
                className="w-full bg-transparent px-6 py-5 text-white text-xl font-semibold placeholder:text-white/20 focus:outline-none text-center"
                autoFocus
              />
              
              <AnimatePresence>
                {username && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: step.accent, boxShadow: `0 0 15px ${step.glow}` }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <AnimatePresence>
            {username && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 text-center text-base font-medium drop-shadow-md"
                style={{ color: step.accent }}
              >
                Nice to meet you, {username}! 👋
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <p className="text-white/30 text-xs text-center mt-auto font-medium">
          Stored only on your device · Never shared · Completely optional
        </p>
      </div>
    );
  }

  if (stepId === 'start') {
    return (
      <div className="space-y-4 flex-1">
        {[
          { num: '01', title: 'Install the Atlas', desc: 'Get your curated story collection', color: step.accent },
          { num: '02', title: 'Add Your First Story', desc: 'Log a movie, series, or book you love', color: '#22D3EE' },
          { num: '03', title: 'Explore & Discover', desc: "Let Smriti find what's next for you", color: '#8B5CF6' },
        ].map((item, i) => (
          <motion.div
            key={item.num}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
            className="flex items-center gap-6 p-5 rounded-2xl relative overflow-hidden group"
            style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.04)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span
              className="text-5xl font-black tabular-nums leading-none w-14 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
              style={{ color: item.color, textShadow: `0 0 30px ${item.color}80` }}
            >
              {item.num}
            </span>
            <div className="relative z-10">
              <h4 className="text-white font-bold text-base mb-1">{item.title}</h4>
              <p className="text-white/40 text-sm font-medium">{item.desc}</p>
            </div>
          </motion.div>
        ))}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl relative overflow-hidden" 
          style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}
        >
          <div className="absolute inset-0 bg-amber-500/10 blur-xl animate-pulse" />
          <p className="relative text-amber-400/90 text-sm text-center font-semibold tracking-wide">
            💡 Start with the Decision Engine for instant personalized picks!
          </p>
        </motion.div>
      </div>
    );
  }

  if (stepId === 'done') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center pb-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: [0, 1.2, 1], rotate: 0 }}
          transition={{ type: 'spring', delay: 0.1, duration: 1 }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
          style={{
            background: `linear-gradient(135deg, #EC4899, #FB7185)`,
            boxShadow: '0 20px 50px rgba(236,72,153,0.4), inset 0 2px 5px rgba(255,255,255,0.4)',
          }}
        >
          <div className="absolute inset-0 bg-white/20 rounded-3xl mix-blend-overlay" />
          <Sparkles className="w-12 h-12 text-white drop-shadow-md" />
        </motion.div>

        <div>
          <h3 className="text-3xl font-serif italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-3">
            {username ? `Welcome, ${username}!` : 'Welcome aboard!'}
          </h3>
          <p className="text-white/50 text-base leading-relaxed max-w-sm mx-auto font-medium">
            Your personal story universe is ready. Start adding your favorites and let Smriti do the rest.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mt-4">
          {[
            { icon: <HelpCircle className="w-5 h-5 text-cyan-400" />, t: 'Help Docs', d: 'Guides & tutorials', glow: 'rgba(34, 211, 238, 0.2)' },
            { icon: <Shield className="w-5 h-5 text-violet-400" />, t: 'Privacy First', d: 'Data stays local', glow: 'rgba(139, 92, 246, 0.2)' },
          ].map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              key={item.t}
              className="p-4 rounded-2xl text-left flex flex-col gap-2 relative overflow-hidden group"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at top left, ${item.glow}, transparent)` }} />
              <div className="mb-1 relative z-10">{item.icon}</div>
              <div className="relative z-10">
                <p className="text-white text-sm font-bold tracking-wide">{item.t}</p>
                <p className="text-white/40 text-xs font-medium">{item.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Default: feature list steps
  if (!step.features) return null;

  return (
    <div className="space-y-4 flex-1 mt-2">
      {step.features.map((feature, i) => (
        <motion.div
          key={feature.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
          className="relative group flex items-start gap-5 p-5 rounded-2xl overflow-hidden cursor-default"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Animated Hover Background */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `linear-gradient(to right, ${feature.glow}, transparent)` }}
          />
          
          {/* Active left border indicator */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${feature.border} rounded-l-2xl border-l-4 opacity-50 group-hover:opacity-100 transition-opacity`} />

          <div
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))' }}
          >
            {feature.icon}
          </div>
          <div className="relative z-10 flex-1 pt-1">
            <h4 className="text-white font-bold text-base mb-1 tracking-wide">{feature.label}</h4>
            <p className="text-white/50 text-sm leading-relaxed font-medium">{feature.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
