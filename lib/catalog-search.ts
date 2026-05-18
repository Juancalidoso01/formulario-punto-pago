/** Normaliza texto para búsqueda en catálogos largos (profesiones, actividades). */
export function normalizeCatalogSearchText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function catalogOptionMatches(option: string, queryRaw: string): boolean {
  const q = normalizeCatalogSearchText(queryRaw);
  if (!q) return true;
  const haystack = normalizeCatalogSearchText(option);
  if (haystack.includes(q)) return true;
  const tokens = q.split(" ").filter(Boolean);
  if (tokens.length <= 1) return false;
  return tokens.every((t) => haystack.includes(t));
}

export function filterCatalogOptions(
  queryRaw: string,
  list: readonly string[],
  max: number,
): string[] {
  const q = normalizeCatalogSearchText(queryRaw);
  if (!q) return list.slice(0, max);
  const out: string[] = [];
  for (const item of list) {
    if (!catalogOptionMatches(item, queryRaw)) continue;
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}
