'use client';

// Wrapper que permite "arrastar pra esquerda" pra remover o item.
// Usa Pointer Events pra funcionar no touch + mouse. Threshold de
// 80 px e lock vertical (não interfere em scroll). Quando solta
// além do limite, dispara `onDelete`.

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface Props {
  onDelete: () => void;
  children: React.ReactNode;
  /** Largura (px) que o usuário precisa arrastar pra confirmar exclusão. */
  threshold?: number;
}

export function ItemSwipeable({ onDelete, children, threshold = 80 }: Props) {
  const [dx, setDx] = useState(0);
  const [abrindo, setAbrindo] = useState(false);
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  const onDown = (e: React.PointerEvent) => {
    // Ignora se o usuário clicou num botão/link dentro do card.
    if ((e.target as HTMLElement).closest('button, a, input, textarea, select')) return;
    start.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const deltaX = e.clientX - start.current.x;
    const deltaY = e.clientY - start.current.y;
    // Se a componente vertical domina, ignora — não queremos roubar
    // o scroll do usuário.
    if (Math.abs(deltaY) > Math.abs(deltaX) + 8) return;
    // Limita o arrasto à esquerda até a largura do card.
    const clamped = Math.max(-240, Math.min(0, deltaX));
    setDx(clamped);
    setAbrindo(clamped < -20);
  };

  const onUp = () => {
    if (!start.current) return;
    const shouldDelete = dx < -threshold;
    start.current = null;
    if (shouldDelete) {
      onDelete();
    }
    setDx(0);
    setAbrindo(false);
  };

  return (
    <div className="relative">
      {/* Fundo vermelho com ícone de lixeira — aparece ao arrastar */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl flex items-center justify-end px-4 transition-opacity',
          'bg-vermelho-risco text-branco',
          abrindo ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden
      >
        <Trash2 className="w-5 h-5" />
        <span className="ml-2 text-sm font-bold uppercase">Soltar pra remover</span>
      </div>
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dx === 0 ? 'transform 180ms ease-out' : 'none',
          touchAction: 'pan-y',
        }}
        className="relative"
      >
        {children}
      </div>
    </div>
  );
}
