"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/shared";
import { getCountrySnapshot, getServerCountrySnapshot, subscribeToCountry } from "@/lib/country";
import { COUNTRIES, countryFlag } from "@/lib/countries";
import Logo from "@/components/Logo";

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flagFailed, setFlagFailed] = useState(false);
  const path = usePathname();
  const country = useSyncExternalStore(subscribeToCountry, getCountrySnapshot, getServerCountrySnapshot);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("sort")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const selectedFlag = countryFlag(country);
  const pill = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
      active
        ? "border-zinc-500 bg-zinc-800 text-white"
        : "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-600"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex items-center justify-between gap-3 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Logo size={32} />
            <span className="min-w-0">
              <span className="block truncate text-xl font-extrabold leading-tight tracking-tight">mifavorito</span>
              <span className="block max-w-[15rem] truncate text-[10px] leading-4 text-zinc-300 sm:text-xs">El sitio que te da voz.</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <label className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-sm font-bold text-zinc-100">
              {flagFailed ? (
                <span aria-hidden="true">{selectedFlag}</span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://flagcdn.com/24x18/${country.toLowerCase()}.png`}
                  alt=""
                  width={24}
                  height={18}
                  onError={() => setFlagFailed(true)}
                  className="h-[18px] w-6 rounded-[2px] object-cover shadow-sm"
                />
              )}
              <select
                aria-label="Elegir país"
                value={country}
                onChange={(event) => {
                  const nextCountry = event.target.value;
                  setFlagFailed(false);
                  window.localStorage.setItem("mifavorito-country", nextCountry);
                  window.dispatchEvent(new CustomEvent("mifavorito-country-changed", { detail: { country: nextCountry } }));
                }}
                className="cursor-pointer appearance-none bg-transparent pr-0.5 outline-none"
              >
                {COUNTRIES.map(({ code }) => (
                  <option key={code} value={code} className="bg-zinc-900 text-white">{countryFlag(code)} {code}</option>
                ))}
              </select>
            </label>
            <nav className="text-sm font-semibold text-zinc-400">
              <Link href="/como-funciona" className="hover:text-white">Cómo funciona</Link>
            </nav>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3">
          {categories.filter((category) => ["estrellas", "paises", "empresas"].includes(category.slug)).map((category) => {
            const label = category.slug === "estrellas"
              ? "Música"
              : category.slug === "paises"
                ? "Países"
                : "Empresas";
            return (
              <Link key={category.id} href={`/c/${category.slug}`} className={pill(path === `/c/${category.slug}`)}>
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
