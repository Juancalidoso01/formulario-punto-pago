"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { filterCatalogOptions } from "@/lib/catalog-search";

const DEFAULT_MAX = 48;

type Props = {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  placeholder: string;
  id?: string;
  maxResults?: number;
};

export function SearchableSelect({
  options,
  value,
  onChange,
  inputClass,
  placeholder,
  id,
  maxResults = DEFAULT_MAX,
}: Props) {
  const listboxId = useId();
  const inputId = id ?? listboxId;
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = useMemo(
    () => filterCatalogOptions(query, options, maxResults),
    [query, options, maxResults],
  );

  const closePanel = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const pick = useCallback(
    (opt: string) => {
      onChange(opt);
      setQuery(opt);
      closePanel();
    },
    [closePanel, onChange],
  );

  const onInputChange = (raw: string) => {
    setQuery(raw);
    if (value && raw !== value) onChange("");
    setOpen(true);
    setActiveIndex(-1);
  };

  const scheduleBlurClose = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(() => {
      closePanel();
      setQuery(value);
    }, 180);
  };

  const cancelBlurClose = () => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      closePanel();
      setQuery(value);
      return;
    }
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1 >= filtered.length ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) pick(opt);
    }
  };

  const showPanel = open;
  const queryTrim = query.trim();
  const showTypeHint = showPanel && queryTrim.length === 0;
  const showEmpty = showPanel && queryTrim.length > 0 && filtered.length === 0;
  const showList = showPanel && filtered.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 && filtered[activeIndex]
              ? `${listboxId}-opt-${activeIndex}`
              : undefined
          }
          className={`${inputClass} pr-10`}
          placeholder={placeholder}
          value={query}
          autoComplete="off"
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => {
            cancelBlurClose();
            setOpen(true);
          }}
          onBlur={scheduleBlurClose}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? "Cerrar listado" : "Abrir listado"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#4749B6]"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            cancelBlurClose();
            setOpen((o) => !o);
            if (!open) setActiveIndex(-1);
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
            className={open ? "rotate-180 transition" : "transition"}
          >
            <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.08 1.04l-4.25 4.25a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
          </svg>
        </button>
      </div>

      {showPanel ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
          onMouseDown={cancelBlurClose}
        >
          {showTypeHint ? (
            <p className="px-4 py-2.5 text-xs text-slate-500">
              Escriba para filtrar o desplácese por las primeras opciones del catálogo.
            </p>
          ) : null}

          {showEmpty ? (
            <p className="px-4 py-2.5 text-sm text-slate-600">
              No hay coincidencias. Pruebe con otra palabra o elija «Otra…» al final del
              listado.
            </p>
          ) : null}

          {showList
            ? filtered.map((opt, i) => {
                const active = i === activeIndex;
                return (
                  <button
                    key={opt}
                    id={`${listboxId}-opt-${i}`}
                    type="button"
                    role="option"
                    aria-selected={value === opt}
                    className={
                      active
                        ? "block w-full px-4 py-2.5 text-left text-sm bg-[#4749B6]/10 text-[#0B0B13]"
                        : "block w-full px-4 py-2.5 text-left text-sm text-slate-800 hover:bg-[#4749B6]/[0.06]"
                    }
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => pick(opt)}
                  >
                    {opt}
                  </button>
                );
              })
            : null}
        </div>
      ) : null}
    </div>
  );
}
