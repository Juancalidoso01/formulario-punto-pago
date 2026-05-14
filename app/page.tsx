import { AfiliacionWizard } from "@/components/AfiliacionWizard";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Formulario de afiliación
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Flujo de 17 pasos: primero indica qué necesita de Punto Pago (una opción clara),
          luego los datos del contacto y la empresa. Los archivos y la firma se envían al
          servidor; puedes enlazar después un aviso a Slack en lugar de (o además de)
          Google Sheets.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <AfiliacionWizard />
      </div>
    </main>
  );
}
