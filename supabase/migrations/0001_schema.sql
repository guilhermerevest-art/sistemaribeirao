-- Açougue Ribeirão — schema base.
-- Cria as tabelas principais e habilita RLS com policies permissivas para o MVP.
-- Aplicar via `mcp__claude_ai_Supabase__apply_migration` quando o MCP voltar.

create extension if not exists "pgcrypto";

-- Categorias: açougue (originais) + empório (novas).
-- Mantemos como TEXT simples pra ficar fácil de estender.
create table if not exists public.categorias (
  id text primary key,
  label text not null,
  icone text not null default 'package',
  ordem int not null default 0,
  ativo boolean not null default true
);

create table if not exists public.produtos (
  id text primary key,
  slug text not null unique,
  nome text not null,
  categoria text not null references public.categorias(id) on update cascade,
  corte text,
  descricao text not null default '',
  preco_kg numeric(10, 2) not null check (preco_kg >= 0),
  unidade_venda text not null check (unidade_venda in ('kg', 'peca', 'bandeja', 'unidade')),
  peso_medio_peca numeric(10, 3),
  imagem text not null default '',
  percentual_cashback numeric(5, 4) not null default 0,
  preparos_disponiveis jsonb not null default '[]'::jsonb,
  destaque boolean not null default false,
  novidade boolean not null default false,
  disponivel boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_produtos_categoria on public.produtos(categoria);
create index if not exists idx_produtos_destaque on public.produtos(destaque) where destaque;

create table if not exists public.clientes (
  id text primary key,
  nome text not null,
  telefone text not null,
  nascimento date,
  criado_em timestamptz not null default now(),
  saldo_cashback numeric(10, 2) not null default 0,
  cashback_expira_em timestamptz,
  pontos int not null default 0,
  pontos_acumulado_total int not null default 0,
  aceita_whatsapp boolean not null default true
);
create unique index if not exists idx_clientes_telefone on public.clientes(telefone);

create table if not exists public.ofertas (
  id text primary key,
  tipo text not null check (tipo in ('semana', 'relampago')),
  produto_id text not null references public.produtos(id) on delete cascade,
  preco_de numeric(10, 2) not null,
  preco_por numeric(10, 2) not null,
  inicio_em timestamptz not null,
  fim_em timestamptz not null,
  limite_por_cliente numeric(10, 2),
  quantidade_total_kg numeric(10, 2),
  quantidade_vendida_kg numeric(10, 2) not null default 0,
  chamada text not null default '',
  ativa boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_ofertas_ativa_fim on public.ofertas(ativa, fim_em);

create table if not exists public.pedidos (
  id text primary key,
  cliente_id text not null references public.clientes(id) on delete restrict,
  itens jsonb not null,
  subtotal numeric(10, 2) not null,
  desconto_ofertas numeric(10, 2) not null default 0,
  cashback_usado numeric(10, 2) not null default 0,
  taxa_entrega numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  cashback_gerado numeric(10, 2) not null default 0,
  pontos_gerados int not null default 0,
  status text not null check (status in ('novo', 'preparando', 'pronto', 'entregue', 'cancelado')),
  retirada text not null check (retirada in ('balcao', 'entrega')),
  endereco text,
  pagamento text not null check (pagamento in ('pix', 'cartao_entrega', 'dinheiro')),
  troco_para numeric(10, 2),
  observacao_geral text,
  criado_em timestamptz not null default now(),
  impresso_em timestamptz,
  cupom_impresso boolean not null default false
);
create index if not exists idx_pedidos_cliente on public.pedidos(cliente_id);
create index if not exists idx_pedidos_status on public.pedidos(status);
create index if not exists idx_pedidos_criado on public.pedidos(criado_em desc);

create table if not exists public.resgates (
  id text primary key,
  nome text not null,
  custo_pontos int not null check (custo_pontos > 0),
  imagem text not null default '',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Estado mutável do "cliente atual" e preferências da bancada.
-- Mantido como singleton (id='singleton') pra ficar simples pro MVP.
create table if not exists public.app_state (
  id text primary key default 'singleton',
  cliente_atual_id text references public.clientes(id) on delete set null,
  som_bancada boolean not null default true,
  impressao_automatica boolean not null default true,
  proximo_pedido int not null default 600,
  updated_at timestamptz not null default now()
);
insert into public.app_state (id) values ('singleton') on conflict (id) do nothing;

-- RLS: ligado com policies permissivas para o MVP.
-- Antes de produção real, apertar as policies (ex: cliente só vê o próprio
-- pedido via auth.uid()). Por ora é tudo aberto para o mock.
alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.clientes enable row level security;
alter table public.ofertas enable row level security;
alter table public.pedidos enable row level security;
alter table public.resgates enable row level security;
alter table public.app_state enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='categorias' and policyname='allow_all') then
    create policy allow_all on public.categorias for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='produtos' and policyname='allow_all') then
    create policy allow_all on public.produtos for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='clientes' and policyname='allow_all') then
    create policy allow_all on public.clientes for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ofertas' and policyname='allow_all') then
    create policy allow_all on public.ofertas for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='pedidos' and policyname='allow_all') then
    create policy allow_all on public.pedidos for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='resgates' and policyname='allow_all') then
    create policy allow_all on public.resgates for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='app_state' and policyname='allow_all') then
    create policy allow_all on public.app_state for all using (true) with check (true);
  end if;
end $$;

-- RPC: zera tudo e recarrega o estado inicial do app.
-- Equivalente ao botão "Reiniciar demonstração".
create or replace function public.reset_demo()
returns void
language plpgsql
security definer
as $$
begin
  truncate table public.pedidos restart identity cascade;
  truncate table public.ofertas restart identity cascade;
  truncate table public.resgates restart identity cascade;
  truncate table public.clientes restart identity cascade;
  truncate table public.produtos restart identity cascade;
  truncate table public.categorias restart identity cascade;
  delete from public.app_state where id = 'singleton';
  insert into public.app_state (id) values ('singleton');
end;
$$;

grant execute on function public.reset_demo() to anon, authenticated;
