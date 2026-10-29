"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/shared";
import { getCountrySnapshot, getServerCountrySnapshot, subscribeToCountry } from "@/lib/country";
import { COUNTRIES } from "@/lib/countries";
import Logo from "@/components/Logo";
import { FaCircleInfo } from "react-icons/fa6";
import { useAdminMode } from "@/components/AdminModeProvider";

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flagFailed, setFlagFailed] = useState(false);
  const path = usePathname();
  const country = useSyncExternalStore(subscribeToCountry, getCountrySnapshot, getServerCountrySnapshot);
  const { isAdmin } = useAdminMode();

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("sort")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const pill = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
      active
        ? "border-zinc-500 bg-zinc-800 text-white"
        : "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-600"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl px-4">
        {isAdmin && <div className="flex items-center justify-between gap-3 border-b border-amber-200/15 py-2 text-[11px] font-bold uppercase tracking-wider text-amber-100"><span>Vista administrativa · categorías desbloqueadas</span><Link href="/montana" className="rounded-full border border-amber-100/20 px-3 py-1 normal-case tracking-normal hover:bg-white/10">Administración</Link></div>}
        <div className="flex items-center justify-between gap-3 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Logo size={32} />
            <span className="min-w-0">
              <span className="block truncate text-xl font-extrabold leading-tight tracking-tight">mifavorito</span>
              <span className="block max-w-[15rem] truncate text-[10px] leading-4 text-zinc-300 sm:text-xs">El sitio que te da voz.</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <nav className="shrink-0 text-sm font-semibold text-zinc-400">
              <Link href="/como-funciona" className="flex items-center gap-1.5 whitespace-nowrap hover:text-white">
                <FaCircleInfo aria-hidden="true" className="text-blue-400" />
                <span>Cómo funciona</span>
              </Link>
            </nav>
            <details className="relative">
              <summary aria-label="Elegir país" className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-sm font-bold text-zinc-100 [&::-webkit-details-marker]:hidden">
                {!flagFailed && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={"https://flagcdn.com/24x18/" + country.toLowerCase() + ".png"}
                    alt=""
                    width={24}
                    height={18}
                    onError={() => setFlagFailed(true)}
                    className="h-[18px] w-6 rounded-[2px] object-cover shadow-sm"
                  />
                )}
                <span>{country}</span>
                <span aria-hidden="true" className="ml-0.5 text-[10px] text-zinc-400">▾</span>
              </summary>
              <div role="listbox" aria-label="Choisir un pays" className="absolute right-0 top-full z-50 mt-2 max-h-80 w-64 overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-1.5 shadow-2xl">
                {COUNTRIES.map(({ code, name }) => (
                  <button
                    key={code}
                    type="button"
                    role="option"
                    aria-selected={country === code}
                    onClick={(event) => {
                      setFlagFailed(false);
                      window.localStorage.setItem("mifavorito-country", code);
                      window.dispatchEvent(new CustomEvent("mifavorito-country-changed", { detail: { country: code } }));
                      const details = event.currentTarget.closest("details");
                      if (details) details.open = false;
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-zinc-800 ${
                      country === code ? "bg-zinc-800 text-white" : "text-zinc-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={"https://flagcdn.com/24x18/" + code.toLowerCase() + ".png"}
                      alt=""
                      width={24}
                      height={18}
                      className="h-[18px] w-6 rounded-[2px] object-cover shadow-sm"
                    />
                    <span className="w-6 font-bold">{code}</span>
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </details>

          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3">
          {categories
            .filter((category) => ["bebidas", "comidas", "lugares", "paises", "empresas", "estrellas"].includes(category.slug))
            .sort((a, b) => ["bebidas", "comidas", "lugares", "paises", "empresas", "estrellas"].indexOf(a.slug) - ["bebidas", "comidas", "lugares", "paises", "empresas", "estrellas"].indexOf(b.slug))
            .map((category) => {
            const label = category.slug === "estrellas"
              ? "Música"
              : category.slug === "bebidas"
                ? "Bebidas"
                : category.slug === "comidas"
                  ? "Comida"
                  : category.slug === "lugares"
                ? "Lugares"
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
