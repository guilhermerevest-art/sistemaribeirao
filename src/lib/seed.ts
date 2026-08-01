// Seed realista: vitrine, carteira de clientes, histórico de pedidos,
// ofertas e catálogo de resgates. Tudo em memória, sem backend.

import type {
  Cliente,
  Oferta,
  Pedido,
  Produto,
  Resgate,
} from './types';
import { CASHBACK_POR_CATEGORIA } from './types';

// Imagens distintas por corte. Termos escolhidos pra que a busca no
// Unsplash devolva fotos plausíveis de açougue. Repetir a mesma
// imagem em todos os produtos fazia a vitrine parecer clone — agora
// cada corte tem cara própria. w=600 mantém o peso baixo.
const IMG = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=600&q=60`;

export const PRODUTOS: Produto[] = [
  // Bovino (10)
  {
    id: 'p-picanha',
    slug: 'picanha-maturada',
    nome: 'Picanha Maturada',
    categoria: 'bovino',
    corte: 'Traseiro',
    descricao: 'Peça inteira, capa de gordura preservada. Maturada por 21 dias.',
    precoKg: 89.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1546964124-0cce460f38ef'),
    percentualCashback: CASHBACK_POR_CATEGORIA.bovino,
    preparosDisponiveis: ['Cortar em bifes', 'Cortar para churrasco', 'Peça inteira', 'Tirar a gordura'],
    destaque: true,
    disponivel: true,
  },
  {
    id: 'p-contrafile',
    slug: 'contrafile',
    nome: 'Contrafilé',
    categoria: 'bovino',
    corte: 'Traseiro',
    descricao: 'Corte nobre, ideal para bifes e churrasco.',
    precoKg: 54.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1603048297172-c5857f694755'),
    percentualCashback: CASHBACK_POR_CATEGORIA.bovino,
    preparosDisponiveis: ['Cortar em bifes', 'Cortar em cubos', 'Moer', 'Tirar a gordura', 'Amaciar'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-alcatra',
    slug: 'alcatra',
    nome: 'Alcatra',
    categoria: 'bovino',
    corte: 'Traseiro',
    descricao: 'Carne macia, ótima para o dia a dia.',
    precoKg: 52.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1568901346375-23c9450c58cd'),
    percentualCashback: CASHBACK_POR_CATEGORIA.bovino,
    preparosDisponiveis: ['Cortar em bifes', 'Cortar em cubos', 'Moer', 'Tirar a gordura'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-maminha',
    slug: 'maminha',
    nome: 'Maminha',
    categoria: 'bovino',
    corte: 'Traseiro',
    descricao: 'Suculenta, vai bem inteira na brasa.',
    precoKg: 49.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
    percentualCashback: CASHBACK_POR_CATEGORIA.bovino,
    preparosDisponiveis: ['Cortar em bifes', 'Cortar para churrasco', 'Peça inteira'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-fraldinha',
    slug: 'fraldinha',
    nome: 'Fraldinha',
    categoria: 'bovino',
    corte: 'Dianteiro',
    descricao: 'Sabor marcante, pedida certa do churrasco.',
    precoKg: 47.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1551183053-bf91a1d81141'),
    percentualCashback: CASHBACK_POR_CATEGORIA.bovino,
    preparosDisponiveis: ['Cortar em bifes', 'Cortar em cubos', 'Cortar para churrasco', 'Peça inteira'],
    destaque: true,
    disponivel: true,
  },
  {
    id: 'p-costela-ripa',
    slug: 'costela-ripa',
    nome: 'Costela Ripa',
    categoria: 'bovino',
    corte: 'Dianteiro',
    descricao: 'Para assar low and slow. Paciente e saborosa.',
    precoKg: 32.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1604507626801-d68d2c10c9e8'),
    percentualCashback: CASHBACK_POR_CATEGORIA.bovino,
    preparosDisponiveis: ['Cortar em pedaços', 'Peça inteira', 'Cortar em cubos'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-coxao-mole',
    slug: 'coxao-mole',
    nome: 'Coxão Mole',
    categoria: 'bovino',
    corte: 'Traseiro',
    descricao: 'Magro, ideal para bisteca e cozido.',
    precoKg: 44.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1615937722923-67f6deaf2cc9'),
    percentualCashback: CASHBACK_POR_CATEGORIA.bovino,
    preparosDisponiveis: ['Cortar em bifes', 'Cortar em cubos', 'Moer', 'Tirar a gordura'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-patinho',
    slug: 'patinho-moido',
    nome: 'Patinho Moído na Hora',
    categoria: 'bovino',
    corte: 'Traseiro',
    descricao: 'Moído na hora, ideal para hambúrguer caseiro.',
    precoKg: 39.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1606851181069-1cb2d8b7d6a1'),
    percentualCashback: CASHBACK_POR_CATEGORIA.bovino,
    preparosDisponiveis: ['Moer'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-acem',
    slug: 'acem',
    nome: 'Acém',
    categoria: 'bovino',
    corte: 'Dianteiro',
    descricao: 'Para panela, ensopados e carne de forno.',
    precoKg: 34.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1574484184081-afea8a62f9c4'),
    percentualCashback: CASHBACK_POR_CATEGORIA.bovino,
    preparosDisponiveis: ['Cortar em cubos', 'Cortar em bifes', 'Tirar a gordura'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-musculo',
    slug: 'musculo',
    nome: 'Músculo',
    categoria: 'bovino',
    corte: 'Dianteiro',
    descricao: 'Para cozido e mocotó. Sabor profundo.',
    precoKg: 33.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1546833999-b9f581a1996d'),
    percentualCashback: CASHBACK_POR_CATEGORIA.bovino,
    preparosDisponiveis: ['Cortar em cubos', 'Peça inteira'],
    destaque: false,
    disponivel: true,
  },
  // Suíno (5)
  {
    id: 'p-pernil',
    slug: 'pernil-sem-osso',
    nome: 'Pernil sem Osso',
    categoria: 'suino',
    descricao: 'Sem osso, ideal para assar ou fazer torresmo.',
    precoKg: 28.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
    percentualCashback: CASHBACK_POR_CATEGORIA.suino,
    preparosDisponiveis: ['Cortar em pedaços', 'Peça inteira', 'Temperar'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-costelinha',
    slug: 'costelinha-suina',
    nome: 'Costelinha',
    categoria: 'suino',
    descricao: 'Para churrasco ou assado.',
    precoKg: 32.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1602471894782-cdaa9b3b8b71'),
    percentualCashback: CASHBACK_POR_CATEGORIA.suino,
    preparosDisponiveis: ['Cortar em pedaços', 'Peça inteira', 'Cortar em bifes'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-lombo',
    slug: 'lombo-suino',
    nome: 'Lombo',
    categoria: 'suino',
    descricao: 'Magro, nobre, ótimo para assar.',
    precoKg: 34.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1604507626801-d68d2c10c9e8'),
    percentualCashback: CASHBACK_POR_CATEGORIA.suino,
    preparosDisponiveis: ['Cortar em bifes', 'Peça inteira', 'Temperar'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-bisteca',
    slug: 'bisteca-suina',
    nome: 'Bisteca',
    categoria: 'suino',
    descricao: 'Clássica da chapa.',
    precoKg: 26.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1615937722923-67f6deaf2cc9'),
    percentualCashback: CASHBACK_POR_CATEGORIA.suino,
    preparosDisponiveis: ['Cortar em bifes', 'Temperar'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-panceta',
    slug: 'panceta',
    nome: 'Panceta',
    categoria: 'suino',
    descricao: 'Barriga com camada, para churrasco.',
    precoKg: 33.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1606851181069-1cb2d8b7d6a1'),
    percentualCashback: CASHBACK_POR_CATEGORIA.suino,
    preparosDisponiveis: ['Cortar em pedaços', 'Peça inteira', 'Temperar'],
    destaque: false,
    disponivel: true,
  },
  // Aves (4)
  {
    id: 'p-peito-frango',
    slug: 'peito-de-frango',
    nome: 'Peito de Frango',
    categoria: 'aves',
    descricao: 'Sem osso, fresco do dia.',
    precoKg: 22.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1604507626801-d68d2c10c9e8'),
    percentualCashback: CASHBACK_POR_CATEGORIA.aves,
    preparosDisponiveis: ['Inteiro', 'Em pedaços', 'Cortar em tiras', 'Moer'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-coxa-sobrecoxa',
    slug: 'coxa-e-sobrecoxa',
    nome: 'Coxa e Sobrecoxa',
    categoria: 'aves',
    descricao: 'Resistente ao forno e空气 fryer.',
    precoKg: 16.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1615937722923-67f6deaf2cc9'),
    percentualCashback: CASHBACK_POR_CATEGORIA.aves,
    preparosDisponiveis: ['Inteiro', 'Em pedaços', 'Desossar'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-frango-inteiro',
    slug: 'frango-inteiro',
    nome: 'Frango Inteiro',
    categoria: 'aves',
    descricao: 'Para assar ou fazer canjica.',
    precoKg: 15.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1602471894782-cdaa9b3b8b71'),
    percentualCashback: CASHBACK_POR_CATEGORIA.aves,
    preparosDisponiveis: ['Inteiro', 'Em pedaços', 'Desossar'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-coracao',
    slug: 'coracao-de-frango',
    nome: 'Coração de Frango',
    categoria: 'aves',
    descricao: 'Para espeto e recheio.',
    precoKg: 39.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1546833999-b9f581a1996d'),
    percentualCashback: CASHBACK_POR_CATEGORIA.aves,
    preparosDisponiveis: ['Inteiro'],
    destaque: false,
    disponivel: true,
  },
  // Embutidos (4)
  {
    id: 'p-linguica-toscana',
    slug: 'linguica-toscana',
    nome: 'Linguiça Toscana Artesanal',
    categoria: 'embutidos',
    descricao: 'Tempero da casa, fabricada aqui.',
    precoKg: 29.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1603048297172-c5857f694755'),
    percentualCashback: CASHBACK_POR_CATEGORIA.embutidos,
    preparosDisponiveis: ['Peça inteira', 'Cortar em gomos'],
    destaque: true,
    disponivel: true,
  },
  {
    id: 'p-linguica-apimentada',
    slug: 'linguica-apimentada',
    nome: 'Linguiça Apimentada',
    categoria: 'embutidos',
    descricao: 'Para quem curte um toque ardido.',
    precoKg: 31.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1568901346375-23c9450c58cd'),
    percentualCashback: CASHBACK_POR_CATEGORIA.embutidos,
    preparosDisponiveis: ['Peça inteira', 'Cortar em gomos'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-calabresa',
    slug: 'calabresa',
    nome: 'Calabresa',
    categoria: 'embutidos',
    descricao: 'Defumada, fatiada ou inteira.',
    precoKg: 34.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1574484184081-afea8a62f9c4'),
    percentualCashback: CASHBACK_POR_CATEGORIA.embutidos,
    preparosDisponiveis: ['Peça inteira', 'Fatiar fino'],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-bacon',
    slug: 'bacon-em-manta',
    nome: 'Bacon em Manta',
    categoria: 'embutidos',
    descricao: 'Sem cortumes, ideal para envolver.',
    precoKg: 42.9,
    unidadeVenda: 'kg',
    imagem: IMG('photo-1551183053-bf91a1d81141'),
    percentualCashback: CASHBACK_POR_CATEGORIA.embutidos,
    preparosDisponiveis: ['Peça inteira', 'Fatiar fino'],
    destaque: false,
    disponivel: true,
  },
  // Preparados (3)
  {
    id: 'p-hamburguer',
    slug: 'hamburguer-180g',
    nome: 'Hambúrguer Artesanal 180g',
    categoria: 'preparados',
    descricao: 'Bandeja com 4 unidades, temperadas e seladas.',
    precoKg: 34.9,
    unidadeVenda: 'bandeja',
    pesoMedioPeca: 0.72,
    imagem: IMG('photo-1606851181069-1cb2d8b7d6a1'),
    percentualCashback: CASHBACK_POR_CATEGORIA.preparados,
    preparosDisponiveis: [],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-espetinho',
    slug: 'espetinho-misto',
    nome: 'Espetinho Misto',
    categoria: 'preparados',
    descricao: 'Carne, linguiça e cebola. Unitário.',
    precoKg: 8.9,
    unidadeVenda: 'unidade',
    pesoMedioPeca: 0.15,
    imagem: IMG('photo-1615937722923-67f6deaf2cc9'),
    percentualCashback: CASHBACK_POR_CATEGORIA.preparados,
    preparosDisponiveis: [],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-almondega',
    slug: 'almondega-temperada',
    nome: 'Almôndega Temperada',
    categoria: 'preparados',
    descricao: 'Bandeja 1 kg, prontas para o molho.',
    precoKg: 42.9,
    unidadeVenda: 'bandeja',
    pesoMedioPeca: 1,
    imagem: IMG('photo-1604507626801-d68d2c10c9e8'),
    percentualCashback: CASHBACK_POR_CATEGORIA.preparados,
    preparosDisponiveis: [],
    destaque: false,
    disponivel: true,
  },
  // Churrasco (2)
  {
    id: 'p-carvao',
    slug: 'carvao-5kg',
    nome: 'Carvão 5kg',
    categoria: 'churrasco',
    descricao: 'Queima uniforme, sem fagulhas.',
    precoKg: 24.9,
    unidadeVenda: 'peca',
    pesoMedioPeca: 5,
    imagem: IMG('photo-1546833999-b9f581a1996d'),
    percentualCashback: CASHBACK_POR_CATEGORIA.churrasco,
    preparosDisponiveis: [],
    destaque: false,
    disponivel: true,
  },
  {
    id: 'p-sal-grosso',
    slug: 'sal-grosso-1kg',
    nome: 'Sal Grosso 1kg',
    categoria: 'churrasco',
    descricao: 'Granulometria ideal para a carne.',
    precoKg: 7.9,
    unidadeVenda: 'unidade',
    pesoMedioPeca: 1,
    imagem: IMG('photo-1602471894782-cdaa9b3b8b71'),
    percentualCashback: CASHBACK_POR_CATEGORIA.churrasco,
    preparosDisponiveis: [],
    destaque: false,
    disponivel: true,
  },
];

const NOMES: { nome: string; tel: string; aceita: boolean }[] = [
  { nome: 'Maria Aparecida Silva', tel: '34988551201', aceita: true },
  { nome: 'José Carlos Ferreira', tel: '34988551202', aceita: true },
  { nome: 'Ana Paula Souza', tel: '34988551203', aceita: true },
  { nome: 'João Batista dos Santos', tel: '34988551204', aceita: false },
  { nome: 'Lúcia Helena Oliveira', tel: '34988551205', aceita: true },
  { nome: 'Pedro Henrique Lima', tel: '34988551206', aceita: true },
  { nome: 'Sandra Regina Costa', tel: '34988551207', aceita: true },
  { nome: 'Antônio Carlos Pereira', tel: '34988551208', aceita: true },
  { nome: 'Rosa Maria Almeida', tel: '34988551209', aceita: true },
  { nome: 'Francisco das Chagas', tel: '34988551210', aceita: true },
  { nome: 'Patrícia Mendes', tel: '34988551211', aceita: true },
  { nome: 'Marcos Antônio Ribeiro', tel: '34988551212', aceita: true },
  { nome: 'Juliana Cristina Rocha', tel: '34988551213', aceita: true },
  { nome: 'Rafael Augusto Gomes', tel: '34988551214', aceita: true },
  { nome: 'Beatriz Helena Castro', tel: '34988551215', aceita: true },
  { nome: 'Carlos Alberto Dias', tel: '34988551216', aceita: true },
  { nome: 'Márcia Regina Barbosa', tel: '34988551217', aceita: true },
  { nome: 'Sergio Luiz Pacheco', tel: '34988551218', aceita: false },
  { nome: 'Cristina Vieira da Silva', tel: '34988551219', aceita: true },
  { nome: 'Roberto Carlos Tavares', tel: '34988551220', aceita: true },
  { nome: 'Denise Oliveira Santos', tel: '34988551221', aceita: true },
  { nome: 'Eduardo Luiz Moreira', tel: '34988551222', aceita: true },
  { nome: 'Fernanda Paula Cardoso', tel: '34988551223', aceita: true },
  { nome: 'Gabriel Henrique Nunes', tel: '34988551224', aceita: true },
];

// Para semear a carteira com comportamento de frequência diversificado,
// definimos para cada cliente um padrão de compras (em dias passados).
// 5 fieis: 4 a 8 pedidos nos últimos 90 dias, último há 1-10 dias
// 8 ocasionais: 2 a 5 pedidos, último 8-25 dias
// 4 novos: 1 pedido, há 1-7 dias, criado há menos de 30
// 4 em risco: 1-3 pedidos, último 31-50 dias
// 3 inativos: 0-1 pedido, último 60-100 dias
const PADROES: Array<'fiel' | 'ocasional' | 'novo' | 'em_risco' | 'inativo'> = [
  'fiel', 'fiel', 'fiel', 'fiel', 'fiel',
  'ocasional', 'ocasional', 'ocasional', 'ocasional', 'ocasional',
  'ocasional', 'ocasional', 'ocasional',
  'novo', 'novo', 'novo', 'novo',
  'em_risco', 'em_risco', 'em_risco', 'em_risco',
  'inativo', 'inativo', 'inativo',
];

function diasAtrasISO(dias: number, hora = 18, min = 30): string {
  const d = new Date(HOJE);
  d.setDate(d.getDate() - dias);
  d.setHours(hora, min, 0, 0);
  return d.toISOString();
}

const HOJE = new Date();
HOJE.setHours(0, 0, 0, 0);

const PROD_BY_ID = new Map(PRODUTOS.map((p) => [p.id, p]));

function pickProdutoAleatorio(): Produto {
  return PRODUTOS[Math.floor(Math.random() * PRODUTOS.length)];
}

function pickProdutos(qtd: number): Produto[] {
  const out: Produto[] = [];
  while (out.length < qtd) {
    const p = pickProdutoAleatorio();
    if (out.find((x) => x.id === p.id)) continue;
    out.push(p);
  }
  return out;
}

function gerarItens(produtos: Produto[]): { produtoId: string; pesoKg: number; preparos: string[]; observacao?: string; precoUnitarioAplicado: number; subtotal: number }[] {
  return produtos.map((p) => {
    const peso = p.unidadeVenda === 'kg' ? round(0.5 + Math.random() * 2.5, 2) : (p.pesoMedioPeca ?? 1);
    const subtotal = round(peso * p.precoKg, 2);
    const prep = p.preparosDisponiveis?.length
      ? [p.preparosDisponiveis[Math.floor(Math.random() * p.preparosDisponiveis.length)]]
      : [];
    return {
      produtoId: p.id,
      pesoKg: peso,
      preparos: prep,
      precoUnitarioAplicado: p.precoKg,
      subtotal,
    };
  });
}

function round(n: number, casas = 2): number {
  const fator = Math.pow(10, casas);
  return Math.round(n * fator) / fator;
}

function pagamentoAleatorio(): 'pix' | 'cartao_entrega' | 'dinheiro' {
  const r = Math.random();
  if (r < 0.55) return 'pix';
  if (r < 0.85) return 'cartao_entrega';
  return 'dinheiro';
}

function retiradaAleatoria(): 'balcao' | 'entrega' {
  return Math.random() < 0.7 ? 'balcao' : 'entrega';
}

function gerarPedidosParaCliente(idx: number, padrao: typeof PADROES[number]): { pedidos: Pedido[]; criadoEm: string } {
  const pedidos: Pedido[] = [];
  let criadoEm = diasAtrasISO(120);
  let seqBase = 100 + idx * 30;

  if (padrao === 'novo') {
    criadoEm = diasAtrasISO(7 + Math.floor(Math.random() * 18));
    const itens = gerarItens(pickProdutos(2));
    const subtotal = round(itens.reduce((s, i) => s + i.subtotal, 0), 2);
    pedidos.push({
      id: String(seqBase + 1).padStart(4, '0'),
      clienteId: '',
      itens,
      subtotal,
      descontoOfertas: 0,
      cashbackUsado: 0,
      taxaEntrega: 0,
      total: subtotal,
      cashbackGerado: round(subtotal * 0.035, 2),
      pontosGerados: Math.floor(subtotal),
      status: 'entregue',
      retirada: 'balcao',
      pagamento: 'pix',
      criadoEm: diasAtrasISO(2),
    });
  } else if (padrao === 'em_risco') {
    criadoEm = diasAtrasISO(180);
    const ultima = 35 + Math.floor(Math.random() * 15);
    pedidos.push({
      id: String(seqBase + 1).padStart(4, '0'),
      clienteId: '',
      itens: gerarItens(pickProdutos(2)),
      subtotal: 0,
      descontoOfertas: 0,
      cashbackUsado: 0,
      taxaEntrega: 0,
      total: 0,
      cashbackGerado: 0,
      pontosGerados: 0,
      status: 'entregue',
      retirada: 'balcao',
      pagamento: 'pix',
      criadoEm: diasAtrasISO(ultima),
    });
  } else if (padrao === 'inativo') {
    criadoEm = diasAtrasISO(220);
    const ultima = 62 + Math.floor(Math.random() * 40);
    pedidos.push({
      id: String(seqBase + 1).padStart(4, '0'),
      clienteId: '',
      itens: gerarItens(pickProdutos(1)),
      subtotal: 0,
      descontoOfertas: 0,
      cashbackUsado: 0,
      taxaEntrega: 0,
      total: 0,
      cashbackGerado: 0,
      pontosGerados: 0,
      status: 'entregue',
      retirada: 'balcao',
      pagamento: 'pix',
      criadoEm: diasAtrasISO(ultima),
    });
  } else if (padrao === 'fiel') {
    criadoEm = diasAtrasISO(220);
    for (let i = 0; i < 8; i++) {
      const itens = gerarItens(pickProdutos(2 + Math.floor(Math.random() * 2)));
      const subtotal = round(itens.reduce((s, ii) => s + ii.subtotal, 0), 2);
      const dias = 3 + i * 7 + Math.floor(Math.random() * 3);
      pedidos.push({
        id: String(seqBase + i + 1).padStart(4, '0'),
        clienteId: '',
        itens,
        subtotal,
        descontoOfertas: 0,
        cashbackUsado: 0,
        taxaEntrega: 0,
        total: subtotal,
        cashbackGerado: round(subtotal * 0.035, 2),
        pontosGerados: Math.floor(subtotal),
        status: 'entregue',
        retirada: retiradaAleatoria(),
        pagamento: pagamentoAleatorio(),
        criadoEm: diasAtrasISO(dias),
      });
    }
  } else {
    criadoEm = diasAtrasISO(180);
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
      const itens = gerarItens(pickProdutos(1 + Math.floor(Math.random() * 2)));
      const subtotal = round(itens.reduce((s, ii) => s + ii.subtotal, 0), 2);
      const dias = 10 + i * 14 + Math.floor(Math.random() * 5);
      pedidos.push({
        id: String(seqBase + i + 1).padStart(4, '0'),
        clienteId: '',
        itens,
        subtotal,
        descontoOfertas: 0,
        cashbackUsado: 0,
        taxaEntrega: 0,
        total: subtotal,
        cashbackGerado: round(subtotal * 0.035, 2),
        pontosGerados: Math.floor(subtotal),
        status: 'entregue',
        retirada: retiradaAleatoria(),
        pagamento: pagamentoAleatorio(),
        criadoEm: diasAtrasISO(dias),
      });
    }
  }

  // Resumir o subtotal nos pedidos em_risco / inativo.
  for (const p of pedidos) {
    if (p.subtotal === 0) {
      const s = round(p.itens.reduce((sum, i) => sum + i.subtotal, 0), 2);
      p.subtotal = s;
      p.total = s;
      p.cashbackGerado = round(s * 0.035, 2);
      p.pontosGerados = Math.floor(s);
    }
  }

  return { pedidos, criadoEm };
}

const PEDIDOS: Pedido[] = [];

// Aniversariantes do mês atual — espalhados para que apareçam
// alguns hoje independente do dia que você rodar a demo. Formato
// ISO date (YYYY-MM-DD) só com mês/dia, ano arbitrário.
const ANIVERSARIOS_MES: Record<number, Array<{ idx: number; dia: number }>> = {
  0:  [{ idx: 0, dia: 14 }],
  1:  [{ idx: 1, dia: 22 }],
  2:  [{ idx: 2, dia: 5  }],
  3:  [{ idx: 3, dia: 18 }],
  4:  [{ idx: 4, dia: 9  }],
  5:  [{ idx: 5, dia: 25 }],
  6:  [{ idx: 6, dia: 11 }],
  7:  [{ idx: 7, dia: 28 }],
  8:  [{ idx: 8, dia: 7  }],
  9:  [{ idx: 9, dia: 19 }],
  10: [{ idx: 10, dia: 3 }],
  11: [{ idx: 11, dia: 16 }],
};

// Gera código de indicação estável a partir do nome + id.
function codigoIndicacaoPara(nome: string, id: string): string {
  const letras = nome
    .normalize('NFD')
    .split('')
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 0x0300 || code > 0x036f;
    })
    .join('')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
  const base = (letras + 'XXXX').slice(0, 4);
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const sufixo = String(h % 100).padStart(2, '0');
  return `${base}${sufixo}`;
}

export const CLIENTES: Cliente[] = (() => {
  const clientes: Cliente[] = [];
  const mesAtual = HOJE.getMonth();
  // Mapa clienteIdx -> data ISO de aniversário (YYYY-MM-DD).
  const aniversariantes: Record<number, string> = {};
  for (const { idx, dia } of ANIVERSARIOS_MES[mesAtual] ?? []) {
    const ano = 1965 + ((idx * 7) % 35); // ano plausível
    aniversariantes[idx] = `${ano}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  }

  NOMES.forEach((n, i) => {
    const padrao = PADROES[i];
    const { pedidos, criadoEm } = gerarPedidosParaCliente(i, padrao);
    const pontosAcumuladoTotal = pedidos.reduce((s, p) => s + p.pontosGerados, 0);
    const clienteId = `c-${String(i + 1).padStart(3, '0')}`;
    const pedidosDoCliente = pedidos.map((p) => ({ ...p, clienteId }));
    const ultima = pedidosDoCliente[pedidosDoCliente.length - 1]?.criadoEm ?? criadoEm;
    const cashbackDisponivel = pedidosDoCliente
      .filter((p) => p.status === 'entregue' && p.criadoEm >= diasAtrasISO(60))
      .reduce((s, p) => s + p.cashbackGerado, 0);
    const pontosGastaveis = Math.floor(pontosAcumuladoTotal * 0.4);
    clientes.push({
      id: clienteId,
      nome: n.nome,
      telefone: n.tel,
      ...(aniversariantes[i] ? { nascimento: aniversariantes[i] } : {}),
      criadoEm,
      saldoCashback: round(cashbackDisponivel, 2),
      cashbackExpiraEm:
        cashbackDisponivel > 0
          ? new Date(new Date(ultima).getTime() + 60 * 86400000).toISOString()
          : undefined,
      pontos: pontosGastaveis,
      pontosAcumuladoTotal,
      aceitaWhatsapp: n.aceita,
      codigoIndicacao: codigoIndicacaoPara(n.nome, clienteId),
    });
    PEDIDOS.push(...pedidosDoCliente);
  });
  return clientes;
})();

