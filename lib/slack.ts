import type { AfiliacionCorporativoJson } from "@/lib/afiliacion-corporativo-payload";
import type { AfiliacionJson } from "@/lib/afiliacion-payload";
import { esServicioCuotas, textoServicioPrincipalParaSheet } from "@/lib/afiliacion-opciones";
import { CUOTAS_TERM_CONFIG, formatCuotasMoney } from "@/lib/cuotas-calculator";

type SlackBlock =
  | {
      type: "header";
      text: { type: "plain_text"; text: string; emoji?: boolean };
    }
  | {
      type: "section";
      text?: { type: "mrkdwn"; text: string };
      fields?: { type: "mrkdwn"; text: string }[];
    }
  | { type: "divider" };

type SlackPayload = {
  text: string;
  blocks: SlackBlock[];
};

function webhookUrl(): string | null {
  const url = process.env.SLACK_WEBHOOK_URL?.trim();
  return url || null;
}

function field(label: string, value: string): { type: "mrkdwn"; text: string } {
  const v = value.trim() || "—";
  return { type: "mrkdwn", text: `*${label}*\n${v}` };
}

function formatSubmittedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-PA", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Panama",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function phone(codigo: string, numero: string): string {
  const n = numero.trim();
  if (!n) return "—";
  return `${codigo.trim()} ${n}`.trim();
}

async function postToSlack(payload: SlackPayload): Promise<void> {
  const url = webhookUrl();
  if (!url) return;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Slack webhook respondió ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }
}

function planCuotasLine(data: AfiliacionJson): string | null {
  if (!esServicioCuotas(data.servicioPrincipal) || !data.planCuotasMeses) return null;
  const cfg = CUOTAS_TERM_CONFIG[data.planCuotasMeses];
  const monto = data.planCuotasMontoReferencia ?? 0;
  const pago =
    data.planCuotasPagoRegular != null
      ? formatCuotasMoney(data.planCuotasPagoRegular)
      : "—";
  return `${cfg.label} · ref. ${formatCuotasMoney(monto)} · ${data.planCuotasCantidadPagos ?? cfg.payments} pagos de ${pago}`;
}

export async function notifyAfiliacionLeadToSlack(
  data: AfiliacionJson,
  opts: {
    submittedAtIso: string;
    fotoNames: string;
    avisoFileName: string;
    firmaFileName: string;
  },
): Promise<void> {
  const servicio = textoServicioPrincipalParaSheet(data.servicioPrincipal);
  const plan = planCuotasLine(data);

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "Nuevo lead — Formulario de afiliación", emoji: true },
    },
    {
      type: "section",
      fields: [
        field("Fecha", formatSubmittedAt(opts.submittedAtIso)),
        field("Servicio", servicio),
      ],
    },
    { type: "divider" },
    {
      type: "section",
      fields: [
        field("Nombre", `${data.contactoNombre} ${data.contactoApellido}`.trim()),
        field("Correo", data.email),
        field("Teléfono", phone(data.telefonoCodigo, data.telefonoNumero)),
      ],
    },
    {
      type: "section",
      fields: [
        field("Empresa", data.nombreEmpresa),
        field("RUC", data.ruc),
        field("Provincia", data.provincia),
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Dirección*\n${data.direccion.trim() || "—"}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Descripción del negocio*\n${data.descripcionNegocio.trim() || "—"}`,
      },
    },
    { type: "divider" },
    {
      type: "section",
      fields: [
        field("Ocupación", data.ocupacionPrincipal),
        field("Actividad", data.actividadNegocio),
        field("Nº clientes", data.numClientes),
      ],
    },
  ];

  if (!esServicioCuotas(data.servicioPrincipal)) {
    blocks.push({
      type: "section",
      fields: [
        field("Nómina", data.rangoNominaMensual),
        field("Integración", data.metodoIntegracion),
      ],
    });
  } else if (plan) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*Plan Cuotas (referencia)*\n${plan}` },
    });
  } else {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*Plan Cuotas*\n${data.metodoIntegracion}` },
    });
  }

  blocks.push(
    { type: "divider" },
    {
      type: "section",
      fields: [
        field("Fotos", opts.fotoNames),
        field("Aviso", opts.avisoFileName),
        field("Firma", opts.firmaFileName),
      ],
    },
  );

  await postToSlack({
    text: `Nuevo lead: ${data.contactoNombre} ${data.contactoApellido} — ${servicio}`,
    blocks,
  });
}

export async function notifyCorporativoLeadToSlack(
  data: AfiliacionCorporativoJson,
  submittedAtIso: string,
): Promise<void> {
  const servicio = textoServicioPrincipalParaSheet(data.servicioPrincipal);
  const fijo = phone(data.telefonoFijoCodigo, data.telefonoFijoNumero);
  const cel = phone(data.telefonoCelCodigo, data.telefonoCelNumero);

  await postToSlack({
    text: `Nuevo contacto corporativo: ${data.contactoNombre} ${data.contactoApellido}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "Nuevo lead — Contacto corporativo", emoji: true },
      },
      {
        type: "section",
        fields: [
          field("Fecha", formatSubmittedAt(submittedAtIso)),
          field("Servicio", servicio),
        ],
      },
      { type: "divider" },
      {
        type: "section",
        fields: [
          field("Nombre", `${data.contactoNombre} ${data.contactoApellido}`.trim()),
          field("Correo", data.email),
          field("Cargo", data.cargo),
        ],
      },
      {
        type: "section",
        fields: [field("Celular", cel), field("Teléfono fijo", fijo)],
      },
    ],
  });
}

/** No lanza al cliente; solo registra en servidor si Slack falla. */
export async function notifyLeadToSlackSafe(
  fn: () => Promise<void>,
): Promise<void> {
  try {
    await fn();
  } catch (e) {
    console.error("[leads] slack notify error", e);
  }
}

export function isSlackConfigured(): boolean {
  return !!webhookUrl();
}
