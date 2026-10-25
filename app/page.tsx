"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Category, Item, SheetState } from "@/lib/shared";
import RankRow from "@/components/RankRow";
import ItemSheet from "@/components/ItemSheet";
import AddItemSheet from "@/components/AddItemSheet";
 
const tint: Record<string, string> = {
  estrellas: "bg-amber-200/30",
  paises: "bg-sky-300/25",
  empresas: "bg-violet-300/25",
  bebidas: "bg-teal-300/25",
  comidas: "bg-orange-300/25",
  equipos: "bg-lime-300/25",
};
 
const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
 
export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [thanks, setThanks] = useState(false);
  const [refresh, setRefresh] = useState(0);
 
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (sessionId) {
      setThanks(true);
      fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).then(() => {
        setRefresh((r) => r + 1);
        window.history.replaceState({}, "", "/");
      });
    }
    supabase
      .from("categories")
      .select("*")
      .order("sort")
      .then(({ data }) => setCategories(data ?? []));
  }, []);
 
  useEffect(() => {
    supabase
      .from("items")
      .select("*")
      .order("total_cents", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, [refresh]);
 
  const byCat = useMemo(() => {
    const map = new Map<number, Item[]>();
    for (const it of items) {
      const list = map.get(it.category_id) ?? [];
      list.push(it);
      map.set(it.category_id, list);
    }
    return map;
  }, [items]);
 
  const slugOf = (id: number) => categories.find((c) => c.id === id)?.slug;
 
  function renderRow(item: Item) {
    const list = byCat.get(item.category_id) ?? [];
    const idx = list.findIndex((x) => x.id === item.id);
    const allowPromo = slugOf(item.category_id) === "empresas";
    return (
      <RankRow
        key={item.id}
        item={item}
        rank={idx + 1}
        max={list[0]?.total_cents || 1}
        gap={idx > 0 ? list[idx - 1].total_cents - item.total_cents : undefined}
        onSupport={() => setSheet({ item, mode: "support", allowPromo })}
        onShare={() => setSheet({ item, mode: "share", allowPromo })}
      />
    );
  }
 
  const query = norm(q.trim());
  const results = query
    ? items.filter((i) => norm(i.name).includes(query)).slice(0, 30)
    : [];
 
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-xl px-4 pb-20">
        <div className="py-6 text-center">
          <p className="text-2xl font-extrabold">¿Quién es el número uno?</p>
          <p className="mt-1 text-zinc-400">
            Apoya a tu favorito desde 1 € y llévalo a la cima.
          </p>
        </div>
 
        {thanks && (
          <div className="mb-4 rounded-xl bg-emerald-500/15 p-3 text-emerald-300">
            ¡Gracias por tu apoyo! Ahora impúlsalo: compártelo.
          </div>
        )}
 
        <div className="mb-6 flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar estrella, país, empresa…"
            className="min-w-0 flex-1 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-3 text-base"
          />
          <button
            onClick={() => setAdding(q.trim())}
            className="rounded-full border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold"
          >
            + Añadir
          </button>
        </div>
 
        {query ? (
          <div>
            {results.length > 0 ? (
              <ol className="space-y-3">{results.map(renderRow)}</ol>
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-700 p-4 text-center text-sm text-zinc-500">
                No encontramos «{q.trim()}».
              </p>
            )}
            <button
              onClick={() => setAdding(q.trim())}
              className="btn-apoyar mt-4 w-full rounded-full py-3"
            >
              ¿No está? Añade «{q.trim()}»
            </button>
          </div>
        ) : (
          categories.map((cat) => {
            const top = (byCat.get(cat.id) ?? []).slice(0, 3);
            return (
              <section
                key={cat.id}
                className="mb-6 overflow-hidden rounded-3xl bg-zinc-800/40 ring-1 ring-zinc-700/60"
              >
                <div
                  className={`flex items-center justify-between px-4 py-3 ${
                    tint[cat.slug] ?? "bg-zinc-800/50"
                  }`}
                >
                  <h2 className="text-lg font-extrabold">
                    {cat.emoji} {cat.name}
                  </h2>
                  <a
                    href={`/c/${cat.slug}`}
                    className="text-sm font-semibold text-amber-300"
                  >
                    Ver podio →
                  </a>
                </div>
                <div className="p-3">
                  {top.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-zinc-700 p-4 text-center text-sm text-zinc-500">
                      Aún no hay nadie. ¡Sé el primero!
                    </p>
                  ) : (
                    <ol className="space-y-3">{top.map(renderRow)}</ol>
                  )}
                </div>
              </section>
            );
          })
        )}
      </main>
 
      {sheet && (
        <ItemSheet
          item={sheet.item}
          mode={sheet.mode}
          allowPromo={sheet.allowPromo}
          onClose={() => setSheet(null)}
        />
      )}
      {adding !== null && (
        <AddItemSheet
          categories={categories}
          initialName={adding}
          onClose={() => setAdding(null)}
        />
      )}
    </div>
  );
}
 