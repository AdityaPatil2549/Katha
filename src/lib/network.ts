/**
 * network.ts
 * 
 * Provides robust network connectivity detection.
 * navigator.onLine is notoriously inaccurate (it only verifies a local network connection,
 * e.g., you are connected to a router, but the router might have no internet access - "Lie-Fi").
 * 
 * This module performs a lightweight HTTP ping to verify true connectivity.
 */

export async function checkIsOnline(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  // To achieve maximum accuracy (bypassing captive portals and 'Lie-Fi'),
  // we ping redundant, highly available endpoints that support CORS.
  // Using DNS-over-HTTPS APIs because they are incredibly fast and always support CORS.
  const endpoints = [
    'https://dns.google/resolve?name=google.com',
    'https://cloudflare-dns.com/dns-query?name=cloudflare.com&type=A'
  ];

  try {
    const checkEndpoint = async (url: string) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second strict timeout

      try {
        const response = await fetch(`${url}&_cb=${new Date().getTime()}`, {
          method: 'GET',
          mode: 'cors', // Enforce CORS to bypass captive portals (which redirect to non-CORS HTML pages)
          headers: { 'Accept': 'application/dns-json' },
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Not ok');
        return true;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error; // Let Promise.any handle it
      }
    };

    // If ANY of the highly available endpoints resolve, we have internet.
    await Promise.any(endpoints.map(checkEndpoint));
    return true;

  } catch (error) {
    // If ALL endpoints fail or timeout, we are truly offline or behind a restrictive captive portal.
    return false;
  }
}
