'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { brl, formatarPeso } from '@/lib/formato';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { nivelPorPontos, ofertaAtivaPara } from '@/lib/regras';
import { toast } from 'sonner';
import { ImagemProduto } from '@/components/ui/imagem-produto';

const PESOS_RAPIDOS = [0.5, 1, 1.5, 2];

export default function ProdutoClient() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const produto = useStore((s) => s.produtos.find((p) => p.slug === params.slug));
  const ofertas = useStore((s) => s.ofertas);
  const clienteAtual = useStore((s) => s.clientes.find((c) => c.id === s.clienteAtualId));
  const adicionarAoCarrinho = useStore((s) => s.adicionarAoCarrinho);

  const [peso, setPeso] = useState<number>(1);
  const [preparos, setPreparos] = useState<string[]>([]);
  const [observacao, setObservacao] = useState('');

  const oferta = useMemo(() => {
    if (!produto) return undefined;
    const nivel = clienteAtual ? nivelPorPontos(clienteAtual.pontosAcumuladoTotal) : 'bronze';
    return ofertaAtivaPara(ofertas, produto.id, new Date(), nivel === 'ouro');
  }, [produto, ofertas, clienteAtual]);

  if (!produto) {
    return (
      <>
        <HeaderLoja />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <p>Produto não encontrado.</p>
          <button onClick={() => router.push('/loja')} className="mt-4 h-11 px-5 rounded-md bg-preto text-branco font-semibold">Voltar</button>
        </main>
      </>
    );
  }

  const precoAplicado = oferta?.precoPor ?? produto.precoKg;
  const subtotal = Math.round(peso * precoAplicado * 100) / 100;
  const cashback = produto.precoKg * produto.percentualCashback;
  const pesoValido = peso >= 0.1 && peso <= 10;

  const togglePreparo = (p: string) => {
    setPreparos((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleAdicionar = () => {
    if (!pesoValido) {
      toast.error('Coloque um peso entre 100 g e 10 kg');
      return;
    }
    adicionarAoCarrinho({
      produtoId: produto.id,
      pesoKg: peso,
      preparos,
      observacao: observacao.trim() || undefined,
      ofertaId: oferta?.id,
      precoUnitarioAplicado: precoAplicado,
      subtotal,
    });
    toast.success('Adicionado ao carrinho');
    router.push('/loja/carrinho');
  };

  return (
    <>
      <HeaderLoja />

      {/* Hero do produto — foto grande */}
      <div className="relative h-[40vh] sm:h-[60vh] min-h-[280px] sm:min-h-[420px] bg-cinza-claro">
        <ImagemProduto src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 inline-flex items-center gap-1 text-sm text-preto bg-branco/90 backdrop-blur px-3 h-9 rounded-full"
        >
          <ChevronLeft className="w-4 h-4" /> voltar
        </button>
      </div>

      <main className="mx-auto max-w-3xl px-4 pb-40">
        <div className="mt-5">
          <div className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight leading-tight">
            {produto.nome}
          </div>
          {produto.corte && <div className="text-sm text-preto/60 mt-1">Corte: {produto.corte}</div>}
          <p className="text-sm text-preto/80 mt-2">{produto.descricao}</p>
          <div className="mt-3 flex items-baseline gap-2">
            {oferta ? (
              <>
                <span className="font-sans line-through text-preto/50 text-lg">{brl(produto.precoKg)}</span>
                <span className="font-sans font-extrabold text-3xl text-vermelho">{brl(precoAplicado)}</span>
                <span className="text-sm text-preto/60">/kg</span>
              </>
            ) : (
              <>
                <span className="font-sans font-extrabold text-3xl">{brl(precoAplicado)}</span>
                <span className="text-sm text-preto/60">/kg</span>
              </>
            )}
          </div>
          <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-verde-fiel">
            <Sparkles className="w-3.5 h-3.5" />
            Volta {brl(cashback)} por kg
          </div>
          {oferta && (
            <div className="mt-3 rounded-md bg-amarelo text-preto px-3 py-2 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold text-sm">{oferta.chamada}</span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="font-display font-bold uppercase text-sm">Quanto você quer?</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {PESOS_RAPIDOS.map((p) => (
              <button
                key={p}
                onClick={() => setPeso(p)}
                className={`px-5 h-12 rounded-full font-sans font-semibold text-base border transition-colors ${
                  peso === p
                    ? 'bg-vermelho text-branco border-vermelho'
                    : 'bg-cinza-claro border-cinza-claro text-preto hover:border-preto'
                }`}
              >
                {formatarPeso(p)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label className="text-sm text-preto/70">Outro peso (kg):</label>
            <input
              type="number"
              step={0.1}
              min={0.1}
              max={10}
              value={peso}
              onChange={(e) => setPeso(Number(e.target.value))}
              className="w-24 h-11 rounded-md border border-cinza-claro px-3 font-sans"
            />
          </div>
          <p className="text-xs text-preto/60 mt-2">
            O peso pode variar até 100 g para mais ou para menos. O valor final é o da balança.
          </p>
        </div>

        {produto.preparosDisponiveis.length > 0 && (
          <div className="mt-6">
            <div className="font-display font-bold uppercase text-sm">Preparo</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {produto.preparosDisponiveis.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePreparo(p)}
                  className={`px-4 h-11 rounded-full text-sm font-medium border transition-colors ${
                    preparos.includes(p)
                      ? 'bg-preto text-branco border-preto'
                      : 'bg-branco border-cinza-claro text-preto hover:border-preto'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="font-display font-bold uppercase text-sm">Observação</label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value.slice(0, 120))}
            maxLength={120}
            rows={2}
            placeholder="ex: mal passado, sem sal, para hoje à noite"
            className="w-full mt-1 rounded-md border border-cinza-claro px-3 py-2 text-sm focus:outline-none focus:border-vermelho"
          />
          <div className="text-xs text-preto/60 mt-1 text-right">{observacao.length}/120</div>
        </div>
      </main>

      {/* Rodapé fixo — botão amarelo ocupa a área toda */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-branco border-t border-cinza-claro p-3">
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          <div className="flex-1">
            <div className="font-sans font-bold text-2xl">{brl(subtotal)}</div>
            <div className="text-xs text-preto/60">
              {formatarPeso(peso)} · volta {brl(cashback * peso)} no pedido
            </div>
          </div>
          <button
            onClick={handleAdicionar}
            disabled={!pesoValido}
            className="h-14 px-6 rounded-lg bg-amarelo text-preto font-extrabold uppercase tracking-wide hover:bg-amarelo/90 active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Adicionar
          </button>
        </div>
      </div>
    </>
  );
}
