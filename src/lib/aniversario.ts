// Helpers de aniversário. Mantidos separados do store porque o
// conceito é estático (só leitura dos clientes) — não precisa
// de action, só de cálculo em cima do state.

import type { Cliente } from './types';

export interface ClienteAniversariante {
  cliente: Cliente;
  /** Idade que completa neste aniversário. */
  idade: number;
  /** Data ISO do aniversário deste ano. */
  data: string;
}

function parseNascimento(n: string): { ano: number; mes: number; dia: number } | null {
  // Aceita "YYYY-MM-DD" (formato ISO do seed). Se vier só "MM-DD"
  // ou formato inválido, retorna null silenciosamente.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(n);
  if (!m) return null;
  return { ano: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) };
}

// Idade que o cliente completa no aniversário deste ano (mes/dia).
function idadeEm(anoNasc: number, hoje: Date, mes: number, dia: number): number {
  const idadeBase = hoje.getFullYear() - anoNasc;
  const passouMes = hoje.getMonth() + 1 > mes;
  const mesmoMesEDiaPassou = hoje.getMonth() + 1 === mes && hoje.getDate() >= dia;
  if (passouMes || mesmoMesEDiaPassou) return idadeBase;
  return idadeBase - 1; // ainda não chegou
}

// Filtra clientes que fazem aniversário nos próximos `janelaDias`
// (0 = só hoje). Ordena: mais próximo primeiro.
export function clientesAniversariantes(
  clientes: Cliente[],
  hoje: Date = new Date(),
  janelaDias = 0,
): ClienteAniversariante[] {
  const out: ClienteAniversariante[] = [];
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  for (const c of clientes) {
    if (!c.nascimento) continue;
    const d = parseNascimento(c.nascimento);
    if (!d) continue;
    let proxAniv = new Date(hoje.getFullYear(), d.mes - 1, d.dia);
    if (proxAniv < inicioHoje) proxAniv = new Date(hoje.getFullYear() + 1, d.mes - 1, d.dia);
    const diffDias = Math.round((proxAniv.getTime() - inicioHoje.getTime()) / 86400000);
    if (diffDias <= janelaDias) {
      out.push({
        cliente: c,
        idade: idadeEm(d.ano, proxAniv, d.mes, d.dia),
        data: proxAniv.toISOString(),
      });
    }
  }
  out.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  return out;
}

// Mensagem do WhatsApp pro açougue mandar parabéns. Não credita
// nada automaticamente — é só um botão "Enviar" que abre o wa.me.
export function mensagemAniversario(args: {
  nomeCliente: string;
  idade: number;
  urlLoja: string;
}): string {
  const primeiroNome = args.nomeCliente.split(' ')[0];
  return (
    `Oi, ${primeiroNome}! 🎉 Tudo de bom no seu aniversário de ${args.idade} anos. ` +
    `Aqui é do Empório Ribeirão — passa aqui hoje que a carne é por nossa conta. ` +
    `Tá te esperando um cupom de R$ 15 de cashback em ${args.urlLoja}.`
  );
}
