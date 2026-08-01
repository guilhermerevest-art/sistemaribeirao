'use client';

import { TourGuiado, TourReabrir } from '@/components/ui/tour-guiado';
import { BoasVindasCliente } from '@/components/ui/boas-vindas-cliente';
import { PedirDeNovoHome, EntrarComoCliente } from '@/components/ui/pedir-de-novo-home';
import { useStore } from '@/lib/store';
import LojaVitrine from '@/components/loja/loja-client-shared';

function PedirDeNovoHomeOuEntrar() {
  const clienteAtualId = useStore((s) => s.clienteAtualId);
  const cliente = useStore((s) => s.clientes.find((c) => c.id === clienteAtualId));
  const temPedido = useStore((s) =>
    cliente ? s.pedidos.some((p) => p.clienteId === cliente.id && p.status !== 'cancelado') : false,
  );
  if (cliente && temPedido) return <PedirDeNovoHome />;
  return <EntrarComoCliente />;
}

// Boas-vindas só pra cliente novo (criado há < 60s).
function ClienteNovo() {
  const clienteAtualId = useStore((s) => s.clienteAtualId);
  const cliente = useStore((s) => s.clientes.find((c) => c.id === clienteAtualId));
  if (!cliente) return null;
  return (
    <BoasVindasCliente
      clienteId={cliente.id}
      criadoEm={cliente.criadoEm}
      nome={cliente.nome}
    />
  );
}

// A home agora é a vitrine diretamente. Tour, Pedir-de-novo e
// Boas-vindas ficam como overlays por cima. Os "Acessos rápidos"
// eram uma página administrativa — agora estão em /backoffice e
// /painel, onde fazem sentido.
export default function HomePage() {
  return (
    <>
      <TourGuiado />
      <ClienteNovo />
      <LojaVitrine />
      <PedirDeNovoHomeOuEntrar />
      <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-carvao/50 text-center space-x-2">
        <span>Mock navegável para demonstração. Dados persistidos em localStorage.</span>
        <span>·</span>
        <TourReabrir />
      </footer>
    </>
  );
}
