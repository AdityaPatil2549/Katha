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
    // If the browser knows it's offline, trust it.
    return false;
  }

  try {
    // Fast ping to a lightweight, highly-available endpoint (Google's 204 No Content generator)
    // Adding a timestamp prevents cache hits which could give false positives.
    const response = await fetch(`https://generate_204?time=${new Date().getTime()}`, {
      method: 'HEAD', // Lightweight request
      mode: 'no-cors', // Avoids CORS blocking while still confirming network resolution
      cache: 'no-store'
    });
    // With no-cors, response.type is 'opaque', but if it didn't throw an error, we have network access.
    return true;
  } catch (error) {
    // A TypeError here indicates a DNS failure or no route to host (i.e., actually offline)
    return false;
  }
}
