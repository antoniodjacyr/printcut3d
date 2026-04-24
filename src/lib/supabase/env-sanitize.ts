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
  let v = value.trim().replace(/^\uFEFF/, "");
  v = v.replace(/\s+/g, "");
  return toHeaderSafeAscii(v);
}

/**
 * Supabase anon keys are single-line. Multi-line paste or stray quotes in
 * Cloudflare / .env often yields "Invalid API key" from GoTrue.
 */
export function sanitizeSupabaseKey(value: string | undefined): string {
  if (!value) return "";
  let v = value.trim().replace(/^\uFEFF/, "");
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  v = v.replace(/\s+/g, "");
  return toHeaderSafeAscii(v);
}

export type SupabaseAnonKeyKind = "missing" | "jwt" | "publishable" | "other";

export function getSupabaseAnonKeyMeta(raw: string | undefined): { present: boolean; kind: SupabaseAnonKeyKind } {
  const sanitized = sanitizeSupabaseKey(raw);
  if (!sanitized) {
    return { present: false, kind: "missing" };
  }
  if (sanitized.startsWith("eyJ")) {
    return { present: true, kind: "jwt" };
  }
  if (sanitized.startsWith("sb_publishable")) {
    return { present: true, kind: "publishable" };
  }
  return { present: true, kind: "other" };
}
