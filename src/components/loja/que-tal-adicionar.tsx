'use client';

// Sheet "Que tal adicionar" — abre depois de adicionar item ao carrinho
// na loja. Sugere 3 produtos de categorias complementares.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { sugestoesCruzadas } from '@/lib/regras';
import { brl } from '@/lib/formato';
import { X, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QueTalAdicionar() {
  const [open, setOpen] = useState(false);
  const itens = useStore((s) => s.carrinho.itens);
  const produtos = useStore((s) => s.produtos);
  const adicionar = useStore((s) => s.adicionarAoCarrinho);
  const ultimoId = useStore((s) => s.carrinho.itens.length);

  useEffect(() => {
    if (ultimoId === 0) return;
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ultimoId]);

  const categoriasNoCarrinho = Array.from(
    new Set(
      itens
        .map((i) => produtos.find((p) => p.id === i.produtoId)?.categoria)
        .filter((c): c is NonNullable<typeof c> => Boolean(c)),
    ),
  );
  const sugestoes = sugestoesCruzadas(produtos, categoriasNoCarrinho);

  if (!open || sugestoes.length === 0) return null;

  function fechar() {
    setOpen(false);
  }

  function adicionarRapido(slug: string) {
    const p = produtos.find((x) => x.slug === slug);
    if (!p) return;
    adicionar({
      produtoId: p.id,
      pesoKg: p.unidadeVenda === 'kg' ? 1 : (p.pesoMedioPeca ?? 1),
      preparos: [],
      precoUnitarioAplicado: p.precoKg,
      subtotal: p.precoKg * (p.unidadeVenda === 'kg' ? 1 : (p.pesoMedioPeca ?? 1)),
    });
    fechar();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center">
      <div className="absolute inset-0 bg-preto/40" onClick={fechar} />
      <div className="relative w-full sm:max-w-lg bg-branco rounded-t-2xl sm:rounded-2xl shadow-2xl border border-cinza-claro overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-cinza-claro">
          <Sparkles className="w-5 h-5 text-amarelo" />
          <div className="font-display font-extrabold uppercase text-base flex-1">
            Que tal adicionar?
          </div>
          <button
            onClick={fechar}
            className="w-9 h-9 grid place-items-center rounded-md text-preto/60 hover:bg-cinza-claro"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ul className="divide-y divide-cinza-claro">
          {sugestoes.map((p) => (
            <li key={p.id} className="flex items-center gap-3 p-3">
              <img src={p.imagem} alt={p.nome} className="w-14 h-14 rounded-md object-cover bg-cinza-claro" />
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold uppercase text-sm truncate">{p.nome}</div>
                <div className="font-mono font-bold tabular-nums text-sm">
                  {brl(p.precoKg)}<span className="text-xs text-preto/60"> /kg</span>
                </div>
              </div>
              <Button size="sm" onClick={() => adicionarRapido(p.slug)}>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 px-3 py-3 bg-cinza-claro">
          <Button variant="ghost" className="flex-1" onClick={fechar}>
            Continuar comprando
          </Button>
          <Link href="/loja/carrinho" className="flex-1">
            <Button variant="primary" className="w-full">
              Ir para o carrinho
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
