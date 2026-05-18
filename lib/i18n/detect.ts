import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

/** Mapea etiquetas BCP-47 del navegador a nuestros locales soportados. */
export function localeFromLanguageTag(tag: string): Locale | null {
  const t = tag.trim().toLowerCase();
  if (!t) return null;

  if (t.startsWith("en")) return "en";
  if (t.startsWith("ru")) return "ru";
  if (t.startsWith("es")) return "es";

  if (t === "hak" || t.startsWith("hak-")) return "hak";
  if (t === "yue" || t.startsWith("yue-")) return "zh-HK";

  if (t.startsWith("zh")) {
    if (t.includes("hk") || t.includes("hant-hk")) return "zh-HK";
    if (t.includes("hak")) return "hak";
    return "zh-CN";
  }

  return null;
}

export function detectLocaleFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;

  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim();
    if (!tag) continue;
    const loc = localeFromLanguageTag(tag);
    if (loc) return loc;
  }

  return DEFAULT_LOCALE;
}

export function detectLocaleFromNavigator(languages: readonly string[]): Locale {
  for (const tag of languages) {
    const loc = localeFromLanguageTag(tag);
    if (loc) return loc;
  }
  return DEFAULT_LOCALE;
}
