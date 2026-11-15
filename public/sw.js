// sw.js - Service Worker for FIELD SHIFT offline farm planning

const CACHE_NAME = 'field-shift-cache-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  '../src/css/styles.css',
  '../src/js/app.js',
  '../src/js/translations.js',
  '../src/js/data.js',
  '../src/js/speech.js',
  '../src/js/state.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => console.log('Cache addAll warning:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).catch(() => caches.match('./index.html'));
    })
  );
});
