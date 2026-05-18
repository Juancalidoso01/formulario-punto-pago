/**
 * Sube GOOGLE_SERVICE_ACCOUNT_JSON a Vercel (sin pegar JSON a mano).
 *
 * 1. Descarga el JSON de Google Cloud y guárdalo como:
 *    google-service-account.json   (en la raíz del proyecto)
 * 2. npm run sheets:setup-vercel
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const jsonPath = path.join(root, "google-service-account.json");

if (!fs.existsSync(jsonPath)) {
  console.error(`
No encontré: google-service-account.json

Pasos rápidos:
  1. https://console.cloud.google.com → APIs → habilita "Google Sheets API"
  2. IAM → Cuentas de servicio → Crear → Claves → JSON → descargar
  3. Renombra el archivo a google-service-account.json y colócalo en:
     ${root}
  4. Vuelve a ejecutar: npm run sheets:setup-vercel
`);
  process.exit(1);
}

let credentials;
try {
  credentials = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
} catch {
  console.error("El archivo no es JSON válido.");
  process.exit(1);
}

const email = credentials.client_email;
if (!email) {
  console.error("El JSON no tiene client_email.");
  process.exit(1);
}

const oneLine = JSON.stringify(credentials);

console.log("Cuenta de servicio:", email);
console.log("\n→ Comparte tu Google Sheet con ese correo (rol Editor).\n");
console.log("Subiendo variable a Vercel (Production)…\n");

const run = spawnSync(
  "npx",
  ["--yes", "vercel@latest", "env", "add", "GOOGLE_SERVICE_ACCOUNT_JSON", "production"],
  {
    cwd: root,
    input: oneLine,
    encoding: "utf8",
    stdio: ["pipe", "inherit", "inherit"],
  },
);

if (run.status !== 0) {
  console.error(
    "\nSi falló porque la variable ya existe, bórrela en Vercel → Settings → Environment Variables y repita.",
  );
  process.exit(run.status ?? 1);
}

console.log(`
✓ Listo. Ahora en Vercel: Deployments → Redeploy (último deployment).

Prueba local (opcional):
  cp .env.example .env.local
  # Añade en .env.local la misma línea GOOGLE_SERVICE_ACCOUNT_JSON=...
  npm run sheets:verify
`);
