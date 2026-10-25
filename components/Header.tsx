"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/shared";
import { getCountrySnapshot, getServerCountrySnapshot, subscribeToCountry } from "@/lib/country";
import Logo from "@/components/Logo";

const COUNTRIES = [
  ["ES", "🇪🇸"], ["MX", "🇲🇽"], ["AR", "🇦🇷"], ["CO", "🇨🇴"],
  ["CL", "🇨🇱"], ["PE", "🇵🇪"], ["VE", "🇻🇪"], ["EC", "🇪🇨"],
  ["GT", "🇬🇹"], ["CU", "🇨🇺"], ["BO", "🇧🇴"], ["DO", "🇩🇴"],
  ["HN", "🇭🇳"], ["PY", "🇵🇾"], ["SV", "🇸🇻"], ["NI", "🇳🇮"],
  ["CR", "🇨🇷"], ["PA", "🇵🇦"], ["UY", "🇺🇾"], ["GQ", "🇬🇶"],
  ["US", "🇺🇸"],
] as const;

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

  const selectedFlag = COUNTRIES.find(([code]) => code === country)?.[1] ?? "🇪🇸";
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
                {COUNTRIES.map(([code]) => (
                  <option key={code} value={code} className="bg-zinc-900 text-white">{code}</option>
                ))}
              </select>
            </label>
            <nav className="text-sm font-semibold text-zinc-400">
              <Link href="/como-funciona" className="hover:text-white">Cómo funciona</Link>
            </nav>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3">
          <Link href="/" className={pill(path === "/")}>Todo</Link>
          {categories.map((category) =>
            category.slug === "estrellas" ? (
              <Link key={category.id} href={`/c/${category.slug}`} className={pill(path === `/c/${category.slug}`)}>
                {category.emoji} Cantantes
              </Link>
            ) : (
              <span
                key={category.id}
                aria-disabled="true"
                title="Próximamente"
                className="whitespace-nowrap rounded-full border border-zinc-800/70 bg-zinc-900/40 px-3.5 py-1.5 text-sm font-semibold text-zinc-500/70"
              >
                🔒 {category.name}
              </span>
            )
          )}
        </div>
      </div>
    </header>
  );
}
