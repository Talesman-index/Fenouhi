"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Grid, FileSpreadsheet, ShoppingCart, User } from "lucide-react";
import { useMobileStore } from "@/lib/mobile-store";

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { cart } = useMobileStore();

  // Hide on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const totalCartCount =
    cart && cart.length > 0
      ? cart.map((i) => i.quantity || 1).reduce((a, b) => a + b, 0)
      : 0;

  const NAV_ITEMS = [
    {
      id: "home",
      label: "Découvrir",
      href: "/",
      icon: Compass,
      exact: true,
    },
    {
      id: "catalog",
      label: "Catalogue",
      href: "/catalog",
      icon: Grid,
      exact: false,
    },
    {
      id: "quote",
      label: "Devis Usine",
      href: "/quote-request",
      icon: FileSpreadsheet,
      isCenter: true,
      exact: false,
    },
    {
      id: "cart",
      label: "Panier",
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
        zIndex: 9999,
        background: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "1px solid rgba(226, 232, 240, 0.8)",
        padding: "10px 16px calc(12px + env(safe-area-inset-bottom, 12px))",
        boxShadow: "0 -8px 30px rgba(15, 23, 42, 0.08)",
        display: "none", // Controlled via media query in CSS
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 480,
          margin: "0 auto",
          position: "relative",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href) && item.href !== "/";

          // Center Button Style (Devis Usine)
          if (item.isCenter) {
            return (
              <Link
                key={item.id}
                href={item.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  marginTop: -24,
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #165491 0%, #0F172A 100%)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isActive
                      ? "0 8px 24px rgba(22, 84, 145, 0.55)"
                      : "0 6px 18px rgba(22, 84, 145, 0.4)",
                    border: "3.5px solid #FFFFFF",
                    transform: isActive ? "scale(1.08)" : "scale(1)",
                    transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  <Icon style={{ width: 24, height: 24, color: "#38BDF8" }} />
                </div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#165491" : "#64748B",
                    marginTop: 4,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          // Standard Navigation Tabs
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                textDecoration: "none",
                flex: 1,
                padding: "6px 0",
                color: isActive ? "#165491" : "#64748B",
                position: "relative",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 42,
                  height: 30,
                  borderRadius: 16,
                  background: isActive ? "rgba(22, 84, 145, 0.08)" : "transparent",
                  transition: "all 0.25s ease",
                }}
              >
                <Icon
                  style={{
                    width: 22,
                    height: 22,
                    strokeWidth: isActive ? 2.2 : 1.7,
                    color: isActive ? "#165491" : "#64748B",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                    transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="cart-badge-pulse"
                    style={{
                      position: "absolute",
                      top: -3,
                      right: -1,
                      background: "#DC2626",
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
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
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#165491" : "#64748B",
                  transition: "color 0.2s",
                }}
              >
                {item.label}
              </span>

              {/* Glowing active indicator dot */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -2,
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#165491",
                    boxShadow: "0 0 8px #165491",
                  }}
                />
              )}
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
            padding-bottom: 88px !important;
          }
        }
        @keyframes cartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .cart-badge-pulse {
          animation: cartPulse 2s infinite ease-in-out;
        }
      `}</style>
    </nav>
  );
}
