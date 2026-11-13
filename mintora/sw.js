// Mintora offline worker. Lives in mintora/ and only ever clears its own mintora- caches, never other apps on the site.
const CACHE='mintora-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('mintora-')&&x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url),base=new URL('./',location).pathname;if(u.origin!==location.origin||!u.pathname.startsWith(base))return;
 e.respondWith(fetch(e.request.mode==='navigate'?new Request(e.request.url,{cache:'no-cache'}):e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request.mode==='navigate'?'./index.html':e.request,cp)).catch(()=>{})}return r})
  .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):undefined))))});
