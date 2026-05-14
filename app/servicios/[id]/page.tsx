import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrochureHeroTextBanner } from "@/components/BrochureHeroTextBanner";
import { AfiliacionChrome } from "@/components/AfiliacionChrome";
import { esServicioPrincipalValido, SERVICIO_PRINCIPAL_PUNTO_PAGO } from "@/lib/afiliacion-opciones";
import { brochureForId } from "@/lib/servicio-brochures";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return SERVICIO_PRINCIPAL_PUNTO_PAGO.map((s) => ({ id: s.id }));
}

export default async function ServicioBrochurePage({ params }: Props) {
  const { id } = await params;
  if (!esServicioPrincipalValido(id)) notFound();
  const b = brochureForId(id);
  if (!b) notFound();

  const formHref = `/formulario?servicio=${encodeURIComponent(id)}`;

  return (
    <AfiliacionChrome>
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="font-medium text-[#4749B6] hover:underline">
          Líneas de negocio
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
          {(b.heroTextBanner || b.heroImage) ? (
            <h1 className="text-2xl font-bold tracking-tight text-[#0B0B13] sm:text-3xl">
              {b.headline}
            </h1>
          ) : null}
          <p className="mt-3 text-base leading-relaxed text-slate-600">{b.tagline}</p>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Por qué afiliarse
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
              Solicitar afiliación con esta línea
            </Link>
            {b.officialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-[#4749B6]/40 hover:text-[#4749B6]"
              >
                {link.label}{" "}
                <span className="text-slate-500">
                  (
                  {link.href.includes("puntopago.net")
                    ? "sitio Punto Pago"
                    : "más información"}
                  )
                </span>
              </a>
            ))}
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-center text-sm font-medium text-slate-600 hover:text-[#4749B6]"
            >
              ← Otras líneas
            </Link>
          </div>

          <p className="mt-8 border-t border-slate-100 pt-6 text-xs leading-relaxed text-slate-500">
            La información de producto proviene de materiales públicos de Punto Pago. Condiciones,
            montos y plazos definitivos dependen de contrato y reglas vigentes al momento de la
            afiliación. Use los enlaces para ampliar información (sitio Punto Pago o recursos externos según corresponda).
          </p>
        </div>
      </article>
    </AfiliacionChrome>
  );
}
