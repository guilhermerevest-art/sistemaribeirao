'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { Button } from '@/components/ui/button';
import { brl, formatarTelefone, normalizarTelefone } from '@/lib/formato';
import { ChevronLeft, ChevronRight, Phone, Wallet, Bike, CreditCard, Banknote } from 'lucide-react';
import { calcularMaximoUsoCashback, cotarPedido, nivelPorPontos } from '@/lib/regras';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const itens = useStore((s) => s.carrinho.itens);
  const produtos = useStore((s) => s.produtos);
  const ofertas = useStore((s) => s.ofertas);
  const clientes = useStore((s) => s.clientes);
  const clienteAtualId = useStore((s) => s.clienteAtualId);
  const setClienteAtual = useStore((s) => s.setClienteAtual);
  const criarPedido = useStore((s) => s.criarPedido);

  const [telefone, setTelefone] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [retirada, setRetirada] = useState<'balcao' | 'entrega'>('balcao');
  const [endereco, setEndereco] = useState('');
  const [querUsarCashback, setQuerUsarCashback] = useState(false);
  const [pagamento, setPagamento] = useState<'pix' | 'cartao_entrega' | 'dinheiro'>('pix');
  const [trocoPara, setTrocoPara] = useState('');
  const [observacaoGeral, setObservacaoGeral] = useState('');

  const cliente = useMemo(
    () => clientes.find((c) => c.telefone === normalizarTelefone(telefone)),
    [clientes, telefone],
  );

  useEffect(() => {
    if (clienteAtualId) {
      const c = clientes.find((x) => x.id === clienteAtualId);
      if (c) setTelefone(c.telefone);
    }
  }, [clienteAtualId, clientes]);

  const nivel = cliente ? nivelPorPontos(cliente.pontosAcumuladoTotal) : 'bronze';
  const cotacao = useMemo(() => {
    if (itens.length === 0) return null;
    return cotarPedido({
      itens,
      produtos,
      ofertas,
      nivel,
      cashbackUsado: 0,
    });
  }, [itens, produtos, ofertas, nivel]);

  const subtotal = cotacao?.subtotal ?? 0;
  const taxaEntrega = retirada === 'entrega' ? (subtotal >= 150 ? 0 : 8) : 0;
  const cashbackMaximo = cliente ? calcularMaximoUsoCashback(subtotal, cliente.saldoCashback) : 0;
  const cashbackUsado = querUsarCashback ? cashbackMaximo : 0;
  const total = (cotacao ? cotacao.valorPago : 0) + taxaEntrega;

  const handleEnviar = () => {
    if (!cliente) {
      toast.error('Coloque um celular para identificar');
      return;
    }
    if (itens.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }
    if (retirada === 'entrega' && !endereco.trim()) {
      toast.error('Coloque o endereço de entrega');
      return;
    }
    if (pagamento === 'dinheiro' && trocoPara && Number(trocoPara) < total) {
      toast.error('O troco precisa ser maior que o total');
      return;
    }
    setClienteAtual(cliente.id);
    const pedido = criarPedido({
      clienteId: cliente.id,
      retirada,
      endereco: retirada === 'entrega' ? endereco : undefined,
      pagamento,
      trocoPara: pagamento === 'dinheiro' && trocoPara ? Number(trocoPara) : undefined,
      cashbackUsado,
      taxaEntrega,
      observacaoGeral: observacaoGeral.trim() || undefined,
    });
    router.push(`/loja/pedido/${pedido.id}`);
  };

  return (
    <>
      <HeaderLoja />
      <main className="mx-auto max-w-3xl px-4 pb-32">
        <Link href="/loja/carrinho" className="inline-flex items-center gap-1 text-sm text-carvao/60 hover:text-carvao mt-3">
          <ChevronLeft className="w-4 h-4" /> voltar ao carrinho
        </Link>

        <h1 className="font-display font-extrabold text-2xl uppercase mt-3">Checkout</h1>

        {itens.length === 0 ? (
          <div className="mt-8 rounded-xl bg-azulejo border border-sebo p-8 text-center">
            <p className="text-carvao/70">Seu carrinho está vazio.</p>
            <Button className="mt-4" onClick={() => router.push('/loja')}>Ver a vitrine</Button>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {/* 1. Identificação */}
            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <div className="font-display font-bold uppercase text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" /> 1. Quem é você?
              </div>
              <div className="mt-3">
                <label className="text-sm text-carvao/70">Celular</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={formatarTelefone(telefone)}
                  onChange={(e) => setTelefone(normalizarTelefone(e.target.value))}
                  placeholder="(34) 99999-9999"
                  className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono"
                />
              </div>
              {telefone && cliente && (
                <div className="mt-3 rounded-md bg-sebo-claro px-3 py-2 text-sm">
                  Olá, <strong>{cliente.nome}</strong>! Você tem <strong>{brl(cliente.saldoCashback)}</strong> de cashback.
                </div>
              )}
              {telefone && !cliente && telefone.replace(/\D/g, '').length >= 10 && (
                <div className="mt-3">
                  <label className="text-sm text-carvao/70">Como podemos te chamar?</label>
                  <input
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Seu nome"
                    className="mt-1 w-full h-11 rounded-md border border-sebo px-3"
                  />
                </div>
              )}
            </section>

            {/* 2. Retirada ou entrega */}
            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <div className="font-display font-bold uppercase text-sm flex items-center gap-2">
                <Bike className="w-4 h-4" /> 2. Como prefere?
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRetirada('balcao')}
                  className={`h-12 rounded-md border font-semibold ${retirada === 'balcao' ? 'bg-sangue text-papel border-sangue' : 'bg-azulejo border-sebo'}`}
                >
                  Retirar no balcão
                </button>
                <button
                  onClick={() => setRetirada('entrega')}
                  className={`h-12 rounded-md border font-semibold ${retirada === 'entrega' ? 'bg-sangue text-papel border-sangue' : 'bg-azulejo border-sebo'}`}
                >
                  Entrega
                </button>
              </div>
              {retirada === 'entrega' && (
                <div className="mt-3">
                  <label className="text-sm text-carvao/70">Endereço</label>
                  <input
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, número, bairro"
                    className="mt-1 w-full h-11 rounded-md border border-sebo px-3"
                  />
                  <p className="text-xs text-carvao/60 mt-1">
                    Taxa R$ 8,00 · grátis acima de R$ 150,00.
                  </p>
                </div>
              )}
            </section>

            {/* 3. Cashback */}
            {cliente && cliente.saldoCashback >= 5 && (
              <section className="bg-azulejo border border-sebo rounded-xl p-4">
                <div className="font-display font-bold uppercase text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> 3. Usar cashback
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm">Você tem <strong>{brl(cliente.saldoCashback)}</strong></div>
                    <div className="text-xs text-carvao/60">Pode usar até {brl(cashbackMaximo)} neste pedido.</div>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={querUsarCashback}
                      onChange={(e) => setQuerUsarCashback(e.target.checked)}
                      className="sr-only peer"
                    />
                    <span className="w-11 h-6 bg-sebo rounded-full relative transition-colors peer-checked:bg-sangue">
                      <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-papel rounded-full transition-transform peer-checked:translate-x-5" />
                    </span>
                  </label>
                </div>
              </section>
            )}

            {/* 4. Pagamento */}
            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <div className="font-display font-bold uppercase text-sm">4. Pagamento</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { id: 'pix', label: 'Pix', icon: <Wallet className="w-4 h-4" /> },
                  { id: 'cartao_entrega', label: 'Cartão na entrega', icon: <CreditCard className="w-4 h-4" /> },
                  { id: 'dinheiro', label: 'Dinheiro', icon: <Banknote className="w-4 h-4" /> },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPagamento(p.id as 'pix' | 'cartao_entrega' | 'dinheiro')}
                    className={`h-14 rounded-md border font-semibold flex flex-col items-center justify-center gap-1 text-xs ${
                      pagamento === p.id ? 'bg-sangue text-papel border-sangue' : 'bg-azulejo border-sebo'
                    }`}
                  >
                    {p.icon}
                    {p.label}
                  </button>
                ))}
              </div>
              {pagamento === 'pix' && (
                <div className="mt-3 rounded-md bg-sebo-claro p-3 flex items-center gap-3">
                  <div className="w-16 h-16 bg-papel rounded-md grid place-items-center text-[10px] text-carvao/60 border border-sebo">
                    QR
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">Pix gerado</div>
                    <div className="text-xs text-carvao/60">Aberta a loja, escaneie o código.</div>
                  </div>
                </div>
              )}
              {pagamento === 'dinheiro' && (
                <div className="mt-3">
                  <label className="text-sm text-carvao/70">Troco para quanto? (opcional)</label>
                  <input
                    type="number"
                    value={trocoPara}
                    onChange={(e) => setTrocoPara(e.target.value)}
                    placeholder="ex: 100"
                    className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono"
                  />
                </div>
              )}
            </section>

            {/* 5. Resumo */}
            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <div className="font-display font-bold uppercase text-sm">Resumo</div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-carvao/70">Subtotal</span><span className="font-mono">{brl(subtotal)}</span></div>
                {cotacao && cotacao.descontoOfertas > 0 && (
                  <div className="flex justify-between"><span className="text-carvao/70">Desconto oferta</span><span className="font-mono text-brasa">- {brl(cotacao.descontoOfertas)}</span></div>
                )}
                {cashbackUsado > 0 && (
                  <div className="flex justify-between"><span className="text-carvao/70">Cashback usado</span><span className="font-mono text-brasa">- {brl(cashbackUsado)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-carvao/70">Entrega</span><span className="font-mono">{taxaEntrega === 0 ? 'Grátis' : brl(taxaEntrega)}</span></div>
                <div className="flex justify-between pt-2 border-t border-sebo"><span className="font-display font-bold uppercase">Total</span><span className="font-mono font-bold text-xl">{brl(total)}</span></div>
              </div>
            </section>

            {/* Observação */}
            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <div className="font-display font-bold uppercase text-sm">Observação geral</div>
              <textarea
                value={observacaoGeral}
                onChange={(e) => setObservacaoGeral(e.target.value.slice(0, 200))}
                maxLength={200}
                rows={2}
                placeholder="ex: entregar após as 19h"
                className="mt-2 w-full rounded-md border border-sebo px-3 py-2 text-sm"
              />
            </section>
          </div>
        )}
      </main>

      {itens.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-azulejo border-t border-sebo p-3">
          <div className="mx-auto max-w-3xl flex items-center gap-3">
            <div className="flex-1 text-sm">
              <div className="text-carvao/60">Total</div>
              <div className="font-mono font-bold text-xl">{brl(total)}</div>
            </div>
            <Button size="lg" onClick={handleEnviar}>
              Enviar pedido <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
