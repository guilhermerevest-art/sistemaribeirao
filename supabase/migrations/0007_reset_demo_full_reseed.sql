-- Empório Ribeirão — reset_demo() agora reseeda de verdade.
--
-- Bug corrigido: antes, reset_demo() só truncava as tabelas e nunca
-- recarregava os dados — clicar em "Reiniciar demonstração" com o app
-- online (conectado ao Supabase) apagava categorias, produtos, clientes,
-- ofertas e resgates e deixava tudo vazio. O caminho offline (localStorage)
-- sempre funcionou certo porque usa o seed em JS (src/lib/seed.ts).
--
-- Agora a função embute o mesmo seed de supabase/migrations/0002_seed.sql
-- (com o fix de round(double precision) -> round(numeric)), então
-- reiniciar sempre devolve o catálogo, os 24 clientes e o histórico de
-- pedidos completos — não uma base vazia.

create or replace function public.reset_demo()
returns void
language plpgsql
security definer
as $$
declare
  nomes text[] := array[
    'Maria Aparecida Silva', 'José Carlos Ferreira', 'Ana Paula Souza',
    'João Batista dos Santos', 'Lúcia Helena Oliveira', 'Pedro Henrique Lima',
    'Sandra Regina Costa', 'Antônio Carlos Pereira', 'Rosa Maria Almeida',
    'Francisco das Chagas', 'Patrícia Mendes', 'Marcos Antônio Ribeiro',
    'Juliana Cristina Rocha', 'Rafael Augusto Gomes', 'Beatriz Helena Castro',
    'Carlos Alberto Dias', 'Márcia Regina Barbosa', 'Sergio Luiz Pacheco',
    'Cristina Vieira da Silva', 'Roberto Carlos Tavares', 'Denise Oliveira Santos',
    'Eduardo Luiz Moreira', 'Fernanda Paula Cardoso', 'Gabriel Henrique Nunes'
  ];
  telefones text[] := array[
    '34988551201','34988551202','34988551203','34988551204','34988551205',
    '34988551206','34988551207','34988551208','34988551209','34988551210',
    '34988551211','34988551212','34988551213','34988551214','34988551215',
    '34988551216','34988551217','34988551218','34988551219','34988551220',
    '34988551221','34988551222','34988551223','34988551224'
  ];
  aceita bool[] := array[
    true,true,true,false,true,true,true,true,true,true,
    true,true,true,true,true,true,true,false,true,true,
    true,true,true,true
  ];
  padroes text[] := array[
    'fiel','fiel','fiel','fiel','fiel',
    'ocasional','ocasional','ocasional','ocasional','ocasional',
    'ocasional','ocasional','ocasional',
    'novo','novo','novo','novo',
    'em_risco','em_risco','em_risco','em_risco',
    'inativo','inativo','inativo'
  ];
  i int;
  cid text;
  padrao text;
  criado timestamptz;
  seq int;
  itens jsonb;
  subtot numeric(10,2);
  j int;
