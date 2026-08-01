'use client';

// Boas-vindas ao cliente recém-criado: modal com QR code apontando
// pra URL da loja. Detecta quando clienteAtualId mudou nos últimos
// 60 s e mostra o modal uma vez.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, X, Smartphone } from 'lucide-react';

const CHAVE = 'ribeirao-boasvindas-visto-v1';

// Marca o clienteAtualId como "já viu as boas-vindas". Persistido em
// localStorage pra não mostrar de novo quando o cliente volta mais
// tarde. Diferente do tour, é por-cliente.
function marcarVisto(clienteId: string) {
  try {
    const raw = window.localStorage.getItem(CHAVE);
    const map = raw ? (JSON.parse(raw) as Record<string, true>) : {};
    map[clienteId] = true;
    window.localStorage.setItem(CHAVE, JSON.stringify(map));
  } catch {}
}

function jaViu(clienteId: string): boolean {
  try {
    const raw = window.localStorage.getItem(CHAVE);
    if (!raw) return false;
    const map = JSON.parse(raw) as Record<string, true>;
    return Boolean(map[clienteId]);
  } catch {
    return false;
  }
}

interface Props {
  clienteId: string;
  criadoEm: string;
  nome: string;
}

export function BoasVindasCliente({ clienteId, criadoEm, nome }: Props) {
  const [aberto, setAberto] = useState(false);
  const [urlLoja, setUrlLoja] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (jaViu(clienteId)) return;
    // Cliente recém-criado = criadoEm há menos de 60s.
    const idade = Date.now() - new Date(criadoEm).getTime();
    if (idade > 60_000) return;
    setUrlLoja(`${window.location.origin}/loja`);
    setAberto(true);
  }, [clienteId, criadoEm]);

  if (!aberto) return null;

  const fechar = () => {
    marcarVisto(clienteId);
    setAberto(false);
  };

  // QR via API pública (sem dependência). Em produção, troque por um
  // encoder local pra evitar dependência de rede.
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(urlLoja)}`;

  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center sm:justify-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-preto/70" onClick={fechar} />
      <div className="relative w-full sm:max-w-md sm:mx-4 bg-branco rounded-t-2xl sm:rounded-2xl shadow-2xl border border-sebo overflow-hidden animate-entrada">
        <div className="absolute top-3 right-3">
          <button
            onClick={fechar}
            className="w-8 h-8 grid place-items-center rounded-md text-preto/60 hover:bg-cinza-claro"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amarelo/20 px-3 py-1 text-xs uppercase tracking-wider font-semibold text-amarelo-700">
            <Sparkles className="w-3.5 h-3.5" />
            Bem-vindo, {nome.split(' ')[0]}!
          </div>
          <h2 className="mt-3 font-display font-extrabold text-2xl uppercase tracking-tight">
            Sua conta tá pronta
          </h2>
          <p className="mt-2 text-sm text-preto/70">
            Salve a loja no celular pra não perder a oferta relâmpago quando rolar.
          </p>

          <div className="mt-5 inline-block p-3 bg-branco border-2 border-preto rounded-xl">
            <img
              src={qrSrc}
              alt="QR Code da loja"
              width={200}
              height={200}
              className="block"
              loading="lazy"
            />
          </div>

          <div className="mt-3 font-mono text-xs text-preto/60 break-all">{urlLoja}</div>

          <Link
            href="/loja"
            onClick={fechar}
            className="mt-5 inline-flex items-center gap-2 h-12 px-5 rounded-lg bg-vermelho text-branco font-extrabold uppercase hover:bg-vermelho/90"
          >
            <Smartphone className="w-4 h-4" /> Começar a comprar
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper pra checar se já viu (caso queira usar em outros lugares).
export { jaViu as boasVindasJaViu };
