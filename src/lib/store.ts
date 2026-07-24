// Store global Zustand com persistência em localStorage.
// Chave: ribeirao-mock-v1. Semeado na primeira hidratação.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Cliente,
  ItemCarrinho,
  Oferta,
  Pedido,
  Produto,
  Resgate,
  StatusPedido,
} from './types';
import {
  CLIENTES,
  OFERTAS,
  PEDIDOS_SEED,
  PRODUTOS,
  RESGATES,
} from './seed';
import {
  cotarPedido,
  nivelPorPontos as _nivelPorPontos,
  ofertaAtivaPara,
  validadeCashbackISO,
} from './regras';

interface CarrinhoState {
  itens: ItemCarrinho[];
  clienteId?: string;
  ofertaId?: string;
}

interface State {
  carregado: boolean;
  produtos: Produto[];
  clientes: Cliente[];
  pedidos: Pedido[];
  ofertas: Oferta[];
  resgates: Resgate[];
  carrinho: CarrinhoState;
  clienteAtualId?: string;
  somBancada: boolean;
  proximoPedido: number;
}

interface Actions {
  adicionarAoCarrinho: (item: ItemCarrinho) => void;
  atualizarItemCarrinho: (idx: number, item: ItemCarrinho) => void;
  removerItemCarrinho: (idx: number) => void;
  limparCarrinho: () => void;
  setClienteAtual: (id?: string) => void;
  criarPedido: (params: {
    clienteId: string;
    retirada: 'balcao' | 'entrega';
    endereco?: string;
    pagamento: 'pix' | 'cartao_entrega' | 'dinheiro';
    trocoPara?: number;
    cashbackUsado: number;
    taxaEntrega: number;
    observacaoGeral?: string;
  }) => Pedido;
  atualizarStatusPedido: (id: string, status: StatusPedido) => void;
  atualizarPedido: (id: string, patch: Partial<Pedido>) => void;
  cancelarPedido: (id: string) => void;
  marcarImpresso: (id: string) => void;
  criarOferta: (o: Oferta) => void;
  atualizarOferta: (o: Oferta) => void;
  desativarOferta: (id: string) => void;
  setSomBancada: (v: boolean) => void;
  reiniciarDemonstracao: () => void;
  gerarPedidoTeste: () => Pedido;
  debitarPontos: (clienteId: string, resgateId: string) => boolean;
  criarCliente: (c: Omit<Cliente, 'id' | 'criadoEm' | 'saldoCashback' | 'pontos' | 'pontosAcumuladoTotal'>) => Cliente;
  atualizarCliente: (c: Cliente) => void;
  removerCliente: (id: string) => void;
  creditarCashback: (clienteId: string, valor: number) => void;
  atualizarProduto: (p: Produto) => void;
  hydrating: () => void;
  carregarOfertas: (o: Oferta[]) => void;
}

