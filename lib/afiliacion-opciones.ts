/**
 * Paso 1: una sola línea de negocio (4 focos acordados con comercial).
 */

export const SERVICIO_PRINCIPAL_PUNTO_PAGO = [
  {
    id: "kioscos-local-comercial",
    titulo: "Kioscos para local comercial",
    ayuda: "Kioscos Punto Pago dentro de su comercio.",
  },
  {
    id: "agente-corresponsal-comunidad",
    titulo: "Agente para comunidad",
    ayuda: "Corresponsal Punto Pago en su comunidad: atención y cobros.",
  },
  {
    id: "cuotas-financiamiento-local",
    titulo: "Cuotas en su local",
    ayuda: "Punto Pago financia a sus clientes para que le compren en el local.",
  },
  {
    id: "servicios-corporativos",
    titulo: "Servicios corporativos Punto Pago",
    ayuda: "Botones de recaudo en la red, Hub de pagos, programa de tarjetas.",
  },
] as const;

export type ServicioPrincipalId = (typeof SERVICIO_PRINCIPAL_PUNTO_PAGO)[number]["id"];

const PRINCIPAL_IDS = new Set<string>(SERVICIO_PRINCIPAL_PUNTO_PAGO.map((s) => s.id));

export function esServicioPrincipalValido(id: string): id is ServicioPrincipalId {
  return PRINCIPAL_IDS.has(id);
}

/** Texto para Google Sheets o Slack. */
export function textoServicioPrincipalParaSheet(id: string): string {
  const s = SERVICIO_PRINCIPAL_PUNTO_PAGO.find((x) => x.id === id);
  if (!s) return id;
  return `${s.titulo} — ${s.ayuda}`;
}

/** Opciones de selección (resto del formulario) */

export { PROFESIONES_KYB_OPCIONES as OCUPACION_OPCIONES } from "@/lib/kyb-profesiones";
export { ACTIVIDADES_KYB_OPCIONES as ACTIVIDAD_NEGOCIO_OPCIONES } from "@/lib/kyb-actividades";
export { MCC_OPCIONES } from "@/lib/mcc-opciones";

export const RANGO_NOMINA_OPCIONES = [
  "Menos de USD 5,000",
  "USD 5,000 – USD 10,000",
  "USD 10,001 – USD 25,000",
  "USD 25,001 – USD 50,000",
  "USD 50,001 – USD 100,000",
  "Más de USD 100,000",
  "Prefiero no indicar / aún no definido",
] as const;

export const METODO_INTEGRACION_OPCIONES = [
  "Carga manual desde archivo Excel o CSV",
  "Integración por API (automatizada desde su sistema)",
  "Plataforma web o portal en línea",
  "Integración con software (ej. SAP, QuickBooks, etc.)",
  "Aún no lo sé / necesito asesoría",
] as const;

/** Índices de paso del wizard (`AfiliacionWizard`) omitidos por línea de negocio. */
/** Pasos omitidos: nómina (11) e integración (14). */
const PASOS_OMITIDOS_NOMINA_INTEGRACION = [11, 14] as const;

/** Kioscos y agente: actividad KYB (9) se sustituye por rubro MCC en descripción del local. */
const PASOS_OMITIDOS_LOCAL_COMERCIAL = [9, 11, 14] as const;

const PASOS_OMITIDOS_POR_SERVICIO: Partial<
  Record<ServicioPrincipalId, readonly number[]>
> = {
  "kioscos-local-comercial": PASOS_OMITIDOS_LOCAL_COMERCIAL,
  "agente-corresponsal-comunidad": PASOS_OMITIDOS_LOCAL_COMERCIAL,
  "cuotas-financiamiento-local": PASOS_OMITIDOS_NOMINA_INTEGRACION,
};

export function pasoOmiteActividadKyb(servicio: string): boolean {
  return pasoOmiteParaServicio(servicio, 9);
}

export function esServicioCuotas(id: string): boolean {
  return id === "cuotas-financiamiento-local";
}

export function servicioRequiereFotosLocal(id: string): boolean {
  return esServicioPrincipalValido(id) && !esServicioCuotas(id);
}

export const NOMINA_NO_APLICA_KIOSCOS = "No aplica — kioscos en local comercial";
export const INTEGRACION_NO_APLICA_KIOSCOS =
  "No aplica — kioscos en local comercial";

export const NOMINA_NO_APLICA_AGENTE =
  "No aplica — agente corresponsal en comunidad";
export const INTEGRACION_NO_APLICA_AGENTE =
  "No aplica — agente corresponsal en comunidad";

export const NOMINA_NO_APLICA_CUOTAS = "No aplica — cuotas en local comercial";

export function textoNominaNoAplica(servicio: string): string {
  if (servicio === "agente-corresponsal-comunidad") return NOMINA_NO_APLICA_AGENTE;
  if (servicio === "kioscos-local-comercial") return NOMINA_NO_APLICA_KIOSCOS;
  if (servicio === "cuotas-financiamiento-local") return NOMINA_NO_APLICA_CUOTAS;
  return "";
}

export function textoIntegracionNoAplica(servicio: string): string {
  if (servicio === "agente-corresponsal-comunidad") return INTEGRACION_NO_APLICA_AGENTE;
  if (servicio === "kioscos-local-comercial") return INTEGRACION_NO_APLICA_KIOSCOS;
  return "";
}

export function pasoOmiteParaServicio(servicio: string, stepIndex: number): boolean {
  if (stepIndex === 13) return true;
  if (!esServicioPrincipalValido(servicio)) return false;
  return PASOS_OMITIDOS_POR_SERVICIO[servicio]?.includes(stepIndex) ?? false;
}

export function pasosVisiblesParaServicio(servicio: string, totalSteps: number): number[] {
  return Array.from({ length: totalSteps }, (_, i) => i).filter(
    (i) => !pasoOmiteParaServicio(servicio, i),
  );
}

export function siguientePasoVisible(
  current: number,
  servicio: string,
  totalSteps: number,
): number | null {
  for (let i = current + 1; i < totalSteps; i++) {
    if (!pasoOmiteParaServicio(servicio, i)) return i;
  }
  return null;
}

export function pasoAnteriorVisible(
  current: number,
  servicio: string,
): number | null {
  for (let i = current - 1; i >= 0; i--) {
    if (!pasoOmiteParaServicio(servicio, i)) return i;
  }
  return null;
}

export function numeroPasoVisible(
  stepIndex: number,
  servicio: string,
  totalSteps: number,
): number {
  let n = 0;
  for (let i = 0; i <= stepIndex; i++) {
    if (!pasoOmiteParaServicio(servicio, i)) n++;
  }
  return n;
}
