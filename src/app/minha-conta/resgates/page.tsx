'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { HeaderLoja } from '@/components/loja/header';
import { Button } from '@/components/ui/button';
import { Gift, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ImagemProduto } from '@/components/ui/imagem-produto';

export default function ResgatesPage() {
  const router = useRouter();
  const clienteAtualId = useStore((s) => s.clienteAtualId);
  const cliente = useStore((s) => s.clientes.find((c) => c.id === clienteAtualId));
  const resgates = useStore((s) => s.resgates);
  const debitar = useStore((s) => s.debitarPontos);

  if (!cliente) {
    return (
      <>
        <HeaderLoja />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-carvao/70">Você ainda não se identificou.</p>
          <Button className="mt-4" onClick={() => router.push('/loja/checkout')}>
            Identificar pelo celular
          </Button>
        </main>
      </>
    );
  }

  const resgatar = async (id: string, nome: string, custo: number) => {
    if (cliente.pontos < custo) {
      toast.error(`Faltam ${custo - cliente.pontos} pontos`);
      return;
    }
    const ok = await debitar(cliente.id, id);
    if (ok) {
      toast.success(`${nome} resgatado! Vá até o balcão.`);
    }
  };

  return (
    <>
      <HeaderLoja />
      <main className="mx-auto max-w-3xl px-4 pb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-carvao/60 hover:text-carvao mt-3"
        >
          <ChevronLeft className="w-4 h-4" /> voltar
        </button>
        <h1 className="font-display font-extrabold text-2xl uppercase mt-3 flex items-center gap-2">
          <Gift className="w-6 h-6" /> Resgate seus pontos
        </h1>
        <p className="text-sm text-carvao/70 mt-1">
          Você tem <strong>{cliente.pontos}</strong> pontos disponíveis.
        </p>

        <ul className="mt-4 space-y-3">
          {resgates.filter((r) => r.ativo).map((r) => {
            const pode = cliente.pontos >= r.custoPontos;
            return (
              <li key={r.id} className="bg-azulejo border border-sebo rounded-xl p-3 flex items-center gap-3">
                <ImagemProduto src={r.imagem} alt={r.nome} className="w-16 h-16 rounded-md object-cover bg-sebo-claro shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold uppercase text-sm">{r.nome}</div>
                  <div className="text-xs text-carvao/70 font-mono">{r.custoPontos} pontos</div>
                </div>
                <button
                  onClick={() => resgatar(r.id, r.nome, r.custoPontos)}
                  disabled={!pode}
                  className={`h-11 px-4 rounded-md font-semibold ${pode ? 'bg-sangue text-papel' : 'bg-sebo text-carvao/60 cursor-not-allowed'}`}
                >
                  Resgatar
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
