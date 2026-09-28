// Datas de vigência representam um dia civil. Nada aqui passa por conversão de fuso:
// "2026-12-31" continua "2026-12-31" em qualquer timezone.

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:T[\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)?$/;

const pad = (value: number, size = 2) => String(value).padStart(size, "0");

/**
 * Aceita "AAAA-MM-DD" (ou um timestamp ISO, do qual só a parte da data é usada)
 * e devolve "AAAA-MM-DD". Retorna null para datas inexistentes, como 2026-02-30.
 */
export function toIsoDateOnly(value: string): string | null {
  const match = ISO_DATE.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2999 || month < 1 || month > 12 || day < 1) return null;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > daysInMonth) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

/** Data local de hoje em "AAAA-MM-DD". */
export function todayIsoDate(now = new Date()): string {
  return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Soma dias a uma data "AAAA-MM-DD" usando aritmética UTC (sem efeito de fuso). */
export function addDaysToIsoDate(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}
