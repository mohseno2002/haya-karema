// Service Worker — لوحة استلامات دار الهندسة
// يتيح تثبيت التطبيق والعمل بلا إنترنت (عدا التزامن السحابي)
const CACHE='deh-v3';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const url=e.request.url;
  // طلبات Google Sheets (التزامن) تمرّ للشبكة دائماً بلا تخزين
  if(url.includes('script.google.com')||url.includes('googleusercontent.com')){
    return; // المتصفح يتولاها مباشرة
  }
  // بقية الطلبات: الشبكة أولاً، ثم الكاش عند انقطاع الإنترنت
  e.respondWith(
    fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
  );
});
