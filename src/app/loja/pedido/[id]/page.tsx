'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { Button } from '@/components/ui/button';
import { brl, formatarData, formatarHora, formatarPeso } from '@/lib/formato';
import { CheckCircle2, MessageCircle, Truck, Store } from 'lucide-react';

export default function ConfirmacaoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pedido = useStore((s) => s.pedidos.find((p) => p.id === params.id));
  const cliente = useStore((s) => s.clientes.find((c) => c.id === pedido?.clienteId));
  const produtos = useStore((s) => s.produtos);

  useEffect(() => {
    if (!pedido) router.push('/loja');
  }, [pedido, router]);

  if (!pedido || !cliente) return null;

  const statusLabels: Record<string, string> = {
    novo: 'Recebido',
    preparando: 'Preparando',
    pronto: 'Pronto',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
  };

  const order: Array<typeof pedido.status> = ['novo', 'preparando', 'pronto', 'entregue'];
  const idxAtual = order.indexOf(pedido.status);

  const whatsAppLink = `https://wa.me/553490000000?text=${encodeURIComponent(
    `Oi Açougue Ribeirão, fiz o pedido ${pedido.id}. Tô aguardando!`,
  )}`;

  return (
    <>
      <HeaderLoja />
      <main className="mx-auto max-w-3xl px-4 pb-8">
        <div className="rounded-xl bg-verde-fiel text-papel p-6 mt-3">
          <div className="flex items-center gap-2 font-display font-extrabold text-2xl uppercase">
            <CheckCircle2 className="w-7 h-7" /> Pedido na fila
          </div>
          <p className="text-papel/80 text-sm mt-1">Acompanhando o seu pedido no balcão.</p>
        </div>

        <div className="text-center mt-6">
          <div className="text-sm text-carvao/60 uppercase tracking-wider">Nº do pedido</div>
          <div className="font-display font-extrabold text-6xl tabular-nums">{pedido.id}</div>
          <div className="text-sm text-carvao/60 mt-1">{formatarData(pedido.criadoEm, true)}</div>
        </div>

        <section className="mt-6 bg-azulejo border border-sebo rounded-xl p-4">
          <div className="font-display font-bold uppercase text-sm mb-3">Status</div>
          <ol className="space-y-2">
            {(['Recebido', 'Preparando', 'Pronto', 'Entregue'] as const).map((label, i) => {
              const ativo = i <= idxAtual;
              const atual = i === idxAtual;
              return (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${
                      ativo ? 'bg-sangue text-papel' : 'bg-sebo text-carvao/60'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-sm font-medium ${atual ? 'text-sangue' : ativo ? 'text-carvao' : 'text-carvao/60'}`}>
                    {label}
                  </span>
                  {atual && <span className="ml-auto text-xs text-sangue font-semibold">agora</span>}
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mt-4 bg-azulejo border border-sebo rounded-xl p-4">
          <div className="font-display font-bold uppercase text-sm mb-2">Resumo</div>
          <ul className="text-sm space-y-1">
            {pedido.itens.map((it, i) => {
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
          <div className="mt-3 pt-3 border-t border-sebo flex justify-between text-sm">
            <span>Total</span>
            <span className="font-mono font-bold">{brl(pedido.total)}</span>
          </div>
        </section>

        <div className="mt-4 rounded-md bg-sebo-claro p-3 text-sm">
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

        <div className="mt-4 text-sm text-carvao/60 flex items-center gap-2">
          {pedido.retirada === 'entrega' ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />}
          {pedido.retirada === 'entrega' ? `Entrega em ${pedido.endereco}` : 'Retirada no balcão'}
        </div>
      </main>
    </>
  );
}
