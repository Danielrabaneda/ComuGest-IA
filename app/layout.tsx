import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "ComuGest IA | Tu Secretario Virtual de Comunidad",
  description: "La plataforma definitiva para la gestión de comunidades de vecinos y garajes potenciada por IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-50`}
      >
        <main>{children}</main>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
