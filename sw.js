// Change RELEASE for every published package; keep this filename unchanged.
const RELEASE='15.22';
const PREFIX='om-pwa:'+self.registration.scope+':';
const CACHE=PREFIX+RELEASE;
const ASSETS=['index.html','pwa.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png'];
const url=p=>new URL(p,self.registration.scope).href;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(p=>new Request(url(p),{cache:'reload'}))))));
self.addEventListener('message',e=>{if(e.data?.type==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||!e.request.url.startsWith(self.registration.scope))return;
 if(e.request.mode==='navigate'){
  const path=new URL(e.request.url).pathname,base=new URL(self.registration.scope).pathname;
  if(path===base||path===base+'index.html')e.respondWith(caches.open(CACHE).then(c=>c.match(url('index.html'))).then(hit=>hit||fetch(e.request)));
  return;
 }
 e.respondWith(caches.open(CACHE).then(c=>c.match(e.request)).then(hit=>hit||fetch(e.request)));
});
