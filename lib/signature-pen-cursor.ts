/**
 * Cursor de lapicero para firma (escritorio).
 * La punta del trazo está en el vértice (3, 21) del viewBox 24×24 — mismo valor en hotspot CSS.
 */
const PEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#0B0B13" d="M3 21 L6.2 17.8 L7.4 19.2 Z"/><path fill="#4749B6" d="M7.4 19.2 L18.5 5.5 L20.2 7.2 L9.2 20.5 Z"/><path fill="#6366f1" d="M17.8 4.2 L21.2 5.8 L20 7.5 L16.8 6 Z"/></svg>`;

const PEN_SVG_DRAWING = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#0B0B13" d="M3 21 L6.2 17.8 L7.4 19.2 Z"/><path fill="#3B3DA6" d="M7.4 19.2 L18.5 5.5 L20.2 7.2 L9.2 20.5 Z"/><path fill="#4749B6" d="M17.8 4.2 L21.2 5.8 L20 7.5 L16.8 6 Z"/></svg>`;

export const SIGNATURE_PEN_HOTSPOT_X = 3;
export const SIGNATURE_PEN_HOTSPOT_Y = 21;

function toCursorUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${SIGNATURE_PEN_HOTSPOT_X} ${SIGNATURE_PEN_HOTSPOT_Y}, pointer`;
}

export const SIGNATURE_PEN_CURSOR = toCursorUrl(PEN_SVG);
export const SIGNATURE_PEN_CURSOR_DRAWING = toCursorUrl(PEN_SVG_DRAWING);
