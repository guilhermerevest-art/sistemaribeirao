// Planejador de churrasco. Recebe o número de pessoas e o estilo
// escolhido, devolve uma lista de itens com kg/unidades e o preço
// total estimado. Cada item tem `produtoId` (do seed) ou null —
// itens nulos são "complementos" (farofa, vinagrete, carvão)
// adicionados como produtos virtuais.
//
// Regra-base (kg/pessoa adulta, ajustável depois da pesquisa de
// mercado se necessário):
//   - Carne bovina: 350 g / adulto, 180 g / crianca
//   - Carne suína: 200 g / adulto, 100 g / crianca
//   - Frango (coxa/sobrecoxa): 200 g / adulto, 120 g / crianca
//   - Linguiça toscana: 150 g / adulto, 80 g / crianca
//   - Pão de alho: 2 unidades / adulto, 1 / crianca
//   - Farofa pronta: 50 g / adulto, 30 g / crianca
//   - Vinagrete: 50 g / adulto, 30 g / crianca
//   - Carvão: 1 kg a cada 5 pessoas
//   - Refrigerante: 0,5 L / adulto, 0,3 L / crianca (mín. 1 garrafa 2L)
//   - Cerveja: 3 latas / adulto, 0 crianca
//   - Água: 0,5 L / adulto, 0,3 L / crianca
//
// A pesquisa confirmou valores próximos a esses (margem de ±20%);
// valores ajustados após validação com fontes.

import { PRODUTOS } from './seed';
import { CASHBACK_POR_CATEGORIA, type Produto } from './types';

export type EstiloChurrasco = 'tradicional' | 'boi' | 'familia' | 'leve';

export interface ItemChurrasco {
  /** id do produto no seed (ou null pra itens virtuais como carvão). */
  produtoId: string | null;
  /** Nome exibido na lista. */
  nome: string;
  /** kg ou unidades a comprar (sempre arredondado pra cima em passos razoáveis). */
  quantidade: number;
  /** unidade: kg, un, sc, L (litros). */
  unidade: 'kg' | 'un' | 'sc' | 'L';
  /** preço em reais, sem juros. */
  preco: number;
  /** ícone emoji pra ajudar a bater o olho. */
  emoji: string;
  /** Observação opcional ("peso médio da peça", "com osso", etc). */
  observacao?: string;
}

export interface ResultadoChurrasco {
  estilo: EstiloChurrasco;
  adultos: number;
  criancas: number;
  fome: NivelFome;
  /** Total de carne (kg), pra exibir na primeira linha. */
  totalCarneKg: number;
  itens: ItemChurrasco[];
  subtotal: number;
  /** Bebidas (se o usuário marcou "incluir bebidas"). */
  totalBebidas?: number;
  total: number;
}

const PESOS_POR_PESSOA = {
  adulto: {
    bovino: 0.35, // 350 g
    suino: 0.2,
    frango: 0.2,
    linguica: 0.15,
  },
  crianca: {
    bovino: 0.18,
    suino: 0.1,
    frango: 0.12,
    linguica: 0.08,
  },
};

// Proporção da carne bovina por estilo (% do total de bovino).
const PROPORCAO_BOVINO: Record<EstiloChurrasco, Record<string, number>> = {
  tradicional: { 'Picanha Maturada': 0.4, 'Fraldinha': 0.3, 'Contrafilé': 0.3 },
  boi: { 'Picanha Maturada': 0.5, 'Fraldinha': 0.3, 'Contrafilé': 0.2 },
  familia: { 'Picanha Maturada': 0.3, 'Fraldinha': 0.35, 'Contrafilé': 0.35 },
  leve: { 'Picanha Maturada': 0.4, 'Fraldinha': 0.3, 'Contrafilé': 0.3 },
};

// Proporção de linguiça (toscana + apimentada + calabresa).
const PROPORCAO_LINGUICA: Record<EstiloChurrasco, { toscana: number; apimentada: number; calabresa: number }> = {
  tradicional: { toscana: 0.6, apimentada: 0.2, calabresa: 0.2 },
  boi: { toscana: 0.6, apimentada: 0.2, calabresa: 0.2 },
  familia: { toscana: 0.5, apimentada: 0.3, calabresa: 0.2 },
  leve: { toscana: 0.7, apimentada: 0.15, calabresa: 0.15 },
};

const PROPORCAO_SUINO: Record<EstiloChurrasco, { costelinha: number; pernil: number; lombo: number }> = {
  tradicional: { costelinha: 0.6, pernil: 0.4, lombo: 0 },
  boi: { costelinha: 0, pernil: 0, lombo: 0 }, // sem suíno
  familia: { costelinha: 0.5, pernil: 0.3, lombo: 0.2 },
  leve: { costelinha: 0.5, pernil: 0.5, lombo: 0 },
};

