import { createClient } from "@supabase/supabase-js";
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);
 
const { data: items, error } = await supabase
  .from("items")
  .select("id, name, categories!inner(slug)")
  .is("image_url", null)
  .in("categories.slug", ["estrellas", "equipos"]);
 
if (error) {
  console.error(error.message);
  process.exit(1);
}
 
for (const it of items) {
  const title = encodeURIComponent(it.name.replaceAll(" ", "_"));
  try {
    const res = await fetch(
      `https://es.wikipedia.org/api/rest_v1/page/summary/${title}`,
      { headers: { "User-Agent": "mifavorito/1.0 (https://www.mifavorito.app)" } }
    );
    if (!res.ok) {
      console.log("✗", it.name);
      continue;
    }
    const j = await res.json();
    const img = j.type === "disambiguation" ? null : j.thumbnail?.source;
    if (!img) {
      console.log("✗", it.name);
      continue;
    }
    await supabase.from("items").update({ image_url: img }).eq("id", it.id);
    console.log("✓", it.name);
  } catch {
    console.log("✗", it.name);
  }
  await new Promise((r) => setTimeout(r, 200));
}
 