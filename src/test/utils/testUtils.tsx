import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Add any global providers here if needed
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>,
    {
      ...options,
    }
  );
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const createMockStory = (overrides = {}) => ({
  id: 'test-story-1',
  title: 'Test Story',
  category: 'anime' as const,
  status: 'watching' as const,
  rating: 8.5,
  genre: ['Action', 'Drama'],
  platform: 'Netflix',
  releaseYear: 2023,
  posterUrl: '',
  posterBlurhash: '',
  watchTimeMinutes: 120,
  currentEpisode: 5,
  totalEpisodes: 24,
  currentSeason: 1,
  totalSeasons: 1,
  notes: 'Test notes',
  tags: ['test', 'mock'],
  favorite: false,
  impactIndex: 75,
  moods: ['Inspired'],
  lifePhase: 'College',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
});

export const createMockMoment = (overrides = {}) => ({
  id: 'test-moment-1',
  storyId: 'test-story-1',
  season: 1,
  episode: 5,
  timestamp: '45:30',
  quote: 'Test quote',
  character: 'Test Character',
  context: 'Test context',
  thoughts: 'Test thoughts',
  mood: 'Inspired',
  lifePhase: 'College',
  date: '2024-01-01',
  isPrivate: false,
  ...overrides
});

export const createMockSession = (overrides = {}) => ({
  id: 'test-session-1',
  storyId: 'test-story-1',
  date: '2024-01-01',
  duration: 45,
  mood: 'Inspired',
  notes: 'Test session notes',
  ...overrides
});

export const createMockKnowledge = (overrides = {}) => ({
  id: 'test-knowledge-1',
  storyId: 'test-story-1',
  lesson: 'Test lesson',
  principle: 'Test principle',
  reflection: 'Test reflection',
  date: '2024-01-01',
  ...overrides
});

// Test helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
    },
    writable: true,
  });
  
  return store;
};
