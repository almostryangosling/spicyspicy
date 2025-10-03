// Optimized Service Worker for Spicy Streaming
// Version 2.0 - Performance Optimized

const VERSION = 'v2';
const STATIC_CACHE = `spicy-static-${VERSION}`;
const IMAGE_CACHE = `spicy-images-${VERSION}`;
const API_CACHE = `spicy-api-${VERSION}`;

// Cache size limits
const MAX_IMAGE_CACHE = 100;
const MAX_API_CACHE = 50;

// Static assets to cache immediately
const urlsToCache = [
    '/',
    '/index.html',
    '/discover.html',
    '/watch.html',
    '/manifest.json',
    '/appicon.jpg'
    // Note: CDN resources are NOT cached (they're dynamic)
];

// Install event - cache static resources
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker v2...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker v2...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name.startsWith('spicy-') && !name.includes(VERSION))
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - smart caching strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Strategy 1: API calls - Network-first (with cache fallback)
    if (url.hostname === 'api.themoviedb.org') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache successful responses
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(API_CACHE).then(cache => {
                            cache.put(request, clone);
                            // Limit cache size
                            limitCacheSize(API_CACHE, MAX_API_CACHE);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if offline
                    console.log('[SW] API offline, using cache');
                    return caches.match(request);
                })
        );
        return;
    }

    // Strategy 2: Images - Cache-first (with network fallback)
    if (url.hostname === 'image.tmdb.org' || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.png')) {
        event.respondWith(
            caches.match(request)
                .then(cached => {
                    if (cached) {
                        return cached;
                    }
                    // Not in cache, fetch from network
                    return fetch(request).then(response => {
                        if (response.ok) {
                            const clone = response.clone();
                            caches.open(IMAGE_CACHE).then(cache => {
                                cache.put(request, clone);
                                // Limit cache size
                                limitCacheSize(IMAGE_CACHE, MAX_IMAGE_CACHE);
                            });
                        }
                        return response;
                    });
                })
        );
        return;
    }

    // Strategy 3: CDN resources - Network only (never cache)
    if (url.hostname === 'cdn.tailwindcss.com' ||
        url.hostname === 'cdnjs.cloudflare.com' ||
        url.hostname === '_vercel') {
        event.respondWith(fetch(request));
        return;
    }

    // Strategy 4: Static assets - Cache-first
    event.respondWith(
        caches.match(request)
            .then(response => response || fetch(request))
    );
});

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxItems) {
        // Delete oldest entries (FIFO)
        const deleteCount = keys.length - maxItems;
        for (let i = 0; i < deleteCount; i++) {
            await cache.delete(keys[i]);
        }
        console.log(`[SW] Trimmed ${deleteCount} items from ${cacheName}`);
    }
}

// Listen for messages from clients
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data === 'clearCache') {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
});
