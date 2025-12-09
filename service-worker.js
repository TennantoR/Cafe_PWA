// A name for this version of the cache
const CACHE_NAME = "cafe-finigan-v1";

const STATIC_ASSETS = [
  "/templates/index.html",
  "/templates/menu.html",
  "/templates/orders.html",
  "/templates/thanks.html",
  "/static/style.css",
  "/static/menu.js",
  "/static/orders.js",
  "/static/thanks.js",
  "/static/images/icons/logo-192.png",
  "/static/images/icons/logo-512.png",
  "/static/images/logo.png",
  "/static/images/hero.jpg",
  "/static/images/menu-banner.jpg",
  "/static/images/poached_eggs_on_toast.jpg",
  "/static/images/beef_burger.jpg",
  "/static/images/ham_and_cheese_croissant.jpg",
  "/static/images/potato_wedges.jpg",
  "/static/images/banana_bread.jpg",
  "/static/images/chocolate_muffin.jpg",
  "/static/images/flat_white.jpg",
  "/static/images/iced_latte.jpg",
  "/static/images/orange_juice.jpg",
  "/static/images/mocha.jpg",
  "/static/menu-offline.json"
];

// Install event: pre-cache all static assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event: remove old caches that don't match the current version
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch event: use cache first, then network
self.addEventListener("fetch", event => {
  const requestUrl = event.request.url;

  // Never cache backend API calls to Flask
  if (requestUrl.startsWith("http://127.0.0.1:5050")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // If we have a cached response, return it; otherwise go to the network
      return cachedResponse || fetch(event.request);
    })
  );
});