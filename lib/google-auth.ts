import { google } from "googleapis";

export const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
export const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export function getServiceAccountCredentials(): object {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!json) {
    throw new Error("Falta GOOGLE_SERVICE_ACCOUNT_JSON en el servidor.");
  }
  return JSON.parse(json) as object;
}

export function createGoogleAuth(scopes: string[]) {
  return new google.auth.GoogleAuth({
    credentials: getServiceAccountCredentials(),
    scopes,
  });
}
