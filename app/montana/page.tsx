import type { Metadata } from "next";
import MontanaModeration from "@/components/MontanaModeration";

export const metadata: Metadata = {
  title: "Revisión privada · mifavorito",
  robots: { index: false, follow: false },
};

export default function MontanaPage() {
  return <MontanaModeration />;
}
