'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

// Sincronia entre abas: polling de 2s + storage event.
export function useSyncEntreAbas() {
  const carregado = useRef(false);
  useEffect(() => {
    function checar() {
      try {
        const raw = localStorage.getItem('ribeirao-mock-v1');
        if (!raw) return;
        const data = JSON.parse(raw);
        const novoSeq = data?.state?.proximoPedido ?? 0;
        const seqAtual = useStore.getState().proximoPedido;
        if (novoSeq !== seqAtual) {
          // Rehidrata o store.
          useStore.persist.rehydrate();
        }
      } catch {
        // silencioso
      }
    }
    const i = setInterval(checar, 2000);
    window.addEventListener('storage', checar);
    carregado.current = true;
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
      const atualizados = s.pedidos.map((p) => {
        if (p.status === 'novo') {
          const idade = agora - new Date(p.criadoEm).getTime();
          if (idade >= 90_000) return { ...p, status: 'preparando' as const };
        } else if (p.status === 'preparando') {
          const idade = agora - new Date(p.criadoEm).getTime();
          if (idade >= 180_000) return { ...p, status: 'pronto' as const };
        }
        return p;
      });
      const mudou = atualizados.some((p, i) => p.status !== s.pedidos[i]?.status);
      if (mudou) {
        useStore.setState({ pedidos: atualizados });
      }
    }, 5000);
    return () => clearInterval(t);
  }, []);
}
