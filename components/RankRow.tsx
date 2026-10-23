"use client";
import { FaShareNodes } from "react-icons/fa6";
import type { Item } from "@/lib/shared";
import { eur, medals } from "@/lib/shared";
 
export default function RankRow({
  item,
  rank,
  max,
  gap,
  onSupport,
  onShare,
}: {
  item: Item;
  rank: number;
  max: number;
  gap?: number;
  onSupport: () => void;
  onShare: () => void;
}) {
  return (
    <li className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
      <div className="flex items-center gap-3">
        <div className="w-9 shrink-0 text-center text-2xl font-extrabold">
          {rank <= 3 ? (
            medals[rank - 1]
          ) : (
            <span className="text-base text-zinc-500">#{rank}</span>
          )}
        </div>
        <a href={`/i/${item.slug}`} className="min-w-0 flex-1">
          <div className="truncate font-bold">{item.name}</div>
          <div className="truncate text-xs text-zinc-500">{item.description}</div>
        </a>
        <div className="shrink-0 text-right font-bold text-amber-300">
          {eur(item.total_cents)}
        </div>
      </div>
 
      <div className="mt-2 h-1.5 rounded-full bg-zinc-800">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
          style={{ width: `${Math.max(3, (item.total_cents / (max || 1)) * 100)}%` }}
        />
      </div>
 
      {gap !== undefined && gap > 0 && (
        <div className="mt-2 text-xs text-rose-300">
          Faltan {eur(gap)} para subir al #{rank - 1}
        </div>
      )}
 
      <div className="mt-3 flex gap-2">
        <button
          onClick={onSupport}
          className="flex-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 py-2.5 text-sm font-extrabold text-black"
        >
          Apoyar
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-2 rounded-full border border-zinc-700 px-4 text-sm text-zinc-200"
        >
          <FaShareNodes /> Impulsar
        </button>
      </div>
    </li>
  );
}
 