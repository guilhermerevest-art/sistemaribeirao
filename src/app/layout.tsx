import type { Metadata, Viewport } from 'next';
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

// URL canônica do site. Em produção, defina NEXT_PUBLIC_SITE_URL
// (ex.: https://emporio-ribeirao.vercel.app). Sem env var, cai pra
// localhost — útil só pra dev.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const SITE_NAME = 'Empório Ribeirão';
const SITE_DESCRIPTION =
  'Catálogo, pedidos pelo celular, cupom na bancada, cashback e pontos. Sistema completo do Empório Ribeirão.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Açougue, pedidos e fidelidade`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'açougue',
    'carnes',
    'pedidos',
    'cashback',
    'fidelidade',
    'pontos',
    'Ribeirão',
    'empório',
    'picanha',
    'linguiça',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Açougue, pedidos e fidelidade`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-cover.svg',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Açougue, pedidos e fidelidade`,
    description: SITE_DESCRIPTION,
    images: ['/og-cover.svg'],
    creator: '@emporio_ribeirao',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.svg',
  },
  // PWA manifest servido pelo route handler em /app/manifest.ts.
  // Cuidado: usar 'manifest: /manifest.webmanifest' faz o Next injetar
  // um <link> pra um arquivo que não existe — a Vercel redireciona
  // e o React dispara erro de hidratação por causa do CORS.
  manifest: '/manifest',
  category: 'food',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F0F' },
  ],
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}/og-cover.svg`,
    telephone: '+55-34-3333-0000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua das Flores, 123',
      addressLocality: 'Ribeirão',
      addressRegion: 'MG',
      addressCountry: 'BR',
    },
    priceRange: 'R$',
    servesCuisine: 'Brazilian',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '19:00',
      },
    ],
    potentialAction: {
      '@type': 'OrderAction',
      target: `${SITE_URL}/loja`,
      deliveryMethod: 'http://purl.org/goodrelations/v1#DeliveryModePickUp',
    },
  };

  return (
    <html lang="pt-BR" className={`${display.variable} ${texto.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <script
          type="application/ld+json"
          // JSON.stringify com escape pra evitar injection no payload.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson).replace(/</g, '\\u003c') }}
        />
        {children}
        <Hydrate />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
