'use client';

import { cn } from '@/lib/formato';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'amarelo';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const variantClass: Record<Variant, string> = {
  primary: 'bg-vermelho text-branco hover:bg-vermelho/90 active:translate-y-px',
  amarelo: 'bg-amarelo text-preto hover:bg-amarelo/90 active:translate-y-px',
  secondary: 'bg-preto text-branco hover:bg-cinza-claro hover:text-preto active:translate-y-px',
  ghost: 'bg-transparent text-preto hover:bg-cinza-claro',
  danger: 'bg-vermelho-risco text-branco hover:bg-vermelho/90 active:translate-y-px',
  outline: 'bg-transparent border-2 border-preto text-preto hover:bg-preto hover:text-branco',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-md',
  md: 'h-11 px-4 text-sm rounded-md',
  lg: 'h-12 px-5 text-base rounded-md',
  xl: 'h-14 px-6 text-lg rounded-lg',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', full, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variantClass[variant],
        sizeClass[size],
        full && 'w-full',
        className,
      )}
      {...rest}
    />
  );
});
