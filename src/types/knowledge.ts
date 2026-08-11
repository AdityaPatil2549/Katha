// Knowledge & Legacy System Types

export interface PersonalWisdom {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  insights: PersonalInsight[];
  principles: PersonalPrinciple[];
  quotes: PersonalQuote[];
  stories: PersonalStory;
  knowledgeGraph: KnowledgeConnection[];
  wisdomThemes: WisdomTheme[];
  lifeLessons: LifeLesson[];
  personalPhilosophy: PersonalPhilosophy;
  legacyDocument: LegacyDocument;
}

export interface PersonalInsight {
  id: string;
  timestamp: Date;
  sourceEntryId: string;
  title: string;
  description: string;
  category: 'emotional' | 'intellectual' | 'spiritual' | 'behavioral' | 'relational';
  depth: number; // 1-10
  context: string;
  personalConnection: string;
  lifeArea: string;
  actionable: boolean;
  actionSteps: string[];
  appliedCount: number;
  relatedInsights: string[];
  relatedPrinciples: string[];
  evolutionHistory: InsightEvolution[];
  currentRelevance: number; // 1-10
}

export interface PersonalPrinciple {
  id: string;
  timestamp: Date;
  name: string;
  description: string;
  category: 'life' | 'work' | 'relationships' | 'growth' | 'values';
  importance: number; // 1-10
  originStory: string;
  supportingInsights: string[];
  applicationAreas: string[];
  personalInterpretation: string;
  active: boolean;
  lastApplied: Date;
}

export interface PersonalQuote {
  id: string;
  timestamp: Date;
  content: string;
  source: string;
  attribution: string;
  category: string;
  tags: string[];
  resonance: number; // 1-10
  personalMeaning: string;
  context: string;
  emotionalImpact: number; // 1-10
  favoriteCount: number;
  relatedInsights: string[];
  relatedPrinciples: string[];
}

export interface PersonalStory {
  id: string;
  timestamp: Date;
  title: string;
  narrative: string;
  genre: 'transformation' | 'learning' | 'achievement' | 'challenge' | 'relationship';
  emotionalArc: EmotionalArc;
  timeSpan: TimeRange;
  characters: StoryCharacter[];
  themes: string[];
  lifeLessons: string[];
  personalGrowth: string;
  turningPoints: TurningPoint[];
  narrativeStyle: NarrativeStyle;
  sharingLevel: 'private' | 'friends' | 'public';
}

export interface EmotionalArc {
  startEmotion: string;
  endEmotion: string;
  journey: EmotionalJourneyPoint[];
  climax: EmotionalJourneyPoint;
  resolution: EmotionalJourneyPoint;
}

export interface EmotionalJourneyPoint {
  emotion: string;
  intensity: number; // 1-10
  context: string;
  trigger: string;
  timestamp: number;
}

export interface TimeRange {
  startDate?: Date;
  endDate?: Date;
  duration?: string;
  period: 'moment' | 'day' | 'week' | 'month' | 'year' | 'era';
}

export interface StoryCharacter {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'mentor' | 'ally' | 'catalyst';
  characteristics: string[];
  relationship: string;
  significance: string;
}

export interface TurningPoint {
  id: string;
  title: string;
  description: string;
  beforeState: string;
  afterState: string;
  catalyst: string;
  impact: number; // 1-10
}

export interface NarrativeStyle {
  perspective: 'first' | 'second' | 'third';
  tone: 'reflective' | 'inspirational' | 'cautionary' | 'humorous' | 'dramatic';
  pacing: 'fast' | 'moderate' | 'slow';
  structure: 'linear' | 'nonlinear' | 'circular' | 'episodic';
}

export interface KnowledgeConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceType: 'insight' | 'principle' | 'quote' | 'story';
  targetType: 'insight' | 'principle' | 'quote' | 'story';
  relationship: 'supports' | 'contradicts' | 'expands' | 'exemplifies' | 'relates';
  strength: number; // 1-10
  description: string;
  createdAt: Date;
}

export interface WisdomTheme {
  id: string;
  name: string;
  description: string;
  category: string;
  prevalence: number;
  importance: number; // 1-10
  development: number; // 1-10
  insights: string[];
  principles: string[];
  stories: string[];
  quotes: string[];
  currentStatus: 'emerging' | 'developing' | 'mature' | 'transforming';
}

export interface LifeLesson {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  category: string;
  difficulty: number; // 1-10
  value: number; // 1-10
  sourceEvent: string;
  learningProcess: string;
  applicationAreas: string[];
  teachable: boolean;
  currentUnderstanding: string;
}

export interface PersonalPhilosophy {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  coreBeliefs: CoreBelief[];
  values: PersonalValue[];
  guidingPrinciples: string[];
  worldview: string;
  purpose: string;
  meaning: string;
  decisionFramework: string;
  dailyPractices: string[];
  evolutionHistory: PhilosophyEvolution[];
}

