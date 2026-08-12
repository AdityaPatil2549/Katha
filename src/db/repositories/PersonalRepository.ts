import { db } from '@/db/KathaDb';
import { geminiService } from '../../services/GeminiService';
import type {
  PersonalProfile,
  ViewingHistory,
  MoodEntry,
  ImpactResponse,
  PersonalGoal,
  GrowthArea,
  StoryDNA,
  PersonalIntelligenceEngine,
  RecommendationContext,
  PersonalizedRecommendation,
  EmotionalAnalysis,
  ViewingRecommendation,
  TimeFrame,
  GrowthInsight,
  PersonalReport,
  JournalEntry,
} from '@/types/personal';

// ─── Repository ───────────────────────────────────────────────────────────────
export class PersonalRepository implements PersonalIntelligenceEngine {

  // ── Profile management ──────────────────────────────────────────────────────
  async getProfile(): Promise<PersonalProfile | null> {
    try {
      return (await db.profiles.limit(1).first()) ?? null;
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  }

  async updateProfile(updates: Partial<PersonalProfile>): Promise<void> {
    try {
      const existing = await this.getProfile();
      if (existing) {
        await db.profiles.update(existing.id, { ...updates, updatedAt: new Date() });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  async createProfile(
    profile: Omit<PersonalProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const id = crypto.randomUUID();
      await db.profiles.add({ ...profile, id, createdAt: new Date(), updatedAt: new Date() });
      return id;
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  }

  // ── Learning and adaptation ─────────────────────────────────────────────────
  async recordViewing(viewing: Omit<ViewingHistory, 'id' | 'timestamp'>): Promise<void> {
    try {
      const newViewing: ViewingHistory = {
        ...viewing,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      await db.viewingHistory.add(newViewing);
      await this.updateLearningFromViewing(newViewing);
    } catch (error) {
      console.error('Failed to record viewing:', error);
      throw error;
    }
  }

  async recordMood(mood: Omit<MoodEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const newMood: MoodEntry = {
        ...mood,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      await db.personalMoodEntries.add(newMood);
      await this.updateEmotionalPatterns(newMood);
    } catch (error) {
      console.error('Failed to record mood:', error);
      throw error;
    }
  }

  async recordImpact(impact: Omit<ImpactResponse, 'id' | 'timestamp'>): Promise<void> {
    try {
      const newImpact: ImpactResponse = {
        ...impact,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      await db.impactResponses.add(newImpact);
      await this.updateGrowthFromImpact(newImpact);
    } catch (error) {
      console.error('Failed to record impact:', error);
      throw error;
    }
  }

  async addJournalEntry(content: string, tags: string[] = []): Promise<string> {
    try {
      const embedding = await geminiService.generateEmbedding(content);
      const id = crypto.randomUUID();
      await db.journalEntries.add({
        id,
        timestamp: new Date(),
        content,
        tags,
        embedding: embedding ?? undefined,
      });
      return id;
    } catch (error) {
      console.error('Failed to add journal entry:', error);
      throw error;
    }
  }

  // ── Journal retrieval ───────────────────────────────────────────────────────
  /**
   * Returns all journal entries sorted newest-first, without any AI search.
   */
  async getAllJournalEntries(): Promise<JournalEntry[]> {
    try {
      return await db.journalEntries.orderBy('timestamp').reverse().toArray();
    } catch (error) {
      console.error('Failed to get journal entries:', error);
      return [];
    }
  }

  async getMoodHistory(timeframe: TimeFrame): Promise<MoodEntry[]> {
    try {
      const fromDate = this.getDateFromTimeframe(timeframe);
      return await db.personalMoodEntries
        .where('timestamp')
        .aboveOrEqual(fromDate)
        .toArray();
    } catch (error) {
      console.error('Failed to get journal entries:', error);
      return [];
    }
  }

  /**
   * Semantic journal search using vector dot-product similarity.
   *
   * Gemini embedding vectors are L2-normalized (unit length), so the dot product
   * between two embeddings equals their cosine similarity — no magnitude division needed.
   * Threshold of 0.5 filters out weak associations; adjust down to 0.3 for broader recall.
   */
  async semanticSearchJournals(
    query: string,
    limit = 5
  ): Promise<Array<JournalEntry & { score: number }>> {
    try {
      const queryEmbedding = await geminiService.generateEmbedding(query);
      if (!queryEmbedding) return [];

      const allEntries = await db.journalEntries.toArray();

      const scored = allEntries.map(entry => {
        let score = 0;
        if (entry.embedding && entry.embedding.length === queryEmbedding.length) {
          for (let i = 0; i < queryEmbedding.length; i++) {
            score += queryEmbedding[i]! * entry.embedding[i]!;
          }
        }
        return { ...entry, score };
      });

      return scored
        .filter(s => s.score > 0.5)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to search journals:', error);
      return [];
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private getDateFromTimeframe(timeframe: TimeFrame): Date {
    const now = new Date();
    switch (timeframe.type) {
      case 'day': return new Date(now.setHours(0, 0, 0, 0));
      case 'week': return new Date(now.setDate(now.getDate() - 7));
      case 'month': return new Date(now.setMonth(now.getMonth() - 1));
      case 'year': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return timeframe.start || new Date(0);
    }
  }

  // ── Personalization ─────────────────────────────────────────────────────────
  async getPersonalizedRecommendations(
    context: RecommendationContext
  ): Promise<PersonalizedRecommendation[]> {
    try {
      const profile = await this.getProfile();
      if (!profile) return [];

      const [recentViewings, recentMoods] = await Promise.all([
        db.viewingHistory.orderBy('timestamp').reverse().limit(10).toArray(),
        db.personalMoodEntries.orderBy('timestamp').reverse().limit(7).toArray(),
      ]);

      return this.generatePersonalizedRecommendations(profile, context, recentViewings, recentMoods);
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      return [];
    }
  }

  async analyzeEmotionalTrends(timeframe: TimeFrame): Promise<EmotionalAnalysis> {
    const empty: EmotionalAnalysis = {
      overallTrend: 'stable',
      patterns: { daily: [], weekly: [], monthly: [] },
      triggers: { positive: [], negative: [] },
      recommendations: [],
    };
    try {
      const moods = await db.personalMoodEntries
        .where('timestamp')
        .between(timeframe.start, timeframe.end)
        .toArray();
      return moods.length === 0 ? empty : this.performEmotionalAnalysis(moods);
    } catch (error) {
      console.error('Failed to analyze emotional trends:', error);
      return empty;
    }
  }

  async predictOptimalViewingTime(): Promise<ViewingRecommendation> {
    const fallback: ViewingRecommendation = {
      optimalTime: 'Evening',
      expectedMood: 'Neutral',
      preparationActivities: [],
      postViewingReflection: [],
    };
    try {
      const profile = await this.getProfile();
      if (!profile) return fallback;
      return this.generateViewingRecommendation(
        profile.emotionalProfile.moodPatterns,
        profile.learningProfile
      );
    } catch (error) {
      console.error('Failed to predict optimal viewing time:', error);
      return fallback;
    }
  }

  // ── Growth tracking ─────────────────────────────────────────────────────────
  async getGrowthInsights(): Promise<GrowthInsight[]> {
    try {
      const [impacts, goals, growthAreas] = await Promise.all([
        db.impactResponses.orderBy('timestamp').reverse().limit(50).toArray(),
        db.personalGoals.toArray(),
        db.growthAreas.toArray(),
      ]);
      return this.generateGrowthInsights(impacts, goals, growthAreas);
    } catch (error) {
      console.error('Failed to get growth insights:', error);
      return [];
    }
  }

  async generatePersonalReport(): Promise<PersonalReport> {
    try {
      const profile = await this.getProfile();
      if (!profile) throw new Error('No profile found');

      const [emotionalAnalysis, growthInsights, goals] = await Promise.all([
        this.analyzeEmotionalTrends({
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
          type: 'month',
        }),
        this.getGrowthInsights(),
        db.personalGoals.toArray(),
      ]);

      return this.buildPersonalReport(profile, emotionalAnalysis, growthInsights, goals);
    } catch (error) {
      console.error('Failed to generate personal report:', error);
      throw error;
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────
  private async updateLearningFromViewing(viewing: ViewingHistory): Promise<void> {
    try {
      const profile = await this.getProfile();
      if (!profile) return;
      const updatedLearning = {
        ...profile.learningProfile,
        comprehensionLevel: Math.min(
          10,
          profile.learningProfile.comprehensionLevel + (viewing.impactLevel > 7 ? 0.1 : 0)
        ),
        associationStrength: Math.min(
          10,
          profile.learningProfile.associationStrength + (viewing.keyInsights?.length ?? 0) * 0.1
        ),
      };
      await this.updateProfile({ learningProfile: updatedLearning });
    } catch (error) {
      console.error('Failed to update learning from viewing:', error);
    }
  }

  private async updateEmotionalPatterns(mood: MoodEntry): Promise<void> {
    try {
      const profile = await this.getProfile();
      if (!profile) return;

      const hour = mood.timestamp.getHours();
      const dayOfWeek = mood.timestamp.getDay();
      const updatedPatterns = { ...profile.emotionalProfile.moodPatterns };

      if (hour >= 6 && hour < 12) updatedPatterns.morning.push(mood.mood);
      else if (hour >= 12 && hour < 18) updatedPatterns.afternoon.push(mood.mood);
      else updatedPatterns.evening.push(mood.mood);

      if (dayOfWeek >= 5) updatedPatterns.weekend.push(mood.mood);

      await this.updateProfile({
        emotionalProfile: { ...profile.emotionalProfile, moodPatterns: updatedPatterns },
      });
    } catch (error) {
      console.error('Failed to update emotional patterns:', error);
    }
  }

  private async updateGrowthFromImpact(impact: ImpactResponse): Promise<void> {
    try {
      const profile = await this.getProfile();
      if (!profile) return;

      // GrowthArea is properly typed — no `any` cast needed.
      const updatedGrowthAreas = profile.growthAreas.map((area: GrowthArea) => {
        if (area.relatedStoryThemes?.includes(impact.impactType)) {
          return {
            ...area,
            progress: Math.min(100, area.progress + impact.intensity * 2),
            lastAssessment: new Date(),
          };
        }
        return area;
      });

      await this.updateProfile({ growthAreas: updatedGrowthAreas });
    } catch (error) {
      console.error('Failed to update growth from impact:', error);
    }
  }

  private generatePersonalizedRecommendations(
    profile: PersonalProfile,
    context: RecommendationContext,
    recentViewings: ViewingHistory[],
    recentMoods: MoodEntry[]
  ): PersonalizedRecommendation[] {
    const currentMood = context.currentMood ?? recentMoods[0]?.mood ?? 'neutral';
    const preferredThemes = profile.storyPreferences.preferredThemes;

    return [
      {
        entryId: 'atlas-001',
        relevanceScore: 85,
        personalReasoning: `Based on your current ${currentMood} mood and preference for ${preferredThemes.join(', ')}`,
        expectedImpact: 'Emotional uplift and perspective shift',
        optimalTiming: 'Evening when you have time to reflect',
        preparationTips: ['Set aside quiet time', 'Have a journal ready'],
        followUpQuestions: ['How did this change your perspective?', 'What insights will you apply?'],
      },
    ];
  }

  private performEmotionalAnalysis(moods: MoodEntry[]): EmotionalAnalysis {
    const moodCounts: Record<string, number> = {};
    for (const m of moods) {
      moodCounts[m.mood] = (moodCounts[m.mood] ?? 0) + 1;
    }
    const mostCommon = Object.keys(moodCounts).reduce((a, b) =>
      (moodCounts[a] ?? 0) > (moodCounts[b] ?? 0) ? a : b
    );

    return {
      overallTrend: 'stable',
      patterns: {
        daily: moods.map(m => ({
          timestamp: m.timestamp,
          mood: m.mood,
          energy: 5,
          stress: 5,
          context: m.context,
        })),
        weekly: [],
        monthly: [],
      },
      triggers: {
        positive: ['Story completion', 'Reflection time'],
        negative: ['Stress', 'Time pressure'],
      },
      recommendations: [`Continue exploring ${mostCommon} themes`],
    };
  }

  private generateViewingRecommendation(
    _moodPatterns: PersonalProfile['emotionalProfile']['moodPatterns'],
    _learningProfile: PersonalProfile['learningProfile']
  ): ViewingRecommendation {
    return {
      optimalTime: 'Evening',
      expectedMood: 'Reflective',
      preparationActivities: ['Light exercise', 'Meditation'],
      postViewingReflection: ['Journal key insights', 'Discuss with a friend'],
      companionSuggestions: ['Watch with someone who enjoys deep conversations'],
    };
  }

  private generateGrowthInsights(
    impacts: ImpactResponse[],
    _goals: PersonalGoal[],
    _growthAreas: GrowthArea[]
  ): GrowthInsight[] {
    return [
      {
        id: crypto.randomUUID(),
        area: 'Emotional Intelligence',
        insight: 'You show strong emotional responses to philosophical content',
        evidence: impacts.map(i => i.impactType).slice(0, 3),
        recommendations: ['Explore more philosophical themes', 'Practice emotional reflection'],
        relatedStories: impacts.slice(0, 3).map(i => i.entryId),
        timestamp: new Date(),
      },
    ];
  }

  private buildPersonalReport(
    profile: PersonalProfile,
    emotionalAnalysis: EmotionalAnalysis,
    growthInsights: GrowthInsight[],
    _goals: PersonalGoal[]
  ): PersonalReport {
    return {
      summary: `You are in the ${profile.lifePhase} phase with strong growth in emotional intelligence.`,
      emotionalJourney: {
        overallTrend: emotionalAnalysis.overallTrend,
        biggestChanges: ['Increased emotional awareness', 'Better mood regulation'],
        stablePatterns: ['Evening reflection time', 'Weekend exploration'],
        breakthroughMoments: ['First philosophical insight', 'Major perspective shift'],
      },
      growthProgress: profile.growthAreas.map((area: GrowthArea) => ({
        area: area.area,
        currentLevel: area.currentLevel,
        previousLevel: Math.max(1, area.currentLevel - 1),
        growth: 1,
        keyContributors: ['Consistent viewing', 'Reflection practice'],
        nextMilestones: ['Advanced exploration', 'Teaching others'],
      })),
      topInsights: growthInsights.map(i => i.insight),
      recommendations: ['Continue evening viewing', 'Explore new themes', 'Share insights'],
      nextSteps: ['Set new learning goals', 'Expand comfort zone', 'Deepen practice'],
      generatedAt: new Date(),
    };
  }
}

export const personalRepository = new PersonalRepository();
