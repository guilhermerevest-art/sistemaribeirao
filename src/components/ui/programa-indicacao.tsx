'use client';

// Card do programa de indicação exibido na /minha-conta. Mostra o
// código único do cliente, link de compartilhamento com `?ref=`
// embutido, e a contagem de quantos amigos indicou + quanto ganhou.

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { brl } from '@/lib/formato';
import { RECOMPENSA_INDICACAO, gerarCodigoIndicacao, mensagemIndicacao } from '@/lib/referral';
import { Copy, Check, Users, MessageCircle, Share2, Gift, Award } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export function ProgramaIndicacao() {
  const clienteAtualId = useStore((s) => s.clienteAtualId);
  const cliente = useStore((s) => s.clientes.find((c) => c.id === clienteAtualId));
  const indicacoes = useStore((s) =>
    s.indicacoes.filter((i) => i.indicadorId === clienteAtualId),
  );
  const [copiado, setCopiado] = useState(false);

  // Garante que todo cliente tenha código — pega do cliente ou gera on-demand.
  const codigo = useMemo(() => {
    if (!cliente) return '';
    return cliente.codigoIndicacao ?? gerarCodigoIndicacao(cliente);
  }, [cliente]);

  const urlLoja = typeof window !== 'undefined' ? `${window.location.origin}/loja` : '/loja';
  const linkConvite = `${urlLoja}${urlLoja.includes('?') ? '&' : '?'}ref=${codigo}`;

  const totalConvertido = indicacoes.filter((i) => i.status === 'convertido').length;
  const totalGanho = totalConvertido * RECOMPENSA_INDICACAO;

  const copiar = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopiado(true);
      toast.success('Copiado!');
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      toast.error('Não consegui copiar — copie manualmente.');
    }
  };

  if (!cliente) return null;

  return (
    <section className="mt-4 rounded-2xl bg-preto text-branco p-5 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amarelo/20 rounded-full blur-3xl" aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-5 h-5 text-amarelo" />
          <h3 className="font-display font-extrabold uppercase">Indique e ganhe</h3>
        </div>
        <p className="text-sm text-branco/80">
          Cada amigo que fizer o primeiro pedido por seu link te dá{' '}
          <strong className="text-amarelo">R$ {RECOMPENSA_INDICACAO.toFixed(2)}</strong> de cashback.
        </p>

        {/* Código */}
        <div className="mt-4 rounded-lg bg-branco/10 p-3">
          <div className="text-[10px] uppercase tracking-wider text-branco/60 font-semibold">Seu código</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="font-mono font-extrabold text-2xl tracking-wider text-amarelo">{codigo}</div>
            <button
              onClick={() => copiar(codigo)}
              className="ml-auto w-10 h-10 grid place-items-center rounded-md bg-branco/15 hover:bg-branco/25"
              aria-label="Copiar código"
            >
              {copiado ? <Check className="w-4 h-4 text-verde-fiel" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="mt-2 text-xs text-branco/60 break-all">{linkConvite}</div>
        </div>

        {/* Botões de ação */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(mensagemIndicacao({ nomeIndicador: cliente.nome, codigoIndicador: codigo, urlLoja }))}`}
            target="_blank"
            rel="noreferrer"
            className="h-11 rounded-lg bg-verde-fiel text-branco font-bold uppercase text-xs flex items-center justify-center gap-1.5 hover:bg-verde-fiel/90"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
          <button
            onClick={() => copiar(linkConvite)}
            className="h-11 rounded-lg bg-amarelo text-preto font-bold uppercase text-xs flex items-center justify-center gap-1.5 hover:bg-amarelo/90"
          >
            <Share2 className="w-4 h-4" /> Copiar link
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-branco/10 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-branco/60 font-semibold flex items-center justify-center gap-1">
              <Users className="w-3 h-3" /> Indicados
            </div>
            <div className="font-mono font-extrabold text-2xl mt-1">{totalConvertido}</div>
          </div>
          <div className="rounded-lg bg-branco/10 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-branco/60 font-semibold flex items-center justify-center gap-1">
              <Award className="w-3 h-3" /> Ganho
            </div>
            <div className="font-mono font-extrabold text-2xl mt-1 text-amarelo">{brl(totalGanho)}</div>
          </div>
        </div>

        {totalConvertido === 0 && (
          <p className="mt-3 text-xs text-branco/60 text-center">
            Mande no grupo da família. Na próxima sexta, eles já fizeram o pedido.
          </p>
        )}
      </div>
    </section>
  );
}
