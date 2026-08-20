const CACHE_NAME = 'lifepilot-v12-auto-dropbox-connect';
const urlsToCache = [
  './index.html',
  './style.css',
  './app.js',
  './icon_64x64.png',
  './icon_256x256.png',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/2.44.0/iconfont/tabler-icons.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/dropbox.js/10.33.0/Dropbox-sdk.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

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
    }).then(() => self.clients.claim())
  );
});

// Network first, fallback to cache for HTML to ensure updates
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) return response;
          return fetch(event.request);
        })
    );
  }
});
