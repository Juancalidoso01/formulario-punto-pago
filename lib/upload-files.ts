/** Tamaño máximo por archivo (formulario de afiliación). */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export function isProbablyImage(file: File): boolean {
  return (
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(file.name)
  );
}

/** Aviso de operación: PDF o imagen. */
export function isAvisoDocument(file: File): boolean {
  return file.type === "application/pdf" || isProbablyImage(file);
}
