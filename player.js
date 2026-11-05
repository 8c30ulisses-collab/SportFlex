(function(){
const SF=window.SF,E=SF.esc,I=SF.icon;
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const FORM={
 futebol:[[.05,.5],[.2,.2],[.2,.4],[.2,.6],[.2,.8],[.4,.15],[.4,.38],[.4,.62],[.4,.85],[.6,.38],[.6,.62]],
 basquetebol:[[.25,.5],[.35,.25],[.35,.75],[.5,.35],[.5,.65]],
 andebol:[[.06,.5],[.25,.2],[.25,.8],[.32,.5],[.42,.3],[.42,.7],[.5,.5]],
 voleibol:[[.42,.2],[.42,.5],[.42,.8],[.3,.2],[.3,.5],[.3,.8]]
};
const BOT={ines:['Que jogada!','Vai, vai, vai!','Isto está a ficar quente','Alguém viu aquilo?'],rui:['Golo, golo, golo!','O árbitro está a dormir','Boa defesa','Já pagaste o pack, Miguel?'],miguel:['Estou a ver no sofá, em HD','Replay inteligente ativado','Que susto','Vamos lá, equipa!'],carla:['Previsão: 3-1','Eu disse que ganhavam','Quem quer apostar pontos?','Brutal']};
const P=SF.player={p:null,raf:0,tick:0,stop(){cancelAnimationFrame(this.raf);clearInterval(this.tick);this.raf=0;this.tick=0}};
function init(id){
 if(P.p&&P.p.id===id)return P.p;
 const g=SF.game(id),sp=g.sp;
 const p=P.p={id,g,sp,min:0,live:false,sim:false,q:3,secs:492,hs:g.hs||0,as:g.as||0,over:false,
  home:FORM[sp].map((b,i)=>({b,ph:rnd(0,6.3),i})),away:FORM[sp].map((b,i)=>({b:[1-b[0],b[1]],ph:rnd(0,6.3),i})),
  ball:{x:.5,y:.5,tx:.5,ty:.5,next:0},flash:0,flashTxt:'',events:[],chat:[],party:{on:false,members:[],mic:true,cam:true},
  polls:[{q:'Quem marca a seguir?',o:[g.h,g.a,null],v:[38,29,33]},{q:'Melhor em campo',o:['Avançado do '+SF.TEAMS[g.h].n,'Médio do '+SF.TEAMS[g.a].n,'Guarda-redes'],v:[44,31,25]}],
  tab:SF._tab||(g.done?'replay':'live'),ar:false,rep:null,stats:{pos:54,sh:[9,6],pa:[312,268],km:[58,61]},trail:[]};
 SF._tab=null;
 p.chat=[{n:'Inês',t:'Já estás a ver? Está a ficar bom'},{n:'Rui',t:'Entrei agora, quem ganha?'}];
 return p}
function sizeCanvas(){const cv=SF.$('#cv');if(!cv)return;const r=cv.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.max(2,r.width*d);cv.height=Math.max(2,r.height*d)}
function pos(p,pl,t,isHome,hasBall){const [bx,by]=pl.b,k=pl.i===0&&p.sp==='futebol'?.03:p.sp==='voleibol'?.04:.13;
 return {x:bx+Math.sin(t*.9+pl.ph)*.025+(p.ball.x-bx)*k,y:by+Math.cos(t*.7+pl.ph*1.3)*.03+(p.ball.y-by)*k}}
function drawField(c,W,H,sp){
 if(sp==='futebol'){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1C8A4F');g.addColorStop(1,'#0F5C33');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.fillStyle='rgba(255,255,255,.045)';for(let i=0;i<10;i+=2)c.fillRect(W*i/10,0,W/10,H);
  c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=2;const m=W*.03;c.strokeRect(m,m,W-2*m,H-2*m);c.beginPath();c.moveTo(W/2,m);c.lineTo(W/2,H-m);c.stroke();c.beginPath();c.arc(W/2,H/2,H*.14,0,7);c.stroke();
  c.strokeRect(m,H*.28,W*.14,H*.44);c.strokeRect(W-m-W*.14,H*.28,W*.14,H*.44);c.strokeRect(m,H*.4,W*.05,H*.2);c.strokeRect(W-m-W*.05,H*.4,W*.05,H*.2)}
 else if(sp==='voleibol'){c.fillStyle='#164E7A';c.fillRect(0,0,W,H);c.fillStyle='#d9742f';c.fillRect(W*.1,H*.12,W*.8,H*.76);c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=2;c.strokeRect(W*.1,H*.12,W*.8,H*.76);c.beginPath();c.moveTo(W/2,H*.05);c.lineTo(W/2,H*.95);c.stroke();c.setLineDash([6,6]);c.beginPath();c.moveTo(W*.34,H*.12);c.lineTo(W*.34,H*.88);c.moveTo(W*.66,H*.12);c.lineTo(W*.66,H*.88);c.stroke();c.setLineDash([])}
 else{c.fillStyle=sp==='basquetebol'?'#B8742F':'#2a5fa8';c.fillRect(0,0,W,H);if(sp==='basquetebol'){c.fillStyle='rgba(0,0,0,.07)';for(let i=0;i<14;i++)c.fillRect(0,H*i/14,W,H/28)}
  c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=2;const m=W*.03;c.strokeRect(m,m,W-2*m,H-2*m);c.beginPath();c.moveTo(W/2,m);c.lineTo(W/2,H-m);c.stroke();c.beginPath();c.arc(W/2,H/2,H*.12,0,7);c.stroke();
  c.strokeRect(m,H*.3,W*.17,H*.4);c.strokeRect(W-m-W*.17,H*.3,W*.17,H*.4);c.beginPath();c.arc(m+W*.17,H/2,H*.14,-1.57,1.57);c.stroke();c.beginPath();c.arc(W-m-W*.17,H/2,H*.14,1.57,4.71);c.stroke()}}
function frame(){
 const p=P.p;if(!p)return;const cv=SF.$('#cv');if(!cv){P.raf=requestAnimationFrame(frame);return}
 const c=cv.getContext('2d'),W=cv.width,H=cv.height,t=performance.now()/1000,live=p.live&&!p.over;
 drawField(c,W,H,p.sp);
 const now=performance.now();
 if(now>p.ball.next){const all=[...p.home,...p.away];const pl=pick(all);const q=pos(p,pl,t);p.ball.tx=q.x;p.ball.ty=q.y;p.ball.next=now+rnd(900,1700);if(p.sp==='voleibol'){p.ball.tx=rnd(.15,.85);p.ball.ty=rnd(.2,.8)}}
 if(p.flash>0){p.ball.tx=p.flashSide?.97:.03;p.ball.ty=.5}
 const sp=live||p.g.done?.07:.0; p.ball.x+=(p.ball.tx-p.ball.x)*(live||p.flash>0?.07:.01);p.ball.y+=(p.ball.ty-p.ball.y)*(live||p.flash>0?.07:.01);
 p.trail.push([p.ball.x,p.ball.y]);if(p.trail.length>26)p.trail.shift();
 const r=Math.max(5,W*(p.sp==='futebol'?.0115:.0145)),th=SF.TEAMS[p.g.h].c[0],ta=SF.TEAMS[p.g.a].c[0];
 const pts=[];
 [[p.home,th],[p.away,ta]].forEach(([arr,col],ti)=>arr.forEach(pl=>{const q=pos(p,pl,t);pts.push({x:q.x*W,y:q.y*H,col,ti,i:pl.i});}));
 if(p.ar){ // realidade aumentada
  const bx=p.ball.x*W,by=p.ball.y*H;const g2=c.createRadialGradient(bx,by,0,bx,by,W*.18);g2.addColorStop(0,'rgba(244,82,45,.45)');g2.addColorStop(1,'rgba(244,82,45,0)');c.fillStyle=g2;c.fillRect(0,0,W,H);
  c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=2;c.beginPath();p.trail.forEach((q,i)=>i?c.lineTo(q[0]*W,q[1]*H):c.moveTo(q[0]*W,q[1]*H));c.stroke()}
 pts.forEach(q=>{c.beginPath();c.arc(q.x,q.y,r,0,7);c.fillStyle=q.col;c.fill();c.lineWidth=2;c.strokeStyle='#fff';c.stroke()});
 if(p.ar){const near=pts.map(q=>({q,d:Math.hypot(q.x-p.ball.x*W,q.y-p.ball.y*H)})).sort((a,b)=>a.d-b.d).slice(0,3);c.font='600 '+Math.round(W*.027)+'px Poppins,sans-serif';
  near.forEach((o,k)=>{const q=o.q,sp=(24+((q.i*7+k*5+Math.floor(t/2))%9)).toFixed(1);const txt='#'+(q.i+3)+' · '+sp+' km/h';const w=c.measureText(txt).width+14;c.fillStyle='rgba(10,11,13,.85)';const x=Math.min(W-w-4,Math.max(4,q.x-w/2)),y=Math.max(4,Math.min(H-W*.2,q.y-r-W*.05-k*W*.035));c.beginPath();c.roundRect?c.roundRect(x,y,w,W*.04,8):c.rect(x,y,w,W*.04);c.fill();c.fillStyle='#fff';c.fillText(txt,x+7,y+W*.029);c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=1.5;c.setLineDash([4,4]);c.beginPath();c.moveTo(q.x,q.y-r);c.lineTo(x+w/2,y+W*.04);c.stroke();c.setLineDash([])})}
 c.beginPath();c.arc(p.ball.x*W,p.ball.y*H,r*.62,0,7);c.fillStyle='#fff';c.shadowColor='#fff';c.shadowBlur=10;c.fill();c.shadowBlur=0;
 if(p.flash>0){p.flash-=1/60;c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.font='800 '+Math.round(W*.1)+'px Poppins,sans-serif';c.textAlign='center';c.fillText(p.flashTxt,W/2,H*.5);c.font='600 '+Math.round(W*.032)+'px Poppins,sans-serif';c.fillText(p.flashSub||'',W/2,H*.5+W*.06);c.textAlign='left'}
 if(p.rep){const e=now-p.rep.at,pr=Math.min(1,e/p.rep.dur);c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,0,W,H);const gg=c.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.7);gg.addColorStop(0,'rgba(0,0,0,0)');gg.addColorStop(1,'rgba(0,0,0,.65)');c.fillStyle=gg;c.fillRect(0,0,W,H);
  c.fillStyle='var(--accent)';c.fillStyle=SF.st.accent;c.fillRect(0,H*.04,W*pr,5);c.fillStyle='#fff';c.font='700 '+Math.round(W*.034)+'px Poppins,sans-serif';c.fillText('REPLAY · '+p.rep.label,W*.04,H*.14);
  if(pr>=1){if(p.rep.queue&&p.rep.queue.length){const n=p.rep.queue.shift();p.rep={at:now,dur:3200,label:n.m+"' "+n.d,queue:p.rep.queue};setMoms()}else{p.rep=null;setMoms()}}}
 P.raf=requestAnimationFrame(frame)}
