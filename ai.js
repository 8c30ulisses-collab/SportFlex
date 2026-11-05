/* Assistente SportFlex.
   1) Modo local: base de conhecimento dentro da app (funciona sempre, sem rede nem custos).
   2) Modo IA: se existir o servidor /api/chat (ver LEIA-ME), as perguntas vão para um modelo de IA a sério.
      Se o servidor não existir ou falhar, a app usa o modo local sem avisar o utilizador. */
(function(){
const SF=window.SF;
const CREATOR='O criador da app é das melhores pessoas que conheço e bem gatao';
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9+\s]/g,' ').replace(/\s+/g,' ').trim();
const has=(q,...w)=>w.some(x=>x instanceof RegExp?x.test(q):q.includes(x));
const P=(k,id)=>SF.packPrice(k,id);

/* ---------- equipas ---------- */
const EXTRA={rma:['real madrid','madrid'],fcb:['barcelona','barca'],atm:['atletico'],mun:['man utd','man united','united'],mci:['man city'],bay:['bayern'],psg:['psg','paris'],
 spo:['sporting','scp','leoes'],por:['porto','fcp','dragoes'],ben:['benfica','slb','aguias'],bra:['braga','scb'],vsc:['guimaraes','vitoria sc'],sev:['sevilha','sevilla'],ala:['alaves'],
 int:['inter de milao','inter milan','inter'],mil:['milan'],bvb:['dortmund'],juv:['juventus','juve'],liv:['liverpool'],ars:['arsenal'],che:['chelsea'],rom:['roma'],avl:['aston villa'],
 eam:['estrela da amadora','amadora'],avi:['academico de viseu','viseu'],cpi:['casa pia'],scl:['santa clara'],gil:['gil vicente'],rav:['rio ave'],mrt:['maritimo'],est:['estoril'],mor:['moreirense'],
 fam:['famalicao'],aro:['arouca'],nac:['nacional'],alv:['alverca']};
const FACT={ben:'Fundado em 1904, joga no Estádio da Luz e é conhecido como "as Águias".',spo:'Fundado em 1906, joga no Estádio José Alvalade e é conhecido como "os Leões".',
 por:'Fundado em 1893, joga no Estádio do Dragão e é conhecido como "os Dragões".',bra:'Fundado em 1921, joga no Estádio Municipal de Braga, também chamado "a Pedreira".',
 rma:'Fundado em 1902, joga no Estádio Santiago Bernabéu, em Madrid.',fcb:'Fundado em 1899, joga em Barcelona, no Camp Nou.',bay:'Joga na Allianz Arena, em Munique.',
 psg:'Joga no Parc des Princes, em Paris.',liv:'Joga em Anfield.',mun:'Joga em Old Trafford.',ars:'Joga no Emirates Stadium, em Londres.',mci:'Joga no Etihad Stadium, em Manchester.'};
function teamsIn(q){const out=[];Object.keys(SF.TEAMS).forEach(id=>{const al=[norm(SF.TEAMS[id].n),...(EXTRA[id]||[])];if(al.some(a=>a.length>=3&&new RegExp('(^| )'+a.replace(/[+]/g,'\\+')+'( |$)').test(q)))out.push(id)});
 // preferir nomes mais longos (evita "inter" dentro de outro nome)
 return out.slice(0,2)}
const rs=g=>SF.hidden(g)?'(resultado oculto pelo modo sem spoilers)':g.hs+'-'+g.as;
const gl=g=>g.title+' ('+SF.when(g).toLowerCase()+', '+SF.COMPS[g.comp].n+')';
function teamAnswer(id){const T=SF.TEAMS[id],up=SF.GAMES.filter(g=>!g.done&&(g.h===id||g.a===id)),dn=SF.GAMES.filter(g=>g.done&&(g.h===id||g.a===id));
 let t=T.n+'. '+(FACT[id]||'Está na app como escudo genérico.');
 if(up.length)t+=' Próximo jogo: '+gl(up[0])+'.';if(dn.length){const d=dn[0];t+=' Último resultado na app: '+d.title+' '+rs(d)+' ('+d.lbl+').'}
 if(!up.length&&!dn.length)t+=' Ainda não tenho jogos dele no calendário desta demonstração.';
 t+=' O Pack Clube custa '+P('clube',id)+' moedas.';return {t,g:up[0]&&up[0].id}}
