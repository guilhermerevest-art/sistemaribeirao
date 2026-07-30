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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
    percentualCashback: CASHBACK_POR_CATEGORIA.bovino,
    preparosDisponiveis: ['Cortar em bifes', 'Cortar para churrasco', 'Peça inteira', 'Tirar a gordura'],
    destaque: true,
    novidade: true,
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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
    imagem: IMG('photo-1607623814075-e51df1bdc82f'),
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

export const CLIENTES: Cliente[] = (() => {
  const clientes: Cliente[] = [];
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
      criadoEm,
      saldoCashback: round(cashbackDisponivel, 2),
      cashbackExpiraEm:
        cashbackDisponivel > 0
          ? new Date(new Date(ultima).getTime() + 60 * 86400000).toISOString()
          : undefined,
      pontos: pontosGastaveis,
      pontosAcumuladoTotal,
      aceitaWhatsapp: n.aceita,
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
