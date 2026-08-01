import type { Metadata } from 'next';
import ClubeClient from './clube-client';

export const metadata: Metadata = {
  title: 'Clube Ribeirão',
  description:
    'Bronze, Prata, Ouro: os níveis de fidelidade do Empório Ribeirão. Cashback maior, ofertas antecipadas e resgates exclusivos.',
  alternates: { canonical: '/minha-conta/clube' },
  openGraph: {
    title: 'Clube Ribeirão · Empório Ribeirão',
    description: 'Quanto mais você compra, mais volta pra você.',
    url: '/minha-conta/clube',
  },
  robots: { index: false },
};

export default function Page() {
  return <ClubeClient />;
}
