// Tipos do Empório Ribeirão — fonte única de verdade.

export type Categoria =
  | 'bovino'
  | 'suino'
  | 'aves'
  | 'embutidos'
  | 'preparados'
  | 'churrasco';

export type UnidadeVenda = 'kg' | 'peca' | 'bandeja' | 'unidade';

export interface Produto {
  id: string;
  slug: string;
  nome: string;
  categoria: Categoria;
  corte?: string;
  descricao: string;
  precoKg: number;
  unidadeVenda: UnidadeVenda;
  pesoMedioPeca?: number;
  imagem: string;
  percentualCashback: number;
  preparosDisponiveis: string[];
  destaque: boolean;
  disponivel: boolean;
}

export interface ItemCarrinho {
  produtoId: string;
  pesoKg: number;
  preparos: string[];
  observacao?: string;
  ofertaId?: string;
  precoUnitarioAplicado: number;
  subtotal: number;
  // Quando setado, o item é um combo (não um produto avulso). `produtoId`
  // fica igual ao id do combo por compatibilidade com código que ainda
  // não conhece combos — eles simplesmente não acham o produto e ignoram.
  // `pesoKg` vira "quantidade" de combos (sempre inteiro, unidade fixa).
  comboId?: string;
  // Itens virtuais do planejador (bebidas, carvão). Não têm produto real
  // — `produtoId` aponta pra um id virtual prefixado com `virtual:`.
  // O carrinho exibe com badge, mas o cupom/cotação ignoram (peso=0).
  virtual?: boolean;
  virtualSlug?: 'bebidas';
}

export type StatusPedido =
  | 'novo'
  | 'preparando'
  | 'pronto'
  | 'entregue'
  | 'cancelado';

export type Retirada = 'balcao' | 'entrega';
export type Pagamento = 'pix' | 'cartao_entrega' | 'dinheiro';

export interface Pedido {
  id: string;
  clienteId: string;
  itens: ItemCarrinho[];
  subtotal: number;
  descontoOfertas: number;
  cashbackUsado: number;
  pontosUsados?: number;
  descontoPontos?: number;
  taxaEntrega: number;
  total: number;
  cashbackGerado: number;
  pontosGerados: number;
  status: StatusPedido;
  retirada: Retirada;
  endereco?: string;
  pagamento: Pagamento;
  trocoPara?: number;
  observacaoGeral?: string;
  criadoEm: string;
  impressoEm?: string;
}

export type Nivel = 'bronze' | 'prata' | 'ouro';
export type Frequencia = 'novo' | 'fiel' | 'ocasional' | 'em_risco' | 'inativo';

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  nascimento?: string;
  criadoEm: string;
  saldoCashback: number;
  cashbackExpiraEm?: string;
  pontos: number;
  pontosAcumuladoTotal: number;
  aceitaWhatsapp: boolean;
  /** Código curto único que o cliente compartilha pra indicar amigos (ex: "MARIA7"). */
  codigoIndicacao?: string;
  /** Id do cliente que trouxe este. Preenchido quando o cadastro veio via `?ref=`. */
  indicadoPor?: string;
}

/** Indicação feita por um cliente pra um amigo. */
export interface Indicacao {
  id: string;
  indicadorId: string;     // quem indicou
  indicadoId: string;       // quem foi indicado
  codigoUsado: string;      // código que foi compartilhado
  criadoEm: string;
  status: 'pendente' | 'convertido' | 'expirado';
  /** Valor em R$ creditado ao indicador quando o indicado converte (1º pedido). */
  recompensaCreditadaEm?: string;
}

/**
 * Oferta ativa dentro de um intervalo (`inicioEm` → `fimEm`) e, quando tem
 * recorrência, só nos dias da semana marcados. Dias seguem `Date#getDay`
 * (0 = domingo, 6 = sábado). Se `diasSemana` for `undefined` ou vazio, a
 * oferta fica ativa em todos os dias do intervalo (comportamento legado).
 */