const compKeys={ucl:['champions','liga dos campeoes','ucl'],lali:['la liga','laliga','liga espanhola'],prem:['premier league','premier','liga inglesa'],
 seri:['serie a','liga italiana'],bund:['bundesliga','liga alema'],lig1:['ligue 1','liga francesa'],liga:['liga portugal','liga betclic','primeira liga','liga']};
const compFact={liga:'A Liga Portugal tem 18 clubes e 34 jornadas.',ucl:'A Liga dos Campeões tem, desde 2024/25, uma fase de liga com 36 equipas, cada uma com 8 jogos, seguida de play-offs e eliminatórias.',
 lali:'A La Liga tem 20 clubes e 38 jornadas.',prem:'A Premier League tem 20 clubes e 38 jornadas.',seri:'A Serie A tem 20 clubes e 38 jornadas.',bund:'A Bundesliga tem 18 clubes e 34 jornadas.',lig1:'A Ligue 1 tem 18 clubes e 34 jornadas.'};
function compIn(q){for(const k in compKeys)if(compKeys[k].some(a=>new RegExp('(^| )'+a+'( |$)').test(q)))return k;return null}
function compAnswer(c){const up=SF.GAMES.filter(g=>g.comp===c&&!g.done),dn=SF.GAMES.filter(g=>g.comp===c&&g.done);
 let t=compFact[c]+' O Pack Competição custa '+P('comp',c)+' moedas.';
 if(up.length)t+=' Próximos jogos na app: '+up.slice(0,3).map(gl).join('; ')+'.';else t+=' O calendário desta competição ainda não está na demonstração.';
 if(dn.length)t+=' Resultados recentes: '+dn.slice(0,3).map(g=>g.title+' '+rs(g)).join('; ')+'.';return {t,g:up[0]&&up[0].id}}

