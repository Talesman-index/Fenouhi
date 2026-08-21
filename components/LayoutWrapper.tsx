"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomBar from "@/components/MobileBottomBar";
import { MobileStoreProvider } from "@/lib/mobile-store";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <MobileStoreProvider>
        <main style={{ minHeight: "100vh" }}>{children}</main>
      </MobileStoreProvider>
    );
  }

  return (
    <MobileStoreProvider>
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileBottomBar />
    </MobileStoreProvider>
  );
}
