-- Empório Ribeirão — desconto em R$ pago com pontos no checkout.

alter table public.pedidos
  add column if not exists pontos_usados int not null default 0,
  add column if not exists desconto_pontos numeric(10, 2) not null default 0;
