// Catálogo de receitas brasileiras canônicas. Cada receita aponta
// pra `produtos` do nosso seed — itens que NÃO vendemos (sal, óleo,
// alho) ficam como `opcionais` só pra o usuário saber que precisa.
//
// Estrutura:
// - `categoriaReceita` (rendimento, dificuldade, tempo) define o
//   "como fazer".
// - `ingredientes` lista o que precisa, com `produtoId` (do nosso
//   seed) ou null (item de despensa).
// - O cálculo de kg assume porções baseadas em "serve 4"; a UI
//   multiplica pelo rendimento escolhido pelo usuário.

import { PRODUTOS } from './seed';
import { Categoria } from './types';

export type ProteinaReceita =
  | 'bovino'
  | 'suino'
  | 'frango'
  | 'mista'
  | 'peixe'
  | 'veggie';

export type DificuldadeReceita = 'facil' | 'medio' | 'chef';

export type OcasiãoReceita =
  | 'rapido'
  | 'domingo'
  | 'jantar'
  | 'churrasco'
  | 'festa'
  | 'fit';

export interface IngredienteReceita {
  /** id do produto no seed (precisa comprar). null = despensa. */
  produtoId: string | null;
  nome: string;
  /** kg (ou unidades) POR PESSOA. A UI multiplica pelo rendimento. */
  kgPorPessoa: number;
  /** se true, conta como "un" (ex: cebola, ovo), senão como kg. */
  unidade?: 'kg' | 'un';
  emoji?: string;
  /** se true, é opcional (ex: "salsicha" no cachorro-quente). */
  opcional?: boolean;
  /** nota opcional ("sem osso", "bovino", "peça inteira"). */
  nota?: string;
}

export interface PassoReceita {
  numero: number;
  texto: string;
  /** minutos aproximados pra fazer esse passo. */
  duracaoMin?: number;
}

export interface Receita {
  slug: string;
  nome: string;
  descricaoCurta: string;
  emoji: string;
  proteina: ProteinaReceita;
  dificuldade: DificuldadeReceita;
  ocasiao: OcasiãoReceita;
  tempoTotalMin: number;
  /** Rendimento base — a UI permite aumentar/diminuir. */
  porcoesBase: number;
  ingredientes: IngredienteReceita[];
  passos: PassoReceita[];
  /** Tags pra busca simples (ex: "rapido", "comida de domingo"). */
  tags: string[];
}

