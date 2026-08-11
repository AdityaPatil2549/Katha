// Personal Intelligence Integration Types
// This extends the Atlas system with user-specific personalization

export interface PersonalProfile {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Basic demographics
  age?: number;
  lifePhase: 'College' | 'Career' | 'Midlife' | 'Rebuilding' | 'Retirement';
  profession?: string;
  interests: string[];
  
  // Emotional preferences
  emotionalProfile: EmotionalProfile;
  moodHistory: MoodEntry[];
  
  // Story preferences
  storyPreferences: StoryPreferences;
  viewingHistory: ViewingHistory[];
  
  // Learning data
  learningProfile: LearningProfile;
  impactResponses: ImpactResponse[];
  
  // Personal goals
  personalGoals: PersonalGoal[];
  growthAreas: GrowthArea[];
}

export interface EmotionalProfile {
  // Current emotional state
  currentMood: string;
  energyLevel: number; // 1-10
  stressLevel: number; // 1-10
  opennessLevel: number; // 1-10
  
  // Emotional patterns
  moodPatterns: {
    morning: string[];
    afternoon: string[];
    evening: string[];
    weekend: string[];
  };
  
  // Emotional triggers
  positiveTriggers: string[];
  negativeTriggers: string[];
  
  // Emotional intelligence
  selfAwareness: number; // 1-10
  emotionalRegulation: number; // 1-10
  empathy: number; // 1-10
}

export interface MoodEntry {
  id: string;
  timestamp: Date;
  mood: string;
  intensity: number; // 1-10
  context?: string;
  triggers?: string[];
  duration?: number; // minutes
}

export interface StoryPreferences {
  // Content preferences
  preferredCategories: string[];
  preferredGenres: string[];
  preferredThemes: string[];
  avoidedThemes: string[];
  
  // Viewing preferences
  preferredDifficulty: string[];
  preferredLength: 'short' | 'medium' | 'long';
  preferredPace: 'slow' | 'moderate' | 'fast';
  
  // Impact preferences
  seekingImpacts: string[];
  avoidingImpacts: string[];
  
  // Learning preferences
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  reflectionStyle: 'immediate' | 'delayed' | 'periodic';
}

export interface ViewingHistory {
  id: string;
  entryId: string;
  timestamp: Date;
  completed: boolean;
  rating?: number; // 1-10
  moodBefore: string;
  moodAfter: string;
  impactLevel: number; // 1-10
  keyInsights?: string[];
  personalConnections?: string[];
  wouldRecommend: boolean;
  watchedWith?: string;
  notes?: string;
}

export interface LearningProfile {
  // Learning patterns
  bestLearningTimes: string[];
  focusDuration: number; // minutes
  comprehensionLevel: number; // 1-10
  
  // Memory patterns
  shortTermMemory: number; // 1-10
  longTermRetention: number; // 1-10
  associationStrength: number; // 1-10
  
  // Cognitive preferences
  analyticalVsIntuitive: number; // -10 to 10
  concreteVsAbstract: number; // -10 to 10
  sequentialVsGlobal: number; // -10 to 10
  
  // Growth mindset
  growthMindset: number; // 1-10
  curiosity: number; // 1-10
  adaptability: number; // 1-10
}

export interface ImpactResponse {
  id: string;
  entryId: string;
  timestamp: Date;
  impactType: 'emotional' | 'intellectual' | 'behavioral' | 'spiritual';
  intensity: number; // 1-10
  duration: number; // how long the impact lasted in days
  lifeArea: string; // career, relationships, personal growth, etc.
  specificChanges: string[];
  unexpectedOutcomes?: string[];
  longTermEffect?: string;
}

export interface PersonalGoal {
  id: string;
  title: string;
  description: string;
  category: 'career' | 'relationships' | 'personal' | 'health' | 'spiritual' | 'creative';
  priority: number; // 1-10
  targetDate?: Date;
  progress: number; // 0-100
  relatedThemes: string[];
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
  relatedStories: string[];
}

export interface GrowthArea {
  id: string;
  area: string;
  currentLevel: number; // 1-10
  targetLevel: number; // 1-10
  focusAreas: string[];
  relatedStoryThemes: string[];
  progress: number; // 0-100
  lastAssessment: Date;
}

