const C="carnet-v14",SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","fonts/amiri-arabic-400-normal.woff2"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ // fonts: cache first
    e.respondWith(caches.open(C).then(c=>c.match(r).then(h=>h||fetch(r).then(n=>{c.put(r,n.clone());return n}))));return}
  if(u.origin!==location.origin||u.pathname.includes("/data/"))return; // Quran text lives in IndexedDB
  e.respondWith(fetch(r).then(n=>{if(n.ok){const k=n.clone();caches.open(C).then(c=>c.put(r,k))}return n}).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match("index.html"))))});
