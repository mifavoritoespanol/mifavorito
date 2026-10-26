export type Category = {
  id: number;
  slug: string;
  name: string;
  emoji: string | null;
};

export type Item = {
  id: number;
  category_id: number;
  category_slug?: string;
  name: string;
  slug: string;
  description: string | null;
  wikipedia_url?: string | null;
  info_summary?: string | null;
  grokipedia_url?: string | null;
  image_url: string | null;
  total_cents: number;
  country_code: string | null;
  top_username: string | null;
  promo_text: string | null;
  promo_url: string | null;
};

export type SheetState = {
  item: Item;
  mode: "support" | "share";
  allowPromo: boolean;
} | null;

export const medals = ["🥇", "🥈", "🥉"];

export function voteCount(cents: number) {
  return Math.round(cents / 100);
}

export function voteLabel(cents: number) {
  const votes = voteCount(cents);
  return `${votes} ${votes === 1 ? "voto" : "votos"}`;
}

export function voteLabelCompact(cents: number) {
  const votes = voteCount(cents);
  if (votes < 1_000_000) return voteLabel(cents);
  const millions = Math.round(votes / 100_000) / 10;
  return `${millions.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M votos`;
}

