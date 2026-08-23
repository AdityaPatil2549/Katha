import { useSyncStore } from '@/store/syncStore';

export async function bootstrapApp() {
  // Start accurate network polling
  useSyncStore.getState().startNetworkWatcher();
}
