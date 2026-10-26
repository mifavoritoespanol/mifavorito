"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Category, Item, SheetState } from "@/lib/shared";
import RankRow from "@/components/RankRow";
import ItemSheet from "@/components/ItemSheet";
import ElectionHero, { type ElectionStatus } from "@/components/ElectionHero";
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

const categoryPriority: Record<string, number> = { bebidas: 0, comidas: 1, estrellas: 2 };
const SCHEDULED_CATEGORY_SLUGS = ["bebidas", "comidas", "estrellas"];

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [elections, setElections] = useState<Record<string, ElectionStatus | null>>({});
  const [items, setItems] = useState<Item[]>([]);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [thanks, setThanks] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const demoMode = useLocalDemoMode();

  useEffect(() => {
    let alive = true;
    const refreshElections = async () => {
      const entries = await Promise.all(SCHEDULED_CATEGORY_SLUGS.map(async (categorySlug) => {
        try {
          const response = await fetch("/api/election-status?category=" + categorySlug, { cache: "no-store" });
          return [categorySlug, response.ok ? await response.json() : null] as const;
        } catch {
          return [categorySlug, null] as const;
        }
      }));
      if (alive) setElections(Object.fromEntries(entries));
    };
    void refreshElections();
    const electionTimer = window.setInterval(refreshElections, 15000);

    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (sessionId && process.env.NODE_ENV === "production") {
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
      .then(({ data }) => setCategories([...(data ?? [])].sort((a, b) => (categoryPriority[a.slug] ?? 10) - (categoryPriority[b.slug] ?? 10))));

    return () => { alive = false; window.clearInterval(electionTimer); };
  }, []);

  useEffect(() => {
    supabase
      .from("items")
      .select("*")
      .eq("status", "approved")
      .order("total_cents", { ascending: false })
      .order("name", { ascending: true })
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

  const activeCategorySlug = SCHEDULED_CATEGORY_SLUGS.find((slug) => elections[slug]?.isOpen) ?? null;
  const orderedCategories = useMemo(() => [...categories].sort((a, b) => (categoryPriority[a.slug] ?? 10) - (categoryPriority[b.slug] ?? 10)), [categories]);
  const openCategory = orderedCategories.find((category) => category.slug === activeCategorySlug);
  const openItems = useMemo(() => openCategory ? byCat.get(openCategory.id) ?? [] : [], [byCat, openCategory]);
  const displayedOpenItems = useMemo(() => {
    if (!demoMode || openCategory?.slug !== "estrellas") return openItems;
    const sampleVotes = [3_400_000, 2_700_000, 2_100_000];
    return openItems.map((item, index) => ({
      ...item,
      total_cents: (index < 3 ? sampleVotes[index] : Math.min(Math.round(item.total_cents / 100), 2_000_000)) * 100,
    })).sort((a, b) => b.total_cents - a.total_cents);
  }, [demoMode, openCategory?.slug, openItems]);

  function renderRow(item: Item) {
    const list = item.category_id === openCategory?.id ? displayedOpenItems : byCat.get(item.category_id) ?? [];
    const rank = list.filter((entry) => entry.total_cents > item.total_cents).length + 1;
    const above = list.find((entry) => entry.total_cents > item.total_cents);
    return (
      <RankRow
        key={item.id}
        item={item}
        rank={rank}
        max={list[0]?.total_cents || 1}
        gap={above ? above.total_cents - item.total_cents : undefined}
        onSupport={() => setSheet({ item: { ...item, category_slug: orderedCategories.find((category) => category.id === item.category_id)?.slug }, mode: "support", allowPromo: false })}
        onShare={() => setSheet({ item: { ...item, category_slug: orderedCategories.find((category) => category.id === item.category_id)?.slug }, mode: "share", allowPromo: false })}
        compactVotes
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pb-20 pt-6 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <main className="mx-auto w-full max-w-3xl">


        {demoMode && <div className="mb-5 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100">DEMO LOCAL — cifras de voto simuladas; no se modifican los votos reales.</div>}

        {thanks && (
          <div className="mb-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-200">
            ¡Gracias por tu apoyo! Ahora impúlsalo: compártelo.
          </div>
        )}

        {orderedCategories.map((category) => {
            const electionStatus = elections[category.slug] ?? null;
            const isOpen = electionStatus?.isOpen === true;
            const categoryItems = category.slug === "estrellas" && isOpen ? displayedOpenItems : byCat.get(category.id) ?? [];
            const top = categoryItems.slice(0, 3);
            return (
              <div key={category.id}>
              <section
                className={`mb-5 overflow-hidden rounded-3xl border bg-gradient-to-b from-[#24292d]/95 via-[#1a1e22]/95 to-[#121518]/95 shadow-[0_22px_55px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.06] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(0,0,0,0.62)] ${isOpen ? "border-zinc-600/80" : "border-zinc-800/90"}`}
              >
                <div className={`flex items-center justify-between border-b border-zinc-700/60 px-5 py-4 ${tint[category.slug] ?? "bg-white/[0.035]"}`}>
                  <h2 className="text-lg font-extrabold text-white">
                    {category.emoji} {category.slug === "estrellas" ? "Música" : category.name}
                  </h2>
                  {isOpen ? (
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <a href={`/c/${category.slug}`} className="text-sm font-semibold text-amber-200 transition hover:text-amber-100">
                        Ver clasificación →
                      </a>
                      <ElectionHero status={electionStatus} categorySlug={category.slug} compact />
                    </div>
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">🔒 Próximamente</span>
                  )}
                </div>
                <div className="relative min-h-[18rem] p-3 sm:p-4">
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
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/45 p-3 backdrop-blur-[2px]">
                      {SCHEDULED_CATEGORY_SLUGS.includes(category.slug) ? (
                        <ElectionHero status={electionStatus} categorySlug={category.slug} />
                      ) : (
                        <span className="rounded-full border border-white/10 bg-zinc-950/85 px-5 py-2.5 text-sm font-extrabold uppercase tracking-[0.18em] text-zinc-200 shadow-xl">
                          🔒 Próximamente
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </section>
              </div>
            );
          })}
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
          demoMode={process.env.NODE_ENV === "development"}
        />
      )}

    </div>
  );
}

