# Açougue Ribeirão — Sistema de Pedidos e Fidelidade

Mock navegável para uma reunião de demonstração. Tudo no navegador, sem backend. Estado persistido em `localStorage`.

## Stack

Next.js 16 (App Router) + TypeScript, Tailwind CSS v4, Zustand, shadcn/Radix, lucide-react, recharts, date-fns.

## Como rodar

```bash
npm install
npm run dev
# http://localhost:3000  →  índice com todas as áreas
```

Build de produção:

```bash
npm run build
npm start
```

## Roteiro da demonstração (4 minutos)

1. **Abra `/bancada` num notebook e deixe na mesa.** É o balcão.
2. **Pegue o celular e faça um pedido** como se fosse a dona Maria: 2 kg de picanha, cortar em bifes, mais linguiça e carvão. Use o cashback no checkout — o desconto acontece.
3. **Aponte para o notebook.** O pedido chegou com som. Clique em **Imprimir** e mostre o cupom com o `>> CORTAR EM BIFES` em destaque. Esse é o momento em que o dono entende o valor.
4. **Abra `/painel`.** Mostre o faturamento, e então abra **Em risco**: 4 clientes, com nome e telefone, que não voltam há mais de um mês. Clique em **Chamar no WhatsApp** e mostre a mensagem pronta.

> *"O cupom resolve o dia de hoje. Essa lista aqui é o faturamento do mês que vem."*

## Páginas

- `/` — índice com acesso a todas as áreas.
- `/loja` — vitrine, ofertas, categorias, card-etiqueta.
- `/loja/produto/[slug]` — detalhe, seletor de peso, preparos, observações.
- `/loja/carrinho` — itens, sugestões cruzadas, projeção de cashback.
- `/loja/checkout` — identificação, retirada/entrega, cashback, pagamento.
- `/loja/pedido/[id]` — confirmação e linha do tempo.
- `/minha-conta` — saldo, pontos, nível, histórico.
- `/minha-conta/resgates` — catálogo de resgate.
- `/cozinha` — pedidos recebidos/em preparo, timer, "marcar como pronto".
- `/bancada` — KDS de pedidos com 3 colunas, som, timer, impressão automática.
- `/bancada/cupom/[id]` — cupom 80mm imprimível (`Ctrl+P`, ou `?auto=1` para impressão silenciosa).
- `/painel` — KPIs do dia, gráfico 30d, frequência, top 10.
- `/painel/clientes` e `/painel/clientes/[id]` — carteira, WhatsApp em lote.
- `/painel/ofertas` — gestão de ofertas da semana e relâmpago.
- `/painel/campanhas` — listas de mensagens por grupo.
- `/backoffice` — cadastros e gestão administrativa.
- `/backoffice/clientes` — cadastrar, editar, remover, creditar cashback.
- `/backoffice/pedidos` — todos os pedidos, filtros, mudar status, cancelar.
- `/backoffice/promocoes` — criar, editar, desativar ofertas.
- `/backoffice/produtos` — editar preço, cashback, disponibilidade.

## Reiniciar demonstração

Botão **Reiniciar demonstração** no rodapé do `/painel` (e no header). Limpa o `localStorage` e reaplica o seed.

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Importe em [vercel.com/new](https://vercel.com/new).
3. Sem variável de ambiente. `npm run build` resolve.

## Impressão automática na Epson TM-T20X (USB)

Quando um pedido novo chega na `/bancada`, o sistema abre o cupom desse pedido
num iframe invisível com `?auto=1` e chama `window.print()` sozinho — sem
precisar clicar em nada. Pra isso realmente sair direto na impressora térmica,
sem diálogo de impressão, é preciso configurar a máquina da bancada uma vez:

### 1. Deixe a TM-T20X como impressora padrão do Windows

`Configurações → Bluetooth e dispositivos → Impressoras e scanners` → clique
na EPSON TM-T20X → **Definir como padrão**.

### 2. Abra o Chrome (ou Edge) com a flag `--kiosk-printing`

Essa flag faz o navegador imprimir direto na impressora padrão, sem mostrar
diálogo nem pré-visualização. Crie um atalho específico para a bancada:

- Botão direito na área de trabalho → **Novo → Atalho**.
- Local do item, exemplo para Chrome:

  ```text
  "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing "https://SEU-DOMINIO.vercel.app/bancada"
  ```

- Nomeie o atalho como **"Bancada Ribeirão"** e use sempre ele para abrir a
  tela da bancada — nunca um Chrome aberto manualmente, porque a flag só
  vale para a janela aberta com ela.

### 3. Teste

Clique no ícone da impressora no cabeçalho da `/bancada` — verde
(`PrinterCheck`) significa impressão automática ligada. Gere um pedido de
teste ou faça um pedido pelo celular: o cupom deve sair sozinho na TM-T20X
em poucos segundos, sem nenhum diálogo aparecer na tela.

### Se algo não sair certo

- Sem a flag `--kiosk-printing`, o Chrome mostra o diálogo de impressão
  normalmente — só que dentro do iframe invisível, então parece que nada
  aconteceu. Confirme que abriu pelo atalho certo.
- O botão da impressora no header da bancada liga/desliga esse recurso a
  qualquer momento (fica salvo no navegador). Desligue se quiser voltar a
  imprimir manualmente pelo botão **Imprimir** de cada card.
- Ainda dá pra imprimir manualmente a qualquer momento: botão **Imprimir**
  no card do pedido (bancada) ou em `/backoffice/pedidos`.

**Por que não um app nativo falando USB direto com a impressora?** Um
navegador não tem permissão de baixo nível pra escrever bytes numa porta USB
sem ajuda do sistema operacional. A alternativa (WebUSB) exigiria trocar o
driver da Epson por um genérico no Windows — e aí ela para de funcionar como
impressora normal fora do navegador. O caminho do `--kiosk-printing` evita
essa cirurgia e usa a instalação padrão da impressora.

## Notas

- Imagens de produto vêm do Unsplash via `images.unsplash.com` (whitelist em `next.config.ts`).
- O estado todo vive em `localStorage` (chave `ribeirao-mock-v1`). Abrir a `/bancada` e o celular em duas abas do mesmo navegador já sincroniza via `storage` event + polling de 2s.
- A impressão do cupom usa `@media print` com `@page { size: 80mm auto; margin: 0 }`. Configure a impressora térmica de 80mm como padrão no Windows.
