/* Assistente SportFlex — 100% no navegador.
   Não faz pedidos a servidores nem a APIs de IA: percebe a pergunta com regras (texto normalizado, abreviaturas,
   alcunhas dos clubes, pequenos erros de escrita), consulta os dados da própria app (jogos, preços, saldo, spoilers)
   e lembra-se do clube/jogo/pack de que se falou.

   Para acrescentar uma pergunta nova, vai à secção "3. PERGUNTAS E RESPOSTAS" e junta uma linha ao FAQ (há um exemplo lá). */
(function(){
const SF=window.SF;

/* ================= 1. CONFIGURAÇÃO ================= */
// Resposta usada quando o assistente não sabe (altera aqui, é o único sítio).
const FALLBACK='Nao te sei responder a isso, mas talvez o criador da app saiba xd';
// Resposta fixa à pergunta "quem te criou?".
const CREATOR='O criador da app é das melhores pessoas que conheço e bem gatao';

/* ================= 2. FERRAMENTAS ================= */
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/['\u2019`\u00b4]/g,'').replace(/[^a-z0-9\s\/]/g,' ').replace(/\s+/g,' ').trim();
const p2=n=>String(n).padStart(2,'0');
const pl=(n,a,b)=>n+' '+(n===1?a:b);
const moedas=n=>pl(n,'moeda','moedas');
const join=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' e '+a[a.length-1];
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const DIAS=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const MESES=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const P=(k,id)=>SF.packPrice(k,id);
const upcoming=()=>SF.GAMES.filter(g=>!g.done);
const finished=()=>SF.GAMES.filter(g=>g.done);
const TN=id=>SF.TEAMS[id].n;
const compName=g=>SF.COMPS[g.comp].n;
const nowKey=off=>SF.lx(Date.now()+(off||0)*864e5);
const gameDay=g=>SF.lx(SF.ts(g));
const dayTxt=g=>{const l=gameDay(g);if(l.key===nowKey(0).key)return 'hoje';if(l.key===nowKey(1).key)return 'amanhã';return DIAS[l.wd]+', '+l.d+'/'+p2(l.m)};
const atTxt=g=>dayTxt(g)+' às '+SF.hm(g);
const whenShort=g=>SF.when(g).toLowerCase();
const rs=g=>g.hs+'-'+g.as;
const discNote=()=>SF.st.disc?' (já com o teu desconto de 20%)':'';

/* abreviaturas e escrita à pressa → palavra normal */
const ABBR={qnd:'quando',qd:'quando',quand:'quando',quado:'quando',q:'que',k:'que',ke:'que',pq:'porque',pk:'porque',xq:'porque',tb:'tambem',tbm:'tambem',vc:'voce',vcs:'voces',hj:'hoje',amnh:'amanha',amanhan:'amanha',
 mt:'muito',mto:'muito',msm:'mesmo',jgo:'jogo',jg:'jogo',jgs:'jogos',jogs:'jogos',pf:'favor',pfv:'favor',plf:'favor',obg:'obrigado',obgd:'obrigado',obrigada:'obrigado',blz:'beleza',cmo:'como',cm:'como',
 qto:'quanto',qtos:'quantos',qtas:'quantas',qta:'quanta',oq:'o que',oque:'o que',n:'nao',nn:'nao',ñ:'nao',pra:'para',pro:'para o',tou:'estou',ta:'esta',tas:'estas',moedinhas:'moedas',moedinha:'moeda',
 euros:'euros',fds:'fim de semana',sdds:'saudades',vlw:'valeu',td:'tudo',tds:'todos',dps:'depois',d:'de',dq:'de que',e:'e',pa:'para',prx:'proximo',prox:'proximo',proxima:'proximo',proximos:'proximo',
 ultimos:'ultimo',ultima:'ultimo',ultimas:'ultimo',joguinho:'jogo',partida:'jogo',partidas:'jogos',match:'jogo',matches:'jogos',jogam:'joga',jogaram:'jogou',
 jogara:'joga',jogue:'joga',playlist:'playlist',equipas:'equipa',times:'equipa',time:'equipa',clubes:'clube',clubs:'clube',packs:'pack',pacotes:'pack',pacote:'pack',paks:'pack',pak:'pack',passes:'pack',
 resultados:'resultado',placares:'resultado',placar:'resultado',precos:'preco',custam:'custa',valores:'preco',valor:'preco'};

/* palavras que o motor percebe nas perguntas dinâmicas (jogos, preços, saldo...) */
const KNOWN=new Set(('a o as os um uma uns umas ao aos à as do da dos das no na nos nas num numa em de por para com sem sobre entre contra ate desde depois antes durante e ou mas que qual quais quem quanto quanta quantos quantas onde como quando porque '+
 'ja ainda so apenas tambem tudo todo toda todos todas outro outra outros mais menos sim nao talvez agora entao '+
 'eu tu ele ela nos eles elas me te se lhe mim ti meu minha meus minhas teu tua teus tuas seu sua seus suas dele dela deles delas nele nela neles nelas esse essa esses essas desse dessa nesse nessa isso este esta estes estas isto deste desta neste nesta aquele aquela mesmo mesma '+
 'sou es e somos sao era foi foram sera estou esta estao estava fui ser estar ter tenho tens tem temos tinha tive havia ha houve haver existe existem '+
 'quero queres quer posso podes pode podemos consigo consegues preciso precisas precisa devo deves deve ver vejo ves vemos vir vou vais vai vao ir fazer faz faco fazem '+
 'comprar compro compra compras comprei pagar pago paga pagas gastar gasto gasta custa custar custo valer vale valem '+
 'dizer diz dizes dize dizemos fala falar sabes sei sabe saber mostra mostrar conta contar explica explicas explicar ajuda ajudar pergunta perguntar responde responder '+
 'joga jogo jogos jogar jogou jogaram jogava jogam equipa clube clubes adversario adversarios oponente rival casa fora competicao competicoes liga campeonato taca jornada jornadas epoca calendario agenda horario hora horas minuto minutos '+
 'hoje amanha ontem depois semana semanas mes meses dia dias noite tarde manha logo fim sabado domingo segunda terca quarta quinta sexta feira janeiro fevereiro marco abril maio junho julho agosto setembro outubro novembro dezembro '+
 'proximo ultimo primeiro seguinte anterior recente recentes atual atuais disponivel disponiveis '+
 'resultado resultados golo golos ganhou ganharam venceu venceram perdeu perderam empate empatou empataram marcou marcaram terminou acabou ficou ficaram correu saiu foi placard score '+
 'pack packs pacote preco precos barato barata caro cara compensa compensam valer pena melhor pior moeda moedas flex saldo carteira dinheiro euros euro pontos ponto premio premios ranking missao missoes previsao previsoes '+
 'sobra sobram sobrar resta restam fico ficas fica ficam ficaria chega chego chegam suficiente suficientes basta bastam depois '+
 'meu minha ver assistir acesso acessos comprado comprados comprada compradas bilhete entrada passe individual modalidade futebol todos todas completo completa inclui incluido incluidos incluem cobre abrange '+
 'desconto promocao oferta favor obrigado obrigada ola oi boa bom dia boas tardes noites hey ei '+
 'app aplicacao sportflex assistente replay replays spoiler spoilers momento momentos chave amigo amigos watch party '+
 'esta numero n qualquer algum alguma alguns algumas nenhum nenhuma varios varias certo certa seguinte tipo tipos maneira forma '+
 'poupo poupa poupar poupanca comeca comecam termina acaba vi visto vistos assisti assistidos assistiu adquirir real vs versus x contra').split(' '));
['dias','dia','semana','hoje'].forEach(w=>KNOWN.add(w));
const KBWORDS=('offside impedimento penalti penalty cartao cartoes amarelo vermelho expulsao prolongamento descontos substituicao substituicoes formacao formacoes taticas posicao posicoes '+
 'guarda defesa medio avancado extremo lateral canto livre lateral autogolo assistencia hattrick baliza inviolada derbi classico oitavos quartos meias finais playoff transferencia transferencias mercado '+
 'cobrar cobram cobrado cobrada chego cobre realidade aumentada comparador comparar essencial acessibilidade notificacoes alertas lembrete lembretes mensalidade subscricao validade convidar convite convites sincronizar sincronizacao microfone '+
 'instalar telemovel computador privacidade emblemas escudos perfil letra tamanho tema').split(' ');

/* clubes: nomes, siglas e alcunhas (já normalizados). Os nomes oficiais vêm de SF.TEAMS, por isso um clube novo funciona logo. */
const ALIAS={
 ben:['benfica','slb','glorioso','aguias','encarnados','benfas','sport lisboa e benfica','s l benfica'],
 spo:['sporting','sporting cp','sporting clube de portugal','scp','leoes'],
 por:['porto','fc porto','fcp','dragoes','azuis e brancos'],
 bra:['braga','sc braga','sporting de braga','sporting clube de braga','scb','arsenalistas','guerreiros do minho'],
 vsc:['guimaraes','vitoria de guimaraes','vitoria sc','vitoria guimaraes','vsc','conquistadores'],
 eam:['estrela da amadora','estrela','amadora'],
 rma:['real madrid','madrid','merengues','blancos','los blancos','rma','real'],
 fcb:['barcelona','fc barcelona','barca','fcb','blaugrana','blaugranas'],
 atm:['atletico de madrid','atletico madrid','atletico','atleti','colchoneros','atm'],
 bay:['bayern','bayern munique','bayern munchen','bayern de munique'],
 psg:['psg','paris saint germain','paris'],
 mun:['manchester united','man united','man utd','united','mufc','red devils','diabos vermelhos'],
 mci:['manchester city','man city','city','citizens','mcfc'],
 liv:['liverpool','reds'],ars:['arsenal','gunners'],che:['chelsea'],juv:['juventus','juve'],
 mil:['milan','ac milan'],int:['inter','inter de milao','inter milan','internazionale'],
 bvb:['dortmund','borussia dortmund','bvb'],rom:['roma','as roma'],avl:['aston villa'],sev:['sevilha','sevilla'],
 vil:['villarreal','villareal'],ala:['alaves'],lev:['levante'],ath:['athletic club','athletic bilbao','athletic'],
 rso:['real sociedad'],rac:['racing santander','racing de santander','racing'],sha:['shakhtar','shakhtar donetsk'],fey:['feyenoord'],
 fam:['famalicao','fc famalicao'],aro:['arouca','fc arouca'],nac:['nacional','cd nacional'],avi:['academico de viseu','academico','viseu'],alv:['alverca'],cpi:['casa pia'],
 mor:['moreirense'],est:['estoril'],mrt:['maritimo'],scl:['santa clara'],gil:['gil vicente'],rav:['rio ave']};
/* competições */
const CALIAS={
 ucl:['liga dos campeoes','liga campeoes','champions league','champions','ucl'],lali:['la liga','laliga','liga espanhola','campeonato espanhol'],
 prem:['premier league','premier','liga inglesa','campeonato ingles'],seri:['serie a','liga italiana','campeonato italiano'],
 bund:['bundesliga','liga alema','campeonato alemao'],lig1:['ligue 1','liga francesa','campeonato frances'],
 liga:['liga portugal','liga betclic','primeira liga','liga portuguesa','campeonato portugues','liga']};
const ENT=[];
function buildEntities(){ENT.length=0;
 Object.keys(SF.TEAMS).forEach(id=>{const names=new Set([norm(SF.TEAMS[id].n),...(ALIAS[id]||[])]);names.forEach(a=>{if(a&&a.length>=3)ENT.push({k:'t',id,a})})});
 Object.keys(SF.COMPS).forEach(id=>{const names=new Set([norm(SF.COMPS[id].n),...(CALIAS[id]||[])]);names.forEach(a=>ENT.push({k:'c',id,a}))});
 ENT.sort((x,y)=>y.a.length-x.a.length)}
const SOFT=/dinheiro real|\be real\b|e tudo real|sao reais|a serio|de verdade|isto e real|e real\?/;
const entRe=e=>new RegExp('(^| )'+e.a+(e.a==='liga'?'(?! (o|os|a|as|me|te|se|isso|tudo|modo|alertas|notificacoes))':'')+'( |$)');

/* correção de pequenos erros: palavra com 1-2 letras trocadas/em falta → palavra conhecida */
function dl(a,b,max){const la=a.length,lb=b.length;if(Math.abs(la-lb)>max)return max+1;let pp=null,p=[];for(let j=0;j<=lb;j++)p[j]=j;
 for(let i=1;i<=la;i++){const c=[i];let mn=i;for(let j=1;j<=lb;j++){let v=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));
  if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])v=Math.min(v,pp[j-2]+1);c[j]=v;if(v<mn)mn=v}
  if(mn>max)return max+1;pp=p;p=c}
 return p[lb]}
