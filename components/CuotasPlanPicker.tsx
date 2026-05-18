"use client";

import { useMemo } from "react";
import {
  CUOTAS_MIN_AMOUNT,
  CUOTAS_TERM_CONFIG,
  CUOTAS_TERM_ORDER,
  calcularPagoRegularCuotas,
  formatCuotasMoney,
  normalizeCuotasAmount,
  textoInteresCuotas,
  type CuotasTermMonths,
} from "@/lib/cuotas-calculator";

const inputClass =
  "w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#4749B6] focus:ring-2 focus:ring-[#4749B6]/20";

export function CuotasPlanPicker({
  termMonths,
  onTermMonthsChange,
  montoReferencia,
  onMontoReferenciaChange,
}: {
  termMonths: CuotasTermMonths;
  onTermMonthsChange: (t: CuotasTermMonths) => void;
  montoReferencia: number;
  onMontoReferenciaChange: (n: number) => void;
}) {
  const cfg = CUOTAS_TERM_CONFIG[termMonths];
  const monto = normalizeCuotasAmount(montoReferencia, cfg.maxAmount);
  const pagoRegular = useMemo(
    () => calcularPagoRegularCuotas(monto, termMonths),
    [monto, termMonths],
  );

  const rangePercent = useMemo(() => {
    const span = cfg.maxAmount - CUOTAS_MIN_AMOUNT;
    if (span <= 0) return 100;
    return ((monto - CUOTAS_MIN_AMOUNT) / span) * 100;
  }, [cfg.maxAmount, monto]);

  const amountLabel = `Monto de la compra (de $${CUOTAS_MIN_AMOUNT} a $${cfg.maxAmount})`;

  const selectTerm = (t: CuotasTermMonths) => {
    onTermMonthsChange(t);
    const nextMax = CUOTAS_TERM_CONFIG[t].maxAmount;
    if (montoReferencia > nextMax) {
      onMontoReferenciaChange(nextMax);
    } else if (montoReferencia < CUOTAS_MIN_AMOUNT) {
      onMontoReferenciaChange(CUOTAS_MIN_AMOUNT);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
          {amountLabel}
          <input
            type="number"
            min={CUOTAS_MIN_AMOUNT}
            max={cfg.maxAmount}
            step={1}
            className={inputClass}
            value={monto}
            onChange={(e) => {
              const raw = e.target.value === "" ? CUOTAS_MIN_AMOUNT : Number(e.target.value);
              onMontoReferenciaChange(normalizeCuotasAmount(raw, cfg.maxAmount));
            }}
          />
        </label>
        <input
          type="range"
          min={CUOTAS_MIN_AMOUNT}
          max={cfg.maxAmount}
          step={1}
          value={monto}
          aria-label={amountLabel}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#4749B6]"
          style={{
            background: `linear-gradient(to right, #4749B6 0%, #4749B6 ${rangePercent}%, #e2e8f0 ${rangePercent}%, #e2e8f0 100%)`,
          }}
          onChange={(e) => onMontoReferenciaChange(Number(e.target.value))}
        />

        <div>
          <p className="text-sm font-medium text-slate-800">Período de pago</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {CUOTAS_TERM_ORDER.map((t) => {
              const c = CUOTAS_TERM_CONFIG[t];
              const active = termMonths === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => selectTerm(t)}
                  className={`flex flex-col rounded-xl border px-2 py-3 text-center transition ${
                    active
                      ? "border-[#4749B6] bg-[#4749B6] text-white shadow-md shadow-[#4749B6]/25"
                      : "border-slate-200 bg-white text-slate-800 hover:border-[#4749B6]/40"
                  }`}
                >
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wide ${
                      active ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    {c.capLabel}
                  </span>
                  <span className="mt-1 text-sm font-semibold">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-600">Pago regular</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
          {formatCuotasMoney(pagoRegular)}
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Dos veces al mes</span>
          <span>*inc. tarifa de servicio</span>
        </div>

        <hr className="my-5 border-slate-200" />

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-600">Tasa de interés</dt>
            <dd>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  cfg.interest
                    ? "bg-amber-100 text-amber-900"
                    : "bg-[#4749B6]/12 text-[#4749B6]"
                }`}
              >
                {textoInteresCuotas(termMonths)}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-600">Cantidad de pagos</dt>
            <dd className="font-semibold text-slate-900">
              {cfg.payments} pagos
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-600">Paga hoy</dt>
            <dd className="font-semibold text-slate-900">$0</dd>
          </div>
        </dl>

        <p className="mt-5 text-[11px] leading-relaxed text-slate-500">
          Monto y cuotas son una referencia según las reglas públicas de Cuotas Punto Pago.
          El equipo comercial confirmará el plan que mejor se ajuste a su negocio.
        </p>
      </div>
    </div>
  );
}