const initialState: State = {
  carregado: false,
  produtos: PRODUTOS,
  clientes: CLIENTES,
  pedidos: PEDIDOS_SEED,
  ofertas: OFERTAS,
  resgates: RESGATES,
  carrinho: { itens: [] },
  clienteAtualId: undefined,
  somBancada: true,
  proximoPedido: 600,
};

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,
      hydrating: () => set({ carregado: true }),

      adicionarAoCarrinho: (item) =>
        set((s) => ({ carrinho: { ...s.carrinho, itens: [...s.carrinho.itens, item] } })),

      atualizarItemCarrinho: (idx, item) =>
        set((s) => {
          const itens = [...s.carrinho.itens];
          if (idx < 0 || idx >= itens.length) return s;
          itens[idx] = item;
          return { carrinho: { ...s.carrinho, itens } };
        }),

      removerItemCarrinho: (idx) =>
        set((s) => ({
          carrinho: {
            ...s.carrinho,
            itens: s.carrinho.itens.filter((_, i) => i !== idx),
          },
        })),

      limparCarrinho: () => set({ carrinho: { itens: [] } }),

      setClienteAtual: (id) => set({ clienteAtualId: id }),

      criarPedido: (params) => {
        const s = get();
        const cliente = s.clientes.find((c) => c.id === params.clienteId);
        if (!cliente) throw new Error('cliente não encontrado');
        const nivel = _nivelPorPontos(cliente.pontosAcumuladoTotal);
        const cotacao = cotarPedido({
          itens: s.carrinho.itens,
          produtos: s.produtos,
          ofertas: s.ofertas,
          nivel,
          cashbackUsado: params.cashbackUsado,
        });
        const idNum = s.proximoPedido;
        const id = String(idNum).padStart(4, '0');
        const novoPedido: Pedido = {
          id,
          clienteId: cliente.id,
          itens: s.carrinho.itens,
          subtotal: cotacao.subtotal,
          descontoOfertas: cotacao.descontoOfertas,
          cashbackUsado: params.cashbackUsado,
          taxaEntrega: params.taxaEntrega,
          total: cotacao.valorPago + params.taxaEntrega,
          cashbackGerado: cotacao.cashbackGerado,
          pontosGerados: cotacao.pontosGerados,
          status: 'novo',
          retirada: params.retirada,
          endereco: params.endereco,
          pagamento: params.pagamento,
          trocoPara: params.trocoPara,
          observacaoGeral: params.observacaoGeral,
          criadoEm: new Date().toISOString(),
        };
        set((st) => {
          const novosClientes = st.clientes.map((c) =>
            c.id === cliente.id
              ? {
                  ...c,
                  saldoCashback:
                    Math.max(0, c.saldoCashback - params.cashbackUsado) +
                    cotacao.cashbackGerado,
                  cashbackExpiraEm: validadeCashbackISO(novoPedido.criadoEm),
                  pontos: c.pontos + cotacao.pontosGerados,
                  pontosAcumuladoTotal: c.pontosAcumuladoTotal + cotacao.pontosGerados,
                }
              : c,
          );
          return {
            pedidos: [novoPedido, ...st.pedidos],
            clientes: novosClientes,
            proximoPedido: st.proximoPedido + 1,
            carrinho: { itens: [] },
          };
        });
        return novoPedido;
      },

      atualizarStatusPedido: (id, status) =>
        set((s) => ({
          pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, status } : p)),
        })),

      marcarImpresso: (id) =>
        set((s) => ({
          pedidos: s.pedidos.map((p) =>
            p.id === id ? { ...p, impressoEm: new Date().toISOString() } : p,
          ),
        })),

      criarOferta: (o) => set((s) => ({ ofertas: [...s.ofertas, o] })),
      atualizarOferta: (o) =>
        set((s) => ({ ofertas: s.ofertas.map((x) => (x.id === o.id ? o : x)) })),
      desativarOferta: (id) =>
        set((s) => ({
          ofertas: s.ofertas.map((o) => (o.id === id ? { ...o, ativa: false } : o)),
        })),

      setSomBancada: (v) => set({ somBancada: v }),

      reiniciarDemonstracao: () => {
        set({ ...initialState, hydrating: () => set({ carregado: true }) }) ;
        // Reaplica o seed já importado.
        set({
          produtos: PRODUTOS,
          clientes: CLIENTES,
          pedidos: PEDIDOS_SEED,
          ofertas: OFERTAS,
          resgates: RESGATES,
          carrinho: { itens: [] },
          clienteAtualId: undefined,
          somBancada: true,
          proximoPedido: 600,
          carregado: true,
        });
      },

      gerarPedidoTeste: () => {
        const s = get();
        const clientes = s.clientes.filter((c) => c.aceitaWhatsapp);
        const cliente = clientes[Math.floor(Math.random() * clientes.length)];
        const produtos = s.produtos.filter((p) => p.categoria !== 'churrasco');
        const itens: ItemCarrinho[] = [];
        const qtd = 1 + Math.floor(Math.random() * 2);
        const usados = new Set<string>();
        while (itens.length < qtd) {
          const p = produtos[Math.floor(Math.random() * produtos.length)];
          if (usados.has(p.id)) continue;
          usados.add(p.id);
          const peso = p.unidadeVenda === 'kg' ? Math.round((0.5 + Math.random() * 2) * 100) / 100 : (p.pesoMedioPeca ?? 1);
          itens.push({
            produtoId: p.id,
            pesoKg: peso,
            preparos: p.preparosDisponiveis?.slice(0, 1) ?? [],
            precoUnitarioAplicado: p.precoKg,
            subtotal: Math.round(peso * p.precoKg * 100) / 100,
          });
        }
        const idNum = s.proximoPedido;
        const id = String(idNum).padStart(4, '0');
        const subtotal = itens.reduce((sum, i) => sum + i.subtotal, 0);
        const novoPedido: Pedido = {
          id,
          clienteId: cliente.id,
          itens,
          subtotal,
          descontoOfertas: 0,
          cashbackUsado: 0,
          taxaEntrega: 0,
          total: subtotal,
          cashbackGerado: Math.round(subtotal * 0.035 * 100) / 100,
          pontosGerados: Math.floor(subtotal),
          status: 'novo',
          retirada: 'balcao',
          pagamento: 'pix',
          criadoEm: new Date().toISOString(),
        };
        set((st) => ({
          pedidos: [novoPedido, ...st.pedidos],
          proximoPedido: st.proximoPedido + 1,
        }));
        return novoPedido;
      },

      debitarPontos: (clienteId, resgateId) => {
        const s = get();
        const resgate = s.resgates.find((r) => r.id === resgateId);
        if (!resgate || !resgate.ativo) return false;
        const cliente = s.clientes.find((c) => c.id === clienteId);
        if (!cliente || cliente.pontos < resgate.custoPontos) return false;
        set((st) => ({
          clientes: st.clientes.map((c) =>
            c.id === clienteId ? { ...c, pontos: c.pontos - resgate.custoPontos } : c,
          ),
        }));
        return true;
      },

      carregarOfertas: (o) => set({ ofertas: o }),

      atualizarPedido: (id, patch) =>
        set((s) => ({
          pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      cancelarPedido: (id) =>
        set((s) => {
          const ped = s.pedidos.find((p) => p.id === id);
          if (!ped) return s;
          // Devolve cashback ao cliente.
          const novosClientes = s.clientes.map((c) =>
            c.id === ped.clienteId
              ? { ...c, saldoCashback: c.saldoCashback + ped.cashbackUsado }
              : c,
          );
          return {
            pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, status: 'cancelado' as const } : p)),
            clientes: novosClientes,
          };
        }),

      criarCliente: (c) => {
        const novo: Cliente = {
          id: `c-${Date.now()}`,
          criadoEm: new Date().toISOString(),
          saldoCashback: 0,
          pontos: 0,
          pontosAcumuladoTotal: 0,
          ...c,
        };
        set((s) => ({ clientes: [...s.clientes, novo] }));
        return novo;
      },

      atualizarCliente: (c) =>
        set((s) => ({ clientes: s.clientes.map((x) => (x.id === c.id ? c : x)) })),

      removerCliente: (id) =>
        set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) })),

      creditarCashback: (clienteId, valor) =>
        set((s) => ({
          clientes: s.clientes.map((c) =>
            c.id === clienteId ? { ...c, saldoCashback: c.saldoCashback + valor } : c,
          ),
        })),

      atualizarProduto: (p) =>
        set((s) => ({ produtos: s.produtos.map((x) => (x.id === p.id ? p : x)) })),
    }),
    {
      name: 'ribeirao-mock-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.hydrating();
      },
      partialize: (s) => ({
        produtos: s.produtos,
        clientes: s.clientes,
        pedidos: s.pedidos,
        ofertas: s.ofertas,
        resgates: s.resgates,
        clienteAtualId: s.clienteAtualId,
        somBancada: s.somBancada,
        proximoPedido: s.proximoPedido,
      }),
    },
  ),
);

// Re-exporta helpers para componentes importarem do store.
export { cotarPedido, ofertaAtivaPara, validadeCashbackISO };
export { calcularMaximoUsoCashback, nivelPorPontos } from './regras';
