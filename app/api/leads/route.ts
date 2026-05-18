import { NextResponse } from "next/server";
import { appendLeadToSheet } from "@/lib/sheets";
import {
  corporativoRowForSheet,
  validateAfiliacionCorporativoJson,
} from "@/lib/afiliacion-corporativo-payload";
import { validateAfiliacionJson } from "@/lib/afiliacion-payload";
import { textoServicioPrincipalParaSheet } from "@/lib/afiliacion-opciones";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 15 * 1024 * 1024;

function isProbablyImage(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(file.name)
  );
}

function isAvisoOk(file: File) {
  return file.type === "application/pdf" || isProbablyImage(file);
}

/**
 * Fila en Google Sheet (ajusta la fila 1 de la pestaña con estas cabeceras):
 * Fecha | Nombre | Apellido | Email | Tel código | Tel número | Empresa | RUC |
 * Dirección | Provincia | Descripción negocio | Servicio principal | Ocupación | Actividad |
 * Rango nómina | Nº clientes | Integración | Términos | Fotos (nombres) | Aviso archivo | Firma archivo
 *
 * Corporativo: celular en Tel código/número; fijo en Empresa («Fijo: …»); cargo en RUC.
 */
export async function POST(request: Request) {
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Este endpoint espera multipart/form-data (data + archivos)." },
      { status: 415 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const raw = formData.get("data");
  if (typeof raw !== "string") {
    return NextResponse.json({ error: "Falta el campo data (JSON)." }, { status: 400 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json({ error: "El campo data no es JSON válido" }, { status: 400 });
  }

  const servicio =
    typeof parsed === "object" &&
    parsed !== null &&
    typeof (parsed as Record<string, unknown>).servicioPrincipal === "string"
      ? ((parsed as Record<string, unknown>).servicioPrincipal as string)
      : "";

  if (servicio === "servicios-corporativos") {
    const corpValidated = validateAfiliacionCorporativoJson(parsed);
    if (!corpValidated.ok) {
      return NextResponse.json({ error: corpValidated.error }, { status: 400 });
    }
    const corp = corpValidated.data;
    const now = new Date().toISOString();
    const row = corporativoRowForSheet(
      corp,
      textoServicioPrincipalParaSheet(corp.servicioPrincipal),
      now,
    );
    try {
      await appendLeadToSheet(row);
    } catch (e) {
      console.error("[leads] sheets error (corporativo)", e);
      return NextResponse.json(
        { error: "No se pudo guardar. Revisa la configuración del servidor (Sheets)." },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  const validated = validateAfiliacionJson(parsed);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const data = validated.data;

  const fotos = formData
    .getAll("fotos")
    .filter((e): e is File => e instanceof File && e.size > 0);

  if (fotos.length < 1 || fotos.length > 5) {
    return NextResponse.json(
      { error: "Debe adjuntar entre 1 y 5 fotos del local." },
      { status: 400 },
    );
  }

  for (const f of fotos) {
    if (f.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `La foto «${f.name}» supera el tamaño máximo permitido.` },
        { status: 400 },
      );
    }
    if (!isProbablyImage(f)) {
      return NextResponse.json(
        { error: "Las fotos del local deben ser imágenes." },
        { status: 400 },
      );
    }
  }

  const aviso = formData.get("aviso");
  if (!(aviso instanceof File) || aviso.size === 0) {
    return NextResponse.json({ error: "Falta el archivo de aviso de operación." }, { status: 400 });
  }
  if (aviso.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "El aviso de operación es demasiado grande." }, { status: 400 });
  }
  if (!isAvisoOk(aviso)) {
    return NextResponse.json(
      { error: "El aviso de operación debe ser PDF o imagen." },
      { status: 400 },
    );
  }

  const firma = formData.get("firma");
  if (!(firma instanceof File) || firma.size === 0) {
    return NextResponse.json({ error: "Falta la firma digital." }, { status: 400 });
  }
  if (firma.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "La firma adjunta es demasiado grande." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const fotoNames = fotos.map((f) => f.name).join("; ");

  const row = [
    now,
    data.contactoNombre,
    data.contactoApellido,
    data.email,
    data.telefonoCodigo,
    data.telefonoNumero,
    data.nombreEmpresa,
    data.ruc,
    data.direccion,
    data.provincia,
    data.descripcionNegocio,
    textoServicioPrincipalParaSheet(data.servicioPrincipal),
    data.ocupacionPrincipal,
    data.actividadNegocio,
    data.rangoNominaMensual,
    data.numClientes,
    data.metodoIntegracion,
    data.terminosAceptados ? "Sí" : "No",
    fotoNames,
    aviso.name,
    firma.name,
  ];

  try {
    await appendLeadToSheet(row);
  } catch (e) {
    console.error("[leads] sheets error", e);
    return NextResponse.json(
      { error: "No se pudo guardar. Revisa la configuración del servidor (Sheets)." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
