import { cn } from '@/lib/formato';
import type { ReactNode } from 'react';

type Tone = 'sangue' | 'brasa' | 'papel' | 'carvao' | 'sebo' | 'verde' | 'amarelo';

const tones: Record<Tone, string> = {
  sangue: 'bg-sangue text-papel',
  brasa: 'bg-brasa text-papel',
  papel: 'bg-papel text-carvao',
  carvao: 'bg-carvao text-papel',
  sebo: 'bg-sebo text-carvao',
  verde: 'bg-[color:var(--verde-fiel)] text-papel',
  amarelo: 'bg-[color:var(--amarelo-novo)] text-papel',
};

export function Badge({
  tone = 'sebo',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
