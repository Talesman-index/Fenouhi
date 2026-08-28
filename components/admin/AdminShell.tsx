"use client";

import React, { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import type { Profile } from "@/types/supabase";

interface AdminShellProps {
  profile: Profile | null;
  children: React.ReactNode;
}

export default function AdminShell({ profile, children }: AdminShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", display: "flex", flexDirection: "column" }}>
      {/* TOP ADMIN HEADER */}
      <AdminHeader
        profile={profile}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* MOBILE SIDEBAR DRAWER & BACKDROP */}
      {mobileSidebarOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 99,
          }}
        />
      )}

      <div
        className={`admin-mobile-drawer ${mobileSidebarOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 280,
          background: "#FFFFFF",
          zIndex: 100,
          transform: mobileSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
          overflowY: "auto",
          padding: "16px",
        }}
      >
        <AdminSidebar profile={profile} onCloseMobile={() => setMobileSidebarOpen(false)} />
      </div>

      {/* CONTENT AREA */}
      <div
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 1600,
          margin: "0 auto",
          padding: "20px 16px 48px",
          boxSizing: "border-box",
        }}
      >
        <Breadcrumbs />

        <div
          className="admin-layout-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "260px minmax(0, 1fr)",
            gap: 24,
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          {/* DESKTOP SIDEBAR */}
          <aside
            className="admin-desktop-sidebar"
            style={{
              width: 260,
              flexShrink: 0,
            }}
          >
            <AdminSidebar profile={profile} />
          </aside>

          {/* MAIN CONTENT AREA */}
          <main style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
