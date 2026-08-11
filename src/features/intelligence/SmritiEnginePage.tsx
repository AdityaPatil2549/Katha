import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { TextEffect } from '@/components/ui/motion/TextEffect';
import { Magnetic } from '@/components/ui/motion/Magnetic';
import { Dropdown } from '@/components/ui/Dropdown';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Heart, 
  BookOpen, 
  Calendar, 
  Settings,
  Target, 
  Lightbulb, 
  BarChart3, 
  PieChart, 
  Activity, 
  Clock, 
  Star, 
  Award, 
  Compass, 
  Eye, 
  RefreshCw,
  Download,
  Share2,
  Filter,
  Search
} from 'lucide-react';
import { useStoriesStore, useMomentsStore, useSessionsStore, useKnowledgeStore } from '@/store';

// Mock Intelligence Data - In production this would be computed from real user data
const INTELLIGENCE_INSIGHTS = {
  emotionalJourney: {
    dominantMood: 'inspired',
    moodEvolution: [
      { month: 'Jan', moods: { inspired: 45, emotional: 30, thoughtful: 25 } },
      { month: 'Feb', moods: { inspired: 52, emotional: 28, thoughtful: 20 } },
      { month: 'Mar', moods: { inspired: 48, emotional: 35, thoughtful: 17 } },
      { month: 'Apr', moods: { inspired: 55, emotional: 25, thoughtful: 20 } },
      { month: 'May', moods: { inspired: 60, emotional: 22, thoughtful: 18 } },
      { month: 'Jun', moods: { inspired: 58, emotional: 24, thoughtful: 18 } }
    ],
    emotionalGrowth: {
      current: 85,
      previous: 72,
      growth: 18
    }
  },
  tasteEvolution: {
    genres: [
      { genre: 'Drama', current: 35, previous: 25, trend: 'up' },
      { genre: 'Sci-Fi', current: 20, previous: 30, trend: 'down' },
      { genre: 'Documentary', current: 15, previous: 10, trend: 'up' },
      { genre: 'Comedy', current: 12, previous: 15, trend: 'down' },
      { genre: 'Thriller', current: 18, previous: 20, trend: 'stable' }
    ],
    sophisticationScore: 78,
    diversityIndex: 0.73
  },
  lifePatterns: {
    viewingHabits: {
      peakTime: 'Evening (8-10 PM)',
      averageSession: '2.3 hours',
      bingeTendency: 0.4,
      consistency: 0.85
    },
    lifePhaseCorrelation: {
      'college-era': { stories: 45, avgRating: 7.2, dominantMood: 'thoughtful' },
      'early-career': { stories: 32, avgRating: 8.1, dominantMood: 'inspired' },
      'growth-phase': { stories: 28, avgRating: 8.5, dominantMood: 'emotional' }
    }
  },
  wisdomExtraction: {
    totalLessons: 147,
    topLessons: [
      { lesson: 'Love transcends time and space', frequency: 12, stories: ['Interstellar', 'The Time Traveler\'s Wife'] },
      { lesson: 'True strength lies in compassion', frequency: 8, stories: ['Vinland Saga', 'Avatar'] },
      { lesson: 'Face your fears to grow', frequency: 7, stories: ['The Wizard of Oz', 'Inside Out'] },
      { lesson: 'Every choice creates new possibilities', frequency: 6, stories: ['The Matrix', 'Sliding Doors'] }
    ],
    personalPrinciples: [
      { principle: 'Choose compassion over revenge', strength: 0.92, source: 'Vinland Saga' },
      { principle: 'Embrace uncertainty', strength: 0.88, source: 'Arrival' },
      { principle: 'Find beauty in ordinary moments', strength: 0.85, source: 'Paterson' }
    ]
  },
  predictions: {
    nextFavoriteGenre: 'Philosophical Drama',
    emotionalReadiness: 'Ready for emotionally challenging content',
    optimalWatchTime: 'Weekend mornings',
    lifePhaseTransition: 'Entering wisdom-seeking phase'
  }
};

