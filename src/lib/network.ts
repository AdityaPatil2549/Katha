/**
 * network.ts
 *
 * CSP-safe, low-overhead network connectivity detection.
 * Uses navigator.onLine plus a same-origin HEAD probe against /manifest.webmanifest
 * (short-cached for 10s to avoid redundant probes during batch sync flushes).
 */

let lastCheckedAt = 0;
let lastOnlineResult = true;
const CACHE_TTL_MS = 10_000;

export function resetNetworkCacheForTests() {
  lastCheckedAt = 0;
  lastOnlineResult = true;
}

export async function checkIsOnline(force = false): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    lastOnlineResult = false;
    lastCheckedAt = Date.now();
    return false;
  }

  const now = Date.now();
  if (!force && lastCheckedAt > 0 && now - lastCheckedAt < CACHE_TTL_MS) {
    return lastOnlineResult;
  }

  if (typeof window === 'undefined' || typeof fetch !== 'function') {
    return true;
  }

  // Only perform same-origin HTTP fetch when served over http(s)
  if (!window.location.origin.startsWith('http')) {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`/manifest.webmanifest?_cb=${now}`, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    lastOnlineResult = response.ok || response.status < 500;
  } catch {
    lastOnlineResult = false;
  } finally {
    clearTimeout(timeoutId);
    lastCheckedAt = Date.now();
  }

  return lastOnlineResult;
}

export async function registerBackgroundSync() {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register('katha-sync');
      }
    } catch (err) {
      console.warn('[Background Sync] Failed to register:', err);
    }
  }
}
