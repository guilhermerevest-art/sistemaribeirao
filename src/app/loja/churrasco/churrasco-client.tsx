'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { Button } from '@/components/ui/button';
import { useNoIndex } from '@/components/ui/use-no-index';
import {
  calcularChurrasco,
  projecaoCashbackChurrasco,
  modoChurrascoAtivo,
  resumoPlanejadorCurto,
  ESTILO_OPCOES,
  PRESETS_RAPIDOS,
  NIVEL_FOME_LABEL,
  mensagemListaWhatsApp,
  type EstiloChurrasco,
  type NivelFome,
} from '@/lib/churrasco';
import { setResumoPlanejador } from '@/lib/planejador-flags';
import { brl } from '@/lib/formato';
import { toast } from 'sonner';
import {
  Beef,
  Users,
  Minus,
  Plus,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  PartyPopper,
  MessageCircle,
  Save,
  Clock,
} from 'lucide-react';

const CHAVE_RASCUNHO = 'ribeirao-churrasco-rascunho-v1';

interface Rascunho {
  adultos: number;
  criancas: number;
  estilo: EstiloChurrasco;
  fome: NivelFome;
  comBebidas: boolean;
}

export default function PlanejadorChurrascoClient() {
  useNoIndex();
  const router = useRouter();
  const adicionarAoCarrinho = useStore((s) => s.adicionarAoCarrinho);
  const produtos = useStore((s) => s.produtos);

  const [adultos, setAdultos] = useState(8);
  const [criancas, setCriancas] = useState(2);
  const [estilo, setEstilo] = useState<EstiloChurrasco>('tradicional');
  const [fome, setFome] = useState<NivelFome>(3);
  const [comBebidas, setComBebidas] = useState(true);
  const [modoRapido, setModoRapido] = useState(true);
  const [modoAtivo, setModoAtivo] = useState(false);

  // Modo visual sexta-dom. Seta após mount (evita hydration mismatch
  // — server renderiza false, client confirma com Date.now).
  useEffect(() => {
    setModoAtivo(modoChurrascoAtivo());
  }, []);

  // Restaura rascunho ao montar.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(CHAVE_RASCUNHO);
      if (!raw) return;
      const r = JSON.parse(raw) as Partial<Rascunho>;
      if (typeof r.adultos === 'number') setAdultos(r.adultos);
      if (typeof r.criancas === 'number') setCriancas(r.criancas);
      if (r.estilo) setEstilo(r.estilo);
      if (r.fome) setFome(r.fome);
      if (typeof r.comBebidas === 'boolean') setComBebidas(r.comBebidas);
      // Se tinha rascunho, desliga o modo rápido.
      setModoRapido(false);
    } catch {
      // silencioso
    }
  }, []);

  // Persiste o rascunho a cada mudança.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (modoRapido) return; // não persiste enquanto escolhe preset
    const r: Rascunho = { adultos, criancas, estilo, fome, comBebidas };
    try {
      window.localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(r));
    } catch {}
  }, [adultos, criancas, estilo, fome, comBebidas, modoRapido]);

  const aplicarPreset = (preset: typeof PRESETS_RAPIDOS[number]) => {
    setAdultos(preset.adultos);
    setCriancas(preset.criancas);
    setEstilo(preset.estilo);
    setComBebidas(preset.comBebidas);
    setFome(3);
    setModoRapido(false);
  };

  const resultado = useMemo(
    () => calcularChurrasco({ adultos, criancas, estilo, fome, comBebidas }),
    [adultos, criancas, estilo, fome, comBebidas],
  );
  const cashbackPrev = useMemo(
    () => projecaoCashbackChurrasco(resultado.itens),
    [resultado],
  );

  const adicionarTudo = () => {
    const produtosMap = new Map(produtos.map((p) => [p.id, p]));
    let adicionados = 0;
    for (const it of resultado.itens) {
      if (!it.produtoId) continue;
      const p = produtosMap.get(it.produtoId);
      if (!p) continue;
      const pesoKg = it.unidade === 'kg' ? it.quantidade : 0;
      if (pesoKg <= 0) continue;
      adicionarAoCarrinho({
        produtoId: p.id,
        pesoKg,
        preparos: [],
        precoUnitarioAplicado: p.precoKg,
        subtotal: Math.round(pesoKg * p.precoKg * 100) / 100,
      });
      adicionados++;
    }
    // Item virtual de bebidas (vai pro carrinho como "estimativa de
    // bebidas", não pro cupom).
    if (comBebidas && resultado.totalBebidas && resultado.totalBebidas > 0) {
      adicionarAoCarrinho({
        produtoId: 'virtual:bebidas',
        pesoKg: 0,
        preparos: [],
        observacao: 'Refrigerante, cerveja e água — estimativa do planejador',
        precoUnitarioAplicado: resultado.totalBebidas,
        subtotal: resultado.totalBebidas,
        virtual: true,
        virtualSlug: 'bebidas',
      });
      adicionados++;
    }
    if (adicionados === 0) {
      toast.error('Nada pra adicionar (sem itens com peso).');
      return;
    }
    // Salva o resumo do planejador — o checkout injeta no
    // observacaoGeral do pedido (e o cupom mostra).
    setResumoPlanejador(
      resumoPlanejadorCurto({
        adultos,
        criancas,
        estilo,
        fome,
        totalCarneKg: resultado.totalCarneKg,
      }),
    );
    toast.success(`${adicionados} itens adicionados ao carrinho!`, {
      description: 'Você pode revisar e ajustar antes de enviar.',
      duration: 5000,
    });
    router.push('/loja/carrinho');
  };

  const compartilharWhatsApp = () => {
    const msg = mensagemListaWhatsApp({
      adultos,
      criancas,
      estilo,
      fome,
      totalCarneKg: resultado.totalCarneKg,
      total: resultado.total,
      itens: resultado.itens,
    });
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const salvarRascunho = () => {
    const r: Rascunho = { adultos, criancas, estilo, fome, comBebidas };
    try {
      window.localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(r));
      toast.success('Rascunho salvo! Aparece automaticamente quando você voltar.');
    } catch {
      toast.error('Não consegui salvar.');
    }
  };

  const totalPessoas = adultos + criancas;

  return (
    <>
      <HeaderLoja />
      <main className="mx-auto max-w-3xl px-4 pb-40">
        <Link
          href="/loja"
          className="inline-flex items-center gap-1 text-sm text-preto/60 hover:text-preto mt-3"
        >
          ← voltar pra vitrine
        </Link>

        {/* Hero */}
        <section
          className={`mt-3 rounded-2xl text-branco p-5 relative overflow-hidden transition-colors ${
            modoAtivo
              ? 'bg-gradient-to-br from-amarelo via-brasa to-preto'
              : 'bg-gradient-to-br from-vermelho via-vermelho to-preto'
          }`}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amarelo/30 rounded-full blur-3xl animate-pulse" aria-hidden />
          <div className="relative">
            {modoAtivo && (
              <div className="inline-flex items-center gap-2 rounded-full bg-branco text-preto px-3 py-1 text-xs uppercase tracking-wider font-extrabold mb-3 animate-pulse">
                <span>🔥</span> Modo churrasco ligado
              </div>
            )}
            <div className="inline-flex items-center gap-2 rounded-full bg-branco/10 px-3 py-1 text-xs uppercase tracking-wider font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amarelo" />
              Planejador de churrasco
            </div>
            <h1 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight leading-tight">
              Sem cálculo, sem erro.
            </h1>
            <p className="mt-2 text-branco/85 text-sm sm:text-base">
              Me diz quantas pessoas vêm. Eu calculo kg, peças e preço.
              Adiciona tudo ao carrinho em 1 clique.
            </p>
          </div>
        </section>

        {/* Modo rápido */}
        {modoRapido && (
          <section className="mt-5 bg-branco border border-cinza-claro rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-vermelho" />
              <span className="font-display font-bold uppercase text-sm">Modo rápido</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-preto/50 font-semibold">
                1 clique
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS_RAPIDOS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => aplicarPreset(p)}
                  className="text-left rounded-xl p-3 border-2 border-cinza-claro bg-branco hover:border-vermelho hover:bg-vermelho/5 transition-colors"
                >
                  <div className="text-2xl">{p.emoji}</div>
                  <div className="font-display font-bold uppercase text-sm mt-1">{p.titulo}</div>
                  <div className="text-[10px] text-preto/60 mt-0.5">
                    {p.estilo}{p.comBebidas ? ' · c/ bebidas' : ''}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setModoRapido(false)}
              className="mt-3 w-full text-xs text-preto/60 hover:text-preto underline underline-offset-4"
            >
              ou personalize tudo (pessoas, fome, estilo, bebidas)
            </button>
          </section>
        )}

        {!modoRapido && (
          <>
            {/* Step 1: pessoas */}
            <section className="mt-5 bg-branco border border-cinza-claro rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-vermelho" />
                <span className="font-display font-bold uppercase text-sm">
                  1. Quantas pessoas vêm?
                </span>
                <button
                  onClick={() => setModoRapido(true)}
                  className="ml-auto text-[10px] uppercase tracking-wider text-preto/50 hover:text-preto underline underline-offset-4"
                >
                  ← modo rápido
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Contador
                  label="Adultos"
                  emoji="🧔"
                  value={adultos}
                  onChange={setAdultos}
                  min={1}
                  max={50}
                />
                <Contador
                  label="Crianças"
                  emoji="🧒"
                  value={criancas}
                  onChange={setCriancas}
                  min={0}
                  max={50}
                />
              </div>
              <div className="mt-3 text-xs text-preto/60 text-center">
                {totalPessoas} {totalPessoas === 1 ? 'pessoa' : 'pessoas'} no total
              </div>
            </section>

            {/* Step 2: fome */}
            <section className="mt-4 bg-branco border border-cinza-claro rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Beef className="w-4 h-4 text-vermelho" />
                <span className="font-display font-bold uppercase text-sm">
                  2. Nível de fome
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const ativo = fome === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setFome(n as NivelFome)}
                      title={NIVEL_FOME_LABEL[n as NivelFome]}
                      className={`flex-1 h-12 rounded-lg font-display font-bold text-lg transition-colors ${
                        ativo
                          ? 'bg-vermelho text-branco'
                          : 'bg-cinza-claro text-preto/60 hover:bg-sebo'
                      }`}
                    >
                      {n === 1 ? '🍽️' : n === 2 ? '🥗' : n === 3 ? '🥩' : n === 4 ? '🍖' : '🔥'}
                      <div className="text-[10px] mt-0.5 font-mono">{n}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-preto/60 text-center">
                {NIVEL_FOME_LABEL[fome]}
              </div>
            </section>

            {/* Step 3: estilo */}
            <section className="mt-4 bg-branco border border-cinza-claro rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Beef className="w-4 h-4 text-vermelho" />
                <span className="font-display font-bold uppercase text-sm">
                  3. Que tipo de churrasco?
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ESTILO_OPCOES.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setEstilo(e.id)}
                    className={`text-left rounded-lg p-3 border-2 transition-colors ${
                      estilo === e.id
                        ? 'border-vermelho bg-vermelho/5'
                        : 'border-cinza-claro bg-branco hover:border-preto'
                    }`}
                  >
                    <div className="text-2xl mb-1">{e.emoji}</div>
                    <div className="font-display font-bold uppercase text-xs leading-tight">
                      {e.titulo}
                    </div>
                    <div className="text-[10px] text-preto/60 mt-1 leading-snug">
                      {e.descricao}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 4: bebidas */}
            <section className="mt-4 bg-branco border border-cinza-claro rounded-2xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={comBebidas}
                  onChange={(e) => setComBebidas(e.target.checked)}
                  className="w-5 h-5 accent-vermelho"
                />
                <div className="flex-1">
                  <div className="font-display font-bold uppercase text-sm">
                    Incluir estimativa de bebidas
                  </div>
                  <div className="text-xs text-preto/60 mt-0.5">
                    Refrigerante, cerveja e água. Estimativa, não entra no carrinho.
                  </div>
                </div>
              </label>
            </section>
          </>
        )}

        {/* Resultado */}
        <section className="mt-5 rounded-2xl bg-branco border-2 border-vermelho overflow-hidden">
          <div className="bg-vermelho text-branco px-4 py-3 flex items-center justify-between">
            <span className="font-display font-extrabold uppercase text-sm">
              Lista do churrasco
            </span>
            <span className="text-xs text-branco/80">
              {resultado.totalCarneKg.toFixed(1)} kg de carne
            </span>
          </div>
          <ul className="divide-y divide-sebo">
            {resultado.itens.map((it, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-xl shrink-0">{it.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{it.nome}</div>
                  <div className="text-[11px] text-preto/60">
                    {formatQuantidade(it.quantidade, it.unidade)}
                    {it.observacao && ` · ${it.observacao}`}
                  </div>
                </div>
                <div className="font-mono font-bold tabular-nums text-sm shrink-0">
                  {brl(it.preco)}
                </div>
              </li>
            ))}
            {resultado.totalBebidas != null && (
              <li className="flex items-center gap-3 px-4 py-2.5 bg-sebo-claro">
                <span className="text-xl shrink-0">🍺</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">Bebidas (estimativa)</div>
                  <div className="text-[11px] text-preto/60">
                    Refrigerante, cerveja, água
                  </div>
                </div>
                <div className="font-mono font-bold tabular-nums text-sm shrink-0 text-preto/70">
                  ~{brl(resultado.totalBebidas)}
                </div>
              </li>
            )}
          </ul>
          <div className="bg-branco border-t border-sebo px-4 py-3 space-y-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-preto/70">Subtotal</span>
              <span className="font-mono tabular-nums">{brl(resultado.subtotal)}</span>
            </div>
            {resultado.totalBebidas != null && (
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-preto/70">+ Bebidas (estimativa)</span>
                <span className="font-mono tabular-nums text-preto/70">
                  {brl(resultado.totalBebidas)}
                </span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-1 border-t border-sebo">
              <span className="font-display font-bold uppercase">Total</span>
              <span className="font-mono font-extrabold text-xl tabular-nums">
                {brl(resultado.total)}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-verde-fiel inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Cashback previsto
              </span>
              <span className="font-mono font-bold text-verde-fiel tabular-nums">
                {brl(cashbackPrev)}
              </span>
            </div>
          </div>
        </section>

        {/* Botões secundários */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={compartilharWhatsApp}
            className="h-11 rounded-md bg-verde-fiel text-branco font-bold uppercase text-xs flex items-center justify-center gap-1.5 hover:bg-verde-fiel/90"
          >
            <MessageCircle className="w-4 h-4" /> Mandar no Zap
          </button>
          <button
            onClick={salvarRascunho}
            className="h-11 rounded-md bg-cinza-claro text-carvao font-bold uppercase text-xs flex items-center justify-center gap-1.5 hover:bg-sebo"
          >
            <Save className="w-4 h-4" /> Salvar rascunho
          </button>
        </div>

        {/* Footer fixo */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-branco border-t border-cinza-claro p-3">
          <div className="mx-auto max-w-3xl">
            <button
              onClick={adicionarTudo}
              className="w-full h-14 rounded-lg bg-amarelo text-preto font-extrabold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-amarelo/90 active:translate-y-px"
            >
              <ShoppingCart className="w-5 h-5" />
              Adicionar ao carrinho · {brl(resultado.total)}
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-preto/50 uppercase tracking-wider">
              <PartyPopper className="w-3 h-3" /> Você pode revisar antes de enviar
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Contador({
  label,
  emoji,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  emoji: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="rounded-lg border border-cinza-claro p-3">
      <div className="flex items-center gap-2 text-xs text-preto/60 uppercase tracking-wider font-semibold">
        <span>{emoji}</span> {label}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-10 h-10 rounded-md border border-cinza-claro grid place-items-center hover:border-preto disabled:opacity-30"
          aria-label={`Diminuir ${label}`}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-mono font-extrabold text-2xl tabular-nums w-10 text-center">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-10 h-10 rounded-md border border-cinza-claro grid place-items-center hover:border-preto disabled:opacity-30"
          aria-label={`Aumentar ${label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function formatQuantidade(q: number, unidade: 'kg' | 'un' | 'sc' | 'L'): string {
  if (unidade === 'kg') return `${q.toFixed(1).replace('.', ',')} kg`;
  if (unidade === 'un') return `${q} unidade${q > 1 ? 's' : ''}`;
  if (unidade === 'sc') return `${q} sc`;
  return `${q.toFixed(1).replace('.', ',')} L`;
}
