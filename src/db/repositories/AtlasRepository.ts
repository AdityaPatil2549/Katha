import Dexie, { Table } from 'dexie';
import type { 
  AtlasEntry, 
  AtlasCollection, 
  AtlasKnowledge, 
  AtlasLifePhase, 
  AtlasMoodMap, 
  AtlasMeta,
  AtlasDataset,
  AtlasSearchResult,
  AtlasDiscoveryFilters
} from '@/types/atlas';

// Atlas Database Schema
class AtlasDatabase extends Dexie {
  entries!: Table<AtlasEntry>;
  collections!: Table<AtlasCollection>;
  knowledge!: Table<AtlasKnowledge>;
  lifePhases!: Table<AtlasLifePhase>;
  moodMap!: Table<AtlasMoodMap>;
  meta!: Table<AtlasMeta>;

  constructor() {
    super('KathaAtlasDatabase');
    
    // Define database schema
    this.version(1).stores({
      entries: 'id, title, category, year, genres, themes, impactTags, difficulty, emotionalTone, runtime, seasons, episodes, createdBy, version',
      collections: 'id, title, category, difficulty, version, entryIds',
      knowledge: 'id, entryId, wisdomScore',
      lifePhases: 'id, phase, entryIds',
      moodMap: 'mood, recommendedEntryIds',
      meta: 'name, version, createdAt'
    });
  }
}

const db = new AtlasDatabase();

export class AtlasRepository {
  // Entry operations
  async getAllEntries(): Promise<AtlasEntry[]> {
    return await db.entries.toArray();
  }

  async getEntryById(id: string): Promise<AtlasEntry | null> {
    const entry = await db.entries.get(id);
    return entry || null;
  }

