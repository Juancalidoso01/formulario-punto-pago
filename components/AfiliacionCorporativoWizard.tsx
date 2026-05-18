"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import type { AfiliacionCorporativoJson } from "@/lib/afiliacion-corporativo-payload";
import {
  FormSubmitLoadingOverlay,
  WizardSubmitButton,
} from "@/components/FormSubmitLoading";
import { SERVICIO_CORPORATIVO_ID } from "@/lib/afiliacion-corporativo-payload";

const TOTAL_STEPS = 3;

const inputClass =
  "w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#4749B6] focus:ring-2 focus:ring-[#4749B6]/20";

const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-slate-800";

function StepHeading({
  displayStep,
  title,
  description,
  showRequired = true,
}: {
  displayStep: number;
  title: string;
  description?: string;
  showRequired?: boolean;
}) {
  return (
    <header className="mb-6">
      <p className="text-sm text-slate-500">
        {displayStep}. {title}
        {showRequired ? <span className="text-red-600"> *</span> : null}
      </p>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      ) : null}
    </header>
  );
}

export function AfiliacionCorporativoWizard() {
  const router = useRouter();
  const { messages: m, t } = useI18n();
  const w = m.wizard;
  const corp = w.corp;
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoApellido, setContactoApellido] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
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
      telefonoFijoCodigo: "",
      telefonoFijoNumero: "",
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
    terminosAceptados,
  ]);

  const validateCurrent = useCallback((): string | null => {
    switch (step) {
      case 0:
        if (!contactoNombre.trim() || !contactoApellido.trim()) {
          return corp.errors.name;
        }
        return null;
      case 1:
        if (!email.trim()) return w.errors.emailRequired;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          return w.errors.emailInvalid;
        }
        if (!cargo.trim()) return corp.errors.cargo;
        return null;
      case 2:
        if (!telefonoCelCodigo.trim() || !telefonoCelNumero.trim()) {
          return w.errors.phone;
        }
        if (!terminosAceptados) return w.errors.terms;
        return null;
      default:
        return null;
    }
  }, [
    cargo,
    contactoApellido,
    contactoNombre,
    corp.errors.cargo,
    corp.errors.name,
    email,
    step,
    terminosAceptados,
    w.errors.emailInvalid,
    w.errors.emailRequired,
    w.errors.phone,
    w.errors.terms,
    telefonoCelCodigo,
    telefonoCelNumero,
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
        setStatusMsg(data.error ?? w.genericError);
        return;
      }

      setStatus("success");
      setStatusMsg(corp.successBody);
    } catch {
      setStatus("error");
      setStatusMsg(w.networkError);
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
        <p className="text-base font-medium">{w.successTitle}</p>
        <p className="mt-2 text-sm">{statusMsg}</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-6">
      <FormSubmitLoadingOverlay active={status === "loading"} message={w.sending} />
      <p className="text-sm text-slate-600">{corp.intro}</p>

      <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
        <span>{t("wizard.progress", { current: step + 1, total: TOTAL_STEPS })}</span>
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
              title={corp.steps.contact.title}
              description={corp.steps.contact.desc}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                {w.fields.firstName}
                <input
                  className={inputClass}
                  value={contactoNombre}
                  onChange={(e) => setContactoNombre(e.target.value)}
                  autoComplete="given-name"
                />
              </label>
              <label className={labelClass}>
                {w.fields.lastName}
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
              title={corp.steps.emailCargo.title}
              description={corp.steps.emailCargo.desc}
            />
            <div className="grid gap-4">
              <label className={labelClass}>
                {w.fields.email}
                <input
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              <label className={labelClass}>
                {corp.fields.cargo}
                <input
                  className={inputClass}
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder={corp.fields.cargoPh}
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
              title={corp.steps.phone.title}
              description={corp.steps.phone.desc}
            />
            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <label className={labelClass}>
                {w.fields.phoneCode}
                <input
                  className={inputClass}
                  placeholder="+507"
                  value={telefonoCelCodigo}
                  onChange={(e) => setTelefonoCelCodigo(e.target.value)}
                  autoComplete="tel-country-code"
                />
              </label>
              <label className={labelClass}>
                {w.fields.phoneNumber}
                <input
                  className={inputClass}
                  type="tel"
                  placeholder={corp.fields.phonePh}
                  value={telefonoCelNumero}
                  onChange={(e) => setTelefonoCelNumero(e.target.value)}
                  autoComplete="tel-national"
                />
              </label>
            </div>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800">
              <input
                type="checkbox"
                checked={terminosAceptados}
                onChange={(e) => setTerminosAceptados(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-[#4749B6]"
              />
              <span>
                {w.termsAgree}{" "}
                <Link
                  href="https://puntopago.net/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#4749B6] underline underline-offset-2"
                >
                  {w.termsLink}
                </Link>{" "}
                {corp.termsPrivacy}
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
          {w.back}
        </button>
        {step < TOTAL_STEPS - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-[#4749B6] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#4749B6]/25 transition hover:bg-[#3B3DA6]"
          >
            {w.next}
          </button>
        ) : (
          <WizardSubmitButton
            loading={status === "loading"}
            label={corp.submitContact}
            loadingLabel={w.sending}
            onClick={submit}
          />
        )}
      </div>
    </div>
  );
}
