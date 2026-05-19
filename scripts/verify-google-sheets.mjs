/**
 * Verifica conexión con Google Sheets y opcionalmente escribe cabeceras.
 *
 * 1. Copia .env.example → .env.local y completa las variables Google.
 * 2. Comparte la hoja con el client_email de la cuenta de servicio (Editor).
 * 3. node scripts/verify-google-sheets.mjs
 * 4. node scripts/verify-google-sheets.mjs --init-headers
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
    console.error("No existe .env.local. Copia .env.example y completa las variables.");
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
    if (!process.env[key]) process.env[key] = val;
  }
}

const initHeaders = process.argv.includes("--init-headers");

loadEnvLocal();

const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
const range = process.env.GOOGLE_SHEETS_RANGE?.trim() || "'Hoja 1'!A:T";

if (!json || !spreadsheetId) {
  console.error("Faltan GOOGLE_SERVICE_ACCOUNT_JSON o GOOGLE_SHEETS_SPREADSHEET_ID en .env.local");
  process.exit(1);
}

let credentials;
try {
  credentials = JSON.parse(json);
} catch {
  console.error("GOOGLE_SERVICE_ACCOUNT_JSON no es JSON válido.");
  process.exit(1);
}

const clientEmail = credentials.client_email;
console.log("Cuenta de servicio:", clientEmail);
console.log("Hoja:", spreadsheetId);
console.log("Rango:", range);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

function headerRowRange(r) {
  const bang = r.lastIndexOf("!");
  if (bang === -1) return "1:1";
  const sheet = r.slice(0, bang);
  const cols = r.slice(bang + 1);
  const endCol = cols.includes(":") ? cols.split(":")[1] : cols;
  const startCol = cols.includes(":") ? cols.split(":")[0] : "A";
  return `${sheet}!${startCol}1:${endCol}1`;
}
const headerRange = headerRowRange(range);

try {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const titles = meta.data.sheets?.map((s) => s.properties?.title) ?? [];
  console.log("Pestañas encontradas:", titles.join(", ") || "(ninguna)");

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: headerRange,
  });
  const row = current.data.values?.[0] ?? [];
  console.log("Fila 1 actual:", row.length ? row.join(" | ") : "(vacía)");

  if (initHeaders) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [HEADERS] },
    });
    console.log("✓ Cabeceras escritas en fila 1.");
  } else if (row.length === 0) {
    console.log("\nLa fila 1 está vacía. Ejecuta: node scripts/verify-google-sheets.mjs --init-headers");
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          new Date().toISOString(),
          "Prueba",
          "Script",
          "test@example.com",
          "+507",
          "60000000",
          "Empresa prueba",
          "RUC-TEST",
          "Dirección prueba",
          "Panamá",
          "Verificación automática",
          "Test — verify-google-sheets.mjs",
          "—",
          "—",
          "—",
          "—",
          "—",
          "Sí",
          "—",
          "—",
          "—",
        ],
      ],
    },
  });
  console.log("✓ Fila de prueba agregada correctamente.");
} catch (e) {
  const msg = e?.message ?? String(e);
  console.error("\n✗ Error:", msg);
  if (/permission|403/i.test(msg)) {
    console.error(`\nComparte la hoja con: ${clientEmail} (permiso Editor).`);
  }
  if (/Unable to parse range|not found/i.test(msg)) {
    console.error('\nCrea una pestaña llamada "Leads" o ajusta GOOGLE_SHEETS_RANGE.');
  }
  process.exit(1);
}
