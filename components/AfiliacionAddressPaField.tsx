"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  composePanamaManualAddress,
  validatePanamaManualAddress,
  type PanamaManualAddressParts,
} from "@/lib/panama-manual-address";
import {
  formatGeoapifyDisplay,
  geoapifyAutocompletePanamaClientSide,
  geoapifyAutocompleteWorldwideClientSide,
  geoapifyParsedSummary,
  type GeoapifyAddressItem,
} from "@/lib/geoapify-address";

const MIN_BOOT_MS = 450;
const MIN_LOADING_MS = 500;
const DEBOUNCE_REMOTE_MS = 320;
const MIN_SEARCH_CHARS = 2;

const MANUAL_OPTION = "No encuentro mi dirección — describirla con detalle";

type SuggestionRow = { kind: "api"; text: string; item: GeoapifyAddressItem };

export type AfiliacionAddressStructuredMeta = {
  provincia: string;
  ciudad: string;
};

export type AfiliacionAddressEntryMode = "geo" | "manual";

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  inputClass: string;
  variant?: "panama" | "worldwide";
  onStructuredFromApi?: (meta: AfiliacionAddressStructuredMeta) => void;
  onEntryModeChange?: (mode: AfiliacionAddressEntryMode) => void;
};

const EMPTY_MANUAL: PanamaManualAddressParts = {
  viaEdificio: "",
  corregimiento: "",
  detalleLocal: "",
  referencia: "",
};

function useMinLoadingDuration(minMs: number) {
  const [loading, setLoading] = useState(false);
  const startedAtRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    startedAtRef.current = Date.now();
    setLoading(true);
  }, []);

  const hide = useCallback(() => {
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, minMs - elapsed);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setLoading(false);
      hideTimerRef.current = null;
    }, remaining);
  }, [minMs]);

  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    [],
  );

  return { loading, show, hide };
}

