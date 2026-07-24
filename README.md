# Açougue Ribeirão — Sistema de Pedidos e Fidelidade

Mock navegável para uma reunião de demonstração. Tudo no navegador, sem backend. Estado persistido em `localStorage`.

## Stack

Next.js 16 (App Router) + TypeScript, Tailwind CSS v4, Zustand, shadcn/Radix, lucide-react, recharts, date-fns.

## Como rodar

```bash
npm install
npm run dev
# http://localhost:3000  →  redireciona para /loja
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

- `/loja` — vitrine, ofertas, categorias, card-etiqueta.
- `/loja/produto/[slug]` — detalhe, seletor de peso, preparos, observações.
- `/loja/carrinho` — itens, sugestões cruzadas, projeção de cashback.
- `/loja/checkout` — identificação, retirada/entrega, cashback, pagamento.
- `/loja/pedido/[id]` — confirmação e linha do tempo.
- `/minha-conta` — saldo, pontos, nível, histórico.
- `/minha-conta/resgates` — catálogo de resgate.
- `/bancada` — KDS de pedidos com 3 colunas, som, timer.
- `/bancada/cupom/[id]` — cupom 80mm imprimível (`Ctrl+P`).
- `/painel` — KPIs do dia, gráfico 30d, frequência, top 10.
- `/painel/clientes` e `/painel/clientes/[id]` — carteira, WhatsApp em lote.
- `/painel/ofertas` — gestão de ofertas da semana e relâmpago.
- `/painel/campanhas` — listas de mensagens por grupo.

## Reiniciar demonstração

Botão **Reiniciar demonstração** no rodapé do `/painel` (e no header). Limpa o `localStorage` e reaplica o seed.

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Importe em [vercel.com/new](https://vercel.com/new).
3. Sem variável de ambiente. `npm run build` resolve.

## Notas

- Imagens de produto vêm do Unsplash via `images.unsplash.com` (whitelist em `next.config.ts`).
- O estado todo vive em `localStorage` (chave `ribeirao-mock-v1`). Abrir a `/bancada` e o celular em duas abas do mesmo navegador já sincroniza via `storage` event + polling de 2s.
- A impressão do cupom usa `@media print` com `@page { size: 80mm auto; margin: 0 }`. Configure a impressora térmica de 80mm como padrão no Windows.
