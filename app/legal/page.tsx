import Link from "next/link";

export const metadata = {
  title: "Información legal y condiciones | mifavorito",
  description: "Borrador de información legal y condiciones de mifavorito.",
};

const sections = [
  {
    title: "Quién opera mifavorito",
    body: "La identidad legal del operador, su domicilio y los datos de contacto se añadirán antes de activar los pagos.",
  },
  {
    title: "Cómo funciona la elección",
    body: "La elección reconoce a artistas musicales de habla hispana. Incluye artistas individuales, DJ, productores, raperos, grupos e instrumentistas. No es una competición oficial ni está patrocinada por los artistas, sus representantes o las plataformas musicales. No se ofrece un premio.",
  },
  {
    title: "Votos y pagos",
    body: "El modelo previsto es de 1 € por voto. La naturaleza del servicio, el precio total, la confirmación de compra y las reglas de cancelación y reembolso deben quedar explicados antes de cobrar. Estas condiciones siguen en revisión y el pago no se presenta como una donación.",
  },
  {
    title: "Privacidad",
    body: "El sitio puede mostrar públicamente el nombre elegido por quien apoya a un artista y el número de votos asociado. Antes de abrir los pagos se publicarán el responsable del tratamiento, las finalidades, los proveedores, los plazos de conservación y la forma de ejercer los derechos sobre los datos.",
  },
  {
    title: "Anexos por país",
    body: "Estamos preparando condiciones para los países hispanohablantes, la Unión Europea, Estados Unidos y Canadá. Las reglas aplicables pueden variar por país, estado o provincia; esta página aún no contiene todos esos anexos.",
  },
];

export default function LegalPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
      <Link href="/" className="text-sm text-zinc-400 underline underline-offset-4 hover:text-white">
        ← Volver al inicio
      </Link>
      <header className="mt-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/70">mifavorito</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Información legal y condiciones</h1>
        <div className="mt-5 rounded-2xl border border-amber-200/20 bg-amber-200/[0.06] p-4 text-sm leading-6 text-zinc-200">
          <strong className="text-amber-100">Borrador en preparación.</strong> Esta página organiza los temas que deben completarse antes del lanzamiento. No sustituye las condiciones finales ni elimina los derechos obligatorios que correspondan en cada país.
        </div>
      </header>
      <div className="mt-8 space-y-4">
        {sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-white">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}