/* ---------- conhecimento de futebol ---------- */
const FOOT=[
 [/fora de jogo|offside/,'Um jogador está em posição de fora de jogo se, no momento do passe, estiver na metade do adversário e mais perto da linha de baliza do que a bola e o penúltimo adversário. Só é punido se participar no lance. Não há fora de jogo num pontapé de baliza, num lançamento lateral ou num canto.'],
 [/\bvar\b|video arbitro|videoarbitro/,'O VAR (árbitro de vídeo) ajuda o árbitro em quatro tipos de lance: golos, grandes penalidades, cartões vermelhos diretos e troca de identidade. A decisão final é sempre do árbitro principal.'],
 [/penalti|grande penalidade/,'O penálti é marcado a 11 metros da baliza, após uma falta cometida dentro da grande área. Só o guarda-redes pode defender e os restantes jogadores ficam fora da área até o pontapé ser dado.'],
 [/cartao|expuls|amarelo|vermelho/,'O cartão amarelo é uma advertência e o vermelho é expulsão. Dois amarelos no mesmo jogo dão vermelho. Quem é expulso sai do jogo e a equipa fica a jogar com menos um.'],
 [/quanto tempo|duracao|minutos|prolongamento|descontos/,'Um jogo tem 90 minutos, em duas partes de 45, com 15 minutos de intervalo. O árbitro acrescenta os descontos. Em jogos a eliminar, se persistir o empate, há prolongamento de 2 partes de 15 minutos e, se for preciso, desempate por penáltis.'],
 [/quantos jogadores|jogadores em campo|numero de jogadores/,'Cada equipa joga com 11 jogadores em campo, um deles guarda-redes. O jogo não pode continuar se uma equipa ficar com menos de 7.'],
 [/substitui/,'Na maioria das competições cada equipa pode fazer até 5 substituições, em 3 momentos do jogo mais o intervalo. As regras exatas dependem da competição.'],
 [/pontos|classificacao|desempate|vitoria vale/,'Nas ligas, a vitória vale 3 pontos, o empate 1 e a derrota 0. Em caso de igualdade, os critérios de desempate (confronto direto, diferença de golos, etc.) variam de liga para liga.'],
 [/golo fora|regra do golo/,'A regra do golo fora foi abolida nas competições da UEFA a partir da época 2021/22. Agora, em caso de empate no conjunto das duas mãos, vai-se a prolongamento.'],
 [/tamanho do campo|dimensoes|campo mede/,'Os campos profissionais têm cerca de 105 x 68 metros. O regulamento permite entre 90 e 120 metros de comprimento e 45 e 90 de largura.'],
 [/hat.?trick|hattrick/,'Hat-trick é quando um jogador marca 3 golos no mesmo jogo.'],
 [/clean sheet|baliza inviolada/,'Baliza inviolada (clean sheet) é um jogo em que a equipa não sofre golos.'],
 [/\bxg\b|golos esperados|expected goals/,'O xG (golos esperados) mede a qualidade das oportunidades: cada remate recebe um valor entre 0 e 1 consoante a probabilidade de ser golo, tendo em conta distância, ângulo e tipo de lance.'],
 [/derbi|dérbi|classico|clássico/,'Dérbi é um jogo entre rivais da mesma cidade ou região, como Benfica-Sporting (Dérbi de Lisboa). Em Portugal, o Benfica-Porto e o Sporting-Porto também são jogos de grande rivalidade, assim como o Real Madrid-Barcelona em Espanha, o "El Clásico".'],
 [/formacao|tatica|4 ?3 ?3|4 ?4 ?2|3 ?5 ?2/,'A formação diz quantos jogadores há em cada zona, da defesa para o ataque. Num 4-3-3 há 4 defesas, 3 médios e 3 avançados; num 4-4-2, 4 defesas, 4 médios e 2 avançados. Cada treinador adapta-a ao jogo.'],
 [/posicoes|posicao|guarda.?redes|defesa central|lateral|medio|avancado|extremo/,'As posições principais são: guarda-redes; defesas (centrais e laterais); médios (defensivos, centrais e ofensivos); e avançados (pontas de lança e extremos).'],
 [/escanteio|canto|pontape de canto/,'O canto é marcado quando a bola sai pela linha de fundo depois de tocar num defensor. A equipa atacante bate-o a partir do vértice do campo.'],
 [/mundial|copa do mundo/,'O Campeonato do Mundo de seleções realiza-se de 4 em 4 anos. A edição de 2026 foi organizada em conjunto por Estados Unidos, Canadá e México, pela primeira vez com 48 seleções. Para resultados e vencedores consulta a FIFA, porque não tenho esses dados confirmados aqui.'],
 [/euro 2016|europeu de 2016|campeao europeu/,'Portugal conquistou o Campeonato da Europa em 2016, em França, ao vencer a seleção francesa por 1-0 no prolongamento da final, com golo de Éder.'],
 [/euro\b|europeu/,'O Campeonato da Europa de seleções (Euro) realiza-se de 4 em 4 anos. Portugal venceu a edição de 2016.'],
 [/ronaldo|cr7/,'Cristiano Ronaldo nasceu no Funchal, na Madeira, em 1985, e é o melhor marcador de sempre da seleção portuguesa. Para o clube atual e estatísticas atualizadas, consulta uma fonte oficial.'],
 [/messi/,'Lionel Messi nasceu em Rosário, na Argentina, em 1987, e é um dos melhores jogadores da história. Para o clube atual e estatísticas atualizadas, consulta uma fonte oficial.'],
 [/taca de portugal/,'A Taça de Portugal é a prova a eliminar do futebol português, aberta a clubes de vários escalões, com final no Estádio Nacional, no Jamor.'],
 [/europa league|liga europa|conference/,'A Liga Europa e a Liga Conferência são as outras duas provas de clubes da UEFA. Ainda não têm jogos na demonstração.']
];

