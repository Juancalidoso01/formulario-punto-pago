"use client";

import Image from "next/image";
import Link from "next/link";
import { BrochureHeroTextBanner } from "@/components/BrochureHeroTextBanner";
import { useI18n } from "@/components/I18nProvider";
import { brochureFromMessages } from "@/lib/i18n/brochures";
import type { ServicioPrincipalId } from "@/lib/afiliacion-opciones";

export function ServicioBrochureArticle({ id }: { id: ServicioPrincipalId }) {
  const { messages: m } = useI18n();
  const b = brochureFromMessages(m, id);
  const formHref = `/formulario?servicio=${encodeURIComponent(id)}`;

  return (
    <>
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="font-medium text-[#4749B6] hover:underline">
          {m.serviciosPage.businessLines}
        </Link>
        <span aria-hidden> / </span>
        <span className="text-slate-700">{b.headline}</span>
      </nav>

      <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-lg ring-1 ring-slate-200/40">
        {b.heroTextBanner ? (
          <BrochureHeroTextBanner lead={b.heroTextBanner.lead} rest={b.heroTextBanner.rest} />
        ) : b.heroImage ? (
          <div
            className={
              id === "agente-corresponsal-comunidad"
                ? "relative aspect-[16/9] w-full overflow-hidden bg-[#d6e4ff] sm:aspect-[2/1]"
                : "relative aspect-[21/9] w-full bg-slate-100"
            }
          >
            <Image
              src={b.heroImage.src}
              alt={b.heroImage.alt}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#4749B6] to-[#6366d1] px-6 py-10 text-white">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{b.headline}</h1>
          </div>
        )}

        <div className="p-6 sm:p-8">
          {b.heroTextBanner || b.heroImage ? (
            <h1 className="text-2xl font-bold tracking-tight text-[#0B0B13] sm:text-3xl">
              {b.headline}
            </h1>
          ) : null}
          <p className="mt-3 text-base leading-relaxed text-slate-600">{b.tagline}</p>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {m.serviciosPage.whyAffiliate}
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-700 sm:text-base">
            {b.highlights.map((line) => (
              <li key={line.slice(0, 80)} className="leading-relaxed">
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={formHref}
              className="inline-flex items-center justify-center rounded-xl bg-[#4749B6] px-5 py-3 text-center text-sm font-semibold text-white shadow-md shadow-[#4749B6]/25 transition hover:bg-[#3B3DA6]"
            >
              {m.serviciosPage.fillForm}
            </Link>
            {b.officialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-[#4749B6]/40 hover:text-[#4749B6]"
              >
                <span className="flex flex-col items-center gap-0.5">
                  <span>{link.label}</span>
                  <span className="text-xs font-normal text-slate-500">
                    {link.linkSub ?? m.serviciosPage.officialLinkSub}
                  </span>
                </span>
              </a>
            ))}
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-center text-sm font-medium text-slate-600 hover:text-[#4749B6]"
            >
              {m.serviciosPage.otherLines}
            </Link>
          </div>

          <p className="mt-8 border-t border-slate-100 pt-6 text-xs leading-relaxed text-slate-500">
            {m.serviciosPage.disclaimer}
          </p>
        </div>
      </article>
    </>
  );
}
