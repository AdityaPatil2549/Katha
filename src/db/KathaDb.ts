import Dexie, { type Table } from 'dexie';
import type { 
  Knowledge, Moment, Session, Story, TimelineEvent, ApiCacheEntry 
} from '@/types/models';
import type {
  PersonalProfile, ViewingHistory, MoodEntry, ImpactResponse, JournalEntry,
  PersonalGoal, GrowthArea, StoryDNA
} from '@/types/personal';
import type {
  PersonalWisdom, PersonalInsight, PersonalPrinciple, PersonalQuote,
  PersonalStory, KnowledgeConnection, WisdomTheme, LifeLesson,
  PersonalPhilosophy, LegacyDocument
} from '@/types/knowledge';
import type {
  AtlasEntry, AtlasCollection, AtlasKnowledge, AtlasLifePhase,
  AtlasMoodMap, AtlasMeta
} from '@/types/atlas';

export class KathaDb extends Dexie {
  stories!: Table<Story, string>;
  moments!: Table<Moment, string>;
  sessions!: Table<Session, string>;
  knowledge!: Table<Knowledge, string>;
  timeline!: Table<TimelineEvent, string>;
  apiCache!: Table<ApiCacheEntry, string>;
  syncQueue!: Table<{
    id: string;
    table: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    data: any;
    timestamp: number;
  }, string>;

  // Personal Database Tables
  profiles!: Table<PersonalProfile>;
  viewingHistory!: Table<ViewingHistory>;
  personalMoodEntries!: Table<MoodEntry>; // Renamed internally to avoid name clashing
  impactResponses!: Table<ImpactResponse>;
  journalEntries!: Table<JournalEntry>;
  personalGoals!: Table<PersonalGoal>;
  growthAreas!: Table<GrowthArea>;
  storyDNA!: Table<StoryDNA>;

  // Wisdom Database Tables
  wisdom!: Table<PersonalWisdom>;
  insights!: Table<PersonalInsight>;
  principles!: Table<PersonalPrinciple>;
  quotes!: Table<PersonalQuote>;
  personalStories!: Table<PersonalStory>;
  connections!: Table<KnowledgeConnection>;
  themes!: Table<WisdomTheme>;
  lifeLessons!: Table<LifeLesson>;
  philosophies!: Table<PersonalPhilosophy>;
  legacyDocuments!: Table<LegacyDocument>;

  // Atlas Database Tables
  atlasEntries!: Table<AtlasEntry>;
  atlasCollections!: Table<AtlasCollection>;
  atlasKnowledge!: Table<AtlasKnowledge>;
  atlasLifePhases!: Table<AtlasLifePhase>;
  atlasMoodMap!: Table<AtlasMoodMap>;
  atlasMeta!: Table<AtlasMeta>;

  constructor() {
    super('katha');

    this.version(1).stores({
      stories: 'id, category, status, favorite, impactIndex, updatedAt, createdAt, *tags, *moods',
      moments: 'id, storyId, date, mood, isPrivate',
      sessions: 'id, storyId, date, duration, mood',
      knowledge: 'id, storyId, date',
      timeline: 'id, type, refId, date, mood'
    });

    // Version 2: Added as migration scaffolding
    // Any future schema changes must be added to a new version block.
    this.version(2).stores({
      stories: 'id, category, status, favorite, impactIndex, updatedAt, createdAt, *tags, *moods',
      moments: 'id, storyId, date, mood, isPrivate',
      sessions: 'id, storyId, date, duration, mood',
      knowledge: 'id, storyId, date',
      timeline: 'id, type, refId, date, mood',
      apiCache: 'id, service, timestamp'
    });

    // Version 3: Unified Personal, Wisdom, and Atlas Databases into KathaDb
    this.version(3).stores({
      // Base
      stories: 'id, category, status, favorite, impactIndex, updatedAt, createdAt, *tags, *moods',
      moments: 'id, storyId, date, mood, isPrivate',
      sessions: 'id, storyId, date, duration, mood',
      knowledge: 'id, storyId, date',
      timeline: 'id, type, refId, date, mood',
      apiCache: 'id, service, timestamp',
      syncQueue: 'id, table, timestamp',
      
      // Personal
      profiles: 'id, createdAt, updatedAt, lifePhase',
      viewingHistory: 'id, entryId, timestamp, completed, rating',
      personalMoodEntries: 'id, timestamp, mood, intensity',
      impactResponses: 'id, entryId, timestamp, impactType, intensity',
      journalEntries: 'id, timestamp',
      personalGoals: 'id, category, priority, progress',
      growthAreas: 'id, area, currentLevel, targetLevel',
      storyDNA: 'id, entryId',

      // Wisdom
      wisdom: 'id, createdAt, updatedAt',
      insights: 'id, timestamp, sourceEntryId, category, depth',
      principles: 'id, timestamp, name, category, importance',
      quotes: 'id, timestamp, content, source, resonance',
      personalStories: 'id, timestamp, title, genre, sharingLevel',
      connections: 'id, sourceId, targetId, sourceType, targetType, strength',
      themes: 'id, name, category, importance, currentStatus',
      lifeLessons: 'id, timestamp, title, category, value',
      philosophies: 'id, timestamp, title',
      legacyDocuments: 'id, timestamp, title, type, sharingLevel',

      // Atlas
      atlasEntries: 'id, title, category, year, genres, themes, impactTags, difficulty, emotionalTone, runtime, seasons, episodes, createdBy, version',
      atlasCollections: 'id, title, category, difficulty, version, entryIds',
      atlasKnowledge: 'id, entryId, wisdomScore',
      atlasLifePhases: 'id, phase, entryIds',
      atlasMoodMap: 'mood, recommendedEntryIds',
      atlasMeta: 'name, version, createdAt'
    }).upgrade(tx => {
      // Future data migrations go here
    });
  }
}

export const db = new KathaDb();