begin
  -- Zera tudo, inclusive o que foi criado nesta sessão (combos, campanhas,
  -- clientes/produtos novos cadastrados pelo dono).
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

  -- Categorias (12)
  insert into public.categorias (id, label, icone, ordem) values
    ('bovino',     'Bovino',         'beef',     1),
    ('suino',      'Suíno',          'pig',      2),
    ('aves',       'Aves',           'drumstick', 3),
    ('embutidos',  'Embutidos',      'sausage',  4),
    ('preparados', 'Preparados',     'utensils', 5),
    ('churrasco',  'Churrasco',      'flame',    6),
    ('hortifruti', 'Hortifruti',     'apple',    7),
    ('laticinios', 'Laticínios',     'milk',     8),
    ('mercearia',  'Mercearia',      'shopping-basket', 9),
    ('bebidas',    'Bebidas',        'beer',     10),
    ('frios',      'Frios',          'snowflake', 11),
    ('petiscos',   'Petiscos',       'cookie',   12);

  -- Produtos (~50)
  insert into public.produtos (id, slug, nome, categoria, corte, descricao, preco_kg, unidade_venda, peso_medio_peca, imagem, percentual_cashback, preparos_disponiveis, destaque, novidade, disponivel) values
    ('p-picanha', 'picanha-maturada', 'Picanha Maturada', 'bovino', 'Traseiro', 'Peça inteira, capa de gordura preservada. Maturada por 21 dias.', 89.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.03, '["Cortar em bifes","Cortar para churrasco","Peça inteira","Tirar a gordura"]'::jsonb, true, false, true),
    ('p-contrafile', 'contrafile', 'Contrafilé', 'bovino', 'Traseiro', 'Corte nobre, ideal para bifes e churrasco.', 54.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.03, '["Cortar em bifes","Cortar em cubos","Moer","Tirar a gordura","Amaciar"]'::jsonb, false, false, true),
    ('p-alcatra', 'alcatra', 'Alcatra', 'bovino', 'Traseiro', 'Carne macia, ótima para o dia a dia.', 52.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.03, '["Cortar em bifes","Cortar em cubos","Moer","Tirar a gordura"]'::jsonb, false, false, true),
    ('p-maminha', 'maminha', 'Maminha', 'bovino', 'Traseiro', 'Suculenta, vai bem inteira na brasa.', 49.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.03, '["Cortar em bifes","Cortar para churrasco","Peça inteira"]'::jsonb, false, false, true),
    ('p-fraldinha', 'fraldinha', 'Fraldinha', 'bovino', 'Dianteiro', 'Sabor marcante, pedida certa do churrasco.', 47.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.03, '["Cortar em bifes","Cortar em cubos","Cortar para churrasco","Peça inteira"]'::jsonb, true, false, true),
    ('p-costela-ripa', 'costela-ripa', 'Costela Ripa', 'bovino', 'Dianteiro', 'Para assar low and slow. Paciente e saborosa.', 32.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.03, '["Cortar em pedaços","Peça inteira","Cortar em cubos"]'::jsonb, false, false, true),
    ('p-coxao-mole', 'coxao-mole', 'Coxão Mole', 'bovino', 'Traseiro', 'Magro, ideal para bisteca e cozido.', 44.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.03, '["Cortar em bifes","Cortar em cubos","Moer","Tirar a gordura"]'::jsonb, false, false, true),
    ('p-patinho', 'patinho-moido', 'Patinho Moído na Hora', 'bovino', 'Traseiro', 'Moído na hora, ideal para hambúrguer caseiro.', 39.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.03, '["Moer"]'::jsonb, false, false, true),
    ('p-acem', 'acem', 'Acém', 'bovino', 'Dianteiro', 'Para panela, ensopados e carne de forno.', 34.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.03, '["Cortar em cubos","Cortar em bifes","Tirar a gordura"]'::jsonb, false, false, true),
    ('p-musculo', 'musculo', 'Músculo', 'bovino', 'Dianteiro', 'Para cozido e mocotó. Sabor profundo.', 33.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.03, '["Cortar em cubos","Peça inteira"]'::jsonb, false, false, true),
    ('p-pernil', 'pernil-sem-osso', 'Pernil sem Osso', 'suino', null, 'Sem osso, ideal para assar ou fazer torresmo.', 28.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.04, '["Cortar em pedaços","Peça inteira","Temperar"]'::jsonb, false, false, true),
    ('p-costelinha', 'costelinha-suina', 'Costelinha', 'suino', null, 'Para churrasco ou assado.', 32.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.04, '["Cortar em pedaços","Peça inteira","Cortar em bifes"]'::jsonb, false, false, true),
    ('p-lombo', 'lombo-suino', 'Lombo', 'suino', null, 'Magro, nobre, ótimo para assar.', 34.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.04, '["Cortar em bifes","Peça inteira","Temperar"]'::jsonb, false, false, true),
    ('p-bisteca', 'bisteca-suina', 'Bisteca', 'suino', null, 'Clássica da chapa.', 26.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.04, '["Cortar em bifes","Temperar"]'::jsonb, false, false, true),
    ('p-panceta', 'panceta', 'Panceta', 'suino', null, 'Barriga com camada, para churrasco.', 33.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.04, '["Cortar em pedaços","Peça inteira","Temperar"]'::jsonb, false, false, true),
    ('p-peito-frango', 'peito-de-frango', 'Peito de Frango', 'aves', null, 'Sem osso, fresco do dia.', 22.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.04, '["Inteiro","Em pedaços","Cortar em tiras","Moer"]'::jsonb, false, false, true),
    ('p-coxa-sobrecoxa', 'coxa-e-sobrecoxa', 'Coxa e Sobrecoxa', 'aves', null, 'Resistente ao forno e air fryer.', 16.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.04, '["Inteiro","Em pedaços","Desossar"]'::jsonb, false, false, true),
    ('p-frango-inteiro', 'frango-inteiro', 'Frango Inteiro', 'aves', null, 'Para assar ou fazer canjica.', 15.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.04, '["Inteiro","Em pedaços","Desossar"]'::jsonb, false, false, true),
    ('p-coracao', 'coracao-de-frango', 'Coração de Frango', 'aves', null, 'Para espeto e recheio.', 39.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.04, '["Inteiro"]'::jsonb, false, true, true),
    ('p-linguica-toscana', 'linguica-toscana', 'Linguiça Toscana Artesanal', 'embutidos', null, 'Tempero da casa, fabricada aqui.', 29.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.05, '["Peça inteira","Cortar em gomos"]'::jsonb, true, false, true),
    ('p-linguica-apimentada', 'linguica-apimentada', 'Linguiça Apimentada', 'embutidos', null, 'Para quem curte um toque ardido.', 31.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.05, '["Peça inteira","Cortar em gomos"]'::jsonb, false, false, true),
    ('p-calabresa', 'calabresa', 'Calabresa', 'embutidos', null, 'Defumada, fatiada ou inteira.', 34.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.05, '["Peça inteira","Fatiar fino"]'::jsonb, false, false, true),
    ('p-bacon', 'bacon-em-manta', 'Bacon em Manta', 'embutidos', null, 'Sem cortumes, ideal para envolver.', 42.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.05, '["Peça inteira","Fatiar fino"]'::jsonb, false, false, true),
    ('p-hamburguer', 'hamburguer-180g', 'Hambúrguer Artesanal 180g', 'preparados', null, 'Bandeja com 4 unidades, temperadas e seladas.', 34.9, 'bandeja', 0.72, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.05, '[]'::jsonb, false, false, true),
    ('p-espetinho', 'espetinho-misto', 'Espetinho Misto', 'preparados', null, 'Carne, linguiça e cebola. Unitário.', 8.9, 'unidade', 0.15, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.05, '[]'::jsonb, false, false, true),
    ('p-almondega', 'almondega-temperada', 'Almôndega Temperada', 'preparados', null, 'Bandeja 1 kg, prontas para o molho.', 42.9, 'bandeja', 1, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.05, '[]'::jsonb, false, false, true),
    ('p-carvao', 'carvao-5kg', 'Carvão 5kg', 'churrasco', null, 'Queima uniforme, sem fagulhas.', 24.9, 'peca', 5, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.02, '[]'::jsonb, false, false, true),
    ('p-sal-grosso', 'sal-grosso-1kg', 'Sal Grosso 1kg', 'churrasco', null, 'Granulometria ideal para a carne.', 7.9, 'unidade', 1, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.02, '[]'::jsonb, false, false, true),
    ('p-banana', 'banana-prata', 'Banana Prata', 'hortifruti', null, 'Cacho do dia, sem amadurecedor.', 5.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, false, false, true),
    ('p-tomate', 'tomate-italiano', 'Tomate Italiano', 'hortifruti', null, 'Firme, bom pro molho do domingo.', 8.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, false, false, true),
    ('p-batata', 'batata-inglesa', 'Batata Inglesa', 'hortifruti', null, 'Tamanho médio, boa pra fritar.', 4.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, false, false, true),
    ('p-cebola', 'cebola-amarela', 'Cebola Amarela', 'hortifruti', null, 'Pra churrasco e refogado.', 5.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, false, false, true),
    ('p-alho', 'alho-roxo', 'Alho Roxo', 'hortifruti', null, 'Cabeça fresca, sem broto.', 24.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, false, false, true),
    ('p-limao', 'limao-tahiti', 'Limão Tahiti', 'hortifruti', null, 'Colhido ontem.', 6.9, 'kg', null, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, false, false, true),
    ('p-queijo-minas', 'queijo-minas', 'Queijo Minas Frescal 500g', 'laticinios', null, 'Da fazenda, fresco.', 22.9, 'unidade', 0.5, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.02, '[]'::jsonb, false, true, true),
    ('p-manteiga', 'manteiga-200g', 'Manteiga com Sal 200g', 'laticinios', null, 'De primeira qualidade.', 14.9, 'unidade', 0.2, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.02, '[]'::jsonb, false, false, true),
    ('p-requeijao', 'requeijao-200g', 'Requeijão Cremoso 200g', 'laticinios', null, 'Catupiry original.', 9.9, 'unidade', 0.2, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.02, '[]'::jsonb, false, false, true),
    ('p-leite', 'leite-integral-1l', 'Leite Integral 1L', 'laticinios', null, 'Caixinha, longa vida.', 5.9, 'unidade', 1, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.02, '[]'::jsonb, false, false, true),
    ('p-arroz', 'arroz-tipo1-5kg', 'Arroz Tipo 1 5kg', 'mercearia', null, 'Grão longo, agulhinha.', 27.9, 'peca', 5, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, false, false, true),
    ('p-feijao', 'feijao-carioca-1kg', 'Feijão Carioca 1kg', 'mercearia', null, 'Tipo 1, novo.', 8.9, 'peca', 1, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, false, false, true),
    ('p-acucar', 'acucar-cristal-5kg', 'Açúcar Cristal 5kg', 'mercearia', null, 'Saca lacrada.', 19.9, 'peca', 5, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, false, false, true),
    ('p-cafe', 'cafe-500g', 'Café Torrado e Moído 500g', 'mercearia', null, 'Tradicional da casa.', 14.9, 'peca', 0.5, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, false, false, true),
    ('p-coca-2l', 'coca-cola-2l', 'Coca-Cola 2L', 'bebidas', null, 'Garrafa PET.', 12.9, 'unidade', 2, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, true, false, true),
    ('p-guarana-2l', 'guarana-antarctica-2l', 'Guaraná Antarctica 2L', 'bebidas', null, 'Brasileiro de verdade.', 11.9, 'unidade', 2, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, false, false, true),
    ('p-cerveja-600', 'cerveja-600ml', 'Cerveja 600ml (pack 12)', 'bebidas', null, 'Long neck 12 unidades.', 79.9, 'peca', 12, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, true, true, true),
    ('p-suco-1l', 'suco-laranja-1l', 'Suco de Laranja 1L', 'bebidas', null, 'Integral, sem açúcar.', 16.9, 'unidade', 1, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.01, '[]'::jsonb, false, false, true),
    ('p-presunto', 'presunto-fatiado-200g', 'Presunto Fatiado 200g', 'frios', null, 'Tipo Parma.', 16.9, 'peca', 0.2, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.02, '[]'::jsonb, false, false, true),
    ('p-mortadela', 'mortadela-300g', 'Mortadela 300g', 'frios', null, 'Ceratti defumada.', 18.9, 'peca', 0.3, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.02, '[]'::jsonb, false, false, true),
    ('p-peito-peru', 'peito-peru-200g', 'Peito de Peru Fatiado 200g', 'frios', null, 'Sem capa de gordura.', 22.9, 'peca', 0.2, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.02, '[]'::jsonb, false, true, true),
    ('p-torresmo', 'torresmo-pronto-150g', 'Torresmo Pronto 150g', 'petiscos', null, 'Buchada crocante pra cerveja.', 14.9, 'peca', 0.15, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.02, '[]'::jsonb, false, false, true),
    ('p-amendoim', 'amendoim-torrado-500g', 'Amendoim Torrado 500g', 'petiscos', null, 'Com casca e sal.', 12.9, 'peca', 0.5, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.02, '[]'::jsonb, false, false, true),
    ('p-pipoca', 'pipoca-microonda-100g', 'Pipoca Micro-ondas 100g', 'petiscos', null, 'Manteiga, pacote família.', 9.9, 'peca', 0.1, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', 0.02, '[]'::jsonb, false, true, true);

  -- Resgates (6)
  insert into public.resgates (id, nome, custo_pontos, imagem, ativo) values
    ('r-toscana',    '1 kg de Linguiça Toscana',     500,  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', true),
    ('r-coxa',       '1 kg de Coxa e Sobrecoxa',     800,  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', true),
    ('r-hamburguer', 'Bandeja de Hambúrguer',        1200, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', true),
    ('r-costela',    '1 kg de Costela',              1500, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', true),
    ('r-fraldinha',  '1 kg de Fraldinha',            2500, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', true),
    ('r-picanha',    '1 kg de Picanha',              4000, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=60', true);

  -- Clientes (24) + pedidos históricos por padrão de frequência
  for i in 1..24 loop
    cid := 'c-' || lpad(i::text, 3, '0');
    padrao := padroes[i];

    insert into public.clientes (id, nome, telefone, criado_em, aceita_whatsapp)
    values (cid, nomes[i], telefones[i], now() - ((120 + (i*7) % 100) || ' days')::interval, aceita[i]);

    seq := 100 + i * 30;

    if padrao = 'novo' then
      criado := now() - ((7 + (random() * 18)::int) || ' days')::interval;
      update public.clientes set criado_em = criado where id = cid;
      itens := jsonb_build_array(
        jsonb_build_object('produtoId','p-picanha','pesoKg',round((0.5 + random()*2.5)::numeric,2),'preparos','[]'::jsonb,'precoUnitarioAplicado',89.9,'subtotal',round(((0.5 + random()*2.5) * 89.9)::numeric, 2)),
        jsonb_build_object('produtoId','p-linguica-toscana','pesoKg',round((0.3 + random()*1)::numeric,2),'preparos','["Peça inteira"]'::jsonb,'precoUnitarioAplicado',29.9,'subtotal',round(((0.3 + random()*1) * 29.9)::numeric, 2))
      );
      subtot := (itens->0->>'subtotal')::numeric + (itens->1->>'subtotal')::numeric;
      insert into public.pedidos (id, cliente_id, itens, subtotal, total, cashback_gerado, pontos_gerados, status, retirada, pagamento, criado_em)
      values (lpad((seq + 1)::text, 4, '0'), cid, itens, subtot, subtot, round(subtot * 0.035, 2), floor(subtot), 'entregue', 'balcao', 'pix', now() - ((1 + (random()*6)::int) || ' days')::interval);
      update public.clientes set saldo_cashback = round(subtot * 0.035, 2), cashback_expira_em = now() + ((55 + (random()*5)::int) || ' days')::interval, pontos = floor(subtot), pontos_acumulado_total = floor(subtot) where id = cid;

    elsif padrao = 'em_risco' then
      criado := now() - '180 days'::interval;
      update public.clientes set criado_em = criado where id = cid;
      subtot := round((80 + random() * 200)::numeric, 2);
      itens := jsonb_build_array(
        jsonb_build_object('produtoId','p-fraldinha','pesoKg',round(((subtot / 47.9))::numeric,2),'preparos','["Cortar em cubos"]'::jsonb,'precoUnitarioAplicado',47.9,'subtotal',subtot)
      );
      insert into public.pedidos (id, cliente_id, itens, subtotal, total, cashback_gerado, pontos_gerados, status, retirada, pagamento, criado_em)
      values (lpad((seq + 1)::text, 4, '0'), cid, itens, subtot, subtot, round(subtot*0.035,2), floor(subtot), 'entregue', 'balcao', 'pix', now() - ((35 + (random()*15)::int) || ' days')::interval);

    elsif padrao = 'inativo' then
      criado := now() - '220 days'::interval;
      update public.clientes set criado_em = criado where id = cid;
      subtot := round((45 + random() * 150)::numeric, 2);
      itens := jsonb_build_array(
        jsonb_build_object('produtoId','p-alcatra','pesoKg',round(((subtot / 52.9))::numeric,2),'preparos','["Moer"]'::jsonb,'precoUnitarioAplicado',52.9,'subtotal',subtot)
      );
      insert into public.pedidos (id, cliente_id, itens, subtotal, total, cashback_gerado, pontos_gerados, status, retirada, pagamento, criado_em)
      values (lpad((seq + 1)::text, 4, '0'), cid, itens, subtot, subtot, round(subtot*0.035,2), floor(subtot), 'entregue', 'balcao', 'pix', now() - ((62 + (random()*40)::int) || ' days')::interval);

    elsif padrao = 'fiel' then
      criado := now() - '220 days'::interval;
      update public.clientes set criado_em = criado, pontos = floor(800 + random()*1200), pontos_acumulado_total = floor(2000 + random()*4000) where id = cid;
      for j in 0..7 loop
        subtot := round((100 + random() * 280)::numeric, 2);
        itens := jsonb_build_array(
          jsonb_build_object('produtoId','p-picanha','pesoKg',round(((subtot * 0.6) / 89.9)::numeric,2),'preparos','["Cortar em bifes"]'::jsonb,'precoUnitarioAplicado',89.9,'subtotal',round(subtot*0.6,2)),
          jsonb_build_object('produtoId','p-fraldinha','pesoKg',round(((subtot * 0.4) / 47.9)::numeric,2),'preparos','[]'::jsonb,'precoUnitarioAplicado',47.9,'subtotal',round(subtot*0.4,2))
        );
        insert into public.pedidos (id, cliente_id, itens, subtotal, total, cashback_gerado, pontos_gerados, status, retirada, pagamento, criado_em)
        values (lpad((seq + j + 1)::text, 4, '0'), cid, itens, subtot, subtot, round(subtot*0.035,2), floor(subtot), 'entregue',
          case when random() < 0.7 then 'balcao' else 'entrega' end,
          case when random() < 0.55 then 'pix' when random() < 0.85 then 'cartao_entrega' else 'dinheiro' end,
          now() - (((3 + j*8) + (random()*3)::int) || ' days')::interval);
      end loop;

    else -- ocasional
      criado := now() - '180 days'::interval;
      update public.clientes set criado_em = criado where id = cid;
      for j in 0..(3 + (random()*2)::int) loop
        subtot := round((60 + random() * 200)::numeric, 2);
        itens := jsonb_build_array(
          jsonb_build_object('produtoId','p-linguica-toscana','pesoKg',round(((subtot * 0.5) / 29.9)::numeric,2),'preparos','[]'::jsonb,'precoUnitarioAplicado',29.9,'subtotal',round(subtot*0.5,2)),
          jsonb_build_object('produtoId','p-carvao','pesoKg',round(((subtot * 0.5) / 24.9)::numeric,2),'preparos','[]'::jsonb,'precoUnitarioAplicado',24.9,'subtotal',round(subtot*0.5,2))
        );
        insert into public.pedidos (id, cliente_id, itens, subtotal, total, cashback_gerado, pontos_gerados, status, retirada, pagamento, criado_em)
        values (lpad((seq + j + 1)::text, 4, '0'), cid, itens, subtot, subtot, round(subtot*0.035,2), floor(subtot), 'entregue',
          case when random() < 0.7 then 'balcao' else 'entrega' end,
          'pix',
          now() - (((10 + j*14) + (random()*5)::int) || ' days')::interval);
      end loop;
    end if;
  end loop;

  update public.clientes c
  set saldo_cashback = coalesce((
    select round(sum(p.cashback_gerado)::numeric, 2)
    from public.pedidos p
    where p.cliente_id = c.id and p.criado_em > now() - '60 days'::interval
  ), 0),
  cashback_expira_em = (
    select max(p.criado_em) + '60 days'::interval
    from public.pedidos p
    where p.cliente_id = c.id
  )
  where c.pontos_acumulado_total >= 1500;

  -- Movimento da bancada (3 novo + 1 preparando, pra tela já abrir viva)
  insert into public.pedidos (id, cliente_id, itens, subtotal, total, status, retirada, pagamento, criado_em) values
    ('0900', 'c-001', '[{"produtoId":"p-picanha","pesoKg":2.0,"preparos":["Cortar em bifes"],"precoUnitarioAplicado":89.9,"subtotal":179.8},{"produtoId":"p-linguica-toscana","pesoKg":1.0,"preparos":["Peça inteira"],"precoUnitarioAplicado":29.9,"subtotal":29.9}]'::jsonb, 209.7, 209.7, 'preparando', 'balcao', 'pix', now() - interval '8 minutes'),
    ('0901', 'c-005', '[{"produtoId":"p-fraldinha","pesoKg":1.5,"preparos":["Cortar para churrasco"],"precoUnitarioAplicado":47.9,"subtotal":71.85}]'::jsonb, 71.85, 71.85, 'novo', 'entrega', 'cartao_entrega', now() - interval '2 minutes'),
    ('0902', 'c-012', '[{"produtoId":"p-maminha","pesoKg":1.0,"preparos":["Peça inteira"],"precoUnitarioAplicado":49.9,"subtotal":49.9},{"produtoId":"p-carvao","pesoKg":5,"preparos":[],"precoUnitarioAplicado":24.9,"subtotal":24.9}]'::jsonb, 74.8, 74.8, 'novo', 'balcao', 'pix', now() - interval '1 minutes'),
    ('0903', 'c-018', '[{"produtoId":"p-coca-2l","pesoKg":2,"preparos":[],"precoUnitarioAplicado":12.9,"subtotal":12.9},{"produtoId":"p-cerveja-600","pesoKg":12,"preparos":[],"precoUnitarioAplicado":79.9,"subtotal":79.9}]'::jsonb, 92.8, 92.8, 'novo', 'balcao', 'dinheiro', now() - interval '45 seconds');

  -- Ofertas (3 semana + 1 relâmpago)
  insert into public.ofertas (id, tipo, produto_id, preco_de, preco_por, inicio_em, fim_em, limite_por_cliente, quantidade_total_kg, quantidade_vendida_kg, chamada, ativa) values
    ('o-picanha-semana',  'semana',    'p-picanha',          89.9, 79.9, now() - '1 day'::interval, now() + '5 days'::interval, 3,  null, 0,  'Picanha com 10% off', true),
    ('o-fraldinha-semana','semana',    'p-fraldinha',        47.9, 42.9, now() - '1 day'::interval, now() + '5 days'::interval, 2,  null, 0,  'Fraldinha que vira churrasco', true),
    ('o-linguica-semana', 'semana',    'p-linguica-toscana', 29.9, 24.9, now() - '1 day'::interval, now() + '5 days'::interval, 2,  null, 0,  'Toscana que sempre volta', true),
    ('o-alcatra-relampago','relampago','p-alcatra',          52.9, 39.9, now(),                       now() + '1 day'::interval,   2,  20,   12, 'Só hoje até acabar', true);
end;
$$;

grant execute on function public.reset_demo() to anon, authenticated;
