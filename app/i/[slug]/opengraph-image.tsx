import { ImageResponse } from "next/og";
import { getPublicItemSeo, getCountrySeo } from "@/lib/seo";
import { OgCard } from "@/lib/og-card";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Favorito de mifavorito — El sitio que te da voz";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getPublicItemSeo(slug);
  const country = item?.country_code ? getCountrySeo(item.country_code) : null;
  return new ImageResponse(<OgCard eyebrow={item?.categoryName ?? "Favorito"} title={item?.name ?? "Descubre tus favoritos"} subtitle={country ? `Una opción de ${country.name}. Apoya y comparte en mifavorito.` : "Apoya y comparte tus favoritos en mifavorito."} country={country?.name} />, size);
}
