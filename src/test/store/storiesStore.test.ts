import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockStory } from '@/test/utils/testUtils';

const { findAllMock } = vi.hoisted(() => ({
  findAllMock: vi.fn(),
}));

vi.mock('@/db/DatabaseService', () => ({
  dbService: {
    stories: {
      findAll: findAllMock,
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { useStoriesStore } from '@/store/storiesStore';

describe('storiesStore non-destructive filtering', () => {
  const sampleStories = [
    createMockStory({ id: 's1', title: 'Spirited Away', category: 'anime', status: 'completed', favorite: true }),
    createMockStory({ id: 's2', title: 'Severance', category: 'series', status: 'watching', favorite: false }),
    createMockStory({ id: 's3', title: 'Dune', category: 'movie', status: 'planning', favorite: true }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    findAllMock.mockResolvedValue(sampleStories);
    useStoriesStore.setState({ stories: [], allStories: [], loading: false, error: null });
  });

  it('loads all stories into both stories and allStories', async () => {
    await useStoriesStore.getState().loadStories();
    const state = useStoriesStore.getState();
    expect(state.stories).toHaveLength(3);
    expect(state.allStories).toHaveLength(3);
    expect(state.loading).toBe(false);
  });

  it('filters by category non-destructively across consecutive filters', async () => {
    await useStoriesStore.getState().loadStories();

    await useStoriesStore.getState().filterByCategory('anime');
    expect(useStoriesStore.getState().stories.map((s) => s.id)).toEqual(['s1']);
    expect(useStoriesStore.getState().allStories).toHaveLength(3);

    await useStoriesStore.getState().filterByCategory('series');
    expect(useStoriesStore.getState().stories.map((s) => s.id)).toEqual(['s2']);

    useStoriesStore.getState().resetFilters();
    expect(useStoriesStore.getState().stories).toHaveLength(3);
  });

  it('filters by status, search query, and favorites using allStories source', async () => {
    await useStoriesStore.getState().loadStories();

    await useStoriesStore.getState().filterByStatus('watching');
    expect(useStoriesStore.getState().stories.map((s) => s.title)).toEqual(['Severance']);

    await useStoriesStore.getState().getFavorites();
    expect(useStoriesStore.getState().stories.map((s) => s.id)).toEqual(['s1', 's3']);

    await useStoriesStore.getState().searchStories('dune');
    expect(useStoriesStore.getState().stories.map((s) => s.id)).toEqual(['s3']);

    await useStoriesStore.getState().searchStories('   ');
    expect(useStoriesStore.getState().stories).toHaveLength(3);
  });
});

