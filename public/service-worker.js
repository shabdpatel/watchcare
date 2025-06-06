/shabd/Desktop / Webdev / Projects / watch_store / public / service - worker.js
const CACHE_NAME = 'Unbox-store-v1';
const OFFLINE_URL = '/offline.html';

const urlsToCache = [
    '/',
    '/index.html',
    '/offline.html',
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
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request)
                    .catch(() => {
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('Unbox-store-') && cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});