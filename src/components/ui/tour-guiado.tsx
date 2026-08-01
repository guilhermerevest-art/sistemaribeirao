'use client';

// Tour guiado pra quem chega na home pela primeira vez. Quatro passos
// rápidos com auto-avanço, fechável, e lembrado via localStorage pra
// não aparecer de novo. Aponta pra lugares reais do app — sem mockup.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Monitor,
  ShoppingBag,
  BarChart3,
  Users,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CHAVE = 'ribeirao-tour-visto-v1';

const PASSOS = [
  {
    n: 1,
    icon: Monitor,
    cor: 'bg-vermelho',
    titulo: 'Bancada: o coração do balcão',
    texto:
      'A tela que fica no notebook da loja. Aqui chegam os pedidos do celular, tocam o alarme e saem no cupom.',
    cta: { href: '/bancada', label: 'Abrir a bancada' },
  },
  {
    n: 2,
    icon: ShoppingBag,
    cor: 'bg-amarelo',
    titulo: 'Loja: o que o cliente vê',
    texto:
      'Catálogo mobile-first com card-etiqueta de balança. O cliente escolhe corte, peso e preparo — direto pelo celular.',
    cta: { href: '/loja', label: 'Abrir a loja' },
  },
  {
    n: 3,
    icon: BarChart3,
    cor: 'bg-preto',
    titulo: 'Painel: o olho do dono',
    texto:
      'KPIs do dia, gráfico de 30 dias, top produtos. Aqui ele vê o que tá vendendo e onde tá perdendo cliente.',
    cta: { href: '/painel', label: 'Abrir o painel' },
  },
  {
    n: 4,
    icon: Users,
    cor: 'bg-amarelo',
    titulo: 'Em risco: quem não volta',
    texto:
      'Quatro clientes sumidos há mais de 30 dias, com cashback pra vencer. Um clique no WhatsApp resolve.',
    cta: { href: '/painel/clientes?grupo=em_risco', label: 'Ver quem tá sumido' },
  },
];

export function TourGuiado() {
  const [aberto, setAberto] = useState(false);
  const [passo, setPasso] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(CHAVE) === '1') return;
    // Pequeno atraso pra não atropelar a entrada da home.
    const t = setTimeout(() => setAberto(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
      if (e.key === 'ArrowRight') proximo();
      if (e.key === 'ArrowLeft') anterior();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, passo]);

  const fechar = () => {
    setAberto(false);
    try { window.localStorage.setItem(CHAVE, '1'); } catch {}
  };
  const reiniciar = () => {
    try { window.localStorage.removeItem(CHAVE); } catch {}
    setPasso(0);
    setAberto(true);
  };
  const proximo = () => setPasso((p) => Math.min(PASSOS.length - 1, p + 1));
  const anterior = () => setPasso((p) => Math.max(0, p - 1));

  if (!aberto) return null;
  const p = PASSOS[passo];
  const Icon = p.icon;
  const ehUltimo = passo === PASSOS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-preto/70" onClick={fechar} />
      <div className="relative w-full sm:max-w-md sm:mx-4 bg-branco rounded-t-2xl sm:rounded-2xl shadow-2xl border border-sebo overflow-hidden animate-entrada">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-preto/60">
            <Sparkles className="w-3.5 h-3.5 text-amarelo" />
            Tour · passo {passo + 1} de {PASSOS.length}
          </div>
          <button
            onClick={fechar}
            className="w-8 h-8 grid place-items-center rounded-md text-preto/60 hover:bg-cinza-claro"
            aria-label="Fechar tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className={cn('inline-flex items-center justify-center w-12 h-12 rounded-xl text-branco', p.cor)}>
            <Icon className="w-6 h-6" />
          </div>
          <h2 className="mt-3 font-display font-extrabold text-xl uppercase leading-tight">
            {p.titulo}
          </h2>
          <p className="mt-2 text-sm text-preto/70">{p.texto}</p>

          <div className="mt-4 flex items-center gap-1.5">
            {PASSOS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  i <= passo ? 'bg-vermelho' : 'bg-sebo',
                )}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button
              onClick={anterior}
              disabled={passo === 0}
              className="h-10 px-3 rounded-md text-sm font-semibold flex items-center gap-1 disabled:opacity-40 hover:bg-cinza-claro"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={fechar}
              className="h-10 px-3 rounded-md text-sm font-semibold text-preto/60 hover:bg-cinza-claro"
            >
              Pular
            </button>
            <div className="flex-1" />
            {!ehUltimo ? (
              <button
                onClick={proximo}
                className="h-10 px-4 rounded-md bg-amarelo text-preto font-extrabold uppercase text-sm flex items-center gap-1 hover:bg-amarelo/90"
              >
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href={p.cta.href}
                onClick={fechar}
                className="h-10 px-4 rounded-md bg-vermelho text-branco font-extrabold uppercase text-sm flex items-center gap-1 hover:bg-vermelho/90"
              >
                {p.cta.label} <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper pra devs/testes: botão pequeno pra reabrir o tour manualmente.
export function TourReabrir() {
  return (
    <button
      type="button"
      onClick={() => {
        try { window.localStorage.removeItem(CHAVE); } catch {}
        window.location.reload();
      }}
      className="text-xs text-preto/50 underline hover:text-preto"
    >
      Reabrir tour
    </button>
  );
}
