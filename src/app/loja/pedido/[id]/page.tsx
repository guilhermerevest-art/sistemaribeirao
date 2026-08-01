'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { Button } from '@/components/ui/button';
import { brl, formatarData, formatarHora, formatarPeso } from '@/lib/formato';
import { CheckCircle2, MessageCircle, Truck, Store, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { useNoIndex } from '@/components/ui/use-no-index';

export default function ConfirmacaoPage() {
  useNoIndex();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pedido = useStore((s) => s.pedidos.find((p) => p.id === params.id));
  const cliente = useStore((s) => s.clientes.find((c) => c.id === pedido?.clienteId));
  const produtos = useStore((s) => s.produtos);
  const combos = useStore((s) => s.combos);
  const clonarItens = useStore((s) => s.clonarItensParaCarrinho);

  useEffect(() => {
    if (!pedido) router.push('/loja');
  }, [pedido, router]);

  if (!pedido || !cliente) return null;

  const order: Array<typeof pedido.status> = ['novo', 'preparando', 'pronto', 'entregue'];
  const idxAtual = order.indexOf(pedido.status);

  const whatsAppLink = `https://wa.me/553490000000?text=${encodeURIComponent(
    `Oi Empório Ribeirão, fiz o pedido ${pedido.id}. Tô aguardando!`,
  )}`;

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
          <div className="font-display font-bold uppercase text-sm mb-3">Status</div>
          <ol className="space-y-2">
            {(['Recebido', 'Preparando', 'Pronto', 'Entregue'] as const).map((label, i) => {
              const ativo = i <= idxAtual;
              const atual = i === idxAtual;
              return (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${
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
              <MessageCircle className="w-4 h-4 mr-1" /> Falar no WhatsApp
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
