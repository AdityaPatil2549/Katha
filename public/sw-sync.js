// Custom Background Sync handler for Katha
self.addEventListener('sync', (event) => {
  if (event.tag === 'katha-sync') {
    event.waitUntil(
      (async () => {
        // Find all visible clients and ask them to flush the queue
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        
        let handledByClient = false;
        for (const client of clients) {
          // If a client is open, we can just tell it to run the flushQueue function
          client.postMessage({ type: 'KATHA_SYNC' });
          handledByClient = true;
        }

        if (!handledByClient) {
          // No open window clients found; pending outbox mutations remain queued in IndexedDB
          // and flush automatically the next time a Katha client opens online.
        }
      })()
    );
  }
});
