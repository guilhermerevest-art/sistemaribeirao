# Ribeirão — Sistema de Pedidos e Fidelidade para Açougue
### Especificação do MVP (mock navegável para demonstração)

> **Como usar este arquivo:** salve na raiz do projeto como `CLAUDE.md` (ou `docs/spec.md` e referencie no `CLAUDE.md`). Peça ao Claude Code para executar **uma fase por vez**, na ordem da seção 10, rodando `npm run build` ao final de cada fase.

---

## Credenciais SUPABASE
- https://louyuljshpjrmjhaivyl.supabase.co
- sb_publishable_3zfUmcVaPG4RKJJdyEEn2Q_7VvH38ma
- eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdXl1bGpzaHBqcm1qaGFpdnlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQzOTI1MCwiZXhwIjoyMTAxMDE1MjUwfQ.k1lHffTJE8bpOHacEEd7Us_us09HqAEa9LohktEfGcw




## 1. Contexto e objetivo

O **Açougue Ribeirão** é um comércio de bairro. Hoje o pedido chega por WhatsApp, é anotado à mão e o atendente perde tempo interpretando mensagem. Não existe nenhum registro de quem compra, com que frequência, nem qualquer mecanismo de retorno.

Este MVP tem **dois objetivos comerciais**, nessa ordem:

1. **Vender mais por pedido** — catálogo claro, ofertas visíveis, sugestão de itens complementares no carrinho.
2. **Fazer o cliente voltar** — cashback, pontos, ofertas exclusivas e leitura de frequência de compra.

E **um objetivo operacional**: o pedido sai impresso no cupom da bancada, pronto para o açougueiro executar, sem interpretação.

### O que este projeto é (e o que não é)

Este é um **mock navegável, 100% frontend, sem backend e sem banco de dados**. Ele existe para uma reunião de demonstração com o dono do açougue. Toda a "inteligência" (cashback, pontos, frequência) é calculada em memória sobre dados semeados realistas.

**Critério de sucesso da demo:** o dono consegue, sozinho, fazer um pedido pelo celular, ver o cupom aparecer na tela da bancada, imprimir, e depois abrir o painel e enxergar o próprio cliente com saldo de cashback e histórico. Sem nenhuma tela quebrada e sem nenhum "isso aqui ainda não funciona".

---

## 2. Escopo

### Entra no MVP

| # | Módulo | Entrega |
|---|--------|---------|
| 1 | Loja do cliente | Catálogo por categoria, preço por kg, escolha de peso, observações de corte, carrinho, checkout |
| 2 | Identificação por telefone | Login fake por celular, sem senha, cria cliente se não existir |
| 3 | Cupom térmico | Layout 80mm, impressão real via `window.print()` |
| 4 | Painel da bancada | Fila de pedidos com status, alerta de pedido novo |
| 5 | Cashback | Acúmulo por categoria, saldo, uso parcial no checkout, validade |
| 6 | Pontos e níveis | Pontos por real gasto, 3 níveis, catálogo de resgate |
| 7 | Ofertas da semana | Vitrine com período, preço de/por, limite por cliente |
| 8 | Ofertas relâmpago | Oferta avulsa com quantidade limitada e contagem regressiva |
| 9 | Frequência de cliente | Classificação Novo / Fiel / Em risco / Inativo, dias desde a última compra, ticket médio |
| 10 | Painel do dono | Números do dia, lista de clientes, gestão de ofertas, disparo simulado de WhatsApp |

### Não entra no MVP

- Backend, autenticação real, senha, banco de dados.
- Pagamento online de verdade (Pix e cartão são simulados na tela).
- Integração real com impressora térmica via driver (usaremos a impressão do navegador, que funciona com impressora térmica configurada como padrão no Windows).
- Integração real com a API do WhatsApp (o botão abre `wa.me` com texto pronto).
- Controle de estoque em quilos e integração fiscal.

**Regra dura:** nenhum botão da interface pode existir sem fazer alguma coisa. Se um recurso está fora de escopo, ele não aparece na tela.

---

## 3. Stack e arquitetura

