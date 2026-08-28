"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Heart, User } from "lucide-react";
import { useMobileStore } from "@/lib/mobile-store";

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { favorites } = useMobileStore();
  const [shouldShow, setShouldShow] = useState(false);
  const [pressedId, setPressedId] = useState<string | null>(null);

  React.useEffect(() => {
    const checkVisibility = () => {
      const isMobileScreen = window.innerWidth <= 768;
      const isStandalonePWA =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;
      setShouldShow(isMobileScreen || isStandalonePWA);
    };

    checkVisibility();
    window.addEventListener("resize", checkVisibility);
    return () => window.removeEventListener("resize", checkVisibility);
  }, []);

  // Hide on admin pages or on desktop
  if (pathname?.startsWith("/admin") || !shouldShow) {
    return null;
  }

  const favCount = favorites ? favorites.length : 0;

  const NAV_ITEMS = [
    {
      id: "home",
      label: "Accueil",
      href: "/",
      icon: Home,
      exact: true,
    },
    {
      id: "orders",
      label: "Commandes",
      href: "/dashboard?tab=orders",
      icon: Package,
      exact: false,
    },
    {
      id: "favorites",
      label: "Favoris",
      href: "/favorites",
      icon: Heart,
      badge: favCount,
      exact: false,
    },
    {
      id: "profile",
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
        zIndex: 500,
        background: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "1px solid #EFECE6",
        padding: "8px 16px calc(8px + env(safe-area-inset-bottom, 8px))",
        boxShadow: "0 -4px 24px rgba(13, 43, 77, 0.08)",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          maxWidth: 440,
          margin: "0 auto",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href) && item.href !== "/";
          const isPressed = pressedId === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              onTouchStart={() => setPressedId(item.id)}
              onTouchEnd={() => setPressedId(null)}
              onMouseDown={() => setPressedId(item.id)}
              onMouseUp={() => setPressedId(null)}
              onMouseLeave={() => setPressedId(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                color: isActive ? "#0D2B4D" : "#7E7970",
                padding: "6px 14px 4px",
                borderRadius: 16,
                position: "relative",
                transform: isPressed
                  ? "scale(0.88)"
                  : isActive
                  ? "scale(1.04)"
                  : "scale(1)",
                transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* ICON WITH BADGE */}
              <div style={{ position: "relative", display: "inline-flex" }}>
                <Icon
                  style={{
                    width: 22,
                    height: 22,
                    strokeWidth: isActive ? 2.4 : 1.8,
                    fill: isActive && (item.id === "home" || item.id === "favorites") ? "#7CB6D9" : "none",
                    color: isActive ? "#0D2B4D" : "#7E7970",
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: isActive ? "translateY(-1px)" : "none",
                  }}
                />
                {item.badge && item.badge > 0 ? (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -8,
                      background: "#E11D48",
                      color: "#FFFFFF",
                      fontSize: 9,
                      fontWeight: 800,
                      minWidth: 16,
                      height: 16,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                      boxShadow: "0 0 0 1.5px #FFFFFF",
                      animation: "badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>

              {/* LABEL IN FRENCH */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 800 : 600,
                  marginTop: 3,
                  color: isActive ? "#0D2B4D" : "#7E7970",
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  letterSpacing: "-0.01em",
                  transition: "color 0.2s ease",
                }}
              >
                {item.label}
              </span>

              {/* ACTIVE GLOWING DOT INDICATOR */}
              <div
                style={{
                  width: isActive ? 5 : 0,
                  height: 5,
                  borderRadius: "50%",
                  background: "#7CB6D9",
                  boxShadow: isActive ? "0 0 8px rgba(124, 182, 217, 0.9)" : "none",
                  marginTop: 2,
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "scale(1)" : "scale(0)",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              />
            </Link>
          );
        })}
      </div>

      <style jsx global>{`
        .mobile-bottom-bar {
          display: none !important;
        }
        @media (max-width: 768px), (display-mode: standalone) {
          .mobile-bottom-bar {
            display: block !important;
          }
          body {
            padding-bottom: 88px !important;
          }
        }
        @keyframes badgePop {
          0% { transform: scale(0.4); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </nav>
  );
}
