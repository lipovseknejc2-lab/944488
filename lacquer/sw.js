// Lacquer offline worker (v1).
// Lives in its own folder and only handles requests inside it, so it never touches
// other apps on the same site (their pages, caches or saves).
// Install only finishes once the game page itself is saved, so "ready" really means ready offline.
const VERSION = 'lacquer-v1';
const PREFIX = 'lacquer-';
const SCOPE = new URL('./', self.location).pathname;
const PAGE = SCOPE + 'index.html';
const EXTRA = ['manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','icon-512-maskable.png'];

// Safari refuses to show a page that was reached through a redirect when it comes from a worker,
// so every page answer is rebuilt as a plain, clean response.
const clean = async r => {
  if (!r) return r;
  if (!r.redirected && r.type === 'basic') return r;
  const body = await r.blob();
  return new Response(body, { status: 200, statusText: 'OK', headers: { 'Content-Type': r.headers.get('Content-Type') || 'text/html; charset=utf-8' } });
};

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    const r = await fetch(new Request(PAGE, { cache: 'reload' }));
    if (!r.ok) throw new Error('page not saved');
    await c.put(PAGE, await clean(r));
    await Promise.all(EXTRA.map(u => fetch(new Request(SCOPE + u, { cache: 'reload' })).then(x => x.ok && c.put(SCOPE + u, x)).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const fromCache = u => caches.open(VERSION).then(c => c.match(u, { ignoreSearch: true }));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: keep a copy so the game looks right offline.
  if (url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com')) {
    e.respondWith(fromCache(req).then(hit => hit || fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return r; }).catch(() => Response.error())));
    return;
  }

  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;

  // The game page: the saved copy opens instantly (works with no internet at all);
  // a fresh copy is fetched quietly in the background for next time.
  if (req.mode === 'navigate' || url.pathname === SCOPE || url.pathname === PAGE) {
    e.respondWith((async () => {
      const hit = await fromCache(PAGE);
      const net = fetch(new Request(PAGE, { cache: 'no-cache' })).then(async r => { if (r && r.ok) { const cl = await clean(r); const c = await caches.open(VERSION); await c.put(PAGE, cl.clone()); return cl } return r; });
      if (hit) { e.waitUntil(net.catch(() => {})); return clean(hit); }
      try { return await net; } catch (err) { return new Response('<meta name=viewport content="width=device-width"><body style="font:16px system-ui;background:#071a2e;color:#eaf6f7;padding:24px">Connect to the internet once to save this game for offline play.</body>', { headers: { 'Content-Type': 'text/html' } }); }
    })());
    return;
  }

  // Icons, manifest and other files: cached copy first.
  e.respondWith(fromCache(req).then(hit => hit || fetch(req).then(r => { if (r && r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return r; })));
});