let VOCAB=null;
function vocab(){if(VOCAB)return VOCAB;const s=new Set();KNOWN.forEach(w=>s.add(w));KBWORDS.forEach(w=>s.add(w));
 ENT.forEach(e=>e.a.split(' ').forEach(w=>s.add(w)));VOCAB=[...s].filter(w=>w.length>=6);return VOCAB}
const SAFE=new Set();
let VSET=null;function vocabSet(){if(!VSET){VSET=new Set(KBWORDS);ENT.forEach(e=>e.a.split(' ').forEach(w=>VSET.add(w)))}return VSET}
function fix(t){if(t.length<6||KNOWN.has(t)||vocabSet().has(t)||/\d/.test(t))return t;if(SAFE.has(t))return t;
 const max=t.length>=10?2:1;let best=null,bd=9,tie=false;
 for(const v of vocab()){const d=dl(t,v,max);if(d<bd){bd=d;best=v;tie=false}else if(d===bd&&v!==best)tie=true}
 return best&&bd<=max&&!tie?best:t}

/* ================= 3. PERGUNTAS E RESPOSTAS =================
   Cada linha: { id, k: expressão (ou lista de expressões, todas têm de aparecer), a: texto ou função que devolve o texto,
                 go: separador a abrir (opcional), ex: exemplos de perguntas (usados nos testes) }
   A expressão é aplicada ao texto já normalizado: minúsculas, sem acentos nem pontuação.
   EXEMPLO — para acrescentar uma pergunta nova basta juntar uma linha ao FAQ:
     { id:'horario-suporte', k:/horario (do )?(suporte|apoio)/, a:'Esta demonstração não tem apoio ao cliente.', ex:['qual é o horário do suporte?'] },  */
const TPL=/\b(o que|que e|que significa|explica|explicas|explicar|diz me|conta me|fala me|sabes|como|regra|regras|diferenca|funcao|significado|quando|quanto|quantos|quantas|para que|serve|onde|posso|consigo|existe|existem|ha|tem|tens|define|definicao|ajuda|duvida|qual|quais|quem|porque|vale|devo)\b/;
const nm=(id)=>SF.TEAMS[id].n;
const firstTeam=()=>Object.keys(SF.TEAMS)[0];
const jogoRange=()=>{const a=upcoming().map(g=>g.price);return a.length?[Math.min(...a),Math.max(...a)]:[1,3]};
const compRange=()=>{const a=Object.keys(SF.COMPS).map(c=>SF.COMPS[c].price);return [Math.min(...a),Math.max(...a)]};
const modP=()=>{const k=Object.keys(SF.SPORTS)[0];return SF.SPORTS[k].price};
const rng=r=>r[0]===r[1]?String(r[0]):r[0]+' a '+r[1];
const validTxt=()=>SF.SEASON&&SF.SEASON.fim?'Os packs de clube, competição e modalidade valem até '+SF.SEASON.fim+'. ':'';
const replayTxt=()=>SF.SEASON&&SF.SEASON.replay?'Os replays ficam disponíveis durante '+SF.SEASON.replay+' dias após cada jogo.':'';
const bundles=()=>SF.BUNDLES.map(b=>b.c+(b.b?'+'+b.b:'')+' moedas por '+b.eur).join(', ');
const rankTxt=()=>{const all=[...SF.RANKING,{n:SF.who(),p:SF.st.points,me:true}].sort((a,b)=>b.p-a.p);const i=all.findIndex(r=>r.me);
 return 'No ranking semanal lidera '+all[0].n+' com '+all[0].p+' pontos'+(all[0].me?' (és tu!)':'')+'. '+(i===0?'Estás em 1.º lugar.':'Tu estás em '+(i+1)+'.º lugar, com '+SF.st.points+' pontos.')};
const prizeTxt=()=>'Podes trocar pontos por: '+join(SF.PRIZES.map(p=>p.n+' ('+p.pts+' pontos)'))+'. Tens '+SF.st.points+' pontos.';
const coinPrize=()=>SF.PRIZES.find(p=>p.kind==='coins');

