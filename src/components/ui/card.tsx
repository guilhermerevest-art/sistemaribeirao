import { cn } from '@/lib/formato';
import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn('bg-branco border border-cinza-claro rounded-xl p-4', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
