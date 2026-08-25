import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/test/utils/testUtils';
import { HomePage } from '@/features/home/HomePage';
import { createMockStory, createMockMoment, mockLocalStorage } from '@/test/utils/testUtils';

// Mock AtlasNavigation to avoid deep rendering issues
vi.mock('@/components/atlas/AtlasNavigation', () => ({
  AtlasNavigation: () => <div data-testid="atlas-navigation">Atlas</div>
}));

// Mock the stores
vi.mock('@/store/storiesStore', () => ({
  useStoriesStore: () => ({
    stories: [
      createMockStory({ title: 'Vinland Saga', status: 'watching', category: 'anime' }),
      createMockStory({ title: 'Interstellar', status: 'completed' }),
    ],
    loading: false,
    loadStories: vi.fn(),
    addStory: vi.fn(),
    updateStory: vi.fn(),
    deleteStory: vi.fn()
  })
}));

// Mock the moment store
vi.mock('@/store/momentsStore', () => ({
  useMomentsStore: () => ({
    moments: [
      createMockMoment({ quote: 'I have no enemies.', character: 'Thorfinn' })
    ],
    loading: false,
    loadMoments: vi.fn(),
    addMoment: vi.fn(),
    updateMoment: vi.fn(),
    deleteMoment: vi.fn()
  })
}));

describe('HomePage', () => {
  beforeEach(() => {
    mockLocalStorage();
    vi.clearAllMocks();
  });

  it('renders the featured story in the hero section', () => {
    render(<HomePage />);
    
    // Use getByRole or test other elements since TextEffect splits the text
    expect(screen.getByText('Continue Watching')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Play Now/i })).toBeInTheDocument();
  });

  it('displays My List section', () => {
    render(<HomePage />);
    
    expect(screen.getByText('My List')).toBeInTheDocument();
    // Interstellar is in a normal div, so getByText works
    expect(screen.getByText('Interstellar')).toBeInTheDocument();
  });

  it('displays moment of the day', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Moment of the Day')).toBeInTheDocument();
  });

  it('displays explore atlas section', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Explore the Atlas')).toBeInTheDocument();
    expect(screen.getByTestId('atlas-navigation')).toBeInTheDocument();
  });
});
