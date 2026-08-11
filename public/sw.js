const CACHE_NAME = 'presumart-pwa-v5';
const urlsToCache = [
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

// Only cache static images & fonts, NEVER Next.js internal JS/CSS bundle chunks or API routes
const CACHEABLE_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/;
const EXCLUDED_PATHS = /(\/api\/|\/_next\/)/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // SECURITY: Never cache API routes, Next.js JS chunks, or dynamic HTML pages
  if (EXCLUDED_PATHS.test(url.pathname) || event.request.mode === 'navigate') return;

  // Only cache static media assets (images, icons, fonts)
  const isStaticAsset = CACHEABLE_EXTENSIONS.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});
