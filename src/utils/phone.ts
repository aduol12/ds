/**
 * Normalize Kenyan / E.164-ish phone numbers so register and login
 * send the same value the backend stores.
 */
export function normalizePhoneNumber(input: string): string {
  if (!input) return input;
  let raw = input.trim().replace(/[\s\-().]/g, "");
  if (!raw) return raw;

  if (raw.startsWith("00")) {
    raw = `+${raw.slice(2)}`;
  }

  let digits = raw.startsWith("+") ? raw.slice(1) : raw;
  digits = digits.replace(/\D/g, "");

  if (digits.startsWith("0") && digits.length >= 9) {
    digits = `254${digits.slice(1)}`;
  } else if (digits.length === 9 && digits.startsWith("7")) {
    digits = `254${digits}`;
  }

  return `+${digits}`;
}
