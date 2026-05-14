import { google } from "googleapis";

function getServiceAccountCredentials(): object {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    return JSON.parse(json) as object;
  }
  throw new Error(
    "Falta GOOGLE_SERVICE_ACCOUNT_JSON (JSON del servicio en una sola línea).",
  );
}

export async function appendLeadToSheet(row: string[]): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const range = process.env.GOOGLE_SHEETS_RANGE ?? "Leads!A:Z";

  if (!spreadsheetId) {
    throw new Error("Falta GOOGLE_SHEETS_SPREADSHEET_ID en el entorno.");
  }

  const credentials = getServiceAccountCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}
