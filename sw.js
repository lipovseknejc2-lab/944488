// Grady offline worker: always asks the site for the newest page first, falls back to the saved copy offline.
// Only clears its own grady- caches, never the other apps' on this site.
const CACHE='grady-v10';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('grady-')&&x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
 // only this app's own files (the site root, not the other apps' folders)
 const mine=u.origin===location.origin&&(u.pathname===new URL('./',location).pathname||/\/(index\.html|manifest\.webmanifest|icon[^/]*|apple-touch-icon\.png)$/.test(u.pathname)&&!u.pathname.slice(new URL('./',location).pathname.length).includes('/'));
 if(!mine)return;
 e.respondWith(fetch(e.request.mode==='navigate'?new Request(e.request.url,{cache:'no-cache'}):e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request.mode==='navigate'?'./index.html':e.request,cp)).catch(()=>{})}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))))});