function setMoms(){const el=SF.$('#moms');if(el)el.innerHTML=momsHtml()}
const MOMS=p=>SF.moments(p.g);
function momsHtml(){const p=P.p,ms=MOMS(p);return ms.map((m,i)=>`<button class="mom ${p.rep&&p.rep.label&&p.rep.label.indexOf(m.d)>-1?'on':''}" data-a="mom" data-v="${i}"><b>${m.m}${typeof m.m==='number'?"'":''}</b>${E(m.t)}</button>`).join('')}
/* HUD */
function hud(){const p=P.p,g=p.g,T=SF.TEAMS;const live=p.live&&!p.over;
 const clock=g.done||p.over?'Fim':p.live?(p.sp==='futebol'?p.min+"'":p.sp==='basquetebol'?`Q${p.q} ${String(Math.floor(p.secs/60)).padStart(2,'0')}:${String(Math.floor(p.secs%60)).padStart(2,'0')}`:'Ao vivo'):SF.when(g);
 return `<div class="t">${SF.crest(g.h,'xs')}<span>${E(T[g.h].s)}</span></div><div class="mid"><div class="sc">${p.live||g.done?p.hs+' - '+p.as:'VS'}</div><small>${clock}</small></div><div class="t r">${SF.crest(g.a,'xs')}<span>${E(T[g.a].s)}</span></div>`}
