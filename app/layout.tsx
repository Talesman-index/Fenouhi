import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./style.css";
import "./globals.css";

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
    <html lang="fr">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
