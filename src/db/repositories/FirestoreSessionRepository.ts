import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, where, orderBy, deleteDoc, writeBatch, limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uuid } from '@/utils/id';
import type { Session, UUID } from '@/types/models';
import type { SessionRepository } from './SessionRepository';

export class FirestoreSessionRepository implements SessionRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private get collectionRef() {
    return collection(db, 'users', this.userId, 'sessions');
  }

  private getDocRef(id: string) {
    return doc(db, 'users', this.userId, 'sessions', id);
  }

  async create(sessionData: Omit<Session, 'id'>): Promise<Session> {
    const session: Session = {
      ...sessionData,
      id: uuid()
    };
    
    await setDoc(this.getDocRef(session.id), session);
    return session;
  }

  async update(id: UUID, updates: Partial<Session>): Promise<Session> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Session with id ${id} not found`);
    }
    
    const updated: Session = {
      ...existing,
      ...updates,
    };
    
    await setDoc(this.getDocRef(id), updated, { merge: true });
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    await deleteDoc(this.getDocRef(id));
  }

  async bulkUpsert(sessions: Session[]): Promise<void> {
    const batch = writeBatch(db);
    sessions.forEach(session => {
      batch.set(this.getDocRef(session.id), session);
    });
    await batch.commit();
  }

  async findById(id: UUID): Promise<Session | undefined> {
    const snap = await getDoc(this.getDocRef(id));
    return snap.exists() ? (snap.data() as Session) : undefined;
  }

  async findAll(): Promise<Session[]> {
    const q = query(this.collectionRef, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Session);
  }

  async findByStory(storyId: UUID): Promise<Session[]> {
    const q = query(this.collectionRef, where('storyId', '==', storyId), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Session);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Session[]> {
    const q = query(
      this.collectionRef, 
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Session);
  }

  async findByMood(mood: string): Promise<Session[]> {
    const q = query(this.collectionRef, where('mood', '==', mood));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Session);
  }

  // Analytics (these normally shouldn't be executed directly on Firestore to save reads,
  // but they fulfill the interface for compatibility)
  async getTotalWatchTime(): Promise<number> {
    const sessions = await this.findAll();
    return sessions.reduce((sum, s) => sum + s.duration, 0);
  }

  async getTotalSessions(): Promise<number> {
    const sessions = await this.findAll();
    return sessions.length;
  }

  async getAverageSessionDuration(): Promise<number> {
    const sessions = await this.findAll();
    if (sessions.length === 0) return 0;
    return this.getTotalWatchTime().then(total => total / sessions.length);
  }

  async getMoodDistribution(): Promise<Array<{ mood: string; count: number }>> {
    const sessions = await this.findAll();
    const map = new Map<string, number>();
    sessions.forEach(s => {
      if (s.mood) {
        map.set(s.mood, (map.get(s.mood) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([mood, count]) => ({ mood, count }));
  }

  async getRecentSessions(limit?: number): Promise<Session[]> {
    const q = query(this.collectionRef, orderBy('date', 'desc'), firestoreLimit(limit || 10));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Session);
  }

  async getWatchStreak(): Promise<number> {
    // Requires complex logic, returning 0 as a stub for the cloud version
    return 0;
  }

  async getMostActiveDay(): Promise<{ date: string; duration: number } | null> {
    return null;
  }
}
