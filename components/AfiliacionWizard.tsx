"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import type { AfiliacionJson } from "@/lib/afiliacion-payload";
import {
  ACTIVIDAD_NEGOCIO_OPCIONES,
  METODO_INTEGRACION_OPCIONES,
  MCC_OPCIONES,
  NUM_CLIENTES_OPCIONES,
  textoIntegracionNoAplica,
  textoNominaNoAplica,
  OCUPACION_OPCIONES,
  RANGO_NOMINA_OPCIONES,
  esServicioCuotas,
  esServicioPrincipalValido,
  servicioRequiereFotosLocal,
  numeroPasoVisible,
  pasoAnteriorVisible,
  pasoOmiteActividadKyb,
  pasoOmiteParaServicio,
  pasosVisiblesParaServicio,
  siguientePasoVisible,
} from "@/lib/afiliacion-opciones";
import {
  AfiliacionAddressPaField,
  type AfiliacionAddressEntryMode,
} from "@/components/AfiliacionAddressPaField";
import { isPanamaManualComposedAddress } from "@/lib/panama-manual-address";
import { SearchableSelect } from "@/components/SearchableSelect";
import { ServicioPrincipalPicker } from "@/components/ServicioPrincipalPicker";
import { CuotasPlanPicker } from "@/components/CuotasPlanPicker";
import { DocumentFilePicker } from "@/components/DocumentFilePicker";
import {
  FormSubmitLoadingOverlay,
  WizardSubmitButton,
} from "@/components/FormSubmitLoading";
import { LocalPhotosPicker } from "@/components/LocalPhotosPicker";
import { isAvisoDocument } from "@/lib/upload-files";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import {
  CUOTAS_MIN_AMOUNT,
  CUOTAS_TERM_CONFIG,
  calcularPagoRegularCuotas,
  textoPlanCuotasParaSheet,
  type CuotasTermMonths,
} from "@/lib/cuotas-calculator";

const TOTAL_STEPS = 17;

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

