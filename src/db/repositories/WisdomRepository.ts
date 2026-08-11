import Dexie, { Table } from 'dexie';
import type { 
  PersonalWisdom,
  PersonalInsight,
  PersonalPrinciple,
  PersonalQuote,
  PersonalStory,
  KnowledgeConnection,
  WisdomTheme,
  LifeLesson,
  PersonalPhilosophy,
  LegacyDocument,
  WisdomRepository as IWisdomRepository
} from '@/types/knowledge';

class WisdomDatabase extends Dexie {
  wisdom!: Table<PersonalWisdom>;
  insights!: Table<PersonalInsight>;
  principles!: Table<PersonalPrinciple>;
  quotes!: Table<PersonalQuote>;
  stories!: Table<PersonalStory>;
  connections!: Table<KnowledgeConnection>;
  themes!: Table<WisdomTheme>;
  lifeLessons!: Table<LifeLesson>;
  philosophies!: Table<PersonalPhilosophy>;
  legacyDocuments!: Table<LegacyDocument>;

  constructor() {
    super('KathaWisdomDatabase');
    
    this.version(1).stores({
      wisdom: 'id, createdAt, updatedAt',
      insights: 'id, timestamp, sourceEntryId, category, depth',
      principles: 'id, timestamp, name, category, importance',
      quotes: 'id, timestamp, content, source, resonance',
      stories: 'id, timestamp, title, genre, sharingLevel',
      connections: 'id, sourceId, targetId, sourceType, targetType, strength',
      themes: 'id, name, category, importance, currentStatus',
      lifeLessons: 'id, timestamp, title, category, value',
      philosophies: 'id, timestamp, title',
      legacyDocuments: 'id, timestamp, title, type, sharingLevel'
    });
  }
}

const db = new WisdomDatabase();

export class WisdomRepository implements IWisdomRepository {
  // Wisdom CRUD operations
  async saveWisdom(wisdom: PersonalWisdom): Promise<void> {
    try {
      await db.wisdom.put(wisdom);
      
      // Save related elements
      if (wisdom.insights.length > 0) {
        await db.insights.bulkPut(wisdom.insights);
      }
      if (wisdom.principles.length > 0) {
        await db.principles.bulkPut(wisdom.principles);
      }
      if (wisdom.quotes.length > 0) {
        await db.quotes.bulkPut(wisdom.quotes);
      }
      if (wisdom.stories) {
        await db.stories.put(wisdom.stories);
      }
      if (wisdom.knowledgeGraph.length > 0) {
        await db.connections.bulkPut(wisdom.knowledgeGraph);
      }
      if (wisdom.wisdomThemes.length > 0) {
        await db.themes.bulkPut(wisdom.wisdomThemes);
      }
      if (wisdom.lifeLessons.length > 0) {
        await db.lifeLessons.bulkPut(wisdom.lifeLessons);
      }
      if (wisdom.personalPhilosophy) {
        await db.philosophies.put(wisdom.personalPhilosophy);
      }
      if (wisdom.legacyDocument) {
        await db.legacyDocuments.put(wisdom.legacyDocument);
      }
    } catch (error) {
      console.error('Failed to save wisdom:', error);
      throw error;
    }
  }

  async getWisdom(): Promise<PersonalWisdom | null> {
    try {
      const wisdom = await db.wisdom.limit(1).first();
      if (!wisdom) return null;

      // Load related elements
      const insights = await db.insights.toArray();
      const principles = await db.principles.toArray();
      const quotes = await db.quotes.toArray();
      const stories = await db.stories.limit(1).first();
      const knowledgeGraph = await db.connections.toArray();
      const wisdomThemes = await db.themes.toArray();
      const lifeLessons = await db.lifeLessons.toArray();
      const personalPhilosophy = await db.philosophies.limit(1).first();
      const legacyDocument = await db.legacyDocuments.limit(1).first();

      return {
        ...wisdom,
        insights,
        principles,
        quotes,
        stories: stories || {} as PersonalStory,
        knowledgeGraph,
        wisdomThemes,
        lifeLessons,
        personalPhilosophy: personalPhilosophy || {} as PersonalPhilosophy,
        legacyDocument: legacyDocument || {} as LegacyDocument
      };
    } catch (error) {
      console.error('Failed to get wisdom:', error);
      return null;
    }
  }

  async updateWisdom(updates: Partial<PersonalWisdom>): Promise<void> {
    try {
      const existingWisdom = await this.getWisdom();
      if (!existingWisdom) return;

      const updatedWisdom = {
        ...existingWisdom,
        ...updates,
        updatedAt: new Date()
      };

      await db.wisdom.put(updatedWisdom);
    } catch (error) {
      console.error('Failed to update wisdom:', error);
      throw error;
    }
  }

