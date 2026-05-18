/** Accede a claves anidadas: "wizard.steps.name.title" */
export function translate(
  messages: Record<string, unknown>,
  key: string,
  params?: Record<string, string | number>,
): string {
  const parts = key.split(".");
  let cur: unknown = messages;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") {
      return key;
    }
    cur = (cur as Record<string, unknown>)[p];
  }
  if (typeof cur !== "string") return key;
  if (!params) return cur;
  return cur.replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = params[name];
    return v === undefined ? `{${name}}` : String(v);
  });
}

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function createTranslateFn(messages: Record<string, unknown>): TranslateFn {
  return (key, params) => translate(messages, key, params);
}
