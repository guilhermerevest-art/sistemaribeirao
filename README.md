# Empório Ribeirão — Sistema de Pedidos e Fidelidade

Mock navegável para uma reunião de demonstração. Tudo no navegador, sem backend. Estado persistido em `localStorage` ou Supabase (se houver env vars).

## Roteiro da demonstração (4 minutos)

A ordem importa — é a narrativa que vende o projeto.

1. **Abra `/bancada` num notebook e deixe na mesa.** É o balcão. Tem fila de pedidos em movimento, timer e botão de impressão.
2. **Pegue o celular e faça um pedido** como se fosse o cliente Maria: 2 kg de picanha, cortar em bifes, mais linguiça e carvão. Use o cashback no checkout — o desconto acontece ao vivo. *O pedido chega na bancada com som.*
3. **Aponte para o notebook.** Clique em **Imprimir** e mostre o cupom com o `>> CORTAR EM BIFES` em destaque. **Esse é o momento em que o dono entende o valor.**
4. **Abra `/painel`.** Mostre o faturamento do dia. Em seguida, abra **Em risco**: 4 clientes que não voltam há mais de um mês. Clique em **Chamar no WhatsApp** e mostre a mensagem pronta.

Se sobrar tempo, mostre:

- `/minha-conta` com saldo de cashback e barra de progresso do nível.
- `/painel/relatorios` com o gráfico de 30 dias e a exportação CSV de "em risco".
- `/backoffice/configuracoes` pra editar nome do estabelecimento, endereço e flag "Loja aberta".

> *"O cupom resolve o dia de hoje. Essa lista aqui é o faturamento do mês que vem."*

## Como rodar

```bash
npm install
npm run dev
# http://localhost:3000 → índice com todas as áreas
```

Build de produção:

```bash
npm run build
npm start
```

## Páginas

- `/` — índice com acesso a todas as áreas.
- `/loja` — vitrine, ofertas, categorias, card-etiqueta.
- `/loja/produto/[slug]` — detalhe, seletor de peso, preparos, observações.
- `/loja/carrinho` — itens, sugestões cruzadas, projeção de cashback.
- `/loja/checkout` — identificação, retirada/entrega, cashback, pagamento.
- `/loja/pedido/[id]` — confirmação, linha do tempo e "Pedir de novo".
- `/minha-conta` — saldo, pontos, nível, histórico.
- `/minha-conta/resgates` — catálogo de resgate.
- `/minha-conta/clube` — escada de níveis Bronze/Prata/Ouro.
- `/cozinha` — pedidos recebidos/em preparo, timer, "marcar como pronto".
- `/bancada` — KDS com 3 colunas, som, impressão automática.
- `/bancada/cupom/[id]` — cupom 80mm imprimível (`Ctrl+P`, ou `?auto=1`).
- `/painel` — KPIs do dia, gráfico 30d, frequência, top 10.
- `/painel/clientes` e `/painel/clientes/[id]` — carteira e "Pedir de novo".
- `/painel/ofertas` — redireciona para `/backoffice/promocoes`.
- `/painel/campanhas` — listas de WhatsApp por grupo.
- `/painel/relatorios` — gráficos e exportação CSV.
- `/backoffice` — cadastros e gestão administrativa.
- `/backoffice/clientes` — cadastrar, editar, remover, creditar cashback.
- `/backoffice/pedidos` — todos os pedidos, mudar status, cancelar.
- `/backoffice/promocoes` — criar/editar/desativar ofertas.
- `/backoffice/combos` — combos de produtos.
- `/backoffice/produtos` — editar preço, cashback, disponibilidade.
- `/backoffice/resgates` — catálogo de pontos.
- `/backoffice/configuracoes` — pontos por real + dados do estabelecimento + flag "Loja aberta".

## Stack

Next.js 16 (App Router) + TypeScript, Tailwind CSS v4, Zustand, shadcn/Radix, lucide-react, recharts, date-fns, sonner.

## Reiniciar demonstração

Botão **Reiniciar demonstração** no rodapé do `/painel`, no header do `/backoffice` e na home. Limpa o `localStorage` e reaplica o seed (ou chama a RPC `reset_demo` no Supabase).

## Modo demo offline

Quando o app roda sem env vars do Supabase, ele cai automaticamente pro `localStorage` e mostra um badge "Offline" no canto superior direito. Tudo funciona: criar pedido, ver cashback, gerar cupom — só não sincroniza entre dispositivos.

## Impressão automática na Epson TM-T20X (USB)

Quando um pedido novo chega na `/bancada`, o sistema abre o cupom num iframe invisível com `?auto=1` e chama `window.print()`. Pra sair direto na impressora térmica (sem diálogo do navegador):

1. **Deixe a TM-T20X como impressora padrão do Windows.**
   `Configurações → Bluetooth e dispositivos → Impressoras e scanners` → clique na EPSON TM-T20X → **Definir como padrão**.

2. **Abra o Chrome (ou Edge) com a flag `--kiosk-printing`.**
   Crie um atalho na área de trabalho:

   ```bat
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing "https://SEU-DOMINIO.vercel.app/bancada"
   ```

3. **Use sempre esse atalho pra abrir a bancada** — a flag só vale pra janela aberta com ela.

O botão da impressora no header da bancada liga/desliga a impressão automática (fica salvo no navegador). Sem a flag, o Chrome mostra o diálogo de impressão — só que dentro do iframe invisível, então parece que nada aconteceu.

## Notas

- Imagens de produto vêm do Unsplash via `images.unsplash.com` (whitelist em `next.config.ts`).
- O estado todo vive em `localStorage` (chave `ribeirao-mock-v1`). Abrir a `/bancada` e o celular em duas abas do mesmo navegador já sincroniza via `storage` event + polling de 2s.
- A impressão do cupom usa `@media print` com `@page { size: 80mm auto; margin: 0 }`. Configure a impressora térmica de 80mm como padrão no Windows.

## Hydration: por que algumas seções são client-only

Componentes que filtram por `new Date()` ou `Date.now()` no corpo do render (ex: ofertas com janela de validade ativa) são **client-only** por design. Server renderiza em T0, client renderiza em T0+latência; se a janela de validade cruza esse intervalo, o HTML diverge e o React dispara "hydration mismatch" (erro #185). A solução é o hook `useClientOnly()` em `src/components/loja/ofertas.tsx` — retorna `false` no SSR (mesmo valor no server e no client antes do mount) e `true` após o primeiro `useEffect` no client. O conteúdo das ofertas só aparece depois da hidratação completar, eliminando o mismatch.
