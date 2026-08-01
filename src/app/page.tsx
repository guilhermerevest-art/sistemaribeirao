import type { Metadata } from 'next';

// Teste minimo: home renderiza so um paragrafo.
// Se o React #185 sumir nesta configuracao, o problema esta
// no LojaClient (renderizado em /loja). Se persistir, o
// problema esta no store ou em algum layout.
//
// Build leve pra isolar.
export const metadata: Metadata = {
  title: 'Teste home minima',
};

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center bg-papel">
      <h1 className="font-display font-extrabold text-2xl">Home minima de teste</h1>
    </main>
  );
}
