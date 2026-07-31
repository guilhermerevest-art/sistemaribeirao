'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Printer, PrinterCheck, Volume2, VolumeX, Plus, Bike, Store } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ImpressaoAutomatica, useAutoAvanco, useSyncEntreAbas } from '@/components/ui/sync';
import { Button } from '@/components/ui/button';
import { brl, formatarHora, formatarTelefone } from '@/lib/formato';
import type { Pedido, StatusPedido } from '@/lib/types';

function idadeMinutos(p: Pedido): number {
  return Math.floor((Date.now() - new Date(p.criadoEm).getTime()) / 60000);
}

export default function BancadaPage() {
  useSyncEntreAbas();
  useAutoAvanco();

  const pedidos = useStore((s) => s.pedidos);
  const clientes = useStore((s) => s.clientes);
  const atualizarStatus = useStore((s) => s.atualizarStatusPedido);
  const marcarImpresso = useStore((s) => s.marcarImpresso);
  const somBancada = useStore((s) => s.somBancada);
  const setSomBancada = useStore((s) => s.setSomBancada);
  const impressaoAutomatica = useStore((s) => s.impressaoAutomatica);
  const setImpressaoAutomatica = useStore((s) => s.setImpressaoAutomatica);
  const gerarPedidoTeste = useStore((s) => s.gerarPedidoTeste);
  const produtos = useStore((s) => s.produtos);
  const combos = useStore((s) => s.combos);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(i);
  }, []);

  const emAberto = pedidos.filter((p) => ['novo', 'preparando', 'pronto'].includes(p.status));
  const novos = emAberto.filter((p) => p.status === 'novo');
  const preparando = emAberto.filter((p) => p.status === 'preparando');
  const prontos = emAberto.filter((p) => p.status === 'pronto');

  return (
    <div className="min-h-screen bancada-bg">
      <header className="bg-carvao border-b border-papel/20 px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3 sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-sangue grid place-items-center font-display font-extrabold text-papel">R</div>
          <div className="font-display font-extrabold text-lg sm:text-2xl text-papel uppercase">Bancada</div>
        </Link>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar [&>*]:shrink-0 max-w-[62vw] sm:max-w-none -mr-1 pr-1 py-1">
          <button
            onClick={() => void setImpressaoAutomatica(!impressaoAutomatica)}
            className={`w-10 h-10 grid place-items-center rounded-md ${impressaoAutomatica ? 'text-verde-fiel' : 'text-papel/50'} hover:bg-papel/10`}
            title={impressaoAutomatica ? 'Impressão automática ligada — clique para desligar' : 'Impressão automática desligada — clique para ligar'}
            aria-label="Impressão automática"
          >
            {impressaoAutomatica ? <PrinterCheck className="w-5 h-5" /> : <Printer className="w-5 h-5" />}
          </button>
          <button
            onClick={() => void setSomBancada(!somBancada)}
            className="w-10 h-10 grid place-items-center rounded-md text-papel/80 hover:bg-papel/10"
            title={somBancada ? 'Mudo' : 'Som ligado'}
            aria-label="Som"
          >
            {somBancada ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <Link href="/painel">
            <Button variant="secondary" size="sm">Painel</Button>
          </Link>
          <Button onClick={() => void gerarPedidoTeste()} size="sm">
            <Plus className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Gerar pedido de teste</span>
            <span className="sm:hidden">Teste</span>
          </Button>
        </div>
      </header>

      {/* Impressão automática: pedidos novos disparam o cupom sozinhos
          num iframe oculto. Exige a impressora térmica como padrão do
          Windows e o navegador aberto com --kiosk-printing (ver README). */}
      <ImpressaoAutomatica />

      <main className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3" key={tick}>
        <Coluna titulo="Novos" pedidos={novos} tone="sangue" onAcao={(p, ac) => handleAcao(p, ac, atualizarStatus, marcarImpresso)} clientes={clientes} produtos={produtos} combos={combos} />
        <Coluna titulo="Preparando" pedidos={preparando} tone="brasa" onAcao={(p, ac) => handleAcao(p, ac, atualizarStatus, marcarImpresso)} clientes={clientes} produtos={produtos} combos={combos} />
        <Coluna titulo="Prontos" pedidos={prontos} tone="verde" onAcao={(p, ac) => handleAcao(p, ac, atualizarStatus, marcarImpresso)} clientes={clientes} produtos={produtos} combos={combos} />
      </main>
    </div>
  );
}

