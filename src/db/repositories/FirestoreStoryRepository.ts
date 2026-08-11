import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, where, orderBy, deleteDoc, writeBatch 
} from 'firebase/firestore';
import { formatISO } from 'date-fns';
import { db } from '@/lib/firebase';
import { uuid } from '@/utils/id';
import type { Story, UUID } from '@/types/models';
import type { StoryRepository } from './StoryRepository';

export class FirestoreStoryRepository implements StoryRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private get collectionRef() {
    return collection(db, 'users', this.userId, 'stories');
  }

  private getDocRef(id: string) {
    return doc(db, 'users', this.userId, 'stories', id);
  }

  async create(storyData: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<Story> {
    const now = formatISO(new Date());
    const story: Story = {
      ...storyData,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(this.getDocRef(story.id), story);
    return story;
  }

  async update(id: UUID, updates: Partial<Story>): Promise<Story> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Story with id ${id} not found`);
    }
    
    const updated: Story = {
      ...existing,
      ...updates,
      updatedAt: formatISO(new Date()),
    };
    
    await setDoc(this.getDocRef(id), updated, { merge: true });
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    // In a real production app, we would use a Cloud Function or batch to delete 
    // all related moments, sessions, etc. Here we just delete the story doc for simplicity.
    await deleteDoc(this.getDocRef(id));
  }

  async bulkUpsert(stories: Story[]): Promise<void> {
    const batch = writeBatch(db);
    stories.forEach(story => {
      batch.set(this.getDocRef(story.id), story);
    });
    await batch.commit();
  }

  async findById(id: UUID): Promise<Story | undefined> {
    const snap = await getDoc(this.getDocRef(id));
    return snap.exists() ? (snap.data() as Story) : undefined;
  }

  async findAll(): Promise<Story[]> {
    const q = query(this.collectionRef, orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Story);
  }

  async findByCategory(category: string): Promise<Story[]> {
    const q = query(this.collectionRef, where('category', '==', category));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Story);
  }

  async findByStatus(status: string): Promise<Story[]> {
    const q = query(this.collectionRef, where('status', '==', status));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Story);
  }

  async findFavorites(): Promise<Story[]> {
    const q = query(this.collectionRef, where('favorite', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Story);
  }

  async findByTag(tag: string): Promise<Story[]> {
    const q = query(this.collectionRef, where('tags', 'array-contains', tag));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Story);
  }

  async findByMood(mood: string): Promise<Story[]> {
    const q = query(this.collectionRef, where('moods', 'array-contains', mood));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Story);
  }

  async findWatching(): Promise<Story[]> {
    return await this.findByStatus('watching');
  }

  async findCompleted(): Promise<Story[]> {
    return await this.findByStatus('completed');
  }

  async findHighImpact(minImpact: number = 7): Promise<Story[]> {
    const q = query(this.collectionRef, where('impactIndex', '>=', minImpact));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Story);
  }

  async search(searchQuery: string): Promise<Story[]> {
    // Firestore does not natively support full-text search.
    // In a real app we'd use Algolia. For now, fetch all and filter client-side.
    const all = await this.findAll();
    const lowerQuery = searchQuery.toLowerCase();
    
    return all.filter(story => 
      (story.title || '').toLowerCase().includes(lowerQuery) ||
      (story.genre || []).some(g => g.toLowerCase().includes(lowerQuery)) ||
      (story.tags || []).some(t => t.toLowerCase().includes(lowerQuery)) ||
      (story.notes || '').toLowerCase().includes(lowerQuery)
    ).slice(0, 50);
  }

  async getTotalWatchTime(): Promise<number> {
    const stories = await this.findAll();
    return stories.reduce((total, story) => total + story.watchTimeMinutes, 0);
  }

  async getAverageRating(): Promise<number> {
    const stories = await this.findAll();
    if (stories.length === 0) return 0;
    const total = stories.reduce((sum, story) => sum + story.rating, 0);
    return total / stories.length;
  }

  async getTopCategories(limit: number = 5): Promise<Array<{ category: string; count: number }>> {
    const stories = await this.findAll();
    const categoryCount = new Map<string, number>();
    stories.forEach(story => {
      const current = categoryCount.get(story.category) || 0;
      categoryCount.set(story.category, current + 1);
    });
    return Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getMoodDistribution(): Promise<Array<{ mood: string; count: number }>> {
    const stories = await this.findAll();
    const moodCount = new Map<string, number>();
    stories.forEach(story => {
      (story.moods || []).forEach(mood => {
        const current = moodCount.get(mood) || 0;
        moodCount.set(mood, current + 1);
      });
    });
    return Array.from(moodCount.entries())
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  }
}
