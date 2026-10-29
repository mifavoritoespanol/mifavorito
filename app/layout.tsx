import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import CountryBackdrop from "@/components/CountryBackdrop";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import AdminModeProvider from "@/components/AdminModeProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "mifavorito | El sitio que te da voz", template: "%s | mifavorito" },
  description: "Apoya tus favoritos y participa en las rondas de apoyo de mifavorito. El sitio que te da voz.",
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "es_ES", siteName: SITE_NAME, title: "mifavorito | El sitio que te da voz", description: "Apoya tus favoritos y participa en las rondas de apoyo de mifavorito.", url: SITE_URL, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "mifavorito — El sitio que te da voz" }] },
  twitter: { card: "summary_large_image", title: "mifavorito | El sitio que te da voz", description: "Apoya tus favoritos y participa en las rondas de apoyo de mifavorito.", images: ["/opengraph-image"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen antialiased`}>
        <CountryBackdrop />
        <AdminModeProvider>
        <div className="relative z-10 min-h-screen">
          <Suspense fallback={<header aria-hidden="true" className="sticky top-0 z-30 h-[108px] border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl" />}><Header /></Suspense>
          {children}
          <Footer />
        </div>
        </AdminModeProvider>
        <Analytics />
      </body>
    </html>
  );
}
