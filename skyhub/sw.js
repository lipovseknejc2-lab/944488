// SkyHub offline worker: lives in skyhub/ and only ever clears its own skyhub- caches, never the other apps'.
// Pages come from the site first (so updates show at once); the saved copy is used when offline.
const CACHE='skyhub-v6';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('skyhub-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET') return;
  const nav=e.request.mode==='navigate';
  if(nav){ e.respondWith(fetch(new Request(e.request.url,{cache:'no-cache'})).then(res=>{ if(res.ok){const copy=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy));} return res; }).catch(()=>caches.match('./index.html'))); return; }
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{ if(res.ok){const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy));} return res; }))); });
