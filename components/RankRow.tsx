"use client";
import { FaShareNodes } from "react-icons/fa6";
import type { Item } from "@/lib/shared";
import { voteLabel, voteLabelCompact, medals } from "@/lib/shared";
import Avatar from "@/components/Avatar";
import { countryFlag, countryName } from "@/lib/countries";

type AdminStatus = "pending" | "approved" | "rejected";

export default function RankRow({
  item, rank, max, gap, onSupport, onShare, compactVotes = false, allowSupport = true,
  adminStatus, onAdminStatusChange,
}: {
  item: Item;
  rank: number;
  max: number;
  gap?: number;
  onSupport: () => void;
  onShare: () => void;
  compactVotes?: boolean;
  allowSupport?: boolean;
  adminStatus?: AdminStatus;
  onAdminStatusChange?: (item: Item, status: "approved" | "rejected") => void;
}) {
  const percentage = Math.min(100, Math.max(0, (item.total_cents / (max || 1)) * 100));
  const visiblePercentage = Math.max(3, percentage);
  const formatVotes = compactVotes ? voteLabelCompact : voteLabel;

  return (
    <li className="rounded-2xl border border-zinc-700/70 bg-gradient-to-br from-[#25292d]/95 to-[#181b1e]/95 p-3 shadow-[0_12px_24px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-center gap-3">
        <div className="w-8 shrink-0 text-center text-xl font-extrabold">
          {rank <= 3 ? medals[rank - 1] : <span className="text-sm text-zinc-500">#{rank}</span>}
        </div>
        <Avatar item={item} size={44} />
        <div className="min-w-0 flex-1">
          <a href={`/i/${item.slug}`} className="block">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate font-bold">{item.name}</span>
              {item.country_code && <span title={countryName(item.country_code)} aria-label={countryName(item.country_code)}>{countryFlag(item.country_code)}</span>}
            </div>
            <div className="truncate text-xs text-zinc-400">{item.description}</div>
          </a>
          {item.promo_text && (item.promo_url ? (
            <a href={item.promo_url} target="_blank" rel="nofollow noopener sponsored" className="mt-0.5 block truncate text-xs font-semibold text-rose-300">📣 {item.promo_text}</a>
          ) : <div className="mt-0.5 truncate text-xs font-semibold text-rose-300">📣 {item.promo_text}</div>)}
        </div>
        <div className="shrink-0 text-right font-bold text-emerald-300">{formatVotes(item.total_cents)}</div>
      </div>
      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-700/80">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 via-amber-300 to-emerald-400 transition-[clip-path] duration-500" style={{ clipPath: `inset(0 ${100 - visiblePercentage}% 0 0)` }} aria-hidden="true" />
      </div>
      {gap !== undefined && gap > 0 && <div className="mt-2 text-xs text-rose-300">Faltan {formatVotes(gap)} para subir al #{rank - 1}</div>}
      {adminStatus === "pending" && <div className="mt-2 text-xs font-semibold text-amber-200">Pendiente de aprobación</div>}
      <div className="mt-3 flex flex-wrap gap-2">
        {allowSupport && <button onClick={onSupport} className="btn-apoyar flex-1 rounded-full py-2.5 text-sm">Apoyar</button>}
        {onShare && <button onClick={onShare} className="flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200"><FaShareNodes /> Impulsar</button>}
        {onAdminStatusChange && (adminStatus === "approved" || adminStatus === "rejected") && (
          <button onClick={() => onAdminStatusChange(item, adminStatus === "approved" ? "rejected" : "approved")}
            className={`rounded-full border px-4 py-2 text-sm font-bold ${adminStatus === "approved" ? "border-red-300/25 text-red-200" : "border-emerald-300/25 text-emerald-200"}`}>
            {adminStatus === "approved" ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>
    </li>
  );
}