const receitas: Receita[] = [
  {
    slug: 'estrogonofe-de-carne',
    nome: 'Estrogonofe de Carne',
    descricaoCurta: 'Clássico russo-brasileiro, com picanha ou alcatra em cubos.',
    emoji: '🍛',
    proteina: 'bovino',
    dificuldade: 'medio',
    ocasiao: 'jantar',
    tempoTotalMin: 40,
    porcoesBase: 4,
    ingredientes: [
      { produtoId: 'p-alcatra', nome: 'Alcatra (cubos)', kgPorPessoa: 0.18, emoji: '🥩' },
      { produtoId: null, nome: 'Cebola', kgPorPessoa: 0.05, unidade: 'un', emoji: '🧅' },
      { produtoId: null, nome: 'Alho', kgPorPessoa: 0.02, unidade: 'un', emoji: '🧄' },
      { produtoId: null, nome: 'Creme de leite', kgPorPessoa: 0.1, unidade: 'un', emoji: '🥫', opcional: true },
      { produtoId: null, nome: 'Arroz', kgPorPessoa: 0.1, unidade: 'un', emoji: '🍚', nota: '1 xícara por pessoa' },
    ],
    passos: [
      { numero: 1, texto: 'Corte a carne em cubos pequenos (~2 cm) e tempere com sal, alho e pimenta.', duracaoMin: 10 },
      { numero: 2, texto: 'Refogue cebola e alho até dourar. Junte a carne e sele em fogo alto.', duracaoMin: 8 },
      { numero: 3, texto: 'Acrescente ketchup, mostarda e cogumelos (opcional). Cozinhe por 10 min.', duracaoMin: 12 },
      { numero: 4, texto: 'Despeje o creme de leite fora do fogo. Sirva com arroz branco.', duracaoMin: 10 },
    ],
    tags: ['bovino', 'rapido', 'arroz'],
  },
  {
    slug: 'costelinha-assada-no-forno',
    nome: 'Costelinha de Porco Assada',
    descricaoCurta: 'Costelinha suína no forno, 2 horas no ponto certo. Cai bem com farofa.',
    emoji: '🍖',
    proteina: 'suino',
    dificuldade: 'facil',
    ocasiao: 'domingo',
    tempoTotalMin: 150,
    porcoesBase: 4,
    ingredientes: [
      { produtoId: 'p-costelinha-suina', nome: 'Costelinha Suína', kgPorPessoa: 0.5, emoji: '🍖', nota: 'com osso' },
      { produtoId: null, nome: 'Alho', kgPorPessoa: 0.02, unidade: 'un', emoji: '🧄' },
      { produtoId: null, nome: 'Sal grosso', kgPorPessoa: 0.05, unidade: 'un', emoji: '🧂' },
      { produtoId: 'p-sal-grosso', nome: 'Sal Grosso Empório', kgPorPessoa: 0.05, emoji: '🧂' },
    ],
    passos: [
      { numero: 1, texto: 'Tempere a costelinha com alho, sal, pimenta e um fio de óleo. Deixe marinar 1 h.', duracaoMin: 60 },
      { numero: 2, texto: 'Forre a assadeira com papel-alumínio, acomode a peça, cubra com mais papel.', duracaoMin: 5 },
      { numero: 3, texto: 'Forno a 180°C por 1h30. Abra o papel nos últimos 20 min pra dourar.', duracaoMin: 85 },
      { numero: 4, texto: 'Sirva com farofa, vinagrete e arroz.', duracaoMin: 5 },
    ],
    tags: ['suino', 'domingo', 'forno', 'com_osso'],
  },
  {
    slug: 'file-mignon-ao-molho-madeira',
    nome: 'Filé Mignon ao Molho Madeira',
    descricaoCurta: 'Filé selado, molho madeira com vinho. Pra impressionar.',
    emoji: '🥩',
    proteina: 'bovino',
    dificuldade: 'chef',
    ocasiao: 'jantar',
    tempoTotalMin: 50,
    porcoesBase: 2,
    ingredientes: [
      { produtoId: 'p-maminha', nome: 'Maminha (em medalhões)', kgPorPessoa: 0.25, emoji: '🥩', nota: 'pode ser alcatra também' },
      { produtoId: null, nome: 'Cebola', kgPorPessoa: 0.1, unidade: 'un', emoji: '🧅' },
      { produtoId: null, nome: 'Alho', kgPorPessoa: 0.02, unidade: 'un', emoji: '🧄' },
    ],
    passos: [
      { numero: 1, texto: 'Tempere os medalhões com sal e pimenta. Sele em frigideira bem quente, 2 min cada lado.', duracaoMin: 10 },
      { numero: 2, texto: 'Refogue cebola e alho na mesma frigideira. Junte vinho e caldo, reduza até engrossar.', duracaoMin: 25 },
      { numero: 3, texto: 'Volte a carne, finalize com manteiga. Sirva com batata sauté ou arroz.', duracaoMin: 10 },
    ],
    tags: ['bovino', 'jantar', 'especial'],
  },
  {
    slug: 'frango-grelhado-com-mandioca',
    nome: 'Frango Grelhado com Mandioca',
    descricaoCurta: 'Sobrecoxa marinada + mandioca cozida. Simples e barato.',
    emoji: '🍗',
    proteina: 'frango',
    dificuldade: 'facil',
    ocasiao: 'domingo',
    tempoTotalMin: 90,
    porcoesBase: 4,
    ingredientes: [
      { produtoId: 'p-coxa-sobrecoxa', nome: 'Coxa e Sobrecoxa', kgPorPessoa: 0.4, emoji: '🍗' },
      { produtoId: null, nome: 'Alho', kgPorPessoa: 0.02, unidade: 'un', emoji: '🧄' },
      { produtoId: null, nome: 'Limão', kgPorPessoa: 0.1, unidade: 'un', emoji: '🍋' },
    ],
    passos: [
      { numero: 1, texto: 'Marine o frango com alho, limão, sal, pimenta e um fio de azeite por 1 h.', duracaoMin: 60 },
      { numero: 2, texto: 'Grelhe em fogo médio, virando aos poucos, até dourar (~20 min).', duracaoMin: 20 },
      { numero: 3, texto: 'Sirva com mandioca cozida e vinagrete.', duracaoMin: 10 },
    ],
    tags: ['frango', 'domingo', 'barato'],
  },
  {
    slug: 'feijoada-rapida',
    nome: 'Feijoada Rápida (Carne Seca + Linguiça)',
    descricaoCurta: 'Versão de panela de pressão. 1 hora fica pronta.',
    emoji: '🫘',
    proteina: 'mista',
    dificuldade: 'medio',
    ocasiao: 'jantar',
    tempoTotalMin: 90,
    porcoesBase: 6,
    ingredientes: [
      { produtoId: 'p-linguica-toscana', nome: 'Linguiça Toscana', kgPorPessoa: 0.12, emoji: '🌭' },
      { produtoId: 'p-costelinha-suina', nome: 'Costelinha Suína (opcional)', kgPorPessoa: 0.15, emoji: '🍖', opcional: true },
      { produtoId: null, nome: 'Feijão preto', kgPorPessoa: 0.12, unidade: 'un', emoji: '🫘' },
      { produtoId: null, nome: 'Cebola', kgPorPessoa: 0.05, unidade: 'un', emoji: '🧅' },
      { produtoId: null, nome: 'Alho', kgPorPessoa: 0.02, unidade: 'un', emoji: '🧄' },
      { produtoId: null, nome: 'Folha de louro', kgPorPessoa: 0.05, unidade: 'un', emoji: '🌿', opcional: true },
    ],
    passos: [
      { numero: 1, texto: 'Deixe o feijão de molho por 8 h. Cozinhe na pressão com louro por 25 min.', duracaoMin: 30 },
      { numero: 2, texto: 'Em outra panela, frite a linguiça em rodelas. Reserve.', duracaoMin: 10 },
      { numero: 3, texto: 'No mesmo óleo, refogue alho e cebola. Junte o feijão cozido (com caldo) e bata metade no liquidificador.', duracaoMin: 15 },
      { numero: 4, texto: 'Volte tudo pra pressão com a linguiça. Cozinhe por mais 15 min.', duracaoMin: 15 },
      { numero: 5, texto: 'Sirva com arroz, couve refogada e farofa.', duracaoMin: 10 },
    ],
    tags: ['mista', 'domingo', 'panela_de_pressao'],
  },
  {
    slug: 'picanha-na-manteiga',
    nome: 'Picanha na Manteiga com Alho',
    descricaoCurta: 'Picanha inteira, sal grosso, alho e manteiga. Pra 4 fica lindo.',
    emoji: '🥩',
    proteina: 'bovino',
    dificuldade: 'medio',
    ocasiao: 'churrasco',
    tempoTotalMin: 50,
    porcoesBase: 4,
    ingredientes: [
      { produtoId: 'p-picanha', nome: 'Picanha (peça inteira)', kgPorPessoa: 0.3, emoji: '🥩', nota: 'preferência peça inteira' },
      { produtoId: 'p-sal-grosso', nome: 'Sal Grosso Empório', kgPorPessoa: 0.05, emoji: '🧂' },
      { produtoId: 'p-carvao', nome: 'Carvão', kgPorPessoa: 0.25, emoji: '🔥' },
      { produtoId: 'p-linguica-toscana', nome: 'Linguiça Toscana (acompanhamento)', kgPorPessoa: 0.1, emoji: '🌭' },
    ],
    passos: [
      { numero: 1, texto: 'Acenda o carvão 30 min antes. Picanha deve estar em temperatura ambiente.', duracaoMin: 30 },
      { numero: 2, texto: 'Tempere com sal grosso e alho picado. Espete ou mantenha na grelha.', duracaoMin: 5 },
      { numero: 3, texto: 'Grelhe 4 min de cada lado pra mal passado (centro vermelho).', duracaoMin: 12 },
      { numero: 4, texto: 'Descanse 5 min antes de cortar. Finalize com manteiga derretida.', duracaoMin: 5 },
      { numero: 5, texto: 'Sirva a linguiça junto. Acompanha farofa e vinagrete.', duracaoMin: 5 },
    ],
    tags: ['bovino', 'churrasco', 'picanha'],
  },
  {
    slug: 'calabresa-acebolada-na-cerveja',
    nome: 'Calabresa Acebolada na Cerveja',
    descricaoCurta: 'Pra happy hour. Calabresa, cebola e cerveja escura na frigideira.',
    emoji: '🌭',
    proteina: 'suino',
    dificuldade: 'facil',
    ocasiao: 'rapido',
    tempoTotalMin: 25,
    porcoesBase: 3,
    ingredientes: [
      { produtoId: 'p-calabresa', nome: 'Calabresa', kgPorPessoa: 0.2, emoji: '🌭' },
      { produtoId: null, nome: 'Cebola', kgPorPessoa: 0.1, unidade: 'un', emoji: '🧅' },
      { produtoId: null, nome: 'Cerveja escura', kgPorPessoa: 0.2, unidade: 'un', emoji: '🍺', opcional: true, nota: 'opcional, só pra deglaciar' },
    ],
    passos: [
      { numero: 1, texto: 'Fatie a calabresa em rodelas grossas e a cebola em meias-luas.', duracaoMin: 5 },
      { numero: 2, texto: 'Frite a calabresa em frigideira bem quente até dourar dos dois lados.', duracaoMin: 10 },
      { numero: 3, texto: 'Acrescente a cebola e mexa até caramelizar. Jogue a cerveja (opcional) e deixe evaporar.', duracaoMin: 8 },
      { numero: 4, texto: 'Sirva com pão e mostarda.', duracaoMin: 2 },
    ],
    tags: ['suino', 'rapido', 'petisco'],
  },
  {
    slug: 'hamburguer-artesanal',
    nome: 'Hambúrguer Artesanal',
    descricaoCurta: 'Blend no pão, queijo derretido, bacon. Aquele que faz em casa.',
    emoji: '🍔',
    proteina: 'bovino',
    dificuldade: 'facil',
    ocasiao: 'rapido',
    tempoTotalMin: 30,
    porcoesBase: 2,
    ingredientes: [
      { produtoId: 'p-hamburguer', nome: 'Hambúrguer Artesanal 180g', kgPorPessoa: 0.18, emoji: '🍔', nota: '1 por pessoa' },
      { produtoId: 'p-bacon', nome: 'Bacon em manta', kgPorPessoa: 0.05, emoji: '🥓' },
      { produtoId: 'p-pao-alho', nome: 'Pão de alho (acompanhamento)', kgPorPessoa: 0.05, unidade: 'un', emoji: '🍞', opcional: true },
      { produtoId: null, nome: 'Pão de hambúrguer', kgPorPessoa: 0.1, unidade: 'un', emoji: '🍞', nota: 'opcional, vende em padaria' },
    ],
    passos: [
      { numero: 1, texto: 'Tempere o blend com sal e pimenta. Frigideira bem quente, 3 min cada lado.', duracaoMin: 8 },
      { numero: 2, texto: 'Frite o bacon na mesma frigideira.', duracaoMin: 5 },
      { numero: 3, texto: 'Monte: pão, blend, queijo, bacon, pão. Sirva com batata frita.', duracaoMin: 5 },
    ],
    tags: ['bovino', 'rapido', 'lanche'],
  },
];

