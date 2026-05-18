/**
 * Prueba subida a Google Drive (carpeta de prueba dentro de GOOGLE_DRIVE_FOLDER_ID).
 * La carpeta debe estar en una unidad compartida (Shared Drive), no en «Mi unidad».
 *
 * Uso: npm run drive:verify
 * Requiere GOOGLE_SERVICE_ACCOUNT_JSON y GOOGLE_DRIVE_FOLDER_ID en .env.local
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "googleapis";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
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

function mensajeUnidadCompartida(clientEmail) {
  return [
    "Las cuentas de servicio no tienen espacio en «Mi unidad» de Google Drive.",
    "Debe usar una unidad compartida (Shared Drive) de Google Workspace:",
    "",
    "1. En drive.google.com → Unidades compartidas → Nueva unidad compartida",
    "   (ej. «Leads formulario Punto Pago»).",
    `2. Miembros → Agregar ${clientEmail} como «Colaborador de contenido» o superior.`,
    "3. Dentro de esa unidad, cree una carpeta (ej. «Afiliaciones») y abra su URL.",
    "4. Copie solo el ID de la carpeta (…/folders/ESTE_ID) en GOOGLE_DRIVE_FOLDER_ID.",
    "5. Vuelva a ejecutar: npm run drive:verify",
  ].join("\n");
}

function isQuotaError(msg) {
  return /service accounts do not have storage quota|storage quota/i.test(msg);
}

loadEnvLocal();

function normalizeDriveFolderId(raw) {
  const t = raw?.trim();
  if (!t) return null;
  const fromUrl = t.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (fromUrl) return fromUrl[1];
  return t.split("?")[0].trim() || null;
}

const parentId = normalizeDriveFolderId(process.env.GOOGLE_DRIVE_FOLDER_ID);
const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();

if (!json) {
  console.error("Falta GOOGLE_SERVICE_ACCOUNT_JSON");
  process.exit(1);
}
if (!parentId) {
  console.error("Falta GOOGLE_DRIVE_FOLDER_ID");
  process.exit(1);
}

const credentials = JSON.parse(json);
const clientEmail = credentials.client_email ?? "(client_email del JSON)";
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

let parentMeta;
try {
  const parentRes = await drive.files.get({
    fileId: parentId,
    fields: "id, name, driveId",
    supportsAllDrives: true,
  });
  parentMeta = parentRes.data;
} catch (err) {
  const msg = err?.message ?? String(err);
  console.error("No se pudo leer la carpeta raíz:", msg);
  console.error(
    "\nSi el ID es correcto, suele faltar agregar la cuenta de servicio a la unidad compartida:",
  );
  console.error(mensajeUnidadCompartida(clientEmail));
  process.exit(1);
}

if (!parentMeta.driveId) {
  console.error(
    `La carpeta «${parentMeta.name ?? parentId}» está en un Drive personal, no en una unidad compartida.\n`,
  );
  console.error(mensajeUnidadCompartida(clientEmail));
  process.exit(1);
}

console.log(
  `Carpeta raíz OK en unidad compartida: «${parentMeta.name}» (driveId ${parentMeta.driveId})`,
);

try {
  const folderRes = await drive.files.create({
    requestBody: {
      name: `test-drive-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  console.log("OK — carpeta de prueba creada:");
  console.log(folderRes.data.webViewLink ?? folderRes.data.id);
} catch (err) {
  const msg = err?.message ?? String(err);
  if (isQuotaError(msg)) {
    console.error("Error de cuota (cuenta de servicio):\n");
    console.error(mensajeUnidadCompartida(clientEmail));
  } else {
    console.error("Error al crear carpeta de prueba:", msg);
    console.error("\nRevise que", clientEmail, "tenga acceso a la unidad compartida.");
  }
  process.exit(1);
}
