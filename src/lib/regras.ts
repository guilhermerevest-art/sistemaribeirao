// Regras de cashback, pontos, níveis, ofertas e frequência.

import type {
  Categoria,
  Combo,
  ItemCarrinho,
  Nivel,
  Oferta,
  Produto,
} from './types';
import {
  BONUS_POR_NIVEL,
  CASHBACK_POR_CATEGORIA,
  LIMITES_NIVEL,
} from './types';

export interface ItemCotado {
  produtoId: string;
  pesoKg: number;
  categoria?: Categoria;
  precoBase: number;
  precoAplicado: number;
  subtotal: number;
  ofertaId?: string;
  comboId?: string;
  percentualCashbackCombo?: number;
}

export interface CotacaoPedido {
  itens: ItemCotado[];
  subtotal: number;
  descontoOfertas: number;
  valorPago: number;
  cashbackGerado: number;
  pontosGerados: number;
}

export function cotarPedido(args: {
  itens: ItemCarrinho[];
  produtos: Produto[];
  ofertas: Oferta[];
  combos?: Combo[];
  nivel: Nivel;
  cashbackUsado: number;
  descontoPontosReais?: number;
}): Omit<CotacaoPedido, 'itens'> & {
  itens: ItemCotado[];
} {
  const { itens, produtos, ofertas, combos = [], nivel, cashbackUsado, descontoPontosReais = 0 } = args;
  const produtoMap = new Map(produtos.map((p) => [p.id, p]));
  // Mapa de oferta já com a quantidade "reservada" do carrinho atual
  // descontada — assim dois itens do mesmo relâmpago no carrinho não
  // conseguem juntos ultrapassar o estoque disponível.
  const ofertaMap = new Map(
    ofertas
      .filter((o) => o.ativa)
      .map((o) => [o.id, { ...o, restante: ofertaRestante(o, itens) }]),
  );
  const comboMap = new Map(combos.map((c) => [c.id, c]));

  const cotados: ItemCotado[] = [];
  let subtotal = 0;
  let subtotalComOferta = 0;
  let totalPesoPago = 0;

  for (const item of itens) {
    if (item.comboId) {
      const combo = comboMap.get(item.comboId);
      if (!combo) continue;
      const precoBase = combo.precoCombo;
      const precoAplicado = combo.precoCombo;
      const subtotalItem = precoAplicado * item.pesoKg;
      cotados.push({
        produtoId: combo.id,
        pesoKg: item.pesoKg,
        precoBase,
        precoAplicado,
        subtotal: subtotalItem,
        comboId: combo.id,
        percentualCashbackCombo: combo.percentualCashback,
      });
      subtotal += precoBase * item.pesoKg;
      subtotalComOferta += precoAplicado * item.pesoKg;
      totalPesoPago += item.pesoKg;
      continue;
    }

    // Itens virtuais do planejador (bebidas, carvão) não têm produto
    // real e devem ser pulados na cotação — eles só aparecem como
    // badge no carrinho pra referência do cliente.
    if (item.virtual) continue;
    const p = produtoMap.get(item.produtoId);
    if (!p) continue;
    const precoBase = p.precoKg;
    let precoAplicado = item.precoUnitarioAplicado || precoBase;
    const ofertaOriginal = item.ofertaId ? ofertaMap.get(item.ofertaId) : undefined;
    // Oferta só vale enquanto ainda tem estoque; quando esgota, cai
    // automaticamente pro preço cheio — exatamente o comportamento que a
    // vitrine promete ("Acabou" e o produto volta ao preço normal).
    const oferta = ofertaElegivel(ofertaOriginal, item.pesoKg) ? ofertaOriginal : undefined;
    if (oferta) {
      precoAplicado = oferta.precoPor;
    }
    const subtotalItem = precoAplicado * item.pesoKg;
    cotados.push({
      produtoId: p.id,
      pesoKg: item.pesoKg,
      categoria: p.categoria,
      precoBase,
      precoAplicado,
      subtotal: subtotalItem,
      ofertaId: oferta?.id,
    });
    subtotal += precoBase * item.pesoKg;
    subtotalComOferta += precoAplicado * item.pesoKg;
    totalPesoPago += item.pesoKg;
  }

  const descontoOfertas = Math.max(0, subtotal - subtotalComOferta);
  const valorPago = Math.max(0, subtotalComOferta - cashbackUsado - descontoPontosReais);

  // Cashback aplica por item, percentual do produto (ou do combo, quando
  // for o caso), sobre o valor efetivamente pago.
  let cashbackBase = 0;
  for (const c of cotados) {
    const proporcao =
      subtotalComOferta > 0 ? c.subtotal / subtotalComOferta : 0;
    const valorPagoItem = valorPago * proporcao;
    const pctBase = c.comboId
      ? (c.percentualCashbackCombo ?? 0)
      : CASHBACK_POR_CATEGORIA[c.categoria!];
    const pct = pctBase + BONUS_POR_NIVEL[nivel];
    cashbackBase += valorPagoItem * pct;
  }
  const cashbackGerado = round2(cashbackBase);

  const pontosGerados = Math.floor(valorPago);

  return {
    itens: cotados,
    subtotal: round2(subtotal),
    descontoOfertas: round2(descontoOfertas),
    valorPago: round2(valorPago),
    cashbackGerado,
    pontosGerados,
  };
}

