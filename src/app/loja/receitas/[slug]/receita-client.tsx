'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { useNoIndex } from '@/components/ui/use-no-index';
import { calcularCompraReceita, type Receita } from '@/lib/receitas';
import { brl } from '@/lib/formato';
import { toast } from 'sonner';
import {
  Clock,
  Users,
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
  ChefHat,
  CheckCircle2,
  Circle,
} from 'lucide-react';

const JSONLD_TYPE = 'application/ld+json';

export default function ReceitaClient({ receita }: { receita: Receita }) {
  useNoIndex();
  const router = useRouter();
  const adicionarAoCarrinho = useStore((s) => s.adicionarAoCarrinho);
  const produtos = useStore((s) => s.produtos);
  const [pessoas, setPessoas] = useState(receita.porcoesBase);
  const [passoAtual, setPassoAtual] = useState(0);

  const compra = useMemo(
    () => calcularCompraReceita({ receita, pessoas }),
    [receita, pessoas],
  );

  const itensAçougue = compra.itens.filter((i) => !i.despensa);
  const itensDespensa = compra.itens.filter((i) => i.despensa);

  const adicionarTudo = () => {
    const map = new Map(produtos.map((p) => [p.id, p]));
    let adicionados = 0;
    let ignorados = 0;
    for (const it of itensAçougue) {
      if (!it.produtoId) continue;
      const p = map.get(it.produtoId);
      if (!p) {
        ignorados++;
        continue;
      }
      adicionarAoCarrinho({
        produtoId: p.id,
        pesoKg: it.quantidade,
        preparos: [],
        precoUnitarioAplicado: p.precoKg,
        subtotal: Math.round(it.quantidade * p.precoKg * 100) / 100,
      });
      adicionados++;
    }
    if (adicionados === 0) {
      toast.error('Nada do açougue pra adicionar (só itens de despensa).');
      return;
    }
    const extras = itensDespensa.length > 0
      ? ` (${itensDespensa.length} itens de despensa não vendidos aqui)`
      : '';
    toast.success(`${adicionados} itens do açougue adicionados!${extras}`, {
      duration: 6000,
    });
    router.push('/loja/carrinho');
  };

  return (
    <>
      <HeaderLoja />
      <main className="mx-auto max-w-3xl px-4 pb-40">
        <Link
          href="/loja/receitas"
          className="inline-flex items-center gap-1 text-sm text-preto/60 hover:text-preto mt-3"
        >
          ← todas as receitas
        </Link>

        {/* Hero */}
        <section className="mt-3 rounded-2xl bg-gradient-to-br from-vermelho/15 to-amarelo/15 border border-sebo overflow-hidden">
          <div className="aspect-[16/9] grid place-items-center text-7xl sm:text-8xl">
            {receita.emoji}
          </div>
          <div className="p-4 sm:p-5 bg-branco">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-vermelho/10 text-vermelho uppercase tracking-wider font-bold">
                {receita.proteina}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-preto/5 text-preto/70 uppercase tracking-wider font-semibold">
                {receita.ocasiao}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amarelo/30 text-preto uppercase tracking-wider font-semibold">
                {receita.dificuldade}
              </span>
            </div>
            <h1 className="mt-2 font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight leading-tight">
              {receita.nome}
            </h1>
            <p className="mt-2 text-preto/70 text-sm sm:text-base">
              {receita.descricaoCurta}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-preto/60">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {receita.tempoTotalMin} min
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Users className="w-3 h-3" /> {receita.porcoesBase} porções base
              </span>
            </div>
          </div>
        </section>

        {/* Porções */}
        <section className="mt-4 bg-branco border border-cinza-claro rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-vermelho" />
            <span className="font-display font-bold uppercase text-sm">
              Quantas pessoas vão comer?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPessoas(Math.max(1, pessoas - 1))}
              disabled={pessoas <= 1}
              className="w-10 h-10 rounded-md border border-cinza-claro grid place-items-center hover:border-preto disabled:opacity-30"
              aria-label="Diminuir porções"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-mono font-extrabold text-2xl tabular-nums w-10 text-center">
              {pessoas}
            </span>
            <button
              onClick={() => setPessoas(Math.min(20, pessoas + 1))}
              disabled={pessoas >= 20}
              className="w-10 h-10 rounded-md border border-cinza-claro grid place-items-center hover:border-preto disabled:opacity-30"
              aria-label="Aumentar porções"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="ml-auto text-xs text-preto/60">
              Base: {receita.porcoesBase} · Multiplicador: {(pessoas / receita.porcoesBase).toFixed(1)}×
            </div>
          </div>
        </section>

        {/* Lista de compra */}
        <section className="mt-4 bg-branco border border-cinza-claro rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-cinza-claro flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-vermelho" />
              <span className="font-display font-bold uppercase text-sm">
                Lista de compra
              </span>
            </div>
            <div className="font-mono font-extrabold text-lg tabular-nums">
              {brl(compra.total)}
            </div>
          </div>

          {/* Itens do açougue */}
          <div className="border-b border-cinza-claro">
            <div className="px-4 py-2 bg-sebo-claro text-[10px] uppercase tracking-wider font-bold text-preto/60">
              🥩 Do nosso açougue ({itensAçougue.length})
            </div>
            <ul className="divide-y divide-cinza-claro">
              {itensAçougue.map((it, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-xl shrink-0">{it.emoji ?? '🥩'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{it.nome}</div>
                    <div className="text-[11px] text-preto/60">
                      {it.quantidade.toFixed(1).replace('.', ',')} kg
                      {it.nota && ` · ${it.nota}`}
                    </div>
                  </div>
                  <div className="font-mono font-bold tabular-nums text-sm shrink-0">
                    {brl(it.preco)}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Itens de despensa */}
          {itensDespensa.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-cinza-claro text-[10px] uppercase tracking-wider font-bold text-preto/60">
                🏠 Você tem em casa ({itensDespensa.length})
              </div>
              <ul className="divide-y divide-cinza-claro">
                {itensDespensa.map((it, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 px-4 py-2 bg-cinza-claro/40"
                  >
                    <span className="text-lg shrink-0">{it.emoji ?? '🛒'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-preto/70">
                        {it.nome}
                      </div>
                      <div className="text-[10px] text-preto/50">
                        Não vendemos aqui · {it.nota}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Modo de preparo */}
        <section className="mt-4 bg-branco border border-cinza-claro rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ChefHat className="w-4 h-4 text-vermelho" />
            <span className="font-display font-bold uppercase text-sm">
              Modo de preparo
            </span>
            <span className="ml-auto text-xs text-preto/60">
              ~{receita.tempoTotalMin} min
            </span>
          </div>
          <ol className="space-y-2">
            {receita.passos.map((p, i) => {
              const ativo = i === passoAtual;
              const feito = i < passoAtual;
              return (
                <li
                  key={p.numero}
                  onClick={() => setPassoAtual(i)}
                  className={`flex items-start gap-3 rounded-lg p-2.5 cursor-pointer transition-colors ${
                    ativo
                      ? 'bg-vermelho/5 border border-vermelho'
                      : 'bg-cinza-claro/40 hover:bg-cinza-claro'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {feito ? (
                      <CheckCircle2 className="w-5 h-5 text-verde-fiel" />
                    ) : (
                      <Circle className={`w-5 h-5 ${ativo ? 'text-vermelho' : 'text-preto/40'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">
                      {p.numero}. {p.texto}
                    </div>
                    {p.duracaoMin && (
                      <div className="text-[10px] text-preto/50 mt-0.5">
                        ~{p.duracaoMin} min
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setPassoAtual(Math.max(0, passoAtual - 1))}
              disabled={passoAtual === 0}
              className="h-9 px-3 rounded-md bg-cinza-claro text-sm font-semibold disabled:opacity-40 hover:bg-sebo"
            >
              ← Anterior
            </button>
            <div className="text-xs text-preto/60">
              {passoAtual + 1} de {receita.passos.length}
            </div>
            <button
              onClick={() =>
                setPassoAtual(Math.min(receita.passos.length - 1, passoAtual + 1))
              }
              disabled={passoAtual === receita.passos.length - 1}
              className="h-9 px-3 rounded-md bg-preto text-branco text-sm font-semibold disabled:opacity-40 hover:bg-carvao"
            >
              Próximo →
            </button>
          </div>
        </section>

        {/* JSON-LD Recipe */}
        <script
          type={JSONLD_TYPE}
          // Marca o JSON com escape pra não quebrar o hydration.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Recipe',
              name: receita.nome,
              description: receita.descricaoCurta,
              recipeYield: `${receita.porcoesBase} porções`,
              totalTime: `PT${receita.tempoTotalMin}M`,
              recipeIngredient: compra.itens.map((i) => `${i.quantidade} ${i.unidade} ${i.nome}`),
              recipeCategory: receita.proteina,
            }).replace(/</g, '\\u003c'),
          }}
        />

        {/* Footer fixo */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-branco border-t border-cinza-claro p-3">
          <div className="mx-auto max-w-3xl">
            <button
              onClick={adicionarTudo}
              className="w-full h-14 rounded-lg bg-amarelo text-preto font-extrabold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-amarelo/90 active:translate-y-px"
            >
              <ShoppingCart className="w-5 h-5" />
              Adicionar {itensAçougue.length} itens · {brl(compra.total)}
              <ArrowRight className="w-4 h-4" />
            </button>
            {itensDespensa.length > 0 && (
              <div className="mt-1 text-center text-[10px] text-preto/60">
                + {itensDespensa.length} {itensDespensa.length === 1 ? 'item de despensa' : 'itens de despensa'} que você compra no mercado
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
