// Service worker simples: guarda a app no telemóvel para abrir mais depressa e funcionar sem rede.
// Ao mudar ficheiros da app, aumenta o número da versão para os telemóveis atualizarem.
const V='sportflex-v15';
const SHELL=['./','index.html','styles.css','data.js','core.js','screens1.js','desk.js','player.js','ai.js','screens2.js','features.js','boot.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>fetch(u,{cache:'reload'}).then(r=>{if(!r.ok)throw new Error(u);return c.put(u,r)})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const same=u.origin===location.origin, font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!same&&!font)return;
  e.respondWith(
    fetch(e.request,{cache:'no-cache'}).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r})
      .catch(()=>caches.match(e.request).then(m=>m||caches.match('index.html')))
  );
});
