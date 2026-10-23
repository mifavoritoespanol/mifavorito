"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Category, Item, SheetState } from "@/lib/shared";
import RankRow from "@/components/RankRow";
import ItemSheet from "@/components/ItemSheet";
 
function CategoryView() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [missing, setMissing] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
 
  useEffect(() => {
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
      setCategory(cat);
      const { data } = await supabase
        .from("items")
        .select("*")
        .eq("category_id", cat.id)
        .order("total_cents", { ascending: false });
      setItems(data ?? []);
    }
    load();
  }, [slug]);
 
  if (missing) return <main className="p-4 text-white">No encontrado.</main>;
  const max = items[0]?.total_cents || 1;
 
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="mx-auto max-w-xl px-4 pb-20">
        <a href="/" className="inline-block py-4 text-sm text-zinc-400">
          ← mifavorito
        </a>
        <h1 className="mb-4 text-3xl font-extrabold">
          {category?.emoji} {category?.name}
        </h1>
        <ol className="space-y-3">
          {items.map((item, i) => (
            <RankRow
              key={item.id}
              item={item}
              rank={i + 1}
              max={max}
              gap={i > 0 ? items[i - 1].total_cents - item.total_cents : undefined}
              onSupport={() => setSheet({ item, mode: "support" })}
              onShare={() => setSheet({ item, mode: "share" })}
            />
          ))}
        </ol>
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
 
export default function CategoryPage() {
  return (
    <Suspense fallback={<main className="p-4 text-white">...</main>}>
      <CategoryView />
    </Suspense>
  );
}
 