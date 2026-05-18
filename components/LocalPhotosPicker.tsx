"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

const MAX_FILES = 5;

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function mergeFiles(current: File[], incoming: File[]): File[] {
  const map = new Map<string, File>();
  for (const f of current) map.set(fileKey(f), f);
  for (const f of incoming) map.set(fileKey(f), f);
  return Array.from(map.values()).slice(0, MAX_FILES);
}

type LocalPhotosPickerProps = {
  files: File[];
  onChange: (files: File[]) => void;
  labels: {
    dropzone: string;
    dropzoneActive: string;
    browse: string;
    count: string;
    remove: string;
    maxReached: string;
  };
};

export function LocalPhotosPicker({ files, onChange, labels }: LocalPhotosPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState<{ key: string; url: string }[]>([]);

  useEffect(() => {
    const next = files.map((f) => ({ key: fileKey(f), url: URL.createObjectURL(f) }));
    setPreviews(next);
    return () => {
      for (const p of next) URL.revokeObjectURL(p.url);
    };
  }, [files]);

  const addFiles = useCallback(
    (incoming: File[]) => {
      const images = incoming.filter(
        (f) => f.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(f.name),
      );
      if (images.length === 0) return;
      onChange(mergeFiles(files, images));
    },
    [files, onChange],
  );

  const removeFile = (key: string) => {
    onChange(files.filter((f) => fileKey(f) !== key));
  };

  const atMax = files.length >= MAX_FILES;

  return (
    <div className="space-y-4">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          if (!atMax) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (atMax) return;
          addFiles(Array.from(e.dataTransfer.files));
        }}
        className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition sm:min-h-[160px] ${
          dragOver
            ? "border-[#4749B6] bg-[#4749B6]/5"
            : atMax
              ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70"
              : "border-slate-300 bg-slate-50/80 hover:border-[#4749B6]/50 hover:bg-white"
        }`}
      >
        <span className="text-sm font-semibold text-slate-800">
          {dragOver ? labels.dropzoneActive : atMax ? labels.maxReached : labels.dropzone}
        </span>
        {!atMax ? (
          <span className="mt-3 inline-flex rounded-lg bg-[#4749B6] px-4 py-2 text-sm font-medium text-white shadow-sm">
            {labels.browse}
          </span>
        ) : null}
        <span className="mt-2 text-xs text-slate-500">{labels.count}</span>
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        disabled={atMax}
        onChange={(e) => {
          addFiles(e.target.files ? Array.from(e.target.files) : []);
          e.target.value = "";
        }}
      />

      {previews.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {previews.map((p, i) => {
            const file = files.find((f) => fileKey(f) === p.key);
            if (!file) return null;
            return (
              <li
                key={p.key}
                className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(p.key)}
                  className="absolute right-1 top-1 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/70"
                  aria-label={`${labels.remove} ${file.name}`}
                >
                  {labels.remove}
                </button>
                <p className="truncate px-2 py-1.5 text-[11px] text-slate-600" title={file.name}>
                  {i + 1}. {file.name}
                </p>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