const FAQ=[
 /* --- sobre a app --- */
 {id:'app',k:/(sportflex|app|aplicacao)\b.*\b(o que e|serve|faz|funciona)|\b(o que e|para que serve|como funciona|o que faz|explica( me)?)\b.*\b(sportflex|app|aplicacao)\b|o que (posso|consigo|da para) fazer (aqui|na app|nesta app|com a app|na sportflex)|o que sabes|em que (me )?podes ajudar|^ajuda( me)?$|preciso de ajuda/,
  a:()=>'A SportFlex é uma app de streaming desportivo modular: pagas só pelo que queres ver (jogo, clube, competição ou modalidade). Tem Watch Party, replay inteligente, realidade aumentada, carteira com Moedas Flex, recompensas, Modo Essencial e este assistente.',
  ex:['o que é a SportFlex?','para que serve esta app?','como funciona a app?','o que posso fazer aqui?','o que sabes fazer?','ajuda']},
 {id:'packtipos',k:[/pack/,/diferenca|tipos|quais|que packs|existem|funcionam|o que (e|sao)|modular|opcoes|escolher entre/],
  a:()=>'Há 4 tipos de pack: Jogo (um jogo e o replay), Clube (todos os jogos de um clube), Competição (uma liga ou taça) e Modalidade (todas as competições de futebol). Custam '+rng(jogoRange())+', '+P('clube',firstTeam())+', '+rng(compRange())+' e '+modP()+' moedas, respetivamente.',
  ex:['qual a diferença entre os packs?','que tipos de pack existem?','como funcionam os packs?','o que são os packs?']},
 {id:'semsub',k:/mensalidade|subscri|assinatura|renova|debito automatico|pagamento mensal/,
  a:'Não há mensalidade nem renovação automática: pagas só os packs que escolhes, com Moedas Flex.',ex:['tenho de pagar mensalidade?','há subscrição?','renova automaticamente?']},
 {id:'validade',k:[/pack|replay|acesso|moedas|compra|comprei/,/validade|expira|caduca|prazo|ate quando|quanto tempo|por quanto tempo|valido|valem|vale ate/],
  a:()=>'O Pack Jogo inclui o jogo e o replay'+(SF.SEASON&&SF.SEASON.replay?' durante '+SF.SEASON.replay+' dias':'')+'. '+validTxt()+'As Moedas Flex não expiram.',
  ex:['até quando vale o pack clube?','qual a validade dos packs?','as moedas expiram?','por quanto tempo tenho o replay?']},
 {id:'moedas',k:[/moedas?/,/o que (e|sao)|para que servem|servem|como funcionam|explica/],
  a:()=>'As Moedas Flex são a moeda da app: com elas compras packs de jogo, clube, competição ou modalidade. Não expiram e, nesta demonstração, os pagamentos são simulados. Tens '+SF.st.coins+' neste momento.',go:'carteira',
  ex:['o que são as moedas flex?','para que servem as moedas?']},
 {id:'comprarmoedas',k:[/moedas?|carteira/,/compr|carreg|recarreg|adicion|mais moedas|quanto custa (as )?moedas|preco (das|de) moedas/],
  a:()=>'Na Carteira podes comprar Moedas Flex: '+bundles()+'. Os pagamentos são simulados, não é cobrado dinheiro real.',go:'carteira',
  ex:['como compro moedas?','onde carrego a carteira?','quanto custam as moedas?']},
 {id:'ganharmoedas',k:[/moedas?/,/ganh|consig|obter|obten|gratis|de graca|de borla/],
  a:()=>{const c=coinPrize();return 'Podes comprar moedas na Carteira'+(c?' ou trocar '+c.pts+' pontos por '+c.v+' Moedas Flex em Recompensas':'')+'.'},go:'carteira',
  ex:['como ganho moedas?','posso ter moedas de graça?']},
 {id:'dinheiroreal',k:/dinheiro real|pagamentos? .*(reais|real|a serio|verdadeiros)|cobram|cobrad|cobrar|cobra\b|debitad|cartao de credito|cartao bancario|dados do cartao|mbway|mb way|paypal|a serio|de verdade|gasto dinheiro/,
  a:'Não. Os pagamentos são simulados nesta demonstração: não é cobrado dinheiro real nem são pedidos dados de cartão ou de conta.',
  ex:['os pagamentos são com dinheiro real?','vão cobrar-me alguma coisa?','os pagamentos são a sério?','preciso do cartão de crédito?']},
 {id:'gratis',k:/gratis|gratuit|de graca|a app e paga|app paga/,
  a:'A demonstração é gratuita: começas com algumas Moedas Flex para experimentar e nenhum pagamento é real.',ex:['a app é grátis?','é gratuita?']},
 {id:'pontosmoedas',k:[/pontos?/,/moedas?|diferenca/],
  a:()=>'As Moedas Flex servem para comprar packs. Os pontos ganham-se a ver jogos, a convidar amigos, a cumprir missões e a acertar previsões, e servem para trocar por prémios. Tens '+SF.st.coins+' moedas e '+SF.st.points+' pontos.',go:'premios',
  ex:['qual a diferença entre pontos e moedas?','pontos e moedas são a mesma coisa?']},
 {id:'pontos1',k:[/pontos?/,/o que (e|sao|significam?)|para que servem|servem/],
  a:()=>'Os pontos são a tua pontuação na app: ganhas pontos a ver jogos, a convidar amigos, a cumprir missões e a acertar previsões, e trocas por prémios em Recompensas. Tens '+SF.st.points+' pontos.',go:'premios',ex:['o que são os pontos?','para que servem os pontos?','o que significam os pontos?']},
 {id:'ganharpontos',k:[/pontos?/,/ganh|consig|obter|obten|acumul|como/],
  a:'Ganhas pontos a ver jogos, a convidar amigos, a cumprir as missões da semana e a acertar previsões (50 pontos no resultado exato, 15 no vencedor).',go:'premios',
  ex:['como ganho pontos?','como posso acumular pontos?']},
 {id:'premios',k:/\b(premios?|recompensas?|sorteios?|camisola|bilhete duplo)\b|troc\w* (pel[oa]s? |os )?pontos|pontos por moedas|fazer com (os )?pontos|usar (os )?pontos/,
  a:()=>prizeTxt(),go:'premios',ex:['que prémios há?','o que posso trocar pelos pontos?','há sorteios?','quais são as recompensas?']},
 {id:'ranking',k:/^(?!.*\b(fifa|uefa|mundial|atp|mundo)\b).*(ranking|tabela dos amigos|quem esta a ganhar entre os amigos)/,
  a:()=>rankTxt(),go:'premios',ex:['como está o ranking?','quem lidera o ranking?','em que lugar estou no ranking?']},
 {id:'missoes',k:/\bmiss(ao|oes)\b/,
  a:'As missões da semana são: ver 2 jogos, convidar um amigo e acertar numa previsão. Cada uma dá pontos e o progresso aparece em Recompensas.',go:'premios',ex:['o que são as missões?','quais são as missões da semana?']},
 {id:'previsoes',k:/^(?!.*\b(tempo|meteorologia|clima|chuva|sol)\b).*\b(previsao|previsoes|prever|palpites?)\b/,
  a:'Nas Previsões escolhes o resultado de um jogo: acertar no resultado exato dá 50 pontos e acertar no vencedor dá 15. Estão em Recompensas.',go:'premios',ex:['como funcionam as previsões?','posso fazer palpites?']},
 {id:'oferecer',k:/\b(enviar|envio|oferecer|ofereco|presentear|dar|dou|mandar|mando|partilhar|oferta)\b.*\b(pack|jogo|amigo)\b|como envio (um )?pack|enviar a amigo/,
  a:'Na Carteira, toca em "Enviar a amigo", escolhe o amigo e o jogo. Ele recebe o acesso na hora e tu ganhas 15 pontos.',go:'carteira',ex:['como envio um pack a um amigo?','posso oferecer um jogo a um amigo?']},
 {id:'convidar',k:/convid|trazer amigos|chamar amigos|adicionar amigos|amigos para a app/,
  a:'Convidas amigos na Watch Party, com o botão de convidar, e isso conta para a missão "Convida um amigo". Nesta demonstração os convites são simulados.',ex:['como convido amigos?','posso convidar um amigo?']},
 {id:'sync',ent:true,k:/sincroni|atras(o|ad)|delay|ao mesmo tempo/,
  a:'Na Watch Party há sincronização: se estiveres atrasado voltas ao momento do anfitrião ou ligas a sincronização automática, para ninguém festejar um golo antes dos outros. Nesta demonstração os atrasos são simulados.',
  ex:['como sincronizo com os amigos?','e se eu estiver atrasado na watch party?']},
 {id:'watchparty',ent:true,k:/watch ?party|ver (o jogo )?com (os )?(meus )?amigos|videochamada|ver em grupo|ver juntos/,
  a:'A Watch Party deixa-te ver o jogo com amigos à distância: vídeo dos amigos, reações, chat e votações ao vivo, tudo no mesmo ecrã. Abre um jogo e escolhe o separador Watch Party, ou usa o botão no Home. Nesta demonstração os amigos são simulados.',
  ex:['como funciona a watch party?','o que é a watch party?','posso ver o jogo com amigos?','tem videochamada?','como abro uma watch party?']},
 {id:'chat',k:/\b(chat|reacoes|reagir|votacoes)\b/,
  a:'Durante um jogo ou numa Watch Party tens chat, reações e votações ao vivo. Nesta demonstração os amigos e as mensagens são simulados.',ex:['há chat durante o jogo?','como voto nas votações?','posso reagir aos golos?']},
 {id:'ar',k:/realidade aumentada|\b(o que e|como funciona|para que serve) (o |a )?(ar|ra)$|\b(modo|separador|funcao|botao) ar\b/,
  a:'A realidade aumentada coloca informação sobre o campo, como posições e estatísticas, enquanto vês o jogo. Abre um jogo e escolhe o separador AR; usa "Simular jogo ao vivo" para ver em ação.',
  ex:['o que é a realidade aumentada?','como funciona o AR?']},
 {id:'replay',ent:true,k:/replay|momentos chave|momentos principais|resumos? d[oe]s? jogos?|rever (um |o )?jogo|ver (de novo|outra vez) (o )?jogo/,
  a:()=>'O replay inteligente mostra só os momentos-chave de um jogo (golos e lances importantes), para quem chega atrasado ou quer rever depressa. Abre um jogo terminado a que tenhas acesso e escolhe o replay; também aparecem em "Os meus jogos".'+(SF.st.nospoil?' Com o modo sem spoilers ligado, o resultado fica oculto até o revelares.':''),go:'jogos',
  ex:['onde vejo os momentos-chave?','como funciona o replay?','posso rever um jogo?','onde estão os resumos dos jogos?']},
 {id:'nospoil',ent:true,k:/spoilers?/,
  a:()=>'O modo sem spoilers (Perfil > Jogos e avisos) esconde os resultados e os momentos dos replays; podes ver o jogo desde o início ou revelar o resultado quando quiseres.'+(SF.st.nospoil?' Está ligado neste momento, por isso não revelo resultados.':' Está desligado neste momento.'),go:'perfil',
  ex:['como funciona o modo sem spoilers?','o que é o modo sem spoilers?','como desligo os spoilers?']},
 {id:'desdeinicio',ent:true,k:/desde o inicio|do principio|desde o comeco/,
  a:'Com o modo sem spoilers ligado, o botão "Ver desde o início" mostra o jogo desde o princípio sem revelar o resultado até ao fim.',ex:['posso ver o jogo desde o início?']},
 {id:'osmeusjogos',k:/(onde|como).*(vejo|encontro|esta|estao|fica|ficam|acedo).*(jogo|jogos|pack|packs|comprei|comprado|comprados|acessos)|os meus (jogos|packs|acessos)|onde estao os meus/,
  a:'Em "Os meus jogos" (no Home, em "Os meus acessos" > Ver tudo) vês os packs e jogos que compraste, a validade, os próximos jogos incluídos e os replays.',go:'jogos',
  ex:['onde encontro um jogo que comprei?','onde vejo os meus packs?','onde estão os meus jogos?']},
 {id:'procurar',k:/(procur|pesquis|encontr|ach|busc).*(equipa|clube|jogo|competicao|liga)|barra de pesquisa|onde pesquiso/,
  a:'Usa o separador Explorar e escreve na barra de pesquisa o nome da equipa, do clube ou da competição.',go:'explorar',
  ex:['como procuro uma equipa?','onde pesquiso um jogo?','como encontro um clube?']},
 {id:'seguirclube',ent:true,k:/(segu|sigo|favorit|escolh|mud|alter|troc|adicion).*(clube|equipa)|\b(como|posso|quero)\b.*\b(sigo|seguir)\b|clubes que sigo|clube favorito|equipa favorita|clubes favoritos/,
  a:'Em Perfil escolhes os clubes que segues; a app passa a recomendar-te os jogos deles.',go:'perfil',ex:['como sigo um clube?','como mudo o meu clube favorito?','posso seguir várias equipas?']},
 {id:'nome',k:/(mud|alter|troc|edit|defin|escrev).*\bnome\b/,
  a:'Em Perfil escreves o teu nome no cartão do topo e ele passa a aparecer nas saudações.',go:'perfil',ex:['como mudo o meu nome?','posso alterar o nome?']},
 {id:'tamanhotexto',k:/(tamanho|letra|texto|fonte).*(maior|grande|pequen|mudar|alterar|aumentar|diminuir|ajustar)|letra (grande|pequena)|aumentar (a )?letra|nao consigo ler|tamanho (da letra|do texto)/,
  a:'Em Perfil > Acessibilidade > Tamanho do texto escolhes o tamanho da letra. O Modo Essencial também aumenta os botões e simplifica o ecrã.',go:'perfil',
  ex:['como aumento o tamanho da letra?','posso mudar o tamanho do texto?','não consigo ler, a letra é pequena']},
 {id:'essencial',k:/modo essencial|idosos|simplificad|modo mais simples|botoes grandes/,
  a:'O Modo Essencial mostra só os jogos do teu clube, com botões grandes e menos opções. Liga-se em Perfil > Acessibilidade.',go:'perfil',
  ex:['o que é o modo essencial?','como ligo o modo essencial?','há um modo mais simples para idosos?']},
 {id:'tema',k:/(tema|cor|cores) da (app|aplicacao)|mudar (o )?(tema|a cor)|modo escuro|cor do tema|escolher (o )?tema|personalizar/,
  a:'Em Perfil > Tema podes escolher a cor da app entre 7 opções.',go:'perfil',ex:['como mudo a cor da app?','posso mudar o tema?']},
 {id:'alertas',ent:true,k:/alertas?|notifica|lembrete|lembrar me|avis(a|ad|o)/,
  a:'Em cada jogo, toca em "Lembrar-me" para escolheres a antecedência (5 minutos a 1 dia) e, se quiseres, adicionares o jogo ao calendário. Em Perfil > Jogos e avisos ativas os alertas e defines a antecedência predefinida. Nesta demonstração o aviso da app é simulado.',go:'perfil',
  ex:['como configuro os alertas?','posso ser avisado antes do jogo?','como ativo as notificações?','como funciona o lembrete?']},
 {id:'calendarioics',ent:true,k:/(adicion|export|guard|met|pon|sincroniz).*calendario|\bics\b|google calendar|calendario do (telemovel|google)/,
  a:'No lembrete de um jogo ("Lembrar-me") ligas "Adicionar ao calendário" e a app descarrega um ficheiro .ics com o alarme, que funciona no Google Calendar, Apple Calendar e Outlook.',
  ex:['como adiciono um jogo ao calendário do telemóvel?','posso exportar para o google calendar?']},
 {id:'filtros',k:[/filtr|so os jogos|so mostrar/,/calendario|jogos|explorar/],
  a:'No calendário (Explorar) podes filtrar por dia (hoje, esta semana ou uma data), por clube e por jogos que já tens ou ainda não tens.',go:'explorar',
  ex:['como filtro o calendário?','posso filtrar os jogos por clube?']},
 {id:'voz',k:/\bvoz\b|microfone|comandos de voz|ler em voz alta|ouvir as respostas|falar com a app|ditar/,
  a:'No botão do microfone dizes comandos como "próximo jogo" ou "abrir carteira" (precisa de internet e de permissão do microfone; há botões de toque como alternativa). Em Perfil > Acessibilidade podes ligar a leitura em voz alta das respostas do assistente.',go:'perfil',
  ex:['tem comandos de voz?','como uso o microfone?','o assistente pode ler as respostas em voz alta?']},
 {id:'instalar',k:/instal|ecra inicial|offline|sem (rede|internet)|funciona (no|em|num) (meu )?(telemovel|telefone|computador|pc|iphone|android|ios|tablet|dobravel|mac|portatil)|\bdobravel\b/,
  a:'A SportFlex é uma app web instalável: no Android usa o menu do Chrome > Instalar aplicação, no iPhone usa o Safari > Partilhar > Adicionar ao ecrã principal, e no computador usa o ícone de instalar na barra de endereços. Adapta-se a telemóvel, dobrável e computador.',
  ex:['como instalo a app no telemóvel?','funciona no computador?','funciona sem internet?','posso instalar no iphone?']},
 {id:'simulado',k:/simulad|de mentira|a brincar|a fingir|e real\b|e uma demonstracao|e um prototipo/,
  a:'A app é uma demonstração. Estão simulados o vídeo e o jogo ao vivo, a Watch Party e os amigos, os pagamentos e os avisos da app. Os jogos e resultados vêm de fontes públicas e os preços são ilustrativos.',
  ex:['o que é simulado na app?','isto é real?','é tudo de mentira?','é a sério ou é de mentira?']},
 {id:'video',ent:true,k:/(ao vivo|em direto|transmissao|transmitir|streaming|tem video\b|ha video\b|vejo o jogo em direto)/,
  a:'A app não tem vídeo real nem direitos de transmissão. O botão "Simular jogo ao vivo" mostra como seria uma transmissão, com campo animado, golos, chat, votações e realidade aumentada.',
  ex:['posso ver os jogos em direto?','tem transmissão ao vivo?','a app tem vídeo?']},
 {id:'dados',k:/dados reais|dados atualizados|calendario real|resultados .*reais|sao reais|\bfontes?\b|fiavel|de onde vem|de onde veem|desatualizad|atualiza sozinh|atualizam/,
  a:()=>SF.DATA_LBL+'. Os jogos e resultados foram recolhidos de fontes públicas (Liga Portugal, La Liga e Champions League). Não se atualizam sozinhos e podem ter imprecisões.',
  ex:['de onde vêm os dados?','os resultados são reais?','os dados atualizam sozinhos?']},
 {id:'emblemas',k:/emblema|escudo|logotipo|logo oficial/,
  a:'Os emblemas são escudos genéricos criados para este projeto, porque os oficiais pertencem aos clubes. Quando houver autorização, podem ser acrescentados.',ex:['porque não tem os emblemas dos clubes?','os escudos são oficiais?']},
 {id:'privacidade',k:/privacidade|dados pessoais|dados ficam|onde (ficam|estao) (os )?(meus )?dados|(criar|tenho|preciso de|abrir|ter|fazer) (uma )?conta|minha conta|iniciar sessao|login|palavra passe|password|varios aparelhos|outro (telemovel|computador|aparelho)/,
  a:'Não há contas nesta demonstração. As tuas moedas, packs e preferências ficam guardados só no aparelho onde usas a app.',ex:['preciso de criar conta?','os meus dados ficam guardados onde?','posso usar noutro telemóvel?']},
 {id:'comparador',ent:true,k:/comparador|comparar (os )?packs?|combinacao mais barata|como poupar|quanto posso poupar|poupar/,
  a:'O Comparador de packs ajuda-te a pagar só pelo que queres ver: marcas os jogos e a app calcula a combinação mais barata de packs, explica quanto poupas e deixa-te comprar tudo de uma vez. Está em Explorar e na Carteira.',go:'comparar',gol:'Abrir o comparador',
  ex:['o que é o comparador de packs?','como posso poupar nos packs?']},
 {id:'recomendacoes',k:/porque.*(recomend|sugere)|como funcionam as recomendacoes|escolhidos para ti/,
  a:'As recomendações têm em conta os clubes e as modalidades que segues e os jogos mais próximos. Quanto mais clubes seguires em Perfil, mais personalizadas ficam.',go:'perfil',ex:['como funcionam as recomendações?','porque me recomendam este jogo?']},
 {id:'repor',k:/apag(ar|o)\b.*dados|elimin(ar|o)\b.*dados|\brepor\b|reset|recomec|limpar tudo|desfazer tudo|comecar de novo|do zero/,
  a:'Em Perfil, o botão "Repor demonstração" apaga as tuas moedas, packs e preferências e volta ao início.',go:'perfil',ex:['como apago os meus dados?','como recomeço do zero?']},
 {id:'assistente',k:/(quem es|o que es) (tu|voce)|como te chamas|es uma ia|es um robo|es humano|es o chatgpt|que modelo|como funcionas/,
  a:'Sou o assistente da SportFlex. Respondo no teu aparelho, sem enviar as tuas perguntas para nenhum servidor, sobre futebol e sobre tudo o que a app faz.',
  ex:['quem és tu?','como te chamas?','és uma IA?','és um robô?']},
 /* --- futebol --- */
 {id:'foradejogo',k:/fora de jogo|offside|impedimento/,
  a:'Um jogador está em fora de jogo se, no momento do passe, estiver na metade do adversário e mais perto da linha de baliza do que a bola e o penúltimo adversário. Só é punido se participar no lance. Não há fora de jogo num pontapé de baliza, num lançamento lateral ou num canto.',
  ex:['como funciona o fora de jogo?','o que é o offside?','qual é a regra do fora de jogo?','explica o impedimento']},
 {id:'var',k:/\bvar\b|video arbitro|videoarbitro|arbitro de video/,
  a:'O VAR (árbitro de vídeo) ajuda o árbitro em quatro tipos de lance: golos, grandes penalidades, cartões vermelhos diretos e troca de identidade. A decisão final é sempre do árbitro principal.',ex:['o que é o VAR?','para que serve o videoárbitro?']},
 {id:'penalti',k:/penalti|penaltis|grande penalidade|desempate por penaltis/,
  a:'O penálti é marcado a 11 metros da baliza, depois de uma falta cometida dentro da grande área. Só o guarda-redes pode defender e os restantes jogadores ficam fora da área até o pontapé ser dado. Nos jogos a eliminar, o desempate por penáltis decide-se em séries de 5 pontapés por equipa.',
  ex:['o que é um penálti?','como funciona o desempate por penáltis?','o que é uma grande penalidade?']},
 {id:'cartoes',k:/cartoes|cartao (amarelo|vermelho)|\b(amarelo|vermelho)\b|expuls|o que (e|significa) (um )?cartao/,
  a:'O cartão amarelo é uma advertência e o vermelho é expulsão. Dois amarelos no mesmo jogo dão vermelho. Quem é expulso sai do jogo e a equipa fica com menos um jogador.',ex:['o que significa o cartão amarelo?','quando é que se mostra o cartão vermelho?','o que são cartões?']},
 {id:'duracao',k:/quanto tempo dura (um|o) jogo|duracao (de|do) (um )?jogo|quantos minutos (tem|dura)|prolongamento|tempo de descontos|minutos de descontos|o que sao (os )?descontos|tempo extra|\bintervalo\b/,
  a:'Um jogo tem 90 minutos, em duas partes de 45, com 15 minutos de intervalo. O árbitro acrescenta os descontos. Em jogos a eliminar, se persistir o empate, há prolongamento de 2 partes de 15 minutos e, se for preciso, desempate por penáltis.',
  ex:['quanto tempo dura um jogo de futebol?','o que é o prolongamento?','o que são os descontos?','quanto dura o intervalo?']},
 {id:'jogadores',k:/quantos jogadores|jogadores em campo|numero de jogadores/,
  a:'Cada equipa joga com 11 jogadores em campo, um deles guarda-redes. O jogo não pode continuar se uma equipa ficar com menos de 7.',ex:['quantos jogadores há em campo?']},
 {id:'substituicoes',k:/substitui/,
  a:'Na maioria das competições cada equipa pode fazer até 5 substituições, em 3 momentos do jogo mais o intervalo. As regras exatas dependem da competição.',ex:['quantas substituições se podem fazer?','como funcionam as substituições?']},
 {id:'pontos',k:/vitoria vale|quantos pontos (vale|da|se ganha)|pontos (por|de) (vitoria|empate)|desempat|como se classifica|(como funciona|como e feita|como se calcula) a classificacao/,
  a:'Nas ligas, a vitória vale 3 pontos, o empate 1 e a derrota 0. Em caso de igualdade, os critérios de desempate (confronto direto, diferença de golos, etc.) variam de liga para liga.',
  ex:['quantos pontos vale uma vitória?','como funciona a classificação?','como se desempata na liga?']},
 {id:'golofora',k:/golo fora|regra do golo/,
  a:'A regra do golo fora foi abolida nas competições da UEFA a partir da época 2021/22. Agora, em caso de empate no conjunto das duas mãos, vai-se a prolongamento.',ex:['ainda existe a regra do golo fora?']},
 {id:'campo',k:/tamanho do campo|dimensoes do campo|campo mede|quanto mede o campo/,
  a:'Os campos profissionais têm cerca de 105 x 68 metros. O regulamento permite entre 90 e 120 metros de comprimento e 45 e 90 de largura.',ex:['qual é o tamanho do campo?','quanto mede o campo de futebol?']},
 {id:'hattrick',k:/hat ?trick/,a:'Hat-trick é quando um jogador marca 3 golos no mesmo jogo.',ex:['o que é um hat-trick?']},
 {id:'cleansheet',k:/clean sheet|baliza inviolada/,a:'Baliza inviolada (clean sheet) é um jogo em que a equipa não sofre golos.',ex:['o que é uma baliza inviolada?','o que é um clean sheet?']},
 {id:'xg',k:/\bxg\b|golos esperados|expected goals/,a:'O xG (golos esperados) mede a qualidade das oportunidades: cada remate recebe um valor entre 0 e 1 consoante a probabilidade de ser golo, tendo em conta distância, ângulo e tipo de lance.',ex:['o que é o xG?','o que são golos esperados?']},
 {id:'derbi',k:/derbi|classico/,
  a:'Dérbi é um jogo entre rivais da mesma cidade ou região, como o Benfica-Sporting (Dérbi de Lisboa). Em Portugal o Benfica-Porto também é um clássico, tal como o Real Madrid-Barcelona, o "El Clásico", em Espanha.',ex:['o que é um dérbi?','o que é um clássico?']},
 {id:'formacao',k:/formacao tatica|formacoes|esquema tatico|tatica|\b4 ?3 ?3\b|\b4 ?4 ?2\b|\b3 ?5 ?2\b/,
  a:'A formação diz quantos jogadores há em cada zona, da defesa para o ataque. Num 4-3-3 há 4 defesas, 3 médios e 3 avançados; num 4-4-2, 4 defesas, 4 médios e 2 avançados. Cada treinador adapta-a ao jogo.',ex:['o que é um 4-3-3?','o que é uma formação tática?','o que significa 4-4-2?']},
 {id:'posicoes',k:/posicoes|quais as posicoes|o que faz (um|o) (guarda redes|defesa|medio|avancado|extremo|lateral)|o que e (um|o) (guarda redes|defesa central|lateral|medio|avancado|extremo)/,
  a:'As posições principais são: guarda-redes; defesas (centrais e laterais); médios (defensivos, centrais e ofensivos); e avançados (pontas de lança e extremos).',ex:['quais são as posições no futebol?','o que faz um extremo?','o que é um lateral?']},
 {id:'canto',k:/pontape de canto|o que e (um )?canto|\bcantos\b|escanteio/,a:'O canto é marcado quando a bola sai pela linha de fundo depois de tocar num defensor. A equipa atacante bate-o a partir do vértice do campo.',ex:['o que é um canto?','quando é que há pontapé de canto?']},
 {id:'livre',k:/livre direto|livre indireto|pontape livre|o que e (um )?livre|o que e (uma )?falta/,a:'O livre é marcado depois de uma falta. No livre direto pode marcar-se golo diretamente; no indireto a bola tem de tocar noutro jogador antes de entrar na baliza.',ex:['qual a diferença entre livre direto e indireto?','o que é um livre?']},
 {id:'lateral',k:/lancamento lateral|lateral de linha|pontape de linha/,a:'O lançamento lateral repõe a bola em jogo quando ela sai pela linha lateral: é feito com as duas mãos, por cima da cabeça, e não se pode marcar golo diretamente.',ex:['como funciona o lançamento lateral?']},
 {id:'autogolo',k:/auto ?golo|golo na propria baliza|golo contra/,a:'Autogolo é quando um jogador marca na sua própria baliza. Conta como golo para a equipa adversária.',ex:['o que é um autogolo?']},
 {id:'assistencia',k:/assistencia|passe para golo|assistente de golo/,a:'Assistência é o último passe antes de um golo, dado pelo jogador que o prepara.',ex:['o que é uma assistência?']},
 {id:'mao',k:/falta de mao|mao na bola|handball|toque de mao/,a:'Há falta de mão quando um jogador toca na bola deliberadamente com a mão ou o braço, ou quando o braço aumenta o volume do corpo de forma não natural. Dentro da área do defensor dá penálti.',ex:['quando é falta de mão?','o que é uma mão na bola?']},
 {id:'jornada',k:/o que e uma jornada|o que e a jornada|jornada significa|quantas jornadas/,a:'Uma jornada é cada ronda de jogos de um campeonato, em que todas as equipas jogam uma vez. Uma liga com 18 clubes tem 34 jornadas.',ex:['o que é uma jornada?']},
 {id:'fases',k:/fases|fase de (grupos|liga)|oitavos|quartos de final|meias ?finais|play ?offs?|eliminatorias/,
  a:'Numa competição de eliminatórias as fases são: oitavos de final, quartos, meias-finais e final. Na Liga dos Campeões há, desde 2024/25, uma fase de liga com 36 equipas, seguida de play-offs e dessas eliminatórias. As ligas nacionais jogam-se por jornadas.',
  ex:['quais são as fases da Liga dos Campeões?','o que são os oitavos de final?','o que é um play-off?','como funciona a fase de liga?']},
 {id:'transferencias',k:/mercado de transferencias|janela de transferencias|transferencias de jogadores|mercado de (inverno|verao)/,
  a:'O mercado de transferências é o período em que os clubes contratam e vendem jogadores. Há normalmente duas janelas por época: uma no verão e outra em janeiro.',ex:['o que é o mercado de transferências?']},
 {id:'taca',k:/taca de portugal/,a:'A Taça de Portugal é a prova a eliminar do futebol português, aberta a clubes de vários escalões, com final no Estádio Nacional, no Jamor.',ex:['o que é a Taça de Portugal?']},
 {id:'europa',k:/europa league|liga europa|conference league|liga conferencia/,a:'A Liga Europa e a Liga Conferência são as outras duas provas de clubes da UEFA. Ainda não têm jogos nesta demonstração.',ex:['o que é a Liga Europa?']},
 {id:'euro',k:/euro 2016|europeu de 2016|campeao europeu|portugal.*euro/,a:'Portugal conquistou o Campeonato da Europa em 2016, em França, ao vencer a seleção francesa por 1-0 no prolongamento da final, com golo de Éder.',ex:['quando é que Portugal ganhou o Euro?']},
 {id:'mundial',k:/campeonato do mundo|mundial de futebol|\bmundial\b|copa do mundo/,a:'O Campeonato do Mundo de seleções realiza-se de 4 em 4 anos. A edição de 2026 foi organizada em conjunto por Estados Unidos, Canadá e México, pela primeira vez com 48 seleções.',ex:['de quantos em quantos anos há Mundial?']}
];
['premios','video','replay','validade','convidar','comparador','simulado'].forEach(id=>{const i=FAQ.findIndex(e=>e.id===id);if(i>0)FAQ.unshift(FAQ.splice(i,1)[0])});

