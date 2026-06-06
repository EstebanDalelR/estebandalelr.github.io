const CACHE_NAME = 'app-v1';
const STATIC_CACHE = 'static-v1';
const EXTERNAL_CACHE = 'external-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(['/']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const current = [CACHE_NAME, STATIC_CACHE, EXTERNAL_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(keys.filter(k => !current.includes(k)).map(k => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Next.js hashed chunks — cache forever after first fetch
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // External CDN (FFmpeg WASM from unpkg, etc.) — cache on first use
  if (url.origin !== self.location.origin) {
    event.respondWith(cacheFirst(request, EXTERNAL_CACHE));
    return;
  }

  // HTML navigation — network first, fall back to cache
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // Everything else same-origin — stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) ??
      new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const revalidate = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached ?? revalidate;
}
