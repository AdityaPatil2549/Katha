import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver as any;

// Mock Dexie/DB to prevent IndexedDB API missing errors in jsdom
vi.mock('@/db/DatabaseService', () => {
  return {
    dbService: {
      setUserId: vi.fn(),
      stories: {
        getPendingSyncOperations: vi.fn().mockResolvedValue([]),
        getAll: vi.fn().mockResolvedValue([]),
        add: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      moments: {
        getPendingSyncOperations: vi.fn().mockResolvedValue([]),
        getAll: vi.fn().mockResolvedValue([]),
        add: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      }
    }
  };
});
