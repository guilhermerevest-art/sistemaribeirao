import { cn } from '@/lib/formato';
import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn('bg-azulejo border border-sebo rounded-xl p-4', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
