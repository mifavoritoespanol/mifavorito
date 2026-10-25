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
  image_url: string | null;
  total_cents: number;
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
 
export function eur(cents: number) {
  return `${(cents / 100).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}