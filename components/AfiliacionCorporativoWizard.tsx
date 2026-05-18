"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { AfiliacionCorporativoJson } from "@/lib/afiliacion-corporativo-payload";
import { SERVICIO_CORPORATIVO_ID } from "@/lib/afiliacion-corporativo-payload";

const TOTAL_STEPS = 3;

const inputClass =
  "w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#4749B6] focus:ring-2 focus:ring-[#4749B6]/20";

const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-slate-800";

function StepHeading({
  displayStep,
  title,
  description,
}: {
  displayStep: number;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-6">
      <p className="text-sm text-slate-500">
        {displayStep}. {title}
        <span className="text-red-600"> *</span>
      </p>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      ) : null}
    </header>
  );
}

function PhoneRow({
  label,
  codigo,
  numero,
  onCodigo,
  onNumero,
  numeroPlaceholder,
}: {
  label: string;
  codigo: string;
  numero: string;
  onCodigo: (v: string) => void;
  onNumero: (v: string) => void;
  numeroPlaceholder: string;
}) {
  return (
    <div className={labelClass}>
      <span>{label}</span>
      <div className="flex gap-2">
        <input
          className={`${inputClass} w-24 shrink-0`}
          value={codigo}
          onChange={(e) => onCodigo(e.target.value)}
          aria-label={`Código país ${label}`}
          autoComplete="tel-country-code"
        />
        <input
          className={`${inputClass} min-w-0 flex-1`}
          type="tel"
          value={numero}
          onChange={(e) => onNumero(e.target.value)}
          placeholder={numeroPlaceholder}
          autoComplete="tel-national"
        />
      </div>
    </div>
  );
}

