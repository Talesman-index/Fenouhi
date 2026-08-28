"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useMobileStore } from "@/lib/mobile-store";

export default function FloatingCartBar() {
  const { cart } = useMobileStore();
  const pathname = usePathname();

  // Hide on cart and checkout pages
  if (pathname === "/cart" || pathname === "/checkout" || pathname?.startsWith("/admin")) {
    return null;
  }

  const totalItems = cart && cart.length > 0 
    ? cart.reduce((acc, item) => acc + (item.quantity || 1), 0) 
    : 0;

  if (totalItems === 0) return null;

  const totalPrice = cart.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: 78,
        left: 0,
        right: 0,
        zIndex: 490,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        padding: "0 16px",
      }}
    >
      <Link
        href="/cart"
        style={{
          pointerEvents: "auto",
          background: "#0D2B4D",
          color: "#FFFFFF",
          borderRadius: 999,
          padding: "12px 20px 12px 24px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          boxShadow: "0 16px 36px rgba(13, 43, 77, 0.45), 0 4px 12px rgba(0, 0, 0, 0.15)",
          textDecoration: "none",
          width: "100%",
          maxWidth: 420,
          border: "1.5px solid rgba(124, 182, 217, 0.4)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {/* LEFT: CART LABEL & QUANTITY PILL */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShoppingBag style={{ width: 18, height: 18, color: "#7CB6D9" }} />
          <span style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: "-0.01em" }}>
            Voir mon panier
          </span>
          <span
            style={{
              background: "rgba(124, 182, 217, 0.25)",
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: 999,
            }}
          >
            {totalItems}x
          </span>
        </div>

        {/* RIGHT: TOTAL PRICE */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 14.5,
              fontWeight: 900,
              color: "#FFFFFF",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {totalPrice.toLocaleString()} FCFA
          </span>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#7CB6D9",
              color: "#0D2B4D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowRight style={{ width: 13, height: 13 }} />
          </div>
        </div>
      </Link>
    </div>
  );
}
