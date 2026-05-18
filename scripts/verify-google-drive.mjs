/**
 * Prueba subida a Google Drive (carpeta de prueba dentro de GOOGLE_DRIVE_FOLDER_ID).
 *
 * Uso: node scripts/verify-google-drive.mjs
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

loadEnvLocal();

const parentId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
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
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});
const drive = google.drive({ version: "v3", auth });

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
