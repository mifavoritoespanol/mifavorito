import { ImageResponse } from "next/og";
import { getCountrySeo } from "@/lib/seo";
import { OgCard } from "@/lib/og-card";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Favoritos locales en mifavorito";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const country = getCountrySeo(code);
  return new ImageResponse(<OgCard eyebrow="Favoritos locales" title={country ? `Favoritos de ${country.name}` : "Favoritos locales"} subtitle={country ? `Descubre bebidas, comidas y artistas asociados a ${country.name}.` : "El sitio que te da voz."} country={country?.code} />, size);
}
