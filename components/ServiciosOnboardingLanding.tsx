import Image from "next/image";
import Link from "next/link";
import { BrochureHeroTextBanner } from "@/components/BrochureHeroTextBanner";
import { AfiliacionChrome } from "@/components/AfiliacionChrome";
import { SERVICIO_PRINCIPAL_PUNTO_PAGO } from "@/lib/afiliacion-opciones";
import { SERVICIO_BROCHURES } from "@/lib/servicio-brochures";

export function ServiciosOnboardingLanding() {
  return (
    <AfiliacionChrome>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#4749B6]">
          Paso 1 de 2 · Onboarding
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0B0B13] sm:text-3xl">
          Elija su línea de negocio Punto Pago
        </h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          Revise el folleto comercial o continúe directo al formulario de afiliación. En el paso
          siguiente le pediremos los datos del contacto y la empresa.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SERVICIO_PRINCIPAL_PUNTO_PAGO.map((s) => {
          const b = SERVICIO_BROCHURES[s.id];
          return (
            <div
              key={s.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-sm ring-1 ring-slate-200/50"
            >
              <Link
                href={`/servicios/${s.id}`}
                className="group block flex-1 transition hover:bg-slate-50/80"
              >
                <div
                  className={
                    s.id === "agente-corresponsal-comunidad"
                      ? "relative aspect-[16/9] overflow-hidden bg-[#d6e4ff]"
                      : "relative aspect-[16/9] bg-gradient-to-br from-[#E8E9F7] to-slate-100"
                  }
                >
                  {b.heroTextBanner ? (
                    <BrochureHeroTextBanner compact lead={b.heroTextBanner.lead} rest={b.heroTextBanner.rest} />
                  ) : b.heroImage ? (
                    <Image
                      src={b.heroImage.src}
                      alt={b.heroImage.alt}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center">
                      <span className="text-sm font-semibold text-[#4749B6]">{s.titulo}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-base font-semibold text-[#0B0B13]">{s.titulo}</h2>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-600">{b.tagline}</p>
                  <span className="mt-3 inline-block text-sm font-medium text-[#4749B6] group-hover:underline">
                    Ver folleto →
                  </span>
                </div>
              </Link>
              <div className="border-t border-slate-100 bg-white px-4 py-3">
                <Link
                  href={`/formulario?servicio=${encodeURIComponent(s.id)}`}
                  className="text-sm font-semibold text-[#4749B6] underline-offset-2 hover:underline"
                >
                  Ir al formulario con esta línea →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </AfiliacionChrome>
  );
}
