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
    glow: 'rgba(139,92,246,0.6)',
    accent: '#8B5CF6',
    features: [
      { icon: <Lightbulb className="w-4 h-4 text-amber-400" />, label: 'Discover', desc: 'Find stories curated to your taste and mood', border: 'border-l-amber-400' },
      { icon: <Brain className="w-4 h-4 text-violet-400" />, label: 'Remember', desc: 'Build a living archive of your story life', border: 'border-l-violet-400' },
      { icon: <Zap className="w-4 h-4 text-emerald-400" />, label: 'Grow', desc: 'Turn entertainment into lifelong wisdom', border: 'border-l-emerald-400' },
    ],
  },
  {
    id: 'profile',
    num: '02',
    title: 'Make it Yours',
    subtitle: 'A name helps us personalize your experience',
    icon: <User className="w-10 h-10 text-white" />,
    color: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6,182,212,0.6)',
    accent: '#22D3EE',
  },
  {
    id: 'atlas',
    num: '03',
    title: 'The Smriti Atlas',
    subtitle: 'Curated collections for every mood & life phase',
    icon: <Compass className="w-10 h-10 text-white" />,
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.6)',
    accent: '#10B981',
    features: [
      { icon: <BookOpen className="w-4 h-4 text-cyan-400" />, label: 'Editorial Collections', desc: 'Hand-picked stories for specific themes', border: 'border-l-cyan-400' },
      { icon: <Users className="w-4 h-4 text-emerald-400" />, label: 'Life Phase Picks', desc: 'Stories matched to where you are in life', border: 'border-l-emerald-400' },
      { icon: <Target className="w-4 h-4 text-amber-400" />, label: 'Decision Engine', desc: 'AI recommendations based on your needs', border: 'border-l-amber-400' },
    ],
  },
  {
    id: 'intelligence',
    num: '04',
    title: 'Smriti Intelligence',
    subtitle: 'Your AI companion that learns and grows with you',
    icon: <Sparkles className="w-10 h-10 text-white" />,
    color: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.6)',
    accent: '#FB7185',
    features: [
      { icon: <TrendingUp className="w-4 h-4 text-rose-400" />, label: 'Emotional Tracking', desc: 'Understand your patterns through stories', border: 'border-l-rose-400' },
      { icon: <Star className="w-4 h-4 text-amber-400" />, label: 'Wisdom Dashboard', desc: 'Collect insights and life lessons', border: 'border-l-amber-400' },
      { icon: <Brain className="w-4 h-4 text-violet-400" />, label: 'Smriti Engine', desc: 'Deep AI-powered personal intelligence', border: 'border-l-violet-400' },
    ],
  },
  {
    id: 'start',
    num: '05',
    title: 'Quick Start',
    subtitle: 'Three steps to your first great story',
    icon: <Play className="w-10 h-10 text-white" />,
    color: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.6)',
    accent: '#F59E0B',
  },
  {
    id: 'done',
    num: '06',
    title: "You're All Set!",
    subtitle: 'Your story journey begins right now',
    icon: <Heart className="w-10 h-10 text-white" />,
    color: 'from-pink-500 to-rose-600',
    glow: 'rgba(236,72,153,0.6)',
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
  const isLast = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(4,5,12,0.92)', backdropFilter: 'blur(24px)' }}
      >
        {/* Ambient orbs */}
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: `radial-gradient(circle, ${step.glow}, transparent 70%)` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4), transparent 70%)' }}
        />

        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative w-full max-w-[820px] flex rounded-3xl overflow-hidden"
          style={{
            background: '#0b0c14',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: `0 50px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)`,
          }}
        >
          {/* ─── LEFT PANEL ─── */}
          <div className="relative w-[220px] flex-shrink-0 flex flex-col items-center justify-between py-10 px-6 overflow-hidden">
            {/* Left panel gradient background */}
            <motion.div
              key={`bg-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
              style={{
                background: `linear-gradient(160deg, ${step.glow.replace('0.6','0.15')} 0%, transparent 60%)`,
              }}
            />
            <div
              className="absolute inset-0 border-r"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            />

            {/* App logo */}
            <div className="relative flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
              >
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/30 text-xs font-bold tracking-[0.2em] uppercase">Katha</span>
            </div>

            {/* Center: large step icon */}
            <div className="relative flex flex-col items-center gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`icon-${currentStep}`}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 20 }}
                  transition={{ type: 'spring', damping: 14 }}
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center`}
                  style={{ boxShadow: `0 0 40px ${step.glow}, 0 0 80px ${step.glow.replace('0.6','0.2')}` }}
                >
                  {step.icon}
                </motion.div>
              </AnimatePresence>

              {/* Ghost step number */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`num-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-6xl font-black tabular-nums leading-none select-none"
                  style={{
                    WebkitTextStroke: `2px ${step.accent}40`,
                    color: 'transparent',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {step.num}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Vertical step dots */}
            <div className="relative flex flex-col items-center gap-2">
              {steps.map((s, i) => (
                <motion.button
                  key={s.id}
                  onClick={() => setCurrentStep(i)}
                  animate={{
                    height: i === currentStep ? 24 : 6,
                    opacity: i <= currentStep ? 1 : 0.3,
                  }}
                  className="w-1.5 rounded-full transition-colors"
                  style={{
                    background: i <= currentStep ? step.accent : 'rgba(255,255,255,0.2)',
                    boxShadow: i === currentStep ? `0 0 8px ${step.glow}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ─── RIGHT PANEL ─── */}
          <div className="flex-1 flex flex-col min-h-[560px]">
            {/* Top bar */}
            <div className="flex items-center justify-between px-8 pt-7 pb-0">
              <div className="text-white/20 text-xs font-mono">Step {currentStep + 1} of {steps.length}</div>
              <button
                onClick={handleComplete}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white/70 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gradient accent line */}
            <motion.div
              key={`line-${currentStep}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
              className={`mx-8 mt-4 h-0.5 rounded-full bg-gradient-to-r ${step.color} origin-left`}
            />

            {/* Content area */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="h-full flex flex-col"
                >
                  {/* Title */}
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white leading-tight mb-2">{step.title}</h2>
                    <p className="text-white/40 text-sm">{step.subtitle}</p>
                  </div>

                  {/* Step-specific content */}
                  <StepContent
                    stepId={step.id}
                    step={step}
                    username={username}
                    setUsername={setUsername}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-8 pb-7 pt-4 flex items-center justify-between border-t border-white/5">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentStep === 0
                    ? 'text-white/15 cursor-not-allowed'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (isLast) handleComplete();
                  else setCurrentStep(currentStep + 1);
                }}
                className={`flex items-center gap-2.5 px-7 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r ${step.color} transition-all duration-300`}
                style={{ boxShadow: `0 0 20px ${step.glow}, 0 4px 24px rgba(0,0,0,0.4)` }}
              >
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
      <div className="flex flex-col items-center gap-6 flex-1 justify-center">
        <div className="w-full max-w-xs">
          <div className="relative">
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-lg font-medium placeholder:text-white/20 focus:outline-none transition-all duration-300 text-center"
              style={{
                borderColor: username ? step.accent + '60' : undefined,
                boxShadow: username ? `0 0 0 3px ${step.glow.replace('0.6', '0.1')}` : undefined,
              }}
              autoFocus
            />
            {username && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: step.accent }}
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>
          {username && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-center text-sm font-medium"
              style={{ color: step.accent }}
            >
              Nice to meet you, {username}! 👋
            </motion.p>
          )}
        </div>
        <p className="text-white/25 text-xs text-center">
          Stored only on your device · Never shared · Completely optional
        </p>
      </div>
    );
  }

  if (stepId === 'start') {
    return (
      <div className="space-y-3 flex-1">
        {[
          { num: '01', title: 'Install the Atlas', desc: 'Get your curated story collection', color: step.accent },
          { num: '02', title: 'Add Your First Story', desc: 'Log a movie, series, or book you love', color: '#22D3EE' },
          { num: '03', title: 'Explore & Discover', desc: "Let Smriti find what's next for you", color: '#8B5CF6' },
        ].map((item, i) => (
          <motion.div
            key={item.num}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-5 p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span
              className="text-4xl font-black tabular-nums leading-none w-12 flex-shrink-0"
              style={{ color: item.color, textShadow: `0 0 20px ${item.color}60` }}
            >
              {item.num}
            </span>
            <div>
              <h4 className="text-white font-bold text-sm mb-0.5">{item.title}</h4>
              <p className="text-white/40 text-xs">{item.desc}</p>
            </div>
          </motion.div>
        ))}
        <div className="mt-4 p-4 rounded-2xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <p className="text-amber-300 text-xs text-center font-medium">
            💡 Start with the Decision Engine for instant personalized picks!
          </p>
        </div>
      </div>
    );
  }

  if (stepId === 'done') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, #EC4899, #FB7185)`,
            boxShadow: '0 0 40px rgba(236,72,153,0.5)',
          }}
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {username ? `Welcome, ${username}!` : 'Welcome aboard!'}
          </h3>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Your personal story universe is ready. Start adding your favorites and let Smriti do the rest.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          {[
            { icon: <HelpCircle className="w-4 h-4 text-cyan-400" />, t: 'Help Docs', d: 'Guides & tutorials' },
            { icon: <Shield className="w-4 h-4 text-violet-400" />, t: 'Privacy First', d: 'Data stays local' },
          ].map((item) => (
            <div
              key={item.t}
              className="p-3 rounded-2xl text-left"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="mb-2">{item.icon}</div>
              <p className="text-white text-xs font-bold">{item.t}</p>
              <p className="text-white/40 text-xs">{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: feature list steps
  if (!step.features) return null;

  return (
    <div className="space-y-3 flex-1">
      {step.features.map((feature, i) => (
        <motion.div
          key={feature.label}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-start gap-4 p-4 rounded-2xl border-l-2 ${feature.border}`}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderLeftWidth: 2 }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            {feature.icon}
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-1">{feature.label}</h4>
            <p className="text-white/40 text-xs leading-relaxed">{feature.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
