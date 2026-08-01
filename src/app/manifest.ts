import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// PWA manifest mínimo (sem service worker real — o app é apenas
// instalável, não roda offline além do que o localStorage já dá).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Empório Ribeirão',
    short_name: 'Ribeirão',
    description:
      'Catálogo, pedidos pelo celular, cashback e pontos do Empório Ribeirão.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#D7263D',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    lang: 'pt-BR',
    categories: ['food', 'shopping'],
    // `id` precisa ser URL absoluta same-origin com o documento, ou
    // simplesmente omitido. O Chrome ignora com warning
    // "property 'id' ignored, should be same origin as document"
    // quando recebe só um path. Usamos a URL completa.
    id: `${SITE_URL}/`,
  };
}
