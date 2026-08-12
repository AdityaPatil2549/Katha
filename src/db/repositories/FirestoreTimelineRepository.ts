import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, where, orderBy, deleteDoc, writeBatch, limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uuid } from '@/utils/id';
import type { TimelineEvent, UUID } from '@/types/models';
import type { TimelineRepository } from './TimelineRepository';

export class FirestoreTimelineRepository implements TimelineRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private get collectionRef() {
    return collection(db, 'users', this.userId, 'timeline');
  }

  private getDocRef(id: string) {
    return doc(db, 'users', this.userId, 'timeline', id);
  }

  async create(eventData: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const event: TimelineEvent = {
      ...eventData,
      id: uuid()
    };
    
    await setDoc(this.getDocRef(event.id), event);
    return event;
  }

  async update(id: UUID, updates: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`TimelineEvent with id ${id} not found`);
    }
    
    const updated: TimelineEvent = {
      ...existing,
      ...updates,
    };
    
    await setDoc(this.getDocRef(id), updated, { merge: true });
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    await deleteDoc(this.getDocRef(id));
  }

  async bulkUpsert(events: TimelineEvent[]): Promise<void> {
    const batch = writeBatch(db);
    events.forEach(e => {
      batch.set(this.getDocRef(e.id), e);
    });
    await batch.commit();
  }

  async findById(id: UUID): Promise<TimelineEvent | undefined> {
    const snap = await getDoc(this.getDocRef(id));
    return snap.exists() ? (snap.data() as TimelineEvent) : undefined;
  }

  async findAll(): Promise<TimelineEvent[]> {
    const q = query(this.collectionRef, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as TimelineEvent);
  }

  async findByType(type: string): Promise<TimelineEvent[]> {
    const q = query(this.collectionRef, where('type', '==', type), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as TimelineEvent);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<TimelineEvent[]> {
    const q = query(
      this.collectionRef, 
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as TimelineEvent);
  }

  async findByMood(mood: string): Promise<TimelineEvent[]> {
    const q = query(this.collectionRef, where('mood', '==', mood), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as TimelineEvent);
  }

  async getRecentEvents(limit?: number): Promise<TimelineEvent[]> {
    const q = query(this.collectionRef, orderBy('date', 'desc'), firestoreLimit(limit || 10));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as TimelineEvent);
  }

  async getEventsByMonth(year: number, month: number): Promise<TimelineEvent[]> {
    // Basic local fallback since this requires complex Firestore queries
    const all = await this.findAll();
    return all.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }

  async getOnThisDay(month: number, day: number): Promise<TimelineEvent[]> {
    const all = await this.findAll();
    return all.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getDate() === day;
    });
  }

  async getTimelineStats(): Promise<{
    totalEvents: number;
    eventsByType: Array<{ type: string; count: number }>;
    mostActiveMonth: { year: number; month: number; count: number } | null;
  }> {
    const all = await this.findAll();
    const map = new Map<string, number>();
    all.forEach(e => {
      map.set(e.type, (map.get(e.type) || 0) + 1);
    });
    
    return {
      totalEvents: all.length,
      eventsByType: Array.from(map.entries()).map(([type, count]) => ({ type, count })),
      mostActiveMonth: null
    };
  }
}
