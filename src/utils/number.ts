/**
 * Coerces a possibly-string numeric value (as some backend fields are
 * serialized, e.g. Postgres NUMERIC columns via the DB driver) into a
 * proper number. Returns null for missing/invalid values.
 */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
