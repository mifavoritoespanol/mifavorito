"use client";
import { useEffect, useState } from "react";

export type ElectionStatus = {
  categorySlug: string;
  categoryName: string;
  opensAt: string;
  closesAt: string;
  isOpen: boolean;
  testMode: boolean;
  scheduled: boolean;
};

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
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "Europe/Madrid" }).format(new Date(value));
}

export default function ElectionHero({ status, categorySlug, compact = false }: {
  status: ElectionStatus | null;
  categorySlug: string;
  compact?: boolean;
}) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const scheduled = status?.scheduled !== false;
  const opensAt = status ? new Date(status.opensAt).getTime() : null;
  const closesAt = status ? new Date(status.closesAt).getTime() : null;
  const open = status?.isOpen === true;
  const closed = scheduled && closesAt !== null && now >= closesAt && !open;
  const target = opensAt === null || closesAt === null ? null : (open ? closesAt : opensAt);
  const remaining = target === null || closed || now === 0 ? null : getRemaining(target, now);
  const units: [string, string][] = remaining ? [
    [String(remaining.days), "días"], [pad(remaining.hours), "horas"],
    [pad(remaining.minutes), "min"], [pad(remaining.seconds), "seg"],
  ] : [];

  const title = status?.categoryName ?? (categorySlug === "estrellas" ? "Música" : categorySlug);
  const label = !status
    ? "Calendario de rondas de apoyo"
    : !scheduled
      ? "Próximamente"
      : closed
        ? "Ronda cerrada"
        : status.testMode
          ? "Modo de prueba local"
          : open
            ? "Ronda abierta · cierra en"
            : "Próxima ronda · abre en";

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2" aria-label={"Cuenta atrás de " + title}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100/70">{open ? "Cierra en" : closed ? "Cerrada" : "Abre en"}</span>
        {units.length > 0 ? units.map(([value, name]) => (
          <span key={name} className="rounded-md border border-white/10 bg-black/35 px-1.5 py-1 font-mono text-xs font-bold tabular-nums text-white">
            {value}<span className="ml-1 font-sans text-[9px] font-medium text-zinc-400">{name}</span>
          </span>
        )) : <span className="text-xs text-zinc-400">{!scheduled ? "Próximamente" : closed ? "Cerrada" : "…"}</span>}
      </div>
    );
  }

  return (
    <section className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/75 p-5 text-center shadow-2xl shadow-black/50 backdrop-blur-md sm:p-6">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100/75">{label}</div>
      <h3 className="mt-2 text-xl font-black text-white">{title}</h3>
      {!scheduled ? (
        <p className="mt-2 text-sm text-zinc-300">La fecha de apertura de esta ronda se anunciará próximamente.</p>
      ) : closed ? (
        <p className="mt-2 text-sm text-zinc-300">Esta ronda de apoyo ya terminó.</p>
      ) : !status ? (
        <p className="mt-2 text-sm text-zinc-300">Consultando las fechas de apertura y cierre…</p>
      ) : (
        <>
          <p className="mt-1 text-xs text-zinc-400">
            {open ? "Cierre: " + formatDate(status.closesAt) : "Apertura: " + formatDate(status.opensAt) + " · Cierre: " + formatDate(status.closesAt)}
          </p>
          <div className="mt-4 flex justify-center gap-1.5 sm:gap-2" aria-label={"Cuenta atrás de " + title}>
            {(units.length ? units : [["--", "días"], ["--", "horas"], ["--", "min"], ["--", "seg"]] as [string, string][]).map(([value, name]) => (
              <div key={name} className="min-w-[3.2rem] rounded-lg border border-white/10 bg-black/35 px-2 py-2 sm:min-w-[3.7rem]">
                <div className="font-mono text-lg font-bold tabular-nums text-white sm:text-xl">{value}</div>
                <div className="text-[9px] uppercase tracking-wider text-zinc-500">{name}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
