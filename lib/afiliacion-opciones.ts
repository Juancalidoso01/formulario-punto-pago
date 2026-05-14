/**
 * Paso 1 del formulario: una sola elección clara (qué necesita el negocio).
 * Textos en lenguaje cotidiano; el id sirve para hoja de cálculo / CRM.
 */

export const SERVICIO_PRINCIPAL_PUNTO_PAGO = [
  {
    id: "pagar-nomina",
    titulo: "Pagar salarios o planilla a sus empleados",
    ayuda: "Depositar la nómina de forma recurrente y llevar mejor control de pagos.",
  },
  {
    id: "cobrar-internet",
    titulo: "Cobrar a sus clientes por internet",
    ayuda: "Desde su página web, un enlace de cobro o enlazando con su sistema actual.",
  },
  {
    id: "cobrar-tienda",
    titulo: "Cobrar en su local (mostrador o tienda)",
    ayuda: "Con terminal o punto de venta físico, tarjeta y otros medios habituales.",
  },
  {
    id: "cuotas-clientes",
    titulo: "Que sus clientes paguen en cuotas sin interés",
    ayuda: "Para que compren más cómodo y usted cobre de forma ordenada.",
  },
  {
    id: "puntos-cercanos",
    titulo: "Que sus clientes paguen en puntos o kioscos cercanos",
    ayuda: "Presencia en la red de puntos Punto Pago para quien prefiere pagar en persona.",
  },
  {
    id: "tarjeta-app-empresa",
    titulo: "Tarjeta o app para gastos del negocio",
    ayuda: "Para su empresa o para que su equipo pague con límites y visibilidad.",
  },
  {
    id: "vender-con-entrega",
    titulo: "Vender en línea con entrega a domicilio",
    ayuda: "Venta y reparto de productos con pagos integrados en el flujo.",
  },
  {
    id: "pagar-facturas",
    titulo: "Pagar facturas de servicios (luz, agua, teléfono, etc.)",
    ayuda: "Para su operación o para ofrecer ese servicio a sus clientes.",
  },
  {
    id: "asesoria",
    titulo: "No está seguro o prefiere que lo orienten",
    ayuda: "Un asesor revisa su caso y le propone la mejor combinación.",
  },
] as const;

export type ServicioPrincipalId = (typeof SERVICIO_PRINCIPAL_PUNTO_PAGO)[number]["id"];

const PRINCIPAL_IDS = new Set<string>(SERVICIO_PRINCIPAL_PUNTO_PAGO.map((s) => s.id));

export function esServicioPrincipalValido(id: string): id is ServicioPrincipalId {
  return PRINCIPAL_IDS.has(id);
}

/** Texto para Google Sheets o Slack (solo título; la ayuda queda en la app). */
export function textoServicioPrincipalParaSheet(id: string): string {
  const s = SERVICIO_PRINCIPAL_PUNTO_PAGO.find((x) => x.id === id);
  if (!s) return id;
  return s.titulo;
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
