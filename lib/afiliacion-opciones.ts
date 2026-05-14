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

export const OCUPACION_OPCIONES = [
  "Dueño o fundador",
  "Gerente general",
  "Gerente administrativo o financiero",
  "Contador",
  "Recursos humanos",
  "Operaciones",
  "Otro",
] as const;

export const ACTIVIDAD_NEGOCIO_OPCIONES = [
  "Comercio al por menor",
  "Restaurantes y entretenimiento",
  "Servicios profesionales",
  "Industria y manufactura",
  "Salud",
  "Educación",
  "Tecnología",
  "Construcción",
  "Logística y transporte",
  "Servicios financieros o afines",
  "Otro",
] as const;

export const RANGO_NOMINA_OPCIONES = [
  "Menos de USD 5,000",
  "USD 5,000 – USD 10,000",
  "USD 10,001 – USD 25,000",
  "USD 25,001 – USD 50,000",
  "USD 50,001 – USD 100,000",
  "Más de USD 100,000",
  "Prefiero no indicar / aún no definido",
] as const;

export const NUM_CLIENTES_OPCIONES = [
  "0 a 100",
  "101 a 500",
  "501 a 1,000",
  "1,001 a 5,000",
  "5,001 a 10,000",
  "Más de 10,000",
] as const;

export const METODO_INTEGRACION_OPCIONES = [
  "Carga manual desde archivo Excel o CSV",
  "Integración por API (automatizada desde su sistema)",
  "Plataforma web o portal en línea",
  "Integración con software (ej. SAP, QuickBooks, etc.)",
  "Aún no lo sé / necesito asesoría",
] as const;
