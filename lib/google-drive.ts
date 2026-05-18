import { Readable } from "node:stream";
import { google } from "googleapis";
import { getGoogleSheetsConfig } from "@/lib/google-sheets-config";
import { createGoogleAuth, GOOGLE_DRIVE_SCOPE } from "@/lib/google-auth";

export type LeadDriveUploadResult = {
  folderId: string;
  folderUrl: string;
  uploaded: { field: string; name: string; fileId: string }[];
};

function sanitizePathSegment(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
}

function leadFolderName(opts: {
  submittedAtIso: string;
  contactoNombre: string;
  contactoApellido: string;
  servicioLabel: string;
}): string {
  const day = opts.submittedAtIso.slice(0, 10);
  const name = sanitizePathSegment(
    `${opts.contactoNombre}_${opts.contactoApellido}`.trim() || "lead",
  );
  const svc = sanitizePathSegment(opts.servicioLabel);
  return `${day}_${name}_${svc}`;
}

async function fileToBuffer(file: File): Promise<Buffer> {
  return Buffer.from(await file.arrayBuffer());
}

export function isGoogleDriveConfigured(): boolean {
  return !!process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
}

export async function uploadLeadFilesToDrive(opts: {
  submittedAtIso: string;
  contactoNombre: string;
  contactoApellido: string;
  servicioLabel: string;
  fotos: File[];
  aviso?: File;
  firma?: File;
}): Promise<LeadDriveUploadResult | null> {
  const parentId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  if (!parentId) return null;

  const cfg = getGoogleSheetsConfig();
  if (!cfg.ok) {
    throw new Error(cfg.error);
  }

  const auth = createGoogleAuth([GOOGLE_DRIVE_SCOPE]);
  const drive = google.drive({ version: "v3", auth });

  const folderName = leadFolderName(opts);
  let folderId: string;
  let folderUrl: string;

  try {
    const folderRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      },
      fields: "id, webViewLink",
      supportsAllDrives: true,
    });
    folderId = folderRes.data.id!;
    folderUrl =
      folderRes.data.webViewLink ??
      `https://drive.google.com/drive/folders/${folderId}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/permission|403|not found/i.test(msg)) {
      throw new Error(
        `No se pudo crear la carpeta en Drive. Comparta la carpeta raíz con ${cfg.clientEmail} (Editor) y habilite Google Drive API. Detalle: ${msg}`,
      );
    }
    throw err;
  }

  const uploaded: LeadDriveUploadResult["uploaded"] = [];

  const uploadOne = async (file: File, field: string) => {
    const body = Readable.from(await fileToBuffer(file));
    const res = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId],
      },
      media: {
        mimeType: file.type || "application/octet-stream",
        body,
      },
      fields: "id, name",
      supportsAllDrives: true,
    });
    uploaded.push({
      field,
      name: res.data.name ?? file.name,
      fileId: res.data.id!,
    });
  };

  for (const foto of opts.fotos) {
    await uploadOne(foto, "foto");
  }
  if (opts.aviso) await uploadOne(opts.aviso, "aviso");
  if (opts.firma) await uploadOne(opts.firma, "firma");

  return { folderId, folderUrl, uploaded };
}
