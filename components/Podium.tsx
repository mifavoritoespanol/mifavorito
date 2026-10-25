"use client";
import type { Item } from "@/lib/shared";
import { voteLabel } from "@/lib/shared";
import Avatar from "@/components/Avatar";
 
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
                {it.name}
              </div>
            </a>
            <div className="text-sm font-bold text-amber-300">
              {voteLabel(it.total_cents)}
            </div>
            <button
              onClick={() => onSupport(it)}
              className="btn-apoyar mt-2 rounded-full px-4 py-1.5 text-xs"
            >
              Apoyar
            </button>
            <div
              className={`mt-3 flex w-full items-center justify-center rounded-t-2xl bg-gradient-to-b ${s.color} text-3xl font-extrabold text-black/50 ${s.ped}`}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
