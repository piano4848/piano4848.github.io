/* 내 손안의 피클 비서 키우기 — v4 (이름 직접 짓기 · 캐릭터 누끼 보정 · 한 화면 맞춤) */
const CACHE = 'pickle-grow-v4';
const ASSETS = [
  './', './index.html', './manifest.json', './icon.svg',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './icon-apple-180.png',
  './assets/chars/s_think.png', './assets/chars/g_red.png', './assets/chars/n_heart.png',
  './assets/chars/d_yellow.png', './assets/chars/r_green.png', './assets/chars/m_sky.png',
  './assets/chars/ch_pinkstar.png', './assets/chars/p_green.png', './assets/chars/b_blue.png',
  './assets/chars/t_mint.png', './assets/chars/o_pink.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // 문서는 항상 네트워크 먼저 — 새 버전이 바로 뜨도록
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put('./index.html', copy)).catch(() => {});
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 정적 자산은 캐시 우선
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      });
    })
  );
});
