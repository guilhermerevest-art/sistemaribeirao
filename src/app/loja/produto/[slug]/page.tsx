'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { Button } from '@/components/ui/button';
import { brl, formatarPeso } from '@/lib/formato';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { nivelPorPontos, ofertaAtivaPara } from '@/lib/regras';
import { toast } from 'sonner';

const PESOS_RAPIDOS = [0.5, 1, 1.5, 2];

export default function ProdutoPage() {
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
          <Button onClick={() => router.push('/loja')} className="mt-4">Voltar</Button>
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
      <main className="mx-auto max-w-6xl px-4 pb-40">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-carvao/60 hover:text-carvao mt-3"
        >
          <ChevronLeft className="w-4 h-4" /> voltar
        </button>

        <div className="grid md:grid-cols-2 gap-6 mt-3">
          <div className="rounded-xl bg-sebo-claro overflow-hidden aspect-square">
            <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="font-display font-extrabold text-2xl uppercase tracking-tight">{produto.nome}</div>
            {produto.corte && (
              <div className="text-sm text-carvao/60 mt-1">Corte: {produto.corte}</div>
            )}
            <p className="text-sm text-carvao/80 mt-2">{produto.descricao}</p>

            {oferta && (
              <div className="mt-4 rounded-md bg-brasa text-papel px-3 py-2 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold text-sm">{oferta.chamada}</span>
                <span className="font-mono ml-2 line-through opacity-70">{brl(produto.precoKg)}</span>
              </div>
            )}

            <div className="mt-4">
              <div className="text-sm font-semibold">Quanto você quer?</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {PESOS_RAPIDOS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeso(p)}
                    className={`px-4 h-11 rounded-md font-mono font-semibold border ${
                      peso === p
                        ? 'bg-sangue text-papel border-sangue'
                        : 'bg-azulejo border-sebo text-carvao'
                    }`}
                  >
                    {formatarPeso(p)}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-sm text-carvao/70">Peso (kg):</label>
                <input
                  type="number"
                  step={0.1}
                  min={0.1}
                  max={10}
                  value={peso}
                  onChange={(e) => setPeso(Number(e.target.value))}
                  className="w-24 h-11 rounded-md border border-sebo px-3 font-mono"
                />
              </div>
              <p className="text-xs text-carvao/60 mt-2">
                O peso pode variar até 100 g para mais ou para menos. O valor final é o da balança.
              </p>
            </div>

            {produto.preparosDisponiveis.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-semibold">Preparo</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {produto.preparosDisponiveis.map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePreparo(p)}
                      className={`px-3 h-10 rounded-full text-sm font-medium border transition-colors ${
                        preparos.includes(p)
                          ? 'bg-carvao text-papel border-carvao'
                          : 'bg-azulejo border-sebo text-carvao hover:border-carvao'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="text-sm font-semibold">Observação</label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value.slice(0, 120))}
                maxLength={120}
                rows={2}
                placeholder="ex: mal passado, sem sal, para hoje à noite"
                className="w-full mt-1 rounded-md border border-sebo px-3 py-2 text-sm"
              />
              <div className="text-xs text-carvao/60 mt-1 text-right">{observacao.length}/120</div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé fixo no celular */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-azulejo border-t border-sebo p-3">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <div className="flex-1">
            <div className="font-mono font-bold text-2xl">{brl(subtotal)}</div>
            <div className="text-xs text-carvao/60">
              {formatarPeso(peso)} · {formatarPesoHelperCashback(produto.precoKg, produto.percentualCashback, peso)}
            </div>
          </div>
          <Button size="lg" onClick={handleAdicionar} disabled={!pesoValido}>
            Adicionar
          </Button>
        </div>
      </div>
    </>
  );
}

function formatarPesoHelperCashback(precoKg: number, pct: number, peso: number): string {
  const cb = precoKg * pct * peso;
  return `volta ${brl(cb)}`;
}
