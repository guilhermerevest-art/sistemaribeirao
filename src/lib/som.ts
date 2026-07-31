// Bip curtinho pra avisar o atendente que chegou pedido novo na
// bancada. Usa Web Audio (oscillator) pra não depender de arquivo:
// 880 Hz por 200 ms, com envelope rápido pra não estourar.
//
// Roda só no browser, é no-op em SSR. Se o usuário estiver com mudo
// no sistema operacional ou se `AudioContext` for bloqueado
// (autoplay policy antes do primeiro gesto), falhamos silencioso —
// o app continua funcionando, só sem som.

let cachedCtx: AudioContext | null = null;

function pegarCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (cachedCtx) return cachedCtx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    cachedCtx = new Ctor();
  } catch {
    return null;
  }
  return cachedCtx;
}

export function tocarBipNovoPedido() {
  const ctx = pegarCtx();
  if (!ctx) return;
  // Alguns navegadores criam o contexto suspenso até o primeiro gesto.
  if (ctx.state === 'suspended') void ctx.resume();
  const agora = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, agora);
  // Envelope: ataque 10 ms, sustain 180 ms, release 80 ms.
  gain.gain.setValueAtTime(0, agora);
  gain.gain.linearRampToValueAtTime(0.18, agora + 0.01);
  gain.gain.linearRampToValueAtTime(0.18, agora + 0.19);
  gain.gain.linearRampToValueAtTime(0, agora + 0.27);
  osc.connect(gain).connect(ctx.destination);
  osc.start(agora);
  osc.stop(agora + 0.3);
}