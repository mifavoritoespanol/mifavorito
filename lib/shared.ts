export type Category = {
  id: number;
  slug: string;
  name: string;
  emoji: string | null;
};
 
export type Item = {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  total_cents: number;
};
 
export type SheetState = { item: Item; mode: "support" | "share" } | null;
 
export const medals = ["🥇", "🥈", "🥉"];
 
export function eur(cents: number) {
  return `${(cents / 100).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}
 