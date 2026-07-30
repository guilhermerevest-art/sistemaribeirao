'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarTelefone } from '@/lib/formato';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/components/ui/admin-header';
import { MessageCircle, RotateCcw, Users, DollarSign, ShoppingBag, Award, ChevronRight } from 'lucide-react';
import type { Cliente, Frequencia, Pedido } from '@/lib/types';

function classificar(
  cliente: Cliente,
  pedidos: Pedido[],
): { grupo: Frequencia; diasSemCompra: number; pedidos90: number; ticketMedio: number } {
  const ped = pedidos.filter((p) => p.clienteId === cliente.id);
  ped.sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
  const ultimo = ped[0]?.criadoEm;
  const diasSemCompra = ultimo ? Math.floor((Date.now() - new Date(ultimo).getTime()) / 86400000) : 9999;
  const noventaAtras = new Date();
  noventaAtras.setDate(noventaAtras.getDate() - 90);
  const pedidos90 = ped.filter((p) => new Date(p.criadoEm) >= noventaAtras).length;
  const diasCadastro = Math.floor((Date.now() - new Date(cliente.criadoEm).getTime()) / 86400000);
  let grupo: Frequencia = 'ocasional';
  if (diasSemCompra >= 60) grupo = 'inativo';
  else if (diasSemCompra >= 31) grupo = 'em_risco';
  else if (pedidos90 >= 6 && diasSemCompra <= 15) grupo = 'fiel';
  else if (pedidos90 <= 1 && diasCadastro <= 30) grupo = 'novo';
  const ticketMedio = ped.length ? ped.reduce((s, p) => s + p.total, 0) / ped.length : 0;
  return { grupo, diasSemCompra, pedidos90, ticketMedio };
}

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

