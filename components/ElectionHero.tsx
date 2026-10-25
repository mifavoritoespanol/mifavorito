"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type ElectionStatus = { opensAt: string; closesAt: string; isOpen: boolean; testMode: boolean };
type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function getRemaining(target: number, now: number): Remaining {
  const totalSeconds = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}
function pad(value: number) { return String(value).padStart(2, "0"); }
function formatUtc(value: string) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short",  }).format(new Date(value));
}

export default function ElectionHero() {
  const [status, setStatus] = useState<ElectionStatus | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/election-status", { cache: "no-store" });
        if (response.ok) {
          const next = await response.json();
          if (alive) setStatus(next);
        }
      } catch { /* no vote controls are enabled without a status */ }
    };
    void refresh();
    const statusTimer = window.setInterval(refresh, 15000);
    const clockTimer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      alive = false;
      window.clearInterval(statusTimer);
      window.clearInterval(clockTimer);
    };
  }, []);

  const opensAt = status ? new Date(status.opensAt).getTime() : null;
  const closesAt = status ? new Date(status.closesAt).getTime() : null;
  const open = status?.isOpen === true;
  const closed = closesAt !== null && now >= closesAt && !open;
  const target = opensAt === null || closesAt === null ? null : (open || now >= opensAt ? closesAt : opensAt);
  const remaining = target === null ? null : getRemaining(target, now);
  const units = remaining ? [
    [String(remaining.days), "días"], [pad(remaining.hours), "horas"],
    [pad(remaining.minutes), "min"], [pad(remaining.seconds), "seg"],
  ] : [["--", "días"], ["--", "horas"], ["--", "min"], ["--", "seg"]];

  return (
    <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-amber-200/15 bg-gradient-to-br from-zinc-900 via-zinc-900 to-[#17150f] p-6 shadow-2xl shadow-black/30 sm:p-8">
      <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="relative">
        <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-200/80">
          <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(223,189,120,0.8)]" />
          {status?.testMode ? "Modo de prueba local" : "Elección inaugural · 15 días"}
        </div>
        <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
          ¿Qué artista musical se llevará el título del año en español?
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300 sm:text-base">
          Una elección abierta a cantantes, DJ, raperos, productores, grupos y músicos de habla hispana. {status && `La ventana cierra el ${formatUtc(status.closesAt)}`}
        </p>
        <div className="mt-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
              {closed ? "Votación cerrada" : open ? "Votación abierta · cierra en" : "La votación abre en"}
            </div>
            {!closed && <div className="flex gap-2 sm:gap-3" aria-label="Cuenta atrás de la elección">
              {units.map(([value, label]) => (
                <div key={label} className="min-w-[3.7rem] rounded-xl border border-white/10 bg-black/30 px-2 py-2 text-center sm:min-w-[4.5rem] sm:px-3 sm:py-2.5">
                  <div className="font-mono text-xl font-bold tabular-nums text-white sm:text-2xl">{value}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
                </div>
              ))}
            </div>}
          </div>
          <Link href="/c/estrellas" className="btn-apoyar inline-flex items-center justify-center rounded-full px-6 py-3 text-sm">
            Ver artistas <span className="ml-2" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
