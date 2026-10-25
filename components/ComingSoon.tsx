import Link from "next/link";

export default function ComingSoon({ category }: { category?: string }) {
  return (
    <main className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
      <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-amber-200/15 bg-zinc-900 shadow-2xl shadow-black/40">
        <div className="absolute inset-2 rounded-full border border-white/5" />
        <span className="text-5xl" aria-hidden="true">🔒</span>
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-200/70">
        Próximamente
      </p>
      <h1 className="mt-3 text-3xl font-black text-white">
        {category ? `Próximamente: ${category}` : "Nuevas categorías llegarán pronto"}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
        Ahora estamos preparando la elección de Cantante del año en español, dedicada a la música. Muy pronto podrás participar en más categorías.
      </p>
      <Link href="/" className="mt-7 rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-amber-200/40 hover:text-white">
        Volver al inicio
      </Link>
    </main>
  );
}
