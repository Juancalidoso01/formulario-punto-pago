"use client";

import { useEffect, useId, useState } from "react";
import { isAvisoDocument } from "@/lib/upload-files";

type DocumentFilePickerProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  labels: {
    dropzone: string;
    dropzoneActive: string;
    browse: string;
    remove: string;
    formatHint: string;
    invalidType: string;
  };
};

export function DocumentFilePicker({ file, onChange, labels }: DocumentFilePickerProps) {
  const inputId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = (incoming: File | null) => {
    if (!incoming) {
      onChange(null);
      setTypeError(null);
      return;
    }
    if (!isAvisoDocument(incoming)) {
      setTypeError(labels.invalidType);
      onChange(null);
      return;
    }
    setTypeError(null);
    onChange(incoming);
  };

  const onIncomingList = (list: FileList | File[]) => {
    const first = Array.from(list)[0];
    if (first) pickFile(first);
  };

  const isPdf = file?.type === "application/pdf";

  return (
    <div className="space-y-3">
      {!file ? (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onIncomingList(e.dataTransfer.files);
          }}
          className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition sm:min-h-[160px] ${
            dragOver
              ? "border-[#4749B6] bg-[#4749B6]/5"
              : "border-slate-300 bg-slate-50/80 hover:border-[#4749B6]/50 hover:bg-white"
          }`}
        >
          <span className="text-sm font-semibold text-slate-800">
            {dragOver ? labels.dropzoneActive : labels.dropzone}
          </span>
          <span className="mt-3 inline-flex rounded-lg bg-[#4749B6] px-4 py-2 text-sm font-medium text-white shadow-sm">
            {labels.browse}
          </span>
          <span className="mt-2 text-xs text-slate-500">{labels.formatHint}</span>
        </label>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="h-32 w-full max-w-[200px] rounded-lg border border-slate-100 object-cover sm:h-28"
              />
            ) : isPdf ? (
              <div
                className="flex h-28 w-full max-w-[200px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50"
                aria-hidden
              >
                <span className="text-3xl font-bold text-[#4749B6]">PDF</span>
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="break-all text-sm font-medium text-slate-800">{file.name}</p>
              <p className="mt-1 text-xs text-slate-500">{labels.formatHint}</p>
              <button
                type="button"
                onClick={() => pickFile(null)}
                className="mt-3 text-sm font-medium text-[#4749B6] underline-offset-2 hover:underline"
              >
                {labels.remove}
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        id={inputId}
        type="file"
        accept="application/pdf,image/*,.pdf"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          pickFile(f);
          e.target.value = "";
        }}
      />

      {typeError ? <p className="text-sm text-red-600">{typeError}</p> : null}
    </div>
  );
}
