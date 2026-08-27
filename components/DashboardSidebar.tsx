"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Package, FileText, User, Bell, Settings, LogOut, ShieldCheck, Truck } from "lucide-react";
import type { Profile } from "@/types/supabase";

import Link from "next/link";

interface DashboardSidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  profile?: Profile | null;
  isAdmin?: boolean;
}

export default function DashboardSidebar({ activeTab = "orders", onSelectTab, profile, isAdmin = false }: DashboardSidebarProps) {
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
    { id: "notifications", label: "WhatsApp & Suivi", icon: Bell },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  const initials = profile 
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() 
    : (isAdmin ? "AD" : "FH");

  const accountTypeLabel = isAdmin 
    ? "Administrateur" 
    : profile?.account_type === "business" 
    ? "Entreprise / PME" 
    : profile?.account_type === "reseller" 
    ? "Revendeur" 
    : "Particulier";

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 22,
        padding: 20,
        border: "1px solid #EAE5DC",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.03)",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* USER PROFILE AVATAR CARD */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingBottom: 16,
          marginBottom: 16,
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#0F172A",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
          }}
        >
          {initials}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontWeight: 600,
              color: "#0F172A",
              fontSize: 15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {profile ? `${profile.first_name} ${profile.last_name}` : "Client FENOUHIMIN"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "#165491",
                background: "#EFF6FF",
                padding: "2px 8px",
                borderRadius: 6,
              }}
            >
              {accountTypeLabel}
            </span>
          </div>

          <div
            style={{
              fontSize: 11,
              color: "#64748B",
              marginTop: 3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {profile?.email || "client@fenouhimin.com"}
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {isAdmin && (
          <li style={{ marginBottom: 6 }}>
            <Link
              href="/admin"
              style={{
                width: "100%",
                boxSizing: "border-box",
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(56, 189, 248, 0.4)",
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
                transition: "all 0.18s ease",
              }}
            >
              <ShieldCheck style={{ width: 17, height: 17, flexShrink: 0, color: "#38BDF8" }} />
              <span>Dashboard Admin</span>
            </Link>
          </li>
        )}

        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <li key={t.id}>
              <button
                onClick={() => onSelectTab && onSelectTab(t.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: isActive ? "#0F172A" : "transparent",
                  color: isActive ? "#FFFFFF" : "#475569",
                  fontWeight: isActive ? 800 : 600,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  whiteSpace: "nowrap",
                  transition: "all 0.18s ease",
                }}
              >
                <Icon style={{ width: 17, height: 17, flexShrink: 0, color: isActive ? "#38BDF8" : "#64748B" }} />
                <span>{t.label}</span>
              </button>
            </li>
          );
        })}

        <li style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F1F5F9" }}>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: "#FEF2F2",
              color: "#DC2626",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              whiteSpace: "nowrap",
              transition: "all 0.18s ease",
            }}
          >
            <LogOut style={{ width: 17, height: 17, flexShrink: 0 }} />
            <span>Déconnexion</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
