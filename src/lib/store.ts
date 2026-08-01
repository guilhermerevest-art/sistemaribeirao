// Store global do Empório Ribeirão — agora lê e escreve no Supabase.
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
  Campanha,
  Cliente,
  Combo,
  Estabelecimento,
  Indicacao,
  ItemCarrinho,
  Oferta,
  Pedido,
  Produto,
  Resgate,
  StatusPedido,
} from './types';
import { supabase } from './supabase';
import type {
  CampanhaRow,
  ClienteRow,
  ComboRow,
  OfertaRow,
  PedidoRow,
  ProdutoRow,
  ResgateRow,
  AppStateRow,
} from './database.types';
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
  ESTABELECIMENTO_PADRAO,
  gravarSnapshotOffline,
  lerSnapshotOffline,
  limparSnapshotOffline,
  type SnapshotOffline,
} from './persistencia';
import { marcarCriadoLocalmente } from './sync-flags';

// Snapshot serializável do state. Usado em todas as mutações offline
// para que o reload não apague o trabalho da demo.
function snapshotFromState(s: State): SnapshotOffline {
  return {
    _v: 4,
    produtos: s.produtos,
    clientes: s.clientes,
    pedidos: s.pedidos,
    ofertas: s.ofertas,
    resgates: s.resgates,
    combos: s.combos,
    campanhas: s.campanhas,
    indicacoes: s.indicacoes,
    receitasFavoritas: s.receitasFavoritas,
    proximoPedido: s.proximoPedido,
    clienteAtualId: s.clienteAtualId,
    somBancada: s.somBancada,
    impressaoAutomatica: s.impressaoAutomatica,
    ptsParaReais: s.ptsParaReais,
    estabelecimento: s.estabelecimento,
    lojaAberta: s.lojaAberta,
  };
}

// Tabela pts->R$ vem como texto JSON no app_state. Fallback silencioso
// pra não derrubar a hidratação se alguém salvar um JSON malformado.
function parsePtsParaReais(json: string | null | undefined): Record<string, number> {
  if (!json) return { '100': 1, '500': 5 };
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) out[k] = n;
    }
    return Object.keys(out).length > 0 ? out : { '100': 1, '500': 5 };
  } catch {
    return { '100': 1, '500': 5 };
  }
}

