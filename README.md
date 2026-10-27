# mifavorito

**El sitio que te da voz.** Una plataforma de rondas de apoyo para descubrir y apoyar favoritos vinculados a países: bebidas, comidas, música y más.

🌐 **Sitio:** [mifavorito.app](https://mifavorito.app) · **Stack:** Next.js 16, React 19, TypeScript, Supabase y Stripe.

## Vista previa

La tarjeta siguiente es la imagen Open Graph que genera el proyecto para los enlaces compartidos:

![Tarjeta para compartir de mifavorito](https://mifavorito.app/opengraph-image)

Explora [Bebidas](https://mifavorito.app/c/bebidas), [Comida](https://mifavorito.app/c/comidas), [Música](https://mifavorito.app/c/estrellas) y [Favoritos por país](https://mifavorito.app/pais/mx).

> Para añadir capturas de pantalla completas de la interfaz, guarda imágenes actuales en `public/screenshots/` y enlázalas desde esta sección. La tarjeta de arriba es una imagen de marca para compartir, no una captura de pantalla de la página.

## Funcionalidad

- Ediciones con rondas de apoyo y periodos de apertura y cierre programados por categoría.
- Búsqueda y propuesta de opciones dentro de la página de la categoría cuando la ronda de apoyo está abierta.
- Páginas por país con enlaces a categorías filtradas por el país elegido.
- Fichas públicas de cada opción con su país, resumen y enlace de referencia cuando está disponible.
- Medallero global de países: 1.º puesto = 5 puntos, 2.º = 3 y 3.º = 1 en cada edición.
- Checkout con Stripe y registro del consentimiento de inicio inmediato.
- Metadatos SEO, Open Graph y Twitter Cards dinámicos para categorías, países y fichas.
- Sitemap XML y `robots.txt` generados por Next.js.

## Instalación local

Requisitos: Node.js LTS y npm. Clona el repositorio y, desde su carpeta, ejecuta:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Para cargar categorías y opciones, crea `.env.local` en la raíz con las credenciales públicas de tu proyecto Supabase:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

Consulta `.env.example` para las variables opcionales de calendario, Stripe y vista previa local. **No subas `.env.local` ni claves privadas al repositorio.** Las claves de Stripe y las credenciales de servicio de Supabase deben quedarse únicamente en el servidor.

Para previsualizar localmente Bebidas y Comida, añade a `.env.local`:

```dotenv
LOCAL_PREVIEW_CATEGORIES=bebidas,comidas
```

Reinicia `npm run dev` después de modificar el archivo. En modo local, los pagos están desactivados y el envío de propuestas se simula sin guardar en Supabase.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build optimizado de producción |
| `npm run start` | Sirve el último build de producción |
| `npm run lint` | Ejecuta ESLint |

## Estructura del proyecto

```text
app/
├── api/                    # Checkout, confirmación, calendario y marcador
├── c/[slug]/               # Página de categoría + metadata e imagen OG
├── i/[slug]/               # Ficha pública + metadata e imagen OG
├── pais/[code]/            # Página de país + metadata e imagen OG
├── devoluciones/           # Política de devoluciones y desistimiento
├── legal/                  # Anexos legales desplegables por país
├── privacidad/             # Política de privacidad
├── terminos/               # Términos de uso
├── opengraph-image.tsx     # Imagen social de portada
├── robots.ts               # Reglas para rastreadores
├── sitemap.ts              # Sitemap XML
├── layout.tsx              # Layout global y metadata base
└── page.tsx                # Página de inicio
components/                 # Header, fichas, rankings, modales y marcador
lib/                        # Supabase, calendario, países, SEO y tarjetas OG
public/                     # Assets estáticos y capturas del proyecto
scripts/                    # Tareas auxiliares
supabase/migrations/        # Cambios de esquema versionados
```

## Panel privado de moderación

La ruta `/montana` permite revisar propuestas pendientes sin aparecer en la navegación ni en el sitemap. El acceso requiere iniciar sesión con Google y que el correo coincida exactamente (sin distinguir mayúsculas) con `ADMIN_EMAIL`. La API vuelve a comprobar la identidad en el servidor antes de usar la clave secreta de Supabase.

Configuración necesaria antes de usarlo:

1. En Supabase, habilita el proveedor Google en Authentication y configura el ID y secreto OAuth de Google Cloud. Añade `https://mifavorito.app/montana` y `http://localhost:3000/montana` a las URL de redirección permitidas (y la URL de Preview de Vercel si se va a probar allí).
2. Configura `ADMIN_EMAIL` con tu correo de Google en las variables de entorno de Vercel (Preview y Production) y en `.env.local`.
3. No añadas `SUPABASE_SECRET_KEY` a variables `NEXT_PUBLIC_*`; esta clave solo se consume desde la API del servidor.

El nombre poco evidente de la ruta evita clics accidentales, pero no es una medida de seguridad: el inicio de sesión y la autorización del servidor son obligatorios.

## SEO y enlaces compartidos

Las rutas `/c/[slug]`, `/pais/[code]` y `/i/[slug]` definen títulos, descripciones, URL canónica, Open Graph y Twitter Card en el servidor. Sus imágenes PNG se generan en cada ruta con la convención `opengraph-image.tsx`. `app/sitemap.ts` incluye categorías, países y opciones públicas aprobadas; `app/robots.ts` publica la ubicación del sitemap.

Las URLs de país usan códigos de dos letras en minúsculas, por ejemplo `/pais/mx`. Desde una página de país, los enlaces a categorías conservan el país con `?pais=MX` y filtran las opciones mostradas.

## Estado de los textos legales

Las páginas legales y sus anexos por país son borradores de trabajo. Antes de aceptar pagos, completa la razón social y el domicilio legal del operador y valida localmente las reglas de consumo, privacidad e impuestos.