function refreshHud(){const h=SF.$('#sb');if(h)h.innerHTML=hud();const f=SF.$('#evs');if(f&&P.p.tab==='live')f.innerHTML=evHtml()}
const evHtml=()=>{const p=P.p;return p.events.length?p.events.slice(0,6).map(e=>`<div class="ev"><b>${E(e.m)}</b><span>${E(e.txt)}</span></div>`).join(''):'<div class="mut sm">Os acontecimentos do jogo aparecem aqui.</div>'};
function addChat(n,t){P.p.chat.push({n,t});P.p.chat=P.p.chat.slice(-40);const m=SF.$('#msgs');if(m){m.innerHTML=chatHtml();m.scrollTop=m.scrollHeight}}
function goal(side){const p=P.p,g=p.g;const tm=SF.TEAMS[side?g.a:g.h];if(side)p.as++;else p.hs++;p.flash=1.6;p.flashSide=side?0:1;p.flashTxt='GOLO';p.flashSub=tm.n;
 p.events.unshift({m:p.min+"'",txt:'Golo do '+tm.n,t:'Golo'});SF.toast('Golo do '+tm.n+' (simulação)');
 if(p.party.on||true){const f=pick(SF.FRIENDS);setTimeout(()=>addChat(f.n,pick(BOT[f.id])),900)}}
