'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarTelefone, normalizarTelefone } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/components/ui/admin-header';
import { Search, Plus, Pencil, Trash2, MessageCircle, X, Save, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { confirmar } from '@/lib/confirmar';
import type { Cliente } from '@/lib/types';

export default function BackofficeClientesPage() {
  const clientes = useStore((s) => s.clientes);
  const pedidos = useStore((s) => s.pedidos);
  const criar = useStore((s) => s.criarCliente);
  const atualizar = useStore((s) => s.atualizarCliente);
  const remover = useStore((s) => s.removerCliente);
  const creditarCashback = useStore((s) => s.creditarCashback);

  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState<{ tipo: 'criar' | 'editar' | 'creditar' | null; cliente?: Cliente }>({ tipo: null });

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.telefone.includes(q) ||
        formatarTelefone(c.telefone).toLowerCase().includes(q),
    );
  }, [clientes, busca]);

  return (
    <div className="min-h-screen bg-papel pb-8">
      <AdminHeader titulo="Backoffice · Clientes" voltarPara="/backoffice" />

      <main className="mx-auto max-w-3xl px-4 py-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carvao/40" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou telefone…"
              className="w-full h-12 pl-10 pr-3 rounded-md border border-sebo bg-azulejo"
            />
          </div>
          <Button onClick={() => setModal({ tipo: 'criar' })} size="lg" className="sm:w-auto">
            <Plus className="w-4 h-4 mr-1" /> Cadastrar cliente
          </Button>
        </div>

        <div className="text-xs text-carvao/60">{filtrados.length} cliente{filtrados.length === 1 ? '' : 's'}</div>

        <ul className="space-y-2">
          {filtrados.map((c) => {
            const totalPedidos = pedidos.filter((p) => p.clienteId === c.id).length;
            return (
              <li key={c.id} className="bg-azulejo border border-sebo rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold uppercase truncate">{c.nome}</div>
                    <div className="text-xs text-carvao/60 font-mono">{formatarTelefone(c.telefone)}</div>
                    <div className="text-[11px] text-carvao/50 mt-0.5">Cliente desde {formatarData(c.criadoEm)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-brasa">{brl(c.saldoCashback)}</div>
                    <div className="text-[11px] text-carvao/60">{c.pontos} pts · {totalPedidos} pedido{totalPedidos === 1 ? '' : 's'}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setModal({ tipo: 'creditar', cliente: c })}
                    className="h-11 rounded-md bg-sebo-claro text-carvao text-xs font-semibold flex flex-col items-center justify-center gap-0.5"
                    title="Creditar cashback"
                  >
                    <Wallet className="w-4 h-4" />
                    Cashback
                  </button>
                  <button
                    onClick={() => setModal({ tipo: 'editar', cliente: c })}
                    className="h-11 rounded-md bg-sebo-claro text-carvao text-xs font-semibold flex flex-col items-center justify-center gap-0.5"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  {c.aceitaWhatsapp ? (
                    <a
                      href={`https://wa.me/55${c.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-11 rounded-md bg-verde-fiel text-papel text-xs font-semibold flex flex-col items-center justify-center gap-0.5"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  ) : (
                    <div className="h-11 rounded-md bg-sebo text-carvao/40 text-[11px] font-semibold flex items-center justify-center text-center px-1">
                      Sem WhatsApp
                    </div>
                  )}
                  <button
                    onClick={async () => {
                      if (await confirmar(`Remover ${c.nome}? O histórico de pedidos dele continua.`)) {
                        void remover(c.id);
                      }
                    }}
                    className="h-11 rounded-md bg-vermelho-risco text-papel text-xs font-semibold flex flex-col items-center justify-center gap-0.5"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remover
                  </button>
                </div>
              </li>
            );
          })}
          {filtrados.length === 0 && (
            <li className="p-10 text-center text-carvao/60 bg-azulejo border border-sebo rounded-xl">Nenhum cliente encontrado.</li>
          )}
        </ul>
      </main>

      {modal.tipo === 'criar' && (
        <ModalCliente
          onClose={() => setModal({ tipo: null })}
          onSalvar={(dados) => {
            if (!dados.nome.trim() || !dados.telefone.trim()) {
              toast.error('Nome e telefone são obrigatórios');
              return;
            }
            void criar({ ...dados, telefone: normalizarTelefone(dados.telefone) });
            toast.success('Cliente cadastrado');
            setModal({ tipo: null });
          }}
        />
      )}

      {modal.tipo === 'editar' && modal.cliente && (
        <ModalCliente
          cliente={modal.cliente}
          onClose={() => setModal({ tipo: null })}
          onSalvar={(dados) => {
            void atualizar({ ...modal.cliente!, ...dados, telefone: normalizarTelefone(dados.telefone) });
            toast.success('Cliente atualizado');
            setModal({ tipo: null });
          }}
        />
      )}

      {modal.tipo === 'creditar' && modal.cliente && (
        <ModalCreditarCashback
          cliente={modal.cliente}
          onClose={() => setModal({ tipo: null })}
          onCreditar={(valor) => {
            void creditarCashback(modal.cliente!.id, valor);
            toast.success(`${brl(valor)} creditado a ${modal.cliente!.nome.split(' ')[0]}`);
            setModal({ tipo: null });
          }}
        />
      )}
    </div>
  );
}

function ModalCliente({
  cliente,
  onClose,
  onSalvar,
}: {
  cliente?: Cliente;
  onClose: () => void;
  onSalvar: (dados: { nome: string; telefone: string; aceitaWhatsapp: boolean }) => void;
}) {
  const [nome, setNome] = useState(cliente?.nome ?? '');
  const [telefone, setTelefone] = useState(cliente?.telefone ?? '');
  const [aceita, setAceita] = useState(cliente?.aceitaWhatsapp ?? true);

  return (
    <div className="fixed inset-0 z-50 bg-carvao/60 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-azulejo rounded-t-2xl sm:rounded-xl w-full sm:max-w-md shadow-xl max-h-[92vh] overflow-auto">
        <div className="p-4 sm:p-5 border-b border-sebo flex items-center justify-between sticky top-0 bg-azulejo">
          <div className="font-display font-extrabold uppercase">{cliente ? 'Editar cliente' : 'Cadastrar cliente'}</div>
          <button onClick={onClose} className="p-1 -mr-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 sm:p-5 space-y-3">
          <label className="block">
            <span className="text-xs text-carvao/70">Nome</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 w-full h-12 rounded-md border border-sebo px-3" />
          </label>
          <label className="block">
            <span className="text-xs text-carvao/70">Telefone (somente números, com DDD)</span>
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="34999998888" inputMode="numeric" className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
          </label>
          <label className="flex items-center gap-2 text-sm py-1">
            <input type="checkbox" checked={aceita} onChange={(e) => setAceita(e.target.checked)} className="w-5 h-5" />
            Aceita receber mensagens no WhatsApp
          </label>
        </div>
        <div className="p-4 sm:p-5 border-t border-sebo flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sticky bottom-0 bg-azulejo">
          <Button variant="ghost" onClick={onClose} size="lg">Cancelar</Button>
          <Button onClick={() => onSalvar({ nome, telefone, aceitaWhatsapp: aceita })} size="lg">
            <Save className="w-4 h-4 mr-1" /> Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

function ModalCreditarCashback({
  cliente,
  onClose,
  onCreditar,
}: {
  cliente: Cliente;
  onClose: () => void;
  onCreditar: (valor: number) => void;
}) {
  const [valor, setValor] = useState('5');
  return (
    <div className="fixed inset-0 z-50 bg-carvao/60 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-azulejo rounded-t-2xl sm:rounded-xl w-full sm:max-w-sm shadow-xl">
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="font-display font-extrabold uppercase">Creditar cashback</div>
          <button onClick={onClose} className="p-1 -mr-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <p className="text-sm text-carvao/70 mb-3">
            Para <strong>{cliente.nome}</strong>. Saldo atual: {brl(cliente.saldoCashback)}.
          </p>
          <label className="block">
            <span className="text-xs text-carvao/70">Valor (R$)</span>
            <input
              type="number"
              step="0.50"
              min="0.50"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              inputMode="decimal"
              className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono"
            />
          </label>
        </div>
        <div className="p-4 sm:p-5 border-t border-sebo flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="ghost" onClick={onClose} size="lg">Cancelar</Button>
          <Button size="lg" onClick={() => {
            const v = Number(valor);
            if (!v || v <= 0) { toast.error('Valor inválido'); return; }
            onCreditar(v);
          }}>Creditar</Button>
        </div>
      </div>
    </div>
  );
}
