'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { HeaderLoja } from '@/components/loja/header';
import { useNoIndex } from '@/components/ui/use-no-index';
import {
  filtrarReceitas,
  PROTEINAS_OPCOES,
  OCASIOES_OPCOES,
  type ProteinaReceita,
  type OcasiãoReceita,
} from '@/lib/receitas';
import { Search, ChefHat, Clock, ArrowRight } from 'lucide-react';

export default function ReceitasClient() {
  useNoIndex();
  const [texto, setTexto] = useState('');
  const [proteina, setProteina] = useState<ProteinaReceita | 'todas'>('todas');
  const [ocasiao, setOcasiao] = useState<OcasiãoReceita | 'todas'>('todas');

  const receitas = useMemo(
    () => filtrarReceitas({ texto, proteina, ocasiao }),
    [texto, proteina, ocasiao],
  );

  return (
    <>
      <HeaderLoja />
      <main className="mx-auto max-w-5xl px-4 pb-32">
        <Link
          href="/loja"
          className="inline-flex items-center gap-1 text-sm text-preto/60 hover:text-preto mt-3"
        >
          ← voltar pra vitrine
        </Link>

        {/* Hero */}
        <section className="mt-3 rounded-2xl bg-preto text-branco p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-vermelho/30 rounded-full blur-3xl" aria-hidden />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-branco/10 px-3 py-1 text-xs uppercase tracking-wider font-semibold">
              <ChefHat className="w-3.5 h-3.5 text-amarelo" />
              Receitas com lista de compra
            </div>
            <h1 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight leading-tight">
              Me diz o que você quer comer.
            </h1>
            <p className="mt-2 text-branco/80 text-sm sm:text-base">
              Escolha a proteína e a ocasião. Eu monto a lista do que você
              precisa e adiciono tudo no carrinho em 1 clique.
            </p>
          </div>
        </section>

        {/* Filtros */}
        <section className="mt-4 bg-branco border border-cinza-claro rounded-2xl p-4 space-y-4">
          <div>
            <label className="block">
              <span className="text-xs text-preto/60 uppercase tracking-wider font-semibold">
                Buscar
              </span>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-preto/40" />
                <input
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Estrogonofe, costelinha, calabresa..."
                  className="w-full h-11 pl-9 pr-3 rounded-md border border-cinza-claro text-sm"
                />
              </div>
            </label>
          </div>

          <div>
            <span className="text-xs text-preto/60 uppercase tracking-wider font-semibold">
              Proteína
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROTEINAS_OPCOES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProteina(p.id)}
                  className={`h-9 px-3 rounded-full text-sm font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                    proteina === p.id
                      ? 'bg-vermelho text-branco border-vermelho'
                      : 'bg-branco text-preto border-cinza-claro hover:border-preto'
                  }`}
                >
                  <span>{p.emoji}</span> {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs text-preto/60 uppercase tracking-wider font-semibold">
              Ocasião
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {OCASIOES_OPCOES.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOcasiao(o.id)}
                  className={`h-9 px-3 rounded-full text-xs font-semibold border transition-colors ${
                    ocasiao === o.id
                      ? 'bg-preto text-branco border-preto'
                      : 'bg-branco text-preto/70 border-cinza-claro hover:border-preto'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Lista */}
        <section className="mt-4">
          <div className="text-xs text-preto/60 mb-2">
            {receitas.length === 0
              ? 'Nenhuma receita com esses filtros.'
              : `${receitas.length} receita${receitas.length === 1 ? '' : 's'}`}
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {receitas.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/loja/receitas/${r.slug}`}
                  className="block bg-branco border border-cinza-claro rounded-2xl overflow-hidden hover:border-vermelho hover:shadow-md transition-all"
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-vermelho/15 to-amarelo/15 grid place-items-center text-6xl">
                    {r.emoji}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-vermelho">
                        {r.proteina}
                      </span>
                      <span className="text-[10px] text-preto/50">·</span>
                      <span className="text-[10px] uppercase tracking-wider text-preto/60 font-semibold">
                        {r.ocasiao}
                      </span>
                    </div>
                    <div className="font-display font-bold uppercase text-base leading-tight">
                      {r.nome}
                    </div>
                    <div className="text-xs text-preto/70 mt-1 line-clamp-2">
                      {r.descricaoCurta}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-preto/60">
                      <Clock className="w-3 h-3" />
                      <span>{r.tempoTotalMin} min</span>
                      <span>·</span>
                      <span>{r.porcoesBase} porções</span>
                      <span className="ml-auto inline-flex items-center gap-1 text-vermelho font-semibold group">
                        Ver <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {receitas.length === 0 && (
            <div className="text-center py-16 text-sm text-preto/60">
              Tente outro filtro — a cozinha tá em obras.
            </div>
          )}
        </section>
      </main>
    </>
  );
}
