import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950/80 px-5 py-6 text-sm text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <span>© 2026 mifavorito</span>
        <Link href="/legal" className="underline decoration-zinc-600 underline-offset-4 transition hover:text-white">
          Información legal y condiciones
        </Link>
      </div>
    </footer>
  );
}