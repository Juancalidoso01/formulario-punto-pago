export type GoogleSheetsConfig =
  | { ok: true; spreadsheetId: string; range: string; clientEmail: string }
  | { ok: false; error: string };

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!json) {
    return {
      ok: false,
      error:
        "Falta la variable GOOGLE_SERVICE_ACCOUNT_JSON en el servidor (Vercel → Settings → Environment Variables).",
    };
  }

  let credentials: { client_email?: string };
  try {
    credentials = JSON.parse(json) as { client_email?: string };
  } catch {
    return {
      ok: false,
      error:
        "GOOGLE_SERVICE_ACCOUNT_JSON no es JSON válido. Debe ir en una sola línea (sin saltos de línea en la clave privada mal escapados).",
    };
  }

  const clientEmail = credentials.client_email?.trim();
  if (!clientEmail) {
    return {
      ok: false,
      error: "El JSON de la cuenta de servicio no incluye client_email.",
    };
  }

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  if (!spreadsheetId) {
    return {
      ok: false,
      error:
        "Falta GOOGLE_SHEETS_SPREADSHEET_ID (ID de la hoja en la URL de Google Sheets).",
    };
  }

  const range = process.env.GOOGLE_SHEETS_RANGE?.trim() || "Leads!A:U";

  return { ok: true, spreadsheetId, range, clientEmail };
}

/** Mensaje útil para permisos de la API de Google. */
export function formatGoogleSheetsApiError(err: unknown, clientEmail: string): string {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err);

  if (/Unable to parse range|Unable to open spreadsheet|not found/i.test(msg)) {
    return `No se encontró la hoja o el rango (revisa GOOGLE_SHEETS_RANGE y que exista la pestaña «Leads»). Detalle: ${msg}`;
  }

  if (/permission|denied|403|does not have permission/i.test(msg)) {
    return `La cuenta de servicio no tiene acceso a la hoja. Comparta el documento con: ${clientEmail} (rol Editor). Detalle: ${msg}`;
  }

  if (/invalid_grant|account not found/i.test(msg)) {
    return `Credenciales de cuenta de servicio inválidas. Regenera la clave JSON en Google Cloud. Detalle: ${msg}`;
  }

  return `Error al escribir en Google Sheets: ${msg}`;
}