  async searchEntries(query: string): Promise<AtlasSearchResult[]> {
    const allEntries = await db.entries.toArray();
    const lowerQuery = query.toLowerCase();
    
    const results: AtlasSearchResult[] = [];
    
    for (const entry of allEntries) {
      const matchReasons: string[] = [];
      let relevanceScore = 0;
      
      // Title match (highest weight)
      if (entry.title.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 50;
        matchReasons.push('Title match');
      }
      
      // Original title match
      if (entry.originalTitle?.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 40;
        matchReasons.push('Original title match');
      }
      
      // Genre matches
      const genreMatches = entry.genres.filter(g => 
        g.toLowerCase().includes(lowerQuery)
      );
      if (genreMatches.length > 0) {
        relevanceScore += genreMatches.length * 15;
        matchReasons.push(`Genre: ${genreMatches.join(', ')}`);
      }
      
      // Theme matches
      const themeMatches = entry.themes.filter(t => 
        t.toLowerCase().includes(lowerQuery)
      );
      if (themeMatches.length > 0) {
        relevanceScore += themeMatches.length * 20;
        matchReasons.push(`Theme: ${themeMatches.join(', ')}`);
      }
      
      // Impact tag matches
      const impactMatches = entry.impactTags.filter(t => 
        t.toLowerCase().includes(lowerQuery)
      );
      if (impactMatches.length > 0) {
        relevanceScore += impactMatches.length * 25;
        matchReasons.push(`Impact: ${impactMatches.join(', ')}`);
      }
      
      // Description match
      if (entry.description.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 10;
        matchReasons.push('Description match');
      }
      
      // Why watch match
      if (entry.whyWatch.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 15;
        matchReasons.push('Editorial match');
      }
      
      if (relevanceScore > 0) {
        results.push({
          entry,
          relevanceScore,
          matchReasons
        });
      }
    }
    
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  async getEntriesByCategory(category: string): Promise<AtlasEntry[]> {
    return await db.entries.where('category').equals(category).toArray();
  }

  async getEntriesByTheme(theme: string): Promise<AtlasEntry[]> {
    const allEntries = await db.entries.toArray();
    return allEntries.filter(entry => 
      entry.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))
    );
  }

  async getEntriesByDifficulty(difficulty: string): Promise<AtlasEntry[]> {
    return await db.entries.where('difficulty').equals(difficulty).toArray();
  }

  async getEntriesByFilters(filters: AtlasDiscoveryFilters): Promise<AtlasEntry[]> {
    let query = db.entries.toCollection();
    const allEntries = await query.toArray();
    
    return allEntries.filter(entry => {
      // Category filter
      if (filters.category && !filters.category.includes(entry.category)) {
        return false;
      }
      
      // Difficulty filter
      if (filters.difficulty && !filters.difficulty.includes(entry.difficulty)) {
        return false;
      }
      
      // Themes filter
      if (filters.themes && filters.themes.length > 0) {
        const hasTheme = filters.themes.some(theme => 
          entry.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))
        );
        if (!hasTheme) return false;
      }
      
      // Impact tags filter
      if (filters.impactTags && filters.impactTags.length > 0) {
        const hasImpact = filters.impactTags.filter(tag => 
          entry.impactTags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
        ).length > 0;
        if (!hasImpact) return false;
      }
      
      // Emotional tone filter
      if (filters.emotionalTone && filters.emotionalTone.length > 0) {
        const hasTone = filters.emotionalTone.some(tone => 
          entry.emotionalTone.some(t => t.toLowerCase().includes(tone.toLowerCase()))
        );
        if (!hasTone) return false;
      }
      
      // Runtime filter
      if (filters.runtime && entry.runtime) {
        if (filters.runtime.min && entry.runtime < filters.runtime.min) return false;
        if (filters.runtime.max && entry.runtime > filters.runtime.max) return false;
      }
      
      // Year filter
      if (filters.year) {
        if (filters.year.min && entry.year < filters.year.min) return false;
        if (filters.year.max && entry.year > filters.year.max) return false;
      }
      
      // Recommended age filter
      if (filters.recommendedAge && entry.recommendedAge) {
        if (!filters.recommendedAge.includes(entry.recommendedAge)) return false;
      }
      
      return true;
    });
  }

  // Collection operations
  async getAllCollections(): Promise<AtlasCollection[]> {
    return await db.collections.toArray();
  }

  async getCollectionById(id: string): Promise<AtlasCollection | null> {
    const collection = await db.collections.get(id);
    return collection || null;
  }

  async getCollectionEntries(collectionId: string): Promise<AtlasEntry[]> {
    const collection = await this.getCollectionById(collectionId);
    if (!collection) return [];
    
    const entries: AtlasEntry[] = [];
    for (const entryId of collection.entryIds) {
      const entry = await this.getEntryById(entryId);
      if (entry) entries.push(entry);
    }
    return entries;
  }

  // Knowledge operations
  async getKnowledgeByEntryId(entryId: string): Promise<AtlasKnowledge | null> {
    const knowledge = await db.knowledge.where('entryId').equals(entryId).first();
    return knowledge || null;
  }

  // Life phase operations
  async getLifePhase(phase: string): Promise<AtlasLifePhase | null> {
    const lifePhase = await db.lifePhases.where('phase').equals(phase).first();
    return lifePhase || null;
  }

  async getLifePhaseEntries(phase: string): Promise<AtlasEntry[]> {
    const lifePhase = await this.getLifePhase(phase);
    if (!lifePhase) return [];
    
    const entries: AtlasEntry[] = [];
    for (const entryId of lifePhase.entryIds) {
      const entry = await this.getEntryById(entryId);
      if (entry) entries.push(entry);
    }
    return entries;
  }

  // Mood operations
  async getMoodRecommendations(mood: string): Promise<AtlasEntry[]> {
    const moodMap = await db.moodMap.where('mood').equals(mood).first();
    if (!moodMap) return [];
    
    const entries: AtlasEntry[] = [];
    for (const entryId of moodMap.recommendedEntryIds) {
      const entry = await this.getEntryById(entryId);
      if (entry) entries.push(entry);
    }
    return entries;
  }

  // Dataset operations
  async installDataset(dataset: AtlasDataset): Promise<void> {
    // Clear existing data
    await Promise.all([
      db.entries.clear(),
      db.collections.clear(),
      db.knowledge.clear(),
      db.lifePhases.clear(),
      db.moodMap.clear(),
      db.meta.clear()
    ]);
    
    // Install new data in batches for performance
    const batchSize = 100;
    
    // Install entries
    for (let i = 0; i < dataset.entries.length; i += batchSize) {
      const batch = dataset.entries.slice(i, i + batchSize);
      await db.entries.bulkAdd(batch);
    }
    
    // Install collections
    for (let i = 0; i < dataset.collections.length; i += batchSize) {
      const batch = dataset.collections.slice(i, i + batchSize);
      await db.collections.bulkAdd(batch);
    }
    
    // Install knowledge
    for (let i = 0; i < dataset.knowledge.length; i += batchSize) {
      const batch = dataset.knowledge.slice(i, i + batchSize);
      await db.knowledge.bulkAdd(batch);
    }
    
    // Install life phases
    await db.lifePhases.bulkAdd(dataset.lifePhases);
    
    // Install mood map
    await db.moodMap.bulkAdd(dataset.moodMap);
    
    // Install meta
    await db.meta.add(dataset.meta);
  }

  async getDatasetVersion(): Promise<string | null> {
    const meta = await db.meta.limit(1).first();
    return meta?.version || null;
  }

  async clearDataset(): Promise<void> {
    await Promise.all([
      db.entries.clear(),
      db.collections.clear(),
      db.knowledge.clear(),
      db.lifePhases.clear(),
      db.moodMap.clear(),
      db.meta.clear()
    ]);
  }

  // Statistics
  async getDatasetStats(): Promise<{
    entries: number;
    collections: number;
    knowledge: number;
    lifePhases: number;
    moodMaps: number;
    version: string | null;
  }> {
    const [entries, collections, knowledge, lifePhases, moodMaps, version] = await Promise.all([
      db.entries.count(),
      db.collections.count(),
      db.knowledge.count(),
      db.lifePhases.count(),
      db.moodMap.count(),
      this.getDatasetVersion()
    ]);
    
    return {
      entries,
      collections,
      knowledge,
      lifePhases,
      moodMaps,
      version
    };
  }

  // Advanced search with multiple criteria
  async advancedSearch(criteria: {
    query?: string;
    categories?: string[];
    difficulties?: string[];
    themes?: string[];
    impactTags?: string[];
    emotionalTones?: string[];
    yearRange?: { min?: number; max?: number };
    runtimeRange?: { min?: number; max?: number };
  }): Promise<AtlasSearchResult[]> {
    let entries: AtlasEntry[];
    
    if (criteria.query) {
      const searchResults = await this.searchEntries(criteria.query);
      entries = searchResults.map(r => r.entry);
    } else {
      entries = await this.getAllEntries();
    }
    
    // Apply filters
    const filtered = entries.filter(entry => {
      if (criteria.categories && !criteria.categories.includes(entry.category)) {
        return false;
      }
      
      if (criteria.difficulties && !criteria.difficulties.includes(entry.difficulty)) {
        return false;
      }
      
      if (criteria.themes && criteria.themes.length > 0) {
        const hasTheme = criteria.themes.some(theme => 
          entry.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))
        );
        if (!hasTheme) return false;
      }
      
      if (criteria.impactTags && criteria.impactTags.length > 0) {
        const hasImpact = criteria.impactTags.some(tag => 
          entry.impactTags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
        );
        if (!hasImpact) return false;
      }
      
      if (criteria.emotionalTones && criteria.emotionalTones.length > 0) {
        const hasTone = criteria.emotionalTones.some(tone => 
          entry.emotionalTone.some(t => t.toLowerCase().includes(tone.toLowerCase()))
        );
        if (!hasTone) return false;
      }
      
      if (criteria.yearRange) {
        if (criteria.yearRange.min && entry.year < criteria.yearRange.min) return false;
        if (criteria.yearRange.max && entry.year > criteria.yearRange.max) return false;
      }
      
      if (criteria.runtimeRange && entry.runtime) {
        if (criteria.runtimeRange.min && entry.runtime < criteria.runtimeRange.min) return false;
        if (criteria.runtimeRange.max && entry.runtime > criteria.runtimeRange.max) return false;
      }
      
      return true;
    });
    
    return filtered.map(entry => ({
      entry,
      relevanceScore: criteria.query ? this.calculateRelevanceScore(entry, criteria.query!) : 50,
      matchReasons: criteria.query ? this.getMatchReasons(entry, criteria.query!) : ['Filter match']
    }));
  }
  
  private calculateRelevanceScore(entry: AtlasEntry, query: string): number {
    const lowerQuery = query.toLowerCase();
    let score = 0;
    
    if (entry.title.toLowerCase().includes(lowerQuery)) score += 50;
    if (entry.originalTitle?.toLowerCase().includes(lowerQuery)) score += 40;
    score += entry.genres.filter(g => g.toLowerCase().includes(lowerQuery)).length * 15;
    score += entry.themes.filter(t => t.toLowerCase().includes(lowerQuery)).length * 20;
    score += entry.impactTags.filter(t => t.toLowerCase().includes(lowerQuery)).length * 25;
    if (entry.description.toLowerCase().includes(lowerQuery)) score += 10;
    if (entry.whyWatch.toLowerCase().includes(lowerQuery)) score += 15;
    
    return score;
  }
  
  private getMatchReasons(entry: AtlasEntry, query: string): string[] {
    const lowerQuery = query.toLowerCase();
    const reasons: string[] = [];
    
    if (entry.title.toLowerCase().includes(lowerQuery)) reasons.push('Title match');
    if (entry.originalTitle?.toLowerCase().includes(lowerQuery)) reasons.push('Original title match');
    
    const genreMatches = entry.genres.filter(g => g.toLowerCase().includes(lowerQuery));
    if (genreMatches.length > 0) reasons.push(`Genre: ${genreMatches.join(', ')}`);
    
    const themeMatches = entry.themes.filter(t => t.toLowerCase().includes(lowerQuery));
    if (themeMatches.length > 0) reasons.push(`Theme: ${themeMatches.join(', ')}`);
    
    const impactMatches = entry.impactTags.filter(t => t.toLowerCase().includes(lowerQuery));
    if (impactMatches.length > 0) reasons.push(`Impact: ${impactMatches.join(', ')}`);
    
    if (entry.description.toLowerCase().includes(lowerQuery)) reasons.push('Description match');
    if (entry.whyWatch.toLowerCase().includes(lowerQuery)) reasons.push('Editorial match');
    
    return reasons;
  }
}

// Singleton instance
export const atlasRepository = new AtlasRepository();
