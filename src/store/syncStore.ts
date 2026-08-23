import { create } from 'zustand';
import { checkIsOnline } from '@/lib/network';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  pendingIds: string[];
  setOnlineStatus: (status: boolean) => void;
  setSyncing: (status: boolean) => void;
  setPendingCount: (count: number) => void;
  setPendingIds: (ids: string[]) => void;
  startNetworkWatcher: () => void;
}

let watcherInterval: ReturnType<typeof setInterval> | null = null;

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingCount: 0,
  pendingIds: [],
  setOnlineStatus: (status) => set({ isOnline: status }),
  setSyncing: (status) => set({ isSyncing: status }),
  setPendingCount: (count) => set({ pendingCount: count }),
  setPendingIds: (ids) => set({ pendingIds: ids }),
  startNetworkWatcher: () => {
    if (typeof window === 'undefined') return;
    if (watcherInterval) clearInterval(watcherInterval);

    // Initial check
    checkIsOnline().then((online) => set({ isOnline: online }));

    // Poll every 15 seconds to detect Lie-Fi situations
    watcherInterval = setInterval(async () => {
      const online = await checkIsOnline();
      set({ isOnline: online });
    }, 15000);

    // Also bind to native events for immediate reaction
    window.addEventListener('online', async () => {
      // Confirm it's a real connection
      const online = await checkIsOnline();
      set({ isOnline: online });
    });
    window.addEventListener('offline', () => {
      set({ isOnline: false });
    });
  }
}));
