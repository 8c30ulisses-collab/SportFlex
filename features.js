/* Novas funcionalidades: modo sem spoilers, filtros do calendário, lembretes, comparador de packs e "Os meus jogos". */
(function(){
const SF=window.SF,E=SF.esc,I=SF.icon;
const p2=n=>String(n).padStart(2,'0');
const MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
/* estado novo (guardas para dados guardados por versões anteriores) */
const ensure=()=>{const s=SF.st;if(!s.reveal)s.reveal={};if(!s.rem)s.rem={};if(!s.remMin)s.remMin=15;if(s.nospoil===undefined)s.nospoil=false};
ensure();
const up=()=>SF.GAMES.filter(g=>!g.done);
const pl=(n,a,b)=>n+' '+(n===1?a:b);

/* ---------- Modo sem spoilers ---------- */
SF.hidden=g=>!!(SF.st.nospoil&&g.done&&!(SF.st.reveal&&SF.st.reveal[g.id]));
SF.score=g=>SF.hidden(g)?'? - ?':g.hs+' - '+g.as;
SF.act.reveal=el=>{ensure();SF.st.reveal[el.dataset.v]=true;SF.save();SF.toast('Resultado revelado');
 if(SF.sheetOpen&&SF._curGame)SF.openGame(SF._curGame);SF.render()};
SF.act.nospoil=()=>{ensure();SF.st.nospoil=!SF.st.nospoil;SF.save();SF.render();
 SF.toast(SF.st.nospoil?'Modo sem spoilers ligado. Resultados e momentos ficam ocultos':'Modo sem spoilers desligado')};

/* ---------- Filtros do calendário ---------- */
SF._f={p:'all',d:'',clubs:false,packs:false};
const dayIdx=l=>Date.UTC(l.y,l.m-1,l.d)/864e5;
const iso=l=>l.y+'-'+p2(l.m)+'-'+p2(l.d);
SF.fActive=()=>{const f=SF._f;return f.p!=='all'||!!f.d||f.clubs||f.packs};
SF.calFilter=g=>{const f=SF._f;if(!SF.fActive())return true;
 const l=SF.lx(SF.ts(g)),n=SF.lx(Date.now());
 if(f.d||f.p!=='all'){if(g.done)return false}
 if(f.d){if(iso(l)!==f.d)return false}
 else if(f.p!=='all'){const diff=dayIdx(l)-dayIdx(n);if(f.p==='hoje'&&diff!==0)return false;if(f.p==='semana'&&(diff<0||diff>(7-n.wd)%7))return false}
 if(f.clubs&&!(SF.st.favs.includes(g.h)||SF.st.favs.includes(g.a)))return false;
 if(f.packs&&!SF.access(g))return false;
 return true};
const fdate=d=>{const m=d.split('-');return (+m[2])+' '+MES[+m[1]-1]};
SF.calBar=()=>{const f=SF._f,u=up();const mn=iso(SF.lx(Date.now())),mx=u.length?iso(SF.lx(Math.max(...u.map(SF.ts)))):mn;
 const per=[['all','Todos'],['hoje','Hoje'],['semana','Esta semana']];
 return `<div class="fbar" role="group" aria-label="Filtros do calendário">
  <div class="chips">${per.map(x=>`<button class="chip ${!f.d&&f.p===x[0]?'on':''}" data-a="fper" data-v="${x[0]}" aria-pressed="${!f.d&&f.p===x[0]}">${x[1]}</button>`).join('')}
  <label class="chip dchip ${f.d?'on':''}">${I('clock')}<span>${f.d?fdate(f.d):'Escolher data'}</span><input type="date" id="fdate" value="${f.d}" min="${mn}" max="${mx}" aria-label="Escolher uma data"></label></div>
  <div class="chips"><button class="chip ${f.clubs?'on':''}" data-a="ftog" data-v="clubs" aria-pressed="${f.clubs}">${I('shield')}Os meus clubes</button><button class="chip ${f.packs?'on':''}" data-a="ftog" data-v="packs" aria-pressed="${f.packs}">${I('check')}Incluído nos meus packs</button>${SF.fActive()?`<button class="chip" data-a="fclear" style="border-style:dashed">${I('close')}Limpar</button>`:''}</div></div>`};
SF.calEmpty=()=>{const f=SF._f,s=SF.st;let msg='Nenhum jogo com estes filtros.',btn='';
 if(f.clubs&&!s.favs.length){msg='Ainda não escolheste clubes, por isso não há jogos dos teus clubes.';btn=`<button class="btn sm" data-a="tab" data-v="perfil">Escolher clubes em Perfil</button>`}
 else if(f.packs&&!s.packs.length&&!s.games.length){msg='Ainda não tens packs, por isso nenhum jogo está incluído.';btn=`<button class="btn sm" data-a="tab" data-v="comparar">${I('spark')}Comparar packs</button>`}
  if(f.p==='hoje'&&!f.d){msg='Hoje não há jogos no calendário desta demonstração.';btn=`<button class="btn sm" data-a="fper" data-v="semana">Ver esta semana</button>`}
 return `<div class="card col" style="text-align:center;align-items:center" role="status"><span class="mut">${msg}</span>${btn}<button class="btn sm sec" data-a="fclear">Limpar filtros</button></div>`};
SF.act.fper=el=>{SF._f.p=el.dataset.v;SF._f.d='';SF.render()};
SF.act.ftog=el=>{SF._f[el.dataset.v]=!SF._f[el.dataset.v];SF.render()};
SF.act.fclear=()=>{SF._f={p:'all',d:'',clubs:false,packs:false};SF.render()};
document.addEventListener('change',e=>{if(e.target&&e.target.id==='fdate'){SF._f.d=e.target.value||'';if(SF._f.d)SF._f.p='all';SF.render()}});

/* ---------- Lembretes ---------- */
const ADV=[5,15,30,60,1440];
SF.remLabel=m=>m>=1440?'1 dia antes':m===60?'1 hora antes':m+' minutos antes';
const dl=ts=>{const l=SF.lx(ts),n=SF.lx(Date.now()),t=SF.lx(Date.now()+864e5),hh=p2(l.hh)+':'+p2(l.mm);
 const D=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
 return (l.key===n.key?'hoje':l.key===t.key?'amanhã':D[l.wd]+' '+l.d+'/'+p2(l.m))+' às '+hh};
const z=t=>new Date(t).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
SF.ics=(g,m)=>{const st=SF.ts(g),T=g.title+' ('+SF.COMPS[g.comp].n+')';
 const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SportFlex//Demo//PT','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+g.id+'-'+Math.round(st/1000)+'@sportflex.demo','DTSTAMP:'+z(Date.now()),'DTSTART:'+z(st),'DTEND:'+z(st+120*60000),
  'SUMMARY:'+T,'DESCRIPTION:Lembrete SportFlex (demonstração). Horas de Lisboa.','BEGIN:VALARM','TRIGGER:-PT'+m+'M','ACTION:DISPLAY','DESCRIPTION:'+T+' começa em breve','END:VALARM','END:VEVENT','END:VCALENDAR'];
 try{const b=new Blob([L.join('\r\n')],{type:'text/calendar'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='sportflex-'+g.id+'.ics';document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href)},500);return true}catch(e){return false}};
