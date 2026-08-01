// Componente client-only que dispara o fetch inicial do store.
// Renderiza um splash discreto enquanto carrega, e nunca bloqueia a UI.

'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { lerSnapshotOffline } from '@/lib/persistencia';

export function Hydrate() {
  const carregarTudo = useStore((s) => s.carregarTudo);
  const carregando = useStore((s) => s.carregando);
  const carregado = useStore((s) => s.carregado);
  const online = useStore((s) => s.online);
  const erro = useStore((s) => s.erro);
  const [temSnapshot, setTemSnapshot] = useState(false);

  // Modo debug: ?safe=1 na URL pula o Hydrate pra confirmar se ele é
  // a fonte do mismatch.
  const safe = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('safe') === '1';

  useEffect(() => {
    if (safe) return;
    setTemSnapshot(!!lerSnapshotOffline());
    if (!carregado && !carregando) {
      void carregarTudo();
    }
  }, [carregarTudo, carregado, carregando, safe]);

  // Feedback discreto em modo demo offline.
  if (carregado && !online) {
    return (
      <div className="fixed bottom-3 right-3 z-50 rounded-md border border-sebo bg-azulejo/95 px-3 py-2 text-xs text-carvao shadow-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brasa" />
        {temSnapshot ? 'Demo offline · dados salvos neste navegador' : 'Demo offline · seed em memória'}
      </div>
    );
  }

  return null;
}

