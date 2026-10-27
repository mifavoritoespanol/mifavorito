import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Por qué y cómo funciona",
  description:
    "Por qué existe mifavorito: ediciones mensuales, un euro por voto y apoyo para los favoritos de cada país.",
};

const steps = [
  {
    number: "01",
    title: "Una edición cada mes",
    body: "Cada ronda de apoyo tiene fechas claras de apertura y cierre. Las categorías van rotando y podrán volver: los gustos y las tendencias cambian.",
  },
  {
    number: "02",
    title: "Elige tu favorito",
    body: "Busca la opción que quieres apoyar y participa durante la ronda de apoyo. No necesitas crear una cuenta.",
  },
  {
    number: "03",
    title: "Un euro, un voto",
    body: "Cada voto cuesta 1 €. Elige cuántos votos quieres dar y completa el pago seguro con Stripe.",
  },
];

export default function ComoFunciona() {
  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 pb-20 pt-8">
      <section className="rounded-3xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200/75">Por qué existe mifavorito</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
          Lo mejor de cada lugar merece ser escuchado.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
          En todos los países y regiones hay algo que se siente único: una bebida,
          una comida, un artista musical… y la convicción de que lo nuestro es lo
          mejor. mifavorito convierte ese orgullo en rondas de apoyo abiertas, con
          fechas de inicio y de cierre.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-zinc-950/75 p-6 backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/75">Una regla sencilla</p>
        <h2 className="mt-2 text-2xl font-extrabold text-white">Menos cuentas falsas. Más apoyo real.</h2>
        <p className="mt-4 leading-7 text-zinc-300">
          Muchas votaciones en internet pueden verse alteradas por bots, perfiles
          duplicados o campañas automatizadas. En mifavorito no hay cuentas que
          puedan sumar votos gratis: no hace falta registrarse y cada voto requiere
          un pago. Esto ayuda a dificultar la manipulación; ningún sistema de
          votación online puede prometer que el fraude sea imposible.
        </p>
        <div className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
          <p className="text-lg font-extrabold text-white">1 € = 1 voto</p>
          <p className="mt-1 text-sm leading-6 text-zinc-400">
            El importe de tu apoyo se muestra antes de pagar y el pago se procesa de forma segura con Stripe.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-zinc-950/75 p-6 backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/75">Cómo funciona</p>
        <h2 className="mt-2 text-2xl font-extrabold text-white">Tres pasos para apoyar a tu favorito</h2>
        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          {steps.map((step) => (
            <li key={step.number} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <span className="text-xs font-black tracking-[0.18em] text-amber-200/70">{step.number}</span>
              <h3 className="mt-3 text-base font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-zinc-950/75 p-6 backdrop-blur-xl">
          <h2 className="text-xl font-extrabold text-white">Sin anuncios que condicionen la ronda</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            La ronda es de pago para ayudar a mantener el sitio sin publicidad y
            evitar que los anuncios influyan en qué opciones reciben visibilidad.
          </p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-zinc-950/75 p-6 backdrop-blur-xl">
          <h2 className="text-xl font-extrabold text-white">Promover a quienes más apoyo reciben</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Los ingresos contribuyen al mantenimiento de mifavorito y a dar
            visibilidad internacional a quienes quedan en lo más alto de cada edición.
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-amber-200/15 bg-gradient-to-br from-amber-200/[0.08] to-zinc-950/85 p-6 text-center backdrop-blur-xl sm:p-8">
        <h2 className="text-2xl font-black text-white">¿Qué te gusta y qué quieres promover?</h2>
        <p className="mx-auto mt-3 max-w-xl leading-7 text-zinc-300">
          Cada mes habrá una nueva oportunidad para apoyar lo que representa a tu
          país o región. Elige, apoya y compártelo con los tuyos.
        </p>
        <Link href="/" className="btn-apoyar mt-6 inline-flex rounded-full px-6 py-3 font-bold">
          Ver mifavorito
        </Link>
      </section>
    </main>
  );
}

