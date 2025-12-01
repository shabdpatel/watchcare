// Bump cache version when making changes so clients upgrade quickly
const CACHE_NAME = 'unbox-store-v2';
const OFFLINE_URL = '/offline.html';

// Only cache safe, static assets here. We do NOT cache index.html or '/'
// to avoid serving stale HTML that references removed/renamed JS bundles.
const urlsToCache = [
    '/offline.html',
    '/site.webmanifest',
    '/robots.txt',
    '/assets/favicon-16x16.png',
    '/assets/favicon-32x32.png',
    '/assets/android-chrome-192x192.png',
    '/assets/android-chrome-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Fetch strategy:
// - Navigation requests (HTML) => network-first, fallback to offline page.
// - JS/CSS (scripts/styles) => network-first with cache fallback.
// - Images and other static assets => cache-first with network update.
self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    // Always try network first for navigation so we don't serve a stale index.html
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // If we got a valid response, update cache for navigations optionally
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    const dest = request.destination;

    // For scripts and styles prefer network then fallback to cache
    if (dest === 'script' || dest === 'style') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Images and other assets: cache-first
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request)
                .then((response) => {
                    // Only cache same-origin successful responses
                    if (response && response.ok && new URL(request.url).origin === location.origin) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to offline page for navigations handled above; here just fail silently
                    return;
                });
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('unbox-store-') && name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});