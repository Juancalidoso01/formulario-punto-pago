import type { ServicioPrincipalId } from "@/lib/afiliacion-opciones";
import type { Messages } from "@/lib/i18n/messages/es";

const SERVICE_KEYS: Record<ServicioPrincipalId, keyof Messages["services"]> = {
  "kioscos-local-comercial": "kioscos",
  "agente-corresponsal-comunidad": "agente",
  "cuotas-financiamiento-local": "cuotas",
  "servicios-corporativos": "corporativo",
};

export function servicesFromMessages(messages: Messages) {
  const ids = Object.keys(SERVICE_KEYS) as ServicioPrincipalId[];
  return ids.map((id) => {
    const key = SERVICE_KEYS[id];
    const s = messages.services[key];
    return { id, titulo: s.title, ayuda: s.help };
  });
}
