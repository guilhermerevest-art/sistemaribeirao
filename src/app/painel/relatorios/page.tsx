'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStore } from '@/lib/store';
import { brl, formatarTelefone } from '@/lib/formato';
import { nivelPorPontos, round2 } from '@/lib/regras';
import { toCsv, downloadCsv } from '@/lib/csv';
import { AdminHeader } from '@/components/ui/admin-header';
import { Download } from 'lucide-react';
import type { Cliente, Nivel, Pedido } from '@/lib/types';

type Periodo = 'dia' | 'semana' | 'mes';

const CORES_NIVEL: Record<Nivel, string> = {
  bronze: '#B87333',
  prata: '#9CA3AF',
  ouro: '#F5C518',
};

function agregarVendas(pedidos: Pedido[], periodo: Periodo): { label: string; valor: number }[] {
  const validos = pedidos.filter((p) => p.status !== 'cancelado');

  if (periodo === 'dia') {
    const arr: { label: string; valor: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const inicio = d.getTime();
      const fim = inicio + 86400000;
      const total = validos
        .filter((p) => {
          const t = new Date(p.criadoEm).getTime();
          return t >= inicio && t < fim;
        })
        .reduce((s, p) => s + p.total, 0);
      arr.push({ label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), valor: round2(total) });
    }
    return arr;
  }

  if (periodo === 'semana') {
    const arr: { label: string; valor: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const fimSemana = new Date();
      fimSemana.setHours(23, 59, 59, 999);
      fimSemana.setDate(fimSemana.getDate() - i * 7);
      const inicioSemana = new Date(fimSemana);
      inicioSemana.setDate(inicioSemana.getDate() - 6);
      inicioSemana.setHours(0, 0, 0, 0);
      const total = validos
        .filter((p) => {
          const t = new Date(p.criadoEm).getTime();
          return t >= inicioSemana.getTime() && t <= fimSemana.getTime();
        })
        .reduce((s, p) => s + p.total, 0);
      arr.push({ label: `${String(inicioSemana.getDate()).padStart(2, '0')}/${String(inicioSemana.getMonth() + 1).padStart(2, '0')}`, valor: round2(total) });
    }
    return arr;
  }

  const arr: { label: string; valor: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const ref = new Date();
    ref.setDate(1);
    ref.setHours(0, 0, 0, 0);
    ref.setMonth(ref.getMonth() - i);
    const inicio = ref.getTime();
    const fimRef = new Date(ref);
    fimRef.setMonth(fimRef.getMonth() + 1);
    const total = validos
      .filter((p) => {
        const t = new Date(p.criadoEm).getTime();
        return t >= inicio && t < fimRef.getTime();
      })
      .reduce((s, p) => s + p.total, 0);
    arr.push({ label: ref.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }), valor: round2(total) });
  }
  return arr;
}

function info(c: Cliente, pedidos: Pedido[]) {
  const ped = pedidos.filter((p) => p.clienteId === c.id);
  ped.sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
  const ultimo = ped[0]?.criadoEm;
  const dias = ultimo ? Math.floor((Date.now() - new Date(ultimo).getTime()) / 86400000) : 9999;
  const ticketMedio = ped.length ? ped.reduce((s, p) => s + p.total, 0) / ped.length : 0;
  return { dias, ticketMedio };
}

