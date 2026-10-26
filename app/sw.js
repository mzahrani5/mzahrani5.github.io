// يحفظ السجل ومكتباته على الجهاز ليعمل بدون إنترنت
const CACHE="sijil-app-v2";
const CORE=["./","index.html","manifest.webmanifest","../icon-192.png","../apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("sijil-app")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.pathname.endsWith("/codes.json"))return; // قائمة الرموز تُطلب من الشبكة دائماً
  if(url.origin===location.origin&&url.pathname==="/index.html"){ // السجل الأساسي: من الشبكة أولاً ليصل التحديث فوراً
    e.respondWith(fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r}).catch(()=>caches.match(req,{ignoreSearch:true})));return}
  if(req.mode==="navigate"){ // الصفحة: من الشبكة أولاً لتصلك التحديثات، ومن الجهاز عند انقطاع الإنترنت
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put("index.html",cp));return r}).catch(()=>caches.match("index.html")));return}
  if(url.origin===location.origin||/cdnjs\.cloudflare\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(hit=>{const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==="opaque")){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r}).catch(()=>hit);return hit||net}))}
});
