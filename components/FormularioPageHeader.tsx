"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

export function FormularioPageHeader({ corporativo }: { corporativo: boolean }) {
  const { messages: m } = useI18n();

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <p>
        <span className="font-semibold text-[#0B0B13]">{m.formulario.step2of2}</span>
        {" · "}
        {corporativo ? m.formulario.corporate : m.formulario.affiliation}
      </p>
      <Link
        href="/"
        className="font-medium text-[#4749B6] underline-offset-2 hover:underline"
      >
        {m.formulario.back}
      </Link>
    </div>
  );
}
