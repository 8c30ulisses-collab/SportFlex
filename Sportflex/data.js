// Instantâneo de dados reais recolhido a 5 nov 2026 de fontes públicas (calendário da Liga Portugal,
// jornada 11 de La Liga e jornada 4 da Champions League). Não se atualiza sozinho.
window.SF = window.SF || {};
SF.SNAPSHOT = '5 nov 2026';
const T=(n,s,c0,c1,sp)=>({n,s,c:[c0,c1],sp:sp||'futebol'});
SF.TEAMS = {
  ben:T('Benfica','SLB','#E30613','#6b0008'),spo:T('Sporting CP','SCP','#00924A','#03381f'),por:T('FC Porto','FCP','#1E5BC6','#0a2557'),bra:T('SC Braga','SCB','#D7263D','#5a0f1a'),
  fam:T('Famalicão','FAM','#2D6CC0','#0b2450'),aro:T('Arouca','ARO','#F2C300','#14307a'),nac:T('Nacional','NAC','#3a3a3a','#0f0f0f'),avi:T('Académico de Viseu','ACV','#4b4b4b','#101010'),
  alv:T('Alverca','ALV','#C0392B','#4a0a0a'),cpi:T('Casa Pia','CPI','#555','#111'),mor:T('Moreirense','MOR','#0B8A3E','#04301a'),est:T('Estoril','EST','#F2C300','#10316b'),
  mrt:T('Marítimo','MAR','#1f8f4a','#5a0f1a'),scl:T('Santa Clara','SCL','#D32F2F','#4a0f0f'),gil:T('Gil Vicente','GIL','#D32F2F','#14307a'),vsc:T('Vitória SC','VSC','#EDEDED','#222'),
  eam:T('Estrela da Amadora','EAM','#E02020','#0b5a2a'),rav:T('Rio Ave','RAV','#0B8A3E','#04301a'),
  rma:T('Real Madrid','RMA','#E9E9F2','#6b6f8f'),fcb:T('FC Barcelona','FCB','#A50044','#1c2a78'),atm:T('Atlético de Madrid','ATM','#CB3524','#1f2a5c'),
  rac:T('Racing Santander','RAC','#1a8a4a','#04301a'),ala:T('Alavés','ALA','#1a4fb0','#0a2050'),lev:T('Levante','LEV','#C8102E','#0a2a6a'),ath:T('Athletic Club','ATH','#EE2523','#4a0a0a'),
  rso:T('Real Sociedad','RSO','#1c5fb0','#0a2050'),sev:T('Sevilla','SEV','#F2F2F2','#C8102E'),vil:T('Villarreal','VIL','#F6DD00','#14307a'),
  bay:T('Bayern München','BAY','#DC052D','#4a0112'),int:T('Inter','INT','#0068A8','#05172b'),psg:T('Paris Saint-Germain','PSG','#004170','#0a1633'),
  mun:T('Manchester United','MUN','#DA291C','#3d0a06'),rom:T('AS Roma','ROM','#8E1F2F','#4a3a05'),avl:T('Aston Villa','AVL','#7B003C','#1b3a5a'),fey:T('Feyenoord','FEY','#E3000F','#4a0005'),
  sha:T('Shakhtar Donetsk','SHA','#F57C00','#222'),
  mci:T('Manchester City','MCI','#6CABDD','#1c3b63'),ars:T('Arsenal','ARS','#EF0107','#5e0003'),liv:T('Liverpool','LIV','#C8102E','#4a0612'),che:T('Chelsea','CHE','#034694','#021f45'),
  juv:T('Juventus','JUV','#F2F2F2','#2a2a2a'),mil:T('AC Milan','MIL','#FB090B','#1a1a1a'),bvb:T('Borussia Dortmund','BVB','#FDE100','#6b5a00')
};
// Clubes mostrados no onboarding
SF.TOP = ['ben','spo','por','bra','rma','fcb','atm','bay','psg','int','mun','mci','liv','ars'];
SF.SPORTS = { futebol:{n:'Futebol',price:12} };
SF.COMPS = {
  liga:{n:'Liga Portugal',sp:'futebol',price:15,desc:'34 jornadas'},
  ucl:{n:'UEFA Champions League',sp:'futebol',price:18,desc:'Fase de liga e eliminatórias'},
  lali:{n:'La Liga',sp:'futebol',price:15,desc:'38 jornadas'},
  prem:{n:'Premier League',sp:'futebol',price:15,desc:'38 jornadas'},
  seri:{n:'Serie A',sp:'futebol',price:12,desc:'38 jornadas'},
  bund:{n:'Bundesliga',sp:'futebol',price:12,desc:'34 jornadas'},
  lig1:{n:'Ligue 1',sp:'futebol',price:10,desc:'34 jornadas'}
};
// at = data e hora de Lisboa (em novembro, UTC+0). lbl = etiqueta para jogos já realizados.
const G=(id,comp,h,a,at,price,o)=>Object.assign({id,sp:'futebol',comp,h,a,at,price,title:SF.TEAMS[h].n+' vs '+SF.TEAMS[a].n},o||{});
const R=(id,comp,h,a,hs,as,lbl,ord)=>({id,sp:'futebol',comp,h,a,done:true,hs,as,price:1,lbl,ord,title:SF.TEAMS[h].n+' vs '+SF.TEAMS[a].n});
SF.GAMES = [
  G('l1','liga','fam','aro','2026-11-06T20:45',2),G('l2','liga','nac','avi','2026-11-07T15:30',2),G('l3','liga','alv','cpi','2026-11-07T18:00',2),
  G('l4','liga','spo','mor','2026-11-07T20:30',2),G('l5','liga','est','mrt','2026-11-08T15:30',2),G('l6','liga','scl','gil','2026-11-08T15:30',2),
  G('l7','liga','vsc','por','2026-11-08T18:00',2),G('l8','liga','eam','ben','2026-11-08T20:30',2),G('l9','liga','rav','bra','2026-11-08T20:30',2),
  G('l10','liga','por','spo','2026-11-29T20:30',3,{big:true}),G('l11','liga','ben','fam','2026-11-30T20:15',2),
  G('s1','lali','sev','ala','2026-11-06T20:00',2),
  R('u1','ucl','fcb','avl',3,0,'Champions League · 4 nov',9),R('u2','ucl','atm','bay',0,2,'Champions League · 4 nov',8),R('u3','ucl','vil','psg',0,6,'Champions League · 4 nov',7),
  R('u4','ucl','sha','spo',0,1,'Champions League · 4 nov',6),R('u5','ucl','fey','int',0,3,'Champions League · 4 nov',5),R('u6','ucl','mun','rom',3,2,'Champions League · 4 nov',4),
  R('d1','lali','rac','rma',0,3,'La Liga · jornada 11',3),R('d2','lali','fcb','ala',6,1,'La Liga · jornada 11',2),R('d3','lali','lev','atm',0,2,'La Liga · jornada 11',1),R('d4','lali','ath','rso',2,1,'La Liga · jornada 11',0)
];
SF.GAMES.forEach(g=>{g.min=g.at?Math.round((Date.UTC(+g.at.slice(0,4),+g.at.slice(5,7)-1,+g.at.slice(8,10),+g.at.slice(11,13),+g.at.slice(14,16))-Date.now())/60000):-1000-g.ord*60});
SF.GAMES.sort((a,b)=>a.done===b.done?(a.done?b.min-a.min:a.min-b.min):(a.done?1:-1));
// Momentos ilustrativos derivados do resultado final (os minutos reais não fazem parte dos dados recolhidos).
SF.moments=g=>{if(!g.done)return [];const T=SF.TEAMS,out=[];let n=0;const L=[];for(let i=0;i<g.hs;i++)L.push(g.h);for(let i=0;i<g.as;i++)L.push(g.a);
  L.sort((x,y)=>((x+g.id).length*7)%5-((y+g.id).length*7)%5);L.forEach(t=>{n++;out.push({m:'Golo '+n,t:T[t].s,d:'do '+T[t].n})});
  return out.length?out:[{m:'Resumo',t:'0-0',d:'Jogo sem golos'}]};
