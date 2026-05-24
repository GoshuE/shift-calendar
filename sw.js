// しふとん🌱 Service Worker
// 戦略:
//   - 静的アセット（HTML/CSS/JS/画像/manifest）: Cache-First + バックグラウンド更新
//   - Google API（Calendar / GIS）: ノータッチ（必ずネットワーク経由）
//   - Google Fonts: Cache-First
// 更新方法: CACHE_VERSION を上げると古いキャッシュを破棄して再キャッシュする。

const CACHE_VERSION = 'v2-2026-05-24';
const CACHE_NAME = `shifton-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './midorintop.webp',
  './midorin2.webp',
  './midorin-umbrella.webp',
  './midorin-tree.webp',
  './midorin-basket.webp',
  './midorin-dango2.webp',
  './midorin-clover.webp',
  './yoko1.webp', './yoko2.webp', './yoko3.webp', './yoko4.webp', './yoko5.webp',
  './1月.webp', './2月.webp', './3月.webp', './4月.webp', './5月.webp', './6月.webp',
  './7月.webp', './8月.webp', './9月.webp', './10月.webp', './11月.webp', './12月.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Google API系はSWが触らない（OAuth/Calendar APIをキャッシュすると壊れる）
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname === 'accounts.google.com' ||
    url.hostname === 'apis.google.com'
  ) {
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  const isGoogleFonts =
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  if (!sameOrigin && !isGoogleFonts) return;

  // Cache-First + バックグラウンド更新（stale-while-revalidate）
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);

    const networkUpdate = fetch(event.request).then((resp) => {
      if (resp && resp.ok && (resp.type === 'basic' || resp.type === 'cors')) {
        cache.put(event.request, resp.clone()).catch(() => {});
      }
      return resp;
    }).catch(() => null);

    if (cached) return cached;

    const fresh = await networkUpdate;
    if (fresh) return fresh;

    // どちらも失敗（オフライン＋未キャッシュ）→ HTMLナビゲーション要求ならindex.htmlで代替
    if (event.request.mode === 'navigate') {
      const fallback = await cache.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('', { status: 504, statusText: 'Offline' });
  })());
});
