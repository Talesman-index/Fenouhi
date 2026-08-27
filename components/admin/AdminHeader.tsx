"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import { Search, Bell, Menu, X, ShieldAlert, LogOut, Package, CheckCircle2, FileText, Info } from "lucide-react";
import type { Profile } from "@/types/supabase";
import { fetchAllRealNotifications, RealNotification } from "@/lib/admin/notifications";

import DemoBanner from "@/components/DemoBanner";

interface AdminHeaderProps {
  profile: Profile | null;
  onToggleMobileSidebar?: () => void;
}

export default function AdminHeader({ profile, onToggleMobileSidebar }: AdminHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<RealNotification[]>([]);

  React.useEffect(() => {
    async function loadNotifications() {
      const realNotifs = await fetchAllRealNotifications();
      setNotifications(realNotifs);
    }
    loadNotifications();
  }, [showNotifications]);

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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
              {unreadCount > 0 && (
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
              )}
            </button>

            {showNotifications && (
              <div
                className="card"
                style={{
                  position: "absolute",
                  right: 0,
                  top: 48,
                  width: 340,
                  padding: 16,
                  zIndex: 50,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  borderRadius: 16
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--border-light)" }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--navy-dark)" }}>Notifications Réelles</span>
                  {notifications.length > 0 ? (
                    <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", fontSize: 11, fontWeight: 700 }}>
                      {notifications.length} {notifications.length > 1 ? "Événements" : "Événement"}
                    </span>
                  ) : (
                    <span className="badge" style={{ background: "#F1F5F9", color: "#64748B", fontSize: 11 }}>0 Nouvelle</span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "20px 10px", textAlign: "center", color: "#64748B", fontSize: 12.5 }}>
                      <CheckCircle2 style={{ width: 28, height: 28, color: "#10B981", margin: "0 auto 8px" }} />
                      <div>Plateforme à jour</div>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Les futures commandes, devis et ajouts de produits apparaîtront ici.</div>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} style={{ display: "flex", gap: 10, padding: 10, borderRadius: 10, background: n.is_read ? "#FFFFFF" : "var(--bg-main)", border: "1px solid var(--border-light)" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: n.type === "product" ? "#FEF3C7" : n.type === "payment" ? "#DCFCE7" : "var(--blue-light)", color: n.type === "product" ? "#D97706" : n.type === "payment" ? "#166534" : "var(--blue-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {n.type === "product" ? <Package style={{ width: 15 }} /> : n.type === "payment" ? <CheckCircle2 style={{ width: 15 }} /> : <FileText style={{ width: 15 }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--navy-dark)" }}>{n.title}</div>
                          <div style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.3 }}>{n.desc}</div>
                          <div style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 4 }}>{n.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Link
                  href="/admin/notifications"
                  onClick={() => setShowNotifications(false)}
                  style={{
                    display: "block",
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--blue-primary)",
                    marginTop: 12,
                    paddingTop: 8,
                    borderTop: "1px solid var(--border-light)",
                    textDecoration: "none"
                  }}
                >
                  Voir l'historique complet ➔
                </Link>
              </div>
            )}
          </div>

          {/* ADMIN USER INFO & LOGOUT */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, borderLeft: "1px solid var(--border-light)", paddingLeft: 16 }}>
            <div style={{ textAlign: "right" }} className="admin-user-info-text">
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy-dark)" }}>
                {profile ? `${profile.first_name} ${profile.last_name}` : "Admin Logistique"}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--orange-primary)" }}>
                {profile?.role === "super_admin" ? "SUPER ADMIN" : "ADMINISTRATEUR"}
              </div>
            </div>

            <Link
              href="/catalog"
              style={{
                background: "#FEF2F2",
                color: "#991B1B",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                textDecoration: "none"
              }}
              title="Retourner à la boutique"
            >
              <LogOut style={{ width: 14 }} />
              <span className="admin-logout-label">Sortir</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
