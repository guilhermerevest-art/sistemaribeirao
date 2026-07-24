'use client';

import Link from 'next/link';
import { ShoppingCart, Phone, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { brl, formatarTelefone } from '@/lib/formato';
import { Badge } from '@/components/ui/badge';

export function HeaderLoja() {
  const clienteAtualId = useStore((s) => s.clienteAtualId);
  const cliente = useStore((s) => s.clientes.find((c) => c.id === clienteAtualId));
  const qtdItens = useStore((s) => s.carrinho.itens.length);

  return (
    <header className="header-fixo">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <Link href="/loja" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-sangue text-papel grid place-items-center font-display font-extrabold text-lg">
            R
          </div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-carvao text-lg">Açougue Ribeirão</div>
            <div className="text-[11px] uppercase tracking-wider text-carvao/60 -mt-0.5">desde 1998</div>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {cliente ? (
            <Link href="/minha-conta" className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-carvao/60">Oi,</span>
              <span className="font-semibold">{cliente.nome.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link href="/loja/checkout" className="hidden sm:flex items-center gap-1 text-sm font-semibold">
              <Phone className="w-4 h-4" />
              Entrar
            </Link>
          )}

          {cliente && cliente.saldoCashback > 0 && (
            <Link
              href="/minha-conta"
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-sebo-claro text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brasa" />
              <span className="font-mono font-semibold">{brl(cliente.saldoCashback)}</span>
            </Link>
          )}

          <Link href="/loja/carrinho" className="relative inline-flex items-center gap-1 px-3 h-11 rounded-md bg-carvao text-papel">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-mono text-sm">{qtdItens}</span>
            {qtdItens > 0 && (
              <span className="absolute -top-1 -right-1 bg-brasa text-papel text-[10px] font-bold rounded-full w-5 h-5 grid place-items-center">
                {qtdItens}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Identificador({ telefone }: { telefone: string }) {
  return (
    <Badge tone="sebo" className="font-mono">
      {formatarTelefone(telefone)}
    </Badge>
  );
}
