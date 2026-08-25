import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Brain, Target, Sparkles, ArrowRight, Clock, Heart, BookOpen, Film, Tv, PlayCircle, FileText, Lightbulb, Zap } from 'lucide-react';
import { atlasRepository } from '@/db/repositories/AtlasRepository';
import type { AtlasEntry } from '@/types/atlas';

interface DecisionRequest {
  question: string;
  context: string;
  mood: string;
  timeAvailable: string;
  lifePhase: string;
  preferences: string[];
}

interface DecisionResult {
  recommendations: AtlasEntry[];
  reasoning: string;
  confidence: number;
  alternatives: string[];
}

export function DecisionEngine() {
  const [step, setStep] = useState<'question' | 'context' | 'analysis' | 'result'>('question');
  const [decisionRequest, setDecisionRequest] = useState<DecisionRequest>({
    question: '',
    context: '',
    mood: '',
    timeAvailable: '',
    lifePhase: '',
    preferences: []
  });
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const moods = [
    { value: 'lost', label: 'Feeling Lost', icon: '🌫️' },
    { value: 'unmotivated', label: 'Unmotivated', icon: '🔋' },
    { value: 'discouraged', label: 'Discouraged', icon: '🌙' },
    { value: 'anxious', label: 'Anxious', icon: '⚡' },
    { value: 'contemplative', label: 'Contemplative', icon: '🤔' },
    { value: 'hopeful', label: 'Hopeful', icon: '✨' }
  ];

  const timeOptions = [
    { value: '30min', label: 'Under 30 minutes' },
    { value: '1hour', label: '1-2 hours' },
    { value: '2hours', label: '2-3 hours' },
    { value: 'evening', label: 'Full evening' }
  ];

  const lifePhases = [
    { value: 'College', label: 'College/University' },
    { value: 'Career', label: 'Career Building' },
    { value: 'Midlife', label: 'Midlife Journey' },
    { value: 'Rebuilding', label: 'Rebuilding Phase' }
  ];

  const preferences = [
    { value: 'inspiring', label: 'Inspiring' },
    { value: 'thought-provoking', label: 'Thought-provoking' },
    { value: 'emotional', label: 'Emotional' },
    { value: 'entertaining', label: 'Entertaining' },
    { value: 'educational', label: 'Educational' },
    { value: 'relaxing', label: 'Relaxing' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'movie': return <Film className="w-4 h-4" />;
      case 'series': return <Tv className="w-4 h-4" />;
      case 'anime': return <PlayCircle className="w-4 h-4" />;
      case 'documentary': return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald';
      case 'medium': return 'text-amber';
      case 'heavy': return 'text-rose';
      default: return 'text-text-primary/60';
    }
  };

  const analyzeDecision = async () => {
    setIsAnalyzing(true);
    setStep('analysis');

    try {
      const allEntries = await atlasRepository.getAllEntries();
      
      // Phase 1: Weighted Scoring
      const scoredEntries = allEntries.map(entry => {
        let score = 0;
        let isDisqualified = false;
        
        // 1. Hard Time Filter (Missing data is treated as unsafe if strict time requested)
        if (decisionRequest.timeAvailable === '30min') {
           if (!entry.runtime || entry.runtime > 45) isDisqualified = true;
        } else if (decisionRequest.timeAvailable === '1hour') {
           if (!entry.runtime || entry.runtime > 150) isDisqualified = true;
        }

        if (isDisqualified) return { entry, score: -1 };

        // 2. Mood Weighting (+10 to +20 pts)
        const moodMappings: Record<string, { tags: string[], themes: string[] }> = {
          'lost': { tags: ['inspiring', 'thought-provoking'], themes: ['purpose', 'discovery'] },
          'unmotivated': { tags: ['inspiring', 'energetic'], themes: ['triumph', 'ambition'] },
          'discouraged': { tags: ['uplifting', 'emotional'], themes: ['hope', 'resilience'] },
          'anxious': { tags: ['relaxing', 'calming', 'comforting'], themes: ['peace', 'acceptance'] },
          'contemplative': { tags: ['thought-provoking', 'educational'], themes: ['philosophy', 'existential'] },
          'hopeful': { tags: ['inspiring', 'beautiful'], themes: ['love', 'future'] }
        };

        const moodMapping = moodMappings[decisionRequest.mood];
        if (moodMapping) {
          moodMapping.tags.forEach(tag => {
            if (entry.impactTags.some(t => t.toLowerCase().includes(tag.toLowerCase()))) score += 10;
          });
          moodMapping.themes.forEach(theme => {
            if (entry.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))) score += 10;
          });
        }

        // 3. Life Phase Weighting (+10 pts)
        const phaseMappings: Record<string, string[]> = {
          'College': ['coming-of-age', 'identity', 'discovery'],
          'Career': ['ambition', 'struggle', 'success', 'ethics'],
          'Midlife': ['family', 'reflection', 'legacy'],
          'Rebuilding': ['resilience', 'healing', 'new beginnings']
        };
        
        const phaseMapping = phaseMappings[decisionRequest.lifePhase];
        if (phaseMapping) {
          phaseMapping.forEach(theme => {
            if (entry.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))) score += 10;
          });
        }

        // 4. Preference Stacking (+5 pts per match)
        decisionRequest.preferences.forEach(pref => {
          if (entry.impactTags.some(t => t.toLowerCase().includes(pref.toLowerCase()))) score += 5;
          if (entry.themes.some(t => t.toLowerCase().includes(pref.toLowerCase()))) score += 5;
        });

        // 5. Difficulty Bonus (+5 pts)
        if (decisionRequest.mood === 'unmotivated' && entry.difficulty === 'easy') score += 5;
        if (decisionRequest.mood === 'contemplative' && entry.difficulty === 'heavy') score += 5;

        return { entry, score };
      });

      // Filter out disqualified and sort by score descending
      const validEntries = scoredEntries.filter(e => e.score >= 0);
      validEntries.sort((a, b) => b.score - a.score);
      
      const recommendations = validEntries.slice(0, 3).map(e => e.entry);
      
      // Calculate real confidence
      const topScore = validEntries[0]?.score ?? 0;
      // Cap max theoretical score at roughly 45 for percentage calculation to ensure reasonable spread
      const calculatedConfidence = recommendations.length > 0 ? Math.min(99, Math.max(65, Math.floor(65 + (topScore / 45) * 34))) : 0;

      // Human-readable time mapping for offline reasoning
      const timeLabels: Record<string, string> = {
        '30min': 'under 30 minutes',
        '1hour': '1-2 hours',
        '2hours': '2-3 hours',
        'evening': 'a full evening'
      };

      const timeLabel = timeLabels[decisionRequest.timeAvailable] || decisionRequest.timeAvailable;
      const prefLabel = decisionRequest.preferences.length > 0 
        ? `your need for ${decisionRequest.preferences.join(', ')}`
        : `your current situation`;

      let reasoning = `Based on your ${decisionRequest.mood} mood and having ${timeLabel} available, these stories are mathematically selected to best align with ${prefLabel}.`;
      let alternatives = ['Journal after watching', 'Discuss with a friend', 'Take notes on key insights'];

      // Phase 3: Fault-Tolerant AI
      if (navigator.onLine && recommendations.length > 0) {
        try {
          const { geminiService } = await import('@/services/GeminiService');
          const aiResult = await geminiService.generateReasoning({
            request: decisionRequest,
            titles: recommendations.map(r => r.title)
          });
          
          if (aiResult) {
            reasoning = aiResult.reasoning;
            alternatives = aiResult.alternatives;
          }
        } catch (aiError) {
          console.warn('AI Reasoning failed, falling back to offline heuristic reasoning:', aiError);
          // Gracefully continue with offline reasoning instead of throwing
        }
      }

      setResult({
        recommendations,
        reasoning,
        confidence: calculatedConfidence,
        alternatives
      });

      setStep('result');
    } catch (error) {
      console.error('Decision analysis failed:', error);
      // Fallback in case of total crash
      setStep('question');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetDecision = () => {
    setStep('question');
    setDecisionRequest({
      question: '',
      context: '',
      mood: '',
      timeAvailable: '',
      lifePhase: '',
      preferences: []
    });
    setResult(null);
  };

  const editDecision = () => {
    setStep('context');
  };

  if (step === 'analysis') {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-page">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="glass-card shadow-glass rounded-3xl p-10 max-w-lg w-full text-center border border-accent-primary/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-purple-600/5" />
          <div className="relative z-10 mb-8">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-accent-primary/20 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                <Brain className="w-10 h-10 text-accent-primary" />
              </div>
              <div className="absolute inset-0 border-t-2 border-r-2 border-accent-primary rounded-full animate-spin" style={{ animationDuration: '2s' }} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Neural Engine Synthesizing</h2>
            <p className="text-text-secondary">Extracting intelligence from the Atlas...</p>
          </div>

          <div className="relative z-10 space-y-4 mb-8">
            <div className="flex items-center gap-4">
              <Lightbulb className="w-5 h-5 text-amber animate-pulse" />
              <div className="h-4 bg-white/10 rounded-full animate-pulse w-3/4"></div>
            </div>
            <div className="flex items-center gap-4">
              <Heart className="w-5 h-5 text-rose animate-pulse" style={{ animationDelay: '200ms' }} />
              <div className="h-4 bg-white/10 rounded-full animate-pulse w-2/3" style={{ animationDelay: '200ms' }}></div>
            </div>
            <div className="flex items-center gap-4">
              <Target className="w-5 h-5 text-emerald animate-pulse" style={{ animationDelay: '400ms' }} />
              <div className="h-4 bg-white/10 rounded-full animate-pulse w-5/6" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>

          <div className="relative z-10 w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-primary to-purple-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-gradient-midnight p-page">
        <div className="max-w-4xl mx-auto">
          <StaggerContainer>
          <FadeIn>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={editDecision}
                className="flex items-center gap-2 text-text-primary/60 hover:text-text-primary transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Refine Search
              </button>
              <button
                onClick={resetDecision}
                className="text-sm text-text-primary/40 hover:text-rose transition-colors"
              >
                Start Over
              </button>
            </div>
            
            {result.recommendations.length > 0 ? (
              <div className="surface-elevated rounded-2xl p-8 border-l-4 border-accent-primary">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-gradient-violet/20 rounded-xl">
                    <Brain className="w-8 h-8 text-accent-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Your Personal Recommendation</h1>
                    <p className="text-lg text-accent-primary">Confidence: {result.confidence}%</p>
                  </div>
                </div>
                
                <div className="bg-midnight-surface rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Why These Stories?</h3>
                  <p className="text-text-primary/80">{result.reasoning}</p>
                </div>
              </div>
            ) : (
              <div className="surface-elevated rounded-2xl p-12 text-center border-2 border-dashed border-midnight-border">
                <Brain className="w-16 h-16 text-text-primary/40 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-text-primary mb-4">No Perfect Matches Found</h1>
                <p className="text-lg text-text-primary/70 mb-8 max-w-lg mx-auto">
                  Your constraints might be a bit too strict for our library right now. Try relaxing your time limits or selecting fewer preferences.
                </p>
                <button
                  onClick={editDecision}
                  className="bg-accent-primary text-text-primary px-8 py-3 rounded-lg font-medium hover:bg-accent-secondary transition-colors"
                >
                  Adjust Preferences
                </button>
              </div>
            )}
          </motion.div>
          </FadeIn>

          {result.recommendations.length > 0 && (
            <>
              <FadeIn>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-text-primary mb-6">Recommended Stories</h2>
            
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {result.recommendations.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut', delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`surface-elevated rounded-xl p-6 hover:surface-hover transition-all cursor-pointer relative overflow-hidden group ${
                    index === 0 ? 'ring-2 ring-accent-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]' : ''
                  }`}
                  onClick={() => window.open(`/atlas?entry=${entry.id}`, '_blank')}
                >
                  {index === 0 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(entry.category)}
                      <span className="text-sm text-text-primary/60 capitalize">{entry.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getDifficultyColor(entry.difficulty)}`}>
                        {entry.difficulty}
                      </span>
                      <span className="text-sm text-text-primary/60">{entry.year}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-text-primary mb-2">{entry.title}</h3>
                  <p className="text-text-primary/70 text-sm mb-4 line-clamp-3">{entry.description}</p>

                  <div className="bg-gradient-cyan/10 rounded-lg p-3 mb-4">
                    <p className="text-xs text-accent-primary mb-1">Perfect for you because:</p>
                    <p className="text-xs text-text-primary/80 line-clamp-2">{entry.whyWatch}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.impactTags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-xs bg-accent-primary/20 text-accent-primary px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-primary/60">
                    <div className="flex items-center gap-4">
                      {entry.runtime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{entry.runtime}m</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>Top match</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          </FadeIn>

          <FadeIn>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut', delay: 0.4 }}
            className="mt-8"
          >
            <div className="surface-elevated rounded-xl p-8 border border-white/5 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-amber/5 rounded-full blur-[40px] pointer-events-none" />
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber" />
                Enhancement Tips
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {result.alternatives.map((alternative, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-black/20 rounded-lg border border-white/5 hover:border-amber/20 transition-colors">
                    <span className="text-sm font-medium text-text-primary/90 leading-relaxed">{alternative}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          </FadeIn>
          </>
          )}
          </StaggerContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-midnight p-page">
      <div className="max-w-4xl mx-auto">
        <StaggerContainer>
        {/* Header */}
        <BlurReveal>
        <div className="text-center mb-12">
          <h1 className="heading-1 text-primary mb-4">Decision Engine</h1>
          <p className="text-h3 text-secondary max-w-3xl mx-auto">
            What should I watch tonight? Let Smriti Atlas analyze your needs and recommend the perfect story for your current situation.
          </p>
        </div>
        </BlurReveal>

        <FadeIn>
        <AnimatePresence mode="wait">
          {step === 'question' && (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="surface-elevated rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">What's on your mind?</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary/80 mb-2">What decision are you trying to make?</label>
                  <input
                    type="text"
                    placeholder="e.g., What should I watch tonight?"
                    value={decisionRequest.question}
                    onChange={(e) => setDecisionRequest({...decisionRequest, question: e.target.value})}
                    className="w-full px-4 py-3 surface-elevated rounded-xl text-text-primary placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary/80 mb-2">Provide some context (optional)</label>
                  <textarea
                    placeholder="e.g., I'm feeling unmotivated after work and have about 2 hours..."
                    value={decisionRequest.context}
                    onChange={(e) => setDecisionRequest({...decisionRequest, context: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 surface-elevated rounded-xl text-text-primary placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
                  />
                </div>

                <button
                  onClick={() => setStep('context')}
                  disabled={!decisionRequest.question}
                  className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {step === 'context' && (
            <motion.div
              key="context"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="surface-elevated rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">Tell me more about your situation</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary/80 mb-3">How are you feeling right now?</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {moods.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setDecisionRequest({...decisionRequest, mood: mood.value})}
                        className={`p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                          decisionRequest.mood === mood.value
                            ? 'border-accent-primary bg-accent-primary/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                            : 'border-midnight-border text-text-primary/60 hover:border-text-primary/40 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-2xl mb-1">{mood.icon}</div>
                        <div className="text-sm">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary/80 mb-3">How much time do you have?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {timeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDecisionRequest({...decisionRequest, timeAvailable: option.value})}
                        className={`p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                          decisionRequest.timeAvailable === option.value
                            ? 'border-accent-primary bg-accent-primary/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                            : 'border-midnight-border text-text-primary/60 hover:border-text-primary/40 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-sm">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary/80 mb-3">What's your current life phase?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {lifePhases.map((phase) => (
                      <button
                        key={phase.value}
                        onClick={() => setDecisionRequest({...decisionRequest, lifePhase: phase.value})}
                        className={`p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                          decisionRequest.lifePhase === phase.value
                            ? 'border-accent-primary bg-accent-primary/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                            : 'border-midnight-border text-text-primary/60 hover:border-text-primary/40 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-sm">{phase.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary/80 mb-3">What are you looking for in a story?</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {preferences.map((pref) => (
                      <button
                        key={pref.value}
                        onClick={() => {
                          const newPrefs = decisionRequest.preferences.includes(pref.value)
                            ? decisionRequest.preferences.filter(p => p !== pref.value)
                            : [...decisionRequest.preferences, pref.value];
                          setDecisionRequest({...decisionRequest, preferences: newPrefs});
                        }}
                        className={`p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                          decisionRequest.preferences.includes(pref.value)
                            ? 'border-accent-primary bg-accent-primary/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                            : 'border-midnight-border text-text-primary/60 hover:border-text-primary/40 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-sm">{pref.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('question')}
                    className="btn btn-secondary flex-1"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={analyzeDecision}
                    disabled={!decisionRequest.mood || !decisionRequest.timeAvailable}
                    className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Get Recommendations →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </FadeIn>
        </StaggerContainer>
      </div>
    </div>
  );
}
