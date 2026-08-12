import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { dbService } from '@/db/DatabaseService';
import type { Story } from '@/types/models';

export interface StoriesState {
  stories: Story[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadStories: () => Promise<void>;
  addStory: (story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateStory: (id: string, updates: Partial<Story>) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  searchStories: (query: string) => Promise<void>;
  filterByCategory: (category: string) => Promise<void>;
  filterByStatus: (status: string) => Promise<void>;
  getFavorites: () => Promise<void>;
  getWatching: () => Promise<void>;
  getCompleted: () => Promise<void>;
}

export const useStoriesStore = create<StoriesState>()(
  subscribeWithSelector((set, get) => ({
    stories: [],
    loading: false,
    error: null,

    loadStories: async () => {
      set({ loading: true, error: null });
      try {
        const stories = await dbService.stories.findAll();
        set({ stories, loading: false });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to load stories', loading: false });
      }
    },

    addStory: async (storyData) => {
      const state = get();
      
      // Duplicate Prevention Check using DB
      const existing = await dbService.stories.findAll();
      const isDuplicate = existing.some(
        (s) => s.title.toLowerCase() === storyData.title.toLowerCase() && s.category === storyData.category
      );
      
      if (isDuplicate) {
        const errorMsg = `"${storyData.title}" is already in your library.`;
        set({ error: errorMsg });
        throw new Error(errorMsg);
      }

      // Optimistic Update
      const optimisticId = `temp-${Date.now()}`;
      const optimisticStory: Story = {
        ...storyData,
        id: optimisticId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      set(state => ({ 
        stories: [optimisticStory, ...state.stories],
        error: null
      }));

      try {
        const story = await dbService.stories.create(storyData);
        // Replace optimistic story with real DB story
        set(state => ({
          stories: state.stories.map(s => s.id === optimisticId ? story : s)
        }));
      } catch (error) {
        // Rollback on failure
        set(state => ({
          stories: state.stories.filter(s => s.id !== optimisticId),
          error: error instanceof Error ? error.message : 'Failed to add story'
        }));
        throw error;
      }
    },

    updateStory: async (id, updates) => {
      const state = get();
      const previousStory = state.stories.find(s => s.id === id);
      if (!previousStory) return;

      // Optimistic Update
      const optimisticStory = { ...previousStory, ...updates, updatedAt: new Date().toISOString() };
      set(state => ({
        stories: state.stories.map(story => story.id === id ? optimisticStory : story),
        error: null
      }));

      try {
        const updatedStory = await dbService.stories.update(id, updates);
        // Confirm with DB truth
        set(state => ({
          stories: state.stories.map(story => story.id === id ? updatedStory : story)
        }));
      } catch (error) {
        // Rollback to previous state
        set(state => ({
          stories: state.stories.map(story => story.id === id ? previousStory : story),
          error: error instanceof Error ? error.message : 'Failed to update story'
        }));
        throw error;
      }
    },

    deleteStory: async (id) => {
      const state = get();
      const previousStory = state.stories.find(s => s.id === id);
      if (!previousStory) return;

      // Optimistic Update
      set(state => ({
        stories: state.stories.filter(story => story.id !== id),
        error: null
      }));

      try {
        await dbService.stories.delete(id);
      } catch (error) {
        // Rollback deletion
        set(state => ({
          stories: [previousStory, ...state.stories],
          error: error instanceof Error ? error.message : 'Failed to delete story'
        }));
        throw error;
      }
    },

    searchStories: async (query) => {
      if (!query) {
        useStoriesStore.getState().loadStories();
        return;
      }
      set({ loading: true });
      try {
        const results = await dbService.stories.search(query);
        set({ stories: results, loading: false });
      } catch (error) {
        set({ error: 'Failed to search stories', loading: false });
      }
    },

    filterByCategory: async (category) => {
      if (!category || category === 'all') {
        useStoriesStore.getState().loadStories();
        return;
      }
      set({ loading: true });
      try {
        const results = await dbService.stories.findByCategory(category);
        set({ stories: results, loading: false });
      } catch (error) {
        set({ error: 'Failed to filter by category', loading: false });
      }
    },

    filterByStatus: async (status) => {
      set({ loading: true });
      try {
        const results = await dbService.stories.findByStatus(status);
        set({ stories: results, loading: false });
      } catch (error) {
        set({ error: 'Failed to filter by status', loading: false });
      }
    },

    getFavorites: async () => {
      set({ loading: true });
      try {
        const results = await dbService.stories.findFavorites();
        set({ stories: results, loading: false });
      } catch (error) {
        set({ error: 'Failed to filter favorites', loading: false });
      }
    },

    getWatching: async () => {
      set({ loading: true });
      try {
        const results = await dbService.stories.findWatching();
        set({ stories: results, loading: false });
      } catch (error) {
        set({ error: 'Failed to filter watching', loading: false });
      }
    },

    getCompleted: async () => {
      set({ loading: true });
      try {
        const results = await dbService.stories.findCompleted();
        set({ stories: results, loading: false });
      } catch (error) {
        set({ error: 'Failed to filter completed', loading: false });
      }
    }
  }))
);
