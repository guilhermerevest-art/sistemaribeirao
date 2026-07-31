'use client';

import { useStore } from '@/lib/store';
import type { Combo } from '@/lib/types';
import { brl } from '@/lib/formato';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { ImagemProduto } from '@/components/ui/imagem-produto';

export function ComboCard({ combo }: { combo: Combo }) {
  const adicionar = useStore((s) => s.adicionarAoCarrinho);

  const handleAdicionar = () => {
    adicionar({
      produtoId: combo.id,
      comboId: combo.id,
      pesoKg: 1,
      preparos: [],
      precoUnitarioAplicado: combo.precoCombo,
      subtotal: combo.precoCombo,
    });
    toast.success(`${combo.nome} adicionado ao carrinho`);
  };

  return (
    <div className="rounded-lg overflow-hidden bg-branco border-2 border-amarelo">
      <div className="aspect-square bg-cinza-claro overflow-hidden relative">
        <ImagemProduto src={combo.imagem} alt={combo.nome} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 bg-amarelo text-preto text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-sm">
          Combo
        </div>
      </div>
      <div className="px-3 pt-3 pb-3">
        <div className="font-display font-bold text-sm leading-tight line-clamp-2 min-h-[2.4em] text-preto">
          {combo.nome}
        </div>
        {combo.descricao && (
          <div className="text-xs text-preto/60 mt-1 line-clamp-2">{combo.descricao}</div>
        )}
        <div className="mt-2 font-sans font-bold text-lg tabular-nums text-preto">
          {brl(combo.precoCombo)}
        </div>
        <button
          onClick={handleAdicionar}
          className="mt-2 w-full h-10 rounded-md bg-vermelho text-branco text-sm font-bold uppercase flex items-center justify-center gap-1.5 hover:bg-vermelho/90 active:translate-y-px"
        >
          <ShoppingCart className="w-4 h-4" /> Adicionar
        </button>
      </div>
    </div>
  );
}
