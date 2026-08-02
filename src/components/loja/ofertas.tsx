'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl } from '@/lib/formato';
import { Clock, Zap } from 'lucide-react';
import type { Oferta } from '@/lib/types';
import { ImagemProduto } from '@/components/ui/imagem-produto';
import { ofertaVigenteHoje } from '@/lib/regras';

// Flag client-only: durante o SSR, retorna null (mesmo que no client
// antes do primeiro render). Hidratacao sempre bate. Apos o mount, o
// useEffect muda pra true e o conteudo real aparece.
function useClientOnly() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

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
  // Durante o SSR, nao renderiza nada. Apos o mount do client,
  // o filtro por Date.now() roda e a oferta aparece. Isso evita
  // mismatch de hydration: server e client concordam em "nao tem
  // nada" no primeiro render.
  const mounted = useClientOnly();
  const ofertas = useStore((s) => s.ofertas);
  const produtos = useStore((s) => s.produtos);
  if (!mounted) return null;
  const oferta = ofertas.find(
    (o) => o.tipo === 'relampago' && o.ativa && ofertaVigenteHoje(o, new Date()),
  );
  if (!oferta) return null;
  const produto = produtos.find((p) => p.id === oferta.produtoId);
  if (!produto) return null;
  const restante = useContagemRegressiva(oferta.fimEm);
  const acabou =
    oferta.quantidadeTotalKg !== undefined &&
    oferta.quantidadeVendidaKg >= oferta.quantidadeTotalKg;
  const total = oferta.quantidadeTotalKg ?? 0;
  const pct = total ? Math.min(100, (oferta.quantidadeVendidaKg / total) * 100) : 0;
  // Quando acaba, o preço "de" reaparece e o "por" some — combina com
  // o que `cotarPedido` faz no carrinho (cai pro preço cheio).
  return (
    <section
      className={`rounded-xl p-4 my-4 ${acabou ? 'bg-sebo text-preto' : 'bg-amarelo text-preto'}`}
    >
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
          <ImagemProduto src={produto.imagem} alt={produto.nome} className="w-16 h-16 rounded-md object-cover shrink-0" />
          <div className="flex-1">
            <div className="font-display font-bold uppercase">{produto.nome}</div>
            <div className="text-sm">{oferta.chamada}</div>
          </div>
          <div className="text-right">
            <div className="font-mono line-through text-preto/60 text-sm">{brl(oferta.precoDe)}</div>
            <div className="font-mono font-extrabold text-2xl">
              {acabou ? brl(produto.precoKg) : brl(oferta.precoPor)}
            </div>
          </div>
        </div>
      </Link>
      {total > 0 && (
        <div className="mt-3">
          <div className="h-2 rounded-full bg-preto/20 overflow-hidden">
            <div
              className={acabou ? 'h-full bg-carvao' : 'h-full bg-preto'}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-xs mt-1 font-mono">
            {acabou
              ? `Esgotado · ${oferta.quantidadeVendidaKg.toFixed(0)} kg vendidos`
              : `já saíram ${oferta.quantidadeVendidaKg.toFixed(0)} kg dos ${total} kg`}
          </div>
        </div>
      )}
    </section>
  );
}

export function OfertasSemana() {
  const mounted = useClientOnly();
  const ofertas = useStore((s) => s.ofertas);
  const produtos = useStore((s) => s.produtos);
  const cliente = useStore((s) => s.clientes.find((c) => c.id === s.clienteAtualId));
  if (!mounted) return null;
  const agora = new Date();
  const isOuro = cliente && cliente.pontosAcumuladoTotal >= 4000;

  const semRelampago = ofertas.filter(
    (o) => o.tipo === 'semana' && o.ativa && ofertaVigenteHoje(o, agora),
  );
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
      <div className="font-display font-extrabold uppercase text-xl tracking-tight mb-2">Ofertas da semana</div>
      <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 snap-x snap-mandatory [overflow-scrolling:touch]">
        {visiveis.map((o) => {
          const p = produtos.find((x) => x.id === o.produtoId);
          if (!p) return null;
          return (
            <Link
              key={o.id}
              href={`/loja/produto/${p.slug}`}
              className="snap-start shrink-0 basis-[44vw] max-w-[180px] sm:basis-56 sm:max-w-none rounded-xl bg-branco border border-cinza-claro overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-cinza-claro">
                <ImagemProduto src={p.imagem} alt={p.nome} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="font-display font-bold uppercase text-sm">{p.nome}</div>
                  {isOuro && (
                    <span className="bg-amarelo text-preto text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Antecipado Ouro
                    </span>
                  )}
                </div>
                <div className="text-xs text-preto/70 mt-1">{o.chamada}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono line-through text-preto/50 text-sm">{brl(o.precoDe)}</span>
                  <span className="font-mono font-extrabold text-xl text-vermelho">{brl(o.precoPor)}</span>
                  <span className="text-xs text-preto/60">/kg</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
