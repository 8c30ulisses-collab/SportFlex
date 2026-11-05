# SportFlex: pacote para publicares a app

Esta pasta é a app completa. Não precisa de servidor nem de instalação: são só ficheiros. Depois de a publicares, qualquer pessoa abre pelo endereço que escolheres, sem passar pelo Claude, e pode instalá-la no telemóvel como uma app.

## 1. Publicar (escolhe uma opção, a primeira é a mais rápida)

**Netlify (grátis, 2 minutos)**
1. Vai a https://app.netlify.com/drop
2. Arrasta esta pasta inteira para a página.
3. Recebes logo um endereço público. Podes mudar o nome em Site configuration > Change site name (por exemplo, sportflex.netlify.app).

**Cloudflare Pages ou Vercel (grátis)**
Criam a conta, escolhem "Upload" ou ligam a um repositório GitHub com estes ficheiros. Não é preciso comando de build nem pasta de saída (deixa em branco ou usa a raiz).

**GitHub Pages (grátis)**
1. Cria um repositório novo e envia estes ficheiros para a raiz.
2. Em Settings > Pages, escolhe a branch main e a pasta root.
3. O endereço fica https://o-teu-utilizador.github.io/nome-do-repositorio/

## 2. Endereço próprio
Compra um domínio (por exemplo sportflex.pt) e associa-o no painel do serviço que usaste. O Netlify, a Cloudflare e a Vercel explicam o passo em "Custom domain".

## 3. Instalar no telemóvel (depois de publicada)
- **Android (Chrome):** abre o endereço, menu de três pontos > Instalar aplicação.
- **iPhone (Safari):** abre o endereço, botão Partilhar > Adicionar ao ecrã principal.
A app fica com ícone próprio, abre em ecrã inteiro e funciona mesmo com rede fraca.

## 4. Testar no teu computador antes de publicar
Abre uma linha de comandos nesta pasta e corre `python3 -m http.server 8000`, depois abre http://localhost:8000. (Abrir o index.html com duplo clique também funciona, mas sem o modo de instalação.)

## 5. O que há nesta pasta
- `index.html`: entrada da app. `styles.css`: aspeto. `*.js`: lógica e ecrãs.
- `data.js`: equipas, ligas e jogos. É aqui que se alteram os dados.
- `manifest.webmanifest`, `sw.js`, `icons/`: instalação no telemóvel e funcionamento sem rede.

## 6. Atualizar a app
Muda os ficheiros e volta a publicar. Para os telemóveis que já instalaram a app receberem a versão nova, abre `sw.js` e aumenta o número em `const V='sportflex-v1'` (passa a v2, v3, e assim por diante).

## 7. Emblemas oficiais
Quando um clube te autorizar, coloca o ficheiro numa pasta `crests/` e em `data.js` preenche, por exemplo, `SF.CRESTS = { ben:'crests/ben.png' }`. Acrescenta também os caminhos desses ficheiros à lista `SHELL` do `sw.js`.

## 8. Avisos importantes
- Os calendários e resultados são um instantâneo de 5 nov 2026 e não se atualizam sozinhos. Para dados em direto é preciso um servidor que consulte uma API desportiva.
- Os preços, as moedas e os pagamentos são simulados. Os emblemas são genéricos.
- A SportFlex não tem direitos de transmissão. Enquanto não os tiveres, mostra a app como demonstração e mantém o aviso "DEMO".
- Os dados de cada pessoa (moedas, packs) ficam guardados só no telemóvel ou browser dela.

## 9. Ligar a IA a sério ao assistente (opcional)
Sem isto, o assistente funciona na mesma: usa uma base de conhecimento dentro da app (futebol, jogos, preços e funcionalidades) e responde sempre que o criador da app é perguntado com a frase definida. Para ele responder a **qualquer** pergunta de futebol com um modelo de IA, é preciso um pequeno servidor que guarda a chave:
1. Cria uma chave em https://console.anthropic.com (tem custo por utilização; define um limite de gasto na conta).
2. Publica esta pasta na **Vercel** (vercel.com > Add New > Project > importa o teu repositório do GitHub; funciona com repositório privado). A pasta `api/` com o ficheiro `chat.js` é detetada sozinha.
3. Na Vercel, em Settings > Environment Variables, cria `ANTHROPIC_API_KEY` com a tua chave e faz Redeploy.
4. Abre o endereço da Vercel. A app liga-se sozinha a `/api/chat`. Se o servidor não existir ou falhar, volta ao modo local sem avisar o utilizador.
Notas: o GitHub Pages não corre servidores, por isso lá fica sempre o modo local. Nunca coloques a chave em ficheiros da app. O servidor limita cada IP a 25 perguntas em 10 minutos. Para um modelo mais forte, cria a variável `MODEL` (por omissão usa `claude-haiku-5-5`, o mais barato).