const INTELLIGENCE_MODULES = [
  {
    id: 'emotional',
    title: 'Emotional Intelligence',
    description: 'Understand your emotional patterns and growth',
    icon: <Heart className="w-5 h-5" />,
    color: 'rose',
    insights: 12
  },
  {
    id: 'taste',
    title: 'Taste Evolution',
    description: 'Track how your preferences change over time',
    icon: <Compass className="w-5 h-5" />,
    color: 'violet',
    insights: 8
  },
  {
    id: 'patterns',
    title: 'Life Patterns',
    description: 'Discover connections between stories and life phases',
    icon: <Activity className="w-5 h-5" />,
    color: 'cyan',
    insights: 15
  },
  {
    id: 'wisdom',
    title: 'Wisdom Extraction',
    description: 'Extract life lessons from your journey',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'emerald',
    insights: 23
  },
  {
    id: 'predictions',
    title: 'Predictive Insights',
    description: 'AI-powered recommendations based on patterns',
    icon: <Target className="w-5 h-5" />,
    color: 'amber',
    insights: 6
  }
];

export default function SmritiEnginePage() {
  const { allStories } = useStoriesStore();
  const { allMoments } = useMomentsStore();
  const { allSessions, loadSessions } = useSessionsStore();
  const { allKnowledge, loadKnowledge } = useKnowledgeStore();
  const [activeModule, setActiveModule] = useState('emotional');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [insights, setInsights] = useState(INTELLIGENCE_INSIGHTS);

  useEffect(() => {
    loadSessions();
    loadKnowledge();
  }, [loadSessions, loadKnowledge]);

  useEffect(() => {
    if (allStories.length > 0 || allMoments.length > 0 || allKnowledge.length > 0) {
      handleRunAnalysis();
    }
  }, [allStories.length, allMoments.length, allKnowledge.length]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { geminiService } = await import('@/services/GeminiService');
      
      const userData = {
        stories: allStories.map(s => ({ title: s.title, category: s.category, rating: s.rating })),
        moments: allMoments.map(m => ({ mood: m.mood, context: m.context })),
        knowledge: allKnowledge.map(k => ({ lesson: k.lesson, principle: k.principle, storyId: k.storyId })),
        sessions: allSessions.map(s => ({ duration: s.duration }))
      };

      const result = await geminiService.analyzeIntelligence(userData);
      
      if (result) {
        setInsights({
          ...INTELLIGENCE_INSIGHTS,
          ...result
        });
      } else {
        throw new Error('No result from Gemini');
      }
    } catch (error) {
      console.error('Failed to run AI analysis:', error);
      // Fallback to basic heuristics if API fails
      const moodCounts: Record<string, number> = {};
      allMoments.forEach(m => {
        if (m.mood) moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
      });
      const dominantMood = Object.entries(moodCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'inspired';

      setInsights(prev => ({
        ...prev,
        emotionalJourney: {
          ...prev.emotionalJourney,
          dominantMood
        }
      }));
    } finally {
      setIsAnalyzing(false);
      setLastAnalysis(new Date());
    }
  };

  const getModuleColor = (color: string) => {
    const colors = {
      violet: 'text-accent-primary bg-accent-primary/10 border-accent-primary/30',
      cyan: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30',
      rose: 'text-accent-rose bg-accent-rose/10 border-accent-rose/30',
      emerald: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/30',
      amber: 'text-accent-amber bg-accent-amber/10 border-accent-amber/30'
    };
    return colors[color as keyof typeof colors] || colors.violet;
  };

  const renderEmotionalIntelligence = () => {
    const chartData = insights.emotionalJourney.moodEvolution.map(m => ({
      name: m.month,
      ...m.moods
    }));

    return (
    <div className="space-y-page">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-page">
        {/* Emotional Journey Chart */}
        <div className="glass-card shadow-glass p-6 rounded-card">
          <h3 className="heading-3 text-primary mb-section">Your Emotional Journey</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between group">
              <span className="text-small font-bold text-text-secondary group-hover:text-white transition-colors duration-300">Dominant Mood</span>
              <span className="px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-purple-400 font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)] capitalize">
                {insights.emotionalJourney.dominantMood}
              </span>
            </div>
            
            <div className="space-y-3 group pt-2">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-text-secondary group-hover:text-white transition-colors duration-300">Emotional Growth</span>
                <span className="text-h3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald to-teal-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] tabular-nums leading-none">
                  +{insights.emotionalJourney.emotionalGrowth.growth}%
                </span>
              </div>
              <div className="h-3.5 bg-black/40 rounded-full border border-white/5 relative overflow-visible">
                <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] pointer-events-none" />
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${insights.emotionalJourney.emotionalGrowth.current}%`, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.1, type: "spring", bounce: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-accent-emerald to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] relative"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-3 rounded-full bg-emerald-300 blur-[2px] opacity-80" />
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-full opacity-90 shadow-[0_0_8px_white]" />
                </motion.div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 mt-8">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-sm font-bold text-text-secondary">Monthly Mood Distribution</h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#A78BFA] shadow-[0_0_8px_#A78BFA]" /><span className="text-xs text-white font-bold">Inspired</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FB7185] shadow-[0_0_8px_#FB7185]" /><span className="text-xs text-white font-bold">Emotional</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]" /><span className="text-xs text-white font-bold">Thoughtful</span></div>
                </div>
              </div>
              
              <div className="h-72 w-full mt-4 -ml-4 relative group">
                {/* Ambient backdrop glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/[0.03] to-transparent pointer-events-none rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorThoughtful" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.5}/>
                        <stop offset="100%" stopColor="#22D3EE" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEmotional" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FB7185" stopOpacity={0.5}/>
                        <stop offset="100%" stopColor="#FB7185" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInspired" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.5}/>
                        <stop offset="100%" stopColor="#A78BFA" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} dy={10} fontFamily="inherit" fontWeight="600" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(19, 17, 28, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#E4E4E5', fontWeight: 600, padding: '4px 0', textTransform: 'capitalize' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    
                    {/* Layering back-to-front */}
                    <Area type="monotoneX" dataKey="thoughtful" stroke="#22D3EE" strokeWidth={3} fillOpacity={1} fill="url(#colorThoughtful)" style={{ filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.5))" }} animationDuration={1500} />
                    <Area type="monotoneX" dataKey="emotional" stroke="#FB7185" strokeWidth={3} fillOpacity={1} fill="url(#colorEmotional)" style={{ filter: "drop-shadow(0 0 10px rgba(251, 113, 133, 0.5))" }} animationDuration={1500} />
                    <Area type="monotoneX" dataKey="inspired" stroke="#A78BFA" strokeWidth={3} fillOpacity={1} fill="url(#colorInspired)" style={{ filter: "drop-shadow(0 0 10px rgba(167, 139, 250, 0.5))" }} animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Emotional Insights */}
        <div className="glass-card shadow-glass p-6 rounded-card">
          <h3 className="heading-3 text-primary mb-section">Emotional Insights</h3>
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group p-5 bg-black/40 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-rose-500/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] group-hover:bg-rose-500/20 transition-all duration-300 flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">Growth Pattern Detected</h4>
                  <p className="text-secondary text-sm leading-relaxed">
                    You've shown an <strong className="text-rose-400 font-bold">18% increase</strong> in emotional awareness over the past 6 months. Your emotional responses are becoming more nuanced and thoughtful.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group p-5 bg-black/40 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] group-hover:bg-violet-500/20 transition-all duration-300 flex-shrink-0">
                  <Heart className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">Emotional Resilience</h4>
                  <p className="text-secondary text-sm leading-relaxed">
                    You're gravitating toward content that challenges you emotionally, indicating increased emotional maturity and readiness for complex narratives.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group p-5 bg-black/40 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:bg-emerald-500/20 transition-all duration-300 flex-shrink-0">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">Balance Achievement</h4>
                  <p className="text-secondary text-sm leading-relaxed">
                    Your emotional palette is becoming more diverse, showing healthy balance between inspiration, reflection, and emotional engagement.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  const renderTasteEvolution = () => (
    <div className="space-y-page">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-page">
        {/* Genre Evolution */}
        <div className="glass-card shadow-glass p-6 rounded-card">
          <h3 className="heading-3 text-primary mb-section">Genre Evolution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-small text-secondary">Sophistication Score</span>
              <span className="text-h3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-purple-400 to-accent-cyan drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
                {insights.tasteEvolution.sophisticationScore}/100
              </span>
            </div>
            
            <div className="flex flex-col gap-6 mt-8">
              {insights.tasteEvolution.genres.map((entry, index) => {
                const colorMap = {
                  up: {
                    gradient: 'from-accent-primary to-purple-400',
                    shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.6)]',
                    glow: 'bg-purple-300'
                  },
                  down: {
                    gradient: 'from-accent-rose to-pink-400',
                    shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.6)]',
                    glow: 'bg-pink-300'
                  },
                  stable: {
                    gradient: 'from-accent-emerald to-teal-400',
                    shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]',
                    glow: 'bg-emerald-300'
                  }
                };
                const style = colorMap[entry.trend as keyof typeof colorMap] || colorMap.stable;
                
                // Calculate relative width based on max value to ensure the largest bar fills the space
                const maxVal = Math.max(...insights.tasteEvolution.genres.map(g => g.current));
                const percentage = (entry.current / maxVal) * 100;

                return (
                  <div key={entry.genre} className="flex items-center gap-4 group">
                    <span className="w-24 text-right text-sm font-bold text-text-secondary group-hover:text-white transition-colors duration-300">
                      {entry.genre}
                    </span>
                    
                    <div className="flex-1 h-3.5 bg-black/40 rounded-full border border-white/5 relative overflow-visible">
                      {/* Inner track shadow */}
                      <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] pointer-events-none" />
                      
                      <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: `${percentage}%`, opacity: 1 }}
                        transition={{ duration: 1.2, delay: index * 0.15, type: "spring", bounce: 0.4 }}
                        className={`h-full rounded-full bg-gradient-to-r ${style.gradient} ${style.shadow} relative`}
                      >
                        {/* Glowing Energy Tip */}
                        <div className={`absolute right-0 top-0 bottom-0 w-3 rounded-full ${style.glow} blur-[2px] opacity-80`} />
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-full opacity-90 shadow-[0_0_8px_white]" />
                      </motion.div>
                    </div>
                    
                    <span className="w-10 text-xs font-bold text-text-muted text-right tabular-nums">
                      {entry.current}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Taste Insights */}
        <div className="glass-card shadow-glass p-6 rounded-card">
          <h3 className="heading-3 text-primary mb-section">Taste Insights</h3>
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group p-5 bg-black/40 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] group-hover:bg-violet-500/20 transition-all duration-300 flex-shrink-0">
                  <Compass className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">Maturing Palate</h4>
                  <p className="text-secondary text-sm leading-relaxed">
                    Your shift toward drama and documentary content indicates evolving taste and desire for more meaningful storytelling experiences.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group p-5 bg-black/40 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex flex-col relative z-10">
                <div className="flex gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:bg-cyan-500/20 transition-all duration-300 flex-shrink-0">
                    <PieChart className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4 className="font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors">Diversity Index</h4>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-h3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] tabular-nums">
                    {(insights.tasteEvolution.diversityIndex * 100).toFixed(0)}%
                  </div>
                  <div className="flex-1">
                    <div className="h-3.5 bg-black/40 rounded-full border border-white/5 relative overflow-visible">
                      <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] pointer-events-none" />
                      <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: `${insights.tasteEvolution.diversityIndex * 100}%`, opacity: 1 }}
                        transition={{ duration: 1.2, delay: 0.1, type: "spring", bounce: 0.4 }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] relative"
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-3 rounded-full bg-cyan-300 blur-[2px] opacity-80" />
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-full opacity-90 shadow-[0_0_8px_white]" />
                      </motion.div>
                    </div>
                  </div>
                </div>
                <p className="text-secondary text-sm mt-4 leading-relaxed">
                  Excellent genre diversity - you're exploring across different storytelling formats.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group p-5 bg-black/40 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:bg-amber-500/20 transition-all duration-300 flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">Recommendation</h4>
                  <p className="text-secondary text-sm leading-relaxed">
                    Consider exploring philosophical dramas and foreign cinema to further expand your horizons.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLifePatterns = () => (
    <div className="space-y-page">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-page">
        {/* Viewing Habits */}
        <div className="glass-card shadow-glass p-6 rounded-card">
          <h3 className="heading-3 text-primary mb-section">Viewing Patterns</h3>
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group overflow-hidden p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-accent-cyan/30 hover:bg-accent-cyan/5">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-12 h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300">
                  <Clock className="w-6 h-6 text-accent-cyan" />
                </div>
                <div className="text-center z-10">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Peak Time</div>
                  <div className="text-lg font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{insights.lifePatterns.viewingHabits.peakTime}</div>
                </div>
              </div>
              <div className="relative group overflow-hidden p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-purple-500/30 hover:bg-purple-500/5">
                <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-center z-10">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Avg Session</div>
                  <div className="text-lg font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{insights.lifePatterns.viewingHabits.averageSession}</div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-2">
              <div className="space-y-3 group">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-text-secondary group-hover:text-white transition-colors duration-300">Binge Tendency</span>
                  <span className="text-h3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-rose to-pink-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] tabular-nums leading-none">
                    {(insights.lifePatterns.viewingHabits.bingeTendency * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-3.5 bg-black/40 rounded-full border border-white/5 relative overflow-visible">
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] pointer-events-none" />
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: `${insights.lifePatterns.viewingHabits.bingeTendency * 100}%`, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.2, type: "spring", bounce: 0.4 }}
                    className="h-full rounded-full bg-gradient-to-r from-accent-rose to-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.6)] relative"
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-3 rounded-full bg-pink-300 blur-[2px] opacity-80" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-full opacity-90 shadow-[0_0_8px_white]" />
                  </motion.div>
                </div>
              </div>

              <div className="space-y-3 group">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-text-secondary group-hover:text-white transition-colors duration-300">Consistency</span>
                  <span className="text-h3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald to-teal-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] tabular-nums leading-none">
                    {(insights.lifePatterns.viewingHabits.consistency * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-3.5 bg-black/40 rounded-full border border-white/5 relative overflow-visible">
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] pointer-events-none" />
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: `${insights.lifePatterns.viewingHabits.consistency * 100}%`, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.35, type: "spring", bounce: 0.4 }}
                    className="h-full rounded-full bg-gradient-to-r from-accent-emerald to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] relative"
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-3 rounded-full bg-emerald-300 blur-[2px] opacity-80" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-full opacity-90 shadow-[0_0_8px_white]" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Life Phase Correlation */}
        <div className="glass-card shadow-glass p-6 rounded-card">
          <h3 className="heading-3 text-primary mb-section">Life Phase Insights</h3>
          <div className="space-y-4">
            {Object.entries(insights.lifePatterns.lifePhaseCorrelation).map(([phase, data], index) => {
              const colorMap = {
                'college-era': 'from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
                'early-career': 'from-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
                'growth-phase': 'from-emerald-500 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              };
              const bgGradient = colorMap[phase as keyof typeof colorMap] || 'from-gray-500 to-slate-500';
              return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={phase} 
                className="relative overflow-hidden p-5 bg-black/40 border border-white/5 rounded-2xl group transition-all duration-500 hover:scale-[1.02] hover:border-white/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <h4 className="font-bold text-white capitalize mb-4 text-lg">{phase.replace('-', ' ')}</h4>
                <div className="grid grid-cols-3 gap-normal text-small relative z-10">
                  <div>
                    <span className="text-secondary text-xs uppercase tracking-wider font-bold block mb-1">Stories</span>
                    <div className="text-xl font-bold text-white drop-shadow-md">{data.stories}</div>
                  </div>
                  <div>
                    <span className="text-secondary text-xs uppercase tracking-wider font-bold block mb-1">Avg Rating</span>
                    <div className="text-xl font-bold text-white drop-shadow-md">{data.avgRating}</div>
                  </div>
                  <div>
                    <span className="text-secondary text-xs uppercase tracking-wider font-bold block mb-2">Mood</span>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold inline-block shadow-lg capitalize ${
                      data.dominantMood === 'inspired' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' :
                      data.dominantMood === 'emotional' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/50' :
                      data.dominantMood === 'thoughtful' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                    }`}>
                      {data.dominantMood}
                    </div>
                  </div>
                </div>
              </motion.div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWisdomExtraction = () => (
    <div className="space-y-page">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-page">
        {/* Top Lessons */}
        <div className="glass-card shadow-glass p-6 rounded-card">
          <h3 className="heading-3 text-primary mb-section">Life Lessons Discovered</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between group">
              <span className="text-small font-bold text-secondary group-hover:text-white transition-colors duration-300">Total Lessons</span>
              <span className="text-h3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald to-teal-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                {insights.wisdomExtraction.totalLessons}
              </span>
            </div>
            
            <div className="space-y-4 mt-6">
              {insights.wisdomExtraction.topLessons.map((lesson, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index} 
                  className="relative group p-4 bg-black/40 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent-emerald/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-emerald/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-base mb-2 group-hover:text-accent-emerald transition-colors">{lesson.lesson}</h4>
                      <p className="text-xs font-medium text-secondary/80">
                        From: <span className="text-secondary group-hover:text-white transition-colors">{lesson.stories.join(', ')}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-emerald/10 border border-accent-emerald/30 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <Star className="w-3.5 h-3.5 text-accent-emerald fill-current drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                      <span className="text-xs font-bold text-accent-emerald">{lesson.frequency}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Personal Principles */}
        <div className="glass-card shadow-glass p-6 rounded-card">
          <h3 className="heading-3 text-primary mb-section">Your Personal Principles</h3>
          <div className="space-y-6">
            {insights.wisdomExtraction.personalPrinciples.map((principle, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index} 
                className="group p-5 bg-black/40 border border-white/5 rounded-2xl transition-all duration-300 hover:bg-black/60 hover:border-purple-500/20"
              >
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">{principle.principle}</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Strength</span>
                      <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] tabular-nums">
                        {(principle.strength * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-black/60 rounded-full border border-white/5 relative overflow-visible">
                      <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] pointer-events-none" />
                      <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: `${principle.strength * 100}%`, opacity: 1 }}
                        transition={{ duration: 1.2, delay: index * 0.1 + 0.2, type: "spring", bounce: 0.4 }}
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] relative"
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-2.5 rounded-full bg-pink-300 blur-[2px] opacity-80" />
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-full opacity-90 shadow-[0_0_5px_white]" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <p className="text-xs font-medium text-secondary pt-2 border-t border-white/5">
                    Source: <span className="text-white/80">{principle.source}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPredictiveInsights = () => (
    <div className="space-y-page">
      <div className="glass-card shadow-glass p-8 rounded-[32px]">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
          </div>
          <h3 className="heading-3 text-white m-0">AI-Powered Predictions</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: Target,
              title: 'Next Favorite Genre',
              value: insights.predictions.nextFavoriteGenre,
              desc: "Based on your taste evolution patterns, you're likely to enjoy philosophical dramas next.",
              gradient: 'from-amber-500 to-orange-500',
              shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]'
            },
            {
              icon: Heart,
              title: 'Emotional Readiness',
              value: insights.predictions.emotionalReadiness,
              desc: "Your emotional growth suggests you're ready for more challenging content.",
              gradient: 'from-purple-500 to-indigo-500',
              shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]'
            },
            {
              icon: Clock,
              title: 'Optimal Watch Time',
              value: insights.predictions.optimalWatchTime,
              desc: "Your engagement patterns suggest weekend mornings would be most rewarding.",
              gradient: 'from-cyan-500 to-blue-500',
              shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            },
            {
              icon: Brain,
              title: 'Life Phase Transition',
              value: insights.predictions.lifePhaseTransition,
              desc: "Your content choices indicate a shift toward wisdom-seeking and deeper meaning.",
              gradient: 'from-emerald-500 to-teal-500',
              shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
              className="relative group overflow-hidden p-6 bg-black/40 border border-white/5 rounded-[24px] hover:border-white/20 transition-all duration-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="flex items-start gap-5 relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:${item.shadow} transition-all duration-500`}>
                  <item.icon className="w-7 h-7 text-white opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">{item.title}</h4>
                  <div className="text-lg font-bold text-white mb-3 leading-snug drop-shadow-md">{item.value}</div>
                  <p className="text-sm font-medium text-secondary/80 leading-relaxed group-hover:text-secondary transition-colors">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'emotional': return renderEmotionalIntelligence();
      case 'taste': return renderTasteEvolution();
      case 'patterns': return renderLifePatterns();
      case 'wisdom': return renderWisdomExtraction();
      case 'predictions': return renderPredictiveInsights();
      default: return renderEmotionalIntelligence();
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 py-page">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12">
          <div>
            <TextEffect
              preset="blur"
              per="word"
              className="font-serif text-5xl md:text-7xl font-bold text-text-primary leading-none mb-4 drop-shadow-2xl flex items-center gap-4"
              delay={0.1}
            >
              Smriti Engine
            </TextEffect>
            <TextEffect
              preset="fade-in-blur"
              per="line"
              className="font-sans text-lg text-text-muted max-w-xl font-light"
              delay={0.2}
            >
              Advanced AI analysis of your entertainment journey. Discover patterns, extract wisdom, and understand yourself through the stories you love.
            </TextEffect>
          </div>
        </div>

        <StaggerContainer>
        {/* Analysis Controls HUD */}
        <FadeIn>
        <div className="relative z-50 mb-12 flex justify-center">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 via-purple-500/20 to-accent-emerald/20 blur-3xl opacity-50 pointer-events-none rounded-full" />
          
          <div className="relative z-50 glass-card shadow-glass p-2 pr-2 rounded-[24px] flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-[#0f0e13]/80 backdrop-blur-2xl w-full max-w-4xl mx-auto">
            
            <div className="flex items-center gap-4 pl-2">
              <div className="w-12 h-12 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Brain className="w-6 h-6 text-accent-primary animate-pulse" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Neural Engine Status</span>
                <span className="text-sm text-white font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                  Synchronized: {lastAnalysis.toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <Dropdown
                  value={selectedTimeframe}
                  onChange={setSelectedTimeframe}
                  options={[
                    { value: '1month', label: 'Last Month' },
                    { value: '3months', label: 'Last 3 Months' },
                    { value: '6months', label: 'Last 6 Months' },
                    { value: '1year', label: 'Last Year' },
                    { value: 'all', label: 'All Time' }
                  ]}
                />
              </div>
              <div className="hidden sm:block h-8 w-px bg-white/10 mx-1" />
              <Magnetic>
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 rounded-[16px] bg-gradient-to-r from-accent-primary to-purple-600 text-white text-sm font-bold tracking-wide flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] hover:-translate-y-0.5 transition-all duration-300 border border-white/10"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Run Analysis
                    </>
                  )}
                </button>
              </Magnetic>
            </div>
          </div>
        </div>
        </FadeIn>

        {/* Intelligence Modules */}
        <FadeIn>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 glass-card shadow-glass rounded-card p-2">
          <div className="flex flex-wrap gap-1 w-full">
            {INTELLIGENCE_MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`relative flex-1 px-4 py-3 rounded-[12px] transition-colors duration-300 flex flex-col items-center gap-2 ${
                  activeModule === module.id
                    ? 'text-white'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                {activeModule === module.id && (
                  <motion.div
                    layoutId="intelligence-active-tab"
                    className={`absolute inset-0 rounded-[12px] opacity-80 ${
                      module.color === 'violet' ? 'bg-gradient-to-br from-accent-primary to-purple-600 shadow-[0_0_15px_rgba(139,92,246,0.3)]' :
                      module.color === 'cyan' ? 'bg-gradient-to-br from-accent-cyan to-blue-500 shadow-[0_0_15px_rgba(0,242,254,0.3)]' :
                      module.color === 'rose' ? 'bg-gradient-to-br from-accent-rose to-pink-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' :
                      module.color === 'emerald' ? 'bg-gradient-to-br from-accent-emerald to-green-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                      'bg-gradient-to-br from-accent-amber to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    }`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 text-sm font-semibold tracking-wide">
                  {module.icon}
                  {module.title}
                </span>
              </button>
            ))}
          </div>
        </div>
        </FadeIn>

        {/* Module Content */}
        <FadeIn>
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center py-32 glass-card shadow-glass rounded-card border border-emerald/20"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald/20 blur-xl rounded-full animate-pulse" />
                <Brain className="w-16 h-16 text-emerald animate-bounce relative z-10" />
              </div>
              <h3 className="heading-3 text-emerald mb-2">Neural Link Active</h3>
              <p className="text-secondary text-center max-w-md animate-pulse">
                Gemini AI is currently analyzing your emotional journey, taste evolution, and life patterns to generate deep insights.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderModuleContent()}
            </motion.div>
          )}
        </AnimatePresence>
        </FadeIn>

        {/* Export Insights */}
        <FadeIn>
        <div className="glass-card shadow-glass p-6 rounded-card mt-page">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="heading-3 text-primary mb-1">Export Your Intelligence</h3>
              <p className="text-secondary text-small">
                Download your complete intelligence report as PDF or share insights with others.
              </p>
            </div>
            <div className="flex gap-4">
              <Magnetic>
                <button onClick={() => {
                  alert('Analysis process triggered. Check console for details.');
                  console.log('Running analysis...');
                }} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-purple-600 text-white text-sm font-bold tracking-wide flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 transition-all duration-300">
                  <Brain className="w-4 h-4 text-white" />
                  Run Full Analysis
                </button>
              </Magnetic>
              <button onClick={() => {
                alert('Models optimized for local execution.');
                console.log('Optimizing...');
              }} className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-text-secondary hover:text-primary text-sm font-medium flex items-center gap-2 transition-colors duration-300">
                <Settings className="w-4 h-4" />
                Optimize Models
              </button>
            </div>
          </div>
        </div>
        </FadeIn>
        </StaggerContainer>
      </div>
    </div>
  );
}
