"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/shared";
import Logo from "@/components/Logo";
 
export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [path, setPath] = useState("");
 
  useEffect(() => {
    setPath(window.location.pathname);
    supabase
      .from("categories")
      .select("*")
      .order("sort")
      .then(({ data }) => setCategories(data ?? []));
  }, []);
 
  const pill = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
      active
        ? "btn-apoyar border-transparent"
        : "border-zinc-800 bg-zinc-900 text-zinc-300"
    }`;
 
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto max-w-xl px-4">
        <div className="flex items-center justify-between py-3">
          <a href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-extrabold tracking-tight">
              mifavorito
            </span>
          </a>
          <nav className="text-sm font-semibold text-zinc-400">
            <a href="/como-funciona">Cómo funciona</a>
          </nav>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3">
          <a href="/" className={pill(path === "/")}>
            Todo
          </a>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/c/${c.slug}`}
              className={pill(path === `/c/${c.slug}`)}
            >
              {c.emoji} {c.name}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
 