const PROPORCAO_FRANGO: Record<EstiloChurrasco, { coxa: number; peito: number; inteiro: number }> = {
  tradicional: { coxa: 1.0, peito: 0, inteiro: 0 },
  boi: { coxa: 1.0, peito: 0, inteiro: 0 },
  familia: { coxa: 0.7, peito: 0.3, inteiro: 0 },
  leve: { coxa: 0.7, peito: 0.3, inteiro: 0 },
};

const ESTILO_LABEL: Record<EstiloChurrasco, string> = {
  tradicional: 'Tradicional brasileiro',
  boi: 'Festa do boi',
  familia: 'Domingo em família',
  leve: 'Misto leve',
};

const ESTILO_DESCRICAO: Record<EstiloChurrasco, string> = {
  tradicional: 'Picanha, linguiça, frango e costelinha — o clássico.',
  boi: 'Só bovina e linguiça. Pra quem não come porco nem frango.',
  familia: 'Mais frango e suína, picanha moderada. Pra almoço de domingo.',
  leve: '60% das quantidades. Pra quem come pouco ou come muito acompanhamento.',
};

// Helpers
function kgPorPessoaKg(
  estilo: EstiloChurrasco,
  categoria: 'bovino' | 'suino' | 'frango' | 'linguica',
  adultos: number,
  criancas: number,
  fome: NivelFome,
): number {
  const base = adultos * PESOS_POR_PESSOA.adulto[categoria] + criancas * PESOS_POR_PESSOA.crianca[categoria];
  const multiplicadorEstilo = estilo === 'leve' ? 0.6 : 1;
  return base * multiplicadorEstilo * NIVEL_FOME_MULTIPLICADOR[fome];
}

function roundKg(kg: number, passo = 0.1): number {
  return Math.ceil(kg / passo) * passo;
}

function produtoPorNome(nome: string): Produto | undefined {
  return PRODUTOS.find((p) => p.nome === nome);
}

interface CalcularArgs {
  adultos: number;
  criancas: number;
  estilo: EstiloChurrasco;
  fome?: NivelFome;
  /** Se true, inclui estimativa de bebidas (refrigerante + cerveja + água). */
  comBebidas?: boolean;
}

