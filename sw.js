const CACHE_NAME = 'zhuyin-v2';
const ASSETS = [
  '/',
  '/index.html',
  'https://cdn.jsdelivr.net/npm/pinyin-pro@latest/dist/index.js',
];
for (let i = 0; i < 37; i++) {
  ASSETS.push(`/audio/zy_${String(i).padStart(2, '0')}.mp3`);
}

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
