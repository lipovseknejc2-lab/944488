// Atelier offline worker. Lives in atelier/ and only ever clears its own atelier- caches, never other apps on the site.
const CACHE='atelier-v12';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg?v=thread','./icon-192.png?v=thread','./icon-512.png?v=thread','./apple-touch-icon.png?v=thread'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('atelier-')&&x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
/* tapping a focus alert brings Atelier back to the timer */
self.addEventListener('notificationclick',e=>{e.notification.close();const url=new URL((e.notification.data&&e.notification.data.url)||'./#focus',self.registration.scope).href;
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>{for(const c of L){if(c.url.startsWith(self.registration.scope)&&'focus' in c)return c.focus()}return self.clients.openWindow?self.clients.openWindow(url):null}))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;const nav=e.request.mode==='navigate';
 e.respondWith(fetch(nav?new Request(e.request.url,{cache:'no-cache'}):e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(nav?'./index.html':e.request,cp)).catch(()=>{})}return r}).catch(()=>caches.match(nav?'./index.html':e.request,{ignoreSearch:true}).then(r=>r||Response.error())))});
