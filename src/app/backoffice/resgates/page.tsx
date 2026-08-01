'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/components/ui/admin-header';
import { Plus, X, Save, Power, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { Resgate } from '@/lib/types';
import { ImagemProduto } from '@/components/ui/imagem-produto';

import { useNoIndex } from '@/components/ui/use-no-index';
export default function BackofficeResgatesPage() {
  useNoIndex();
  const resgates = useStore((s) => s.resgates);
  const criar = useStore((s) => s.criarResgate);
  const atualizar = useStore((s) => s.atualizarResgate);
  const desativar = useStore((s) => s.desativarResgate);

  const [modal, setModal] = useState<{ tipo: 'criar' | 'editar'; resgate?: Resgate } | null>(null);

  return (
    <div className="min-h-screen bg-papel pb-8">
      <AdminHeader
        titulo="Backoffice · Resgates"
        voltarPara="/backoffice"
        acoes={
          <Button onClick={() => setModal({ tipo: 'criar' })} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        }
      />

      <main className="mx-auto max-w-3xl px-4 py-4 space-y-2">
        <div className="text-xs text-carvao/60">{resgates.length} resgate{resgates.length === 1 ? '' : 's'} no catálogo</div>

        <ul className="space-y-2">
          {resgates.map((r) => (
            <li key={r.id} className="bg-azulejo border border-sebo rounded-xl p-3 flex items-center gap-3">
              <ImagemProduto src={r.imagem} alt={r.nome} className="w-14 h-14 rounded-md object-cover bg-sebo-claro shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-display font-bold uppercase truncate">{r.nome}</div>
                  <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${r.ativo ? 'bg-verde-fiel' : 'bg-sebo'}`} title={r.ativo ? 'Ativo' : 'Inativo'} />
                </div>
                <div className="text-xs text-carvao/60 font-mono">{r.custoPontos} pontos</div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => setModal({ tipo: 'editar', resgate: r })}
                  className="h-9 px-3 rounded-md bg-sebo-claro text-carvao text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => {
                    if (!r.ativo) return;
                    void desativar(r.id);
                    toast.success('Resgate desativado');
                  }}
                  disabled={!r.ativo}
                  className="h-9 px-3 rounded-md bg-sebo-claro text-carvao text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <Power className="w-3.5 h-3.5" /> {r.ativo ? 'Desativar' : 'Inativo'}
                </button>
              </div>
            </li>
          ))}
          {resgates.length === 0 && (
            <li className="p-10 text-center text-carvao/60 bg-azulejo border border-sebo rounded-xl">Nenhum resgate cadastrado.</li>
          )}
        </ul>
      </main>

      {modal && (
        <ModalResgate
          resgate={modal.resgate}
          onClose={() => setModal(null)}
          onSalvar={(dados) => {
            if (modal.tipo === 'criar') {
              const id = `resgate-${Date.now()}`;
              void criar({ id, ativo: true, ...dados });
              toast.success('Resgate criado');
            } else if (modal.resgate) {
              void atualizar({ ...modal.resgate, ...dados });
              toast.success('Resgate atualizado');
            }
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

function ModalResgate({
  resgate,
  onClose,
  onSalvar,
}: {
  resgate?: Resgate;
  onClose: () => void;
  onSalvar: (dados: Omit<Resgate, 'id' | 'ativo'>) => void;
}) {
  const [nome, setNome] = useState(resgate?.nome ?? '');
  const [custoPontos, setCustoPontos] = useState(resgate?.custoPontos ?? 500);
  const [imagem, setImagem] = useState(resgate?.imagem ?? '');

  return (
    <div className="fixed inset-0 z-50 bg-carvao/60 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-azulejo rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg shadow-xl max-h-[92vh] overflow-auto">
        <div className="p-4 sm:p-5 border-b border-sebo flex items-center gap-3 sticky top-0 bg-azulejo z-10">
          <div className="font-display font-extrabold uppercase">{resgate ? 'Editar resgate' : 'Novo resgate'}</div>
          <button className="ml-auto p-1" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <label className="block">
            <span className="text-xs text-carvao/70">Nome</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: 1 kg de Linguiça Toscana" className="mt-1 w-full h-12 rounded-md border border-sebo px-3" />
          </label>
          <label className="block">
            <span className="text-xs text-carvao/70">Custo em pontos</span>
            <input type="number" step="50" inputMode="numeric" value={custoPontos} onChange={(e) => setCustoPontos(Number(e.target.value))} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
          </label>
          <label className="block">
            <span className="text-xs text-carvao/70">Imagem (URL)</span>
            <input value={imagem} onChange={(e) => setImagem(e.target.value)} placeholder="/produtos/toscana.jpg" className="mt-1 w-full h-12 rounded-md border border-sebo px-3" />
          </label>
        </div>

        <div className="p-4 sm:p-5 border-t border-sebo flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sticky bottom-0 bg-azulejo">
          <Button variant="ghost" onClick={onClose} size="lg">Cancelar</Button>
          <Button
            size="lg"
            onClick={() => {
              if (!nome.trim() || !custoPontos || custoPontos <= 0) {
                toast.error('Preencha nome e custo em pontos');
                return;
              }
              onSalvar({ nome: nome.trim(), custoPontos, imagem });
            }}
          >
            <Save className="w-4 h-4 mr-1" /> Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
