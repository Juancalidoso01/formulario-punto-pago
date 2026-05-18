/**
 * Prueba el webhook de Slack (mensaje de ejemplo).
 *
 * 1. Añada en .env.local:
 *    SLACK_WEBHOOK_URL=...           (canal general)
 *    SLACK_WEBHOOK_URL_CUOTAS=...    (grupo Cuotas)
 * 2. npm run slack:verify
 * 3. npm run slack:verify:cuotas
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");
const forCuotas = process.argv.includes("--cuotas");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const url = forCuotas
  ? process.env.SLACK_WEBHOOK_URL_CUOTAS?.trim() ||
    process.env.SLACK_WEBHOOK_URL?.trim()
  : process.env.SLACK_WEBHOOK_URL?.trim();

if (!url) {
  console.error(
    forCuotas
      ? "Falta SLACK_WEBHOOK_URL_CUOTAS (o SLACK_WEBHOOK_URL) en .env.local"
      : "Falta SLACK_WEBHOOK_URL en .env.local",
  );
  process.exit(1);
}

const payload = forCuotas
  ? {
      text: "Prueba — Cuotas Punto Pago",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "Prueba — Canal Cuotas",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Webhook de *Cuotas* OK. Los leads de «Cuotas en su local» llegarán a este canal.",
          },
        },
      ],
    }
  : {
      text: "Prueba — Formulario Punto Pago",
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "Prueba — Canal general", emoji: true },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Webhook general OK (kioscos, agente, corporativo).",
          },
        },
      ],
    };

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  console.error("Error", res.status, await res.text());
  process.exit(1);
}

console.log(
  forCuotas
    ? "✓ Mensaje de prueba enviado al canal de Cuotas."
    : "✓ Mensaje de prueba enviado al canal general.",
);
