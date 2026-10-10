const CACHE_NAME = 'biryani-spot-v4';
const CACHE_PREFIX = 'biryani-spot-';
const APP_SHELL = [
  './',
  './index.html',
  './brand-logo.svg',
  './biryani-spot-brand.webp',
  './favicon.svg',
  './manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);

    // Precache the built JavaScript and CSS referenced by index.html so a
    // repeat visit can render the menu even when the restaurant Wi-Fi fails.
    const documentResponse = await cache.match('./index.html') ?? await cache.match('./');
    if (documentResponse) {
      const html = await documentResponse.text();
      const assetPaths = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)]
        .map((match) => match[1])
        .filter((path) => !/^https?:\/\//i.test(path))
        .map((path) => new URL(path, self.registration.scope).href);

      if (assetPaths.length) {
        await cache.addAll(assetPaths);
      }
    }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // Only remove previous Biryani Spot caches. Do not delete caches belonging
    // to another app sharing the same origin (for example, GitHub Pages).
    await Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;
  const isNavigation = request.mode === 'navigate';

  if (isNavigation) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return await cache.match(request)
          ?? await cache.match('./index.html')
          ?? await cache.match('./')
          ?? new Response('Biryani Spot menu is not available offline yet. Please reconnect and open the menu once.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (
        response.ok
        && new URL(request.url).origin === self.location.origin
      ) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      // External resources (such as web fonts) may be unavailable offline;
      // browser/system font fallbacks keep the menu readable.
      throw error;
    }
  })());
});