```
Next.js 15 (App Router) + TypeScript
Tailwind CSS v4
shadcn/ui (button, card, dialog, sheet, tabs, badge, input, select, sonner)
lucide-react            ícones
zustand + persist       estado global em localStorage
date-fns (locale ptBR)  datas
recharts                gráficos do painel do dono
```

Deploy: **Vercel**, sem variáveis de ambiente.

### Estrutura de pastas

```
app/
  layout.tsx
  page.tsx                     -> redireciona para /loja
  loja/
    page.tsx                   vitrine + categorias
    produto/[slug]/page.tsx    detalhe do corte
    carrinho/page.tsx
    checkout/page.tsx
    pedido/[id]/page.tsx       acompanhamento + confirmação
  minha-conta/
    page.tsx                   saldo, pontos, nível, histórico
    resgates/page.tsx
  bancada/
    page.tsx                   fila de pedidos (KDS)
    cupom/[id]/page.tsx        cupom 80mm imprimível
  painel/
    page.tsx                   visão geral
    clientes/page.tsx
    clientes/[id]/page.tsx
    ofertas/page.tsx
    campanhas/page.tsx
components/
  loja/  bancada/  painel/  ui/
lib/
  types.ts        interfaces
  seed.ts         dados semeados
  store.ts        zustand
  regras.ts       cashback, pontos, nível, frequência
  formato.ts      moeda, peso, telefone, data
```

### Persistência

Todo o estado (clientes, pedidos, ofertas, carrinho) fica num único store zustand com `persist` no `localStorage`, chave `ribeirao-mock-v1`. Na primeira carga o store é hidratado com `seed.ts`.

Deve existir um botão discreto **"Reiniciar demonstração"** no rodapé do `/painel`, que limpa o localStorage e recarrega o seed. Isso é essencial: se algo der errado durante a reunião, dá para zerar em dois cliques.

---

## 4. Modelo de dados

```ts
// lib/types.ts

export type Categoria =
  | 'bovino' | 'suino' | 'aves' | 'embutidos'
  | 'preparados' | 'churrasco';

export type UnidadeVenda = 'kg' | 'peca' | 'bandeja' | 'unidade';

export interface Produto {
  id: string;
  slug: string;
  nome: string;                 // "Picanha Maturada"
  categoria: Categoria;
  corte?: string;               // "Traseiro"
  descricao: string;
  precoKg: number;              // sempre em reais por kg
  unidadeVenda: UnidadeVenda;
  pesoMedioPeca?: number;       // kg, quando vendido por peça
  imagem: string;               // /produtos/picanha.jpg
  percentualCashback: number;   // 0.03 = 3%
  preparosDisponiveis: string[];// ver seção 7.1
  destaque: boolean;
  disponivel: boolean;
}

export interface ItemCarrinho {
  produtoId: string;
  pesoKg: number;               // peso solicitado
  preparos: string[];
  observacao?: string;
  ofertaId?: string;            // se veio de uma oferta
  precoUnitarioAplicado: number;// já com desconto de oferta
  subtotal: number;
}

export type StatusPedido =
  | 'novo' | 'preparando' | 'pronto' | 'entregue' | 'cancelado';

export type Retirada = 'balcao' | 'entrega';
export type Pagamento = 'pix' | 'cartao_entrega' | 'dinheiro';

export interface Pedido {
  id: string;                   // sequencial legível: "0142"
  clienteId: string;
  itens: ItemCarrinho[];
  subtotal: number;
  descontoOfertas: number;
  cashbackUsado: number;
  taxaEntrega: number;
  total: number;
  cashbackGerado: number;
  pontosGerados: number;
  status: StatusPedido;
  retirada: Retirada;
  endereco?: string;
  pagamento: Pagamento;
  observacaoGeral?: string;
  criadoEm: string;             // ISO
  impressoEm?: string;
}

export type Nivel = 'bronze' | 'prata' | 'ouro';
export type Frequencia = 'novo' | 'fiel' | 'ocasional' | 'em_risco' | 'inativo';

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;             // "34999998888"
  nascimento?: string;
  criadoEm: string;
  saldoCashback: number;
  cashbackExpiraEm?: string;
  pontos: number;
  pontosAcumuladoTotal: number; // define o nível, nunca diminui
  aceitaWhatsapp: boolean;
}

export interface Oferta {
  id: string;
  tipo: 'semana' | 'relampago';
  produtoId: string;
  precoDe: number;
  precoPor: number;
  inicioEm: string;
  fimEm: string;
  limitePorCliente?: number;     // em kg
  quantidadeTotalKg?: number;    // só relâmpago
  quantidadeVendidaKg: number;
  chamada: string;               // "Só hoje até acabar"
  ativa: boolean;
}

export interface Resgate {
  id: string;
  nome: string;                  // "1 kg de linguiça toscana"
  custoPontos: number;
  imagem: string;
  ativo: boolean;
}
```

