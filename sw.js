// Stale-while-revalidate: opens instantly offline, picks up new versions on the next open. Bump V to force a refresh.
const V='ironlog-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(['./','index.html','manifest.json','icon-192.png'])));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||!e.request.url.startsWith('http'))return;
  if(e.request.url.includes('api.anthropic.com'))return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(e.request);
    const net=fetch(e.request).then(r=>{if(r.ok||r.type==='opaque')c.put(e.request,r.clone());return r;}).catch(()=>hit);
    return hit||net;
  }));
});
