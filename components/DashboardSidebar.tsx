"use client";

import React from "react";
import Link from "next/link";
import { Package, FileText, User, Bell, Settings, LogOut } from "lucide-react";

interface DashboardSidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export default function DashboardSidebar({ activeTab = "orders", onSelectTab }: DashboardSidebarProps) {
  const tabs = [
    { id: "orders", label: "Mes Commandes (2)", icon: Package },
    { id: "quotes", label: "Devis à Valider (1)", icon: FileText },
    { id: "profile", label: "Profil & Adresses", icon: User },
    { id: "notifications", label: "Notifications WhatsApp", icon: Bell },
    { id: "settings", label: "Paramètres Compte", icon: Settings },
  ];

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--navy-dark)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
          JK
        </div>
        <div>
          <div style={{ fontWeight: 800, color: "var(--navy-dark)", fontSize: 15 }}>Jean Marc Koffi</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>+229 97 00 11 22</div>
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
                  border: "none", background: isActive ? "var(--orange-light)" : "transparent",
                  color: isActive ? "var(--orange-hover)" : "var(--navy-dark)",
                  fontWeight: isActive ? 800 : 700, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10
                }}
              >
                <Icon style={{ width: 18 }} /> {t.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
