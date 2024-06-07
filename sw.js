const VERSION_NAME = "2.3.3";
const VERSION_CODE = 20303;

const CACHE_NAME = `koilors-${VERSION_NAME}`;

const APP_STATIC_RESOURCES = [
    "/Koilors/",
    "/Koilors/index.html",
    "/Koilors/scripts/canvas-worker.js",
    "/Koilors/scripts/color.global.js",
    "/Koilors/scripts/colorpicker.js",
    "/Koilors/scripts/data-model.js",
    "/Koilors/scripts/data-view.js",
    "/Koilors/scripts/filesystem.js",
    "/Koilors/scripts/livedata.js",
    "/Koilors/scripts/okcolor.js",
    "/Koilors/scripts/rendering.js",
    "/Koilors/scripts/schemes.js",
    "/Koilors/scripts/text-slider.js",
    "/Koilors/scripts/utils.js",
    "/Koilors/styles/kofi.css",
    "/Koilors/styles/roles-dark.css",
    "/Koilors/styles/roles-light.css",
    "/Koilors/styles/roles.css",
    "/Koilors/styles/style.css"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            cache.addAll(APP_STATIC_RESOURCES);
        })(),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const names = await caches.keys();
            await Promise.all(
                names.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                }),
            );
            await clients.claim();
        })(),
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        (async () => {
            const r = await caches.match(e.request);
            if (r) {
                return r;
            }
            const response = await fetch(e.request);
            const cache = await caches.open(CACHE_NAME);
            cache.put(e.request, response.clone());
            return response;
        })(),
    );
});