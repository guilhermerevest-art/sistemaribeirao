'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarHora, formatarTelefone } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/components/ui/admin-header';
import { Search, X, Save, Printer, ChevronRight, Bike, Store } from 'lucide-react';
import { toast } from 'sonner';
import type { Pedido, StatusPedido } from '@/lib/types';

const STATUS_LABEL: Record<StatusPedido, string> = {
  novo: 'Recebido',
  preparando: 'Preparando',
  pronto: 'Pronto',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

const STATUS_BADGE: Record<StatusPedido, string> = {
  novo: 'bg-sangue text-papel',
  preparando: 'bg-brasa text-papel',
  pronto: 'bg-[color:var(--verde-fiel)] text-papel',
  entregue: 'bg-sebo text-carvao',
  cancelado: 'bg-[color:var(--amarelo-novo)] text-papel',
};

export default function BackofficePedidosPage() {
  const pedidos = useStore((s) => s.pedidos);
  const clientes = useStore((s) => s.clientes);
  const produtos = useStore((s) => s.produtos);
  const atualizarStatus = useStore((s) => s.atualizarStatusPedido);
  const atualizarPedido = useStore((s) => s.atualizarPedido);
  const cancelarPedido = useStore((s) => s.cancelarPedido);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusPedido | 'todos'>('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState<'hoje' | '7d' | '30d' | 'todos'>('todos');
  const [detalhe, setDetalhe] = useState<Pedido | null>(null);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const agora = new Date();
    let desde: Date | null = null;
    if (filtroPeriodo === 'hoje') { desde = new Date(); desde.setHours(0, 0, 0, 0); }
    if (filtroPeriodo === '7d') { desde = new Date(); desde.setDate(agora.getDate() - 7); }
    if (filtroPeriodo === '30d') { desde = new Date(); desde.setDate(agora.getDate() - 30); }
    return pedidos
      .filter((p) => filtroStatus === 'todos' || p.status === filtroStatus)
      .filter((p) => !desde || new Date(p.criadoEm) >= desde)
      .filter((p) => {
        if (!q) return true;
        const cli = clientes.find((c) => c.id === p.clienteId);
        return (
          p.id.includes(q) ||
          cli?.nome.toLowerCase().includes(q) ||
          cli?.telefone.includes(q)
        );
      })
      .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
  }, [pedidos, clientes, busca, filtroStatus, filtroPeriodo]);

  return (
    <div className="min-h-screen bg-papel pb-8">
      <AdminHeader titulo="Backoffice · Pedidos" voltarPara="/backoffice" />

      <main className="mx-auto max-w-3xl px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carvao/40" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nº, cliente ou telefone…"
            className="w-full h-12 pl-10 pr-3 rounded-md border border-sebo bg-azulejo"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusPedido | 'todos')}
            className="h-12 rounded-md border border-sebo px-3 bg-azulejo text-sm"
          >
            <option value="todos">Todos os status</option>
            <option value="novo">Recebido</option>
            <option value="preparando">Preparando</option>
            <option value="pronto">Pronto</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value as typeof filtroPeriodo)}
            className="h-12 rounded-md border border-sebo px-3 bg-azulejo text-sm"
          >
            <option value="hoje">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="todos">Todo o período</option>
          </select>
        </div>

        <div className="text-xs text-carvao/60">{lista.length} pedido{lista.length === 1 ? '' : 's'}</div>

        <ul className="space-y-2">
          {lista.map((p) => {
            const cli = clientes.find((c) => c.id === p.clienteId);
            return (
              <li key={p.id}>
                <button
                  onClick={() => setDetalhe(p)}
                  className="w-full text-left bg-azulejo border border-sebo rounded-xl p-3 active:bg-sebo-claro"
                >
                  <div className="flex items-center gap-2">
                    <div className="font-mono font-extrabold text-xl tabular-nums">{p.id}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                    <ChevronRight className="w-4 h-4 ml-auto text-carvao/40 shrink-0" />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold uppercase text-sm truncate">{cli?.nome}</div>
                      <div className="text-xs text-carvao/60 flex items-center gap-2 flex-wrap">
                        <span>{formatarData(p.criadoEm)} {formatarHora(p.criadoEm)}</span>
                        <span className="inline-flex items-center gap-1">
                          {p.retirada === 'entrega' ? <Bike className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                          {p.retirada === 'entrega' ? 'Entrega' : 'Balcão'}
                        </span>
                        <span>{p.itens.length} it.</span>
                      </div>
                    </div>
                    <div className="font-mono font-bold shrink-0">{brl(p.total)}</div>
                  </div>
                </button>
              </li>
            );
          })}
          {lista.length === 0 && (
            <li className="p-10 text-center text-carvao/60 bg-azulejo border border-sebo rounded-xl">Nenhum pedido encontrado.</li>
          )}
        </ul>
      </main>

      {detalhe && (
        <ModalPedido
          pedido={detalhe}
          clientes={clientes}
          produtos={produtos}
          onClose={() => setDetalhe(null)}
          onMudarStatus={(s) => { void atualizarStatus(detalhe.id, s); setDetalhe({ ...detalhe, status: s }); toast.success('Status atualizado'); }}
          onCancelar={() => {
            if (confirm('Cancelar este pedido? O cashback usado será devolvido.')) {
              void cancelarPedido(detalhe.id);
              setDetalhe({ ...detalhe, status: 'cancelado' });
              toast.success('Pedido cancelado');
            }
          }}
          onImprimir={() => window.open(`/bancada/cupom/${detalhe.id}`, '_blank')}
          onEditar={(patch) => { void atualizarPedido(detalhe.id, patch); setDetalhe({ ...detalhe, ...patch }); toast.success('Pedido atualizado'); }}
        />
      )}
    </div>
  );
}

