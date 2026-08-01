import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ProdutoClient from './produto-client';

// Server component: metadata dinâmico + render do client wrapper.
// O conteúdo interativo (peso, preparos, carrinho) fica em
// produto-client.tsx. Aqui lemos o produto do Supabase pra gerar
// OG/title sem precisar baixar a imagem no cliente.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Modo demo offline: metadata genérica. Não vale indexar.
    return {
      title: slug,
      robots: { index: false, follow: false },
    };
  }
  try {
    const sb = supabase();
    const { data } = await sb
      .from('produtos')
      .select('nome, descricao, imagem, preco_kg')
      .eq('slug', slug)
      .maybeSingle();
    if (!data) {
      return { title: slug, robots: { index: false } };
    }
    const desc = `${data.descricao} · R$ ${Number(data.preco_kg).toFixed(2).replace('.', ',')}/kg`;
    return {
      title: data.nome,
      description: desc,
      alternates: { canonical: `/loja/produto/${slug}` },
      openGraph: {
        title: `${data.nome} · Empório Ribeirão`,
        description: desc,
        url: `/loja/produto/${slug}`,
        images: data.imagem ? [{ url: data.imagem }] : undefined,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: data.nome,
        description: desc,
        images: data.imagem ? [data.imagem] : undefined,
      },
    };
  } catch {
    return { title: slug, robots: { index: false } };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params; // cumpre a tipagem async sem expor props
  return <ProdutoClient />;
}
