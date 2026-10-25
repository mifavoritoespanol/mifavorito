"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Category, Item, SheetState } from "@/lib/shared";
import RankRow from "@/components/RankRow";
import ItemSheet from "@/components/ItemSheet";
import AddItemSheet from "@/components/AddItemSheet";
import ElectionHero from "@/components/ElectionHero";
import CountryLeaderboard from "@/components/CountryLeaderboard";
import { useLocalDemoMode } from "@/lib/demoMode";

const tint: Record<string, string> = {
  estrellas: "bg-white/[0.045]",
  paises: "bg-white/[0.035]",
  empresas: "bg-white/[0.035]",
  bebidas: "bg-white/[0.035]",
  comidas: "bg-white/[0.035]",
  equipos: "bg-white/[0.035]",
};

const norm = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [thanks, setThanks] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const demoMode = useLocalDemoMode();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (sessionId) {
      fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).then(() => {
        setThanks(true);
        setRefresh((current) => current + 1);
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
      .eq("status", "approved")
      .order("total_cents", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, [refresh]);

  const byCat = useMemo(() => {
    const map = new Map<number, Item[]>();
    for (const item of items) {
      const list = map.get(item.category_id) ?? [];
      list.push(item);
      map.set(item.category_id, list);
    }
    return map;
  }, [items]);

  const openCategory = categories.find((category) => category.slug === "estrellas");
  const openItems = useMemo(() => openCategory ? byCat.get(openCategory.id) ?? [] : [], [byCat, openCategory]);
  const displayedOpenItems = useMemo(() => {
    if (!demoMode) return openItems;
    const sampleVotes = [3_400_000, 2_700_000, 2_100_000];
    return openItems.map((item, index) => ({
      ...item,
      total_cents: (index < 3 ? sampleVotes[index] : Math.min(Math.round(item.total_cents / 100), 2_000_000)) * 100,
    })).sort((a, b) => b.total_cents - a.total_cents);
  }, [demoMode, openItems]);
  const openCategories = categories.filter((category) => category.slug === "estrellas");

  function renderRow(item: Item) {
    const list = item.category_id === openCategory?.id ? displayedOpenItems : byCat.get(item.category_id) ?? [];
    const index = list.findIndex((entry) => entry.id === item.id);
    return (
      <RankRow
        key={item.id}
        item={item}
        rank={index + 1}
        max={list[0]?.total_cents || 1}
        gap={index > 0 ? list[index - 1].total_cents - item.total_cents : undefined}
        onSupport={() => setSheet({ item, mode: "support", allowPromo: false })}
        onShare={() => setSheet({ item, mode: "share", allowPromo: false })}
        compactVotes
      />
    );
  }

  const query = norm(q.trim());
  const results = query ? displayedOpenItems.filter((item) => norm(item.name).includes(query)).slice(0, 30) : [];

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pb-20 pt-6 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <main className="mx-auto w-full max-w-3xl">
        <ElectionHero />
        {demoMode && <div className="mb-5 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100">DEMO LOCAL — cifras de voto simuladas; no se modifican los votos reales.</div>}

        {thanks && (
          <div className="mb-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-200">
            ¡Gracias por tu apoyo! Ahora impúlsalo: compártelo.
          </div>
        )}

        <section className="mb-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200/70">La elección</p>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Artista musical del año en español</h2>
            </div>
            <span className="pb-0.5 text-xs text-zinc-500">Elige a tu favorito</span>
          </div>
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Buscar artista…"
              className="min-w-0 flex-1 rounded-full border border-zinc-700 bg-zinc-900/90 px-4 py-3 text-base text-white placeholder:text-zinc-500 focus:border-amber-300/60 focus:outline-none"
            />
            <button
              onClick={() => setAdding(q.trim())}
              className="rounded-full border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500"
            >
              + Proponer artista
            </button>
          </div>
        </section>

        {query ? (
          <div>
            {results.length > 0 ? (
              <ol className="space-y-3">{results.map(renderRow)}</ol>
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-700 p-5 text-center text-sm text-zinc-500">
                No encontramos «{q.trim()}» entre los artistas abiertos.
              </p>
            )}
            <button
              onClick={() => setAdding(q.trim())}
              className="btn-apoyar mt-4 w-full rounded-full py-3"
            >
              ¿No está? Propón «{q.trim()}»
            </button>
          </div>
        ) : (
          categories.map((category) => {
            const isOpen = category.slug === "estrellas";
            const top = (category.slug === "estrellas" ? displayedOpenItems : byCat.get(category.id) ?? []).slice(0, 3);
            return (
              <section
                key={category.id}
                className={`mb-5 overflow-hidden rounded-3xl border bg-gradient-to-b from-[#24292d]/95 via-[#1a1e22]/95 to-[#121518]/95 shadow-[0_22px_55px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.06] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(0,0,0,0.62)] ${isOpen ? "border-zinc-600/80" : "border-zinc-800/90"}`}
              >
                <div className={`flex items-center justify-between border-b border-zinc-700/60 px-5 py-4 ${tint[category.slug] ?? "bg-white/[0.035]"}`}>
                  <h2 className="text-lg font-extrabold text-white">
                    {category.emoji} {isOpen ? "Música" : category.name}
                  </h2>
                  {isOpen ? (
                    <a href={`/c/${category.slug}`} className="text-sm font-semibold text-amber-200 transition hover:text-amber-100">
                      Ver clasificación →
                    </a>
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">🔒 Próximamente</span>
                  )}
                </div>
                <div className="relative p-3 sm:p-4">
                  <div aria-hidden={!isOpen} inert={!isOpen} className={isOpen ? "" : "pointer-events-none select-none blur-[3px] opacity-45"}>
                    {top.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-zinc-700 p-4 text-center text-sm text-zinc-500">
                        Aún no hay nadie. ¡Sé el primero!
                      </p>
                    ) : (
                      <ol className="space-y-3">{top.map(renderRow)}</ol>
                    )}
                  </div>
                  {!isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/45 backdrop-blur-[2px]">
                      <span className="rounded-full border border-white/10 bg-zinc-950/85 px-5 py-2.5 text-sm font-extrabold uppercase tracking-[0.18em] text-zinc-200 shadow-xl">
                        🔒 Próximamente
                      </span>
                    </div>
                  )}
                </div>
              </section>
            );
          })
        )}
      </main>
        <aside className="order-last self-start lg:sticky lg:top-36">
          <CountryLeaderboard />
        </aside>
      </div>

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
          categories={openCategories}
          initialName={adding}
          onClose={() => setAdding(null)}
        />
      )}
    </div>
  );
}