function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const id = `${name}-${opt.replace(/\W+/g, "-").slice(0, 40)}`;
        return (
          <label
            key={opt}
            htmlFor={id}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 shadow-sm transition hover:border-[#4749B6]/35 has-[:checked]:border-[#4749B6] has-[:checked]:ring-1 has-[:checked]:ring-[#4749B6]/30"
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="mt-0.5 size-4 shrink-0 text-[#4749B6]"
            />
            <span className="leading-snug">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

export function AfiliacionWizard({
  initialServicioPrincipal,
  startAfterServiceStep = false,
}: {
  initialServicioPrincipal?: string;
  startAfterServiceStep?: boolean;
}) {
  const router = useRouter();
  const { messages: m, t } = useI18n();
  const w = m.wizard;
  const [servicioPrincipal, setServicioPrincipal] = useState(() =>
    initialServicioPrincipal && esServicioPrincipalValido(initialServicioPrincipal)
      ? initialServicioPrincipal
      : "",
  );
  const [step, setStep] = useState(() =>
    startAfterServiceStep &&
    initialServicioPrincipal &&
    esServicioPrincipalValido(initialServicioPrincipal)
      ? 1
      : 0,
  );
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [statusMsg, setStatusMsg] = useState("");

  const signatureRef = useRef<SignaturePadHandle>(null);

  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoApellido, setContactoApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefonoCodigo, setTelefonoCodigo] = useState("+507");
  const [telefonoNumero, setTelefonoNumero] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [ruc, setRuc] = useState("");
  const [direccion, setDireccion] = useState("");
  const [direccionEntryMode, setDireccionEntryMode] =
    useState<AfiliacionAddressEntryMode>("geo");
  const [provincia, setProvincia] = useState("");
  const [rubroMcc, setRubroMcc] = useState("");
  const [descripcionNegocio, setDescripcionNegocio] = useState("");
  const [ocupacionPrincipal, setOcupacionPrincipal] = useState("");
  const [actividadNegocio, setActividadNegocio] = useState("");
  const [fotosLocal, setFotosLocal] = useState<File[]>([]);
  const [planCuotasMeses, setPlanCuotasMeses] = useState<CuotasTermMonths>(2);
  const [planCuotasMonto, setPlanCuotasMonto] = useState(100);
  const [rangoNominaMensual, setRangoNominaMensual] = useState("");
  const [avisoOperacion, setAvisoOperacion] = useState<File | null>(null);
  const [numClientes, setNumClientes] = useState("");
  const [metodoIntegracion, setMetodoIntegracion] = useState("");
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  const buildJson = useCallback((): AfiliacionJson => {
    return {
      contactoNombre,
      contactoApellido,
      email,
      telefonoCodigo,
      telefonoNumero,
      nombreEmpresa,
      ruc,
      direccion,
      provincia,
      descripcionNegocio,
      rubroMcc,
      servicioPrincipal,
      ocupacionPrincipal,
      actividadNegocio,
      rangoNominaMensual: pasoOmiteParaServicio(servicioPrincipal, 11)
        ? textoNominaNoAplica(servicioPrincipal)
        : rangoNominaMensual,
      numClientes,
      metodoIntegracion: esServicioCuotas(servicioPrincipal)
        ? textoPlanCuotasParaSheet(planCuotasMeses, planCuotasMonto)
        : pasoOmiteParaServicio(servicioPrincipal, 14)
          ? textoIntegracionNoAplica(servicioPrincipal)
          : metodoIntegracion,
      planCuotasMeses: esServicioCuotas(servicioPrincipal) ? planCuotasMeses : undefined,
      planCuotasMontoReferencia: esServicioCuotas(servicioPrincipal)
        ? planCuotasMonto
        : undefined,
      planCuotasPagoRegular: esServicioCuotas(servicioPrincipal)
        ? calcularPagoRegularCuotas(planCuotasMonto, planCuotasMeses)
        : undefined,
      planCuotasCantidadPagos: esServicioCuotas(servicioPrincipal)
        ? CUOTAS_TERM_CONFIG[planCuotasMeses].payments
        : undefined,
      terminosAceptados,
    };
  }, [
    actividadNegocio,
    contactoApellido,
    contactoNombre,
    descripcionNegocio,
    rubroMcc,
    direccion,
    email,
    metodoIntegracion,
    planCuotasMeses,
    planCuotasMonto,
    nombreEmpresa,
    numClientes,
    ocupacionPrincipal,
    provincia,
    rangoNominaMensual,
    ruc,
    telefonoCodigo,
    telefonoNumero,
    servicioPrincipal,
    terminosAceptados,
  ]);

  const validateCurrent = useCallback((): string | null => {
    switch (step) {
      case 0:
        if (!servicioPrincipal) {
          return w.errors.service;
        }
        return null;
      case 1:
        if (!contactoNombre.trim() || !contactoApellido.trim()) {
          return w.errors.name;
        }
        return null;
      case 2:
        if (!email.trim()) return w.errors.emailRequired;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          return w.errors.emailInvalid;
        }
        return null;
      case 3:
        if (!telefonoCodigo.trim() || !telefonoNumero.trim()) {
          return w.errors.phone;
        }
        return null;
      case 4:
        if (!nombreEmpresa.trim()) return w.errors.company;
        return null;
      case 5:
        if (!ruc.trim()) return w.errors.ruc;
        return null;
      case 6:
        if (!direccion.trim()) {
          return direccionEntryMode === "manual"
            ? w.errors.addressManual
            : w.errors.address;
        }
        if (!provincia.trim()) {
          return w.errors.province;
        }
        if (
          direccionEntryMode === "manual" &&
          !isPanamaManualComposedAddress(direccion)
        ) {
          return w.errors.addressIncomplete;
        }
        return null;
      case 7:
        if (!rubroMcc) {
          return w.errors.mcc;
        }
        if (!descripcionNegocio.trim()) {
          return w.errors.business;
        }
        return null;
      case 8:
        if (!ocupacionPrincipal) {
          return w.errors.occupation;
        }
        return null;
      case 9:
        if (!pasoOmiteActividadKyb(servicioPrincipal) && !actividadNegocio) {
          return w.errors.activity;
        }
        return null;
      case 10:
        if (esServicioCuotas(servicioPrincipal)) {
          const cfg = CUOTAS_TERM_CONFIG[planCuotasMeses];
          const monto = Math.min(
            Math.max(Math.round(planCuotasMonto), CUOTAS_MIN_AMOUNT),
            cfg.maxAmount,
          );
          if (monto < CUOTAS_MIN_AMOUNT) {
            return w.errors.cuotasAmount;
          }
          return null;
        }
        if (servicioRequiereFotosLocal(servicioPrincipal)) {
          if (fotosLocal.length < 1 || fotosLocal.length > 5) {
            return w.errors.photos;
          }
        }
        return null;
      case 11:
        if (pasoOmiteParaServicio(servicioPrincipal, 11)) return null;
        if (!rangoNominaMensual) return w.errors.payroll;
        return null;
      case 12:
        if (!avisoOperacion) return w.errors.aviso;
        if (!isAvisoDocument(avisoOperacion)) return w.errors.avisoFormat;
        return null;
      case 13:
        if (!numClientes) return w.errors.clients;
        return null;
      case 14:
        if (pasoOmiteParaServicio(servicioPrincipal, 14)) return null;
        if (!metodoIntegracion) return w.errors.integration;
        return null;
      case 15:
        if (!terminosAceptados) return w.errors.terms;
        return null;
      case 16:
        if (signatureRef.current?.isEmpty()) {
          return w.errors.signature;
        }
        return null;
      default:
        return null;
    }
  }, [
    actividadNegocio,
    avisoOperacion,
    contactoApellido,
    contactoNombre,
    descripcionNegocio,
    rubroMcc,
    direccion,
    direccionEntryMode,
    email,
    fotosLocal.length,
    planCuotasMeses,
    planCuotasMonto,
    metodoIntegracion,
    nombreEmpresa,
    numClientes,
    ocupacionPrincipal,
    provincia,
    rangoNominaMensual,
    ruc,
    step,
    telefonoCodigo,
    telefonoNumero,
    terminosAceptados,
    servicioPrincipal,
    w.errors,
  ]);

  const goNext = () => {
    setError(null);
    const v = validateCurrent();
    if (v) {
      setError(v);
      return;
    }
    const next = siguientePasoVisible(step, servicioPrincipal, TOTAL_STEPS);
    if (next !== null) setStep(next);
  };

  const goBack = () => {
    setError(null);
    if (startAfterServiceStep && step === 1) {
      router.push("/");
      return;
    }
    const prev = pasoAnteriorVisible(step, servicioPrincipal);
    if (prev !== null) setStep(prev);
  };

  const submit = async () => {
    setError(null);
    const v = validateCurrent();
    if (v) {
      setError(v);
      return;
    }

    setStatus("loading");
    setStatusMsg("");

    const json = buildJson();
    const fd = new FormData();
    fd.append("data", JSON.stringify(json));
    if (servicioRequiereFotosLocal(servicioPrincipal)) {
      for (const f of fotosLocal) {
        fd.append("fotos", f);
      }
    }
    if (avisoOperacion) {
      fd.append("aviso", avisoOperacion);
    }
    const firmaBlob = await signatureRef.current?.toBlob();
    if (firmaBlob && firmaBlob.size > 0) {
      fd.append("firma", firmaBlob, "firma.png");
    }

    try {
      const res = await fetch("/api/leads", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setStatus("error");
        setStatusMsg(data.error ?? w.genericError);
        return;
      }

      setStatus("success");
      setStatusMsg(w.successBody);
    } catch {
      setStatus("error");
      setStatusMsg(w.networkError);
    }
  };

  const pasosVisibles = pasosVisiblesParaServicio(servicioPrincipal, TOTAL_STEPS);
  const pasoActualVisible = numeroPasoVisible(step, servicioPrincipal, TOTAL_STEPS);
  const progress = (pasoActualVisible / pasosVisibles.length) * 100;
  const pasoLabel = (s: number) => numeroPasoVisible(s, servicioPrincipal, TOTAL_STEPS);

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
      <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
        <span>
          {t("wizard.progress", {
            current: pasoActualVisible,
            total: pasosVisibles.length,
          })}
        </span>
        <div className="h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#4749B6] shadow-sm shadow-[#4749B6]/30 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="min-h-[280px]">
        {step === 0 && !startAfterServiceStep ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.service.title}
              description={w.steps.service.desc}
            />
            <ServicioPrincipalPicker
              value={servicioPrincipal}
              onChange={setServicioPrincipal}
            />
            {servicioPrincipal && esServicioPrincipalValido(servicioPrincipal) ? (
              <p className="mt-3 text-center text-sm">
                <Link
                  href={`/servicios/${servicioPrincipal}`}
                  className="font-medium text-[#4749B6] underline-offset-2 hover:underline"
                >
                  {w.viewProduct}
                </Link>
              </p>
            ) : null}
            <p className="mt-4 text-xs text-slate-500">{w.changeService}</p>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <StepHeading displayStep={pasoLabel(step)} title={w.steps.name.title} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                {w.fields.firstName}
                <input
                  className={inputClass}
                  placeholder={w.fields.firstName}
                  value={contactoNombre}
                  onChange={(e) => setContactoNombre(e.target.value)}
                  autoComplete="given-name"
                />
              </label>
              <label className={labelClass}>
                {w.fields.lastName}
                <input
                  className={inputClass}
                  placeholder={w.fields.lastName}
                  value={contactoApellido}
                  onChange={(e) => setContactoApellido(e.target.value)}
                  autoComplete="family-name"
                />
              </label>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <StepHeading displayStep={pasoLabel(step)} title={w.steps.email.title} />
            <label className={labelClass}>
              {w.fields.email}
              <input
                className={inputClass}
                type="email"
                placeholder={w.fields.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.phone.title}
              description={w.steps.phone.desc}
            />
            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <label className={labelClass}>
                {w.fields.phoneCode}
                <input
                  className={inputClass}
                  placeholder="+507"
                  value={telefonoCodigo}
                  onChange={(e) => setTelefonoCodigo(e.target.value)}
                  autoComplete="tel-country-code"
                />
              </label>
              <label className={labelClass}>
                {w.fields.phoneNumber}
                <input
                  className={inputClass}
                  placeholder={w.fields.phoneNumber}
                  value={telefonoNumero}
                  onChange={(e) => setTelefonoNumero(e.target.value)}
                  autoComplete="tel-national"
                />
              </label>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.company.title}
              description={w.steps.company.desc}
            />
            <label className={labelClass}>
              {w.fields.company}
              <input
                className={inputClass}
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                autoComplete="organization"
              />
            </label>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.ruc.title}
              description={w.steps.ruc.desc}
            />
            <label className={labelClass}>
              {w.fields.ruc}
              <input className={inputClass} value={ruc} onChange={(e) => setRuc(e.target.value)} />
            </label>
          </>
        ) : null}

        {step === 6 ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.address.title}
              description={w.steps.address.desc}
            />
            <AfiliacionAddressPaField
              label={w.fields.address}
              value={direccion}
              onChange={setDireccion}
              inputClass={inputClass}
              variant="panama"
              onEntryModeChange={setDireccionEntryMode}
              onStructuredFromApi={(meta) => {
                if (meta.provincia) setProvincia(meta.provincia);
              }}
            />
            <label className={`${labelClass} mt-4`}>
              {w.fields.province}
              <input
                className={inputClass}
                placeholder={w.fields.provincePh}
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
              />
            </label>
          </>
        ) : null}

        {step === 7 ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.business.title}
              description={w.steps.business.desc}
            />
            <div className="grid gap-4">
              <label className={labelClass}>
                {w.fields.mcc}
                <SearchableSelect
                  options={MCC_OPCIONES}
                  value={rubroMcc}
                  onChange={setRubroMcc}
                  inputClass={inputClass}
                  placeholder={w.fields.mccPh}
                  id="afiliacion-rubro-mcc"
                />
              </label>
              <label className={labelClass}>
                {w.fields.description}
                <textarea
                  className={`${inputClass} min-h-[140px] resize-y`}
                  rows={5}
                  placeholder={w.fields.descriptionPh}
                  value={descripcionNegocio}
                  onChange={(e) => setDescripcionNegocio(e.target.value)}
                />
              </label>
            </div>
          </>
        ) : null}

        {step === 8 ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.occupation.title}
              description={w.steps.occupation.desc}
            />
            <label className={labelClass}>
              {w.fields.occupation}
              <SearchableSelect
                options={OCUPACION_OPCIONES}
                value={ocupacionPrincipal}
                onChange={setOcupacionPrincipal}
                inputClass={inputClass}
                placeholder={w.fields.occupationPh}
                id="afiliacion-ocupacion"
              />
            </label>
          </>
        ) : null}

        {step === 9 && !pasoOmiteActividadKyb(servicioPrincipal) ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.activity.title}
              description={w.steps.activity.desc}
            />
            <label className={labelClass}>
              {w.fields.activity}
              <SearchableSelect
                options={ACTIVIDAD_NEGOCIO_OPCIONES}
                value={actividadNegocio}
                onChange={setActividadNegocio}
                inputClass={inputClass}
                placeholder={w.fields.activityPh}
                id="afiliacion-actividad"
              />
            </label>
          </>
        ) : null}

        {step === 10 && esServicioCuotas(servicioPrincipal) ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.cuotasPlan.title}
              description={w.steps.cuotasPlan.desc}
            />
            <CuotasPlanPicker
              termMonths={planCuotasMeses}
              onTermMonthsChange={setPlanCuotasMeses}
              montoReferencia={planCuotasMonto}
              onMontoReferenciaChange={setPlanCuotasMonto}
            />
          </>
        ) : null}

        {step === 10 && servicioRequiereFotosLocal(servicioPrincipal) ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.photos.title}
              description={w.steps.photos.desc}
            />
            <LocalPhotosPicker
              files={fotosLocal}
              onChange={setFotosLocal}
              labels={{
                dropzone: w.steps.photos.dropzone,
                dropzoneActive: w.steps.photos.dropzoneActive,
                browse: w.steps.photos.browse,
                count: t("wizard.steps.photos.count", {
                  count: fotosLocal.length,
                  max: 5,
                }),
                remove: w.steps.photos.remove,
                maxReached: w.steps.photos.maxReached,
              }}
            />
          </>
        ) : null}

        {step === 11 && !pasoOmiteParaServicio(servicioPrincipal, 11) ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.payroll.title}
              description={w.steps.payroll.desc}
            />
            <RadioGroup
              name="nomina"
              value={rangoNominaMensual}
              onChange={setRangoNominaMensual}
              options={RANGO_NOMINA_OPCIONES}
            />
          </>
        ) : null}

        {step === 12 ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.aviso.title}
              description={w.steps.aviso.desc}
            />
            <DocumentFilePicker
              file={avisoOperacion}
              onChange={setAvisoOperacion}
              labels={{
                dropzone: w.steps.aviso.dropzone,
                dropzoneActive: w.steps.aviso.dropzoneActive,
                browse: w.steps.aviso.browse,
                remove: w.steps.aviso.remove,
                formatHint: w.steps.aviso.formatHint,
                invalidType: w.errors.avisoFormat,
              }}
            />
          </>
        ) : null}

        {step === 13 ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.clients.title}
              description={w.steps.clients.desc}
            />
            <RadioGroup
              name="clientes"
              value={numClientes}
              onChange={setNumClientes}
              options={NUM_CLIENTES_OPCIONES}
            />
          </>
        ) : null}

        {step === 14 && !pasoOmiteParaServicio(servicioPrincipal, 14) ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.integration.title}
              description={w.steps.integration.desc}
            />
            <RadioGroup
              name="integracion"
              value={metodoIntegracion}
              onChange={setMetodoIntegracion}
              options={METODO_INTEGRACION_OPCIONES}
            />
          </>
        ) : null}

        {step === 15 ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.terms.title}
              showRequired={false}
            />
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800">
              <input
                type="checkbox"
                checked={terminosAceptados}
                onChange={(e) => setTerminosAceptados(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-[#4749B6]"
              />
              <span>
                {w.termsAgree}{" "}
                <a
                  href="https://puntopago.net/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#4749B6] underline underline-offset-2"
                >
                  {w.termsLink}
                </a>
                .
              </span>
            </label>
          </>
        ) : null}

        {step === 16 ? (
          <>
            <StepHeading
              displayStep={pasoLabel(step)}
              title={w.steps.signature.title}
              description={w.steps.signature.desc}
            />
            <SignaturePad ref={signatureRef} />
            <button
              type="button"
              onClick={() => signatureRef.current?.clear()}
              className="mt-2 text-sm font-medium text-[#4749B6] underline-offset-2 hover:underline"
            >
              {w.clearSignature}
            </button>
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
          disabled={(step === 0 && !startAfterServiceStep) || status === "loading"}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
        >
          {w.back}
        </button>
        {siguientePasoVisible(step, servicioPrincipal, TOTAL_STEPS) !== null ? (
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
            label={w.submit}
            loadingLabel={w.sending}
            onClick={submit}
          />
        )}
      </div>
    </div>
  );
}
