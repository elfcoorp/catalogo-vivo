import type { Metadata } from "next";
import "./globals.css";
import { CONFIG } from "@/lib/config";
import { estiloMarca, claseTema } from "@/lib/marca";
import { ScrollAlCambiarPagina } from "@/components/ui/ScrollAlCambiarPagina";
import { LangProvider } from "@/lib/i18n";
/* Visitas del catálogo: cuántas, a qué ficha, de qué ciudad y por dónde
   llegaron. Eduardo prendió Web Analytics en Vercel el 14 de septiembre de
   2026 (plan Hobby, gratis). NO ve teléfonos ni nombres — nadie puede. */
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://catalogo-vivo-kappa.vercel.app"),
  title: `${CONFIG.marca.negocio} · Catálogo`,
  description: CONFIG.marca.descripcion,
  openGraph: {
    title: `${CONFIG.marca.negocio} · Catálogo`,
    description: CONFIG.marca.descripcion,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" style={estiloMarca(CONFIG.marca)} className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Aquí iba el pixel de TikTok. Se quitó el 14 de septiembre de 2026:
            la cuenta de TikTok Ads de ELFCO está suspendida, así que el pixel
            le mandaba las visitas a TikTok para nada. Si algún día se recupera
            la cuenta, está en el historial de git. */}
      </head>
      <body className={`${claseTema(CONFIG.marca)} min-h-full`}>
        <div className="bg-marca" />
        <ScrollAlCambiarPagina />
        <LangProvider>{children}</LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
