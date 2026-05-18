/**
 * Sube SLACK_WEBHOOK_URL_CUOTAS a Vercel (Production).
 *
 * Uso: node scripts/setup-slack-cuotas-vercel.mjs
 * (pegar la URL del webhook cuando lo pida, o pasarla por stdin)
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function askUrl() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Pegue la URL del webhook de Slack para Cuotas: ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

const url = process.argv[2]?.trim() || (await askUrl());
if (!url.startsWith("https://hooks.slack.com/")) {
  console.error("La URL debe ser un Incoming Webhook de Slack (hooks.slack.com).");
  process.exit(1);
}

console.log("Subiendo SLACK_WEBHOOK_URL_CUOTAS a Vercel Production…");

const run = spawnSync(
  "npx",
  ["--yes", "vercel@latest", "env", "add", "SLACK_WEBHOOK_URL_CUOTAS", "production"],
  { cwd: root, input: url, encoding: "utf8" },
);

if (run.status !== 0) {
  console.error(run.stderr || run.stdout);
  console.error(
    "\nSi la variable ya existe, bórrela en Vercel → Environment Variables y repita.",
  );
  process.exit(run.status ?? 1);
}

console.log("\n✓ Listo. Haga Redeploy en Vercel para aplicar.");
console.log("  Prueba local: SLACK_WEBHOOK_URL_CUOTAS en .env.local → npm run slack:verify:cuotas");
