"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, FileText, ShoppingCart, User, Heart } from "lucide-react";
import { useMobileStore } from "@/lib/mobile-store";

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { cart, favorites } = useMobileStore();

  // Hide on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const totalCartCount = cart && cart.length > 0 
    ? cart.map((i) => i.quantity || 1).reduce((a, b) => a + b, 0) 
    : 0;

  const NAV_ITEMS = [
    {
      id: "home",
      label: "Découvrir",
      href: "/",
      icon: Home,
      exact: true,
    },
    {
      id: "catalog",
      label: "Recherche",
      href: "/catalog",
      icon: Search,
      exact: false,
    },
    {
      id: "quote",
      label: "Devis",
      href: "/quote-request",
      icon: FileText,
      exact: false,
    },
    {
      id: "cart",
      label: "Mon Panier",
      href: "/cart",
      icon: ShoppingCart,
      badge: totalCartCount,
      exact: false,
    },
    {
      id: "dashboard",
      label: "Compte",
      href: "/dashboard",
      icon: User,
      exact: false,
    },
  ];

  return (
    <nav
      className="mobile-bottom-bar"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderTop: "1px solid rgba(226, 232, 240, 0.8)",
        padding: "8px 12px calc(8px + env(safe-area-inset-bottom, 8px))",
        boxShadow: "0 -6px 24px rgba(15, 23, 42, 0.08)",
        display: "none", // Display controlled by CSS media query in mobile mode
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname?.startsWith(item.href) && item.href !== "/";

          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                textDecoration: "none",
                padding: "4px 8px",
                borderRadius: 12,
                color: isActive ? "#0F172A" : "#94A3B8",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 12px",
                  borderRadius: 16,
                  background: isActive ? "#F1F5F9" : "transparent",
                  transition: "background 0.2s ease",
                }}
              >
                <Icon
                  style={{
                    width: 22,
                    height: 22,
                    strokeWidth: isActive ? 2.5 : 1.8,
                    color: isActive ? "#0F172A" : "#64748B",
                    transition: "all 0.2s ease",
                  }}
                />

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -2,
                      right: 2,
                      background: "#DC2626",
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: 900,
                      minWidth: 17,
                      height: 17,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                      boxShadow: "0 0 0 2px #FFFFFF",
                      lineHeight: 1,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? "#0F172A" : "#64748B",
                  letterSpacing: 0.1,
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-bottom-bar {
            display: block !important;
          }
          body {
            padding-bottom: 70px !important;
          }
        }
      `}</style>
    </nav>
  );
}
