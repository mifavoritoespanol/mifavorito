"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Category, Item, SheetState } from "@/lib/shared";
import RankRow from "@/components/RankRow";
import Podium from "@/components/Podium";
import ItemSheet from "@/components/ItemSheet";
import AddItemSheet from "@/components/AddItemSheet";
import ElectionHero, { type ElectionStatus } from "@/components/ElectionHero";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function CategoryView() {
  const { slug } = useParams<{ slug: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [missing, setMissing] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [election, setElection] = useState<ElectionStatus | null>(null);
  const isOpen = election?.isOpen === true;

  useEffect(() => {

    async function load() {
      const { data: cat } = await supabase.from("categories").select("*").eq("slug", slug).single();
      if (!cat) { setMissing(true); return; }
      setCategory(cat);
      const { data } = await supabase.from("items").select("*").eq("category_id", cat.id).eq("status", "approved").order("total_cents", { ascending: false })
      .order("name", { ascending: true });
      setItems((data ?? []).map((item) => ({ ...item, category_slug: slug })));
    }
    load();
  }, [slug]);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/election-status?category=" + encodeURIComponent(slug), { cache: "no-store" });
        if (response.ok) {
          const status = await response.json();
          if (alive) setElection(status);
        }
      } catch { /* Keep the category locked if the schedule cannot be checked. */ }
    };
    void refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [slug]);

  const matching = useMemo(() => {
    const q = normalize(query.trim());
    return q ? items.filter((item) => normalize(item.name).includes(q)) : items;
  }, [items, query]);

    if (missing) return <main className="p-4">No encontrado.</main>;

  const allowPromo = false;
  const max = items[0]?.total_cents || 1;
  const top = query.trim() ? [] : items.slice(0, 3);
  const rest = query.trim() ? matching : items.slice(3);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-xl px-4 pb-20">
        <div className="flex items-center justify-between gap-3 py-4">
          <h1 className="text-3xl font-extrabold">{category?.emoji} {category?.slug === "estrellas" ? "Música" : category?.name}</h1>
          <button disabled={!isOpen} onClick={() => setAdding(query.trim())} className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40">+ Proponer opción</button>
        </div>
        {isOpen && <div className="mb-4"><ElectionHero status={election} categorySlug={slug} compact /></div>}
        <div className="relative min-h-[45vh]">
          <div inert={!isOpen} className={isOpen ? "" : "pointer-events-none select-none blur-[4px] opacity-45"}>
          <div className="mb-5">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={category?.slug === "estrellas" ? "Buscar artista…" : `Buscar ${category?.name.toLowerCase() ?? "opción"}…`} className="w-full rounded-full border border-zinc-700 bg-zinc-900/90 px-4 py-3 text-base text-white placeholder:text-zinc-500 focus:border-amber-300/60 focus:outline-none" />
          </div>

          {top.length > 0 && <Podium items={top} onSupport={(item) => setSheet({ item: { ...item, category_slug: slug }, mode: "support", allowPromo })} />}
          {rest.length > 0 ? (
            <ol className="space-y-3">
              {rest.map((item) => {
                const rank = items.filter((entry) => entry.total_cents > item.total_cents).length + 1;
                const above = items.find((entry) => entry.total_cents > item.total_cents);
                return <RankRow key={item.id} item={item} rank={rank} max={max} gap={above ? above.total_cents - item.total_cents : undefined} onSupport={() => setSheet({ item: { ...item, category_slug: slug }, mode: "support", allowPromo })} onShare={() => setSheet({ item: { ...item, category_slug: slug }, mode: "share", allowPromo })} />;
              })}
            </ol>
          ) : query.trim() ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 p-5 text-center text-sm text-zinc-400">
              <p>No encontramos «{query.trim()}» en esta categoría.</p>
              <button onClick={() => setAdding(query.trim())} className="btn-apoyar mt-4 rounded-full px-5 py-2.5">Proponer «{query.trim()}»</button>
            </div>
          ) : null}

          </div>
          {!isOpen && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/35 p-3">
              <ElectionHero status={election} categorySlug={slug} />
            </div>
          )}
        </div>
      </main>
      {isOpen && sheet && <ItemSheet item={sheet.item} mode={sheet.mode} allowPromo={sheet.allowPromo} onClose={() => setSheet(null)} />}
      {isOpen && adding !== null && category && <AddItemSheet categories={[category]} initialName={adding} onClose={() => setAdding(null)} />}
    </div>
  );
}

export default function CategoryPage() {
  return <Suspense fallback={<main className="p-4">...</main>}><CategoryView /></Suspense>;
}
