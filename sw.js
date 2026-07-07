/* Self-destructing service worker.
   The previous site registered a cache-first SW; this replaces it, wipes all
   caches, unregisters itself, and reloads open tabs so visitors get the
   new site instead of a stale cached copy. */
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
