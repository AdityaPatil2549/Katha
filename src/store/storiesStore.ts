import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { dbService } from '@/db/DatabaseService';
import type { Story } from '@/types/models';

export interface StoriesState {
  stories: Story[];
  allStories: Story[];
  loading: boolean;
  error: string | null;

  // Actions
  loadStories: () => Promise<void>;
  addStory: (story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Story>;
  updateStory: (id: string, updates: Partial<Story>) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  searchStories: (query: string) => Promise<void>;
  filterByCategory: (category: string) => Promise<void>;
  filterByStatus: (status: string) => Promise<void>;
  getFavorites: () => Promise<void>;
  getWatching: () => Promise<void>;
  getCompleted: () => Promise<void>;
  resetFilters: () => void;
}

export const useStoriesStore = create<StoriesState>()(
  subscribeWithSelector((set, get) => ({
    stories: [],
    allStories: [],
    loading: false,
    error: null,

    loadStories: async () => {
      set({ loading: true, error: null });
      try {
        const stories = await dbService.stories.findAll();
        set({ stories, allStories: stories, loading: false });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to load stories', loading: false });
      }
    },

    addStory: async (storyData) => {
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

      const optimisticId = `temp-${Date.now()}`;
      const optimisticStory: Story = {
        ...storyData,
        id: optimisticId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        stories: [optimisticStory, ...state.stories],
        allStories: [optimisticStory, ...state.allStories],
        error: null,
      }));

      try {
        const story = await dbService.stories.create(storyData);
        set((state) => ({
          stories: state.stories.map((s) => (s.id === optimisticId ? story : s)),
          allStories: state.allStories.map((s) => (s.id === optimisticId ? story : s)),
        }));
        return story;
      } catch (error) {
        set((state) => ({
          stories: state.stories.filter((s) => s.id !== optimisticId),
          allStories: state.allStories.filter((s) => s.id !== optimisticId),
          error: error instanceof Error ? error.message : 'Failed to add story',
        }));
        throw error;
      }
    },

    updateStory: async (id, updates) => {
      const state = get();
      const previousStory = state.allStories.find((s) => s.id === id) ?? state.stories.find((s) => s.id === id);
      if (!previousStory) return;

      const optimisticStory: Story = { ...previousStory, ...updates, updatedAt: new Date().toISOString() };
      set((curr) => ({
        stories: curr.stories.map((story) => (story.id === id ? optimisticStory : story)),
        allStories: curr.allStories.map((story) => (story.id === id ? optimisticStory : story)),
        error: null,
      }));

      try {
        const updatedStory = await dbService.stories.update(id, updates);
        set((curr) => ({
          stories: curr.stories.map((story) => (story.id === id ? updatedStory : story)),
          allStories: curr.allStories.map((story) => (story.id === id ? updatedStory : story)),
        }));
      } catch (error) {
        set((curr) => ({
          stories: curr.stories.map((story) => (story.id === id ? previousStory : story)),
          allStories: curr.allStories.map((story) => (story.id === id ? previousStory : story)),
          error: error instanceof Error ? error.message : 'Failed to update story',
        }));
        throw error;
      }
    },

    deleteStory: async (id) => {
      const state = get();
      const previousStory = state.allStories.find((s) => s.id === id) ?? state.stories.find((s) => s.id === id);
      if (!previousStory) return;

      set((curr) => ({
        stories: curr.stories.filter((story) => story.id !== id),
        allStories: curr.allStories.filter((story) => story.id !== id),
        error: null,
      }));

      try {
        await dbService.stories.delete(id);
      } catch (error) {
        set((curr) => ({
          stories: [previousStory, ...curr.stories],
          allStories: [previousStory, ...curr.allStories],
          error: error instanceof Error ? error.message : 'Failed to delete story',
        }));
        throw error;
      }
    },

    searchStories: async (query) => {
      const source = get().allStories;
      if (!query.trim()) {
        set({ stories: source });
        return;
      }
      const lower = query.toLowerCase();
      set({
        stories: source.filter(
          (story) =>
            story.title.toLowerCase().includes(lower) ||
            story.genre.some((g) => g.toLowerCase().includes(lower)) ||
            story.tags.some((t) => t.toLowerCase().includes(lower)) ||
            (story.notes ?? '').toLowerCase().includes(lower)
        ),
      });
    },

    filterByCategory: async (category) => {
      const source = get().allStories;
      if (!category || category === 'all') {
        set({ stories: source });
        return;
      }
      set({ stories: source.filter((s) => s.category === category) });
    },

    filterByStatus: async (status) => {
      const source = get().allStories;
      if (!status || status === 'all') {
        set({ stories: source });
        return;
      }
      set({ stories: source.filter((s) => s.status === status) });
    },

    getFavorites: async () => {
      set({ stories: get().allStories.filter((s) => s.favorite) });
    },

    getWatching: async () => {
      set({ stories: get().allStories.filter((s) => s.status === 'watching') });
    },

    getCompleted: async () => {
      set({ stories: get().allStories.filter((s) => s.status === 'completed') });
    },

    resetFilters: () => {
      set((curr) => ({ stories: curr.allStories }));
    },
  }))
);