// Acrescenta 1 pedido em "preparando" recente + 3 "novo" para abrir a bancada com movimento.
(function adicionarMovimentoBancada() {
  const idxs = [0, 5, 12, 18];
  const proximoSeq = 500;
  idxs.forEach((i, k) => {
    const c = CLIENTES[i];
    const itens = gerarItens(pickProdutos(2));
    const subtotal = round(itens.reduce((s, ii) => s + ii.subtotal, 0), 2);
    const status = k === 0 ? 'preparando' : 'novo';
    const minAtras = k === 0 ? 4 : 1 + k;
    const d = new Date(HOJE);
    d.setHours(19, 0, 0, 0);
    d.setMinutes(d.getMinutes() - minAtras);
    PEDIDOS.push({
      id: String(proximoSeq + k).padStart(4, '0'),
      clienteId: c.id,
      itens,
      subtotal,
      descontoOfertas: 0,
      cashbackUsado: 0,
      taxaEntrega: 0,
      total: subtotal,
      cashbackGerado: round(subtotal * 0.035, 2),
      pontosGerados: Math.floor(subtotal),
      status,
      retirada: 'balcao',
      pagamento: 'pix',
      criadoEm: d.toISOString(),
    });
  });
})();

export const PEDIDOS_SEED: Pedido[] = PEDIDOS.sort((a, b) =>
  a.criadoEm < b.criadoEm ? 1 : -1,
);

