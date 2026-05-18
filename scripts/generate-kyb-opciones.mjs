/**
 * Descarga Profesiones y Actividades del catálogo KYB en Google Sheets
 * y regenera lib/kyb-profesiones.ts y lib/kyb-actividades.ts
 *
 * Uso: node scripts/generate-kyb-opciones.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SHEET_ID = "1tqZYs99XrnoQbLNCgH8GgoilIDTbc_ICKlbZqcS8K-w";
const GID_PROFESIONES = "664727064";
const GID_ACTIVIDADES = "846907488";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

async function fetchCsv(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar gid=${gid}: ${res.status}`);
  return res.text();
}

function parseCsv(text, colIndex) {
  const lines = [];
  let cur = "";
  let inQ = false;
  for (const ch of text) {
    if (ch === '"') {
      inQ = !inQ;
      cur += ch;
    } else if ((ch === "\n" || ch === "\r") && !inQ) {
      if (cur.trim()) lines.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) lines.push(cur);

  const rows = lines.map((line) => {
    const cells = [];
    let cell = "";
    let q = false;
    for (const ch of line) {
      if (ch === '"') {
        q = !q;
        cell += ch;
      } else if (ch === "," && !q) {
        cells.push(cell.replace(/^"|"$/g, "").trim());
        cell = "";
      } else cell += ch;
    }
    cells.push(cell.replace(/^"|"$/g, "").trim());
    return cells;
  });

  const vals = rows
    .slice(1)
    .map((r) => r[colIndex])
    .filter(Boolean);
  return [...new Set(vals)].sort((a, b) => a.localeCompare(b, "es"));
}

function emit(name, values, source) {
  const body = values.map((v) => `  ${JSON.stringify(v)},`).join("\n");
  return `/** Generado desde Google Sheets (${source}). No editar a mano; ejecute \`node scripts/generate-kyb-opciones.mjs\`. */\nexport const ${name} = [\n${body}\n] as const;\n\nexport type ${name.replace("_OPCIONES", "Opcion")} = (typeof ${name})[number];\n`;
}

const [profCsv, actCsv] = await Promise.all([
  fetchCsv(GID_PROFESIONES),
  fetchCsv(GID_ACTIVIDADES),
]);

const profesiones = parseCsv(profCsv, 1);
const actividades = parseCsv(actCsv, 1);
profesiones.push("Otra profesión u ocupación (no listada)");
actividades.push("Otra actividad económica (no listada)");

fs.writeFileSync(
  path.join(root, "lib/kyb-profesiones.ts"),
  emit("PROFESIONES_KYB_OPCIONES", profesiones, "Profesiones"),
);
fs.writeFileSync(
  path.join(root, "lib/kyb-actividades.ts"),
  emit("ACTIVIDADES_KYB_OPCIONES", actividades, "Actividades"),
);

console.log(`OK: ${profesiones.length} profesiones, ${actividades.length} actividades`);