---

## 5. Dados semeados (`lib/seed.ts`)

Os dados precisam parecer reais numa reunião. Nada de "Produto 1", "Cliente Teste".

### 5.1 Produtos — mínimo 28 itens

Distribuídos assim, com preços por kg plausíveis para o interior de Minas (usar como referência, ajustar livremente):

**Bovino (10):** Picanha maturada 89,90 · Contrafilé 54,90 · Alcatra 52,90 · Maminha 49,90 · Fraldinha 47,90 · Costela ripa 32,90 · Coxão mole 44,90 · Patinho moído na hora 39,90 · Acém 34,90 · Músculo 33,90

**Suíno (5):** Pernil sem osso 28,90 · Costelinha 32,90 · Lombo 34,90 · Bisteca 26,90 · Panceta 33,90

**Aves (4):** Peito de frango 22,90 · Coxa e sobrecoxa 16,90 · Frango inteiro 15,90 · Coração de frango 39,90

**Embutidos (4):** Linguiça toscana artesanal 29,90 · Linguiça apimentada 31,90 · Calabresa 34,90 · Bacon em manta 42,90

**Preparados (3):** Hambúrguer artesanal 180g (bandeja 4un) 34,90 · Espetinho misto (unidade) 8,90 · Almôndega temperada 42,90

**Churrasco (2):** Carvão 5kg (peça) 24,90 · Sal grosso 1kg (unidade) 7,90

Cashback por categoria: bovino 3%, suíno 4%, aves 4%, embutidos 5%, preparados 5%, churrasco 2%.

### 5.2 Clientes — 24 clientes

Nomes brasileiros comuns, telefones DDD 34. **Distribuir as datas de pedido de forma que a classificação de frequência produza os cinco grupos:** uns 5 comprando toda semana, uns 8 quinzenais, 4 novos (primeira compra na última semana), 4 em risco (última compra há 35–50 dias), 3 inativos (mais de 60 dias). Isso é o que dá vida ao painel do dono.

### 5.3 Pedidos — 60 a 90 pedidos históricos

Espalhados nos últimos 120 dias, com pico em sexta e sábado (o churrasco do fim de semana é o padrão real do negócio). Ticket entre R$ 45 e R$ 380. Deixe 3 pedidos com status `novo` e 1 `preparando` para que a tela da bancada já abra com movimento.

### 5.4 Ofertas

3 ofertas da semana ativas (uma delas em bovino, para ser a mais chamativa) e 1 oferta relâmpago com 60% da quantidade já vendida e término no fim do dia.

---

## 6. Telas

### 6.1 `/loja` — Vitrine

Ordem vertical:

1. **Cabeçalho fixo:** logotipo, nome do cliente identificado (ou "Entrar"), saldo de cashback em destaque, ícone do carrinho com contador.
2. **Oferta relâmpago**, se houver ativa: faixa larga com contagem regressiva ao vivo e barra de quanto já saiu ("já saíram 12 kg dos 20 kg").
3. **Ofertas da semana:** carrossel horizontal de 3 a 4 cards com preço riscado.
4. **Barra de categorias** grudenta no topo ao rolar.
5. **Grade de produtos** — 2 colunas no celular, 4 no desktop.

