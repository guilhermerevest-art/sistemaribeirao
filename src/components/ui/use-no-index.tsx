'use client';

import { useEffect } from 'react';

// Injeta `<meta name="robots" content="noindex, nofollow">` em páginas
// client que não devem ser indexadas (carrinho, checkout, painel,
// bancada, etc). No App Router, metadata exportado só funciona em
// server components — pra client components, essa é a alternativa.
//
// Uso: chame `useNoIndex()` no topo da página.
export function useNoIndex() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"][data-noindex]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      meta.setAttribute('data-noindex', 'true');
      document.head.appendChild(meta);
    } else {
      meta.content = 'noindex, nofollow';
    }
    return () => {
      // Mantém a tag mesmo se a página trocar — outras rotas client
      // também querem noindex.
    };
  }, []);
}
