// filepath: public/sw.js
const CACHE_NAME = 'draftlab-cache-v1';
const DATA_DRAGON_CACHE = 'ddragon-assets-v1';

const STATIC_ASSETS = [
  '/',
  '/draft',
  '/champions',
  '/duos',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_DRAGON_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache-first strategy for League Data Dragon images/JSON data
  if (url.hostname.includes('ddragon.leagueoflegends.com')) {
    event.respondWith(
      caches.open(DATA_DRAGON_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached response and fetch updated version in background (stale-while-revalidate)
            fetch(event.request).then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse);
              }
            }).catch(() => {/* ignore background fetch errors */});
            return cachedResponse;
          }

          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Fail gracefully if offline
            return new Response(JSON.stringify({ error: "Offline" }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      })
    );
  } else {
    // Network-first strategy for App Shell
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If successful, update static cache
          if (response.status === 200 && STATIC_ASSETS.includes(url.pathname)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});