**Card do produto (elemento assinatura, ver seção 9):** ele é desenhado como uma **etiqueta de balança**. Foto no topo, nome em caixa alta condensada, preço por kg em fonte monoespaçada grande, selo de cashback ("volta R$ 2,70 por kg"), e uma faixa serrilhada na base imitando papel de etiqueta térmica.

### 6.2 `/loja/produto/[slug]` — Detalhe do corte

- Foto, nome, descrição curta e honesta ("Peça inteira, capa de gordura preservada").
- **Seletor de peso:** botões rápidos `0,5 kg` `1 kg` `1,5 kg` `2 kg` + campo livre com passo de 100 g. O valor total recalcula ao vivo, em fonte mono grande.
- Aviso obrigatório abaixo do preço: *"O peso pode variar até 100 g para mais ou para menos. O valor final é o da balança."* — isso evita a principal reclamação real do negócio.
- **Preparos** em chips selecionáveis (ver 7.1).
- Campo de observação livre, limite 120 caracteres.
- Botão "Adicionar ao carrinho" fixo no rodapé no celular.

### 6.3 `/loja/carrinho`

- Lista de itens com peso, preparos e subtotal, edição de peso inline.
- **"Vai bem com isso"**: 3 sugestões cruzadas por regra fixa — carne bovina sugere carvão, sal grosso e linguiça; frango sugere tempero e bacon; embutidos sugerem pão de alho. Esse bloco é objetivo comercial nº 1, não pode ser cortado.
- Resumo: subtotal, desconto de ofertas, total.
- Faixa de projeção: **"Este pedido gera R$ 4,80 de cashback e 158 pontos."**

### 6.4 `/loja/checkout`

Passos numa mesma página:

1. **Identificação:** celular. Se existir, saúda pelo nome e mostra saldo. Se não, pede nome. Sem senha.
2. **Retirada ou entrega.** Entrega tem taxa fixa de R$ 8,00, grátis acima de R$ 150,00.
3. **Usar cashback:** switch. Ao ligar, aplica o menor valor entre o saldo e 30% do subtotal, e mostra em texto claro quanto foi abatido.
4. **Pagamento:** Pix (mostra QR falso), cartão na entrega, dinheiro (com campo "troco para quanto?").
5. **Horário:** "assim que possível" ou janela de retirada.
6. Botão **"Enviar pedido"**.

### 6.5 `/loja/pedido/[id]` — Confirmação

Número do pedido gigante, status em linha do tempo (Recebido → Preparando → Pronto), resumo, e a frase de retenção: **"Você acumulou R$ 4,80 de cashback. Vale até 20/08."** Botão para abrir o WhatsApp do açougue.

### 6.6 `/bancada` — Painel da bancada

Feita para uma tela em pé, no calor, sendo tocada com a mão suja. **Fonte grande, alvo de toque mínimo 56px, contraste alto, nada de cinza claro.**

- Três colunas: **Novos**, **Preparando**, **Prontos**.
- Card do pedido: número, hora, nome e telefone do cliente, quantidade de itens, valor, etiqueta de retirada ou entrega.
- Pedido novo entra com animação e som curto (arquivo local, com botão de mudo).
- Ações no card: **Imprimir** (abre `/bancada/cupom/[id]` e dispara o print), **Iniciar**, **Pronto**, **Entregue**.
- Contador de tempo desde a chegada; passa a vermelho após 15 minutos parado.

### 6.7 `/bancada/cupom/[id]` — Cupom

Página com CSS de impressão para bobina de **80 mm**. Fora da impressão, exibir centralizada com sombra, imitando o papel.

