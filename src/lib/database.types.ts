// Tipos do banco Supabase. Versão manual espelhando supabase/migrations/0001_schema.sql.
// Quando o MCP Supabase voltar, regenerar com:
//   mcp__claude_ai_Supabase__generate_typescript_types
// e colar o resultado aqui.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CategoriaRow = {
  id: string;
  label: string;
  icone: string;
  ordem: number;
  ativo: boolean;
};

export type ProdutoRow = {
  id: string;
  slug: string;
  nome: string;
  categoria: string;
  corte: string | null;
  descricao: string;
  preco_kg: number;
  unidade_venda: 'kg' | 'peca' | 'bandeja' | 'unidade';
  peso_medio_peca: number | null;
  imagem: string;
  percentual_cashback: number;
  preparos_disponiveis: string[];
  destaque: boolean;
  novidade: boolean;
  disponivel: boolean;
  created_at: string;
  updated_at: string;
};

export type ClienteRow = {
  id: string;
  nome: string;
  telefone: string;
  nascimento: string | null;
  criado_em: string;
  saldo_cashback: number;
  cashback_expira_em: string | null;
  pontos: number;
  pontos_acumulado_total: number;
  aceita_whatsapp: boolean;
};

export type OfertaRow = {
  id: string;
  tipo: 'semana' | 'relampago';
  produto_id: string;
  preco_de: number;
  preco_por: number;
  inicio_em: string;
  fim_em: string;
  limite_por_cliente: number | null;
  quantidade_total_kg: number | null;
  quantidade_vendida_kg: number;
  chamada: string;
  ativa: boolean;
  combo_id: string | null;
  brinde_produto_id: string | null;
  /** Recorrência semanal: 0=domingo, 6=sábado. Vazio = todos os dias. */
  dias_semana: number[];
  created_at: string;
};

export type PedidoItem = {
  produtoId: string;
  pesoKg: number;
  preparos: string[];
  observacao?: string;
  ofertaId?: string;
  precoUnitarioAplicado: number;
  subtotal: number;
};

export type PedidoRow = {
  id: string;
  cliente_id: string;
  itens: PedidoItem[];
  subtotal: number;
  desconto_ofertas: number;
  cashback_usado: number;
  pontos_usados: number;
  desconto_pontos: number;
  taxa_entrega: number;
  total: number;
  cashback_gerado: number;
  pontos_gerados: number;
  status: 'novo' | 'preparando' | 'pronto' | 'entregue' | 'cancelado';
  retirada: 'balcao' | 'entrega';
  endereco: string | null;
  pagamento: 'pix' | 'cartao_entrega' | 'dinheiro';
  troco_para: number | null;
  observacao_geral: string | null;
  criado_em: string;
  impresso_em: string | null;
  cupom_impresso: boolean;
};

export type ResgateRow = {
  id: string;
  nome: string;
  custo_pontos: number;
  imagem: string;
  ativo: boolean;
  created_at: string;
};

export type AppStateRow = {
  id: 'singleton';
  cliente_atual_id: string | null;
  som_bancada: boolean;
  impressao_automatica: boolean;
  proximo_pedido: number;
  pts_para_reais_json: string;
  estabelecimento_json: string | null;
  loja_aberta: boolean | null;
  updated_at: string;
};

export type ItemComboJson = {
  produtoId: string;
  quantidadeKg: number;
};

export type ComboRow = {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  imagem: string;
  preco_combo: number;
  percentual_cashback: number;
  itens: ItemComboJson[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type CampanhaRow = {
  id: string;
  titulo: string;
  mensagem_template: string;
  publico_alvo: 'novo' | 'fiel' | 'ocasional' | 'em_risco' | 'inativo' | 'todos' | 'custom';
  clientes_ids: string[] | null;
  data_criacao: string;
  data_envio: string | null;
  total_destinatarios: number;
  ativo: boolean;
};

export type Database = {
  public: {
    Tables: {
      categorias: { Row: CategoriaRow; Insert: CategoriaRow; Update: Partial<CategoriaRow> };
      produtos: { Row: ProdutoRow; Insert: ProdutoRow; Update: Partial<ProdutoRow> };
      clientes: { Row: ClienteRow; Insert: ClienteRow; Update: Partial<ClienteRow> };
      ofertas: { Row: OfertaRow; Insert: OfertaRow; Update: Partial<OfertaRow> };
      pedidos: { Row: PedidoRow; Insert: Partial<PedidoRow>; Update: Partial<PedidoRow> };
      resgates: { Row: ResgateRow; Insert: ResgateRow; Update: Partial<ResgateRow> };
      combos: { Row: ComboRow; Insert: ComboRow; Update: Partial<ComboRow> };
      campanhas: { Row: CampanhaRow; Insert: CampanhaRow; Update: Partial<CampanhaRow> };
      app_state: { Row: AppStateRow; Insert: AppStateRow; Update: Partial<AppStateRow> };
    };
    Views: Record<string, never>;
    Functions: { reset_demo: { Args: Record<string, never>; Returns: void } };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
