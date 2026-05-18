import {
  ACTIVIDAD_NEGOCIO_OPCIONES,
  INTEGRACION_NO_APLICA_KIOSCOS,
  METODO_INTEGRACION_OPCIONES,
  NOMINA_NO_APLICA_KIOSCOS,
  NUM_CLIENTES_OPCIONES,
  OCUPACION_OPCIONES,
  RANGO_NOMINA_OPCIONES,
  esServicioPrincipalValido,
  pasoOmiteParaServicio,
} from "@/lib/afiliacion-opciones";

export type AfiliacionJson = {
  contactoNombre: string;
  contactoApellido: string;
  email: string;
  telefonoCodigo: string;
  telefonoNumero: string;
  nombreEmpresa: string;
  ruc: string;
  direccion: string;
  provincia: string;
  descripcionNegocio: string;
  /** Id de `SERVICIO_PRINCIPAL_PUNTO_PAGO`. */
  servicioPrincipal: string;
  ocupacionPrincipal: string;
  actividadNegocio: string;
  rangoNominaMensual: string;
  numClientes: string;
  metodoIntegracion: string;
  terminosAceptados: boolean;
};

const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function inList(value: string, list: readonly string[]) {
  return list.includes(value);
}

export function validateAfiliacionJson(
  body: unknown,
): { ok: true; data: AfiliacionJson } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Datos inválidos" };
  }
  const o = body as Record<string, unknown>;

  const str = (k: keyof AfiliacionJson) =>
    typeof o[k] === "string" ? (o[k] as string).trim() : "";

  const servicioPrincipal = str("servicioPrincipal");
  if (!servicioPrincipal) {
    return { ok: false, error: "Indique qué necesita de Punto Pago." };
  }
  if (!esServicioPrincipalValido(servicioPrincipal)) {
    return { ok: false, error: "La opción de servicio no es válida." };
  }

  const data: AfiliacionJson = {
    contactoNombre: str("contactoNombre"),
    contactoApellido: str("contactoApellido"),
    email: str("email").toLowerCase(),
    telefonoCodigo: str("telefonoCodigo"),
    telefonoNumero: str("telefonoNumero"),
    nombreEmpresa: str("nombreEmpresa"),
    ruc: str("ruc"),
    direccion: str("direccion"),
    provincia: str("provincia"),
    descripcionNegocio: str("descripcionNegocio"),
    servicioPrincipal,
    ocupacionPrincipal: str("ocupacionPrincipal"),
    actividadNegocio: str("actividadNegocio"),
    rangoNominaMensual: str("rangoNominaMensual"),
    numClientes: str("numClientes"),
    metodoIntegracion: str("metodoIntegracion"),
    terminosAceptados: o.terminosAceptados === true,
  };

  if (!data.contactoNombre || !data.contactoApellido) {
    return { ok: false, error: "Nombre y apellido son obligatorios" };
  }
  if (!emailOk(data.email)) {
    return { ok: false, error: "Correo electrónico no válido" };
  }
  if (!data.telefonoCodigo || !data.telefonoNumero) {
    return { ok: false, error: "Teléfono incompleto" };
  }
  if (!data.nombreEmpresa) {
    return { ok: false, error: "Nombre de la empresa obligatorio" };
  }
  if (!data.ruc) {
    return { ok: false, error: "RUC obligatorio" };
  }
  if (!data.direccion || !data.provincia) {
    return { ok: false, error: "Dirección y provincia obligatorias" };
  }
  if (!data.descripcionNegocio) {
    return { ok: false, error: "Descripción del negocio obligatoria" };
  }
  if (!inList(data.ocupacionPrincipal, OCUPACION_OPCIONES)) {
    return { ok: false, error: "Ocupación no válida" };
  }
  if (!inList(data.actividadNegocio, ACTIVIDAD_NEGOCIO_OPCIONES)) {
    return { ok: false, error: "Actividad del negocio no válida" };
  }
  const omiteNomina = pasoOmiteParaServicio(servicioPrincipal, 11);
  const omiteIntegracion = pasoOmiteParaServicio(servicioPrincipal, 14);
  if (omiteNomina) {
    data.rangoNominaMensual = NOMINA_NO_APLICA_KIOSCOS;
  } else if (!inList(data.rangoNominaMensual, RANGO_NOMINA_OPCIONES)) {
    return { ok: false, error: "Rango de nómina no válido" };
  }
  if (!inList(data.numClientes, NUM_CLIENTES_OPCIONES)) {
    return { ok: false, error: "Cantidad de clientes no válida" };
  }
  if (omiteIntegracion) {
    data.metodoIntegracion = INTEGRACION_NO_APLICA_KIOSCOS;
  } else if (!inList(data.metodoIntegracion, METODO_INTEGRACION_OPCIONES)) {
    return { ok: false, error: "Método de integración no válido" };
  }
  if (!data.terminosAceptados) {
    return { ok: false, error: "Debe aceptar términos y condiciones" };
  }

  return { ok: true, data };
}
