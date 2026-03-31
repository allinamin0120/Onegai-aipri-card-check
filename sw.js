const CACHE_NAME = "aipri-cache-v2";

// 👇 必ずキャッシュしたいファイル
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/images/mcicon-192.png",
  "/images/mcicon-512.png"
];

// 🔥 インストール（キャッシュ）
self.addEventListener("install", (event) => {
  self.skipWaiting(); // 即反映
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 🔥 有効化（古いキャッシュ削除）
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // 即反映
});

// 🔥 リクエスト処理（オフライン対応）
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュあればそれ使う
      if (response) return response;

      // なければネット取得してキャッシュ
      return fetch(event.request).then((res) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, res.clone());
          return res;
        });
      });
    })
  );
});
