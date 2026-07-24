'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useAutoAvanco, useSyncEntreAbas } from '@/components/ui/sync';
import { Button } from '@/components/ui/button';
import { ChefHat, Home, Bell, Check, Bike, Store, Clock } from 'lucide-react';
import { brl, formatarHora, formatarTelefone } from '@/lib/formato';
import type { Pedido } from '@/lib/types';

function idadeMinutos(p: Pedido): number {
  return Math.floor((Date.now() - new Date(p.criadoEm).getTime()) / 60000);
}

function idadeHMS(p: Pedido): string {
  const ms = Date.now() - new Date(p.criadoEm).getTime();
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CozinhaPage() {
  useSyncEntreAbas();
  useAutoAvanco();

  const pedidos = useStore((s) => s.pedidos);
  const produtos = useStore((s) => s.produtos);
  const clientes = useStore((s) => s.clientes);
  const atualizarStatus = useStore((s) => s.atualizarStatusPedido);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const fila = pedidos.filter((p) => p.status === 'preparando' || p.status === 'novo');
  fila.sort((a, b) => (a.criadoEm < b.criadoEm ? -1 : 1));

  return (
    <div className="min-h-screen bg-papel">
      <header className="bg-carvao text-papel p-4 sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            <div className="font-display font-extrabold text-2xl uppercase flex items-center gap-2">
              <ChefHat className="w-6 h-6" /> Cozinha
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2 text-papel/70">
            <Bell className="w-4 h-4" />
            <span className="font-mono">{fila.length} pedido{fila.length === 1 ? '' : 's'}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4" key={tick}>
        {fila.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-2">🥩</div>
            <div className="font-display font-bold uppercase text-xl">Cozinha livre</div>
            <p className="text-sm text-carvao/60 mt-1">Nenhum pedido em preparo agora.</p>
            <Link href="/" className="inline-block mt-4 text-brasa underline text-sm">Voltar ao início</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {fila.map((p) => {
              const cliente = clientes.find((c) => c.id === p.clienteId);
              const idade = idadeMinutos(p);
              const atrasado = idade >= 20;
              return (
                <article
                  key={p.id}
                  className={`bg-azulejo border-2 rounded-xl p-4 ${atrasado ? 'border-vermelho-risco' : 'border-sebo'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="font-mono font-extrabold text-3xl text-carvao tabular-nums">{p.id}</div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.status === 'novo' ? 'bg-sangue text-papel' : 'bg-brasa text-papel'
                    }`}>
                      {p.status === 'novo' ? 'RECEBIDO' : 'EM PREPARO'}
                    </span>
                    <div className="ml-auto flex items-center gap-1 font-mono text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      <span className={atrasado ? 'text-vermelho-risco font-bold' : 'text-carvao/70'}>{idadeHMS(p)}</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-sm font-semibold">{cliente?.nome}</div>
                    <div className="text-xs text-carvao/60 font-mono">{formatarTelefone(cliente?.telefone ?? '')}</div>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[11px] text-carvao/70">
                    {p.retirada === 'entrega' ? <Bike className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                    <span>{p.retirada === 'entrega' ? `ENTREGA · ${p.endereco}` : 'RETIRADA NO BALCÃO'}</span>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {p.itens.map((it, i) => {
                      const prod = produtos.find((pr) => pr.id === it.produtoId);
                      return (
                        <li key={i} className="border-l-4 border-sangue pl-3 py-1">
                          <div className="text-sm font-semibold">
                            <span className="font-mono mr-2 text-brasa">{it.pesoKg.toFixed(2).replace('.', ',')} kg</span>
                            {prod?.nome}
                          </div>
                          {it.preparos.length > 0 && (
                            <ul className="mt-1">
                              {it.preparos.map((pr) => (
                                <li key={pr} className="text-xs font-bold text-carvao">» {pr.toUpperCase()}</li>
                              ))}
                            </ul>
                          )}
                          {it.observacao && (
                            <div className="text-xs text-carvao/60 italic mt-0.5">obs: {it.observacao}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {p.observacaoGeral && (
                    <div className="mt-3 rounded-md bg-sebo-claro px-2 py-1 text-xs">
                      <strong>Geral:</strong> {p.observacaoGeral}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    {p.status === 'novo' && (
                      <button
                        onClick={() => atualizarStatus(p.id, 'preparando')}
                        className="flex-1 h-14 rounded-md bg-brasa text-papel font-semibold"
                      >
                        Iniciar preparo
                      </button>
                    )}
                    {p.status === 'preparando' && (
                      <button
                        onClick={() => atualizarStatus(p.id, 'pronto')}
                        className="flex-1 h-14 rounded-md bg-verde-fiel text-papel font-bold text-lg flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" /> Marcar como pronto
                      </button>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-carvao/60 flex items-center justify-between">
                    <span>{formatarHora(p.criadoEm)} · {idade} min</span>
                    <span className="font-mono font-bold">{brl(p.total)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
