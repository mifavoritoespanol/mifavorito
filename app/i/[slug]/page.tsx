"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Item } from "@/lib/shared";
import { voteLabel, medals } from "@/lib/shared";
import ItemSheet from "@/components/ItemSheet";
import Avatar from "@/components/Avatar";
import { countryFlag, countryName } from "@/lib/countries";

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
        .eq("status", "approved")
        .single();
      if (!data) {
        setMissing(true);
        return;
      }

      const { data: category } = await supabase
        .from("categories")
        .select("slug, name, emoji")
        .eq("id", data.category_id)
        .single();
      if (!category) {
        setMissing(true);
        return;
      }
      setCat(category);
      setItem({ ...data, category_slug: category.slug });

      const { count } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("category_id", data.category_id)
        .eq("status", "approved")
        .gt("total_cents", data.total_cents);
      setRank((count ?? 0) + 1);

      const { data: above } = await supabase
        .from("items")
        .select("total_cents")
        .eq("category_id", data.category_id)
        .eq("status", "approved")
        .gt("total_cents", data.total_cents)
        .order("total_cents", { ascending: true })
        .limit(1);
      setGap(above?.[0] ? above[0].total_cents - data.total_cents : null);

      const { data: contributions } = await supabase
        .from("contributions")
        .select("username, amount_cents")
        .eq("item_id", data.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setSupporters(contributions ?? []);
    }
    load();
  }, [slug]);

  if (missing) return <main className="p-4">No encontrado.</main>;
  if (!item) return <main className="p-4">...</main>;

  const allowPromo = false;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-xl px-4 pb-32">
        <div className="flex justify-between py-4 text-sm text-zinc-400">
          <Link href="/">← Inicio</Link>
          {cat && <Link href={`/c/${cat.slug}`}>{cat.emoji} {cat.slug === "estrellas" ? "Música" : cat.name}</Link>}
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center shadow-sm">
          <div className="flex justify-center">
            <Avatar item={item} size={96} />
          </div>
          <div className="mt-3 text-4xl font-extrabold">
            {rank <= 3 ? medals[rank - 1] : `#${rank}`}
          </div>
          <div className="text-sm text-zinc-500">Puesto #{rank}</div>
          <h1 className="mt-2 flex items-center justify-center gap-2 text-3xl font-extrabold">{item.country_code && <span title={countryName(item.country_code)}>{countryFlag(item.country_code)}</span>}{item.name}</h1>
          {item.description && <p className="mt-1 text-zinc-400">{item.description}</p>}
        <section className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 text-left">
          <h2 className="text-lg font-bold">Información sobre {item.name}</h2>
          {item.info_summary ? (
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.info_summary}</p>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">La información de esta ficha estará disponible próximamente.</p>
          )}
          {item.wikipedia_url && <a href={item.wikipedia_url} target="_blank" rel="noreferrer" className="mt-3 block text-xs text-zinc-400 underline underline-offset-4">Ver la ficha original en Wikipedia ↗</a>}
          {item.info_summary && item.wikipedia_url && <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">Resumen adaptado y reformulado a partir de Wikipedia. Esta versión modificada se distribuye bajo <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="underline underline-offset-2">CC BY-SA 4.0</a>. Wikipedia no revisa ni respalda este sitio.</p>}
        </section>
          <div className="mt-4 bg-gradient-to-r from-rose-500 to-emerald-400 bg-clip-text text-4xl font-extrabold text-transparent">
            {voteLabel(item.total_cents)}
          </div>
          <div className="mt-2 text-sm text-rose-300">
            {gap !== null
              ? `Faltan ${voteLabel(gap)} para subir al #${rank - 1}`
              : "¡Es el número uno! Ayúdalo a defender su puesto."}
          </div>
          {item.image_url?.includes("wikimedia.org") && (
            <div className="mt-3 text-[10px] text-zinc-500">Imagen: Wikipedia</div>
          )}
        </div>

        {supporters.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 font-bold">Últimos apoyos</h2>
            <ul className="space-y-2">
              {supporters.map((supporter, index) => (
                <li key={index} className="flex justify-between rounded-xl bg-zinc-900 px-4 py-3 text-sm">
                  <span>{supporter.username}</span>
                  <span className="font-semibold text-amber-300">{voteLabel(supporter.amount_cents)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/90 p-3 pb-5 backdrop-blur">
        <div className="mx-auto flex max-w-xl gap-2">
          <button onClick={() => setMode("support")} className="btn-apoyar flex-1 rounded-full py-3.5 text-lg">
            Apoyar
          </button>
          <button onClick={() => setMode("share")} className="rounded-full border border-zinc-700 bg-zinc-900 px-6 font-semibold">
            Impulsar
          </button>
        </div>
      </div>

      {mode && (
        <ItemSheet item={item} mode={mode} allowPromo={allowPromo} onClose={() => setMode(null)} demoMode={process.env.NODE_ENV === "development"} />
      )}
    </div>
  );
}

export default function ItemPage() {
  return (
    <Suspense fallback={<main className="p-4">...</main>}>
      <ItemView />
    </Suspense>
  );
}