export default function PainelPage() {
  const pedidos = useStore((s) => s.pedidos);
  const clientes = useStore((s) => s.clientes);
  const produtos = useStore((s) => s.produtos);
  const reiniciar = useStore((s) => s.reiniciarDemonstracao);

  const stats = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const pedHoje = pedidos.filter((p) => new Date(p.criadoEm) >= hoje);
    const fatDia = pedHoje.reduce((s, p) => s + p.total, 0);
    const ticket = pedHoje.length ? pedHoje.reduce((s, p) => s + p.total, 0) / pedHoje.length : 0;
    const trintaAtras = new Date();
    trintaAtras.setDate(trintaAtras.getDate() - 30);
    const clientesUnicos = new Set(
      pedidos.filter((p) => new Date(p.criadoEm) >= trintaAtras).map((p) => p.clienteId),
    );
    return { fatDia, pedHoje: pedHoje.length, ticket, voltaram: clientesUnicos.size };
  }, [pedidos]);

  const fat30d = useMemo(() => {
    const arr: { dia: string; valor: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const inicio = d.getTime();
      const fim = inicio + 86400000;
      const total = pedidos
        .filter((p) => {
          const t = new Date(p.criadoEm).getTime();
          return t >= inicio && t < fim;
        })
        .reduce((s, p) => s + p.total, 0);
      arr.push({ dia: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), valor: total });
    }
    return arr;
  }, [pedidos]);

  const grupos = useMemo(() => {
    const g: Record<Frequencia, { cliente: Cliente; info: ReturnType<typeof classificar> }[]> = {
      novo: [], fiel: [], ocasional: [], em_risco: [], inativo: [],
    };
    for (const c of clientes) {
      const info = classificar(c, pedidos);
      g[info.grupo].push({ cliente: c, info });
    }
    return g;
  }, [clientes, pedidos]);

  const topProdutos = useMemo(() => {
    const cont: Record<string, { produtoId: string; qtd: number; receita: number }> = {};
    for (const p of pedidos) {
      for (const it of p.itens) {
        const id = it.produtoId;
        if (!cont[id]) cont[id] = { produtoId: id, qtd: 0, receita: 0 };
        cont[id].qtd += it.pesoKg;
        cont[id].receita += it.subtotal;
      }
    }
    return Object.values(cont).sort((a, b) => b.qtd - a.qtd).slice(0, 10);
  }, [pedidos]);

  const maxFat = Math.max(1, ...fat30d.map((d) => d.valor));

  return (
    <div className="min-h-screen bg-papel pb-8">
      <AdminHeader
        titulo="Painel do dono"
        voltarPara="/"
        acoes={
          <>
            <Link href="/bancada"><Button variant="secondary" size="sm">Bancada</Button></Link>
            <Link href="/painel/clientes"><Button variant="ghost" size="sm" className="text-papel hover:bg-sebo/20">Clientes</Button></Link>
            <Link href="/backoffice/promocoes"><Button variant="ghost" size="sm" className="text-papel hover:bg-sebo/20">Ofertas</Button></Link>
            <Link href="/painel/campanhas"><Button variant="ghost" size="sm" className="text-papel hover:bg-sebo/20">Campanhas</Button></Link>
            <button
              onClick={() => {
                if (confirm('Reiniciar a demonstração? Isso apaga todos os pedidos novos.')) void reiniciar();
              }}
              className="w-10 h-10 grid place-items-center rounded-md text-papel/70 hover:text-papel hover:bg-papel/10"
              title="Reiniciar demonstração"
              aria-label="Reiniciar demonstração"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </>
        }
      />

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI label="Faturamento do dia" valor={brl(stats.fatDia)} icon={<DollarSign />} />
          <KPI label="Pedidos do dia" valor={String(stats.pedHoje)} icon={<ShoppingBag />} />
          <KPI label="Ticket médio" valor={brl(stats.ticket)} icon={<Award />} />
          <KPI label="Clientes que voltaram no mês" valor={String(stats.voltaram)} icon={<Users />} />
        </section>

        {/* Faturamento 30d */}
        <section className="bg-azulejo border border-sebo rounded-xl p-4">
          <div className="font-display font-bold uppercase text-sm mb-3">Faturamento — últimos 30 dias</div>
          <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
            <div className="flex items-end gap-1 h-40 min-w-[620px]">
              {fat30d.map((d) => (
                <div key={d.dia} className="flex-1 flex flex-col items-center gap-1" title={`${d.dia}: ${brl(d.valor)}`}>
                  <div
                    className="w-full bg-sangue rounded-t-sm"
                    style={{ height: `${(d.valor / maxFat) * 100}%`, minHeight: d.valor > 0 ? '4px' : '0' }}
                  />
                  <div className="text-[9px] text-carvao/60 font-mono -rotate-45 origin-top-left whitespace-nowrap">{d.dia}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-carvao/40 mt-2 sm:hidden">Arraste para o lado para ver os outros dias →</div>
        </section>

        {/* Frequência */}
        <section className="bg-azulejo border border-sebo rounded-xl p-4">
          <div className="font-display font-bold uppercase text-sm mb-3">Frequência dos clientes</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(['novo', 'fiel', 'ocasional', 'em_risco', 'inativo'] as Frequencia[]).map((g) => (
              <Link key={g} href={`/painel/clientes?grupo=${g}`} className="rounded-md p-3 bg-sebo-claro hover:bg-sebo transition-colors">
                <Badge tone={GRUPO_TONE[g]}>{GRUPO_LABEL[g]}</Badge>
                <div className="font-display font-extrabold text-3xl mt-2">{grupos[g].length}</div>
                <div className="text-xs text-carvao/60">clientes</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top produtos */}
        <section className="bg-azulejo border border-sebo rounded-xl p-4">
          <div className="font-display font-bold uppercase text-sm mb-3">Top 10 produtos</div>
          <ul className="text-sm divide-y divide-sebo">
            {topProdutos.map((t, i) => {
              const p = produtos.find((x) => x.id === t.produtoId);
              return (
                <li key={t.produtoId} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0">
                  <span className="font-mono text-carvao/60 w-5 shrink-0">{i + 1}.</span>
                  <span className="flex-1 min-w-0 truncate">{p?.nome}</span>
                  <span className="font-mono text-carvao/70 text-xs shrink-0">{t.qtd.toFixed(1)} kg</span>
                  <span className="font-mono font-semibold w-24 text-right shrink-0">{brl(t.receita)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-4 text-center text-xs text-carvao/50">
        <button
          onClick={() => {
            if (confirm('Reiniciar a demonstração? Isso apaga todos os pedidos novos.')) void reiniciar();
          }}
          className="underline hover:text-carvao py-2 px-2 -mx-2"
        >
          Reiniciar demonstração
        </button>
      </footer>
    </div>
  );
}

function KPI({ label, valor, icon }: { label: string; valor: string; icon: React.ReactNode }) {
  return (
    <div className="bg-azulejo border border-sebo rounded-xl p-3 sm:p-4 min-w-0">
      <div className="flex items-center gap-1.5 text-carvao/60 text-[10px] sm:text-xs uppercase tracking-wider">
        <span className="shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <div className="font-mono font-extrabold text-lg sm:text-2xl mt-1.5 sm:mt-2 tabular-nums truncate">{valor}</div>
    </div>
  );
}
