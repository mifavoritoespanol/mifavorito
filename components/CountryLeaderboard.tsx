"use client";
import { useEffect, useState } from "react";
import { countryFlag, countryName } from "@/lib/countries";

type Score = { countryCode: string; points: number };

export default function CountryLeaderboard() {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/country-leaderboard", { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json();
        if (active) setScores(result.countries ?? []);
      } catch { /* Scores remain empty until the endpoint is available. */ }
    };
    void load();
    const timer = window.setInterval(load, 60000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-md">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/70">Marcador global</p>
      <h2 className="mt-1 text-lg font-extrabold text-white">Clasificación global por país</h2>
      <p className="mt-1 text-xs leading-5 text-zinc-400">Se suman los puntos obtenidos por cada país en los podios de todas las categorías: 1.º lugar, 5 puntos; 2.º, 3 puntos; 3.º, 1 punto.</p>
      {scores.length ? (
        <ol className="mt-4 space-y-2">
          {scores.slice(0, 10).map((score, index) => (
            <li key={score.countryCode} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-3 py-2">
              <span className="flex min-w-0 items-center gap-2 text-sm text-zinc-200">
                <span className="w-5 text-xs font-bold text-zinc-500">{index + 1}</span>
                <span aria-hidden="true">{countryFlag(score.countryCode)}</span>
                <span className="truncate">{countryName(score.countryCode)}</span>
              </span>
              <strong className="shrink-0 text-sm tabular-nums text-amber-100">{score.points}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 rounded-xl bg-white/[0.04] p-3 text-xs leading-5 text-zinc-400">
          La clasificación se actualizará al cierre de cada elección, sumando los puntos del podio.
        </p>
      )}
    </section>
  );
}

