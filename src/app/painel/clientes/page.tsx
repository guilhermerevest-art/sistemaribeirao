'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarTelefone } from '@/lib/formato';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, ChevronLeft } from 'lucide-react';
import type { Cliente, Frequencia, Pedido } from '@/lib/types';

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

function info(c: Cliente, pedidos: Pedido[]) {
  const ped = pedidos.filter((p) => p.clienteId === c.id);
  ped.sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
  const ultimo = ped[0]?.criadoEm;
  const dias = ultimo ? Math.floor((Date.now() - new Date(ultimo).getTime()) / 86400000) : 9999;
  const noventaAtras = new Date();
  noventaAtras.setDate(noventaAtras.getDate() - 90);
  const ped90 = ped.filter((p) => new Date(p.criadoEm) >= noventaAtras).length;
  const diasCadastro = Math.floor((Date.now() - new Date(c.criadoEm).getTime()) / 86400000);
  let g: Frequencia = 'ocasional';
  if (dias >= 60) g = 'inativo';
  else if (dias >= 31) g = 'em_risco';
  else if (ped90 >= 6 && dias <= 15) g = 'fiel';
  else if (ped90 <= 1 && diasCadastro <= 30) g = 'novo';
  const ticket = ped.length ? ped.reduce((s, p) => s + p.total, 0) / ped.length : 0;
  return { dias, ped90, g, ticket };
}

export default function ClientesPage() {
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
      .map((c) => ({ c, info: info(c, pedidos) }))
      .filter((r) => !grupoFiltro || r.info.g === grupoFiltro)
      .sort((a, b) => b.info.dias - a.info.dias);
  }, [clientes, pedidos, grupoFiltro]);

  const whatsapp = (c: Cliente, dias: number, cb: number) => {
    const msg = encodeURIComponent(
      `Oi ${c.nome.split(' ')[0]}, aqui é do Açougue Ribeirão. Faz ${dias} dias que você não aparece e você tem ${brl(cb)} de cashback pra usar até ${formatarData(c.cashbackExpiraEm ?? new Date().toISOString())}. Essa semana a fraldinha tá R$ 44,90 o quilo. Quer que eu separe?`,
    );
    const tel = c.telefone.replace(/\D/g, '');
    return `https://wa.me/55${tel}?text=${msg}`;
  };

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
        <ul className="space-y-2">
          {rows.map(({ c, info: i }) => (
            <li key={c.id} className="bg-azulejo border border-sebo rounded-xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/painel/clientes/${c.id}`} className="font-display font-bold uppercase">{c.nome}</Link>
                  <Badge tone={GRUPO_TONE[i.g]}>{GRUPO_LABEL[i.g]}</Badge>
                </div>
                <div className="text-xs text-carvao/70 font-mono">{formatarTelefone(c.telefone)}</div>
                <div className="text-xs text-carvao/60 mt-1">
                  {i.dias === 9999 ? 'Sem compras' : `${i.dias} dias sem comprar`} · ticket {brl(i.ticket)} · cashback {brl(c.saldoCashback)}
                </div>
              </div>
              {c.aceitaWhatsapp && (
                <a href={whatsapp(c, i.dias, c.saldoCashback)} target="_blank" rel="noreferrer">
                  <Button size="sm"><MessageCircle className="w-4 h-4 mr-1" /> Chamar no WhatsApp</Button>
                </a>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