/* ---------- app ---------- */
const APP=[
 [/comparador|comparar (os )?packs?|combinacao mais barata|poupar|quanto posso poupar/,()=>'O Comparador de packs ajuda-te a pagar só pelo que queres ver: marcas os jogos e a app calcula a combinação mais barata de packs (jogo, clube, competição ou Pack Futebol), explica quanto poupas e deixa-te comprar tudo de uma vez. Está em Explorar e na Carteira.',{go:'comparar'}],
 [/os meus jogos|meus acessos|meus packs|o que (eu )?comprei|validade dos packs|ate quando (vale|e valido)/,()=>'Em "Os meus jogos" vês os packs que tens, a validade de cada um, os próximos jogos incluídos (com botão para ver) e os replays disponíveis. Os packs de clube, competição e modalidade valem até 30 jun 2027.',{go:'jogos'}],
 [/spoiler/,()=>'O modo sem spoilers (Perfil > Jogos e avisos) esconde os resultados e os momentos dos replays. Podes ver o jogo desde o início ou revelar o resultado quando quiseres.',{go:'perfil'}],
 [/preco|custa|quanto|barato|caro/,()=>'Pack Jogo: 1 a 3 moedas. Pack Clube: 9 moedas, todos os jogos do clube até 30 jun 2027. Pack Competição: 10 a 18 moedas. Pack Modalidade (Futebol): 45 moedas, inclui todas as competições de futebol. Podes comprar moedas na carteira (10 por 4,99 €, 25+5 por 9,99 €, 60+20 por 19,99 €). Nesta demonstração nada é cobrado.',{go:'carteira'}],
 [/pack|pacote|modular|modulo|subscri|mensalidade/,()=>'Na SportFlex não há mensalidade: compras só o que queres ver. Há 4 tipos de pack: Jogo (um jogo e o replay durante 30 dias), Clube (todos os jogos de um clube), Competição (uma liga ou taça) e Modalidade (todas as competições de futebol). Clube, Competição e Modalidade valem até 30 jun 2027, com replays durante 30 dias após cada jogo. Antes de comprar vês o âmbito, a validade, os replays e as exclusões. Pagas com Moedas Flex e as moedas não expiram.'],
 [/moeda|saldo|carteira|comprar moedas|carregar/,()=>'Tens '+SF.st.coins+' Moedas Flex. Na carteira podes comprar mais, ver o histórico e enviar packs a amigos. Os pagamentos são simulados nesta demonstração.',{go:'carteira'}],
 [/watch ?party|ver com amigos|videochamada|amigos/,()=>'A Watch Party deixa-te ver o jogo com amigos à distância: vídeo dos amigos, reações, chat e votações ao vivo, tudo no mesmo ecrã. Abre um jogo e escolhe o separador Watch Party, ou usa o botão no Home. Há sincronização: podes voltar ao momento do anfitrião ou ligar a sincronização automática, para ninguém festejar um golo antes dos outros (nesta demonstração os atrasos são simulados).'],
 [/replay|momentos|resumo|desde o inicio/,()=>'O replay inteligente mostra só os momentos-chave de um jogo (golos e lances importantes), para quem chega atrasado ou quer rever depressa, e também podes ver o jogo desde o início. Com o modo sem spoilers ligado, o resultado e os momentos ficam ocultos até os revelares. Nesta demonstração os minutos dos momentos são ilustrativos.'],
 [/realidade aumentada|\bar\b|\bra\b/,()=>'A realidade aumentada coloca informação sobre o campo, como posições e estatísticas, enquanto vês o jogo. Abre um jogo e escolhe o separador AR; usa "Simular jogo ao vivo" para ver em ação.'],
 [/simul|ao vivo|direto|transmiss|video/,()=>'A app não tem vídeo real nem direitos de transmissão: é uma demonstração. O botão "Simular jogo ao vivo" mostra como seria uma transmissão, com campo animado, golos, chat, votações e realidade aumentada.'],
 [/essencial|idosos|acessib|letra grande|tamanho do texto|\bvoz\b|comandos por voz/,()=>'O Modo Essencial mostra só os jogos do teu clube, com botões grandes e menos opções. Em Perfil também podes mudar o tamanho do texto e testar os comandos por voz (simulados).',{go:'perfil'}],
 [/ponto|premio|ranking|missao|missoes|previsao|previsoes|recompensa/,()=>'Tens '+SF.st.points+' pontos. Ganhas pontos a ver jogos, a convidar amigos, a cumprir missões e a acertar previsões (50 pontos se acertares o resultado, 15 se acertares o vencedor). Podes trocá-los por prémios em Recompensas.',{go:'premios'}],
 [/oferec|enviar|presente|presentear/,()=>'Na carteira, toca em "Enviar a amigo", escolhe o amigo e o jogo. Ele recebe o acesso na hora e tu ganhas 15 pontos.',{go:'carteira'}],
 [/\b(tema|temas|cor|cores|modo escuro)\b/,()=>'Em Perfil > Tema podes escolher a cor da app entre 7 opções, incluindo vermelho e rosa.',{go:'perfil'}],
 [/(mudo|mudar|alterar|trocar|escolher) (o )?(meu )?nome|mudar (de )?clube|clubes que sigo|equipa favorita/,()=>'Em Perfil escolhes os clubes que segues. Para mudares o nome, escreve-o no cartão do topo do Perfil.',{go:'perfil'}],
 [/notific|alerta|lembrar|lembrete/,()=>'Em cada jogo, toca em "Lembrar-me" para escolheres a antecedência (5 minutos a 1 dia) e, se quiseres, adicionares o jogo ao calendário. Em Perfil ativas os alertas e defines a antecedência predefinida. Nesta demonstração o aviso da app é simulado, mas o alarme do ficheiro de calendário é real.'],
 [/instal|telemovel|telefone|computador|\bpc\b|offline|sem rede|dobravel/,()=>'A SportFlex é uma app web instalável: no Android usa o menu do Chrome > Instalar aplicação, no iPhone usa o Safari > Partilhar > Adicionar ao ecrã principal, e no computador usa o ícone de instalar na barra de endereços. Adapta-se a telemóvel, dobrável e computador, e abre mesmo sem rede.'],
 [/dados reais|dados atualizados|calendario real|\bfontes?\b|fiavel|atualiza/,()=>SF.DATA_LBL+'. Os jogos e resultados foram recolhidos de fontes públicas (Liga Portugal, La Liga e Champions League). Não se atualizam sozinhos e podem ter imprecisões. Para dados em tempo real é preciso ligar a uma API desportiva.'],
 [/emblema|escudo|logotipo|logo oficial/,()=>'Os emblemas são escudos genéricos criados para este projeto, porque os oficiais pertencem aos clubes. Quando houver autorização, podem ser acrescentados.'],
 [/privacidade|dados pessoais|\bconta\b|\bguardad/,()=>'Não há contas nesta demonstração. As tuas moedas, packs e preferências ficam guardados só no teu aparelho.'],
 [/o que (e|és|es) a sportflex|o que faz|para que serve|funcionalidades|o que sabes|ajuda|como funciona/,()=>'A SportFlex é uma app de streaming desportivo modular: pagas só pelo que queres ver (jogo, clube, competição ou modalidade). Tem recomendações personalizadas, Watch Party, replay inteligente, realidade aumentada, carteira com Moedas Flex, recompensas, Modo Essencial e assistente. Pergunta-me o que quiseres sobre a app ou sobre futebol.']
];