```
      AÇOUGUE RIBEIRÃO
   Rua ................, 000
       (34) 3333-0000
--------------------------------
PEDIDO Nº 0142        23/07 18:42
CLIENTE: Maria Aparecida
FONE:    (34) 99999-8888
TIPO:    ENTREGA
--------------------------------
2,000 kg  PICANHA MATURADA
          >> CORTAR EM BIFES 2cm
                        R$ 179,80

1,000 kg  LINGUICA TOSCANA
                         R$ 29,90

1 pç      CARVAO 5KG
                         R$ 24,90
--------------------------------
SUBTOTAL              R$ 234,60
DESCONTO OFERTA      -R$  12,00
CASHBACK USADO       -R$  15,00
ENTREGA                    GRATIS
TOTAL                 R$ 207,60
PAGAMENTO: PIX
--------------------------------
OBS: entregar apos as 19h
--------------------------------
CASHBACK GERADO:       R$  7,03
PONTOS:                     207
SALDO ATUAL:           R$  7,03
NIVEL: PRATA
--------------------------------
      Obrigado pela preferencia
```

Regras do cupom, todas obrigatórias:

- Fonte monoespaçada, largura fixa de 32 colunas, sem cor, sem imagem pesada.
- **Preparos aparecem em caixa alta com `>>` na frente e em negrito.** É a informação que o açougueiro mais precisa e a que mais se perde hoje.
- `@media print` remove tudo que não é o cupom, `@page { size: 80mm auto; margin: 0 }`.
- Após imprimir, gravar `impressoEm` e mostrar selo "Impresso 18:43" no card da bancada.

### 6.8 `/minha-conta`

- Saldo de cashback grande, com data de validade.
- Barra de progresso do nível: "Faltam 340 pontos para o Ouro".
- Histórico de pedidos, cada um com o cashback que gerou.
- Acesso ao catálogo de resgates.

### 6.9 `/painel` — Painel do dono

Quatro cartões no topo: **faturamento do dia**, **pedidos do dia**, **ticket médio**, **clientes que voltaram no mês**.

Abaixo:
- Gráfico de barras de faturamento dos últimos 30 dias.
- **Bloco de frequência** — o argumento de venda mais forte da demo: cinco caixas com a contagem de clientes por grupo. Clicar em "Em risco" abre a lista com nome, telefone, dias sem comprar, ticket médio, e um botão **"Chamar no WhatsApp"** que abre `wa.me` com a mensagem já escrita:
  > "Oi Maria, aqui é do Açougue Ribeirão. Faz 38 dias que você não aparece e você tem R$ 12,40 de cashback pra usar até 20/08. Essa semana a fraldinha tá R$ 44,90 o quilo. Quer que eu separe?"
- Ranking dos 10 produtos mais vendidos.

### 6.10 `/painel/ofertas` e `/painel/campanhas`

Criar, editar e desativar ofertas das duas modalidades, com pré-visualização de como o card aparece na loja. Em campanhas, montar uma lista de destinatários por grupo de frequência e gerar os links de WhatsApp em lote.

---

## 7. Regras de negócio (`lib/regras.ts`)

### 7.1 Preparos por categoria

```ts
bovino:     ['Cortar em bifes', 'Cortar em cubos', 'Moer', 'Tirar a gordura',
             'Peça inteira', 'Cortar para churrasco', 'Amaciar']
suino:      ['Cortar em pedaços', 'Peça inteira', 'Cortar em bifes', 'Temperar']
aves:       ['Inteiro', 'Em pedaços', 'Desossar', 'Cortar em tiras', 'Moer']
embutidos:  ['Peça inteira', 'Cortar em gomos', 'Fatiar fino']
preparados: []
churrasco:  []
```

### 7.2 Cashback

- Acumula sobre o **valor pago**, já descontadas ofertas e cashback usado.
- Percentual é o do produto, aplicado item a item.
- **Validade de 60 dias** a partir do último pedido. Cada nova compra renova a validade do saldo inteiro — isso é o gancho de retorno.
- Uso limitado a **30% do subtotal** por pedido, para não corroer margem.
- Valor mínimo para uso: R$ 5,00.
- Sempre mostrar em reais, nunca em "moedas" ou "créditos". O dono e o cliente entendem real.

### 7.3 Pontos e níveis

- 1 ponto por R$ 1,00 pago, arredondado para baixo.
- `pontosAcumuladoTotal` nunca diminui e define o nível. `pontos` é o saldo gastável.

