"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Category, Item, SheetState } from "@/lib/shared";
import RankRow from "@/components/RankRow";
import ItemSheet from "@/components/ItemSheet";
 
export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [sheet, setSheet] = useState<SheetState>(null);
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
 
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="mx-auto max-w-xl px-4 pb-20">
        <header className="py-8 text-center">
          <p className="mt-3 text-lg font-semibold">¿Quién es el número uno?</p>
          <p className="mt-1 text-zinc-400">
            Apoya a tu favorito desde 1 € y llévalo a la cima.
          </p>
        </header>
 
        {thanks && (
          <div className="mb-6 rounded-xl bg-emerald-500/15 p-3 text-emerald-300">
            ¡Gracias por tu apoyo! Ahora impúlsalo: compártelo.
          </div>
        )}
 
        {categories.map((cat) => {
          const list = items.filter((i) => i.category_id === cat.id);
          const top = list.slice(0, 3);
          const max = list[0]?.total_cents || 1;
          return (
            <section key={cat.id} className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-extrabold">
                  {cat.emoji} {cat.name}
                </h2>
                <a
                  href={`/c/${cat.slug}`}
                  className="text-sm font-semibold text-amber-300"
                >
                  Ver todo →
                </a>
              </div>
              {top.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-700 p-4 text-center text-sm text-zinc-500">
                  Aún no hay nadie. ¡Sé el primero!
                </p>
              ) : (
                <ol className="space-y-3">
                  {top.map((item, i) => (
                    <RankRow
                      key={item.id}
                      item={item}
                      rank={i + 1}
                      max={max}
                      gap={i > 0 ? top[i - 1].total_cents - item.total_cents : undefined}
                      onSupport={() => setSheet({ item, mode: "support" })}
                      onShare={() => setSheet({ item, mode: "share" })}
                    />
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </main>
 
      {sheet && (
        <ItemSheet
          item={sheet.item}
          mode={sheet.mode}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
 