SF.act.notify=el=>{ensure();const g=SF.game(el.dataset.v),cur=SF.st.rem[g.id];SF._rem={g:g.id,m:cur?cur.m:SF.st.remMin||15,cal:false};SF.remView()};
SF.remView=()=>{const R=SF._rem,g=SF.game(R.g),left=(SF.ts(g)-Date.now())/60000,cur=SF.st.rem[g.id];
 const ok=ADV.filter(m=>m<=left);if(ok.length&&!ok.includes(R.m))R.m=ok[ok.length-1];
 const when=ok.length?dl(SF.ts(g)-R.m*60000):'';
 SF.sheet(`<h3>Lembrar-me deste jogo</h3><div class="mut" style="margin-top:-.5rem">${E(g.title)} · ${SF.when(g)} (horas de Lisboa)</div>
 <div class="mut sm">Quanto tempo antes queres o aviso?</div>
 <div class="chips" role="radiogroup" aria-label="Antecedência do aviso">${ADV.map(m=>`<button class="chip ${R.m===m&&m<=left?'on':''}" role="radio" aria-checked="${R.m===m&&m<=left}" data-a="remsel" data-v="${m}" ${m>left?'disabled style="opacity:.4"':''}>${m>=1440?'1 dia':m===60?'1 hora':m+' min'}</button>`).join('')}</div>
 ${ok.length?`<div class="card" role="status" style="border-color:var(--accent)"><b>Avisaremos ${SF.remLabel(R.m)}</b><div class="mut sm" style="margin-top:.2rem">${when} (o jogo começa às ${SF.hm(g)}, hora de Lisboa).</div></div>`:`<div class="card mut" role="status">O jogo começa daqui a menos de 5 minutos, já não dá para marcar um aviso. Podes abrir o jogo agora.</div>`}
 <div class="li"><span class="grow"><b style="font-weight:600">Adicionar ao calendário</b><div class="mut sm">Descarrega um ficheiro .ics com o jogo e o alarme. Funciona no Google Calendar, Apple Calendar e Outlook.</div></span><button class="sw ${R.cal?'on':''}" data-a="remcal" role="switch" aria-checked="${R.cal}" aria-label="Adicionar ao calendário"></button></div>
 <div class="mut sm">Demonstração: o aviso da app é simulado (não há servidor de notificações). O alarme do ficheiro de calendário é real.</div>
 ${ok.length?`<button class="btn" data-a="remok">${I('bell')}Guardar lembrete</button>`:''}${cur?`<button class="btn sec" data-a="remdel">Remover lembrete (${SF.remLabel(cur.m)})</button>`:''}<button class="btn ghost" data-a="pcancel">${ok.length?'Cancelar':'Fechar'}</button>`)};