// Personal Intelligence Engine
export interface PersonalIntelligenceEngine {
  // Profile management
  getProfile(): Promise<PersonalProfile | null>;
  updateProfile(updates: Partial<PersonalProfile>): Promise<void>;
  createProfile(profile: Omit<PersonalProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  
  // Learning and adaptation
  recordViewing(viewing: Omit<ViewingHistory, 'id' | 'timestamp'>): Promise<void>;
  recordMood(mood: Omit<MoodEntry, 'id' | 'timestamp'>): Promise<void>;
  recordImpact(impact: Omit<ImpactResponse, 'id' | 'timestamp'>): Promise<void>;
  
  // Personalization
  getPersonalizedRecommendations(context: RecommendationContext): Promise<PersonalizedRecommendation[]>;
  analyzeEmotionalTrends(timeframe: TimeFrame): Promise<EmotionalAnalysis>;
  predictOptimalViewingTime(): Promise<ViewingRecommendation>;
  
  // Growth tracking
  getGrowthInsights(): Promise<GrowthInsight[]>;
  generatePersonalReport(): Promise<PersonalReport>;
}

export interface RecommendationContext {
  currentMood?: string;
  availableTime?: number; // minutes
  goals?: string[];
  recentViewings?: string[];
  companionViewing?: boolean;
  energyLevel?: number;
  stressLevel?: number;
}

export interface PersonalizedRecommendation {
  entryId: string;
  relevanceScore: number;
  personalReasoning: string;
  expectedImpact: string;
  optimalTiming: string;
  preparationTips?: string[];
  followUpQuestions?: string[];
}

export interface EmotionalAnalysis {
  overallTrend: 'improving' | 'stable' | 'declining';
  patterns: {
    daily: EmotionalPattern[];
    weekly: EmotionalPattern[];
    monthly: EmotionalPattern[];
  };
  triggers: {
    positive: string[];
    negative: string[];
  };
  recommendations: string[];
}

export interface EmotionalPattern {
  timestamp: Date;
  mood: string;
  energy: number;
  stress: number;
  context?: string;
}

export interface ViewingRecommendation {
  optimalTime: string;
  expectedMood: string;
  preparationActivities: string[];
  postViewingReflection: string[];
  companionSuggestions?: string[];
}

export interface TimeFrame {
  start: Date;
  end: Date;
  type: 'day' | 'week' | 'month' | 'year';
}

export interface GrowthInsight {
  id: string;
  area: string;
  insight: string;
  evidence: string[];
  recommendations: string[];
  relatedStories: string[];
  timestamp: Date;
}

export interface PersonalReport {
  summary: string;
  emotionalJourney: EmotionalJourneySummary;
  growthProgress: GrowthProgress[];
  topInsights: string[];
  recommendations: string[];
  nextSteps: string[];
  generatedAt: Date;
}

export interface EmotionalJourneySummary {
  overallTrend: string;
  biggestChanges: string[];
  stablePatterns: string[];
  breakthroughMoments: string[];
}

export interface GrowthProgress {
  area: string;
  currentLevel: number;
  previousLevel: number;
  growth: number;
  keyContributors: string[];
  nextMilestones: string[];
}

// Story DNA System
export interface StoryDNA {
  id: string;
  entryId: string;
  
  // Core DNA elements
  emotionalSignature: EmotionalSignature;
  cognitiveProfile: CognitiveProfile;
  transformationArc: TransformationArc;
  
  // Compatibility factors
  personalityMatches: PersonalityMatch[];
  lifePhaseRelevance: LifePhaseRelevance[];
  moodAlignment: MoodAlignment[];
  
  // Impact potential
  impactVector: ImpactVector;
  learningOutcomes: LearningOutcome[];
  growthTriggers: GrowthTrigger[];
}

export interface EmotionalSignature {
  primaryEmotions: string[];
  emotionalJourney: EmotionalJourneyPoint[];
  intensity: number;
  duration: number;
  resonance: number;
}

export interface EmotionalJourneyPoint {
  phase: string;
  emotion: string;
  intensity: number;
  duration: number;
  trigger: string;
}

export interface CognitiveProfile {
  complexity: number; // 1-10
  abstractness: number; // 1-10
  analyticalDepth: number; // 1-10
  creativeElements: number; // 1-10
  philosophicalDepth: number; // 1-10
}

export interface TransformationArc {
  beforeState: string;
  catalyst: string;
  journey: string[];
  afterState: string;
  permanence: number; // 1-10
}

export interface PersonalityMatch {
  trait: string;
  compatibility: number; // -10 to 10
  reasoning: string;
}

export interface LifePhaseRelevance {
  phase: string;
  relevance: number; // 1-10
  keyThemes: string[];
  timing: string;
}

export interface MoodAlignment {
  mood: string;
  alignment: number; // -10 to 10
  effectiveness: number; // 1-10
  duration: number; // hours
}

export interface ImpactVector {
  emotional: number; // 1-10
  intellectual: number; // 1-10
  behavioral: number; // 1-10
  spiritual: number; // 1-10
  social: number; // 1-10
}

export interface LearningOutcome {
  type: string;
  likelihood: number; // 1-10
  retention: number; // 1-10
  application: number; // 1-10
}

export interface GrowthTrigger {
  area: string;
  trigger: string;
  potential: number; // 1-10
  activation: string;
}
