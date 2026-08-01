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

import type { Campanha, Cliente, Combo, Estabelecimento, Indicacao, Oferta, Pedido, Produto, Resgate } from './types';

const CHAVE = 'ribeirao-mock-v1';

// Versão atual do schema do snapshot. Quando o formato mudar, incre-
// mente e adicione uma migration em `migrarSnapshot`. Snapshots anti-
// gos (sem `_v`) são tratados como versão 0.
const VERSAO_ATUAL = 4;

export const ESTABELECIMENTO_PADRAO: Estabelecimento = {
  nomeFantasia: 'Empório Ribeirão',
  endereco: 'Rua das Flores, 123 · Centro · Ribeirão',
  telefone: '(34) 3333-0000',
  mensagemRodape: 'Obrigado pela preferência',
};

export interface SnapshotOffline {
  _v?: number;
  produtos: Produto[];
  clientes: Cliente[];
  pedidos: Pedido[];
  ofertas: Oferta[];
  resgates: Resgate[];
  combos: Combo[];
  campanhas: Campanha[];
  indicacoes: Indicacao[];
  receitasFavoritas?: string[];
  proximoPedido: number;
  clienteAtualId?: string;
  somBancada: boolean;
  impressaoAutomatica: boolean;
  ptsParaReais: Record<string, number>;
  estabelecimento: Estabelecimento;
  lojaAberta: boolean;
}

// Roda migrations incrementais. Cada função recebe o snapshot e
// devolve a versão atualizada. Adicione uma nova quando o schema
// mudar — não apague as antigas, pra snapshots velhos continuarem
// legíveis.
function migrarSnapshot(s: SnapshotOffline): SnapshotOffline {
  let v = s._v ?? 0;
  if (v < 1) {
    // v0 → v1: snapshot antigo sem `_v`. Nada a fazer, só versionar.
    v = 1;
  }
  if (v < 2) {
    // v1 → v2: adicionados `estabelecimento` e `lojaAberta`.
    s.estabelecimento = s.estabelecimento ?? ESTABELECIMENTO_PADRAO;
    s.lojaAberta = s.lojaAberta ?? true;
    v = 2;
  }
  if (v < 3) {
    // v2 → v3: adicionadas `indicacoes` (programa de referral).
    s.indicacoes = s.indicacoes ?? [];
    v = 3;
  }
  if (v < 4) {
    // v3 → v4: adicionadas `receitasFavoritas` (favoritos da cliente).
    s.receitasFavoritas = s.receitasFavoritas ?? [];
    v = 4;
  }
  s._v = v;
  return s;
}

export function lerSnapshotOffline(): SnapshotOffline | null {
  if (typeof window === 'undefined') return null;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const parsed = JSON.parse(bruto) as Partial<SnapshotOffline>;
    if (!parsed || !Array.isArray(parsed.produtos)) return null;
    const base: SnapshotOffline = {
      produtos: parsed.produtos,
      clientes: parsed.clientes ?? [],
      pedidos: parsed.pedidos ?? [],
      ofertas: parsed.ofertas ?? [],
      resgates: parsed.resgates ?? [],
      combos: parsed.combos ?? [],
      campanhas: parsed.campanhas ?? [],
      indicacoes: parsed.indicacoes ?? [],
      receitasFavoritas: parsed.receitasFavoritas ?? [],
      proximoPedido: parsed.proximoPedido ?? 600,
      clienteAtualId: parsed.clienteAtualId,
      somBancada: parsed.somBancada ?? true,
      impressaoAutomatica: parsed.impressaoAutomatica ?? true,
      ptsParaReais: parsed.ptsParaReais ?? { '100': 1, '500': 5 },
      estabelecimento: parsed.estabelecimento ?? ESTABELECIMENTO_PADRAO,
      lojaAberta: parsed.lojaAberta ?? true,
    };
    const migrado = migrarSnapshot(base);
    if (migrado._v !== VERSAO_ATUAL) {
      // Migração ficou incompleta (versão futura?). Melhor descartar
      // do que servir dados quebrados.
      // eslint-disable-next-line no-console
      console.warn('[snapshot] versão futura detectada, descartando');
      return null;
    }
    return migrado;
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