SF.act.remsel=el=>{SF._rem.m=+el.dataset.v;SF.remView()};
SF.act.remcal=()=>{SF._rem.cal=!SF._rem.cal;SF.remView()};
SF.act.remok=()=>{const R=SF._rem,g=SF.game(R.g);SF.st.rem[g.id]={m:R.m};SF.st.fun.n=(SF.st.fun.n||0)+1;SF.save();
 let extra='';if(R.cal)extra=SF.ics(g,R.m)?' Ficheiro de calendário descarregado.':'';
 if(SF._curGame)SF.openGame(SF._curGame);else SF.close();SF.render();
 SF.toast('Lembrete guardado. Avisaremos '+SF.remLabel(R.m)+' ('+dl(SF.ts(g)-R.m*60000)+').'+extra)};
SF.act.remdel=()=>{const R=SF._rem;delete SF.st.rem[R.g];SF.save();if(SF._curGame)SF.openGame(SF._curGame);else SF.close();SF.render();SF.toast('Lembrete removido')};
SF.act.remmin=el=>{SF.st.remMin=+el.dataset.v;SF.save();SF.render();SF.toast('Aviso predefinido: '+SF.remLabel(SF.st.remMin))};

/* ---------- Comparador de packs ---------- */
SF._cmp=new Set();
const KIC={jogo:'play',clube:'shield',comp:'trophy',mod:'ball'};
/* combinação mais barata que cobre os jogos escolhidos (programação dinâmica sobre máscaras de bits) */
SF.cmpCalc=ids=>{
 const games=[...new Set(ids)].map(SF.game).filter(g=>g&&!g.done&&!SF.access(g)).slice(0,16),n=games.length;if(!n)return null;
 const P=[];games.forEach((g,i)=>P.push({k:'jogo',id:g.id,mask:1<<i,cost:SF.packPrice('jogo',g.id)}));
 const add=(k,id,f)=>{let m=0;games.forEach((g,i)=>{if(f(g))m|=1<<i});if(m&&!SF.has(k,id))P.push({k,id,mask:m,cost:SF.packPrice(k,id)})};
 new Set(games.flatMap(g=>[g.h,g.a])).forEach(t=>add('clube',t,g=>g.h===t||g.a===t));
 new Set(games.map(g=>g.comp)).forEach(c=>add('comp',c,g=>g.comp===c));
 new Set(games.map(g=>g.sp)).forEach(s=>add('mod',s,g=>g.sp===s));
 const full=(1<<n)-1,dp=new Array(full+1).fill(Infinity),ct=new Array(full+1).fill(0),from=[];dp[0]=0;
 for(let m=0;m<=full;m++){if(dp[m]===Infinity)continue;for(let i=0;i<P.length;i++){const nm=m|P[i].mask;if(nm===m)continue;const c=dp[m]+P[i].cost,k=ct[m]+1;if(c<dp[nm]||(c===dp[nm]&&k<ct[nm])){dp[nm]=c;ct[nm]=k;from[nm]=[m,i]}}}
 const picked=[];let m=full;while(m){const f=from[m];picked.push(P[f[1]]);m=f[0]}
 const items=picked.map(p=>{const cov=games.filter((g,i)=>(p.mask>>i)&1);return Object.assign({},p,{games:cov,solo:cov.reduce((a,g)=>a+g.price,0)})});
 const singles=games.reduce((a,g)=>a+g.price,0),mod=SF.SPORTS.futebol.price,modOwn=SF.has('mod','futebol');
 return {games,items,total:dp[full],singles,mod:modOwn?null:mod,n}};