function step(){const p=P.p;if(!p)return;const g=p.g;
 if(p.live&&!p.over){
  if(p.sp==='futebol'){p.min++;if(Math.random()<.2)goal(Math.random()<.5?1:0);else if(Math.random()<.4){const tm=SF.TEAMS[pick([g.h,g.a])];p.events.unshift({m:p.min+"'",txt:pick(['Remate perigoso do ','Canto para o ','Falta a favor do ','Defesa difícil perante o '])+tm.n,t:'Lance'})}
   if(p.min>=90){p.over=true;p.events.unshift({m:'90\'',txt:'Fim do jogo',t:'Fim'})}}
  else if(p.sp==='basquetebol'){p.secs-=22;if(p.secs<=0){p.q++;p.secs=600;if(p.q>4){p.over=true;p.q=4;p.secs=0}}
   if(Math.random()<.55){const s=Math.random()<.5?2:3,side=Math.random()<.5;if(side)p.as+=s;else p.hs+=s;p.events.unshift({m:'Q'+p.q,txt:(s===3?'Triplo de ':'Cesto de ')+SF.TEAMS[side?g.a:g.h].n,t:'Cesto'})}}}
 p.stats.pos=Math.max(40,Math.min(64,p.stats.pos+Math.round(rnd(-2,2))));if(Math.random()<.4)p.stats.sh[Math.random()<.5?0:1]++;p.stats.km[0]+=Math.round(rnd(0,2));p.stats.km[1]+=Math.round(rnd(0,2));p.stats.pa[0]+=Math.round(rnd(0,4));p.stats.pa[1]+=Math.round(rnd(0,4));
 p.polls.forEach(po=>{const k=Math.floor(Math.random()*3);po.v[k]+=Math.random()<.5?1:0});
 if(p.party.on&&Math.random()<.5){p.party.talk=pick(p.party.members.concat(['x']))}
 refreshHud();if(p.tab==='vote')SF.$('#ptab')&&(SF.$('#ptab').innerHTML=tabHtml());if(p.tab==='ar'||p.tab==='live'){const st=SF.$('#stats');if(st)st.innerHTML=statsHtml()}
 if(p.tab==='party'){const t=SF.$('#tiles');if(t)t.innerHTML=tilesHtml()}}