export const RECEITAS: Receita[] = receitas;

// Helper: filtra por texto livre (nome, descrição, tags).
export function filtrarReceitas(args: {
  texto?: string;
  proteina?: ProteinaReceita | 'todas';
  ocasiao?: OcasiãoReceita | 'todas';
}): Receita[] {
  const { texto, proteina = 'todas', ocasiao = 'todas' } = args;
  const t = texto?.trim().toLowerCase();
  return RECEITAS.filter((r) => {
    if (proteina !== 'todas' && r.proteina !== proteina) return false;
    if (ocasiao !== 'todas' && r.ocasiao !== ocasiao) return false;
    if (t) {
      const bag = `${r.nome} ${r.descricaoCurta} ${r.tags.join(' ')}`.toLowerCase();
      if (!bag.includes(t)) return false;
    }
    return true;
  });
}

// Calcula a lista de compra escalada pelo rendimento. Retorna itens
// do nosso seed com quantidade calculada + itens de despensa que o
// usuário precisa ter em casa.
export interface ItemCompra {
  produtoId: string | null;
  nome: string;
  quantidade: number;
  unidade: 'kg' | 'un';
  emoji?: string;
  /** preço em reais (0 pra despensa). */
  preco: number;
  /** se true, é item de despensa (não vendemos). */
  despensa: boolean;
  opcional?: boolean;
  nota?: string;
}

