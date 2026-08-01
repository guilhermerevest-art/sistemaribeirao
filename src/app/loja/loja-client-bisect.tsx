// Bissecção 1: mantém Header + Hero + Banners. Tira combos, ofertas, busca, chips, grade.
// Se o erro sumir, a fonte está em:
//   <ComboCard />, <OfertaRelampago />, <OfertasSemana />, busca, chips, grade
// Se persistir, está em:
//   <HeaderLoja />, <QueTalAdicionar />, hero, banners

'use client';

import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { CATEGORIAS } from '@/lib/types';
import Link from 'next/link';

export default function LojaClient() {
  const combos = useStore((s) => s.combos);
  const lojaAberta = useStore((s) => s.lojaAberta);

  return (
    <>
      <HeaderLoja />

      <main className="mx-auto max-w-6xl px-3 sm:px-4 pb-24">
        {!lojaAberta && (
          <div className="mt-3 rounded-md bg-vermelho-risco text-branco px-3 py-2 text-sm font-semibold">
            Estamos fechados no momento. Voltamos em breve.
          </div>
        )}
        <nav className="pt-3 flex gap-3 text-xs">
          <Link href="/bancada" className="text-preto/60 hover:text-preto underline">Bancada</Link>
          <Link href="/painel" className="text-preto/60 hover:text-preto underline">Painel do dono</Link>
        </nav>
        <section className="pt-3">
          <div className="relative rounded-2xl overflow-hidden bg-vermelho text-branco h-[42vh] sm:h-[60vh] min-h-[280px] sm:min-h-[420px]">
            <img src="/produtos/picanha.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="relative h-full flex flex-col justify-end p-6 sm:p-10">
              <div className="font-display font-extrabold text-3xl sm:text-5xl leading-[1.05] max-w-xl uppercase tracking-tight">
                Carne boa, do balcão pro celular.
              </div>
              <p className="mt-3 text-base sm:text-lg text-branco/90 max-w-xl">
                Picanha, linguiça, carvão. Peça pelo app, retire no balcão com o cupom pronto.
              </p>
            </div>
          </div>
        </section>
        <div className="mt-2 text-xs text-preto/50">Combo: {combos.length} · Cat: {CATEGORIAS.length}</div>
      </main>
    </>
  );
}
