import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils/testUtils';
import { mockLocalStorage } from '@/test/utils/testUtils';
import AddStoryPage from '@/features/story/AddStoryPage';

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

  it('renders the first step of the wizard successfully', async () => {
    render(<AddStoryPage />);

    expect(screen.getByText(/Add a New Story/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /The Essentials/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter the exact title/i)).toBeInTheDocument();
  });

  it('validates required fields on step 1 before continuing', async () => {
    render(<AddStoryPage />);
    
    // Mock window alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Try to continue without filling fields
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    await user.click(continueBtn);

    // Should alert
    expect(alertMock).toHaveBeenCalledWith('Title is required');
    alertMock.mockRestore();
  });

  it('navigates to step 2 after filling step 1', async () => {
    render(<AddStoryPage />);

    const titleInput = screen.getByPlaceholderText(/Enter the exact title/i);
    await user.type(titleInput, 'Test Story');

    // Click Anime category button (span containing Anime)
    const animeCat = screen.getByText('Anime', { selector: 'span.text-sm' });
    await user.click(animeCat);

    // Open dropdown and select platform
    const platformTrigger = screen.getByText('Select platform...');
    await user.click(platformTrigger);
    
    // Select Netflix
    const netflixOpt = await screen.findByText('Netflix');
    await user.click(netflixOpt);

    // Continue
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    await user.click(continueBtn);

    // Step 2 should render
    await waitFor(() => {
      expect(screen.getByText(/Progress & Details/i)).toBeInTheDocument();
    });
  });
});
