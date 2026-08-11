import { formatISO } from 'date-fns';
import { db } from '@/db/KathaDb';
import { uuid } from '@/utils/id';
import type { Knowledge, UUID } from '@/types/models';
import type { KnowledgeRepository } from './KnowledgeRepository';

export class DexieKnowledgeRepository implements KnowledgeRepository {
  async create(knowledgeData: Omit<Knowledge, 'id'>): Promise<Knowledge> {
    const knowledge: Knowledge = {
      ...knowledgeData,
      id: uuid(),
    };
    
    await db.knowledge.add(knowledge);
    return knowledge;
  }

  async update(id: UUID, updates: Partial<Knowledge>): Promise<Knowledge> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Knowledge with id ${id} not found`);
    }
    
    const updated: Knowledge = {
      ...existing,
      ...updates,
    };
    
    await db.knowledge.update(id, updated);
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    // Delete related timeline events
    await db.timeline.where('refId').equals(id).delete();
    
    // Delete the knowledge
    await db.knowledge.delete(id);
  }

  async bulkUpsert(knowledge: Knowledge[]): Promise<void> {
    await db.knowledge.bulkPut(knowledge);
  }

  async findById(id: UUID): Promise<Knowledge | undefined> {
    return await db.knowledge.get(id);
  }

  async findAll(): Promise<Knowledge[]> {
    return await db.knowledge.orderBy('date').reverse().toArray();
  }

  async findByStory(storyId: UUID): Promise<Knowledge[]> {
    return await db.knowledge.where('storyId').equals(storyId).toArray();
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Knowledge[]> {
    return await db.knowledge
      .where('date')
      .between(startDate, endDate)
      .toArray();
  }

  async search(query: string): Promise<Knowledge[]> {
    const lowerQuery = query.toLowerCase();
    const all = await this.findAll();
    
    return all.filter(knowledge => 
      knowledge.lesson.toLowerCase().includes(lowerQuery) ||
      knowledge.principle.toLowerCase().includes(lowerQuery) ||
      knowledge.reflection.toLowerCase().includes(lowerQuery)
    );
  }

  async getTotalCount(): Promise<number> {
    return await db.knowledge.count();
  }

  async getRecentKnowledge(limit: number = 10): Promise<Knowledge[]> {
    return await db.knowledge.orderBy('date').reverse().limit(limit).toArray();
  }

  async getTopPrinciples(limit: number = 5): Promise<Array<{ principle: string; count: number }>> {
    const all = await this.findAll();
    const principleCount = new Map<string, number>();
    
    all.forEach(knowledge => {
      const current = principleCount.get(knowledge.principle) || 0;
      principleCount.set(knowledge.principle, current + 1);
    });
    
    return Array.from(principleCount.entries())
      .map(([principle, count]) => ({ principle, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
