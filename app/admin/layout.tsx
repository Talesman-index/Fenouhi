import React from "react";
import { requireAdmin } from "@/lib/admin/auth-guard";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

export const metadata = {
  title: "Espace Administrateur — CargoLink Africa",
  description: "Plateforme de gestion logistique Chine-Afrique par CargoLink Africa",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication and role guard
  const { profile } = await requireAdmin();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", display: "flex", flexDirection: "column" }}>
      {/* STICKY TOP ADMIN HEADER */}
      <AdminHeader profile={profile} />

      {/* CONTENT AREA — fixed max-width so layout never stretches on wide screens */}
      <div style={{ flex: 1, width: "100%", maxWidth: 1600, margin: "0 auto", padding: "24px 28px 48px", boxSizing: "border-box" }}>
        <Breadcrumbs />

        <div className="admin-layout-grid" style={{ display: "grid", gridTemplateColumns: "256px 1fr", gap: 24, alignItems: "start" }}>
          {/* DESKTOP SIDEBAR */}
          <aside className="admin-desktop-sidebar" style={{ position: "sticky", top: 86, maxHeight: "calc(100vh - 106px)", overflowY: "auto" }}>
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