/* tabs */
const bar=(l,a,b)=>{const s=a+b||1;return `<div><div class="row sm" style="justify-content:space-between"><b>${a}</b><span class="mut">${l}</span><b>${b}</b></div><div class="bar" style="margin-top:.2rem;display:flex;gap:2px"><i style="width:${a/s*100}%;background:${SF.TEAMS[P.p.g.h].c[0]}"></i><i style="width:${b/s*100}%;background:${SF.TEAMS[P.p.g.a].c[0]}"></i></div></div>`};
const statsHtml=()=>{const s=P.p.stats;return `<div class="col" style="gap:.6rem">${bar('Posse de bola %',s.pos,100-s.pos)}${bar('Remates',s.sh[0],s.sh[1])}${bar('Passes',s.pa[0],s.pa[1])}${bar('Distância (km)',s.km[0],s.km[1])}</div>`};
const chatHtml=()=>P.p.chat.map(m=>`<div class="m ${m.me?'me':''}"><small>${E(m.n)}</small>${E(m.t)}</div>`).join('');
const tilesHtml=()=>{const pa=P.p.party;const me=`<div class="tile" style="background:linear-gradient(135deg,${SF.st.accent},#5a1708)"><span>${E(SF.st.name)} (tu)</span></div>`;
 const fr=pa.members.map(id=>{const f=SF.FRIENDS.find(x=>x.id===id);return `<div class="tile ${pa.talk===id?'talk':''}" style="background:linear-gradient(135deg,${f.c[0]},${f.c[1]})"><span>${pa.talk===id?I('mic'):''}${f.n}</span></div>`}).join('');
 const add=pa.members.length<4?`<button class="tile add" data-a="invite" aria-label="Convidar amigo">${I('plus')}</button>`:'';return me+fr+add};
function tabHtml(){const p=P.p,g=p.g,ac=SF.access(g),t=p.tab;
 if(!ac&&t!=='live')return `<div class="card" style="text-align:center;display:flex;flex-direction:column;gap:.7rem;align-items:center">${I('lock')}<b>Esta funcionalidade faz parte do pack</b><span class="mut sm">Compra o jogo para ativar chat, votações, AR e replays.</span><button class="btn" data-a="game" data-v="${g.id}">${SF.coin}Ver packs</button></div>`;
 if(t==='live')return `${(!g.done&&!p.live)?`<div class="card col"><b>Simular transmissão</b><span class="mut sm">O jogo ainda não começou e a demonstração não tem vídeo real. Simula a transmissão para experimentares o campo, a Watch Party, as votações, a AR e os replays.</span><button class="btn" data-a="sim">${I('play')}Simular jogo ao vivo</button></div>`:''}<div class="card"><b style="font-size:.95rem">Estatísticas</b><div style="margin-top:.7rem" id="stats">${statsHtml()}</div></div><div class="card"><b style="font-size:.95rem">Acontecimentos</b><div class="feed" id="evs" style="margin-top:.7rem">${evHtml()}</div></div>`;
 if(t==='party'){const pa=p.party;if(!pa.on)return `<div class="card col"><b>Watch Party</b><span class="mut sm">Vê o jogo com amigos à distância, com videochamada e reações em tempo real.</span><div class="list">${SF.FRIENDS.map(f=>`<div class="li"><span class="av" style="background:linear-gradient(135deg,${f.c[0]},${f.c[1]})">${f.n[0]}</span><b class="grow" style="font-weight:600">${f.n}</b><button class="btn sm ${pa.members.includes(f.id)?'sec':''}" data-a="invite" data-v="${f.id}">${pa.members.includes(f.id)?'Convidado':'Convidar'}</button></div>`).join('')}</div><button class="btn" data-a="startparty">${I('users')}Iniciar Watch Party</button></div>`;
  return `<div class="card col"><div class="row"><b class="grow">Watch Party ativa</b><span class="tag live" style="color:#fff"><i class="dot"></i>${pa.members.length+1} pessoas</span></div><div class="tiles" id="tiles">${tilesHtml()}</div>
  <div class="row"><button class="btn sec sm grow" data-a="mic">${I('mic')}${pa.mic?'Microfone ligado':'Microfone desligado'}</button><button class="btn sec sm grow" data-a="cam">${I('eye')}${pa.cam?'Câmara ligada':'Câmara desligada'}</button></div>
  <div class="row" style="justify-content:space-between">${['Golo','Uau','Palmas','Ai'].map(r=>`<button class="btn sec sm" data-a="react" data-v="${r}">${r}</button>`).join('')}</div><button class="btn ghost sm" data-a="endparty">Terminar</button></div>`}
 if(t==='chat')return `<div class="card col"><div class="msgs" id="msgs">${chatHtml()}</div><div class="inp"><input id="cin" placeholder="Escreve uma mensagem" data-enter="sendchat" aria-label="Mensagem"><button class="btn sm" data-a="sendchat" aria-label="Enviar">${I('send')}</button></div></div>`;
 if(t==='vote')return p.polls.map((po,pi)=>{const tot=po.v.reduce((a,b)=>a+b,0),key=g.id+pi,my=SF.st.voted[key];return `<div class="card col"><b>${E(po.q)}</b>${po.o.map((o,oi)=>{const lab=o===null?'Ninguém':(SF.TEAMS[o]?SF.TEAMS[o].n:o);const pc=Math.round(po.v[oi]/tot*100);return `<button class="opt ${my===oi+1?'on':''}" data-a="vote" data-p="${pi}" data-o="${oi}"><i style="width:${pc}%"></i><span class="row" style="justify-content:space-between"><b style="font-weight:600">${E(lab)}</b><b>${pc}%</b></span></button>`}).join('')}<span class="mut sm">${my?'Obrigado pelo teu voto.':'Vota e ganha 10 pontos.'}</span></div>`}).join('');
 if(t==='ar')return `<div class="card col"><div class="row"><span class="ic">${I('cube')}</span><span class="grow"><b>Realidade aumentada</b><div class="mut sm">Velocidade dos jogadores, trajetória da bola e zonas quentes por cima do jogo.</div></span><button class="sw ${p.ar?'on':''}" data-a="ar" role="switch" aria-checked="${p.ar}" aria-label="Ativar realidade aumentada"></button></div><div class="mut sm">Com a AR ligada, vês os dados em cima do campo, em direto.</div></div><div class="card"><b style="font-size:.95rem">Dados em direto</b><div style="margin-top:.7rem" id="stats">${statsHtml()}</div></div>`;
 if(t==='replay')return `<div class="card col"><div class="row"><span class="ic">${I('replay')}</span><span class="grow"><b>Replay inteligente</b><div class="mut sm">${MOMS(p).length} momentos-chave. Poupas cerca de ${p.sp==='futebol'?'85':'35'} minutos.</div></span></div><div class="tl" id="moms">${momsHtml()}</div><button class="btn" data-a="playall">${I('play')}Ver só os momentos-chave</button></div>`}
