const CACHE_NAME = "aipri-cache-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json"
];

// 🔥 インストール時にキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 🔥 リクエスト時
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
