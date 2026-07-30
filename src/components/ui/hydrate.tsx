// Componente client-only que dispara o fetch inicial do store.
// Renderiza um splash discreto enquanto carrega, e nunca bloqueia a UI.

'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function Hydrate() {
  const carregarTudo = useStore((s) => s.carregarTudo);
  const carregando = useStore((s) => s.carregando);
  const carregado = useStore((s) => s.carregado);
  const online = useStore((s) => s.online);
  const erro = useStore((s) => s.erro);

  useEffect(() => {
    if (!carregado && !carregando) {
      void carregarTudo();
    }
  }, [carregarTudo, carregado, carregando]);

  // Feedback discreto em modo demo offline.
  if ((carregando || (!carregado && erro)) && !online) {
    return (
      <div className="fixed bottom-3 right-3 z-50 rounded-md border border-sebo bg-azulejo/95 px-3 py-2 text-xs text-carvao shadow-sm">
        Modo demo offline · dados em memória
      </div>
    );
  }

  return null;
}
