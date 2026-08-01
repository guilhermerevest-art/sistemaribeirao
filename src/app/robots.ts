import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Robots global do site. Páginas internas (bancada, painel, /carrinho,
// /checkout, /minha-conta, /backoffice, /loja/pedido/[id]) já têm
// noindex via metadata ou `useNoIndex()` em client components.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/loja', '/loja/produto/'],
        disallow: [
          '/api/',
          '/loja/carrinho',
          '/loja/checkout',
          '/loja/pedido/',
          '/minha-conta',
          '/minha-conta/',
          '/cozinha',
          '/bancada',
          '/bancada/',
          '/painel',
          '/painel/',
          '/backoffice',
          '/backoffice/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
