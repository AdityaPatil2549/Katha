import { describe, it, expect, beforeEach, vi } from 'vitest';

const {
  whereEqualsSortByMock,
  orderByToArrayMock,
  deleteQueueItemMock,
  cloudCreateMock,
  checkIsOnlineMock,
} = vi.hoisted(() => ({
  whereEqualsSortByMock: vi.fn(),
  orderByToArrayMock: vi.fn(),
  deleteQueueItemMock: vi.fn(),
  cloudCreateMock: vi.fn(),
  checkIsOnlineMock: vi.fn(),
}));

vi.mock('@/db/KathaDb', () => ({
  db: {
    syncQueue: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          sortBy: whereEqualsSortByMock,
        })),
      })),
      orderBy: vi.fn(() => ({
        toArray: orderByToArrayMock,
      })),
      toArray: vi.fn().mockResolvedValue([]),
      delete: deleteQueueItemMock,
    },
  },
}));

vi.mock('@/db/DatabaseService', () => ({
  dbService: {
    getUserId: vi.fn(() => 'user-alpha'),
    stories: {
      cloudRepo: {
        findById: vi.fn(),
        create: cloudCreateMock,
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  },
}));

vi.mock('@/lib/network', () => ({
  checkIsOnline: checkIsOnlineMock,
}));

import { SyncManager } from '@/db/SyncManager';
import { db } from '@/db/KathaDb';
import { useSyncStore } from '@/store/syncStore';

describe('SyncManager UID queue isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSyncStore.setState({ pendingCount: 0, pendingIds: [], isSyncing: false });
    checkIsOnlineMock.mockResolvedValue(true);
    cloudCreateMock.mockResolvedValue({});
    deleteQueueItemMock.mockResolvedValue(undefined);
  });

  it('queries syncQueue scoped by active userId and flushes only matching operations', async () => {
    whereEqualsSortByMock.mockResolvedValueOnce([
      {
        id: 'q1',
        userId: 'user-alpha',
        table: 'stories',
        action: 'CREATE',
        data: { id: 'story-1', title: 'Alpha Story' },
        timestamp: 1000,
      },
    ]);

    const manager = new SyncManager();
    await manager.flushQueue();

    expect(db.syncQueue.where).toHaveBeenCalledWith('userId');
    expect(cloudCreateMock).toHaveBeenCalledWith({ id: 'story-1', title: 'Alpha Story' });
    expect(deleteQueueItemMock).toHaveBeenCalledWith('q1');
  });

  it('updates pending count without flushing when offline', async () => {
    checkIsOnlineMock.mockResolvedValueOnce(false);
    whereEqualsSortByMock.mockResolvedValueOnce([
      {
        id: 'q2',
        userId: 'user-alpha',
        table: 'stories',
        action: 'CREATE',
        data: { id: 'story-2', title: 'Queued Offline' },
        timestamp: 2000,
      },
    ]);

    const manager = new SyncManager();
    await manager.flushQueue();

    expect(useSyncStore.getState().pendingCount).toBe(1);
    expect(cloudCreateMock).not.toHaveBeenCalled();
    expect(deleteQueueItemMock).not.toHaveBeenCalled();
  });
});

