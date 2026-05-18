import type { ServicioPrincipalId } from "@/lib/afiliacion-opciones";

export type BrochureOfficialLink = {
  href: string;
  label: string;
  /** Si se omite, la UI usa el subtítulo genérico de puntopago.net. */
  linkSub?: string;
};

export type ServicioBrochure = {
  id: ServicioPrincipalId;
  headline: string;
  tagline: string;
  /** Hero: URL absoluta remota o ruta bajo `/public` (p. ej. `/brochures/...`). */
  heroImage?: { src: string; alt: string };
  /** Si existe, sustituye la imagen del hero (bloque solo texto, p. ej. agentes). */
  heroTextBanner?: { lead: string; rest: string };
  highlights: string[];
  /** Enlaces oficiales en puntopago.net (uno o varios). */
  officialLinks: BrochureOfficialLink[];
};

/**
 * Contenidos comerciales por línea de negocio (captación).
 * Cuotas: https://comercios.puntopago.net/
 * Kioscos: https://puntopago.net/business/space/
 * Agente: imagen `public/brochures/agentes-corresponsal.png` (sin página pública aún).
 * Corporativo: https://puntopago.net/business/checkout/ y …/paymentshub/
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
    officialLinks: [
      {
        href: "https://puntopago.net/business/space/",
        label: "Ver página oficial: Kioscos",
      },
    ],
  },
  "agente-corresponsal-comunidad": {
    id: "agente-corresponsal-comunidad",
    headline: "Agente y corresponsal — Punto Pago en su comunidad",
    tagline:
      "Operación flexible como corresponsal en su comunidad: cobros y servicios con respaldo de marca Punto Pago, desde su comercio o con los medios que tenga a mano.",
    heroImage: {
      src: "/brochures/agentes-corresponsal.png",
      alt: "Ilustración La Bodeguita — Punto Pago corresponsal no bancario, mapa y pin de ubicación",
    },
    highlights: [
      "No importa si está en su isla o en su barriada: con computadora o teléfono puede cobrar a sus clientes; y desde un comercio puede operar como corresponsal no bancario con respaldo Punto Pago.",
      "Modelo pensado para quienes atienden en su comunidad y quieren ofrecer recargas, pagos y servicios con una marca reconocida.",
      "Ideal para comercios de barrio, colmados y emprendedores con vocación de servicio local.",
    ],
    officialLinks: [],
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
    officialLinks: [
      {
        href: "https://comercios.puntopago.net/",
        label: "Ver portal Comercios: Cuotas",
        linkSub: "Abre comercios.puntopago.net en una nueva pestaña",
      },
    ],
  },
  "servicios-corporativos": {
    id: "servicios-corporativos",
    headline: "Soluciones corporativas — recaudo masivo y procesamiento de pagos",
    tagline:
      "Pensado para bancos, financieras, fintech y grandes operadores: combine checkout integrado por API con un hub de pagos que conecta comercios, canales digitales y tesorería para recaudación y liquidez a escala.",
    heroImage: {
      src: "https://puntopago.net/assets/headcap/2@1.5x.jpg",
      alt: "Solución checkout y pagos corporativos Punto Pago",
    },
    highlights: [
      "Business Checkout: integración vía API para modelar procesos, automatizar operaciones y enlazar áreas de negocio con menos fricción y costo operativo (según su arquitectura y acuerdo comercial).",
      "Payments Hub: interconexión de comercios para banca en línea y fintech, con foco en centralización de pagos, gestión de liquidez, automatización a proveedores y cartera amplia de transacciones.",
      "Alineado a entidades financieras y pymes de alto volumen que requieren estandarizar, centralizar y administrar el flujo de pagos electrónicos.",
    ],
    officialLinks: [
      {
        href: "https://puntopago.net/business/checkout/",
        label: "Ver página oficial: Checkout",
      },
      {
        href: "https://puntopago.net/business/paymentshub/",
        label: "Ver página oficial: Payments Hub",
      },
    ],
  },
};

export function brochureForId(id: string): ServicioBrochure | null {
  return SERVICIO_BROCHURES[id as ServicioPrincipalId] ?? null;
}
