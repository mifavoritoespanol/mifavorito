import Link from "next/link";
import { COUNTRIES } from "@/lib/countries";

export const metadata = {
  title: "Información legal y condiciones | mifavorito",
  description: "Información legal y notas locales para las elecciones de mifavorito.",
};

const countryNotes: Record<string, { note: string; source: string; label: string }> = {
  ES: { note: "En contratos a distancia con consumidores, la regla general prevé 14 días para desistir, con excepciones legales. Antes de cobrar, hay que explicar claramente el servicio digital, el precio total, el consentimiento para iniciar su ejecución y las consecuencias para el desistimiento.", source: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555", label: "Ley General para la Defensa de los Consumidores y Usuarios" },
  MX: { note: "La información de la oferta, la identidad y contacto del proveedor, el precio total, los medios de pago y las condiciones de cancelación deben mostrarse antes de comprar. Revisar además las obligaciones mexicanas de comercio electrónico y privacidad para proveedores que se dirigen a consumidores en México.", source: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPC.pdf", label: "Ley Federal de Protección al Consumidor" },
  AR: { note: "Las compras a distancia cuentan, como regla general, con 10 días corridos para revocar la aceptación. El sitio debe ofrecer el botón de arrepentimiento en un lugar visible y accesible; se debe confirmar cómo se aplica este derecho a votos digitales consumidos al instante.", source: "https://www.argentina.gob.ar/justicia/derechofacil/leysimple/contratos-de-consumo", label: "Argentina.gob.ar: contratos de consumo" },
  CO: { note: "En ventas a distancia existe un derecho de retracto de 5 días hábiles, con excepciones que incluyen servicios cuya ejecución haya comenzado con acuerdo del consumidor y apuestas y loterías. La clasificación de votos pagados como servicio, concurso o actividad similar debe revisarse antes de abrir pagos.", source: "https://www1.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=44306", label: "Ley 1480 de 2011, artículos 46–51" },
  CL: { note: "Para servicios contratados por medios electrónicos, puede existir retracto dentro de 10 días desde la contratación y antes de que el servicio se preste; ciertas exclusiones para servicios deben informarse previa y claramente. La ejecución inmediata de un voto requiere revisión específica.", source: "https://www.sernac.cl/portal/617/w3-article-57413.html", label: "SERNAC: derecho a retracto" },
  PE: { note: "Mostrar antes del pago la identidad del proveedor, las características del servicio, el precio total con cargos e impuestos, los canales de atención y el comprobante. Revisar el Código de Protección y Defensa del Consumidor y las obligaciones locales de atención de reclamos.", source: "https://www.gob.pe/indecopi", label: "INDECOPI: protección al consumidor" },
  VE: { note: "Antes de aceptar pagos dirigidos a Venezuela, validar la normativa vigente sobre protección al consumidor, comercio electrónico, datos personales y medios de pago, así como la viabilidad de cobros y reembolsos transfronterizos. No activar pagos hasta confirmar estos puntos con asesoría local.", source: "http://www.sundde.gob.ve/", label: "SUNDDE: autoridad de protección de derechos socioeconómicos" },
  EC: { note: "Las condiciones deben informar de manera clara el precio, el alcance del servicio, la identidad del proveedor y el procedimiento de reclamo. Confirmar con asesoría ecuatoriana el encaje de una elección con votos pagados y sus reglas de devolución antes de aceptar pagos locales.", source: "https://www.asambleanacional.gob.ec/", label: "Asamblea Nacional: legislación ecuatoriana" },
  GT: { note: "La Ley de Protección al Consumidor y Usuario exige atención a los derechos e intereses económicos de consumidores. Publicar identidad y contacto del proveedor, condiciones completas, precio y canal de quejas; comprobar localmente las reglas aplicables a compras digitales y reembolsos.", source: "https://diaco.gob.gt/", label: "DIACO: protección al consumidor" },
  CU: { note: "La disponibilidad de pagos internacionales, las reglas de contratación digital y las normas de consumo y datos deben verificarse específicamente antes de ofrecer el servicio en Cuba. No se aceptarán pagos hasta confirmar también las restricciones del procesador y las sanciones aplicables.", source: "https://www.gacetaoficial.gob.cu/", label: "Gaceta Oficial de la República de Cuba" },
  BO: { note: "Informar de forma previa y comprensible quién presta el servicio, cuánto cuesta cada voto, cómo se contabiliza y cómo presentar una reclamación. Verificar el régimen boliviano de protección a usuarios y consumidores y las reglas cambiarias y de pagos internacionales.", source: "https://www.gacetaoficialdebolivia.gob.bo/", label: "Gaceta Oficial del Estado Plurinacional de Bolivia" },
  DO: { note: "La información al consumidor debe ser veraz, clara, oportuna y en español. Los términos de compra deben estar disponibles antes de contratar, junto con el precio, el proveedor, los medios de reclamación y las reglas de cancelación y reembolso.", source: "https://proconsumidor.gob.do/files/Ley_General_de_Proteccin_de_los_Derechos_del_Consumidor_o_Usuario_No__358-05.pdf", label: "Ley 358-05 de protección al consumidor" },
  HN: { note: "Presentar en español el precio total, la identidad y contacto del operador, el alcance de cada voto y las condiciones de cancelación. La aplicación de la legislación hondureña de consumo, comercio electrónico, privacidad y tributación requiere confirmación local antes de vender.", source: "https://www.gob.hn/", label: "Portal oficial del Gobierno de Honduras" },
  PY: { note: "Las condiciones deben ser claras antes de comprar y no inducir a error sobre el efecto del voto, los resultados o una supuesta afiliación oficial. Confirmar las exigencias de la Ley de Defensa del Consumidor, las reglas de contratación electrónica y los mecanismos locales de reclamación.", source: "https://www.senac.gov.py/", label: "Secretaría de Defensa del Consumidor y el Usuario" },
  SV: { note: "La normativa salvadoreña de comercio electrónico contempla información visible del proveedor, términos y condiciones, medios de pago, retracto y reversión de pagos. Deben publicarse los datos del operador y prever un mecanismo equivalente y claro para pedir la devolución cuando corresponda.", source: "https://www.asamblea.gob.sv/sites/default/files/documents/decretos/A9FF9667-4147-46A6-A70E-2A1F3B581A51.pdf", label: "Ley de Protección al Consumidor: comercio electrónico" },
  NI: { note: "Aplicar la Ley 842 de protección de las personas consumidoras y usuarias: comunicar con transparencia las características y el precio del servicio, quién lo presta y cómo reclamar. Validar las condiciones para contratación digital, revocación y pagos transfronterizos.", source: "https://legislacion.asamblea.gob.ni/SILEG/Gacetas.nsf/CF9FC11552DDF95A0625888C005CBD78/$File/Ley%20N%C2%B0.%201097%2C%20Ley%20del%20Digesto%20Jur%C3%ADdico%20Nicarag%C3%BCense%20de%20la%20Materia%20EIC.pdf", label: "Digesto Jurídico: Ley 842" },
  CR: { note: "Las ofertas y su publicidad vinculan al proveedor y no deben inducir a error. En comercio electrónico, las normas costarricenses detallan información del comerciante y del servicio, precio, confirmación, comprobante, seguridad de pago, reclamaciones y protección de datos.", source: "https://www.meic.go.cr/wp-content/uploads/2024/11/37899.pdf", label: "Reglamento a la Ley 7472, Decreto 37899-MEIC" },
  PA: { note: "La información sobre el servicio, el precio y las condiciones debe ser clara y veraz conforme al régimen de protección al consumidor. Confirmar además la aplicación de las normas panameñas de comercio electrónico, privacidad y mecanismos de reembolso.", source: "https://www.acodeco.gob.pa/", label: "ACODECO: autoridad de protección al consumidor" },
  UY: { note: "En contratos celebrados a distancia, el artículo 16 de la Ley 17.250 reconoce, como regla general, cinco días hábiles para rescindir desde la formalización del contrato o la entrega. El proveedor debe informar por escrito y claramente ese derecho; si omite esa información, el plazo puede extenderse. Confirmar cómo encaja la ejecución inmediata de un voto digital.", source: "https://www.impo.com.uy/bases/leyes/17250-2000", label: "Ley 17.250 de relaciones de consumo" },
  GQ: { note: "Antes de ofrecer pagos, confirmar localmente las normas vigentes de consumo, telecomunicaciones, privacidad y moneda aplicables a servicios digitales. La página debe identificar al operador, mostrar el precio completo y describir sin ambigüedad el efecto de cada voto.", source: "https://www.guineaecuatorialpress.com/", label: "Portal oficial de Guinea Ecuatorial" },
  PR: { note: "Puerto Rico aplica legislación local de consumo junto con normas federales estadounidenses pertinentes. Confirmar qué legislación y foro aplican al operador y al comprador, publicar precios e impuestos con claridad y revisar las reglas de privacidad, publicidad y reembolsos.", source: "https://www.justicia.pr.gov/", label: "Departamento de Justicia de Puerto Rico" },
};

const additionalRegions = [
  { id: "ue", name: "Unión Europea", note: "La normativa europea de consumo prevé, como regla general, 14 días para desistir de contratos a distancia. Para un servicio digital iniciado durante ese plazo se requieren información previa y consentimiento expreso, y las consecuencias sobre el derecho de desistimiento dependen de si se trata de contenido digital o de un servicio. Aplican también el RGPD, las normas nacionales de transposición y el IVA correspondiente.", source: "https://eur-lex.europa.eu/eli/dir/2011/83/oj?locale=es", label: "Directiva 2011/83/UE sobre derechos de los consumidores" },
  { id: "us", name: "Estados Unidos", note: "No existe una única regla de consumo estatal para todo el país: además de las normas federales, pueden aplicar leyes de cada estado sobre publicidad, renovaciones, privacidad, impuestos y reembolsos. No ofrecer premios ni llamar ‘donación’ al pago; revisar también la regulación de concursos y promociones antes de introducir premios o azar.", source: "https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business", label: "FTC: publicidad y marketing en Internet" },
  { id: "ca", name: "Canadá", note: "Las reglas de consumo y contratos a distancia varían por provincia y territorio; algunas exigen información y condiciones de cancelación específicas. Deben revisarse además las normas federales de privacidad, publicidad y competencia, y los impuestos aplicables en cada provincia, antes de habilitar pagos.", source: "https://ised-isde.canada.ca/site/office-consumer-affairs/en/consumer-rights-and-responsibilities", label: "Bureau de la consommation du Canada" },
];

function slug(code: string) { return `pais-${code.toLowerCase()}`; }

export default function LegalPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
      <Link href="/" className="text-sm text-zinc-400 underline underline-offset-4 hover:text-white">← Volver al inicio</Link>
      <header className="mt-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/70">mifavorito</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Información legal y condiciones</h1>
        <div className="mt-5 rounded-2xl border border-amber-200/20 bg-amber-200/[0.06] p-4 text-sm leading-6 text-zinc-200">
          <strong className="text-amber-100">Borrador en preparación.</strong> Estas notas resumen puntos que deben revisarse por país y no constituyen asesoramiento jurídico. Las normas imperativas y los derechos de cada persona consumidora prevalecen. Antes de activar pagos hacen falta la identidad y domicilio del operador, el flujo exacto de compra, las reglas de reembolso y una revisión jurídica local.
        </div>
      </header>

      <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/80 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-white">Anexos por país</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-300">Selecciona un territorio para consultar las notas locales aplicables a los votos pagados y a la información al consumidor.</p>
        <nav aria-label="Anexos legales por país" className="mt-5 flex flex-wrap gap-2">
          {COUNTRIES.map((country) => <a key={country.code} href={`#${slug(country.code)}`} className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 hover:border-amber-200/40 hover:text-white">{country.name}</a>)}
          {additionalRegions.map((region) => <a key={region.id} href={`#${region.id}`} className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 hover:border-amber-200/40 hover:text-white">{region.name}</a>)}
        </nav>
      </section>

      <div className="mt-5 space-y-4">
        {COUNTRIES.map((country) => {
          const item = countryNotes[country.code];
          return <section id={slug(country.code)} key={country.code} className="scroll-mt-6 rounded-2xl border border-white/10 bg-zinc-900/80 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-white">{country.name}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{item.note}</p>
            <a className="mt-3 inline-block text-sm text-amber-200 underline underline-offset-4 hover:text-amber-100" href={item.source} target="_blank" rel="noreferrer">{item.label} ↗</a>
          </section>;
        })}
        {additionalRegions.map((region) => <section id={region.id} key={region.id} className="scroll-mt-6 rounded-2xl border border-white/10 bg-zinc-900/80 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-white">{region.name}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{region.note}</p>
          <a className="mt-3 inline-block text-sm text-amber-200 underline underline-offset-4 hover:text-amber-100" href={region.source} target="_blank" rel="noreferrer">{region.label} ↗</a>
        </section>)}
      </div>

      <div className="mt-8 space-y-4">
        {[
          { title: "Quién opera mifavorito", body: "La identidad legal del operador, su domicilio y los datos de contacto se añadirán antes de activar los pagos." },
          { title: "Cómo funciona la elección", body: "La elección reconoce a artistas musicales. No es una competición oficial ni está patrocinada por los artistas, sus representantes o las plataformas musicales. No se ofrece un premio." },
          { title: "Votos y pagos", body: "El modelo previsto es de 1 € por voto. Antes de cobrar se indicarán el precio total, el número de votos, el efecto de la compra y las condiciones de cancelación y reembolso. El pago no es una donación." },
          { title: "Privacidad", body: "Antes del lanzamiento se publicarán el responsable del tratamiento, las finalidades, los proveedores, los plazos de conservación y la forma de ejercer los derechos sobre los datos." },
        ].map((section) => <section key={section.title} className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 sm:p-6"><h2 className="text-lg font-bold text-white">{section.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-300">{section.body}</p></section>)}
      </div>
    </main>
  );
}