| Nível | Acumulado | Benefício |
|---|---|---|
| Bronze | 0 | Cashback padrão |
| Prata | 1.500 | +1% de cashback em tudo |
| Ouro | 4.000 | +2% de cashback e acesso 24h antes às ofertas da semana |

- Catálogo de resgate com 6 itens: 500 pts = 1 kg de linguiça toscana · 800 pts = 1 kg de coxa e sobrecoxa · 1.200 pts = bandeja de hambúrguer · 1.500 pts = 1 kg de costela · 2.500 pts = 1 kg de fraldinha · 4.000 pts = 1 kg de picanha.

### 7.4 Classificação de frequência

Calcular sobre o histórico de pedidos de cada cliente:

```
dias = dias desde o último pedido
n    = número de pedidos nos últimos 90 dias

novo      -> n <= 1 e cadastro há menos de 30 dias
fiel      -> n >= 6 e dias <= 15
ocasional -> n >= 2 e dias <= 30
em_risco  -> dias entre 31 e 59
inativo   -> dias >= 60
```

Exibir sempre com cor e rótulo em português, nunca a sigla interna.

### 7.5 Ofertas

- Oferta da semana vale de segunda a domingo, com limite opcional de kg por cliente.
- Oferta relâmpago tem quantidade total; ao esgotar, o card vira "Acabou" e o produto volta ao preço normal automaticamente.
- Cliente Ouro vê as ofertas da semana com 24h de antecedência, marcadas com selo "Antecipado Ouro".
- Um item só pode receber uma oferta. Ofertas não acumulam com resgate de pontos.

---

## 8. Simulação da operação

Para a demo funcionar sozinha, incluir:

- **Avanço automático de status:** um pedido em `novo` passa para `preparando` após 90 segundos se ninguém tocar, e de `preparando` para `pronto` após 3 minutos. Deixa a tela viva enquanto o dono conversa.
- **Botão "Gerar pedido de teste"** no rodapé da `/bancada`, que cria um pedido aleatório de um cliente semeado. Serve para mostrar o cupom saindo sem precisar refazer o fluxo do celular.
- **Sincronia entre abas:** usar `storage` event ou `BroadcastChannel` para que um pedido feito no celular apareça na tela da bancada aberta em outra aba/dispositivo do mesmo navegador. Se não for viável, deixar polling de 2 segundos no store.

---

## 9. Direção visual

**Referência:** açougue de bairro bem cuidado — azulejo branco, papel manteiga, etiqueta de balança, placa de preço escrita à mão. **Não** é aplicativo de delivery genérico, **não** é dark mode com verde neon.

### Paleta

```
--sangue      #7B1113   vermelho profundo, cor de marca, usado com moderação
--brasa       #C8461F   ação, preço em oferta, contagem regressiva
--papel       #F7F4EE   fundo geral, cor de papel manteiga
--azulejo     #FFFFFF   superfícies e cards
--carvao      #1C1A19   texto e o painel da bancada
--sebo        #E8DFCC   linhas, bordas, faixas serrilhadas
```

O painel da bancada inverte: fundo `--carvao`, texto `--papel`. Ele é usado sob luz forte e precisa ser lido de longe.

### Tipografia

- **Display:** `Bricolage Grotesque` (Google Fonts), peso 700/800, tracking negativo. Títulos, nome do produto, número do pedido.
- **Texto:** `Inter Tight`, 400/500.
- **Números e cupom:** `JetBrains Mono`. **Todo peso, preço e valor da interface usa a mono.** É o que dá a leitura de balança e amarra a identidade — o cupom e a loja passam a falar a mesma língua.

### Elemento assinatura

O **card-etiqueta**: cada produto na vitrine é uma etiqueta de balança. Base com recorte serrilhado feito em CSS (`mask-image` com gradiente radial repetido), preço em mono grande, e uma tarja de código de barras decorativa em SVG. É a única peça com liberdade decorativa; o resto da interface é sóbrio e espaçoso.

### Padrão de qualidade

Responsivo a partir de 360px — **a loja será demonstrada no celular do dono, então o celular é a tela principal, não a adaptação.** Foco de teclado visível. `prefers-reduced-motion` respeitado. Nenhuma animação além da entrada de pedido na bancada, do contador regressivo e das transições de estado.

