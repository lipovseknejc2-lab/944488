// Atoll Angler offline worker.
// Lives in its own folder and only handles requests inside it, so it never touches
// other apps on the same site (their pages, caches or saves).
const VERSION = 'atoll-angler-v5';
const PREFIX = 'atoll-angler-';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
const SCOPE = new URL('./', self.location).pathname;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION)
    .then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  // Only remove this game's own old caches.
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const put = (req, res) => {
  if (res && res.ok && res.type !== 'opaque') { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)).catch(() => {}); }
  return res;
};
const fromCache = req => caches.open(VERSION).then(c => c.match(req, { ignoreSearch: true }));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: keep a copy so the game looks right offline.
  if (url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com')) {
    e.respondWith(fromCache(req).then(hit => {
      const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  // Ignore everything outside this game's folder.
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;

  // The game page: newest from the network, but never wait more than 4 s; offline uses the saved copy.
  if (req.mode === 'navigate' || url.pathname === SCOPE || url.pathname.endsWith('/index.html')) {
    e.respondWith(new Promise(resolve => {
      let done = false;
      const finish = r => { if (!done && r) { done = true; resolve(r); } };
      const net = fetch(req).then(r => { put(new Request(SCOPE + 'index.html'), r.clone()); return r; });
      net.then(finish).catch(() => fromCache(SCOPE + 'index.html').then(r => finish(r || Response.error())));
      setTimeout(() => fromCache(SCOPE + 'index.html').then(finish), 4000);
    }));
    return;
  }

  // Icons, manifest and other files: cached copy first, refilled from the network if missing.
  e.respondWith(fromCache(req).then(hit => hit || fetch(req).then(r => put(req, r))));
});
