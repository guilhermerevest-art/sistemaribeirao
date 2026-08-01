import type { Metadata } from 'next';
import LojaVitrine from '@/components/loja/loja-client-shared';

// A home agora e a vitrine. Server component puro: nada de
// use client aqui, nenhum overlay. O metadata e o titulo sao
// os mesmos da /loja, ja que o conteudo e identico.
//
// Se o React #185 persistir nesta configuracao minima, o
// problema esta no proprio LojaClient (loop de useEffect /
// setState em alguma parte do componente). A gente isola a
// partir dai.
export const metadata: Metadata = {
  title: 'Empório Ribeirão — Açougue, pedidos e fidelidade',
  description:
    'Catálogo, pedidos pelo celular, cupom na bancada, cashback e pontos. Sistema completo do Empório Ribeirão.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Empório Ribeirão — Açougue, pedidos e fidelidade',
    description:
      'Catálogo, pedidos pelo celular, cupom na bancada, cashback e pontos. Sistema completo do Empório Ribeirão.',
    url: '/',
  },
};

export default function Page() {
  return <LojaVitrine />;
}
