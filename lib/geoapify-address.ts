export type GeoapifyAddressItem = {
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
  name?: string;
  state?: string;
  county?: string;
  district?: string;
  suburb?: string;
  city?: string;
  lat?: number;
  lon?: number;
};

type GeoapifyResponse = { results?: GeoapifyAddressItem[] };

const PA_CITY_BIAS = "proximity:-79.5195,8.9824";

export function enrichGeocodeAutocompleteText(raw: string): string {
  let t = raw.trim();
  if (!t) return t;
  if (/^ph\.?$/i.test(t)) t = "P.H.";
  else t = t.replace(/\bph\b/gi, "P.H.");
  const lower = t.toLowerCase();
  const hasPa =
    lower.includes("panam") ||
    lower.includes("panama") ||
    lower.includes("ciudad de panam");
  if (hasPa) return t;
  if (t.length <= 5 && !/\s/.test(t)) {
    return `${t}, Ciudad de Panamá`;
  }
  return t;
}

export function buildGeoapifyAutocompleteUrl(text: string, apiKey: string): string {
  const enriched = enrichGeocodeAutocompleteText(text);
  return (
    "https://api.geoapify.com/v1/geocode/autocomplete?" +
    new URLSearchParams({
      text: `${enriched}, Panama`,
      filter: "countrycode:pa",
      limit: "15",
      format: "json",
      lang: "es",
      bias: PA_CITY_BIAS,
      apiKey,
    }).toString()
  );
}

export function buildGeoapifyAutocompleteUrlWorldwide(
  text: string,
  apiKey: string,
): string {
  const t = text.trim();
  return (
    "https://api.geoapify.com/v1/geocode/autocomplete?" +
    new URLSearchParams({
      text: t,
      limit: "15",
      format: "json",
      lang: "es",
      apiKey,
    }).toString()
  );
}

export async function geoapifyAutocompletePanama(
  text: string,
  apiKey: string,
): Promise<GeoapifyAddressItem[]> {
  const t = text.trim();
  if (!apiKey || t.length < 2) return [];
  const r = await fetch(buildGeoapifyAutocompleteUrl(t, apiKey));
  if (!r.ok) return [];
  const data = (await r.json()) as GeoapifyResponse;
  return Array.isArray(data.results) ? data.results : [];
}

export async function geoapifyAutocompleteWorldwide(
  text: string,
  apiKey: string,
): Promise<GeoapifyAddressItem[]> {
  const t = text.trim();
  if (!apiKey || t.length < 2) return [];
  const r = await fetch(buildGeoapifyAutocompleteUrlWorldwide(t, apiKey));
  if (!r.ok) return [];
  const data = (await r.json()) as GeoapifyResponse;
  return Array.isArray(data.results) ? data.results : [];
}

type AutocompleteProxyJson = {
  results?: GeoapifyAddressItem[];
  serverKeyConfigured?: boolean;
};

export async function geoapifyAutocompletePanamaClientSide(
  text: string,
): Promise<GeoapifyAddressItem[]> {
  const t = text.trim();
  if (t.length < 2) return [];
  try {
    const r = await fetch(
      `/api/geoapify/autocomplete?${new URLSearchParams({ text: t }).toString()}`,
    );
    const data = (await r.json()) as AutocompleteProxyJson;
    const results = Array.isArray(data.results) ? data.results : [];
    if (results.length > 0) return results;
    if (data.serverKeyConfigured === false) {
      const pub = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY?.trim();
      if (pub) return geoapifyAutocompletePanama(t, pub);
    }
    return [];
  } catch {
    const pub = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY?.trim();
    if (pub) return geoapifyAutocompletePanama(t, pub);
    return [];
  }
}

export async function geoapifyAutocompleteWorldwideClientSide(
  text: string,
): Promise<GeoapifyAddressItem[]> {
  const t = text.trim();
  if (t.length < 2) return [];
  try {
    const r = await fetch(
      `/api/geoapify/autocomplete?${new URLSearchParams({ text: t, scope: "world" }).toString()}`,
    );
    const data = (await r.json()) as AutocompleteProxyJson;
    const results = Array.isArray(data.results) ? data.results : [];
    if (results.length > 0) return results;
    if (data.serverKeyConfigured === false) {
      const pub = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY?.trim();
      if (pub) return geoapifyAutocompleteWorldwide(t, pub);
    }
    return [];
  } catch {
    const pub = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY?.trim();
    if (pub) return geoapifyAutocompleteWorldwide(t, pub);
    return [];
  }
}

export function formatGeoapifyDisplay(item: GeoapifyAddressItem): string {
  let fmt = item.formatted || item.address_line1 || item.name || "";
  if (item.address_line2) fmt = fmt ? `${fmt}, ${item.address_line2}` : item.address_line2;
  return fmt.trim();
}

export function geoapifyParsedSummary(item: GeoapifyAddressItem): string {
  const parts: string[] = [];
  if (item.state) parts.push(`Provincia: ${item.state}`);
  if (item.county) parts.push(`Distrito: ${item.county}`);
  const bar = item.suburb || item.city;
  if (bar) parts.push(`Barrio: ${bar}`);
  return parts.join(" · ");
}