export function AfiliacionAddressPaField({
  label,
  hint,
  value,
  onChange,
  inputClass,
  variant = "panama",
  onStructuredFromApi,
  onEntryModeChange,
}: Props) {
  const listboxId = useId();
  const worldwide = variant === "worldwide";
  const [booting, setBooting] = useState(true);
  const [entryMode, setEntryMode] = useState<AfiliacionAddressEntryMode>("geo");
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchEmpty, setSearchEmpty] = useState(false);
  const [rows, setRows] = useState<SuggestionRow[]>([]);
  const [parsedHint, setParsedHint] = useState("");
  const [manualParts, setManualParts] = useState<PanamaManualAddressParts>(EMPTY_MANUAL);
  const [manualError, setManualError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(value);
  const selectedRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);
  const searchLoading = useMinLoadingDuration(MIN_LOADING_MS);

  const setMode = useCallback(
    (mode: AfiliacionAddressEntryMode) => {
      setEntryMode(mode);
      onEntryModeChange?.(mode);
    },
    [onEntryModeChange],
  );

  useEffect(() => {
    let cancel = false;
    const t = window.setTimeout(() => {
      if (!cancel) setBooting(false);
    }, MIN_BOOT_MS);
    return () => {
      cancel = true;
      window.clearTimeout(t);
    };
  }, []);

  const syncManualToParent = useCallback(
    (parts: PanamaManualAddressParts) => {
      if (worldwide) return;
      const err = validatePanamaManualAddress(parts);
      setManualError(err);
      if (!err) {
        onChange(composePanamaManualAddress(parts));
        onStructuredFromApi?.({
          ciudad: parts.corregimiento.trim(),
          provincia: "",
        });
      } else if (entryMode === "manual") {
        onChange("");
      }
    },
    [entryMode, onChange, onStructuredFromApi, worldwide],
  );

  const enterManualMode = useCallback(
    (keepSearchText = false) => {
      setMode("manual");
      setPanelOpen(false);
      setRows([]);
      searchLoading.hide();
      setSearchEmpty(false);
      setParsedHint("");
      selectedRef.current = "";
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (!keepSearchText) {
        setSearchQuery("");
        setManualParts(EMPTY_MANUAL);
        onChange("");
      } else if (searchQuery.trim() && !worldwide) {
        const next = { ...EMPTY_MANUAL, viaEdificio: searchQuery.trim() };
        setManualParts(next);
        syncManualToParent(next);
      }
    },
    [onChange, searchQuery, searchLoading, setMode, syncManualToParent, worldwide],
  );

  const returnToGeoSearch = useCallback(() => {
    setMode("geo");
    setManualParts(EMPTY_MANUAL);
    setManualError(null);
    setSearchEmpty(false);
    setParsedHint("");
    selectedRef.current = "";
    onChange("");
    setSearchQuery("");
    setPanelOpen(false);
    searchLoading.hide();
  }, [onChange, searchLoading, setMode]);

  const finalizeGeoPick = useCallback(
    (text: string, parsed: string) => {
      const t = text.trim();
      selectedRef.current = t;
      setSearchQuery(t);
      onChange(t);
      setParsedHint(parsed);
      setPanelOpen(false);
      setRows([]);
      setSearchEmpty(false);
      searchLoading.hide();
      requestSeq.current += 1;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    },
    [onChange, searchLoading],
  );

  const runSearch = useCallback(
    (raw: string, seq: number) => {
      const val = raw.trim();
      setSearchQuery(raw);
      if (entryMode === "manual") return;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      if (!val || val.length < MIN_SEARCH_CHARS) {
        setRows([]);
        setPanelOpen(false);
        setSearchEmpty(false);
        searchLoading.hide();
        return;
      }

      setRows([]);
      setSearchEmpty(false);
      setPanelOpen(true);
      searchLoading.show();

      debounceRef.current = setTimeout(() => {
        const fetchFn = worldwide
          ? geoapifyAutocompleteWorldwideClientSide
          : geoapifyAutocompletePanamaClientSide;
        void fetchFn(val)
          .then((items) => {
            if (seq !== requestSeq.current) return;
            if (items.length > 0) {
              setRows(
                items.map((it) => ({
                  kind: "api" as const,
                  text: formatGeoapifyDisplay(it) || "Dirección",
                  item: it,
                })),
              );
              setSearchEmpty(false);
            } else {
              setRows([]);
              setSearchEmpty(true);
            }
            setPanelOpen(true);
            searchLoading.hide();
          })
          .catch(() => {
            if (seq !== requestSeq.current) return;
            setRows([]);
            setSearchEmpty(true);
            setPanelOpen(true);
            searchLoading.hide();
          });
      }, DEBOUNCE_REMOTE_MS);
    },
    [entryMode, searchLoading, worldwide],
  );

  const onSearchInputChange = (raw: string) => {
    if (selectedRef.current && raw.trim() !== selectedRef.current) {
      selectedRef.current = "";
      setParsedHint("");
      onChange("");
    }
    const seq = ++requestSeq.current;
    runSearch(raw, seq);
  };

  const onPick = (row: SuggestionRow) => {
    const item = row.item;
    onStructuredFromApi?.({
      provincia: (item.state ?? "").trim(),
      ciudad: (item.city || item.suburb || item.county || "").trim(),
    });
    const fmt = formatGeoapifyDisplay(item);
    finalizeGeoPick(fmt, geoapifyParsedSummary(item));
  };

  const updateManualField = (key: keyof PanamaManualAddressParts, v: string) => {
    const next = { ...manualParts, [key]: v };
    setManualParts(next);
    syncManualToParent(next);
  };

  const showDropdownPanel =
    entryMode === "geo" &&
    !booting &&
    panelOpen &&
    searchQuery.trim().length >= MIN_SEARCH_CHARS;

  const showManualFallbackLink =
    entryMode === "geo" &&
    !booting &&
    !searchLoading.loading &&
    searchQuery.trim().length >= MIN_SEARCH_CHARS &&
    rows.length > 0 &&
    !searchEmpty;

  return (
    <div className="relative block">
      <span className="mb-1.5 block text-sm font-medium text-slate-800">{label}</span>
      <p className="mb-2 text-xs text-slate-600">
        {entryMode === "manual" ? (
          worldwide ? (
            <>
              Escriba la dirección completa de su local. Incluya calle, ciudad, código postal y
              país si aplica.
            </>
          ) : (
            <>
              En Panamá muchas direcciones no tienen nomenclatura oficial. Indique calle o edificio,
              corregimiento o barrio, y una referencia clara para que el equipo comercial ubique su
              local.
            </>
          )
        ) : (
          <>
            Busque primero su dirección en el mapa y elija una sugerencia si aparece. Si no la
            encuentra, podrá describirla con el mayor detalle posible.
          </>
        )}
      </p>

      <div className="relative">
        {booting ? (
          <div
            className="flex min-h-[96px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200/90 bg-white px-4 py-6"
            role="status"
            aria-live="polite"
            aria-label="Cargando búsqueda de dirección"
          >
            <span
              className="h-9 w-9 shrink-0 rounded-full border-2 border-[#4749B6]/20 border-t-[#4749B6] animate-spin"
              aria-hidden
            />
            <p className="text-center text-sm font-medium text-slate-700">Cargando…</p>
          </div>
        ) : null}

        <div className={booting ? "sr-only" : undefined}>
          {entryMode === "geo" ? (
            <div className="space-y-2">
              <div className="relative isolate">
                <textarea
                  id="afiliacion-direccion-verificada"
                  rows={3}
                  className={`${inputClass} min-h-[96px] resize-y ${searchLoading.loading ? "pr-11" : ""}`}
                  autoComplete="off"
                  placeholder={
                    worldwide
                      ? "Ej: Calle Mayor 1, Madrid · 221B Baker Street, London"
                      : "Ej: PH Trinity, Av. Balboa, Calle 50, Bella Vista…"
                  }
                  value={searchQuery}
                  aria-busy={searchLoading.loading}
                  aria-expanded={showDropdownPanel}
                  aria-controls={showDropdownPanel ? listboxId : undefined}
                  aria-autocomplete="list"
                  onChange={(e) => onSearchInputChange(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Escape") setPanelOpen(false);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length >= MIN_SEARCH_CHARS) {
                      const seq = ++requestSeq.current;
                      runSearch(searchQuery, seq);
                    }
                  }}
                  onBlur={() => {
                    window.setTimeout(() => setPanelOpen(false), 180);
                  }}
                />
                {searchLoading.loading ? (
                  <div
                    className="pointer-events-none absolute right-3 top-3 flex items-center gap-2"
                    aria-hidden
                  >
                    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[#4749B6]/20 border-t-[#4749B6] animate-spin" />
                  </div>
                ) : null}

                {showDropdownPanel ? (
                  <div
                    id={listboxId}
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
                  >
                    {searchLoading.loading ? (
                      <div
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700"
                        role="status"
                        aria-live="polite"
                      >
                        <span
                          className="h-5 w-5 shrink-0 rounded-full border-2 border-[#4749B6]/20 border-t-[#4749B6] animate-spin"
                          aria-hidden
                        />
                        Cargando…
                      </div>
                    ) : null}

                    {!searchLoading.loading && rows.length > 0
                      ? rows.map((row, i) => (
                          <button
                            key={`api-${i}-${row.text.slice(0, 24)}`}
                            type="button"
                            role="option"
                            className="block w-full cursor-pointer border-t border-slate-100 px-4 py-2.5 text-left text-sm text-slate-800 first:border-t-0 hover:bg-[#4749B6]/[0.06]"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              onPick(row);
                            }}
                          >
                            {row.text}
                          </button>
                        ))
                      : null}

                    {!searchLoading.loading && searchEmpty ? (
                      <div className="border-t border-amber-100 bg-amber-50/80 px-4 py-3">
                        <p className="text-sm text-slate-800">
                          No encontramos esa dirección en el mapa. Puede describirla con detalle.
                        </p>
                        <button
                          type="button"
                          className="mt-2 text-sm font-semibold text-[#4749B6] underline-offset-2 hover:underline"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            enterManualMode(true);
                          }}
                        >
                          {MANUAL_OPTION} →
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {showManualFallbackLink ? (
                <button
                  type="button"
                  className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-[#4749B6] hover:underline"
                  onClick={() => enterManualMode(true)}
                >
                  ¿No es ninguna de estas? {MANUAL_OPTION.toLowerCase()}
                </button>
              ) : null}
            </div>
          ) : worldwide ? (
            <div className="space-y-3">
              <textarea
                rows={4}
                className={`${inputClass} min-h-[120px] resize-y`}
                placeholder="Calle, número, edificio, ciudad, provincia/estado, país y referencias visibles."
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
              <button
                type="button"
                className="text-sm font-medium text-[#4749B6] underline-offset-2 hover:underline"
                onClick={returnToGeoSearch}
              >
                ← Volver a buscar en el mapa
              </button>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/50 p-4">
              <label className="block text-sm font-medium text-slate-800">
                Calle, avenida, edificio o PH
                <input
                  className={`${inputClass} mt-1`}
                  placeholder="Ej: PH Waters on the Bay, Av. Balboa, Calle 50"
                  value={manualParts.viaEdificio}
                  onChange={(e) => updateManualField("viaEdificio", e.target.value)}
                />
              </label>
              <label className="block text-sm font-medium text-slate-800">
                Corregimiento o barrio
                <input
                  className={`${inputClass} mt-1`}
                  placeholder="Ej: Bella Vista, San Francisco, David"
                  value={manualParts.corregimiento}
                  onChange={(e) => updateManualField("corregimiento", e.target.value)}
                />
              </label>
              <label className="block text-sm font-medium text-slate-800">
                Piso, local o apartamento
                <span className="ml-1 font-normal text-slate-500">(opcional)</span>
                <input
                  className={`${inputClass} mt-1`}
                  placeholder="Ej: Local 3, planta baja, oficina 402"
                  value={manualParts.detalleLocal}
                  onChange={(e) => updateManualField("detalleLocal", e.target.value)}
                />
              </label>
              <label className="block text-sm font-medium text-slate-800">
                Referencia para ubicar el local
                <input
                  className={`${inputClass} mt-1`}
                  placeholder="Ej: Frente al Rey, portón azul, al lado de la farmacia X"
                  value={manualParts.referencia}
                  onChange={(e) => updateManualField("referencia", e.target.value)}
                />
              </label>
              {manualError ? (
                <p className="text-xs text-amber-800" role="alert">
                  {manualError}
                </p>
              ) : null}
              <button
                type="button"
                className="text-sm font-medium text-[#4749B6] underline-offset-2 hover:underline"
                onClick={returnToGeoSearch}
              >
                ← Volver a buscar en el mapa
              </button>
            </div>
          )}

          {parsedHint && entryMode === "geo" ? (
            <p className="mt-2 text-xs text-slate-600">{parsedHint}</p>
          ) : null}
          {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
