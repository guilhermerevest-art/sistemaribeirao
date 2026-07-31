'use client';

import Link from 'next/link';
import type { Produto } from '@/lib/types';
import { brl } from '@/lib/formato';
import { Sparkles } from 'lucide-react';
import { ImagemProduto } from '@/components/ui/imagem-produto';

export function ProdutoCard({ produto }: { produto: Produto }) {
  const cashbackPorKg = produto.precoKg * produto.percentualCashback;
  return (
    <Link
      href={`/loja/produto/${produto.slug}`}
      className="group relative block bg-branco hover:shadow-md transition-all"
    >
      <div className="aspect-square bg-cinza-claro overflow-hidden">
        <ImagemProduto
          src={produto.imagem}
          alt={produto.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="px-3 pt-3 pb-2 border-x border-cinza-claro">
        <div className="font-display font-bold text-sm leading-tight line-clamp-2 min-h-[2.4em] text-preto">
          {produto.nome}
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="font-mono font-extrabold text-lg tabular-nums text-preto">
            {brl(produto.precoKg)}
            <span className="text-xs font-normal text-preto/60"> /kg</span>
          </div>
          {produto.unidadeVenda !== 'kg' && (
            <span className="text-[10px] uppercase font-semibold text-preto/60">
              {produto.unidadeVenda}
            </span>
          )}
        </div>
      </div>
      <div className="tarja-barcode mx-3 border-x border-cinza-claro" />
      <div className="px-3 py-2 border border-cinza-claro border-t-0 etiqueta-serrilhada flex items-center justify-between text-[10px] font-mono text-preto/70">
        <span className="inline-flex items-center gap-1 text-verde-fiel font-semibold">
          <Sparkles className="w-3 h-3" />
          {brl(cashbackPorKg)}/kg
        </span>
        <span className="uppercase tracking-wider">{produto.categoria}</span>
      </div>
    </Link>
  );
}
