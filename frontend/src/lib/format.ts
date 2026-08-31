const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** 12847.32 -> "R$ 12.847,32" */
export function formatCurrency(value: number): string {
  return currency.format(value);
}

/** 89.5 + EXPENSE -> "- R$ 89,50" (o sinal vem do tipo da transacao) */
export function formatSignedCurrency(value: number, type: 'INCOME' | 'EXPENSE'): string {
  return `${type === 'INCOME' ? '+' : '-'} ${currency.format(Math.abs(value))}`;
}

/** ISO -> "30/11/25", como no layout */
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(new Date(iso));
}

/** ISO -> "2025-11-30", para preencher input[type=date] */
export function toDateInputValue(iso: string): string {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/** "2025-11-30" -> "30/11/2025", o formato que o campo de data mostra */
export function toDisplayDate(value: string): string {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

/** Insere as barras enquanto o usuario digita: "3011" -> "30/11" */
export function maskDisplayDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('/');
}

/** "30/11/2025" -> "2025-11-30"; devolve "" se a data nao existe no calendario */
export function fromDisplayDate(text: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!match) return '';

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  // o Date normaliza 31/02 para 03/03; comparar de volta descarta datas inexistentes
  const isReal =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);

  return isReal ? `${year}-${month}-${day}` : '';
}

/** "2025-11-30" -> ISO no meio-dia local, evitando virar o dia por fuso */
export function fromDateInputValue(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year!, month! - 1, day!, 12, 0, 0).toISOString();
}

/** "Novembro / 2025" */
export function formatMonthLabel(year: number, month: number): string {
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(year, month, 1));
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} / ${year}`;
}

/** Primeiro e ultimo instante do mes, para o filtro de periodo */
export function monthRange(year: number, month: number) {
  return {
    startDate: new Date(year, month, 1, 0, 0, 0).toISOString(),
    endDate: new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString(),
  };
}

/** Aceita "1.234,56" ou "1234.56" e devolve number */
export function parseCurrencyInput(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  return Number(normalized);
}
