import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RECEITAS } from '@/lib/receitas';
import ReceitaClient from './receita-client';

// Pre-renderiza todas as receitas no build — são poucas e estáticas.
export function generateStaticParams() {
  return RECEITAS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const receita = RECEITAS.find((r) => r.slug === slug);
  if (!receita) return { title: 'Receita não encontrada', robots: { index: false } };
  return {
    title: receita.nome,
    description: `${receita.descricaoCurta} Serve ${receita.porcoesBase}. Lista de compra automática.`,
    alternates: { canonical: `/loja/receitas/${slug}` },
    openGraph: {
      title: `${receita.nome} · Receitas · Empório Ribeirão`,
      description: receita.descricaoCurta,
      url: `/loja/receitas/${slug}`,
      type: 'article',
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const receita = RECEITAS.find((r) => r.slug === slug);
  if (!receita) notFound();
  return <ReceitaClient receita={receita} />;
}
