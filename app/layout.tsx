import React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import "./style.css";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "CargoLink Africa — Plateforme d'Achat et d'Expédition Chine → Afrique",
  description: "Achetez en Chine et faites-vous livrer en Afrique. Devis transparents, Fret Aérien & Maritime, Suivi logistique et Mobile Money.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={plusJakarta.variable}>
      <body className={plusJakarta.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
