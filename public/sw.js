const CACHE_NAME = 'biryani-spot-v9';
const CACHE_PREFIX = 'biryani-spot-';
const APP_SHELL = [
  './',
  './index.html',
  './favicon.svg',
  './biryani-spot-logo.png',
  './manifest.webmanifest',
];

// Cache the app shell and the compiled JavaScript/CSS referenced by index.html.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL);

      const response = (await cache.match('./index.html')) ?? (await cache.match('./'));
      if (!response) return;

      const html = await response.text();
      const assetPaths = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)]
        .map((match) => match[1])
        .filter((path) => !/^https?:\/\//i.test(path))
        .map((path) => new URL(path, self.registration.scope).href);

      if (assetPaths.length > 0) {
        await cache.addAll(assetPaths);
      }
    })(),
  );

  self.skipWaiting();
});

// Remove only older caches owned by this menu, then activate the new worker.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const staleCaches = cacheNames.filter(
        (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME,
      );

      await Promise.all(staleCaches.map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

// Use fresh network responses for navigation; use cached assets when offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response.clone());
          }
          return response;
        } catch {
          const fallback =
            (await cache.match(request)) ??
            (await cache.match('./index.html')) ??
            (await cache.match('./'));

          return (
            fallback ??
            new Response(
              'Biryani Spot menu is not available offline yet. Please reconnect and open the menu once.',
              {
                status: 503,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
              },
            )
          );
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok && new URL(request.url).origin === self.location.origin) {
        await cache.put(request, response.clone());
      }
      return response;
    })(),
  );
});
