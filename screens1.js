(function(){
const SF=window.SF,E=SF.esc,I=SF.icon;
/* ---------- Onboarding ---------- */
SF._ob=0;
SF.screens.onboarding=()=>{
 const s=SF.st,st=SF._ob;let b='';
 if(st===0)b=`<div class="ob-welcome"><div class="logo" style="font-size:1.7rem"><b>//</b>SPORT FLEX</div><div class="mut" style="color:var(--accent);margin-top:-.8rem;font-weight:500">O teu desporto, à tua medida</div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:1.2rem"><h1>Paga só pelo que <em>queres ver.</em></h1><p class="mut">Compra um jogo, um clube, uma competição ou uma modalidade. Sem mensalidades que não usas.</p>
  <div class="chips"><span class="chip on">${I('ball')}Por jogo</span><span class="chip on">${I('shield')}Por clube</span><span class="chip on">${I('trophy')}Por competição</span><span class="chip on">${I('bolt')}Por modalidade</span></div></div></div><div class="ob-dw"><h1>Bem-vindo à SportFlex</h1><p class="mut">Cria o teu perfil em menos de um minuto: escolhes os teus clubes e como queres usar a app, e recebes 12 Moedas Flex para começar.</p></div>`;
 if(st===1)b=`<h1>Vamos conhecer-te</h1><div><label class="mut sm" for="obname">Como te chamas? (opcional)</label><div class="search" style="margin-top:.4rem"><input id="obname" value="${E(SF._obName!==undefined?SF._obName:s.name)}" placeholder="O teu nome" maxlength="18" autocomplete="off"></div></div>
  <div class="mut sm">Escolhe os clubes que segues (opcional). Usamos isto para sugerir jogos. Sem clubes, vês sugestões gerais.</div>
  <div class="pickgrid">${SF.TOP.map(id=>`<button class="pick ${s.favs.includes(id)?'on':''}" data-a="obfav" data-v="${id}">${SF.crest(id,'xs')}<span>${E(SF.TEAMS[id].n)}</span></button>`).join('')}</div>
  <div class="mut sm" id="obsel">${s.favs.length?'A seguir: '+s.favs.map(f=>E(SF.TEAMS[f].n)).join(', '):'Nenhum clube escolhido'}</div>
  <button class="btn ghost" data-a="obskip">Explorar sem personalizar</button>`;
 if(st===2)b=`<h1>Como preferes <em>usar a app?</em></h1><p class="mut">Podes mudar isto quando quiseres no teu perfil.</p>
  <button class="card ${!s.ess?'':'dim'}" data-a="obmode" data-v="0" style="border-color:${!s.ess?'var(--accent)':'var(--line)'}"><b>Completa</b><div class="mut sm">Todos os jogos, modo social, recompensas e realidade aumentada.</div></button>
  <button class="card ${s.ess?'':'dim'}" data-a="obmode" data-v="1" style="border-color:${s.ess?'var(--accent)':'var(--line)'}"><b style="font-size:1.1rem">Modo Essencial</b><div class="mut">Só os jogos do teu clube, botões grandes e comandos por voz. Pensado para quem quer simplicidade.</div></button>`;
 if(st===3)b=`<div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:1rem"><div style="width:8rem;height:8rem;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe29a,var(--accent) 70%);display:grid;place-items:center;box-shadow:0 0 80px color-mix(in srgb,var(--accent) 60%,transparent)"><span class="big" style="font-size:3.6rem;color:#fff">12</span></div><h1>Oferta de boas-vindas</h1><p class="mut">12 Moedas Flex para começares. Chegam para um jogo grande e uns replays.</p><div class="card" style="text-align:left;width:100%;max-width:26rem"><div class="mut sm">As tuas preferências</div><div style="margin-top:.3rem"><b>Nome:</b> ${s.name?E(s.name):'sem nome'}</div><div><b>Clubes:</b> ${s.favs.length?s.favs.map(f=>E(SF.TEAMS[f].n)).join(', '):'nenhum (sugestões gerais)'}</div><div><b>Modo:</b> ${s.ess?'Essencial':'Completo'}</div><div class="mut sm" style="margin-top:.3rem">Podes mudar tudo em Perfil.</div></div></div>`;
 const last=st===3;
 const brand=`<aside class="ob-brand" aria-hidden="true"><div class="obb-in"><div class="logo" style="font-size:2.6rem"><b>//</b>SPORT FLEX</div><div class="obb-tag">O teu desporto, à tua medida</div>
  <h2>Paga só pelo que <em>queres ver.</em></h2><p>Compra um jogo, um clube, uma competição ou uma modalidade. Sem mensalidades que não usas.</p>
  <ul class="obb-list"><li><span class="ic">${I('ball')}</span>Packs por jogo, clube, competição ou modalidade</li><li><span class="ic">${I('users')}</span>Watch Party com videochamada e chat durante o jogo</li><li><span class="ic">${I('replay')}</span>Replay inteligente com só os momentos-chave</li><li><span class="ic">${I('cube')}</span>Realidade aumentada sobre o campo</li><li><span class="ic">${I('spark')}</span>Sugestões personalizadas para ti</li></ul>
  <div class="obb-stats"><div><b>87%</b><span>acham as subscrições caras para o que veem</span></div><div><b>82%</b><span>querem ver jogos com amigos à distância</span></div></div><div class="obb-src">Fonte: questionário à turma de Interface Pessoa-Máquina (IPCB), 20 respostas.</div></div></aside>`;
 return `<div class="ob">${brand}<div class="ob-main">${b}<div class="dots">${[0,1,2,3].map(i=>`<i class="${i===st?'on':''}"></i>`).join('')}</div><button class="btn" data-a="obnext">${last?'Entrar na SportFlex':'Continuar'}</button></div></div>`};
SF.act.obfav=el=>{const s=SF.st,v=el.dataset.v;s.favs=s.favs.includes(v)?s.favs.filter(x=>x!==v):[...s.favs,v];s.club=s.favs[0]||'';SF.render()};
SF.act.obmode=el=>{SF.st.ess=el.dataset.v==='1';SF.applyPrefs();SF.render()};
document.addEventListener('input',e=>{if(e.target&&e.target.id==='obname')SF._obName=e.target.value});
const obName=()=>{const s=SF.st,n=SF.$('#obname'),typed=(n?n.value:SF._obName);if(typed!==undefined&&typed!==null)s.name=typed.trim();SF._obName=undefined};
const obFinish=()=>{const s=SF.st;s.onboarded=true;s.sports=s.favs.length?[...new Set(s.favs.map(f=>SF.TEAMS[f].sp))]:['futebol'];SF.addTx('Oferta','Moedas de boas-vindas',12);SF.save();SF._ob=0;SF.go('home');SF.render()};
SF.act.obnext=()=>{obName();if(SF._ob<3){SF._ob++;SF.render();return}obFinish()};
SF.act.obskip=()=>{const s=SF.st;obName();s.favs=[];s.club='';s.ess=false;SF.applyPrefs();obFinish()};
/* ---------- Home ---------- */
const hello=()=>{const h=new Date().getHours();return h<12?'Bom dia':h<20?'Boa tarde':'Boa noite'};
SF.recs=()=>{const s=SF.st,pers=s.favs.length>0;return SF.GAMES.filter(g=>!g.done).map(g=>{let sc=0,why='';
  const fav=pers&&[g.h,g.a].find(t=>s.favs.includes(t));
  if(fav){sc+=5;why='Porque segues o '+SF.TEAMS[fav].n}
  if(pers&&s.sports.includes(g.sp)){sc+=2;why=why||'Porque gostas de '+SF.SPORTS[g.sp].n.toLowerCase()}
  if(g.live){sc+=3;why=why||'A decorrer agora'}
  if(g.big){sc+=3;why=why||'Um dos jogos grandes da semana'}
  sc-=Math.min(g.min,3000)/2000;return{g,sc,why:why||(pers?'Em destaque no calendário':'Sugestão geral: em destaque no calendário')}}).sort((a,b)=>b.sc-a.sc).slice(0,5)};
/* próximo jogo: o primeiro a que já tens acesso, senão o primeiro dos teus clubes, senão o primeiro do calendário */
SF.nextGame=()=>{const up=SF.GAMES.filter(g=>!g.done).sort((a,b)=>a.min-b.min),s=SF.st;
 const own=up.find(g=>SF.access(g));if(own)return {g:own,why:'Já tens acesso a este jogo'};
 const fav=up.find(g=>s.favs.includes(g.h)||s.favs.includes(g.a));if(fav)return {g:fav,why:'Porque segues o '+SF.TEAMS[s.favs.includes(fav.h)?fav.h:fav.a].n};
 return {g:up[0],why:s.favs.length?'O próximo jogo no calendário':'O próximo jogo no calendário (sem personalizar)'}};
/* os meus acessos */
SF.myAccess=()=>{const s=SF.st,owned=[...s.packs.map(p=>({k:p.k,i:p.id})),...s.games.map(i=>({k:'jogo',i}))],games=SF.GAMES.filter(g=>!g.done&&SF.access(g)).sort((a,b)=>a.min-b.min);return {owned,games}};
SF.accessHtml=(max)=>{const a=SF.myAccess(),I=SF.icon;
 if(!a.owned.length)return `<div class="mut sm">Ainda não tens acessos. Um jogo custa 1 a 3 moedas e o replay fica disponível durante ${SF.SEASON.replay} dias.</div><button class="btn sm" data-a="tab" data-v="explorar" style="margin-top:.7rem">${I('search')}Escolher um jogo</button>`;
 return `<div class="chips">${a.owned.map(o=>`<span class="chip on">${I(o.k==='clube'?'shield':o.k==='comp'?'trophy':o.k==='mod'?'ball':'play')}${E(SF.packName(o.k,o.i))}</span>`).join('')}</div>
 <div class="mut sm" style="margin-top:.7rem">${a.games.length?'Jogos que podes ver':'Os teus packs ainda não têm jogos marcados.'}</div>${a.games.slice(0,max).map(g=>SF.gameCard(g)).join('')}`};
SF.hero=r=>{const g=r.g,h=SF.TEAMS[g.h],a=SF.TEAMS[g.a],ac=SF.access(g);
 return `<button class="hero" data-a="game" data-v="${g.id}" style="background:linear-gradient(135deg,${h.c[0]} 0%,${h.c[1]} 52%,${a.c[1]} 100%)"><div class="tags">${g.live?`<span class="tag live"><i class="dot"></i>AO VIVO</span>`:`<span class="tag">${SF.when(g)}</span>`}${ac?`<span class="tag ok">Tens acesso</span>`:`<span class="tag">${SF.coin.replace('class="coin"','class="coin" style="width:.8rem;height:.8rem"')}${SF.cost('jogo',g.id)} Flex</span>`}</div>
 <div><div class="vs">${SF.crest(g.h)}<b>${g.live?g.hs+' - '+g.as:'VS'}</b>${SF.crest(g.a)}</div><h3 style="margin-top:.5rem">${E(g.title)}</h3><div class="why" style="margin-top:.2rem">${I('spark')}${E(r.why)}</div></div></button>`};
SF.screens.home=()=>{
 const s=SF.st,lives=SF.GAMES.filter(g=>!g.done&&g.min<2880).slice(0,4);
 if(s.ess){const up=SF.GAMES.filter(g=>!g.done),mine=(s.favs.length?up.filter(g=>[g.h,g.a].some(t=>s.favs.includes(t))):up).slice(0,4);
  return `<div class="top"><div><h1>${E(SF.greet())}</h1><small>${s.favs.length?'Modo Essencial · só o teu clube':'Modo Essencial · escolhe um clube em Perfil'}</small></div><button class="coinpill" data-a="tab" data-v="carteira" aria-label="Carteira Flex">${SF.coin}<span data-count="coins">${s.coins}</span></button></div>
  <div class="col"><button class="btn" data-a="voice" style="min-height:4.4rem;font-size:1.2rem">${I('mic')}Falar com a SportFlex</button><button class="btn sec" data-a="tab" data-v="jogos" style="min-height:3.6rem;font-size:1.05rem">Os meus jogos</button>
  <div class="h2"><h2 style="font-size:1.3rem">${s.favs.length?'Os jogos do teu clube':'Próximos jogos'}</h2></div>${mine.map(g=>SF.gameCard(g)).join('')||'<div class="card mut">Sem jogos marcados.</div>'}
  <button class="btn sec" data-a="tab" data-v="explorar">Ver todos os jogos</button></div>`}
 if(SF.wide&&SF.wide())return SF.homeDesktop();
 const recs=SF.recs(),nx=SF.nextGame(),replays=SF.GAMES.filter(g=>g.done);
 const up=SF.GAMES.filter(g=>!g.done).sort((a,b)=>a.min-b.min).slice(0,5);
 const rk=[...SF.RANKING,{n:SF.who(),p:s.points,me:true}].sort((p,q)=>q.p-p.p).slice(0,3);
 const miss=[['Vê 2 jogos esta semana',Math.min(2,s.watched.length),2],['Convida um amigo',Math.min(1,s.invites),1],['Acerta numa previsão',Math.min(1,s.predWin),1]];
 return `<div class="top"><div class="logo"><b>//</b>SPORT FLEX<span class="tag" style="background:var(--bg3);margin-left:.4rem;font-size:.6rem;font-family:var(--ui)">DEMO</span></div><button class="coinpill" data-a="tab" data-v="carteira" aria-label="Carteira Flex: ${s.coins} moedas">${SF.coin}<span data-count="coins">${s.coins}</span></button></div>
 <div class="col" style="gap:1rem">
 <div><div style="font-size:1.5rem;font-weight:700;letter-spacing:-.03em;line-height:1.15">${E(SF.greet())}</div><div class="mut sm">${SF.GAMES.filter(g=>!g.done&&g.min<2880).length} jogos nas próximas 48 horas · horas de Lisboa</div></div>
 <div><div class="h2" style="margin-top:0"><h2>Próximo jogo</h2></div><div class="strip one" style="margin-top:.6rem">${SF.hero(nx)}</div></div>
 <div><div class="h2" style="margin-top:0"><h2>Os meus acessos</h2><button data-a="tab" data-v="jogos">Ver tudo</button></div><div class="card" style="margin-top:.6rem">${SF.accessHtml(2)}</div></div>
 <div><div class="h2" style="margin-top:0"><h2>Calendário</h2><button data-a="tab" data-v="explorar">Ver tudo</button></div><div class="col gl" style="margin-top:.6rem;gap:.6rem">${up.map(g=>SF.gameCard(g)).join('')}</div></div>
 <div><div class="h2" style="margin-top:0"><h2>${I('spark','')} Escolhidos para ti</h2></div><div class="strip" style="margin-top:.6rem">${recs.map(SF.hero).join('')}</div></div>
 <button class="card" data-a="watchparty" style="display:flex;gap:.9rem;align-items:center;background:linear-gradient(120deg,color-mix(in srgb,var(--accent) 30%,var(--bg2)),var(--bg2))"><span class="ic" style="background:var(--accent);color:#fff">${I('users')}</span><span class="grow"><b>Vê com amigos</b><div class="mut sm">Watch Party com videochamada e chat durante o jogo</div></span>${I('chev')}</button>
 <div><div class="h2" style="margin-top:0"><h2>Replay inteligente</h2></div><div class="mut sm">Só os momentos-chave. Vê um jogo em dois minutos.</div><div class="strip" style="margin-top:.6rem">${replays.map(g=>`<button class="card" data-a="game" data-v="${g.id}" style="width:15rem;display:flex;flex-direction:column;gap:.5rem"><div class="row"><span class="pair">${SF.crest(g.h)}${SF.crest(g.a)}</span><span class="sc" style="margin-left:auto">${SF.score(g)}</span></div><b style="font-weight:600;font-size:.85rem">${E(g.title)}</b><span class="tag" style="background:var(--bg3);width:fit-content">${SF.hidden(g)?I('eye')+'Resultado oculto':I('replay')+SF.moments(g).length+' momentos'}</span></button>`).join('')}</div></div>
 <div class="sec2"><div class="h2" style="margin-top:0"><h2>Recompensas</h2><button data-a="tab" data-v="premios">Ver tudo</button></div>
  <div class="card" style="margin-top:.6rem"><div class="row"><b class="grow">Missões da semana</b><span class="mut sm">${s.points} pts</span></div><div class="col" style="gap:.6rem;margin-top:.7rem">${miss.map(m=>`<div><div class="row sm" style="justify-content:space-between"><span>${m[0]}</span><span class="mut">${m[1]}/${m[2]}</span></div><div class="bar" style="margin-top:.3rem"><i style="width:${m[1]/m[2]*100}%"></i></div></div>`).join('')}</div>
  <div class="mut sm" style="margin-top:.9rem">Ranking semanal</div><div class="col" style="gap:.2rem;margin-top:.3rem">${rk.map((r,i)=>`<div class="rank ${r.me?'me':''}"><span class="n">${i+1}</span><span class="av" style="background:var(--bg3)">${E(r.n[0])}</span><b class="grow" style="font-weight:600">${E(r.n)}${r.me?' (tu)':''}</b><b class="big" style="font-size:1.2rem">${r.p}</b></div>`).join('')}</div></div></div>
 </div>`};
SF.act.watchparty=()=>{const g=SF.GAMES.find(x=>!x.done);SF._tab='party';if(SF.player&&SF.player.p&&SF.player.p.id===g.id)SF.player.p.tab='party';SF.go('jogo-'+g.id)};
/* ---------- Explorar ---------- */
SF._ex={tab:'jogo',q:''};
const exList=()=>{const {tab,q}=SF._ex,ql=q.trim().toLowerCase();let h='';
 if(tab==='jogo'){const m=g=>(!ql||(g.title+SF.COMPS[g.comp].n+SF.SPORTS[g.sp].n).toLowerCase().includes(ql))&&SF.calFilter(g);
  const sec=(t,l)=>l.length?`<div class="h2"><h2>${t}</h2></div>${l.map(g=>SF.gameCard(g)).join('')}`:'';
  const a=SF.GAMES.filter(m);h=sec('Próximos jogos',a.filter(g=>!g.done))+sec('Resultados e replays',a.filter(g=>g.done));}
 if(tab==='equipa')h=Object.keys(SF.TEAMS).filter(id=>!ql||SF.TEAMS[id].n.toLowerCase().includes(ql)).map(id=>{const t=SF.TEAMS[id],own=SF.has('clube',id);return `<div class="g">${SF.crest(id)}<span class="tt"><b>${E(t.n)}</b><span>${SF.SPORTS[t.sp].n} · todos os jogos · ${SF.SEASON.lbl}</span></span><button class="price ${own?'own':''}" data-a="buy" data-k="clube" data-i="${id}">${own?I('check')+'Tens':SF.coin+SF.cost('clube',id)}</button></div>`}).join('');
 if(tab==='comp')h=Object.keys(SF.COMPS).filter(id=>!ql||SF.COMPS[id].n.toLowerCase().includes(ql)).map(id=>{const c=SF.COMPS[id],own=SF.has('comp',id);const n=SF.GAMES.filter(g=>g.comp===id).length;return `<div class="g"><span class="ic">${I('trophy')}</span><span class="tt"><b>${E(c.n)}</b><span>${SF.SPORTS[c.sp].n} · ${c.desc} · ${n?(n===1?'1 jogo':n+' jogos')+' na app':'calendário em breve'} · ${SF.SEASON.lbl}</span></span><button class="price ${own?'own':''}" data-a="buy" data-k="comp" data-i="${id}">${own?I('check')+'Tens':SF.coin+SF.cost('comp',id)}</button></div>`}).join('');
 if(tab==='mod')h=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:.7rem">`+Object.keys(SF.SPORTS).filter(id=>!ql||SF.SPORTS[id].n.toLowerCase().includes(ql)).map(id=>{const sp=SF.SPORTS[id],own=SF.has('mod',id);return `<button class="card" data-a="buy" data-k="mod" data-i="${id}" style="display:flex;flex-direction:column;gap:.6rem;min-height:8rem"><span class="ic">${I('ball')}</span><b>${sp.n}</b><span class="mut sm">Todas as competições de futebol da app · ${SF.SEASON.lbl} · inclui os packs de clube e de competição</span><span class="price ${own?'own':''}" style="width:fit-content">${own?I('check')+'Tens':SF.coin+SF.cost('mod',id)}</span></button>`}).join('')+`</div>`;
 return h||(tab==='jogo'&&SF.fActive()?SF.calEmpty():'<div class="card mut" style="text-align:center">Nada encontrado. Experimenta outra pesquisa.</div>')};
SF.screens.explorar=()=>{const e=SF._ex;
 return `<div class="top"><h1>${SF.st.ess?'Todos os jogos':'Explorar'}<small>${SF.DATA_LBL} · horas de Lisboa</small></h1><button class="coinpill" data-a="tab" data-v="carteira" aria-label="Carteira Flex">${SF.coin}<span data-count="coins">${SF.st.coins}</span></button></div>
 <div class="col"><label class="search">${I('search')}<input id="exq" type="search" placeholder="Procurar jogo, clube ou competição" value="${E(e.q)}" aria-label="Procurar"></label>
 <div class="seg" role="tablist">${[['jogo','Jogo'],['equipa','Equipa'],['comp','Competição'],['mod','Modalidade']].map(t=>`<button role="tab" data-a="extab" data-v="${t[0]}" class="${e.tab===t[0]?'on':''}">${t[1]}</button>`).join('')}</div>
 <div class="mut sm">Pack ${{jogo:'Jogo: um jogo e o replay durante '+SF.SEASON.replay+' dias',equipa:'Clube: todos os jogos da equipa até '+SF.SEASON.fim,comp:'Competição: a liga ou taça completa até '+SF.SEASON.fim,mod:'Modalidade: todas as competições de futebol até '+SF.SEASON.fim+'. Custa mais do que um pack de competição porque inclui todas'}[e.tab]}</div>
 ${e.tab==='jogo'?SF.calBar():''}<button class="card row" data-a="tab" data-v="comparar" style="gap:.8rem"><span class="ic">${I('spark')}</span><span class="grow"><b>Comparador de packs</b><div class="mut sm">Escolhe os jogos e vê a opção mais barata</div></span>${I('chev')}</button>
 <div class="col" id="exlist" style="gap:.6rem">${exList()}</div></div>`};
SF.after.explorar=()=>{const i=SF.$('#exq');if(i)i.addEventListener('input',()=>{SF._ex.q=i.value;SF.$('#exlist').innerHTML=exList()})};
SF.act.extab=el=>{SF._ex.tab=el.dataset.v;SF.render()};
})();
