'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl } from '@/lib/formato';
import { Clock, Zap } from 'lucide-react';
import type { Oferta } from '@/lib/types';

function useContagemRegressiva(fim: string) {
  const [restante, setRestante] = useState<number>(0);
  useEffect(() => {
    const tick = () => {
      const ms = new Date(fim).getTime() - Date.now();
      setRestante(Math.max(0, ms));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [fim]);
  return restante;
}

function formatHMS(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function OfertaRelampago() {
  const ofertas = useStore((s) => s.ofertas);
  const produtos = useStore((s) => s.produtos);
  const oferta = ofertas.find((o) => o.tipo === 'relampago' && o.ativa && o.fimEm > new Date().toISOString() && new Date(o.inicioEm) <= new Date());
  if (!oferta) return null;
  const produto = produtos.find((p) => p.id === oferta.produtoId);
  if (!produto) return null;
  const restante = useContagemRegressiva(oferta.fimEm);
  const acabou = oferta.quantidadeTotalKg !== undefined && oferta.quantidadeVendidaKg >= oferta.quantidadeTotalKg;
  const pct = oferta.quantidadeTotalKg ? Math.min(100, (oferta.quantidadeVendidaKg / oferta.quantidadeTotalKg) * 100) : 0;
  return (
    <section className="rounded-xl bg-brasa text-papel p-4 my-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5" />
        <div className="font-display font-extrabold uppercase text-lg">Oferta relâmpago</div>
        <div className="ml-auto inline-flex items-center gap-1 font-mono font-bold text-xl tabular-nums">
          <Clock className="w-4 h-4" />
          {acabou ? 'Acabou' : formatHMS(restante)}
        </div>
      </div>
      <Link href={`/loja/produto/${produto.slug}`} className="block mt-2">
        <div className="flex items-center gap-3">
          {produto.imagem && (
            <img src={produto.imagem} alt={produto.nome} className="w-16 h-16 rounded-md object-cover" />
          )}
          <div className="flex-1">
            <div className="font-display font-bold uppercase">{produto.nome}</div>
            <div className="text-sm">{oferta.chamada}</div>
          </div>
          <div className="text-right">
            <div className="font-mono line-through text-papel/70 text-sm">{brl(oferta.precoDe)}</div>
            <div className="font-mono font-extrabold text-2xl">{brl(oferta.precoPor)}</div>
          </div>
        </div>
      </Link>
      {oferta.quantidadeTotalKg && (
        <div className="mt-3">
          <div className="h-2 rounded-full bg-papel/30 overflow-hidden">
            <div className="h-full bg-papel" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-xs mt-1 font-mono">
            já saíram {oferta.quantidadeVendidaKg.toFixed(0)} kg dos {oferta.quantidadeTotalKg} kg
          </div>
        </div>
      )}
    </section>
  );
}

export function OfertasSemana() {
  const ofertas = useStore((s) => s.ofertas);
  const produtos = useStore((s) => s.produtos);
  const cliente = useStore((s) => s.clientes.find((c) => c.id === s.clienteAtualId));
  const agora = new Date();
  const isOuro = cliente && cliente.pontosAcumuladoTotal >= 4000;

  const semRelampago = ofertas.filter((o) => o.tipo === 'semana' && o.ativa && o.fimEm > agora.toISOString());
  const visiveis: Oferta[] = [];
  for (const o of semRelampago) {
    const inicio = new Date(o.inicioEm);
    const diff = agora.getTime() - inicio.getTime();
    if (isOuro) visiveis.push(o);
    else if (diff >= 24 * 3600 * 1000) visiveis.push(o);
  }

  if (visiveis.length === 0) return null;

  return (
    <section className="my-4">
      <div className="font-display font-extrabold uppercase text-lg mb-2">Ofertas da semana</div>
      <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 snap-x">
        {visiveis.map((o) => {
          const p = produtos.find((x) => x.id === o.produtoId);
          if (!p) return null;
          return (
            <Link
              key={o.id}
              href={`/loja/produto/${p.slug}`}
              className="snap-start shrink-0 w-56 rounded-xl bg-azulejo border border-sebo overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-sebo-claro">
                <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="font-display font-bold uppercase text-sm">{p.nome}</div>
                  {isOuro && (
                    <span className="bg-[color:var(--amarelo-novo)] text-papel text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Antecipado Ouro
                    </span>
                  )}
                </div>
                <div className="text-xs text-carvao/70 mt-1">{o.chamada}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono line-through text-carvao/50 text-sm">{brl(o.precoDe)}</span>
                  <span className="font-mono font-extrabold text-xl text-brasa">{brl(o.precoPor)}</span>
                  <span className="text-xs text-carvao/60">/kg</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
