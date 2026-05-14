import type { ServicioPrincipalId } from "@/lib/afiliacion-opciones";

export type ServicioBrochure = {
  id: ServicioPrincipalId;
  headline: string;
  tagline: string;
  /** Imagen remota (solo si existe en puntopago.net); si no, el layout usa gradiente. */
  heroImage?: { src: string; alt: string };
  highlights: string[];
  /** Página de producto en puntopago.net para “saber más”. */
  officialUrl: string;
  officialLabel: string;
};

/**
 * Folletos comerciales por línea de negocio (captación).
 * Cuotas: https://puntopago.net/products/cuotas/
 * Kioscos en local: https://puntopago.net/business/space/
 */
export const SERVICIO_BROCHURES: Record<ServicioPrincipalId, ServicioBrochure> = {
  "kioscos-local-comercial": {
    id: "kioscos-local-comercial",
    headline: "Aprovecha tu espacio — Kioscos en su local comercial",
    tagline:
      "Destine un pequeño espacio en su comercio o edificio para un quiosco Punto Pago: sus clientes y colaboradores recargan y pagan servicios sin salir del lugar, y usted potencia el flujo de visitas.",
    heroImage: {
      src: "https://puntopago.net/assets/headcap/5@1.5x.jpg",
      alt: "Quiosco y espacio comercial Punto Pago — Business Space",
    },
    highlights: [
      "Recarga y pagos de servicios en pocos metros: Punto Pago indica que con cerca de un metro cuadrado puede instalar un quiosco para que clientes y empleados operen de forma sencilla.",
      "Más afluencia a su negocio: al ubicar un quiosco en oficinas o locales con tráfico, suma conveniencia y puede atraer visitas adicionales además del arriendo del espacio, según el modelo acordado.",
      "Encaje natural en retail, farmacias, centros comerciales, torres de oficinas y negocios con público recurrente.",
    ],
    officialUrl: "https://puntopago.net/business/space/",
    officialLabel: "Página oficial Business Space",
  },
  "agente-corresponsal-comunidad": {
    id: "agente-corresponsal-comunidad",
    headline: "Agente y corresponsal en su comunidad",
    tagline:
      "Sea el punto de atención Punto Pago en su barrio: cobros, consultas y servicios digitales para vecinos y pymes cercanas.",
    highlights: [
      "Perfil para emprendedores y comercios de proximidad con vocación de servicio.",
      "Refuerce la inclusión financiera en su zona con respaldo de marca Punto Pago.",
      "Combine atención presencial con los canales digitales que ya conocen sus clientes.",
    ],
    officialUrl: "https://puntopago.net/products/marketplace/",
    officialLabel: "Ecosistema de servicios (referencia producto)",
  },
  "cuotas-financiamiento-local": {
    id: "cuotas-financiamiento-local",
    headline: "Cuotas en su local — compre hoy, pague después",
    tagline:
      "Financie a sus clientes para que compren en su negocio: cuotas al 0 % sin pago inicial, con aprobación digital y calendario claro de pagos en la app Punto Pago.",
    heroImage: {
      src: "https://puntopago.net/assets/cuotas/cuotas-hero-art@2x.avif",
      alt: "Ilustración del producto Cuotas Punto Pago",
    },
    highlights: [
      "Montos orientativos de compra de USD 10 a USD 250; planes de 2 a 8 meses (según reglas vigentes en la app).",
      "Sin pago inicial al comercio en el momento de la compra; el cliente paga en fechas fijas (p. ej. 2 y 17 de cada mes).",
      "Proceso guiado: QR del vendedor, plan de cuotas, aprobación y firma vía SMS; identidad con cédula o flujo en app.",
      "Si el monto supera el tope de cuotas, puede combinarse el resto en efectivo o tarjeta según condiciones del producto.",
    ],
    officialUrl: "https://puntopago.net/products/cuotas/",
    officialLabel: "Página oficial Cuotas",
  },
  "servicios-corporativos": {
    id: "servicios-corporativos",
    headline: "Soluciones corporativas Punto Pago",
    tagline:
      "Programas para empresas: recaudación en red, hub de pagos y tarjetas físicas, virtuales y líneas asociadas.",
    highlights: [
      "Botones y flujos de recaudo distribuidos en su red comercial o franquicias.",
      "Centralice operación y reporting con visión enterprise.",
      "Explore tarjetas y líneas de crédito asociadas según su segmento y volumen.",
    ],
    officialUrl: "https://puntopago.net/products/bankcards/",
    officialLabel: "Tarjetas y programa corporativo",
  },
};

export function brochureForId(id: string): ServicioBrochure | null {
  return SERVICIO_BROCHURES[id as ServicioPrincipalId] ?? null;
}
