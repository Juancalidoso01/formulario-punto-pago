import Image from "next/image";
import Link from "next/link";
import { AfiliacionChrome } from "@/components/AfiliacionChrome";
import { SERVICIO_PRINCIPAL_PUNTO_PAGO } from "@/lib/afiliacion-opciones";
import { SERVICIO_BROCHURES } from "@/lib/servicio-brochures";

export default function ServiciosIndexPage() {
  return (
    <AfiliacionChrome>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#0B0B13] sm:text-3xl">
          Líneas de negocio Punto Pago
        </h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          Folleto comercial por opción. Cuando quiera afiliarse, use el botón para abrir el
          formulario con esa línea ya seleccionada.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SERVICIO_PRINCIPAL_PUNTO_PAGO.map((s) => {
          const b = SERVICIO_BROCHURES[s.id];
          return (
            <Link
              key={s.id}
              href={`/servicios/${s.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-sm ring-1 ring-slate-200/50 transition hover:-translate-y-0.5 hover:border-[#4749B6]/35 hover:shadow-md"
            >
              <div className="relative aspect-[16/9] bg-gradient-to-br from-[#E8E9F7] to-slate-100">
                {b.heroImage ? (
                  <Image
                    src={b.heroImage.src}
                    alt={b.heroImage.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center">
                    <span className="text-sm font-semibold text-[#4749B6]">{s.titulo}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-base font-semibold text-[#0B0B13]">{s.titulo}</h2>
                <p className="mt-2 line-clamp-2 text-xs text-slate-600">{b.tagline}</p>
                <span className="mt-3 text-sm font-medium text-[#4749B6] group-hover:underline">
                  Ver folleto →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-slate-600">
        ¿Listo para enviar datos?{" "}
        <Link href="/" className="font-medium text-[#4749B6] underline-offset-2 hover:underline">
          Ir al formulario de afiliación
        </Link>
      </p>
    </AfiliacionChrome>
  );
}
