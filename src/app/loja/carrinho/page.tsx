'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { Button } from '@/components/ui/button';
import { useNoIndex } from '@/components/ui/use-no-index';
import { ChevronLeft, Trash2, ChefHat, Minus, Plus } from 'lucide-react';
import { brl } from '@/lib/formato';
import { CASHBACK_POR_CATEGORIA } from '@/lib/types';
import { FRETE_GRATIS_ACIMA_DE, TAXA_ENTREGA, faltaParaFreteGratis, nivelPorPontos } from '@/lib/regras';
import { ImagemProduto } from '@/components/ui/imagem-produto';
import { ItemSwipeable } from '@/components/ui/item-swipeable';
import { BottleWine } from 'lucide-react';

interface Sugestao {
  produtoId: string;
  motivo: string;
}

function sugerirParaItens(categorias: Set<string>): Sugestao[] {
  const out: Sugestao[] = [];
  if (categorias.has('bovino')) {
    out.push({ produtoId: 'p-carvao', motivo: 'Vai bem no churrasco' });
    out.push({ produtoId: 'p-sal-grosso', motivo: 'Combina com o sal grosso' });
    out.push({ produtoId: 'p-linguica-toscana', motivo: 'Linguiça toscana pra acompanhar' });
  }
  if (categorias.has('aves')) {
    out.push({ produtoId: 'p-bacon', motivo: 'Bacon pra envolver' });
    out.push({ produtoId: 'p-linguica-apimentada', motivo: 'Pra rechear a carne' });
    out.push({ produtoId: 'p-almondega', motivo: 'Almôndega também?' });
  }
  if (categorias.has('embutidos')) {
    out.push({ produtoId: 'p-carvao', motivo: 'Carvão pra assar' });
    out.push({ produtoId: 'p-pao-alho', motivo: 'Pão de alho' });
    out.push({ produtoId: 'p-calabresa', motivo: 'Calabresa também?' });
  }
  return out.slice(0, 3);
}

