import type { Metadata } from "next";
import { getPublicItemSeo, getCountrySeo, SITE_NAME, SITE_URL } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicItemSeo(slug);
  if (!item) return { title: "Opción no encontrada", robots: { index: false, follow: false } };
  const country = item.country_code ? getCountrySeo(item.country_code) : null;
  const description = [item.description, country ? `País: ${country.name}.` : null, `Clasificación de ${item.categoryName.toLowerCase()} en mifavorito.`].filter(Boolean).join(" ").slice(0, 300);
  const url = `${SITE_URL}/i/${slug}`;
  const image = `/i/${slug}/opengraph-image`;
  return {
    title: `${item.name} · ${item.categoryName}`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "es_ES", url, title: `${item.name} | mifavorito`, description, images: [{ url: image, width: 1200, height: 630, alt: `${item.name} en mifavorito` }] },
    twitter: { card: "summary_large_image", title: `${item.name} | mifavorito`, description, images: [image] },
  };
}

export default function ItemLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
