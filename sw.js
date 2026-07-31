const CACHE_NAME = 'lifepilot-v1';
const urlsToCache = [
  './index.html',
  './icon_64x64.png',
  './icon_256x256.png',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/2.44.0/iconfont/tabler-icons.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/dropbox.js/10.33.0/Dropbox-sdk.min.js'
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
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});