export default function CarrinhoPage() {
  useNoIndex();
  const itens = useStore((s) => s.carrinho.itens);
  const produtos = useStore((s) => s.produtos);
  const combos = useStore((s) => s.combos);
  const ofertas = useStore((s) => s.ofertas);
  const clienteAtual = useStore((s) => s.clientes.find((c) => c.id === s.clienteAtualId));
  const atualizarItem = useStore((s) => s.atualizarItemCarrinho);
  const removerItem = useStore((s) => s.removerItemCarrinho);

  const produtoMap = useMemo(() => new Map(produtos.map((p) => [p.id, p])), [produtos]);
  const comboMap = useMemo(() => new Map(combos.map((c) => [c.id, c])), [combos]);

  const subtotal = itens.reduce((s, i) => s + i.subtotal, 0);
  const categorias = new Set(itens.map((i) => produtoMap.get(i.produtoId)?.categoria).filter(Boolean) as string[]);
  const sugestoes = useMemo(() => {
    const base = sugerirParaItens(categorias);
    const noCarrinho = new Set(itens.map((i) => i.produtoId));
    return base.filter((s) => !noCarrinho.has(s.produtoId));
  }, [categorias, itens]);

  const nivel = clienteAtual ? nivelPorPontos(clienteAtual.pontosAcumuladoTotal) : 'bronze';
  const projecaoCashback = itens.reduce((s, i) => {
    const p = produtoMap.get(i.produtoId);
    if (!p) return s;
    return s + i.subtotal * (CASHBACK_POR_CATEGORIA[p.categoria] + (nivel === 'prata' ? 0.01 : nivel === 'ouro' ? 0.02 : 0));
  }, 0);
  const projecaoPontos = Math.floor(subtotal);

  const atual = (idx: number, novoPeso: number) => {
    const it = itens[idx];
    if (!it) return;
    const novoSubtotal = Math.round(novoPeso * it.precoUnitarioAplicado * 100) / 100;
    atualizarItem(idx, { ...it, pesoKg: novoPeso, subtotal: novoSubtotal });
  };

  const alterarQuantidadeCombo = (idx: number, delta: number) => {
    const it = itens[idx];
    if (!it) return;
    const novaQtd = Math.max(1, it.pesoKg + delta);
    const novoSubtotal = Math.round(novaQtd * it.precoUnitarioAplicado * 100) / 100;
    atualizarItem(idx, { ...it, pesoKg: novaQtd, subtotal: novoSubtotal });
  };

  return (
    <>
      <HeaderLoja />
      <main className="mx-auto max-w-3xl px-4 pb-40">
        <Link href="/loja" className="inline-flex items-center gap-1 text-sm text-preto/60 hover:text-preto mt-3">
          <ChevronLeft className="w-4 h-4" /> continuar comprando
        </Link>

        <h1 className="font-display font-extrabold text-3xl uppercase mt-3 tracking-tight">Seu carrinho</h1>

        {itens.length === 0 ? (
          <div className="mt-8 rounded-xl bg-branco border border-cinza-claro p-8 text-center">
            <div className="text-5xl mb-2">🥩</div>
            <p className="text-preto/70">Seu carrinho está vazio.</p>
            <Button className="mt-4" onClick={() => (window.location.href = '/loja')}>Ver a vitrine</Button>
          </div>
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {itens.map((it, idx) => {
                if (it.comboId) {
                  const c = comboMap.get(it.comboId);
                  if (!c) return null;
                  return (
                    <ItemSwipeable key={idx} onDelete={() => removerItem(idx)}>
                      <li className="bg-branco border border-cinza-claro rounded-xl p-4 flex gap-3">
                        <ImagemProduto src={c.imagem} alt={c.nome} className="w-20 h-20 rounded-md object-cover bg-cinza-claro shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amarelo text-preto font-extrabold uppercase">Combo</span>
                          </div>
                          <div className="font-display font-bold uppercase text-sm leading-tight mt-1">{c.nome}</div>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => alterarQuantidadeCombo(idx, -1)}
                              className="w-8 h-8 rounded-md border border-cinza-claro grid place-items-center hover:border-preto"
                              aria-label="Diminuir"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-sans font-bold w-6 text-center">{it.pesoKg}</span>
                            <button
                              onClick={() => alterarQuantidadeCombo(idx, 1)}
                              className="w-8 h-8 rounded-md border border-cinza-claro grid place-items-center hover:border-preto"
                              aria-label="Aumentar"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-sans font-bold tabular-nums text-lg">{brl(it.subtotal)}</div>
                          <button
                            onClick={() => removerItem(idx)}
                            className="mt-2 text-xs text-preto/60 hover:text-vermelho inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> remover
                          </button>
                        </div>
                      </li>
                    </ItemSwipeable>
                  );
                }

                const p = produtoMap.get(it.produtoId);
                if (!p) return null;
                return (
                  <ItemSwipeable key={idx} onDelete={() => removerItem(idx)}>
                    <li className="bg-branco border border-cinza-claro rounded-xl p-4 flex gap-3">
                      <ImagemProduto src={p.imagem} alt={p.nome} className="w-20 h-20 rounded-md object-cover bg-cinza-claro shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold uppercase text-sm leading-tight">{p.nome}</div>
                        {it.preparos.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {it.preparos.map((pr) => (
                              <span key={pr} className="text-[11px] px-2 py-0.5 rounded-full bg-cinza-claro text-preto">{pr}</span>
                            ))}
                          </div>
                        )}
                        {it.observacao && (
                          <div className="text-xs text-preto/60 mt-1 italic">"{it.observacao}"</div>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <label className="text-xs text-preto/70">Peso</label>
                          <input
                            type="number"
                            step={0.1}
                            min={0.1}
                            max={10}
                            value={it.pesoKg}
                            onChange={(e) => atual(idx, Number(e.target.value))}
                            className="w-20 h-9 rounded-md border border-cinza-claro px-2 font-sans text-sm"
                          />
                          <span className="text-xs text-preto/60">kg</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-sans font-bold tabular-nums text-lg">{brl(it.subtotal)}</div>
                        <button
                          onClick={() => removerItem(idx)}
                          className="mt-2 text-xs text-preto/60 hover:text-vermelho inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> remover
                        </button>
                      </div>
                    </li>
                  </ItemSwipeable>
                );
              })}
            </ul>

            {/* Itens virtuais do planejador (bebidas, carvão). */}
            {itens.filter((i) => i.virtual).length > 0 && (
              <div className="mt-3 rounded-xl bg-sebo-claro border border-sebo p-3 text-xs text-preto/70 flex items-start gap-2">
                <BottleWine className="w-4 h-4 shrink-0 mt-0.5 text-vermelho" />
                <div className="flex-1">
                  <div className="font-semibold text-preto">Estimativas do planejador</div>
                  <ul className="mt-1 space-y-0.5">
                    {itens.filter((i) => i.virtual).map((it, i) => (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span className="truncate">
                          {it.observacao ?? 'Item virtual'}
                        </span>
                        <span className="font-mono tabular-nums shrink-0">
                          {brl(it.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-[10px] text-preto/50 mt-1">
                    Não vai pro cupom impresso — só referência pra você.
                  </div>
                </div>
              </div>
            )}

            {sugestoes.length > 0 && (
              <section className="mt-6">
                <div className="flex items-center gap-2 font-display font-bold uppercase text-base">
                  <ChefHat className="w-4 h-4 text-vermelho" /> Vai bem com isso
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {sugestoes.map((s) => {
                    const p = produtoMap.get(s.produtoId);
                    if (!p) return null;
                    return (
                      <Link
                        key={s.produtoId}
                        href={`/loja/produto/${p.slug}`}
                        className="rounded-lg overflow-hidden bg-branco border border-cinza-claro hover:border-vermelho hover:shadow-md transition-all"
                      >
                        <div className="aspect-square bg-cinza-claro">
                          <ImagemProduto src={p.imagem} alt={p.nome} className="w-full h-full object-cover" />
                        </div>
                        <div className="px-2 py-2">
                          <div className="font-display font-bold text-xs uppercase leading-tight line-clamp-2">{p.nome}</div>
                          <div className="font-sans text-sm font-bold">{brl(p.precoKg)}<span className="text-[10px] text-preto/60">/kg</span></div>
                          <div className="text-[10px] text-vermelho font-semibold mt-0.5">{s.motivo}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            <BannerFreteGratis subtotal={subtotal} />

            <section className="mt-6 bg-vermelho text-branco rounded-xl p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm opacity-90">Subtotal</span>
                <span className="font-mono text-sm">{brl(subtotal)}</span>
              </div>
              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-branco/30">
                <span className="font-display font-bold uppercase">Total</span>
                <span className="font-mono font-bold text-2xl">{brl(subtotal)}</span>
              </div>
              <div className="mt-3 rounded-md bg-branco/15 px-3 py-2 text-sm">
                Este pedido gera <span className="font-mono font-bold">{brl(projecaoCashback)}</span> de cashback e{' '}
                <span className="font-mono font-bold">{projecaoPontos}</span> pontos.
              </div>
            </section>
          </>
        )}
      </main>

      {itens.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-branco border-t border-cinza-claro p-3">
          <div className="mx-auto max-w-3xl flex items-center gap-3">
            <div className="flex-1 text-sm">
              <div className="text-preto/60">Total</div>
              <div className="font-mono font-bold text-2xl">{brl(subtotal)}</div>
            </div>
            <Link
              href="/loja/checkout"
              className="h-14 px-6 rounded-lg bg-amarelo text-preto font-extrabold uppercase tracking-wide flex items-center gap-2 hover:bg-amarelo/90 active:translate-y-px"
            >
              Ir ao checkout
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

// Banner de "frete grátis acima de R\$ X" — aparece em três estados:
// 1) longe da meta: faltam X (mostra barra e valor)
// 2) perto da meta (< R\$ 20): faltam X com badge "Quase lá"
// 3) já bateu a meta: selo verde "✓ Frete grátis liberado"
function BannerFreteGratis({ subtotal }: { subtotal: number }) {
  const falta = faltaParaFreteGratis(subtotal);
  const pct = Math.min(100, Math.round((subtotal / FRETE_GRATIS_ACIMA_DE) * 100));
  if (subtotal === 0) return null;
  if (falta === 0) {
    return (
      <section className="mt-6 rounded-xl border-2 border-verde-fiel bg-verde-fiel/10 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-verde-fiel text-branco grid place-items-center shrink-0">
          ✓
        </div>
        <div>
          <div className="font-display font-bold uppercase text-verde-fiel">Frete grátis liberado</div>
          <div className="text-xs text-preto/70">Escolha <em>entrega</em> no checkout — taxa de {brl(TAXA_ENTREGA)} sai de graça.</div>
        </div>
      </section>
    );
  }
  const quaseLa = falta < 20;
  return (
    <section className={`mt-6 rounded-xl border p-4 ${quaseLa ? 'border-amarelo bg-amarelo/10' : 'border-cinza-claro bg-branco'}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="font-display font-bold uppercase text-sm">
            {quaseLa ? 'Quase lá!' : 'Faltam'}
            <span className="text-vermelho-risco"> {brl(falta)} </span>
            pra <span className="text-amarelo">frete grátis</span>
          </div>
          <div className="text-xs text-preto/60">Entrega sai por {brl(TAXA_ENTREGA)} acima de {brl(FRETE_GRATIS_ACIMA_DE)}.</div>
        </div>
        <div className="font-mono font-bold tabular-nums text-sm text-preto/70">{pct}%</div>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-cinza-claro overflow-hidden">
        <div
          className={`h-full rounded-full ${quaseLa ? 'bg-amarelo' : 'bg-vermelho'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}
