import type { Metadata } from 'next';
import ReceitasClient from './receitas-client';

export const metadata: Metadata = {
  title: 'Receitas',
  description:
    'Catálogo de receitas brasileiras com lista de compra automática: escolha a proteína (bovino, suíno, frango), filtre por ocasião, e adicione tudo ao carrinho em 1 clique.',
  alternates: { canonical: '/loja/receitas' },
  openGraph: {
    title: 'Receitas · Empório Ribeirão',
    description: 'Receitas com lista de compra pronta. Em 1 clique, vai pro carrinho.',
    url: '/loja/receitas',
  },
};

export default function Page() {
  return <ReceitasClient />;
}
