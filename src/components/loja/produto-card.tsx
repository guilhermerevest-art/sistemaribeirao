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
      className="group relative block rounded-lg overflow-hidden bg-branco border border-cinza-claro hover:border-vermelho hover:shadow-md transition-all"
    >
      {produto.novidade && (
        <div className="absolute top-2 left-2 z-10 bg-amarelo text-preto text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-sm">
          Novidade
        </div>
      )}
      <div className="aspect-square bg-cinza-claro overflow-hidden">
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="px-3 pt-3 pb-3">
        <div className="font-display font-bold text-sm leading-tight line-clamp-2 min-h-[2.4em] text-preto">
          {produto.nome}
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="font-sans font-bold text-lg tabular-nums text-preto">
            {brl(produto.precoKg)}
            <span className="text-xs font-normal text-preto/60"> /kg</span>
          </div>
          {produto.unidadeVenda !== 'kg' && (
            <span className="text-[10px] uppercase font-semibold text-preto/60">
              {produto.unidadeVenda}
            </span>
          )}
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-verde-fiel">
          <Sparkles className="w-3 h-3" />
          volta {brl(cashbackPorKg)} por kg
        </div>
      </div>
    </Link>
  );
}