function handleAcao(
  p: Pedido,
  ac: 'imprimir' | 'iniciar' | 'pronto' | 'entregue',
  atualizar: (id: string, s: StatusPedido) => Promise<void>,
  marcarImpresso: (id: string) => Promise<void>,
) {
  if (ac === 'imprimir') {
    window.open(`/bancada/cupom/${p.id}`, '_blank');
    void marcarImpresso(p.id);
    return;
  }
  if (ac === 'iniciar') void atualizar(p.id, 'preparando');
  if (ac === 'pronto') void atualizar(p.id, 'pronto');
  if (ac === 'entregue') void atualizar(p.id, 'entregue');
}

function Coluna({
  titulo,
  pedidos,
  tone,
  onAcao,
  clientes,
  produtos,
  combos,
}: {
  titulo: string;
  pedidos: Pedido[];
  tone: 'sangue' | 'brasa' | 'verde';
  onAcao: (p: Pedido, ac: 'imprimir' | 'iniciar' | 'pronto' | 'entregue') => void;
  clientes: { id: string; nome: string; telefone: string }[];
  produtos: { id: string; nome: string }[];
  combos: { id: string; nome: string }[];
}) {
  const toneClass: Record<typeof tone, string> = {
    sangue: 'bg-sangue',
    brasa: 'bg-brasa',
    verde: 'bg-[color:var(--verde-fiel)]',
  };
  return (
    <section className="bg-papel rounded-xl p-3 min-h-[60vh]">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-3 h-3 rounded-full ${toneClass[tone]}`} />
        <h2 className="font-display font-extrabold text-lg uppercase">{titulo}</h2>
        <span className="ml-auto font-mono font-bold text-2xl text-carvao">{pedidos.length}</span>
      </div>
      <div className="space-y-3">
        {pedidos.length === 0 && (
          <div className="text-carvao/60 text-sm italic text-center py-8">Vazio por aqui.</div>
        )}
        {pedidos.map((p) => {
          const idade = idadeMinutos(p);
          const atrasado = idade >= 15;
          const cliente = clientes.find((c) => c.id === p.clienteId);
          return (
            <article
              key={p.id}
              className={`bg-papel border-2 rounded-xl p-3 ${atrasado ? 'border-vermelho-risco' : 'border-sebo'} animate-entrada`}
            >
              <div className="flex items-center gap-2">
                <div className="font-mono font-extrabold text-3xl text-carvao tabular-nums">{p.id}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-carvao">{cliente?.nome}</div>
                  <div className="text-xs text-carvao/60 font-mono">{formatarTelefone(cliente?.telefone ?? '')}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-lg text-carvao">{brl(p.total)}</div>
                  <div className={`text-xs font-mono ${atrasado ? 'text-vermelho-risco' : 'text-carvao/60'}`}>{formatarHora(p.criadoEm)} · {idade} min</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-carvao/70">
                {p.retirada === 'entrega' ? <Bike className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                <span>{p.retirada === 'entrega' ? 'Entrega' : 'Balcão'}</span>
                <span>· {p.itens.length} {p.itens.length === 1 ? 'item' : 'itens'}</span>
                {p.impressoEm && <span className="text-verde-fiel">· Impresso</span>}
              </div>
              <ul className="mt-2 text-xs text-carvao/80 max-h-24 overflow-auto">
                {p.itens.map((it, i) => {
                  if (it.comboId) {
                    const combo = combos.find((c) => c.id === it.comboId);
                    return (
                      <li key={i}>
                        <span className="font-mono">{it.pesoKg}x</span> COMBO {combo?.nome}
                      </li>
                    );
                  }
                  const prod = produtos.find((pr) => pr.id === it.produtoId);
                  return (
                    <li key={i}>
                      <span className="font-mono">{it.pesoKg.toFixed(2).replace('.', ',')} kg</span> {prod?.nome}
                    </li>
                  );
                })}
              </ul>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => onAcao(p, 'imprimir')}
                  className="h-14 rounded-md bg-carvao text-papel font-semibold flex items-center justify-center gap-1 active:opacity-80"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                {p.status === 'novo' && (
                  <button
                    onClick={() => onAcao(p, 'iniciar')}
                    className="h-14 rounded-md bg-brasa text-papel font-semibold active:opacity-80"
                  >
                    Iniciar
                  </button>
                )}
                {p.status === 'preparando' && (
                  <button
                    onClick={() => onAcao(p, 'pronto')}
                    className="h-14 rounded-md bg-verde-fiel text-papel font-semibold active:opacity-80"
                  >
                    Pronto
                  </button>
                )}
                {p.status === 'pronto' && (
                  <button
                    onClick={() => onAcao(p, 'entregue')}
                    className="h-14 rounded-md bg-sebo text-carvao font-semibold active:opacity-80"
                  >
                    Entregue
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