/* factos curtos dos clubes (perguntas "estádio", "fundação", "alcunha") */
const FACT={ben:{e:'Estádio da Luz',f:1904,n:'as Águias'},spo:{e:'Estádio José Alvalade',f:1906,n:'os Leões'},por:{e:'Estádio do Dragão',f:1893,n:'os Dragões'},
 bra:{e:'Estádio Municipal de Braga',f:1921,n:'os Arsenalistas'},rma:{e:'Estádio Santiago Bernabéu',f:1902,n:'os Merengues'},fcb:{e:'Camp Nou',f:1899,n:'os Blaugrana'},
 bay:{e:'Allianz Arena'},psg:{e:'Parc des Princes'},liv:{e:'Anfield'},mun:{e:'Old Trafford'},ars:{e:'Emirates Stadium'},mci:{e:'Etihad Stadium'}};

/* ================= 4. MOTOR ================= */
const ctx={team:null,game:null,comp:null,pack:null,intent:null};
const resetCtx=()=>{ctx.team=ctx.game=ctx.comp=ctx.pack=ctx.intent=null};

function parse(raw){
 let q=norm(raw);
 q=q.split(' ').map(t=>ABBR[t]!==undefined?ABBR[t]:t).join(' ').replace(/\s+/g,' ').trim();
 const qo=q;
 if(!ENT.length)buildEntities();
 q=q.split(' ').map(fix).join(' ');
 // entidades (clubes e competições), preservando a ordem em que aparecem
 let rest=' '+q+' ',found=[];
 ENT.forEach(e=>{if(e.a==='real'&&SOFT.test(q))return;const re=entRe(e);let m;while((m=re.exec(rest))){found.push({k:e.k,id:e.id,at:m.index});rest=rest.slice(0,m.index)+' _ '+rest.slice(m.index+m[0].length)}});
 found.sort((a,b)=>a.at-b.at);
 const teams=[],comps=[];found.forEach(f=>{if(f.k==='t'&&!teams.includes(f.id))teams.push(f.id);if(f.k==='c'&&!comps.includes(f.id))comps.push(f.id)});
 // "o meu clube"
 const teamsExplicit=teams.slice();let mine=false;if(/\b(meu|minha|meus|minhas) (clube|clubes|equipa|equipas)\b|\bo meu\b.*\bclube\b/.test(q)){mine=true;rest=rest.replace(/\b(meu|minha|meus|minhas) (clube|clubes|equipa|equipas)\b/g,' _ ');SF.st.favs.forEach(f=>{if(!teams.includes(f))teams.push(f)})}
 const day=parseDay(q);
 const toks=rest.split(' ').filter(t=>t&&t!=='_');
 const unknown=toks.filter(t=>!KNOWN.has(t)&&!/^\d{1,2}$/.test(t)&&!/^\d{1,2}\/\d{1,2}$/.test(t));
 return {raw,q,qo,teams,teamsExplicit,comps,mine,day,toks,unknown,ent:found.length>0,tokens:q.split(' ')}}

