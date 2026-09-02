"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingBag,
  Truck,
  CreditCard,
  AlertTriangle,
  Bell,
  BarChart3,
  Globe,
  Settings,
  LogOut,
  ShieldCheck,
  X,
  Package,
  ExternalLink
} from "lucide-react";
import type { Profile } from "@/types/supabase";

interface AdminSidebarProps {
  profile?: Profile | null;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ profile, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const userRole = profile?.role || "admin";

  const allNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Articles & Catalogue", icon: Package },
    { href: "/admin/users", label: "Utilisateurs", icon: Users },
    { href: "/admin/quotes", label: "Devis Logistiques", icon: FileText },
    { href: "/admin/orders", label: "Commandes", icon: ShoppingBag },
    { href: "/admin/shipments", label: "Expéditions & Suivi", icon: Truck },
    { href: "/admin/payments", label: "Paiements & Reçus", icon: CreditCard },
    { href: "/admin/disputes", label: "Litiges & Support", icon: AlertTriangle },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/analytics", label: "Analytics & Rapports", icon: BarChart3 },
    { href: "/admin/content", label: "Gestion Contenu", icon: Globe },
    { href: "/admin/settings", label: "Paramètres Plateforme", icon: Settings },
  ];

  const navItems = allNavItems.filter((item) => {
    if (userRole === "super_admin" || userRole === "admin") return true;
    if (userRole === "logistics") {
      return ["/admin", "/admin/products", "/admin/shipments", "/admin/orders", "/admin/notifications"].includes(item.href);
    }
    if (userRole === "agent") {
      return !["/admin/users", "/admin/settings"].includes(item.href);
    }
    return true;
  });

  const initials = profile 
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() 
    : "ADM";

  return (
    <div
      className="admin-sidebar-container"
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
        padding: "16px 12px",
        maxHeight: "calc(100vh - 100px)",
        position: "sticky",
        top: 80,
        overflowY: "auto",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {/* MOBILE CLOSE HEADER */}
      {onCloseMobile && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #F1F5F9" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>Menu Administrateur</span>
          <button onClick={onCloseMobile} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: "#64748B" }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>
      )}

      {/* USER PROFILE SUMMARY CARD */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
          padding: "10px 12px",
          background: "#F8FAFC",
          borderRadius: 12,
          border: "1px solid #F1F5F9",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "#165491",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ overflow: "hidden", minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontWeight: 700,
              color: "#0F172A",
              fontSize: 13.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {profile ? `${profile.first_name} ${profile.last_name}` : "Admin Logistique"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#0284C7",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 1,
            }}
          >
            <ShieldCheck style={{ width: 13, height: 13 }} /> {profile?.role || "admin"}
          </div>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <nav>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/admin" 
              ? pathname === "/admin" 
              : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onCloseMobile}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? "#EFF6FF" : "transparent",
                    color: isActive ? "#165491" : "#475569",
                    border: isActive ? "1px solid #BFDBFE" : "1px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon
                    style={{
                      width: 17,
                      height: 17,
                      flexShrink: 0,
                      color: isActive ? "#165491" : "#94A3B8",
                    }}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}

          <li style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F1F5F9" }}>
            <a
              href="https://fenouhi.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onCloseMobile}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
                background: "rgba(249, 115, 22, 0.08)",
                color: "#EA580C",
                border: "1px solid rgba(249, 115, 22, 0.2)",
                marginBottom: 6,
                transition: "all 0.15s ease",
              }}
              title="Ouvrir la boutique en ligne sur https://fenouhi.vercel.app"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShoppingBag style={{ width: 17, height: 17 }} />
                <span>Voir la Boutique (Live)</span>
              </div>
              <ExternalLink style={{ width: 14, height: 14, opacity: 0.7 }} />
            </a>

            <button
              onClick={handleSignOut}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #FEE2E2",
                background: "#FEF2F2",
                color: "#DC2626",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <LogOut style={{ width: 17, height: 17 }} /> Déconnexion
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
