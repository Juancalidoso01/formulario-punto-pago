/**
 * Prueba el webhook de Slack (mensaje de ejemplo).
 *
 * 1. Añada SLACK_WEBHOOK_URL en .env.local
 * 2. node scripts/verify-slack-webhook.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

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

const url = process.env.SLACK_WEBHOOK_URL?.trim();
if (!url) {
  console.error("Falta SLACK_WEBHOOK_URL en .env.local");
  process.exit(1);
}

const payload = {
  text: "Prueba — Formulario Punto Pago",
  blocks: [
    {
      type: "header",
      text: { type: "plain_text", text: "Prueba de integración Slack", emoji: true },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Si ves este mensaje, el webhook está bien configurado.",
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

console.log("✓ Mensaje de prueba enviado a Slack.");
