import { AfiliacionChrome } from "@/components/AfiliacionChrome";
import { AfiliacionWizard } from "@/components/AfiliacionWizard";

export default function Home() {
  return (
    <AfiliacionChrome>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#0B0B13] sm:text-4xl">
          <span className="pp-kyb-brand-sheen">Formulario de afiliación</span>
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Flujo de 17 pasos: primero elige entre cuatro líneas de negocio Punto Pago; luego
          los datos del contacto y la empresa. Los archivos y la firma se envían al servidor;
          puedes enlazar después un aviso a Slack en lugar de (o además de) Google Sheets.
        </p>
      </div>

      <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-900/[0.06] ring-1 ring-white/40 backdrop-blur-xl sm:p-8">
        <AfiliacionWizard />
      </div>
    </AfiliacionChrome>
  );
}
