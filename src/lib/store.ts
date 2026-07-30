// Store global do Açougue Ribeirão — agora lê e escreve no Supabase.
//
// Mudanças em relação à versão anterior:
//   - State inicial vazio (era populado com seed local).
//   - `carregarTudo()` busca produtos, clientes, pedidos, ofertas, resgates
//     e estado da app. Deve ser chamado uma vez no mount do app.
//   - Todas as actions de mutação são async (retornam Promise).
//   - Erros são expostos via `erro` no state.
//   - Re-hidratação: se o Supabase falhar, cai pro seed local como fallback
//     para a demo não ficar em branco.
//
// O componente `<Hydrate />` em components/ui/hydrate.tsx dispara o fetch.

import { create } from 'zustand';
import type {
  Cliente,
  ItemCarrinho,
  Oferta,
  Pedido,
  Produto,
  Resgate,
  StatusPedido,
} from './types';
import { supabase } from './supabase';
import type { ClienteRow, OfertaRow, PedidoRow, ProdutoRow, ResgateRow, AppStateRow } from './database.types';
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
  validadeCashbackISO,
} from './regras';
import {
  gravarSnapshotOffline,
  lerSnapshotOffline,
  limparSnapshotOffline,
  type SnapshotOffline,
} from './persistencia';

// Snapshot serializável do state. Usado em todas as mutações offline
// para que o reload não apague o trabalho da demo.
function snapshotFromState(s: State): SnapshotOffline {
  return {
    produtos: s.produtos,
    clientes: s.clientes,
    pedidos: s.pedidos,
    ofertas: s.ofertas,
    resgates: s.resgates,
    proximoPedido: s.proximoPedido,
    clienteAtualId: s.clienteAtualId,
    somBancada: s.somBancada,
    impressaoAutomatica: s.impressaoAutomatica,
  };
}

// ============================================================
// Mappers DB -> app
// ============================================================

function mapProduto(r: ProdutoRow): Produto {
  return {
    id: r.id,
    slug: r.slug,
    nome: r.nome,
    categoria: r.categoria as Produto['categoria'],
    corte: r.corte ?? undefined,
    descricao: r.descricao,
    precoKg: Number(r.preco_kg),
    unidadeVenda: r.unidade_venda,
    pesoMedioPeca: r.peso_medio_peca != null ? Number(r.peso_medio_peca) : undefined,
    imagem: r.imagem,
    percentualCashback: Number(r.percentual_cashback),
    preparosDisponiveis: Array.isArray(r.preparos_disponiveis) ? r.preparos_disponiveis : [],
    destaque: r.destaque,
    disponivel: r.disponivel,
  };
}

function mapCliente(r: ClienteRow): Cliente {
  return {
    id: r.id,
    nome: r.nome,
    telefone: r.telefone,
    nascimento: r.nascimento ?? undefined,
    criadoEm: r.criado_em,
    saldoCashback: Number(r.saldo_cashback),
    cashbackExpiraEm: r.cashback_expira_em ?? undefined,
    pontos: r.pontos,
    pontosAcumuladoTotal: r.pontos_acumulado_total,
    aceitaWhatsapp: r.aceita_whatsapp,
  };
}

function mapOferta(r: OfertaRow): Oferta {
  return {
    id: r.id,
    tipo: r.tipo,
    produtoId: r.produto_id,
    precoDe: Number(r.preco_de),
    precoPor: Number(r.preco_por),
    inicioEm: r.inicio_em,
    fimEm: r.fim_em,
    limitePorCliente: r.limite_por_cliente != null ? Number(r.limite_por_cliente) : undefined,
    quantidadeTotalKg: r.quantidade_total_kg != null ? Number(r.quantidade_total_kg) : undefined,
    quantidadeVendidaKg: Number(r.quantidade_vendida_kg),
    chamada: r.chamada,
    ativa: r.ativa,
  };
}

function mapPedido(r: PedidoRow): Pedido {
  return {
    id: r.id,
    clienteId: r.cliente_id,
    itens: Array.isArray(r.itens) ? r.itens : [],
    subtotal: Number(r.subtotal),
    descontoOfertas: Number(r.desconto_ofertas),
    cashbackUsado: Number(r.cashback_usado),
    taxaEntrega: Number(r.taxa_entrega),
    total: Number(r.total),
    cashbackGerado: Number(r.cashback_gerado),
    pontosGerados: r.pontos_gerados,
    status: r.status,
    retirada: r.retirada,
    endereco: r.endereco ?? undefined,
    pagamento: r.pagamento,
    trocoPara: r.troco_para != null ? Number(r.troco_para) : undefined,
    observacaoGeral: r.observacao_geral ?? undefined,
    criadoEm: r.criado_em,
    impressoEm: r.impresso_em ?? undefined,
  };
}

