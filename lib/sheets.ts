import { google } from "googleapis";
import {
  formatGoogleSheetsApiError,
  getGoogleSheetsConfig,
} from "@/lib/google-sheets-config";

/** Ej. `Leads!A:U` → `Leads!A1:U1` */
function headerRowRange(range: string): string {
  const bang = range.lastIndexOf("!");
  if (bang === -1) return "1:1";
  const sheet = range.slice(0, bang);
  const cols = range.slice(bang + 1);
  const endCol = cols.includes(":") ? cols.split(":")[1] : cols;
  const startCol = cols.includes(":") ? cols.split(":")[0] : "A";
  return `${sheet}!${startCol}1:${endCol}1`;
}

export class SheetsWriteError extends Error {
  constructor(
    message: string,
    readonly clientEmail?: string,
  ) {
    super(message);
    this.name = "SheetsWriteError";
  }
}

export function assertGoogleSheetsConfigured(): {
  spreadsheetId: string;
  range: string;
  clientEmail: string;
} {
  const cfg = getGoogleSheetsConfig();
  if (!cfg.ok) {
    throw new SheetsWriteError(cfg.error);
  }
  return cfg;
}

export async function appendLeadToSheet(row: string[]): Promise<void> {
  const cfg = assertGoogleSheetsConfigured();
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON!;
  const credentials = JSON.parse(json) as object;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: cfg.spreadsheetId,
      range: cfg.range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
  } catch (err) {
    throw new SheetsWriteError(
      formatGoogleSheetsApiError(err, cfg.clientEmail),
      cfg.clientEmail,
    );
  }
}

export async function readLeadSheetHeaderRow(): Promise<string[]> {
  const cfg = assertGoogleSheetsConfigured();
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON!;
  const credentials = JSON.parse(json) as object;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const headerRange = headerRowRange(cfg.range);

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: cfg.spreadsheetId,
      range: headerRange,
    });
    const first = res.data.values?.[0];
    return first?.map((c) => String(c).trim()) ?? [];
  } catch (err) {
    throw new SheetsWriteError(
      formatGoogleSheetsApiError(err, cfg.clientEmail),
      cfg.clientEmail,
    );
  }
}

export async function writeLeadSheetHeaders(headers: string[]): Promise<void> {
  const cfg = assertGoogleSheetsConfigured();
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON!;
  const credentials = JSON.parse(json) as object;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const headerRange = headerRowRange(cfg.range);

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: cfg.spreadsheetId,
      range: headerRange,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [headers] },
    });
  } catch (err) {
    throw new SheetsWriteError(
      formatGoogleSheetsApiError(err, cfg.clientEmail),
      cfg.clientEmail,
    );
  }
}
