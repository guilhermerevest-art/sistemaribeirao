-- Açougue Ribeirão — combos, campanhas e config de pontos->R$.

create table if not exists public.combos (
  id text primary key,
  slug text not null unique,
  nome text not null,
  descricao text not null default '',
  imagem text not null default '',
  preco_combo numeric(10, 2) not null check (preco_combo >= 0),
  percentual_cashback numeric(5, 4) not null default 0,
  itens jsonb not null default '[]'::jsonb,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_combos_ativo on public.combos(ativo) where ativo;

create table if not exists public.campanhas (
  id text primary key,
  titulo text not null,
  mensagem_template text not null default '',
  publico_alvo text not null default 'todos'
    check (publico_alvo in ('novo', 'fiel', 'ocasional', 'em_risco', 'inativo', 'todos', 'custom')),
  clientes_ids jsonb,
  data_criacao timestamptz not null default now(),
  data_envio timestamptz,
  total_destinatarios int not null default 0,
  ativo boolean not null default true
);
create index if not exists idx_campanhas_ativo on public.campanhas(ativo) where ativo;

alter table public.app_state
  add column if not exists pts_para_reais_json text not null default '{"100":1,"500":5}';

alter table public.combos enable row level security;
alter table public.campanhas enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='combos' and policyname='allow_all') then
    create policy allow_all on public.combos for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='campanhas' and policyname='allow_all') then
    create policy allow_all on public.campanhas for all using (true) with check (true);
  end if;
end $$;

-- reset_demo() precisa truncar as novas tabelas também.
create or replace function public.reset_demo()
returns void
language plpgsql
security definer
as $$
begin
  truncate table public.pedidos restart identity cascade;
  truncate table public.campanhas restart identity cascade;
  truncate table public.combos restart identity cascade;
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