/* ---------- motor local ---------- */
function local(raw){const q=norm(raw);
 if(!q)return {t:'Escreve uma pergunta e eu respondo.'};
 if(has(q,/criador|quem (te )?(criou|fez|desenvolveu|programou|inventou|construiu|esta por tras)|quem (e|foi) o (teu )?(criador|dono|programador)|autor|dono da app|programador|quem esta por tras/))return {t:CREATOR};
 if(/^(ola|oi|bom dia|boa tarde|boa noite|hey|ei)\b/.test(q))return {t:'Olá! Sou o assistente SportFlex. Posso falar de futebol (regras, clubes, competições, jogos) e explicar tudo o que a app faz. O que queres saber?'};
 if(has(q,/quem es tu|quem es voce|como te chamas|es uma ia|es um robo|es humano/))return {t:'Sou o assistente da SportFlex. Respondo a perguntas sobre futebol e sobre tudo o que a app faz.'};
 if(/^(obrigad|valeu|thanks)/.test(q))return {t:'De nada! Se tiveres mais dúvidas sobre futebol ou sobre a app, é só perguntar.'};
 for(const [re,t] of FOOT.filter(f=>/euro 2016|mundial/.test(f[0].source)))if(re.test(q))return {t};
 if(has(q,/spoiler/))return {t:'O modo sem spoilers (Perfil > Jogos e avisos) esconde os resultados e os momentos dos replays. Podes ver o jogo desde o início ou revelar o resultado quando quiseres.'+(SF.st.nospoil?' Está ligado agora, por isso não revelo resultados.':''),go:'perfil'};
 // jogos dinâmicos
 if(has(q,/melhor marcador|melhores marcadores|goleador|artilheiro|tabela classificativa|classificacao atual|quem lidera|quem esta em primeiro/))return {t:'Não tenho classificações nem marcadores atualizados nesta demonstração, só o calendário e os resultados de '+SF.SNAPSHOT+'. Para isso consulta o site oficial da competição.'};
 if(has(q,/resultado|resultados|como (acabou|ficou|correu)|quanto ficou|ganhou|perdeu/)&&!teamsIn(q).length){const d=SF.GAMES.filter(g=>g.done).slice(0,5);if(d.some(SF.hidden))return {t:'Tens o modo sem spoilers ligado, por isso não revelo resultados. Podes desligá-lo em Perfil ou revelar jogo a jogo.',go:'perfil'};return {t:'Resultados mais recentes na app: '+d.map(g=>g.title+' '+rs(g)).join('; ')+'.'}}
 if(has(q,/hoje|amanha|proximos jogos|que jogos|jogos de|calendario|o que ha para ver|esta semana|fim de semana|jornada/)&&!compIn(q)&&!teamsIn(q).length){const nx=SF.GAMES.filter(g=>!g.done).slice(0,4);return {t:'Próximos jogos: '+nx.map(gl).join('; ')+'.',g:nx[0].id}}
 if(has(q,/recomend|sugere|sugest|que jogo (ver|devo)|o que ver/)){const r=SF.recs()[0];return {t:'Sugiro '+r.g.title+'. '+r.why+'. Custa '+SF.cost('jogo',r.g.id)+' moedas.',g:r.g.id}}
 const tm=teamsIn(q);if(tm.length===2){const a=tm[0],b=tm[1],g=SF.GAMES.find(x=>(x.h===a&&x.a===b)||(x.h===b&&x.a===a));
  if(g)return {t:g.done?g.title+' terminou '+rs(g)+' ('+g.lbl+').':g.title+': '+SF.when(g).toLowerCase()+', '+SF.COMPS[g.comp].n+'. Custa '+SF.cost('jogo',g.id)+' moedas.',g:g.done?undefined:g.id};
  return {t:'Não tenho nenhum jogo entre '+SF.TEAMS[a].n+' e '+SF.TEAMS[b].n+' no calendário da demonstração.'}}
 // app antes de clubes quando a pergunta é claramente sobre a app
 if(has(q,/\bapp\b|sportflex|aplicacao|moedas flex|modo essencial|pack |carteira|watch ?party|(mudo|mudar|alterar|trocar) (o )?(meu )?nome/)){for(const [re,fn,o] of APP)if(re.test(q))return Object.assign({t:fn()},o||{})}
 if(tm.length===1&&!has(q,/regra|o que (e|significa)/))return teamAnswer(tm[0]);
 const c=compIn(q);if(c)return compAnswer(c);
 for(const [re,t] of FOOT)if(re.test(q))return {t};
 for(const [re,fn,o] of APP)if(re.test(q))return Object.assign({t:fn()},o||{});
 if(/futebol|golo|jogador|treinador|clube|equipa|selecao|campeonato|liga|taca|jogo/.test(q))return {t:'Essa pergunta de futebol está fora do que tenho guardado nesta versão. Consigo falar de regras, formações, competições, clubes e jogos da app. Para dados muito recentes, consulta a fonte oficial da competição.'};
 return {t:'Sou especialista em futebol e na SportFlex. Experimenta perguntar por jogos de hoje, regras (como o fora de jogo), clubes, competições, preços dos packs ou como funciona a Watch Party.'}}

