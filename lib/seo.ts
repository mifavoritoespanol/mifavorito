import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { COUNTRIES } from "@/lib/countries";

export const SITE_URL = "https://mifavorito.app";
export const SITE_NAME = "mifavorito";

export const CATEGORY_SEO: Record<string, { name: string; description: string }> = {
  bebidas: { name: "Bebidas", description: "Descubre y apoya las bebidas más representativas de cada país en mifavorito." },
  comidas: { name: "Comida", description: "Explora los sabores locales y apoya la comida más querida de cada país." },
  estrellas: { name: "Música", description: "Apoya a artistas musicales del mundo hispanohablante y descubre quién lidera la elección." },
  paises: { name: "Países", description: "Compara los países que suman puntos en los podios de mifavorito." },
  empresas: { name: "Empresas", description: "Descubre marcas y empresas vinculadas a los países de nuestra comunidad." },
};

export function getCountrySeo(code: string) {
  const normalized = code.toUpperCase();
  return COUNTRIES.find((country) => country.code === normalized) ?? null;
}

export type PublicItemSeo = {
  name: string;
  description: string | null;
  country_code: string | null;
  image_url: string | null;
  category_id: number;
  categoryName: string;
  categorySlug: string;
};

export const getPublicItemSeo = cache(async (slug: string): Promise<PublicItemSeo | null> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  try {
    const supabase = createClient(url, key);
    const { data: item, error } = await supabase.from("items").select("name, description, country_code, image_url, category_id").eq("slug", slug).eq("status", "approved").maybeSingle();
    if (error || !item) return null;
    const { data: category } = await supabase.from("categories").select("name, slug").eq("id", item.category_id).maybeSingle();
    if (!category) return null;
    return { ...item, categoryName: category.name, categorySlug: category.slug };
  } catch {
    return null;
  }
});

export const getPublicItemSlugs = cache(async (): Promise<string[]> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from("items").select("slug").eq("status", "approved").not("slug", "is", null);
    if (error) return [];
    return (data ?? []).map((item) => item.slug).filter(Boolean);
  } catch {
    return [];
  }
});
