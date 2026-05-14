import { redirect } from "next/navigation";

/** Mantiene enlaces antiguos: el onboarding de líneas vive ahora en `/`. */
export default function ServiciosAliasPage() {
  redirect("/");
}
