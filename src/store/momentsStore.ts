import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { dbService } from '@/db/DatabaseService';
import type { Moment } from '@/types/models';

export interface MomentsState {
  moments: Moment[];
  allMoments: Moment[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadMoments: () => Promise<void>;
  addMoment: (moment: Omit<Moment, 'id'>) => Promise<void>;
  updateMoment: (id: string, updates: Partial<Moment>) => Promise<void>;
  deleteMoment: (id: string) => Promise<void>;
  getMomentsByStory: (storyId: string) => Promise<void>;
  getMomentsByMood: (mood: string) => Promise<void>;
  getPrivateMoments: () => Promise<void>;
  getPublicMoments: () => Promise<void>;
  searchMoments: (query: string) => Promise<void>;
}

export const useMomentsStore = create<MomentsState>()(
  subscribeWithSelector((set, get) => ({
    moments: [],
    allMoments: [],
    loading: false,
    error: null,

    loadMoments: async () => {
      set({ loading: true, error: null });
      try {
        const moments = await dbService.moments.findAll();
        set({ moments, allMoments: moments, loading: false });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to load moments', loading: false });
      }
    },

    addMoment: async (momentData) => {
      try {
        const moment = await dbService.moments.create(momentData);
        set(state => ({ 
          moments: [moment, ...state.moments],
          allMoments: [moment, ...state.allMoments]
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to add moment' });
      }
    },

    updateMoment: async (id, updates) => {
      try {
        const updatedMoment = await dbService.moments.update(id, updates);
        set(state => ({
          moments: state.moments.map(moment => moment.id === id ? updatedMoment : moment),
          allMoments: state.allMoments.map(moment => moment.id === id ? updatedMoment : moment)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to update moment' });
      }
    },

    deleteMoment: async (id) => {
      try {
        await dbService.moments.delete(id);
        set(state => ({
          moments: state.moments.filter(moment => moment.id !== id),
          allMoments: state.allMoments.filter(moment => moment.id !== id)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to delete moment' });
      }
    },

    getMomentsByStory: async (storyId) => {
      set(state => ({ moments: state.allMoments.filter(m => m.storyId === storyId) }));
    },

    getMomentsByMood: async (mood) => {
      set(state => ({ moments: state.allMoments.filter(m => m.mood === mood) }));
    },

    getPrivateMoments: async () => {
      set(state => ({ moments: state.allMoments.filter(m => m.isPrivate === true) }));
    },

    getPublicMoments: async () => {
      set(state => ({ moments: state.allMoments.filter(m => m.isPrivate === false) }));
    },

    searchMoments: async (query) => {
      const lowerQuery = query.toLowerCase();
      set(state => ({
        moments: state.allMoments.filter(moment => 
          (moment.quote || '').toLowerCase().includes(lowerQuery) ||
          (moment.character || '').toLowerCase().includes(lowerQuery) ||
          (moment.context || '').toLowerCase().includes(lowerQuery) ||
          (moment.thoughts || '').toLowerCase().includes(lowerQuery)
        )
      }));
    },
  }))
);
