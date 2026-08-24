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
