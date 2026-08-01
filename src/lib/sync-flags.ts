// Flags compartilhadas entre o store e o hook de polling entre abas.
// Mantido num arquivo neutro pra evitar ciclo entre lib/store.ts
// (que precisa sinalizar "este pedido veio desta aba") e
// components/ui/sync.tsx (que lê a flag no polling).

export function marcarCriadoLocalmente(id: string) {
  if (typeof window === 'undefined') return;
  const w = window as Window & { __ribeiraoCriadoLocal?: { id: string; ate: number } };
  w.__ribeiraoCriadoLocal = { id, ate: Date.now() + 5_000 };
}

export function lerCriadoLocalmente(): { id: string; ate: number } | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as Window & { __ribeiraoCriadoLocal?: { id: string; ate: number } };
  const v = w.__ribeiraoCriadoLocal;
  if (v && v.ate < Date.now()) {
    delete w.__ribeiraoCriadoLocal;
    return undefined;
  }
  return v;
}