function ModalPedido({
  pedido,
  clientes,
  produtos,
  onClose,
  onMudarStatus,
  onCancelar,
  onImprimir,
  onEditar,
}: {
  pedido: Pedido;
  clientes: { id: string; nome: string; telefone: string }[];
  produtos: { id: string; nome: string }[];
  onClose: () => void;
  onMudarStatus: (s: StatusPedido) => void;
  onCancelar: () => void;
  onImprimir: () => void;
  onEditar: (patch: Partial<Pedido>) => void;
}) {
  const cliente = clientes.find((c) => c.id === pedido.clienteId);
  const [endereco, setEndereco] = useState(pedido.endereco ?? '');
  return (
    <div className="fixed inset-0 z-50 bg-carvao/60 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-azulejo rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl shadow-xl max-h-[92vh] overflow-auto">
        <div className="p-4 sm:p-5 border-b border-sebo flex items-center gap-3 sticky top-0 bg-azulejo z-10">
          <div className="font-mono font-extrabold text-2xl">{pedido.id}</div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[pedido.status]}`}>
            {STATUS_LABEL[pedido.status]}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={onImprimir} className="h-10 px-3 rounded-md bg-carvao text-papel text-xs font-semibold inline-flex items-center gap-1">
              <Printer className="w-3.5 h-3.5" /> Cupom
            </button>
            <button onClick={onClose} className="p-1"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <section className="grid grid-cols-2 gap-3 text-sm">
            <Campo label="Cliente" valor={cliente?.nome ?? '—'} />
            <Campo label="Telefone" valor={formatarTelefone(cliente?.telefone ?? '')} />
            <Campo label="Quando" valor={`${formatarData(pedido.criadoEm)} ${formatarHora(pedido.criadoEm)}`} />
            <Campo label="Pagamento" valor={pedido.pagamento === 'pix' ? 'Pix' : pedido.pagamento === 'cartao_entrega' ? 'Cartão na entrega' : 'Dinheiro'} />
            <Campo label="Retirada" valor={pedido.retirada === 'entrega' ? 'Entrega' : 'Balcão'} />
            <Campo label="Total" valor={brl(pedido.total)} />
          </section>

          {pedido.retirada === 'entrega' && (
            <section>
              <div className="text-xs text-carvao/70 mb-1">Endereço de entrega</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="flex-1 h-11 rounded-md border border-sebo px-3"
                />
                <Button onClick={() => onEditar({ endereco })} className="sm:w-auto"><Save className="w-4 h-4 mr-1" /> Salvar</Button>
              </div>
            </section>
          )}

          <section>
            <div className="text-xs text-carvao/70 mb-1">Itens</div>
            <ul className="border border-sebo rounded-md divide-y divide-sebo">
              {pedido.itens.map((it, i) => {
                const p = produtos.find((x) => x.id === it.produtoId);
                return (
                  <li key={i} className="p-3 flex items-center gap-2 text-sm flex-wrap">
                    <div className="font-mono text-brasa">{it.pesoKg.toFixed(2).replace('.', ',')} kg</div>
                    <div className="flex-1 min-w-[8rem]">{p?.nome}</div>
                    {it.preparos.length > 0 && (
                      <div className="text-xs text-carvao/60 w-full sm:w-auto">{it.preparos.join(' · ')}</div>
                    )}
                    <div className="font-mono font-bold ml-auto">{brl(it.subtotal)}</div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <div className="text-xs text-carvao/70 mb-2">Mudar status</div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {(['novo', 'preparando', 'pronto', 'entregue', 'cancelado'] as StatusPedido[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onMudarStatus(s)}
                  className={`h-11 px-3 rounded-md text-sm font-semibold border ${
                    pedido.status === s ? 'bg-sangue text-papel border-sangue' : 'bg-azulejo border-sebo'
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </section>

          {pedido.status !== 'cancelado' && pedido.status !== 'entregue' && (
            <button
              onClick={onCancelar}
              className="w-full sm:w-auto h-11 px-4 rounded-md bg-vermelho-risco text-papel text-sm font-semibold"
            >
              Cancelar pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-carvao/60">{label}</div>
      <div className="font-mono mt-1 break-words">{valor}</div>
    </div>
  );
}
