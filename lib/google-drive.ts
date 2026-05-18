import { Readable } from "node:stream";
import type { drive_v3 } from "googleapis";
import { google } from "googleapis";
import { getGoogleSheetsConfig } from "@/lib/google-sheets-config";
import { createGoogleAuth, GOOGLE_DRIVE_SCOPE } from "@/lib/google-auth";

/** Guía cuando la carpeta está en «Mi unidad» o la API devuelve error de cuota. */
export function mensajeConfiguracionUnidadCompartida(clientEmail: string): string {
  return [
    "Las cuentas de servicio no tienen espacio en «Mi unidad» de Google Drive.",
    "Debe usar una unidad compartida (Shared Drive) de Google Workspace:",
    "",
    "1. En drive.google.com → Unidades compartidas → Nueva unidad compartida",
    "   (ej. «Leads formulario Punto Pago»).",
    `2. Miembros → Agregar ${clientEmail} como «Colaborador de contenido» o superior.`,
    "3. Dentro de esa unidad, cree una carpeta (ej. «Afiliaciones») y abra su URL.",
    "4. Copie solo el ID de la carpeta (…/folders/ESTE_ID) en GOOGLE_DRIVE_FOLDER_ID (Vercel).",
    "5. Pruebe de nuevo: npm run drive:verify",
  ].join("\n");
}

function isServiceAccountStorageQuotaError(message: string): boolean {
  return /service accounts do not have storage quota|storage quota/i.test(message);
}

/** La carpeta raíz debe vivir en una unidad compartida (`driveId` presente). */
export async function assertDriveParentIsSharedDrive(
  drive: drive_v3.Drive,
  parentId: string,
  clientEmail: string,
): Promise<void> {
  let meta: drive_v3.Schema$File;
  try {
    const res = await drive.files.get({
      fileId: parentId,
      fields: "id, name, driveId",
      supportsAllDrives: true,
    });
    meta = res.data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/not found|404/i.test(msg)) {
      throw new Error(
        `No se encontró la carpeta GOOGLE_DRIVE_FOLDER_ID (${parentId}). Revise el ID en Vercel.`,
      );
    }
    if (/permission|403|forbidden/i.test(msg)) {
      throw new Error(
        `Sin acceso a la carpeta de Drive. ${mensajeConfiguracionUnidadCompartida(clientEmail)}`,
      );
    }
    throw err;
  }

  if (!meta.driveId) {
    const nombre = meta.name ?? parentId;
    throw new Error(
      `La carpeta «${nombre}» está en un Drive personal, no en una unidad compartida.\n\n${mensajeConfiguracionUnidadCompartida(clientEmail)}`,
    );
  }
}

function rethrowDriveError(err: unknown, clientEmail: string): never {
  const msg = err instanceof Error ? err.message : String(err);
  if (isServiceAccountStorageQuotaError(msg)) {
    throw new Error(
      `Google Drive rechazó la subida (cuenta de servicio sin espacio).\n\n${mensajeConfiguracionUnidadCompartida(clientEmail)}`,
    );
  }
  if (/permission|403|not found/i.test(msg)) {
    throw new Error(
      `No se pudo escribir en Drive. Comparta la unidad compartida con ${clientEmail} (Colaborador de contenido o superior) y habilite Google Drive API. Detalle: ${msg}`,
    );
  }
  throw err instanceof Error ? err : new Error(msg);
}

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

  await assertDriveParentIsSharedDrive(drive, parentId, cfg.clientEmail);

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
    rethrowDriveError(err, cfg.clientEmail);
  }

  const uploaded: LeadDriveUploadResult["uploaded"] = [];

  const uploadOne = async (file: File, field: string) => {
    try {
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
    } catch (err) {
      rethrowDriveError(err, cfg.clientEmail);
    }
  };

  for (const foto of opts.fotos) {
    await uploadOne(foto, "foto");
  }
  if (opts.aviso) await uploadOne(opts.aviso, "aviso");
  if (opts.firma) await uploadOne(opts.firma, "firma");

  return { folderId, folderUrl, uploaded };
}