function parseDay(q){
 const base=(off)=>nowKey(off);
 if(/\bdepois de amanha\b/.test(q))return {key:base(2).key,lbl:'depois de amanhã'};
 if(/\bamanha\b/.test(q))return {key:base(1).key,lbl:'amanhã'};
 if(/\bhoje\b|\besta noite\b|\besta tarde\b/.test(q))return {key:base(0).key,lbl:'hoje'};
 if(/\bfim de semana\b|\bsabado e domingo\b/.test(q))return {wk:'we',lbl:'este fim de semana'};
 if(/\besta semana\b|\bproximos dias\b|\bsemana\b/.test(q))return {wk:'wk',lbl:'esta semana'};
 const wdm=q.match(/\b(domingo|segunda|terca|quarta|quinta|sexta|sabado)\b/);
 if(wdm){const idx={domingo:0,segunda:1,terca:2,quarta:3,quinta:4,sexta:5,sabado:6}[wdm[1]];
  for(let d=0;d<=7;d++){const l=base(d);if(l.wd===idx)return {key:l.key,lbl:DIAS[idx]+' ('+l.d+'/'+p2(l.m)+')'}}}
 const dm=q.match(/\bdia (\d{1,2})(?: de (\w+))?|\b(\d{1,2})\/(\d{1,2})\b|\b(\d{1,2}) de (janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/);
 if(dm){const d=+(dm[1]||dm[3]||dm[5]),mo=dm[4]?+dm[4]:(dm[2]||dm[6])?MESES.indexOf(dm[2]||dm[6])+1:0;
  for(let o=0;o<400;o++){const l=base(o);if(l.d===d&&(!mo||l.m===mo))return {key:l.key,lbl:'o dia '+l.d+'/'+p2(l.m)}}}
 return null}

const onDay=(g,day)=>{if(!day)return true;const l=gameDay(g);
 if(day.key)return l.key===day.key;
 const t0=nowKey(0).key;
 if(day.wk==='we')return (l.wd===6||l.wd===0)&&g.min<8*1440;
 if(day.wk==='wk')return g.min<7*1440&&l.key>=t0;return true};

/* resposta com contexto a guardar */
const R=(t,o)=>Object.assign({t},o||{});

/* ---------- construtores de respostas ---------- */
function gameFor(team,day){const u=upcoming().filter(g=>(g.h===team||g.a===team)&&onDay(g,day));return u[0]||null}
function lastDone(team){return finished().find(g=>g.h===team||g.a===team)||null}
function h2h(a,b,wantDone){return SF.GAMES.filter(g=>((g.h===a&&g.a===b)||(g.h===b&&g.a===a))&&(wantDone===undefined||!!g.done===wantDone))[0]||null}

function whenTeam(team,day){
 const g=gameFor(team,day),n=nm(team);
 if(!g){
  const nx=gameFor(team);
  if(day&&nx)return R(n+' não joga '+day.lbl+'. O próximo jogo é '+nx.title+', '+atTxt(nx)+' (hora de Lisboa), '+compName(nx)+'.',{g:nx.id,set:{team,game:nx.id,intent:'when'}});
  return R('Não tenho nenhum jogo de '+n+' marcado no calendário desta demonstração.',{set:{team,game:null,intent:'when'}})}
 const home=g.h===team,opp=TN(home?g.a:g.h);
 return R(n+' joga '+(home?'em casa':'fora')+', contra '+opp+': '+atTxt(g)+' (hora de Lisboa), '+compName(g)+'.',{g:g.id,set:{team,game:g.id,intent:'when'}})}

function gameLine(g){return g.title+': '+atTxt(g)+' (hora de Lisboa), '+compName(g)+'.'}
function gameInfo(g,intent){return R(gameLine(g),{g:g.id,set:{game:g.id,intent:intent||'when'}})}

function listDay(P,day){
 let gs=upcoming().filter(g=>onDay(g,day));
 let sfx='';
 if(P.comps.length){gs=gs.filter(g=>P.comps.includes(g.comp));sfx=' de '+P.comps.map(c=>SF.COMPS[c].n).join(' e ')}
 if(P.teams.length){gs=gs.filter(g=>P.teams.some(t=>g.h===t||g.a===t))}
 if(!gs.length)return R('Não tenho jogos'+sfx+' marcados para '+day.lbl+' no calendário desta demonstração.',{set:{intent:'when'}});
 const multi=!!day.wk,fmt=g=>multi?g.title+' ('+whenShort(g)+', '+compName(g)+')':g.title+' às '+SF.hm(g)+' ('+compName(g)+')';
 const shown=gs.slice(0,4).map(fmt),more=gs.length-shown.length;
 const t='Para '+day.lbl+' tenho '+pl(gs.length,'jogo','jogos')+sfx+': '+(more>0?shown.join('; ')+' (e mais '+more+')':join(shown))+'.';
 return gs.length===1?R(t,{g:gs[0].id,set:{game:gs[0].id,intent:'when'}}):R(t,{go:'explorar',gol:'Ver calendário',set:{game:null,intent:'when'}})}

function compAns(c,P){
 const up=upcoming().filter(g=>g.comp===c),dn=finished().filter(g=>g.comp===c);
 const facts={liga:'A Liga Portugal tem 18 clubes e 34 jornadas.',ucl:'A Liga dos Campeões tem, desde 2024/25, uma fase de liga com 36 equipas, seguida de play-offs e eliminatórias.',
  lali:'A La Liga tem 20 clubes e 38 jornadas.',prem:'A Premier League tem 20 clubes e 38 jornadas.',seri:'A Serie A tem 20 clubes e 38 jornadas.',bund:'A Bundesliga tem 18 clubes e 34 jornadas.',lig1:'A Ligue 1 tem 18 clubes e 34 jornadas.'};
 let t=(facts[c]||SF.COMPS[c].n+'.')+' O Pack Competição custa '+moedas(SF.cost('comp',c))+'.';
 if(up.length)t+=' Próximo jogo na app: '+up[0].title+', '+atTxt(up[0])+'.';else t+=' O calendário desta competição ainda não está na demonstração.';
 return R(t,{g:up[0]&&up[0].id,set:{comp:c,game:up[0]?up[0].id:null,pack:{k:'comp',id:c},intent:'when'}})}

function teamAns(id){
 const up=upcoming().filter(g=>g.h===id||g.a===id),dn=lastDone(id);
 let t=nm(id)+'.';if(FACT[id]&&FACT[id].e)t+=' Joga no '+FACT[id].e+'.';
 if(up.length)t+=' Próximo jogo: '+up[0].title+', '+atTxt(up[0])+'.';
 if(dn)t+=SF.hidden(dn)?' Tens o modo sem spoilers ligado, por isso não revelo o último resultado.':' Último resultado na app: '+dn.title+' '+rs(dn)+'.';
 if(!up.length&&!dn)t+=' Ainda não tenho jogos deste clube na demonstração.';
 t+=' O Pack Clube custa '+moedas(SF.cost('clube',id))+'.';
 return R(t,{g:up[0]&&up[0].id,set:{team:id,game:up[0]?up[0].id:null,pack:{k:'clube',id},intent:'when'}})}

function resultAns(g){
 if(SF.hidden(g))return R('Tens o modo sem spoilers ligado, por isso não revelo o resultado de '+g.title+'. Podes revelá-lo no próprio jogo ou desligar o modo em Perfil.',{g:g.id,set:{game:g.id,intent:'result'}});
 return R(g.title+' terminou '+rs(g)+' ('+g.lbl+').',{g:g.id,set:{game:g.id,intent:'result'}})}

/* preço e saldo */
function costOf(ref){return SF.cost(ref.k,ref.id)}
function refName(ref){return ref.k==='jogo'?SF.game(ref.id).title:ref.k==='clube'?'Pack Clube '+nm(ref.id):ref.k==='comp'?'Pack '+SF.COMPS[ref.id].n:'Pack '+SF.SPORTS[ref.id].n}
function hasAcc(ref){return ref.k==='jogo'?SF.access(SF.game(ref.id)):SF.has(ref.k,ref.id)}
function priceRef(ref,extra){
 const c=costOf(ref),n=refName(ref);
 let t=ref.k==='jogo'?n+' custa '+moedas(c)+' (Pack Jogo)'+discNote()+'.':n+' custa '+moedas(c)+discNote()+'.';
 if(hasAcc(ref))t='Já tens acesso a '+(ref.k==='jogo'?n:n)+', por isso não precisas de gastar moedas (custaria '+moedas(c)+').';
 return t+(extra||'')}
function leftRef(ref){
 const c=costOf(ref),C=SF.st.coins,n=refName(ref);
 if(hasAcc(ref))return R('Já tens acesso a '+n+', por isso não gastas nada e continuas com '+moedas(C)+'.',{go:'carteira',set:{intent:'left'}});
 if(C>=c)return R('Se comprares '+n+' ('+moedas(c)+'), ficas com '+moedas(C-c)+'. Tens '+moedas(C)+' neste momento.',{go:'carteira',set:{intent:'left'}});
 return R('Não chegam as moedas para '+n+': custa '+moedas(c)+' e tens '+moedas(C)+', por isso faltam-te '+moedas(c-C)+'.',{go:'carteira',set:{intent:'left'}})}
function affordRef(ref){
 const c=costOf(ref),C=SF.st.coins,n=refName(ref);
 if(hasAcc(ref))return R('Já tens acesso a '+n+', não precisas de moedas.',{set:{intent:'afford'}});
 return C>=c?R('Sim, chega: '+n+' custa '+moedas(c)+' e tens '+moedas(C)+'. Não comprei nada, isso decides tu.',{go:'carteira',set:{intent:'afford'}})
  :R('Ainda não chega: '+n+' custa '+moedas(c)+' e tens '+moedas(C)+' (faltam '+moedas(c-C)+'). Podes comprar mais moedas na Carteira.',{go:'carteira',set:{intent:'afford'}})}

/* o que o utilizador tem em mente: jogo, pack, ou nada */
function kindOf(P){const q=P.q;
 if(/\bpack (de |do |da )?(modalidade|futebol|desporto)\b|\bmodalidade\b|\bpack total\b/.test(q))return 'mod';
 if(/\bpack (de |do |da |das )?(competicao|competicoes|liga|campeonato)\b/.test(q)||(P.comps.length&&/\bpack\b/.test(q)))return 'comp';
 if(/\bpack (de |do |da |dos )?(clube|clubes|equipa|equipas)\b/.test(q)||(P.teams.length&&/\bpack\b/.test(q)&&!/\bpack (de )?jogo\b/.test(q)))return 'clube';
 if(/\bpack (de |do |da )?(jogo|jogos|individual|por jogo)\b/.test(q))return 'jogo';
 return null}

function genericPrice(){
 const jr=jogoRange(),cr=compRange();
 return 'Pack Jogo: '+rng(jr)+' moedas. Pack Clube: '+P('clube',firstTeam())+' moedas. Pack Competição: '+rng(cr)+' moedas. Pack Modalidade (Futebol): '+modP()+' moedas.'+discNote()}

function packInfoAns(k,P){
 if(k==='clube'&&P.comps.length&&!P.teams.length)return R('Sim: o Pack Clube inclui os jogos do clube em todas as competições que existem na app, incluindo a '+SF.COMPS[P.comps[0]].n+'.',{set:{intent:'packinfo'}});
 let id=k==='clube'?(P.teams[0]||ctx.team):k==='comp'?(P.comps[0]||ctx.comp):k==='mod'?Object.keys(SF.SPORTS)[0]:null;
 if(k==='jogo'){return R('O Pack Jogo dá acesso a um jogo, em direto e em replay, com Watch Party, chat, votações e realidade aumentada. Custa '+rng(jogoRange())+' moedas, consoante o jogo, e o replay fica disponível '+(SF.SEASON&&SF.SEASON.replay?SF.SEASON.replay+' dias':'durante algum tempo')+' após o jogo.',{set:{intent:'packinfo'}})}
 if(!id){
  if(k==='clube')return R('O Pack Clube dá acesso a todos os jogos de um clube nas competições que existem na app e custa '+P_('clube')+' moedas. '+validTxt()+'Diz-me de que clube falas se quiseres os detalhes.',{set:{intent:'packinfo'}});
  if(k==='comp')return R('O Pack Competição dá acesso a todos os jogos de uma liga ou taça e custa '+rng(compRange())+' moedas, consoante a competição. '+validTxt(),{set:{intent:'packinfo'}});}
 const inf=SF.packInfo(k,id);
 return R(refName({k,id})+' custa '+moedas(SF.cost(k,id))+'. '+inf.escopo+(inf.validade?' Validade: '+inf.validade.replace(/^Até/,'até'):''),{go:'comparar',gol:'Abrir o comparador',set:{pack:{k,id},intent:'packinfo'}})}
const P_=(k)=>P(k,firstTeam());

/* qual compensa */
function compensAns(P){
 const t=P.teams[0]||(P.mine?null:null),c=P.comps[0];
 if(t){const up=upcoming().filter(g=>g.h===t||g.a===t),sum=up.reduce((a,g)=>a+g.price,0),cl=SF.cost('clube',t);
  if(!up.length)return R('Não há jogos de '+nm(t)+' marcados na app, por isso nada a comparar para já. O Pack Clube custa '+moedas(cl)+' e inclui os jogos que forem acrescentados.',{set:{team:t,pack:{k:'clube',id:t}}});
  return R(sum<=cl?'Para '+nm(t)+' tens '+pl(up.length,'jogo marcado','jogos marcados')+': em packs de jogo ficam '+moedas(sum)+', menos do que o Pack Clube ('+moedas(cl)+'). O Pack Clube compensa se quiseres ver mais jogos, porque inclui também os que forem acrescentados.'
   :'Para '+nm(t)+' tens '+pl(up.length,'jogo marcado','jogos marcados')+': em packs de jogo ficam '+moedas(sum)+', por isso o Pack Clube ('+moedas(cl)+') compensa e ainda inclui os jogos que forem acrescentados.',{go:'comparar',gol:'Abrir o comparador',set:{team:t,pack:{k:'clube',id:t},intent:'compensa'}})}
 if(c){const up=upcoming().filter(g=>g.comp===c),sum=up.reduce((a,g)=>a+g.price,0),cp=SF.cost('comp',c);
  return R(up.length?'Na '+SF.COMPS[c].n+' tens '+pl(up.length,'jogo marcado','jogos marcados')+' ('+moedas(sum)+' em packs de jogo). O Pack Competição custa '+moedas(cp)+'. '+(sum>cp?'Compensa.':'Compensa se quiseres seguir a competição toda, porque inclui também os jogos que forem acrescentados.'):'Ainda não há jogos da '+SF.COMPS[c].n+' na app. O Pack Competição custa '+moedas(cp)+'.',{go:'comparar',gol:'Abrir o comparador',set:{comp:c,pack:{k:'comp',id:c},intent:'compensa'}})}
 const jr=jogoRange();
 return R('Para poucos jogos, os packs de jogo ('+rng(jr)+' moedas cada) saem mais baratos. O Pack Clube ('+P_('clube')+') compensa quando queres vários jogos do mesmo clube e o de competição ('+rng(compRange())+') quando queres seguir uma liga. O Comparador calcula a combinação mais barata para os jogos que escolheres.',{go:'comparar',gol:'Abrir o comparador',set:{intent:'compensa'}})}

/* resolução da referência (jogo/pack) a partir da pergunta e do contexto */
function refFrom(P,follow){
 const k=kindOf(P);
 if(P.teams.length>=2){const g=h2h(P.teams[0],P.teams[1],false)||h2h(P.teams[0],P.teams[1],true);return {game:g,none:!g,teams:P.teams}}
 if(P.teams.length===1){
  const t=P.teams[0];
  if(k==='clube')return {ref:{k:'clube',id:t},team:t,game:gameFor(t,P.day)};
  return {game:gameFor(t,P.day),team:t}}
 if(P.comps.length){const c=P.comps[0];if(k==='comp'||/pack/.test(P.q)||!/\bjogo\b/.test(P.q))return {ref:{k:'comp',id:c},comp:c};return {game:upcoming().find(g=>g.comp===c&&onDay(g,P.day)),comp:c}}
 if(k==='mod')return {ref:{k:'mod',id:Object.keys(SF.SPORTS)[0]}};
 if(k==='clube'&&ctx.team&&follow)return {ref:{k:'clube',id:ctx.team},team:ctx.team};
 if(k==='comp'&&ctx.comp&&follow)return {ref:{k:'comp',id:ctx.comp},comp:ctx.comp};
 return null}

function refOf(r,P,follow){ // devolve {ref,team,game}
 if(!r){ // sem entidade nova → contexto
  if(P.day&&!/\b(pack|moedas)\b/.test(P.q))return null;
  if(ctx.game&&SF.game(ctx.game)&&(!k_(P)||k_(P)==='jogo'))return {ref:{k:'jogo',id:ctx.game},game:SF.game(ctx.game),team:ctx.team};
  if(ctx.pack)return {ref:ctx.pack,team:ctx.team};
  return null}
 if(r.ref)return r;
 if(r.game)return {ref:{k:'jogo',id:r.game.id},game:r.game,team:r.team,comp:r.comp};
 return r}
const k_=P=>kindOf(P);

/* ----- pergunta dinâmica (jogos, preços, saldo, resultados...) ----- */
const RX={
 left:/sobra|sobram|sobrar|sobraria|sobrava|resta|restam|restaria|fico com|ficaria com|ficava com|ficam me|saldo (depois|final|restante|apos)|depois (de|da) (comprar|compra)|se (eu )?comprar/,
 afford:/chega|chego|chegam|suficiente|bastam|basta|da para (comprar|pagar|ver)|posso (comprar|pagar)|consigo (comprar|pagar)|tenho moedas|tenho saldo|moedas (chegam|dao)/,
 balance:/\bsaldo\b|(quantas|quantos) moedas (flex )?(tenho|tem|possuo|disponiveis|me restam|existem na minha)|moedas (tenho|disponiveis)|o que tenho na carteira/,
 points:/(quantos|quantas) pontos|meus pontos|pontos (tenho|acumulados)/,
 compens:/compensa|vale a pena|melhor pack|qual (o |a )?(melhor )?pack|que pack|mais barato|mais barata|mais em conta|poup(ar|o|a|anca)/,
 packinfo:/(o que (inclui|abrange|cobre|traz|tem|e|sao)|inclui|incluido|incluidos|como funciona|explica|diferenca|para que serve|serve para)/,
 priceS:/custa|preco|quantas moedas|moedas (precisas|necessarias|preciso)|barato|barata|caro|cara/,
 result:/resultado|como (acabou|ficou|terminou|correu|foi o jogo|saiu)|quanto (ficou|foi|acabou|terminou|deu)|ficou quanto|quem (ganhou|venceu|perdeu)|ganhou|ganharam|venceu|venceram|perdeu|perderam|empatou|empataram|golos|marcou|marcaram|placard|score|ultimo jogo|jogou|jogaram/,
 priceW:/quanto (e|sai|fica|paga|pago|pagar|tenho de pagar|e que pago|vale|vai custar)/,
 when:/quando|comeca|termina|a que horas|que horas|\bhoras?\b|\bjoga\b|jogar|defronta|enfrenta|adversario|contra quem|com quem|calendario|agenda|proximo|tem jogo|tem jogos|ha jogos|ha jogo|vai jogar|recebe|visita|desloca|jornada|quantos jogos|que jogos|quais os jogos|quais sao os jogos|jogos (de|para|do|da|no|na)|\bjogo (de|do|da|no|na|para)\b/,
 recommend:/recomend|sugere|sugest|que jogo (ver|devo ver|vale a pena)|o que ver|o que devo ver|para ver/,
 own:/\b(que|quais|quantos|quantas) (jogos|pack).*(tenho|comprei|possuo)|\bo que (eu )?(tenho|comprei)|tenho algum (jogo|pack)/,
 count:/quantos jogos|quantos jogos tem/,
 buy:/\b(compr|adquir)/,
 watched:/quantos jogos (ja )?(vi|assisti)|jogos (que )?(ja )?(vi|assisti)/
};

const LISTWORDS=/^(jogo|jogos|joga|jogam|quem|que|quais|qual|o|a|os|as|ha|ver|para|de|do|da|dos|das|no|na|nos|nas|em|e|tem|tens|sao|um|uma|vai|vao|existe|existem|algum|alguns|algo|lista|mostra|diz|me|favor|jornada|proximo|hoje|amanha|semana|fim|sabado|domingo|segunda|terca|quarta|quinta|sexta|feira|dia|noite|tarde|manha|esta|este|estes|estas|mais|ainda|vamos|temos|ter|marcados|marcado|calendario|agenda|ve)$/;
const LISTISH=P=>P.q.split(' ').every(w=>LISTWORDS.test(w)||/^\d{1,2}(\/\d{1,2})?$/.test(w)||P.day.lbl.split(' ').includes(w));
function dynamic(P){
 const q=P.q;
 if(P.unknown.length)return null;
 const follow=/^(e|entao|mas|e entao|e se|e para)\b/.test(q)||/\b(esse|essa|esses|essas|desse|dessa|nesse|nessa|dele|dela|deles|delas|nele|nela|o mesmo|a mesma|aquele|aquela|deste|desta|neste|nesta|este jogo|esta equipa)\b/.test(q)||P.toks.length<=3;
 const k=kindOf(P);
 const hasEnt=P.teams.length||P.comps.length;
 // tipo de pergunta
 let T=null;
 if(RX.watched.test(q))T='watched';
 else if(RX.left.test(q))T='left';
 else if(RX.afford.test(q)&&(hasEnt||k||ctx.game||ctx.pack||/jogo|pack|moedas/.test(q)))T='afford';
 else if(RX.buy.test(q)&&(hasEnt||k)&&!/moedas/.test(q))T='buy';
 else if(RX.balance.test(q))T='balance';
 else if(RX.points.test(q))T='points';
 else if(RX.own.test(q))T='own';
 else if(RX.compens.test(q)&&(/pack|jogo|ver|comprar|moedas|pagar/.test(q)||hasEnt))T='compens';
 else if(k&&RX.packinfo.test(q)&&!RX.priceS.test(q))T='packinfo';
 else if(RX.priceS.test(q))T='price';
 else if(RX.result.test(q))T='result';
 else if(RX.priceW.test(q))T='price';
 else if(RX.count.test(q)&&(hasEnt||P.day))T='count';
 else if(RX.recommend.test(q)&&!P.day&&!hasEnt)T='recommend';
 else if(RX.when.test(q)&&!/adicionar|exportar|guardar|\bics\b|sincroniz|ate quando|validade|expira/.test(q))T='when';
 else if(P.day&&LISTISH(P))T='when';
 // seguimento sem tipo: "e o sporting?" / "e amanhã?"
 if(!T&&follow&&(hasEnt||P.day||P.mine)&&ctx.intent&&/^(e|entao|mas|e entao|e se|e para)\b/.test(q))T=ctx.intent==='packinfo'?'price':ctx.intent;
 // só uma entidade ("benfica", "fala-me do benfica", "informação sobre a champions")
 if(!T&&hasEnt){
  const rest=P.toks.filter(t=>!/^(fala|falar|me|do|da|de|dos|das|o|a|os|as|sobre|info|informacao|acerca|sabes|que|e|um|uma|diz|dize|conta|mostra|sei|pro|para|tudo|vs|versus|x|contra)$/.test(t));
  if(!rest.length){if(P.teams.length>=2)T='when';else return P.teams.length?teamAns(P.teams[0]):compAns(P.comps[0],P)}}
 if(!T)return null;
 if(P.mine&&!P.teams.length)return R('Ainda não escolheste nenhum clube. Podes escolher os clubes que segues em Perfil.',{go:'perfil',set:{}});

 if(T==='watched'){const w=SF.st.watched.length;return R(w?'Já viste '+pl(w,'jogo','jogos')+' na app.':'Ainda não viste nenhum jogo na app.',{set:{intent:'watched'}})}
 // --- saldo/pontos ---
 if(T==='balance')return R('Tens '+SF.st.coins+' Moedas Flex e '+pl(SF.st.points,'ponto','pontos')+'.',{go:'carteira',set:{intent:'balance'}});
 if(T==='points')return R('Tens '+pl(SF.st.points,'ponto','pontos')+'. Os pontos ganham-se a ver jogos, convidar amigos, cumprir missões e acertar previsões, e trocam-se por prémios.',{go:'premios',set:{intent:'points'}});
 if(T==='own'){
  const gs=SF.st.games.map(id=>SF.game(id)).filter(Boolean),pk=SF.st.packs;
  if(!gs.length&&!pk.length)return R('Ainda não compraste nenhum jogo nem pack. Os packs de jogo custam '+rng(jogoRange())+' moedas.',{go:'explorar',gol:'Explorar jogos',set:{intent:'own'}});
  return R('Tens '+(gs.length?pl(gs.length,'jogo comprado','jogos comprados'):'')+(gs.length&&pk.length?' e ':'')+(pk.length?pl(pk.length,'pack','packs')+' ('+join(pk.map(p=>refName(p)))+')':'')+'.',{go:'jogos',gol:'Os meus jogos',set:{intent:'own'}})}
 if(T==='recommend'){const r=SF.recs()[0];return R('Sugiro '+r.g.title+' ('+atTxt(r.g)+'). '+r.why+'. Custa '+moedas(SF.cost('jogo',r.g.id))+'.',{g:r.g.id,set:{game:r.g.id,intent:'when'}})}
 if(T==='compens')return compensAns(P);
 if(T==='packinfo')return packInfoAns(k,P);

 // --- preços / saldo depois / chega ---
 if(T==='price'||T==='left'||T==='afford'||T==='buy'){
  const noEnt=!hasEnt&&!k&&!P.day;
  const bare=P.toks.filter(t=>!/^(e|entao|mas|me|o|a|os|as|um|uma|quanto|custa|preco|sobra)$/.test(t)).length===0;
  const gate=hasEnt||k||P.day||/\b(jogo|jogos|pack|ver|assistir|bilhete|acesso|entrada|passe)\b/.test(q)||ctx.game||ctx.pack||bare||P.mine;
  if(!gate)return null;
  if(T==='price'&&noEnt&&!ctx.game&&!ctx.pack&&/\b(packs?|pacote|jogos)\b/.test(q)&&!/\b(esse|este|desse|neste)\b/.test(q)&&!/\bjogo\b/.test(q))return R(genericPrice(),{go:'carteira',set:{intent:'price'}});
  // só dia: "quanto custam os jogos de amanhã"
  if(T==='price'&&P.day&&!hasEnt){const gs=upcoming().filter(g=>onDay(g,P.day));
   return gs.length?R('Para '+P.day.lbl+': '+join(gs.slice(0,4).map(g=>g.title+' ('+moedas(SF.cost('jogo',g.id))+')'))+'.',{go:'explorar',gol:'Ver calendário',set:{game:gs[0].id,intent:'price'}}):R('Não tenho jogos marcados para '+P.day.lbl+'.',{set:{intent:'price'}})}
  if(T==='price'&&k&&!hasEnt&&!follow){
   const g={jogo:()=>'O Pack Jogo custa '+rng(jogoRange())+' moedas, consoante o jogo, e dá acesso a esse jogo e ao replay.',
    clube:()=>'O Pack Clube custa '+P_('clube')+' moedas e dá acesso a todos os jogos de um clube. '+validTxt().trim(),
    comp:()=>'O Pack Competição custa, em moedas: '+join(Object.keys(SF.COMPS).map(c=>SF.COMPS[c].n+' '+SF.cost('comp',c)))+'.',
    mod:()=>'O Pack Modalidade (Futebol) custa '+moedas(modP())+' e inclui todas as competições de futebol da app. '+validTxt().trim()}[k]();
   return R(g+discNote(),{go:'carteira',set:{intent:'price'}})}
  if((T==='left'||T==='afford')&&k&&!hasEnt&&!follow&&(k==='clube'||k==='mod')){const id=k==='clube'?firstTeam():Object.keys(SF.SPORTS)[0],c=SF.cost(k,id),C=SF.st.coins,nmk=k==='clube'?'o Pack Clube':'o Pack Modalidade';
   const o=T==='afford'?(C>=c?R('Sim, chega: '+nmk+' custa '+moedas(c)+' e tens '+moedas(C)+'.',{}):R('Ainda não chega: '+nmk+' custa '+moedas(c)+' e tens '+moedas(C)+' (faltam '+moedas(c-C)+').',{}))
    :(C>=c?R('Se comprares '+nmk+' ('+moedas(c)+'), ficas com '+moedas(C-c)+'. Tens '+moedas(C)+' neste momento.',{}):R('Não chegam as moedas para '+nmk+': custa '+moedas(c)+' e tens '+moedas(C)+'.',{}));
   o.go='carteira';o.set={intent:T};return o}
  let r=refFrom(P,follow);
  if(r&&r.none)return R('Não tenho nenhum jogo entre '+join(r.teams.map(nm))+' no calendário da demonstração.',{set:{intent:T}});
  const rr=refOf(r,P,follow);
  if(!rr||!rr.ref){
   if(r&&r.team&&!r.game&&!r.ref)return R('Não tenho nenhum jogo de '+nm(r.team)+' marcado no calendário, mas o Pack Clube custa '+moedas(SF.cost('clube',r.team))+' e inclui os jogos que forem acrescentados.',{set:{team:r.team,pack:{k:'clube',id:r.team},intent:T}});
   if(r&&r.comp&&!r.game&&!r.ref)return R('Não tenho jogos da '+SF.COMPS[r.comp].n+' marcados, mas o Pack Competição custa '+moedas(SF.cost('comp',r.comp))+'.',{set:{comp:r.comp,intent:T}});
   if(T==='price'&&k&&!hasEnt)return R(genericPrice(),{go:'carteira',set:{intent:'price'}});
   return R('De que jogo estás a falar?',{set:{intent:T}})}
  const ref=rr.ref,team=rr.team||(ref.k==='clube'?ref.id:null);
  const set={intent:T,game:ref.k==='jogo'?ref.id:null,pack:ref.k!=='jogo'?ref:(team?{k:'clube',id:team}:ctx.pack)};
  if(team)set.team=team;if(rr.comp)set.comp=rr.comp;if(ref.k==='comp')set.comp=ref.id;
  if(T==='left'){const o=leftRef(ref);o.set=Object.assign(o.set||{},set,{intent:'left'});if(ref.k==='jogo')o.g=ref.id;return o}
  if(T==='afford'){const o=affordRef(ref);o.set=Object.assign(o.set||{},set,{intent:'afford'});if(ref.k==='jogo')o.g=ref.id;return o}
  // preço
  if(T==='buy'){const o=R('Eu não faço compras por ti. '+priceRef(ref)+' '+(ref.k==='jogo'?'Abre o jogo e confirma a compra.':'Podes confirmá-la na Carteira ou no comparador.'),{set});if(ref.k==='jogo')o.g=ref.id;else o.go='carteira';return o}
  if(ref.k==='jogo'){
   const extra=team&&!hasAcc(ref)?' O Pack Clube, com todos os jogos de '+nm(team)+', custa '+moedas(SF.cost('clube',team))+'.':'';
   return R(priceRef(ref,extra),{g:ref.id,go:undefined,set})}
  return R(priceRef(ref,ref.k==='clube'||ref.k==='comp'||ref.k==='mod'?' '+SF.packInfo(ref.k,ref.id).escopo:''),{set})}

 // --- resultados ---
 if(T==='result'){
  const dn=finished();
  if(P.teams.length>=2){const g=h2h(P.teams[0],P.teams[1],true);
   if(g)return resultAns(g);
   const up=h2h(P.teams[0],P.teams[1],false);
   return up?R(up.title+' ainda não se jogou: é '+atTxt(up)+'.',{g:up.id,set:{game:up.id,intent:'result'}}):R('Não tenho nenhum jogo entre '+join(P.teams.map(nm))+' no calendário da demonstração.',{set:{intent:'result'}})}
  if(P.teams.length===1){const t=P.teams[0],g=lastDone(t);
   if(g)return Object.assign(resultAns(g),{set:{team:t,game:g.id,intent:'result'}});
   return R('Não tenho nenhum resultado de '+nm(t)+' na app.',{set:{team:t,intent:'result'}})}
  if(P.comps.length){const gs=dn.filter(g=>g.comp===P.comps[0]);
   if(!gs.length)return R('Não tenho resultados da '+SF.COMPS[P.comps[0]].n+' na app.',{set:{comp:P.comps[0],intent:'result'}});
   if(gs.some(SF.hidden))return R('Tens o modo sem spoilers ligado, por isso não revelo resultados. Podes desligá-lo em Perfil ou revelar jogo a jogo.',{go:'perfil',set:{comp:P.comps[0],intent:'result'}});
   return R('Resultados recentes da '+SF.COMPS[P.comps[0]].n+': '+gs.slice(0,3).map(g=>g.title+' '+rs(g)).join('; ')+'.',{set:{comp:P.comps[0],intent:'result'}})}
  const wantsList=/ultimo|recente|hoje|disponivel/.test(q)||/resultados/.test(P.raw?norm(P.raw):q);
  if(!wantsList&&ctx.game&&SF.game(ctx.game)&&SF.game(ctx.game).done)return resultAns(SF.game(ctx.game));
  if(!wantsList&&!P.day&&follow&&ctx.game&&!SF.game(ctx.game).done)return R(SF.game(ctx.game).title+' ainda não se jogou: é '+atTxt(SF.game(ctx.game))+'.',{g:ctx.game,set:{intent:'result'}});
  if(!wantsList)return R('De que jogo estás a falar?',{set:{intent:'result'}});
  const d=dn.slice(0,5);
  if(d.some(SF.hidden))return R('Tens o modo sem spoilers ligado, por isso não revelo resultados. Podes desligá-lo em Perfil ou revelar jogo a jogo.',{go:'perfil',set:{intent:'result'}});
  if(/ultimo/.test(q)&&!/resultados/.test(q))return resultAns(d[0]);
  return R('Resultados mais recentes na app: '+d.map(g=>g.title+' '+rs(g)).join('; ')+'.',{set:{game:d[0].id,intent:'result'}})}

 // --- contagem ---
 if(T==='count'){
  if(P.teams.length){const t=P.teams[0],n=upcoming().filter(g=>g.h===t||g.a===t).length;return R(n?nm(t)+' tem '+pl(n,'jogo','jogos')+' marcados na app.':'Não tenho jogos de '+nm(t)+' marcados na app.',{set:{team:t,intent:'count'}})}
  if(P.comps.length){const c=P.comps[0],n=upcoming().filter(g=>g.comp===c).length;return R(n?'A '+SF.COMPS[c].n+' tem '+pl(n,'jogo','jogos')+' marcados na app.':'Não tenho jogos da '+SF.COMPS[c].n+' marcados na app.',{set:{comp:c,intent:'count'}})}
  if(P.day){const n=upcoming().filter(g=>onDay(g,P.day)).length;return R(n?'Para '+P.day.lbl+' tenho '+pl(n,'jogo','jogos')+'.':'Não tenho jogos marcados para '+P.day.lbl+'.',{set:{intent:'count'}})}}

 // --- quando / que jogos ---
 if(T==='when'){
  if(P.mine&&P.teams.length){const ls=P.teams.slice(0,3).map(tm=>whenTeam(tm,P.day));return R(ls.map(x=>x.t).join(' '),{g:ls[0].g,set:ls[0].set})}
  if(P.teams.length>=2){const g=h2h(P.teams[0],P.teams[1],false);if(g)return gameInfo(g);
   const d=h2h(P.teams[0],P.teams[1],true);if(d)return resultAns(d);
   return R('Não tenho nenhum jogo entre '+join(P.teams.map(nm))+' no calendário da demonstração.',{set:{intent:'when'}})}
  if(P.teams.length===1){
   if(/\b(estadio|fundad|fundacao|alcunha)\b/.test(q)&&FACT[P.teams[0]])return teamFact(P.teams[0],q);
   return whenTeam(P.teams[0],P.day)}
  if(P.comps.length){
   if(/quantos|quantas|equipa|clube|jornadas|participantes/.test(q))return compAns(P.comps[0],P);
   if(P.day)return listDay(P,P.day);
   const up=upcoming().filter(g=>g.comp===P.comps[0]);
   if(!up.length)return R('Não tenho jogos da '+SF.COMPS[P.comps[0]].n+' marcados no calendário desta demonstração. O Pack Competição custa '+moedas(SF.cost('comp',P.comps[0]))+'.',{set:{comp:P.comps[0],game:null,intent:'when'}});
   return R('Próximos jogos da '+SF.COMPS[P.comps[0]].n+': '+join(up.slice(0,3).map(g=>g.title+' ('+whenShort(g)+')'))+'.',{g:up[0].id,set:{comp:P.comps[0],game:up[0].id,intent:'when'}})}
  if(P.day)return listDay(P,P.day);
  if(follow&&ctx.team&&/\b(adversario|contra quem|com quem|quando|horas|hora|dia|proximo|jogo|joga)\b/.test(q)&&/\b(esse|dele|dela|nele|e o|e a|adversario|contra quem|com quem)\b/.test(q))return whenTeam(ctx.team);
  if(/\bproximo\b|\bque jogos\b|\bquais os jogos\b|calendario|agenda|o que ha|ha jogos|tem jogo/.test(q)){
   const nx=upcoming().slice(0,3);return R('Próximos jogos: '+join(nx.map(g=>g.title+' ('+whenShort(g)+')'))+'.',{g:nx[0].id,set:{game:null,intent:'when'}})}
  if(ctx.team&&follow)return whenTeam(ctx.team);
  if((/quando|a que horas|que horas|comeca|termina|contra quem|com quem|adversario/.test(q))&&!/como se/.test(q))return R('De que equipa ou jogo estás a falar?',{set:{intent:'when'}});
  return null}
 return null}

function teamFact(id,q){const f=FACT[id];
 if(/estadio/.test(q))return R(nm(id)+' joga no '+f.e+'.',{set:{team:id}});
 if(/fund/.test(q)&&f.f)return R(nm(id)+' foi fundado em '+f.f+'.',{set:{team:id}});
 if(/alcunha/.test(q)&&f.n)return R(nm(id)+' é conhecido como "'+f.n+'".',{set:{team:id}});
 return teamAns(id)}

/* ----- conhecimento escrito (FAQ) ----- */
const test=(k,q)=>Array.isArray(k)?k.every(r=>r.test(q)):k.test(q);
function faq(P){const q=P.q;
 // factos de clubes
 if(P.teams.length===1&&/\b(estadio|fundad|fundacao|alcunha)\b/.test(q)&&FACT[P.teams[0]])return teamFact(P.teams[0],q);
 // perguntas simples sobre a quantidade de jogos/equipas de uma competição
 if(P.comps.length===1&&/\b(quantos|quantas)\b.*\b(equipa|clube|jornadas|participantes)\b/.test(q))return compAns(P.comps[0],P);
 for(const e of FAQ){if(P.teamsExplicit.length&&!e.ent)continue;if(!test(e.k,q))continue;
  if(!(TPL.test(q)||P.tokens.length<=10))continue;
  return R(typeof e.a==='function'?e.a():e.a,{go:e.go,gol:e.gol,id:e.id,set:{}})}
 return null}

/* ----- conversa e cortesia ----- */
function smalltalk(q){
 if(/^(ola|oi|hey|ei|eae|bom dia|boa tarde|boa noite|boas)( |$)/.test(q)&&q.split(' ').length<=3)return R('Olá! Sou o assistente SportFlex. Pergunta-me por jogos, preços, resultados ou como funciona a app.');
 if(/^(muito |imenso )?(obrigado|valeu|thanks|agradeco|grato)\b/.test(q))return R('De nada! Se tiveres mais dúvidas, é só perguntar.');
 if(/^(adeus|tchau|ate logo|ate ja|ate amanha|xau)\b/.test(q))return R('Até já! Bons jogos.');
 if(/^(ok|certo|percebi|entendi|boa|fixe|top|perfeito|combinado|beleza)\b/.test(q)&&q.split(' ').length<=2)return R('Combinado. Se precisares de mais alguma coisa, é só dizer.');
 if(/^(como estas|tudo bem|como vai|que tal)\b/.test(q))return R('Estou bem, obrigado! Em que posso ajudar-te?');
 if(/quem te (criou|fez|desenvolveu|programou|inventou|construiu)|quem (criou|fez|desenvolveu|programou|inventou|construiu) (a|esta|essa|o) (app|aplicacao|sportflex|assistente)|quem e o (teu )?(criador|dono|programador)|quem esta por tras|criador da app|autor da app|dono da app/.test(q))return R(CREATOR,{creator:true});
 if(/como me chamo|qual e o meu nome|sabes o meu nome/.test(q))return R(SF.st.name?'Chamas-te '+SF.st.name+'.':'Ainda não me disseste o teu nome. Podes escrevê-lo em Perfil.',SF.st.name?{}:{go:'perfil'});
 return null}

/* ================= 5. RESPONDER ================= */
function answer(raw){
 const P=parse(raw);
 if(!P.q)return R(FALLBACK,{fb:true});
 let q0=P.q.replace(/^(ola|oi|hey|ei|bom dia|boa tarde|boa noite|boas) /,'').replace(/ (por favor|favor|obrigado|xd|haha|ahah|lol)$/,'').replace(/^(por favor|favor|diz me|diz|sabes|podes dizer me|podes dizer|queria saber|quero saber|gostava de saber|diz me la) /,'').trim();
 let R0=smalltalk(P.q);
 if(!R0){
  const P2=q0!==P.q?parse(q0):P;
  const generic=!P2.teams.length&&!P2.comps.length&&!P2.day&&!kindOf(P2);
  R0=generic?(faq(P2)||dynamic(P2)):(dynamic(P2)||faq(P2))}
 if(!R0)return R(FALLBACK,{fb:true});
 // atualizar o contexto da conversa
 if(R0.set){const s=R0.set;if('game' in s&&!('team' in s))ctx.team=null;if('game' in s&&!('comp' in s))ctx.comp=null;Object.keys(s).forEach(k=>{if(s[k]!==undefined)ctx[k]=s[k]})}
 const out={t:R0.t};['g','go','gl','gol','id','creator'].forEach(k=>{if(R0[k]!==undefined)out[k]=R0[k]});
 if(out.g===undefined)delete out.g;
 return out}

const local=raw=>answer(raw);
function selfTest(){ // devolve as perguntas de exemplo que NÃO dão a resposta esperada (usado nos testes)
 const bad=[];FAQ.forEach(e=>(e.ex||[]).forEach(x=>{resetCtx();const r=answer(x);if(r.t===FALLBACK||r.id!==e.id)bad.push([e.id,x,r.id||'(fallback)'])}));resetCtx();return bad}

SF.ai={FALLBACK,CREATOR,local,answer,parse,reset:resetCtx,ctx:()=>Object.assign({},ctx),selfTest,FAQ,
 add:e=>FAQ.push(e),
 // o chat chama isto: responde no próprio aparelho, sem rede
 async reply(q){const r=answer(q);await new Promise(res=>setTimeout(res,300+Math.random()*260));return r}};
})();
