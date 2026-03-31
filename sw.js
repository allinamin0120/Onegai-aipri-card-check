const CACHE_NAME = "aipri-cache-v4";
const MAX_IMAGE_ITEMS = 50;

// 🔥 事前キャッシュ（最低限）
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// =======================
// インストール
// =======================
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// =======================
// 有効化（古いキャッシュ削除）
// =======================
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
  self.clients.claim();
});

// =======================
// フェッチ処理
// =======================
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // 🔥 画像だけ特別処理
  if (url.includes("/images/")) {
    event.respondWith(handleImageRequest(event.request));
    return;
  }

  // 🔥 それ以外（HTML / JS / CSS）
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// =======================
// 🖼 画像専用キャッシュ制御
// =======================
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // ① キャッシュあれば即返す（高速）
  if (cached) return cached;

  // ② なければ取得して保存
  const response = await fetch(request);
  await cache.put(request, response.clone());

  // ③ 上限超えたら古い画像削除
  const keys = await cache.keys();
  const imageKeys = keys.filter((req) =>
    req.url.includes("/images/")
  );

  if (imageKeys.length > MAX_IMAGE_ITEMS) {
    await cache.delete(imageKeys[0]); // 一番古い削除
  }

  return response;
}
