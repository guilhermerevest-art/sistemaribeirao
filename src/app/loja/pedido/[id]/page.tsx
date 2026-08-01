'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { Button } from '@/components/ui/button';
import { brl, formatarData, formatarHora, formatarPeso, linkWhatsAppConfirmacaoPedido, resumoItensParaWhatsApp } from '@/lib/formato';
import { CheckCircle2, MessageCircle, Truck, Store, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { useNoIndex } from '@/components/ui/use-no-index';
import { tocarBipPronto } from '@/lib/som';

export default function ConfirmacaoPage() {
  useNoIndex();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pedido = useStore((s) => s.pedidos.find((p) => p.id === params.id));
  const cliente = useStore((s) => s.clientes.find((c) => c.id === pedido?.clienteId));
  const produtos = useStore((s) => s.produtos);
  const combos = useStore((s) => s.combos);
  const clonarItens = useStore((s) => s.clonarItensParaCarrinho);
  const recarregarPedidos = useStore((s) => s.recarregarPedidos);
  const recarregarClientes = useStore((s) => s.recarregarClientes);
  const estabelecimento = useStore((s) => s.estabelecimento);

  // Polling leve: enquanto o pedido não estiver "entregue" ou "cancelado",
  // busca dados novos a cada 4 s. Em modo offline (sem Supabase), o
  // recarregarPedidos é no-op, mas mantemos a página atualizada via
  // sync entre abas (useSyncEntreAbas já trata isso).
  useEffect(() => {
    if (!pedido) return;
    if (pedido.status === 'entregue' || pedido.status === 'cancelado') return;
    const id = window.setInterval(() => {
      void recarregarPedidos();
      void recarregarClientes();
    }, 4000);
    return () => window.clearInterval(id);
  }, [pedido, recarregarPedidos, recarregarClientes]);

  // Bipe quando o pedido passa pra "Pronto". Guardamos o último status
  // visto em ref pra não tocar em re-render do mesmo status.
  const statusAnteriorRef = useRef<string | null>(null);
  useEffect(() => {
    if (!pedido) return;
    if (statusAnteriorRef.current && statusAnteriorRef.current !== pedido.status && pedido.status === 'pronto') {
      tocarBipPronto();
    }
    statusAnteriorRef.current = pedido.status;
  }, [pedido]);

  useEffect(() => {
    if (!pedido) router.push('/loja');
  }, [pedido, router]);

  if (!pedido || !cliente) return null;

  const order: Array<typeof pedido.status> = ['novo', 'preparando', 'pronto', 'entregue'];
  const idxAtual = order.indexOf(pedido.status);

  const whatsAppLink = linkWhatsAppConfirmacaoPedido({
    telefoneEstabelecimento: estabelecimento.telefone || '3490000000',
    numeroPedido: pedido.id,
    nomeCliente: cliente.nome,
    itensDescricao: resumoItensParaWhatsApp({
      itens: pedido.itens.map((it) => ({
        pesoKg: it.pesoKg,
        produtoNome: it.comboId ? undefined : produtos.find((p) => p.id === it.produtoId)?.nome,
        comboNome: it.comboId ? combos.find((c) => c.id === it.comboId)?.nome : undefined,
        quantidade: it.comboId ? it.pesoKg : undefined,
      })),
    }),
    total: pedido.total,
    retirada: pedido.retirada,
    pagamento: pedido.pagamento,
    trocoPara: pedido.trocoPara,
  });

  return (
    <>
      <HeaderLoja />
      <main className="mx-auto max-w-3xl px-4 pb-8">
        <div className="rounded-xl bg-verde-fiel text-branco p-6 mt-3">
          <div className="flex items-center gap-2 font-display font-extrabold text-2xl uppercase">
            <CheckCircle2 className="w-7 h-7" /> Pedido na fila
          </div>
          <p className="text-branco/90 text-sm mt-1">Acompanhando o seu pedido no balcão.</p>
        </div>

        <div className="text-center mt-6">
          <div className="text-sm text-preto/60 uppercase tracking-wider">Nº do pedido</div>
          <div className="font-display font-extrabold text-6xl tabular-nums">{pedido.id}</div>
          <div className="text-sm text-preto/60 mt-1">{formatarData(pedido.criadoEm, true)}</div>
        </div>

        <section className="mt-6 bg-branco border border-cinza-claro rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="font-display font-bold uppercase text-sm">Status</div>
            {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
              <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-verde-fiel">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-verde-fiel animate-ping opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-verde-fiel" />
                </span>
                Ao vivo
              </span>
            )}
          </div>
          <ol className="space-y-2">
            {(['Recebido', 'Preparando', 'Pronto', 'Entregue'] as const).map((label, i) => {
              const ativo = i <= idxAtual;
              const atual = i === idxAtual;
              return (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold transition-colors ${
                      ativo ? 'bg-vermelho text-branco' : 'bg-cinza-claro text-preto/60'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-sm font-medium ${atual ? 'text-vermelho' : ativo ? 'text-preto' : 'text-preto/60'}`}>
                    {label}
                  </span>
                  {atual && <span className="ml-auto text-xs text-vermelho font-semibold">agora</span>}
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mt-4 bg-branco border border-cinza-claro rounded-xl p-4">
          <div className="font-display font-bold uppercase text-sm mb-2">Resumo</div>
          <ul className="text-sm space-y-1">
            {pedido.itens.map((it, i) => {
              if (it.comboId) {
                const c = combos.find((x) => x.id === it.comboId);
                if (!c) return null;
                return (
                  <li key={i} className="flex justify-between">
                    <span>{it.pesoKg}x · Combo {c.nome}</span>
                    <span className="font-mono">{brl(it.subtotal)}</span>
                  </li>
                );
              }
              const p = produtos.find((x) => x.id === it.produtoId);
              if (!p) return null;
              return (
                <li key={i} className="flex justify-between">
                  <span>{formatarPeso(it.pesoKg)} · {p.nome}</span>
                  <span className="font-mono">{brl(it.subtotal)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 pt-3 border-t border-cinza-claro flex justify-between text-sm">
            <span>Total</span>
            <span className="font-mono font-bold">{brl(pedido.total)}</span>
          </div>
        </section>

        <div className="mt-4 rounded-md bg-amarelo/20 border border-amarelo p-3 text-sm">
          Você acumulou <strong>{brl(pedido.cashbackGerado)}</strong> de cashback. Vale até {formatarData(cliente.cashbackExpiraEm ?? new Date().toISOString())}.
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={whatsAppLink} target="_blank" rel="noreferrer">
            <Button variant="secondary" full>
              <MessageCircle className="w-4 h-4 mr-1" /> Enviar pro açougue
            </Button>
          </a>
          <Link href="/minha-conta">
            <Button variant="outline" full>
              Ver minha conta
            </Button>
          </Link>
        </div>

        <button
          onClick={() => {
            clonarItens(pedido.itens);
            toast.success('Itens copiados pro carrinho');
            router.push('/loja/carrinho');
          }}
          className="mt-3 w-full h-12 rounded-xl bg-vermelho text-branco font-extrabold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-vermelho/90"
        >
          <Repeat className="w-4 h-4" /> Pedir de novo
        </button>

        <div className="mt-4 text-sm text-preto/60 flex items-center gap-2">
          {pedido.retirada === 'entrega' ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />}
          {pedido.retirada === 'entrega' ? `Entrega em ${pedido.endereco}` : 'Retirada no balcão'}
        </div>
      </main>
    </>
  );
}
