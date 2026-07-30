'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { brl, formatarTelefone, normalizarTelefone } from '@/lib/formato';
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Wallet,
  Bike,
  CreditCard,
  Banknote,
  Navigation,
  Loader2,
  ShieldCheck,
  MessagesSquare,
  Store,
  Sparkles,
} from 'lucide-react';
import { calcularMaximoUsoCashback, cotarPedido, nivelPorPontos } from '@/lib/regras';
import { toast } from 'sonner';

type Retirada = 'balcao' | 'entrega';
type Pagamento = 'pix' | 'cartao_entrega' | 'dinheiro';

export default function CheckoutPage() {
  const router = useRouter();
  const itens = useStore((s) => s.carrinho.itens);
  const produtos = useStore((s) => s.produtos);
  const ofertas = useStore((s) => s.ofertas);
  const clientes = useStore((s) => s.clientes);
  const clienteAtualId = useStore((s) => s.clienteAtualId);
  const setClienteAtual = useStore((s) => s.setClienteAtual);
  const criarPedido = useStore((s) => s.criarPedido);
  const criarCliente = useStore((s) => s.criarCliente);

  const [telefone, setTelefone] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [retirada, setRetirada] = useState<Retirada>('balcao');
  const [endereco, setEndereco] = useState('');
  const [querUsarCashback, setQuerUsarCashback] = useState(false);
  const [pagamento, setPagamento] = useState<Pagamento>('pix');
  const [trocoPara, setTrocoPara] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [geoEstado, setGeoEstado] = useState<'ocioso' | 'pedindo' | 'invertendo' | 'erro'>('ocioso');
  const [geoErro, setGeoErro] = useState<string | null>(null);

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
  const cashbackPrevisto = cotacao?.cashbackGerado ?? 0;
  const pontosPrevistos = cotacao?.pontosGerados ?? 0;

  const fone = normalizarTelefone(telefone);
  const podeEnviar =
    fone.length >= 10 && (cliente || novoNome.trim().length > 0) && itens.length > 0 &&
    (retirada !== 'entrega' || endereco.trim().length > 0) &&
    (pagamento !== 'dinheiro' || !trocoPara || Number(trocoPara) >= total);

  const handleEnviar = async () => {
    if (enviando || !podeEnviar) return;
    if (fone.length < 10) {
      toast.error('Coloque seu celular para identificar');
      return;
    }
    if (!cliente && !novoNome.trim()) {
      toast.error('Coloque seu nome');
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
    setEnviando(true);
    try {
      let clienteId = cliente?.id;
      if (!clienteId) {
        const novo = await criarCliente({
          nome: novoNome.trim(),
          telefone: fone,
          aceitaWhatsapp: true,
        });
        clienteId = novo.id;
      }
      await setClienteAtual(clienteId);
      const pedido = await criarPedido({
        clienteId: clienteId!,
        retirada,
        endereco: retirada === 'entrega' ? endereco : undefined,
        pagamento,
        trocoPara: pagamento === 'dinheiro' && trocoPara ? Number(trocoPara) : undefined,
        cashbackUsado,
        taxaEntrega,
      });
      router.push(`/loja/pedido/${pedido.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao enviar pedido');
      setEnviando(false);
    }
  };

  const capturarLocalizacao = () => {
    setGeoErro(null);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoErro('Seu navegador não tem geolocalização. Digite o endereço.');
      setGeoEstado('erro');
      return;
    }
    setGeoEstado('pedindo');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoEstado('invertendo');
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } });
          if (!res.ok) throw new Error('Falha ao buscar endereço');
          const data = await res.json();
          const achado = (data.display_name as string | undefined) ?? '';
          if (!achado) throw new Error('Endereço vazio');
          setEndereco(achado);
          setGeoEstado('ocioso');
        } catch (e) {
          setGeoErro(e instanceof Error ? e.message : 'Não consegui o endereço. Digite à mão.');
          setGeoEstado('erro');
        }
      },
      (err) => {
        setGeoErro(
          err.code === err.PERMISSION_DENIED
            ? 'Localização bloqueada. Digite o endereço.'
            : 'Não consegui sua localização. Tente de novo ou digite.',
        );
        setGeoEstado('erro');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <>
      <HeaderLoja />

      {/* Faixa do açougue — sinaliza "é açougue real". */}
      <div className="bg-preto text-branco">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-vermelho grid place-items-center font-display font-extrabold text-branco shrink-0">
            AR
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-extrabold uppercase text-sm leading-tight">
              Açougue Ribeirão
            </div>
            <div className="text-[11px] text-branco/60 leading-tight">
              Rua das Flores, 123 · Centro · Ribeirão
            </div>
          </div>
          <a
            href="https://wa.me/553490000000"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 grid place-items-center rounded-md bg-branco/10 hover:bg-branco/20"
            aria-label="Falar no WhatsApp"
          >
            <MessagesSquare className="w-4 h-4" />
          </a>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 pb-32 pt-4">
        <Link
          href="/loja/carrinho"
          className="inline-flex items-center gap-1 text-sm text-preto/60 hover:text-preto"
        >
          <ChevronLeft className="w-4 h-4" /> voltar
        </Link>

        {itens.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-preto/70">Seu carrinho está vazio.</p>
            <button
              onClick={() => router.push('/loja')}
              className="mt-4 h-12 px-6 rounded-md bg-vermelho text-branco font-extrabold uppercase tracking-wide"
            >
              Ver a vitrine
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            <div>
              <div className="text-sm text-preto/60 mb-2">Como você quer receber?</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRetirada('balcao')}
                  className={`h-14 rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition-colors ${
                    retirada === 'balcao'
                      ? 'border-vermelho bg-vermelho/5 text-vermelho'
                      : 'border-cinza-claro bg-branco text-preto hover:border-preto'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  <div className="text-left">
                    <div>Retirar no balcão</div>
                    <div className="text-[10px] font-normal text-preto/60">
                      Sem taxa, fica pronto em min
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setRetirada('entrega')}
                  className={`h-14 rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition-colors ${
                    retirada === 'entrega'
                      ? 'border-vermelho bg-vermelho/5 text-vermelho'
                      : 'border-cinza-claro bg-branco text-preto hover:border-preto'
                  }`}
                >
                  <Bike className="w-5 h-5" />
                  <div className="text-left">
                    <div>Entrega</div>
                    <div className="text-[10px] font-normal text-preto/60">
                      R$ 8,00 · grátis acima de R$ 150
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {retirada === 'entrega' && (
              <div>
                <div className="text-sm text-preto/60 mb-2">Endereço de entrega</div>
                <button
                  type="button"
                  onClick={capturarLocalizacao}
                  disabled={geoEstado === 'pedindo' || geoEstado === 'invertendo'}
                  className="w-full h-12 rounded-lg border border-cinza-claro bg-branco text-preto font-medium flex items-center justify-center gap-2 hover:border-preto disabled:opacity-60"
                >
                  {geoEstado === 'pedindo' || geoEstado === 'invertendo' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {geoEstado === 'pedindo' ? 'Pedindo permissão…' : 'Achar endereço…'}
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      Usar minha localização
                    </>
                  )}
                </button>
                {geoErro && (
                  <div className="text-xs text-vermelho-risco mt-1.5">{geoErro}</div>
                )}
                <textarea
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ou digite: Rua, número, bairro, complemento"
                  rows={2}
                  className="mt-2 w-full rounded-lg border border-cinza-claro px-3 py-2 text-sm focus:outline-none focus:border-vermelho"
                />
              </div>
            )}

            <div>
              <div className="text-sm text-preto/60 mb-2">Pra gente te chamar</div>
              <input
                type="tel"
                inputMode="numeric"
                value={formatarTelefone(telefone)}
                onChange={(e) => setTelefone(normalizarTelefone(e.target.value))}
                placeholder="Celular (34) 99999-9999"
                className="w-full h-12 rounded-lg border border-cinza-claro px-3 font-sans text-base focus:outline-none focus:border-vermelho"
              />
              {telefone && cliente && (
                <div className="mt-2 text-sm text-preto/70">
                  Olá, <strong>{cliente.nome.split(' ')[0]}</strong> · você tem{' '}
                  <strong>{brl(cliente.saldoCashback)}</strong> de volta.
                </div>
              )}
              {telefone && !cliente && fone.length >= 10 && (
                <input
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Seu nome"
                  className="mt-2 w-full h-12 rounded-lg border border-cinza-claro px-3 text-base focus:outline-none focus:border-vermelho"
                />
              )}
            </div>

            <div>
              <div className="text-sm text-preto/60 mb-2">Como vai pagar?</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pix' as const, label: 'Pix', icon: <Wallet className="w-5 h-5" /> },
                  { id: 'cartao_entrega' as const, label: 'Cartão', icon: <CreditCard className="w-5 h-5" /> },
                  { id: 'dinheiro' as const, label: 'Dinheiro', icon: <Banknote className="w-5 h-5" /> },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPagamento(p.id)}
                    className={`h-14 rounded-xl border-2 font-semibold flex flex-col items-center justify-center gap-1 text-sm transition-colors ${
                      pagamento === p.id
                        ? 'border-vermelho bg-vermelho/5 text-vermelho'
                        : 'border-cinza-claro bg-branco text-preto hover:border-preto'
                    }`}
                  >
                    {p.icon}
                    {p.label}
                  </button>
                ))}
              </div>
              {pagamento === 'dinheiro' && (
                <input
                  type="number"
                  value={trocoPara}
                  onChange={(e) => setTrocoPara(e.target.value)}
                  placeholder="Troco para quanto? (opcional)"
                  className="mt-2 w-full h-12 rounded-lg border border-cinza-claro px-3 font-sans text-base focus:outline-none focus:border-vermelho"
                />
              )}
            </div>

            {cliente && cashbackMaximo > 0 && (
              <label className="flex items-center gap-3 rounded-xl border border-cinza-claro bg-branco p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={querUsarCashback}
                  onChange={(e) => setQuerUsarCashback(e.target.checked)}
                  className="w-5 h-5 accent-vermelho"
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm">Usar {brl(cashbackMaximo)} de cashback agora</div>
                  <div className="text-xs text-preto/60">
                    Você tem {brl(cliente.saldoCashback)} acumulado.
                  </div>
                </div>
              </label>
            )}

            <div className="rounded-xl border border-cinza-claro bg-branco p-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-preto/70">Subtotal</span>
                  <span className="font-sans">{brl(subtotal)}</span>
                </div>
                {cotacao && cotacao.descontoOfertas > 0 && (
                  <div className="flex justify-between">
                    <span className="text-preto/70">Ofertas</span>
                    <span className="font-sans text-vermelho">- {brl(cotacao.descontoOfertas)}</span>
                  </div>
                )}
                {cashbackUsado > 0 && (
                  <div className="flex justify-between">
                    <span className="text-preto/70">Cashback</span>
                    <span className="font-sans text-vermelho">- {brl(cashbackUsado)}</span>
                  </div>
                )}
                {retirada === 'entrega' && (
                  <div className="flex justify-between">
                    <span className="text-preto/70">Entrega</span>
                    <span className="font-sans">{taxaEntrega === 0 ? 'Grátis' : brl(taxaEntrega)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-cinza-claro">
                  <span className="font-display font-extrabold uppercase text-base">Total</span>
                  <span className="font-sans font-bold text-2xl">{brl(total)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-cinza-claro flex items-center gap-2 text-xs text-preto/70">
                <Sparkles className="w-3.5 h-3.5 text-amarelo shrink-0" />
                Você ganha <strong>{brl(cashbackPrevisto)}</strong> de cashback e{' '}
                <strong>{pontosPrevistos}</strong> pontos com este pedido.
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-preto/60">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-verde-fiel" />
              <div>
                Sem cadastro, sem senha. Só seu celular. Peso pode variar até 100 g. Troco garantido no dinheiro.
              </div>
            </div>
          </div>
        )}
      </main>

      {itens.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-branco border-t border-cinza-claro px-3 py-3">
          <div className="mx-auto max-w-3xl flex items-center gap-3">
            <div className="flex-1">
              <div className="text-[10px] uppercase font-semibold text-preto/60 tracking-wide">
                Total
              </div>
              <div className="font-sans font-bold text-2xl leading-tight">{brl(total)}</div>
            </div>
            <button
              onClick={handleEnviar}
              disabled={!podeEnviar || enviando}
              className="h-14 px-6 rounded-xl bg-vermelho text-branco font-extrabold text-base flex items-center gap-2 hover:bg-vermelho/90 active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {enviando ? 'Enviando…' : 'Enviar pedido'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
