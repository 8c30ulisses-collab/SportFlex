(function(){
const SF=window.SF,E=SF.esc,I=SF.icon;
const mq=window.matchMedia('(min-width:1100px)');
SF.wide=()=>mq.matches;
(mq.addEventListener?mq.addEventListener.bind(mq,'change'):mq.addListener.bind(mq))(()=>{if(SF.st.onboarded&&SF.route().n==='home')SF.render()});
const MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],DIA=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const hm=g=>SF.hm(g);const pl=n=>n+(n===1?' jogo':' jogos');
const dayLbl=g=>{const l=SF.lx(SF.ts(g)),n=SF.lx(Date.now()),t=SF.lx(Date.now()+864e5);if(l.key===n.key)return 'Hoje';if(l.key===t.key)return 'Amanhã';return DIA[l.wd]+', '+l.d+' de '+MES[l.m-1]};
SF._cal='all';
SF.homeDesktop=()=>{
 const s=SF.st,recs=SF.recs(),top=SF.nextGame(),g=top.g,h=SF.TEAMS[g.h],a=SF.TEAMS[g.a],ac=SF.access(g);
 const up=SF.GAMES.filter(x=>!x.done),done=SF.GAMES.filter(x=>x.done);
 const comps=Object.keys(SF.COMPS);const withGames=comps.filter(c=>up.some(x=>x.comp===c));
 const list=up.filter(x=>(SF._cal==='all'||x.comp===SF._cal)&&SF.calFilter(x));
 let cal='',last='';list.forEach(x=>{const d=dayLbl(x);if(d!==last){last=d;cal+=`<div class="cal-day">${E(d)}</div>`}
  cal+=`<button class="cal-row" data-a="game" data-v="${x.id}"><span class="cal-t">${hm(x)}</span><span class="pair">${SF.crest(x.h,'xs')}${SF.crest(x.a,'xs')}</span><span class="grow"><b>${E(x.title)}</b><span class="mut sm">${E(SF.COMPS[x.comp].n)}</span></span>${SF.access(x)?`<span class="price own">${I('check')}Tens</span>`:`<span class="price">${SF.coin}${SF.cost('jogo',x.id)}</span>`}</button>`});
 const rk=[...SF.RANKING,{n:SF.who(),p:s.points,me:true}].sort((p,q)=>q.p-p.p).slice(0,5);
 const owned=[...s.packs.map(p=>({k:p.k,i:p.id})),...s.games.map(i=>({k:'jogo',i}))];
 const miss=[['Vê 2 jogos esta semana',Math.min(2,s.watched.length),2],['Convida um amigo',Math.min(1,s.invites),1],['Acerta numa previsão',Math.min(1,s.predWin),1]];
 const open=ac?`<button class="btn" data-a="watch" data-v="${g.id}">${I('play')}Abrir jogo</button>`:`<button class="btn" data-a="buy" data-k="jogo" data-i="${g.id}">${SF.coin}Comprar por ${SF.cost('jogo',g.id)} moedas</button>`;
 return `<div class="top"><div><h1>${E(SF.greet())}</h1><small>${up.filter(x=>x.min<2880).length} jogos nas próximas 48 horas · ${E(SF.DATA_LBL)} · horas de Lisboa <span class="tag" style="background:var(--bg3);margin-left:.3rem">DEMO</span></small></div>
 <button class="dsearch" data-a="tab" data-v="explorar">${I('search')}<span>Procurar jogo, clube ou competição</span></button>
 <button class="btn sec sm" data-a="voice">${I('mic')}Voz</button><button class="coinpill" data-a="tab" data-v="carteira" aria-label="Carteira Flex">${SF.coin}<span data-count="coins">${s.coins}</span></button></div>
 <div class="dh">
  <section class="dbanner" style="background:linear-gradient(120deg,${h.c[0]} 0%,${h.c[1]} 48%,${a.c[1]} 100%)">
   <div class="dbl"><div class="tags"><span class="tag">Próximo jogo</span><span class="tag">${E(SF.COMPS[g.comp].n)}</span><span class="tag">${SF.when(g)}</span>${ac?'<span class="tag ok">Tens acesso</span>':''}</div>
   <h2>${E(g.title)}</h2><div class="why">${I('spark')}${E(top.why)}</div>
   <div class="cd" id="cd" data-ts="${SF.t0+g.min*60000}" aria-label="Contagem decrescente para o início"></div>
   <div class="row" style="gap:.7rem;flex-wrap:wrap">${open}<button class="btn sec" data-a="game" data-v="${g.id}">Ver packs</button><button class="btn sec" data-a="notify" data-v="${g.id}" aria-label="Lembrar-me deste jogo" title="Lembrar-me" style="padding-inline:.9rem">${I('bell')}</button></div></div>
   <div class="dbr">${SF.crest(g.h,'xl')}<b>VS</b>${SF.crest(g.a,'xl')}</div></section>
  <aside class="dside">
   <div class="card dwallet"><div class="row"><b class="grow" style="font-size:1.05rem">Os meus acessos</b><button class="mini" data-a="tab" data-v="carteira" aria-label="Carteira Flex">${SF.coin}<span data-count="coins">${s.coins}</span> moedas ${I('chev')}</button></div>
    <div style="margin-top:.8rem">${SF.accessHtml(3)}</div><button class="btn sec sm" data-a="tab" data-v="jogos" style="margin-top:.8rem;width:100%">Ver os meus jogos</button></div>
  </aside>
  <section class="card dcal"><div class="dh-h" style="margin:0 0 .8rem"><h2>Calendário</h2><span class="mut sm" role="status">${pl(list.length)}</span></div>
   ${SF.calBar()}
   <div class="chips" style="margin:.6rem 0"><button class="chip ${SF._cal==='all'?'on':''}" data-a="calf" data-v="all">Todas</button>${withGames.map(c=>`<button class="chip ${SF._cal===c?'on':''}" data-a="calf" data-v="${c}">${E(SF.COMPS[c].n)}</button>`).join('')}</div>
   <div class="cal">${cal||(SF.fActive()?SF.calEmpty():'<div class="mut">Sem jogos nesta competição.</div>')}</div></section>
  <aside class="dside">
   <div class="card dparty"><div class="row"><span class="ic">${I('users')}</span><span class="grow"><b>Watch Party</b><div class="mut sm">Vê com amigos, com videochamada e chat</div></span></div>
    <div class="row" style="margin:.9rem 0;gap:.4rem">${SF.FRIENDS.map(f=>`<span class="av" title="${E(f.n)}" style="background:linear-gradient(135deg,${f.c[0]},${f.c[1]})">${f.n[0]}</span>`).join('')}<span class="mut sm" style="margin-left:.3rem">4 amigos disponíveis</span></div>
    <button class="btn" data-a="watchparty">${I('users')}Abrir uma Watch Party</button></div>
  </aside>
  <section class="full"><div class="dh-h"><h2>${I('spark')}Escolhidos para ti</h2><button data-a="tab" data-v="explorar">Ver todos</button></div><div class="dgrid4">${recs.slice(1,5).map(SF.hero).join('')}</div></section>
  <section class="full"><div class="dh-h"><h2>Competições</h2><button data-a="tab" data-v="explorar">Explorar packs</button></div><div class="dcomps">${comps.map(c=>{const co=SF.COMPS[c],n=SF.GAMES.filter(x=>x.comp===c).length,own=SF.has('comp',c);return `<div class="ctile"><span class="ic">${I('trophy')}</span><b>${E(co.n)}</b><span class="mut sm">${n?n+(n===1?' jogo':' jogos')+' na app':'calendário em breve'} · ${SF.SEASON.lbl}</span><button class="price ${own?'own':''}" data-a="buy" data-k="comp" data-i="${c}">${own?I('check')+'Tens':SF.coin+SF.cost('comp',c)}</button></div>`}).join('')}</div></section>
  <section class="full"><div class="dh-h"><h2>Resultados e replay inteligente</h2></div><div class="dgrid4">${done.slice(0,8).map(x=>`<button class="card dres" data-a="game" data-v="${x.id}"><div class="row"><span class="pair">${SF.crest(x.h)}${SF.crest(x.a)}</span><span class="sc" style="margin-left:auto;font-size:1.6rem">${SF.score(x)}</span></div><b style="font-weight:600">${E(x.title)}</b><span class="mut sm">${E(x.lbl)}</span><span class="tag" style="background:var(--bg3);width:fit-content">${SF.hidden(x)?I('eye')+'Resultado oculto':I('replay')+SF.moments(x).length+' momentos'}</span></button>`).join('')}</div></section>
  <section class="full dsecond"><div class="dh-h"><h2>Recompensas</h2><button data-a="tab" data-v="premios">Ver tudo</button></div><div class="dsec2">
   <div class="card"><div class="row"><b class="grow">Missões da semana</b><span class="mut sm">${s.points} pts</span></div>
    <div class="col" style="gap:.7rem;margin-top:.8rem">${miss.map(m=>`<div><div class="row sm" style="justify-content:space-between"><span>${m[0]}</span><span class="mut">${m[1]}/${m[2]}</span></div><div class="bar" style="margin-top:.3rem"><i style="width:${m[1]/m[2]*100}%"></i></div></div>`).join('')}</div></div>
   <div class="card"><div class="row"><b class="grow">Ranking semanal</b><button class="mini" data-a="tab" data-v="premios">Ver tudo ${I('chev')}</button></div>
    <div class="col" style="gap:.25rem;margin-top:.6rem">${rk.map((r,i)=>`<div class="rank ${r.me?'me':''}"><span class="n">${i+1}</span><span class="av" style="background:var(--bg3)">${E(r.n[0])}</span><b class="grow" style="font-weight:600">${E(r.n)}${r.me?' (tu)':''}</b><b class="big" style="font-size:1.3rem">${r.p}</b></div>`).join('')}</div></div>
  </div></section>
 </div>`};
SF.act.calf=el=>{SF._cal=el.dataset.v;SF.render()};
/* contagem decrescente */
function tick(){const el=document.getElementById('cd');if(!el){clearInterval(SF._cdT);return}
 let ms=+el.dataset.ts-Date.now();if(ms<0)ms=0;const d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);
 const box=(v,l)=>`<span class="cdb"><b>${String(v).padStart(2,'0')}</b><small>${l}</small></span>`;
 el.innerHTML=box(d,'dias')+box(h,'horas')+box(m,'min')+box(s,'seg')}
SF.after.home=()=>{clearInterval(SF._cdT);if(document.getElementById('cd')){tick();SF._cdT=setInterval(tick,1000)}};
})();