// Ofertas
export const OFERTAS: Oferta[] = [
  {
    id: 'o-picanha-semana',
    tipo: 'semana',
    produtoId: 'p-picanha',
    precoDe: 89.9,
    precoPor: 79.9,
    inicioEm: diasAtrasISO(1, 0),
    fimEm: new Date(HOJE.getTime() + 5 * 86400000).toISOString(),
    limitePorCliente: 3,
    quantidadeVendidaKg: 0,
    chamada: 'Picanha com 10% off',
    ativa: true,
  },
  {
    id: 'o-fraldinha-semana',
    tipo: 'semana',
    produtoId: 'p-fraldinha',
    precoDe: 47.9,
    precoPor: 42.9,
    inicioEm: diasAtrasISO(1, 0),
    fimEm: new Date(HOJE.getTime() + 5 * 86400000).toISOString(),
    limitePorCliente: 2,
    quantidadeVendidaKg: 0,
    chamada: 'Fraldinha que vira churrasco',
    ativa: true,
  },
  {
    id: 'o-linguica-semana',
    tipo: 'semana',
    produtoId: 'p-linguica-toscana',
    precoDe: 29.9,
    precoPor: 24.9,
    inicioEm: diasAtrasISO(1, 0),
    fimEm: new Date(HOJE.getTime() + 5 * 86400000).toISOString(),
    limitePorCliente: 2,
    quantidadeVendidaKg: 0,
    chamada: 'Toscana que sempre volta',
    ativa: true,
  },
  {
    id: 'o-alcatra-relampago',
    tipo: 'relampago',
    produtoId: 'p-alcatra',
    precoDe: 52.9,
    precoPor: 39.9,
    inicioEm: new Date(HOJE.getTime() + 0).toISOString(),
    fimEm: new Date(HOJE.getTime() + 1 * 86400000).toISOString(),
    limitePorCliente: 2,
    quantidadeTotalKg: 20,
    quantidadeVendidaKg: 12,
    chamada: 'Só hoje até acabar',
    ativa: true,
  },
];

export const RESGATES: Resgate[] = [
  { id: 'r-toscana', nome: '1 kg de Linguiça Toscana', custoPontos: 500, imagem: IMG('photo-1607623814075-e51df1bdc82f'), ativo: true },
  { id: 'r-coxa', nome: '1 kg de Coxa e Sobrecoxa', custoPontos: 800, imagem: IMG('photo-1607623814075-e51df1bdc82f'), ativo: true },
  { id: 'r-hamburguer', nome: 'Bandeja de Hambúrguer', custoPontos: 1200, imagem: IMG('photo-1607623814075-e51df1bdc82f'), ativo: true },
  { id: 'r-costela', nome: '1 kg de Costela', custoPontos: 1500, imagem: IMG('photo-1607623814075-e51df1bdc82f'), ativo: true },
  { id: 'r-fraldinha', nome: '1 kg de Fraldinha', custoPontos: 2500, imagem: IMG('photo-1607623814075-e51df1bdc82f'), ativo: true },
  { id: 'r-picanha', nome: '1 kg de Picanha', custoPontos: 4000, imagem: IMG('photo-1607623814075-e51df1bdc82f'), ativo: true },
];