export function AfiliacionCorporativoWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoApellido, setContactoApellido] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefonoFijoCodigo, setTelefonoFijoCodigo] = useState("+507");
  const [telefonoFijoNumero, setTelefonoFijoNumero] = useState("");
  const [telefonoCelCodigo, setTelefonoCelCodigo] = useState("+507");
  const [telefonoCelNumero, setTelefonoCelNumero] = useState("");
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  const buildJson = useCallback((): AfiliacionCorporativoJson => {
    return {
      servicioPrincipal: SERVICIO_CORPORATIVO_ID,
      contactoNombre,
      contactoApellido,
      email,
      cargo,
      telefonoFijoCodigo,
      telefonoFijoNumero,
      telefonoCelCodigo,
      telefonoCelNumero,
      terminosAceptados,
    };
  }, [
    cargo,
    contactoApellido,
    contactoNombre,
    email,
    telefonoCelCodigo,
    telefonoCelNumero,
    telefonoFijoCodigo,
    telefonoFijoNumero,
    terminosAceptados,
  ]);

  const validateCurrent = useCallback((): string | null => {
    switch (step) {
      case 0:
        if (!contactoNombre.trim() || !contactoApellido.trim()) {
          return "Indique nombre y apellido de la persona de contacto.";
        }
        return null;
      case 1:
        if (!email.trim()) return "Indique el correo electrónico.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          return "El correo electrónico no tiene un formato válido.";
        }
        if (!cargo.trim()) return "Indique el cargo.";
        return null;
      case 2:
        if (!telefonoFijoCodigo.trim() || !telefonoFijoNumero.trim()) {
          return "Indique el teléfono fijo.";
        }
        if (!telefonoCelCodigo.trim() || !telefonoCelNumero.trim()) {
          return "Indique el teléfono celular.";
        }
        if (!terminosAceptados) return "Debe aceptar los términos y condiciones.";
        return null;
      default:
        return null;
    }
  }, [
    cargo,
    contactoApellido,
    contactoNombre,
    email,
    step,
    telefonoCelCodigo,
    telefonoCelNumero,
    telefonoFijoCodigo,
    telefonoFijoNumero,
    terminosAceptados,
  ]);

  const submit = async () => {
    setError(null);
    const v = validateCurrent();
    if (v) {
      setError(v);
      return;
    }

    setStatus("loading");
    setStatusMsg("");

    const fd = new FormData();
    fd.append("data", JSON.stringify(buildJson()));

    try {
      const res = await fetch("/api/leads", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setStatus("error");
        setStatusMsg(data.error ?? "No se pudo enviar. Intenta de nuevo.");
        return;
      }

      setStatus("success");
      setStatusMsg("Hemos recibido sus datos. Nuestro equipo comercial le contactará pronto.");
    } catch {
      setStatus("error");
      setStatusMsg("Error de red. Comprueba tu conexión e intenta de nuevo.");
    }
  };

  const goNext = () => {
    setError(null);
    const v = validateCurrent();
    if (v) {
      setError(v);
      return;
    }
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  };

  const goBack = () => {
    setError(null);
    if (step === 0) {
      router.push("/");
      return;
    }
    setStep((s) => s - 1);
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-6 text-center text-emerald-900">
        <p className="text-base font-medium">Envío correcto</p>
        <p className="mt-2 text-sm">{statusMsg}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-slate-600">
        Formulario breve de contacto para empresas interesadas en servicios corporativos Punto
        Pago.
      </p>

      <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
        <span>
          {step + 1} / {TOTAL_STEPS}
        </span>
        <div className="h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#4749B6] shadow-sm shadow-[#4749B6]/30 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="min-h-[200px]">
        {step === 0 ? (
          <>
            <StepHeading
              displayStep={1}
              title="Datos de la persona de contacto"
              description="Indique quién deja los datos en nombre de la empresa."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Nombre
                <input
                  className={inputClass}
                  value={contactoNombre}
                  onChange={(e) => setContactoNombre(e.target.value)}
                  autoComplete="given-name"
                />
              </label>
              <label className={labelClass}>
                Apellido
                <input
                  className={inputClass}
                  value={contactoApellido}
                  onChange={(e) => setContactoApellido(e.target.value)}
                  autoComplete="family-name"
                />
              </label>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <StepHeading
              displayStep={2}
              title="Correo y cargo"
              description="Usaremos estos datos para que un asesor comercial le contacte."
            />
            <div className="grid gap-4">
              <label className={labelClass}>
                Correo electrónico
                <input
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              <label className={labelClass}>
                Cargo en la empresa
                <input
                  className={inputClass}
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ej: Gerente comercial, Director de finanzas"
                  autoComplete="organization-title"
                />
              </label>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <StepHeading
              displayStep={3}
              title="Teléfonos de contacto"
              description="Indique número fijo y celular donde podamos ubicarle."
            />
            <div className="grid gap-4">
              <PhoneRow
                label="Teléfono fijo"
                codigo={telefonoFijoCodigo}
                numero={telefonoFijoNumero}
                onCodigo={setTelefonoFijoCodigo}
                onNumero={setTelefonoFijoNumero}
                numeroPlaceholder="Ej: 263-4567"
              />
              <PhoneRow
                label="Teléfono celular"
                codigo={telefonoCelCodigo}
                numero={telefonoCelNumero}
                onCodigo={setTelefonoCelCodigo}
                onNumero={setTelefonoCelNumero}
                numeroPlaceholder="Ej: 6000-0000"
              />
            </div>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800">
              <input
                type="checkbox"
                checked={terminosAceptados}
                onChange={(e) => setTerminosAceptados(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-[#4749B6]"
              />
              <span>
                Estoy de acuerdo con los{" "}
                <Link
                  href="https://puntopago.net/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#4749B6] underline underline-offset-2"
                >
                  términos y condiciones
                </Link>{" "}
                y la política de privacidad.
              </span>
            </label>
          </>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          {error}
        </p>
      ) : null}

      {status === "error" ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900" role="status">
          {statusMsg}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
        <button
          type="button"
          onClick={goBack}
          disabled={status === "loading"}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
        >
          Anterior
        </button>
        {step < TOTAL_STEPS - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-[#4749B6] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#4749B6]/25 transition hover:bg-[#3B3DA6]"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={status === "loading"}
            className="rounded-lg bg-[#4749B6] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#4749B6]/25 transition hover:bg-[#3B3DA6] disabled:opacity-60"
          >
            {status === "loading" ? "Enviando…" : "Enviar datos de contacto"}
          </button>
        )}
      </div>
    </div>
  );
}