/* custo real da compra: o desconto de 20% (se existir) aplica-se ao pack mais caro, que é comprado primeiro */
const order=items=>items.slice().sort((a,b)=>b.cost-a.cost);
SF.cmpPay=items=>order(items).reduce((a,it,i)=>a+(i===0&&SF.st.disc?Math.max(1,Math.round(it.cost*.8)):it.cost),0);
const names=gs=>gs.length<=2?gs.map(g=>g.title).join(' e '):gs.slice(0,2).map(g=>g.title).join(', ')+' e mais '+(gs.length-2);
const itemWhy=(it,n)=>{if(it.k==='jogo')return 'Só este jogo.';
 const nm=SF.packName(it.k,it.id),sc=it.k==='clube'?'todos os jogos do '+nm:it.k==='comp'?'todos os jogos da '+nm:'todos os jogos de futebol da app';
 return 'Cobre '+pl(it.games.length,'jogo','jogos')+' dos teus '+n+' ('+names(it.games)+'), que custariam '+it.solo+' em packs de jogo. Inclui ainda '+sc+' até '+SF.SEASON.fim+'.'};
const cmpDetail=r=>{if(!r)return `<div class="card col" id="cmpdet" style="text-align:center;align-items:center"><span class="ic">${I('spark')}</span><b>Escolhe os jogos que queres ver</b><span class="mut sm">A app calcula a combinação de packs mais barata e explica a poupança.</span></div>`;
 const pay=SF.cmpPay(r.items),save=r.singles-r.total,pc=r.singles?Math.round(save/r.singles*100):0;
 const rows=[['Um pack por jogo',r.singles],['Melhor combinação',r.total]];if(r.mod!==null&&r.games.some(g=>g.sp==='futebol'))rows.push(['Pack Futebol (todas as competições)',r.mod]);
 const best=Math.min(...rows.map(x=>x[1]));
 return `<div class="card col cmpdet" id="cmpdet"><div class="row"><b class="grow" style="font-size:1.05rem">Melhor combinação</b><span class="tag ok">Mais económico</span></div>
  <div class="row" style="gap:.5rem;align-items:baseline"><span class="coin" style="width:1.5rem;height:1.5rem"></span><span class="big" style="font-size:2.6rem" data-cmp="total">${pay}</span><span class="mut">Moedas Flex para ${pl(r.n,'jogo','jogos')}</span></div>
  <div class="sm" role="status" style="color:${save>0?'var(--ok)':'var(--mut)'}">${save>0?`Poupas ${save} ${save===1?'moeda':'moedas'} (${pc}%) face a comprar um pack por jogo (${r.singles}).`:'Para estes jogos, um pack por jogo já é a opção mais barata.'}${SF.st.disc?' Com o desconto de 20% pagas menos no pack mais caro.':''}</div>
  <div class="list">${order(r.items).map(it=>`<div class="li" style="align-items:flex-start"><span class="ic">${I(KIC[it.k])}</span><span class="grow"><b style="font-weight:600">${SF.packLabel[it.k]}</b><div>${E(SF.packName(it.k,it.id))}</div><div class="mut sm" style="margin-top:.2rem">${E(itemWhy(it,r.n))}</div></span><span class="price">${SF.coin}${it.cost}</span></div>`).join('')}</div>
  <div class="mut sm">Comparação</div><div class="col" style="gap:.35rem">${rows.map(x=>`<div class="row sm" style="justify-content:space-between"><span class="${x[1]===best?'':'mut'}">${x[1]===best?I('check')+' ':''}${x[0]}</span><b>${x[1]}</b></div>`).join('')}</div>
  <div class="mut sm">Os packs de clube, competição e modalidade incluem também os restantes jogos até ${SF.SEASON.fim}, e todos os packs incluem replays durante ${SF.SEASON.replay} dias. Preços ilustrativos desta demonstração.</div>
  <button class="btn" data-a="cmpbuy">${SF.coin}Comprar esta combinação · ${pay} Flex</button></div>`};
