"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { PANAMA_ADDRESS_LOCAL_SUGGESTIONS } from "@/lib/panama-address-seed";
import {
  filterLocalAddressSuggestions,
  normalizeAddressSearchText,
} from "@/lib/address-search-match";
import {
  formatGeoapifyDisplay,
  geoapifyAutocompletePanamaClientSide,
  geoapifyAutocompleteWorldwideClientSide,
  geoapifyParsedSummary,
  type GeoapifyAddressItem,
} from "@/lib/geoapify-address";

const MIN_BOOT_MS = 450;
const DEBOUNCE_REMOTE_MS = 120;
const LOCAL_MERGE_CAP = 8;
const LOCAL_LIST_CAP = 24;
const OTHER_OPTION = "Otra dirección (especificar)";

function parsedFromLocalPick(addr: string): string {
  if (addr === OTHER_OPTION) return "";
  const m = addr.match(/^(.+),\s*(.+)$/);
  if (m) {
    return `Barrio / corregimiento: ${m[1].trim()} · Provincia / región: ${m[2].trim()}`;
  }
  return "";
}

type SuggestionRow =
  | { kind: "local"; text: string }
  | { kind: "api"; text: string; item: GeoapifyAddressItem };

function dedupeSuggestionRows(rows: SuggestionRow[]): SuggestionRow[] {
  const seen = new Set<string>();
  const out: SuggestionRow[] = [];
  for (const r of rows) {
    const k = normalizeAddressSearchText(r.text);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

export type AfiliacionAddressStructuredMeta = {
  provincia: string;
  ciudad: string;
};

export type AfiliacionAddressFieldVariant = "panama" | "worldwide";

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  inputClass: string;
  variant?: AfiliacionAddressFieldVariant;
  onStructuredFromApi?: (meta: AfiliacionAddressStructuredMeta) => void;
};

export function AfiliacionAddressPaField({
  label,
  hint,
  value,
  onChange,
  inputClass,
  variant = "panama",
  onStructuredFromApi,
}: Props) {
  const listboxId = useId();
  const worldwide = variant === "worldwide";
  const [booting, setBooting] = useState(true);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [rows, setRows] = useState<SuggestionRow[]>([]);
  const [parsedHint, setParsedHint] = useState("");
  const selectedRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);

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

  const finalizePick = useCallback(
    (text: string, parsed: string) => {
      const t = text.trim();
      selectedRef.current = t;
      onChange(t);
      setParsedHint(parsed);
      setOpen(false);
      setFetching(false);
      setRows([]);
      requestSeq.current += 1;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    },
    [onChange],
  );

  const renderLocalRows = useCallback((raw: string) => {
    const matches = filterLocalAddressSuggestions(
      raw,
      PANAMA_ADDRESS_LOCAL_SUGGESTIONS,
      LOCAL_LIST_CAP,
    );
    const out: SuggestionRow[] = [];
    if (matches.length === 0) {
      out.push({ kind: "local", text: OTHER_OPTION });
    } else {
      for (const a of matches) {
        out.push({ kind: "local", text: a });
      }
    }
    setRows(out);
    setOpen(true);
  }, []);

  const renderWorldFallbackRows = useCallback(() => {
    setRows([{ kind: "local", text: OTHER_OPTION }]);
    setOpen(true);
  }, []);

  const runSearch = useCallback(
    (raw: string, seq: number) => {
      const val = raw.trim();
      if (!val) {
        setRows([]);
        setOpen(false);
        setFetching(false);
        return;
      }
      const useRemote = val.length >= 2;
      if (useRemote) {
        setFetching(true);
        setOpen(true);
        setRows([]);
        debounceRef.current = setTimeout(() => {
          const fetchFn = worldwide
            ? geoapifyAutocompleteWorldwideClientSide
            : geoapifyAutocompletePanamaClientSide;
          void fetchFn(val)
            .then((items) => {
              if (seq !== requestSeq.current) return;
              setFetching(false);
              if (worldwide) {
                if (items.length > 0) {
                  const apiRows: SuggestionRow[] = items.map((it) => ({
                    kind: "api" as const,
                    text: formatGeoapifyDisplay(it) || "Dirección",
                    item: it,
                  }));
                  const merged = dedupeSuggestionRows(apiRows);
                  merged.push({ kind: "local", text: OTHER_OPTION });
                  setRows(merged);
                } else {
                  renderWorldFallbackRows();
                }
              } else {
                const localHits = filterLocalAddressSuggestions(
                  val,
                  PANAMA_ADDRESS_LOCAL_SUGGESTIONS,
                  LOCAL_MERGE_CAP,
                ).map((text) => ({ kind: "local" as const, text }));

                if (items.length > 0) {
                  const apiRows: SuggestionRow[] = items.map((it) => ({
                    kind: "api" as const,
                    text: formatGeoapifyDisplay(it) || "Dirección",
                    item: it,
                  }));
                  const merged = dedupeSuggestionRows([
                    ...localHits,
                    ...apiRows,
                  ]);
                  merged.push({ kind: "local", text: OTHER_OPTION });
                  setRows(merged);
                } else {
                  renderLocalRows(val);
                }
              }
              setOpen(true);
            })
            .catch(() => {
              if (seq !== requestSeq.current) return;
              setFetching(false);
              if (worldwide) {
                renderWorldFallbackRows();
              } else {
                renderLocalRows(val);
              }
              setOpen(true);
            });
        }, DEBOUNCE_REMOTE_MS);
        return;
      }
      setFetching(false);
      if (worldwide) {
        renderWorldFallbackRows();
      } else {
        renderLocalRows(val);
      }
    },
    [renderLocalRows, renderWorldFallbackRows, worldwide],
  );

  const onInputChange = (raw: string) => {
    if (selectedRef.current && raw.trim() !== selectedRef.current) {
      selectedRef.current = "";
    }
    onChange(raw);
    if (!raw.trim()) {
      setParsedHint("");
      setRows([]);
      setOpen(false);
      setFetching(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const seq = ++requestSeq.current;
    runSearch(raw, seq);
  };

  const onPick = (row: SuggestionRow) => {
    if (row.kind === "local") {
      if (row.text === OTHER_OPTION) {
        finalizePick(value, "");
        return;
      }
      const m = row.text.match(/^(.+),\s*(.+)$/);
      onStructuredFromApi?.({
        ciudad: m ? m[1].trim() : "",
        provincia: m ? m[2].trim() : "",
      });
      finalizePick(row.text, parsedFromLocalPick(row.text));
      return;
    }
    const item = row.item;
    onStructuredFromApi?.({
      provincia: (item.state ?? "").trim(),
      ciudad: (
        item.city ||
        item.suburb ||
        item.county ||
        ""
      ).trim(),
    });
    const fmt = formatGeoapifyDisplay(item);
    finalizePick(fmt, geoapifyParsedSummary(item));
  };

  return (
    <div className="relative block">
      <span className="mb-1.5 block text-sm font-medium text-slate-800">{label}</span>
      <p className="mb-2 text-xs text-slate-600">
        {worldwide ? (
          <>
            Escriba calle, ciudad y país (o código postal) y elija una sugerencia. Si no
            aparece su dirección exacta, use{" "}
            <span className="font-medium">Otra dirección (especificar)</span> y complétela
            a mano.
          </>
        ) : (
          <>
            Escriba calle, barrio, torre o abreviatura (ej.{" "}
            <span className="font-medium">PH</span> o{" "}
            <span className="font-medium">P.H.</span>) y elija una sugerencia. La lista
            combina coincidencias locales con direcciones verificadas en Panamá vía
            Geoapify.
          </>
        )}
      </p>

      <div className="relative min-h-[96px]">
        {booting ? (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200/90 bg-white/92 px-4 py-6 backdrop-blur-sm"
            role="status"
            aria-live="polite"
            aria-label="Cargando sugerencias de dirección"
          >
            <span
              className="h-9 w-9 shrink-0 rounded-full border-2 border-[#4749B6]/20 border-t-[#4749B6] animate-spin"
              aria-hidden
            />
            <p className="text-center text-sm font-medium text-slate-700">
              {worldwide
                ? "Preparando búsqueda de direcciones…"
                : "Preparando direcciones para Panamá…"}
            </p>
            <p className="text-center text-xs text-slate-500">Un momento por favor.</p>
          </div>
        ) : null}

        <div className={booting ? "pointer-events-none opacity-40" : ""}>
          <div className="relative">
            <textarea
              id="afiliacion-direccion-verificada"
              rows={3}
              className={`${inputClass} min-h-[96px] resize-y ${fetching && !booting ? "pr-11" : ""}`}
              autoComplete="off"
              placeholder={
                worldwide
                  ? "Ej: Calle Mayor 1, Madrid · 221B Baker Street, London"
                  : "Ej: PH Trinity, Av. Balboa, Calle 50, Bella Vista…"
              }
              value={value}
              aria-busy={fetching && !booting}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              onFocus={() => {
                if (value.trim()) {
                  const seq = ++requestSeq.current;
                  runSearch(value, seq);
                }
              }}
              onBlur={() => {
                window.setTimeout(() => {
                  setOpen(false);
                  setFetching(false);
                }, 160);
              }}
            />
            {fetching && !booting ? (
              <div
                className="pointer-events-none absolute right-3 top-3 flex items-center gap-2"
                aria-hidden
              >
                <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[#4749B6]/20 border-t-[#4749B6] animate-spin" />
              </div>
            ) : null}
            {fetching && !booting ? (
              <p
                className="mt-1 flex items-center gap-2 text-xs text-slate-500"
                aria-live="polite"
              >
                Buscando coincidencias…
              </p>
            ) : null}

            {open && !fetching && rows.length > 0 ? (
              <ul
                id={listboxId}
                role="listbox"
                className="absolute left-0 right-0 top-full z-40 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
              >
                {rows.map((row, i) => {
                  const isOther = row.kind === "local" && row.text === OTHER_OPTION;
                  return (
                    <li
                      key={`${row.kind}-${i}-${row.text.slice(0, 24)}`}
                      role="option"
                      aria-selected={false}
                      className={
                        isOther
                          ? "cursor-pointer border-t border-slate-200 bg-amber-50/80 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50"
                          : "cursor-pointer border-t border-slate-100 px-4 py-2.5 text-sm text-slate-800 first:border-t-0 hover:bg-[#4749B6]/[0.06]"
                      }
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onPick(row);
                      }}
                    >
                      {row.text}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {parsedHint ? (
            <p className="mt-2 text-xs text-slate-600">{parsedHint}</p>
          ) : null}
          {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
