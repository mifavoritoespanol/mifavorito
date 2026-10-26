"use client";
import type { Item } from "@/lib/shared";
import { voteLabel } from "@/lib/shared";
import Avatar from "@/components/Avatar";
import { countryFlag, countryName } from "@/lib/countries";

const spots = [
  { idx: 1, label: "2", size: 68, ped: "h-14", color: "from-slate-200 to-slate-400" },
  { idx: 0, label: "1", size: 88, ped: "h-24", color: "from-amber-200 to-amber-400" },
  { idx: 2, label: "3", size: 60, ped: "h-10", color: "from-orange-200 to-orange-400" },
];

export default function Podium({
  items,
  onSupport,
}: {
  items: Item[];
  onSupport: (item: Item) => void;
}) {
  const tiedTopThree = items.length >= 3 && items.slice(0, 3).every((item) => item.total_cents === items[0].total_cents);

  if (tiedTopThree) {
    return (
      <div className="mb-6 grid grid-cols-3 gap-2" aria-label="Tres opciones empatadas en el primer puesto">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex min-w-0 flex-col items-center rounded-2xl border border-zinc-700/70 bg-zinc-900/80 p-3 text-center">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-200">🥇 Empate · 1.º</div>
            <a href={`/i/${item.slug}`} className="mt-2 flex min-w-0 flex-col items-center">
              <Avatar item={item} size={60} />
              <div className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-extrabold leading-tight">
                {item.country_code && <span className="mr-1" title={countryName(item.country_code)} aria-label={countryName(item.country_code)}>{countryFlag(item.country_code)}</span>}{item.name}
              </div>
            </a>
            <div className="mt-1 text-xs font-bold text-amber-300">{voteLabel(item.total_cents)}</div>
            <button onClick={() => onSupport(item)} className="btn-apoyar mt-2 rounded-full px-3 py-1.5 text-xs">Apoyar</button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-end gap-2">
      {spots.map((s) => {
        const it = items[s.idx];
        if (!it) return <div key={s.idx} className="flex-1" />;
        return (
          <div key={it.id} className="flex flex-1 flex-col items-center">
            {s.idx === 0 && <div className="text-2xl">👑</div>}
            <a href={`/i/${it.slug}`} className="flex flex-col items-center">
              <Avatar item={it} size={s.size} />
              <div className="mt-2 line-clamp-2 min-h-[2.5rem] text-center text-sm font-extrabold leading-tight">
                {it.country_code && <span className="mr-1" title={countryName(it.country_code)} aria-label={countryName(it.country_code)}>{countryFlag(it.country_code)}</span>}{it.name}
              </div>
            </a>
            <div className="text-sm font-bold text-amber-300">{voteLabel(it.total_cents)}</div>
            <button onClick={() => onSupport(it)} className="btn-apoyar mt-2 rounded-full px-4 py-1.5 text-xs">Apoyar</button>
            <div className={`mt-3 flex w-full items-center justify-center rounded-t-2xl bg-gradient-to-b ${s.color} text-3xl font-extrabold text-black/50 ${s.ped}`}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}
