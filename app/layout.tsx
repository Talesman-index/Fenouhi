import React from "react";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Poppins } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import PwaRegister from "@/components/PwaRegister";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import OfflineStatusIndicator from "@/components/OfflineStatusIndicator";
import "./style.css";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-body",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-heading",
});

export const viewport: Viewport = {
  themeColor: "#0D2B4D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://fenouhimin.vercel.app"),
  title: "FENOUHI — Shopping Tendance & Direct Usine Chine",
  description:
    "Découvrez l'univers Fenouhi pour la mode, la maison, la beauté et le lifestyle. Tout en un seul endroit aux tarifs direct usine avec livraison rapide.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fenouhi",
    startupImage: [
      {
        url: "/icons/apple-touch-icon.png?v=3",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.svg?v=3", type: "image/svg+xml" },
      { url: "/icons/icon-96x96.png?v=3", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png?v=3", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png?v=3", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "FENOUHI — Shopping Tendance | Tout en un seul endroit",
    description:
      "Découvrez l'univers Fenouhi pour la mode, la maison, la beauté et le lifestyle. Tarifs direct usine et livraison rapide.",
    url: "https://fenouhimin.vercel.app",
    siteName: "Fenouhi",
    images: [
      {
        url: "/og-image.jpg?v=2",
        width: 1200,
        height: 630,
        alt: "FENOUHI - Shopping Tendance, Mode, Maison, Beauté et Lifestyle",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FENOUHI — Shopping Tendance | Tout en un seul endroit",
    description:
      "Découvrez l'univers Fenouhi pour la mode, la maison, la beauté et le lifestyle. Tarifs direct usine et livraison rapide.",
    images: ["/og-image.jpg?v=2"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#0D2B4D",
    "msapplication-TileImage": "/icons/icon-192x192.png?v=3",
  },
};

import { PreloaderProvider } from "@/lib/preloader-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} ${poppins.variable}`} style={{ backgroundColor: "#0D2B4D" }}>
      <body className={plusJakarta.className} style={{ backgroundColor: "#0D2B4D", margin: 0, padding: 0 }}>
        <PreloaderProvider>
          <div style={{ backgroundColor: "#FAF7F2", minHeight: "100vh" }}>
            <LayoutWrapper>{children}</LayoutWrapper>
          </div>
          {/* PWA: Service Worker registration */}
          <PwaRegister />
          {/* PWA: Install prompt banner */}
          <PwaInstallPrompt />
          {/* PWA: Offline real-time status toast */}
          <OfflineStatusIndicator />
        </PreloaderProvider>
      </body>
    </html>
  );
}