function renderTab(){const el=SF.$('#ptab');if(el)el.innerHTML=tabHtml();SF.$$('.ptabs button').forEach(b=>b.classList.toggle('on',b.dataset.v===P.p.tab));const m=SF.$('#msgs');if(m)m.scrollTop=m.scrollHeight}
/* screens */
SF.screens.jogo=id=>{const g=SF.game(id);if(!g){return '<div class="top"><h1>Jogo não encontrado</h1></div>'}
 const p=init(id),ac=SF.access(g);
 const tabs=[['live','Resumo','chart'],['party','Watch Party','users'],['chat','Chat','chat'],['vote','Votações','vote'],['ar','Realidade aumentada','cube'],['replay','Replay','replay']];
 return `<div class="top"><button class="btn sec sm" data-a="back" aria-label="Voltar" style="min-width:2.4rem;padding:.4rem .6rem">${I('back')}</button><div class="grow"><h1 style="font-size:1rem">${E(g.title)}</h1><small>${SF.COMPS[g.comp].n}</small></div><button class="coinpill" data-a="tab" data-v="carteira">${SF.coin}<span data-count="coins">${SF.st.coins}</span></button></div>
 <div class="pgrid"><div class="pstage"><div class="stage" id="stage"><canvas id="cv" aria-label="Campo de jogo em direto"></canvas><div class="banner">${p.live&&!p.over?`<span class="tag live"><i class="dot"></i>${p.sim?'SIMULAÇÃO':'AO VIVO'}</span>`:g.done?'<span class="tag">Replay</span>':'<span class="tag">Em breve</span>'}${p.ar?'<span class="tag">AR ligada</span>':''}</div><div class="sb" id="sb">${hud()}</div>
 ${ac?'':`<div class="lock">${I('lock')}<b style="font-size:1.1rem">Compra para ver</b><span class="mut sm">Pack Jogo por ${SF.cost('jogo',g.id)} Moedas Flex</span><button class="btn" data-a="game" data-v="${g.id}">${SF.coin}Escolher pack</button></div>`}</div>
 </div><div class="pside"><div class="ptabs" role="tablist">${tabs.map(t=>`<button role="tab" data-a="ptab" data-v="${t[0]}" class="${p.tab===t[0]?'on':''}">${t[1]}</button>`).join('')}</div><div class="col" id="ptab" style="gap:.7rem">${tabHtml()}</div></div></div>`};
