import type { AfiliacionCorporativoJson } from "@/lib/afiliacion-corporativo-payload";
import { telefonoPrincipalCorporativo } from "@/lib/afiliacion-corporativo-payload";
import type { AfiliacionJson } from "@/lib/afiliacion-payload";
import {
  esServicioCuotas,
  textoServicioPrincipalParaSheet,
} from "@/lib/afiliacion-opciones";

/**
 * Cabeceras de la fila 1 en Google Sheets (pestaña por defecto: Leads).
 * Deben coincidir en orden y cantidad con `afiliacionRowForSheet` / `corporativoRowForSheet`.
 */
export const LEAD_SHEET_HEADERS = [
  "Fecha",
  "Nombre",
  "Apellido",
  "Email",
  "Tel código",
  "Tel número",
  "Empresa",
  "RUC",
  "Dirección",
  "Provincia",
  "Descripción negocio",
  "Servicio principal",
  "Ocupación",
  "Actividad",
  "Rango nómina",
  "Integración / plan Cuotas",
  "Términos",
  "Fotos (Drive)",
  "Aviso archivo",
  "Firma archivo",
] as const;

export const LEAD_SHEET_COLUMN_COUNT = LEAD_SHEET_HEADERS.length;

export const DEFAULT_LEAD_SHEET_RANGE = "Leads!A:T";

export function afiliacionRowForSheet(
  data: AfiliacionJson,
  opts: {
    fechaIso: string;
    fotoNames: string;
    avisoFileName: string;
    firmaFileName: string;
  },
): string[] {
  const row: string[] = [
    opts.fechaIso,
    data.contactoNombre,
    data.contactoApellido,
    data.email,
    data.telefonoCodigo,
    data.telefonoNumero,
    data.nombreEmpresa,
    data.ruc,
    data.direccion,
    data.provincia,
    textoDescripcionNegocioParaSheet(data.descripcionNegocio, data.rubroMcc),
    textoServicioPrincipalParaSheet(data.servicioPrincipal),
    data.ocupacionPrincipal,
    data.actividadNegocio,
    data.rangoNominaMensual,
    data.metodoIntegracion,
    data.terminosAceptados ? "Sí" : "No",
    opts.fotoNames,
    opts.avisoFileName,
    opts.firmaFileName,
  ];

  if (row.length !== LEAD_SHEET_COLUMN_COUNT) {
    throw new Error(
      `Fila de afiliación con ${row.length} columnas; se esperaban ${LEAD_SHEET_COLUMN_COUNT}.`,
    );
  }

  return row;
}

export function corporativoRowForSheet(
  data: AfiliacionCorporativoJson,
  servicioTexto: string,
  fechaIso: string,
): string[] {
  const tel = telefonoPrincipalCorporativo(data);

  const row: string[] = [
    fechaIso,
    data.contactoNombre,
    data.contactoApellido,
    data.email,
    tel.codigo || "—",
    tel.numero || "—",
    "—",
    "—",
    "—",
    "—",
    "Contacto corporativo",
    servicioTexto,
    data.cargo,
    "—",
    "No aplica — corporativo",
    "No aplica — corporativo",
    data.terminosAceptados ? "Sí" : "No",
    "—",
    "—",
    "—",
  ];

  if (row.length !== LEAD_SHEET_COLUMN_COUNT) {
    throw new Error(
      `Fila corporativa con ${row.length} columnas; se esperaban ${LEAD_SHEET_COLUMN_COUNT}.`,
    );
  }

  return row;
}

/** Lista de nombres de archivo (sin URL). */
export function textoDescripcionNegocioParaSheet(
  descripcion: string,
  rubroMcc: string,
): string {
  const detalle = descripcion.trim();
  const rubro = rubroMcc.trim();
  if (rubro && detalle) return `${rubro}\n${detalle}`;
  return rubro || detalle || "—";
}

export function listaNombresFotos(nombres: string[]): string {
  return nombres.join("; ");
}

/** Celda de la columna «Fotos (Drive)»: enlace a carpeta + nombres de archivos. */
export function fotosColumnaForSheet(
  servicioPrincipal: string,
  nombres: string[],
  driveFolderUrl?: string | null,
): string {
  if (esServicioCuotas(servicioPrincipal)) {
    return "Sin fotos — Cuotas (detalle del plan en columna Integración)";
  }
  const names = listaNombresFotos(nombres);
  if (driveFolderUrl) {
    return names
      ? `${driveFolderUrl}\n${names}`
      : driveFolderUrl;
  }
  return names || "—";
}

/** @deprecated Use fotosColumnaForSheet */
export const fotoNamesForSheet = fotosColumnaForSheet;
