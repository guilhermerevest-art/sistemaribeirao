// Classificador de frequência compartilhado entre painel, clientes,
// relatórios e campanhas. Antes cada página tinha sua cópia — isso
// garantia inconsistência e código duplicado.

import type { Cliente, Frequencia, Pedido } from './types';

export interface InfoFrequencia {
  grupo: Frequencia;
  diasSemCompra: number;
  pedidos90: number;
  ticketMedio: number;
}

export function infoFrequencia(cliente: Cliente, pedidos: Pedido[]): InfoFrequencia {
  const ped = pedidos.filter((p) => p.clienteId === cliente.id);
  // Não ordenamos aqui — quem precisar de "último" já ordena fora.
  ped.sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
  const ultimo = ped[0]?.criadoEm;
  const diasSemCompra = ultimo
    ? Math.floor((Date.now() - new Date(ultimo).getTime()) / 86400000)
    : 9999;
  const noventaAtras = new Date();
  noventaAtras.setDate(noventaAtras.getDate() - 90);
  const pedidos90 = ped.filter((p) => new Date(p.criadoEm) >= noventaAtras).length;
  const diasCadastro = Math.floor(
    (Date.now() - new Date(cliente.criadoEm).getTime()) / 86400000,
  );
  let grupo: Frequencia = 'ocasional';
  if (diasSemCompra >= 60) grupo = 'inativo';
  else if (diasSemCompra >= 31) grupo = 'em_risco';
  else if (pedidos90 >= 6 && diasSemCompra <= 15) grupo = 'fiel';
  else if (pedidos90 <= 1 && diasCadastro <= 30) grupo = 'novo';
  const ticketMedio = ped.length ? ped.reduce((s, p) => s + p.total, 0) / ped.length : 0;
  return { grupo, diasSemCompra, pedidos90, ticketMedio };
}