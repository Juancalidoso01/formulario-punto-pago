import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/es";
import { enMessages } from "@/lib/i18n/messages/en";
import { esMessages } from "@/lib/i18n/messages/es";
import { hakMessages } from "@/lib/i18n/messages/hak";
import { ruMessages } from "@/lib/i18n/messages/ru";
import { zhCNMessages } from "@/lib/i18n/messages/zh-CN";
import { zhHKMessages } from "@/lib/i18n/messages/zh-HK";

const MAP: Record<Locale, Messages> = {
  es: esMessages,
  en: enMessages,
  ru: ruMessages,
  "zh-CN": zhCNMessages,
  "zh-HK": zhHKMessages,
  hak: hakMessages,
};

export function getMessages(locale: Locale): Messages {
  return MAP[locale] ?? esMessages;
}
