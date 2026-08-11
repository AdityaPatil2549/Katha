import Dexie, { Table } from 'dexie';
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
  PersonalReport
} from '@/types/personal';

class PersonalDatabase extends Dexie {
  profiles!: Table<PersonalProfile>;
  viewingHistory!: Table<ViewingHistory>;
  moodEntries!: Table<MoodEntry>;
  impactResponses!: Table<ImpactResponse>;
  personalGoals!: Table<PersonalGoal>;
  growthAreas!: Table<GrowthArea>;
  storyDNA!: Table<StoryDNA>;

  constructor() {
    super('KathaPersonalDatabase');
    
    this.version(1).stores({
      profiles: 'id, createdAt, updatedAt, lifePhase',
      viewingHistory: 'id, entryId, timestamp, completed, rating',
      moodEntries: 'id, timestamp, mood, intensity',
      impactResponses: 'id, entryId, timestamp, impactType, intensity',
      personalGoals: 'id, category, priority, progress',
      growthAreas: 'id, area, currentLevel, targetLevel',
      storyDNA: 'id, entryId'
    });
  }
}

const db = new PersonalDatabase();

export class PersonalRepository implements PersonalIntelligenceEngine {
  // Profile management
  async getProfile(): Promise<PersonalProfile | null> {
    try {
      const profile = await db.profiles.limit(1).first();
      return profile || null;
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  }

  async updateProfile(updates: Partial<PersonalProfile>): Promise<void> {
    try {
      const existingProfile = await this.getProfile();
      if (existingProfile) {
        await db.profiles.update(existingProfile.id, {
          ...updates,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  async createProfile(profile: Omit<PersonalProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const id = crypto.randomUUID();
      const newProfile: PersonalProfile = {
        ...profile,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.profiles.add(newProfile);
      return id;
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  }

  // Learning and adaptation
  async recordViewing(viewing: Omit<ViewingHistory, 'id' | 'timestamp'>): Promise<void> {
    try {
      const id = crypto.randomUUID();
      const newViewing: ViewingHistory = {
        ...viewing,
        id,
        timestamp: new Date()
      };
      await db.viewingHistory.add(newViewing);
      
      // Update learning profile based on viewing
      await this.updateLearningFromViewing(newViewing);
    } catch (error) {
      console.error('Failed to record viewing:', error);
      throw error;
    }
  }

  async recordMood(mood: Omit<MoodEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const id = crypto.randomUUID();
      const newMood: MoodEntry = {
        ...mood,
        id,
        timestamp: new Date()
      };
      await db.moodEntries.add(newMood);
      
      // Update emotional patterns
      await this.updateEmotionalPatterns(newMood);
    } catch (error) {
      console.error('Failed to record mood:', error);
      throw error;
    }
  }

  async recordImpact(impact: Omit<ImpactResponse, 'id' | 'timestamp'>): Promise<void> {
    try {
      const id = crypto.randomUUID();
      const newImpact: ImpactResponse = {
        ...impact,
        id,
        timestamp: new Date()
      };
      await db.impactResponses.add(newImpact);
      
      // Update growth areas based on impact
      await this.updateGrowthFromImpact(newImpact);
    } catch (error) {
      console.error('Failed to record impact:', error);
      throw error;
    }
  }

  // Personalization
  async getPersonalizedRecommendations(context: RecommendationContext): Promise<PersonalizedRecommendation[]> {
    try {
      const profile = await this.getProfile();
      if (!profile) return [];

      const recentViewings = await db.viewingHistory
        .orderBy('timestamp')
        .reverse()
        .limit(10)
        .toArray();

      const recentMoods = await db.moodEntries
        .orderBy('timestamp')
        .reverse()
        .limit(7)
        .toArray();

      // Generate personalized recommendations based on profile and context
      const recommendations = await this.generatePersonalizedRecommendations(
        profile, 
        context, 
        recentViewings, 
        recentMoods
      );

      return recommendations;
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      return [];
    }
  }

  async analyzeEmotionalTrends(timeframe: TimeFrame): Promise<EmotionalAnalysis> {
    try {
      const moods = await db.moodEntries
        .where('timestamp')
        .between(timeframe.start, timeframe.end)
        .toArray();

      if (moods.length === 0) {
        return {
          overallTrend: 'stable',
          patterns: { daily: [], weekly: [], monthly: [] },
          triggers: { positive: [], negative: [] },
          recommendations: []
        };
      }

      const analysis = await this.performEmotionalAnalysis(moods);
      return analysis;
    } catch (error) {
      console.error('Failed to analyze emotional trends:', error);
      throw error;
    }
  }

  async predictOptimalViewingTime(): Promise<ViewingRecommendation> {
    try {
      const profile = await this.getProfile();
      if (!profile) {
        return {
          optimalTime: 'Evening',
          expectedMood: 'Neutral',
          preparationActivities: [],
          postViewingReflection: []
        };
      }

      const moodPatterns = profile.emotionalProfile.moodPatterns;
      const learningProfile = profile.learningProfile;
      
      // Analyze best viewing times based on mood patterns and learning profile
      const recommendation = this.generateViewingRecommendation(moodPatterns, learningProfile);
      
      return recommendation;
    } catch (error) {
      console.error('Failed to predict optimal viewing time:', error);
      throw error;
    }
  }

  // Growth tracking
  async getGrowthInsights(): Promise<GrowthInsight[]> {
    try {
      const impacts = await db.impactResponses
        .orderBy('timestamp')
        .reverse()
        .limit(50)
        .toArray();

      const goals = await db.personalGoals.toArray();
      const growthAreas = await db.growthAreas.toArray();

      const insights = await this.generateGrowthInsights(impacts, goals, growthAreas);
      return insights;
    } catch (error) {
      console.error('Failed to get growth insights:', error);
      return [];
    }
  }

  async generatePersonalReport(): Promise<PersonalReport> {
    try {
      const profile = await this.getProfile();
      if (!profile) {
        throw new Error('No profile found');
      }

      const emotionalAnalysis = await this.analyzeEmotionalTrends({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date(),
        type: 'month'
      });

      const growthInsights = await this.getGrowthInsights();
      const goals = await db.personalGoals.toArray();

      const report = await this.buildPersonalReport(profile, emotionalAnalysis, growthInsights, goals);
      return report;
    } catch (error) {
      console.error('Failed to generate personal report:', error);
      throw error;
    }
  }

  // Private helper methods
  private async updateLearningFromViewing(viewing: ViewingHistory): Promise<void> {
    try {
      const profile = await this.getProfile();
      if (!profile) return;

      // Update learning profile based on viewing patterns
      const moodChange = this.calculateMoodChange(viewing.moodBefore, viewing.moodAfter);
      const impactLevel = viewing.impactLevel;

      // Adjust learning profile based on response patterns
      const updatedLearningProfile = {
        ...profile.learningProfile,
        comprehensionLevel: Math.min(10, profile.learningProfile.comprehensionLevel + (impactLevel > 7 ? 0.1 : 0)),
        associationStrength: Math.min(10, profile.learningProfile.associationStrength + (viewing.keyInsights?.length || 0) * 0.1)
      };

      await this.updateProfile({ learningProfile: updatedLearningProfile });
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
      
      // Update mood patterns based on time of day
      const updatedPatterns = { ...profile.emotionalProfile.moodPatterns };
      
      if (hour >= 6 && hour < 12) {
        updatedPatterns.morning.push(mood.mood);
      } else if (hour >= 12 && hour < 18) {
        updatedPatterns.afternoon.push(mood.mood);
      } else {
        updatedPatterns.evening.push(mood.mood);
      }

      if (dayOfWeek >= 5) {
        updatedPatterns.weekend.push(mood.mood);
      }

      await this.updateProfile({ 
        emotionalProfile: { 
          ...profile.emotionalProfile, 
          moodPatterns: updatedPatterns 
        } 
      });
    } catch (error) {
      console.error('Failed to update emotional patterns:', error);
    }
  }

  private async updateGrowthFromImpact(impact: ImpactResponse): Promise<void> {
    try {
      const profile = await this.getProfile();
      if (!profile) return;

      // Update growth areas based on impact responses
      const updatedGrowthAreas = profile.growthAreas.map((area: any) => {
        if (area.relatedStoryThemes && area.relatedStoryThemes.includes(impact.impactType)) {
          return {
            ...area,
            progress: Math.min(100, area.progress + (impact.intensity * 2)),
            lastAssessment: new Date()
          };
        }
        return area;
      });

      await this.updateProfile({ growthAreas: updatedGrowthAreas });
    } catch (error) {
      console.error('Failed to update growth from impact:', error);
    }
  }

  private calculateMoodChange(before: string, after: string): number {
    // Simple mood change calculation - can be enhanced
    const moodValues: { [key: string]: number } = {
      'terrible': 1, 'bad': 2, 'neutral': 3, 'good': 4, 'excellent': 5,
      'anxious': 2, 'stressed': 2, 'calm': 4, 'excited': 5, 'motivated': 5
    };
    
    const beforeValue = moodValues[before] || 3;
    const afterValue = moodValues[after] || 3;
    
    return afterValue - beforeValue;
  }

  private async generatePersonalizedRecommendations(
    profile: PersonalProfile,
    context: RecommendationContext,
    recentViewings: ViewingHistory[],
    recentMoods: MoodEntry[]
  ): Promise<PersonalizedRecommendation[]> {
    // This is a simplified version - in production would use more sophisticated algorithms
    const recommendations: PersonalizedRecommendation[] = [];
    
    // Generate recommendations based on profile and context
    const preferredThemes = profile.storyPreferences.preferredThemes;
    const currentMood = context.currentMood || recentMoods[0]?.mood || 'neutral';
    
    // Mock recommendations - would integrate with AtlasRepository
    recommendations.push({
      entryId: 'atlas-001',
      relevanceScore: 85,
      personalReasoning: `Based on your current ${currentMood} mood and preference for ${preferredThemes.join(', ')}`,
      expectedImpact: 'Emotional uplift and perspective shift',
      optimalTiming: 'Evening when you have time to reflect',
      preparationTips: ['Set aside quiet time', 'Have a journal ready'],
      followUpQuestions: ['How did this change your perspective?', 'What insights will you apply?']
    });

    return recommendations;
  }

  private async performEmotionalAnalysis(moods: MoodEntry[]): Promise<EmotionalAnalysis> {
    // Simplified emotional analysis
    const moodCounts: { [key: string]: number } = {};
    moods.forEach(mood => {
      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
    });

    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
      (moodCounts[a] || 0) > (moodCounts[b] || 0) ? a : b
    );

    return {
      overallTrend: 'stable',
      patterns: {
        daily: moods.map(m => ({
          timestamp: m.timestamp,
          mood: m.mood,
          energy: 5,
          stress: 5,
          context: m.context
        })),
        weekly: [],
        monthly: []
      },
      triggers: {
        positive: ['Story completion', 'Reflection time'],
        negative: ['Stress', 'Time pressure']
      },
      recommendations: [`Continue exploring ${mostCommonMood} themes`]
    };
  }

  private generateViewingRecommendation(
    moodPatterns: any,
    learningProfile: any
  ): ViewingRecommendation {
    // Simplified viewing recommendation
    return {
      optimalTime: 'Evening',
      expectedMood: 'Reflective',
      preparationActivities: ['Light exercise', 'Meditation'],
      postViewingReflection: ['Journal key insights', 'Discuss with friend'],
      companionSuggestions: ['Watch with someone who enjoys deep conversations']
    };
  }

  private async generateGrowthInsights(
    impacts: ImpactResponse[],
    goals: PersonalGoal[],
    growthAreas: GrowthArea[]
  ): Promise<GrowthInsight[]> {
    // Simplified growth insights
    const insights: GrowthInsight[] = [];
    
    insights.push({
      id: crypto.randomUUID(),
      area: 'Emotional Intelligence',
      insight: 'You show strong emotional responses to philosophical content',
      evidence: impacts.map(i => i.impactType).slice(0, 3),
      recommendations: ['Explore more philosophical themes', 'Practice emotional reflection'],
      relatedStories: impacts.slice(0, 3).map(i => i.entryId),
      timestamp: new Date()
    });

    return insights;
  }

  private async buildPersonalReport(
    profile: PersonalProfile,
    emotionalAnalysis: EmotionalAnalysis,
    growthInsights: GrowthInsight[],
    goals: PersonalGoal[]
  ): Promise<PersonalReport> {
    // Simplified personal report
    return {
      summary: `You are in the ${profile.lifePhase} phase with strong growth in emotional intelligence.`,
      emotionalJourney: {
        overallTrend: emotionalAnalysis.overallTrend,
        biggestChanges: ['Increased emotional awareness', 'Better mood regulation'],
        stablePatterns: ['Evening reflection time', 'Weekend exploration'],
        breakthroughMoments: ['First philosophical insight', 'Major perspective shift']
      },
      growthProgress: profile.growthAreas.map((area: any) => ({
        area: area.area,
        currentLevel: area.currentLevel,
        previousLevel: Math.max(1, area.currentLevel - 1),
        growth: 1,
        keyContributors: ['Consistent viewing', 'Reflection practice'],
        nextMilestones: ['Advanced exploration', 'Teaching others']
      })),
      topInsights: growthInsights.map(i => i.insight),
      recommendations: ['Continue evening viewing', 'Explore new themes', 'Share insights'],
      nextSteps: ['Set new learning goals', 'Expand comfort zone', 'Deepen practice'],
      generatedAt: new Date()
    };
  }
}

// Singleton instance
export const personalRepository = new PersonalRepository();
