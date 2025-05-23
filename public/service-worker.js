/shabd/Desktop / Webdev / Projects / watch_store / public / service - worker.js
const CACHE_NAME = 'unboxing-store-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/src/main.tsx',
    '/src/styles/main.css',
    '/assets/favicon-16x16.png',
    '/assets/favicon-32x32.png',
    '/assets/android-chrome-192x192.png',
    '/assets/android-chrome-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});