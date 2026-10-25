"use client";
import { useState } from "react";
import {
  FaXTwitter,
  FaWhatsapp,
  FaFacebookF,
  FaTelegram,
  FaInstagram,
  FaLink,
  FaXmark,
} from "react-icons/fa6";
import type { Item } from "@/lib/shared";
import { eur } from "@/lib/shared";
import Avatar from "@/components/Avatar";
 
const AMOUNTS = [1, 5, 10, 25, 50];
const field =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-base text-white";
 
export default function ItemSheet({
  item,
  mode,
  allowPromo,
  onClose,
}: {
  item: Item;
  mode: "support" | "share";
  allowPromo: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState<number | "otra">(5);
  const [custom, setCustom] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
 
  const value = amount === "otra" ? Number(custom) : amount;
  const valid = value >= 1 && username.trim().length > 0;
 
  const url = `${window.location.origin}/i/${item.slug}`;
  const text = `Estoy apoyando a ${item.name} en mifavorito. ¡Ayúdame a llevarlo al número uno!`;
  const e = encodeURIComponent;
  const shares = [
    { label: "X", icon: <FaXTwitter />, href: `https://twitter.com/intent/tweet?text=${e(text)}&url=${e(url)}` },
    { label: "WhatsApp", icon: <FaWhatsapp />, href: `https://wa.me/?text=${e(text + " " + url)}` },
    { label: "Facebook", icon: <FaFacebookF />, href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}` },
    { label: "Telegram", icon: <FaTelegram />, href: `https://t.me/share/url?url=${e(url)}&text=${e(text)}` },
  ];
  const canNativeShare = "share" in navigator;
 
  async function pay() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          itemName: item.name,
          amount: value,
          username: username.trim(),
          message: allowPromo ? message : "",
          link: allowPromo ? link : "",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Error");
        setLoading(false);
      }
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }
 
  async function nativeShare() {
    try {
      await navigator.share({ title: "mifavorito", text, url });
    } catch {
      /* cancelado */
    }
  }
 
  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border-t border-zinc-700 bg-zinc-900 p-5 pb-8 text-white"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <Avatar item={item} size={44} />
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {mode === "support" ? "Apoyar a" : "Impulsar a"}
            </div>
            <div className="truncate text-xl font-extrabold">{item.name}</div>
            <div className="text-sm text-amber-300">{eur(item.total_cents)}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full bg-zinc-800 p-3"
          >
            <FaXmark />
          </button>
        </div>
 
        {mode === "support" ? (
          <div>
            <div className="grid grid-cols-3 gap-2">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className={`rounded-xl py-3 text-lg font-bold ${
                    amount === a ? "btn-apoyar" : "bg-zinc-800"
                  }`}
                >
                  {a} €
                </button>
              ))}
              <button
                onClick={() => setAmount("otra")}
                className={`rounded-xl py-3 text-lg font-bold ${
                  amount === "otra" ? "btn-apoyar" : "bg-zinc-800"
                }`}
              >
                Otra
              </button>
            </div>
 
            {amount === "otra" && (
              <input
                type="number"
                inputMode="decimal"
                min="1"
                value={custom}
                onChange={(ev) => setCustom(ev.target.value)}
                placeholder="Importe en € (mínimo 1)"
                className={`${field} mt-3`}
              />
            )}
 
            <input
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
              placeholder="Tu nombre de usuario"
              maxLength={30}
              className={`${field} mt-3`}
            />
 
            {allowPromo && (
              <div className="mt-3 rounded-xl border border-dashed border-zinc-700 p-3">
                <div className="mb-2 text-xs text-zinc-400">
                  📣 Si eres el mayor apoyo, tu mensaje aparecerá junto al
                  nombre (opcional).
                </div>
                <input
                  value={message}
                  onChange={(ev) => setMessage(ev.target.value)}
                  maxLength={100}
                  placeholder="Tu mensaje o promo (100 caracteres)"
                  className={field}
                />
                <input
                  value={link}
                  onChange={(ev) => setLink(ev.target.value)}
                  inputMode="url"
                  placeholder="https://tuweb.com"
                  className={`${field} mt-2`}
                />
              </div>
            )}
 
            {error && <div className="mt-2 text-rose-400">{error}</div>}
 
            <button
              onClick={pay}
              disabled={!valid || loading}
              className="btn-apoyar mt-3 w-full rounded-full py-4 text-lg"
            >
              {loading ? "..." : valid ? `Apoyar con ${value} €` : "Apoyar"}
            </button>
            <p className="mt-2 text-center text-xs text-zinc-500">
              Pago seguro con Stripe · Apple Pay y Google Pay disponibles
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-3 text-sm text-zinc-400">
              Cuéntaselo a tus amigos y ayúdalo a subir.
            </p>
            <div className="flex flex-wrap gap-3">
              {shares.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-zinc-800 p-4 text-2xl"
                >
                  {s.icon}
                </a>
              ))}
              {canNativeShare && (
                <button
                  onClick={nativeShare}
                  aria-label="Instagram"
                  className="rounded-full bg-zinc-800 p-4 text-2xl"
                >
                  <FaInstagram />
                </button>
              )}
              <button
                onClick={copy}
                aria-label="Copiar enlace"
                className="rounded-full bg-zinc-800 p-4 text-2xl"
              >
                {copied ? "✓" : <FaLink />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 