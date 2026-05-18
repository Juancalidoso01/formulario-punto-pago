"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMessages } from "@/lib/i18n/get-messages";
import {
  LOCALE_COOKIE,
  LOCALE_META,
  parseLocale,
  type Locale,
} from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/es";
import { createTranslateFn, type TranslateFn } from "@/lib/i18n/translate";

type I18nContextValue = {
  locale: Locale;
  messages: Messages;
  t: TranslateFn;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  document.documentElement.lang = LOCALE_META[locale].htmlLang;
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => parseLocale(initialLocale));

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const messages = useMemo(() => getMessages(locale), [locale]);
  const t = useMemo(
    () => createTranslateFn(messages as unknown as Record<string, unknown>),
    [messages],
  );

  const value = useMemo(
    () => ({ locale, messages, t, setLocale }),
    [locale, messages, t, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n debe usarse dentro de I18nProvider");
  }
  return ctx;
}
