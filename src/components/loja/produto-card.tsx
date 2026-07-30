'use client';

import Link from 'next/link';
import type { Produto } from '@/lib/types';
import { brl } from '@/lib/formato';
import { Sparkles } from 'lucide-react';

export function ProdutoCard({ produto }: { produto: Produto }) {
  const cashbackPorKg = produto.precoKg * produto.percentualCashback;
  return (
    <Link
      href={`/loja/produto/${produto.slug}`}
      className="etiqueta relative block rounded-md overflow-hidden hover:shadow-md transition-shadow"
    >
      {produto.novidade && (
        <div className="absolute top-2 left-2 z-10 bg-[color:var(--amarelo-novo)] text-papel text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-sm">
          Novidade
        </div>
      )}
      <div className="aspect-square bg-sebo-claro overflow-hidden">
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="px-3 pt-3 pb-5">
        <div className="font-display font-extrabold text-sm uppercase tracking-tight leading-tight line-clamp-2 min-h-[2.4em]">
          {produto.nome}
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="font-mono text-xl font-bold tabular-nums">
            {brl(produto.precoKg)}
            <span className="text-xs font-normal text-carvao/60"> /kg</span>
          </div>
          {produto.unidadeVenda !== 'kg' && (
            <span className="text-[10px] uppercase font-semibold text-carvao/60">
              {produto.unidadeVenda}
            </span>
          )}
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brasa">
          <Sparkles className="w-3 h-3" />
          volta {brl(cashbackPorKg)} por kg
        </div>
      </div>
      <div className="barcode mx-3 mb-3" aria-hidden />
    </Link>
  );
}
