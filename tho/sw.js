// Sổ Thợ Nail – offline cache. App by Ryan Nguyen.
// Only the app's own files are cached. Your salon data is never sent anywhere.
const CACHE = 'so-tho-nail-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './help/vi-addcust.jpg', './help/en-addcust.jpg', './help/vi-cal.jpg', './help/en-cal.jpg', './help/vi-slip.jpg', './help/en-slip.jpg', './help/vi-backup.jpg', './help/en-backup.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Serve from the phone first (works offline); quietly fetch a newer copy when online.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request, { ignoreSearch: true }).then(hit => {
        const net = fetch(e.request).then(res => {
          if (res && res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => hit || cache.match('./index.html'));
        return hit || net;
      })
    )
  );
});
