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
  Building2,
  AlertTriangle,
  Bell,
  BarChart3,
  Globe,
  Settings,
  LogOut,
  ShieldCheck,
  X,
  Package
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

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Articles & Catalogue", icon: Package },
    { href: "/admin/users", label: "Utilisateurs", icon: Users },
    { href: "/admin/quotes", label: "Devis Logistiques", icon: FileText },
    { href: "/admin/orders", label: "Commandes", icon: ShoppingBag },
    { href: "/admin/shipments", label: "Expéditions & Suivi", icon: Truck },
    { href: "/admin/payments", label: "Paiements & Reçus", icon: CreditCard },
    { href: "/admin/suppliers", label: "Fournisseurs & Agents", icon: Building2 },
    { href: "/admin/disputes", label: "Litiges & Support", icon: AlertTriangle },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/analytics", label: "Analytics & Rapports", icon: BarChart3 },
    { href: "/admin/content", label: "Gestion Contenu", icon: Globe },
    { href: "/admin/settings", label: "Paramètres Plateforme", icon: Settings },
  ];

  const initials = profile 
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() 
    : "ADM";

  return (
    <aside className="admin-sidebar-container card" style={{ padding: 18, height: "calc(100vh - 90px)", position: "sticky", top: 80, overflowY: "auto" }}>
      {/* MOBILE CLOSE HEADER */}
      {onCloseMobile && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
          <span style={{ fontWeight: 900, fontSize: 16, color: "var(--navy-dark)" }}>Menu Administrateur</span>
          <button onClick={onCloseMobile} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}>
            <X style={{ width: 20 }} />
          </button>
        </div>
      )}

      {/* USER PROFILE SUMMARY CARD */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--orange-primary)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontWeight: 800, color: "var(--navy-dark)", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {profile ? `${profile.first_name} ${profile.last_name}` : "Admin Logistique"}
          </div>
          <div style={{ fontSize: 11, color: "var(--blue-primary)", fontWeight: 800, display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
            <ShieldCheck style={{ width: 13 }} /> {profile?.role || "admin"}
          </div>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <nav>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
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
                    padding: "9px 12px",
                    borderRadius: "var(--radius-sm)",
                    textDecoration: "none",
                    fontSize: 13.5,
                    fontWeight: isActive ? 800 : 600,
                    background: isActive ? "var(--blue-light)" : "transparent",
                    color: isActive ? "var(--blue-primary)" : "var(--navy-dark)",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Icon style={{ width: 18, height: 18, flexShrink: 0, color: isActive ? "var(--blue-primary)" : "var(--text-muted)" }} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}

          <li style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
            <button
              onClick={handleSignOut}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "9px 12px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: "#FEF2F2",
                color: "#991B1B",
                fontWeight: 800,
                fontSize: 13.5,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10
              }}
            >
              <LogOut style={{ width: 18 }} /> Déconnexion
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
