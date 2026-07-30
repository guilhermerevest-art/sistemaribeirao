'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { Button } from '@/components/ui/button';
import { brl, cn, formatarTelefone, normalizarTelefone } from '@/lib/formato';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Phone,
  Wallet,
  Bike,
  CreditCard,
  Banknote,
  MapPin,
  Clock,
  StickyNote,
  Ticket,
  AlertTriangle,
  Sparkles,
  Gift,
  Shield,
  Navigation,
  Loader2,
} from 'lucide-react';
import { calcularMaximoUsoCashback, cotarPedido, nivelPorPontos } from '@/lib/regras';
import { toast } from 'sonner';

type Retirada = 'balcao' | 'entrega';
type Pagamento = 'pix' | 'cartao_entrega' | 'dinheiro';
type Janela = 'padrao' | 'agendada';

type Accordion = 'endereco' | 'tempo' | 'instrucoes' | null;

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
  const [janela, setJanela] = useState<Janela>('padrao');
  const [dataAgendada, setDataAgendada] = useState('');
  const [horaAgendada, setHoraAgendada] = useState('');
  const [querUsarCashback, setQuerUsarCashback] = useState(false);
  const [cupom, setCupom] = useState('');
  const [pagamento, setPagamento] = useState<Pagamento>('pix');
  const [trocoPara, setTrocoPara] = useState('');
  const [observacaoGeral, setObservacaoGeral] = useState('');
  const [aceitar, setAceitar] = useState(false);
  const [accordion, setAccordion] = useState<Accordion>(null);
  const [enviando, setEnviando] = useState(false);
  const [geoEstado, setGeoEstado] = useState<
    'ocioso' | 'pedindo' | 'invertendo' | 'pronto' | 'erro'
  >('ocioso');
  const [geoErro, setGeoErro] = useState<string | null>(null);
  const [enderecoConfirmado, setEnderecoConfirmado] = useState(true);

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
  const pontosPrevistos = cotacao?.pontosGerados ?? 0;
  const cashbackPrevisto = cotacao?.cashbackGerado ?? 0;

  const faltaParaFrete = Math.max(0, 150 - subtotal);
  const entregaGratisProxima =
    retirada === 'entrega' && taxaEntrega > 0 && faltaParaFrete > 0 && faltaParaFrete <= 30;

  const handleEnviar = async () => {
    if (enviando) return;
    const fone = normalizarTelefone(telefone);
    if (fone.length < 10) {
      toast.error('Coloque um celular para identificar');
      return;
    }
    // Se o telefone não bate com nenhum cliente e o nome não foi
    // preenchido, bloqueia. Sem nome não dá pra criar o cadastro.
    if (!cliente && !novoNome.trim()) {
      toast.error('Coloque o nome pra gente te chamar');
      return;
    }
    if (itens.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }
    if (retirada === 'entrega') {
      if (!endereco.trim()) {
        toast.error('Coloque o endereço de entrega');
        return;
      }
      if (!enderecoConfirmado) {
        toast.error('Confirme o endereço de entrega');
        return;
      }
    }
    if (janela === 'agendada' && (!dataAgendada || !horaAgendada)) {
      toast.error('Escolha data e hora da retirada');
      return;
    }
    if (pagamento === 'dinheiro' && trocoPara && Number(trocoPara) < total) {
      toast.error('O troco precisa ser maior que o total');
      return;
    }
    if (!aceitar) {
      toast.error('Confirme que está de acordo com o pedido');
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
      const obsParts: string[] = [];
      if (observacaoGeral.trim()) obsParts.push(observacaoGeral.trim());
      if (janela === 'agendada') {
        obsParts.push(`Agendado: ${dataAgendada} às ${horaAgendada}`);
      }
      const pedido = await criarPedido({
        clienteId: clienteId!,
        retirada,
        endereco: retirada === 'entrega' ? endereco : undefined,
        pagamento,
        trocoPara: pagamento === 'dinheiro' && trocoPara ? Number(trocoPara) : undefined,
        cashbackUsado,
        taxaEntrega,
        observacaoGeral: obsParts.join(' · ') || undefined,
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
      setGeoErro('Seu navegador não tem geolocalização. Digite o endereço à mão.');
      setGeoEstado('erro');
      return;
    }
    setGeoEstado('pedindo');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoEstado('invertendo');
        try {
          // Nominatim (OpenStreetMap) — sem API key, 1 req/seg.
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url, {
            headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
          });
          if (!res.ok) throw new Error('Falha ao buscar endereço');
          const data = await res.json();
          const enderecoAchado = (data.display_name as string | undefined) ?? '';
          if (!enderecoAchado) throw new Error('Endereço vazio');
          setEndereco(enderecoAchado);
          setEnderecoConfirmado(false);
          setAccordion('endereco');
          setGeoEstado('pronto');
        } catch (e) {
          setGeoErro(
            e instanceof Error
              ? e.message
              : 'Não consegui identificar o endereço. Digite à mão.',
          );
          setGeoEstado('erro');
        }
      },
      (err) => {
        setGeoErro(
          err.code === err.PERMISSION_DENIED
            ? 'Você bloqueou a localização. Pode digitar o endereço à mão.'
            : 'Não consegui pegar sua localização. Tente de novo ou digite à mão.',
        );
        setGeoEstado('erro');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Quando o usuário edita o endereço manualmente, exige nova confirmação.
  useEffect(() => {
    setEnderecoConfirmado(false);
  }, [endereco]);

  return (
    <>
      <HeaderLoja />
      <main className="mx-auto max-w-3xl px-4 pb-32">
        <Link
          href="/loja/carrinho"
          className="inline-flex items-center gap-1 text-sm text-carvao/60 hover:text-carvao mt-3"
        >
          <ChevronLeft className="w-4 h-4" /> voltar ao carrinho
        </Link>

        <h1 className="font-display font-extrabold text-2xl uppercase mt-3">Checkout</h1>

        {itens.length === 0 ? (
          <div className="mt-8 rounded-xl bg-azulejo border border-sebo p-8 text-center">
            <p className="text-carvao/70">Seu carrinho está vazio.</p>
            <Button className="mt-4" onClick={() => router.push('/loja')}>
              Ver a vitrine
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {(entregaGratisProxima || (cliente && cliente.saldoCashback >= 5)) && (
              <div className="rounded-xl border-2 border-brasa bg-brasa/10 p-3 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-brasa shrink-0 mt-0.5" />
                <div className="text-sm">
                  {entregaGratisProxima && (
                    <div>
                      <strong>Faltam {brl(faltaParaFrete)}</strong> pra entrega sair de graça.
                    </div>
                  )}
                  {cliente && cliente.saldoCashback >= 5 && (
                    <div className={entregaGratisProxima ? 'mt-1' : ''}>
                      Você tem <strong>{brl(cliente.saldoCashback)}</strong> de cashback acumulado.
                    </div>
                  )}
                </div>
              </div>
            )}

            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <div className="font-display font-bold uppercase text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" /> Quem é você?
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
                  Olá, <strong>{cliente.nome}</strong>! Saldo de{' '}
                  <strong>{brl(cliente.saldoCashback)}</strong> ·{' '}
                  <span className="uppercase font-semibold text-sangue">{nivel}</span>
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

            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <div className="font-display font-bold uppercase text-sm flex items-center gap-2">
                <Bike className="w-4 h-4" /> Como prefere?
              </div>
              <div className="mt-3 grid grid-cols-2 bg-sebo-claro rounded-md p-1 relative">
                <button
                  onClick={() => setRetirada('balcao')}
                  className={cn(
                    'h-11 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2',
                    retirada === 'balcao'
                      ? 'bg-azulejo text-carvao shadow-sm'
                      : 'text-carvao/60',
                  )}
                >
                  <MapPin className="w-4 h-4" /> Retirar no balcão
                </button>
                <button
                  onClick={() => setRetirada('entrega')}
                  className={cn(
                    'h-11 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2',
                    retirada === 'entrega'
                      ? 'bg-azulejo text-carvao shadow-sm'
                      : 'text-carvao/60',
                  )}
                >
                  <Bike className="w-4 h-4" /> Entrega
                </button>
              </div>

              {retirada === 'entrega' && (
                <Acc
                  aberto={accordion === 'endereco'}
                  onToggle={() => setAccordion(accordion === 'endereco' ? null : 'endereco')}
                  icon={<MapPin className="w-4 h-4" />}
                  label="Endereço de entrega"
                  valor={
                    endereco
                      ? `${endereco.slice(0, 32)}${endereco.length > 32 ? '…' : ''} ${
                          enderecoConfirmado ? '✓' : '· confirmar'
                        }`
                      : 'Onde você está?'
                  }
                  children={
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={capturarLocalizacao}
                        disabled={geoEstado === 'pedindo' || geoEstado === 'invertendo'}
                        className="w-full h-11 rounded-md border-2 border-brasa bg-brasa/10 text-brasa font-semibold flex items-center justify-center gap-2 hover:bg-brasa/20 disabled:opacity-60"
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
                        <div className="text-xs text-vermelho-risco bg-vermelho-risco/10 border border-vermelho-risco/30 rounded-md px-2 py-1.5">
                          {geoErro}
                        </div>
                      )}
                      <div>
                        <label className="text-xs text-carvao/60">Endereço</label>
                        <textarea
                          value={endereco}
                          onChange={(e) => setEndereco(e.target.value)}
                          placeholder="Rua, número, bairro, complemento"
                          rows={2}
                          className="mt-1 w-full rounded-md border border-sebo px-3 py-2 text-sm"
                        />
                      </div>
                      {endereco.trim() && (
                        <div className="rounded-md bg-sebo-claro border border-sebo p-3">
                          <div className="text-xs text-carvao/60 uppercase font-semibold mb-1">
                            Confirme o endereço
                          </div>
                          <div className="text-sm">{endereco}</div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEnderecoConfirmado(true)}
                              className={
                                enderecoConfirmado
                                  ? 'flex-1 h-9 rounded-md bg-verde-fiel text-papel font-semibold text-sm flex items-center justify-center gap-1'
                                  : 'flex-1 h-9 rounded-md bg-sangue text-papel font-semibold text-sm hover:bg-brasa'
                              }
                            >
                              {enderecoConfirmado ? '✓ Confirmado' : 'Confirmar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEnderecoConfirmado(false)}
                              className="h-9 px-3 rounded-md border border-sebo text-carvao text-sm hover:bg-sebo-claro"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-carvao/60">
                        Taxa R$ 8,00 · grátis acima de R$ 150,00.
                      </p>
                    </div>
                  }
                />
              )}
            </section>

            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <Acc
                aberto={accordion === 'tempo'}
                onToggle={() => setAccordion(accordion === 'tempo' ? null : 'tempo')}
                icon={<Clock className="w-4 h-4" />}
                label="Horário"
                valor={
                  janela === 'padrao'
                    ? 'Assim que possível'
                    : dataAgendada && horaAgendada
                      ? `${dataAgendada} às ${horaAgendada}`
                      : 'Agendar'
                }
                children={
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setJanela('padrao')}
                        className={cn(
                          'h-11 rounded-md border font-semibold text-sm',
                          janela === 'padrao'
                            ? 'bg-sangue text-papel border-sangue'
                            : 'bg-azulejo border-sebo text-carvao',
                        )}
                      >
                        Padrão
                      </button>
                      <button
                        onClick={() => setJanela('agendada')}
                        className={cn(
                          'h-11 rounded-md border font-semibold text-sm',
                          janela === 'agendada'
                            ? 'bg-sangue text-papel border-sangue'
                            : 'bg-azulejo border-sebo text-carvao',
                        )}
                      >
                        Agendada
                      </button>
                    </div>
                    {janela === 'padrao' && (
                      <p className="text-xs text-carvao/60">
                        Preparamos assim que o açougueiro estiver com a bancada livre.
                      </p>
                    )}
                    {janela === 'agendada' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-carvao/60">Data</label>
                          <input
                            type="date"
                            value={dataAgendada}
                            onChange={(e) => setDataAgendada(e.target.value)}
                            className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-carvao/60">Hora</label>
                          <input
                            type="time"
                            value={horaAgendada}
                            onChange={(e) => setHoraAgendada(e.target.value)}
                            className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                }
              />
            </section>

            {cliente && cliente.saldoCashback >= 5 && (
              <section className="bg-azulejo border border-sebo rounded-xl p-4">
                <div className="font-display font-bold uppercase text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Usar cashback
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm">
                      Você tem <strong>{brl(cliente.saldoCashback)}</strong>
                    </div>
                    <div className="text-xs text-carvao/60">
                      Pode usar até {brl(cashbackMaximo)} neste pedido.
                    </div>
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

            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <div className="font-display font-bold uppercase text-sm flex items-center gap-2">
                <Ticket className="w-4 h-4" /> Cupom de desconto
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={cupom}
                  onChange={(e) => setCupom(e.target.value.toUpperCase())}
                  placeholder="Código do cupom"
                  className="flex-1 h-11 rounded-md border border-sebo px-3 font-mono uppercase"
                />
                <Button variant="secondary" disabled>
                  Aplicar
                </Button>
              </div>
              <p className="text-xs text-carvao/60 mt-1">
                Ofertas e cashback já estão aplicados automaticamente.
              </p>
            </section>

            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <div className="font-display font-bold uppercase text-sm">Pagamento</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { id: 'pix' as const, label: 'Pix', icon: <Wallet className="w-4 h-4" /> },
                  { id: 'cartao_entrega' as const, label: 'Cartão', icon: <CreditCard className="w-4 h-4" /> },
                  { id: 'dinheiro' as const, label: 'Dinheiro', icon: <Banknote className="w-4 h-4" /> },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPagamento(p.id)}
                    className={cn(
                      'h-14 rounded-md border font-semibold flex flex-col items-center justify-center gap-1 text-xs',
                      pagamento === p.id
                        ? 'bg-sangue text-papel border-sangue'
                        : 'bg-azulejo border-sebo text-carvao',
                    )}
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
                    <div className="font-semibold">Pix gerado na entrega</div>
                    <div className="text-xs text-carvao/60">
                      Paga pelo app antes de receber.
                    </div>
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

            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <Acc
                aberto={accordion === 'instrucoes'}
                onToggle={() => setAccordion(accordion === 'instrucoes' ? null : 'instrucoes')}
                icon={<StickyNote className="w-4 h-4" />}
                label="Instruções para o açougueiro"
                valor={
                  observacaoGeral
                    ? observacaoGeral.slice(0, 32) + (observacaoGeral.length > 32 ? '…' : '')
                    : 'Opcional'
                }
                children={
                  <textarea
                    value={observacaoGeral}
                    onChange={(e) => setObservacaoGeral(e.target.value.slice(0, 200))}
                    maxLength={200}
                    rows={3}
                    placeholder="ex: entregar após as 19h, embalar a vácuo…"
                    className="w-full rounded-md border border-sebo px-3 py-2 text-sm"
                  />
                }
              />
            </section>

            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <div className="font-display font-bold uppercase text-sm">Resumo</div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-carvao/70">Subtotal</span>
                  <span className="font-mono">{brl(subtotal)}</span>
                </div>
                {cotacao && cotacao.descontoOfertas > 0 && (
                  <div className="flex justify-between">
                    <span className="text-carvao/70">Ofertas</span>
                    <span className="font-mono text-brasa">- {brl(cotacao.descontoOfertas)}</span>
                  </div>
                )}
                {cashbackUsado > 0 && (
                  <div className="flex justify-between">
                    <span className="text-carvao/70">Cashback usado</span>
                    <span className="font-mono text-brasa">- {brl(cashbackUsado)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-carvao/70">Entrega</span>
                  <span className="font-mono">{taxaEntrega === 0 ? 'Grátis' : brl(taxaEntrega)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-sebo">
                  <span className="font-display font-bold uppercase">Total</span>
                  <span className="font-mono font-bold text-xl">{brl(total)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-carvao text-papel p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brasa" />
                <div className="font-display font-bold uppercase text-sm">
                  Você ganha com este pedido
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-papel/10 p-3">
                  <div className="text-xs text-papel/60 uppercase font-semibold">Cashback</div>
                  <div className="font-mono font-bold text-2xl">{brl(cashbackPrevisto)}</div>
                </div>
                <div className="rounded-md bg-papel/10 p-3">
                  <div className="text-xs text-papel/60 uppercase font-semibold">Pontos</div>
                  <div className="font-mono font-bold text-2xl">{pontosPrevistos}</div>
                </div>
              </div>
              <Link
                href="/minha-conta/clube"
                className="mt-3 inline-flex items-center gap-1 text-sm text-brasa hover:underline font-semibold"
              >
                <Gift className="w-4 h-4" /> Como subir de nível
              </Link>
            </section>

            <section className="bg-azulejo border border-sebo rounded-xl p-4">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceitar}
                  onChange={(e) => setAceitar(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-sangue"
                />
                <span className="text-sm text-carvao/80">
                  Estou de acordo com o pedido e com o aviso de que o peso pode variar até 100 g
                  para mais ou para menos.
                </span>
              </label>
            </section>
          </div>
        )}
      </main>

      {itens.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-azulejo border-t border-sebo p-3">
          <div className="mx-auto max-w-3xl flex items-center gap-3">
            <div className="flex-1 text-sm">
              <div className="text-carvao/60 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Total
              </div>
              <div className="font-mono font-bold text-xl">{brl(total)}</div>
            </div>
            <Button size="lg" onClick={handleEnviar} disabled={!aceitar || enviando}>
              {enviando ? 'Enviando…' : 'Enviar pedido'}{' '}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function Acc({
  aberto,
  onToggle,
  icon,
  label,
  valor,
  children,
}: {
  aberto: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  label: string;
  valor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 border-t border-sebo pt-3">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 text-left"
        aria-expanded={aberto}
      >
        <span className="text-carvao/60">{icon}</span>
        <span className="font-semibold text-sm flex-1">{label}</span>
        {valor && !aberto && (
          <span className="text-xs text-carvao/60 truncate max-w-[40%]">{valor}</span>
        )}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-carvao/60 transition-transform',
            aberto && 'rotate-180',
          )}
        />
      </button>
      {aberto && <div className="mt-3">{children}</div>}
    </div>
  );
}
