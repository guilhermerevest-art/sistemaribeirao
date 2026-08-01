// Formatação em PT-BR: moeda, peso, telefone, data.

export function brl(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function brlCurto(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatarPeso(kg: number): string {
  if (kg === 0) return '0 g';
  if (kg < 1) return `${Math.round(kg * 1000)} g`;
  return `${kg.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })} kg`.replace('.', ',');
}

export function formatarTelefone(tel: string): string {
  const d = tel.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel;
}

export function normalizarTelefone(tel: string): string {
  return tel.replace(/\D/g, '');
}

export function formatarData(iso: string, comHora = false): string {
  const d = new Date(iso);
  if (comHora) {
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function diasEntre(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.floor(ms / 86400000);
}

export function classificacaoFrequencia(args: {
  diasSemCompra: number;
  pedidosNos90Dias: number;
  diasDesdeCadastro: number;
}): 'novo' | 'fiel' | 'ocasional' | 'em_risco' | 'inativo' {
  const { diasSemCompra, pedidosNos90Dias, diasDesdeCadastro } = args;
  if (diasSemCompra >= 60) return 'inativo';
  if (diasSemCompra >= 31) return 'em_risco';
  if (pedidosNos90Dias >= 6 && diasSemCompra <= 15) return 'fiel';
  if (pedidosNos90Dias <= 1 && diasDesdeCadastro <= 30) return 'novo';
  return 'ocasional';
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

// Cashback que expira em até N dias (default 15). Usado pra pintar de
// vermelho clientes com saldo prestes a vencer — é o tipo de alerta
// que reverte retenção com um único clique.
export function cashbackExpiraEmBreve(
  validadeISO: string | undefined,
  dias = 15,
): boolean {
  if (!validadeISO) return false;
  const d = new Date(validadeISO);
  if (Number.isNaN(d.getTime())) return false;
  const ms = d.getTime() - Date.now();
  return ms > 0 && ms <= dias * 86400000;
}

// Data de validade do cashback para mostrar na mensagem de WhatsApp.
// Se o cliente nunca comprou (`cashbackExpiraEm undefined`) ou se a
// validade já passou, retorna null pra gente omitir o trecho em vez de
// mentir ("vale até hoje").
export function validadeCashbackParaMensagem(
  cashbackExpiraEm: string | undefined,
): string | null {
  if (!cashbackExpiraEm) return null;
  const d = new Date(cashbackExpiraEm);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getTime() < Date.now()) return null;
  return formatarData(cashbackExpiraEm);
}

// Link wa.me pronto pra reativação. Usa o saldo real e só inclui a
// frase de validade quando ela existe de verdade.
export function linkWhatsAppReativacao(args: {
  nome: string;
  telefone: string;
  diasSemCompra: number;
  saldo: number;
  validadeISO?: string;
  produto?: string; // ex: "Fraldinha a R$ 44,90 o quilo"
}): string {
  const primeiroNome = args.nome.split(' ')[0];
  const validade = validadeCashbackParaMensagem(args.validadeISO);
  const partes: string[] = [];
  partes.push(
    args.diasSemCompra > 0
      ? `Oi ${primeiroNome}, aqui é do Empório Ribeirão. Faz ${args.diasSemCompra} dias que você não aparece.`
      : `Oi ${primeiroNome}, aqui é do Empório Ribeirão.`,
  );
  if (args.saldo > 0) {
    partes[0] += ` Você tem ${brl(args.saldo)} de cashback`;
    if (validade) partes[0] += ` pra usar até ${validade}`;
    partes[0] += '.';
  } else {
    partes[0] += ' Temos uma oferta especial essa semana.';
  }
  if (args.produto) partes.push(`Essa semana ${args.produto}.`);
  partes.push('Quer que eu separe?');
  const msg = encodeURIComponent(partes.join(' '));
  const tel = args.telefone.replace(/\D/g, '');
  return `https://wa.me/55${tel}?text=${msg}`;
}

// Mensagem de confirmação de pedido que o cliente envia pro açougue
// (ou que a loja dispara via API quando subir o WhatsApp Business).
// Inclui número do pedido, resumo curto dos itens, total e forma de
// pagamento pra registro.
export function linkWhatsAppConfirmacaoPedido(args: {
  telefoneEstabelecimento: string;
  numeroPedido: string;
  nomeCliente: string;
  itensDescricao: string; // ex: "2kg Picanha, 1kg Linguiça"
  total: number;
  retirada: 'balcao' | 'entrega';
  pagamento: 'pix' | 'cartao_entrega' | 'dinheiro';
  trocoPara?: number;
}): string {
  const forma = (() => {
    if (args.pagamento === 'pix') return 'Pix';
    if (args.pagamento === 'cartao_entrega') return 'Cartão na entrega';
    if (args.trocoPara && args.trocoPara > args.total) return `Dinheiro (troco pra ${brl(args.trocoPara)})`;
    return 'Dinheiro';
  })();
  const entrega = args.retirada === 'entrega' ? 'entrega' : 'retirada no balcão';
  const msg =
    `Oi! Acabei de fazer o pedido *#${args.numeroPedido}* pelo app do Empório Ribeirão.\n\n` +
    `*Cliente:* ${args.nomeCliente}\n` +
    `*Itens:* ${args.itensDescricao}\n` +
    `*Total:* ${brl(args.total)}\n` +
    `*Pagamento:* ${forma}\n` +
    `*${entrega.charAt(0).toUpperCase()}${entrega.slice(1)}*`;
  const tel = args.telefoneEstabelecimento.replace(/\D/g, '');
  return `https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`;
}

// Helper pra montar o resumo curto dos itens do pedido pro WhatsApp
// ("2kg Picanha, 1kg Linguiça"). Limita a ~3 itens pra mensagem
// não ficar gigante; o resto entra como "+N itens".
export function resumoItensParaWhatsApp(args: {
  itens: Array<{
    pesoKg: number;
    produtoNome?: string;
    comboNome?: string;
    quantidade?: number;
  }>;
}): string {
  const partes = args.itens.slice(0, 3).map((it) => {
    if (it.comboNome) return `${it.quantidade ?? 1}x Combo ${it.comboNome}`;
    return `${it.pesoKg.toFixed(2).replace('.', ',')}kg ${it.produtoNome ?? 'Item'}`;
  });
  if (args.itens.length > 3) partes.push(`+${args.itens.length - 3} itens`);
  return partes.join(', ');
}
