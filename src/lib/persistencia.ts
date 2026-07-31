// Persistência em localStorage para o modo offline.
// O açougue-ribeirão guarda o state em Supabase quando há env vars
// configuradas (caso contrário o build da Vercel roda sem Supabase e o
// app precisa continuar funcionando como demo). Esse módulo:
//   - lê o que houver em `ribeirao-mock-v1` (chave legada do estado
//     pré-Supabase) na primeira carga em modo offline;
//   - grava o state em localStorage em toda mutação offline.
//
// Manter separado do store.ts evita que o resto do código se preocupe
// com o detalhe.

import type { Campanha, Cliente, Combo, Oferta, Pedido, Produto, Resgate } from './types';

const CHAVE = 'ribeirao-mock-v1';

export interface SnapshotOffline {
  produtos: Produto[];
  clientes: Cliente[];
  pedidos: Pedido[];
  ofertas: Oferta[];
  resgates: Resgate[];
  combos: Combo[];
  campanhas: Campanha[];
  proximoPedido: number;
  clienteAtualId?: string;
  somBancada: boolean;
  impressaoAutomatica: boolean;
  ptsParaReais: Record<string, number>;
}

export function lerSnapshotOffline(): SnapshotOffline | null {
  if (typeof window === 'undefined') return null;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const parsed = JSON.parse(bruto) as Partial<SnapshotOffline>;
    if (!parsed || !Array.isArray(parsed.produtos)) return null;
    return {
      produtos: parsed.produtos,
      clientes: parsed.clientes ?? [],
      pedidos: parsed.pedidos ?? [],
      ofertas: parsed.ofertas ?? [],
      resgates: parsed.resgates ?? [],
      combos: parsed.combos ?? [],
      campanhas: parsed.campanhas ?? [],
      proximoPedido: parsed.proximoPedido ?? 600,
      clienteAtualId: parsed.clienteAtualId,
      somBancada: parsed.somBancada ?? true,
      impressaoAutomatica: parsed.impressaoAutomatica ?? true,
      ptsParaReais: parsed.ptsParaReais ?? { '100': 1, '500': 5 },
    };
  } catch {
    return null;
  }
}

export function gravarSnapshotOffline(s: SnapshotOffline): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(s));
  } catch {
    // localStorage cheio / disabled — silencioso: a demo funciona
    // enquanto a aba estiver aberta.
  }
}

export function limparSnapshotOffline(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    // Sem efeito colateral.
  }
}
