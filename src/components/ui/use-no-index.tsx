'use client';

import { useEffect } from 'react';

// Injeta `<meta name="robots" content="noindex, nofollow">` em páginas
// client que não devem ser indexadas (carrinho, checkout, painel,
// bancada, etc). No App Router, metadata exportado só funciona em
// server components — pra client components, essa é a alternativa.
//
// Detalhe: o `layout.tsx` injeta `<meta name="robots">` no <head>
// durante o SSR. Pra evitar ter duas tags com mesmo name (o que é
// permitido em HTML mas confunde alguns bots), a gente atualiza a
// existente em vez de criar uma nova.
//
// Uso: chame `useNoIndex()` no topo da página.
export function useNoIndex() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    // Procura QUALQUER meta robots (incluindo a do metadata do layout)
    // e atualiza o content. Se não houver, cria uma nova marcada
    // com data-noindex pra controle interno.
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      meta.setAttribute('data-noindex', 'true');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
  }, []);
}