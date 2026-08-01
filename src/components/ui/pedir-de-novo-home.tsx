'use client';

// Card grande de "Pedir de novo" pra home — aparece quando o cliente
// tem pedidos no histórico. Pega o pedido mais recente, mostra um
// resumo e oferece clonar o carrinho em 1 clique.

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarHora } from '@/lib/formato';
import { Repeat, ChevronRight, ShoppingBag, User } from 'lucide-react';
import { toast } from 'sonner';

export function PedirDeNovoHome() {
  const router = useRouter();
  const clienteAtualId = useStore((s) => s.clienteAtualId);
  const cliente = useStore((s) => s.clientes.find((c) => c.id === clienteAtualId));
  const pedidos = useStore((s) =>
    s.pedidos
      .filter((p) => p.clienteId === clienteAtualId && p.status !== 'cancelado')
      .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1)),
  );
  const produtos = useStore((s) => s.produtos);
  const combos = useStore((s) => s.combos);
  const clonarItens = useStore((s) => s.clonarItensParaCarrinho);
  const setClienteAtual = useStore((s) => s.setClienteAtual);

  const ultimo = pedidos[0];

  const resumo = useMemo(() => {
    if (!ultimo) return null;
    const nomes = ultimo.itens.slice(0, 3).map((it) => {
      if (it.comboId) {
        const c = combos.find((x) => x.id === it.comboId);
        return c ? `Combo ${c.nome}` : 'Combo';
      }
      const p = produtos.find((x) => x.id === it.produtoId);
      return p?.nome ?? 'Item';
    });
    const extras = ultimo.itens.length - nomes.length;
    return {
      nomes,
      extras,
      total: ultimo.total,
      itens: ultimo.itens.length,
      quando: ultimo.criadoEm,
    };
  }, [ultimo, combos, produtos]);

  if (!cliente || !ultimo || !resumo) return null;

  const handleRepetir = async () => {
    clonarItens(ultimo.itens);
    await setClienteAtual(cliente.id);
    toast.success('Pedido copiado pro carrinho');
    router.push('/loja/carrinho');
  };

  return (
    <section className="mx-auto max-w-5xl px-4 pt-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-vermelho via-vermelho to-preto text-branco p-5 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amarelo/20 rounded-full blur-3xl" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-full bg-amarelo text-preto grid place-items-center font-mono font-bold">
              {cliente.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-branco/70 font-semibold">
                <User className="w-3 h-3 inline mr-1" />
                Olá, {cliente.nome.split(' ')[0]}
              </div>
              <div className="font-display font-extrabold uppercase text-lg leading-tight truncate">
                Quer repetir o último pedido?
              </div>
            </div>
          </div>

          <div className="hidden sm:block w-px h-12 bg-branco/30" />

          <div className="flex-1 min-w-0">
            <div className="text-sm">
              <span className="text-branco/70">Pedido </span>
              <span className="font-mono font-bold">#{ultimo.id}</span>
              <span className="text-branco/70"> · {formatarData(resumo.quando)} {formatarHora(resumo.quando)}</span>
            </div>
            <div className="text-sm text-branco/85 mt-1 truncate">
              {resumo.nomes.join(', ')}{resumo.extras > 0 ? ` +${resumo.extras}` : ''}
            </div>
            <div className="text-xs text-branco/60 mt-1">
              {resumo.itens} {resumo.itens === 1 ? 'item' : 'itens'} · <span className="font-mono font-bold">{brl(resumo.total)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRepetir}
              className="h-12 px-5 rounded-lg bg-amarelo text-preto font-extrabold uppercase tracking-wide flex items-center gap-2 hover:bg-amarelo/90 active:translate-y-px"
            >
              <Repeat className="w-4 h-4" /> Pedir de novo
            </button>
            <Link
              href="/minha-conta"
              className="h-12 w-12 rounded-lg bg-branco/15 grid place-items-center hover:bg-branco/25"
              title="Ver histórico"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EntrarComoCliente() {
  const router = useRouter();
  return (
    <section className="mx-auto max-w-5xl px-4 pt-6">
      <Link
        href="/loja/checkout"
        className="block rounded-2xl border-2 border-dashed border-amarelo bg-amarelo/10 p-5 hover:bg-amarelo/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amarelo text-preto grid place-items-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="font-display font-extrabold uppercase">Identificar pelo celular</div>
            <div className="text-sm text-preto/70">
              Sem cadastro, sem senha. Você acumula cashback, pontos e pedidos de onde parou.
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-preto/40" />
        </div>
      </Link>
    </section>
  );
}
