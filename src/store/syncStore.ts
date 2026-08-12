import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  pendingIds: string[];
  setOnlineStatus: (status: boolean) => void;
  setSyncing: (status: boolean) => void;
  setPendingCount: (count: number) => void;
  setPendingIds: (ids: string[]) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingCount: 0,
  pendingIds: [],
  setOnlineStatus: (status) => set({ isOnline: status }),
  setSyncing: (status) => set({ isSyncing: status }),
  setPendingCount: (count) => set({ pendingCount: count }),
  setPendingIds: (ids) => set({ pendingIds: ids }),
}));