export interface CoreBelief {
  id: string;
  statement: string;
  foundation: string;
  evidence: string[];
  confidence: number;
}

export interface PersonalValue {
  id: string;
  name: string;
  description: string;
  importance: number; // 1-10
  source: string;
  application: string;
}

export interface InsightEvolution {
  timestamp: Date;
  change: string;
  reason: string;
  newUnderstanding: string;
}

export interface PhilosophyEvolution {
  timestamp: Date;
  change: string;
  influence: string;
  previousView: string;
  newView: string;
}

export interface LegacyDocument {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  type: 'autobiography' | 'wisdom_collection' | 'life_lessons' | 'philosophy' | 'legacy_letter';
  
  // Document structure
  sections: LegacySection[];
  chapters: LegacyChapter[];
  
  // Content
  introduction: string;
  conclusion: string;
  keyMessages: string[];
  
  // Personalization
  intendedAudience: string[];
  personalVoice: string;
  tone: string;
  
  // Legacy elements
  lifeSummary: string;
  coreWisdom: string[];
  hopesForOthers: string[];
  finalThoughts: string;
  
  // Metadata
  wordCount: number;
  readingTime: number;
  completionDate?: Date;
  
  // Sharing
  sharingLevel: 'private' | 'family' | 'friends' | 'public';
  accessInstructions: string[];
}

export interface LegacySection {
  id: string;
  title: string;
  content: string;
  order: number;
  type: 'chapter' | 'reflection' | 'wisdom' | 'story' | 'lesson';
  relatedElements: string[];
}

export interface LegacyChapter {
  id: string;
  title: string;
  summary: string;
  sections: string[];
  order: number;
  theme: string;
  timePeriod: string;
}

// Knowledge Extraction Engine
export interface KnowledgeExtractionEngine {
  extractInsights(viewingHistory: any[]): Promise<PersonalInsight[]>;
  identifyPrinciples(insights: PersonalInsight[]): Promise<PersonalPrinciple[]>;
  collectQuotes(viewingHistory: any[]): Promise<PersonalQuote[]>;
  generateStories(lifeEvents: any[]): Promise<PersonalStory[]>;
  buildKnowledgeGraph(elements: any[]): Promise<KnowledgeConnection[]>;
  identifyThemes(elements: any[]): Promise<WisdomTheme[]>;
  extractLifeLessons(experiences: any[]): Promise<LifeLesson[]>;
  developPhilosophy(elements: any[]): Promise<PersonalPhilosophy>;
  generateLegacy(elements: any[]): Promise<LegacyDocument>;
}

// Wisdom Repository
export interface WisdomRepository {
  saveWisdom(wisdom: PersonalWisdom): Promise<void>;
  getWisdom(): Promise<PersonalWisdom | null>;
  updateWisdom(updates: Partial<PersonalWisdom>): Promise<void>;
  searchWisdom(query: string): Promise<any[]>;
  exportWisdom(format: 'json' | 'pdf' | 'markdown'): Promise<Blob>;
  importWisdom(data: any): Promise<void>;
}

// Storybook Generator
export interface StorybookGenerator {
  generateLifeStorybook(wisdom: PersonalWisdom): Promise<Storybook>;
  generateThemedStorybook(theme: string, wisdom: PersonalWisdom): Promise<Storybook>;
  generateLegacyStorybook(wisdom: PersonalWisdom): Promise<Storybook>;
  customizeStorybook(storybook: Storybook, customizations: StorybookCustomization): Promise<Storybook>;
  exportStorybook(storybook: Storybook, format: 'pdf' | 'epub' | 'web'): Promise<Blob>;
}

export interface Storybook {
  id: string;
  title: string;
  description: string;
  type: 'life_story' | 'themed' | 'legacy' | 'wisdom';
  chapters: StorybookChapter[];
  metadata: StorybookMetadata;
  customizations: StorybookCustomization;
}

export interface StorybookChapter {
  id: string;
  title: string;
  content: string;
  type: 'story' | 'reflection' | 'wisdom' | 'quote' | 'lesson';
  order: number;
  images: string[];
  metadata: ChapterMetadata;
}

export interface StorybookMetadata {
  author: string;
  createdAt: Date;
  wordCount: number;
  readingTime: number;
  themes: string[];
  mood: string;
  intendedAudience: string[];
}

export interface ChapterMetadata {
  sourceType: string;
  sourceId: string;
  emotionalTone: string;
  keyThemes: string[];
  relatedElements: string[];
}

export interface StorybookCustomization {
  coverImage?: string;
  colorScheme: string;
  typography: string;
  layout: string;
  includeImages: boolean;
  includeQuotes: boolean;
  includeReflections: boolean;
  personalNotes: boolean;
}
