'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import type { ReactNode } from 'react';

// Header padrão das telas operacionais (painel, backoffice, bancada,
// cozinha). Título trunca em vez de quebrar layout, e as ações rolam
// horizontalmente em vez de estourar a tela em celulares de 360px.
export function AdminHeader({
  titulo,
  voltarPara = '/backoffice',
  acoes,
  tom = 'preto',
}: {
  titulo: string;
  voltarPara?: string;
  acoes?: ReactNode;
  tom?: 'preto' | 'vermelho' | 'carvao' | 'sangue';
}) {
  const bg =
    tom === 'vermelho' || tom === 'sangue'
      ? 'bg-vermelho'
      : 'bg-preto';
  return (
    <header className={`${bg} text-branco sticky top-0 z-30`}>
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3">
        <Link
          href={voltarPara}
          aria-label="Voltar"
          className="shrink-0 grid place-items-center w-10 h-10 -ml-1.5 rounded-md hover:bg-branco/10 active:bg-branco/20"
        >
          <Home className="w-5 h-5" />
        </Link>
        <h1 className="font-display font-extrabold text-base sm:text-xl uppercase truncate min-w-0 flex-1">
          {titulo}
        </h1>
        {acoes && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 max-w-[55vw] sm:max-w-none [&>*]:shrink-0 -mr-1 pr-1 py-1">
            {acoes}
          </div>
        )}
      </div>
    </header>
  );
}
