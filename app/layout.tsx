import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { I18nProvider } from "@/components/I18nProvider";
import { getMessages } from "@/lib/i18n/get-messages";
import { LOCALE_META } from "@/lib/i18n/locales";
import { getRequestLocale } from "@/lib/i18n/server";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-pp",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const m = getMessages(locale);
  return {
    title: m.meta.title,
    description: m.meta.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const htmlLang = LOCALE_META[locale].htmlLang;

  return (
    <html lang={htmlLang}>
      <body
        className={`${plusJakarta.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
