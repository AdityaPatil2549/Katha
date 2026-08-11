// Smriti Atlas - Core Type Definitions
// This is the heart of the Smriti Atlas dataset system

export type AtlasCategory = "movie" | "series" | "anime" | "documentary";
export type AtlasDifficulty = "easy" | "medium" | "heavy";

export interface AtlasEntry {
  id: string;                // UUID
  title: string;            // "Interstellar"
  originalTitle?: string;
  category: AtlasCategory;
  year: number;
  country?: string;

  genres: string[];         // ["Sci-Fi", "Drama"]
  themes: string[];        // ["time", "love", "sacrifice", "humanity"]
  impactTags: string[];    // ["mind-bending", "emotional", "inspiring"]

  difficulty: AtlasDifficulty;
  emotionalTone: string[]; // ["hopeful", "melancholic", "intense"]

  runtime?: number;        // minutes (movies/docs)
  seasons?: number;        // series/anime
  episodes?: number;

  description: string;     // short summary
  whyWatch: string;        // editorial reason

  lifeLessons: string[];  // extracted wisdom
  reflectionPrompts: string[]; // self-reflection questions

  bestWatchedWhen: string[]; 
  // examples: ["feeling lost", "seeking motivation", "questioning life", "burned out"]

  recommendedAge?: string; // "16+", "18+"

  culturalImpact?: string; // why it matters historically

  createdBy: "Smriti Atlas Editorial";
  version: string;        // "atlas-core-v1"
}

export interface AtlasCollection {
  id: string;
  title: string;
  subtitle: string;
  description: string;

  category: AtlasCategory | "mixed";

  philosophy: string;      // what this collection stands for
  lifeStage: string[];     // ["student", "career", "self-discovery"]

  curatorNote: string;    // editorial introduction

  entryIds: string[];     // references AtlasEntry.id

  difficulty: AtlasDifficulty;
  emotionalProfile: string[]; // dominant emotions

  version: string;
}

export interface AtlasKnowledge {
  id: string;
  entryId: string;

  principles: string[];   // lessons extracted
  ideas: string[];        // philosophical ideas
  quotes: string[];       // important dialogues
  concepts: string[];    // leadership, ethics, psychology

  reflectionExercises: string[];
  journalingPrompts: string[];

  wisdomScore: number;   // 1–10
}

export interface AtlasLifePhase {
  id: string;
  phase: string;          // "College", "Career", "Midlife", "Rebuilding"

  description: string;

  emotionalNeeds: string[];  // motivation, healing, focus
  recommendedThemes: string[];

  entryIds: string[];    // best stories for this phase
}

export interface AtlasMoodMap {
  mood: string;           // "sad", "lost", "burned out", "unmotivated"

  description: string;

  emotionalGoal: string; // what user wants to feel

  recommendedEntryIds: string[];
}

export interface AtlasMeta {
  name: string;
  version: string;
  entries: number;
  sizeMB: number;
  createdAt: Date;
  curator: string;
  license: string;
}

export interface AtlasDataset {
  meta: AtlasMeta;
  entries: AtlasEntry[];
  collections: AtlasCollection[];
  knowledge: AtlasKnowledge[];
  lifePhases: AtlasLifePhase[];
  moodMap: AtlasMoodMap[];
}

// Atlas Database Operations
export interface AtlasRepository {
  // Entry operations
  getAllEntries(): Promise<AtlasEntry[]>;
  getEntryById(id: string): Promise<AtlasEntry | null>;
  searchEntries(query: string): Promise<AtlasEntry[]>;
  getEntriesByCategory(category: AtlasCategory): Promise<AtlasEntry[]>;
  getEntriesByTheme(theme: string): Promise<AtlasEntry[]>;
  getEntriesByDifficulty(difficulty: AtlasDifficulty): Promise<AtlasEntry[]>;
  
  // Collection operations
  getAllCollections(): Promise<AtlasCollection[]>;
  getCollectionById(id: string): Promise<AtlasCollection | null>;
  
  // Knowledge operations
  getKnowledgeByEntryId(entryId: string): Promise<AtlasKnowledge | null>;
  
  // Life phase operations
  getLifePhase(phase: string): Promise<AtlasLifePhase | null>;
  
  // Mood operations
  getMoodRecommendations(mood: string): Promise<AtlasEntry[]>;
  
  // Dataset operations
  installDataset(dataset: AtlasDataset): Promise<void>;
  getDatasetVersion(): Promise<string | null>;
  clearDataset(): Promise<void>;
}

// Atlas Installer States
export type AtlasInstallerState = 
  | "checking-storage"
  | "downloading"
  | "installing"
  | "verifying"
  | "complete"
  | "error";

export interface AtlasInstallerProgress {
  state: AtlasInstallerState;
  progress: number; // 0-100
  message: string;
  error?: string;
}

// Atlas Discovery Filters
export interface AtlasDiscoveryFilters {
  category?: AtlasCategory[];
  difficulty?: AtlasDifficulty[];
  themes?: string[];
  impactTags?: string[];
  emotionalTone?: string[];
  runtime?: { min?: number; max?: number };
  year?: { min?: number; max?: number };
  recommendedAge?: string[];
}

export interface AtlasSearchResult {
  entry: AtlasEntry;
  relevanceScore: number;
  matchReasons: string[];
}
