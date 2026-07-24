'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { Home, Search, Save, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIAS, CASHBACK_POR_CATEGORIA, type Produto } from '@/lib/types';

export default function BackofficeProdutosPage() {
  const produtos = useStore((s) => s.produtos);
  const atualizar = useStore((s) => s.atualizarProduto);

  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Produto | null>(null);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      if (categoriaFiltro !== 'todas' && p.categoria !== categoriaFiltro) return false;
      if (!q) return true;
      return p.nome.toLowerCase().includes(q);
    });
  }, [produtos, busca, categoriaFiltro]);

  const abrirEdicao = (p: Produto) => {
    setEditId(p.id);
    setDraft({ ...p });
  };

  const salvar = () => {
    if (!draft) return;
    atualizar(draft);
    toast.success('Produto atualizado');
    setEditId(null);
    setDraft(null);
  };

  return (
    <div className="min-h-screen bg-papel">
      <header className="bg-carvao text-papel p-4 sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <Link href="/backoffice" className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            <div className="font-display font-extrabold text-xl uppercase">Backoffice · Produtos</div>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carvao/40" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto…"
              className="w-full h-11 pl-10 pr-3 rounded-md border border-sebo"
            />
          </div>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="h-11 rounded-md border border-sebo px-3 bg-azulejo"
          >
            <option value="todas">Todas categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-azulejo border border-sebo rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sebo-claro text-carvao/70 text-xs uppercase">
              <tr>
                <th className="text-left p-3">Produto</th>
                <th className="text-left p-3">Categoria</th>
                <th className="text-right p-3">Preço/kg</th>
                <th className="text-right p-3">Cashback</th>
                <th className="text-center p-3">Disponível</th>
                <th className="text-right p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id} className="border-t border-sebo">
                  <td className="p-3">
                    <div className="font-display font-bold uppercase">{p.nome}</div>
                    <div className="text-xs text-carvao/60 truncate max-w-xs">{p.descricao}</div>
                  </td>
                  <td className="p-3 text-xs uppercase">{p.categoria}</td>
                  <td className="p-3 text-right font-mono font-bold">{brl(p.precoKg)}</td>
                  <td className="p-3 text-right font-mono">{(p.percentualCashback * 100).toFixed(1)}%</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => atualizar({ ...p, disponivel: !p.disponivel })}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        p.disponivel ? 'bg-verde-fiel text-papel' : 'bg-vermelho-risco text-papel'
                      }`}
                    >
                      {p.disponivel ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {p.disponivel ? 'Visível' : 'Oculto'}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => abrirEdicao(p)}
                      className="h-9 px-3 rounded-md bg-carvao text-papel text-xs font-semibold"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {editId && draft && (
        <div className="fixed inset-0 z-50 bg-carvao/60 grid place-items-center p-4">
          <div className="bg-azulejo rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-auto">
            <div className="p-5 border-b border-sebo flex items-center gap-3 sticky top-0 bg-azulejo">
              <div className="font-display font-extrabold uppercase">Editar produto</div>
              <button className="ml-auto" onClick={() => { setEditId(null); setDraft(null); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block col-span-2">
                  <span className="text-xs text-carvao/70">Nome</span>
                  <input value={draft.nome} onChange={(e) => setDraft({ ...draft, nome: e.target.value })} className="mt-1 w-full h-11 rounded-md border border-sebo px-3" />
                </label>
                <label className="block">
                  <span className="text-xs text-carvao/70">Categoria</span>
                  <select
                    value={draft.categoria}
                    onChange={(e) => {
                      const cat = e.target.value as Produto['categoria'];
                      setDraft({ ...draft, categoria: cat, percentualCashback: CASHBACK_POR_CATEGORIA[cat] });
                    }}
                    className="mt-1 w-full h-11 rounded-md border border-sebo px-3"
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
                    className="mt-1 w-full h-11 rounded-md border border-sebo px-3"
                  >
                    <option value="kg">Quilo (kg)</option>
                    <option value="peca">Peça</option>
                    <option value="bandeja">Bandeja</option>
                    <option value="unidade">Unidade</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-carvao/70">Preço por kg (R$)</span>
                  <input type="number" step="0.10" value={draft.precoKg} onChange={(e) => setDraft({ ...draft, precoKg: Number(e.target.value) })} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
                </label>
                <label className="block">
                  <span className="text-xs text-carvao/70">% Cashback</span>
                  <input type="number" step="0.1" value={(draft.percentualCashback * 100).toFixed(1)} onChange={(e) => setDraft({ ...draft, percentualCashback: Number(e.target.value) / 100 })} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
                </label>
                <label className="block col-span-2">
                  <span className="text-xs text-carvao/70">Descrição</span>
                  <textarea
                    value={draft.descricao}
                    onChange={(e) => setDraft({ ...draft, descricao: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-md border border-sebo px-3 py-2"
                  />
                </label>
                <label className="block col-span-2">
                  <span className="text-xs text-carvao/70">URL da imagem</span>
                  <input value={draft.imagem} onChange={(e) => setDraft({ ...draft, imagem: e.target.value })} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 text-xs" />
                </label>
                <label className="block">
                  <span className="text-xs text-carvao/70">Peso médio da peça (kg)</span>
                  <input type="number" step="0.10" value={draft.pesoMedioPeca ?? 0} onChange={(e) => setDraft({ ...draft, pesoMedioPeca: Number(e.target.value) || undefined })} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
                </label>
                <label className="flex items-center gap-2 text-sm mt-6">
                  <input type="checkbox" checked={draft.disponivel} onChange={(e) => setDraft({ ...draft, disponivel: e.target.checked })} className="w-4 h-4" />
                  Disponível na loja
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={draft.destaque} onChange={(e) => setDraft({ ...draft, destaque: e.target.checked })} className="w-4 h-4" />
                  Marcar como destaque
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-sebo flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setEditId(null); setDraft(null); }}>Cancelar</Button>
              <Button onClick={salvar}><Save className="w-4 h-4 mr-1" /> Salvar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
