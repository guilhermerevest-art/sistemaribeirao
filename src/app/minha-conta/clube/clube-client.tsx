'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { brl, cn } from '@/lib/formato';
import { ChevronLeft, Lock, Check, Sparkles, Calendar, Clock, Gift } from 'lucide-react';
import { LIMITES_NIVEL, type Nivel } from '@/lib/types';
import { nivelPorPontos } from '@/lib/regras';

import { useNoIndex } from '@/components/ui/use-no-index';
const DEGRAUS: Array<{
  id: Nivel;
  nome: string;
  subtitulo: string;
  min: number;
  cor: string;
  corBg: string;
  beneficios: Array<{ icone: React.ReactNode; texto: string }>;
}> = [
  {
    id: 'bronze',
    nome: 'Bronze',
    subtitulo: 'Começa aqui',
    min: 0,
    cor: 'text-[color:var(--amarelo-novo)]',
    corBg: 'bg-[color:var(--amarelo-novo)]/10 border-[color:var(--amarelo-novo)]',
    beneficios: [
      { icone: <Sparkles className="w-4 h-4" />, texto: 'Cashback padrão por categoria' },
      { icone: <Gift className="w-4 h-4" />, texto: 'Acesso ao catálogo de resgates' },
    ],
  },
  {
    id: 'prata',
    nome: 'Prata',
    subtitulo: '1.500 pts',
    min: LIMITES_NIVEL.prata,
    cor: 'text-carvao',
    corBg: 'bg-sebo-claro border-sebo',
    beneficios: [
      { icone: <Sparkles className="w-4 h-4" />, texto: '+1% de cashback em tudo' },
      { icone: <Calendar className="w-4 h-4" />, texto: 'Campanhas sazonais no WhatsApp' },
    ],
  },
  {
    id: 'ouro',
    nome: 'Ouro',
    subtitulo: '4.000 pts',
    min: LIMITES_NIVEL.ouro,
    cor: 'text-[color:var(--amarelo-novo)]',
    corBg: 'bg-[color:var(--amarelo-novo)]/20 border-[color:var(--amarelo-novo)]',
    beneficios: [
      { icone: <Sparkles className="w-4 h-4" />, texto: '+2% de cashback em tudo' },
      { icone: <Clock className="w-4 h-4" />, texto: 'Ofertas da semana 24h antes' },
      { icone: <Gift className="w-4 h-4" />, texto: 'Resgates exclusivos todo mês' },
    ],
  },
];

