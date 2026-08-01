'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { brl } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/components/ui/admin-header';
import { Search, Save, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIAS, CASHBACK_POR_CATEGORIA, type Produto } from '@/lib/types';

import { useNoIndex } from '@/components/ui/use-no-index';
export default function BackofficeProdutosPage() {
  useNoIndex();
  const produtos = useStore((s) => s.produtos);
  const atualizar = useStore((s) => s.atualizarProduto);

  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [draft, setDraft] = useState<Produto | null>(null);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      if (categoriaFiltro !== 'todas' && p.categoria !== categoriaFiltro) return false;
      if (!q) return true;
      return p.nome.toLowerCase().includes(q);
    });
  }, [produtos, busca, categoriaFiltro]);

  const salvar = () => {
    if (!draft) return;
    void atualizar(draft);
    toast.success('Produto atualizado');
    setDraft(null);
  };

  return (
    <div className="min-h-screen bg-papel pb-8">
      <AdminHeader titulo="Backoffice · Produtos" voltarPara="/backoffice" />

      <main className="mx-auto max-w-3xl px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carvao/40" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto…"
            className="w-full h-12 pl-10 pr-3 rounded-md border border-sebo bg-azulejo"
          />
        </div>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="w-full h-12 rounded-md border border-sebo px-3 bg-azulejo"
        >
          <option value="todas">Todas categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>

        <div className="text-xs text-carvao/60">{lista.length} produto{lista.length === 1 ? '' : 's'}</div>

        <ul className="space-y-2">
          {lista.map((p) => (
            <li key={p.id} className="bg-azulejo border border-sebo rounded-xl p-3">
              <div className="flex items-start gap-3">
                <img src={p.imagem} alt="" className="w-14 h-14 rounded-md object-cover shrink-0 bg-sebo-claro" />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold uppercase truncate">{p.nome}</div>
                  <div className="text-[11px] text-carvao/60 uppercase">{p.categoria}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono font-bold">{brl(p.precoKg)}<span className="text-[10px] font-normal text-carvao/50">/kg</span></span>
                    <span className="text-xs text-carvao/60">{(p.percentualCashback * 100).toFixed(1)}% cashback</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => void atualizar({ ...p, disponivel: !p.disponivel })}
                  className={`h-11 rounded-md text-xs font-semibold flex items-center justify-center gap-1 ${
                    p.disponivel ? 'bg-verde-fiel text-papel' : 'bg-vermelho-risco text-papel'
                  }`}
                >
                  {p.disponivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {p.disponivel ? 'Visível na loja' : 'Oculto da loja'}
                </button>
                <button
                  onClick={() => setDraft({ ...p })}
                  className="h-11 rounded-md bg-sebo-claro text-carvao text-xs font-semibold"
                >
                  Editar
                </button>
              </div>
            </li>
          ))}
          {lista.length === 0 && (
            <li className="p-10 text-center text-carvao/60 bg-azulejo border border-sebo rounded-xl">Nenhum produto encontrado.</li>
          )}
        </ul>
      </main>

      {draft && (
        <div className="fixed inset-0 z-50 bg-carvao/60 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-azulejo rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl shadow-xl max-h-[92vh] overflow-auto">
            <div className="p-4 sm:p-5 border-b border-sebo flex items-center gap-3 sticky top-0 bg-azulejo z-10">
              <div className="font-display font-extrabold uppercase">Editar produto</div>
              <button className="ml-auto p-1" onClick={() => setDraft(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block sm:col-span-2">
                  <span className="text-xs text-carvao/70">Nome</span>
                  <input value={draft.nome} onChange={(e) => setDraft({ ...draft, nome: e.target.value })} className="mt-1 w-full h-12 rounded-md border border-sebo px-3" />
                </label>
                <label className="block">
                  <span className="text-xs text-carvao/70">Categoria</span>
                  <select
                    value={draft.categoria}
                    onChange={(e) => {
                      const cat = e.target.value as Produto['categoria'];
                      setDraft({ ...draft, categoria: cat, percentualCashback: CASHBACK_POR_CATEGORIA[cat] });
                    }}
                    className="mt-1 w-full h-12 rounded-md border border-sebo px-3"
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-carvao/70">Unidade de venda</span>
                  <select
                    value={draft.unidadeVenda}
                    onChange={(e) => setDraft({ ...draft, unidadeVenda: e.target.value as Produto['unidadeVenda'] })}
                    className="mt-1 w-full h-12 rounded-md border border-sebo px-3"
                  >
                    <option value="kg">Quilo (kg)</option>
                    <option value="peca">Peça</option>
                    <option value="bandeja">Bandeja</option>
                    <option value="unidade">Unidade</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-carvao/70">Preço por kg (R$)</span>
                  <input type="number" step="0.10" inputMode="decimal" value={draft.precoKg} onChange={(e) => setDraft({ ...draft, precoKg: Number(e.target.value) })} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
                </label>
                <label className="block">
                  <span className="text-xs text-carvao/70">% Cashback</span>
                  <input type="number" step="0.1" inputMode="decimal" value={(draft.percentualCashback * 100).toFixed(1)} onChange={(e) => setDraft({ ...draft, percentualCashback: Number(e.target.value) / 100 })} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs text-carvao/70">Descrição</span>
                  <textarea
                    value={draft.descricao}
                    onChange={(e) => setDraft({ ...draft, descricao: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-md border border-sebo px-3 py-2"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs text-carvao/70">URL da imagem</span>
                  <input value={draft.imagem} onChange={(e) => setDraft({ ...draft, imagem: e.target.value })} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 text-xs" />
                </label>
                <label className="block">
                  <span className="text-xs text-carvao/70">Peso médio da peça (kg)</span>
                  <input type="number" step="0.10" inputMode="decimal" value={draft.pesoMedioPeca ?? 0} onChange={(e) => setDraft({ ...draft, pesoMedioPeca: Number(e.target.value) || undefined })} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
                </label>
                <div className="flex flex-col justify-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={draft.disponivel} onChange={(e) => setDraft({ ...draft, disponivel: e.target.checked })} className="w-5 h-5" />
                    Disponível na loja
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={draft.destaque} onChange={(e) => setDraft({ ...draft, destaque: e.target.checked })} className="w-5 h-5" />
                    Marcar como destaque
                  </label>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5 border-t border-sebo flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sticky bottom-0 bg-azulejo">
              <Button variant="ghost" onClick={() => setDraft(null)} size="lg">Cancelar</Button>
              <Button onClick={salvar} size="lg"><Save className="w-4 h-4 mr-1" /> Salvar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
