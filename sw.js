const CACHE_NAME = 'spicy-app-v2'; // Bumped version for optimized caching
const urlsToCache = [
    '/',
    '/index.html',
    '/discover.html',
    '/watch.html',
    '/sources.js',
    '/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.14.1/cdn.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    // Activate new service worker immediately
    self.skipWaiting();
});

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Strategy 1: Network-first for TMDB API (always fresh movie data)
    if (url.hostname === 'api.themoviedb.org') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache the fresh response for offline fallback
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Offline: return cached version if available
                    return caches.match(event.request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Return a basic offline response
                            return new Response(
                                JSON.stringify({ results: [], offline: true }),
                                { headers: { 'Content-Type': 'application/json' } }
                            );
                        });
                })
        );
    }

    // Strategy 2: Cache-first for TMDB images (fast, rarely change)
    else if (url.hostname === 'image.tmdb.org') {
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Not in cache, fetch and cache it
                    return fetch(event.request).then(response => {
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return response;
                    });
                })
        );
    }

    // Strategy 3: Stale-while-revalidate for CDN resources (fast + updated)
    else if (url.hostname.includes('cdn.') || url.hostname.includes('cdnjs.')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    const fetchPromise = fetch(event.request)
                        .then(networkResponse => {
                            if (networkResponse.status === 200) {
                                cache.put(event.request, networkResponse.clone());
                            }
                            return networkResponse;
                        })
                        .catch(() => cachedResponse); // Use cache if network fails

                    // Return cached immediately, update in background
                    return cachedResponse || fetchPromise;
                });
            })
        );
    }

    // Strategy 4: Cache-first for video player embed (external)
    else if (url.hostname === 'vidfast.pro') {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    }

    // Strategy 5: Network-first for app HTML (always latest version)
    else if (event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(event.request)) // Offline fallback
        );
    }

    // Strategy 6: Cache-first for everything else (app assets)
    else {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
