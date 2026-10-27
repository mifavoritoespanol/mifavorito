"use client";
import { useEffect, useState } from "react";
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
import Link from "next/link";
import { voteLabel } from "@/lib/shared";
import Avatar from "@/components/Avatar";

type ElectionStatus = { categorySlug: string; categoryName: string; opensAt: string; closesAt: string; isOpen: boolean; testMode: boolean; scheduled?: boolean };

const VOTE_PRESETS = [1, 5, 10, 25, 50];
const field =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-base text-white";

export default function ItemSheet({
  item,
  mode,
  allowPromo,
  onClose,
  demoMode = false,
}: {
  item: Item;
  mode: "support" | "share";
  allowPromo: boolean;
  onClose: () => void;
  demoMode?: boolean;
}) {
  const [votes, setVotes] = useState<number | "otra">(5);
  const [custom, setCustom] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [withdrawalConsent, setWithdrawalConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [election, setElection] = useState<ElectionStatus | null>(null);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const response = await fetch(`/api/election-status?category=${encodeURIComponent(item.category_slug ?? "estrellas")}`, { cache: "no-store" });
        if (response.ok) {
          const value = await response.json();
          if (alive) setElection(value);
        }
      } catch { /* checkout stays disabled if the window cannot be verified */ }
    };
    void refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [item.category_slug]);

  const voteValue = votes === "otra" ? Number(custom) : votes;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const valid = Number.isInteger(voteValue) && voteValue >= 1 && username.trim().length > 0 && validEmail && withdrawalConsent;

  const url = `${window.location.origin}/i/${item.slug}`;
  const text = `Estoy apoyando a ${item.name} en mifavorito. ¡Ayúdame a llevarlo al número uno!`;
  const encode = encodeURIComponent;
  const shares = [
    { label: "X", icon: <FaXTwitter />, href: `https://twitter.com/intent/tweet?text=${encode(text)}&url=${encode(url)}` },
    { label: "WhatsApp", icon: <FaWhatsapp />, href: `https://wa.me/?text=${encode(text + " " + url)}` },
    { label: "Facebook", icon: <FaFacebookF />, href: `https://www.facebook.com/sharer/sharer.php?u=${encode(url)}` },
    { label: "Telegram", icon: <FaTelegram />, href: `https://t.me/share/url?url=${encode(url)}&text=${encode(text)}` },
  ];
  const canNativeShare = "share" in navigator;

  async function pay() {
    if (demoMode || !valid || election?.isOpen !== true) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          votes: voteValue,
          username: username.trim(),
          email: email.trim(),
          withdrawalConsent,
          message: allowPromo ? message : "",
          link: allowPromo ? link : "",
        }),
      });
      const data = await response.json();
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border-t border-zinc-700 bg-zinc-900 p-5 pb-8 text-white" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <Avatar item={item} size={44} />
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {mode === "support" ? "Apoyar a" : "Impulsar a"}
            </div>
            <div className="truncate text-xl font-extrabold">{item.name}</div>
            <div className="text-sm text-amber-300">{voteLabel(item.total_cents)}</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-full bg-zinc-800 p-3">
            <FaXmark />
          </button>
        </div>

        {mode === "support" ? (
          <div>
            {demoMode && <div className="mb-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-center text-sm text-amber-100">Demo local: ningún voto se cobra ni se guarda.</div>}
            <div className="mb-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-3 text-center">
              <div className="font-bold text-white">1 € = 1 voto</div>
              <div className="mt-0.5 text-xs text-zinc-400">Elige cuántos votos quieres dar.</div>
            </div>
            <div className={`mb-3 rounded-xl border px-4 py-3 text-center text-sm ${election?.isOpen ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-100" : "border-amber-300/20 bg-amber-300/[0.06] text-amber-100"}`} aria-live="polite">
              {demoMode
                ? "Vista previa local · pago desactivado"
                : !election
                  ? "Comprobando el calendario de rondas…"
                  : election.scheduled === false
                    ? "Esta categoría todavía no tiene una ronda de apoyo programada."
                    : election.isOpen
                    ? election.testMode
                      ? "Modo de prueba local: los votos de prueba no son oficiales."
                      : `Ronda abierta hasta ${new Date(election.closesAt).toLocaleString("es-ES", {})}.`
                    : `Ronda cerrada. Abre el ${new Date(election.opensAt).toLocaleString("es-ES", {})}.`}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {VOTE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setVotes(preset)}
                  className={`rounded-xl py-3 text-base font-bold ${votes === preset ? "btn-apoyar" : "bg-zinc-800"}`}
                >
                  {preset} {preset === 1 ? "voto" : "votos"}
                </button>
              ))}
              <button
                onClick={() => setVotes("otra")}
                className={`rounded-xl py-3 text-base font-bold ${votes === "otra" ? "btn-apoyar" : "bg-zinc-800"}`}
              >
                Otra cantidad
              </button>
            </div>

            {votes === "otra" && (
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={custom}
                onChange={(event) => setCustom(event.target.value)}
                placeholder="Número de votos (1 € por voto)"
                className={`${field} mt-3`}
              />
            )}

            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Tu nombre de usuario"
              maxLength={30}
              className={`${field} mt-3`}
            />

            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Tu email para el recibo de Stripe" className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-base text-white mt-3" required />

            {allowPromo && (
              <div className="mt-3 rounded-xl border border-dashed border-zinc-700 p-3">
                <div className="mb-2 text-xs text-zinc-400">
                  📣 Si eres el mayor apoyo, tu mensaje aparecerá junto al nombre (opcional).
                </div>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={100}
                  placeholder="Tu mensaje o promo (100 caracteres)"
                  className={field}
                />
                <input
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  inputMode="url"
                  placeholder="https://tuweb.com"
                  className={`${field} mt-2`}
                />
              </div>
            )}

            {error && <div className="mt-2 text-rose-400">{error}</div>}

            <label className="mt-3 flex items-start gap-3 rounded-xl border border-zinc-700 bg-zinc-950/60 p-3 text-sm leading-5 text-zinc-300"><input type="checkbox" checked={withdrawalConsent} onChange={(event) => setWithdrawalConsent(event.target.checked)} className="mt-1 size-4 accent-amber-300" /><span>Solicito que el servicio comience de inmediato y reconozco que perderé mi derecho de desistimiento una vez que el voto se haya contabilizado y el servicio se haya ejecutado íntegramente. He leído los <Link href="/terminos" className="underline">Términos de uso</Link>, la <Link href="/devoluciones" className="underline">Política de devoluciones</Link> y la <Link href="/privacidad" className="underline">Política de privacidad</Link>.</span></label>

            <button onClick={pay} disabled={demoMode || !valid || loading || election?.isOpen !== true} className="btn-apoyar mt-3 w-full rounded-full py-4 text-lg">
              {loading
                ? "..."
                : !election
                  ? "Comprobando la ronda de apoyo…"
                  : !election.isOpen
                    ? "Las rondas de apoyo están cerradas"
                    : valid
                      ? `Apoyar con ${voteValue} ${voteValue === 1 ? "voto" : "votos"} · ${voteValue} €`
                      : "Completa tus datos y acepta el inicio inmediato"}
            </button>
            <p className="mt-2 text-center text-xs text-zinc-500">El recibo de Stripe se enviará a tu email e incluirá el consentimiento registrado. Contacto y reembolsos: <a href="mailto:contact@mifavorito.app" className="underline">contact@mifavorito.app</a>.</p>
            <p className="mt-2 text-center text-xs text-zinc-500">
              {demoMode ? "Demo local: no se procesa ningún pago." : "Pago seguro con Stripe · Apple Pay y Google Pay disponibles"}
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-3 text-sm text-zinc-400">Cuéntaselo a tus amigos y ayúdalo a subir.</p>
            <div className="flex flex-wrap gap-3">
              {shares.map((share) => (
                <a key={share.label} href={share.href} aria-label={share.label} target="_blank" rel="noopener noreferrer" className="rounded-full bg-zinc-800 p-4 text-2xl">
                  {share.icon}
                </a>
              ))}
              {canNativeShare && (
                <button onClick={nativeShare} aria-label="Instagram" className="rounded-full bg-zinc-800 p-4 text-2xl">
                  <FaInstagram />
                </button>
              )}
              <button onClick={copy} aria-label="Copiar enlace" className="rounded-full bg-zinc-800 p-4 text-2xl">
                {copied ? "✓" : <FaLink />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