export default function ClubeClient() {
  useNoIndex();
  const router = useRouter();
  const clienteAtualId = useStore((s) => s.clienteAtualId);
  const cliente = useStore((s) => s.clientes.find((c) => c.id === clienteAtualId));

  if (!cliente) {
    return (
      <>
        <HeaderLoja />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-carvao/70">Você ainda não se identificou.</p>
          <button
            onClick={() => router.push('/loja/checkout')}
            className="mt-4 h-12 px-5 rounded-md bg-sangue text-papel font-semibold"
          >
            Identificar pelo celular
          </button>
        </main>
      </>
    );
  }

  const nivelAtual = nivelPorPontos(cliente.pontosAcumuladoTotal);
  const pontos = cliente.pontosAcumuladoTotal;
  const idxAtual = DEGRAUS.findIndex((d) => d.id === nivelAtual);
  const proximoIdx = idxAtual < DEGRAUS.length - 1 ? idxAtual + 1 : -1;
  const proximo = proximoIdx >= 0 ? DEGRAUS[proximoIdx] : null;
  const proximoMin = proximo ? proximo.min : null;
  const faltaParaProximo = proximoMin ? Math.max(0, proximoMin - pontos) : 0;
  const pct =
    proximoMin && proximoMin > 0
      ? Math.min(100, (pontos / proximoMin) * 100)
      : 100;

  return (
    <>
      <HeaderLoja />
      <main className="mx-auto max-w-3xl px-4 pb-12">
        <Link
          href="/minha-conta"
          className="inline-flex items-center gap-1 text-sm text-carvao/60 hover:text-carvao mt-3"
        >
          <ChevronLeft className="w-4 h-4" /> voltar à minha conta
        </Link>

        <header className="mt-3">
          <div className="text-xs uppercase tracking-widest text-carvao/60 font-semibold">
            Clube Ribeirão
          </div>
          <h1 className="font-display font-extrabold text-3xl uppercase mt-1 leading-tight">
            Quanto mais você compra,<br />
            <span className="text-sangue">mais volta pra você.</span>
          </h1>
        </header>

        {/* Card atual */}
        <section className="mt-5 rounded-xl bg-carvao text-papel p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-papel/60">Você está</div>
              <div className="font-display font-extrabold text-3xl uppercase mt-1">
                {nivelAtual}
              </div>
            </div>
            <Sparkles className="w-10 h-10 text-brasa" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-papel/10 p-3">
              <div className="text-xs text-papel/60 uppercase font-semibold">Cashback</div>
              <div className="font-mono font-bold text-2xl">{brl(cliente.saldoCashback)}</div>
            </div>
            <div className="rounded-md bg-papel/10 p-3">
              <div className="text-xs text-papel/60 uppercase font-semibold">Pontos</div>
              <div className="font-mono font-bold text-2xl">{cliente.pontosAcumuladoTotal}</div>
            </div>
          </div>
        </section>

        {/* Escada visual */}
        <section className="mt-6">
          <div className="text-xs uppercase font-semibold text-carvao/60 mb-2">
            Suba os degraus
          </div>
          <div className="space-y-3">
            {DEGRAUS.map((d, i) => {
              const conquistado = i <= idxAtual;
              const atual = i === idxAtual;
              return (
                <div
                  key={d.id}
                  className={cn(
                    'relative rounded-xl border-2 p-4 transition-all',
                    conquistado ? d.corBg : 'bg-papel border-sebo opacity-70',
                    atual && 'ring-2 ring-sangue ring-offset-2 ring-offset-papel',
                  )}
                  style={{ marginLeft: `${i * 16}px` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full grid place-items-center font-display font-extrabold text-lg shrink-0',
                        conquistado ? 'bg-azulejo text-carvao' : 'bg-sebo-claro text-carvao/40',
                      )}
                    >
                      {conquistado && !atual ? (
                        <Check className="w-5 h-5 text-verde-fiel" />
                      ) : (
                        d.nome[0]
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <div className={cn('font-display font-extrabold uppercase text-lg', d.cor)}>
                          {d.nome}
                        </div>
                        <div className="text-xs font-mono text-carvao/60">{d.subtitulo}</div>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {d.beneficios.map((b, j) => (
                          <li key={j} className="text-sm text-carvao/80 flex items-center gap-2">
                            <span className={cn(conquistado ? 'text-brasa' : 'text-carvao/40')}>
                              {b.icone}
                            </span>
                            {b.texto}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {!conquistado && <Lock className="w-5 h-5 text-carvao/40 shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Progresso até o próximo */}
        {proximo && (
          <section className="mt-6 bg-azulejo border border-sebo rounded-xl p-4">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs text-carvao/60 uppercase font-semibold">
                  Faltam para o {proximo.nome}
                </div>
                <div className="font-mono font-extrabold text-3xl tabular-nums mt-1">
                  {faltaParaProximo}
                  <span className="text-base font-normal text-carvao/60"> pontos</span>
                </div>
              </div>
              <div className="text-right text-xs text-carvao/60">
                <div>{pontos} de {proximo.min}</div>
                <div className="font-mono">{Math.round(pct)}%</div>
              </div>
            </div>
            <div className="mt-3 h-3 rounded-full bg-sebo-claro overflow-hidden">
              <div
                className="h-full bg-sangue transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <Link
              href="/loja"
              className="mt-4 block w-full h-12 rounded-md bg-sangue text-papel font-semibold text-center leading-[3rem] hover:bg-brasa"
            >
              Fazer um pedido e somar pontos
            </Link>
          </section>
        )}

        {!proximo && (
          <section className="mt-6 rounded-xl bg-carvao text-papel p-4 text-center">
            <div className="font-display font-extrabold uppercase text-xl">Você está no topo.</div>
            <div className="text-sm text-papel/70 mt-1">
              Cada pedido Ouro rende +2% de cashback e ofertas com 24h de antecedência.
            </div>
          </section>
        )}

        {/* Regras */}
        <section className="mt-6 bg-azulejo border border-sebo rounded-xl p-4">
          <div className="font-display font-bold uppercase text-sm">Como funciona</div>
          <ul className="mt-2 space-y-1 text-sm text-carvao/80 list-disc pl-5">
            <li>1 ponto por R$ 1,00 pago.</li>
            <li>Cashback por categoria: bovino 3%, suíno 4%, aves 4%, embutidos 5%, preparados 5%, churrasco 2%.</li>
            <li>Cashback expira 60 dias após a última compra — cada nova compra renova.</li>
            <li>Pontos não expiram. Só sobem de nível, nunca descem.</li>
          </ul>
        </section>
      </main>
    </>
  );
}