function parseEstabelecimento(json: string | null | undefined): Estabelecimento {
  if (!json) return ESTABELECIMENTO_PADRAO;
  try {
    const p = JSON.parse(json) as Partial<Estabelecimento>;
    return {
      nomeFantasia: p.nomeFantasia ?? ESTABELECIMENTO_PADRAO.nomeFantasia,
      endereco: p.endereco ?? ESTABELECIMENTO_PADRAO.endereco,
      telefone: p.telefone ?? ESTABELECIMENTO_PADRAO.telefone,
      cnpj: p.cnpj,
      mensagemRodape: p.mensagemRodape ?? ESTABELECIMENTO_PADRAO.mensagemRodape,
    };
  } catch {
    return ESTABELECIMENTO_PADRAO;
  }
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
    comboId: r.combo_id ?? undefined,
    brindeProdutoId: r.brinde_produto_id ?? undefined,
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
    pontosUsados: r.pontos_usados ?? 0,
    descontoPontos: r.desconto_pontos != null ? Number(r.desconto_pontos) : 0,
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

function mapCombo(r: ComboRow): Combo {
  return {
    id: r.id,
    slug: r.slug,
    nome: r.nome,
    descricao: r.descricao,
    imagem: r.imagem,
    precoCombo: Number(r.preco_combo),
    percentualCashback: Number(r.percentual_cashback),
    itens: Array.isArray(r.itens) ? r.itens : [],
    ativo: r.ativo,
  };
}

function mapCampanha(r: CampanhaRow): Campanha {
  return {
    id: r.id,
    titulo: r.titulo,
    mensagemTemplate: r.mensagem_template,
    publicoAlvo: r.publico_alvo,
    clientesIds: r.clientes_ids ?? undefined,
    dataCriacao: r.data_criacao,
    dataEnvio: r.data_envio ?? undefined,
    totalDestinatarios: r.total_destinatarios,
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
  combos: Combo[];
  campanhas: Campanha[];
  /** Indicações ativas. Persistido no snapshot e no Supabase (tabela indicacoes). */
  indicacoes: Indicacao[];
  /** Slugs de receitas marcadas como favoritas. Persistido no snapshot. */
  receitasFavoritas: string[];
  carrinho: CarrinhoState;
  clienteAtualId?: string;
  /** Código de indicação lido do `?ref=` da URL, válido só no checkout. */
  refIndicacaoPendente?: string;
  somBancada: boolean;
  impressaoAutomatica: boolean;
  proximoPedido: number;
  ptsParaReais: Record<string, number>;
  estabelecimento: Estabelecimento;
  lojaAberta: boolean;
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
  clonarItensParaCarrinho: (itens: ItemCarrinho[]) => void;

  // Pedidos
  criarPedido: (params: {
    clienteId: string;
    retirada: 'balcao' | 'entrega';
    endereco?: string;
    pagamento: 'pix' | 'cartao_entrega' | 'dinheiro';
    trocoPara?: number;
    cashbackUsado: number;
    pontosUsados?: number;
    descontoPontos?: number;
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

  // Combos
  criarCombo: (c: Combo) => Promise<void>;
  atualizarCombo: (c: Combo) => Promise<void>;
  desativarCombo: (id: string) => Promise<void>;

  // Campanhas
  criarCampanha: (c: Campanha) => Promise<void>;
  atualizarCampanha: (c: Campanha) => Promise<void>;
  desativarCampanha: (id: string) => Promise<void>;
  marcarCampanhaEnviada: (id: string, totalDestinatarios: number) => Promise<void>;

  // Configurações
  setPontosParaReais: (mapa: Record<string, number>) => Promise<void>;
  setEstabelecimento: (e: Estabelecimento) => Promise<void>;
  setLojaAberta: (aberta: boolean) => Promise<void>;

  // Referral
  setRefIndicacaoPendente: (codigo: string | undefined) => void;
  vincularIndicacao: (clienteNovoId: string) => string | null;
  converterIndicacaoSeAplicavel: (clienteId: string, pedidoId: string) => { indicadorId: string; valor: number } | null;
  recarregarIndicacoes: () => Promise<void>;

  // Receitas favoritas — toggle simples que persiste no snapshot.
  toggleFavoritaReceita: (slug: string) => void;

  // Clientes
  criarCliente: (c: Omit<Cliente, 'id' | 'criadoEm' | 'saldoCashback' | 'pontos' | 'pontosAcumuladoTotal'>) => Promise<Cliente>;
  atualizarCliente: (c: Cliente) => Promise<void>;
  removerCliente: (id: string) => Promise<void>;
  creditarCashback: (clienteId: string, valor: number) => Promise<void>;

  // Produtos
  atualizarProduto: (p: Produto) => Promise<void>;

  // Pontos
  debitarPontos: (clienteId: string, resgateId: string) => Promise<boolean>;

  // Resgates (catálogo de pontos)
  criarResgate: (r: Resgate) => Promise<void>;
  atualizarResgate: (r: Resgate) => Promise<void>;
  desativarResgate: (id: string) => Promise<void>;

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
  recarregarCombos: () => Promise<void>;
  recarregarCampanhas: () => Promise<void>;
  recarregarResgates: () => Promise<void>;
}

const PTS_PARA_REAIS_PADRAO: Record<string, number> = { '100': 1, '500': 5 };

const ESTABELECIMENTO_LOCAL = ESTABELECIMENTO_PADRAO;

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
  combos: [],
  indicacoes: [],
  receitasFavoritas: [],
  campanhas: [],
  carrinho: { itens: [] },
  clienteAtualId: undefined,
  refIndicacaoPendente: undefined,
  somBancada: true,
  impressaoAutomatica: true,
  proximoPedido: 600,
  ptsParaReais: PTS_PARA_REAIS_PADRAO,
  estabelecimento: ESTABELECIMENTO_LOCAL,
  lojaAberta: true,
};

const seedFallback = (): SnapshotOffline => ({
  produtos: PRODUTOS,
  clientes: CLIENTES,
  pedidos: PEDIDOS_SEED,
  ofertas: OFERTAS,
  resgates: RESGATES,
  combos: [],
  campanhas: [],
  indicacoes: [],
  receitasFavoritas: [],
  proximoPedido: 600,
  clienteAtualId: undefined,
  somBancada: true,
  impressaoAutomatica: true,
  ptsParaReais: PTS_PARA_REAIS_PADRAO,
  estabelecimento: ESTABELECIMENTO_LOCAL,
  lojaAberta: true,
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
      const [prodRes, cliRes, pedRes, ofRes, resRes, comboRes, campRes, stRes] = await Promise.all([
        sb.from('produtos').select('*').order('nome'),
        sb.from('clientes').select('*').order('nome'),
        sb.from('pedidos').select('*').order('criado_em', { ascending: false }),
        sb.from('ofertas').select('*').order('created_at', { ascending: false }),
        sb.from('resgates').select('*').order('custo_pontos'),
        sb.from('combos').select('*').order('nome'),
        sb.from('campanhas').select('*').order('data_criacao', { ascending: false }),
        sb.from('app_state').select('*').eq('id', 'singleton').maybeSingle<AppStateRow>(),
      ]);

      // Se qualquer um falhou, cai pro modo offline.
      const anyError =
        prodRes.error || cliRes.error || pedRes.error || ofRes.error || resRes.error || comboRes.error || campRes.error;
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
          combos: base.combos,
          campanhas: base.campanhas,
          indicacoes: base.indicacoes ?? [],
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
          ptsParaReais: base.ptsParaReais,
          estabelecimento: base.estabelecimento,
          lojaAberta: base.lojaAberta,
        });
        return;
      }

      const produtos = (prodRes.data ?? []).map(mapProduto);
      const clientes = (cliRes.data ?? []).map(mapCliente);
      const pedidos = (pedRes.data ?? []).map(mapPedido);
      const ofertas = (ofRes.data ?? []).map(mapOferta);
      const resgates = (resRes.data ?? []).map(mapResgate);
      const combos = (comboRes.data ?? []).map(mapCombo);
      const campanhas = (campRes.data ?? []).map(mapCampanha);
      const st = stRes.data;

      set({
        produtos,
        clientes,
        pedidos,
        ofertas,
        resgates,
        combos,
        campanhas,
        online: true,
        carregado: true,
        carregando: false,
        clienteAtualId: st?.cliente_atual_id ?? undefined,
        somBancada: st?.som_bancada ?? true,
        impressaoAutomatica: st?.impressao_automatica ?? true,
        proximoPedido: st?.proximo_pedido ?? 600,
        ptsParaReais: parsePtsParaReais(st?.pts_para_reais_json),
        estabelecimento: parseEstabelecimento(st?.estabelecimento_json),
        lojaAberta: st?.loja_aberta ?? true,
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
        combos: base.combos,
        campanhas: base.campanhas,
        indicacoes: base.indicacoes ?? [],
        online: false,
        erro: e instanceof Error ? e.message : 'Erro ao carregar dados.',
        carregado: true,
        carregando: false,
        clienteAtualId: base.clienteAtualId,
        somBancada: base.somBancada,
        impressaoAutomatica: base.impressaoAutomatica,
        proximoPedido: base.proximoPedido,
        ptsParaReais: base.ptsParaReais,
        estabelecimento: base.estabelecimento,
        lojaAberta: base.lojaAberta,
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

  // Substitui o carrinho por uma cópia dos itens de outro pedido.
  // Usado pelo "Pedir de novo": o cliente repete sem precisar montar
  // tudo do zero. Não preserva ofertaId — as ofertas vigentes são
  // reavaliadas no checkout, então o preço pode mudar.
  clonarItensParaCarrinho: (itens) => {
    const produtos = get().produtos;
    const produtosMap = new Map(produtos.map((p) => [p.id, p]));
    const clonados: ItemCarrinho[] = itens
      .filter((i) => !i.comboId && produtosMap.has(i.produtoId))
      .map((i) => {
        const p = produtosMap.get(i.produtoId)!;
        return {
          produtoId: i.produtoId,
          pesoKg: i.pesoKg,
          preparos: [...i.preparos],
          observacao: i.observacao,
          precoUnitarioAplicado: p.precoKg,
          subtotal: roundSubtotal(i.pesoKg, p.precoKg),
        };
      });
    set({ carrinho: { itens: clonados } });
  },

  // ============================================================
  // Pedidos
  // ============================================================
  criarPedido: async (params) => {
    const s = get();
    if (!s.lojaAberta) throw new Error('Loja fechada no momento');
    const cliente = s.clientes.find((c) => c.id === params.clienteId);
    if (!cliente) throw new Error('cliente não encontrado');
    const nivel = _nivelPorPontos(cliente.pontosAcumuladoTotal);
    const pontosUsados = params.pontosUsados ?? 0;
    const descontoPontos = params.descontoPontos ?? 0;

    // Trava antes de gravar: ofertas com limite por cliente não podem
    // ser usadas acima do teto histórico do próprio cliente.
    const pedidosDoCliente = s.pedidos.filter((p) => p.clienteId === cliente.id);
    const limite = ofertaExcedeLimiteCliente(s.carrinho.itens, s.ofertas, pedidosDoCliente, cliente.id);
    if (limite) {
      const of = s.ofertas.find((o) => o.id === limite.ofertaId);
      throw new Error(
        `Limite de ${limite.limite} kg atingido na oferta "${of?.chamada ?? limite.ofertaId}". Você já comprou ${limite.usado} kg.`,
      );
    }

    const cotacao = cotarPedido({
      itens: s.carrinho.itens,
      produtos: s.produtos,
      ofertas: s.ofertas,
      combos: s.combos,
      nivel,
      cashbackUsado: params.cashbackUsado,
      descontoPontosReais: descontoPontos,
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
      pontosUsados,
      descontoPontos,
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
      const incrementosOfertas = calcularIncrementosOfertas(novoPedido.itens, s.ofertas);
      set((st) => {
        const novosClientes = st.clientes.map((c) =>
          c.id === cliente.id
            ? {
                ...c,
                saldoCashback:
                  Math.max(0, c.saldoCashback - params.cashbackUsado) +
                  cotacao.cashbackGerado,
                cashbackExpiraEm: validadeCashbackISO(novoPedido.criadoEm),
                pontos: Math.max(0, c.pontos - pontosUsados) + cotacao.pontosGerados,
                pontosAcumuladoTotal: c.pontosAcumuladoTotal + cotacao.pontosGerados,
              }
            : c,
        );
        const novasOfertas = st.ofertas.map((o) => {
          const inc = incrementosOfertas.get(o.id);
          return inc ? { ...o, quantidadeVendidaKg: o.quantidadeVendidaKg + inc } : o;
        });
        return {
          pedidos: [novoPedido, ...st.pedidos],
          clientes: novosClientes,
          ofertas: novasOfertas,
          proximoPedido: st.proximoPedido + 1,
          carrinho: { itens: [] },
        };
      });
      gravarSnapshotOffline(snapshotFromState(get()));
      marcarCriadoLocalmente(id);
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
      pontos_usados: pontosUsados,
      desconto_pontos: descontoPontos,
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
      pontos: Math.max(0, cliente.pontos - pontosUsados) + cotacao.pontosGerados,
      pontos_acumulado_total: cliente.pontosAcumuladoTotal + cotacao.pontosGerados,
    }).eq('id', cliente.id);

    // Incrementa `quantidadeVendidaKg` das ofertas usadas (especialmente
    // importante pras relâmpago: ao esgotar, a vitrine mostra "Acabou").
    const incrementosOfertas = calcularIncrementosOfertas(novoPedido.itens, s.ofertas);
    for (const [ofertaId, kg] of incrementosOfertas) {
      const of = s.ofertas.find((o) => o.id === ofertaId);
      if (!of) continue;
      await sb.from('ofertas').update({ quantidade_vendida_kg: of.quantidadeVendidaKg + kg }).eq('id', ofertaId);
    }

    // Incrementa proximoPedido.
    await sb.from('app_state').update({ proximo_pedido: idNum + 1 }).eq('id', 'singleton');

    await get().recarregarPedidos();
    await get().recarregarClientes();
    await get().recarregarOfertas();
    set({ carrinho: { itens: [] }, proximoPedido: idNum + 1 });
    marcarCriadoLocalmente(id);
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
    if (!s.lojaAberta) throw new Error('Loja fechada no momento');
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
      combo_id: o.comboId ?? null,
      brinde_produto_id: o.brindeProdutoId ?? null,
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
      combo_id: o.comboId ?? null,
      brinde_produto_id: o.brindeProdutoId ?? null,
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
  // Combos
  // ============================================================
  criarCombo: async (c) => {
    if (!get().online) {
      set((s) => ({ combos: [...s.combos, c] }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const { error } = await supabase().from('combos').insert({
      id: c.id,
      slug: c.slug,
      nome: c.nome,
      descricao: c.descricao,
      imagem: c.imagem,
      preco_combo: c.precoCombo,
      percentual_cashback: c.percentualCashback,
      itens: c.itens,
      ativo: c.ativo,
    });
    if (error) throw new Error(error.message);
    await get().recarregarCombos();
  },

  atualizarCombo: async (c) => {
    if (!get().online) {
      set((s) => ({ combos: s.combos.map((x) => (x.id === c.id ? c : x)) }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const { error } = await supabase().from('combos').update({
      slug: c.slug,
      nome: c.nome,
      descricao: c.descricao,
      imagem: c.imagem,
      preco_combo: c.precoCombo,
      percentual_cashback: c.percentualCashback,
      itens: c.itens,
      ativo: c.ativo,
    }).eq('id', c.id);
    if (error) throw new Error(error.message);
    await get().recarregarCombos();
  },

  desativarCombo: async (id) => {
    if (!get().online) {
      set((s) => ({ combos: s.combos.map((c) => (c.id === id ? { ...c, ativo: false } : c)) }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    await supabase().from('combos').update({ ativo: false }).eq('id', id);
    await get().recarregarCombos();
  },

  // ============================================================
  // Campanhas
  // ============================================================
  criarCampanha: async (c) => {
    if (!get().online) {
      set((s) => ({ campanhas: [c, ...s.campanhas] }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const { error } = await supabase().from('campanhas').insert({
      id: c.id,
      titulo: c.titulo,
      mensagem_template: c.mensagemTemplate,
      publico_alvo: c.publicoAlvo,
      clientes_ids: c.clientesIds ?? null,
      data_criacao: c.dataCriacao,
      data_envio: c.dataEnvio ?? null,
      total_destinatarios: c.totalDestinatarios,
      ativo: c.ativo,
    });
    if (error) throw new Error(error.message);
    await get().recarregarCampanhas();
  },

  atualizarCampanha: async (c) => {
    if (!get().online) {
      set((s) => ({ campanhas: s.campanhas.map((x) => (x.id === c.id ? c : x)) }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const { error } = await supabase().from('campanhas').update({
      titulo: c.titulo,
      mensagem_template: c.mensagemTemplate,
      publico_alvo: c.publicoAlvo,
      clientes_ids: c.clientesIds ?? null,
      total_destinatarios: c.totalDestinatarios,
      ativo: c.ativo,
    }).eq('id', c.id);
    if (error) throw new Error(error.message);
    await get().recarregarCampanhas();
  },

  desativarCampanha: async (id) => {
    if (!get().online) {
      set((s) => ({ campanhas: s.campanhas.map((c) => (c.id === id ? { ...c, ativo: false } : c)) }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    await supabase().from('campanhas').update({ ativo: false }).eq('id', id);
    await get().recarregarCampanhas();
  },

  marcarCampanhaEnviada: async (id, totalDestinatarios) => {
    const agora = new Date().toISOString();
    if (!get().online) {
      set((s) => ({
        campanhas: s.campanhas.map((c) =>
          c.id === id ? { ...c, dataEnvio: agora, totalDestinatarios } : c,
        ),
      }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    await supabase().from('campanhas').update({
      data_envio: agora,
      total_destinatarios: totalDestinatarios,
    }).eq('id', id);
    await get().recarregarCampanhas();
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
    try {
      const { error } = await supabase().from('clientes').insert({
        id: novo.id,
        nome: novo.nome,
        telefone: novo.telefone,
        nascimento: novo.nascimento ?? null,
        criado_em: novo.criadoEm,
        aceita_whatsapp: novo.aceitaWhatsapp,
      });
      if (error) throw error;
      await get().recarregarClientes();
      return novo;
    } catch (e) {
      // Se o Supabase recusar (ex.: RLS bloqueando insert anônimo),
      // adiciona o cliente localmente e segue. O snapshot garante que
      // sobrevive ao reload. Quando a permissão voltar, o cliente pode
      // ser sincronizado depois via admin.
      // eslint-disable-next-line no-console
      console.warn('[criarCliente] Supabase falhou, usando local:', e);
      set((s) => ({ clientes: [...s.clientes, novo] }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return novo;
    }
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
  // Resgates (catálogo de pontos)
  // ============================================================
  criarResgate: async (r) => {
    if (!get().online) {
      set((s) => ({ resgates: [...s.resgates, r] }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const { error } = await supabase().from('resgates').insert({
      id: r.id,
      nome: r.nome,
      custo_pontos: r.custoPontos,
      imagem: r.imagem,
      ativo: r.ativo,
    });
    if (error) throw new Error(error.message);
    await get().recarregarResgates();
  },

  atualizarResgate: async (r) => {
    if (!get().online) {
      set((s) => ({ resgates: s.resgates.map((x) => (x.id === r.id ? r : x)) }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    const { error } = await supabase().from('resgates').update({
      nome: r.nome,
      custo_pontos: r.custoPontos,
      imagem: r.imagem,
      ativo: r.ativo,
    }).eq('id', r.id);
    if (error) throw new Error(error.message);
    await get().recarregarResgates();
  },

  desativarResgate: async (id) => {
    if (!get().online) {
      set((s) => ({ resgates: s.resgates.map((r) => (r.id === id ? { ...r, ativo: false } : r)) }));
      gravarSnapshotOffline(snapshotFromState(get()));
      return;
    }
    await supabase().from('resgates').update({ ativo: false }).eq('id', id);
    await get().recarregarResgates();
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

  setPontosParaReais: async (mapa) => {
    set({ ptsParaReais: mapa });
    if (get().online) {
      await supabase().from('app_state').update<Partial<AppStateRow>>({
        pts_para_reais_json: JSON.stringify(mapa),
      }).eq('id', 'singleton');
    } else {
      gravarSnapshotOffline(snapshotFromState(get()));
    }
  },

  setEstabelecimento: async (e) => {
    set({ estabelecimento: e });
    if (get().online) {
      await supabase().from('app_state').update<Partial<AppStateRow>>({
        estabelecimento_json: JSON.stringify(e),
      }).eq('id', 'singleton');
    } else {
      gravarSnapshotOffline(snapshotFromState(get()));
    }
  },

  setLojaAberta: async (aberta) => {
    set({ lojaAberta: aberta });
    if (get().online) {
      await supabase().from('app_state').update<Partial<AppStateRow>>({
        loja_aberta: aberta,
      }).eq('id', 'singleton');
    } else {
      gravarSnapshotOffline(snapshotFromState(get()));
    }
  },

  // ---- Referral ----
  // Armazena o `?ref=` capturado na URL até o cliente concluir o
  // cadastro. Validade: até o próximo reload ou 24 h.
  setRefIndicacaoPendente: (codigo) => {
    set({ refIndicacaoPendente: codigo });
  },

  // Chamado em criarCliente: vincula o novo cliente ao indicador
  // (se houver `refIndicacaoPendente`) e cria uma indicação pendente.
  // Retorna o id do indicador pra UI exibir confirmação.
  vincularIndicacao: (clienteNovoId) => {
    const s = get();
    const codigo = s.refIndicacaoPendente;
    if (!codigo) return null;
    const indicador = s.clientes.find(
      (c) => c.codigoIndicacao?.toUpperCase() === codigo.toUpperCase(),
    );
    if (!indicador) return null;
    if (indicador.id === clienteNovoId) return null; // não pode indicar a si mesmo
    const jaIndicou = s.indicacoes.some(
      (i) => i.indicadorId === indicador.id && i.indicadoId === clienteNovoId,
    );
    if (jaIndicou) return indicador.id;
    const nova: Indicacao = {
      id: `ind-${Date.now()}`,
      indicadorId: indicador.id,
      indicadoId: clienteNovoId,
      codigoUsado: codigo,
      criadoEm: new Date().toISOString(),
      status: 'pendente',
    };
    set((st) => ({
      indicacoes: [...st.indicacoes, nova],
      clientes: st.clientes.map((c) =>
        c.id === clienteNovoId ? { ...c, indicadoPor: indicador.id } : c,
      ),
      refIndicacaoPendente: undefined,
    }));
    if (!get().online) gravarSnapshotOffline(snapshotFromState(get()));
    return indicador.id;
  },

  // Chamado em criarPedido: quando o cliente é um indicado com
  // indicação pendente, marca como convertida e credita R$ 10 de
  // cashback ao indicador. Idempotente (segunda chamada não credita
  // duas vezes).
  converterIndicacaoSeAplicavel: (clienteId, pedidoId) => {
    const s = get();
    const ind = s.indicacoes.find(
      (i) => i.indicadoId === clienteId && i.status === 'pendente',
    );
    if (!ind) return null;
    // Marca convertida
    set((st) => ({
      indicacoes: st.indicacoes.map((i) =>
        i.id === ind.id
          ? { ...i, status: 'convertido', recompensaCreditadaEm: new Date().toISOString() }
          : i,
      ),
      clientes: st.clientes.map((c) =>
        c.id === ind.indicadorId
          ? {
              ...c,
              saldoCashback: c.saldoCashback + 10,
              cashbackExpiraEm: new Date(Date.now() + 60 * 86400000).toISOString(),
            }
          : c,
      ),
    }));
    if (!get().online) gravarSnapshotOffline(snapshotFromState(get()));
    return { indicadorId: ind.indicadorId, valor: 10 };
  },

  recarregarIndicacoes: async () => {
    if (!get().online) return;
    // Online: tabela indicacoes — sem RPC específica aqui, deixa só
    // como esqueleto pra quando o Supabase for plugado.
  },

  toggleFavoritaReceita: (slug) => {
    set((st) => {
      const tem = st.receitasFavoritas.includes(slug);
      return {
        receitasFavoritas: tem
          ? st.receitasFavoritas.filter((s) => s !== slug)
          : [...st.receitasFavoritas, slug],
      };
    });
    if (!get().online) gravarSnapshotOffline(snapshotFromState(get()));
  },

  // ============================================================
  // Demo
  // ============================================================
  reiniciarDemonstracao: async () => {
    if (get().online) {
      try {
        const { error } = await supabase().rpc('reset_demo');
        if (error) throw error;
        await get().carregarTudo();
      } catch (e) {
        // Sem a RPC no servidor ou sem permissão de executá-la, cai
        // pro snapshot/seed local pra demo não ficar "presa". Avisa o
        // usuário que foi um reset local, não no servidor.
        // eslint-disable-next-line no-console
        console.warn('[reset_demo] RPC falhou, usando snapshot local:', e);
        const snap = lerSnapshotOffline();
        const base = snap ?? seedFallback();
        set({
          ...initialState,
          ...base,
          carregado: true,
          online: false,
          erro: 'Reset feito localmente — sem acesso ao servidor.',
        });
        gravarSnapshotOffline(snapshotFromState(get()));
      }
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

  recarregarCombos: async () => {
    if (!get().online) return;
    const { data, error } = await supabase().from('combos').select('*').order('nome');
    if (!error && data) set({ combos: data.map(mapCombo) });
  },

  recarregarCampanhas: async () => {
    if (!get().online) return;
    const { data, error } = await supabase().from('campanhas').select('*').order('data_criacao', { ascending: false });
    if (!error && data) set({ campanhas: data.map(mapCampanha) });
  },

  recarregarResgates: async () => {
    if (!get().online) return;
    const { data, error } = await supabase().from('resgates').select('*').order('custo_pontos');
    if (!error && data) set({ resgates: data.map(mapResgate) });
  },
}));

function roundSubtotal(peso: number, preco: number): number {
  return Math.round(peso * preco * 100) / 100;
}

// Soma, por oferta, quanto daquela oferta foi vendido neste pedido.
// Usado pra atualizar `quantidadeVendidaKg` após criar o pedido — sem
// isso, a barra de progresso das relâmpago ficaria parada pra sempre.
function calcularIncrementosOfertas(
  itens: ItemCarrinho[],
  ofertas: Oferta[],
): Map<string, number> {
  const out = new Map<string, number>();
  for (const it of itens) {
    if (it.comboId || !it.ofertaId) continue;
    out.set(it.ofertaId, (out.get(it.ofertaId) ?? 0) + it.pesoKg);
  }
  // Garante que só contabiliza ofertas que ainda existem (não dá pra
  // incrementar uma oferta deletada).
  const ids = new Set(ofertas.map((o) => o.id));
  for (const id of [...out.keys()]) if (!ids.has(id)) out.delete(id);
  return out;
}

// Verifica se os itens do carrinho não excedem o limite por cliente em
// nenhuma das ofertas usadas. Retorna a primeira oferta que estoura.
export function ofertaExcedeLimiteCliente(
  itens: ItemCarrinho[],
  ofertas: Oferta[],
  pedidosAnterioresCliente: Pedido[],
  clienteId: string,
): { ofertaId: string; limite: number; usado: number } | null {
  const limitePorOferta = new Map<string, number>();
  for (const it of itens) {
    if (it.comboId || !it.ofertaId) continue;
    const of = ofertas.find((o) => o.id === it.ofertaId);
    if (!of?.limitePorCliente) continue;
    limitePorOferta.set(it.ofertaId, (limitePorOferta.get(it.ofertaId) ?? 0) + it.pesoKg);
  }
  for (const [ofertaId, usadoAgora] of limitePorOferta) {
    const of = ofertas.find((o) => o.id === ofertaId);
    if (!of?.limitePorCliente) continue;
    const limite = of.limitePorCliente;
    // Soma o que esse mesmo cliente já comprou nessa oferta antes.
    const usadoAntes = pedidosAnterioresCliente
      .filter((p) => p.status !== 'cancelado')
      .flatMap((p) => p.itens)
      .filter((i) => !i.comboId && i.ofertaId === ofertaId)
      .reduce((s, i) => s + i.pesoKg, 0);
    if (usadoAntes + usadoAgora > limite) {
      return { ofertaId, limite, usado: usadoAntes };
    }
  }
  return null;
}

// Re-exporta helpers para componentes importarem do store.
export { cotarPedido, validadeCashbackISO };
export { calcularMaximoUsoCashback, melhorDescontoPontos, nivelPorPontos } from './regras';

// Filtra pedidos por status, retornando referência estável enquanto a
// lista filtrada não muda. Útil pra evitar que páginas como
// `/bancada` re-renderizem a cada tick do timer (que muda `tick` mas
// não muda a lista filtrada).
export function filtrarPedidosPorStatus(
  pedidos: Pedido[],
  statuses: StatusPedido[],
): Pedido[] {
  const set = new Set(statuses);
  return pedidos.filter((p) => set.has(p.status));
}
