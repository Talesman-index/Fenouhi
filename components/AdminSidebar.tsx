"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Calculator, RefreshCw, Layers, Users, BarChart3, LogOut, ShieldAlert } from "lucide-react";
import type { Profile } from "@/types/supabase";

interface AdminSidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  profile?: Profile | null;
}

export default function AdminSidebar({ activeTab = "calc", onSelectTab, profile }: AdminSidebarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const tabs = [
    { id: "calc", label: "Calculateur Devis", icon: Calculator },
    { id: "transit", label: "Mise à jour Transit", icon: RefreshCw },
    { id: "orders", label: "Toutes les Commandes", icon: Layers },
    { id: "clients", label: "Répertoire Clients", icon: Users },
    { id: "stats", label: "Statistiques Logistiques", icon: BarChart3 },
  ];

  const initials = profile 
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() 
    : "ADM";

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--orange-primary)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 800, color: "var(--navy-dark)", fontSize: 15 }}>
            {profile ? `${profile.first_name} ${profile.last_name}` : "Admin Logistique"}
          </div>
          <div style={{ fontSize: 12, color: "var(--blue-primary)", fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
            <ShieldAlert style={{ width: 14 }} /> Rôle : {profile?.role || "admin"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            {profile?.email || ""}
          </div>
        </div>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <li key={t.id}>
              <button
                onClick={() => onSelectTab && onSelectTab(t.id)}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "var(--radius-sm)",
                  border: "none", background: isActive ? "var(--blue-light)" : "transparent",
                  color: isActive ? "var(--blue-primary)" : "var(--navy-dark)",
                  fontWeight: isActive ? 800 : 700, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10
                }}
              >
                <Icon style={{ width: 18 }} /> {t.label}
              </button>
            </li>
          );
        })}

        <li style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "var(--radius-sm)",
              border: "none", background: "#FEF2F2", color: "#991B1B",
              fontWeight: 800, fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10
            }}
          >
            <LogOut style={{ width: 18 }} /> Me Déconnecter
          </button>
        </li>
      </ul>
    </div>
  );
}
