export const LOCALES = ["es", "en", "ru", "zh-CN", "zh-HK", "hak"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_COOKIE = "pp_locale";

export const LOCALE_META: Record<
  Locale,
  { native: string; label: string; htmlLang: string }
> = {
  es: { native: "Español", label: "ES", htmlLang: "es" },
  en: { native: "English", label: "EN", htmlLang: "en" },
  ru: { native: "Русский", label: "RU", htmlLang: "ru" },
  "zh-CN": { native: "普通话", label: "中文", htmlLang: "zh-Hans" },
  "zh-HK": { native: "廣東話", label: "粵", htmlLang: "zh-Hant-HK" },
  hak: { native: "客家話", label: "客", htmlLang: "zh-Hant" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function parseLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
