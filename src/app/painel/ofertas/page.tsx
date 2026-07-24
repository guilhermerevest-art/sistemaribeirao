'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { brl, formatarData } from '@/lib/formato';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft } from 'lucide-react';
import type { Oferta } from '@/lib/types';
import Link from 'next/link';

export default function OfertasPage() {
  const ofertas = useStore((s) => s.ofertas);
  const produtos = useStore((s) => s.produtos);
  const criar = useStore((s) => s.criarOferta);
  const desativar = useStore((s) => s.desativarOferta);

  const [tipo, setTipo] = useState<'semana' | 'relampago'>('semana');
  const [produtoId, setProdutoId] = useState<string>('');
  const [precoDe, setPrecoDe] = useState<number>(0);
  const [precoPor, setPrecoPor] = useState<number>(0);
  const [limitePorCliente, setLimitePorCliente] = useState<number>(2);
  const [quantidadeTotalKg, setQuantidadeTotalKg] = useState<number>(20);
  const [chamada, setChamada] = useState<string>('');

  const criarOferta = () => {
    if (!produtoId || !precoDe || !precoPor) {
      alert('Preencha produto, preço de e preço por');
      return;
    }
    const inicio = new Date().toISOString();
    const fim = new Date(Date.now() + 7 * 86400000).toISOString();
    const nova: Oferta = {
      id: `o-${Date.now()}`,
      tipo,
      produtoId,
      precoDe,
      precoPor,
      inicioEm: inicio,
      fimEm: fim,
      limitePorCliente: tipo === 'semana' ? limitePorCliente : undefined,
      quantidadeTotalKg: tipo === 'relampago' ? quantidadeTotalKg : undefined,
      quantidadeVendidaKg: 0,
      chamada: chamada || 'Oferta especial',
      ativa: true,
    };
    criar(nova);
    setProdutoId(''); setPrecoDe(0); setPrecoPor(0); setChamada('');
  };

  return (
    <div className="min-h-screen bg-papel">
      <header className="bg-carvao text-papel p-4 sticky top-0 z-30">
        <div className="mx-auto max-w-4xl flex items-center gap-3">
          <Link href="/painel"><ChevronLeft className="w-5 h-5" /></Link>
          <div className="font-display font-extrabold text-xl uppercase">Ofertas</div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <section className="bg-azulejo border border-sebo rounded-xl p-4">
          <div className="font-display font-bold uppercase text-sm mb-3">Nova oferta</div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-carvao/70">Tipo</span>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as 'semana' | 'relampago')} className="mt-1 w-full h-11 rounded-md border border-sebo px-3">
                <option value="semana">Semana</option>
                <option value="relampago">Relâmpago</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Produto</span>
              <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} className="mt-1 w-full h-11 rounded-md border border-sebo px-3">
                <option value="">Selecione</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Preço de</span>
              <input type="number" step="0.10" value={precoDe} onChange={(e) => setPrecoDe(Number(e.target.value))} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Preço por</span>
              <input type="number" step="0.10" value={precoPor} onChange={(e) => setPrecoPor(Number(e.target.value))} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
            </label>
            {tipo === 'semana' ? (
              <label className="block">
                <span className="text-xs text-carvao/70">Limite por cliente (kg)</span>
                <input type="number" value={limitePorCliente} onChange={(e) => setLimitePorCliente(Number(e.target.value))} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
              </label>
            ) : (
              <label className="block">
                <span className="text-xs text-carvao/70">Quantidade total (kg)</span>
                <input type="number" value={quantidadeTotalKg} onChange={(e) => setQuantidadeTotalKg(Number(e.target.value))} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono" />
              </label>
            )}
            <label className="block col-span-2">
              <span className="text-xs text-carvao/70">Chamada</span>
              <input value={chamada} onChange={(e) => setChamada(e.target.value)} className="mt-1 w-full h-11 rounded-md border border-sebo px-3" />
            </label>
          </div>
          <Button onClick={criarOferta} className="mt-4">Criar oferta</Button>
        </section>

        <section className="bg-azulejo border border-sebo rounded-xl p-4">
          <div className="font-display font-bold uppercase text-sm mb-3">Ativas</div>
          <ul className="space-y-2">
            {ofertas.map((o) => {
              const p = produtos.find((x) => x.id === o.produtoId);
              return (
                <li key={o.id} className="border border-sebo rounded-md p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold uppercase">{p?.nome}</span>
                      <Badge tone={o.tipo === 'relampago' ? 'brasa' : 'carvao'}>{o.tipo}</Badge>
                      {o.ativa ? <Badge tone="verde">Ativa</Badge> : <Badge tone="sebo">Inativa</Badge>}
                    </div>
                    <div className="text-xs text-carvao/70 mt-1">
                      {brl(o.precoDe)} → {brl(o.precoPor)} · {formatarData(o.inicioEm)} → {formatarData(o.fimEm)}
                    </div>
                  </div>
                  {o.ativa && (
                    <Button variant="ghost" size="sm" onClick={() => desativar(o.id)}>Desativar</Button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
