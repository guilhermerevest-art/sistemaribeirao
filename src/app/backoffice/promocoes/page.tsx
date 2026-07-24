'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarHora } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { Home, Plus, Trash2, X, Save, Power, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { Oferta } from '@/lib/types';

function inicioDeHojeISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function daquiSeteDiasISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}
function daquiUmDiaISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

export default function BackofficePromocoesPage() {
  const ofertas = useStore((s) => s.ofertas);
  const produtos = useStore((s) => s.produtos);
  const criar = useStore((s) => s.criarOferta);
  const atualizar = useStore((s) => s.atualizarOferta);
  const desativar = useStore((s) => s.desativarOferta);

  const [modal, setModal] = useState<{ tipo: 'criar' | 'editar'; oferta?: Oferta } | null>(null);

  return (
    <div className="min-h-screen bg-papel">
      <header className="bg-carvao text-papel p-4 sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <Link href="/backoffice" className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            <div className="font-display font-extrabold text-xl uppercase">Backoffice · Promoções</div>
          </Link>
          <div className="ml-auto">
            <Button onClick={() => setModal({ tipo: 'criar' })}>
              <Plus className="w-4 h-4 mr-1" /> Nova promoção
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 space-y-4">
        <section className="bg-azulejo border border-sebo rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sebo-claro text-carvao/70 text-xs uppercase">
              <tr>
                <th className="text-left p-3">Tipo</th>
                <th className="text-left p-3">Produto</th>
                <th className="text-left p-3">Chamada</th>
                <th className="text-right p-3">Preço</th>
                <th className="text-left p-3">Vigência</th>
                <th className="text-right p-3">Vendidos</th>
                <th className="text-center p-3">Ativa</th>
                <th className="text-right p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map((o) => {
                const p = produtos.find((x) => x.id === o.produtoId);
                const total = o.quantidadeTotalKg;
                return (
                  <tr key={o.id} className="border-t border-sebo">
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${o.tipo === 'relampago' ? 'bg-brasa text-papel' : 'bg-carvao text-papel'}`}>
                        {o.tipo === 'relampago' ? 'RELÂMPAGO' : 'SEMANA'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">{p?.nome}</td>
                    <td className="p-3 text-carvao/70">{o.chamada}</td>
                    <td className="p-3 text-right font-mono">
                      <span className="line-through text-carvao/40 text-xs mr-1">{brl(o.precoDe)}</span>
                      <span className="font-bold text-brasa">{brl(o.precoPor)}</span>
                    </td>
                    <td className="p-3 text-xs">
                      {formatarData(o.inicioEm)} {formatarHora(o.inicioEm).slice(0, 5)}
                      <br />
                      <span className="text-carvao/60">até {formatarData(o.fimEm)}</span>
                    </td>
                    <td className="p-3 text-right font-mono text-xs">
                      {o.quantidadeVendidaKg.toFixed(1)} kg
                      {total && <div className="text-carvao/50">de {total} kg</div>}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block w-3 h-3 rounded-full ${o.ativa ? 'bg-verde-fiel' : 'bg-sebo'}`} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setModal({ tipo: 'editar', oferta: o })}
                          className="h-9 w-9 grid place-items-center rounded-md bg-sebo-claro text-carvao"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {o.ativa && (
                          <button
                            onClick={() => { desativar(o.id); toast.success('Promoção desativada'); }}
                            className="h-9 w-9 grid place-items-center rounded-md bg-sebo-claro text-carvao"
                            title="Desativar"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {ofertas.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-carvao/60">Nenhuma promoção cadastrada.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {modal && (
        <ModalPromocao
          oferta={modal.oferta}
          onClose={() => setModal(null)}
          onSalvar={(dados) => {
            if (modal.tipo === 'criar') {
              criar({
                id: `o-${Date.now()}`,
                ...dados,
                quantidadeVendidaKg: 0,
                ativa: true,
              } as Oferta);
              toast.success('Promoção criada');
            } else if (modal.oferta) {
              atualizar({ ...modal.oferta, ...dados });
              toast.success('Promoção atualizada');
            }
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

function ModalPromocao({
  oferta,
  onClose,
  onSalvar,
}: {
  oferta?: Oferta;
  onClose: () => void;
  onSalvar: (dados: Omit<Oferta, 'id' | 'quantidadeVendidaKg' | 'ativa'>) => void;
}) {
  const produtos = useStore((s) => s.produtos);
  const [tipo, setTipo] = useState<'semana' | 'relampago'>(oferta?.tipo ?? 'semana');
  const [produtoId, setProdutoId] = useState(oferta?.produtoId ?? '');
  const [precoDe, setPrecoDe] = useState(oferta?.precoDe ?? 0);
  const [precoPor, setPrecoPor] = useState(oferta?.precoPor ?? 0);
  const [inicioEm, setInicioEm] = useState(oferta?.inicioEm ?? inicioDeHojeISO());
  const [fimEm, setFimEm] = useState(oferta?.fimEm ?? (tipo === 'semana' ? daquiSeteDiasISO() : daquiUmDiaISO()));
  const [limitePorCliente, setLimitePorCliente] = useState(oferta?.limitePorCliente ?? 2);
  const [quantidadeTotalKg, setQuantidadeTotalKg] = useState(oferta?.quantidadeTotalKg ?? 20);
  const [chamada, setChamada] = useState(oferta?.chamada ?? '');

  const produto = produtos.find((p) => p.id === produtoId);

  return (
    <div className="fixed inset-0 z-50 bg-carvao/60 grid place-items-center p-4">
      <div className="bg-azulejo rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-auto">
        <div className="p-5 border-b border-sebo flex items-center gap-3 sticky top-0 bg-azulejo">
          <div className="font-display font-extrabold uppercase">{oferta ? 'Editar promoção' : 'Nova promoção'}</div>
          <button className="ml-auto" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-carvao/70">Tipo</span>
              <select value={tipo} onChange={(e) => {
                const t = e.target.value as 'semana' | 'relampago';
                setTipo(t);
                setFimEm(t === 'semana' ? daquiSeteDiasISO() : daquiUmDiaISO());
              }} className="mt-1 w-full h-11 rounded-md border border-sebo px-3">
                <option value="semana">Semana</option>
                <option value="relampago">Relâmpago</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Produto</span>
              <select value={produtoId} onChange={(e) => {
                setProdutoId(e.target.value);
                const p = produtos.find((x) => x.id === e.target.value);
                if (p) {
                  setPrecoDe(p.precoKg);
                  if (!precoPor) setPrecoPor(p.precoKg);
                }
              }} className="mt-1 w-full h-11 rounded-md border border-sebo px-3">
                <option value="">Selecione…</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Preço de (R$/kg)</span>
              <input type="number" step="0.10" value={precoDe} onChange={(e) => setPrecoDe(Number(e.target.value))} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Preço por (R$/kg)</span>
              <input type="number" step="0.10" value={precoPor} onChange={(e) => setPrecoPor(Number(e.target.value))} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Início</span>
              <input type="datetime-local" value={toInputDateTime(inicioEm)} onChange={(e) => setInicioEm(new Date(e.target.value).toISOString())} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Fim</span>
              <input type="datetime-local" value={toInputDateTime(fimEm)} onChange={(e) => setFimEm(new Date(e.target.value).toISOString())} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
            </label>
            {tipo === 'semana' ? (
              <label className="block">
                <span className="text-xs text-carvao/70">Limite por cliente (kg)</span>
                <input type="number" step="0.5" value={limitePorCliente} onChange={(e) => setLimitePorCliente(Number(e.target.value))} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
              </label>
            ) : (
              <label className="block">
                <span className="text-xs text-carvao/70">Quantidade total (kg)</span>
                <input type="number" step="1" value={quantidadeTotalKg} onChange={(e) => setQuantidadeTotalKg(Number(e.target.value))} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
              </label>
            )}
            <label className="block col-span-2">
              <span className="text-xs text-carvao/70">Chamada</span>
              <input value={chamada} onChange={(e) => setChamada(e.target.value)} placeholder="Ex: Só hoje até acabar" className="mt-1 w-full h-11 rounded-md border border-sebo px-3" />
            </label>
          </div>

          {produto && precoPor > 0 && (
            <div className="border border-sebo rounded-md p-3 bg-sebo-claro text-sm">
              <div className="text-xs text-carvao/70 mb-2">Pré-visualização na loja</div>
              <div className="flex items-center gap-3">
                <img src={produto.imagem} alt="" className="w-14 h-14 rounded-md object-cover" />
                <div className="flex-1">
                  <div className="font-display font-bold uppercase text-sm">{produto.nome}</div>
                  <div className="text-xs text-carvao/60">{chamada || 'Oferta especial'}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono line-through text-carvao/50 text-xs">{brl(precoDe)}</div>
                  <div className="font-mono font-extrabold text-lg text-brasa">{brl(precoPor)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-sebo flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => {
              if (!produtoId || !precoDe || !precoPor) { toast.error('Preencha produto, preço de e preço por'); return; }
              onSalvar({
                tipo,
                produtoId,
                precoDe,
                precoPor,
                inicioEm,
                fimEm,
                limitePorCliente: tipo === 'semana' ? limitePorCliente : undefined,
                quantidadeTotalKg: tipo === 'relampago' ? quantidadeTotalKg : undefined,
                chamada: chamada || (tipo === 'relampago' ? 'Só hoje até acabar' : 'Oferta da semana'),
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

function toInputDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