export function calcularMaximoUsoCashback(subtotal: number, saldo: number): number {
  const limitePorPedido = subtotal * 0.3;
  const maximo = Math.min(saldo, limitePorPedido);
  return maximo >= 5 ? round2(maximo) : 0;
}

// Constantes da regra de frete (espelham o checkout).
export const FRETE_GRATIS_ACIMA_DE = 150;
export const TAXA_ENTREGA = 8;

// Quanto falta pra liberar o frete grátis. Retorna 0 se já passou.
export function faltaParaFreteGratis(subtotal: number): number {
  return Math.max(0, round2(FRETE_GRATIS_ACIMA_DE - subtotal));
}

// Acha a faixa da tabela pontos->R$ que dá o maior desconto que o
// cliente consegue pagar (tem pontos suficientes) e que cabe dentro do
// limite de reais disponível (ex: 30% do subtotal, já descontado o
// cashback usado no mesmo pedido).
export function melhorDescontoPontos(
  pontosDisponiveis: number,
  limiteReais: number,
  tabela: Record<string, number>,
): { pontosUsados: number; valorDesconto: number } | null {
  let melhor: { pontosUsados: number; valorDesconto: number } | null = null;
  for (const [ptsStr, valor] of Object.entries(tabela)) {
    const pts = Number(ptsStr);
    if (!Number.isFinite(pts) || pts <= 0 || !Number.isFinite(valor) || valor <= 0) continue;
    if (pts > pontosDisponiveis) continue;
    if (valor > limiteReais) continue;
    if (!melhor || valor > melhor.valorDesconto) {
      melhor = { pontosUsados: pts, valorDesconto: round2(valor) };
    }
  }
  return melhor;
}

export function nivelPorPontos(pontosAcumulado: number): Nivel {
  if (pontosAcumulado >= LIMITES_NIVEL.ouro) return 'ouro';
  if (pontosAcumulado >= LIMITES_NIVEL.prata) return 'prata';
  return 'bronze';
}

export interface BeneficioNivel {
  cashbackBonus: number;
  antecipacaoOfertas: boolean;
}

export function beneficios(nivel: Nivel): BeneficioNivel {
  return {
    cashbackBonus: BONUS_POR_NIVEL[nivel],
    antecipacaoOfertas: nivel === 'ouro',
  };
}

