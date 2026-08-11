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
      try {
        const story = await dbService.stories.create(storyData);
        set(state => ({ 
          stories: [story, ...state.stories],
          allStories: [story, ...state.allStories]
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to add story' });
      }
    },

    updateStory: async (id, updates) => {
      try {
        const updatedStory = await dbService.stories.update(id, updates);
        set(state => ({
          stories: state.stories.map(story => story.id === id ? updatedStory : story),
          allStories: state.allStories.map(story => story.id === id ? updatedStory : story)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to update story' });
      }
    },

    deleteStory: async (id) => {
      try {
        await dbService.stories.delete(id);
        set(state => ({
          stories: state.stories.filter(story => story.id !== id),
          allStories: state.allStories.filter(story => story.id !== id)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to delete story' });
      }
    },

    searchStories: async (query) => {
      const lowerQuery = query.toLowerCase();
      set(state => ({
        stories: state.allStories.filter(story => 
          story.title.toLowerCase().includes(lowerQuery) ||
          story.genre.some(g => g.toLowerCase().includes(lowerQuery)) ||
          story.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
          (story.notes && story.notes.toLowerCase().includes(lowerQuery))
        )
      }));
    },

    filterByCategory: async (category) => {
      set(state => ({ stories: state.allStories.filter(s => s.category === category) }));
    },

    filterByStatus: async (status) => {
      set(state => ({ stories: state.allStories.filter(s => s.status === status) }));
    },

    getFavorites: async () => {
      set(state => ({ stories: state.allStories.filter(s => s.favorite) }));
    },

    getWatching: async () => {
      set(state => ({ stories: state.allStories.filter(s => s.status === 'watching') }));
    },

    getCompleted: async () => {
      set(state => ({ stories: state.allStories.filter(s => s.status === 'completed') }));
    },
  }))
);
