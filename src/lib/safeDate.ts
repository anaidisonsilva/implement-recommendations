/**
 * Parse a date string safely, avoiding timezone shifts for YYYY-MM-DD (DATE columns).
 * Postgres DATE columns return "YYYY-MM-DD", which `new Date(...)` parses as UTC midnight.
 * In BRT (-03:00) that renders as the previous day. We anchor to local noon to avoid that.
 */
export function parseSafeDate(s: string | null | undefined): Date {
  if (!s) return new Date(NaN);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date(`${s}T12:00:00`);
  }
  return new Date(s);
}
