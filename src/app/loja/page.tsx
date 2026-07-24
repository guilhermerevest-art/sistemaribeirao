'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { ProdutoCard } from '@/components/loja/produto-card';
import { OfertaRelampago, OfertasSemana } from '@/components/loja/ofertas';
import { CATEGORIAS, type Categoria } from '@/lib/types';
import { cn } from '@/lib/formato';


export default function LojaPage() {
  const produtos = useStore((s) => s.produtos);
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria | 'todas'>('todas');

  const produtosFiltrados = categoriaAtiva === 'todas'
    ? produtos
    : produtos.filter((p) => p.categoria === categoriaAtiva);

  return (
    <>
      <HeaderLoja />

      <main className="mx-auto max-w-6xl px-4 pb-24">
        {/* Atalhos discretos no topo */}
        <nav className="pt-3 flex gap-3 text-xs">
          <Link href="/bancada" className="text-carvao/60 hover:text-carvao underline">Bancada</Link>
          <Link href="/painel" className="text-carvao/60 hover:text-carvao underline">Painel do dono</Link>
        </nav>

        {/* Faixa hero */}
        <section className="pt-3 pb-2">
          <div className="rounded-xl bg-carvao text-papel p-6 sm:p-8">
            <div className="font-display font-extrabold text-2xl sm:text-3xl leading-tight">
              Corte do dia, peso certo, sem fila.
            </div>
            <p className="text-sm text-papel/70 mt-2 max-w-xl">
              Faça seu pedido pelo celular, retire no balcão com o cupom já pronto, e ainda
              acumule cashback do que comprar.
            </p>
          </div>
        </section>

        <OfertaRelampago />
        <OfertasSemana />

        {/* Barra de categorias grudenta */}
        <div className="sticky top-[68px] z-20 bg-papel/95 backdrop-blur -mx-4 px-4 py-3 border-y border-sebo">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setCategoriaAtiva('todas')}
              className={cn(
                'shrink-0 px-4 h-10 rounded-md text-sm font-semibold border transition-colors',
                categoriaAtiva === 'todas'
                  ? 'bg-sangue text-papel border-sangue'
                  : 'bg-azulejo border-sebo text-carvao hover:border-carvao',
              )}
            >
              Tudo
            </button>
            {CATEGORIAS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoriaAtiva(c.id)}
                className={cn(
                  'shrink-0 px-4 h-10 rounded-md text-sm font-semibold border transition-colors',
                  categoriaAtiva === c.id
                    ? 'bg-sangue text-papel border-sangue'
                    : 'bg-azulejo border-sebo text-carvao hover:border-carvao',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grade de produtos */}
        <section className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {produtosFiltrados.map((p) => (
              <ProdutoCard key={p.id} produto={p} />
            ))}
          </div>
          {produtosFiltrados.length === 0 && (
            <div className="text-center py-16 text-carvao/60">Nada aqui nessa categoria.</div>
          )}
        </section>
      </main>
    </>
  );
}
