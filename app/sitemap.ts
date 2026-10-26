import type { MetadataRoute } from "next";
import { CATEGORY_SEO, getPublicItemSlugs, SITE_URL } from "@/lib/seo";
import { COUNTRIES } from "@/lib/countries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/como-funciona`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/legal`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/devoluciones`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ...Object.keys(CATEGORY_SEO).map((slug) => ({ url: `${SITE_URL}/c/${slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...COUNTRIES.map((country) => ({ url: `${SITE_URL}/pais/${country.code.toLowerCase()}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
  const itemSlugs = await getPublicItemSlugs();
  pages.push(...itemSlugs.map((slug) => ({ url: `${SITE_URL}/i/${encodeURIComponent(slug)}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })));
  return pages;
}
