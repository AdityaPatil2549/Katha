import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/test/utils/testUtils';
import { HomePage } from '@/features/home/HomePage';
import { createMockStory, createMockMoment, mockLocalStorage } from '@/test/utils/testUtils';

// Mock the stores
vi.mock('@/store/storiesStore', () => ({
  useStoriesStore: () => ({
    stories: [
      createMockStory({ title: 'Vinland Saga', status: 'watching' }),
      createMockStory({ title: 'Interstellar', status: 'completed' }),
      createMockStory({ title: 'Attack on Titan', status: 'planning' })
    ],
    loading: false,
    addStory: vi.fn(),
    updateStory: vi.fn(),
    deleteStory: vi.fn()
  })
}));

// Mock the moment store
vi.mock('@/store/momentsStore', () => ({
  useMomentsStore: () => ({
    moments: [
      createMockMoment({ quote: 'I have no enemies.' })
    ],
    loading: false,
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

  it('renders the home page with greeting', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/Your story continues/i)).toBeInTheDocument();
    expect(screen.getByText(/Remembered by Smriti/i)).toBeInTheDocument();
  });

  it('displays continue watching section', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/Continue Your Story/i)).toBeInTheDocument();
    expect(screen.getByText('Vinland Saga')).toBeInTheDocument();
  });

  it('displays moment of the day', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/Moment of the Day/i)).toBeInTheDocument();
    expect(screen.getByText('I have no enemies.')).toBeInTheDocument();
  });

  it('displays emotional snapshot', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/Your Story Mood/i)).toBeInTheDocument();
  });

  it('displays discover wisdom section', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/From Smriti Atlas/i)).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    // Mock loading state
    vi.doMock('@/store/storiesStore', () => ({
      useStoriesStore: () => ({
        stories: [],
        loading: true,
        addStory: vi.fn(),
        updateStory: vi.fn(),
        deleteStory: vi.fn()
      })
    }));

    render(<HomePage />);
    
    // Should show loading state or empty state
    expect(screen.getByText(/Your story continues/i)).toBeInTheDocument();
  });

  it('handles empty state gracefully', () => {
    // Mock empty data
    vi.doMock('@/store/storiesStore', () => ({
      useStoriesStore: () => ({
        stories: [],
        loading: false,
        addStory: vi.fn(),
        updateStory: vi.fn(),
        deleteStory: vi.fn()
      })
    }));

    vi.doMock('@/store/momentsStore', () => ({
      useMomentsStore: () => ({
        moments: [],
        loading: false,
        addMoment: vi.fn(),
        updateMoment: vi.fn(),
        deleteMoment: vi.fn()
      })
    }));

    render(<HomePage />);
    
    expect(screen.getByText(/Your story continues/i)).toBeInTheDocument();
  });
});
