'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { brl, formatarData, formatarHora } from '@/lib/formato';
import Link from 'next/link';
import { Gift, History, Sparkles, Loader2, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { nivelPorPontos } from '@/lib/regras';
import { toast } from 'sonner';

export default function MinhaContaPage() {
  const router = useRouter();
  const clienteAtualId = useStore((s) => s.clienteAtualId);
  const cliente = useStore((s) => s.clientes.find((c) => c.id === clienteAtualId));
  const pedidos = useStore((s) => s.pedidos.filter((p) => p.clienteId === clienteAtualId));
  const produtos = useStore((s) => s.produtos);
  const clonarItens = useStore((s) => s.clonarItensParaCarrinho);
  const carregado = useStore((s) => s.carregado);
  const online = useStore((s) => s.online);
  const recarregarClientes = useStore((s) => s.recarregarClientes);

  // Se clienteAtualId está setado mas o cliente sumiu do state
  // (timing após criar pedido online), tenta recarregar uma vez. A
  // guarda `jaTentou` evita re-fire se o cliente continuar sumindo por
  // algum motivo (ex.: RLS bloqueando).
  const jaTentouRef = useRef(false);
  useEffect(() => {
    if (clienteAtualId && !cliente && carregado && online && !jaTentouRef.current) {
      jaTentouRef.current = true;
      void recarregarClientes();
    }
    if (cliente) jaTentouRef.current = false;
  }, [clienteAtualId, cliente, carregado, online, recarregarClientes]);

  if (!clienteAtualId) {
    return (
      <>
        <HeaderLoja />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-preto/70">Você ainda não se identificou.</p>
          <Link href="/loja/checkout">
            <Button className="mt-4">Identificar pelo celular</Button>
          </Link>
        </main>
      </>
    );
  }

  if (!cliente) {
    return (
      <>
        <HeaderLoja />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <Loader2 className="w-6 h-6 mx-auto animate-spin text-vermelho" />
          <p className="text-preto/70 mt-2">Carregando sua conta…</p>
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

        <section className="mt-4 rounded-xl bg-preto text-branco p-5">
          <div className="text-xs uppercase tracking-wider text-branco/60">Seu cashback</div>
          <div className="font-sans font-extrabold text-4xl tabular-nums mt-1">{brl(cliente.saldoCashback)}</div>
          {cliente.cashbackExpiraEm && (
            <div className="text-xs text-branco/60 mt-1">Vale até {formatarData(cliente.cashbackExpiraEm)}</div>
          )}
        </section>

        <section className="mt-4 bg-branco border border-cinza-claro rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-preto/60">Nível</div>
              <div className="font-display font-extrabold text-2xl uppercase">{labelNivel}</div>
            </div>
            <Badge tone={nivel === 'ouro' ? 'amarelo' : nivel === 'prata' ? 'carvao' : 'sebo'}>
              {labelNivel}
            </Badge>
          </div>
          {metaProximo ? (
            <>
              <div className="mt-3 h-2 rounded-full bg-cinza-claro overflow-hidden">
                <div className="h-full bg-vermelho" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-preto/60 mt-1">
                Faltam {pontosParaProximo} pontos para o {proximoNivel === 'prata' ? 'Prata' : 'Ouro'}.
              </div>
            </>
          ) : (
            <div className="text-xs text-preto/60 mt-2">Você está no topo: nível Ouro.</div>
          )}
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-amarelo" />
            <span>Pontos: <strong>{cliente.pontos}</strong> (acumulado {cliente.pontosAcumuladoTotal})</span>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-2">
          <Link href="/minha-conta/resgates">
            <Button variant="outline" full>
              <Gift className="w-4 h-4 mr-1" /> Resgatar pontos
            </Button>
          </Link>
          <div className="bg-branco border border-cinza-claro rounded-xl p-3 flex items-center gap-2 text-sm">
            <History className="w-4 h-4" />
            <span>{pedidos.length} pedidos</span>
          </div>
        </section>

        <section className="mt-4">
          <div className="font-display font-bold uppercase text-sm mb-2">Histórico</div>
          {pedidos.length === 0 ? (
            <div className="rounded-xl bg-branco border border-cinza-claro p-6 text-center text-sm text-preto/60">
              Nenhum pedido ainda.
            </div>
          ) : (
            <ul className="space-y-2">
              {pedidos.map((p) => (
                <li key={p.id} className="bg-branco border border-cinza-claro rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="font-mono font-bold text-lg tabular-nums">{p.id}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{formatarData(p.criadoEm)} · {formatarHora(p.criadoEm)}</div>
                      <div className="text-xs text-preto/60">
                        {p.itens.length} {p.itens.length === 1 ? 'item' : 'itens'} · +{brl(p.cashbackGerado)} cb
                      </div>
                    </div>
                    <div className="font-mono font-bold">{brl(p.total)}</div>
                  </div>
                  <button
                    onClick={() => {
                      clonarItens(p.itens);
                      toast.success('Itens copiados pro carrinho');
                      router.push('/loja/carrinho');
                    }}
                    className="mt-2 h-9 px-3 rounded-md bg-vermelho text-branco text-xs font-bold uppercase inline-flex items-center gap-1"
                  >
                    <Repeat className="w-3.5 h-3.5" /> Pedir de novo
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
