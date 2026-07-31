'use client';

import { useState } from 'react';
import { Beef } from 'lucide-react';
import { cn } from '@/lib/formato';

// Enquanto o açougue não sobe as fotos reais dos cortes, toda imagem
// quebrada vira um bloco com ícone em vez do ícone feio de "imagem
// quebrada" do navegador.
export function ImagemProduto({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [erro, setErro] = useState(false);

  if (!src || erro) {
    return (
      <div className={cn('bg-cinza-claro grid place-items-center text-preto/15', className)}>
        <Beef className="w-1/3 h-1/3" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErro(true)}
    />
  );
}
