"use client";
import { FaShareNodes } from "react-icons/fa6";
import type { Item } from "@/lib/shared";
import { eur, medals } from "@/lib/shared";
import Avatar from "@/components/Avatar";
 
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
    <li className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 shrink-0 text-center text-xl font-extrabold">
          {rank <= 3 ? (
            medals[rank - 1]
          ) : (
            <span className="text-sm text-zinc-500">#{rank}</span>
          )}
        </div>
        <Avatar item={item} size={44} />
        <div className="min-w-0 flex-1">
          <a href={`/i/${item.slug}`} className="block">
            <div className="truncate font-bold">{item.name}</div>
            <div className="truncate text-xs text-zinc-500">
              {item.description}
            </div>
          </a>
          {item.promo_text &&
            (item.promo_url ? (
              <a
                href={item.promo_url}
                target="_blank"
                rel="nofollow noopener sponsored"
                className="mt-0.5 block truncate text-xs font-semibold text-rose-400"
              >
                📣 {item.promo_text}
              </a>
            ) : (
              <div className="mt-0.5 truncate text-xs font-semibold text-rose-400">
                📣 {item.promo_text}
              </div>
            ))}
        </div>
        <div className="shrink-0 text-right font-bold text-amber-300">
          {eur(item.total_cents)}
        </div>
      </div>
 
      <div className="mt-2 h-1.5 rounded-full bg-zinc-800">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
          style={{
            width: `${Math.max(3, (item.total_cents / (max || 1)) * 100)}%`,
          }}
        />
      </div>
 
      {gap !== undefined && gap > 0 && (
        <div className="mt-2 text-xs text-rose-400">
          Faltan {eur(gap)} para subir al #{rank - 1}
        </div>
      )}
 
      <div className="mt-3 flex gap-2">
        <button
          onClick={onSupport}
          className="btn-apoyar flex-1 rounded-full py-2.5 text-sm"
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
 