SF.FRIENDS = [
  {id:'ines',n:'Inês',c:['#8E5BFF','#3b1a78']},
  {id:'rui',n:'Rui',c:['#F4522D','#7a1d0b']},
  {id:'miguel',n:'Miguel',c:['#1CA3A3','#0b4a4a']},
  {id:'carla',n:'Carla',c:['#F5B942','#7a4b00']}
];
SF.RANKING = [
  {n:'Carla',p:1240},{n:'Miguel',p:980},{n:'Inês',p:870},{n:'Rui',p:610},{n:'Tiago',p:430},{n:'Beatriz',p:260}
];
SF.PRIZES = [
  {id:'p1',n:'Desconto de 20% no próximo pack',pts:150,kind:'disc'},
  {id:'p2',n:'5 Moedas Flex',pts:200,kind:'coins',v:5},
  {id:'p3',n:'Camisola oficial (sorteio)',pts:500,kind:'draw'},
  {id:'p4',n:'Bilhete duplo para um jogo',pts:1000,kind:'draw'}
];
SF.BUNDLES = [
  {c:10,eur:'4,99 €',b:0},{c:25,eur:'9,99 €',b:5,pop:true},{c:60,eur:'19,99 €',b:20}
];
SF.ACCENTS = ['#F4522D','#3D8BFF','#2FBF71','#8E5BFF','#F5B942'];

// Emblemas oficiais (opcional). Quando houver autorização de um clube, junta o ficheiro à pasta crests/
// e indica aqui o caminho, por exemplo: ben:'crests/ben.png'. Sem entrada, a app usa o escudo genérico.
SF.CRESTS = {};
