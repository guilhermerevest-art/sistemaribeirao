'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarTelefone } from '@/lib/formato';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-papel">
      <header className="bg-carvao text-papel p-4 sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-sangue grid place-items-center font-display font-extrabold text-papel">R</div>
            <div className="font-display font-extrabold text-2xl uppercase">Painel do dono</div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/bancada"><Button variant="secondary" size="sm">Bancada</Button></Link>
            <Link href="/painel/clientes"><Button variant="ghost" size="sm" className="text-papel hover:bg-sebo/20">Clientes</Button></Link>
            <Link href="/painel/ofertas"><Button variant="ghost" size="sm" className="text-papel hover:bg-sebo/20">Ofertas</Button></Link>
            <Link href="/painel/campanhas"><Button variant="ghost" size="sm" className="text-papel hover:bg-sebo/20">Campanhas</Button></Link>
            <button
              onClick={() => {
                if (confirm('Reiniciar a demonstração? Isso apaga todos os pedidos novos.')) reiniciar();
              }}
              className="text-papel/70 hover:text-papel p-2"
              title="Reiniciar demonstração"
            >
              <RotateCcw />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
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
          <div className="flex items-end gap-1 h-40">
            {fat30d.map((d) => (
              <div key={d.dia} className="flex-1 flex flex-col items-center gap-1" title={`${d.dia}: ${brl(d.valor)}`}>
                <div
                  className="w-full bg-sangue rounded-t-sm"
                  style={{ height: `${(d.valor / maxFat) * 100}%`, minHeight: d.valor > 0 ? '4px' : '0' }}
                />
                <div className="text-[9px] text-carvao/60 font-mono -rotate-45 origin-top-left">{d.dia}</div>
              </div>
            ))}
          </div>
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
          <ul className="text-sm space-y-1">
            {topProdutos.map((t, i) => {
              const p = produtos.find((x) => x.id === t.produtoId);
              return (
                <li key={t.produtoId} className="flex items-center gap-2">
                  <span className="font-mono text-carvao/60 w-6">{i + 1}.</span>
                  <span className="flex-1">{p?.nome}</span>
                  <span className="font-mono text-carvao/70">{t.qtd.toFixed(1)} kg</span>
                  <span className="font-mono font-semibold w-28 text-right">{brl(t.receita)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-carvao/50">
        <button
          onClick={() => {
            if (confirm('Reiniciar a demonstração? Isso apaga todos os pedidos novos.')) reiniciar();
          }}
          className="underline hover:text-carvao"
        >
          Reiniciar demonstração
        </button>
      </footer>
    </div>
  );
}

function KPI({ label, valor, icon }: { label: string; valor: string; icon: React.ReactNode }) {
  return (
    <div className="bg-azulejo border border-sebo rounded-xl p-4">
      <div className="flex items-center gap-2 text-carvao/60 text-xs uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="font-mono font-extrabold text-2xl mt-2 tabular-nums">{valor}</div>
    </div>
  );
}
