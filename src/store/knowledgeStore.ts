import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { dbService } from '@/db/DatabaseService';
import type { Knowledge } from '@/types/models';

export interface KnowledgeState {
  knowledge: Knowledge[];
  allKnowledge: Knowledge[];
  loading: boolean;
  error: string | null;

  // Actions
  loadKnowledge: () => Promise<void>;
  addKnowledge: (knowledge: Omit<Knowledge, 'id'>) => Promise<void>;
  updateKnowledge: (id: string, updates: Partial<Knowledge>) => Promise<void>;
  deleteKnowledge: (id: string) => Promise<void>;
  getKnowledgeByStory: (storyId: string) => void;
  searchKnowledge: (query: string) => void;
}

export const useKnowledgeStore = create<KnowledgeState>()(
  subscribeWithSelector((set, get) => ({
    knowledge: [],
    allKnowledge: [],
    loading: false,
    error: null,

    loadKnowledge: async () => {
      set({ loading: true, error: null });
      try {
        const knowledge = await dbService.knowledge.findAll();
        set({ knowledge, allKnowledge: knowledge, loading: false });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to load knowledge', loading: false });
      }
    },

    addKnowledge: async (knowledgeData) => {
      try {
        const item = await dbService.knowledge.create(knowledgeData);
        set(state => ({
          knowledge: [item, ...state.knowledge],
          allKnowledge: [item, ...state.allKnowledge]
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to add knowledge' });
      }
    },

    updateKnowledge: async (id, updates) => {
      try {
        const updated = await dbService.knowledge.update(id, updates);
        set(state => ({
          knowledge: state.knowledge.map(k => k.id === id ? updated : k),
          allKnowledge: state.allKnowledge.map(k => k.id === id ? updated : k)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to update knowledge' });
      }
    },

    deleteKnowledge: async (id) => {
      try {
        await dbService.knowledge.delete(id);
        set(state => ({
          knowledge: state.knowledge.filter(k => k.id !== id),
          allKnowledge: state.allKnowledge.filter(k => k.id !== id)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to delete knowledge' });
      }
    },

    getKnowledgeByStory: (storyId) => {
      set(state => ({ knowledge: state.allKnowledge.filter(k => k.storyId === storyId) }));
    },

    searchKnowledge: (query) => {
      const lowerQuery = query.toLowerCase();
      set(state => ({
        knowledge: state.allKnowledge.filter(k =>
          (k.lesson || '').toLowerCase().includes(lowerQuery) ||
          (k.principle || '').toLowerCase().includes(lowerQuery) ||
          (k.reflection || '').toLowerCase().includes(lowerQuery)
        )
      }));
    },
  }))
);
