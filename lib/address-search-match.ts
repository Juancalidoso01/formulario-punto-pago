/**
 * Coincidencias tolerantes para direcciones (lista local y deduplicación):
 * ignora puntos en abreviaturas (P.H. ≈ PH), acentos y espacios extra.
 */
export function normalizeAddressSearchText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\./g, "")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function addressSuggestionMatches(
  suggestion: string,
  queryRaw: string,
): boolean {
  const q = normalizeAddressSearchText(queryRaw);
  if (!q) return true;
  const h = normalizeAddressSearchText(suggestion);
  if (h.includes(q)) return true;
  const tokens = q.split(" ").filter(Boolean);
  if (tokens.length <= 1) return false;
  return tokens.every((t) => h.includes(t));
}

export function filterLocalAddressSuggestions(
  queryRaw: string,
  list: readonly string[],
  max: number,
): string[] {
  const q = normalizeAddressSearchText(queryRaw);
  if (!q) return [];
  const out: string[] = [];
  for (const a of list) {
    if (!addressSuggestionMatches(a, queryRaw)) continue;
    out.push(a);
    if (out.length >= max) break;
  }
  return out;
}
