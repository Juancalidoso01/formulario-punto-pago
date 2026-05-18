"use client";

import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/locales";
import { useI18n } from "@/components/I18nProvider";

export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <span className="sr-only">{LOCALE_META[locale].native}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="max-w-[9.5rem] cursor-pointer rounded-lg border border-slate-200/90 bg-white/95 px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-[#4749B6] focus:ring-2 focus:ring-[#4749B6]/20"
        aria-label="Language"
      >
        {LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_META[loc].native}
          </option>
        ))}
      </select>
    </label>
  );
}
