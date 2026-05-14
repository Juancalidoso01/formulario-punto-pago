"use client";

import { SERVICIO_PRINCIPAL_PUNTO_PAGO } from "@/lib/afiliacion-opciones";

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export function ServicioPrincipalPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3" role="radiogroup" aria-label="Qué necesita de Punto Pago">
      {SERVICIO_PRINCIPAL_PUNTO_PAGO.map((s) => {
        const selected = value === s.id;
        const inputId = `servicio-${s.id}`;
        return (
          <label
            key={s.id}
            htmlFor={inputId}
            className={
              selected
                ? "flex cursor-pointer gap-3 rounded-xl border-2 border-blue-600 bg-blue-50/70 px-4 py-3.5 shadow-sm transition"
                : "flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-slate-300"
            }
          >
            <input
              id={inputId}
              type="radio"
              name="servicioPrincipal"
              value={s.id}
              checked={selected}
              onChange={() => onChange(s.id)}
              className="mt-1 size-4 shrink-0 text-blue-600"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-base font-medium leading-snug text-slate-900">
                {s.titulo}
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-slate-600">
                {s.ayuda}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
