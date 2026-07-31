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

  useEffect(() => {
    setTemSnapshot(!!lerSnapshotOffline());
    if (!carregado && !carregando) {
      void carregarTudo();
    }
  }, [carregarTudo, carregado, carregando]);

  // Feedback discreto em modo demo offline.
  if (carregado && !online) {
    return (
      <>
        <div
          className="fixed top-2 right-2 z-50 rounded-full border border-sebo bg-azulejo/95 px-2 py-1 text-[10px] text-carvao shadow-sm flex items-center gap-1.5"
          title="Modo demo offline — alterações ficam só neste navegador"
        >
          <span className="w-2 h-2 rounded-full bg-brasa animate-pulse" />
          Offline
        </div>
        <div className="hidden">
          {temSnapshot ? 'Demo offline · dados salvos neste navegador' : 'Demo offline · seed em memória'}
        </div>
      </>
    );
  }

  if (carregado && online && erro) {
    return (
      <div
        className="fixed top-2 right-2 z-50 rounded-full border border-sebo bg-amarelo/95 px-2 py-1 text-[10px] text-preto shadow-sm"
        title={erro}
      >
        ⚠ Modo degradado
      </div>
    );
  }

  return null;
}