export function ofertaAtivaPara(
  ofertas: Oferta[],
  produtoId: string,
  agora: Date,
  paraOuro: boolean,
): Oferta | undefined {
  const candidatas = ofertas.filter((o) => {
    if (!o.ativa) return false;
    if (o.produtoId !== produtoId) return false;
    const inicio = new Date(o.inicioEm);
    const fim = new Date(o.fimEm);
    if (agora < inicio || agora > fim) return false;
    if (o.tipo === 'relampago') {
      if (o.quantidadeTotalKg && o.quantidadeVendidaKg >= o.quantidadeTotalKg) {
        return false;
      }
    }
    return true;
  });
  if (candidatas.length === 0) return undefined;
  // Oferta relâmpago tem prioridade quando ambas aplicam.
  const relampago = candidatas.find((o) => o.tipo === 'relampago');
  if (relampago) return relampago;
  const semana = candidatas.find((o) => o.tipo === 'semana');
  if (semana) {
    if (paraOuro) return semana;
    // Bronze e prata: oferta da semana só "abre" 24h após o início.
    const inicio = new Date(semana.inicioEm).getTime();
    if (agora.getTime() >= inicio + 24 * 3600 * 1000) return semana;
  }
  return undefined;
}

// Quanto da oferta já está efetivamente reservado pelos itens do
// carrinho atual. Serve pra não deixar dois itens do mesmo relâmpago
// consumirem, juntos, mais do que o estoque disponível.
function ofertaRestante(oferta: Oferta, itens: ItemCarrinho[]): number | undefined {
  if (oferta.quantidadeTotalKg == null) return undefined;
  const reservado = itens
    .filter((i) => !i.comboId && i.ofertaId === oferta.id)
    .reduce((s, i) => s + i.pesoKg, 0);
  return Math.max(0, oferta.quantidadeTotalKg - oferta.quantidadeVendidaKg - reservado);
}

// Verifica se a oferta ainda consegue absorver o peso deste item.
function ofertaElegivel(
  oferta: Oferta | undefined,
  pesoKg: number,
): oferta is Oferta {
  if (!oferta) return false;
  if (oferta.quantidadeTotalKg == null) return true;
  // `oferta.restante` é injetado pelo map acima em cotarPedido; se a
  // oferta vier de fora, recalcula na hora.
  const restante =
    (oferta as Oferta & { restante?: number }).restante ??
    Math.max(0, oferta.quantidadeTotalKg - oferta.quantidadeVendidaKg);
  return pesoKg <= restante;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function validadeCashbackISO(ultimaCompraISO: string, dias = 60): string {
  const d = new Date(ultimaCompraISO);
  d.setDate(d.getDate() + dias);
  return d.toISOString();
}

// Sugestões cruzadas: "se tem bovino, sugere carvao, sal grosso, linguica".
// Devolve até 3 produtos de categorias complementares.
const REGRA_SUGESTOES: Partial<Record<Categoria, Categoria[]>> = {
  bovino: ['churrasco', 'embutidos', 'preparados'],
  suino: ['churrasco', 'embutidos', 'preparados'],
  aves: ['preparados', 'churrasco', 'embutidos'],
  embutidos: ['churrasco', 'preparados', 'aves'],
  preparados: ['churrasco', 'aves', 'embutidos'],
  churrasco: ['bovino', 'suino', 'embutidos'],
};

export function sugestoesCruzadas(
  todos: Produto[],
  categoriasNoCarrinho: Categoria[],
  limite = 3,
): Produto[] {
  const jaTem = new Set(
    todos.filter((p) => categoriasNoCarrinho.includes(p.categoria)).map((p) => p.id),
  );
  const sugeridas = new Set<Categoria>();
  for (const c of categoriasNoCarrinho) {
    for (const sug of REGRA_SUGESTOES[c] ?? []) {
      if (!categoriasNoCarrinho.includes(sug)) sugeridas.add(sug);
    }
  }
  const out: Produto[] = [];
  for (const sug of sugeridas) {
    const p = todos.find((p) => p.categoria === sug && !jaTem.has(p.id) && p.disponivel);
    if (p) out.push(p);
    if (out.length >= limite) break;
  }
  return out;
}

