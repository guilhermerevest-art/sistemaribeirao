import type { MetadataRoute } from 'next';
import { PRODUTOS } from '@/lib/seed';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Sitemap dinâmico: lista a home, a vitrine, e cada produto (pelas
// slugs do seed local — em modo online, esse conjunto é complementado
// pelo Supabase via `generateSitemap` server function, se necessário).
export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();

  const estaticas: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: agora,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/loja`,
      lastModified: agora,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/loja/receitas`,
      lastModified: agora,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/loja/churrasco`,
      lastModified: agora,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const produtos: MetadataRoute.Sitemap = PRODUTOS
    .filter((p) => p.disponivel)
    .map((p) => ({
      url: `${SITE_URL}/loja/produto/${p.slug}`,
      lastModified: agora,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // Import lazy pra evitar ciclo no build (sitemap → receitas → store).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { RECEITAS } = require('@/lib/receitas') as typeof import('@/lib/receitas');
  const receitas: MetadataRoute.Sitemap = RECEITAS.map((r) => ({
    url: `${SITE_URL}/loja/receitas/${r.slug}`,
    lastModified: agora,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [...estaticas, ...produtos, ...receitas];
}
