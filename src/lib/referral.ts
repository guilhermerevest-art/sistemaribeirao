// Lógica do programa de indicação. Mantida num módulo próprio pra
// que UI, store e copy no WhatsApp usem as mesmas regras.
//
// Regras:
// - Cada cliente ganha um código curto único (4 letras do nome +
//   2 dígitos) na primeira vez que precisar. Cliente sem código
//   recebe um gerado on-demand.
// - Quem é indicado pelo link `?ref=CODIGO` ganha um carimbo
//   `indicadoPor` no momento do cadastro.
// - Quando o indicado faz o PRIMEIRO pedido com total > 0, a
//   indicação vira "convertida" e o indicador ganha R$ 10 de
//   cashback. Sem teto de indicações por mês (custo previsível
//   porque R$ 10 só vira débito real se o indicado voltar).

import type { Cliente, Indicacao } from './types';

export const RECOMPENSA_INDICACAO = 10; // R$ pro indicador

function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .split('')
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 0x0300 || code > 0x036f;
    })
    .join('')
    .toUpperCase();
}

// Gera código de indicação a partir do nome. Prefixa 4 consoantes ou
// letras do primeiro nome (padded com X se curto) + 2 dígitos
// pseudo-aleatórios baseados no id. Não é cryptographically seguro,
// mas é o suficiente pra demo (Supabase daria uma coluna unique).
export function gerarCodigoIndicacao(cliente: Pick<Cliente, 'id' | 'nome'>): string {
  const letras = normalizar(cliente.nome).replace(/[^A-Z]/g, '');
  const base = (letras + 'XXXX').slice(0, 4);
  // Hash simples do id pra ter algo estável.
  let h = 0;
  for (let i = 0; i < cliente.id.length; i++) h = (h * 31 + cliente.id.charCodeAt(i)) >>> 0;
  const sufixo = String(h % 100).padStart(2, '0');
  return `${base}${sufixo}`;
}

// Confere se um código existe na carteira (case-insensitive).
export function encontrarClientePorCodigo(
  clientes: Cliente[],
  codigo: string,
): Cliente | undefined {
  const alvo = codigo.trim().toUpperCase();
  return clientes.find((c) => c.codigoIndicacao?.toUpperCase() === alvo);
}

// Lê o `?ref=` da URL atual (browser only). Usado pelo checkout pra
// detectar indicação antes de mostrar o campo de telefone.
export function lerRefDaUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const sp = new URLSearchParams(window.location.search);
  const r = sp.get('ref');
  return r && /^[A-Z0-9]{4,12}$/i.test(r) ? r.toUpperCase() : null;
}

// Indicação pendente vs convertida vs expirada.
export function statusIndicacao(i: Indicacao): 'pendente' | 'convertido' | 'expirado' {
  if (i.status === 'convertido') return 'convertido';
  if (i.status === 'expirado') return 'expirado';
  // Pendente vira expirada depois de 60 d sem o indicado comprar.
  const idadeDias = (Date.now() - new Date(i.criadoEm).getTime()) / 86400000;
  return idadeDias > 60 ? 'expirado' : 'pendente';
}

// Mensagem do WhatsApp que o indicador compartilha.
export function mensagemIndicacao(args: {
  nomeIndicador: string;
  codigoIndicador: string;
  urlLoja: string;
  recompensa?: number;
}): string {
  const primeiroNome = args.nomeIndicador.split(' ')[0];
  return (
    `Oi! Aqui é o ${primeiroNome}, cliente do Empório Ribeirão. ` +
    `Tô indicando porque o churrasco de sexta vale a pena. ` +
    `Cadastra por este link e a gente ganha ${args.recompensa ?? RECOMPENSA_INDICACAO} reais de cashback quando você fizer o primeiro pedido:\n\n` +
    `${args.urlLoja}${args.urlLoja.includes('?') ? '&' : '?'}ref=${args.codigoIndicador}`
  );
}
