import { db } from '@/db/KathaDb';
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

export class AtlasRepository {
  // Entry operations
  async getAllEntries(): Promise<AtlasEntry[]> {
    return await db.atlasEntries.toArray();
  }

  async getEntryById(id: string): Promise<AtlasEntry | null> {
    const entry = await db.atlasEntries.get(id);
    return entry || null;
  }

  async searchEntries(query: string): Promise<AtlasSearchResult[]> {
    const allEntries = await db.atlasEntries.toArray();
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
    return await db.atlasEntries.where('category').equals(category).toArray();
  }

  async getEntriesByTheme(theme: string): Promise<AtlasEntry[]> {
    const allEntries = await db.atlasEntries.toArray();
    return allEntries.filter(entry => 
      entry.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))
    );
  }

  async getEntriesByDifficulty(difficulty: string): Promise<AtlasEntry[]> {
    return await db.atlasEntries.where('difficulty').equals(difficulty).toArray();
  }

  async getEntriesByFilters(filters: AtlasDiscoveryFilters): Promise<AtlasEntry[]> {
    let query = db.atlasEntries.toCollection();
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
    return await db.atlasCollections.toArray();
  }

  async getCollectionById(id: string): Promise<AtlasCollection | null> {
    const collection = await db.atlasCollections.get(id);
    return collection || null;
  }

  async getCollectionEntries(collectionId: string): Promise<AtlasEntry[]> {
    const collection = await this.getCollectionById(collectionId);
    if (!collection) return [];
    
    return await db.atlasEntries.where('id').anyOf(collection.entryIds).toArray();
  }

  // Knowledge operations
  async getKnowledgeByEntryId(entryId: string): Promise<AtlasKnowledge | null> {
    const knowledge = await db.atlasKnowledge.where('entryId').equals(entryId).first();
    return knowledge || null;
  }

  // Life phase operations
  async getLifePhase(phase: string): Promise<AtlasLifePhase | null> {
    const lifePhase = await db.atlasLifePhases.where('phase').equals(phase).first();
    return lifePhase || null;
  }

  async getLifePhaseEntries(phase: string): Promise<AtlasEntry[]> {
    const lifePhase = await this.getLifePhase(phase);
    if (!lifePhase) return [];
    
    return await db.atlasEntries.where('id').anyOf(lifePhase.entryIds).toArray();
  }

  // Mood operations
  async getMoodRecommendations(mood: string): Promise<AtlasEntry[]> {
    const moodMap = await db.atlasMoodMap.get(mood);
    if (!moodMap) return [];
    
    return await db.atlasEntries.where('id').anyOf(moodMap.recommendedEntryIds).toArray();
  }

  // Meta operations
  async getAtlasVersion(): Promise<string> {
    const meta = await db.atlasMeta.get('core');
    return meta?.version || '0.0.0';
  }

  // Dataset operations
  async installDataset(dataset: AtlasDataset): Promise<void> {
    await db.transaction('rw', [
      db.atlasEntries, 
      db.atlasCollections, 
      db.atlasKnowledge, 
      db.atlasLifePhases, 
      db.atlasMoodMap, 
      db.atlasMeta
    ], async () => {
        // Clear existing data
        await db.atlasEntries.clear();
        await db.atlasCollections.clear();
        await db.atlasKnowledge.clear();
        await db.atlasLifePhases.clear();
        await db.atlasMoodMap.clear();

        // Install new data
        await db.atlasEntries.bulkAdd(dataset.entries);
        await db.atlasCollections.bulkAdd(dataset.collections);
        await db.atlasKnowledge.bulkAdd(dataset.knowledge);
        await db.atlasLifePhases.bulkAdd(dataset.lifePhases);
        await db.atlasMoodMap.bulkAdd(dataset.moodMap);

        // Update meta
        await db.atlasMeta.put({
          name: 'core',
          version: dataset.meta?.version || '1.0.0',
          createdAt: dataset.meta?.createdAt || new Date().toISOString(),
          entries: dataset.entries.length,
          sizeMB: 0,
          curator: dataset.meta?.curator || 'system',
          license: dataset.meta?.license || 'private'
        });
      }
    );
  }

  async clearDataset(): Promise<void> {
    await Promise.all([
      db.atlasEntries.clear(),
      db.atlasCollections.clear(),
      db.atlasKnowledge.clear(),
      db.atlasLifePhases.clear(),
      db.atlasMoodMap.clear(),
      db.atlasMeta.clear()
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
      db.atlasEntries.count(),
      db.atlasCollections.count(),
      db.atlasKnowledge.count(),
      db.atlasLifePhases.count(),
      db.atlasMoodMap.count(),
      this.getAtlasVersion()
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