SF.screens.comparar=()=>{const s=SF.st,sel=SF._cmp,all=up();
 const r=SF.cmpCalc([...sel]),pay=r?SF.cmpPay(r.items):0;
 const list=all.map(g=>{const own=SF.access(g),on=sel.has(g.id)&&!own;return `<button class="g cmp ${on?'on':''}" data-a="cmptog" data-v="${g.id}" role="checkbox" aria-checked="${on}" ${own?'disabled':''}><span class="chk" aria-hidden="true">${on?I('check'):''}</span><span class="pair">${SF.crest(g.h,'xs')}${SF.crest(g.a,'xs')}</span><span class="tt"><b>${E(g.title)}</b><span>${SF.when(g)} · ${E(SF.COMPS[g.comp].n)}</span></span>${own?`<span class="price own">${I('check')}Tens</span>`:`<span class="price">${SF.coin}${g.price}</span>`}</button>`}).join('');
 return `<div class="top"><button class="btn sec sm" data-a="back" aria-label="Voltar" style="min-width:2.4rem;padding:.4rem .6rem">${I('back')}</button><h1 class="grow">Comparador de packs<small>Paga só pelo que queres ver</small></h1><button class="coinpill" data-a="tab" data-v="carteira" aria-label="Carteira Flex">${SF.coin}<span data-count="coins">${s.coins}</span></button></div>
 <div class="col two" style="gap:1rem"><div class="cA"><div class="card" style="order:1"><b>Escolhe os jogos</b><div class="mut sm" style="margin-top:.2rem">Marca os jogos que queres ver. A SportFlex calcula a combinação de packs mais barata e explica a poupança.</div></div>
 <div class="chips" style="order:2"><button class="chip" data-a="cmpall">Todos os próximos</button>${s.favs.length?`<button class="chip" data-a="cmpclubs">${I('shield')}Os dos meus clubes</button>`:''}<button class="chip" data-a="cmpclear" style="border-style:dashed">Limpar</button></div>
 <div class="col" style="gap:.6rem;order:4" role="group" aria-label="Jogos">${list}</div></div>
 <div class="cB"><div class="cmpwrap" style="order:3">${cmpDetail(r)}</div></div>
 ${r?`<div class="cmpsum" role="status"><span class="grow"><b>${pl(r.n,'jogo','jogos')} · ${pay} moedas</b><div class="mut sm">${r.singles-r.total>0?'Poupas '+(r.singles-r.total)+' face a um pack por jogo':'Um pack por jogo é o mais barato'}</div></span><button class="btn sm" data-a="cmpgo">Ver combinação</button></div>`:''}</div>`};
