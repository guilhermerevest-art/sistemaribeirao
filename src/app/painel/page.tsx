import type { Metadata } from 'next';
import Dashboard from '@/components/painel/dashboard';

export const metadata: Metadata = {
  title: 'Painel do Dono',
  description:
    'KPIs do dia, frequência dos clientes, top produtos e listas para reativação por WhatsApp.',
  alternates: { canonical: '/painel' },
  robots: { index: false },
};

export default function Page() {
  return <Dashboard />;
}
