"use client";

import { SERVICIO_PRINCIPAL_PUNTO_PAGO } from "@/lib/afiliacion-opciones";

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export function ServicioPrincipalPicker({ value, onChange }: Props) {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5"
      role="radiogroup"
      aria-label="Línea de negocio Punto Pago"
    >
      {SERVICIO_PRINCIPAL_PUNTO_PAGO.map((s, index) => {
        const selected = value === s.id;
        const inputId = `servicio-${s.id}`;
        const n = index + 1;
        return (
          <label
            key={s.id}
            htmlFor={inputId}
            className="group relative block h-full min-h-0 cursor-pointer select-none"
          >
            <input
              id={inputId}
              type="radio"
              name="servicioPrincipal"
              value={s.id}
              checked={selected}
              onChange={() => onChange(s.id)}
              className="peer sr-only"
            />
            <span
              className={
                selected
                  ? "flex h-full min-h-[128px] flex-col rounded-2xl border-2 border-[#4749B6] bg-gradient-to-br from-[#E8E9F7] via-white to-white p-4 shadow-md shadow-[#4749B6]/20 ring-1 ring-[#4749B6]/25 transition duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-[#4749B6]/35 peer-focus-visible:ring-offset-2 sm:min-h-[140px] sm:p-4"
                  : "flex h-full min-h-[128px] flex-col rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50/80 p-4 shadow-sm ring-1 ring-slate-200/60 transition duration-200 hover:-translate-y-0.5 hover:border-[#4749B6]/40 hover:shadow-md hover:shadow-slate-900/5 sm:min-h-[140px] sm:p-4 peer-focus-visible:ring-2 peer-focus-visible:ring-[#4749B6]/35 peer-focus-visible:ring-offset-2"
              }
            >
              <span className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={
                    selected
                      ? "inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-[#4749B6] text-sm font-bold text-white shadow-sm"
                      : "inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600 transition group-hover:bg-[#4749B6]/10 group-hover:text-[#4749B6]"
                  }
                  aria-hidden
                >
                  {n}
                </span>
                {selected ? (
                  <span className="rounded-full bg-[#4749B6]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#4749B6]">
                    Seleccionado
                  </span>
                ) : (
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 opacity-0 transition group-hover:opacity-100">
                    Elegir
                  </span>
                )}
              </span>
              <span className="text-[15px] font-semibold leading-snug text-[#0B0B13] sm:text-base">
                {s.titulo}
              </span>
              <span className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                {s.ayuda}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
