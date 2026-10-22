"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
 
type Category = { id: number; name: string; emoji: string | null };
type Item = {
  id: number;
  name: string;
  description: string | null;
  total_cents: number;
};
 
export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<number | null>(null);
 
  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("sort")
      .then(({ data }) => {
        if (data) {
          setCategories(data);
          setActive(data[0]?.id ?? null);
        }
      });
  }, []);
 
  useEffect(() => {
    if (active === null) return;
    supabase
      .from("items")
      .select("*")
      .eq("category_id", active)
      .order("total_cents", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, [active]);
 
  return (
    <main className="mx-auto max-w-xl p-4">
      <h1 className="text-3xl font-bold">mifavorito</h1>
      <p className="mb-4 text-gray-500">
        ¿Quién es el número uno? Haz subir a tu favorito.
      </p>
 
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 ${
              active === c.id ? "bg-black text-white" : ""
            }`}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>
 
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <span className="mr-2 font-bold">#{i + 1}</span>
              {item.name}
              <div className="text-sm text-gray-500">{item.description}</div>
            </div>
            <div className="font-semibold">
              {(item.total_cents / 100).toFixed(2)} €
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
 