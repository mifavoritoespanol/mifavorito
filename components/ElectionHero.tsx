"use client";
import { useEffect, useState } from "react";

export type ElectionStatus = {
  categorySlug: string;
  categoryName: string;
  opensAt: string;
  closesAt: string;
  isOpen: boolean;
  testMode: boolean;
} | null;

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
function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
    timeZone: "Europe/Madrid",
  }).format(new Date(value));
}

export default function ElectionHero({ status, categorySlug }: { status: ElectionStatus; categorySlug: string }) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!status || status.categorySlug !== categorySlug) return null;

  const open = status.isOpen;
  const target = new Date(open ? status.closesAt : status.opensAt).getTime();
  const remaining = now > 0 ? getRemaining(target, now) : null;
  const units: [string, string][] = remaining ? [
    [String(remaining.days), "días"], [pad(remaining.hours), "horas"],
    [pad(remaining.minutes), "min"], [pad(remaining.seconds), "seg"],
  ] : [["--", "días"], ["--", "horas"], ["--", "min"], ["--", "seg"]];

  return (
    <section className="relative mb-3 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/45 px-4 py-4 shadow-xl shadow-black/20 backdrop-blur-sm sm:px-5">
      <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-amber-300/[0.07] blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100/75">
            <span className={`h-2 w-2 rounded-full ${open ? "bg-emerald-400" : "bg-amber-300"}`} />
            {status.testMode ? "Modo de prueba local" : open ? "Votación abierta · cierra en" : "Próxima votación · abre en"}
          </div>
          <p className="mt-1 text-lg font-extrabold text-white">{status.categoryName}</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {open ? `Cierre: ${formatDate(status.closesAt)}` : `Apertura: ${formatDate(status.opensAt)} · cierre: ${formatDate(status.closesAt)}`}
          </p>
        </div>
        <div className="flex gap-1.5 sm:gap-2" aria-label={`Cuenta atrás de ${status.categoryName}`}>
          {units.map(([value, label]) => (
            <div key={label} className="min-w-[3.1rem] rounded-lg border border-white/10 bg-black/35 px-2 py-1.5 text-center sm:min-w-[3.7rem]">
              <div className="font-mono text-lg font-bold tabular-nums text-white sm:text-xl">{value}</div>
              <div className="text-[9px] uppercase tracking-wider text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

