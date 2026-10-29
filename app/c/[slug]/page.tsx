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
import { useAdminMode } from "@/components/AdminModeProvider";

type AdminStatus = "pending" | "approved" | "rejected";
type BrowseItem = Item & { status?: AdminStatus };

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function CategoryView() {
  const { slug } = useParams<{ slug: string }>();
  const { isAdmin, accessToken } = useAdminMode();
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [missing, setMissing] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [election, setElection] = useState<ElectionStatus | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const isOpen = election?.isOpen === true;
  const canBrowse = isOpen || isAdmin;

  useEffect(() => {
    let alive = true;
    async function load() {
      const { data: cat } = await supabase.from("categories").select("*").eq("slug", slug).single();
      if (!alive) return;
      if (!cat) { setMissing(true); return; }
      setMissing(false);
      setCategory(cat);

      if (isAdmin && accessToken) {
        try {
          const response = await fetch("/api/admin/manage", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
          const result = await response.json();
          if (response.ok) {
            if (alive) setItems((result.items ?? []) .filter((item: BrowseItem) => item.category_id === cat.id).sort((a: BrowseItem, b: BrowseItem) => b.total_cents - a.total_cents || a.name.localeCompare(b.name, "es")).map((item: BrowseItem) => ({ ...item, category_slug: slug })));
            return;
          }
        } catch { /* Fall back to the approved public list when admin access expires. */ }
      }

      const { data } = await supabase.from("items").select("*").eq("category_id", cat.id).eq("status", "approved")
        .order("total_cents", { ascending: false }).order("name", { ascending: true });
      if (alive) setItems((data ?? []).map((item) => ({ ...item, category_slug: slug })));
    }
    void load();
    return () => { alive = false; };
  }, [slug, isAdmin, accessToken]);

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

  async function setOptionStatus(item: BrowseItem, status: "approved" | "rejected") {
    if (!isAdmin || !accessToken) return;
    if (item.status === "approved" && status === "rejected" &&
      !window.confirm(`¿Ocultar «${item.name}» del ranking público? Se conservarán sus apoyos y podrás volver a mostrarlo.`)) return;
    setAdminMessage("");
    const response = await fetch("/api/admin/manage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ id: item.id, status }),
    });
    const result = await response.json();
    if (!response.ok) {
      setAdminMessage(result.error || "No se pudo actualizar la opción.");
      return;
    }
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
  }

  if (missing) return <main className="p-4">No encontrado.</main>;

  const allowPromo = false;
  const max = items[0]?.total_cents || 1;
  const top = query.trim() ? [] : items.slice(0, 3);
  const rest = query.trim() ? matching : items.slice(3);
  const adminStatuses = Object.fromEntries(items.map((item) => [item.id, item.status ?? "approved"])) as Record<number, AdminStatus>;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-xl px-4 pb-20">
        <div className="flex items-center justify-between gap-3 py-4">
          <h1 className="text-3xl font-extrabold">{category?.emoji} {category?.slug === "estrellas" ? "Música" : category?.name}</h1>
        </div>
        {isOpen && <div className="mb-4"><ElectionHero status={election} categorySlug={slug} compact /></div>}
        {isAdmin && <p className="mb-3 rounded-xl border border-amber-200/20 bg-amber-200/5 px-3 py-2 text-xs font-semibold text-amber-100">Vista administrativa: las opciones ocultas también aparecen aquí. El calendario de apoyos sigue activo.</p>}
        {adminMessage && <p role="alert" className="mb-3 rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-100">{adminMessage}</p>}
        <div className="relative min-h-[45vh]">
          <div inert={!canBrowse} className={canBrowse ? "" : "pointer-events-none select-none blur-[4px] opacity-45"}>
          <div className="mb-5">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={category?.slug === "estrellas" ? "Buscar artista…" : `Buscar ${category?.name.toLowerCase() ?? "opción"}…`} className="w-full rounded-full border border-zinc-700 bg-zinc-900/90 px-4 py-3 text-base text-white placeholder:text-zinc-500 focus:border-amber-300/60 focus:outline-none" />
          </div>

          {top.length > 0 && <Podium items={top} onSupport={(item) => setSheet({ item: { ...item, category_slug: slug }, mode: "support", allowPromo })} allowSupport={isOpen} adminStatuses={isAdmin ? adminStatuses : undefined} onAdminStatusChange={isAdmin ? (item, status) => void setOptionStatus(item as BrowseItem, status) : undefined} />}
          {rest.length > 0 ? (
            <ol className="space-y-3">
              {rest.map((item) => {
                const rank = items.filter((entry) => entry.total_cents > item.total_cents).length + 1;
                const above = items.find((entry) => entry.total_cents > item.total_cents);
                return <RankRow key={item.id} item={item} rank={rank} max={max} gap={above ? above.total_cents - item.total_cents : undefined}
                  onSupport={() => setSheet({ item: { ...item, category_slug: slug }, mode: "support", allowPromo })}
                  onShare={() => setSheet({ item: { ...item, category_slug: slug }, mode: "share", allowPromo })}
                  allowSupport={isOpen} adminStatus={isAdmin ? item.status ?? "approved" : undefined}
                  onAdminStatusChange={isAdmin ? (row, status) => void setOptionStatus(row as BrowseItem, status) : undefined} />;
              })}
            </ol>
          ) : query.trim() ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 p-5 text-center text-sm text-zinc-400">
              <p>No encontramos «{query.trim()}» en esta categoría.</p>
              {isOpen && <button onClick={() => setAdding(query.trim())} className="btn-apoyar mt-4 rounded-full px-5 py-2.5">Proponer «{query.trim()}»</button>}
            </div>
          ) : null}

          </div>
          {!canBrowse && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/35 p-3">
              <ElectionHero status={election} categorySlug={slug} />
            </div>
          )}
        </div>
      </main>
      {isOpen && sheet && <ItemSheet item={sheet.item} mode={sheet.mode} allowPromo={sheet.allowPromo} onClose={() => setSheet(null)} demoMode={process.env.NODE_ENV === "development"} />}
      {isOpen && adding !== null && category && <AddItemSheet categories={[category]} initialName={adding} onClose={() => setAdding(null)} demoMode={process.env.NODE_ENV === "development"} />}
    </div>
  );
}

export default function CategoryPage() {
  return <Suspense fallback={<main className="p-4">...</main>}><CategoryView /></Suspense>;
}
