"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import { Search, Bell, Menu, X, ShieldAlert, LogOut, Package, CheckCircle2, FileText } from "lucide-react";
import type { Profile } from "@/types/supabase";

import DemoBanner from "@/components/DemoBanner";

interface AdminHeaderProps {
  profile: Profile | null;
  onToggleMobileSidebar?: () => void;
}

export default function AdminHeader({ profile, onToggleMobileSidebar }: AdminHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/admin/quotes?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const notificationsMock = [
    { id: "1", title: "Nouveau Devis", desc: "Devis #DEV-2026-9410 soumis par Koffi", time: "Il y a 10 min", icon: FileText },
    { id: "2", title: "Paiement Reçu", desc: "Confirmation Mobile Money 140.000 FCFA", time: "Il y a 35 min", icon: CheckCircle2 },
    { id: "3", title: "Vol Confirmé", desc: "Expédition #EXP-8899 en transit aérien", time: "Il y a 2h", icon: Package },
  ];

  return (
    <>
      <DemoBanner userEmail={profile?.email} />
      <header
      className="admin-header-full"
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid var(--border-light)",
        height: 64,
        display: "flex",
        alignItems: "center",
        padding: "0 24px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 16 }}>

        {/* LEFT SECTION: MOBILE TOGGLE & LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={onToggleMobileSidebar}
            className="admin-mobile-toggle"
            style={{
              display: "none",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 6,
              color: "var(--navy-dark)"
            }}
            aria-label="Ouvrir le menu"
          >
            <Menu style={{ width: 24, height: 24 }} />
          </button>

          <Logo href="/admin" size={36} subtitleText="ADMINISTRATION" />
        </div>

        {/* CENTER SECTION: GLOBAL SEARCH BAR */}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: 480, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--bg-main)",
              border: "1px solid var(--border-light)",
              borderRadius: 9999,
              padding: "6px 14px",
              gap: 10
            }}
          >
            <Search style={{ width: 16, height: 16, color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Rechercher utilisateur, devis, commande, tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 13,
                fontWeight: 600,
                width: "100%",
                color: "var(--navy-dark)"
              }}
            />
          </div>
        </form>

        {/* RIGHT SECTION: NOTIFICATIONS & USER ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* NOTIFICATION POPOVER */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "var(--bg-main)",
                border: "1px solid var(--border-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative"
              }}
              aria-label="Notifications"
            >
              <Bell style={{ width: 18, height: 18, color: "var(--navy-dark)" }} />
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "var(--orange-primary)"
                }}
              />
            </button>

            {showNotifications && (
              <div
                className="card"
                style={{
                  position: "absolute",
                  right: 0,
                  top: 48,
                  width: 320,
                  padding: 16,
                  zIndex: 50,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.12)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--border-light)" }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "var(--navy-dark)" }}>Notifications Récentes</span>
                  <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", fontSize: 10 }}>3 Nouvelles</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notificationsMock.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} style={{ display: "flex", gap: 10, padding: 8, borderRadius: "var(--radius-sm)", background: "var(--bg-main)" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--blue-light)", color: "var(--blue-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon style={{ width: 14 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--navy-dark)" }}>{n.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{n.desc}</div>
                          <div style={{ fontSize: 10, color: "var(--text-light)", marginTop: 2 }}>{n.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href="/admin/notifications"
                  onClick={() => setShowNotifications(false)}
                  style={{
                    display: "block",
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "var(--blue-primary)",
                    marginTop: 12,
                    paddingTop: 8,
                    borderTop: "1px solid var(--border-light)"
                  }}
                >
                  Voir toutes les notifications ➔
                </Link>
              </div>
            )}
          </div>

          {/* ADMIN USER INFO & LOGOUT */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, borderLeft: "1px solid var(--border-light)", paddingLeft: 16 }}>
            <div style={{ textAlign: "right" }} className="admin-user-info-text">
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--navy-dark)" }}>
                {profile ? `${profile.first_name} ${profile.last_name}` : "Admin Logistique"}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--orange-primary)" }}>
                {profile?.role === "super_admin" ? "SUPER ADMIN" : "ADMINISTRATEUR"}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              style={{
                background: "#FEF2F2",
                color: "#991B1B",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
              title="Se déconnecter"
            >
              <LogOut style={{ width: 14 }} />
              <span className="admin-logout-label">Sortir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
