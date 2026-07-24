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
