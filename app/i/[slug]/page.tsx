"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Item } from "@/lib/shared";
import { eur, medals } from "@/lib/shared";
import ItemSheet from "@/components/ItemSheet";
 
type Supporter = { username: string; amount_cents: number };
type Cat = { slug: string; name: string; emoji: string | null };
 
function ItemView() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [cat, setCat] = useState<Cat | null>(null);
  const [rank, setRank] = useState(1);
  const [gap, setGap] = useState<number | null>(null);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [missing, setMissing] = useState(false);
  const [mode, setMode] = useState<"support" | "share" | null>(null);
 
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("items")
        .select("*")
        .eq("slug", slug)
        .single();
      if (!data) {
        setMissing(true);
        return;
      }
      setItem(data);
 
      const { data: c } = await supabase
        .from("categories")
        .select("slug, name, emoji")
        .eq("id", data.category_id)
        .single();
      setCat(c);
 
      const { count } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("category_id", data.category_id)
        .gt("total_cents", data.total_cents);
      setRank((count ?? 0) + 1);
 
      const { data: above } = await supabase
        .from("items")
        .select("total_cents")
        .eq("category_id", data.category_id)
        .gt("total_cents", data.total_cents)
        .order("total_cents", { ascending: true })
        .limit(1);
      setGap(above?.[0] ? above[0].total_cents - data.total_cents : null);
 
      const { data: s } = await supabase
        .from("contributions")
        .select("username, amount_cents")
        .eq("item_id", data.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setSupporters(s ?? []);
    }
    load();
  }, [slug]);
 
  if (missing) return <main className="p-4 text-white">No encontrado.</main>;
  if (!item) return <main className="p-4 text-white">...</main>;
 
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="mx-auto max-w-xl px-4 pb-32">
        <div className="flex justify-between py-4 text-sm text-zinc-400">
          <a href="/">← mifavorito</a>
          {cat && (
            <a href={`/c/${cat.slug}`}>
              {cat.emoji} {cat.name}
            </a>
          )}
        </div>
 
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <div className="text-6xl font-extrabold">
            {rank <= 3 ? medals[rank - 1] : `#${rank}`}
          </div>
          <div className="mt-1 text-sm text-zinc-500">Puesto #{rank}</div>
          <h1 className="mt-3 text-3xl font-extrabold">{item.name}</h1>
          <p className="mt-1 text-zinc-400">{item.description}</p>
          <div className="mt-4 bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-4xl font-extrabold text-transparent">
            {eur(item.total_cents)}
          </div>
          <div className="mt-2 text-sm text-rose-300">
            {gap !== null
              ? `Faltan ${eur(gap)} para subir al #${rank - 1}`
              : "¡Es el número uno! Ayúdalo a defender su puesto."}
          </div>
        </div>
 
        {supporters.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 font-bold">Últimos apoyos</h2>
            <ul className="space-y-2">
              {supporters.map((s, i) => (
                <li
                  key={i}
                  className="flex justify-between rounded-xl bg-zinc-900 px-4 py-3 text-sm"
                >
                  <span>{s.username}</span>
                  <span className="font-semibold text-amber-300">
                    {eur(s.amount_cents)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
 
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 p-3 pb-5 backdrop-blur">
        <div className="mx-auto flex max-w-xl gap-2">
          <button
            onClick={() => setMode("support")}
            className="flex-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 py-3.5 text-lg font-extrabold text-black"
          >
            Apoyar
          </button>
          <button
            onClick={() => setMode("share")}
            className="rounded-full border border-zinc-700 px-6 font-semibold text-zinc-200"
          >
            Impulsar
          </button>
        </div>
      </div>
 
      {mode && (
        <ItemSheet item={item} mode={mode} onClose={() => setMode(null)} />
      )}
    </div>
  );
}
 
export default function ItemPage() {
  return (
    <Suspense fallback={<main className="p-4 text-white">...</main>}>
      <ItemView />
    </Suspense>
  );
}
 