export function calcularCompraReceita(args: {
  receita: Receita;
  /** Quantas pessoas vão comer. Padrão: porções base da receita. */
  pessoas?: number;
}): { itens: ItemCompra[]; total: number; pessoas: number } {
  const receita = args.receita;
  // Cada "porção" da receita serve ~1 pessoa na nossa convenção.
  const pessoas = args.pessoas ?? receita.porcoesBase;
  const fator = pessoas / receita.porcoesBase;
  const itens: ItemCompra[] = [];
  for (const ing of receita.ingredientes) {
    if (!ing.produtoId) {
      // Item de despensa: avisa mas não vai pro carrinho.
      itens.push({
        produtoId: null,
        nome: ing.nome,
        quantidade: Math.max(1, Math.ceil(ing.kgPorPessoa * fator * 20)), // convertido em "un" estimativa
        unidade: ing.unidade ?? 'un',
        emoji: ing.emoji,
        preco: 0,
        despensa: true,
        opcional: ing.opcional,
        nota: ing.nota ?? 'Item de despensa — você compra no mercado.',
      });
      continue;
    }
    const p = PRODUTOS.find((x) => x.id === ing.produtoId);
    if (!p) continue;
    const quantidade = Math.ceil(ing.kgPorPessoa * fator * 10) / 10; // 100g
    itens.push({
      produtoId: p.id,
      nome: p.nome,
      quantidade,
      unidade: 'kg',
      emoji: ing.emoji,
      preco: Math.round(quantidade * p.precoKg * 100) / 100,
      despensa: false,
      opcional: ing.opcional,
      nota: ing.nota,
    });
  }
  const total = itens.reduce((s, i) => s + i.preco, 0);
  return { itens, total: Math.round(total * 100) / 100, pessoas };
}

