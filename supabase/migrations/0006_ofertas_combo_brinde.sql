-- Empório Ribeirão — promoções podem se referir a um combo (organizacional)
-- e podem dar um brinde (produto grátis, informativo no cupom).

alter table public.ofertas
  add column if not exists combo_id text references public.combos(id) on delete set null,
  add column if not exists brinde_produto_id text references public.produtos(id) on delete set null;
