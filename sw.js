/* =====================================================================
   sw.js — Service Worker for رفيق القرآن (spec sections 31, 66, 75)
   ---------------------------------------------------------------------
   Cache strategy:
   - App shell (HTML/CSS/JS/Icons): cache-first, fall back to network
   - Quran JSON data: stale-while-revalidate (large, immutable)
   - Audio files (islamic.network CDN): cache on demand, never pre-cache
   - Fonts (Google Fonts): stale-while-revalidate
   - Everything else: network-first, fall back to cache

   Versioning (spec section 75): bump CACHE_VERSION on each deploy
   ===================================================================== */

const CACHE_VERSION = 'rafiq-alquran-v2.0';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const DATA_CACHE = `${CACHE_VERSION}-data`;
const AUDIO_CACHE = `${CACHE_VERSION}-audio`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;

const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/navigation.css',
  './css/home.css',
  './css/quran.css',
  './css/tajweed.css',
  './css/search.css',
  './css/audio.css',
  './css/tasbeeh.css',
  './css/adhkar.css',
  './css/prayer-qibla.css',
  './css/names.css',
  './css/calendar-names.css',
  './js/app.js',
  './js/router.js',
  './js/state.js',
  './js/storage.js',
  './js/home.js',
  './js/more.js',
  './js/quran/quran-data.js',
  './js/quran/reader.js',
  './js/quran/search.js',
  './js/quran/tajweed.js',
  './js/audio/audio-player.js',
  './js/audio/reciters.js',
  './js/wird/wird.js',
  './js/tadabbur/tadabbur.js',
  './js/settings/settings.js',
  './js/tasbeeh/tasbeeh.js',
  './js/adhkar/adhkar.js',
  './js/prayer/prayer-times.js',
  './js/qibla/qibla.js',
  './js/names/names-of-allah.js',
  './js/calendar/hijri-calendar.js',
  './components/icons.js',
  './components/bottom-nav.js',
  './components/bottom-sheet.js',
  './components/toast.js',
  './data/names-of-allah/names.json',
  './assets/logo-1.png',
  './assets/ui-image-1.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      // Add assets one-by-one so a single 404 doesn't break install
      return Promise.allSettled(
        SHELL_ASSETS.map((url) =>
          cache.add(url).catch((e) => console.warn('SW: failed to cache', url, e))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if (req.method !== 'GET') return;

  // Skip cross-origin requests except specific CDNs
  const isSameOrigin = url.origin === self.location.origin;
  const isAudioCDN = url.origin === 'https://cdn.islamic.network';
  const isFontsCDN = url.origin === 'https://fonts.googleapis.com' ||
                     url.origin === 'https://fonts.gstatic.com';

  if (!isSameOrigin && !isAudioCDN && !isFontsCDN) return;

  // ===== Audio files: cache on demand (lazy) =====
  if (isAudioCDN && url.pathname.includes('/audio/')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          if (fresh.ok) cache.put(req, fresh.clone());
          return fresh;
        } catch (e) {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // ===== Google Fonts: stale-while-revalidate =====
  if (isFontsCDN) {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req).then((fresh) => {
          if (fresh.ok) cache.put(req, fresh.clone());
          return fresh;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // ===== Quran JSON data: stale-while-revalidate =====
  if (isSameOrigin && url.pathname.endsWith('.json') && url.pathname.includes('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req).then((fresh) => {
          if (fresh.ok) cache.put(req, fresh.clone());
          return fresh;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // ===== App shell: cache-first, fall back to network =====
  if (isSameOrigin) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) {
          // Re-validate in background
          fetch(req).then((fresh) => {
            if (fresh.ok) cache.put(req, fresh.clone());
          }).catch(() => {});
          return cached;
        }
        try {
          const fresh = await fetch(req);
          if (fresh.ok && req.url.startsWith(self.location.origin)) {
            cache.put(req, fresh.clone());
          }
          return fresh;
        } catch (e) {
          // If navigating to a page, fall back to index.html (SPA)
          if (req.mode === 'navigate') {
            return cache.match('./index.html');
          }
          return Response.error();
        }
      })
    );
    return;
  }
});

/* Allow page to trigger immediate SW update */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
