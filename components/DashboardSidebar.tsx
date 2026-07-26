"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Package, FileText, User, Bell, Settings, LogOut } from "lucide-react";
import type { Profile } from "@/types/supabase";

interface DashboardSidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  profile?: Profile | null;
}

export default function DashboardSidebar({ activeTab = "orders", onSelectTab, profile }: DashboardSidebarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const tabs = [
    { id: "orders", label: "Mes Commandes (2)", icon: Package },
    { id: "quotes", label: "Devis à Valider (1)", icon: FileText },
    { id: "profile", label: "Profil & Adresses", icon: User },
    { id: "notifications", label: "WhatsApp", icon: Bell },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  const initials = profile 
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() 
    : "CL";

  const accountTypeLabel = profile?.account_type === "business" 
    ? "Entreprise / PME" 
    : profile?.account_type === "reseller" 
    ? "Revendeur" 
    : "Particulier";

  return (
    <div className="card dashboard-sidebar-card" style={{ padding: 16, maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      {/* USER INFO BAR */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--navy-dark)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 800, color: "var(--navy-dark)", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {profile ? `${profile.first_name} ${profile.last_name}` : "Client CargoLink"}
          </div>
          <div style={{ fontSize: 11, color: "var(--orange-primary)", fontWeight: 700 }}>
            {accountTypeLabel}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {profile?.email || ""}
          </div>
        </div>
      </div>

      {/* TABS LIST (HORIZONTAL SCROLL ON MOBILE, VERTICAL LIST ON DESKTOP) */}
      <ul className="dashboard-sidebar-tabs" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <li key={t.id}>
              <button
                onClick={() => onSelectTab && onSelectTab(t.id)}
                style={{
                  width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 8,
                  border: "none", background: isActive ? "var(--orange-light)" : "transparent",
                  color: isActive ? "var(--orange-hover)" : "var(--navy-dark)",
                  fontWeight: isActive ? 800 : 700, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap"
                }}
              >
                <Icon style={{ width: 16, flexShrink: 0 }} /> {t.label}
              </button>
            </li>
          );
        })}

        <li style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--border-light)" }}>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 8,
              border: "none", background: "#FEF2F2", color: "#991B1B",
              fontWeight: 800, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap"
            }}
          >
            <LogOut style={{ width: 16, flexShrink: 0 }} /> Déconnexion
          </button>
        </li>
      </ul>
    </div>
  );
}
