"use client";

import React from "react";
import { Calculator, RefreshCw, Layers, Users, BarChart3 } from "lucide-react";

interface AdminSidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export default function AdminSidebar({ activeTab = "calc", onSelectTab }: AdminSidebarProps) {
  const tabs = [
    { id: "calc", label: "Calculateur Devis", icon: Calculator },
    { id: "transit", label: "Mise à jour Transit", icon: RefreshCw },
    { id: "orders", label: "Toutes les Commandes", icon: Layers },
    { id: "clients", label: "Répertoire Clients", icon: Users },
    { id: "stats", label: "Statistiques Logistiques", icon: BarChart3 },
  ];

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--orange-primary)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
          ADM
        </div>
        <div>
          <div style={{ fontWeight: 800, color: "var(--navy-dark)", fontSize: 15 }}>Opérations Logistiques</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Guangzhou Hub → Cotonou</div>
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
      </ul>
    </div>
  );
}
