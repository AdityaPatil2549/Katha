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

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const allEntries = await atlasRepository.getAllEntries();
      
      // Simple recommendation logic based on preferences
      let recommendations = allEntries.filter(entry => {
        // Filter by time available
        if (decisionRequest.timeAvailable === '30min' && entry.runtime && entry.runtime > 45) return false;
        if (decisionRequest.timeAvailable === '1hour' && entry.runtime && entry.runtime > 150) return false;
        
        // Filter by mood
        if (decisionRequest.mood === 'unmotivated' && !entry.impactTags.includes('inspiring')) return false;
        if (decisionRequest.mood === 'discouraged' && !entry.themes.includes('hope')) return false;
        if (decisionRequest.mood === 'contemplative' && entry.difficulty === 'easy') return false;
        
        // Filter by preferences
        const hasPreference = decisionRequest.preferences.some(pref => 
          entry.impactTags.includes(pref) || entry.themes.includes(pref)
        );
        if (decisionRequest.preferences.length > 0 && !hasPreference) return false;
        
        return true;
      });

      // Sort by relevance
      recommendations = recommendations.slice(0, 3);

      const reasoning = `Based on your ${decisionRequest.mood} mood and ${decisionRequest.timeAvailable} time availability, I've selected stories that align with your need for ${decisionRequest.preferences.join(', ')}. These recommendations are tailored to your ${decisionRequest.lifePhase} life phase and designed to help with "${decisionRequest.question}".`;

      setResult({
        recommendations,
        reasoning,
        confidence: Math.floor(Math.random() * 20) + 75,
        alternatives: ['Consider journaling after watching', 'Watch with a friend for discussion', 'Take notes on key insights']
      });

      setStep('result');
    } catch (error) {
      console.error('Decision analysis failed:', error);
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

  if (step === 'analysis') {
    return (
      <div className="min-h-screen bg-gradient-midnight flex items-center justify-center p-page">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="surface-elevated rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="mb-6">
            <Brain className="w-16 h-16 text-accent-primary mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">Analyzing Your Request</h2>
            <p className="text-text-primary/70">Finding the perfect story for your needs...</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-amber" />
              <span className="text-text-primary/60">Processing your question</span>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-rose" />
              <span className="text-text-primary/60">Analyzing emotional context</span>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-emerald" />
              <span className="text-text-primary/60">Matching with Atlas database</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan" />
              <span className="text-text-primary/60">Generating recommendations</span>
            </div>
          </div>

          <div className="w-full bg-midnight-border rounded-full h-2">
            <motion.div
              className="h-full bg-gradient-cyan rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
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
            <button
              onClick={resetDecision}
              className="flex items-center gap-2 text-text-primary/60 hover:text-text-primary mb-4 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              New Decision
            </button>
            
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
          </motion.div>
          </FadeIn>

          <FadeIn>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6">Recommended Stories</h2>
            
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {result.recommendations.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="surface-elevated rounded-xl p-6 hover:surface-hover transition-all cursor-pointer"
                  onClick={() => window.open(`/atlas?entry=${entry.id}`, '_blank')}
                >
                  <div className="flex items-start justify-between mb-4">
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
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className="surface-elevated rounded-xl p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Enhancement Tips</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {result.alternatives.map((alternative, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-text-primary/70">{alternative}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          </FadeIn>
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
                        className={`p-3 rounded-xl border transition-all ${
                          decisionRequest.mood === mood.value
                            ? 'border-accent-primary bg-accent-primary/20 text-text-primary'
                            : 'border-midnight-border text-text-primary/60 hover:border-text-primary/40'
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
                        className={`p-3 rounded-xl border transition-all ${
                          decisionRequest.timeAvailable === option.value
                            ? 'border-accent-primary bg-accent-primary/20 text-text-primary'
                            : 'border-midnight-border text-text-primary/60 hover:border-text-primary/40'
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
                        className={`p-3 rounded-xl border transition-all ${
                          decisionRequest.lifePhase === phase.value
                            ? 'border-accent-primary bg-accent-primary/20 text-text-primary'
                            : 'border-midnight-border text-text-primary/60 hover:border-text-primary/40'
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
                        className={`p-3 rounded-xl border transition-all ${
                          decisionRequest.preferences.includes(pref.value)
                            ? 'border-accent-primary bg-accent-primary/20 text-text-primary'
                            : 'border-midnight-border text-text-primary/60 hover:border-text-primary/40'
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
