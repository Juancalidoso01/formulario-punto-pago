import Link from "next/link";
import { redirect } from "next/navigation";
import { AfiliacionChrome } from "@/components/AfiliacionChrome";
import { AfiliacionCorporativoWizard } from "@/components/AfiliacionCorporativoWizard";
import { AfiliacionWizard } from "@/components/AfiliacionWizard";
import { esFormularioCorporativo } from "@/lib/afiliacion-corporativo-payload";
import { esServicioPrincipalValido } from "@/lib/afiliacion-opciones";

type Props = {
  searchParams: Promise<{ servicio?: string }>;
};

export default async function FormularioPage({ searchParams }: Props) {
  const sp = await searchParams;
  const servicio = typeof sp.servicio === "string" ? sp.servicio : undefined;

  if (!servicio || !esServicioPrincipalValido(servicio)) {
    redirect("/");
  }

  const corporativo = esFormularioCorporativo(servicio);
  const wizardKey = `svc-${servicio}`;

  return (
    <AfiliacionChrome>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <p>
          <span className="font-semibold text-[#0B0B13]">Paso 2 de 2</span>
          {" · "}
          {corporativo ? "Contacto corporativo" : "Formulario de afiliación"}
        </p>
        <Link
          href="/"
          className="font-medium text-[#4749B6] underline-offset-2 hover:underline"
        >
          ← Volver a líneas de negocio
        </Link>
      </div>

      <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-900/[0.06] ring-1 ring-white/40 backdrop-blur-xl sm:p-8">
        {corporativo ? (
          <AfiliacionCorporativoWizard key={wizardKey} />
        ) : (
          <AfiliacionWizard
            key={wizardKey}
            initialServicioPrincipal={servicio}
            startAfterServiceStep
          />
        )}
      </div>
    </AfiliacionChrome>
  );
}
