'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl, cashbackExpiraEmBreve, formatarTelefone, linkWhatsAppReativacao } from '@/lib/formato';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, ChevronLeft, AlertTriangle } from 'lucide-react';
import type { Cliente, Frequencia } from '@/lib/types';
import { infoFrequencia } from '@/lib/frequencia';

import { useNoIndex } from '@/components/ui/use-no-index';
const GRUPO_LABEL: Record<Frequencia, string> = {
  novo: 'Novo',
  fiel: 'Fiel',
  ocasional: 'Ocasional',
  em_risco: 'Em risco',
  inativo: 'Inativo',
};
const GRUPO_TONE: Record<Frequencia, 'amarelo' | 'verde' | 'sebo' | 'brasa' | 'sangue'> = {
  novo: 'amarelo',
  fiel: 'verde',
  ocasional: 'sebo',
  em_risco: 'brasa',
  inativo: 'sangue',
};

export default function ClientesPage() {
  useNoIndex();
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <ClientesInner />
    </Suspense>
  );
}

function ClientesInner() {
  const params = useSearchParams();
  const grupoFiltro = params.get('grupo') as Frequencia | null;
  const clientes = useStore((s) => s.clientes);
  const pedidos = useStore((s) => s.pedidos);

  const rows = useMemo(() => {
    return clientes
      .map((c) => ({ c, info: infoFrequencia(c, pedidos) }))
      .filter((r) => !grupoFiltro || r.info.grupo === grupoFiltro)
      .sort((a, b) => b.info.diasSemCompra - a.info.diasSemCompra);
  }, [clientes, pedidos, grupoFiltro]);

  const whatsapp = (c: Cliente, dias: number, cb: number) =>
    linkWhatsAppReativacao({
      nome: c.nome,
      telefone: c.telefone,
      diasSemCompra: dias,
      saldo: cb,
      validadeISO: c.cashbackExpiraEm,
      produto: 'a fraldinha tá R$ 44,90 o quilo',
    });

  return (
    <div className="min-h-screen bg-papel">
      <header className="bg-carvao text-papel p-4 sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <Link href="/painel" className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5" />
            <div className="font-display font-extrabold text-2xl uppercase">Clientes</div>
          </Link>
          {grupoFiltro && (
            <Badge tone={GRUPO_TONE[grupoFiltro]} className="ml-3">{GRUPO_LABEL[grupoFiltro]}</Badge>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="text-xs text-carvao/60 mb-2">{rows.length} cliente{rows.length === 1 ? '' : 's'}</div>
        <ul className="space-y-2">
          {rows.map(({ c, info: i }) => (
            <li key={c.id} className="bg-azulejo border border-sebo rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/painel/clientes/${c.id}`} className="font-display font-bold uppercase">{c.nome}</Link>
                  <Badge tone={GRUPO_TONE[i.grupo]}>{GRUPO_LABEL[i.grupo]}</Badge>
                </div>
                <div className="text-xs text-carvao/70 font-mono">{formatarTelefone(c.telefone)}</div>
                <div className="text-xs text-carvao/60 mt-1">
                  {i.diasSemCompra === 9999 ? 'Sem compras' : `${i.diasSemCompra} dias sem comprar`} · ticket {brl(i.ticketMedio)} · cashback {brl(c.saldoCashback)}
                </div>
                {cashbackExpiraEmBreve(c.cashbackExpiraEm) && c.saldoCashback > 0 && (
                  <div className="mt-1 text-[11px] text-vermelho-risco font-semibold inline-flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Vence em {c.cashbackExpiraEm ? new Date(c.cashbackExpiraEm).toLocaleDateString('pt-BR') : 'breve'}
                  </div>
                )}
              </div>
              {c.aceitaWhatsapp && (
                <a href={whatsapp(c, i.diasSemCompra, c.saldoCashback)} target="_blank" rel="noreferrer" className="shrink-0">
                  <Button size="lg" className="w-full sm:w-auto"><MessageCircle className="w-4 h-4 mr-1" /> Chamar no WhatsApp</Button>
                </a>
              )}
            </li>
          ))}
          {rows.length === 0 && (
            <li className="p-10 text-center text-carvao/60 bg-azulejo border border-sebo rounded-xl">Nenhum cliente nesse grupo.</li>
          )}
        </ul>
      </main>
    </div>
  );
}
