(function(){
const SF=window.SF,E=SF.esc,I=SF.icon;
/* ---------- Onboarding ---------- */
SF._ob=0;
SF.screens.onboarding=()=>{
 const s=SF.st,st=SF._ob;let b='';
 if(st===0)b=`<div class="logo" style="font-size:1.7rem"><b>//</b>SPORT FLEX</div><div class="mut" style="color:var(--accent);margin-top:-.8rem;font-weight:500">O teu desporto, à tua medida</div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:1.2rem"><h1>Paga só pelo que <em>queres ver.</em></h1><p class="mut">Compra um jogo, um clube, uma competição ou uma modalidade. Sem mensalidades que não usas.</p>
  <div class="chips"><span class="chip on">${I('ball')}Por jogo</span><span class="chip on">${I('shield')}Por clube</span><span class="chip on">${I('trophy')}Por competição</span><span class="chip on">${I('bolt')}Por modalidade</span></div></div>`;
 if(st===1)b=`<h1>Vamos conhecer-te</h1><div><label class="mut sm" for="obname">Como te chamas?</label><div class="search" style="margin-top:.4rem"><input id="obname" value="${E(s.name)}" maxlength="18" autocomplete="off"></div></div>
  <div class="mut sm">Escolhe os clubes que segues. Usamos isto para sugerir jogos.</div>
  <div class="pickgrid">${SF.TOP.map(id=>`<button class="pick ${s.favs.includes(id)?'on':''}" data-a="obfav" data-v="${id}">${SF.crest(id,'xs')}<span>${E(SF.TEAMS[id].n)}</span></button>`).join('')}</div>`;
 if(st===2)b=`<h1>Como preferes <em>usar a app?</em></h1><p class="mut">Podes mudar isto quando quiseres no teu perfil.</p>
  <button class="card ${!s.ess?'':'dim'}" data-a="obmode" data-v="0" style="border-color:${!s.ess?'var(--accent)':'var(--line)'}"><b>Completa</b><div class="mut sm">Todos os jogos, modo social, recompensas e realidade aumentada.</div></button>
  <button class="card ${s.ess?'':'dim'}" data-a="obmode" data-v="1" style="border-color:${s.ess?'var(--accent)':'var(--line)'}"><b style="font-size:1.1rem">Modo Essencial</b><div class="mut">Só os jogos do teu clube, botões grandes e comandos por voz. Pensado para quem quer simplicidade.</div></button>`;
 if(st===3)b=`<div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:1rem"><div style="width:8rem;height:8rem;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe29a,var(--accent) 70%);display:grid;place-items:center;box-shadow:0 0 80px color-mix(in srgb,var(--accent) 60%,transparent)"><span class="big" style="font-size:3.6rem;color:#fff">12</span></div><h1>Oferta de boas-vindas</h1><p class="mut">12 Moedas Flex para começares. Chegam para um jogo grande e uns replays.</p></div>`;
 const last=st===3;
 return `<div class="ob">${b}<div class="dots">${[0,1,2,3].map(i=>`<i class="${i===st?'on':''}"></i>`).join('')}</div><button class="btn" data-a="obnext">${last?'Entrar na SportFlex':'Continuar'}</button></div>`};
SF.act.obfav=el=>{const s=SF.st,v=el.dataset.v;s.favs=s.favs.includes(v)?s.favs.filter(x=>x!==v):[...s.favs,v];if(!s.favs.length)s.favs=[v];s.club=s.favs[0];SF.render()};
SF.act.obmode=el=>{SF.st.ess=el.dataset.v==='1';SF.applyPrefs();SF.render()};
SF.act.obnext=()=>{const s=SF.st;const n=SF.$('#obname');if(n&&n.value.trim())s.name=n.value.trim();
 if(SF._ob<3){SF._ob++;SF.render();return}
 s.onboarded=true;s.sports=[...new Set(s.favs.map(f=>SF.TEAMS[f].sp))];SF.addTx('Oferta','Moedas de boas-vindas',12);SF.save();SF._ob=0;SF.go('home');SF.render()};
/* ---------- Home ---------- */
const hello=()=>{const h=new Date().getHours();return h<12?'Bom dia':h<20?'Boa tarde':'Boa noite'};
SF.recs=()=>{const s=SF.st;return SF.GAMES.filter(g=>!g.done).map(g=>{let sc=0,why='';
  const fav=[g.h,g.a].find(t=>s.favs.includes(t));
  if(fav){sc+=5;why='Porque segues o '+SF.TEAMS[fav].n}
  if(s.sports.includes(g.sp)){sc+=2;why=why||'Porque gostas de '+SF.SPORTS[g.sp].n.toLowerCase()}
  if(g.live){sc+=3;why=why||'A decorrer agora'}
  if(g.big){sc+=3;why=why||'Um dos jogos grandes da semana'}
  sc-=Math.min(g.min,3000)/2000;return{g,sc,why:why||'Popular entre os teus amigos'}}).sort((a,b)=>b.sc-a.sc).slice(0,5)};
SF.hero=r=>{const g=r.g,h=SF.TEAMS[g.h],a=SF.TEAMS[g.a],ac=SF.access(g);
 return `<button class="hero" data-a="game" data-v="${g.id}" style="background:linear-gradient(135deg,${h.c[0]} 0%,${h.c[1]} 52%,${a.c[1]} 100%)"><div class="tags">${g.live?`<span class="tag live"><i class="dot"></i>AO VIVO</span>`:`<span class="tag">${SF.when(g)}</span>`}${ac?`<span class="tag ok">Tens acesso</span>`:`<span class="tag">${SF.coin.replace('class="coin"','class="coin" style="width:.8rem;height:.8rem"')}${SF.cost('jogo',g.id)} Flex</span>`}</div>
 <div><div class="vs">${SF.crest(g.h)}<b>${g.live?g.hs+' - '+g.as:'VS'}</b>${SF.crest(g.a)}</div><h3 style="margin-top:.5rem">${E(g.title)}</h3><div class="why" style="margin-top:.2rem">${I('spark')}${E(r.why)}</div></div></button>`};
SF.screens.home=()=>{
 const s=SF.st,lives=SF.GAMES.filter(g=>!g.done&&g.min<2880).slice(0,4);
 if(s.ess){const mine=SF.GAMES.filter(g=>!g.done&&([g.h,g.a].some(t=>s.favs.includes(t)))).slice(0,4);
  return `<div class="top"><div><h1>${hello()}, ${E(s.name)}</h1><small>Modo Essencial · só o teu clube</small></div><button class="coinpill" data-a="tab" data-v="carteira" aria-label="Carteira Flex">${SF.coin}${s.coins}</button></div>
  <div class="col"><button class="btn" data-a="voice" style="min-height:4.4rem;font-size:1.2rem">${I('mic')}Falar com a SportFlex</button>
  <div class="h2"><h2 style="font-size:1.3rem">Os jogos do teu clube</h2></div>${mine.map(g=>SF.gameCard(g)).join('')||'<div class="card mut">Sem jogos marcados.</div>'}
  <button class="btn sec" data-a="tab" data-v="explorar">Ver todos os jogos</button></div>`}
 if(SF.wide&&SF.wide())return SF.homeDesktop();
 const recs=SF.recs();
 const owned=[...s.packs.map(p=>({k:p.k,i:p.id})),...s.games.map(i=>({k:'jogo',i}))];
 const replays=SF.GAMES.filter(g=>g.done);
 return `<div class="top"><div class="logo"><b>//</b>SPORT FLEX<span class="tag" style="background:var(--bg3);margin-left:.4rem;font-size:.6rem;font-family:var(--ui)">DEMO</span></div><button class="coinpill" data-a="tab" data-v="carteira" aria-label="Carteira Flex: ${s.coins} moedas">${SF.coin}${s.coins}</button></div>
 <div class="col" style="gap:1rem">
 <div><div style="font-size:1.5rem;font-weight:700;letter-spacing:-.03em;line-height:1.15">${hello()}, ${E(s.name)}</div><div class="mut sm">${SF.GAMES.filter(g=>!g.done&&g.min<2880).length} jogos nas próximas 48 horas</div></div>
 <div><div class="h2" style="margin-top:0"><h2>${I('spark','')} Escolhidos para ti</h2></div><div class="strip" style="margin-top:.6rem">${recs.map(SF.hero).join('')}</div></div>
 <div><div class="h2" style="margin-top:0"><h2>Próximos jogos</h2><button data-a="tab" data-v="explorar">Ver tudo</button></div><div class="col gl" style="margin-top:.6rem;gap:.6rem">${lives.map(g=>SF.gameCard(g)).join('')}</div></div>
 <button class="card" data-a="watchparty" style="display:flex;gap:.9rem;align-items:center;background:linear-gradient(120deg,color-mix(in srgb,var(--accent) 30%,var(--bg2)),var(--bg2))"><span class="ic" style="background:var(--accent);color:#fff">${I('users')}</span><span class="grow"><b>Vê com amigos</b><div class="mut sm">Watch Party com videochamada e chat durante o jogo</div></span>${I('chev')}</button>
 ${owned.length?`<div><div class="h2" style="margin-top:0"><h2>Os teus packs</h2></div><div class="chips" style="margin-top:.6rem">${owned.map(o=>`<span class="chip on">${I(o.k==='clube'?'shield':o.k==='comp'?'trophy':o.k==='mod'?'ball':'play')}${E(SF.packName(o.k,o.i))}</span>`).join('')}</div></div>`:''}
 <div><div class="h2" style="margin-top:0"><h2>Replay inteligente</h2></div><div class="mut sm">Só os momentos-chave. Vê um jogo em dois minutos.</div><div class="strip" style="margin-top:.6rem">${replays.map(g=>`<button class="card" data-a="game" data-v="${g.id}" style="width:15rem;display:flex;flex-direction:column;gap:.5rem"><div class="row"><span class="pair">${SF.crest(g.h)}${SF.crest(g.a)}</span><span class="sc" style="margin-left:auto">${g.hs} - ${g.as}</span></div><b style="font-weight:600;font-size:.85rem">${E(g.title)}</b><span class="tag" style="background:var(--bg3);width:fit-content">${I('replay')}${SF.moments(g).length} momentos</span></button>`).join('')}</div></div>
 </div>`};
SF.act.watchparty=()=>{const g=SF.GAMES.find(x=>!x.done);SF._tab='party';if(SF.player&&SF.player.p&&SF.player.p.id===g.id)SF.player.p.tab='party';SF.go('jogo-'+g.id)};
/* ---------- Explorar ---------- */
SF._ex={tab:'jogo',q:''};
const exList=()=>{const {tab,q}=SF._ex,ql=q.trim().toLowerCase();let h='';
 if(tab==='jogo'){const m=g=>!ql||(g.title+SF.COMPS[g.comp].n+SF.SPORTS[g.sp].n).toLowerCase().includes(ql);
  const sec=(t,l)=>l.length?`<div class="h2"><h2>${t}</h2></div>${l.map(g=>SF.gameCard(g)).join('')}`:'';
  const a=SF.GAMES.filter(m);h=sec('Próximos jogos',a.filter(g=>!g.done))+sec('Resultados e replays',a.filter(g=>g.done));}
 if(tab==='equipa')h=Object.keys(SF.TEAMS).filter(id=>!ql||SF.TEAMS[id].n.toLowerCase().includes(ql)).map(id=>{const t=SF.TEAMS[id],own=SF.has('clube',id);return `<div class="g">${SF.crest(id)}<span class="tt"><b>${E(t.n)}</b><span>${SF.SPORTS[t.sp].n} · todos os jogos</span></span><button class="price ${own?'own':''}" data-a="buy" data-k="clube" data-i="${id}">${own?I('check')+'Tens':SF.coin+SF.cost('clube',id)}</button></div>`}).join('');
 if(tab==='comp')h=Object.keys(SF.COMPS).filter(id=>!ql||SF.COMPS[id].n.toLowerCase().includes(ql)).map(id=>{const c=SF.COMPS[id],own=SF.has('comp',id);const n=SF.GAMES.filter(g=>g.comp===id).length;return `<div class="g"><span class="ic">${I('trophy')}</span><span class="tt"><b>${E(c.n)}</b><span>${SF.SPORTS[c.sp].n} · ${c.desc} · ${n?(n===1?'1 jogo':n+' jogos')+' na app':'calendário em breve'}</span></span><button class="price ${own?'own':''}" data-a="buy" data-k="comp" data-i="${id}">${own?I('check')+'Tens':SF.coin+SF.cost('comp',id)}</button></div>`}).join('');
 if(tab==='mod')h=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:.7rem">`+Object.keys(SF.SPORTS).filter(id=>!ql||SF.SPORTS[id].n.toLowerCase().includes(ql)).map(id=>{const sp=SF.SPORTS[id],own=SF.has('mod',id);return `<button class="card" data-a="buy" data-k="mod" data-i="${id}" style="display:flex;flex-direction:column;gap:.6rem;min-height:8rem"><span class="ic">${I('ball')}</span><b>${sp.n}</b><span class="mut sm">Todas as competições</span><span class="price ${own?'own':''}" style="width:fit-content">${own?I('check')+'Tens':SF.coin+SF.cost('mod',id)}</span></button>`}).join('')+`</div>`;
 return h||'<div class="card mut" style="text-align:center">Nada encontrado. Experimenta outra pesquisa.</div>'};
SF.screens.explorar=()=>{const e=SF._ex;
 return `<div class="top"><h1>${SF.st.ess?'Todos os jogos':'Explorar'}<small>Calendário real · instantâneo de ${SF.SNAPSHOT}</small></h1><button class="coinpill" data-a="tab" data-v="carteira" aria-label="Carteira Flex">${SF.coin}${SF.st.coins}</button></div>
 <div class="col"><label class="search">${I('search')}<input id="exq" type="search" placeholder="Procurar jogo, clube ou competição" value="${E(e.q)}" aria-label="Procurar"></label>
 <div class="seg" role="tablist">${[['jogo','Jogo'],['equipa','Equipa'],['comp','Competição'],['mod','Modalidade']].map(t=>`<button role="tab" data-a="extab" data-v="${t[0]}" class="${e.tab===t[0]?'on':''}">${t[1]}</button>`).join('')}</div>
 <div class="mut sm">Pack ${{jogo:'Jogo: um jogo à escolha',equipa:'Clube: todos os jogos da equipa',comp:'Competição: a liga ou taça completa',mod:'Modalidade: todo o desporto'}[e.tab]}</div>
 <div class="col" id="exlist" style="gap:.6rem">${exList()}</div></div>`};
SF.after.explorar=()=>{const i=SF.$('#exq');if(i)i.addEventListener('input',()=>{SF._ex.q=i.value;SF.$('#exlist').innerHTML=exList()})};
SF.act.extab=el=>{SF._ex.tab=el.dataset.v;SF.render()};
})();
