'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarTelefone, normalizarTelefone } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { Home, Search, Plus, Pencil, Trash2, MessageCircle, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { Cliente } from '@/lib/types';

export default function BackofficeClientesPage() {
  const clientes = useStore((s) => s.clientes);
  const pedidos = useStore((s) => s.pedidos);
  const criar = useStore((s) => s.criarCliente);
  const atualizar = useStore((s) => s.atualizarCliente);
  const remover = useStore((s) => s.removerCliente);
  const creditarCashback = useStore((s) => s.creditarCashback);

  const [busca, setBusca] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
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
    <div className="min-h-screen bg-papel">
      <header className="bg-carvao text-papel p-4 sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <Link href="/backoffice" className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            <div className="font-display font-extrabold text-xl uppercase">Backoffice · Clientes</div>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carvao/40" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou telefone…"
              className="w-full h-11 pl-10 pr-3 rounded-md border border-sebo"
            />
          </div>
          <Button onClick={() => setModal({ tipo: 'criar' })}>
            <Plus className="w-4 h-4 mr-1" /> Cadastrar cliente
          </Button>
        </div>

        <div className="bg-azulejo border border-sebo rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sebo-claro text-carvao/70 text-xs uppercase">
              <tr>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Telefone</th>
                <th className="text-right p-3">Cashback</th>
                <th className="text-right p-3">Pontos</th>
                <th className="text-right p-3">Pedidos</th>
                <th className="text-right p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => {
                const totalPedidos = pedidos.filter((p) => p.clienteId === c.id).length;
                return (
                  <tr key={c.id} className="border-t border-sebo">
                    <td className="p-3">
                      <div className="font-display font-bold uppercase">{c.nome}</div>
                      <div className="text-xs text-carvao/60">Desde {formatarData(c.criadoEm)}</div>
                    </td>
                    <td className="p-3 font-mono text-xs">{formatarTelefone(c.telefone)}</td>
                    <td className="p-3 text-right font-mono">{brl(c.saldoCashback)}</td>
                    <td className="p-3 text-right font-mono">{c.pontos}</td>
                    <td className="p-3 text-right font-mono">{totalPedidos}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setModal({ tipo: 'creditar', cliente: c })}
                          className="h-9 px-2 rounded-md bg-sebo-claro text-carvao text-xs font-semibold inline-flex items-center gap-1"
                          title="Creditar cashback"
                        >
                          <Plus className="w-3.5 h-3.5" /> cb
                        </button>
                        <button
                          onClick={() => setModal({ tipo: 'editar', cliente: c })}
                          className="h-9 w-9 grid place-items-center rounded-md bg-sebo-claro text-carvao"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://wa.me/55${c.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="h-9 w-9 grid place-items-center rounded-md bg-verde-fiel text-papel"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => {
                            if (confirm(`Remover ${c.nome}?`)) remover(c.id);
                          }}
                          className="h-9 w-9 grid place-items-center rounded-md bg-vermelho-risco text-papel"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-carvao/60">Nenhum cliente encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {modal.tipo === 'criar' && (
        <ModalCliente
          onClose={() => setModal({ tipo: null })}
          onSalvar={(dados) => {
            if (!dados.nome.trim() || !dados.telefone.trim()) {
              toast.error('Nome e telefone são obrigatórios');
              return;
            }
            criar({ ...dados, telefone: normalizarTelefone(dados.telefone) });
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
            atualizar({ ...modal.cliente!, ...dados, telefone: normalizarTelefone(dados.telefone) });
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
            creditarCashback(modal.cliente!.id, valor);
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
    <div className="fixed inset-0 z-50 bg-carvao/60 grid place-items-center p-4">
      <div className="bg-azulejo rounded-xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="font-display font-extrabold uppercase">{cliente ? 'Editar cliente' : 'Cadastrar cliente'}</div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-carvao/70">Nome</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 w-full h-11 rounded-md border border-sebo px-3" />
          </label>
          <label className="block">
            <span className="text-xs text-carvao/70">Telefone (somente números, com DDD)</span>
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="34999998888" className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={aceita} onChange={(e) => setAceita(e.target.checked)} className="w-4 h-4" />
            Aceita receber mensagens no WhatsApp
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSalvar({ nome, telefone, aceitaWhatsapp: aceita })}>
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
    <div className="fixed inset-0 z-50 bg-carvao/60 grid place-items-center p-4">
      <div className="bg-azulejo rounded-xl p-5 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="font-display font-extrabold uppercase">Creditar cashback</div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
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
            className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => {
            const v = Number(valor);
            if (!v || v <= 0) { toast.error('Valor inválido'); return; }
            onCreditar(v);
          }}>Creditar</Button>
        </div>
      </div>
    </div>
  );
}
