import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { dbService } from '@/db/DatabaseService';
import type { Session } from '@/types/models';

export interface SessionsState {
  sessions: Session[];
  allSessions: Session[];
  loading: boolean;
  error: string | null;

  // Actions
  loadSessions: () => Promise<void>;
  addSession: (session: Omit<Session, 'id'>) => Promise<void>;
  updateSession: (id: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  getSessionsByStory: (storyId: string) => void;
  getSessionsByMood: (mood: string) => void;
  getRecentSessions: (limit?: number) => void;
}

export const useSessionsStore = create<SessionsState>()(
  subscribeWithSelector((set, get) => ({
    sessions: [],
    allSessions: [],
    loading: false,
    error: null,

    loadSessions: async () => {
      set({ loading: true, error: null });
      try {
        const sessions = await dbService.sessions.findAll();
        set({ sessions, allSessions: sessions, loading: false });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to load sessions', loading: false });
      }
    },

    addSession: async (sessionData) => {
      try {
        const session = await dbService.sessions.create(sessionData);
        set(state => ({
          sessions: [session, ...state.sessions],
          allSessions: [session, ...state.allSessions]
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to add session' });
      }
    },

    updateSession: async (id, updates) => {
      try {
        const updatedSession = await dbService.sessions.update(id, updates);
        set(state => ({
          sessions: state.sessions.map(s => s.id === id ? updatedSession : s),
          allSessions: state.allSessions.map(s => s.id === id ? updatedSession : s)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to update session' });
      }
    },

    deleteSession: async (id) => {
      try {
        await dbService.sessions.delete(id);
        set(state => ({
          sessions: state.sessions.filter(s => s.id !== id),
          allSessions: state.allSessions.filter(s => s.id !== id)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to delete session' });
      }
    },

    getSessionsByStory: (storyId) => {
      set(state => ({ sessions: state.allSessions.filter(s => s.storyId === storyId) }));
    },

    getSessionsByMood: (mood) => {
      set(state => ({ sessions: state.allSessions.filter(s => s.mood === mood) }));
    },

    getRecentSessions: (limit = 10) => {
      set(state => ({
        sessions: [...state.allSessions]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit)
      }));
    },
  }))
);
