import type { Metadata } from 'next';
import { Bricolage_Grotesque, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { Hydrate } from '@/components/ui/hydrate';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  weight: ['600', '700', '800'],
});

const texto = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jet',
  display: 'swap',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Empório Ribeirão',
  description: 'Sistema de pedidos e fidelidade — Empório Ribeirão',
  // PWA manifest servido pelo route handler em /app/manifest.ts.
  // O Next.js 16 expõe o arquivo em `/manifest.webmanifest`. Apontar
  // direto pra esse caminho evita o redirect 307 que dispara erro
  // de CORS no fetch.
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${texto.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        {children}
        <Hydrate />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
