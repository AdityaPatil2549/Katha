import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, where, orderBy, deleteDoc, writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uuid } from '@/utils/id';
import type { Knowledge, UUID } from '@/types/models';
import type { KnowledgeRepository } from './KnowledgeRepository';

export class FirestoreKnowledgeRepository implements KnowledgeRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private get collectionRef() {
    return collection(db, 'users', this.userId, 'knowledge');
  }

  private getDocRef(id: string) {
    return doc(db, 'users', this.userId, 'knowledge', id);
  }

  async create(knowledgeData: Omit<Knowledge, 'id'>): Promise<Knowledge> {
    const knowledge: Knowledge = {
      ...knowledgeData,
      id: uuid()
    };
    
    await setDoc(this.getDocRef(knowledge.id), knowledge);
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
    
    await setDoc(this.getDocRef(id), updated, { merge: true });
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    await deleteDoc(this.getDocRef(id));
  }

  async bulkUpsert(knowledge: Knowledge[]): Promise<void> {
    const batch = writeBatch(db);
    knowledge.forEach(k => {
      batch.set(this.getDocRef(k.id), k);
    });
    await batch.commit();
  }

  async findById(id: UUID): Promise<Knowledge | undefined> {
    const snap = await getDoc(this.getDocRef(id));
    return snap.exists() ? (snap.data() as Knowledge) : undefined;
  }

  async findAll(): Promise<Knowledge[]> {
    const q = query(this.collectionRef, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Knowledge);
  }

  async findByStory(storyId: UUID): Promise<Knowledge[]> {
    const q = query(this.collectionRef, where('storyId', '==', storyId), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Knowledge);
  }

  async search(queryStr: string): Promise<Knowledge[]> {
    const all = await this.findAll();
    const lowerQuery = queryStr.toLowerCase();
    return all.filter(k => 
      k.title.toLowerCase().includes(lowerQuery) ||
      k.content.toLowerCase().includes(lowerQuery) ||
      k.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }
}