  // Search functionality
  async searchWisdom(query: string): Promise<any[]> {
    try {
      const results: any[] = [];
      const lowerQuery = query.toLowerCase();

      // Search insights
      const insights = await db.insights
        .filter(insight => 
          insight.title.toLowerCase().includes(lowerQuery) ||
          insight.description.toLowerCase().includes(lowerQuery) ||
          insight.category.toLowerCase().includes(lowerQuery)
        )
        .toArray();
      
      results.push(...insights.map(insight => ({ type: 'insight', ...insight })));

      // Search principles
      const principles = await db.principles
        .filter(principle => 
          principle.name.toLowerCase().includes(lowerQuery) ||
          principle.description.toLowerCase().includes(lowerQuery) ||
          principle.category.toLowerCase().includes(lowerQuery)
        )
        .toArray();
      
      results.push(...principles.map(principle => ({ type: 'principle', ...principle })));

      // Search quotes
      const quotes = await db.quotes
        .filter(quote => 
          quote.content.toLowerCase().includes(lowerQuery) ||
          quote.source.toLowerCase().includes(lowerQuery) ||
          quote.personalMeaning.toLowerCase().includes(lowerQuery)
        )
        .toArray();
      
      results.push(...quotes.map(quote => ({ type: 'quote', ...quote })));

      // Search stories
      const stories = await db.stories
        .filter(story => 
          story.title.toLowerCase().includes(lowerQuery) ||
          story.narrative.toLowerCase().includes(lowerQuery)
        )
        .toArray();
      
      results.push(...stories.map(story => ({ type: 'story', ...story })));

      // Search life lessons
      const lifeLessons = await db.lifeLessons
        .filter(lesson => 
          lesson.title.toLowerCase().includes(lowerQuery) ||
          lesson.description.toLowerCase().includes(lowerQuery)
        )
        .toArray();
      
      results.push(...lifeLessons.map(lesson => ({ type: 'lifeLesson', ...lesson })));

      return results;
    } catch (error) {
      console.error('Failed to search wisdom:', error);
      return [];
    }
  }

  // Export functionality
  async exportWisdom(format: 'json' | 'pdf' | 'markdown'): Promise<Blob> {
    try {
      const wisdom = await this.getWisdom();
      if (!wisdom) throw new Error('No wisdom data to export');

      switch (format) {
        case 'json':
          return new Blob([JSON.stringify(wisdom, null, 2)], { type: 'application/json' });
        
        case 'markdown':
          const markdown = this.generateMarkdownExport(wisdom);
          return new Blob([markdown], { type: 'text/markdown' });
        
        case 'pdf':
          // For PDF export, we'd need a library like jsPDF
          // For now, return markdown that can be converted
          const pdfContent = this.generateMarkdownExport(wisdom);
          return new Blob([pdfContent], { type: 'text/plain' });
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Failed to export wisdom:', error);
      throw error;
    }
  }

  // Import functionality
  async importWisdom(data: any): Promise<void> {
    try {
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }

      // Validate data structure
      if (!data.id || !data.createdAt) {
        throw new Error('Invalid wisdom data structure');
      }

      await this.saveWisdom(data);
    } catch (error) {
      console.error('Failed to import wisdom:', error);
      throw error;
    }
  }

  // Individual element operations
  async addInsight(insight: Omit<PersonalInsight, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    const newInsight: PersonalInsight = {
      ...insight,
      id,
      timestamp: new Date(),
      evolutionHistory: [],
      appliedCount: 0,
      currentRelevance: 5
    };

    await db.insights.add(newInsight);
    return id;
  }

  async addPrinciple(principle: Omit<PersonalPrinciple, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    const newPrinciple: PersonalPrinciple = {
      ...principle,
      id,
      timestamp: new Date(),
      active: true,
      lastApplied: new Date()
    };

    await db.principles.add(newPrinciple);
    return id;
  }

  async addQuote(quote: Omit<PersonalQuote, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    const newQuote: PersonalQuote = {
      ...quote,
      id,
      timestamp: new Date(),
      favoriteCount: 0,
      relatedInsights: [],
      relatedPrinciples: []
    };

    await db.quotes.add(newQuote);
    return id;
  }

  async addStory(story: Omit<PersonalStory, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    const newStory: PersonalStory = {
      ...story,
      id,
      timestamp: new Date(),
      characters: [],
      turningPoints: []
    };

    await db.stories.add(newStory);
    return id;
  }

