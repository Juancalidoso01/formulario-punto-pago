"use client";

import { useCallback, useRef, useState } from "react";
import type { AfiliacionJson } from "@/lib/afiliacion-payload";
import {
  ACTIVIDAD_NEGOCIO_OPCIONES,
  METODO_INTEGRACION_OPCIONES,
  NUM_CLIENTES_OPCIONES,
  OCUPACION_OPCIONES,
  RANGO_NOMINA_OPCIONES,
} from "@/lib/afiliacion-opciones";
import { AfiliacionAddressPaField } from "@/components/AfiliacionAddressPaField";
import { ServicioPrincipalPicker } from "@/components/ServicioPrincipalPicker";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";

const TOTAL_STEPS = 17;

const inputClass =
  "w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#4749B6] focus:ring-2 focus:ring-[#4749B6]/20";

const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-slate-800";

function StepHeading({
  step,
  title,
  description,
  showRequired = true,
}: {
  step: number;
  title: string;
  description?: string;
  showRequired?: boolean;
}) {
  return (
    <header className="mb-6">
      <p className="text-sm text-slate-500">
        {step + 1}. {title}
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

export function AfiliacionWizard() {
  const [step, setStep] = useState(0);
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
  const [provincia, setProvincia] = useState("");
  const [descripcionNegocio, setDescripcionNegocio] = useState("");
  const [servicioPrincipal, setServicioPrincipal] = useState("");
  const [ocupacionPrincipal, setOcupacionPrincipal] = useState("");
  const [actividadNegocio, setActividadNegocio] = useState("");
  const [fotosLocal, setFotosLocal] = useState<File[]>([]);
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
      servicioPrincipal,
      ocupacionPrincipal,
      actividadNegocio,
      rangoNominaMensual,
      numClientes,
      metodoIntegracion,
      terminosAceptados,
    };
  }, [
    actividadNegocio,
    contactoApellido,
    contactoNombre,
    descripcionNegocio,
    direccion,
    email,
    metodoIntegracion,
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
          return "Elija la opción que mejor describe lo que más necesita ahora.";
        }
        return null;
      case 1:
        if (!contactoNombre.trim() || !contactoApellido.trim()) {
          return "Indique nombre y apellido del contacto principal.";
        }
        return null;
      case 2:
        if (!email.trim()) return "Indique el correo electrónico.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          return "El correo electrónico no tiene un formato válido.";
        }
        return null;
      case 3:
        if (!telefonoCodigo.trim() || !telefonoNumero.trim()) {
          return "Indique el código de país y el número de contacto.";
        }
        return null;
      case 4:
        if (!nombreEmpresa.trim()) return "Indique el nombre de la empresa.";
        return null;
      case 5:
        if (!ruc.trim()) return "Indique el número de RUC.";
        return null;
      case 6:
        if (!direccion.trim() || !provincia.trim()) {
          return "Indique dirección y provincia.";
        }
        return null;
      case 7:
        if (!descripcionNegocio.trim()) {
          return "Describa brevemente su negocio.";
        }
        return null;
      case 8:
        if (!ocupacionPrincipal) return "Seleccione su ocupación principal.";
        return null;
      case 9:
        if (!actividadNegocio) return "Seleccione la actividad de su negocio.";
        return null;
      case 10:
        if (fotosLocal.length < 1 || fotosLocal.length > 5) {
          return "Adjunte entre 1 y 5 fotos de su local comercial.";
        }
        return null;
      case 11:
        if (!rangoNominaMensual) return "Seleccione un rango aproximado.";
        return null;
      case 12:
        if (!avisoOperacion) return "Adjunte copia del aviso de operación.";
        return null;
      case 13:
        if (!numClientes) return "Seleccione la cantidad de clientes.";
        return null;
      case 14:
        if (!metodoIntegracion) return "Seleccione el método de integración.";
        return null;
      case 15:
        if (!terminosAceptados) return "Debe aceptar los términos y condiciones.";
        return null;
      case 16:
        if (signatureRef.current?.isEmpty()) {
          return "Favor firmar en el recuadro antes de enviar.";
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
    direccion,
    email,
    fotosLocal.length,
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
  ]);

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
    if (step > 0) setStep((s) => s - 1);
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
    for (const f of fotosLocal) {
      fd.append("fotos", f);
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
        setStatusMsg(data.error ?? "No se pudo enviar. Intenta de nuevo.");
        return;
      }

      setStatus("success");
      setStatusMsg("Hemos recibido tu solicitud. Gracias por completar el formulario.");
    } catch {
      setStatus("error");
      setStatusMsg("Error de red. Comprueba tu conexión e intenta de nuevo.");
    }
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

      <div className="min-h-[280px]">
        {step === 0 ? (
          <>
            <StepHeading
              step={step}
              title="¿Qué línea de negocio le interesa?"
              description="Elija una de las cuatro opciones. Si combina varias, marque la principal y detalle el resto más adelante en la descripción de su negocio."
            />
            <ServicioPrincipalPicker
              value={servicioPrincipal}
              onChange={setServicioPrincipal}
            />
            <p className="mt-4 text-xs text-slate-500">
              Puede cambiar de opción en cualquier momento antes de enviar el formulario.
            </p>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <StepHeading
              step={step}
              title="Nombre completo del contacto principal"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Nombre
                <input
                  className={inputClass}
                  placeholder="Nombre"
                  value={contactoNombre}
                  onChange={(e) => setContactoNombre(e.target.value)}
                  autoComplete="given-name"
                />
              </label>
              <label className={labelClass}>
                Apellido
                <input
                  className={inputClass}
                  placeholder="Apellido"
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
            <StepHeading
              step={step}
              title="Correo electrónico del contacto principal"
            />
            <label className={labelClass}>
              Correo electrónico
              <input
                className={inputClass}
                type="email"
                placeholder="Correo electrónico"
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
              step={step}
              title="Número de teléfono del contacto principal"
              description="Incluya el código de país seguido de su número de contacto."
            />
            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <label className={labelClass}>
                Código
                <input
                  className={inputClass}
                  placeholder="+507"
                  value={telefonoCodigo}
                  onChange={(e) => setTelefonoCodigo(e.target.value)}
                  autoComplete="tel-country-code"
                />
              </label>
              <label className={labelClass}>
                Número de contacto
                <input
                  className={inputClass}
                  placeholder="Número de contacto"
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
              step={step}
              title="Nombre de la empresa (según registro)"
              description="Nombre legal registrado o en tu aviso de operaciones, o bien tu nombre legal."
            />
            <label className={labelClass}>
              Razón social / nombre legal
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
              step={step}
              title="Número de RUC (registro único de contribuyente)"
              description="Número otorgado por la DGI para identificar personas o empresas con actividad económica en Panamá."
            />
            <label className={labelClass}>
              RUC
              <input className={inputClass} value={ruc} onChange={(e) => setRuc(e.target.value)} />
            </label>
          </>
        ) : null}

        {step === 6 ? (
          <>
            <StepHeading
              step={step}
              title="Dónde está ubicado su negocio"
              description="Escriba y elija una dirección sugerida (verificación con lista local y Geoapify). Al elegir, completamos provincia o región cuando el servicio la reconoce; si no, indíquela en el segundo campo."
            />
            <AfiliacionAddressPaField
              label="Dirección comercial"
              value={direccion}
              onChange={setDireccion}
              inputClass={inputClass}
              variant="panama"
              onStructuredFromApi={(meta) => {
                if (meta.provincia) setProvincia(meta.provincia);
              }}
            />
            <label className={`${labelClass} mt-4`}>
              Provincia o región
              <input
                className={inputClass}
                placeholder="Provincia (se puede autocompletar al elegir sugerencia)"
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
              />
            </label>
          </>
        ) : null}

        {step === 7 ? (
          <>
            <StepHeading
              step={step}
              title="Breve descripción del negocio (productos/servicios ofrecidos)"
              description="Favor describe con mayor detalle lo que hace tu negocio o empresa."
            />
            <label className={labelClass}>
              Descripción
              <textarea
                className={`${inputClass} min-h-[140px] resize-y`}
                rows={5}
                value={descripcionNegocio}
                onChange={(e) => setDescripcionNegocio(e.target.value)}
              />
            </label>
          </>
        ) : null}

        {step === 8 ? (
          <>
            <StepHeading
              step={step}
              title="Cuál es su ocupación principal"
              description="Describa la opción más acertada a su ocupación."
            />
            <label className={labelClass}>
              Selección
              <select
                className={inputClass}
                value={ocupacionPrincipal}
                onChange={(e) => setOcupacionPrincipal(e.target.value)}
                required
              >
                <option value="" disabled>
                  Seleccione una opción
                </option>
                {OCUPACION_OPCIONES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {step === 9 ? (
          <>
            <StepHeading
              step={step}
              title="Cuál es la actividad que más describe su negocio"
              description="Seleccione la opción que más se identifica."
            />
            <label className={labelClass}>
              Selección
              <select
                className={inputClass}
                value={actividadNegocio}
                onChange={(e) => setActividadNegocio(e.target.value)}
                required
              >
                <option value="" disabled>
                  Seleccione una opción
                </option>
                {ACTIVIDAD_NEGOCIO_OPCIONES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {step === 10 ? (
          <>
            <StepHeading
              step={step}
              title="Cargue 5 fotos de su local comercial"
              description="Incluya fotos de distintos ángulos de su local comercial. Puedes adjuntar entre 1 y 5 archivos."
            />
            <input
              type="file"
              accept="image/*"
              multiple
              className="text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#4749B6] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#3B3DA6]"
              onChange={(e) => {
                const list = e.target.files ? Array.from(e.target.files) : [];
                setFotosLocal(list.slice(0, 5));
              }}
            />
            {fotosLocal.length > 0 ? (
              <ul className="mt-3 list-inside list-disc text-sm text-slate-600">
                {fotosLocal.map((f) => (
                  <li key={f.name + f.size}>{f.name}</li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}

        {step === 11 ? (
          <>
            <StepHeading
              step={step}
              title="¿Cuánto planea pagar mensualmente a través del programa de nómina?"
              description="Seleccione un rango aproximado del monto total que desea depositar mensualmente a sus colaboradores."
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
            <StepHeading step={step} title="Copia del aviso de operación" />
            <input
              type="file"
              accept=".pdf,image/*"
              className="text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#4749B6] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#3B3DA6]"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setAvisoOperacion(f ?? null);
              }}
            />
            {avisoOperacion ? (
              <p className="mt-2 text-sm text-slate-600">Seleccionado: {avisoOperacion.name}</p>
            ) : null}
          </>
        ) : null}

        {step === 13 ? (
          <>
            <StepHeading
              step={step}
              title="¿Cuántos clientes tiene su empresa?"
              description="Seleccione la cantidad de clientes acorde a su empresa."
            />
            <RadioGroup
              name="clientes"
              value={numClientes}
              onChange={setNumClientes}
              options={NUM_CLIENTES_OPCIONES}
            />
          </>
        ) : null}

        {step === 14 ? (
          <>
            <StepHeading
              step={step}
              title="¿Cuál es el método de integración que mejor se ajusta a su negocio?"
              description="Seleccione la opción que describe cómo le gustaría conectarse con nuestros servicios."
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
              step={step}
              title="Términos y condiciones"
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
                Estoy de acuerdo con los{" "}
                <a
                  href="https://puntopago.net/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#4749B6] underline underline-offset-2"
                >
                  términos y condiciones
                </a>
                .
              </span>
            </label>
          </>
        ) : null}

        {step === 16 ? (
          <>
            <StepHeading
              step={step}
              title="Firma"
              description="Favor firmar el formulario."
            />
            <SignaturePad ref={signatureRef} />
            <button
              type="button"
              onClick={() => signatureRef.current?.clear()}
              className="mt-2 text-sm font-medium text-[#4749B6] underline-offset-2 hover:underline"
            >
              Limpiar firma
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
          disabled={step === 0 || status === "loading"}
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
            {status === "loading" ? "Enviando…" : "Enviar formulario"}
          </button>
        )}
      </div>
    </div>
  );
}
