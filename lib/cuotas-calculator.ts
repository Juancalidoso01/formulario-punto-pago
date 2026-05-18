/**
 * Lógica de la calculadora de Cuotas (referencia: comercios.puntopago.net).
 * Tarifas y plazos tomados del bundle público del sitio.
 */

export type CuotasTermMonths = 2 | 4 | 8;

export type CuotasTermConfig = {
  maxAmount: number;
  payments: number;
  overpaymentRate: number;
  serviceFeeRate: number;
  interest: boolean;
  label: string;
  capLabel: string;
};

export const CUOTAS_MIN_AMOUNT = 10;

export const CUOTAS_TERM_CONFIG: Record<CuotasTermMonths, CuotasTermConfig> = {
  2: {
    maxAmount: 100,
    payments: 4,
    overpaymentRate: 0,
    serviceFeeRate: 0.05,
    interest: false,
    label: "2 meses",
    capLabel: "hasta 100$",
  },
  4: {
    maxAmount: 175,
    payments: 8,
    overpaymentRate: 0,
    serviceFeeRate: 0.05,
    interest: false,
    label: "4 meses",
    capLabel: "hasta 175$",
  },
  8: {
    maxAmount: 250,
    payments: 16,
    overpaymentRate: 0.4,
    serviceFeeRate: 0,
    interest: true,
    label: "8 meses",
    capLabel: "hasta 250$",
  },
};

export const CUOTAS_TERM_ORDER: CuotasTermMonths[] = [2, 4, 8];

export function normalizeCuotasAmount(raw: number, maxAmount: number): number {
  if (!Number.isFinite(raw) || raw < CUOTAS_MIN_AMOUNT) return CUOTAS_MIN_AMOUNT;
  return Math.min(Math.round(raw), maxAmount);
}

export function calcularPagoRegularCuotas(
  amount: number,
  term: CuotasTermMonths,
): number {
  const cfg = CUOTAS_TERM_CONFIG[term];
  const principal = normalizeCuotasAmount(amount, cfg.maxAmount);
  const total =
    principal +
    principal * cfg.serviceFeeRate +
    principal * cfg.overpaymentRate;
  return total / cfg.payments;
}

/** Mismo redondeo que el sitio oficial (una cifra decimal). */
export function formatCuotasMoney(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (Number.isInteger(rounded)) return `$${rounded.toFixed(0)}`;
  return `$${rounded.toFixed(1)}`;
}

export function textoInteresCuotas(term: CuotasTermMonths): string {
  return CUOTAS_TERM_CONFIG[term].interest ? "con intereses" : "sin intereses";
}

export function textoPlanCuotasParaSheet(
  term: CuotasTermMonths,
  montoReferencia: number,
): string {
  const cfg = CUOTAS_TERM_CONFIG[term];
  const monto = normalizeCuotasAmount(montoReferencia, cfg.maxAmount);
  const pago = calcularPagoRegularCuotas(monto, term);
  return [
    `Plan Cuotas ${cfg.label}`,
    `monto ref. ${formatCuotasMoney(monto)}`,
    `${cfg.payments} pagos de ${formatCuotasMoney(pago)}`,
    textoInteresCuotas(term),
  ].join(" · ");
}

export function esCuotasTermValido(n: number): n is CuotasTermMonths {
  return n === 2 || n === 4 || n === 8;
}
