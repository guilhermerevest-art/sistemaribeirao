import type { Metadata } from 'next';
import LojaClient from './loja-client';

// Server component: só metadata. O conteúdo client vive em loja-client.tsx.
export const metadata: Metadata = {
  title: 'Vitrine',
  description:
    'Catálogo do Empório Ribeirão: bovino, suíno, aves, embutidos, preparados e itens de churrasco. Ofertas da semana e relâmpago, pedido pelo celular com cashback.',
  alternates: { canonical: '/loja' },
  openGraph: {
    title: 'Vitrine · Empório Ribeirão',
    description:
      'Catálogo, ofertas e pedido pelo celular. Retire no balcão com cupom impresso.',
    url: '/loja',
  },
};

export default function Page() {
  return <LojaClient />;
}
