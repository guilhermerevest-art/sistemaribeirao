import type { Metadata } from 'next';
import LojaVitrine from '@/components/loja/loja-client-shared';

export const metadata: Metadata = {
  title: 'Empório Ribeirão — Açougue, pedidos e fidelidade',
  description:
    'Catálogo, pedidos pelo celular, cupom na bancada, cashback e pontos. Sistema completo do Empório Ribeirão.',
  alternates: { canonical: '/' },
};

export default function Page() {
  return <LojaVitrine />;
}
