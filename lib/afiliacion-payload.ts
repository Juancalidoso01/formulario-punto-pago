import {
  ACTIVIDAD_NEGOCIO_OPCIONES,
  METODO_INTEGRACION_OPCIONES,
  esServicioCuotas,
  textoIntegracionNoAplica,
  textoNominaNoAplica,
  NUM_CLIENTES_OPCIONES,
  OCUPACION_OPCIONES,
  RANGO_NOMINA_OPCIONES,
  esServicioPrincipalValido,
  pasoOmiteParaServicio,
} from "@/lib/afiliacion-opciones";
import {
  CUOTAS_MIN_AMOUNT,
  CUOTAS_TERM_CONFIG,
  calcularPagoRegularCuotas,
  esCuotasTermValido,
  normalizeCuotasAmount,
  textoPlanCuotasParaSheet,
  type CuotasTermMonths,
} from "@/lib/cuotas-calculator";

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
  /** Solo cuotas: plan elegido (2, 4 u 8 meses). */
  planCuotasMeses?: CuotasTermMonths;
  planCuotasMontoReferencia?: number;
  planCuotasPagoRegular?: number;
  planCuotasCantidadPagos?: number;
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

  const planMesesRaw = o.planCuotasMeses;
  const planCuotasMeses =
    typeof planMesesRaw === "number" && esCuotasTermValido(planMesesRaw)
      ? planMesesRaw
      : undefined;
  const planMontoRaw = o.planCuotasMontoReferencia;
  const planCuotasMontoReferencia =
    typeof planMontoRaw === "number" && Number.isFinite(planMontoRaw)
      ? planMontoRaw
      : undefined;

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
    planCuotasMeses,
    planCuotasMontoReferencia,
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
    return { ok: false, error: "Profesión u ocupación no válida" };
  }
  if (!inList(data.actividadNegocio, ACTIVIDAD_NEGOCIO_OPCIONES)) {
    return { ok: false, error: "Actividad económica no válida" };
  }
  const omiteNomina = pasoOmiteParaServicio(servicioPrincipal, 11);
  const omiteIntegracion = pasoOmiteParaServicio(servicioPrincipal, 14);
  if (omiteNomina) {
    data.rangoNominaMensual = textoNominaNoAplica(servicioPrincipal);
  } else if (!inList(data.rangoNominaMensual, RANGO_NOMINA_OPCIONES)) {
    return { ok: false, error: "Rango de nómina no válido" };
  }
  if (!inList(data.numClientes, NUM_CLIENTES_OPCIONES)) {
    return { ok: false, error: "Cantidad de clientes no válida" };
  }
  if (esServicioCuotas(servicioPrincipal)) {
    if (!planCuotasMeses) {
      return { ok: false, error: "Seleccione el plan de cuotas que le interesa ofrecer." };
    }
    const cfg = CUOTAS_TERM_CONFIG[planCuotasMeses];
    const monto = normalizeCuotasAmount(
      planCuotasMontoReferencia ?? CUOTAS_MIN_AMOUNT,
      cfg.maxAmount,
    );
    if (monto < CUOTAS_MIN_AMOUNT) {
      return { ok: false, error: "El monto de referencia debe ser al menos $10." };
    }
    data.planCuotasMontoReferencia = monto;
    data.planCuotasPagoRegular = calcularPagoRegularCuotas(monto, planCuotasMeses);
    data.planCuotasCantidadPagos = cfg.payments;
    data.metodoIntegracion = textoPlanCuotasParaSheet(planCuotasMeses, monto);
  } else if (omiteIntegracion) {
    data.metodoIntegracion = textoIntegracionNoAplica(servicioPrincipal);
  } else if (!inList(data.metodoIntegracion, METODO_INTEGRACION_OPCIONES)) {
    return { ok: false, error: "Método de integración no válido" };
  }
  if (!data.terminosAceptados) {
    return { ok: false, error: "Debe aceptar términos y condiciones" };
  }

  return { ok: true, data };
}
