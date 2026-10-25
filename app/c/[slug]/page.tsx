"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Item, SheetState } from "@/lib/shared";
import RankRow from "@/components/RankRow";
import Podium from "@/components/Podium";
import ItemSheet from "@/components/ItemSheet";
import ComingSoon from "@/components/ComingSoon";

const CATEGORY_NAMES: Record<string, string> = {
  paises: "Países",
  empresas: "Empresas",
  bebidas: "Bebidas",
  comidas: "Comidas",
  equipos: "Equipos",
};

function CategoryView() {
  const { slug } = useParams<{ slug: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [missing, setMissing] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);

  useEffect(() => {
    if (slug !== "estrellas") return;
    async function load() {
      const { data: cat } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();
      if (!cat) {
        setMissing(true);
        return;
      }
      const { data } = await supabase
        .from("items")
        .select("*")
        .eq("category_id", cat.id)
        .order("total_cents", { ascending: false });
      setItems(data ?? []);
    }
    load();
  }, [slug]);

  if (slug !== "estrellas") {
    return <ComingSoon category={CATEGORY_NAMES[slug] ?? "Esta categoría"} />;
  }
  if (missing) return <main className="p-4">No encontrado.</main>;

  const allowPromo = false;
  const max = items[0]?.total_cents || 1;
  const top = items.slice(0, 3);
  const rest = items.slice(3);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-xl px-4 pb-20">
        <h1 className="py-4 text-3xl font-extrabold">
          🎵 Música
        </h1>

        {top.length > 0 && (
          <Podium
            items={top}
            onSupport={(item) => setSheet({ item, mode: "support", allowPromo })}
          />
        )}

        <ol className="space-y-3">
          {rest.map((item, i) => (
            <RankRow
              key={item.id}
              item={item}
              rank={i + 4}
              max={max}
              gap={
                (i === 0 ? top[2] : rest[i - 1])
                  ? (i === 0 ? top[2] : rest[i - 1]).total_cents - item.total_cents
                  : undefined
              }
              onSupport={() => setSheet({ item, mode: "support", allowPromo })}
              onShare={() => setSheet({ item, mode: "share", allowPromo })}
            />
          ))}
        </ol>
      </main>

      {sheet && (
        <ItemSheet
          item={sheet.item}
          mode={sheet.mode}
          allowPromo={sheet.allowPromo}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<main className="p-4">...</main>}>
      <CategoryView />
    </Suspense>
  );
}
