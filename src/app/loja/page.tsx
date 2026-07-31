'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { ProdutoCard } from '@/components/loja/produto-card';
import { ComboCard } from '@/components/loja/combo-card';
import { OfertaRelampago, OfertasSemana } from '@/components/loja/ofertas';
import { QueTalAdicionar } from '@/components/loja/que-tal-adicionar';
import { CATEGORIAS, type Categoria } from '@/lib/types';
import { CATEGORIA_ICONE, CATEGORIA_LABELS_LONG } from '@/lib/icons';
import { Search, ArrowRight, ChefHat } from 'lucide-react';
import { cn } from '@/lib/formato';

export default function LojaPage() {
  const produtos = useStore((s) => s.produtos);
  const combos = useStore((s) => s.combos);
  const carregado = useStore((s) => s.carregado);
  const lojaAberta = useStore((s) => s.lojaAberta);
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria | 'todas'>('todas');
  const [busca, setBusca] = useState('');

  const contagemPorCategoria = useMemo(() => {
    const m: Record<string, number> = { todas: produtos.length };
    for (const c of CATEGORIAS) {
      m[c.id] = produtos.filter((p) => p.categoria === c.id).length;
    }
    return m;
  }, [produtos]);

  const termo = busca.trim().toLowerCase();
  const porCategoria = useMemo(() => {
    const out: { id: Categoria | 'todas'; label: string; produtos: typeof produtos }[] = [];
    if (categoriaAtiva === 'todas') {
      for (const c of CATEGORIAS) {
        const lista = produtos.filter((p) => p.categoria === c.id && (!termo || p.nome.toLowerCase().includes(termo)));
        if (lista.length > 0) out.push({ id: c.id, label: CATEGORIA_LABELS_LONG[c.id], produtos: lista });
      }
    } else {
      const lista = produtos.filter((p) => p.categoria === categoriaAtiva && (!termo || p.nome.toLowerCase().includes(termo)));
      out.push({ id: categoriaAtiva, label: CATEGORIA_LABELS_LONG[categoriaAtiva], produtos: lista });
    }
    return out;
  }, [produtos, categoriaAtiva, termo]);

  return (
    <>
      <HeaderLoja />
      <QueTalAdicionar />

      <main className="mx-auto max-w-6xl px-3 sm:px-4 pb-24">
        {!lojaAberta && (
          <div className="mt-3 rounded-md bg-vermelho-risco text-branco px-3 py-2 text-sm font-semibold">
            Estamos fechados no momento. Voltamos em breve.
          </div>
        )}
        {/* atalhos super discretos no topo */}
        <nav className="pt-3 flex gap-3 text-xs">
          <Link href="/bancada" className="text-preto/60 hover:text-preto underline">Bancada</Link>
          <Link href="/painel" className="text-preto/60 hover:text-preto underline">Painel do dono</Link>
        </nav>

        {/* Hero Angelina */}
        <section className="pt-3">
          <div className="relative rounded-2xl overflow-hidden bg-vermelho text-branco h-[42vh] sm:h-[60vh] min-h-[280px] sm:min-h-[420px]">
            <img
              src="/produtos/picanha.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              onError={(e) => ((e.currentTarget.style.display = 'none'))}
            />
            <div className="relative h-full flex flex-col justify-end p-6 sm:p-10">
              <div className="font-display font-extrabold text-3xl sm:text-5xl leading-[1.05] max-w-xl uppercase tracking-tight">
                Carne boa, do balcão pro celular.
              </div>
              <p className="mt-3 text-base sm:text-lg text-branco/90 max-w-xl">
                Picanha, linguiça, carvão. Peça pelo app, retire no balcão com o cupom pronto.
              </p>
              <a
                href="#produtos"
                className="mt-5 inline-flex items-center gap-2 bg-amarelo text-preto font-extrabold uppercase tracking-wide px-5 py-3 rounded-md self-start hover:bg-amarelo/90"
              >
                Ver a vitrine
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {combos.filter((c) => c.ativo).length > 0 && (
          <section className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-display font-extrabold uppercase text-xl tracking-tight">Combos</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {combos.filter((c) => c.ativo).map((c) => (
                <ComboCard key={c.id} combo={c} />
              ))}
            </div>
          </section>
        )}

        <OfertaRelampago />
        <OfertasSemana />

        {/* Busca */}
        <section className="mt-4">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-preto/40" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar corte, produto…"
              className="w-full h-11 pl-9 pr-3 rounded-md bg-branco border border-cinza-claro text-sm placeholder:text-preto/40 focus:outline-none focus:border-vermelho"
            />
          </label>
        </section>

        {/* Categorias — Angelina style: chips grandes com ícones */}
        <div className="sticky top-[68px] z-20 bg-branco/95 backdrop-blur -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 border-b border-cinza-claro mt-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <ChipCategoria
              ativa={categoriaAtiva === 'todas'}
              onClick={() => setCategoriaAtiva('todas')}
              rotulo="Tudo"
              icone={null}
              contador={contagemPorCategoria.todas}
            />
            {CATEGORIAS.map((c) => (
              <ChipCategoria
                key={c.id}
                ativa={categoriaAtiva === c.id}
                onClick={() => setCategoriaAtiva(c.id)}
                rotulo={c.label}
                icone={CATEGORIA_ICONE[c.id] ?? null}
                contador={contagemPorCategoria[c.id]}
                title={CATEGORIA_LABELS_LONG[c.id]}
              />
            ))}
          </div>
        </div>

        {/* Grade de produtos — por seção / categoria */}
        <section id="produtos" className="mt-6 space-y-10">
          {!carregado && produtos.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-cinza-claro aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            porCategoria.map((sec) => (
              <div key={sec.id} id={`cat-${sec.id}`} className="scroll-mt-32">
                <div className="flex items-center gap-2 mb-3">
                  <ChefHat className="w-4 h-4 text-vermelho" />
                  <h2 className="font-display font-extrabold uppercase text-xl tracking-tight">
                    {sec.label}
                  </h2>
                  <span className="text-xs text-preto/60 ml-1">{sec.produtos.length} itens</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sec.produtos.map((p) => (
                    <ProdutoCard key={p.id} produto={p} />
                  ))}
                </div>
              </div>
            ))
          )}
          {porCategoria.every((s) => s.produtos.length === 0) && carregado && (
            <div className="text-center py-16">
              {produtos.length === 0 ? (
                <>
                  <div className="text-5xl mb-2">🥩</div>
                  <p className="text-preto/70">Vitrine vazia.</p>
                  <p className="text-xs text-preto/50 mt-1">
                    Use o botão <strong>Reiniciar demonstração</strong> no painel pra restaurar o seed.
                  </p>
                  <Link href="/painel" className="mt-3 inline-block text-vermelho font-semibold text-sm hover:underline">
                    Ir pro painel →
                  </Link>
                </>
              ) : (
                <p className="text-preto/60 text-sm">
                  Nada encontrado. Limpe a busca ou troque a categoria.
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function ChipCategoria({
  ativa,
  onClick,
  rotulo,
  icone,
  contador,
  title,
}: {
  ativa: boolean;
  onClick: () => void;
  rotulo: string;
  icone: React.ComponentType<{ className?: string }> | null;
  contador?: number;
  title?: string;
}) {
  const Icon = icone;
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'shrink-0 h-11 px-4 rounded-full text-sm font-semibold border transition-colors inline-flex items-center gap-1.5',
        ativa
          ? 'bg-preto text-branco border-preto'
          : 'bg-branco border-cinza-claro text-preto hover:border-preto',
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{rotulo}</span>
      {typeof contador === 'number' && (
        <span
          className={cn(
            'ml-1 px-1.5 rounded-full text-[10px] tabular-nums',
            ativa ? 'bg-amarelo text-preto' : 'bg-cinza-claro text-preto/60',
          )}
        >
          {contador}
        </span>
      )}
    </button>
  );
}
