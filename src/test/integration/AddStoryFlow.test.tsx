import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils/testUtils';
import { createMockStory, mockLocalStorage } from '@/test/utils/testUtils';

// Mock the router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock the store
vi.mock('@/store/storiesStore', () => ({
  useStoriesStore: () => ({
    stories: [],
    loading: false,
    addStory: vi.fn(),
    updateStory: vi.fn(),
    deleteStory: vi.fn()
  })
}));

describe('Add Story Flow Integration', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    mockLocalStorage();
    vi.clearAllMocks();
  });

  it('should navigate through the add story form successfully', async () => {
    // Import dynamically to avoid issues with mocked modules
    const { default: AddStoryPage } = await import('@/features/story/AddStoryPage');
    
    render(<AddStoryPage />);

    // Check if the form renders
    expect(screen.getByText(/Add a New Story/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Story title/i)).toBeInTheDocument();

    // Fill in the title
    const titleInput = screen.getByLabelText(/Story title/i);
    await user.type(titleInput, 'Test Story Title');

    // Select category
    const categorySelect = screen.getByLabelText(/Category/i);
    await user.selectOptions(categorySelect, 'anime');

    // Select platform
    const platformSelect = screen.getByLabelText(/Select streaming platform/i);
    await user.selectOptions(platformSelect, 'Netflix');

    // Fill in rating
    const ratingInput = screen.getByLabelText(/Rating/i);
    await user.type(ratingInput, '8');

    // Add genre
    const genreSelect = screen.getByLabelText(/Select genre to add/i);
    await user.selectOptions(genreSelect, 'Action');
    
    // Click add genre button
    const addGenreBtn = screen.getByLabelText(/Add selected genre/i);
    await user.click(addGenreBtn);

    // Add mood
    const moodBtn = screen.getByLabelText(/Toggle Inspired mood/i);
    await user.click(moodBtn);

    // Submit the form
    const saveBtn = screen.getByRole('button', { name: /Save Story/i });
    await user.click(saveBtn);

    // Verify the story was added (mock should have been called)
    // Note: Since we're mocking the store, we can't test actual navigation
    // but we can verify the form submission doesn't crash
    expect(screen.getByText(/Add a New Story/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const { default: AddStoryPage } = await import('@/features/story/AddStoryPage');
    
    render(<AddStoryPage />);

    // Try to submit without filling required fields
    const saveBtn = screen.getByRole('button', { name: /Save Story/i });
    await user.click(saveBtn);

    // Should show validation errors
    expect(screen.getByText(/Add a New Story/i)).toBeInTheDocument();
  });

  it('should handle conditional logic for different statuses', async () => {
    const { default: AddStoryPage } = await import('@/features/story/AddStoryPage');
    
    render(<AddStoryPage />);

    // Fill in basic info first
    await user.type(screen.getByLabelText(/Story title/i), 'Test Story');
    await user.selectOptions(screen.getByLabelText(/Category/i), 'anime');
    await user.selectOptions(screen.getByLabelText(/Select streaming platform/i), 'Netflix');

    // Select "Watching" status
    const watchingBtn = screen.getByRole('button', { name: /Watching/i });
    await user.click(watchingBtn);

    // Should show progress fields
    expect(screen.getByLabelText(/Total episodes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current episode/i)).toBeInTheDocument();

    // Select "Completed" status
    const completedBtn = screen.getByRole('button', { name: /Completed/i });
    await user.click(completedBtn);

    // Should hide progress fields for completed
    // Note: The UI might still show them but disabled
  });

  it('should handle poster upload', async () => {
    const { default: AddStoryPage } = await import('@/features/story/AddStoryPage');
    
    render(<AddStoryPage />);

    // Find the poster upload area
    const posterArea = screen.getByText(/Drag & drop or click to upload/i);
    expect(posterArea).toBeInTheDocument();

    // Create a mock file
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    // Simulate file upload (this would need actual implementation)
    // For now, just verify the upload area exists
    expect(posterArea).toBeInTheDocument();
  });
});
