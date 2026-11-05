// Service worker simples: guarda a app no telemóvel para abrir mais depressa e funcionar sem rede.
// Ao mudar ficheiros da app, aumenta o número da versão para os telemóveis atualizarem.
const V='sportflex-v5';
const SHELL=['./','index.html','styles.css','data.js','core.js','screens1.js','desk.js','player.js','screens2.js','boot.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const same=u.origin===location.origin, font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!same&&!font)return;
  e.respondWith(
    fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r})
      .catch(()=>caches.match(e.request).then(m=>m||caches.match('index.html')))
  );
});