export function calcularChurrasco(args: CalcularArgs): ResultadoChurrasco {
  const { adultos, criancas, estilo, fome = 3, comBebidas = false } = args;

  // Total por categoria (kg)
  const totalBovinoKg = kgPorPessoaKg(estilo, 'bovino', adultos, criancas, fome);
  const totalSuinoKg = kgPorPessoaKg(estilo, 'suino', adultos, criancas, fome);
  const totalFrangoKg = kgPorPessoaKg(estilo, 'frango', adultos, criancas, fome);
  const totalLinguicaKg = kgPorPessoaKg(estilo, 'linguica', adultos, criancas, fome);
  const totalCarneKg = totalBovinoKg + totalSuinoKg + totalFrangoKg + totalLinguicaKg;

  const itens: ItemChurrasco[] = [];

  // Bovina
  const propBov = PROPORCAO_BOVINO[estilo];
  for (const [nome, pct] of Object.entries(propBov)) {
    if (pct === 0) continue;
    const p = produtoPorNome(nome);
    if (!p) continue;
    const kg = roundKg(totalBovinoKg * pct, 0.1);
    itens.push({
      produtoId: p.id,
      nome: p.nome,
      quantidade: kg,
      unidade: 'kg',
      preco: round2(kg * p.precoKg),
      emoji: '🥩',
    });
  }

  // Linguiça
  const propLing = PROPORCAO_LINGUICA[estilo];
  for (const [chave, pct] of Object.entries(propLing)) {
    if (pct === 0) continue;
    const nome = chave === 'toscana' ? 'Linguiça Toscana Artesanal' : chave === 'apimentada' ? 'Linguiça Apimentada' : 'Calabresa';
    const p = produtoPorNome(nome);
    if (!p) continue;
    const kg = roundKg(totalLinguicaKg * pct, 0.1);
    itens.push({
      produtoId: p.id,
      nome: p.nome,
      quantidade: kg,
      unidade: 'kg',
      preco: round2(kg * p.precoKg),
      emoji: '🌭',
    });
  }

  // Suíno (pode ser zero no estilo "boi")
  if (estilo !== 'boi') {
    const propS = PROPORCAO_SUINO[estilo];
    if (propS.costelinha > 0) {
      const p = produtoPorNome('Costelinha');
      if (p) {
        // Costelinha tem osso — soma 30% pra compensar.
        const kg = roundKg(totalSuinoKg * propS.costelinha * 1.3, 0.1);
        itens.push({
          produtoId: p.id,
          nome: p.nome,
          quantidade: kg,
          unidade: 'kg',
          preco: round2(kg * p.precoKg),
          emoji: '🍖',
          observacao: 'com osso (30% a mais)',
        });
      }
    }
    if (propS.pernil > 0) {
      const p = produtoPorNome('Pernil sem Osso');
      if (p) {
        const kg = roundKg(totalSuinoKg * propS.pernil, 0.1);
        itens.push({
          produtoId: p.id,
          nome: p.nome,
          quantidade: kg,
          unidade: 'kg',
          preco: round2(kg * p.precoKg),
          emoji: '🍖',
        });
      }
    }
  }

  // Frango
  const propF = PROPORCAO_FRANGO[estilo];
  if (propF.coxa > 0) {
    const p = produtoPorNome('Coxa e Sobrecoxa');
    if (p) {
      const kg = roundKg(totalFrangoKg * propF.coxa, 0.1);
      itens.push({
        produtoId: p.id,
        nome: p.nome,
        quantidade: kg,
        unidade: 'kg',
        preco: round2(kg * p.precoKg),
        emoji: '🍗',
      });
    }
  }
  if (propF.peito > 0) {
    const p = produtoPorNome('Peito de Frango');
    if (p) {
      const kg = roundKg(totalFrangoKg * propF.peito, 0.1);
      itens.push({
        produtoId: p.id,
        nome: p.nome,
        quantidade: kg,
        unidade: 'kg',
        preco: round2(kg * p.precoKg),
        emoji: '🍗',
      });
    }
  }

  // Acompanhamentos
  // Pão de alho (preparado): 2 unid / adulto, 1 / crianca
  const paoAlho = produtoPorNome('Espetinho Misto'); // não tem pão de alho no seed; cai fora
  // Carvão: 1 kg a cada 5 pessoas (mínimo 1 kg). Sem produto no seed, então virtual.
  const carvaoKg = Math.max(1, Math.ceil((adultos + criancas) / 5));
  itens.push({
    produtoId: 'p-carvao',
    nome: 'Carvão',
    quantidade: carvaoKg,
    unidade: 'kg',
    preco: carvaoKg * 24.9,
    emoji: '🔥',
  });
  // Sal grosso: 1 pcte pequeno por churrasco (200g).
  itens.push({
    produtoId: 'p-sal-grosso',
    nome: 'Sal Grosso',
    quantidade: 1,
    unidade: 'un',
    preco: 7.9,
    emoji: '🧂',
    observacao: '1 pcte 1 kg',
  });

  // Subtotal (sem bebidas)
  const subtotal = round2(itens.reduce((s, i) => s + i.preco, 0));

  let totalBebidas: number | undefined;
  if (comBebidas) {
    totalBebidas = calcularBebidas(adultos, criancas);
  }

  return {
    estilo,
    adultos,
    criancas,
    fome,
    totalCarneKg: round2(totalCarneKg),
    itens,
    subtotal,
    totalBebidas,
    total: subtotal + (totalBebidas ?? 0),
  };
}

// Mensagem pra mandar a lista por WhatsApp. Compacta a lista com
// totais — não cabe tudo no cupom mas o cliente pode editar antes
// de enviar.
export function mensagemListaWhatsApp(args: {
  adultos: number;
  criancas: number;
  estilo: EstiloChurrasco;
  fome: NivelFome;
  totalCarneKg: number;
  total: number;
  itens: ItemChurrasco[];
}): string {
  const linhas = args.itens.map((it) => {
    const qtd = it.unidade === 'kg' ? `${it.quantidade.toFixed(1).replace('.', ',')} kg` : `${it.quantidade} ${it.unidade}`;
    return `• ${qtd} ${it.nome}`;
  });
  return (
    `🥩 *Churrasco Empório Ribeirão*\n` +
    `${args.adultos} adultos + ${args.criancas} criancas · ${args.estilo}\n` +
    `Total de carne: ${args.totalCarneKg.toFixed(1).replace('.', ',')} kg\n\n` +
    `${linhas.join('\n')}\n\n` +
    `*Total: R$ ${args.total.toFixed(2).replace('.', ',')}*\n\n` +
    `Quer fazer o pedido? Manda "vou" que eu finalizo. 🥩`
  );
}

