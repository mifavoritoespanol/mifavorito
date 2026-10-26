import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORY_SEO, getCountrySeo } from "@/lib/seo";
import { countryFlag } from "@/lib/countries";

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const country = getCountrySeo(code);
  if (!country) notFound();
  const categories = Object.entries(CATEGORY_SEO).filter(([slug]) => ["bebidas", "comidas", "estrellas", "empresas"].includes(slug));

  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-10">
      <Link href="/" className="text-sm text-zinc-400 underline underline-offset-4 hover:text-white">← Volver al inicio</Link>
      <section className="mt-7 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-9">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="text-5xl">{countryFlag(country.code)}</span>
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/70">Favoritos locales</p><h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">Favoritos de {country.name}</h1></div>
        </div>
        <p className="mt-5 max-w-2xl leading-7 text-zinc-300">Explora bebidas, comidas, artistas y empresas asociados a {country.name}. Elige una categoría para ver las opciones y apoyar tus favoritos.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {categories.map(([slug, category]) => (
            <Link key={slug} href={`/c/${slug}?pais=${country.code}`} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:border-amber-200/30 hover:bg-white/[0.07]">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-200/70">{category.name}</span>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{category.description}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-white group-hover:text-amber-100">Explorar {country.name} →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
