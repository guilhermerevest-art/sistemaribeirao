// Export de CSV sem dependência externa — Blob + link temporário.
// Separador `;` e BOM UTF-8 porque é o que o Excel em pt-BR espera.

export function toCsv(
  rows: Record<string, string | number>[],
  headers: { key: string; label: string }[],
): string {
  const escapar = (v: string | number) => {
    const s = String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const linhaHeader = headers.map((h) => escapar(h.label)).join(';');
  const linhas = rows.map((r) => headers.map((h) => escapar(r[h.key] ?? '')).join(';'));
  return [linhaHeader, ...linhas].join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const bom = String.fromCharCode(0xfeff);
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