/* ---------- ligação à IA real (opcional) ---------- */
SF.AI_URL='/api/chat';
SF.ai={CREATOR,local,
 context(){const g=a=>a.map(x=>x.title+' | '+SF.COMPS[x.comp].n+' | '+(x.done?rs(x)+' ('+x.lbl+')':SF.when(x))+' | pack jogo '+SF.packPrice('jogo',x.id)+' moedas').join('\n');
  return 'Dados da app ('+SF.DATA_LBL+', horas de Lisboa):\nPRÓXIMOS JOGOS:\n'+g(SF.GAMES.filter(x=>!x.done))+'\nRESULTADOS:\n'+g(SF.GAMES.filter(x=>x.done))+'\nO utilizador '+(SF.st.name?'chama-se '+SF.st.name:'não indicou o nome')+' e tem '+SF.st.coins+' moedas e '+SF.st.points+' pontos.'},
 async remote(q,hist){const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),20000);
  try{let messages=hist.filter(m=>!m.typing&&m.t).map(m=>({role:m.b?'assistant':'user',content:String(m.t).slice(0,600)})).slice(-10);while(messages.length&&messages[0].role!=='user')messages.shift();
   if(!messages.length||messages[messages.length-1].role!=='user')messages.push({role:'user',content:q});
   const r=await fetch(SF.AI_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages,context:SF.ai.context()}),signal:ctl.signal});
   if(!r.ok)throw new Error('http '+r.status);const j=await r.json();if(!j||typeof j.reply!=='string'||!j.reply.trim())throw new Error('vazio');return {t:j.reply.trim()}}
  finally{clearTimeout(to)}},
 async reply(q,hist){
  // regra fixa: a pergunta sobre o criador tem sempre a mesma resposta, mesmo com a IA ligada
  const l=local(q);if(l.t===CREATOR)return l;
  if(/^https?:/.test(location.protocol)&&!SF._aiOff){try{const r=await SF.ai.remote(q,hist||[]);SF._aiOn=true;return r}catch(e){if(!SF._aiOn)SF._aiOff=true}}
  await new Promise(r=>setTimeout(r,420+Math.random()*380));return l}};
})();
