const versionName = "2.5.1-legacy";
const CACHE_cacheNameNAME = `koilors-${VERSION_NAME}`;
const contentToCache = [
    "Koilors/index.html",
    "Koilors/scripts/canvas-worker.js",
    "Koilors/scripts/color.global.js",
    "Koilors/scripts/colorpicker.js",
    "Koilors/scripts/data-model.js",
    "Koilors/scripts/data-view.js",
    "Koilors/scripts/extras.js",
    "Koilors/scripts/filesystem.js",
    "Koilors/scripts/livedata.js",
    "Koilors/scripts/okcolor.js",
    "Koilors/scripts/rendering.js",
    "Koilors/scripts/schemes.js",
    "Koilors/scripts/text-slider.js",
    "Koilors/scripts/utils.js",
    "Koilors/styles/roles-dark.css",
    "Koilors/styles/roles-light.css",
    "Koilors/styles/roles.css",
    "Koilors/styles/style.css"
];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
});