function mapResgate(r: ResgateRow): Resgate {
  return {
    id: r.id,
    nome: r.nome,
    custoPontos: r.custo_pontos,
    imagem: r.imagem,
    ativo: r.ativo,
  };
}

// ============================================================
// Store
// ============================================================

interface CarrinhoState {
  itens: ItemCarrinho[];
}

interface State {
  carregado: boolean;
  carregando: boolean;
  online: boolean;
  erro: string | null;
  produtos: Produto[];
  clientes: Cliente[];
  pedidos: Pedido[];
  ofertas: Oferta[];
  resgates: Resgate[];
  carrinho: CarrinhoState;
  clienteAtualId?: string;
  somBancada: boolean;
  impressaoAutomatica: boolean;
  proximoPedido: number;
}

interface Actions {
  // Inicialização
  carregarTudo: () => Promise<void>;

  // Carrinho (local, não vai pro banco)
  adicionarAoCarrinho: (item: ItemCarrinho) => void;
  atualizarItemCarrinho: (idx: number, item: ItemCarrinho) => void;
  removerItemCarrinho: (idx: number) => void;
  limparCarrinho: () => void;
  setClienteAtual: (id?: string) => Promise<void>;

  // Pedidos
  criarPedido: (params: {
    clienteId: string;
    retirada: 'balcao' | 'entrega';
    endereco?: string;
    pagamento: 'pix' | 'cartao_entrega' | 'dinheiro';
    trocoPara?: number;
    cashbackUsado: number;
    taxaEntrega: number;
    observacaoGeral?: string;
  }) => Promise<Pedido>;
  atualizarStatusPedido: (id: string, status: StatusPedido) => Promise<void>;
  atualizarPedido: (id: string, patch: Partial<Pedido>) => Promise<void>;
  cancelarPedido: (id: string) => Promise<void>;
  marcarImpresso: (id: string) => Promise<void>;
  gerarPedidoTeste: () => Promise<Pedido | null>;

  // Ofertas
  criarOferta: (o: Oferta) => Promise<void>;
  atualizarOferta: (o: Oferta) => Promise<void>;
  desativarOferta: (id: string) => Promise<void>;

  // Clientes
  criarCliente: (c: Omit<Cliente, 'id' | 'criadoEm' | 'saldoCashback' | 'pontos' | 'pontosAcumuladoTotal'>) => Promise<Cliente>;
  atualizarCliente: (c: Cliente) => Promise<void>;
  removerCliente: (id: string) => Promise<void>;
  creditarCashback: (clienteId: string, valor: number) => Promise<void>;

  // Produtos
  atualizarProduto: (p: Produto) => Promise<void>;

  // Pontos
  debitarPontos: (clienteId: string, resgateId: string) => Promise<boolean>;

  // Preferências
  setSomBancada: (v: boolean) => Promise<void>;
  setImpressaoAutomatica: (v: boolean) => Promise<void>;

  // Demo
  reiniciarDemonstracao: () => Promise<void>;

  // Recarregar tabelas específicas após mutação
  recarregarPedidos: () => Promise<void>;
  recarregarClientes: () => Promise<void>;
  recarregarOfertas: () => Promise<void>;
  recarregarProdutos: () => Promise<void>;
}

const initialState: State = {
  carregado: false,
  carregando: false,
  online: false,
  erro: null,
  produtos: [],
  clientes: [],
  pedidos: [],
  ofertas: [],
  resgates: [],
  carrinho: { itens: [] },
  clienteAtualId: undefined,
  somBancada: true,
  impressaoAutomatica: true,
  proximoPedido: 600,
};

const seedFallback = (): SnapshotOffline => ({
  produtos: PRODUTOS,
  clientes: CLIENTES,
  pedidos: PEDIDOS_SEED,
  ofertas: OFERTAS,
  resgates: RESGATES,
  proximoPedido: 600,
  clienteAtualId: undefined,
  somBancada: true,
  impressaoAutomatica: true,
});

