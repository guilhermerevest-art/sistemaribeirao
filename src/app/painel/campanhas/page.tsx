'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarTelefone } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import type { Cliente, Frequencia, Pedido } from '@/lib/types';

function info(c: Cliente, pedidos: Pedido[]) {
  const ped = pedidos.filter((p) => p.clienteId === c.id);
  ped.sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
  const ultimo = ped[0]?.criadoEm;
  const dias = ultimo ? Math.floor((Date.now() - new Date(ultimo).getTime()) / 86400000) : 9999;
  const noventaAtras = new Date();
  noventaAtras.setDate(noventaAtras.getDate() - 90);
  const ped90 = ped.filter((p) => new Date(p.criadoEm) >= noventaAtras).length;
  const diasCadastro = Math.floor((Date.now() - new Date(c.criadoEm).getTime()) / 86400000);
  let g: Frequencia = 'ocasional';
  if (dias >= 60) g = 'inativo';
  else if (dias >= 31) g = 'em_risco';
  else if (ped90 >= 6 && dias <= 15) g = 'fiel';
  else if (ped90 <= 1 && diasCadastro <= 30) g = 'novo';
  return { dias, g };
}

export default function CampanhasPage() {
  const clientes = useStore((s) => s.clientes);
  const pedidos = useStore((s) => s.pedidos);

  const grupos = useMemo(() => {
    const out: Record<Frequencia, Cliente[]> = {
      novo: [], fiel: [], ocasional: [], em_risco: [], inativo: [],
    };
    for (const c of clientes) {
      if (!c.aceitaWhatsapp) continue;
      out[info(c, pedidos).g].push(c);
    }
    return out;
  }, [clientes, pedidos]);

  const linkPara = (c: Cliente, dias: number) => {
    const msg = encodeURIComponent(
      `Oi ${c.nome.split(' ')[0]}, aqui é do Açougue Ribeirão. ${dias < 9999 ? `Faz ${dias} dias que você não aparece. ` : ''}Você tem ${brl(c.saldoCashback)} de cashback pra usar. Quer que eu separe alguma coisa?`,
    );
    const tel = c.telefone.replace(/\D/g, '');
    return `https://wa.me/55${tel}?text=${msg}`;
  };

  return (
    <div className="min-h-screen bg-papel">
      <header className="bg-carvao text-papel p-4 sticky top-0 z-30">
        <div className="mx-auto max-w-4xl flex items-center gap-3">
          <Link href="/painel"><ChevronLeft className="w-5 h-5" /></Link>
          <div className="font-display font-extrabold text-xl uppercase">Campanhas</div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <p className="text-sm text-carvao/70">
          Monte listas de mensagens prontas para enviar no WhatsApp Business.
          Cada link abre a conversa com o cliente e a mensagem personalizada.
        </p>
        {(['em_risco', 'inativo', 'fiel', 'novo', 'ocasional'] as Frequencia[]).map((g) => (
          <section key={g} className="bg-azulejo border border-sebo rounded-xl p-4">
            <div className="font-display font-bold uppercase text-sm mb-3 capitalize">{g.replace('_', ' ')} ({grupos[g].length})</div>
            <ul className="space-y-1">
              {grupos[g].slice(0, 5).map((c) => {
                const i = info(c, pedidos);
                return (
                  <li key={c.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">{c.nome}</span>
                    <span className="font-mono text-xs text-carvao/60">{formatarTelefone(c.telefone)}</span>
                    <a href={linkPara(c, i.dias)} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm"><MessageCircle className="w-4 h-4" /></Button>
                    </a>
                  </li>
                );
              })}
              {grupos[g].length > 5 && (
                <li className="text-xs text-carvao/60">+ {grupos[g].length - 5} outros. Veja a lista completa em <Link href="/painel/clientes" className="underline">Clientes</Link>.</li>
              )}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
