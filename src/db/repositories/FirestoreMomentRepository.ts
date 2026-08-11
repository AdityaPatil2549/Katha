import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, where, orderBy, deleteDoc, writeBatch, limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uuid } from '@/utils/id';
import type { Moment, UUID } from '@/types/models';
import type { MomentRepository } from './MomentRepository';

export class FirestoreMomentRepository implements MomentRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private get collectionRef() {
    return collection(db, 'users', this.userId, 'moments');
  }

  private getDocRef(id: string) {
    return doc(db, 'users', this.userId, 'moments', id);
  }

  async create(momentData: Omit<Moment, 'id'>): Promise<Moment> {
    const moment: Moment = {
      ...momentData,
      id: uuid()
    };
    
    await setDoc(this.getDocRef(moment.id), moment);
    return moment;
  }

  async update(id: UUID, updates: Partial<Moment>): Promise<Moment> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Moment with id ${id} not found`);
    }
    
    const updated: Moment = {
      ...existing,
      ...updates,
    };
    
    await setDoc(this.getDocRef(id), updated, { merge: true });
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    await deleteDoc(this.getDocRef(id));
  }

  async bulkUpsert(moments: Moment[]): Promise<void> {
    const batch = writeBatch(db);
    moments.forEach(moment => {
      batch.set(this.getDocRef(moment.id), moment);
    });
    await batch.commit();
  }

  async findById(id: UUID): Promise<Moment | undefined> {
    const snap = await getDoc(this.getDocRef(id));
    return snap.exists() ? (snap.data() as Moment) : undefined;
  }

  async findAll(): Promise<Moment[]> {
    const q = query(this.collectionRef, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Moment);
  }

  async findByStory(storyId: UUID): Promise<Moment[]> {
    const q = query(this.collectionRef, where('storyId', '==', storyId), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Moment);
  }

  async findByMood(mood: string): Promise<Moment[]> {
    const q = query(this.collectionRef, where('mood', '==', mood));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Moment);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Moment[]> {
    const q = query(
      this.collectionRef, 
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Moment);
  }

  async findPrivate(): Promise<Moment[]> {
    const q = query(this.collectionRef, where('isPrivate', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Moment);
  }

  async findPublic(): Promise<Moment[]> {
    const q = query(this.collectionRef, where('isPrivate', '==', false));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Moment);
  }

  async search(searchQuery: string): Promise<Moment[]> {
    const all = await this.findAll();
    const lowerQuery = searchQuery.toLowerCase();
    
    return all.filter(moment => 
      (moment.context || '').toLowerCase().includes(lowerQuery) ||
      (moment.thoughts || '').toLowerCase().includes(lowerQuery) ||
      (moment.quote || '').toLowerCase().includes(lowerQuery) ||
      (moment.character || '').toLowerCase().includes(lowerQuery)
    ).slice(0, 50);
  }

  async getTotalCount(): Promise<number> {
    const snap = await getDocs(this.collectionRef);
    return snap.size;
  }

  async getMoodDistribution(): Promise<Array<{ mood: string; count: number }>> {
    const moments = await this.findAll();
    const moodCount = new Map<string, number>();
    
    moments.forEach(moment => {
      if (moment.mood) {
        const current = moodCount.get(moment.mood) || 0;
        moodCount.set(moment.mood, current + 1);
      }
    });
    
    return Array.from(moodCount.entries())
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getRecentMoments(maxLimit: number = 5): Promise<Moment[]> {
    const q = query(this.collectionRef, orderBy('date', 'desc'), limit(maxLimit));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Moment);
  }

  async getOnThisDay(month: number, day: number): Promise<Moment[]> {
    const moments = await this.findAll();
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const suffix = `-${monthStr}-${dayStr}`;
    
    return moments.filter(m => m.date && m.date.includes(suffix));
  }
}
