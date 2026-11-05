(function(){
const SF=window.SF;
SF.$=(s,r)=>(r||document).querySelector(s);
SF.$$=(s,r)=>[...(r||document).querySelectorAll(s)];
SF.esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
SF.t0=Date.now();
const P={
 home:'<path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>',
 trophy:'<path d="M7 4h10v5a5 5 0 01-10 0zM17 6h3v2a3 3 0 01-3 3M7 6H4v2a3 3 0 003 3M12 14v4M8 21h8"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 15-5 16 0"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-4.5 12.2-4.5 13 0M16 4.5a3.5 3.5 0 010 7M18 14.5c2 .6 3.3 2.3 3.5 5.5"/>',
 spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
 play:'<path d="M7 4.5v15l13-7.5z"/>',
 bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 back:'<path d="M15 5l-7 7 7 7"/>',
 chev:'<path d="M9 5l7 7-7 7"/>',
 close:'<path d="M6 6l12 12M18 6L6 18"/>',
 cube:'<path d="M12 2l9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10"/>',
 send:'<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 replay:'<path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8M3 3v5h5M10 9v6l5-3z"/>',
 wallet:'<path d="M3 7a2 2 0 012-2h13v4M3 7v11a2 2 0 002 2h15V9H5a2 2 0 01-2-2z"/><circle cx="16.5" cy="14.5" r="1.2"/>',
 vote:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/>',
 gift:'<path d="M4 9h16v4H4zM6 13h12v8H6zM12 9v12M12 9S9 8 9 6a2 2 0 014 0M12 9s3-1 3-3a2 2 0 00-4 0"/>',
 bell:'<path d="M6 17V11a6 6 0 0112 0v6l2 2H4zM10 21h4"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
 ball:'<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 5h-5L8 10zM12 3v4M20 10l-4 0M17 19l-2.500-4M7 19l2.500-4M4 10l4 0"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 hand:'<path d="M8 12V6a1.5 1.5 0 013 0v5M11 11V4.5a1.5 1.5 0 013 0V11M14 11V6a1.5 1.5 0 013 0v7c0 4-2 7-6 7s-5-2-7-5l-1-2a1.5 1.5 0 012.500-1.500L8 14"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'
};
SF.icon=(n,c)=>`<svg class="i ${c||''}" viewBox="0 0 24 24" aria-hidden="true">${P[n]||''}</svg>`;
let uid=0;
const lum=h=>{const n=parseInt(h.slice(1),16);return (.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))};
SF.crest=(id,cls)=>{const t=SF.TEAMS[id];if(SF.CRESTS&&SF.CRESTS[id])return `<img class="crest ${cls||''}" src="${SF.CRESTS[id]}" alt="${SF.esc(t.n)}">`;const u='cg'+(uid++),tx=(lum(t.c[0])+lum(t.c[1]))/2>150?'#111':'#fff';return `<svg class="crest ${cls||''}" viewBox="0 0 48 48" role="img" aria-label="${SF.esc(t.n)}"><defs><linearGradient id="${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.c[0]}"/><stop offset="1" stop-color="${t.c[1]}"/></linearGradient></defs><path d="M24 3l17 6v13c0 11-7 19-17 23C14 41 7 33 7 22V9z" fill="url(#${u})" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/><text x="24" y="29" text-anchor="middle" font-family="Poppins,sans-serif" font-weight="800" font-size="12" fill="${tx}">${t.s}</text></svg>`};
SF.coin='<i class="coin"></i>';
/* estado */
const KEY='sportflex-demo-v3';
const def=()=>({onboarded:false,name:'João',coins:12,points:120,club:'ben',favs:['ben'],sports:['futebol'],ess:false,accent:'#F4522D',ts:0,
  games:[],packs:[],tx:[],watched:[],disc:false,preds:{},predWin:0,invites:0,gifts:0,voted:{},notif:true,fun:{}});
SF.st=def();
try{const s=localStorage.getItem(KEY);if(s)Object.assign(SF.st,JSON.parse(s))}catch(e){}
SF.save=()=>{try{localStorage.setItem(KEY,JSON.stringify(SF.st))}catch(e){}};
SF.reset=()=>{SF.st=def();SF.save();SF.applyPrefs();location.hash='';SF.render()};
SF.applyPrefs=()=>{const s=SF.st;document.documentElement.style.setProperty('--accent',s.accent);
 document.documentElement.style.setProperty('--accent2',`color-mix(in srgb,${s.accent} 78%,#fff)`);
 document.documentElement.className=s.ts?('ts'+s.ts):'';document.body.classList.toggle('ess',!!s.ess)};
/* tempo */
const WD=['dom','seg','ter','qua','qui','sex','sáb'];
const p2=n=>String(n).padStart(2,'0');
SF.when=g=>{if(g.done)return g.lbl||'Terminou';const d=new Date(SF.t0+g.min*60000);const hh=p2(d.getHours())+':'+p2(d.getMinutes());
 if(g.min<60)return 'Daqui a '+Math.max(1,g.min)+' min';const today=new Date().getDate()===d.getDate()&&g.min<1440;if(today)return 'Hoje, '+hh;
 const tm=new Date(Date.now()+864e5);if(tm.getDate()===d.getDate()&&g.min<2880)return 'Amanhã, '+hh;return WD[d.getDay()]+' '+d.getDate()+'/'+p2(d.getMonth()+1)+', '+hh};
SF.game=id=>SF.GAMES.find(g=>g.id===id);
SF.packLabel={clube:'Pack Clube',comp:'Pack Competição',mod:'Pack Modalidade',jogo:'Pack Jogo'};
SF.packPrice=(k,id)=>k==='clube'?9:k==='comp'?SF.COMPS[id].price:k==='mod'?SF.SPORTS[id].price:SF.game(id).price;
SF.packName=(k,id)=>k==='clube'?SF.TEAMS[id].n:k==='comp'?SF.COMPS[id].n:k==='mod'?SF.SPORTS[id].n:SF.game(id).title;
SF.has=(k,id)=>k==='jogo'?SF.st.games.includes(id):SF.st.packs.some(p=>p.k===k&&p.id===id);
SF.access=g=>SF.st.games.includes(g.id)||SF.st.packs.some(p=>(p.k==='clube'&&(p.id===g.h||p.id===g.a))||(p.k==='comp'&&p.id===g.comp)||(p.k==='mod'&&p.id===g.sp));
SF.cost=(k,id)=>{const b=SF.packPrice(k,id);return SF.st.disc?Math.max(1,Math.round(b*.8)):b};
SF.addTx=(t,d,v)=>{SF.st.tx.unshift({t,d,v,at:Date.now()});SF.st.tx=SF.st.tx.slice(0,40)};
SF.buy=(k,id)=>{const s=SF.st,c=SF.cost(k,id);
 if(SF.has(k,id)){SF.toast('Já tens acesso a este pack');return false}
 if(s.coins<c){SF.topup(c-s.coins);return false}
 s.coins-=c;if(s.disc)s.disc=false;
 if(k==='jogo')s.games.push(id);else s.packs.push({k,id});
 s.points+=10;SF.addTx(SF.packLabel[k],SF.packName(k,id),-c);SF.save();
 SF.toast(SF.packLabel[k]+' ativado. +10 pontos');SF.render();return true};
/* UI base */
SF.toast=m=>{const t=SF.$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(SF._tt);SF._tt=setTimeout(()=>t.classList.remove('show'),2300)};
SF.sheet=(html,o)=>{o=o||{};SF.$('#layer').innerHTML=`<div class="sheetwrap"><div class="scrim" data-a="close"></div><div class="sheet ${o.full?'full':''}" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div></div>`;SF.sheetOpen=true};
SF.close=()=>{SF.$('#layer').innerHTML='';SF.sheetOpen=false;SF._onclose&&SF._onclose();SF._onclose=null};
SF.go=r=>{location.hash=r};
SF.route=()=>{const h=(location.hash||'#home').slice(1);const i=h.indexOf('-');return i<0?{n:h,a:''}:{n:h.slice(0,i),a:h.slice(i+1)}};
SF.act={};
SF.gameCard=(g,o)=>{o=o||{};const ac=SF.access(g);const live=g.live;
 const mid=live||g.done?`<span class="sc">${g.hs} - ${g.as}</span>`:'';
 return `<button class="g" data-a="game" data-v="${g.id}"><span class="pair">${SF.crest(g.h)}${SF.crest(g.a)}</span><span class="tt"><b>${SF.esc(g.title)}</b><span>${live?'<span style="color:var(--accent2);font-weight:700">Ao vivo</span>':SF.when(g)} · ${SF.COMPS[g.comp].n}</span>${mid?'<span style="color:var(--fg)">'+mid+'</span>':''}</span>${ac?`<span class="price own">${SF.icon('check')}Tens</span>`:`<span class="price">${SF.coin}${SF.cost('jogo',g.id)}</span>`}</button>`};
/* detalhe do jogo (folha) */
SF.act.game=el=>{SF.openGame(el.dataset.v)};
SF.openGame=id=>{const g=SF.game(id),ac=SF.access(g);const T=SF.TEAMS;
 const packs=[['clube',g.h],['clube',g.a],['comp',g.comp],['mod',g.sp]];
 const opts=packs.map(([k,i])=>{const own=SF.has(k,i);return `<button class="li" data-a="buy" data-k="${k}" data-i="${i}" ${own?'disabled':''}><span class="ic">${SF.icon(k==='clube'?'shield':k==='comp'?'trophy':'ball')}</span><span class="grow"><b style="font-weight:600">${SF.packLabel[k]}</b><br><span class="mut sm">${SF.esc(SF.packName(k,i))}${k==='clube'?' · todos os jogos':''}</span></span>${own?`<span class="price own">${SF.icon('check')}Tens</span>`:`<span class="price">${SF.coin}${SF.cost(k,i)}</span>`}</button>`}).join('');
 SF.sheet(`<div class="row" style="justify-content:center;gap:1.2rem;padding-top:.3rem"><div style="text-align:center">${SF.crest(g.h,'lg')}<div class="sm" style="margin-top:.3rem;font-weight:600">${T[g.h].n}</div></div><div style="text-align:center">${g.live||g.done?`<div class="big" style="font-size:2.4rem">${g.hs} - ${g.as}</div>`:`<div class="big mut" style="font-size:1.8rem">VS</div>`}<div class="sm mut">${SF.when(g)}</div></div><div style="text-align:center">${SF.crest(g.a,'lg')}<div class="sm" style="margin-top:.3rem;font-weight:600">${T[g.a].n}</div></div></div>
 <div class="mut sm" style="text-align:center">${SF.COMPS[g.comp].n} · ${SF.SPORTS[g.sp].n}</div>
 ${ac?`<button class="btn" data-a="watch" data-v="${g.id}">${SF.icon('play')}${g.live?'Ver ao vivo':g.done?'Ver replay':'Abrir jogo'}</button>`:`<button class="btn" data-a="buy" data-k="jogo" data-i="${g.id}">${SF.coin}Comprar Pack Jogo · ${SF.cost('jogo',g.id)} Flex</button>`}
 <div class="row"><button class="btn sec grow" data-a="giftgame" data-v="${g.id}">${SF.icon('gift')}Enviar a um amigo</button><button class="btn sec grow" data-a="notify" data-v="${g.id}">${SF.icon('bell')}Lembrar-me</button></div>
 <h3 style="font-size:.95rem;margin-top:.3rem">Ou poupa com um pack maior</h3><div class="list">${opts}</div>${SF.st.disc?'<div class="sm" style="color:var(--ok)">Desconto de 20% aplicado na próxima compra.</div>':''}`)};
SF.act.watch=el=>{SF.close();SF.go('jogo-'+el.dataset.v)};
SF.act.buy=el=>{const k=el.dataset.k,i=el.dataset.i;const ok=SF.buy(k,i);if(ok&&SF.sheetOpen){const g=k==='jogo'?SF.game(i):null;if(g)SF.openGame(g.id);else SF.close()}};
SF.act.notify=el=>{SF.st.fun.n=(SF.st.fun.n||0)+1;SF.save();SF.toast('Aviso ativado. Vais receber um alerta antes do jogo')};
SF.act.close=()=>SF.close();
SF.act.back=()=>{history.length>1?history.back():SF.go('home')};
SF.act.tab=el=>SF.go(el.dataset.v);
/* eventos */
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el)return;const f=SF.act[el.dataset.a];if(f){e.preventDefault();f(el,e)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&SF.sheetOpen)SF.close();if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.enter){const f=SF.act[e.target.dataset.enter];f&&f(e.target,e)}});
/* shell + render */
SF.screens={};
SF.render=()=>{
 clearInterval(SF._cdT);
 const r=SF.route(),s=SF.st;const app=SF.$('#app');
 if(!s.onboarded){SF.player&&SF.player.stop();app.innerHTML=SF.screens.onboarding();return}
 const old=SF.$('#view');const same=old&&SF._lastRoute===r.n+'-'+r.a;const sc=same?old.scrollTop:0;
 SF._lastRoute=r.n+'-'+r.a;
 const fn=SF.screens[r.n]||SF.screens.home;
 if(r.n!=='jogo')SF.player&&SF.player.stop();
 const body=fn(r.a);
 const tabs=s.ess?[['home','home','Início'],['explorar','ball','Jogos'],['perfil','user','Perfil']]:[['home','home','Home'],['explorar','search','Explorar'],['premios','trophy','Prémios'],['perfil','user','Perfil']];
 const cur=['home','explorar','premios','perfil'].includes(r.n)?r.n:(r.n==='carteira'?'perfil':'explorar');
 const showNav=r.n!=='jogo';
 app.innerHTML=`<main class="view" id="view"><div class="wrap">${body}</div></main>${showNav?`<nav class="nav" aria-label="Navegação principal"><div class="rail-logo"><b>//</b><span>SPORT FLEX</span></div>${tabs.map(t=>`<button data-a="tab" data-v="${t[0]}" class="${cur===t[0]?'on':''}" ${cur===t[0]?'aria-current="page"':''}>${SF.icon(t[1])}<span>${t[2]}</span></button>`).join('')}</nav>`:''}${(r.n==='home'||r.n==='explorar')?`<button class="fab" data-a="assistant" aria-label="Assistente SportFlex">${SF.icon('spark')}</button>`:''}`;
 const v=SF.$('#view');if(sc)v.scrollTop=sc;
 SF.after&&SF.after[r.n]&&SF.after[r.n](r.a);
};
SF.after={};
window.addEventListener('hashchange',()=>{if(SF.sheetOpen)SF.close();SF.render()});
})();
