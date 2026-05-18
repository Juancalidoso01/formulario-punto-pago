import { notFound } from "next/navigation";
import { AfiliacionChrome } from "@/components/AfiliacionChrome";
import { ServicioBrochureArticle } from "@/components/ServicioBrochureArticle";
import { esServicioPrincipalValido, SERVICIO_PRINCIPAL_PUNTO_PAGO } from "@/lib/afiliacion-opciones";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return SERVICIO_PRINCIPAL_PUNTO_PAGO.map((s) => ({ id: s.id }));
}

export default async function ServicioBrochurePage({ params }: Props) {
  const { id } = await params;
  if (!esServicioPrincipalValido(id)) notFound();

  return (
    <AfiliacionChrome>
      <ServicioBrochureArticle id={id} />
    </AfiliacionChrome>
  );
}
