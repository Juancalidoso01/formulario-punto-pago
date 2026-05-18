import type { ServicioPrincipalId } from "@/lib/afiliacion-opciones";
import type { Messages } from "@/lib/i18n/messages/es";
import type { ServicioBrochure } from "@/lib/servicio-brochures";

const BROCHURE_KEYS: Record<
  ServicioPrincipalId,
  keyof Messages["brochures"]
> = {
  "kioscos-local-comercial": "kioscos",
  "agente-corresponsal-comunidad": "agente",
  "cuotas-financiamiento-local": "cuotas",
  "servicios-corporativos": "corporativo",
};

const HERO_IMAGES: Record<
  ServicioPrincipalId,
  { src: string } | undefined
> = {
  "kioscos-local-comercial": {
    src: "https://puntopago.net/assets/headcap/5@1.5x.jpg",
  },
  "agente-corresponsal-comunidad": {
    src: "/brochures/agentes-corresponsal.png",
  },
  "cuotas-financiamiento-local": {
    src: "https://puntopago.net/assets/cuotas/cuotas-hero-art@2x.avif",
  },
  "servicios-corporativos": {
    src: "https://puntopago.net/assets/headcap/2@1.5x.jpg",
  },
};

const OFFICIAL_LINKS: Record<
  ServicioPrincipalId,
  { href: string; labelKey: string }[]
> = {
  "kioscos-local-comercial": [
    {
      href: "https://puntopago.net/business/space/",
      labelKey: "linkBusinessSpace",
    },
  ],
  "agente-corresponsal-comunidad": [],
  "cuotas-financiamiento-local": [
    {
      href: "https://puntopago.net/products/cuotas/",
      labelKey: "linkOfficial",
    },
  ],
  "servicios-corporativos": [
    {
      href: "https://puntopago.net/business/checkout/",
      labelKey: "linkCheckout",
    },
    {
      href: "https://puntopago.net/business/paymentshub/",
      labelKey: "linkHub",
    },
  ],
};

export function brochureFromMessages(
  messages: Messages,
  id: ServicioPrincipalId,
): ServicioBrochure {
  const key = BROCHURE_KEYS[id];
  const b = messages.brochures[key];
  const hero = HERO_IMAGES[id];

  const highlights = [b.h1, b.h2, b.h3];
  if ("h4" in b && b.h4) highlights.push(b.h4);

  const links = OFFICIAL_LINKS[id].map((l) => ({
    href: l.href,
    label: (b as Record<string, string>)[l.labelKey],
  }));

  return {
    id,
    headline: b.headline,
    tagline: b.tagline,
    heroImage: hero
      ? { src: hero.src, alt: b.alt }
      : undefined,
    highlights,
    officialLinks: links,
  };
}

export function allBrochuresFromMessages(
  messages: Messages,
): Record<ServicioPrincipalId, ServicioBrochure> {
  return {
    "kioscos-local-comercial": brochureFromMessages(messages, "kioscos-local-comercial"),
    "agente-corresponsal-comunidad": brochureFromMessages(
      messages,
      "agente-corresponsal-comunidad",
    ),
    "cuotas-financiamiento-local": brochureFromMessages(
      messages,
      "cuotas-financiamiento-local",
    ),
    "servicios-corporativos": brochureFromMessages(messages, "servicios-corporativos"),
  };
}