export interface Oferta {
  id: string;
  tipo: 'semana' | 'relampago';
  produtoId: string;
  precoDe: number;
  precoPor: number;
  inicioEm: string;
  fimEm: string;
  limitePorCliente?: number;
  quantidadeTotalKg?: number;
  quantidadeVendidaKg: number;
  chamada: string;
  ativa: boolean;
  comboId?: string;
  brindeProdutoId?: string;
  /**
   * Recorrência semanal. Quando definido, a oferta só fica visível nos
   * dias da semana marcados, dentro do período `inicioEm`/`fimEm`. A cada
   * virada de semana, a oferta reabre sozinha — sem precisar cadastrar
   * uma nova. Use `[5, 6]` para "toda sexta e sábado".
   */
  diasSemana?: number[];
}

/** Rótulos canônicos dos 7 dias da semana (0 = domingo). */
export const DIAS_SEMANA: { valor: number; curto: string; longo: string }[] = [
  { valor: 0, curto: 'D', longo: 'Domingo' },
  { valor: 1, curto: 'S', longo: 'Segunda' },
  { valor: 2, curto: 'T', longo: 'Terça' },
  { valor: 3, curto: 'Q', longo: 'Quarta' },
  { valor: 4, curto: 'Q', longo: 'Quinta' },
  { valor: 5, curto: 'S', longo: 'Sexta' },
  { valor: 6, curto: 'S', longo: 'Sábado' },
];

export const DIAS_UTEIS = [1, 2, 3, 4, 5];
export const FINS_DE_SEMANA = [0, 6];
export const TODOS_OS_DIAS = [0, 1, 2, 3, 4, 5, 6];

export interface Resgate {
  id: string;
  nome: string;
  custoPontos: number;
  imagem: string;
  ativo: boolean;
}

export interface Estabelecimento {
  nomeFantasia: string;
  endereco: string;
  telefone: string;
  cnpj?: string;
  mensagemRodape: string;
}

export interface ItemCombo {
  produtoId: string;
  quantidadeKg: number;
}

export interface Combo {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  imagem: string;
  precoCombo: number;
  percentualCashback: number;
  itens: ItemCombo[];
  ativo: boolean;
}

export type PublicoAlvo = 'novo' | 'fiel' | 'ocasional' | 'em_risco' | 'inativo' | 'todos' | 'custom';

export interface Campanha {
  id: string;
  titulo: string;
  mensagemTemplate: string;
  publicoAlvo: PublicoAlvo;
  clientesIds?: string[];
  dataCriacao: string;
  dataEnvio?: string;
  totalDestinatarios: number;
  ativo: boolean;
}

export const CATEGORIAS: { id: Categoria; label: string }[] = [
  { id: 'bovino', label: 'Bovino' },
  { id: 'suino', label: 'Suíno' },
  { id: 'aves', label: 'Aves' },
  { id: 'embutidos', label: 'Embutidos' },
  { id: 'preparados', label: 'Preparados' },
  { id: 'churrasco', label: 'Churrasco' },
];

export const CASHBACK_POR_CATEGORIA: Record<Categoria, number> = {
  bovino: 0.03,
  suino: 0.04,
  aves: 0.04,
  embutidos: 0.05,
  preparados: 0.05,
  churrasco: 0.02,
};

export const BONUS_POR_NIVEL: Record<Nivel, number> = {
  bronze: 0,
  prata: 0.01,
  ouro: 0.02,
};

export const LIMITES_NIVEL: Record<Nivel, number> = {
  bronze: 0,
  prata: 1500,
  ouro: 4000,
};

export const PREPAROS: Record<Categoria, string[]> = {
  bovino: [
    'Cortar em bifes',
    'Cortar em cubos',
    'Moer',
    'Tirar a gordura',
    'Peça inteira',
    'Cortar para churrasco',
    'Amaciar',
  ],
  suino: ['Cortar em pedaços', 'Peça inteira', 'Cortar em bifes', 'Temperar'],
  aves: ['Inteiro', 'Em pedaços', 'Desossar', 'Cortar em tiras', 'Moer'],
  embutidos: ['Peça inteira', 'Cortar em gomos', 'Fatiar fino'],
  preparados: [],
  churrasco: [],
};