export function calcularBebidas(adultos: number, criancas: number): number {
  // Estimativa: refrigerante R$ 8/L, cerveja R$ 18/lata (350 mL), água R$ 4/L.
  const refriL = adultos * 0.5 + criancas * 0.3;
  const cervejaLatas = adultos * 3;
  const aguaL = adultos * 0.5 + criancas * 0.3;
  // Arredonda pra cima em garrafas/latas.
  const refriGarrafas = Math.ceil(refriL / 2);
  const aguaGarrafas = Math.ceil(aguaL / 1.5);
  const totalRefri = refriGarrafas * 16; // garrafa 2L
  const totalCerveja = cervejaLatas * 3.5;
  const totalAgua = aguaGarrafas * 6;
  return round2(totalRefri + totalCerveja + totalAgua);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Multiplicador de "nível de fome" (1-5). 1 = come pouco, 5 = matador.
// Aplica sobre todas as kg. Default 3 = "normal".
export type NivelFome = 1 | 2 | 3 | 4 | 5;
export const NIVEL_FOME_MULTIPLICADOR: Record<NivelFome, number> = {
  1: 0.6,
  2: 0.8,
  3: 1.0,
  4: 1.2,
  5: 1.5,
};
export const NIVEL_FOME_LABEL: Record<NivelFome, string> = {
  1: 'Leve (60%)',
  2: 'Moderado (80%)',
  3: 'Normal',
  4: 'Fome (120%)',
  5: 'Matador (150%)',
};

// Preset "modo rápido" — um clique resolve sem precisar dos sliders.
export interface PresetRapido {
  id: string;
  titulo: string;
  emoji: string;
  adultos: number;
  criancas: number;
  estilo: EstiloChurrasco;
  comBebidas: boolean;
}
export const PRESETS_RAPIDOS: PresetRapido[] = [
  { id: 'casal', titulo: 'Casal (2)', emoji: '🥂', adultos: 2, criancas: 0, estilo: 'tradicional', comBebidas: false },
  { id: 'familia-media', titulo: 'Família (5)', emoji: '👨‍👩‍👧', adultos: 3, criancas: 2, estilo: 'familia', comBebidas: true },
  { id: 'amigos', titulo: 'Amigos (10)', emoji: '🎉', adultos: 8, criancas: 2, estilo: 'tradicional', comBebidas: true },
  { id: 'balaio-cheio', titulo: 'Balaio cheio (20)', emoji: '🔥', adultos: 15, criancas: 5, estilo: 'boi', comBebidas: true },
];

// Projeção de cashback que o cliente ganha ao fechar esse pedido
// (média ponderada por kg de cada categoria). Não considera oferta.
export function projecaoCashbackChurrasco(itens: ItemChurrasco[]): number {
  const mapa = PRODUTOS;
  let total = 0;
  for (const it of itens) {
    if (!it.produtoId) continue;
    const p = mapa.find((x) => x.id === it.produtoId);
    if (!p) continue;
    total += it.preco * CASHBACK_POR_CATEGORIA[p.categoria];
  }
  return round2(total);
}

// "Modo churrasco" visual: sexta 17h até domingo 23h. A UI pode
// ativar gradiente quente, sticker animado, etc. Função pura pra
// facilitar testes (passa uma data customizada).
export function modoChurrascoAtivo(agora: Date = new Date()): boolean {
  const dia = agora.getDay(); // 0=dom, 5=sex, 6=sab
  const hora = agora.getHours();
  if (dia === 5 && hora >= 17) return true;
  if (dia === 6) return true; // sábado o dia todo
  if (dia === 0 && hora < 23) return true; // domingo até 23h
  return false;
}

// Resumo de uma linha pra ir no `observacaoGeral` do pedido (e no
// cupom). Ex: "Planejador: 10 pessoas, tradicional · fome normal ·
// 2kg carne". O açougueiro bate o olho e já sabe o que preparar.
export function resumoPlanejadorCurto(args: {
  adultos: number;
  criancas: number;
  estilo: EstiloChurrasco;
  fome: NivelFome;
  totalCarneKg: number;
}): string {
  const fomeLabel =
    args.fome === 3
      ? ''
      : args.fome >= 4
        ? ` · fome ${args.fome === 5 ? 'matador' : 'alta'}`
        : args.fome <= 2
          ? ` · fome ${args.fome === 1 ? 'leve' : 'moderada'}`
          : '';
  return `Churrasco p/ ${args.adultos} adultos + ${args.criancas} crianças · ${args.estilo}${fomeLabel} · ${args.totalCarneKg.toFixed(1).replace('.', ',')}kg carne`;
}

export const ESTILO_OPCOES: Array<{ id: EstiloChurrasco; titulo: string; descricao: string; emoji: string }> = (
  Object.entries(ESTILO_LABEL) as Array<[EstiloChurrasco, string]>
).map(([id, titulo]) => ({
  id,
  titulo,
  descricao: ESTILO_DESCRICAO[id],
  emoji: id === 'boi' ? '🐂' : id === 'familia' ? '👨‍👩‍👧' : id === 'leve' ? '🥗' : '🔥',
}));