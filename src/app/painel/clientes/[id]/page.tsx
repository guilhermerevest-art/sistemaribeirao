'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { brl, cashbackExpiraEmBreve, formatarData, formatarHora, formatarTelefone, linkWhatsAppReativacao } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MessageCircle, AlertTriangle, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { useNoIndex } from '@/components/ui/use-no-index';

export default function ClienteDetalhePage() {
  useNoIndex();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const cliente = useStore((s) => s.clientes.find((c) => c.id === params.id));
  const pedidos = useStore((s) => s.pedidos.filter((p) => p.clienteId === params.id));
  const produtos = useStore((s) => s.produtos);
  const combos = useStore((s) => s.combos);
  const clonarItens = useStore((s) => s.clonarItensParaCarrinho);
  const setClienteAtual = useStore((s) => s.setClienteAtual);

  if (!cliente) {
    return (
      <div className="p-8">
        <p>Cliente não encontrado.</p>
        <Link href="/painel/clientes"><Button className="mt-4">Voltar</Button></Link>
      </div>
    );
  }

  const whatsapp = linkWhatsAppReativacao({
    nome: cliente.nome,
    telefone: cliente.telefone,
    diasSemCompra: pedidos.length
      ? Math.floor((Date.now() - new Date(pedidos[0].criadoEm).getTime()) / 86400000)
      : 0,
    saldo: cliente.saldoCashback,
    validadeISO: cliente.cashbackExpiraEm,
  });

  return (
    <div className="min-h-screen bg-papel pb-8">
      <header className="bg-carvao text-papel sticky top-0 z-30">
        <div className="mx-auto max-w-4xl px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3">
          <Link href="/painel/clientes" aria-label="Voltar" className="shrink-0 grid place-items-center w-10 h-10 -ml-1.5 rounded-md hover:bg-papel/10">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="font-display font-extrabold text-base sm:text-xl uppercase truncate min-w-0">{cliente.nome}</div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
        <section className="bg-azulejo border border-sebo rounded-xl p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Campo label="Telefone" valor={formatarTelefone(cliente.telefone)} />
            <Campo label="Cashback" valor={brl(cliente.saldoCashback)} />
            <Campo label="Pontos" valor={String(cliente.pontos)} />
            <Campo label="Acumulado" valor={String(cliente.pontosAcumuladoTotal)} />
          </div>
          {cashbackExpiraEmBreve(cliente.cashbackExpiraEm) && cliente.saldoCashback > 0 && (
            <div className="mt-3 rounded-md bg-vermelho-risco/10 border border-vermelho-risco px-3 py-2 text-xs flex items-center gap-2 text-vermelho-risco font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Cashback vence em {cliente.cashbackExpiraEm ? formatarData(cliente.cashbackExpiraEm) : 'breve'} — chame antes que vire prejuízo.
            </div>
          )}
          {cliente.aceitaWhatsapp && (
            <a href={whatsapp} target="_blank" rel="noreferrer" className="block mt-4">
              <Button size="lg" className="w-full sm:w-auto"><MessageCircle className="w-4 h-4 mr-1" /> Chamar no WhatsApp</Button>
            </a>
          )}
        </section>

        <section className="mt-4">
          <div className="font-display font-bold uppercase text-sm mb-2">Histórico</div>
          {pedidos.length === 0 ? (
            <div className="bg-azulejo border border-sebo rounded-xl p-6 text-center text-sm text-carvao/60">Nenhum pedido.</div>
          ) : (
            <ul className="space-y-2">
              {pedidos.map((p) => (
                <li key={p.id} className="bg-azulejo border border-sebo rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="font-mono font-bold text-lg">{p.id}</div>
                    <div className="text-xs text-carvao/60">{formatarData(p.criadoEm)} · {formatarHora(p.criadoEm)}</div>
                    <div className="ml-auto font-mono font-bold">{brl(p.total)}</div>
                  </div>
                  <ul className="text-xs text-carvao/70 mt-2">
                    {p.itens.map((it, i) => {
                      if (it.comboId) {
                        const combo = combos.find((x) => x.id === it.comboId);
                        return (
                          <li key={i} className="font-mono">
                            {it.pesoKg}x · Combo {combo?.nome} · {brl(it.subtotal)}
                          </li>
                        );
                      }
                      const prod = produtos.find((x) => x.id === it.produtoId);
                      return (
                        <li key={i} className="font-mono">
                          {it.pesoKg.toFixed(2).replace('.', ',')} kg · {prod?.nome} · {brl(it.subtotal)}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="text-xs text-brasa mt-2">+ {brl(p.cashbackGerado)} de cashback · {p.pontosGerados} pontos</div>
                  <button
                    onClick={async () => {
                      clonarItens(p.itens);
                      await setClienteAtual(cliente.id);
                      toast.success('Pedido copiado pro carrinho');
                      router.push('/loja/carrinho');
                    }}
                    className="mt-3 h-10 px-3 rounded-md bg-sangue text-papel text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Repeat className="w-3.5 h-3.5" /> Pedir de novo
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-carvao/60 truncate">{label}</div>
      <div className="font-mono font-semibold mt-1 truncate">{valor}</div>
    </div>
  );
}
