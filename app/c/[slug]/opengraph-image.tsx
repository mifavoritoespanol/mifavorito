import { ImageResponse } from "next/og";
import { CATEGORY_SEO } from "@/lib/seo";
import { OgCard } from "@/lib/og-card";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Categoría de mifavorito — El sitio que te da voz";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = CATEGORY_SEO[slug];
  return new ImageResponse(<OgCard eyebrow="Elección" title={category?.name ?? "Descubre tus favoritos"} subtitle={category?.description ?? "Elige y apoya a tus favoritos."} />, size);
}