  async addLifeLesson(lesson: Omit<LifeLesson, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    const newLesson: LifeLesson = {
      ...lesson,
      id,
      timestamp: new Date(),
      applicationAreas: [],
      teachable: false
    };

    await db.lifeLessons.add(newLesson);
    return id;
  }

  // Analytics and insights
  async getWisdomStats(): Promise<{
    totalInsights: number;
    totalPrinciples: number;
    totalQuotes: number;
    totalStories: number;
    totalLifeLessons: number;
    topCategories: Array<{ category: string; count: number }>;
    recentActivity: Array<{ type: string; title: string; timestamp: Date }>;
  }> {
    try {
      const [insights, principles, quotes, stories, lifeLessons] = await Promise.all([
        db.insights.toArray(),
        db.principles.toArray(),
        db.quotes.toArray(),
        db.stories.toArray(),
        db.lifeLessons.toArray()
      ]);

      // Calculate top categories
      const categoryCounts: { [key: string]: number } = {};
      
      insights.forEach(insight => {
        categoryCounts[insight.category] = (categoryCounts[insight.category] || 0) + 1;
      });

      principles.forEach(principle => {
        categoryCounts[principle.category] = (categoryCounts[principle.category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get recent activity
      const recentActivity = [
        ...insights.map(i => ({ type: 'insight', title: i.title, timestamp: i.timestamp })),
        ...principles.map(p => ({ type: 'principle', title: p.name, timestamp: p.timestamp })),
        ...quotes.map(q => ({ type: 'quote', title: q.content.substring(0, 50) + '...', timestamp: q.timestamp })),
        ...stories.map(s => ({ type: 'story', title: s.title, timestamp: s.timestamp })),
        ...lifeLessons.map(l => ({ type: 'lesson', title: l.title, timestamp: l.timestamp }))
      ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

      return {
        totalInsights: insights.length,
        totalPrinciples: principles.length,
        totalQuotes: quotes.length,
        totalStories: stories.length,
        totalLifeLessons: lifeLessons.length,
        topCategories,
        recentActivity
      };
    } catch (error) {
      console.error('Failed to get wisdom stats:', error);
      throw error;
    }
  }

  // Private helper methods
  private generateMarkdownExport(wisdom: PersonalWisdom): string {
    let markdown = `# Personal Wisdom Collection\n\n`;
    markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;

    // Personal Philosophy
    if (wisdom.personalPhilosophy) {
      markdown += `## Personal Philosophy\n\n`;
      markdown += `**${wisdom.personalPhilosophy.title}**\n\n`;
      markdown += `${wisdom.personalPhilosophy.description}\n\n`;
      
      if (wisdom.personalPhilosophy.coreBeliefs.length > 0) {
        markdown += `### Core Beliefs\n\n`;
        wisdom.personalPhilosophy.coreBeliefs.forEach(belief => {
          markdown += `- **${belief.statement}** (Confidence: ${belief.confidence}/10)\n`;
        });
        markdown += `\n`;
      }
    }

    // Life Lessons
    if (wisdom.lifeLessons.length > 0) {
      markdown += `## Life Lessons\n\n`;
      wisdom.lifeLessons.forEach(lesson => {
        markdown += `### ${lesson.title}\n\n`;
        markdown += `${lesson.description}\n\n`;
        markdown += `*Value: ${lesson.value}/10 | Difficulty: ${lesson.difficulty}/10*\n\n`;
      });
    }

    // Principles
    if (wisdom.principles.length > 0) {
      markdown += `## Personal Principles\n\n`;
      wisdom.principles.forEach(principle => {
        markdown += `### ${principle.name}\n\n`;
        markdown += `${principle.description}\n\n`;
        markdown += `*Importance: ${principle.importance}/10 | Category: ${principle.category}*\n\n`;
      });
    }

    // Insights
    if (wisdom.insights.length > 0) {
      markdown += `## Personal Insights\n\n`;
      wisdom.insights.forEach(insight => {
        markdown += `### ${insight.title}\n\n`;
        markdown += `${insight.description}\n\n`;
        markdown += `*Category: ${insight.category} | Depth: ${insight.depth}/10*\n\n`;
      });
    }

    // Quotes
    if (wisdom.quotes.length > 0) {
      markdown += `## Meaningful Quotes\n\n`;
      wisdom.quotes.forEach(quote => {
        markdown += `> ${quote.content}\n`;
        markdown += `> — ${quote.attribution}\n\n`;
        if (quote.personalMeaning) {
          markdown += `*Personal meaning: ${quote.personalMeaning}*\n\n`;
        }
      });
    }

    return markdown;
  }
}

// Singleton instance
export const wisdomRepository = new WisdomRepository();
