"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  FaXTwitter,
  FaWhatsapp,
  FaFacebookF,
  FaTelegram,
  FaLink,
} from "react-icons/fa6";
import { supabase } from "@/lib/supabase";
 
type Item = {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  total_cents: number;
};
type Supporter = { username: string; amount_cents: number };
 
function ItemView() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [rank, setRank] = useState(1);
  const [gap, setGap] = useState<number | null>(null);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [missing, setMissing] = useState(false);
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
 
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
 
  async function pay() {
    if (!item) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: item.id,
        itemName: item.name,
        amount,
        username,
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else {
      setError(data.error ?? "Error");
      setLoading(false);
    }
  }
 
  if (missing) return <main className="p-4">No encontrado.</main>;
  if (!item) return <main className="p-4">...</main>;
 
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `Estoy apoyando a ${item.name} en mifavorito. ¡Ayúdame a llevarlo al número uno!`;
  const e = encodeURIComponent;
  const shares = [
    [<FaXTwitter key="x" />, `https://twitter.com/intent/tweet?text=${e(text)}&url=${e(url)}`, "X"],
    [<FaWhatsapp key="w" />, `https://wa.me/?text=${e(text + " " + url)}`, "WhatsApp"],
    [<FaFacebookF key="f" />, `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`, "Facebook"],
    [<FaTelegram key="t" />, `https://t.me/share/url?url=${e(url)}&text=${e(text)}`, "Telegram"],
  ] as const;
 
  return (
    <main className="mx-auto max-w-xl space-y-4 p-4">
      <a href="/" className="text-sm text-gray-500 underline">
        ← mifavorito
      </a>
 
      <div className="rounded-lg border p-4 text-center">
        <div className="text-5xl font-bold">#{rank}</div>
        <h1 className="mt-2 text-2xl font-bold">{item.name}</h1>
        <p className="text-gray-500">{item.description}</p>
        <div className="mt-2 text-xl font-semibold">
          {(item.total_cents / 100).toFixed(2)} €
        </div>
        {gap !== null && (
          <div className="mt-1 text-sm text-gray-600">
            Faltan {(gap / 100).toFixed(2)} € para subir al #{rank - 1}
          </div>
        )}
      </div>
 
      <div className="space-y-2 rounded-lg border p-4">
        <input
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          placeholder="Tu nombre de usuario"
          maxLength={30}
          className="w-full rounded border p-2"
        />
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(ev) => setAmount(ev.target.value)}
          className="w-full rounded border p-2"
        />
        {error && <div className="text-red-600">{error}</div>}
        <button
          onClick={pay}
          disabled={loading || !username}
          className="w-full rounded bg-green-600 p-2 text-white disabled:opacity-50"
        >
          {loading ? "..." : `Apoyar con ${amount} €`}
        </button>
      </div>
 
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">Impulsar:</span>
        {shares.map(([icon, href, label]) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border p-2 text-xl"
          >
            {icon}
          </a>
        ))}
        <button
          aria-label="Copiar enlace"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="rounded border p-2 text-xl"
        >
          {copied ? "✓" : <FaLink />}
        </button>
      </div>
 
      {supporters.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold">Últimos apoyos</h2>
          <ul className="space-y-1 text-sm">
            {supporters.map((s, i) => (
              <li key={i} className="flex justify-between">
                <span>{s.username}</span>
                <span>{(s.amount_cents / 100).toFixed(2)} €</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
export default function ItemPage() {
  return (
    <Suspense fallback={<main className="p-4">...</main>}>
      <ItemView />
    </Suspense>
  );
}
 