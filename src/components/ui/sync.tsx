'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';

// Sincronia entre abas: polling de 2s comparando o último pedido novo.
// Pedidos novos que aparecem no state (vindos de outra aba ou outro
// dispositivo) disparam recarregarPedidos() pra puxar a lista nova.
export function useSyncEntreAbas() {
  const carregado = useRef(false);
  const ultimoId = useRef<string | null>(null);

  useEffect(() => {
    function checar() {
      const s = useStore.getState();
      const novo = s.pedidos[0]?.id ?? null;
      if (carregado.current && novo !== ultimoId.current) {
        // Outro lugar inseriu pedido; recarrega pra ter dados frescos.
        void s.recarregarPedidos();
      }
      ultimoId.current = novo;
      carregado.current = true;
    }
    const i = setInterval(checar, 2000);
    window.addEventListener('storage', checar);
    return () => {
      clearInterval(i);
      window.removeEventListener('storage', checar);
    };
  }, []);
}

// Avanço automático de status (mock para a demo).
export function useAutoAvanco() {
  useEffect(() => {
    const t = setInterval(() => {
      const s = useStore.getState();
      const agora = Date.now();
      const atualizar = s.atualizarStatusPedido;
      for (const p of s.pedidos) {
        if (p.status === 'novo') {
          const idade = agora - new Date(p.criadoEm).getTime();
          if (idade >= 90_000) void atualizar(p.id, 'preparando');
        } else if (p.status === 'preparando') {
          const idade = agora - new Date(p.criadoEm).getTime();
          if (idade >= 180_000) void atualizar(p.id, 'pronto');
        }
      }
    }, 5000);
    return () => clearInterval(t);
  }, []);
}

// Fila de impressão automática: detecta pedidos "novo" que ainda não
// existiam quando o hook montou (ou seja, chegaram depois) e devolve
// os ids para o componente <ImpressaoAutomatica /> imprimir.
function useFilaImpressaoAutomatica(): { fila: string[]; concluir: (id: string) => void } {
  const pedidos = useStore((s) => s.pedidos);
  const impressaoAutomatica = useStore((s) => s.impressaoAutomatica);
  const conhecidos = useRef<Set<string> | null>(null);
  const [fila, setFila] = useState<string[]>([]);

  useEffect(() => {
    if (conhecidos.current === null) {
      // Primeira carga: registra o que já existe, sem imprimir nada.
      conhecidos.current = new Set(pedidos.map((p) => p.id));
      return;
    }
    const novos = pedidos.filter((p) => p.status === 'novo' && !conhecidos.current!.has(p.id));
    for (const p of pedidos) conhecidos.current.add(p.id);
    if (novos.length > 0 && impressaoAutomatica) {
      setFila((f) => [...f, ...novos.map((p) => p.id)]);
    }
  }, [pedidos, impressaoAutomatica]);

  const concluir = (id: string) => setFila((f) => f.filter((x) => x !== id));

  return { fila, concluir };
}

function IframeImpressao({ pedidoId, onDone }: { pedidoId: string; onDone: (id: string) => void }) {
  useEffect(() => {
    // Segurança: se o aviso de "impresso" não chegar (ex: navegador sem
    // suporte a onafterprint), remove o iframe depois de um tempo.
    const t = setTimeout(() => onDone(pedidoId), 10_000);
    return () => clearTimeout(t);
  }, [pedidoId, onDone]);

  return (
    <iframe
      src={`/bancada/cupom/${pedidoId}?auto=1`}
      title={`Impressão automática do pedido ${pedidoId}`}
      aria-hidden
      style={{ position: 'fixed', left: -9999, top: 0, width: 320, height: 700, border: 0 }}
    />
  );
}

// Renderiza um iframe oculto por pedido novo, que se auto-imprime.
// Depende da impressora térmica estar configurada como padrão do
// Windows e do navegador rodar com a flag --kiosk-printing (ver README).
export function ImpressaoAutomatica() {
  const { fila, concluir } = useFilaImpressaoAutomatica();

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.tipo === 'ribeirao-cupom-impresso' && typeof e.data.pedidoId === 'string') {
        concluir(e.data.pedidoId);
      }
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [concluir]);

  if (fila.length === 0) return null;

  return (
    <>
      {fila.map((id) => (
        <IframeImpressao key={id} pedidoId={id} onDone={concluir} />
      ))}
    </>
  );
}
