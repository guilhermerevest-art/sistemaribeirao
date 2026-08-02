-- Empório Ribeirão — promoções podem ter recorrência semanal.
-- Quando `dias_semana` é vazio/nulo, a oferta vale todos os dias dentro
-- do período `inicio_em`/`fim_em` (comportamento legado).
-- Quando preenchido (ex: [5, 6] = sexta e sábado), a oferta só fica
-- visível nesses dias da semana, durante o período. A cada virada de
-- semana ela reabre sozinha.

alter table public.ofertas
  add column if not exists dias_semana int[] not null default '{}';