### Texto da interface

Voz do balcão, não de aplicativo. "Separar pedido", não "Processar". "Acabou", não "Indisponível no momento". "Você tem R$ 12,40 pra usar", não "Saldo de créditos disponível". Erro diz o que fazer: "Coloque um peso entre 100 g e 10 kg", não "Valor inválido".

---

## 10. Fases de implementação

Executar em ordem. Ao final de cada fase, rodar `npm run build` e corrigir antes de seguir.

| Fase | Entrega | Pronto quando |
|---|---|---|
| 1 | Projeto, Tailwind, tokens, fontes, tipos, seed completo, store zustand | `/loja` lista os 28 produtos com o card-etiqueta |
| 2 | Detalhe do produto, seletor de peso, preparos, carrinho, sugestões cruzadas | Dá para montar um carrinho de 3 itens com preparos |
| 3 | Checkout completo, identificação por telefone, cashback, criação do pedido, tela de confirmação | Pedido entra no store e aparece em `/bancada` |
| 4 | Bancada: colunas, cards, status, som, timer, avanço automático, gerar pedido de teste | Fila funciona ponta a ponta |
| 5 | Cupom 80mm e impressão | `Ctrl+P` gera exatamente o layout da seção 6.7 |
| 6 | Ofertas da semana e relâmpago, com contagem regressiva e limites | Ofertas alteram preço no carrinho e no cupom |
| 7 | Minha conta, pontos, níveis, resgates | Barra de progresso e catálogo funcionando |
| 8 | Painel do dono: métricas, gráfico, frequência, WhatsApp, gestão de ofertas | Grupos de frequência batem com o seed |
| 9 | Acabamento: responsivo, foco, estados vazios, reiniciar demonstração, `README.md` com o roteiro | Build limpo e deploy na Vercel |

---

## 11. Critérios de aceite

- [ ] Fluxo completo no celular: escolher corte → definir peso e preparo → carrinho → checkout com cashback → confirmação, sem travar.
- [ ] O pedido aparece na `/bancada` em menos de 3 segundos.
- [ ] O cupom impresso cabe em 80 mm, com os preparos em destaque.
- [ ] O saldo de cashback muda corretamente: abate no checkout, credita depois do pedido.
- [ ] Os cinco grupos de frequência aparecem povoados no painel.
- [ ] O botão de WhatsApp abre com a mensagem personalizada preenchida.
- [ ] A oferta relâmpago esgota e o produto volta ao preço cheio sozinho.
- [ ] "Reiniciar demonstração" devolve o sistema ao estado inicial.
- [ ] `npm run build` sem erro nem aviso de tipo. Zero erro no console.
- [ ] Nenhum botão inerte na interface.

---

## 12. Roteiro da demonstração (colocar no `README.md`)

Quatro minutos, nesta ordem:

1. **Abra a `/bancada` num notebook e deixe na mesa.** É o balcão.
2. **Pegue o celular e faça um pedido** como se fosse a dona Maria: 2 kg de picanha, cortar em bifes, mais linguiça e carvão. Use o cashback no checkout — o dono vai ver o desconto acontecer.
3. **Aponte para o notebook.** O pedido chegou com som. Clique em Imprimir e mostre o cupom com o `>> CORTAR EM BIFES` em destaque. Esse é o momento em que ele entende o valor.
4. **Abra `/painel`.** Mostre o faturamento, e então abra "Em risco": 4 clientes, com nome e telefone, que não voltam há mais de um mês. Clique em "Chamar no WhatsApp" e mostre a mensagem pronta.

A frase de fechamento é essa: *"O cupom resolve o dia de hoje. Essa lista aqui é o faturamento do mês que vem."*

---

## 13. Depois do MVP (não construir agora)

Supabase com RLS, pesagem real integrada à balança, PDV e impressão automática por rede, WhatsApp Business API para as campanhas, controle de estoque em kg com quebra de peça, relatório de margem por corte, e app instalável (PWA) com notificação de oferta relâmpago.