// Permanece exportado porque outros módulos podem querer ler o
// snapshot bruto (ex.: debug) sem ter que importar o store.
export const useStore = create<State & Actions>()((set, get) => ({
  ...initialState,

  // ============================================================
  // Inicialização
  // ============================================================
  carregarTudo: async () => {
    if (get().carregando) return;
    set({ carregando: true, erro: null });
    try {
      const sb = supabase();
      const [prodRes, cliRes, pedRes, ofRes, resRes, stRes] = await Promise.all([
        sb.from('produtos').select('*').order('nome'),
        sb.from('clientes').select('*').order('nome'),
        sb.from('pedidos').select('*').order('criado_em', { ascending: false }),
        sb.from('ofertas').select('*').order('created_at', { ascending: false }),
        sb.from('resgates').select('*').order('custo_pontos'),
        sb.from('app_state').select('*').eq('id', 'singleton').maybeSingle<AppStateRow>(),
      ]);

      // Se qualquer um falhou, cai pro modo offline.
      const anyError = prodRes.error || cliRes.error || pedRes.error || ofRes.error || resRes.error;
      if (anyError) {
        // eslint-disable-next-line no-console
        console.warn('[supabase] falha ao carregar:', anyError.message);
        // Prefere o snapshot persistido (sobrevive ao reload) e só
        // então cai no seed hard-coded. Ordem de preferência:
        //   localStorage → seed → vazio.
        const snap = lerSnapshotOffline();
        const base = snap ?? seedFallback();
        set({
          produtos: base.produtos,
          clientes: base.clientes,
          pedidos: base.pedidos,
          ofertas: base.ofertas,
          resgates: base.resgates,
          online: false,
          erro: snap
            ? 'Modo demo offline — usando dados salvos neste navegador.'
            : 'Modo demo offline — dados semeados em memória.',
          carregado: true,
          carregando: false,
          clienteAtualId: base.clienteAtualId,
          somBancada: base.somBancada,
          impressaoAutomatica: base.impressaoAutomatica,
          proximoPedido: base.proximoPedido,
        });
        return;
      }

      const produtos = (prodRes.data ?? []).map(mapProduto);
      const clientes = (cliRes.data ?? []).map(mapCliente);
      const pedidos = (pedRes.data ?? []).map(mapPedido);
      const ofertas = (ofRes.data ?? []).map(mapOferta);
      const resgates = (resRes.data ?? []).map(mapResgate);
      const st = stRes.data;

      set({
        produtos,
        clientes,
        pedidos,
        ofertas,
        resgates,
        online: true,
        carregado: true,
        carregando: false,
        clienteAtualId: st?.cliente_atual_id ?? undefined,
        somBancada: st?.som_bancada ?? true,
        impressaoAutomatica: st?.impressao_automatica ?? true,
        proximoPedido: st?.proximo_pedido ?? 600,
      });
    } catch (e) {
      const snap = lerSnapshotOffline();
      const base = snap ?? seedFallback();
      set({
        produtos: base.produtos,
        clientes: base.clientes,
        pedidos: base.pedidos,
        ofertas: base.ofertas,
        resgates: base.resgates,
        online: false,
        erro: e instanceof Error ? e.message : 'Erro ao carregar dados.',
        carregado: true,
        carregando: false,
        clienteAtualId: base.clienteAtualId,
        somBancada: base.somBancada,
        impressaoAutomatica: base.impressaoAutomatica,
        proximoPedido: base.proximoPedido,
      });
    }
  },

  // ============================================================
  // Carrinho (local)
  // ============================================================
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
      carrinho: { ...s.carrinho, itens: s.carrinho.itens.filter((_, i) => i !== idx) },
    })),

  limparCarrinho: () => set({ carrinho: { itens: [] } }),

  setClienteAtual: async (id) => {
    set({ clienteAtualId: id });
    if (get().online) {
      await supabase().from('app_state').update({ cliente_atual_id: id ?? null }).eq('id', 'singleton');
    } else {
      gravarSnapshotOffline(snapshotFromState(get()));
    }
  },

  // ============================================================
  // Pedidos
  // ============================================================
  criarPedido: async (params) => {
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

    if (!s.online) {
      // Modo offline (seed local): aplica mutação local.
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
      gravarSnapshotOffline(snapshotFromState(get()));
      return novoPedido;
    }

    // Online: insere no Supabase.
    const sb = supabase();
    const { data, error } = await sb.from('pedidos').insert({
      id,
      cliente_id: cliente.id,
      itens: novoPedido.itens,
      subtotal: novoPedido.subtotal,
      desconto_ofertas: novoPedido.descontoOfertas,
      cashback_usado: novoPedido.cashbackUsado,
      taxa_entrega: novoPedido.taxaEntrega,
      total: novoPedido.total,
      cashback_gerado: novoPedido.cashbackGerado,
      pontos_gerados: novoPedido.pontosGerados,
      status: 'novo',
      retirada: novoPedido.retirada,
      endereco: novoPedido.endereco ?? null,
      pagamento: novoPedido.pagamento,
      troco_para: novoPedido.trocoPara ?? null,
      observacao_geral: novoPedido.observacaoGeral ?? null,
      criado_em: novoPedido.criadoEm,
    }).select().single();

    if (error || !data) throw new Error(error?.message ?? 'Falha ao criar pedido');

    // Atualiza saldo de cashback e pontos do cliente.
    const novoSaldo = Math.max(0, cliente.saldoCashback - params.cashbackUsado) + cotacao.cashbackGerado;
    await sb.from('clientes').update({
      saldo_cashback: novoSaldo,
      cashback_expira_em: validadeCashbackISO(novoPedido.criadoEm),
      pontos: cliente.pontos + cotacao.pontosGerados,
      pontos_acumulado_total: cliente.pontosAcumuladoTotal + cotacao.pontosGerados,
    }).eq('id', cliente.id);

    // Incrementa proximoPedido.
    await sb.from('app_state').update({ proximo_pedido: idNum + 1 }).eq('id', 'singleton');

    await get().recarregarPedidos();
    await get().recarregarClientes();
    set({ carrinho: { itens: [] }, proximoPedido: idNum + 1 });
    return mapPedido(data as PedidoRow);
  },

  atualizarStatusPedido: async (id, status) => {
    if (!get().online) {
      set((s) => ({
        pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, status } : p)),
      }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const { error } = await supabase().from('pedidos').update({ status }).eq('id', id);
    if (error) throw new Error(error.message);
    await get().recarregarPedidos();
  },

  atualizarPedido: async (id, patch) => {
    if (!get().online) {
      set((s) => ({
        pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const dbPatch: Record<string, unknown> = {};
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.observacaoGeral !== undefined) dbPatch.observacao_geral = patch.observacaoGeral;
    if (patch.endereco !== undefined) dbPatch.endereco = patch.endereco;
    if (patch.impressoEm !== undefined) dbPatch.impresso_em = patch.impressoEm;
    if (Object.keys(dbPatch).length === 0) return;
    const { error } = await supabase().from('pedidos').update(dbPatch).eq('id', id);
    if (error) throw new Error(error.message);
    await get().recarregarPedidos();
  },

  cancelarPedido: async (id) => {
    const ped = get().pedidos.find((p) => p.id === id);
    if (!ped) return;
    if (!get().online) {
      set((s) => {
        const novosClientes = s.clientes.map((c) =>
          c.id === ped.clienteId ? { ...c, saldoCashback: c.saldoCashback + ped.cashbackUsado } : c,
        );
        return {
          pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, status: 'cancelado' as const } : p)),
          clientes: novosClientes,
        };
      });
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const sb = supabase();
    await sb.from('pedidos').update({ status: 'cancelado' }).eq('id', id);
    // Devolve cashback.
    const cli = get().clientes.find((c) => c.id === ped.clienteId);
    if (cli) {
      await sb.from('clientes').update({ saldo_cashback: cli.saldoCashback + ped.cashbackUsado }).eq('id', cli.id);
    }
    await get().recarregarPedidos();
    await get().recarregarClientes();
  },

  marcarImpresso: async (id) => {
    if (!get().online) {
      set((s) => ({
        pedidos: s.pedidos.map((p) =>
          p.id === id ? { ...p, impressoEm: new Date().toISOString() } : p,
        ),
      }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    await supabase().from('pedidos').update({ impresso_em: new Date().toISOString() }).eq('id', id);
    await get().recarregarPedidos();
  },

  gerarPedidoTeste: async () => {
    const s = get();
    const clientes = s.clientes.filter((c) => c.aceitaWhatsapp);
    if (clientes.length === 0) return null;
    const cliente = clientes[Math.floor(Math.random() * clientes.length)];
    const produtos = s.produtos.filter((p) => p.categoria !== 'churrasco');
    const qtd = 1 + Math.floor(Math.random() * 2);
    const itens: ItemCarrinho[] = [];
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
    return await get().criarPedido({
      clienteId: cliente.id,
      retirada: 'balcao',
      pagamento: 'pix',
      cashbackUsado: 0,
      taxaEntrega: 0,
    });
  },

  // ============================================================
  // Ofertas
  // ============================================================
  criarOferta: async (o) => {
    if (!get().online) {
      set((s) => ({ ofertas: [...s.ofertas, o] }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const { error } = await supabase().from('ofertas').insert({
      id: o.id,
      tipo: o.tipo,
      produto_id: o.produtoId,
      preco_de: o.precoDe,
      preco_por: o.precoPor,
      inicio_em: o.inicioEm,
      fim_em: o.fimEm,
      limite_por_cliente: o.limitePorCliente ?? null,
      quantidade_total_kg: o.quantidadeTotalKg ?? null,
      quantidade_vendida_kg: o.quantidadeVendidaKg,
      chamada: o.chamada,
      ativa: o.ativa,
    });
    if (error) throw new Error(error.message);
    await get().recarregarOfertas();
  },

  atualizarOferta: async (o) => {
    if (!get().online) {
      set((s) => ({ ofertas: s.ofertas.map((x) => (x.id === o.id ? o : x)) }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const { error } = await supabase().from('ofertas').update({
      tipo: o.tipo,
      produto_id: o.produtoId,
      preco_de: o.precoDe,
      preco_por: o.precoPor,
      inicio_em: o.inicioEm,
      fim_em: o.fimEm,
      limite_por_cliente: o.limitePorCliente ?? null,
      quantidade_total_kg: o.quantidadeTotalKg ?? null,
      quantidade_vendida_kg: o.quantidadeVendidaKg,
      chamada: o.chamada,
      ativa: o.ativa,
    }).eq('id', o.id);
    if (error) throw new Error(error.message);
    await get().recarregarOfertas();
  },

  desativarOferta: async (id) => {
    if (!get().online) {
      set((s) => ({ ofertas: s.ofertas.map((o) => (o.id === id ? { ...o, ativa: false } : o)) }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    await supabase().from('ofertas').update({ ativa: false }).eq('id', id);
    await get().recarregarOfertas();
  },

  // ============================================================
  // Clientes
  // ============================================================
  criarCliente: async (c) => {
    const novo: Cliente = {
      id: `c-${Date.now()}`,
      criadoEm: new Date().toISOString(),
      saldoCashback: 0,
      pontos: 0,
      pontosAcumuladoTotal: 0,
      ...c,
    };
    if (!get().online) {
      set((s) => ({ clientes: [...s.clientes, novo] }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return novo;
    }
    const { error } = await supabase().from('clientes').insert({
      id: novo.id,
      nome: novo.nome,
      telefone: novo.telefone,
      nascimento: novo.nascimento ?? null,
      criado_em: novo.criadoEm,
      aceita_whatsapp: novo.aceitaWhatsapp,
    });
    if (error) throw new Error(error.message);
    await get().recarregarClientes();
    return novo;
  },

  atualizarCliente: async (c) => {
    if (!get().online) {
      set((s) => ({ clientes: s.clientes.map((x) => (x.id === c.id ? c : x)) }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const { error } = await supabase().from('clientes').update({
      nome: c.nome,
      telefone: c.telefone,
      nascimento: c.nascimento ?? null,
      saldo_cashback: c.saldoCashback,
      cashback_expira_em: c.cashbackExpiraEm ?? null,
      pontos: c.pontos,
      pontos_acumulado_total: c.pontosAcumuladoTotal,
      aceita_whatsapp: c.aceitaWhatsapp,
    }).eq('id', c.id);
    if (error) throw new Error(error.message);
    await get().recarregarClientes();
  },

  removerCliente: async (id) => {
    if (!get().online) {
      set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    await supabase().from('clientes').delete().eq('id', id);
    await get().recarregarClientes();
  },

  creditarCashback: async (clienteId, valor) => {
    const cli = get().clientes.find((c) => c.id === clienteId);
    if (!cli) return;
    if (!get().online) {
      set((s) => ({
        clientes: s.clientes.map((c) => c.id === clienteId ? { ...c, saldoCashback: c.saldoCashback + valor } : c),
      }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    await supabase().from('clientes').update({ saldo_cashback: cli.saldoCashback + valor }).eq('id', clienteId);
    await get().recarregarClientes();
  },

  // ============================================================
  // Produtos
  // ============================================================
  atualizarProduto: async (p) => {
    if (!get().online) {
      set((s) => ({ produtos: s.produtos.map((x) => (x.id === p.id ? p : x)) }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const { error } = await supabase().from('produtos').update({
      slug: p.slug,
      nome: p.nome,
      categoria: p.categoria,
      corte: p.corte ?? null,
      descricao: p.descricao,
      preco_kg: p.precoKg,
      unidade_venda: p.unidadeVenda,
      peso_medio_peca: p.pesoMedioPeca ?? null,
      imagem: p.imagem,
      percentual_cashback: p.percentualCashback,
      preparos_disponiveis: p.preparosDisponiveis,
      destaque: p.destaque,
      disponivel: p.disponivel,
    }).eq('id', p.id);
    if (error) throw new Error(error.message);
    await get().recarregarProdutos();
  },

  // ============================================================
  // Pontos
  // ============================================================
  debitarPontos: async (clienteId, resgateId) => {
    const s = get();
    const resgate = s.resgates.find((r) => r.id === resgateId);
    if (!resgate || !resgate.ativo) return false;
    const cliente = s.clientes.find((c) => c.id === clienteId);
    if (!cliente || cliente.pontos < resgate.custoPontos) return false;
    if (!get().online) {
      set((st) => ({
        clientes: st.clientes.map((c) =>
          c.id === clienteId ? { ...c, pontos: c.pontos - resgate.custoPontos } : c,
        ),
      }));
      return true;
    }
    await supabase().from('clientes').update({ pontos: cliente.pontos - resgate.custoPontos }).eq('id', clienteId);
    await get().recarregarClientes();
    return true;
  },

  // ============================================================
  // Preferências
  // ============================================================
  setSomBancada: async (v) => {
    set({ somBancada: v });
    if (get().online) {
      await supabase().from('app_state').update<Partial<AppStateRow>>({ som_bancada: v }).eq('id', 'singleton');
    } else {
      gravarSnapshotOffline(snapshotFromState(get()));
    }
  },

  setImpressaoAutomatica: async (v) => {
    set({ impressaoAutomatica: v });
    if (get().online) {
      await supabase().from('app_state').update<Partial<AppStateRow>>({ impressao_automatica: v }).eq('id', 'singleton');
    } else {
      gravarSnapshotOffline(snapshotFromState(get()));
    }
  },

  // ============================================================
  // Demo
  // ============================================================
  reiniciarDemonstracao: async () => {
    if (get().online) {
      await supabase().rpc('reset_demo');
      await get().carregarTudo();
      return;
    }
    limparSnapshotOffline();
    set({ ...initialState, ...seedFallback(), carregado: true });
    gravarSnapshotOffline(snapshotFromState(get()));
  },

  // ============================================================
  // Recargas parciais
  // ============================================================
  recarregarPedidos: async () => {
    if (!get().online) return;
    const { data, error } = await supabase().from('pedidos').select('*').order('criado_em', { ascending: false });
    if (!error && data) set({ pedidos: data.map(mapPedido) });
  },

  recarregarClientes: async () => {
    if (!get().online) return;
    const { data, error } = await supabase().from('clientes').select('*').order('nome');
    if (!error && data) set({ clientes: data.map(mapCliente) });
  },

  recarregarOfertas: async () => {
    if (!get().online) return;
    const { data, error } = await supabase().from('ofertas').select('*').order('created_at', { ascending: false });
    if (!error && data) set({ ofertas: data.map(mapOferta) });
  },

  recarregarProdutos: async () => {
    if (!get().online) return;
    const { data, error } = await supabase().from('produtos').select('*').order('nome');
    if (!error && data) set({ produtos: data.map(mapProduto) });
  },
}));

// Re-exporta helpers para componentes importarem do store.
export { cotarPedido, validadeCashbackISO };
export { calcularMaximoUsoCashback, nivelPorPontos } from './regras';
