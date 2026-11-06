# SportFlex

**O teu desporto, à tua medida.**

SportFlex é o protótipo de uma aplicação de streaming desportivo modular: em vez de uma mensalidade rígida, o utilizador paga só pelo que quer ver, por jogo, por clube, por competição ou por modalidade. Nasceu como projeto da unidade curricular de Interface Pessoa-Máquina (IPM) e evoluiu para uma demonstração interativa que funciona no telemóvel, no dobrável e no computador.

> **Demonstração.** Esta app não transmite vídeo real nem tem direitos de transmissão. Os pagamentos e as moedas são simulados, os emblemas são genéricos e o calendário é um instantâneo de dados públicos.

## O problema

Os modelos de subscrição desportiva são rígidos. No questionário feito à turma de IPM (20 respostas):

- 87% acham as subscrições caras para o que realmente veem
- 73% já evitaram pagar só porque queriam ver um jogo específico
- 82% gostariam de ver jogos com amigos à distância
- 43% conhecem alguém com dificuldade em usar apps de streaming desportivo

## Funcionalidades

- **Packs modulares:** Pack Jogo, Pack Clube, Pack Competição e Pack Modalidade (Futebol, que inclui todas as competições), pagos com Moedas Flex. Antes de comprar, a app mostra o âmbito, os jogos incluídos, a validade (até 30 de junho de 2027), os replays (30 dias) e as exclusões.
- **Comparador de packs:** o utilizador marca os jogos que quer ver e a app calcula a combinação de packs mais barata (programação dinâmica sobre os preços de jogo, clube, competição e modalidade), explica a poupança face a comprar um pack por jogo e permite comprar tudo de uma vez.
- **Os meus jogos:** os packs que tens, a validade de cada um, os próximos jogos incluídos (com botão direto para ver), os lembretes e os replays disponíveis.
- **Modo sem spoilers:** esconde os resultados e os momentos dos replays em toda a app; o utilizador pode ver o jogo desde o início ou revelar o resultado jogo a jogo.
- **Filtros do calendário:** Hoje, Esta semana, escolher data, Os meus clubes e Incluído nos meus packs, combináveis entre si.
- **Lembretes com antecedência:** 5 min a 1 dia antes, com confirmação clara da hora do aviso e ficheiro de calendário (.ics) com alarme. O aviso dentro da app é simulado, porque não há servidor de notificações.
- **Watch Party sincronizada (simulada):** mostra o atraso de cada pessoa face ao anfitrião, permite voltar ao momento dele e ligar a sincronização automática, para ninguém festejar um golo antes dos outros.
- **Recomendações personalizadas:** sugestões com o motivo de cada uma, com base nos clubes que segues.
- **Jogo com campo animado:** estatísticas, replay inteligente com os momentos-chave e realidade aumentada sobre o campo.
- **Modo social:** Watch Party com videochamada simulada, reações, chat e votações ao vivo.
- **Carteira Flex:** comprar moedas, oferecer packs a amigos e consultar o histórico.
- **Recompensas:** pontos, missões semanais, previsões de resultado, ranking e troca por prémios.
- **Acessibilidade:** Modo Essencial (só o teu clube, botões grandes), tamanho do texto, comandos por voz reais (Web Speech API: precisa de internet, permissão do microfone e Chrome, Edge ou Safari; com botões de toque como alternativa), leitura em voz alta das respostas do assistente e cor do tema personalizável.
- **Assistente virtual (100% no navegador):** responde a perguntas em português de Portugal sobre jogos e calendário, resultados (respeitando o modo sem spoilers), packs e preços, carteira, perfil, Watch Party, recompensas e regras de futebol. Percebe abreviaturas e alcunhas ("qnd joga o slb?"), lembra-se do último clube/jogo/pack e, quando não sabe, responde sempre com a mesma frase (constante `FALLBACK` em `ai.js`). Não usa servidor, API de IA nem chaves.
- **Sem personalização forçada:** o nome e os clubes são opcionais, e há a opção "Explorar sem personalizar".
- **Adaptável:** layouts próprios para telemóvel, dobrável e computador, instalável como app (PWA) e com funcionamento sem rede.

## Tecnologia

HTML, CSS e JavaScript simples, sem frameworks nem passo de compilação. Service worker e manifesto para instalação no telemóvel.

```
index.html            entrada da app
styles.css            aspeto e layouts adaptáveis
data.js               equipas, competições e jogos
core.js               estado, navegação e componentes base
screens1.js           arranque, Home e Explorar
desk.js               Home para computador
player.js             jogo, Watch Party, chat, votações, AR e replay
screens2.js           carteira, recompensas, perfil e assistente
boot.js               arranque da app
sw.js                 funcionamento sem rede
manifest.webmanifest  instalação no telemóvel
icons/                ícones da app
```

## Como correr

Não é preciso instalar nada. Na pasta do projeto:

```
python3 -m http.server 8000
```

Abre `http://localhost:8000` no browser. Para publicar, qualquer alojamento de ficheiros estáticos serve, como o GitHub Pages ou a Cloudflare Pages.

Para instalar no telemóvel, abre o endereço publicado: no Android usa o menu do Chrome e escolhe **Instalar aplicação**, no iPhone usa o Safari e escolhe **Partilhar > Adicionar ao ecrã principal**.

## Dados e limitações

- Os dados são de demonstração, com atualização de **5/11/2026**; as horas são as de Lisboa. Os jogos e resultados foram recolhidos de fontes públicas (Liga Portugal, La Liga e Champions League). Não se atualizam sozinhos e podem conter imprecisões. A Premier League, a Serie A, a Bundesliga e a Ligue 1 estão listadas, mas sem calendário.
- Os minutos dos golos nos replays são ilustrativos.
- Os jogos não têm vídeo. O botão **Simular jogo ao vivo** mostra como a app funciona durante uma transmissão.
- Os preços, as moedas e os pagamentos são fictícios. Nada é cobrado.
- O estado de cada pessoa (moedas, packs, preferências) fica guardado apenas no próprio aparelho.

## Próximos passos

- Ligar a uma API de dados desportivos através de um servidor próprio, para resultados e calendários em tempo real.
- Contas de utilizador e pagamentos reais.
- Vídeo em direto e replays, sujeito a acordos de direitos com clubes e ligas.
- Versão nativa para iOS e Android.

## Aviso legal

Os nomes de clubes e competições aparecem apenas como texto informativo e pertencem aos respetivos titulares. Esta demonstração não tem qualquer ligação, patrocínio ou autorização dos clubes, das ligas ou das entidades referidas. Os emblemas são escudos genéricos criados para este projeto. Para usar emblemas oficiais é necessária autorização de cada titular, e o suporte para os acrescentar está preparado em `data.js` (`SF.CRESTS`).

## Autor

Projeto desenvolvido no âmbito da unidade curricular de Interface Pessoa-Máquina, na Escola Superior de Tecnologia do IPCB.
