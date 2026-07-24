// Regras de cashback, pontos, níveis, ofertas e frequência.

import type {
  Categoria,
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
  categoria: Categoria;
  precoBase: number;
  precoAplicado: number;
  subtotal: number;
  ofertaId?: string;
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
  nivel: Nivel;
  cashbackUsado: number;
}): Omit<CotacaoPedido, 'itens'> & {
  itens: ItemCotado[];
} {
  const { itens, produtos, ofertas, nivel, cashbackUsado } = args;
  const produtoMap = new Map(produtos.map((p) => [p.id, p]));
  const ofertaMap = new Map(ofertas.filter((o) => o.ativa).map((o) => [o.id, o]));

  const cotados: ItemCotado[] = [];
  let subtotal = 0;
  let subtotalComOferta = 0;
  let totalPesoPago = 0;

  for (const item of itens) {
    const p = produtoMap.get(item.produtoId);
    if (!p) continue;
    const precoBase = p.precoKg;
    let precoAplicado = item.precoUnitarioAplicado || precoBase;
    const oferta = item.ofertaId ? ofertaMap.get(item.ofertaId) : undefined;
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
  const valorPago = Math.max(0, subtotalComOferta - cashbackUsado);

  // Cashback aplica por item, percentual do produto, sobre o valor efetivamente pago.
  let cashbackBase = 0;
  for (const c of cotados) {
    const proporcao =
      subtotalComOferta > 0 ? c.subtotal / subtotalComOferta : 0;
    const valorPagoItem = valorPago * proporcao;
    const pct =
      CASHBACK_POR_CATEGORIA[c.categoria] + BONUS_POR_NIVEL[nivel];
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

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function validadeCashbackISO(ultimaCompraISO: string, dias = 60): string {
  const d = new Date(ultimaCompraISO);
  d.setDate(d.getDate() + dias);
  return d.toISOString();
}
