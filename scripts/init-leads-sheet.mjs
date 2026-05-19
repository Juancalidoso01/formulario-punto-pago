/**
 * Crea pestaña «Leads» si falta, escribe cabeceras (20 cols) y actualiza .env.local.
 * Uso: node scripts/init-leads-sheet.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "googleapis";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const HEADERS = [
  "Fecha",
  "Nombre",
  "Apellido",
  "Email",
  "Tel código",
  "Tel número",
  "Empresa",
  "RUC",
  "Dirección",
  "Provincia",
  "Descripción negocio",
  "Servicio principal",
  "Ocupación",
  "Actividad",
  "Rango nómina",
  "Integración / plan Cuotas",
  "Términos",
  "Fotos (Drive)",
  "Aviso archivo",
  "Firma archivo",
];

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("No existe .env.local");
    process.exit(1);
  }
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
    process.env[key] = val;
  }
}

function setEnvLocalRange(range) {
  const envPath = path.join(root, ".env.local");
  let content = fs.readFileSync(envPath, "utf8");
  if (/^GOOGLE_SHEETS_RANGE=/m.test(content)) {
    content = content.replace(/^GOOGLE_SHEETS_RANGE=.*$/m, `GOOGLE_SHEETS_RANGE=${range}`);
  } else {
    content += `\nGOOGLE_SHEETS_RANGE=${range}\n`;
  }
  fs.writeFileSync(envPath, content);
}

loadEnvLocal();

const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();

if (!json || !spreadsheetId) {
  console.error("Faltan GOOGLE_SERVICE_ACCOUNT_JSON o GOOGLE_SHEETS_SPREADSHEET_ID");
  process.exit(1);
}

const credentials = JSON.parse(json);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const TAB = "Leads";
const RANGE = `${TAB}!A:T`;

const meta = await sheets.spreadsheets.get({ spreadsheetId });
const existing = meta.data.sheets ?? [];
let leadsSheet = existing.find((s) => s.properties?.title === TAB);

if (!leadsSheet) {
  console.log(`Creando pestaña «${TAB}»…`);
  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: TAB } } }],
    },
  });
  const newId = res.data.replies?.[0]?.addSheet?.properties?.sheetId;
  console.log("✓ Pestaña creada (sheetId:", newId, ")");
} else {
  console.log(`Pestaña «${TAB}» ya existe.`);
}

await sheets.spreadsheets.values.update({
  spreadsheetId,
  range: `${TAB}!A1:T1`,
  valueInputOption: "USER_ENTERED",
  requestBody: { values: [HEADERS] },
});
console.log("✓ Cabeceras escritas:", HEADERS.join(" | "));

setEnvLocalRange(RANGE);
console.log("✓ .env.local → GOOGLE_SHEETS_RANGE=" + RANGE);
console.log("\nEn Vercel, pon la misma variable: Leads!A:T");
