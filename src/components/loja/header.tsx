'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Phone, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { brl, formatarTelefone } from '@/lib/formato';
import { Badge } from '@/components/ui/badge';

function LogoAcougue() {
  const [erro, setErro] = useState(false);
  if (erro) {
    return (
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-vermelho text-branco grid place-items-center font-display font-extrabold text-base sm:text-lg shrink-0">
        R
      </div>
    );
  }
  return (
    <img
      src="/logo.png"
      alt="Empório Ribeirão"
      className="w-9 h-9 sm:w-10 sm:h-10 rounded-md object-cover shrink-0"
      onError={() => setErro(true)}
    />
  );
}

export function HeaderLoja() {
  const clienteAtualId = useStore((s) => s.clienteAtualId);
  const cliente = useStore((s) => s.clientes.find((c) => c.id === clienteAtualId));
  const qtdItens = useStore((s) => s.carrinho.itens.length);

  return (
    <header className="header-fixo">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
        <Link href="/loja" className="flex items-center gap-2 min-w-0 shrink">
          <LogoAcougue />
          <div className="leading-tight min-w-0">
            <div className="font-display font-extrabold text-preto text-sm sm:text-lg truncate">Empório Ribeirão</div>
            <div className="hidden sm:block text-[11px] uppercase tracking-wider text-preto/60 -mt-0.5">desde 1998</div>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3 shrink-0">
          {cliente ? (
            <Link href="/minha-conta" className="flex items-center gap-1 text-xs sm:text-sm max-w-[68px] sm:max-w-none">
              <span className="hidden sm:inline text-preto/60">Oi,</span>
              <span className="font-semibold truncate">{cliente.nome.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link href="/loja/checkout" className="flex items-center gap-1 text-xs sm:text-sm font-semibold" aria-label="Entrar">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}

          {cliente && cliente.saldoCashback > 0 && (
            <Link
              href="/minha-conta"
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md bg-cinza-claro text-[11px] sm:text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amarelo shrink-0" />
              <span className="font-semibold whitespace-nowrap">{brl(cliente.saldoCashback)}</span>
            </Link>
          )}

          <Link href="/loja/carrinho" className="relative inline-flex items-center justify-center w-11 h-11 rounded-md bg-preto text-branco shrink-0" aria-label="Carrinho">
            <ShoppingCart className="w-5 h-5" />
            {qtdItens > 0 && (
              <span className="absolute -top-1 -right-1 bg-amarelo text-preto text-[10px] font-bold rounded-full w-5 h-5 grid place-items-center">
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
