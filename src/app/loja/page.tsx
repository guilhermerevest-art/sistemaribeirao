'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { ProdutoCard } from '@/components/loja/produto-card';
import { OfertaRelampago, OfertasSemana } from '@/components/loja/ofertas';
import { QueTalAdicionar } from '@/components/loja/que-tal-adicionar';
import { CATEGORIAS, type Categoria } from '@/lib/types';
import { CATEGORIA_ICONE, CATEGORIA_LABELS_LONG } from '@/lib/icons';
import { Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/formato';

const HERO_SLIDES = [
  {
    titulo: 'Corte do dia, peso certo, sem fila.',
    subtitulo: 'Faça seu pedido pelo celular, retire no balcão com o cupom já pronto.',
  },
  {
    titulo: 'Volta dinheiro toda semana.',
    subtitulo: 'Até 5% de cashback em selecionados. Acumula, usa, e quanto mais compra, mais sobe de nível.',
  },
  {
    titulo: 'Picanha, linguiça, carvão. No mesmo pedido.',
    subtitulo: 'Açougue + empório. Já separa tudo no balcão com um único cupom.',
  },
];

export default function LojaPage() {
  const produtos = useStore((s) => s.produtos);
  const carregado = useStore((s) => s.carregado);
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria | 'todas'>('todas');
  const [busca, setBusca] = useState('');
  const [slide, setSlide] = useState(0);

  const contagemPorCategoria = useMemo(() => {
    const m: Record<string, number> = { todas: produtos.length };
    for (const c of CATEGORIAS) {
      m[c.id] = produtos.filter((p) => p.categoria === c.id).length;
    }
    return m;
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      if (categoriaAtiva !== 'todas' && p.categoria !== categoriaAtiva) return false;
      if (termo && !p.nome.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [produtos, categoriaAtiva, busca]);

  return (
    <>
      <HeaderLoja />
      <QueTalAdicionar />

      <main className="mx-auto max-w-6xl px-3 sm:px-4 pb-24">
        {/* atalhos super discretos no topo */}
        <nav className="pt-3 flex gap-3 text-xs">
          <Link href="/bancada" className="text-carvao/60 hover:text-carvao underline">Bancada</Link>
          <Link href="/painel" className="text-carvao/60 hover:text-carvao underline">Painel do dono</Link>
        </nav>

        {/* Hero carousel */}
        <section className="pt-3 pb-2">
          <div className="rounded-xl bg-carvao text-papel p-5 sm:p-7 relative overflow-hidden">
            <div className="font-display font-extrabold text-xl sm:text-3xl leading-tight max-w-[80%]">
              {HERO_SLIDES[slide].titulo}
            </div>
            <p className="text-sm text-papel/70 mt-2 max-w-xl">
              {HERO_SLIDES[slide].subtitulo}
            </p>
            <div className="absolute bottom-3 right-3 flex gap-1">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    i === slide ? 'bg-brasa' : 'bg-papel/30 hover:bg-papel/50',
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        <OfertaRelampago />
        <OfertasSemana />

        {/* Busca */}
        <section className="mt-2">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carvao/40" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar corte, produto…"
              className="w-full h-11 pl-9 pr-3 rounded-md bg-azulejo border border-sebo text-sm placeholder:text-carvao/40 focus:outline-none focus:border-sangue"
            />
          </label>
        </section>

        {/* Chips com ícone */}
        <div className="sticky top-[68px] z-20 bg-papel/95 backdrop-blur -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 border-y border-sebo mt-3">
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

        {/* Grade de produtos */}
        <section className="mt-4">
          {!carregado && produtos.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-md bg-sebo-claro aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {produtosFiltrados.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>
          )}
          {produtosFiltrados.length === 0 && carregado && (
            <div className="text-center py-16 text-carvao/60 text-sm">
              Nada encontrado. Limpe a busca ou troque a categoria.
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
        'shrink-0 h-11 px-3 rounded-md text-sm font-semibold border transition-colors inline-flex items-center gap-1.5',
        ativa
          ? 'bg-sangue text-papel border-sangue'
          : 'bg-azulejo border-sebo text-carvao hover:border-carvao',
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{rotulo}</span>
      {typeof contador === 'number' && (
        <span
          className={cn(
            'ml-1 px-1.5 rounded-full text-[10px] font-mono tabular-nums',
            ativa ? 'bg-papel/20 text-papel' : 'bg-sebo-claro text-carvao/60',
          )}
        >
          {contador}
        </span>
      )}
      {!icone && ativa && <ChevronRight className="w-3 h-3 ml-0.5" />}
    </button>
  );
}
