"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  FaXTwitter,
  FaWhatsapp,
  FaFacebookF,
  FaTelegram,
  FaInstagram,
  FaLink,
} from "react-icons/fa6";
import { supabase } from "@/lib/supabase";
 
type Category = { id: number; name: string; emoji: string | null };
type Item = {
  id: number;
  name: string;
  description: string | null;
  total_cents: number;
};
 
const icons: Record<string, ReactNode> = {
  X: <FaXTwitter />,
  WhatsApp: <FaWhatsapp />,
  Facebook: <FaFacebookF />,
  Telegram: <FaTelegram />,
};
 
export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [selected, setSelected] = useState<Item | null>(null);
  const [shareItem, setShareItem] = useState<Item | null>(null);
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState(false);
  const [refresh, setRefresh] = useState(0);
 
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (sessionId) {
      setThanks(true);
      fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).then(() => {
        setRefresh((r) => r + 1);
        window.history.replaceState({}, "", "/");
      });
    }
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
  }, [active, refresh]);
 
  async function pay() {
    if (!selected) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: selected.id,
        itemName: selected.name,
        amount,
        username,
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error ?? "Error");
      setLoading(false);
    }
  }
 
  function message(item: Item) {
    return `Estoy apoyando a ${item.name} en mifavorito. ¡Ayúdame a llevarlo al número uno!`;
  }
 
  function impulsar(item: Item) {
    setShareItem(shareItem?.id === item.id ? null : item);
  }
 
  async function compartirMas(item: Item) {
    try {
      await navigator.share({
        title: "mifavorito",
        text: message(item),
        url: window.location.origin,
      });
    } catch {
      /* cancelado */
    }
  }
 
  function links(item: Item) {
    const url = encodeURIComponent(window.location.origin);
    const text = encodeURIComponent(message(item));
    return [
      ["X", `https://twitter.com/intent/tweet?text=${text}&url=${url}`],
      ["WhatsApp", `https://wa.me/?text=${text}%20${url}`],
      ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${url}`],
      ["Telegram", `https://t.me/share/url?url=${url}&text=${text}`],
    ];
  }
 
  async function copyLink() {
    await navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
 
  return (
    <main className="mx-auto max-w-xl p-4">
      <h1 className="text-3xl font-bold">mifavorito</h1>
      <p className="mb-4 text-gray-500">
        ¿Quién es el número uno? Haz subir a tu favorito.
      </p>
 
      {thanks && (
        <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-900">
          ¡Gracias por tu apoyo! Ahora impúlsalo: compártelo.
        </div>
      )}
 
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
          <li key={item.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="mr-2 font-bold">#{i + 1}</span>
                {item.name}
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {(item.total_cents / 100).toFixed(2)} €
                </div>
                <div className="mt-1 flex justify-end gap-1">
                  <button
                    onClick={() => setSelected(item)}
                    className="rounded bg-black px-3 py-1 text-sm text-white"
                  >
                    Apoyar
                  </button>
                  <button
                    onClick={() => impulsar(item)}
                    className="rounded border px-3 py-1 text-sm"
                  >
                    Impulsar
                  </button>
                </div>
              </div>
            </div>
 
            {shareItem?.id === item.id && (
              <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                {links(item).map(([name, href]) => (
                  <a
                    key={name}
                    href={href}
                    aria-label={name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border p-2 text-xl"
                  >
                    {icons[name]}
                  </a>
                ))}
                {typeof navigator !== "undefined" && "share" in navigator && (
                  <button
                    onClick={() => compartirMas(item)}
                    aria-label="Instagram"
                    className="rounded border p-2 text-xl"
                  >
                    <FaInstagram />
                  </button>
                )}
                <button
                  onClick={copyLink}
                  aria-label="Copiar enlace"
                  className="rounded border p-2 text-xl"
                >
                  {copied ? "✓" : <FaLink />}
                </button>
              </div>
            )}
 
            {selected?.id === item.id && (
              <div className="mt-3 space-y-2 border-t pt-3">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  maxLength={30}
                  className="w-full rounded border p-2"
                />
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
            )}
          </li>
        ))}
      </ol>
    </main>
  );
}
 