export default function RelatoriosPage() {
  const pedidos = useStore((s) => s.pedidos);
  const clientes = useStore((s) => s.clientes);
  const produtos = useStore((s) => s.produtos);

  const [periodo, setPeriodo] = useState<Periodo>('dia');

  const vendas = useMemo(() => agregarVendas(pedidos, periodo), [pedidos, periodo]);

  const topProdutos = useMemo(() => {
    const cont: Record<string, { nome: string; qtd: number; receita: number }> = {};
    for (const p of pedidos) {
      if (p.status === 'cancelado') continue;
      for (const it of p.itens) {
        if (it.comboId) continue;
        const prod = produtos.find((x) => x.id === it.produtoId);
        if (!prod) continue;
        if (!cont[prod.id]) cont[prod.id] = { nome: prod.nome, qtd: 0, receita: 0 };
        cont[prod.id].qtd += it.pesoKg;
        cont[prod.id].receita += it.subtotal;
      }
    }
    return Object.values(cont)
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 20)
      .map((p) => ({ ...p, receita: round2(p.receita), qtd: round2(p.qtd) }));
  }, [pedidos, produtos]);

  const distribuicaoNiveis = useMemo(() => {
    const cont: Record<Nivel, number> = { bronze: 0, prata: 0, ouro: 0 };
    for (const c of clientes) cont[nivelPorPontos(c.pontosAcumuladoTotal)]++;
    return (['bronze', 'prata', 'ouro'] as Nivel[])
      .map((n) => ({ nivel: n, label: n[0].toUpperCase() + n.slice(1), valor: cont[n] }))
      .filter((d) => d.valor > 0);
  }, [clientes]);

  const cashbackMes = useMemo(() => {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    const doMes = pedidos.filter((p) => new Date(p.criadoEm) >= inicioMes && p.status !== 'cancelado');
    const concedido = round2(doMes.reduce((s, p) => s + p.cashbackGerado, 0));
    const usado = round2(doMes.reduce((s, p) => s + p.cashbackUsado, 0));
    const agora = new Date();
    const expirado = round2(
      clientes
        .filter((c) => c.cashbackExpiraEm && new Date(c.cashbackExpiraEm) < agora)
        .reduce((s, c) => s + c.saldoCashback, 0),
    );
    return [
      { label: 'Concedido no mês', valor: concedido },
      { label: 'Usado no mês', valor: usado },
      { label: 'Saldo vencido', valor: expirado },
    ];
  }, [pedidos, clientes]);

  const emRisco = useMemo(() => {
    return clientes
      .map((c) => ({ cliente: c, ...info(c, pedidos) }))
      .filter((x) => x.dias >= 31 && x.dias < 60)
      .sort((a, b) => b.dias - a.dias);
  }, [clientes, pedidos]);

  const exportarEmRisco = () => {
    const linhas = emRisco.map((x) => ({
      nome: x.cliente.nome,
      telefone: formatarTelefone(x.cliente.telefone),
      dias: x.dias,
      ticket: x.ticketMedio.toFixed(2).replace('.', ','),
      saldo: x.cliente.saldoCashback.toFixed(2).replace('.', ','),
    }));
    const csv = toCsv(linhas, [
      { key: 'nome', label: 'Nome' },
      { key: 'telefone', label: 'Telefone' },
      { key: 'dias', label: 'Dias sem comprar' },
      { key: 'ticket', label: 'Ticket médio (R$)' },
      { key: 'saldo', label: 'Saldo cashback (R$)' },
    ]);
    downloadCsv('clientes-em-risco.csv', csv);
  };

  return (
    <div className="min-h-screen bg-papel pb-8">
      <AdminHeader
        titulo="Relatórios"
        voltarPara="/painel"
        acoes={
          <Link href="/painel" className="text-xs text-papel/70 hover:text-papel underline">
            Voltar ao painel
          </Link>
        }
      />

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* 1. Vendas por período */}
        <section className="bg-azulejo border border-sebo rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="font-display font-bold uppercase text-sm">Vendas por período</div>
            <div className="flex gap-1">
              {(['dia', 'semana', 'mes'] as Periodo[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`h-8 px-3 rounded-md text-xs font-semibold ${periodo === p ? 'bg-carvao text-papel' : 'bg-sebo-claro text-carvao'}`}
                >
                  {p === 'dia' ? '30 dias' : p === 'semana' ? '12 semanas' : '6 meses'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendas}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sebo)" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} width={50} tickFormatter={(v) => brl(v)} />
                <Tooltip formatter={(v) => brl(Number(v))} />
                <Bar dataKey="valor" fill="var(--sangue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 2. Top 20 produtos */}
        <section className="bg-azulejo border border-sebo rounded-xl p-4">
          <div className="font-display font-bold uppercase text-sm mb-3">Top 20 produtos (por receita)</div>
          <div className="h-[520px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProdutos} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sebo)" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => brl(v)} />
                <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} width={140} />
                <Tooltip formatter={(v) => brl(Number(v))} />
                <Bar dataKey="receita" fill="var(--brasa)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* 3. Distribuição de níveis */}
          <section className="bg-azulejo border border-sebo rounded-xl p-4">
            <div className="font-display font-bold uppercase text-sm mb-3">Distribuição de níveis</div>
            {distribuicaoNiveis.length === 0 ? (
              <div className="text-center text-carvao/60 text-sm py-16">Sem clientes ainda.</div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribuicaoNiveis} dataKey="valor" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                      {distribuicaoNiveis.map((d) => (
                        <Cell key={d.nivel} fill={CORES_NIVEL[d.nivel]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* 4. Cashback concedido vs usado vs expirado */}
          <section className="bg-azulejo border border-sebo rounded-xl p-4">
            <div className="font-display font-bold uppercase text-sm mb-3">Cashback do mês</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashbackMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--sebo)" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} width={50} tickFormatter={(v) => brl(v)} />
                  <Tooltip formatter={(v) => brl(Number(v))} />
                  <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                    {cashbackMes.map((d, i) => (
                      <Cell key={d.label} fill={['var(--verde-fiel)', 'var(--sangue)', 'var(--sebo)'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-carvao/50 mt-2">
              "Saldo vencido" é o cashback de clientes cuja validade já passou — o sistema não desconta automaticamente, é só um alerta.
            </div>
          </section>
        </div>

        {/* 5. Clientes em risco */}
        <section className="bg-azulejo border border-sebo rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display font-bold uppercase text-sm">Clientes em risco ({emRisco.length})</div>
            <button
              onClick={exportarEmRisco}
              disabled={emRisco.length === 0}
              className="h-9 px-3 rounded-md bg-carvao text-papel text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-carvao/60 border-b border-sebo">
                  <th className="pb-2 pr-2">Nome</th>
                  <th className="pb-2 pr-2">Telefone</th>
                  <th className="pb-2 pr-2 text-right">Dias sem comprar</th>
                  <th className="pb-2 pr-2 text-right">Ticket médio</th>
                  <th className="pb-2 text-right">Saldo cashback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sebo">
                {emRisco.map((x) => (
                  <tr key={x.cliente.id}>
                    <td className="py-2 pr-2">{x.cliente.nome}</td>
                    <td className="py-2 pr-2 font-mono text-xs">{formatarTelefone(x.cliente.telefone)}</td>
                    <td className="py-2 pr-2 text-right font-mono">{x.dias}</td>
                    <td className="py-2 pr-2 text-right font-mono">{brl(x.ticketMedio)}</td>
                    <td className="py-2 text-right font-mono">{brl(x.cliente.saldoCashback)}</td>
                  </tr>
                ))}
                {emRisco.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-carvao/60">Nenhum cliente em risco agora.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
