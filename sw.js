const CACHE_NAME = 'portfolio-v1';

const basePath = self.location.pathname.includes('/DigitalResume/')
  ? '/DigitalResume/'
  : '/';

const urlsToCache = [
  `${basePath}`,
  `${basePath}index.html`,
  `${basePath}src/styles/main.css`,
  `${basePath}src/styles/theme-switcher.css`,
  `${basePath}src/js/mobile-menu.js`,
  `${basePath}src/js/theme-switcher.js`,
  `${basePath}src/js/gsap-animations.js`,
  `${basePath}src/js/form-handler.js`,
  `${basePath}assets/images/headshots.jfif`,
  `${basePath}assets/images/favicon.png`,
  `${basePath}offline.html`
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('Cache addAll failed:', err))
  );
});

// Activate Service Worker
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

// Fetch Event Strategy (Cache First)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return from cache if available
      if (response) return response;

      // Otherwise fetch from network
      return fetch(event.request).catch(() => {
        // If it's a navigation request (HTML page), show offline fallback
        if (event.request.destination === 'document') {
          return caches.match(`${basePath}offline.html`);
        }
      });
    })
  );
});

