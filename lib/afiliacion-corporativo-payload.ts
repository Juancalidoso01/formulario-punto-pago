import { esServicioPrincipalValido } from "@/lib/afiliacion-opciones";

export const SERVICIO_CORPORATIVO_ID = "servicios-corporativos" as const;

export type AfiliacionCorporativoJson = {
  servicioPrincipal: typeof SERVICIO_CORPORATIVO_ID;
  contactoNombre: string;
  contactoApellido: string;
  email: string;
  cargo: string;
  telefonoFijoCodigo: string;
  telefonoFijoNumero: string;
  telefonoCelCodigo: string;
  telefonoCelNumero: string;
  terminosAceptados: boolean;
};

const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export function esFormularioCorporativo(servicio: string): boolean {
  return servicio === SERVICIO_CORPORATIVO_ID;
}

/** Celular tiene prioridad; si no, teléfono fijo (formulario anterior). */
export function telefonoPrincipalCorporativo(data: AfiliacionCorporativoJson): {
  codigo: string;
  numero: string;
} {
  const cel = data.telefonoCelNumero.trim();
  if (cel) {
    return {
      codigo: data.telefonoCelCodigo.trim() || "+507",
      numero: cel,
    };
  }
  const fijo = data.telefonoFijoNumero.trim();
  if (fijo) {
    return {
      codigo: data.telefonoFijoCodigo.trim() || "+507",
      numero: fijo,
    };
  }
  return { codigo: "", numero: "" };
}

export function validateAfiliacionCorporativoJson(
  body: unknown,
): { ok: true; data: AfiliacionCorporativoJson } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Datos inválidos" };
  }
  const o = body as Record<string, unknown>;

  const str = (k: string) => (typeof o[k] === "string" ? (o[k] as string).trim() : "");

  const servicioPrincipal = str("servicioPrincipal");
  if (servicioPrincipal !== SERVICIO_CORPORATIVO_ID) {
    return { ok: false, error: "Servicio no válido para formulario corporativo." };
  }
  if (!esServicioPrincipalValido(servicioPrincipal)) {
    return { ok: false, error: "La opción de servicio no es válida." };
  }

  const data: AfiliacionCorporativoJson = {
    servicioPrincipal: SERVICIO_CORPORATIVO_ID,
    contactoNombre: str("contactoNombre"),
    contactoApellido: str("contactoApellido"),
    email: str("email").toLowerCase(),
    cargo: str("cargo"),
    telefonoFijoCodigo: str("telefonoFijoCodigo"),
    telefonoFijoNumero: str("telefonoFijoNumero"),
    telefonoCelCodigo: str("telefonoCelCodigo"),
    telefonoCelNumero: str("telefonoCelNumero"),
    terminosAceptados: o.terminosAceptados === true,
  };

  if (!data.contactoNombre || !data.contactoApellido) {
    return { ok: false, error: "Indique nombre y apellido del contacto." };
  }
  if (!emailOk(data.email)) {
    return { ok: false, error: "Correo electrónico no válido" };
  }
  if (!data.cargo) {
    return { ok: false, error: "Indique el cargo de la persona de contacto." };
  }
  const tel = telefonoPrincipalCorporativo(data);
  if (tel.numero === "") {
    return { ok: false, error: "Indique el código de país y el número de contacto." };
  }
  if (!data.terminosAceptados) {
    return { ok: false, error: "Debe aceptar términos y condiciones" };
  }

  return { ok: true, data };
}

