import type { Metadata } from "next";
import { getCountrySeo, SITE_NAME, SITE_URL } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const country = getCountrySeo(code);
  if (!country) return { title: "País no encontrado", robots: { index: false, follow: false } };
  const url = `${SITE_URL}/pais/${country.code.toLowerCase()}`;
  const image = `/pais/${country.code.toLowerCase()}/opengraph-image`;
  const title = `Favoritos de ${country.name}`;
  const description = `Explora las bebidas, comidas y artistas asociados a ${country.name}. Apoya tus favoritos en mifavorito.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "es_ES", url, title: `${title} | mifavorito`, description, images: [{ url: image, width: 1200, height: 630, alt: `${title} en mifavorito` }] },
    twitter: { card: "summary_large_image", title: `${title} | mifavorito`, description, images: [image] },
  };
}

export default function CountryLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
