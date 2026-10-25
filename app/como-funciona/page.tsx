export const metadata = { title: "Cómo funciona · mifavorito" };
 
export default function ComoFunciona() {
  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <h1 className="text-3xl font-extrabold">Cómo funciona</h1>
      <ol className="space-y-3">
        <li className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <b>1. Elige tu favorito.</b> Una estrella, un país, una bebida, un
          equipo… ¿Tu favorito no está? Añádelo.
        </li>
        <li className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <b>2. Apóyalo desde 1 €.</b> 1 € = 1 voto. El puesto lo decide quien más votos recibe.
        </li>
        <li className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <b>3. Impúlsalo.</b> Compártelo con tus amigos para llevarlo al
          número uno.
        </li>
      </ol>
      <p className="text-sm text-zinc-500">
        Sin cuenta y sin datos personales: solo un nombre de usuario y tu email
        para la factura, que gestiona Stripe.
      </p>
    </main>
  );
}
 