// Lista única de proteínas pra filtro.
export const PROTEINAS_OPCOES: Array<{ id: ProteinaReceita | 'todas'; label: string; emoji: string }> = [
  { id: 'todas', label: 'Todas', emoji: '🍽️' },
  { id: 'bovino', label: 'Bovino', emoji: '🐄' },
  { id: 'suino', label: 'Suíno', emoji: '🐖' },
  { id: 'frango', label: 'Frango', emoji: '🐔' },
  { id: 'mista', label: 'Mista', emoji: '🥘' },
  { id: 'peixe', label: 'Peixe', emoji: '🐟' },
  { id: 'veggie', label: 'Veggie', emoji: '🥗' },
];

export const OCASIOES_OPCOES: Array<{ id: OcasiãoReceita | 'todas'; label: string }> = [
  { id: 'todas', label: 'Todas' },
  { id: 'rapido', label: 'Rápido' },
  { id: 'domingo', label: 'Domingo' },
  { id: 'jantar', label: 'Jantar' },
  { id: 'churrasco', label: 'Churrasco' },
  { id: 'festa', label: 'Festa' },
  { id: 'fit', label: 'Fit' },
];

export function categoriaReceita(cat: Categoria): string {
  const m: Record<Categoria, string> = {
    bovino: 'Bovino',
    suino: 'Suíno',
    aves: 'Aves',
    embutidos: 'Embutidos',
    preparados: 'Preparados',
    churrasco: 'Churrasco',
  };
  return m[cat];
}
