"use client";

type FormSubmitLoadingOverlayProps = {
  active: boolean;
  message: string;
};

/** Bloquea el formulario mientras se envía y muestra un indicador claro. */
export function FormSubmitLoadingOverlay({
  active,
  message,
}: FormSubmitLoadingOverlayProps) {
  if (!active) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3 px-6 py-4">
        <span
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#4749B6]/25 border-t-[#4749B6]"
          aria-hidden
        />
        <p className="max-w-xs text-center text-sm font-medium text-slate-700">{message}</p>
      </div>
    </div>
  );
}

type WizardSubmitButtonProps = {
  loading: boolean;
  label: string;
  loadingLabel: string;
  onClick: () => void;
};

export function WizardSubmitButton({
  loading,
  label,
  loadingLabel,
  onClick,
}: WizardSubmitButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
      className="inline-flex min-w-[12rem] items-center justify-center gap-2.5 rounded-lg bg-[#4749B6] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#4749B6]/25 transition hover:bg-[#3B3DA6] disabled:cursor-wait disabled:opacity-95"
    >
      {loading ? (
        <>
          <span
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/35 border-t-white"
            aria-hidden
          />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}
