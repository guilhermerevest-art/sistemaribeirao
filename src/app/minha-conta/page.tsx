'use client';

import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { brl, formatarData, formatarHora } from '@/lib/formato';
import Link from 'next/link';
import { Gift, History, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { nivelPorPontos } from '@/lib/regras';

export default function MinhaContaPage() {
  const clienteAtualId = useStore((s) => s.clienteAtualId);
  const cliente = useStore((s) => s.clientes.find((c) => c.id === clienteAtualId));
  const pedidos = useStore((s) => s.pedidos.filter((p) => p.clienteId === clienteAtualId));
  const produtos = useStore((s) => s.produtos);

  if (!cliente) {
    return (
      <>
        <HeaderLoja />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-carvao/70">Você ainda não se identificou.</p>
          <Link href="/loja/checkout">
            <Button className="mt-4">Identificar pelo celular</Button>
          </Link>
        </main>
      </>
    );
  }

  const nivel = nivelPorPontos(cliente.pontosAcumuladoTotal);
  const labelNivel = { bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro' }[nivel];
  const proximoNivel = nivel === 'bronze' ? 'prata' : nivel === 'prata' ? 'ouro' : null;
  const metaProximo = proximoNivel === 'prata' ? 1500 : proximoNivel === 'ouro' ? 4000 : null;
  const pontosParaProximo = metaProximo ? Math.max(0, metaProximo - cliente.pontosAcumuladoTotal) : 0;
  const pct = metaProximo ? Math.min(100, (cliente.pontosAcumuladoTotal / metaProximo) * 100) : 100;

  return (
    <>
      <HeaderLoja />
      <main className="mx-auto max-w-3xl px-4 pb-8">
        <h1 className="font-display font-extrabold text-2xl uppercase mt-3">Olá, {cliente.nome.split(' ')[0]}</h1>

        <section className="mt-4 rounded-xl bg-carvao text-papel p-5">
          <div className="text-xs uppercase tracking-wider text-papel/60">Seu cashback</div>
          <div className="font-mono font-extrabold text-4xl tabular-nums mt-1">{brl(cliente.saldoCashback)}</div>
          {cliente.cashbackExpiraEm && (
            <div className="text-xs text-papel/60 mt-1">Vale até {formatarData(cliente.cashbackExpiraEm)}</div>
          )}
        </section>

        <section className="mt-4 bg-azulejo border border-sebo rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-carvao/60">Nível</div>
              <div className="font-display font-extrabold text-2xl uppercase">{labelNivel}</div>
            </div>
            <Badge tone={nivel === 'ouro' ? 'amarelo' : nivel === 'prata' ? 'carvao' : 'sebo'}>
              {labelNivel}
            </Badge>
          </div>
          {metaProximo ? (
            <>
              <div className="mt-3 h-2 rounded-full bg-sebo overflow-hidden">
                <div className="h-full bg-sangue" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-carvao/60 mt-1">
                Faltam {pontosParaProximo} pontos para o {proximoNivel === 'prata' ? 'Prata' : 'Ouro'}.
              </div>
            </>
          ) : (
            <div className="text-xs text-carvao/60 mt-2">Você está no topo: nível Ouro.</div>
          )}
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-brasa" />
            <span>Pontos: <strong>{cliente.pontos}</strong> (acumulado {cliente.pontosAcumuladoTotal})</span>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-2">
          <Link href="/minha-conta/resgates">
            <Button variant="outline" full>
              <Gift className="w-4 h-4 mr-1" /> Resgatar pontos
            </Button>
          </Link>
          <div className="bg-azulejo border border-sebo rounded-xl p-3 flex items-center gap-2 text-sm">
            <History className="w-4 h-4" />
            <span>{pedidos.length} pedidos</span>
          </div>
        </section>

        <section className="mt-4">
          <div className="font-display font-bold uppercase text-sm mb-2">Histórico</div>
          {pedidos.length === 0 ? (
            <div className="rounded-xl bg-azulejo border border-sebo p-6 text-center text-sm text-carvao/60">
              Nenhum pedido ainda.
            </div>
          ) : (
            <ul className="space-y-2">
              {pedidos.map((p) => (
                <li key={p.id} className="bg-azulejo border border-sebo rounded-xl p-3 flex items-center gap-3">
                  <div className="font-mono font-bold text-lg tabular-nums">{p.id}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{formatarData(p.criadoEm)} · {formatarHora(p.criadoEm)}</div>
                    <div className="text-xs text-carvao/60">
                      {p.itens.length} {p.itens.length === 1 ? 'item' : 'itens'} · +{brl(p.cashbackGerado)} cb
                    </div>
                  </div>
                  <div className="font-mono font-bold">{brl(p.total)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
