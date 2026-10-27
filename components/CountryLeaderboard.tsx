"use client";
import { useEffect, useState } from "react";
import { countryName } from "@/lib/countries";
import { useLocalDemoMode } from "@/lib/demoMode";

type Score = { countryCode: string; points: number };
const LOCAL_DEMO_SCORES: Score[] = [
  { countryCode: "CO", points: 13 },
  { countryCode: "ES", points: 9 },
  { countryCode: "MX", points: 5 },
];

export default function CountryLeaderboard() {
  const [liveScores, setLiveScores] = useState<Score[]>([]);
  const demoMode = useLocalDemoMode();

  useEffect(() => {
    if (demoMode) return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/country-leaderboard", { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json();
        if (active) setLiveScores(result.countries ?? []);
      } catch { /* Scores remain empty until the endpoint is available. */ }
    };
    void load();
    const timer = window.setInterval(load, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, [demoMode]);

  const scores = demoMode ? LOCAL_DEMO_SCORES : liveScores;
  return (
    <section className="ml-auto max-w-[14rem] rounded-2xl border border-white/10 bg-zinc-950/70 p-3 shadow-xl shadow-black/30 backdrop-blur-md">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-200/70">Medallero global</p>
      <h2 className="mt-0.5 text-sm font-extrabold leading-tight text-white">Puntos por país</h2>
      {scores.length ? (
        <ol className="mt-2 space-y-1">
          {scores.slice(0, 10).map((score, index) => (
            <li key={score.countryCode} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.04] px-2 py-1.5">
              <span className="flex min-w-0 items-center gap-2 text-xs text-zinc-200">
                <span className="w-3 shrink-0 text-[10px] font-bold text-zinc-500">{index + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://flagcdn.com/w40/${score.countryCode.toLowerCase()}.png`}
                  alt=""
                  aria-hidden="true"
                  className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover"
                />
                <span className="truncate">{countryName(score.countryCode)}</span>
              </span>
              <strong className="shrink-0 text-xs tabular-nums text-amber-100">{score.points}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-[10px] leading-4 text-zinc-400">El medallero se actualizará al cierre de cada edición.</p>
      )}
      <p className="mt-2 border-t border-white/10 pt-2 text-[9px] leading-4 text-zinc-500">
        Suma de podios: 1.º = 5 puntos, 2.º = 3, 3.º = 1, en todas las categorías.
      </p>
    </section>
  );
}

