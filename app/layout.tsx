import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import CountryBackdrop from "@/components/CountryBackdrop";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "mifavorito | Cantante del año en español",
  description: "El sitio que te da voz.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen antialiased`}>
        <CountryBackdrop />
        <div className="relative z-10 min-h-screen">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
