'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { brl } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/components/ui/admin-header';
import { Plus, X, Save, Power, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Combo, ItemCombo } from '@/lib/types';

import { useNoIndex } from '@/components/ui/use-no-index';
function slugify(nome: string): string {
  const semAcentos = nome
    .normalize('NFD')
    .split('')
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      // Faixa dos diacríticos combinantes (acentos soltos pós-NFD).
      return code < 0x0300 || code > 0x036f;
    })
    .join('');
  return semAcentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function BackofficeCombosPage() {
  useNoIndex();
  const combos = useStore((s) => s.combos);
  const produtos = useStore((s) => s.produtos);
  const criar = useStore((s) => s.criarCombo);
  const atualizar = useStore((s) => s.atualizarCombo);
  const desativar = useStore((s) => s.desativarCombo);

  const [modal, setModal] = useState<{ tipo: 'criar' | 'editar'; combo?: Combo } | null>(null);

  return (
    <div className="min-h-screen bg-papel pb-8">
      <AdminHeader
        titulo="Backoffice · Combos"
        voltarPara="/backoffice"
        acoes={
          <Button onClick={() => setModal({ tipo: 'criar' })} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        }
      />

      <main className="mx-auto max-w-3xl px-4 py-4 space-y-2">
        <div className="text-xs text-carvao/60">{combos.length} combo{combos.length === 1 ? '' : 's'}</div>

        <ul className="space-y-2">
          {combos.map((c) => (
            <li key={c.id} className="bg-azulejo border border-sebo rounded-xl p-3">
              <div className="flex items-start gap-3">
                <img src={c.imagem} alt="" className="w-14 h-14 rounded-md object-cover bg-sebo-claro shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-display font-bold uppercase truncate">{c.nome}</div>
                    <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${c.ativo ? 'bg-verde-fiel' : 'bg-sebo'}`} title={c.ativo ? 'Ativo' : 'Inativo'} />
                  </div>
                  <div className="text-xs text-carvao/60 truncate">{c.itens.length} item{c.itens.length === 1 ? '' : 's'} · {c.descricao}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-brasa">{brl(c.precoCombo)}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setModal({ tipo: 'editar', combo: c })}
                  className="h-11 rounded-md bg-sebo-claro text-carvao text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Pencil className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => {
                    if (!c.ativo) return;
                    void desativar(c.id);
                    toast.success('Combo desativado');
                  }}
                  disabled={!c.ativo}
                  className="h-11 rounded-md bg-sebo-claro text-carvao text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <Power className="w-4 h-4" /> {c.ativo ? 'Desativar' : 'Inativo'}
                </button>
              </div>
            </li>
          ))}
          {combos.length === 0 && (
            <li className="p-10 text-center text-carvao/60 bg-azulejo border border-sebo rounded-xl">Nenhum combo cadastrado.</li>
          )}
        </ul>
      </main>

      {modal && (
        <ModalCombo
          combo={modal.combo}
          produtos={produtos}
          onClose={() => setModal(null)}
          onSalvar={(dados) => {
            if (modal.tipo === 'criar') {
              const id = `combo-${Date.now()}`;
              void criar({ id, ativo: true, ...dados });
              toast.success('Combo criado');
            } else if (modal.combo) {
              void atualizar({ ...modal.combo, ...dados });
              toast.success('Combo atualizado');
            }
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

function ModalCombo({
  combo,
  produtos,
  onClose,
  onSalvar,
}: {
  combo?: Combo;
  produtos: { id: string; nome: string }[];
  onClose: () => void;
  onSalvar: (dados: Omit<Combo, 'id' | 'ativo'>) => void;
}) {
  const [nome, setNome] = useState(combo?.nome ?? '');
  const [descricao, setDescricao] = useState(combo?.descricao ?? '');
  const [imagem, setImagem] = useState(combo?.imagem ?? '');
  const [precoCombo, setPrecoCombo] = useState(combo?.precoCombo ?? 0);
  const [percentualCashback, setPercentualCashback] = useState((combo?.percentualCashback ?? 0.03) * 100);
  const [itens, setItens] = useState<ItemCombo[]>(combo?.itens ?? []);
  const [novoProdutoId, setNovoProdutoId] = useState('');
  const [novaQtd, setNovaQtd] = useState(1);

  const adicionarItem = () => {
    if (!novoProdutoId || novaQtd <= 0) return;
    setItens((prev) => [...prev, { produtoId: novoProdutoId, quantidadeKg: novaQtd }]);
    setNovoProdutoId('');
    setNovaQtd(1);
  };

  const removerItem = (idx: number) => {
    setItens((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 bg-carvao/60 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-azulejo rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl shadow-xl max-h-[92vh] overflow-auto">
        <div className="p-4 sm:p-5 border-b border-sebo flex items-center gap-3 sticky top-0 bg-azulejo z-10">
          <div className="font-display font-extrabold uppercase">{combo ? 'Editar combo' : 'Novo combo'}</div>
          <button className="ml-auto p-1" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block sm:col-span-2">
              <span className="text-xs text-carvao/70">Nome</span>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Combo Churrasco Família" className="mt-1 w-full h-12 rounded-md border border-sebo px-3" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs text-carvao/70">Descrição</span>
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Picanha 1kg + carvão + sal grosso" className="mt-1 w-full h-12 rounded-md border border-sebo px-3" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs text-carvao/70">Imagem (URL)</span>
              <input value={imagem} onChange={(e) => setImagem(e.target.value)} placeholder="/produtos/combo-churrasco.jpg" className="mt-1 w-full h-12 rounded-md border border-sebo px-3" />
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Preço do combo (R$)</span>
              <input type="number" step="0.10" inputMode="decimal" value={precoCombo} onChange={(e) => setPrecoCombo(Number(e.target.value))} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Cashback (%)</span>
              <input type="number" step="0.5" inputMode="decimal" value={percentualCashback} onChange={(e) => setPercentualCashback(Number(e.target.value))} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
            </label>
          </div>

          <div>
            <span className="text-xs text-carvao/70">Itens do combo</span>
            <div className="mt-1 flex gap-2">
              <select value={novoProdutoId} onChange={(e) => setNovoProdutoId(e.target.value)} className="flex-1 h-11 rounded-md border border-sebo px-2 text-sm">
                <option value="">Selecione um produto…</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
              <input type="number" step="0.1" min="0.1" value={novaQtd} onChange={(e) => setNovaQtd(Number(e.target.value))} className="w-20 h-11 rounded-md border border-sebo px-2 font-mono text-sm" />
              <button onClick={adicionarItem} className="h-11 px-3 rounded-md bg-carvao text-papel text-sm font-semibold">Add</button>
            </div>
            {itens.length > 0 && (
              <ul className="mt-2 space-y-1">
                {itens.map((it, idx) => {
                  const p = produtos.find((x) => x.id === it.produtoId);
                  return (
                    <li key={idx} className="flex items-center gap-2 text-sm bg-sebo-claro rounded-md px-3 py-2">
                      <span className="flex-1">{p?.nome ?? it.produtoId}</span>
                      <span className="font-mono text-xs">{it.quantidadeKg} kg</span>
                      <button onClick={() => removerItem(idx)} className="text-vermelho-risco"><Trash2 className="w-3.5 h-3.5" /></button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {nome && precoCombo > 0 && (
            <div className="border border-sebo rounded-md p-3 bg-sebo-claro text-sm">
              <div className="text-xs text-carvao/70 mb-2">Pré-visualização na loja</div>
              <div className="flex items-center gap-3">
                {imagem && <img src={imagem} alt="" className="w-14 h-14 rounded-md object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold uppercase text-sm truncate">{nome}</div>
                  <div className="text-xs text-carvao/60 truncate">{descricao}</div>
                </div>
                <div className="font-mono font-extrabold text-lg text-brasa shrink-0">{brl(precoCombo)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-sebo flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sticky bottom-0 bg-azulejo">
          <Button variant="ghost" onClick={onClose} size="lg">Cancelar</Button>
          <Button
            size="lg"
            onClick={() => {
              if (!nome.trim() || !precoCombo || itens.length === 0) {
                toast.error('Preencha nome, preço e pelo menos 1 item');
                return;
              }
              onSalvar({
                slug: combo?.slug ?? slugify(nome),
                nome: nome.trim(),
                descricao: descricao.trim(),
                imagem,
                precoCombo,
                percentualCashback: percentualCashback / 100,
                itens,
              });
            }}
          >
            <Save className="w-4 h-4 mr-1" /> Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
