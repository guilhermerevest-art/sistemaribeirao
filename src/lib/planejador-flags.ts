// Flags temporárias deixadas pelo planejador de churrasco pra
// serem consumidas no próximo checkout (observacaoGeral). Após o
// pedido ser criado, limpamos.

const CHAVE = 'ribeirao-ultimo-resumo-planejador-v1';

export function setResumoPlanejador(texto: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CHAVE, texto);
  } catch {}
}

export function consumirResumoPlanejador(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(CHAVE);
    if (v) window.localStorage.removeItem(CHAVE);
    return v;
  } catch {
    return null;
  }
}