SF.after.jogo=id=>{const p=P.p;if(!p||p.id!==id)return;sizeCanvas();P.stop();
 if(SF.access(p.g)&&!SF.st.watched.includes(id)){SF.st.watched.push(id);SF.st.points+=5;SF.save()}
 P.raf=requestAnimationFrame(frame);P.tick=setInterval(step,3000);window.onresize=sizeCanvas;const m=SF.$('#msgs');if(m)m.scrollTop=m.scrollHeight};
SF.act.sim=()=>{const p=P.p;if(!SF.access(p.g)){SF.openGame(p.g.id);return}p.live=true;p.sim=true;p.over=false;p.min=1;p.q=1;p.secs=600;p.hs=0;p.as=0;p.events=[];p.stats={pos:50,sh:[0,0],pa:[0,0],km:[1,1]};SF.toast('Simulação iniciada');SF.render()};
SF.act.ptab=el=>{P.p.tab=el.dataset.v;renderTab()};
SF.act.ar=()=>{P.p.ar=!P.p.ar;SF.render();SF.toast(P.p.ar?'Realidade aumentada ligada':'Realidade aumentada desligada')};
SF.act.vote=el=>{const p=P.p,key=p.g.id+el.dataset.p;if(SF.st.voted[key])return SF.toast('Já votaste nesta votação');p.polls[+el.dataset.p].v[+el.dataset.o]+=6;SF.st.voted[key]=+el.dataset.o+1;SF.st.points+=10;SF.save();SF.toast('Voto registado. +10 pontos');renderTab()};
SF.act.mom=el=>{const p=P.p,m=MOMS(p)[+el.dataset.v];p.rep={at:performance.now(),dur:3200,label:(m.m+(typeof m.m==='number'?"'":''))+' '+m.d};setMoms()};
SF.act.playall=()=>{const p=P.p,q=MOMS(p).slice();const f=q.shift();p.rep={at:performance.now(),dur:3200,label:(f.m+(typeof f.m==='number'?"'":''))+' '+f.d,queue:q.map(m=>({m:m.m,d:m.d}))};setMoms();SF.toast('A reproduzir os momentos-chave')};
SF.act.invite=el=>{const pa=P.p.party,id=el.dataset.v;
 if(!id){const free=SF.FRIENDS.find(f=>!pa.members.includes(f.id));if(!free)return;el.dataset.v=free.id;return SF.act.invite(el)}
 if(pa.members.includes(id))return;pa.members.push(id);SF.st.invites++;SF.st.points+=5;SF.save();const f=SF.FRIENDS.find(x=>x.id===id);
 SF.toast(pa.on?f.n+' entrou na Watch Party':'Convite enviado a '+f.n+'. +5 pontos');renderTab()};
SF.act.startparty=()=>{const pa=P.p.party;if(!pa.members.length)pa.members.push('ines');pa.on=true;SF.toast('Watch Party iniciada');renderTab()};
SF.act.endparty=()=>{P.p.party.on=false;renderTab()};
SF.act.mic=()=>{P.p.party.mic=!P.p.party.mic;renderTab()};SF.act.cam=()=>{P.p.party.cam=!P.p.party.cam;renderTab()};
SF.act.react=el=>{const st=SF.$('#stage');const s=document.createElement('span');s.className='rx';s.textContent={Golo:'⚽',Uau:'😮',Palmas:'👏',Ai:'😬'}[el.dataset.v];s.style.left=(10+Math.random()*80)+'%';st.appendChild(s);setTimeout(()=>s.remove(),2000)};
SF.act.sendchat=()=>{const i=SF.$('#cin');if(!i||!i.value.trim())return;P.p.chat.push({n:SF.st.name,t:i.value.trim(),me:true});i.value='';const m=SF.$('#msgs');m.innerHTML=chatHtml();m.scrollTop=m.scrollHeight;const f=pick(SF.FRIENDS);setTimeout(()=>{if(P.p)addChat(f.n,pick(BOT[f.id]))},1200)};
})();
