import type { Metadata } from 'next';
import ChurrascoClient from './churrasco-client';

export const metadata: Metadata = {
  title: 'Planejar churrasco',
  description:
    'Calculadora de churrasco: diz quantas pessoas vêm, escolhe o estilo, e o app calcula kg de picanha, linguiça, frango, costelinha, carvão e o preço total. Um clique adiciona tudo ao carrinho.',
  alternates: { canonical: '/loja/churrasco' },
  openGraph: {
    title: 'Planejar churrasco · Empório Ribeirão',
    description: 'Quantos kg de carne por pessoa, sem cálculo na mão. Preço na hora.',
    url: '/loja/churrasco',
  },
};

export default function Page() {
  return <ChurrascoClient />;
}