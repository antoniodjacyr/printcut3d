/**
 * fetch() header values must be ISO-8859-1. Invisible Unicode (BOM, ZWSP) or
 * smart quotes from copy/paste break Supabase clients with:
 * "String contains non ISO-8859-1 code point."
 */
export function toHeaderSafeAscii(value: string): string {
  const trimmed = value.trim().replace(/^\uFEFF/, "");
  return [...trimmed]
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code === 0x201c || code === 0x201d || code === 0x201e) return '"';
      if (code === 0x2018 || code === 0x2019 || code === 0x201a) return "'";
      return ch;
    })
    .filter((ch) => {
      const c = ch.charCodeAt(0);
      return c >= 0x20 && c <= 0x7e;
    })
    .join("");
}

export function sanitizeSupabaseUrl(value: string | undefined): string {
  if (!value) return "";
  return toHeaderSafeAscii(value);
}

export function sanitizeSupabaseKey(value: string | undefined): string {
  if (!value) return "";
  return toHeaderSafeAscii(value);
}