SF.act.cmptog=el=>{const id=el.dataset.v;SF._cmp.has(id)?SF._cmp.delete(id):SF._cmp.add(id);SF.render()};
SF.act.cmpall=()=>{up().filter(g=>!SF.access(g)).forEach(g=>SF._cmp.add(g.id));SF.render()};
SF.act.cmpclubs=()=>{up().filter(g=>!SF.access(g)&&(SF.st.favs.includes(g.h)||SF.st.favs.includes(g.a))).forEach(g=>SF._cmp.add(g.id));SF.render();if(!SF._cmp.size)SF.toast('Não há jogos dos teus clubes no calendário')};
SF.act.cmpclear=()=>{SF._cmp.clear();SF.render()};
SF.act.cmpgo=()=>{const d=SF.$('#cmpdet');if(d)d.scrollIntoView({behavior:SF.reduced()?'auto':'smooth',block:'start'})};
SF.act.cmpbuy=()=>{const r=SF.cmpCalc([...SF._cmp]);if(!r)return;const pay=SF.cmpPay(r.items),s=SF.st;
 SF.sheet(`<h3>Confirmar combinação</h3><div class="mut" style="margin-top:-.5rem">${pl(r.items.length,'pack','packs')} para ${pl(r.n,'jogo','jogos')}</div>
 <div class="card pinfo">${order(r.items).map(it=>`<div class="pi"><b>${SF.packLabel[it.k]}</b><span>${E(SF.packName(it.k,it.id))} · ${it.cost} moedas</span></div>`).join('')}</div>
 <div class="mut sm">Condições ilustrativas desta demonstração. Nada é cobrado.</div>
 <div class="row" style="justify-content:space-between"><span class="mut">Saldo: ${s.coins} moedas</span><b class="row" style="gap:.3rem">${SF.coin}${pay} Flex${s.disc?' <span class="tag ok" style="margin-left:.3rem">-20%</span>':''}</b></div>
 <button class="btn" data-a="cmpok">${pay>s.coins?'Comprar moedas':'Confirmar por '+pay+' moedas'}</button><button class="btn ghost" data-a="close">Cancelar</button>`)};
SF.act.cmpok=()=>{const r=SF.cmpCalc([...SF._cmp]);if(!r){SF.close();return}const pay=SF.cmpPay(r.items),s=SF.st;
 if(pay>s.coins){SF.close();SF.topup(pay-s.coins);return}
 let n=0;order(r.items).forEach(it=>{if(SF.buy(it.k,it.id))n++});SF._cmp.clear();SF.close();SF.render();SF.toast('Combinação ativada: '+pl(n,'pack','packs')+' por '+pay+' moedas')};

