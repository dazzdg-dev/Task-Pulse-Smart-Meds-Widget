// sw.js — Task-Pulse-Smart V8.0+

const CACHE_NAME = 'taskpulse-smart-v8';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './maskable-512.png',
  './taskpulse-splash-hex.jpeg'
  // If you later add share.html or other assets, append them here
];

// Install: pre-cache core assets, but don't die if one fails
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => {
            console.warn('[SW] Failed to cache', url, err);
            // We swallow the error so one bad URL doesn't break install
          })
        )
      )
    )
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('taskpulse-smart-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for same-origin GETs, with an offline fallback for index
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Same-origin navigation → try network, fall back to cached index
  if (url.origin === self.location.origin &&
      (url.pathname === '/' || url.pathname === '/index.html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Everything else: cache first, then network
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
