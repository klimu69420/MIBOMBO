const CACHE_NAME = 'yamal-run-v2';
const ASSETS = [
  './',
  './index.html',
  './js.js',
  './manifest.json',
  './images/sd.png',
  './images/Lamine-Yamal-12-removebg-preview.png',
  './audio/bgm_mario.mp3',
  './audio/sfx_die.wav',
  './audio/sfx_hit.wav',
  './audio/sfx_point.wav',
  './audio/sfx_swooshing.wav',
  './audio/sfx_wing.wav'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use individual add for better resilience
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => console.log('Failed to cache:', url, err)))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});