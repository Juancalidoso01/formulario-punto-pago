export type PanamaManualAddressParts = {
  viaEdificio: string;
  corregimiento: string;
  detalleLocal: string;
  referencia: string;
};

export function composePanamaManualAddress(parts: PanamaManualAddressParts): string {
  const via = parts.viaEdificio.trim();
  const corr = parts.corregimiento.trim();
  const local = parts.detalleLocal.trim();
  const ref = parts.referencia.trim();
  const chunks = [`Calle/vía/edificio: ${via}`, `Corregimiento o barrio: ${corr}`];
  if (local) chunks.push(`Local o piso: ${local}`);
  if (ref) chunks.push(`Referencia: ${ref}`);
  return `[Dirección detallada] ${chunks.join(" · ")}`;
}

/** Devuelve mensaje de error o null si es válida. */
export function validatePanamaManualAddress(
  parts: PanamaManualAddressParts,
): string | null {
  const via = parts.viaEdificio.trim();
  const corr = parts.corregimiento.trim();
  const local = parts.detalleLocal.trim();
  const ref = parts.referencia.trim();

  if (via.length < 4) {
    return "Indique calle, avenida, edificio o PH (mínimo 4 caracteres).";
  }
  if (corr.length < 3) {
    return "Indique corregimiento o barrio.";
  }
  if (local.length < 2 && ref.length < 8) {
    return "Agregue piso/local o una referencia visible (ej. negocio vecino, color de fachada).";
  }
  return null;
}

export function isPanamaManualComposedAddress(value: string): boolean {
  return value.trimStart().startsWith("[Dirección detallada]");
}
