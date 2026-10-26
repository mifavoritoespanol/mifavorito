import { ImageResponse } from "next/og";
import { OgCard } from "@/lib/og-card";

export const alt = "mifavorito — El sitio que te da voz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<OgCard eyebrow="Elecciones" title="El sitio que te da voz" subtitle="Apoya tus favoritos. Haz que tu voz cuente." />, size);
}