/* ---------- Os meus jogos ---------- */
SF.validShort=(k,id)=>k==='jogo'?'Replay durante '+SF.SEASON.replay+' dias após o jogo':'Válido até '+SF.SEASON.fim;
const incl=(k,id)=>up().filter(g=>k==='jogo'?g.id===id:k==='clube'?(g.h===id||g.a===id):k==='comp'?g.comp===id:g.sp===id).length;
SF.screens.jogos=()=>{const s=SF.st,a=SF.myAccess(),done=SF.GAMES.filter(g=>g.done&&SF.access(g));
 const row=g=>{const rm=s.rem[g.id];return `<div class="mj"><button class="mjm" data-a="game" data-v="${g.id}"><span class="pair">${SF.crest(g.h,'xs')}${SF.crest(g.a,'xs')}</span><span class="tt"><b>${E(g.title)}</b><span>${SF.when(g)} · ${E(SF.COMPS[g.comp].n)}</span>${rm?`<span class="tag" style="background:var(--bg3);width:fit-content;margin-top:.2rem">${I('bell')}Lembrete ${rm.m>=1440?'1 dia':rm.m===60?'1 h':rm.m+' min'} antes</span>`:''}</span></button><button class="btn sm" data-a="watch" data-v="${g.id}" aria-label="Ver ${E(g.title)}">${I('play')}${g.live?'Ver ao vivo':'Ver'}</button></div>`};
 const rrow=g=>`<div class="mj"><button class="mjm" data-a="game" data-v="${g.id}"><span class="pair">${SF.crest(g.h,'xs')}${SF.crest(g.a,'xs')}</span><span class="tt"><b>${E(g.title)}</b><span>${E(g.lbl)} · ${SF.hidden(g)?'resultado oculto':SF.score(g)}</span></span></button><button class="btn sm" data-a="watch" data-v="${g.id}" aria-label="Ver replay de ${E(g.title)}">${I('replay')}Replay</button></div>`;
 const packs=a.owned.map(o=>{const n=incl(o.k,o.i);return `<div class="card" style="padding:.8rem 1rem"><div class="row"><span class="ic">${I(KIC[o.k])}</span><span class="grow"><b style="font-weight:600">${E(SF.packName(o.k,o.i))}</b><div class="mut sm">${SF.packLabel[o.k]} · ${SF.validShort(o.k,o.i)}</div></span></div><div class="mut sm" style="margin-top:.5rem">${o.k==='jogo'?(SF.game(o.i).done?'Replay disponível':'Jogo por ver'):pl(n,'jogo por ver','jogos por ver')+' na app'}</div></div>`}).join('');
 return `<div class="top"><button class="btn sec sm" data-a="back" aria-label="Voltar" style="min-width:2.4rem;padding:.4rem .6rem">${I('back')}</button><h1 class="grow">Os meus jogos<small>${SF.DATA_LBL} · horas de Lisboa</small></h1><button class="coinpill" data-a="tab" data-v="carteira" aria-label="Carteira Flex">${SF.coin}<span data-count="coins">${s.coins}</span></button></div>
 ${a.owned.length?`<div class="col two" style="gap:1rem"><div class="cA"><div style="order:1"><div class="h2" style="margin-top:0"><h2>Próximos jogos incluídos</h2></div><div class="col" style="gap:.6rem;margin-top:.6rem">${a.games.length?a.games.map(row).join(''):'<div class="card mut sm">Os teus packs ainda não têm jogos marcados.</div>'}</div></div>
 <div style="order:3"><div class="h2" style="margin-top:0"><h2>Replays disponíveis</h2></div><div class="mut sm">Replay durante ${SF.SEASON.replay} dias após cada jogo.${s.nospoil?' Modo sem spoilers ligado.':''}</div><div class="col" style="gap:.6rem;margin-top:.6rem">${done.length?done.map(rrow).join(''):'<div class="card mut sm">Ainda não tens replays. Os packs que cobrem jogos já realizados aparecem aqui.</div>'}</div></div></div>
 <div class="cB"><div style="order:2"><div class="h2" style="margin-top:0"><h2>Os meus packs</h2></div><div class="col" style="gap:.6rem;margin-top:.6rem">${packs}</div></div>
 <div class="row" style="order:4;gap:.6rem;flex-wrap:wrap"><button class="btn sec grow" data-a="tab" data-v="comparar">${I('spark')}Comparar packs</button><button class="btn sec grow" data-a="tab" data-v="explorar">${I('search')}Explorar</button></div></div></div>`
 :`<div class="col" style="gap:1rem"><div class="card col" style="align-items:center;text-align:center"><span class="ic">${I('ball')}</span><b>Ainda não tens jogos</b><span class="mut sm">Um jogo custa 1 a 3 moedas e o replay fica disponível durante ${SF.SEASON.replay} dias. Compara as opções para pagar só pelo que queres ver.</span><button class="btn" data-a="tab" data-v="comparar">${I('spark')}Comparar packs</button><button class="btn sec" data-a="tab" data-v="explorar">${I('search')}Explorar jogos</button></div></div>`}`};
})();
