'use client';

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

// A home agora é a vitrine diretamente. Boas-vindas e
// Pedir-de-novo ficam como overlays. O Tour foi removido
// temporariamente da home porque disparava React #185
// (ver commit de fix subsequente).
export default function HomePage() {
  return (
    <>
      <ClienteNovo />
      <LojaVitrine />
      <PedirDeNovoHomeOuEntrar />
    </>
  );
}
