/**
 * @file csv.ts
 * @description Geração e download de CSV no navegador, sem biblioteca externa.
 * Usa ";" como delimitador (padrão do Excel em pt-BR, evita conflito com a
 * vírgula decimal) e BOM UTF-8 (o Excel só reconhece acentuação corretamente
 * com o BOM presente).
 */

function escapeCsvValue(value: unknown): string {
  const s = String(value ?? '');
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(filename: string, rows: Record<string, string | number>[]): void {
  const data = rows.length > 0 ? rows : [{ aviso: 'Nenhum registro encontrado' }];
  const headers = Object.keys(data[0]);
  const lines = [
    headers.join(';'),
    ...data.map(row => headers.map(h => escapeCsvValue(row[h])).join(';')),
  ];
  const csv = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
