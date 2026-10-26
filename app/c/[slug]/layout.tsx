import type { Metadata } from "next";
import { CATEGORY_SEO, SITE_NAME, SITE_URL } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_SEO[slug];
  if (!category) return { title: "Categoría", robots: { index: false, follow: false } };
  const url = `${SITE_URL}/c/${slug}`;
  const image = `/c/${slug}/opengraph-image`;
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "es_ES", url, title: `${category.name} | mifavorito`, description: category.description, images: [{ url: image, width: 1200, height: 630, alt: `${category.name} en mifavorito` }] },
    twitter: { card: "summary_large_image", title: `${category.name} | mifavorito`, description: category.description, images: [image] },
  };
}

export default function CategoryLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
